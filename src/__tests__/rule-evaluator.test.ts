import { describe, expect, test } from "vitest";
import {
  evaluateBaseCondition,
  evaluateComparison,
  evaluateComplexCondition,
  evaluateRuleCondition,
  resolveDynamicValue,
} from "../utils/rule-evaluation";
import type {
  BaseConditionType,
  ComplexConditionType,
  RuleContextType,
} from "../schemas/rule.schema";

const createTestContext = (
  formData: Record<string, unknown> = {}
): RuleContextType => ({
  formData,
  user: { id: "123", role: "admin", name: "John Doe" },
  permissions: ["read", "write", "admin"],
  metadata: { theme: "dark", language: "en" },
  timestamp: Date.now(),
  custom: { feature_flags: { new_ui: true } },
});

describe("evaluateComparison", () => {
  test("equals operator", () => {
    expect(evaluateComparison("hello", "equals", "hello")).toBe(true);
    expect(evaluateComparison("hello", "equals", "world")).toBe(false);
    expect(evaluateComparison(42, "equals", 42)).toBe(true);
    expect(evaluateComparison(42, "equals", 43)).toBe(false);
    expect(evaluateComparison(true, "equals", true)).toBe(true);
    expect(evaluateComparison(true, "equals", false)).toBe(false);
  });

  test("not_equals operator", () => {
    expect(evaluateComparison("hello", "not_equals", "world")).toBe(true);
    expect(evaluateComparison("hello", "not_equals", "hello")).toBe(false);
  });

  test("numeric comparison operators", () => {
    expect(evaluateComparison(10, "greater_than", 5)).toBe(true);
    expect(evaluateComparison(5, "greater_than", 10)).toBe(false);
    expect(evaluateComparison(10, "greater_than_or_equal", 10)).toBe(true);
    expect(evaluateComparison(10, "greater_than_or_equal", 11)).toBe(false);
    expect(evaluateComparison(5, "less_than", 10)).toBe(true);
    expect(evaluateComparison(10, "less_than", 5)).toBe(false);
    expect(evaluateComparison(10, "less_than_or_equal", 10)).toBe(true);
    expect(evaluateComparison(11, "less_than_or_equal", 10)).toBe(false);
  });

  test("string operators", () => {
    expect(evaluateComparison("hello world", "contains", "world")).toBe(true);
    expect(evaluateComparison("hello world", "contains", "xyz")).toBe(false);
    expect(evaluateComparison("hello world", "not_contains", "xyz")).toBe(true);
    expect(evaluateComparison("hello world", "not_contains", "world")).toBe(
      false
    );
    expect(evaluateComparison("hello world", "starts_with", "hello")).toBe(
      true
    );
    expect(evaluateComparison("hello world", "starts_with", "world")).toBe(
      false
    );
    expect(evaluateComparison("hello world", "ends_with", "world")).toBe(true);
    expect(evaluateComparison("hello world", "ends_with", "hello")).toBe(false);
  });

  test("array operators", () => {
    expect(evaluateComparison(["a", "b", "c"], "contains", "b")).toBe(true);
    expect(evaluateComparison(["a", "b", "c"], "contains", "d")).toBe(false);
    expect(evaluateComparison("b", "in", ["a", "b", "c"])).toBe(true);
    expect(evaluateComparison("d", "in", ["a", "b", "c"])).toBe(false);
    expect(evaluateComparison("d", "not_in", ["a", "b", "c"])).toBe(true);
    expect(evaluateComparison("b", "not_in", ["a", "b", "c"])).toBe(false);
  });

  test("empty checks", () => {
    expect(evaluateComparison("", "is_empty", null)).toBe(true);
    expect(evaluateComparison("hello", "is_empty", null)).toBe(false);
    expect(evaluateComparison([], "is_empty", null)).toBe(true);
    expect(evaluateComparison([1, 2], "is_empty", null)).toBe(false);
    expect(evaluateComparison({}, "is_empty", null)).toBe(true);
    expect(evaluateComparison({ a: 1 }, "is_empty", null)).toBe(false);
    expect(evaluateComparison(null, "is_empty", null)).toBe(true);
    expect(evaluateComparison(undefined, "is_empty", null)).toBe(true);

    expect(evaluateComparison("hello", "is_not_empty", null)).toBe(true);
    expect(evaluateComparison("", "is_not_empty", null)).toBe(false);
  });

  test("regex operators", () => {
    expect(evaluateComparison("hello123", "matches_regex", "\\d+")).toBe(true);
    expect(evaluateComparison("hello", "matches_regex", "\\d+")).toBe(false);
    expect(evaluateComparison("hello", "not_matches_regex", "\\d+")).toBe(true);
    expect(evaluateComparison("hello123", "not_matches_regex", "\\d+")).toBe(
      false
    );

    // Test invalid regex
    expect(evaluateComparison("hello", "matches_regex", "[invalid")).toBe(
      false
    );
  });
});

