import { ComparisonOperator } from "../schemas/rule.schema";
import type { RuleMetadata } from "../schemas/rule.schema";

/**
 * Helper function to create strongly-typed rule metadata
 */
export const ruleMeta = (metadata: RuleMetadata): RuleMetadata => metadata;

/**
 * Extract operator metadata from the ComparisonOperator schema
 */
export function getOperatorMetadata(): Record<string, RuleMetadata> {
  const metadata = ComparisonOperator.meta();
  // Explicitly type as Record<string, RuleMetadata>
  return (metadata?.operators ?? {}) as Record<string, RuleMetadata>;
}

/**
 * Extract category metadata from the ComparisonOperator schema
 */
export function getCategoryMetadata(): Record<string, RuleMetadata> {
  const metadata = ComparisonOperator.meta();
  // Explicitly type as Record<string, RuleMetadata>
  return (metadata?.categories ?? {}) as Record<string, RuleMetadata>;
}

/**
 * Get operators for a specific field type
 */
export function getOperatorsForFieldType(
  fieldType: string
): Record<string, RuleMetadata> {
  const operators = getOperatorMetadata();

  return Object.entries(operators)
    .filter(([, meta]) => meta.supportedTypes?.includes(fieldType))
    .reduce(
      (acc, [op, meta]) => {
        acc[op] = meta;
        return acc;
      },
      {} as Record<string, RuleMetadata>
    );
}

/**
 * Get operators by category
 */
export function getOperatorsByCategory(): Record<
  string,
  { meta: RuleMetadata; operators: Record<string, RuleMetadata> }
> {
  const operators = getOperatorMetadata();
  const categories = getCategoryMetadata();

  const result: Record<
    string,
    { meta: RuleMetadata; operators: Record<string, RuleMetadata> }
  > = {};

  Object.entries(categories).forEach(([categoryKey, categoryMeta]) => {
    result[categoryKey] = {
      meta: categoryMeta,
      operators: {},
    };
  });

  Object.entries(operators).forEach(([operatorKey, operatorMeta]) => {
    const category = operatorMeta.category || "other";
    if (!result[category]) {
      result[category] = {
        meta: { label: category } as RuleMetadata,
        operators: {},
      };
    }
    result[category].operators[operatorKey] = operatorMeta;
  });

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

// Action metadata mapping (since RuleAction doesn't have .meta() like ComparisonOperator)
const ACTION_METADATA: Record<string, RuleMetadata> = {
  show: {
    label: "Show Field",
    description: "Make a field visible",
    category: "visibility",
    icon: "👁️",
  },
  hide: {
    label: "Hide Field",
    description: "Make a field hidden",
    category: "visibility",
    icon: "🙈",
  },
  enable: {
    label: "Enable Field",
    description: "Make a field interactive",
    category: "state",
    icon: "✅",
  },
  disable: {
    label: "Disable Field",
    description: "Make a field non-interactive",
    category: "state",
    icon: "🚫",
  },
  set_value: {
    label: "Set Field Value",
    description: "Set a specific value for a field",
    category: "data",
    icon: "📝",
  },
  clear_value: {
    label: "Clear Field Value",
    description: "Remove the current value from a field",
    category: "data",
    icon: "🗑️",
  },
  set_options: {
    label: "Set Field Options",
    description: "Update the available options for a field",
    category: "data",
    icon: "📋",
  },
  add_class: {
    label: "Add CSS Class",
    description: "Add a CSS class to a field",
    category: "styling",
    icon: "🎨",
  },
  remove_class: {
    label: "Remove CSS Class",
    description: "Remove a CSS class from a field",
    category: "styling",
    icon: "🧹",
  },
  trigger_validation: {
    label: "Trigger Validation",
    description: "Force validation to run on a field",
    category: "validation",
    icon: "🔍",
  },
  show_warning: {
    label: "Show Warning",
    description: "Display a warning message",
    category: "messaging",
    icon: "⚠️",
  },
  show_error: {
    label: "Show Error",
    description: "Display an error message",
    category: "messaging",
    icon: "❌",
  },
  showMessage: {
    label: "Show Message",
    description: "Display a custom message to the user",
    category: "messaging",
    icon: "💬",
  },
  redirect: {
    label: "Redirect",
    description: "Navigate to a different page or URL",
    category: "navigation",
    icon: "🔄",
  },
  preventDefault: {
    label: "Prevent Default",
    description: "Prevent the default form submission behavior",
    category: "advanced",
    icon: "🛑",
  },
  custom: {
    label: "Custom Action",
    description: "Execute a custom action function",
    category: "advanced",
    icon: "⚙️",
  },
};

const ACTION_CATEGORIES: Record<string, RuleMetadata> = {
  visibility: { label: "Visibility", order: 1 },
  state: { label: "Field State", order: 2 },
  data: { label: "Data Management", order: 3 },
  validation: { label: "Validation", order: 4 },
  messaging: { label: "Messages", order: 5 },
  navigation: { label: "Navigation", order: 6 },
  styling: { label: "Styling", order: 7 },
  advanced: { label: "Advanced", order: 8 },
};

/**
 * Get action metadata (similar to getOperatorMetadata)
 */
export function getActionMetadata(): Record<string, RuleMetadata> {
  return ACTION_METADATA;
}

/**
 * Get action categories
 */
export function getActionCategories(): Record<string, RuleMetadata> {
  return ACTION_CATEGORIES;
}

/**
 * Get actions by category
 */
export function getActionsByCategory(): Record<
  string,
  { meta: RuleMetadata; actions: Record<string, RuleMetadata> }
> {
  const actions = getActionMetadata();
  const categories = getActionCategories();

  const result: Record<
    string,
    { meta: RuleMetadata; actions: Record<string, RuleMetadata> }
  > = {};

  Object.entries(categories).forEach(([categoryKey, categoryMeta]) => {
    result[categoryKey] = {
      meta: categoryMeta,
      actions: {},
    };
  });

  Object.entries(actions).forEach(([actionKey, actionMeta]) => {
    const category = actionMeta.category || "other";
    if (!result[category]) {
      result[category] = {
        meta: { label: category } as RuleMetadata,
        actions: {},
      };
    }
    result[category].actions[actionKey] = actionMeta;
  });

  return result;
}

/**
 * Get action label
 */
export function getActionLabel(actionKey: string): string {
  const actions = getActionMetadata();
  const action = actions[actionKey];
  return action?.label || actionKey;
}

/**
 * Get action description
 */
export function getActionDescription(actionKey: string): string {
  const actions = getActionMetadata();
  const action = actions[actionKey];
  return action?.description || "";
}

/**
 * Get action icon
 */
export function getActionIcon(actionKey: string): string | undefined {
  const actions = getActionMetadata();
  const action = actions[actionKey];
  return action?.icon;
}
