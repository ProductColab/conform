"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import type { FieldMetadata } from "@/schemas/field.schema";
import { ensureFieldValue, getTextareaRows } from "@/utils";

interface TextareaFieldProps {
  name: string;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
  disabled?: boolean;
}

export function TextareaField({
  name,
  required,
  label,
  description,
  metadata,
  disabled = false,
}: TextareaFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const { placeholder } = metadata || {};
  const rows = getTextareaRows(metadata);

  return (
    <FormField
      name={name}
      control={formContext.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && " *"}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder || label}
              rows={rows}
              disabled={disabled}
              {...ensureFieldValue(field, "")}
            />
          </FormControl>
          {description && (
            <p className="text-xs text-blue-600">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
