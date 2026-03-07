import { z } from "zod";

export const generateInvoiceFormSchema = z.object({
  year: z.coerce
    .number()
    .min(2000, "Year must be 2000–2100.")
    .max(2100, "Year must be 2000–2100."),
  month: z.coerce
    .number()
    .min(1, "Month must be 1–12.")
    .max(12, "Month must be 1–12."),
  adSpend: z.coerce.number().min(0, "Ad spend must be 0 or greater."),
});

export type GenerateInvoiceFormValues = z.infer<
  typeof generateInvoiceFormSchema
>;