describe("resolveDynamicValue", () => {
  const context = createTestContext({
    userName: "Alice",
    userAge: 25,
    tags: ["admin", "user"],
    profile: { role: "manager", department: "IT" },
  });

  test("resolves primitive values", () => {
    expect(resolveDynamicValue("hello", context)).toBe("hello");
    expect(resolveDynamicValue(42, context)).toBe(42);
    expect(resolveDynamicValue(true, context)).toBe(true);
    expect(resolveDynamicValue(null, context)).toBe(null);
    expect(resolveDynamicValue(["a", "b"], context)).toEqual(["a", "b"]);
  });

  test("resolves field references", () => {
    expect(
      resolveDynamicValue(
        {
          type: "field",
          fieldName: "userName",
        },
        context
      )
    ).toBe("Alice");

    expect(
      resolveDynamicValue(
        {
          type: "field",
          fieldName: "userAge",
        },
        context
      )
    ).toBe(25);

    expect(
      resolveDynamicValue(
        {
          type: "field",
          fieldName: "nonexistent",
        },
        context
      )
    ).toBeUndefined();
  });

  test("resolves field references with nested properties", () => {
    expect(
      resolveDynamicValue(
        {
          type: "field",
          fieldName: "profile",
          property: "role",
        },
        context
      )
    ).toBe("manager");

    expect(
      resolveDynamicValue(
        {
          type: "field",
          fieldName: "profile",
          property: "department",
        },
        context
      )
    ).toBe("IT");

    expect(
      resolveDynamicValue(
        {
          type: "field",
          fieldName: "profile",
          property: "nonexistent",
        },
        context
      )
    ).toBeUndefined();
  });

  test("resolves context references", () => {
    expect(
      resolveDynamicValue(
        {
          type: "context",
          key: "user.role",
        },
        context
      )
    ).toBe("admin");

    expect(
      resolveDynamicValue(
        {
          type: "context",
          key: "permissions",
        },
        context
      )
    ).toEqual(["read", "write", "admin"]);

    expect(
      resolveDynamicValue(
        {
          type: "context",
          key: "custom.feature_flags.new_ui",
        },
        context
      )
    ).toBe(true);
  });

  test("resolves function references", () => {
    const customFunctions = {
      add: (a: unknown, b: unknown) => (a as number) + (b as number),
      getCurrentDate: () => "2024-01-01",
      concat: (...args: unknown[]) => (args as string[]).join(""),
    };

    expect(
      resolveDynamicValue(
        {
          type: "function",
          name: "add",
          args: [5, 3],
        },
        context,
        customFunctions
      )
    ).toBe(8);

    expect(
      resolveDynamicValue(
        {
          type: "function",
          name: "getCurrentDate",
        },
        context,
        customFunctions
      )
    ).toBe("2024-01-01");

    expect(
      resolveDynamicValue(
        {
          type: "function",
          name: "concat",
          args: ["hello", " ", "world"],
        },
        context,
        customFunctions
      )
    ).toBe("hello world");

    expect(() =>
      resolveDynamicValue(
        {
          type: "function",
          name: "unknown",
        },
        context,
        customFunctions
      )
    ).toThrow("Unknown function: unknown");
  });
});

describe("evaluateBaseCondition", () => {
  test("evaluates simple field conditions", () => {
    const context = createTestContext({
      status: "active",
      count: 10,
      isEnabled: true,
    });

    const condition1: BaseConditionType = {
      field: "status",
      operator: "equals",
      value: "active",
    };
    expect(evaluateBaseCondition(condition1, context)).toBe(true);

    const condition2: BaseConditionType = {
      field: "count",
      operator: "greater_than",
      value: 5,
    };
    expect(evaluateBaseCondition(condition2, context)).toBe(true);

    const condition3: BaseConditionType = {
      field: "isEnabled",
      operator: "equals",
      value: false,
    };
    expect(evaluateBaseCondition(condition3, context)).toBe(false);
  });

  test("evaluates conditions with dynamic values", () => {
    const context = createTestContext({
      userRole: "admin",
      threshold: 100,
    });

    const condition: BaseConditionType = {
      field: "userRole",
      operator: "equals",
      value: {
        type: "context",
        key: "user.role",
      },
    };
    expect(evaluateBaseCondition(condition, context)).toBe(true);
  });

  test("applies transform functions", () => {
    const context = createTestContext({
      email: "JOHN@EXAMPLE.COM",
    });

    const transformFunctions = {
      toLowerCase: (value: unknown) =>
        typeof value === "string" ? value.toLowerCase() : value,
    };

    const condition: BaseConditionType = {
      field: "email",
      operator: "equals",
      value: "john@example.com",
      transform: "toLowerCase",
    };

    expect(
      evaluateBaseCondition(condition, context, {}, transformFunctions)
    ).toBe(true);
  });
});

