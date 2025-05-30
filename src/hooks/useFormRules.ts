import { useMemo, useCallback, useReducer, useEffect } from "react";
import {
  useForm,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
  type Path,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  evaluateRuleCondition,
  resolveDynamicValue,
  type CustomFunctions,
  type TransformFunctions,
} from "../utils/rule-evaluation";
import type {
  Rule,
  RuleContext,
  RuleAction as SchemaRuleAction,
} from "../schemas/rule.schema";

// Re-export types for external use
export type { CustomFunctions, TransformFunctions };

// Type-safe form field operations with graduated safety levels
interface FormRuleActions<T extends FieldValues> {
  // Level 1: Type-safe for simple operations
  show(field: keyof T): void;
  hide(field: keyof T): void;
  enable(field: keyof T): void;
  disable(field: keyof T): void;
  require(field: keyof T, required?: boolean): void;

  // Level 2: Runtime-validated with Zod schema checking
  setValueSafe<K extends keyof T>(field: K, value: unknown): boolean;

  // Level 3: Escape hatch for complex dynamic cases (well-documented)
  setValueUnsafe(field: keyof T, value: unknown): void;

  // Utility methods
  addWarning(field: keyof T, message: string): void;
  addError(field: keyof T, message: string): void;
  addClass(field: keyof T, className: string): void;
  removeClass(field: keyof T, className: string): void;
  setOptions(field: keyof T, options: unknown[]): void;
  clearField(field: keyof T): void;
}

// Runtime validation utilities using Zod schema introspection
class FieldValidator<T extends FieldValues> {
  private fieldSchemas: Map<keyof T, z.ZodTypeAny> = new Map();

  constructor(private schema: z.ZodType<T>) {
    this.extractFieldSchemas();
  }

  private extractFieldSchemas(): void {
    try {
      // Extract field schemas from Zod object schema
      if (this.schema instanceof z.ZodObject) {
        const shape = this.schema.shape;
        Object.entries(shape).forEach(([key, fieldSchema]) => {
          this.fieldSchemas.set(key as keyof T, fieldSchema as z.ZodTypeAny);
        });
      }
    } catch (error) {
      console.warn("Failed to extract field schemas:", error);
    }
  }

  validateFieldValue(
    field: keyof T,
    value: unknown
  ): { valid: boolean; error?: string } {
    const fieldSchema = this.fieldSchemas.get(field);
    if (!fieldSchema) {
      return { valid: false, error: `Unknown field: ${String(field)}` };
    }

    try {
      fieldSchema.parse(value);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          error: error.issues
            .map((issue: z.ZodIssue) => issue.message)
            .join(", "),
        };
      }
      return { valid: false, error: "Validation failed" };
    }
  }

  getFieldType(field: keyof T): string {
    const fieldSchema = this.fieldSchemas.get(field);
    if (!fieldSchema) return "unknown";

    // Basic type detection
    if (fieldSchema instanceof z.ZodString) return "string";
    if (fieldSchema instanceof z.ZodNumber) return "number";
    if (fieldSchema instanceof z.ZodBoolean) return "boolean";
    if (fieldSchema instanceof z.ZodArray) return "array";
    if (fieldSchema instanceof z.ZodObject) return "object";
    if (fieldSchema instanceof z.ZodEnum) return "enum";
    if (fieldSchema instanceof z.ZodOptional) {
      return this.getFieldType(field); // Recurse for optional types
    }

    return "unknown";
  }
}

export interface UseFormRulesOptions<T extends FieldValues> {
  schema: z.ZodType<T>;
  rules?: Rule[];
  customFunctions?: CustomFunctions;
  transformFunctions?: TransformFunctions;
  defaultValues?: DefaultValues<T>;
  context?: Partial<RuleContext>;
  onCustomAction?: (action: SchemaRuleAction, context: RuleContext) => void;
}

