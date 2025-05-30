import { describe, it, expect } from "vitest";
import { RuleBuilder, CommonRules, RuleTestUtils } from "../rule-builder";

describe("RuleBuilder", () => {
  describe("Basic Rule Building", () => {
    it("should create a simple visibility rule", () => {
      const rules = RuleBuilder.when("maritalStatus")
        .equals("married")
        .show("spouseIncome")
        .build();

      expect(rules).toHaveLength(1);
      expect(rules[0]).toEqual({
        id: "rule_1",
        condition: {
          field: "maritalStatus",
          operator: "equals",
          value: "married",
        },
        actions: [
          {
            type: "show",
            target: "spouseIncome",
          },
        ],
        enabled: true,
      });
    });

    it("should create multiple rules with chaining", () => {
      const rules = RuleBuilder.when("income")
        .greaterThan(100000)
        .show("luxuryOptions")
        .when("age")
        .greaterThanOrEqual(18)
        .enable("adultContent")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition).toEqual({
        field: "income",
        operator: "greater_than",
        value: 100000,
      });
      expect(rules[1].condition).toEqual({
        field: "age",
        operator: "greater_than_or_equal",
        value: 18,
      });
    });
  });

  describe("Comparison Operators", () => {
    it("should handle all basic comparisons", () => {
      const rules = [
        RuleBuilder.when("value").equals(42).show("equal").build()[0],
        RuleBuilder.when("value").notEquals(42).show("notEqual").build()[0],
        RuleBuilder.when("value").greaterThan(42).show("greater").build()[0],
        RuleBuilder.when("value").lessThan(42).show("less").build()[0],
        RuleBuilder.when("value")
          .greaterThanOrEqual(42)
          .show("greaterEqual")
          .build()[0],
        RuleBuilder.when("value")
          .lessThanOrEqual(42)
          .show("lessEqual")
          .build()[0],
      ];

      const operators = rules.map((rule) => rule.condition.operator);
      expect(operators).toEqual([
        "equals",
        "not_equals",
        "greater_than",
        "less_than",
        "greater_than_or_equal",
        "less_than_or_equal",
      ]);
    });

    it("should handle string operations", () => {
      const rules = RuleBuilder.when("text")
        .contains("hello")
        .show("containsField")
        .when("text")
        .startsWith("prefix")
        .show("startsField")
        .when("text")
        .endsWith("suffix")
        .show("endsField")
        .build();

      expect(rules).toHaveLength(3);
      expect(rules[0].condition.operator).toBe("contains");
      expect(rules[1].condition.operator).toBe("starts_with");
      expect(rules[2].condition.operator).toBe("ends_with");
    });

    it("should handle array operations", () => {
      const rules = RuleBuilder.when("selection")
        .in(["option1", "option2"])
        .show("validSelection")
        .when("blacklist")
        .notIn(["banned1", "banned2"])
        .show("allowedValue")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition.operator).toBe("in");
      expect(rules[1].condition.operator).toBe("not_in");
    });

    it("should handle empty/not empty checks", () => {
      const rules = RuleBuilder.when("optional")
        .isEmpty()
        .hide("dependentField")
        .when("required")
        .isNotEmpty()
        .enable("submitButton")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition.operator).toBe("is_empty");
      expect(rules[1].condition.operator).toBe("is_not_empty");
    });

    it("should handle regex operations", () => {
      const rules = RuleBuilder.when("code")
        .matchesRegex("^[A-Z]{3}\\d{3}$")
        .show("validCodeField")
        .when("invalid")
        .notMatchesRegex("^valid.*")
        .show("errorMessage")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition.operator).toBe("matches_regex");
      expect(rules[1].condition.operator).toBe("not_matches_regex");
    });
  });

  describe("New Format Validation Operators", () => {
    it("should create email format validation rules", () => {
      const rules = RuleBuilder.when("email")
        .hasEmailFormat()
        .enable("subscribeButton")
        .build();

      expect(rules[0].condition).toEqual({
        field: "email",
        operator: "email_format",
        value: null,
      });
    });

    it("should create URL format validation rules", () => {
      const rules = RuleBuilder.when("website")
        .hasUrlFormat()
        .show("websitePreview")
        .build();

      expect(rules[0].condition.operator).toBe("url_format");
    });

    it("should create phone format validation rules", () => {
      const rules = RuleBuilder.when("phone")
        .hasPhoneFormat()
        .require("phoneConfirm")
        .build();

      expect(rules[0].condition.operator).toBe("phone_format");
    });

    it("should create credit card format validation rules", () => {
      const rules = RuleBuilder.when("cardNumber")
        .hasCreditCardFormat()
        .show("paymentFields")
        .build();

      expect(rules[0].condition.operator).toBe("credit_card_format");
    });

    it("should create UUID format validation rules", () => {
      const rules = RuleBuilder.when("id")
        .hasUuidFormat()
        .enable("advancedOptions")
        .build();

      expect(rules[0].condition.operator).toBe("uuid_format");
    });
  });

  describe("New Date Operators", () => {
    it("should create date comparison rules", () => {
      const rules = RuleBuilder.when("startDate")
        .beforeDate("2024-12-31")
        .show("earlyBirdDiscount")
        .when("endDate")
        .afterDate("2024-01-01")
        .show("futureEvent")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition.operator).toBe("before_date");
      expect(rules[1].condition.operator).toBe("after_date");
    });

    it("should create weekend/business day rules", () => {
      const rules = RuleBuilder.when("currentDate")
        .isWeekend()
        .show("weekendSpecial")
        .when("processDate")
        .isBusinessDay()
        .enable("processButton")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition.operator).toBe("is_weekend");
      expect(rules[1].condition.operator).toBe("is_business_day");
    });
  });

  describe("New Numeric Range Operators", () => {
    it("should create between/not between rules", () => {
      const rules = RuleBuilder.when("age")
        .between(18, 65)
        .show("eligibleFields")
        .when("score")
        .notBetween(0, 50)
        .show("passingGrade")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition).toEqual({
        field: "age",
        operator: "between",
        value: [18, 65],
      });
      expect(rules[1].condition.operator).toBe("not_between");
    });

    it("should create multiple/integer rules", () => {
      const rules = RuleBuilder.when("amount")
        .isMultipleOf(100)
        .show("roundAmountBonus")
        .when("value")
        .isInteger()
        .enable("integerOnlyField")
        .build();

      expect(rules).toHaveLength(2);
      expect(rules[0].condition.operator).toBe("multiple_of");
      expect(rules[1].condition.operator).toBe("is_integer");
    });
  });

  describe("New Length Operators", () => {
    it("should create length comparison rules", () => {
      const rules = RuleBuilder.when("password")
        .lengthGreaterThan(8)
        .show("strongPasswordIndicator")
        .when("username")
        .lengthLessThan(20)
        .enable("submitButton")
        .when("code")
        .lengthEquals(6)
        .show("verificationField")
        .build();

      expect(rules).toHaveLength(3);
      expect(rules[0].condition.operator).toBe("length_greater_than");
      expect(rules[1].condition.operator).toBe("length_less_than");
      expect(rules[2].condition.operator).toBe("length_equals");
    });
  });

  describe("Field References", () => {
    it("should create field reference comparisons", () => {
      const rules = RuleBuilder.when("password")
        .equalsField("confirmPassword")
        .enable("submitButton")
        .build();

      const condition = rules[0].condition as {
        field: string;
        operator: string;
        value: unknown;
      };
      expect(condition.value).toEqual({
        type: "field",
        fieldName: "confirmPassword",
        property: undefined,
      });
    });

    it("should create context reference comparisons", () => {
      const rules = RuleBuilder.when("userLevel")
        .equalsContext("user.role")
        .show("adminPanel")
        .build();

      const condition = rules[0].condition as {
        field: string;
        operator: string;
        value: unknown;
      };
      expect(condition.value).toEqual({
        type: "context",
        key: "user.role",
      });
    });

    it("should create function reference comparisons", () => {
      const rules = RuleBuilder.when("result")
        .equalsFunction("calculateTotal", 100, 0.1)
        .show("discountApplied")
        .build();

      const condition = rules[0].condition as {
        field: string;
        operator: string;
        value: unknown;
      };
      expect(condition.value).toEqual({
        type: "function",
        name: "calculateTotal",
        args: [100, 0.1],
      });
    });
  });

  describe("Action Types", () => {
    it("should create different action types", () => {
      const rules = RuleBuilder.when("condition")
        .equals(true)
        .show("showField")
        .when("condition")
        .equals(true)
        .hide("hideField")
        .when("condition")
        .equals(true)
        .require("requiredField")
        .when("condition")
        .equals(true)
        .makeOptional("optionalField")
        .when("condition")
        .equals(true)
        .enable("enabledField")
        .when("condition")
        .equals(true)
        .disable("disabledField")
        .build();

      const actionTypes = rules.map((rule) => rule.actions[0].type);
      expect(actionTypes).toEqual([
        "show",
        "hide",
        "set_value",
        "set_value",
        "enable",
        "disable",
      ]);

      // Check that show/hide actions have correct target
      expect(rules[0].actions[0].target).toBe("showField");
      expect(rules[1].actions[0].target).toBe("hideField");

      // Check that require/optional actions have params
      expect(rules[2].actions[0].params).toEqual({ required: true });
      expect(rules[3].actions[0].params).toEqual({ required: false });
    });
  });
});

