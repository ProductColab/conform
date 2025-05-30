import { ComparisonOperator } from "../schemas/rule.schema";
import type { RuleMetadata } from "../schemas/rule.schema";

/**
 * Helper function to create strongly-typed rule metadata
 */
export const ruleMeta = (metadata: RuleMetadata): RuleMetadata => metadata;

/**
 * Extract operator metadata from the ComparisonOperator schema
 */
export function getOperatorMetadata() {
  const metadata = ComparisonOperator.meta() as any;
  return metadata?.operators || {};
}

/**
 * Extract category metadata from the ComparisonOperator schema
 */
export function getCategoryMetadata() {
  const metadata = ComparisonOperator.meta();
  return metadata?.categories || {};
}

/**
 * Get operators for a specific field type
 */
export function getOperatorsForFieldType(fieldType: string) {
  const operators = getOperatorMetadata();

  return Object.entries(operators)
    .filter(([_, meta]: [string, any]) =>
      meta.supportedTypes?.includes(fieldType)
    )
    .reduce((acc, [op, meta]) => {
      acc[op] = meta;
      return acc;
    }, {} as Record<string, any>);
}

/**
 * Get operators by category
 */
export function getOperatorsByCategory() {
  const operators = getOperatorMetadata();
  const categories = getCategoryMetadata();

  const result: Record<string, { meta: any; operators: Record<string, any> }> =
    {};

  Object.entries(categories).forEach(
    ([categoryKey, categoryMeta]: [string, any]) => {
      result[categoryKey] = {
        meta: categoryMeta,
        operators: {},
      };
    }
  );

  Object.entries(operators).forEach(
    ([operatorKey, operatorMeta]: [string, any]) => {
      const category = operatorMeta.category || "other";
      if (!result[category]) {
        result[category] = { meta: { label: category }, operators: {} };
      }
      result[category].operators[operatorKey] = operatorMeta;
    }
  );

  return result;
}

/**
 * Type guards for operators (duck typing approach)
 */
export function requiresValue(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.requiresValue !== false; // Default to true
}

export function expectsArray(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.expectsArray === true;
}

export function expectsRange(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.expectsRange === true;
}

export function isFormatOperator(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.category === "format";
}

export function isDateOperator(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.category === "date";
}

export function isTextOperator(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.category === "text";
}

export function isBasicOperator(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.category === "basic";
}

export function isAdvancedOperator(operatorKey: string): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.category === "advanced";
}

/**
 * Get operator label
 */
export function getOperatorLabel(operatorKey: string): string {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.label || operatorKey;
}

/**
 * Get operator description
 */
export function getOperatorDescription(operatorKey: string): string {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.description || "";
}

/**
 * Get operator icon
 */
export function getOperatorIcon(operatorKey: string): string | undefined {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.icon;
}

/**
 * Check if operator supports a field type
 */
export function operatorSupportsType(
  operatorKey: string,
  fieldType: string
): boolean {
  const operators = getOperatorMetadata();
  const operator = operators[operatorKey];
  return operator?.supportedTypes?.includes(fieldType) ?? false;
}
