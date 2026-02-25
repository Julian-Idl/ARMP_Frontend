// ============================================================
// Zod Validation Schemas
// Used with React Hook Form for type-safe form validation
// ============================================================

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const accessRequestSchema = z.object({
  accessType: z
    .string()
    .min(1, "Access type is required")
    .max(100, "Access type must not exceed 100 characters"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must not exceed 500 characters"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    message: "Please select urgency level",
  }),
});

export const rejectionSchema = z.object({
  rejectionReason: z
    .string()
    .min(1, "Rejection reason is required")
    .min(5, "Rejection reason must be at least 5 characters")
    .max(500, "Rejection reason must not exceed 500 characters"),
});

// Schema for approver creating another approver account (same fields as register)
export const createApproverSchema = registerSchema;

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateApproverFormData = z.infer<typeof createApproverSchema>;
export type AccessRequestFormData = z.infer<typeof accessRequestSchema>;
export type RejectionFormData = z.infer<typeof rejectionSchema>;
