import { describe, expect, test } from "vitest";
import { RuleBuilders } from "../schemas/rule.schema";
import { evaluateRuleCondition } from "../utils/rule-evaluation";
import type {
  BaseCondition,
  RuleContext,
  ComplexCondition,
} from "../schemas/rule.schema";

const createTestContext = (
  formData: Record<string, unknown> = {}
): RuleContext => ({
  formData,
  user: { id: "123", role: "admin", name: "John Doe" },
  permissions: ["read", "write", "admin"],
  metadata: { theme: "dark", language: "en" },
  timestamp: Date.now(),
  custom: { feature_flags: { new_ui: true } },
});

describe("Rules Examples - Migration from dependsOn/showWhen", () => {
  test("Simple field dependency - OLD vs NEW", () => {
    // OLD WAY (deprecated):
    // dependsOn: "accountType"
    // showWhen: "premium"

    // NEW WAY:
    const rule = RuleBuilders.showWhenFieldEquals(
      "accountType",
      "premiumFeatures",
      "premium"
    );

    const context1 = createTestContext({ accountType: "premium" });
    const context2 = createTestContext({ accountType: "basic" });

    expect(evaluateRuleCondition(rule.condition, context1)).toBe(true);
    expect(evaluateRuleCondition(rule.condition, context2)).toBe(false);

    // Verify the action
    expect(rule.actions[0]).toEqual({
      type: "show",
      target: "premiumFeatures",
    });
  });

  test("Multiple field dependencies with AND logic", () => {
    // Show billing fields only if user is premium AND has billing enabled
    const conditions: BaseCondition[] = [
      { field: "accountType", operator: "equals", value: "premium" },
      { field: "billingEnabled", operator: "equals", value: true },
    ];

    const rule = RuleBuilders.whenAllConditions(conditions, [
      { type: "show", target: "billingAddress" },
      { type: "show", target: "paymentMethod" },
    ]);

    const context1 = createTestContext({
      accountType: "premium",
      billingEnabled: true,
    });
    const context2 = createTestContext({
      accountType: "premium",
      billingEnabled: false,
    });
    const context3 = createTestContext({
      accountType: "basic",
      billingEnabled: true,
    });

    expect(evaluateRuleCondition(rule.condition, context1)).toBe(true);
    expect(evaluateRuleCondition(rule.condition, context2)).toBe(false);
    expect(evaluateRuleCondition(rule.condition, context3)).toBe(false);
  });

  test("Multiple field dependencies with OR logic", () => {
    // Show contact field if user is VIP OR has high priority OR is admin
    const conditions: BaseCondition[] = [
      { field: "userTier", operator: "equals", value: "vip" },
      { field: "priority", operator: "equals", value: "high" },
      { field: "isAdmin", operator: "equals", value: true },
    ];

    const rule = RuleBuilders.whenAnyCondition(conditions, [
      { type: "show", target: "directContactLine" },
    ]);

    const vipContext = createTestContext({
      userTier: "vip",
      priority: "normal",
      isAdmin: false,
    });
    const highPriorityContext = createTestContext({
      userTier: "regular",
      priority: "high",
      isAdmin: false,
    });
    const adminContext = createTestContext({
      userTier: "regular",
      priority: "normal",
      isAdmin: true,
    });
    const regularContext = createTestContext({
      userTier: "regular",
      priority: "normal",
      isAdmin: false,
    });

    expect(evaluateRuleCondition(rule.condition, vipContext)).toBe(true);
    expect(evaluateRuleCondition(rule.condition, highPriorityContext)).toBe(
      true
    );
    expect(evaluateRuleCondition(rule.condition, adminContext)).toBe(true);
    expect(evaluateRuleCondition(rule.condition, regularContext)).toBe(false);
  });

  test("Field dependency on user context", () => {
    // Show admin panel if user has admin permission
    const rule = {
      condition: {
        field: "userPermissions", // This should look for a field in form data, not context
        operator: "contains" as const,
        value: "admin",
      },
      actions: [
        { type: "show" as const, target: "adminPanel" },
        { type: "enable" as const, target: "dangerousActions" },
      ],
    };

    const adminContext = createTestContext({
      userPermissions: ["read", "write", "admin"],
      contextPermissions: ["read", "write", "admin"], // This will reference context.permissions
    });
    const userWithoutAdminContext = createTestContext({
      userPermissions: ["read", "write"],
      contextPermissions: ["read", "write"],
    });

    expect(evaluateRuleCondition(rule.condition, adminContext)).toBe(true);
    expect(evaluateRuleCondition(rule.condition, userWithoutAdminContext)).toBe(
      false
    );
  });

  test("Numeric comparisons and ranges", () => {
    // Show bulk discount field if quantity > 10
    const rule = {
      condition: {
        field: "quantity",
        operator: "greater_than" as const,
        value: 10,
      },
      actions: [{ type: "show" as const, target: "bulkDiscount" }],
    };

    const highQuantityContext = createTestContext({ quantity: 15 });
    const lowQuantityContext = createTestContext({ quantity: 5 });

    expect(evaluateRuleCondition(rule.condition, highQuantityContext)).toBe(
      true
    );
    expect(evaluateRuleCondition(rule.condition, lowQuantityContext)).toBe(
      false
    );
  });

  test("String pattern matching", () => {
    // Show international fields if country code is not US
    const rule = {
      condition: {
        field: "countryCode",
        operator: "not_equals" as const,
        value: "US",
      },
      actions: [{ type: "show" as const, target: "internationalPhone" }],
    };

    const usContext = createTestContext({ countryCode: "US" });
    const canadaContext = createTestContext({ countryCode: "CA" });
    const ukContext = createTestContext({ countryCode: "UK" });

    expect(evaluateRuleCondition(rule.condition, usContext)).toBe(false);
    expect(evaluateRuleCondition(rule.condition, canadaContext)).toBe(true);
    expect(evaluateRuleCondition(rule.condition, ukContext)).toBe(true);
  });

  test("Array membership checks", () => {
    // Show team features if user is in specific teams
    const rule = {
      condition: {
        field: "teamId",
        operator: "in" as const,
        value: ["engineering", "design", "product"],
      },
      actions: [{ type: "show" as const, target: "teamFeatures" }],
    };

    const engineeringContext = createTestContext({ teamId: "engineering" });
    const salesContext = createTestContext({ teamId: "sales" });

    expect(evaluateRuleCondition(rule.condition, engineeringContext)).toBe(
      true
    );
    expect(evaluateRuleCondition(rule.condition, salesContext)).toBe(false);
  });

  test("Complex nested conditions", () => {
    // Show enterprise features if:
    // (accountType is enterprise OR userTier is platinum) AND
    // (user has admin role OR user has admin permission)
    const rule = {
      condition: {
        operator: "and" as const,
        conditions: [
          {
            operator: "or" as const,
            conditions: [
              {
                field: "accountType",
                operator: "equals" as const,
                value: "enterprise",
              } satisfies BaseCondition,
              {
                field: "userTier",
                operator: "equals" as const,
                value: "platinum",
              } satisfies BaseCondition,
            ],
          } satisfies ComplexCondition,
          {
            operator: "or" as const,
            conditions: [
              {
                field: "userRole",
                operator: "equals" as const,
                value: "admin",
              } satisfies BaseCondition,
              {
                field: "userPermissions",
                operator: "contains" as const,
                value: "admin",
              } satisfies BaseCondition,
            ],
          } satisfies ComplexCondition,
        ],
      } satisfies ComplexCondition,
      actions: [{ type: "show" as const, target: "enterpriseFeatures" }],
    };

    const enterpriseAdminContext = createTestContext({
      accountType: "enterprise",
      userRole: "admin",
      userPermissions: ["read", "write", "admin"],
    });
    const platinumUserContext = createTestContext({
      accountType: "basic",
      userTier: "platinum",
      userRole: "user",
      userPermissions: ["read", "write", "admin"], // Has admin permission
    });
    const basicUserContext = createTestContext({
      accountType: "basic",
      userTier: "silver",
      userRole: "user",
      userPermissions: ["read", "write"], // No admin permission
    });

    expect(evaluateRuleCondition(rule.condition, enterpriseAdminContext)).toBe(
      true
    );
    expect(evaluateRuleCondition(rule.condition, platinumUserContext)).toBe(
      true
    );
    expect(evaluateRuleCondition(rule.condition, basicUserContext)).toBe(false);
  });
});

