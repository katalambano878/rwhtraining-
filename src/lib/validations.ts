import { z } from "zod";

export const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").max(20),
  age: z.coerce.number().int().min(14, "Must be at least 14").max(99, "Invalid age").optional(),
  city: z.string().max(100).optional().default(""),
  occupation: z.string().max(200).optional().default(""),
  experience: z.string().max(200).optional().default(""),
  reason: z.string().max(2000).optional().default(""),
  classFormat: z.enum(["hybrid", "online"]).default("hybrid"),
  tier: z.enum(["20", "50", "100"]).default("100"),
  // "moolre" is accepted for cached clients but is routed to Zoe Pay.
  paymentMethod: z.enum(["zoe", "moolre", "paystack"]).default("zoe"),
  applicationId: z.string().optional().default(""),
});

export const autosaveSchema = z.object({
  firstName: z.string().max(100).optional().default(""),
  lastName: z.string().max(100).optional().default(""),
  email: z.string().max(200).optional().default(""),
  phone: z.string().max(20).optional().default(""),
  age: z.coerce.number().int().min(14).max(99).optional().nullable(),
  city: z.string().max(100).optional().default(""),
  occupation: z.string().max(200).optional().default(""),
  experience: z.string().max(200).optional().default(""),
  reason: z.string().max(2000).optional().default(""),
  classFormat: z.enum(["hybrid", "online"]).optional().default("hybrid"),
  tier: z.string().optional().default("100"),
});

export const emailStudentsSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Message body is required").max(10000),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type AutosaveInput = z.infer<typeof autosaveSchema>;
export type EmailStudentsInput = z.infer<typeof emailStudentsSchema>;
