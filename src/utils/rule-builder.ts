import type { RuleDefinition, RuleAction } from "../hooks/useFormRules";
import type {
  RuleConditionType,
  BaseConditionType,
  ComplexConditionType,
  ComparisonOperatorType,
  DynamicValueType,
} from "../schemas/rule.schema";

export class RuleBuilder {
  private rules: RuleDefinition[] = [];
  private currentRule: Partial<RuleDefinition> = {};

  constructor(private idPrefix: string = "rule") {}

  /**
   * Start building a new rule with a condition
   */
  static when(field: string): ConditionBuilder {
    const builder = new RuleBuilder();
    return new ConditionBuilder(builder, field);
  }

  /**
   * Start building multiple rules
   */
  static create(idPrefix?: string): RuleBuilder {
    return new RuleBuilder(idPrefix);
  }

  /**
   * Add a rule when field equals value
   */
  when(field: string): ConditionBuilder {
    return new ConditionBuilder(this, field);
  }

  /**
   * Add the current rule to the collection
   */
  addRule(rule: RuleDefinition): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Build and return all rules
   */
  build(): RuleDefinition[] {
    return [...this.rules];
  }

  /**
   * Get the current rule being built
   */
  getCurrentRule(): Partial<RuleDefinition> {
    return this.currentRule;
  }

  /**
   * Set the current rule
   */
  setCurrentRule(rule: Partial<RuleDefinition>): this {
    this.currentRule = rule;
    return this;
  }

  /**
   * Generate a unique ID for a rule
   */
  generateId(): string {
    return `${this.idPrefix}_${this.rules.length + 1}`;
  }
}

export class ConditionBuilder {
  constructor(private ruleBuilder: RuleBuilder, private field: string) {}

  // Comparison operators
  equals(value: DynamicValueType): ActionBuilder {
    return this.createCondition("equals", value);
  }

  notEquals(value: DynamicValueType): ActionBuilder {
    return this.createCondition("not_equals", value);
  }

  greaterThan(value: DynamicValueType): ActionBuilder {
    return this.createCondition("greater_than", value);
  }

  greaterThanOrEqual(value: DynamicValueType): ActionBuilder {
    return this.createCondition("greater_than_or_equal", value);
  }

  lessThan(value: DynamicValueType): ActionBuilder {
    return this.createCondition("less_than", value);
  }

  lessThanOrEqual(value: DynamicValueType): ActionBuilder {
    return this.createCondition("less_than_or_equal", value);
  }

  contains(value: DynamicValueType): ActionBuilder {
    return this.createCondition("contains", value);
  }

  notContains(value: DynamicValueType): ActionBuilder {
    return this.createCondition("not_contains", value);
  }

  startsWith(value: DynamicValueType): ActionBuilder {
    return this.createCondition("starts_with", value);
  }

  endsWith(value: DynamicValueType): ActionBuilder {
    return this.createCondition("ends_with", value);
  }

  in(values: DynamicValueType[]): ActionBuilder {
    return this.createCondition("in", values as DynamicValueType);
  }

  notIn(values: DynamicValueType[]): ActionBuilder {
    return this.createCondition("not_in", values as DynamicValueType);
  }

  isEmpty(): ActionBuilder {
    return this.createCondition("is_empty", null);
  }

  isNotEmpty(): ActionBuilder {
    return this.createCondition("is_not_empty", null);
  }

  matchesRegex(pattern: string): ActionBuilder {
    return this.createCondition("matches_regex", pattern);
  }

  notMatchesRegex(pattern: string): ActionBuilder {
    return this.createCondition("not_matches_regex", pattern);
  }

  // Format validation methods
  hasEmailFormat(): ActionBuilder {
    return this.createCondition("email_format", null);
  }

  hasUrlFormat(): ActionBuilder {
    return this.createCondition("url_format", null);
  }

  hasPhoneFormat(): ActionBuilder {
    return this.createCondition("phone_format", null);
  }

