import { z } from "zod";

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(200, "Name must be at most 200 characters."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .max(255, "Email must be at most 255 characters."),
  planId: z.string().optional(),
  discount: z.coerce
    .number()
    .min(0, "Discount must be between 0 and 100.")
    .max(100, "Discount must be between 0 and 100."),
  subscriptionStartDate: z.string().optional(),
  isActive: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export type ClientFormDefaultValues = Partial<{
  id: string;
  name: string;
  email: string;
  planId: string;
  discount: number;
  isActive: boolean;
}>;
