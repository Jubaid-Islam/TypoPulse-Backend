import { describe, it, expect } from "bun:test";
import {
  registerSchema,
  loginSchema,
  submitGameResultSchema,
  leaderboardLimitSchema,
  validateOrThrow,
} from "../src/validation/schemas";

describe("registerSchema", () => {
  it("passes with valid input", () => {
    const result = validateOrThrow(registerSchema, {
      name: "Test User",
      email: "TEST@Mail.com",
      password: "password123",
    });

    expect(result.email).toBe("test@mail.com");
  });

  it("throws when name is too short", () => {
    expect(() =>
      validateOrThrow(registerSchema, {
        name: "A",
        email: "test@mail.com",
        password: "password123",
      })
    ).toThrow("Name must be at least 2 characters");
  });

  it("throws when email is invalid", () => {
    expect(() =>
      validateOrThrow(registerSchema, {
        name: "Test User",
        email: "not-an-email",
        password: "password123",
      })
    ).toThrow("Invalid email address");
  });

  it("throws when password is too short", () => {
    expect(() =>
      validateOrThrow(registerSchema, {
        name: "Test User",
        email: "test@mail.com",
        password: "123",
      })
    ).toThrow("Password must be at least 6 characters");
  });
});

describe("loginSchema", () => {
  it("passes with valid input", () => {
    const result = validateOrThrow(loginSchema, {
      email: "test@mail.com",
      password: "anything",
    });
    expect(result.email).toBe("test@mail.com");
  });

  it("throws when password is empty", () => {
    expect(() =>
      validateOrThrow(loginSchema, { email: "test@mail.com", password: "" })
    ).toThrow("Password is required");
  });
});

describe("submitGameResultSchema", () => {
  const validInput = {
    correctChars: 18,
    wrongAttempts: 2,
    rawTimeMs: 45000,
    wpmTimeline: [30, 35, 40],
    characterTimeline: [500, 520, 480],
  };

  it("passes with valid input", () => {
    const result = validateOrThrow(submitGameResultSchema, validInput);
    expect(result).toEqual(validInput);
  });

  it("passes without optional characterTimeline", () => {
    const { characterTimeline, ...rest } = validInput;
    const result = validateOrThrow(submitGameResultSchema, rest);
    expect(result.characterTimeline).toBeUndefined();
  });

  it("throws when wpmTimeline is empty", () => {
    expect(() =>
      validateOrThrow(submitGameResultSchema, { ...validInput, wpmTimeline: [] })
    ).toThrow("WPM timeline is required");
  });

  it("throws when correctChars exceeds max", () => {
    expect(() =>
      validateOrThrow(submitGameResultSchema, { ...validInput, correctChars: 25 })
    ).toThrow("Maximum 20 characters allowed");
  });

  it("throws when rawTimeMs is negative", () => {
    expect(() =>
      validateOrThrow(submitGameResultSchema, { ...validInput, rawTimeMs: -100 })
    ).toThrow("Time cannot be negative");
  });
});

describe("leaderboardLimitSchema", () => {
  it("defaults limit to 10 when not provided", () => {
    const result = validateOrThrow(leaderboardLimitSchema, {});
    expect(result.limit).toBe(10);
  });

  it("throws when limit exceeds max", () => {
    expect(() =>
      validateOrThrow(leaderboardLimitSchema, { limit: 500 })
    ).toThrow("Limit cannot exceed 100");
  });
});