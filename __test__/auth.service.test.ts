import { describe, it, expect, mock, beforeEach } from "bun:test";
import { prismaMock, resetPrismaMock } from "../src/lib/__mocks__/prisma";

mock.module("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

const mockSignUpEmail = mock<(...args: any[]) => Promise<any>>();
const mockSignInEmail = mock<(...args: any[]) => Promise<any>>();
const mockSignOut = mock<(...args: any[]) => Promise<any>>();

mock.module("../src/lib/auth", () => ({
  auth: {
    api: {
      signUpEmail: mockSignUpEmail,
      signInEmail: mockSignInEmail,
      signOut: mockSignOut,
    },
  },
}));

const { authService } = await import("../src/modules/auth/auth.service");

describe("AuthService", () => {
  beforeEach(() => {
    resetPrismaMock();
    mockSignUpEmail.mockReset();
    mockSignInEmail.mockReset();
    mockSignOut.mockReset();
  });

  describe("getCurrentUser", () => {
    it("returns user data when user exists", async () => {
      const mockUser = {
        id: "user-1",
        name: "Test User",
        email: "test@mail.com",
        image: null,
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser("user-1");

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: { id: true, name: true, email: true, image: true },
      });
    });

    it("throws USER_NOT_FOUND when user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.getCurrentUser("missing-id")).rejects.toThrow(
        "USER_NOT_FOUND",
      );
    });
  });

  describe("register", () => {
    it("returns user data on successful registration", async () => {
      mockSignUpEmail.mockResolvedValue({
        response: {
          user: { id: "user-1", name: "Test User", email: "test@mail.com" },
        },
      });

      const result = await authService.register(
        "Test User",
        "test@mail.com",
        "password123",
      );

      expect(result).toEqual({
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@mail.com",
        },
        headers: undefined!,
      });
    });

    it("throws REGISTRATION_FAILED when response has no user", async () => {
      mockSignUpEmail.mockResolvedValue({ user: null });

      await expect(
        authService.register("Test User", "test@mail.com", "password123"),
      ).rejects.toThrow("REGISTRATION_FAILED");
    });

    it("propagates better-auth error (e.g. duplicate email)", async () => {
      const apiError = {
        body: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
      };
      mockSignUpEmail.mockImplementation(() => Promise.reject(apiError));

      await expect(
        authService.register("Test User", "test@mail.com", "password123"),
      ).rejects.toEqual(apiError);
    });
  });

  describe("login", () => {
    it("returns user and headers on successful login", async () => {
      const mockHeaders = new Headers({ "set-cookie": "session=abc123" });
      mockSignInEmail.mockResolvedValue({
        response: {
          user: { id: "user-1", name: "Test User", email: "test@mail.com" },
        },
        headers: mockHeaders,
      });

      const result = await authService.login("test@mail.com", "password123");

      expect(result.user).toEqual({
        id: "user-1",
        name: "Test User",
        email: "test@mail.com",
      });
      expect(result.headers).toBe(mockHeaders);
    });

    it("throws INVALID_CREDENTIALS when response has no user", async () => {
      mockSignInEmail.mockResolvedValue({ response: {} });

      await expect(
        authService.login("test@mail.com", "wrong-password"),
      ).rejects.toThrow("INVALID_CREDENTIALS");
    });
  });

  describe("logout", () => {
    it("calls signOut with provided headers", async () => {
      const mockHeaders = new Headers();
      mockSignOut.mockResolvedValue(undefined);

      const result = await authService.logout(mockHeaders);

      expect(mockSignOut).toHaveBeenCalledWith({
        headers: mockHeaders,
        returnHeaders: true,
      });
      expect(result).toEqual({
        success: true,
        headers: undefined!,
      });
    });
  });
});