export interface UseFormRulesReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldVisibility: Record<string, boolean>;
  fieldRequirements: Record<string, boolean>;
  fieldDisabled: Record<string, boolean>;
  fieldWarnings: Record<string, string[]>;
  fieldErrors: Record<string, string[]>;
  fieldClasses: Record<string, string[]>;
  fieldOptions: Record<string, unknown[]>;
  modifiedSchema: z.ZodType<T>;
  evaluateRules: () => void;
  getFieldConfig: (fieldName: string) => FieldConfig;
  triggerValidation: (fieldNames?: string[]) => Promise<boolean>;
  clearFieldValue: (fieldName: string) => void;
  // Expose the type-safe actions for external use
  actions: FormRuleActions<T>;
}

export interface FieldConfig {
  visible: boolean;
  required: boolean;
  disabled: boolean;
  warnings: string[];
  errors: string[];
  classes: string[];
  options?: unknown[];
}

// Enhanced state management with reducer pattern
interface RuleState {
  visibility: Record<string, boolean>;
  requirements: Record<string, boolean>;
  disabled: Record<string, boolean>;
  warnings: Record<string, string[]>;
  errors: Record<string, string[]>;
  classes: Record<string, string[]>;
  options: Record<string, unknown[]>;
}

type RuleStateAction =
  | { type: "INITIALIZE_FIELDS"; payload: { fieldNames: string[] } }
  | { type: "SHOW_FIELD"; payload: { field: string } }
  | { type: "HIDE_FIELD"; payload: { field: string } }
  | { type: "SET_REQUIREMENT"; payload: { field: string; required: boolean } }
  | { type: "ENABLE_FIELD"; payload: { field: string } }
  | { type: "DISABLE_FIELD"; payload: { field: string } }
  | { type: "ADD_WARNING"; payload: { field: string; message: string } }
  | { type: "ADD_ERROR"; payload: { field: string; message: string } }
  | { type: "ADD_CLASS"; payload: { field: string; className: string } }
  | { type: "REMOVE_CLASS"; payload: { field: string; className: string } }
  | { type: "SET_OPTIONS"; payload: { field: string; options: unknown[] } }
  | { type: "CLEAR_FIELD_MESSAGES"; payload: { field: string } }
  | { type: "RESET_STATE" };

function ruleStateReducer(
  state: RuleState,
  action: RuleStateAction
): RuleState {
  switch (action.type) {
    case "INITIALIZE_FIELDS": {
      const initialState: RuleState = {
        visibility: {},
        requirements: {},
        disabled: {},
        warnings: {},
        errors: {},
        classes: {},
        options: {},
      };

      action.payload.fieldNames.forEach((fieldName) => {
        // 🔥 CRITICAL FIX: Only initialize if field doesn't already have a state
        // This preserves existing visibility decisions from previous rule evaluations
        initialState.visibility[fieldName] =
          state.visibility[fieldName] ?? true;
        initialState.requirements[fieldName] =
          state.requirements[fieldName] ?? false;
        initialState.disabled[fieldName] = state.disabled[fieldName] ?? false;
        initialState.warnings[fieldName] = state.warnings[fieldName] ?? [];
        initialState.errors[fieldName] = state.errors[fieldName] ?? [];
        initialState.classes[fieldName] = state.classes[fieldName] ?? [];
        initialState.options[fieldName] = state.options[fieldName] ?? [];
      });

      return initialState;
    }

    case "SHOW_FIELD":
      return {
        ...state,
        visibility: {
          ...state.visibility,
          [action.payload.field]: true,
        },
      };

    case "HIDE_FIELD":
      return {
        ...state,
        visibility: {
          ...state.visibility,
          [action.payload.field]: false,
        },
      };

    case "SET_REQUIREMENT":
      return {
        ...state,
        requirements: {
          ...state.requirements,
          [action.payload.field]: action.payload.required,
        },
      };

    case "ENABLE_FIELD":
      return {
        ...state,
        disabled: {
          ...state.disabled,
          [action.payload.field]: false,
        },
      };

    case "DISABLE_FIELD":
      return {
        ...state,
        disabled: {
          ...state.disabled,
          [action.payload.field]: true,
        },
      };

    case "ADD_WARNING":
      return {
        ...state,
        warnings: {
          ...state.warnings,
          [action.payload.field]: [
            ...(state.warnings[action.payload.field] || []),
            action.payload.message,
          ],
        },
      };

    case "ADD_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: [
            ...(state.errors[action.payload.field] || []),
            action.payload.message,
          ],
        },
      };

    case "ADD_CLASS": {
      const currentClasses = state.classes[action.payload.field] || [];
      if (!currentClasses.includes(action.payload.className)) {
        return {
          ...state,
          classes: {
            ...state.classes,
            [action.payload.field]: [
              ...currentClasses,
              action.payload.className,
            ],
          },
        };
      }
      return state;
    }

    case "REMOVE_CLASS":
      return {
        ...state,
        classes: {
          ...state.classes,
          [action.payload.field]: (
            state.classes[action.payload.field] || []
          ).filter((cls) => cls !== action.payload.className),
        },
      };

    case "SET_OPTIONS":
      return {
        ...state,
        options: {
          ...state.options,
          [action.payload.field]: action.payload.options,
        },
      };

    case "CLEAR_FIELD_MESSAGES":
      return {
        ...state,
        warnings: {
          ...state.warnings,
          [action.payload.field]: [],
        },
        errors: {
          ...state.errors,
          [action.payload.field]: [],
        },
      };

    case "RESET_STATE":
      return {
        visibility: {},
        requirements: {},
        disabled: {},
        warnings: {},
        errors: {},
        classes: {},
        options: {},
      };

    default:
      return state;
  }
}

