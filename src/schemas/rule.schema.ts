import { z } from "zod/v4";

/**
 * Comparison operators for rule conditions with UI metadata
 */
export const ComparisonOperator = z
  .enum([
    "equals",
    "not_equals",
    "greater_than",
    "greater_than_or_equal",
    "less_than",
    "less_than_or_equal",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
    "in",
    "not_in",
    "is_empty",
    "is_not_empty",
    "matches_regex",
    "not_matches_regex",
    // Format validation operators
    "email_format",
    "url_format",
    "phone_format",
    "credit_card_format",
    "uuid_format",
    // Date operators
    "before_date",
    "after_date",
    "is_weekend",
    "is_business_day",
    // Numeric range operators
    "between",
    "not_between",
    "multiple_of",
    "is_integer",
    // Length operators
    "length_equals",
    "length_greater_than",
    "length_less_than",
  ])
  .meta({
    operators: {
      // Basic comparison
      equals: {
        label: "Equals",
        category: "basic",
        supportedTypes: ["string", "number", "boolean", "date"],
        description: "Exact match comparison",
      },
      not_equals: {
        label: "Not Equals",
        category: "basic",
        supportedTypes: ["string", "number", "boolean", "date"],
        description: "Values must not match",
      },
      greater_than: {
        label: "Greater Than",
        category: "basic",
        supportedTypes: ["number", "date"],
        description: "Value must be greater",
      },
      greater_than_or_equal: {
        label: "Greater Than or Equal",
        category: "basic",
        supportedTypes: ["number", "date"],
        description: "Value must be greater or equal",
      },
      less_than: {
        label: "Less Than",
        category: "basic",
        supportedTypes: ["number", "date"],
        description: "Value must be less",
      },
      less_than_or_equal: {
        label: "Less Than or Equal",
        category: "basic",
        supportedTypes: ["number", "date"],
        description: "Value must be less or equal",
      },

      // Text operations
      contains: {
        label: "Contains",
        category: "text",
        supportedTypes: ["string", "array"],
        description: "Text contains substring or array contains item",
      },
      not_contains: {
        label: "Does Not Contain",
        category: "text",
        supportedTypes: ["string", "array"],
        description: "Text does not contain substring",
      },
      starts_with: {
        label: "Starts With",
        category: "text",
        supportedTypes: ["string"],
        description: "Text begins with specified value",
      },
      ends_with: {
        label: "Ends With",
        category: "text",
        supportedTypes: ["string"],
        description: "Text ends with specified value",
      },
      matches_regex: {
        label: "Matches Pattern",
        category: "text",
        supportedTypes: ["string"],
        description: "Text matches regular expression",
      },
      not_matches_regex: {
        label: "Does Not Match Pattern",
        category: "text",
        supportedTypes: ["string"],
        description: "Text does not match regular expression",
      },

      // Format validation
      email_format: {
        label: "Valid Email Format",
        category: "format",
        supportedTypes: ["string"],
        description: "Validates email address format",
        icon: "📧",
      },
      url_format: {
        label: "Valid URL Format",
        category: "format",
        supportedTypes: ["string"],
        description: "Validates URL format",
        icon: "🔗",
      },
      phone_format: {
        label: "Valid Phone Format",
        category: "format",
        supportedTypes: ["string"],
        description: "Validates phone number format",
        icon: "📞",
      },
      credit_card_format: {
        label: "Valid Credit Card",
        category: "format",
        supportedTypes: ["string"],
        description: "Validates credit card number format",
        icon: "💳",
      },
      uuid_format: {
        label: "Valid UUID",
        category: "format",
        supportedTypes: ["string"],
        description: "Validates UUID format",
      },

      // Date operations
      before_date: {
        label: "Before Date",
        category: "date",
        supportedTypes: ["date"],
        description: "Date is before specified date",
        icon: "📅",
      },
      after_date: {
        label: "After Date",
        category: "date",
        supportedTypes: ["date"],
        description: "Date is after specified date",
        icon: "📅",
      },
      is_weekend: {
        label: "Is Weekend",
        category: "date",
        supportedTypes: ["date"],
        description: "Date falls on weekend",
        requiresValue: false,
      },
      is_business_day: {
        label: "Is Business Day",
        category: "date",
        supportedTypes: ["date"],
        description: "Date is a business day",
        requiresValue: false,
      },

      // Advanced operations
      in: {
        label: "In List",
        category: "advanced",
        supportedTypes: ["string", "number", "boolean"],
        description: "Value exists in provided list",
        expectsArray: true,
      },
      not_in: {
        label: "Not In List",
        category: "advanced",
        supportedTypes: ["string", "number", "boolean"],
        description: "Value does not exist in provided list",
        expectsArray: true,
      },
      between: {
        label: "Between",
        category: "advanced",
        supportedTypes: ["number", "date"],
        description: "Value is between two values",
        expectsRange: true,
      },
      not_between: {
        label: "Not Between",
        category: "advanced",
        supportedTypes: ["number", "date"],
        description: "Value is not between two values",
        expectsRange: true,
      },
      is_empty: {
        label: "Is Empty",
        category: "advanced",
        supportedTypes: ["string", "array"],
        description: "Field is empty or null",
        requiresValue: false,
      },
      is_not_empty: {
        label: "Is Not Empty",
        category: "advanced",
        supportedTypes: ["string", "array"],
        description: "Field has a value",
        requiresValue: false,
      },
      multiple_of: {
        label: "Multiple Of",
        category: "advanced",
        supportedTypes: ["number"],
        description: "Number is a multiple of specified value",
      },
      is_integer: {
        label: "Is Integer",
        category: "advanced",
        supportedTypes: ["number"],
        description: "Number is a whole integer",
        requiresValue: false,
      },
      length_equals: {
        label: "Length Equals",
        category: "advanced",
        supportedTypes: ["string", "array"],
        description: "Text or array length equals specified value",
      },
      length_greater_than: {
        label: "Length Greater Than",
        category: "advanced",
        supportedTypes: ["string", "array"],
        description: "Text or array length is greater than specified value",
      },
      length_less_than: {
        label: "Length Less Than",
        category: "advanced",
        supportedTypes: ["string", "array"],
        description: "Text or array length is less than specified value",
      },
    },
    categories: {
      basic: { label: "Basic Comparison", order: 1 },
      text: { label: "Text Operations", order: 2 },
      format: { label: "Format Validation", order: 3 },
      date: { label: "Date Operations", order: 4 },
      advanced: { label: "Advanced", order: 5 },
    },
  });

