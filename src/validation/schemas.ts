import { z } from "zod";

// registration input schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

// login input schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});


// game result submission input schema
export const submitGameResultSchema = z.object({
  correctChars: z
    .number()
    .int("Must be an integer")
    .min(0, "Cannot be negative")
    .max(20, "Maximum 20 characters allowed"),

wrongAttempts: z
  .number()
  .int("Must be an integer")
  .min(0, "Cannot be negative")
  .max(100, "Too many wrong attempts"),

  rawTimeMs: z
    .number()
    .int("Must be an integer")
    .min(0, "Time cannot be negative")
    .max(600000, "Time cannot exceed 10 minutes"),

  wpmTimeline: z
    .array(z.number().min(0, "WPM cannot be negative"))
    .min(1, "WPM timeline is required"),

  characterTimeline: z
    .array(z.number().int().min(0, "Character time cannot be negative"))
    .optional(),
});

// leaderboard limit schema 
export const leaderboardLimitSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// converts zod validation errors to GraphQL format
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid input";
    throw new Error(message);
  }
  return result.data;
}