  hasCreditCardFormat(): ActionBuilder {
    return this.createCondition("credit_card_format", null);
  }

  hasUuidFormat(): ActionBuilder {
    return this.createCondition("uuid_format", null);
  }

  // Date comparison methods
  beforeDate(date: DynamicValueType): ActionBuilder {
    return this.createCondition("before_date", date);
  }

  afterDate(date: DynamicValueType): ActionBuilder {
    return this.createCondition("after_date", date);
  }

  isWeekend(): ActionBuilder {
    return this.createCondition("is_weekend", null);
  }

  isBusinessDay(): ActionBuilder {
    return this.createCondition("is_business_day", null);
  }

  // Numeric range methods
  between(min: number, max: number): ActionBuilder {
    return this.createCondition("between", [min, max]);
  }

  notBetween(min: number, max: number): ActionBuilder {
    return this.createCondition("not_between", [min, max]);
  }

  isMultipleOf(value: number): ActionBuilder {
    return this.createCondition("multiple_of", value);
  }

  isInteger(): ActionBuilder {
    return this.createCondition("is_integer", null);
  }

  // Length comparison methods
  lengthEquals(length: number): ActionBuilder {
    return this.createCondition("length_equals", length);
  }

  lengthGreaterThan(length: number): ActionBuilder {
    return this.createCondition("length_greater_than", length);
  }

  lengthLessThan(length: number): ActionBuilder {
    return this.createCondition("length_less_than", length);
  }

  // Reference other fields
  equalsField(fieldName: string, property?: string): ActionBuilder {
    return this.createCondition("equals", this.fieldRef(fieldName, property));
  }

  // Reference context values
  equalsContext(contextKey: string): ActionBuilder {
    return this.createCondition("equals", this.contextRef(contextKey));
  }

  // Function references
  equalsFunction(
    functionName: string,
    ...args: DynamicValueType[]
  ): ActionBuilder {
    return this.createCondition("equals", this.functionRef(functionName, args));
  }

  private createCondition(
    operator: ComparisonOperatorType,
    value: DynamicValueType
  ): ActionBuilder {
    const condition: BaseConditionType = {
      field: this.field,
      operator,
      value,
    };

    this.ruleBuilder.setCurrentRule({
      ...this.ruleBuilder.getCurrentRule(),
      condition,
    });

    return new ActionBuilder(this.ruleBuilder);
  }

  private fieldRef(fieldName: string, property?: string) {
    return {
      type: "field" as const,
      fieldName,
      property,
    };
  }

  private contextRef(key: string) {
    return {
      type: "context" as const,
      key,
    };
  }

  private functionRef(name: string, args: DynamicValueType[]) {
    return {
      type: "function" as const,
      name,
      args,
    };
  }
}

export class ActionBuilder {
  constructor(private ruleBuilder: RuleBuilder) {}

  /**
   * Then actions - field visibility
   */
  then(field: string): FieldActionBuilder {
    return new FieldActionBuilder(this.ruleBuilder, field);
  }

  /**
   * Hide a field
   */
  hide(field: string): RuleBuilder {
    return this.addAction({
      type: "field-visibility",
      field,
      visible: false,
    });
  }

  /**
   * Show a field
   */
  show(field: string): RuleBuilder {
    return this.addAction({
      type: "field-visibility",
      field,
      visible: true,
    });
  }

  /**
   * Make a field required
   */
  require(field: string): RuleBuilder {
    return this.addAction({
      type: "field-required",
      field,
      required: true,
    });
  }

  /**
   * Make a field optional
   */
  makeOptional(field: string): RuleBuilder {
    return this.addAction({
      type: "field-required",
      field,
      required: false,
    });
  }

  /**
   * Disable a field
   */
  disable(field: string): RuleBuilder {
    return this.addAction({
      type: "field-disabled",
      field,
      disabled: true,
    });
  }

