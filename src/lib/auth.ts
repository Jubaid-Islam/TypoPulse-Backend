import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",

  trustedOrigins: ["https://typopulse-frontend.vercel.app", "http://localhost:3000"],
  advanced: {
   defaultCookieAttributes: {
      sameSite: "none", 
      secure: true,
      partitioned: true,
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },
});
