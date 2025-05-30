import type {
  BaseCondition,
  ComplexCondition,
  ComparisonOperator,
  DynamicValue,
  RuleCondition,
  Rule,
  RuleAction,
} from "../schemas/rule.schema";

export class RuleBuilder {
  private rules: Rule[] = [];
  private currentRule: Partial<Rule> = {};

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
  addRule(rule: Rule): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Build and return all rules
   */
  build(): Rule[] {
    return [...this.rules];
  }

  /**
   * Get the current rule being built
   */
  getCurrentRule(): Partial<Rule> {
    return this.currentRule;
  }

  /**
   * Set the current rule
   */
  setCurrentRule(rule: Partial<Rule>): this {
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
  constructor(
    private ruleBuilder: RuleBuilder,
    private field: string
  ) {}

  // Comparison operators
  equals(value: DynamicValue): ActionBuilder {
    return this.createCondition("equals", value);
  }

  notEquals(value: DynamicValue): ActionBuilder {
    return this.createCondition("not_equals", value);
  }

  greaterThan(value: DynamicValue): ActionBuilder {
    return this.createCondition("greater_than", value);
  }

  greaterThanOrEqual(value: DynamicValue): ActionBuilder {
    return this.createCondition("greater_than_or_equal", value);
  }

  lessThan(value: DynamicValue): ActionBuilder {
    return this.createCondition("less_than", value);
  }

  lessThanOrEqual(value: DynamicValue): ActionBuilder {
    return this.createCondition("less_than_or_equal", value);
  }

  contains(value: DynamicValue): ActionBuilder {
    return this.createCondition("contains", value);
  }

  notContains(value: DynamicValue): ActionBuilder {
    return this.createCondition("not_contains", value);
  }

  startsWith(value: DynamicValue): ActionBuilder {
    return this.createCondition("starts_with", value);
  }

  endsWith(value: DynamicValue): ActionBuilder {
    return this.createCondition("ends_with", value);
  }

  in(values: DynamicValue[]): ActionBuilder {
    return this.createCondition("in", values as DynamicValue);
  }

  notIn(values: DynamicValue[]): ActionBuilder {
    return this.createCondition("not_in", values as DynamicValue);
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
  beforeDate(date: DynamicValue): ActionBuilder {
    return this.createCondition("before_date", date);
  }

  afterDate(date: DynamicValue): ActionBuilder {
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
  equalsFunction(functionName: string, ...args: DynamicValue[]): ActionBuilder {
    return this.createCondition("equals", this.functionRef(functionName, args));
  }

  private createCondition(
    operator: ComparisonOperator,
    value: DynamicValue
  ): ActionBuilder {
    const condition: BaseCondition = {
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

  private functionRef(name: string, args: DynamicValue[]) {
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
      type: "hide",
      target: field,
    });
  }

  /**
   * Show a field
   */
  show(field: string): RuleBuilder {
    return this.addAction({
      type: "show",
      target: field,
    });
  }

  /**
   * Make a field required
   */
  require(field: string): RuleBuilder {
    return this.addAction({
      type: "set_value",
      target: field,
      params: { required: true },
    });
  }

  /**
   * Make a field optional
   */
  makeOptional(field: string): RuleBuilder {
    return this.addAction({
      type: "set_value",
      target: field,
      params: { required: false },
    });
  }

  /**
   * Disable a field
   */
  disable(field: string): RuleBuilder {
    return this.addAction({
      type: "disable",
      target: field,
    });
  }

  /**
   * Enable a field
   */
  enable(field: string): RuleBuilder {
    return this.addAction({
      type: "enable",
      target: field,
    });
  }

  private addAction(action: RuleAction): RuleBuilder {
    const currentRule = this.ruleBuilder.getCurrentRule();
    const rule: Rule = {
      id: this.ruleBuilder.generateId(),
      condition: currentRule.condition!,
      actions: [action],
      description: currentRule.description,
      enabled: true,
    };

    this.ruleBuilder.addRule(rule);
    this.ruleBuilder.setCurrentRule({});
    return this.ruleBuilder;
  }
}

export class FieldActionBuilder {
  constructor(
    private ruleBuilder: RuleBuilder,
    private field: string
  ) {}

  /**
   * Show the field
   */
  show(): RuleBuilder {
    return this.addAction({
      type: "show",
      target: this.field,
    });
  }

  /**
   * Hide the field
   */
  hide(): RuleBuilder {
    return this.addAction({
      type: "hide",
      target: this.field,
    });
  }

  /**
   * Make the field required
   */
  require(): RuleBuilder {
    return this.addAction({
      type: "set_value",
      target: this.field,
      params: { required: true },
    });
  }

  /**
   * Make the field optional
   */
  makeOptional(): RuleBuilder {
    return this.addAction({
      type: "set_value",
      target: this.field,
      params: { required: false },
    });
  }

  /**
   * Disable the field
   */
  disable(): RuleBuilder {
    return this.addAction({
      type: "disable",
      target: this.field,
    });
  }

  /**
   * Enable the field
   */
  enable(): RuleBuilder {
    return this.addAction({
      type: "enable",
      target: this.field,
    });
  }

  private addAction(action: RuleAction): RuleBuilder {
    const currentRule = this.ruleBuilder.getCurrentRule();
    const rule: Rule = {
      id: this.ruleBuilder.generateId(),
      condition: currentRule.condition!,
      actions: [action],
      description: currentRule.description,
      enabled: true,
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
  private conditions: RuleCondition[] = [];

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
    const complexCondition: ComplexCondition = {
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
    value: DynamicValue
  ): Rule {
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
    value: DynamicValue
  ): Rule {
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
    value: DynamicValue
  ): Rule {
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
    value: DynamicValue
  ): Rule[] {
    return targetFields.map((field) =>
      CommonRules.showWhen(field, conditionField, value)
    );
  },

  /**
   * Business rule: Show spouse fields when married
   */
  spouseFieldsWhenMarried(
    spouseFields: string[] = ["spouseIncome", "spouseName"]
  ): Rule[] {
    return CommonRules.showFieldsWhen(spouseFields, "maritalStatus", "married");
  },

  /**
   * Business rule: Require phone when contact preference is phone
   */
  requirePhoneForPhoneContact(): Rule {
    return CommonRules.requireWhen("phone", "contactPreference", "phone");
  },

  /**
   * Business rule: Show additional income fields for high earners
   */
  additionalIncomeForHighEarners(threshold: number = 100000): Rule[] {
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
  requireValidEmail(emailField: string = "email"): Rule {
    return RuleBuilder.when(emailField)
      .hasEmailFormat()
      .show(emailField)
      .build()[0];
  },

  /**
   * Business rule: Weekend-specific rules
   */
  weekendOnlyPromotion(promoField: string): Rule {
    return RuleBuilder.when("currentDate")
      .isWeekend()
      .show(promoField)
      .build()[0];
  },

  /**
   * Business rule: Age-based field visibility
   */
  adultOnlyFields(ageField: string, targetFields: string[]): Rule[] {
    return targetFields.map(
      (field) =>
        RuleBuilder.when(ageField).greaterThanOrEqual(18).show(field).build()[0]
    );
  },

  /**
   * Business rule: Password strength requirements
   */
  strongPasswordRequired(passwordField: string): Rule {
    return RuleBuilder.when(passwordField)
      .lengthGreaterThan(8)
      .require(passwordField)
      .build()[0];
  },

  /**
   * Business rule: Credit card validation
   */
  creditCardValidation(cardField: string): Rule {
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
    value: DynamicValue
  ): Rule {
    return {
      id,
      condition: {
        field: conditionField,
        operator: "equals",
        value,
      },
      actions: [
        {
          type: "show",
          target: field,
        },
      ],
      enabled: true,
    };
  },

  /**
   * Create a batch of test rules
   */
  createTestRules(): Rule[] {
    return [
      ...CommonRules.spouseFieldsWhenMarried(),
      CommonRules.requirePhoneForPhoneContact(),
      ...CommonRules.additionalIncomeForHighEarners(),
    ];
  },

  /**
   * Validate rule definition
   */
  validateRule(rule: Rule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.id) errors.push("Rule must have an ID");
    if (!rule.condition) errors.push("Rule must have a condition");
    if (!rule.actions) errors.push("Rule must have actions");

    if (
      rule.condition &&
      !("field" in rule.condition || "conditions" in rule.condition)
    ) {
      errors.push("Condition must have either 'field' or 'conditions'");
    }

    if (rule.actions && !rule.actions.length) {
      errors.push("Rule must have at least one action");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