export function useFormRules<T extends FieldValues>({
  schema,
  rules = [],
  customFunctions = {},
  transformFunctions = {},
  defaultValues,
  context = {},
  onCustomAction,
}: UseFormRulesOptions<T>): UseFormRulesReturn<T> {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange", // Enable real-time validation for rule evaluation
  });

  const { getValues } = form;

  // Create field validator instance
  const validator = useMemo(() => new FieldValidator(schema), [schema]);

  // Initialize reducer with empty state
  const initialState: RuleState = {
    visibility: {},
    requirements: {},
    disabled: {},
    warnings: {},
    errors: {},
    classes: {},
    options: {},
  };

  const [ruleState, dispatch] = useReducer(ruleStateReducer, initialState);

  // 🚀 SMART: Watch form data and evaluate rules only when data actually changes
  const formData = useWatch({ control: form.control });

  // Memoize rule evaluation based on actual form data changes
  useEffect(() => {
    evaluateRules();
  }, [formData, rules, schema]); // Only re-evaluate when these actually change

  // Evaluate all rules and dispatch actions to update state
  const evaluateRules = useCallback(() => {
    // Get current form context for rule evaluation
    const currentContext: RuleContext = {
      formData: getValues(),
      ...context,
    };

    // 🔥 CRITICAL FIX: Initialize fields to default visible state FIRST
    // This ensures we start with a clean slate before applying rules
    try {
      const jsonSchema = z.toJSONSchema(schema);
      if (jsonSchema.properties) {
        const fieldNames = Object.keys(jsonSchema.properties);
        dispatch({ type: "INITIALIZE_FIELDS", payload: { fieldNames } });
      }
    } catch (error) {
      console.error("Error parsing schema for field initialization:", error);
    }

    // Evaluate each rule using the reducer dispatch
    rules.forEach((rule) => {
      // Skip disabled rules
      if (rule.enabled === false) {
        return;
      }

      try {
        const conditionMet = evaluateRuleCondition(
          rule.condition,
          currentContext,
          customFunctions,
          transformFunctions
        );

        if (conditionMet) {
          const { actions: ruleActions } = rule;

          ruleActions?.forEach((action) => {
            switch (action.type) {
              case "show":
                if (!action.target) return;
                dispatch({
                  type: "SHOW_FIELD",
                  payload: { field: action.target },
                });
                break;
              case "hide":
                if (!action.target) return;
                dispatch({
                  type: "HIDE_FIELD",
                  payload: { field: action.target },
                });
                break;
              case "set_value":
                if (!action.target) return;
                if (action.params?.required !== undefined) {
                  dispatch({
                    type: "SET_REQUIREMENT",
                    payload: {
                      field: action.target,
                      required: action.params.required === true,
                    },
                  });
                }
                // Handle setting actual field values using the type-safe approach
                if (action.value !== undefined) {
                  const resolvedValue = resolveDynamicValue(
                    action.value,
                    currentContext,
                    customFunctions,
                    transformFunctions
                  );
                  // Use the validator to safely set the value
                  const validation = validator.validateFieldValue(
                    action.target as keyof T,
                    resolvedValue
                  );
                  if (validation.valid) {
                    try {
                      // Check if value is different to avoid unnecessary updates
                      const currentValue = getValues(action.target as Path<T>);
                      if (currentValue !== resolvedValue) {
                        form.setValue(
                          action.target as Path<T>,
                          resolvedValue as T[keyof T]
                        );
                      }
                    } catch (error) {
                      console.warn(
                        `Failed to set validated value for ${action.target}:`,
                        error
                      );
                    }
                  } else {
                    console.warn(
                      `Invalid resolved value for ${action.target}:`,
                      validation.error
                    );
                  }
                }
                break;
              case "enable":
                if (!action.target) return;
                dispatch({
                  type: "ENABLE_FIELD",
                  payload: { field: action.target },
                });
                break;
              case "disable":
                if (!action.target) return;
                dispatch({
                  type: "DISABLE_FIELD",
                  payload: { field: action.target },
                });
                break;
              case "trigger_validation":
                // Validation triggers are handled by the triggerValidation function
                break;
              case "show_warning":
                if (!action.target) return;
                if (action.params?.message) {
                  const message = String(action.params.message);
                  dispatch({
                    type: "ADD_WARNING",
                    payload: { field: action.target, message },
                  });
                }
                break;
              case "show_error":
                if (!action.target) return;
                if (action.params?.message) {
                  const message = String(action.params.message);
                  dispatch({
                    type: "ADD_ERROR",
                    payload: { field: action.target, message },
                  });
                }
                break;
              case "add_class":
                if (!action.target) return;
                if (action.params?.class) {
                  const className = String(action.params.class);
                  dispatch({
                    type: "ADD_CLASS",
                    payload: { field: action.target, className },
                  });
                }
                break;
              case "remove_class":
                if (!action.target) return;
                if (action.params?.class) {
                  const className = String(action.params.class);
                  dispatch({
                    type: "REMOVE_CLASS",
                    payload: { field: action.target, className },
                  });
                }
                break;
              case "set_options":
                if (!action.target) return;
                if (action.params?.options) {
                  const options = Array.isArray(action.params.options)
                    ? action.params.options
                    : [action.params.options];
                  dispatch({
                    type: "SET_OPTIONS",
                    payload: { field: action.target, options },
                  });
                }
                break;
              case "clear_value":
                if (!action.target) return;
                try {
                  form.setValue(
                    action.target as Path<T>,
                    undefined as T[keyof T]
                  );
                  form.clearErrors(action.target as Path<T>);
                } catch (error) {
                  console.warn(
                    `Failed to clear value for field ${action.target}:`,
                    error
                  );
                }
                break;
              case "custom":
                if (onCustomAction) {
                  onCustomAction(action, currentContext);
                }
                break;
            }
          });
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    });
  }, [
    rules,
    customFunctions,
    transformFunctions,
    schema,
    onCustomAction,
    form,
    validator,
    context,
    getValues,
    // NOTE: dispatch is intentionally excluded to prevent infinite loops
  ]);

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
        visible: ruleState.visibility[fieldName] ?? true,
        required: ruleState.requirements[fieldName] ?? false,
        disabled: ruleState.disabled[fieldName] ?? false,
        warnings: ruleState.warnings[fieldName] ?? [],
        errors: ruleState.errors[fieldName] ?? [],
        classes: ruleState.classes[fieldName] ?? [],
        options: ruleState.options[fieldName] ?? [],
      };
    },
    [ruleState]
  );

  const triggerValidation = useCallback(
    async (fieldNames?: string[]): Promise<boolean> => {
      if (fieldNames && fieldNames.length > 0) {
        // Validate specific fields
        const results = await Promise.all(
          fieldNames.map((fieldName) =>
            form.trigger(fieldName as Path<T>).catch(() => false)
          )
        );
        return results.every(Boolean);
      } else {
        // Validate all fields
        return await form.trigger().catch(() => false);
      }
    },
    [form]
  );

  const clearFieldValue = useCallback(
    (fieldName: string): void => {
      try {
        form.setValue(fieldName as Path<T>, undefined as T[keyof T]);
        form.clearErrors(fieldName as Path<T>);
      } catch (error) {
        console.warn(`Failed to clear field ${fieldName}:`, error);
      }
    },
    [form]
  );

  // Type-safe form field operations
  const createFormActions = useCallback((): FormRuleActions<T> => {
    const currentResults = {
      visibility: {} as Record<string, boolean>,
      requirements: {} as Record<string, boolean>,
      disabled: {} as Record<string, boolean>,
      warnings: {} as Record<string, string[]>,
      errors: {} as Record<string, string[]>,
      classes: {} as Record<string, string[]>,
      options: {} as Record<string, unknown[]>,
    };

    return {
      show: (field: keyof T) => {
        currentResults.visibility[String(field)] = true;
      },
      hide: (field: keyof T) => {
        currentResults.visibility[String(field)] = false;
      },
      enable: (field: keyof T) => {
        currentResults.disabled[String(field)] = false;
      },
      disable: (field: keyof T) => {
        currentResults.disabled[String(field)] = true;
      },
      require: (field: keyof T, required = true) => {
        currentResults.requirements[String(field)] = required;
      },
      setValueSafe: (field: keyof T, value: unknown): boolean => {
        const validation = validator.validateFieldValue(field, value);
        if (validation.valid) {
          try {
            // Safe to set value after validation
            form.setValue(String(field) as Path<T>, value as T[keyof T]);
            return true;
          } catch (error) {
            console.warn(
              `Failed to set validated value for ${String(field)}:`,
              error
            );
            return false;
          }
        } else {
          console.warn(`Invalid value for ${String(field)}:`, validation.error);
          return false;
        }
      },
      setValueUnsafe: (field: keyof T, value: unknown): void => {
        // Well-documented escape hatch for complex dynamic cases
        // WARNING: This bypasses type checking and should be used sparingly
        // Ensure you validate the value appropriately before calling this method
        try {
          form.setValue(String(field) as Path<T>, value as T[keyof T]);
        } catch (error) {
          console.error(
            `Failed to set unsafe value for ${String(field)}:`,
            error
          );
        }
      },
      addWarning: (field: keyof T, message: string) => {
        const fieldKey = String(field);
        if (!currentResults.warnings[fieldKey]) {
          currentResults.warnings[fieldKey] = [];
        }
        currentResults.warnings[fieldKey].push(message);
      },
      addError: (field: keyof T, message: string) => {
        const fieldKey = String(field);
        if (!currentResults.errors[fieldKey]) {
          currentResults.errors[fieldKey] = [];
        }
        currentResults.errors[fieldKey].push(message);
      },
      addClass: (field: keyof T, className: string) => {
        const fieldKey = String(field);
        if (!currentResults.classes[fieldKey]) {
          currentResults.classes[fieldKey] = [];
        }
        if (!currentResults.classes[fieldKey].includes(className)) {
          currentResults.classes[fieldKey].push(className);
        }
      },
      removeClass: (field: keyof T, className: string) => {
        const fieldKey = String(field);
        if (currentResults.classes[fieldKey]) {
          currentResults.classes[fieldKey] = currentResults.classes[
            fieldKey
          ].filter((c) => c !== className);
        }
      },
      setOptions: (field: keyof T, options: unknown[]) => {
        currentResults.options[String(field)] = options;
      },
      clearField: (field: keyof T) => {
        try {
          form.setValue(String(field) as Path<T>, undefined as T[keyof T]);
          form.clearErrors(String(field) as Path<T>);
        } catch (error) {
          console.warn(`Failed to clear field ${String(field)}:`, error);
        }
      },
    };
  }, [form, validator]);

  const actions = createFormActions();

  return {
    form,
    fieldVisibility: ruleState.visibility,
    fieldRequirements: ruleState.requirements,
    fieldDisabled: ruleState.disabled,
    fieldWarnings: ruleState.warnings,
    fieldErrors: ruleState.errors,
    fieldClasses: ruleState.classes,
    fieldOptions: ruleState.options,
    modifiedSchema,
    evaluateRules,
    getFieldConfig,
    triggerValidation,
    clearFieldValue,
    actions,
  };
}
