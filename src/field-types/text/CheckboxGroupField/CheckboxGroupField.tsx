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

interface CheckboxGroupFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema & { enum: readonly unknown[] };
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
}

export function CheckboxGroupField({
  name,
  property,
  required,
  label,
  description,
}: CheckboxGroupFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  const options = property.enum || [];

  return (
    <FormField
      name={name}
      control={formContext.control}
      render={({ field }) => {
        const selectedValues = field.value || [];

        const handleCheckboxChange = (
          optionValue: string,
          checked: boolean
        ) => {
          if (checked) {
            // Add to array if not already present
            if (!selectedValues.includes(optionValue)) {
              field.onChange([...selectedValues, optionValue]);
            }
          } else {
            // Remove from array
            field.onChange(
              selectedValues.filter((val: string) => val !== optionValue)
            );
          }
        };

        return (
          <FormItem className="space-y-3">
            <FormLabel>
              {label}
              {required && " *"}
            </FormLabel>
            <FormControl>
              <fieldset
                className="space-y-2"
                role="group"
                aria-labelledby={`${name}-legend`}
              >
                <legend id={`${name}-legend`} className="sr-only">
                  {label} options
                </legend>
                {options.map((option, index) => {
                  const optionValue = String(option);
                  const optionId = `${name}-${index}`;
                  const isChecked = selectedValues.includes(optionValue);

                  return (
                    <div
                      key={optionValue}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={optionId}
                        name={name}
                        value={optionValue}
                        checked={isChecked}
                        onChange={(e) =>
                          handleCheckboxChange(optionValue, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-describedby={
                          description ? `${name}-description` : undefined
                        }
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
              </fieldset>
            </FormControl>
            {description && (
              <p id={`${name}-description`} className="text-xs text-blue-600">
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
