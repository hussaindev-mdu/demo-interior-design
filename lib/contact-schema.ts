import { z } from "zod";

/** Shared by the client form (react-hook-form) and the /api/contact route. */

export const PROPERTY_TYPES = ["Apartment", "Villa", "Office", "Commercial"] as const;
export const BUDGETS = ["Under ₹10L", "₹10–25L", "₹25–50L", "₹50L+"] as const;
export const CONTACT_METHODS = ["Call", "WhatsApp", "Email"] as const;

/** Indian mobile: optional +91 / 91 / 0 prefix, then 10 digits starting 6–9. */
const INDIAN_MOBILE = /^(?:\+91|91|0)?[6-9]\d{9}$/;

/** Returns "+91XXXXXXXXXX", or null if the number isn't a valid Indian mobile. */
export function normalizeIndianMobile(value: string): string | null {
  const compact = value.replace(/[\s\-().]/g, "");
  return INDIAN_MOBILE.test(compact) ? `+91${compact.slice(-10)}` : null;
}

const isEmail = (v: string) => z.email().safeParse(v).success;

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please tell us your name.")
      .max(80, "Please keep your name under 80 characters."),
    phone: z
      .string()
      .trim()
      .min(1, "Please add a phone number so we can reach you.")
      .refine((v) => normalizeIndianMobile(v) !== null, {
        message: "Enter a valid Indian mobile number, e.g. +91 98765 43210.",
      }),
    email: z
      .string()
      .trim()
      .max(120)
      .refine((v) => v === "" || isEmail(v), { message: "Enter a valid email address." }),
    city: z.string().trim().max(60, "Please keep this under 60 characters."),
    propertyType: z.union([z.literal(""), z.enum(PROPERTY_TYPES)]),
    budget: z.union([z.literal(""), z.enum(BUDGETS)]),
    message: z.string().trim().max(2000, "Please keep your message under 2,000 characters."),
    contactMethod: z.enum(CONTACT_METHODS, { message: "Choose how you'd like us to contact you." }),
    /** Honeypot — hidden from people, filled by bots. Checked on the server. */
    website: z.string().optional(),
    /** Timestamp of when the form was rendered — submissions faster than a human are dropped. */
    startedAt: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contactMethod === "Email" && !data.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Add your email so we can reply by email.",
      });
    }
  });

export type ContactFormInput = z.input<typeof contactSchema>;
export type ContactFormData = z.output<typeof contactSchema>;
