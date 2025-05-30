import type { ComparisonOperatorType } from "../schemas/rule.schema";

export interface Condition {
  field: string;
  operator: ComparisonOperatorType | "";
  value: string | number | boolean;
}

export interface Action {
  type: string;
  value: string;
}

export interface Rule {
  condition: Condition;
  action?: Action;
}

export function generateCode(condition: Condition): string {
  const { field, operator, value } = condition;

  // Handle different value types for proper code generation
  const formattedValue = (() => {
    if (typeof value === "string") {
      // Check if it's a boolean string that should be unquoted
      if (value === "true" || value === "false") {
        return value; // No quotes for boolean values
      }
      return `'${value.replace(/'/g, "\\'")}'`; // Escape single quotes for strings
    }
    return String(value); // Numbers and actual booleans
  })();

  return `field('${field}').${operator}(${formattedValue})`;
}

export function generateActionCode(action: Action): string {
  const { type, value } = action;

  switch (type) {
    case "showMessage":
      return `.then(() => showMessage('${value.replace(/'/g, "\\'")}'))`;
    case "redirect":
      return `.then(() => redirect('${value.replace(/'/g, "\\'")}'))`;
    case "setFieldValue":
      return `.then(() => setFieldValue('${value.replace(/'/g, "\\'")}'))`;
    case "preventDefault":
      return `.then(() => preventDefault())`;
    default:
      return "";
  }
}

export function generateFullCode(rule: Rule): string {
  const { condition, action } = rule;

  const imports = action
    ? "import { field, showMessage, redirect, setFieldValue, preventDefault } from '@conform/rule-builder';"
    : "import { field } from '@conform/rule-builder';";

  const conditionCode = generateCode(condition);
  const actionCode = action ? generateActionCode(action) : "";

  return `${imports}\n\nconst rule = ${conditionCode}${actionCode};`;
}

// Legacy function for backward compatibility
export function generateFullCodeLegacy(condition: Condition): string {
  return generateFullCode({ condition });
}
