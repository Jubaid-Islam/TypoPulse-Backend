import { GraphQLError } from "graphql";
import { authService } from "./auth.service";
import { registerSchema, loginSchema, validateOrThrow, } from "../../validation/schemas";
import { APIError } from "better-auth";
function setResponseCookies(res, headers) {
    if (!res || !headers)
        return;
    const cookies = typeof headers.getSetCookie === "function"
        ? headers.getSetCookie()
        : headers.get("set-cookie");
    if (cookies) {
        res.setHeader("Set-Cookie", cookies);
    }
}
export const authResolvers = {
    Query: {
        // user
        me: async (_parent, _args, context) => {
            if (!context.userId) {
                throw new GraphQLError("User is not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            try {
                return await authService.getCurrentUser(context.userId);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "";
                if (message === "USER_NOT_FOUND") {
                    throw new GraphQLError("User not found", {
                        extensions: { code: "NOT_FOUND" },
                    });
                }
                console.error("Fetch current user error:", error);
                throw new GraphQLError("Failed to fetch user. Please try again.", {
                    extensions: { code: "INTERNAL_ERROR" },
                });
            }
        },
    },
    Mutation: {
        // register
        register: async (_parent, { input }, context) => {
            // zod validation
            const validated = validateOrThrow(registerSchema, input);
            const { name, email, password } = validated;
            try {
                // call auth service
                const { user, headers } = await authService.register(name, email, password);
                setResponseCookies(context.res, headers);
                return { user };
            }
            catch (error) {
                if (error instanceof APIError &&
                    error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
                    throw new GraphQLError("Email already registered", {
                        extensions: { code: "BAD_USER_INPUT" },
                    });
                }
                console.error("Registration error:", error);
                throw new GraphQLError("Registration failed. Please try again.", {
                    extensions: { code: "INTERNAL_ERROR" },
                });
            }
        },
        // login
        login: async (_parent, { input }, context) => {
            // zod validation
            const validated = validateOrThrow(loginSchema, input);
            const { email, password } = validated;
            try {
                const { user, headers } = await authService.login(email, password);
                setResponseCookies(context.res, headers);
                return { user };
            }
            catch (error) {
                if (error instanceof APIError &&
                    error.body?.code === "INVALID_EMAIL_OR_PASSWORD") {
                    throw new GraphQLError("Invalid email or password", {
                        extensions: { code: "BAD_USER_INPUT" },
                    });
                }
                console.error("Login error:", error);
                throw new GraphQLError("Login failed. Please try again.", {
                    extensions: { code: "INTERNAL_ERROR" },
                });
            }
        },
        // logout
        logout: async (_parent, _args, context) => {
            if (!context.userId) {
                throw new GraphQLError("User is not authenticated", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }
            try {
                const { headers } = await authService.logout(context.headers);
                setResponseCookies(context.res, headers);
                return true;
            }
            catch (error) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                console.error("Logout error:", error);
                throw new GraphQLError("Logout failed. Please try again.", {
                    extensions: { code: "INTERNAL_ERROR" },
                });
            }
        },
    },
};
//# sourceMappingURL=auth.resolver.js.map