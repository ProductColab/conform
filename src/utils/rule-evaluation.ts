import jsonLogic from "json-logic-js";
import validator from "validator";
import { isAfter, isBefore, isWeekend, parseISO, isValid } from "date-fns";
import {
  type BaseCondition,
  type ComparisonOperator,
  type ComplexCondition,
  type ContextReference,
  type DynamicValue,
  type FieldReference,
  type FunctionReference,
  type RuleCondition,
  type RuleContext,
} from "../schemas/rule.schema";
import { isBaseCondition, isComplexCondition } from "../lib/ruleUtils";

export type CustomFunctions = Record<string, (...args: unknown[]) => unknown>;
export type TransformFunctions = Record<string, (value: unknown) => unknown>;

/**
 * Type guard to check if a value is a valid ComparisonOperator
 */
export function isValidComparisonOperator(
  operator: string
): operator is ComparisonOperator {
  const validOperators = [
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
    "email_format",
    "url_format",
    "phone_format",
    "credit_card_format",
    "uuid_format",
    "before_date",
    "after_date",
    "is_weekend",
    "is_business_day",
    "between",
    "not_between",
    "multiple_of",
    "is_integer",
    "length_equals",
    "length_greater_than",
    "length_less_than",
  ];
  return validOperators.includes(operator as ComparisonOperator);
}

/**
 * Mapping from our operators to JSONLogic operators
 */
const JSON_LOGIC_OPERATOR_MAP: Record<string, string> = {
  equals: "==",
  not_equals: "!=",
  greater_than: ">",
  greater_than_or_equal: ">=",
  less_than: "<",
  less_than_or_equal: "<=",
  in: "in",
  not_in: "!in",
};

/**
 * Operators that JSONLogic can handle directly
 */
const JSON_LOGIC_OPERATORS = new Set([
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "in",
  "not_in",
]);

/**
 * Helper to safely parse a date from various formats
 */
function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    // Try parsing ISO string first
    const isoDate = parseISO(value);
    if (isValid(isoDate)) return isoDate;

    // Fallback to Date constructor
    const fallbackDate = new Date(value);
    if (isValid(fallbackDate)) return fallbackDate;
  }
  if (typeof value === "number") {
    const numDate = new Date(value);
    if (isValid(numDate)) return numDate;
  }
  return null;
}

/**
 * Helper to resolve nested properties from an object using dot notation.
 */
function getNestedProperty(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object" || obj === null) return undefined;
  // Fix: ensure accumulator is always unknown, and bail out if undefined/null at any step
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object" && acc !== null && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Resolves a dynamic value to its actual value for comparison.
 */
export function resolveDynamicValue(
  value: DynamicValue,
  context: RuleContext,
  customFunctions: CustomFunctions = {},
  transformFunctions: TransformFunctions = {}
): unknown {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    switch (value.type) {
      case "field": {
        const { fieldName, property } = value as FieldReference;
        const fieldValue = context.formData[fieldName];
        if (
          property &&
          fieldValue &&
          typeof fieldValue === "object" &&
          fieldValue !== null
        ) {
          return getNestedProperty(fieldValue, property);
        }
        return fieldValue;
      }
      case "context": {
        const { key } = value as ContextReference;
        return getNestedProperty(context, key);
      }
      case "function": {
        const { name, args } = value as FunctionReference;
        const func = customFunctions[name];
        if (typeof func !== "function") {
          throw new Error(`Unknown function: ${name}`);
        }
        const resolvedArgs =
          args?.map((arg) =>
            resolveDynamicValue(
              arg as DynamicValue,
              context,
              customFunctions,
              transformFunctions
            )
          ) ?? [];
        return func(...resolvedArgs);
      }
      default:
        return value;
    }
  }

  return value;
}

/**
 * Evaluates a comparison between two values using the specified operator.
 * Now uses JSONLogic for basic operators and custom logic for advanced ones.
 */
