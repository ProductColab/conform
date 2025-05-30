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
import { ensureFieldValue, getInputType } from "@/utils";

interface TextFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
}

export function TextField({
  name,
  property,
  required,
  label,
  description,
  metadata,
}: TextFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const { suffix, prefix, placeholder } = metadata;
  const inputType = getInputType(property, metadata);

  return (
    <FormField
      name={name}
      control={formContext.control}
      render={({ field, fieldState }) => {
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
              <div className="relative">
                {prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {prefix}
                  </span>
                )}
                <Input
                  id={inputId}
                  type={inputType}
                  placeholder={placeholder || label}
                  className={prefix ? "pl-8" : suffix ? "pr-16" : ""}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={descriptionId}
                  {...ensureFieldValue(field, "")}
                />
                {suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {suffix}
                  </span>
                )}
              </div>
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