  /**
   * Enable a field
   */
  enable(field: string): RuleBuilder {
    return this.addAction({
      type: "field-disabled",
      field,
      disabled: false,
    });
  }

  private addAction(action: RuleAction): RuleBuilder {
    const currentRule = this.ruleBuilder.getCurrentRule();
    const rule: RuleDefinition = {
      id: this.ruleBuilder.generateId(),
      condition: currentRule.condition!,
      action,
      description: currentRule.description,
    };

    this.ruleBuilder.addRule(rule);
    this.ruleBuilder.setCurrentRule({});
    return this.ruleBuilder;
  }
}

export class FieldActionBuilder {
  constructor(private ruleBuilder: RuleBuilder, private field: string) {}

  /**
   * Show the field
   */
  show(): RuleBuilder {
    return this.addAction({
      type: "field-visibility",
      field: this.field,
      visible: true,
    });
  }

  /**
   * Hide the field
   */
  hide(): RuleBuilder {
    return this.addAction({
      type: "field-visibility",
      field: this.field,
      visible: false,
    });
  }

  /**
   * Make the field required
   */
  require(): RuleBuilder {
    return this.addAction({
      type: "field-required",
      field: this.field,
      required: true,
    });
  }

  /**
   * Make the field optional
   */
  makeOptional(): RuleBuilder {
    return this.addAction({
      type: "field-required",
      field: this.field,
      required: false,
    });
  }

  /**
   * Disable the field
   */
  disable(): RuleBuilder {
    return this.addAction({
      type: "field-disabled",
      field: this.field,
      disabled: true,
    });
  }

  /**
   * Enable the field
   */
  enable(): RuleBuilder {
    return this.addAction({
      type: "field-disabled",
      field: this.field,
      disabled: false,
    });
  }

  private addAction(action: RuleAction): RuleBuilder {
    const currentRule = this.ruleBuilder.getCurrentRule();
    const rule: RuleDefinition = {
      id: this.ruleBuilder.generateId(),
      condition: currentRule.condition!,
      action,
      description: currentRule.description,
    };

    this.ruleBuilder.addRule(rule);
    this.ruleBuilder.setCurrentRule({});
    return this.ruleBuilder;
  }
}

/**
 * Complex condition builder for AND/OR/NOT operations
 */
export class ComplexConditionBuilder {
  private conditions: RuleConditionType[] = [];

  constructor(
    private ruleBuilder: RuleBuilder,
    private operator: "and" | "or" | "not"
  ) {}

  /**
   * Add a simple condition
   */
  condition(field: string): ConditionBuilder {
    // This creates a nested condition builder that adds to this complex condition
    return new ConditionBuilder(this.ruleBuilder, field);
  }

  /**
   * Build the complex condition and return action builder
   */
  then(): ActionBuilder {
    const complexCondition: ComplexConditionType = {
      operator: this.operator,
      conditions: this.conditions,
    };

    this.ruleBuilder.setCurrentRule({
      ...this.ruleBuilder.getCurrentRule(),
      condition: complexCondition,
    });

    return new ActionBuilder(this.ruleBuilder);
  }
}

/**
 * Utility functions for common rule patterns
 */
