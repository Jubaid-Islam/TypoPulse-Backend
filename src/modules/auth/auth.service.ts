import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export class AuthService {
  // get current user
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    });
    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
  }

  // // user registration
  async register(name: string, email: string, password: string) {
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!response || !response.user) {
      throw new Error("REGISTRATION_FAILED");
    }

    const user = response.user;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // user login
  async login(email: string, password: string) {
    const response = await auth.api.signInEmail({
      body: { email, password },
      returnHeaders: true,
    });

    if (!response || !response.response?.user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const user = response.response.user;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      headers: response.headers,
    };
  }

  // user logout
  async logout(headers: any) {
    await auth.api.signOut({ headers });
    return true;
  }
}

export const authService = new AuthService();