/**
 * Logical operators for combining multiple conditions
 */
export const LogicalOperator = z.enum(["and", "or", "not"]);

/**
 * Types of values that can be compared
 */
export const RuleValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
  z.record(z.string(), z.unknown()), // For object comparisons
]);

/**
 * Field reference for dynamic field value access
 */
export const FieldReference = z.object({
  type: z.literal("field"),
  fieldName: z.string(),
  property: z.string().optional(), // For accessing nested properties like "user.role"
});

/**
 * Context reference for accessing external context (user data, permissions, etc.)
 */
export const ContextReference = z.object({
  type: z.literal("context"),
  key: z.string(), // e.g., "user.role", "permissions.canEdit", "currentDate"
});

/**
 * Function reference for custom rule evaluation
 */
export const FunctionReference = z.object({
  type: z.literal("function"),
  name: z.string(),
  args: z.array(z.unknown()).optional(),
});

/**
 * Dynamic value that can reference fields, context, or functions
 */
export const DynamicValue = z.union([
  RuleValue,
  FieldReference,
  ContextReference,
  FunctionReference,
]);

/**
 * Base condition for field-based rules
 */
export const BaseCondition = z.object({
  field: z.string(), // Field name to evaluate
  operator: ComparisonOperator,
  value: DynamicValue,
  transform: z.string().optional(), // Optional transformation function name
});

/**
 * Complex condition that can contain nested logical operations
 */
export const ComplexCondition: z.ZodType<{
  operator: z.infer<typeof LogicalOperator>;
  conditions: Array<
    | z.infer<typeof BaseCondition>
    | {
        operator: z.infer<typeof LogicalOperator>;
        conditions: unknown[];
      }
  >;
}> = z.object({
  operator: LogicalOperator,
  conditions: z.array(z.union([BaseCondition, z.lazy(() => ComplexCondition)])),
});

/**
 * Rule condition can be either a simple base condition or complex nested condition
 */
export const RuleCondition = z.union([BaseCondition, ComplexCondition]);

/**
 * Rule action to perform when condition is met
 */
export const RuleAction = z.object({
  type: z.enum([
    "show",
    "hide",
    "enable",
    "disable",
    "set_value",
    "clear_value",
    "set_options",
    "add_class",
    "remove_class",
    "trigger_validation",
    "show_warning",
    "show_error",
    "showMessage", // For displaying messages to users
    "redirect", // For navigation/redirects
    "preventDefault", // For preventing default form behavior
    "custom", // For custom action functions
  ]),
  value: DynamicValue.optional(), // Value for actions like set_value, set_options
  target: z.string().optional(), // Target field for actions (defaults to current field)
  params: z.record(z.string(), z.unknown()).optional(), // Additional parameters for custom actions
});

/**
 * Complete rule definition
 */