export const CommonRules = {
  /**
   * Show field when another field has specific value
   */
  showWhen(
    targetField: string,
    conditionField: string,
    value: DynamicValueType
  ): RuleDefinition {
    return RuleBuilder.when(conditionField)
      .equals(value)
      .show(targetField)
      .build()[0];
  },

  /**
   * Hide field when another field has specific value
   */
  hideWhen(
    targetField: string,
    conditionField: string,
    value: DynamicValueType
  ): RuleDefinition {
    return RuleBuilder.when(conditionField)
      .equals(value)
      .hide(targetField)
      .build()[0];
  },

  /**
   * Require field when another field has specific value
   */
  requireWhen(
    targetField: string,
    conditionField: string,
    value: DynamicValueType
  ): RuleDefinition {
    return RuleBuilder.when(conditionField)
      .equals(value)
      .require(targetField)
      .build()[0];
  },

  /**
   * Show multiple fields when condition is met
   */
  showFieldsWhen(
    targetFields: string[],
    conditionField: string,
    value: DynamicValueType
  ): RuleDefinition[] {
    return targetFields.map((field) =>
      CommonRules.showWhen(field, conditionField, value)
    );
  },

  /**
   * Business rule: Show spouse fields when married
   */
  spouseFieldsWhenMarried(
    spouseFields: string[] = ["spouseIncome", "spouseName"]
  ): RuleDefinition[] {
    return CommonRules.showFieldsWhen(spouseFields, "maritalStatus", "married");
  },

  /**
   * Business rule: Require phone when contact preference is phone
   */
  requirePhoneForPhoneContact(): RuleDefinition {
    return CommonRules.requireWhen("phone", "contactPreference", "phone");
  },

  /**
   * Business rule: Show additional income fields for high earners
   */
  additionalIncomeForHighEarners(threshold: number = 100000): RuleDefinition[] {
    return RuleBuilder.when("annualIncome")
      .greaterThan(threshold)
      .show("additionalIncomeSource")
      .when("annualIncome")
      .greaterThan(threshold)
      .show("additionalIncomeAmount")
      .build();
  },

  /**
   * Business rule: Validate email format
   */
  requireValidEmail(emailField: string = "email"): RuleDefinition {
    return RuleBuilder.when(emailField)
      .hasEmailFormat()
      .show(emailField)
      .build()[0];
  },

  /**
   * Business rule: Weekend-specific rules
   */
  weekendOnlyPromotion(promoField: string): RuleDefinition {
    return RuleBuilder.when("currentDate")
      .isWeekend()
      .show(promoField)
      .build()[0];
  },

  /**
   * Business rule: Age-based field visibility
   */
  adultOnlyFields(ageField: string, targetFields: string[]): RuleDefinition[] {
    return targetFields.map(
      (field) =>
        RuleBuilder.when(ageField).greaterThanOrEqual(18).show(field).build()[0]
    );
  },

  /**
   * Business rule: Password strength requirements
   */
  strongPasswordRequired(passwordField: string): RuleDefinition {
    return RuleBuilder.when(passwordField)
      .lengthGreaterThan(8)
      .require(passwordField)
      .build()[0];
  },

  /**
   * Business rule: Credit card validation
   */
  creditCardValidation(cardField: string): RuleDefinition {
    return RuleBuilder.when(cardField)
      .hasCreditCardFormat()
      .enable("submitButton")
      .build()[0];
  },
};

/**
 * Development and testing utilities
 */
export const RuleTestUtils = {
  /**
   * Create a simple visibility rule for testing
   */
  createVisibilityRule(
    id: string,
    field: string,
    conditionField: string,
    value: any
  ): RuleDefinition {
    return {
      id,
      condition: {
        field: conditionField,
        operator: "equals",
        value,
      },
      action: {
        type: "field-visibility",
        field,
        visible: true,
      },
    };
  },

  /**
   * Create a batch of test rules
   */
  createTestRules(): RuleDefinition[] {
    return [
      ...CommonRules.spouseFieldsWhenMarried(),
      CommonRules.requirePhoneForPhoneContact(),
      ...CommonRules.additionalIncomeForHighEarners(),
    ];
  },

  /**
   * Validate rule definition
   */
  validateRule(rule: RuleDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.id) errors.push("Rule must have an ID");
    if (!rule.condition) errors.push("Rule must have a condition");
    if (!rule.action) errors.push("Rule must have an action");

    if (
      rule.condition &&
      !("field" in rule.condition || "conditions" in rule.condition)
    ) {
      errors.push("Condition must have either 'field' or 'conditions'");
    }

    if (rule.action && !rule.action.type) {
      errors.push("Action must have a type");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