export function evaluateComparison(
  leftValue: unknown,
  operator: ComparisonOperator,
  rightValue: unknown
): boolean {
  // Use JSONLogic for basic operators
  if (JSON_LOGIC_OPERATORS.has(operator)) {
    const jsonLogicOperator = JSON_LOGIC_OPERATOR_MAP[operator];

    try {
      // Special handling for 'in' operators with JSONLogic
      if (operator === "in") {
        return jsonLogic.apply(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { [jsonLogicOperator]: [leftValue, rightValue] } as any,
          {}
        );
      }
      if (operator === "not_in") {
        return !jsonLogic.apply(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { in: [leftValue, rightValue] } as any,
          {}
        );
      }

      // Standard comparison
      return jsonLogic.apply(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { [jsonLogicOperator]: [leftValue, rightValue] } as any,
        {}
      );
    } catch (error) {
      console.warn(
        `JSONLogic evaluation failed for operator ${operator}:`,
        error
      );
      // Fallback to custom logic
    }
  }

  // Custom operators that need specialized logic
  switch (operator) {
    case "contains":
      if (typeof leftValue === "string" && typeof rightValue === "string") {
        return leftValue.includes(rightValue);
      }
      if (Array.isArray(leftValue)) {
        return leftValue.includes(rightValue);
      }
      return false;

    case "not_contains":
      return !evaluateComparison(leftValue, "contains", rightValue);

    case "starts_with":
      return (
        typeof leftValue === "string" &&
        typeof rightValue === "string" &&
        leftValue.startsWith(rightValue)
      );

    case "ends_with":
      return (
        typeof leftValue === "string" &&
        typeof rightValue === "string" &&
        leftValue.endsWith(rightValue)
      );

    case "is_empty":
      if (leftValue === null || leftValue === undefined) return true;
      if (typeof leftValue === "string" || Array.isArray(leftValue))
        return leftValue.length === 0;
      if (typeof leftValue === "object" && leftValue !== null)
        return Object.keys(leftValue).length === 0;
      return false;

    case "is_not_empty":
      return !evaluateComparison(leftValue, "is_empty", rightValue);

    case "matches_regex":
      if (typeof leftValue === "string" && typeof rightValue === "string") {
        try {
          return new RegExp(rightValue).test(leftValue);
        } catch {
          return false;
        }
      }
      return false;

    case "not_matches_regex":
      return !evaluateComparison(leftValue, "matches_regex", rightValue);

    // New format validation operators using validator.js
    case "email_format":
      return typeof leftValue === "string" && validator.isEmail(leftValue);

    case "url_format":
      return typeof leftValue === "string" && validator.isURL(leftValue);

    case "phone_format":
      return (
        typeof leftValue === "string" &&
        validator.isMobilePhone(leftValue, "any")
      );

    case "credit_card_format":
      return typeof leftValue === "string" && validator.isCreditCard(leftValue);

    case "uuid_format":
      return typeof leftValue === "string" && validator.isUUID(leftValue);

    // New date operators using date-fns
    case "before_date": {
      const leftDate = parseDate(leftValue);
      const rightDate = parseDate(rightValue);
      return leftDate && rightDate ? isBefore(leftDate, rightDate) : false;
    }

    case "after_date": {
      const leftDateAfter = parseDate(leftValue);
      const rightDateAfter = parseDate(rightValue);
      return leftDateAfter && rightDateAfter
        ? isAfter(leftDateAfter, rightDateAfter)
        : false;
    }

    case "is_weekend": {
      const weekendDate = parseDate(leftValue);
      return weekendDate ? isWeekend(weekendDate) : false;
    }

    case "is_business_day": {
      const businessDate = parseDate(leftValue);
      return businessDate ? !isWeekend(businessDate) : false;
    }

    // New numeric range operators
    case "between":
      if (
        typeof leftValue === "number" &&
        Array.isArray(rightValue) &&
        rightValue.length === 2
      ) {
        const [min, max] = rightValue;
        return (
          typeof min === "number" &&
          typeof max === "number" &&
          leftValue >= min &&
          leftValue <= max
        );
      }
      return false;

    case "not_between":
      return !evaluateComparison(leftValue, "between", rightValue);

    case "multiple_of":
      return (
        typeof leftValue === "number" &&
        typeof rightValue === "number" &&
        rightValue !== 0 &&
        leftValue % rightValue === 0
      );

    case "is_integer":
      return typeof leftValue === "number" && Number.isInteger(leftValue);

    case "length_equals":
      if (typeof leftValue === "string" || Array.isArray(leftValue)) {
        return leftValue.length === rightValue;
      }
      return false;

    case "length_greater_than":
      if (typeof leftValue === "string" || Array.isArray(leftValue)) {
        return typeof rightValue === "number" && leftValue.length > rightValue;
      }
      return false;

    case "length_less_than":
      if (typeof leftValue === "string" || Array.isArray(leftValue)) {
        return typeof rightValue === "number" && leftValue.length < rightValue;
      }
      return false;

    default:
      throw new Error(`Unknown comparison operator: ${operator}`);
  }
}

/**
 * Evaluates a base condition.
 */
export function evaluateBaseCondition(
  condition: BaseCondition,
  context: RuleContext,
  customFunctions: CustomFunctions = {},
  transformFunctions: TransformFunctions = {}
): boolean {
  let fieldValue = context.formData[condition.field];

  if (condition.transform && transformFunctions[condition.transform]) {
    fieldValue = transformFunctions[condition.transform](fieldValue);
  }

  const comparisonValue = resolveDynamicValue(
    condition.value,
    context,
    customFunctions,
    transformFunctions
  );

  return evaluateComparison(fieldValue, condition.operator, comparisonValue);
}

/**
 * Evaluates a complex condition with logical operators.
 */
export function evaluateComplexCondition(
  condition: ComplexCondition,
  context: RuleContext,
  customFunctions: CustomFunctions = {},
  transformFunctions: TransformFunctions = {}
): boolean {
  if (!condition.conditions.length) return true;

  const results = condition.conditions.map((subCondition) => {
    // Type assertion to help TypeScript understand the union type
    const typedCondition = subCondition as RuleCondition;

    if (isComplexCondition(typedCondition)) {
      return evaluateComplexCondition(
        typedCondition,
        context,
        customFunctions,
        transformFunctions
      );
    } else if (isBaseCondition(typedCondition)) {
      return evaluateBaseCondition(
        typedCondition,
        context,
        customFunctions,
        transformFunctions
      );
    } else {
      console.warn("Unknown subcondition type:", typedCondition);
      return false;
    }
  });

  switch (condition.operator) {
    case "and":
      return results.every(Boolean);
    case "or":
      return results.some(Boolean);
    case "not":
      return !results[0];
    default:
      throw new Error(`Unknown logical operator: ${condition.operator}`);
  }
}

/**
 * Main function to evaluate any rule condition.
 */
export function evaluateRuleCondition(
  condition: RuleCondition,
  context: RuleContext,
  customFunctions: CustomFunctions = {},
  transformFunctions: TransformFunctions = {}
): boolean {
  try {
    if (isComplexCondition(condition)) {
      return evaluateComplexCondition(
        condition,
        context,
        customFunctions,
        transformFunctions
      );
    }
    if (isBaseCondition(condition)) {
      return evaluateBaseCondition(
        condition,
        context,
        customFunctions,
        transformFunctions
      );
    }

    // This should never happen with proper types, but provides a fallback
    console.warn("Unknown condition type:", condition);
    return false;
  } catch (error) {
    console.error("Error evaluating rule condition:", error);
    return false;
  }
}
