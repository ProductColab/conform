import { useMemo, useCallback } from "react";
import {
  useForm,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  evaluateRuleCondition,
  type CustomFunctions,
  type TransformFunctions,
} from "../utils/rule-evaluation";
import type {
  RuleConditionType,
  RuleContextType,
} from "../schemas/rule.schema";

// Re-export types for external use
export type { CustomFunctions, TransformFunctions };

export interface RuleDefinition {
  id: string;
  condition: RuleConditionType;
  action: RuleAction;
  description?: string;
}

export interface RuleAction {
  type:
    | "field-visibility"
    | "field-required"
    | "field-disabled"
    | "field-validation";
  field: string;
  visible?: boolean;
  required?: boolean;
  disabled?: boolean;
  validationRule?: z.ZodType<any>;
}

export interface UseFormRulesOptions<T extends FieldValues> {
  schema: z.ZodType<T>;
  rules?: RuleDefinition[];
  customFunctions?: CustomFunctions;
  transformFunctions?: TransformFunctions;
  defaultValues?: DefaultValues<T>;
  context?: Partial<RuleContextType>;
}

export interface UseFormRulesReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldVisibility: Record<string, boolean>;
  fieldRequirements: Record<string, boolean>;
  fieldDisabled: Record<string, boolean>;
  modifiedSchema: z.ZodType<T>;
  evaluateRules: () => void;
  getFieldConfig: (fieldName: string) => FieldConfig;
}

export interface FieldConfig {
  visible: boolean;
  required: boolean;
  disabled: boolean;
  validationErrors?: string[];
}

export function useFormRules<T extends FieldValues>({
  schema,
  rules = [],
  customFunctions = {},
  transformFunctions = {},
  defaultValues,
  context = {},
}: UseFormRulesOptions<T>): UseFormRulesReturn<T> {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange", // Enable real-time validation for rule evaluation
  });

  const { watch, getValues } = form;
  const formData = watch(); // Watch all form fields for changes

  // Create rule context from form data and provided context
  const ruleContext: RuleContextType = useMemo(
    () => ({
      formData: getValues(),
      ...context,
    }),
    [formData, context, getValues]
  );

  // Evaluate all rules and return field configurations
  const evaluateRules = useCallback(() => {
    const results = {
      visibility: {} as Record<string, boolean>,
      requirements: {} as Record<string, boolean>,
      disabled: {} as Record<string, boolean>,
    };

    // Initialize all fields as visible and not required by default
    try {
      const jsonSchema = z.toJSONSchema(schema);
      if (jsonSchema.properties) {
        Object.keys(jsonSchema.properties).forEach((fieldName) => {
          results.visibility[fieldName] = true;
          results.requirements[fieldName] = false;
          results.disabled[fieldName] = false;
        });
      }
    } catch (error) {
      console.error("Error parsing schema for field initialization:", error);
    }

    // Evaluate each rule
    rules.forEach((rule) => {
      try {
        const conditionMet = evaluateRuleCondition(
          rule.condition,
          ruleContext,
          customFunctions,
          transformFunctions
        );

        if (conditionMet) {
          const { action } = rule;
          switch (action.type) {
            case "field-visibility":
              if (action.visible !== undefined) {
                results.visibility[action.field] = action.visible;
              }
              break;
            case "field-required":
              if (action.required !== undefined) {
                results.requirements[action.field] = action.required;
              }
              break;
            case "field-disabled":
              if (action.disabled !== undefined) {
                results.disabled[action.field] = action.disabled;
              }
              break;
            case "field-validation":
              // Custom validation rules can be added here
              // This is a placeholder for future enhancement
              break;
          }
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    });

    return results;
  }, [rules, ruleContext, customFunctions, transformFunctions, schema]);

  // Memoize rule evaluation results
  const ruleResults = useMemo(() => evaluateRules(), [evaluateRules]);

  // Create modified schema based on rule results
  const modifiedSchema = useMemo(() => {
    // For now, we'll return the original schema and handle field modifications
    // at the component level. Full schema modification is complex and may not
    // be necessary for the MVP.
    return schema;
  }, [schema]);

  // Get configuration for a specific field
  const getFieldConfig = useCallback(
    (fieldName: string): FieldConfig => {
      return {
        visible: ruleResults.visibility[fieldName] ?? true,
        required: ruleResults.requirements[fieldName] ?? false,
        disabled: ruleResults.disabled[fieldName] ?? false,
      };
    },
    [ruleResults]
  );

  return {
    form,
    fieldVisibility: ruleResults.visibility,
    fieldRequirements: ruleResults.requirements,
    fieldDisabled: ruleResults.disabled,
    modifiedSchema,
    evaluateRules,
    getFieldConfig,
  };
}