export const Rule = z.object({
  id: z.string().optional(), // Optional ID for debugging/tracking
  name: z.string().optional(), // Optional human-readable name
  description: z.string().optional(), // Optional description for documentation
  condition: RuleCondition,
  actions: z.array(RuleAction),
  priority: z.number().optional(), // For rule execution order (higher = first)
  enabled: z.boolean().default(true), // Whether rule is active
  debounceMs: z.number().optional(), // Debounce delay for performance
});

/**
 * Rule set for organizing multiple rules
 */
export const RuleSet = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  rules: z.array(Rule),
  global: z.boolean().default(false), // Whether rules apply globally or to specific forms
});

/**
 * Context data available to rules
 */
export const RuleContext = z.object({
  formData: z.record(z.string(), z.unknown()), // Current form field values
  user: z.record(z.string(), z.unknown()).optional(), // User data
  permissions: z.array(z.string()).optional(), // User permissions
  metadata: z.record(z.string(), z.unknown()).optional(), // Additional metadata
  timestamp: z.number().optional(), // Current timestamp
  custom: z.record(z.string(), z.unknown()).optional(), // Custom context data
});

/**
 * Rule evaluation result
 */
export const RuleEvaluationResult = z.object({
  ruleId: z.string().optional(),
  conditionMet: z.boolean(),
  actions: z.array(RuleAction),
  errors: z.array(z.string()).optional(),
  executionTimeMs: z.number().optional(),
});

// Type exports
export type ComparisonOperator = z.infer<typeof ComparisonOperator>;
export type LogicalOperator = z.infer<typeof LogicalOperator>;
export type RuleValue = z.infer<typeof RuleValue>;
export type FieldReference = z.infer<typeof FieldReference>;
export type ContextReference = z.infer<typeof ContextReference>;
export type FunctionReference = z.infer<typeof FunctionReference>;
export type DynamicValue = z.infer<typeof DynamicValue>;
export type BaseCondition = z.infer<typeof BaseCondition>;
export type ComplexCondition = z.infer<typeof ComplexCondition>;
export type RuleCondition = z.infer<typeof RuleCondition>;
export type RuleAction = z.infer<typeof RuleAction>;
export type Rule = z.infer<typeof Rule>;
export type RuleSet = z.infer<typeof RuleSet>;
export type RuleContext = z.infer<typeof RuleContext>;
export type RuleEvaluationResult = z.infer<typeof RuleEvaluationResult>;

/**
 * Utility functions for creating common rule patterns
 */
export const RuleBuilders = {
  /**
   * Create a simple field equality rule
   */
  whenFieldEquals: (
    fieldName: string,
    value: RuleValue,
    actions: RuleAction[]
  ) =>
    Rule.parse({
      condition: {
        field: fieldName,
        operator: "equals",
        value,
      },
      actions,
    }),

  /**
   * Create a rule that shows/hides a field based on another field's value
   */
  showWhenFieldEquals: (
    dependentField: string,
    targetField: string,
    value: RuleValue
  ) =>
    Rule.parse({
      condition: {
        field: dependentField,
        operator: "equals",
        value,
      },
      actions: [
        {
          type: "show",
          target: targetField,
        },
      ],
    }),

  /**
   * Create a rule with multiple AND conditions
   */
  whenAllConditions: (conditions: BaseCondition[], actions: RuleAction[]) =>
    Rule.parse({
      condition: {
        operator: "and",
        conditions,
      },
      actions,
    }),

  /**
   * Create a rule with multiple OR conditions
   */
  whenAnyCondition: (conditions: BaseCondition[], actions: RuleAction[]) =>
    Rule.parse({
      condition: {
        operator: "or",
        conditions,
      },
      actions,
    }),

  /**
   * Create a rule based on user permissions
   */
  whenUserHasPermission: (_permission: string, actions: RuleAction[]) =>
    Rule.parse({
      condition: {
        field: "permissions",
        operator: "contains",
        value: {
          type: "context",
          key: "permissions",
        },
      },
      actions,
    }),
};

/**
 * UI metadata for rules - following the FieldMetadata pattern
 */
export const RuleMetadataSchema = z.object({
  // Basic UI properties
  label: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),

  // Operator metadata
  supportedTypes: z.array(z.string()).optional(),
  requiresValue: z.boolean().optional(),
  expectsArray: z.boolean().optional(),
  expectsRange: z.boolean().optional(),

  // Action metadata
  actionType: z.string().optional(),
  targetType: z.string().optional(),

  // UI hints
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  warningText: z.string().optional(),

  // Ordering and grouping
  order: z.number().optional(),
  group: z.string().optional(),
});

export type RuleMetadata = z.infer<typeof RuleMetadataSchema>;
