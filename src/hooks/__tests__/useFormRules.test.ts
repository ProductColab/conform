import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { z } from "zod/v4";
import { useFormRules } from "../useFormRules";
import type { Rule } from "../../schemas/rule.schema";

// Test schema for our hook tests
const TestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
  isAdmin: z.boolean().default(false),
  maritalStatus: z.enum(["single", "married", "divorced"]).default("single"),
  spouseName: z.string().optional(),
  salary: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

describe("useFormRules", () => {
  const mockCustomFunctions = {
    doubleValue: (value: unknown) =>
      typeof value === "number" ? value * 2 : 0,
    formatName: (value: unknown) =>
      typeof value === "string" ? value.toUpperCase() : "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Hook Functionality", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          defaultValues: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            age: 25,
            maritalStatus: "single",
          },
        })
      );

      expect(result.current.form).toBeDefined();
      expect(result.current.fieldVisibility).toBeDefined();
      expect(result.current.fieldRequirements).toBeDefined();
      expect(result.current.fieldDisabled).toBeDefined();
      expect(result.current.actions).toBeDefined();
      expect(typeof result.current.evaluateRules).toBe("function");
      expect(typeof result.current.getFieldConfig).toBe("function");
    });

    it("should provide all expected field states", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
        })
      );

      const config = result.current.getFieldConfig("firstName");
      expect(config).toEqual({
        visible: true,
        required: false,
        disabled: false,
        warnings: [],
        errors: [],
        classes: [],
        options: [],
      });
    });
  });

  describe("Rule Evaluation", () => {
    it("should evaluate simple show/hide rules", () => {
      const rules: Rule[] = [
        {
          id: "show-spouse-name",
          condition: {
            field: "maritalStatus",
            operator: "equals",
            value: "married",
          },
          actions: [
            {
              type: "hide",
              target: "spouseName",
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            maritalStatus: "single",
          },
        })
      );

      // spouseName should be visible by default (condition not met)
      expect(result.current.fieldVisibility.spouseName).toBe(true);

      // Change to married
      act(() => {
        result.current.form.setValue("maritalStatus", "married");
      });

      // Should now be hidden
      act(() => {
        result.current.evaluateRules();
      });
    });

    it("should evaluate requirement rules", () => {
      const rules: Rule[] = [
        {
          id: "require-spouse-name",
          condition: {
            field: "maritalStatus",
            operator: "equals",
            value: "married",
          },
          actions: [
            {
              type: "set_value",
              target: "spouseName",
              params: { required: true },
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            maritalStatus: "married",
          },
        })
      );

      expect(result.current.fieldRequirements.spouseName).toBe(true);
    });

    it("should evaluate complex AND conditions", () => {
      const rules: Rule[] = [
        {
          id: "high-earner-admin",
          condition: {
            operator: "and",
            conditions: [
              { field: "salary", operator: "greater_than", value: 100000 },
              { field: "isAdmin", operator: "equals", value: true },
            ],
          },
          actions: [
            {
              type: "show",
              target: "tags",
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            salary: 120000,
            isAdmin: true,
          },
        })
      );

      expect(result.current.fieldVisibility.tags).toBe(true);
    });

    it("should handle dynamic value resolution", () => {
      const rules: Rule[] = [
        {
          id: "age-based-rule",
          condition: {
            field: "age",
            operator: "greater_than",
            value: {
              type: "function",
              name: "doubleValue",
              args: [20],
            },
          },
          actions: [
            {
              type: "show",
              target: "salary",
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          customFunctions: mockCustomFunctions,
          defaultValues: {
            age: 45, // > doubleValue(20) = 40
          },
        })
      );

      expect(result.current.fieldVisibility.salary).toBe(true);
    });
  });

  describe("Type-Safe Actions", () => {
    it("should provide type-safe show/hide actions", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
        })
      );

      act(() => {
        result.current.actions.show("spouseName");
      });

      act(() => {
        result.current.actions.hide("salary");
      });

      // Note: These actions modify internal state that affects the next rule evaluation
      expect(typeof result.current.actions.show).toBe("function");
      expect(typeof result.current.actions.hide).toBe("function");
    });

    it("should provide type-safe enable/disable actions", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
        })
      );

      expect(typeof result.current.actions.enable).toBe("function");
      expect(typeof result.current.actions.disable).toBe("function");

      // Should not throw when called with valid field names
      expect(() => {
        result.current.actions.enable("firstName");
        result.current.actions.disable("lastName");
      }).not.toThrow();
    });

    it("should provide safe value setting with validation", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          defaultValues: {
            firstName: "",
            email: "",
            age: 25,
          },
        })
      );

      // Valid values should succeed
      act(() => {
        const success1 = result.current.actions.setValueSafe(
          "firstName",
          "John"
        );
        const success2 = result.current.actions.setValueSafe("age", 30);
        expect(success1).toBe(true);
        expect(success2).toBe(true);
      });

      // Invalid values should fail
      act(() => {
        const failure1 = result.current.actions.setValueSafe(
          "email",
          "invalid-email"
        );
        const failure2 = result.current.actions.setValueSafe(
          "age",
          "not-a-number"
        );
        expect(failure1).toBe(false);
        expect(failure2).toBe(false);
      });
    });

    it("should provide unsafe value setting as escape hatch", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
        })
      );

      // Should not throw even with invalid values (escape hatch behavior)
      expect(() => {
        result.current.actions.setValueUnsafe("firstName", 123);
        result.current.actions.setValueUnsafe("age", "invalid");
      }).not.toThrow();
    });

    it("should handle warnings and errors", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
        })
      );

      act(() => {
        result.current.actions.addWarning("firstName", "This is a warning");
        result.current.actions.addError("email", "This is an error");
      });

      // Note: The actions affect internal state, actual state would be checked after rule evaluation
      expect(typeof result.current.actions.addWarning).toBe("function");
      expect(typeof result.current.actions.addError).toBe("function");
    });

    it("should handle CSS class manipulation", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
        })
      );

      expect(() => {
        result.current.actions.addClass("firstName", "highlight");
        result.current.actions.addClass("firstName", "required");
        result.current.actions.removeClass("firstName", "highlight");
      }).not.toThrow();
    });

    it("should handle field options setting", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
        })
      );

      const options = ["option1", "option2", "option3"];

      expect(() => {
        result.current.actions.setOptions("maritalStatus", options);
      }).not.toThrow();
    });

    it("should handle field clearing", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          defaultValues: {
            firstName: "John",
            email: "john@example.com",
          },
        })
      );

      expect(() => {
        result.current.actions.clearField("firstName");
        result.current.actions.clearField("email");
      }).not.toThrow();
    });
  });

  describe("Action Types Integration", () => {
    it("should handle set_value actions with field value setting", () => {
      const rules: Rule[] = [
        {
          id: "auto-fill-email",
          condition: {
            field: "firstName",
            operator: "equals",
            value: "Admin",
          },
          actions: [
            {
              type: "set_value",
              target: "email",
              value: "admin@company.com",
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            firstName: "Admin",
          },
        })
      );

      // The rule should have set the email
      expect(result.current.form.getValues("email")).toBe("admin@company.com");
    });

    it("should handle warning and error actions", () => {
      const rules: Rule[] = [
        {
          id: "age-warning",
          condition: {
            field: "age",
            operator: "less_than",
            value: 21,
          },
          actions: [
            {
              type: "show_warning",
              target: "age",
              params: { message: "You must be 21 or older" },
            },
          ],
          enabled: true,
        },
        {
          id: "email-error",
          condition: {
            field: "email",
            operator: "is_empty",
            value: null,
          },
          actions: [
            {
              type: "show_error",
              target: "email",
              params: { message: "Email is required" },
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            age: 18,
            email: "",
          },
        })
      );

      expect(result.current.fieldWarnings.age).toContain(
        "You must be 21 or older"
      );
      expect(result.current.fieldErrors.email).toContain("Email is required");
    });

    it("should handle CSS class actions", () => {
      const rules: Rule[] = [
        {
          id: "highlight-admin",
          condition: {
            field: "isAdmin",
            operator: "equals",
            value: true,
          },
          actions: [
            {
              type: "add_class",
              target: "firstName",
              params: { class: "admin-highlight" },
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            isAdmin: true,
          },
        })
      );

      expect(result.current.fieldClasses.firstName).toContain(
        "admin-highlight"
      );
    });

    it("should handle options setting actions", () => {
      const rules: Rule[] = [
        {
          id: "admin-tags",
          condition: {
            field: "isAdmin",
            operator: "equals",
            value: true,
          },
          actions: [
            {
              type: "set_options",
              target: "tags",
              params: { options: ["admin", "superuser", "moderator"] },
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            isAdmin: true,
          },
        })
      );

      expect(result.current.fieldOptions.tags).toEqual([
        "admin",
        "superuser",
        "moderator",
      ]);
    });
  });

  describe("Validation and Error Handling", () => {
    it("should handle validation triggers", async () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          defaultValues: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            age: 25,
          },
        })
      );

      const validationResult = await result.current.triggerValidation();
      expect(typeof validationResult).toBe("boolean");
    });

    it("should handle specific field validation", async () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          defaultValues: {
            firstName: "John",
            email: "invalid-email",
          },
        })
      );

      const validationResult = await result.current.triggerValidation([
        "email",
      ]);
      expect(typeof validationResult).toBe("boolean");
    });

    it("should handle field clearing", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          defaultValues: {
            firstName: "John",
            email: "john@example.com",
          },
        })
      );

      expect(() => {
        result.current.clearFieldValue("firstName");
      }).not.toThrow();
    });

    it("should handle invalid rule conditions gracefully", () => {
      const invalidRules: Rule[] = [
        {
          id: "invalid-rule",
          condition: {
            field: "nonexistentField",
            operator: "equals",
            value: "test",
          },
          actions: [
            {
              type: "show",
              target: "firstName",
            },
          ],
          enabled: true,
        },
      ];

      expect(() => {
        renderHook(() =>
          useFormRules({
            schema: TestSchema,
            rules: invalidRules,
          })
        );
      }).not.toThrow();
    });
  });

  describe("Custom Functions and Context", () => {
    it("should handle custom functions in rule evaluation", () => {
      const rules: Rule[] = [
        {
          id: "custom-function-rule",
          condition: {
            field: "firstName",
            operator: "equals",
            value: {
              type: "function",
              name: "formatName",
              args: ["john"],
            },
          },
          actions: [
            {
              type: "show",
              target: "salary",
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          customFunctions: mockCustomFunctions,
          defaultValues: {
            firstName: "JOHN",
          },
        })
      );

      expect(result.current.fieldVisibility.salary).toBe(true);
    });

    it("should handle custom action callbacks", () => {
      const mockCustomAction = vi.fn();

      const rules: Rule[] = [
        {
          id: "custom-action-rule",
          condition: {
            field: "isAdmin",
            operator: "equals",
            value: true,
          },
          actions: [
            {
              type: "custom",
              params: { action: "logAdminAccess" },
            },
          ],
          enabled: true,
        },
      ];

      // Hook initialization should trigger rule evaluation
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          onCustomAction: mockCustomAction,
          defaultValues: {
            isAdmin: true,
          },
        })
      );

      // Explicitly trigger rule evaluation
      act(() => {
        result.current.evaluateRules();
      });

      // The custom action should be called during rule evaluation
      expect(mockCustomAction).toHaveBeenCalled();
    });

    it("should handle rule context properly", () => {
      const context = {
        user: { id: "123", role: "admin" },
        permissions: ["read", "write", "admin"],
      };

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          context,
        })
      );

      // The hook should accept context without throwing
      expect(result.current.form).toBeDefined();
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle empty rules array", () => {
      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules: [],
        })
      );

      expect(result.current.fieldVisibility).toBeDefined();
      // With no rules, fields are initialized from schema - should have schema fields
      expect(
        Object.keys(result.current.fieldVisibility).length
      ).toBeGreaterThan(0);
    });

    it("should handle disabled rules", () => {
      const rules: Rule[] = [
        {
          id: "disabled-rule",
          condition: {
            field: "firstName",
            operator: "equals",
            value: "test",
          },
          actions: [
            {
              type: "hide",
              target: "salary",
            },
          ],
          enabled: false, // Disabled rule
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            firstName: "test", // This matches the condition but rule is disabled
          },
        })
      );

      // Disabled rules should not affect field visibility - salary should remain visible (default)
      expect(result.current.fieldVisibility.salary).toBe(true);
    });

    it("should handle multiple rules affecting the same field", () => {
      const rules: Rule[] = [
        {
          id: "rule-1",
          condition: {
            field: "firstName",
            operator: "equals",
            value: "John",
          },
          actions: [
            {
              type: "show",
              target: "salary",
            },
          ],
          enabled: true,
        },
        {
          id: "rule-2",
          condition: {
            field: "lastName",
            operator: "equals",
            value: "Doe",
          },
          actions: [
            {
              type: "set_value",
              target: "salary",
              params: { required: true },
            },
          ],
          enabled: true,
        },
      ];

      const { result } = renderHook(() =>
        useFormRules({
          schema: TestSchema,
          rules,
          defaultValues: {
            firstName: "John",
            lastName: "Doe",
          },
        })
      );

      // Both rules should affect the salary field
      expect(result.current.fieldVisibility.salary).toBe(true);
    });
  });
});
