"use client";

import { type FieldValues, type DefaultValues } from "react-hook-form";
import { z } from "zod/v4";
import { useMemo } from "react";
import { SchemaForm } from "./SchemaForm";
import {
  useFormRules,
  type RuleDefinition,
  type CustomFunctions,
  type TransformFunctions,
} from "../hooks/useFormRules";
import type { RuleContextType } from "../schemas/rule.schema";

interface RuleBasedSchemaFormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  rules?: RuleDefinition[];
  customFunctions?: CustomFunctions;
  transformFunctions?: TransformFunctions;
  context?: Partial<RuleContextType>;
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

  // Animation options (not implemented yet, but maintaining interface compatibility)
  enableTransitions?: boolean;
  transitionDuration?: number;
}

export function RuleBasedSchemaForm<T extends FieldValues>({
  schema,
  rules = [],
  customFunctions = {},
  transformFunctions = {},
  context = {},
  defaultValues,
  excludeFields = [],
  onSubmit,
  isSubmitting,
  ...schemaFormProps
}: RuleBasedSchemaFormProps<T>) {
  // Extract default values from schema for form initialization
  const extractedDefaults = useMemo(() => {
    const defaults: Record<string, any> = {};
    try {
      const jsonSchema = z.toJSONSchema(schema);
      if (jsonSchema?.properties) {
        Object.entries(jsonSchema.properties).forEach(
          ([key, property]: [string, any]) => {
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
      } as DefaultValues<T>),
    [extractedDefaults, defaultValues]
  );

  // Use the useFormRules hook for all rule evaluation and form management
  const { form, fieldVisibility } = useFormRules({
    schema,
    rules,
    customFunctions,
    transformFunctions,
    defaultValues: mergedDefaults,
    context,
  });

  // Calculate dynamic excluded fields based on rule evaluation results
  const dynamicExcludeFields = useMemo(() => {
    if (rules.length === 0) {
      return excludeFields;
    }

    // Find fields that should be hidden based on rule evaluation
    const hiddenFields = Object.entries(fieldVisibility)
      .filter(([_, visible]) => visible === false)
      .map(([fieldName]) => fieldName);

    return [...excludeFields, ...hiddenFields];
  }, [rules, fieldVisibility, excludeFields]);

  // If no rules are provided, fall back to basic SchemaForm for maximum compatibility
  if (rules.length === 0) {
    return (
      <SchemaForm
        schema={schema}
        defaultValues={mergedDefaults}
        excludeFields={excludeFields}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        {...schemaFormProps}
      />
    );
  }

  // Use SchemaForm with enhanced rule-based features
  return (
    <SchemaForm
      schema={schema}
      form={form}
      excludeFields={dynamicExcludeFields}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      {...schemaFormProps}
    />
  );
}