describe("Rules Examples - Advanced Action Types", () => {
  test("Setting field values based on conditions", () => {
    // Auto-set shipping method based on order value
    const rule = {
      condition: {
        field: "orderValue",
        operator: "greater_than" as const,
        value: 100,
      },
      actions: [
        {
          type: "set_value" as const,
          target: "shippingMethod",
          value: "free_shipping",
        },
        {
          type: "show" as const,
          target: "freeShippingNotice",
        },
      ],
    };

    const highValueContext = createTestContext({ orderValue: 150 });
    const lowValueContext = createTestContext({ orderValue: 50 });

    expect(evaluateRuleCondition(rule.condition, highValueContext)).toBe(true);
    expect(evaluateRuleCondition(rule.condition, lowValueContext)).toBe(false);

    // Actions would be executed by the rule engine
    expect(rule.actions).toEqual([
      { type: "set_value", target: "shippingMethod", value: "free_shipping" },
      { type: "show", target: "freeShippingNotice" },
    ]);
  });

  test("Conditional validation and warnings", () => {
    // Show warning if password is weak
    const rule = {
      condition: {
        field: "password",
        operator: "not_matches_regex" as const,
        value:
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      },
      actions: [
        {
          type: "show_warning" as const,
          value:
            "Password should contain at least 8 characters with uppercase, lowercase, number and special character",
          target: "password",
        },
      ],
    };

    const weakPasswordContext = createTestContext({ password: "123" });
    const strongPasswordContext = createTestContext({
      password: "StrongP@ssw0rd!",
    });

    expect(evaluateRuleCondition(rule.condition, weakPasswordContext)).toBe(
      true
    );
    expect(evaluateRuleCondition(rule.condition, strongPasswordContext)).toBe(
      false
    );
  });
});