describe("CommonRules", () => {
  describe("Existing Business Rules", () => {
    it("should create spouse fields when married rules", () => {
      const rules = CommonRules.spouseFieldsWhenMarried([
        "spouseName",
        "spouseIncome",
      ]);

      expect(rules).toHaveLength(2);
      rules.forEach((rule) => {
        expect(rule.condition).toEqual({
          field: "maritalStatus",
          operator: "equals",
          value: "married",
        });
        expect(rule.actions[0].type).toBe("show");
      });

      expect(rules[0].actions[0].target).toBe("spouseName");
      expect(rules[1].actions[0].target).toBe("spouseIncome");
    });

    it("should create phone requirement rule", () => {
      const rule = CommonRules.requirePhoneForPhoneContact();

      expect(rule.condition).toEqual({
        field: "contactPreference",
        operator: "equals",
        value: "phone",
      });
      expect(rule.actions[0]).toEqual({
        type: "set_value",
        target: "phone",
        params: { required: true },
      });
    });

    it("should create high earner rules", () => {
      const rules = CommonRules.additionalIncomeForHighEarners(75000);

      expect(rules).toHaveLength(2);
      rules.forEach((rule) => {
        expect(rule.condition).toEqual({
          field: "annualIncome",
          operator: "greater_than",
          value: 75000,
        });
        expect(rule.actions[0].type).toBe("show");
      });
    });
  });

  describe("New Business Rules", () => {
    it("should create email validation rule", () => {
      const rule = CommonRules.requireValidEmail("emailField");

      expect(rule.condition).toEqual({
        field: "emailField",
        operator: "email_format",
        value: null,
      });
      expect(rule.actions[0].type).toBe("show");
    });

    it("should create weekend promotion rule", () => {
      const rule = CommonRules.weekendOnlyPromotion("weekendDeal");

      expect(rule.condition).toEqual({
        field: "currentDate",
        operator: "is_weekend",
        value: null,
      });
      expect(rule.actions[0].target).toBe("weekendDeal");
    });

    it("should create adult-only fields rule", () => {
      const rules = CommonRules.adultOnlyFields("age", [
        "drinkPreference",
        "smokingStatus",
      ]);

      expect(rules).toHaveLength(2);
      rules.forEach((rule) => {
        expect(rule.condition).toEqual({
          field: "age",
          operator: "greater_than_or_equal",
          value: 18,
        });
      });
    });

    it("should create password strength rule", () => {
      const rule = CommonRules.strongPasswordRequired("password");

      expect(rule.condition).toEqual({
        field: "password",
        operator: "length_greater_than",
        value: 8,
      });
      expect(rule.actions[0].type).toBe("set_value");
    });

    it("should create credit card validation rule", () => {
      const rule = CommonRules.creditCardValidation("cardNumber");

      expect(rule.condition).toEqual({
        field: "cardNumber",
        operator: "credit_card_format",
        value: null,
      });
      expect(rule.actions[0]).toEqual({
        type: "enable",
        target: "submitButton",
      });
    });
  });

  describe("Utility Functions", () => {
    it("should create basic visibility rules", () => {
      const rule = CommonRules.showWhen("targetField", "sourceField", "value");

      expect(rule.condition).toEqual({
        field: "sourceField",
        operator: "equals",
        value: "value",
      });
      expect(rule.actions[0]).toEqual({
        type: "show",
        target: "targetField",
      });
    });

    it("should create requirement rules", () => {
      const rule = CommonRules.requireWhen(
        "targetField",
        "sourceField",
        "value"
      );

      expect(rule.actions[0].type).toBe("set_value");
      expect(rule.actions[0].params).toEqual({ required: true });
    });

    it("should create multiple field rules", () => {
      const rules = CommonRules.showFieldsWhen(
        ["field1", "field2"],
        "condition",
        "value"
      );

      expect(rules).toHaveLength(2);
      expect(rules[0].actions[0].target).toBe("field1");
      expect(rules[1].actions[0].target).toBe("field2");
    });
  });
});

