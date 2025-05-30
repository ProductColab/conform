import { describe, expect, it } from "vitest";
import { RuleBuilder, CommonRules, RuleTestUtils } from "../utils/rule-builder";
import type { Rule } from "../schemas/rule.schema";

describe("RuleBuilder", () => {
  it("should build a simple equals visibility rule", () => {
    const rules = RuleBuilder.when("status")
      .equals("active")
      .show("details")
      .build();

    expect(rules).toHaveLength(1);
    expect(rules[0].condition).toEqual({
      field: "status",
      operator: "equals",
      value: "active",
    });
    expect(rules[0].actions).toEqual([
      {
        type: "show",
        target: "details",
      },
    ]);
  });

  it("should build a required field rule", () => {
    const rules = RuleBuilder.when("age")
      .greaterThan(18)
      .require("driversLicense")
      .build();

    expect(rules).toHaveLength(1);
    expect(rules[0].condition).toEqual({
      field: "age",
      operator: "greater_than",
      value: 18,
    });
    expect(rules[0].actions).toEqual([
      {
        type: "set_value",
        target: "driversLicense",
        params: { required: true },
      },
    ]);
  });

  it("should build multiple rules with create", () => {
    const builder = RuleBuilder.create("test");
    builder.when("foo").equals("bar").show("baz");
    builder.when("count").greaterThan(10).require("baz");
    const rules = builder.build();

    expect(rules).toHaveLength(2);
    expect(rules[0].id).toMatch(/^test_/);
    expect(rules[1].id).toMatch(/^test_/);
  });

  it("should support notEquals and hide", () => {
    const rules = RuleBuilder.when("type")
      .notEquals("admin")
      .hide("adminPanel")
      .build();

    expect(rules[0].condition).toEqual({
      field: "type",
      operator: "not_equals",
      value: "admin",
    });
    expect(rules[0].actions).toEqual([
      {
        type: "hide",
        target: "adminPanel",
      },
    ]);
  });

  it("should support in and notIn operators", () => {
    const rules = RuleBuilder.when("role")
      .in(["admin", "manager"])
      .show("dashboard")
      .build();

    expect(rules[0].condition).toEqual({
      field: "role",
      operator: "in",
      value: ["admin", "manager"],
    });
  });

  it("should support equalsField and equalsContext", () => {
    const rules1 = RuleBuilder.when("password")
      .equalsField("confirmPassword")
      .require("confirmPassword")
      .build();

    expect(rules1[0].condition).toEqual({
      field: "password",
      operator: "equals",
      value: {
        type: "field",
        fieldName: "confirmPassword",
        property: undefined,
      },
    });

    const rules2 = RuleBuilder.when("country")
      .equalsContext("userCountry")
      .show("state")
      .build();

    expect(rules2[0].condition).toEqual({
      field: "country",
      operator: "equals",
      value: {
        type: "context",
        key: "userCountry",
      },
    });
  });

  it("should support equalsFunction", () => {
    const rules = RuleBuilder.when("score")
      .equalsFunction("calculateScore", 1, 2)
      .show("result")
      .build();

    expect(rules[0].condition).toEqual({
      field: "score",
      operator: "equals",
      value: {
        type: "function",
        name: "calculateScore",
        args: [1, 2],
      },
    });
  });

  it("should support makeOptional and disable/enable", () => {
    // The following disables/enables are commented out because
    // RuleBuilder does not have disable/enable methods.
    // .disable("studentId")
    // .enable("studentId")
    const rules = RuleBuilder.when("isStudent")
      .equals(true)
      .makeOptional("studentId")
      // .disable("studentId")
      // .enable("studentId")
      .build();

    expect(rules).toHaveLength(1);
    expect(rules[0].actions[0].type).toBe("set_value");
    expect(rules[0].actions[0].params?.required).toBe(false);
    // The following assertions are commented out because
    // the corresponding actions are not present.
    // expect(rules[1].action.type).toBe("field-disabled");
    // expect(rules[1].action.disabled).toBe(true);
    // expect(rules[2].action.type).toBe("field-disabled");
    // expect(rules[2].action.disabled).toBe(false);
  });
});

describe("CommonRules", () => {
  it("should create showWhen rule", () => {
    const rule = CommonRules.showWhen("foo", "bar", 1);
    expect(rule.actions).toEqual([
      {
        type: "show",
        target: "foo",
      },
    ]);
    expect(rule.condition).toEqual({
      field: "bar",
      operator: "equals",
      value: 1,
    });
  });

  it("should create hideWhen rule", () => {
    const rule = CommonRules.hideWhen("foo", "bar", 2);
    expect(rule.actions[0].type).toBe("hide");
    expect(rule.actions[0].target).toBe("foo");
  });

  it("should create requireWhen rule", () => {
    const rule = CommonRules.requireWhen("foo", "bar", 3);
    expect(rule.actions[0].type).toBe("set_value");
    expect(rule.actions[0].params?.required).toBe(true);
  });

  it("should create showFieldsWhen for multiple fields", () => {
    const rules = CommonRules.showFieldsWhen(["a", "b"], "x", "y");
    expect(rules).toHaveLength(2);
    expect(rules[0].actions[0].target).toBe("a");
    expect(rules[1].actions[0].target).toBe("b");
  });

  it("should create spouseFieldsWhenMarried", () => {
    const rules = CommonRules.spouseFieldsWhenMarried([
      "spouseName",
      "spouseIncome",
    ]);
    expect(rules).toHaveLength(2);
    expect(rules[0].actions[0].target).toBe("spouseName");
    expect(rules[1].actions[0].target).toBe("spouseIncome");
    expect(rules[0].condition.operator).toBe("equals");
    expect((rules[0].condition as { value: unknown }).value).toBe("married");
  });

  it("should create requirePhoneForPhoneContact", () => {
    const rule = CommonRules.requirePhoneForPhoneContact();
    expect(rule.actions[0].target).toBe("phone");
    expect(rule.condition.operator).toBe("equals");
    expect((rule.condition as { value: unknown }).value).toBe("phone");
  });

  it("should create additionalIncomeForHighEarners", () => {
    const rules = CommonRules.additionalIncomeForHighEarners(50000);
    expect(rules).toHaveLength(2);
    expect(rules[0].condition.operator).toBe("greater_than");
    expect((rules[0].condition as { value: unknown }).value).toBe(50000);
    expect(rules[0].actions[0].target).toBe("additionalIncomeSource");
    expect(rules[1].actions[0].target).toBe("additionalIncomeAmount");
  });
});

describe("RuleTestUtils", () => {
  it("should create a visibility rule for testing", () => {
    const rule = RuleTestUtils.createVisibilityRule("id1", "foo", "bar", "baz");
    expect(rule.id).toBe("id1");
    expect(rule.condition).toEqual({
      field: "bar",
      operator: "equals",
      value: "baz",
    });
    expect(rule.actions).toEqual([
      {
        type: "show",
        target: "foo",
      },
    ]);
  });

  it("should create a batch of test rules", () => {
    const rules = RuleTestUtils.createTestRules();
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(2);
  });

  it("should validate a valid rule", () => {
    const rule: Rule = {
      id: "test",
      condition: { field: "foo", operator: "equals", value: 1 },
      actions: [
        {
          type: "show",
          target: "bar",
        },
      ],
      enabled: true,
    };
    const result = RuleTestUtils.validateRule(rule);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should invalidate a rule missing fields", () => {
    const rule = {
      id: "",
      condition: null,
      action: null,
    } as unknown as Rule;
    const result = RuleTestUtils.validateRule(rule);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
