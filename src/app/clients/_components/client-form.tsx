"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  type ClientFormValues,
  type ClientFormDefaultValues,
  clientFormSchema,
} from "../_schemas/client";
import { Plan } from "@prisma/client";

interface ClientFormProps {
  plans: Plan[];
  defaultValues?: ClientFormDefaultValues;
  submitAction: (data: ClientFormValues) => Promise<any>;
  successRedirect: string;
  submitLabel?: string;
  title: string;
  description?: string;
}

export function ClientForm({
  plans,
  defaultValues,
  submitAction,
  successRedirect,
  submitLabel = "Save",
  title,
  description,
}: ClientFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = Boolean(defaultValues?.id);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      planId: defaultValues?.planId ?? "",
      discount: defaultValues?.discount ?? 0,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  async function onSubmit(values: ClientFormValues) {
    setServerError(null);

    const data = {
      id: defaultValues?.id,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      planId: values.planId?.trim() ?? "",
      discount: values.discount,
      isActive: values.isActive,
    };

    try {
      const result = await submitAction(data);

      if (result.success) {
        router.push(successRedirect);
        return;
      }
      setServerError(result.error);
    } catch (err) {
      console.error("Client form submit error:", err);
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form
          id="client-form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            {serverError && (
              <div
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {serverError}
              </div>
            )}

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-slot="field">
                  <FieldLabel htmlFor="client-form-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="client-form-name"
                    placeholder="Acme Inc."
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-slot="field">
                  <FieldLabel htmlFor="client-form-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="client-form-email"
                    type="email"
                    placeholder="billing@acme.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    disabled={isEdit}
                  />
                  {fieldState.invalid && fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="planId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-slot="field">
                  <FieldLabel htmlFor="client-form-plan">Plan</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    disabled={form.formState.isSubmitting}
                  >
                    <SelectTrigger id="client-form-plan" className="w-full">
                      <SelectValue placeholder="Select a plan (optional)">
                        {field.value
                          ? (plans.find((p) => p.id === field.value)?.name ??
                            field.value)
                          : "None"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectSeparator />
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="discount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid && !!fieldState.error}
                  data-slot="field"
                >
                  <FieldLabel htmlFor="client-form-discount">
                    Discount (%)
                  </FieldLabel>
                  <Input
                    id="client-form-discount"
                    type="number"
                    min={0}
                    max={99}
                    step={1}
                    value={field.value ?? ""}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;

                      if (raw === "") {
                        field.onChange(null);
                        return;
                      }

                      const num = Math.floor(Number(raw));
                      const clamped = Math.min(Math.max(num, 0), 99);
                      field.onChange(clamped);
                    }}
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
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" data-slot="field">
                  <Checkbox
                    id="client-form-is-active"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    onBlur={field.onBlur}
                    aria-describedby="client-form-is-active-description"
                  />
                  <FieldLabel htmlFor="client-form-is-active">
                    Active
                  </FieldLabel>
                  <span
                    id="client-form-is-active-description"
                    className="sr-only"
                  >
                    Client is active and can receive invoices
                  </span>
                </Field>
              )}
            />

            <Field orientation="horizontal">
              <Button
                type="submit"
                form="client-form"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving…" : submitLabel}
              </Button>
              <Link
                href={isEdit ? `/clients/${defaultValues!.id}` : "/clients"}
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