describe("RuleTestUtils", () => {
  it("should create test visibility rule", () => {
    const rule = RuleTestUtils.createVisibilityRule(
      "test-rule",
      "targetField",
      "sourceField",
      "testValue"
    );

    expect(rule).toEqual({
      id: "test-rule",
      condition: {
        field: "sourceField",
        operator: "equals",
        value: "testValue",
      },
      actions: [
        {
          type: "show",
          target: "targetField",
        },
      ],
      enabled: true,
    });
  });

  it("should create test rule set", () => {
    const rules = RuleTestUtils.createTestRules();

    expect(rules.length).toBeGreaterThan(0);
    rules.forEach((rule) => {
      expect(rule).toHaveProperty("id");
      expect(rule).toHaveProperty("condition");
      expect(rule).toHaveProperty("actions");
    });
  });

  it("should validate rule definitions", () => {
    const validRule = {
      id: "valid-rule",
      condition: {
        field: "test",
        operator: "equals" as const,
        value: "value",
      },
      actions: [
        {
          type: "show" as const,
          target: "targetField",
        },
      ],
      enabled: true,
    };

    const result = RuleTestUtils.validateRule(validRule);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect invalid rule definitions", () => {
    const invalidRule = {
      // Missing id and actions
      condition: {
        field: "test",
        operator: "equals" as const,
        value: "value",
      },
      enabled: true,
    };

    // @ts-expect-error - intentionally invalid rule for testing
    const result = RuleTestUtils.validateRule(invalidRule);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Rule must have an ID");
    expect(result.errors).toContain("Rule must have actions");
  });
});
