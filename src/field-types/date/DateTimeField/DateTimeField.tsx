"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";

interface DateTimeFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
  disabled?: boolean;
}

export function DateTimeField({
  name,
  required,
  label,
  description,
  metadata,
  disabled = false,
}: DateTimeFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const { placeholder } = metadata;

  return (
    <FormField
      name={name}
      control={formContext.control}
      render={({ field }) => {
        // Generate unique IDs for accessibility
        const inputId = `${name}-input`;
        const descriptionId = description ? `${name}-description` : undefined;

        return (
          <FormItem>
            <FormLabel htmlFor={inputId}>
              {label}
              {required && " *"}
            </FormLabel>
            <FormControl>
              <Input
                id={inputId}
                type="datetime-local"
                placeholder={placeholder || label}
                aria-describedby={descriptionId}
                disabled={disabled}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            {description && (
              <p id={descriptionId} className="text-xs text-blue-600">
                {description}
              </p>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
