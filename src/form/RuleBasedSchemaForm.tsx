"use client";

import { type FieldValues, type DefaultValues } from "react-hook-form";
import { z } from "zod/v4";
import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  useFormRules,
  type CustomFunctions,
  type TransformFunctions,
  type UseFormRulesReturn,
} from "../hooks/useFormRules";
import type { Rule, RuleContext, RuleAction } from "../schemas/rule.schema";
import type { JSONSchema7 } from "json-schema";
import { SchemaField } from "./SchemaField";

interface RuleBasedSchemaFormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  rules?: Rule[];
  customFunctions?: CustomFunctions;
  transformFunctions?: TransformFunctions;
  context?: Partial<RuleContext>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (values: T) => Promise<void> | void;

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

  // Enhanced rule-based functionality
  onCustomAction?: (action: RuleAction, context: RuleContext) => void;
  onRuleEvaluation?: (ruleResults: UseFormRulesReturn<T>) => void;
  enableRealTimeRules?: boolean;

  // Sonner toast integration
  toast?: (
    message: string,
    type?: "success" | "error" | "info" | "warning"
  ) => void;
}

interface RuleBasedFormRendererProps<T extends FieldValues> {
  ruleResults: UseFormRulesReturn<T>;
  schema: z.ZodType<T>;
  onSubmit: (values: T) => Promise<void> | void;
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

function RuleBasedFormRenderer<T extends FieldValues>({
  ruleResults,
  schema,
  onSubmit,
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
}: RuleBasedFormRendererProps<T>) {
  const { form, fieldVisibility, getFieldConfig, evaluateRules } = ruleResults;

  // Move useCallback before any early returns
  const handleSubmit = useCallback(
    async (values: T) => {
      // Final rule evaluation before submit
      evaluateRules();
      await onSubmit(values);
    },
    [onSubmit, evaluateRules]
  );

  // Convert schema to JSON schema
  let jsonSchema: z.core.JSONSchema.BaseSchema;
  try {
    jsonSchema = z.toJSONSchema(schema);
  } catch {
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

  // Get all field entries and apply rule-based filtering
  const allFieldEntries = Object.entries(jsonSchema.properties);

  // Filter fields based on exclude list AND rule-based visibility
  const visibleFieldEntries = allFieldEntries.filter(([name]) => {
    if (excludeFields.includes(name)) return false;
    return fieldVisibility[name] !== false; // Show if not explicitly hidden
  });

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

  // Get base required fields from schema
  const baseRequiredFields: string[] = Array.isArray(jsonSchema.required)
    ? jsonSchema.required
    : [];

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={spacingClasses[spacing]}
        >
          <div className={`grid gap-4 ${columnClasses[columns]}`}>
            {visibleFieldEntries.map(([name, property]) => {
              const prop = property as z.core.JSONSchema.Schema;
              const fieldConfig = getFieldConfig(name);

              // 🎯 ENHANCED: Apply ALL rule-based configurations
              const enhancedProperty = {
                ...prop,
                title: fieldLabels[name] || prop.title || name,
                description: fieldDescriptions[name] || prop.description,
                placeholder: fieldPlaceholders[name] || prop.placeholder,
              };

              // Determine if field is required (base schema + rules)
              const isRequired =
                baseRequiredFields.includes(name) || fieldConfig.required;

              return (
                <div key={name} className={fieldConfig.classes.join(" ")}>
                  <SchemaField
                    name={name}
                    property={enhancedProperty}
                    required={isRequired}
                    description={fieldDescriptions[name]}
                    disabled={fieldConfig.disabled}
                  />

                  {/* 🎯 ENHANCED: Show rule-based warnings */}
                  {fieldConfig.warnings.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {fieldConfig.warnings.map((warning, index) => (
                        <Alert key={index} variant="default" className="py-2">
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {warning}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {/* 🎯 ENHANCED: Show rule-based errors */}
                  {fieldConfig.errors.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {fieldConfig.errors.map((error, index) => (
                        <Alert
                          key={index}
                          variant="destructive"
                          className="py-2"
                        >
                          <AlertCircle className="h-3 w-3" />
                          <AlertDescription className="text-xs">
                            {error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
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

export function RuleBasedSchemaForm<T extends FieldValues>({
  schema,
  rules = [],
  customFunctions = {},
  transformFunctions = {},
  context = {},
  defaultValues,
  onCustomAction,
  toast,
  ...rendererProps
}: RuleBasedSchemaFormProps<T>) {
  // Extract default values from schema for form initialization
  const extractedDefaults = useMemo(() => {
    const defaults: Record<string, unknown> = {};
    try {
      const jsonSchema = z.toJSONSchema(schema);
      if (jsonSchema?.properties) {
        Object.entries(jsonSchema.properties).forEach(
          ([key, property]: [string, JSONSchema7]) => {
            if (property.default !== undefined) {
              defaults[key] = property.default;
            }
          }
        );
      }
    } catch {
      // Ignore errors in schema parsing
    }
    return defaults;
  }, [schema]);

  const mergedDefaults: DefaultValues<T> = useMemo(
    () =>
      ({
        ...extractedDefaults,
        ...defaultValues,
      }) as DefaultValues<T>,
    [extractedDefaults, defaultValues]
  );

  // 🚀 Use the useFormRules hook for complete rule management
  const ruleResults = useFormRules({
    schema,
    rules,
    customFunctions,
    transformFunctions,
    defaultValues: mergedDefaults,
    context,
    onCustomAction,
    toast,
  });

  // 🎯 NEW: Complete rule-based form rendering
  return (
    <RuleBasedFormRenderer
      ruleResults={ruleResults}
      schema={schema}
      {...rendererProps}
    />
  );
}