describe("evaluateComplexCondition", () => {
  test("evaluates AND conditions", () => {
    const context = createTestContext({
      status: "active",
      count: 10,
      isVerified: true,
    });

    const condition: ComplexConditionType = {
      operator: "and",
      conditions: [
        { field: "status", operator: "equals", value: "active" },
        { field: "count", operator: "greater_than", value: 5 },
        { field: "isVerified", operator: "equals", value: true },
      ],
    };

    expect(evaluateComplexCondition(condition, context)).toBe(true);

    // Change one condition to make it false
    const falseCondition: ComplexConditionType = {
      operator: "and",
      conditions: [
        { field: "status", operator: "equals", value: "active" },
        { field: "count", operator: "greater_than", value: 15 }, // This will be false
        { field: "isVerified", operator: "equals", value: true },
      ],
    };

    expect(evaluateComplexCondition(falseCondition, context)).toBe(false);
  });

  test("evaluates OR conditions", () => {
    const context = createTestContext({
      status: "inactive",
      priority: "high",
      isUrgent: false,
    });

    const condition: ComplexConditionType = {
      operator: "or",
      conditions: [
        { field: "status", operator: "equals", value: "active" }, // false
        { field: "priority", operator: "equals", value: "high" }, // true
        { field: "isUrgent", operator: "equals", value: true }, // false
      ],
    };

    expect(evaluateComplexCondition(condition, context)).toBe(true);

    // All conditions false
    const allFalseCondition: ComplexConditionType = {
      operator: "or",
      conditions: [
        { field: "status", operator: "equals", value: "active" },
        { field: "priority", operator: "equals", value: "low" },
        { field: "isUrgent", operator: "equals", value: true },
      ],
    };

    expect(evaluateComplexCondition(allFalseCondition, context)).toBe(false);
  });

  test("evaluates NOT conditions", () => {
    const context = createTestContext({
      status: "inactive",
    });

    const condition: ComplexConditionType = {
      operator: "not",
      conditions: [{ field: "status", operator: "equals", value: "active" }],
    };

    expect(evaluateComplexCondition(condition, context)).toBe(true);
  });

  test("evaluates nested complex conditions", () => {
    const context = createTestContext({
      userType: "premium",
      accountAge: 365,
      isActive: true,
      region: "US",
    });

    const nestedCondition: ComplexConditionType = {
      operator: "and",
      conditions: [
        { field: "isActive", operator: "equals", value: true },
        {
          operator: "or",
          conditions: [
            { field: "userType", operator: "equals", value: "premium" },
            {
              operator: "and",
              conditions: [
                { field: "accountAge", operator: "greater_than", value: 300 },
                { field: "region", operator: "equals", value: "US" },
              ],
            },
          ],
        },
      ],
    };

    expect(evaluateComplexCondition(nestedCondition, context)).toBe(true);
  });
});

describe("evaluateRuleCondition", () => {
  test("evaluates base conditions", () => {
    const context = createTestContext({
      status: "active",
    });

    const condition: BaseConditionType = {
      field: "status",
      operator: "equals",
      value: "active",
    };

    expect(evaluateRuleCondition(condition, context)).toBe(true);
  });

  test("evaluates complex conditions", () => {
    const context = createTestContext({
      status: "active",
      count: 10,
    });

    const condition: ComplexConditionType = {
      operator: "and",
      conditions: [
        { field: "status", operator: "equals", value: "active" },
        { field: "count", operator: "greater_than", value: 5 },
      ],
    };

    expect(evaluateRuleCondition(condition, context)).toBe(true);
  });

  test("handles errors gracefully", () => {
    const context = createTestContext({});

    const invalidCondition = {
      field: "nonexistent",
      operator: "invalid_operator" as any,
      value: "test",
    };

    // Should return false for invalid conditions instead of throwing
    expect(evaluateRuleCondition(invalidCondition, context)).toBe(false);
  });
});
