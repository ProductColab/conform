"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";

interface SelectFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema & { enum: readonly unknown[] };
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
}

export function SelectField({
  name,
  property,
  required,
  label,
  description,
  metadata,
}: SelectFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const { placeholder } = metadata;

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
          <Select value={field.value || ""} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder || `Select ${label}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {property.enum.map((option) => (
                <SelectItem key={String(option)} value={String(option)}>
                  {String(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && (
            <p className="text-xs text-blue-600">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
