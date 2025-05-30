"use client";

import { useState } from "react";
import {
  useForm,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { SchemaField } from "./SchemaField";

interface SchemaFormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (values: T) => Promise<void> | void;

  // Optional external form instance
  form?: UseFormReturn<T>;

  submitLabel?: string;
  isSubmitting?: boolean;
  showCancelButton?: boolean;
  onCancel?: () => void;
  className?: string;

  excludeFields?: string[];
  fieldLabels?: Record<string, string>;
  fieldDescriptions?: Record<string, string>;
  fieldPlaceholders?: Record<string, string>;

  columns?: 1 | 2 | 3;
  spacing?: "compact" | "normal" | "relaxed";
}

export function SchemaForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  form,
  submitLabel = "Submit",
  isSubmitting = false,
  showCancelButton = false,
  onCancel,
  className,
  excludeFields = [],
  fieldLabels = {},
  fieldDescriptions = {},
  fieldPlaceholders = {},
  columns = 1,
  spacing = "normal",
}: SchemaFormProps<T>) {
  const [error, setError] = useState<string | null>(null);

  // Convert Zod schema to JSON schema directly
  let jsonSchema: any;
  try {
    jsonSchema = z.toJSONSchema(schema);
  } catch (err) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to generate form from the provided schema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const extractedDefaults: Record<string, any> = {};
  if (jsonSchema && jsonSchema.properties) {
    Object.entries(jsonSchema.properties).forEach(
      ([key, property]: [string, any]) => {
        if (property.default !== undefined) {
          extractedDefaults[key] = property.default;
        }
      }
    );
  }

  const mergedDefaults: DefaultValues<T> = {
    ...extractedDefaults,
    ...defaultValues,
  } as DefaultValues<T>;

  const mergedForm =
    form ||
    useForm<T>({
      resolver: zodResolver(schema, {
        mode: "async",
      }),
      defaultValues: mergedDefaults,
    });

  const handleSubmit = async (values: T) => {
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (!jsonSchema || !jsonSchema.properties) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to generate form from the provided schema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const fieldEntries = Object.entries(jsonSchema.properties).filter(
    ([name]) => !excludeFields.includes(name)
  );

  const spacingClasses = {
    compact: "space-y-2",
    normal: "space-y-4",
    relaxed: "space-y-6",
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  const requiredFields: string[] = Array.isArray(jsonSchema.required)
    ? jsonSchema.required
    : [];

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...mergedForm}>
        <form
          onSubmit={mergedForm.handleSubmit(handleSubmit)}
          className={spacingClasses[spacing]}
        >
          <div className={`grid gap-4 ${columnClasses[columns]}`}>
            {fieldEntries.map(([name, property]) => {
              const prop = property as z.core.JSONSchema.Schema;
              const enhancedProperty = {
                ...prop,
                title: fieldLabels[name] || prop.title || name,
                description: fieldDescriptions[name] || prop.description,
                placeholder: fieldPlaceholders[name] || prop.placeholder,
              };

              return (
                <SchemaField
                  key={name}
                  name={name}
                  property={enhancedProperty}
                  required={requiredFields.includes(name)}
                  description={fieldDescriptions[name]}
                />
              );
            })}
          </div>

          <div className="flex gap-2 pt-6">
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
