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

  // Always call useForm first, before any conditional logic
  const internalForm = useForm<T>({
    resolver: zodResolver(schema, {
      mode: "async",
    }),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const mergedForm = form ?? internalForm;

  // Try to convert Zod schema to JSON schema after hooks are called
  let jsonSchema: z.core.JSONSchema.BaseSchema | null = null;
  let schemaError: string | null = null;
  try {
    jsonSchema = z.toJSONSchema(schema);
  } catch {
    schemaError = "Unable to generate form from the provided schema.";
  }

  // If schema conversion failed, show error
  if (schemaError || !jsonSchema || !jsonSchema.properties) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {schemaError || "Unable to generate form from the provided schema."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Extract defaults from schema and merge with provided defaults
  const extractedDefaults: Record<string, z.core.JSONSchema.Schema> = {};
  Object.entries(jsonSchema.properties).forEach(
    ([key, property]: [string, z.core.JSONSchema.Schema]) => {
      if (property.default !== undefined) {
        extractedDefaults[key] =
          property.default as z.core.JSONSchema.Schema & {
            default: z.core.JSONSchema.Schema;
          };
      }
    }
  );

  const mergedDefaults: DefaultValues<T> = {
    ...extractedDefaults,
    ...defaultValues,
  } as DefaultValues<T>;

  // Update form defaults if they differ from current defaults
  if (
    JSON.stringify(mergedForm.formState.defaultValues) !==
    JSON.stringify(mergedDefaults)
  ) {
    mergedForm.reset(mergedDefaults);
  }

  const handleSubmit = async (values: T) => {
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

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
