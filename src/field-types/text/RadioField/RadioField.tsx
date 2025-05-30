"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";

interface RadioFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema & { enum: readonly unknown[] };
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
  disabled?: boolean;
}

export function RadioField({
  name,
  property,
  required,
  label,
  description,
  disabled = false,
}: RadioFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const options = property.enum || [];

  return (
    <FormField
      name={name}
      control={formContext.control}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>
            {label}
            {required && " *"}
          </FormLabel>
          <FormControl>
            <div className="space-y-2">
              {options.map((option, index) => {
                const optionValue = String(option);
                const optionId = `${name}-${index}`;

                return (
                  <div
                    key={optionValue}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      id={optionId}
                      name={name}
                      value={optionValue}
                      checked={field.value === optionValue}
                      onChange={() => field.onChange(optionValue)}
                      disabled={disabled}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor={optionId}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {optionValue}
                    </Label>
                  </div>
                );
              })}
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
