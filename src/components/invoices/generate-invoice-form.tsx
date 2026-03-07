"use client";

import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type GenerateInvoiceFormValues,
  generateInvoiceFormSchema,
} from "@/lib/schemas/invoice";
import { createInvoice } from "@/lib/services/invoice.service";

interface GenerateInvoiceFormProps {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const currentYear = () => new Date().getFullYear();
const currentMonth = () => new Date().getMonth() + 1;

export function GenerateInvoiceForm({
  clientId,
  onSuccess,
  onCancel,
}: GenerateInvoiceFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<GenerateInvoiceFormValues>({
    resolver: zodResolver(
      generateInvoiceFormSchema
    ) as Resolver<GenerateInvoiceFormValues>,
    defaultValues: {
      year: currentYear(),
      month: currentMonth(),
      adSpend: 0,
    },
  });

  async function onSubmit(values: GenerateInvoiceFormValues) {
    setServerError(null);
    const result = await createInvoice(clientId, {
      year: values.year,
      month: values.month,
      adSpend: values.adSpend,
    });
    if (result.success) {
      form.reset({
        year: currentYear(),
        month: currentMonth(),
        adSpend: 0,
      });
      onSuccess();
      return;
    }
    setServerError(result.error ?? null);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border p-4"
    >
      {serverError && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </div>
      )}
      <FieldGroup className="grid gap-4 sm:grid-cols-3">
        <Controller
          name="year"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-slot="field">
              <FieldLabel htmlFor="invoice-year">Year</FieldLabel>
              <Input
                id="invoice-year"
                type="number"
                min={2000}
                max={2100}
                value={field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="month"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-slot="field">
              <FieldLabel htmlFor="invoice-month">Month</FieldLabel>
              <Input
                id="invoice-month"
                type="number"
                min={1}
                max={12}
                value={field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="adSpend"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-slot="field">
              <FieldLabel htmlFor="invoice-ad-spend">Ad spend ($)</FieldLabel>
              <Input
                id="invoice-ad-spend"
                type="number"
                min={0}
                step={0.01}
                value={field.value === 0 ? "" : field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : e.target.valueAsNumber
                  )
                }
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating…" : "Create invoice"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
