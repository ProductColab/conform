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
import { getNumericConstraints } from "@/utils";

interface NumberFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
}

export function NumberField({
  name,
  property,
  required,
  label,
  description,
  metadata,
}: NumberFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const { suffix, prefix, placeholder } = metadata;
  const constraints = getNumericConstraints(property, metadata);

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
            <div className="relative">
              {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {prefix}
                </span>
              )}
              <Input
                type="number"
                placeholder={placeholder || label}
                value={field.value === undefined ? 0 : field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={constraints.min}
                max={constraints.max}
                step={constraints.step}
                className={prefix ? "pl-8" : suffix ? "pr-16" : ""}
              />
              {suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
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
