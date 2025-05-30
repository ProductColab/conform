"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";
import { getNumericConstraints } from "@/utils";

interface SliderFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
  disabled?: boolean;
}

export function SliderField({
  name,
  property,
  required,
  label,
  description,
  metadata,
  disabled = false,
}: SliderFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const { suffix, prefix } = metadata;
  const constraints = getNumericConstraints(property, metadata);
  const defaultValue = constraints.min || 0;

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
            <div className="flex flex-col gap-2">
              <Slider
                min={constraints.min}
                max={constraints.max}
                step={constraints.step}
                value={[field.value === undefined ? defaultValue : field.value]}
                onValueChange={(vals) => field.onChange(vals[0])}
                disabled={disabled}
              />
              <div className="relative">
                {prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {prefix}
                  </span>
                )}
                <Input
                  type="number"
                  value={field.value === undefined ? defaultValue : field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={constraints.min}
                  max={constraints.max}
                  step={constraints.step}
                  disabled={disabled}
                  className={prefix ? "pl-8" : suffix ? "pr-16" : ""}
                />
                {suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {suffix}
                  </span>
                )}
              </div>
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
