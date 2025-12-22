import { z } from "zod";

/**
 * Shared Zod validation schemas and helpers
 * Used for client-side validation before Convex mutations
 */

/**
 * Non-empty string with trimming
 */
export const nonEmptyString = z
  .string()
  .trim()
  .min(1, "This field is required");

/**
 * Email validation with normalization
 */
export const email = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .transform((val) => val.toLowerCase());

/**
 * Non-negative integer (for quantities, counts, etc.)
 */
export const nonNegativeInt = z
  .number()
  .int("Must be a whole number")
  .nonnegative("Must be zero or greater");

/**
 * Positive integer (for order values, etc.)
 */
export const positiveInt = z
  .number()
  .int("Must be a whole number")
  .positive("Must be greater than zero");

/**
 * Integer that can be any value (for ordering)
 */
export const orderValue = z.number().int("Must be a whole number");

/**
 * Optional non-empty string (allows undefined/null, but not empty string)
 */
export const optionalNonEmptyString = z
  .string()
  .trim()
  .optional()
  .refine((val) => val === undefined || val.length > 0, {
    message: "Cannot be an empty string",
  });

// ============================================
// Domain-specific schemas
// ============================================

/**
 * Inventory item name (can be empty for new items)
 */
export const inventoryName = z.string().max(500, "Name is too long");

/**
 * Inventory quantity
 */
export const inventoryQty = nonNegativeInt.refine((val) => val <= 999999, {
  message: "Quantity is too large",
});

/**
 * Notice content (must be non-empty)
 */
export const noticeContent = z
  .string()
  .trim()
  .min(1, "Notice content cannot be empty")
  .max(10000, "Notice is too long");

/**
 * Location name
 */
export const locationName = z
  .string()
  .trim()
  .min(1, "Location name is required")
  .max(200, "Location name is too long");

// ============================================
// Validation helpers
// ============================================

/**
 * Safe parse that returns a result object
 * Useful for form validation with inline errors
 */
export function validateField<T>(
  schema: z.ZodType<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors[0]?.message || "Invalid value",
  };
}

/**
 * Parse with throwing for critical validations
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

/**
 * Check if a value is valid according to a schema
 */
export function isValid<T>(schema: z.ZodType<T>, value: unknown): boolean {
  return schema.safeParse(value).success;
}

