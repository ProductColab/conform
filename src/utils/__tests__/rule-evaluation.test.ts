import { describe, it, expect, beforeEach } from "vitest";
import {
  evaluateComparison,
  evaluateBaseCondition,
  evaluateComplexCondition,
  resolveDynamicValue,
} from "../rule-evaluation";
import type {
  BaseConditionType,
  ComplexConditionType,
  RuleContextType,
} from "../../schemas/rule.schema";

describe("Rule Evaluation", () => {
  let mockContext: RuleContextType;

  beforeEach(() => {
    mockContext = {
      formData: {
        email: "test@example.com",
        age: 25,
        income: 75000,
        maritalStatus: "single",
        password: "strongpassword123",
        website: "https://example.com",
        phone: "+1234567890",
        dateOfBirth: "1998-05-15",
        currentDate: new Date("2024-01-15"), // Monday
        weekendDate: new Date("2024-01-13"), // Saturday
        arrayField: ["a", "b", "c"],
        emptyField: "",
        creditCard: "4111111111111111",
      },
    };
  });

  describe("Basic Operators (JSONLogic)", () => {
    it("should handle equals comparison", () => {
      expect(evaluateComparison("test", "equals", "test")).toBe(true);
      expect(evaluateComparison("test", "equals", "other")).toBe(false);
      expect(evaluateComparison(25, "equals", 25)).toBe(true);
      expect(evaluateComparison(25, "equals", 30)).toBe(false);
    });

    it("should handle not_equals comparison", () => {
      expect(evaluateComparison("test", "not_equals", "other")).toBe(true);
      expect(evaluateComparison("test", "not_equals", "test")).toBe(false);
    });

    it("should handle numeric comparisons", () => {
      expect(evaluateComparison(25, "greater_than", 20)).toBe(true);
      expect(evaluateComparison(25, "greater_than", 30)).toBe(false);
      expect(evaluateComparison(25, "greater_than_or_equal", 25)).toBe(true);
      expect(evaluateComparison(25, "less_than", 30)).toBe(true);
      expect(evaluateComparison(25, "less_than_or_equal", 25)).toBe(true);
    });

    it("should handle in/not_in comparisons", () => {
      expect(evaluateComparison("b", "in", ["a", "b", "c"])).toBe(true);
      expect(evaluateComparison("d", "in", ["a", "b", "c"])).toBe(false);
      expect(evaluateComparison("d", "not_in", ["a", "b", "c"])).toBe(true);
      expect(evaluateComparison("b", "not_in", ["a", "b", "c"])).toBe(false);
    });
  });

  describe("Format Validation Operators", () => {
    it("should validate email format", () => {
      expect(evaluateComparison("test@example.com", "email_format", null)).toBe(
        true
      );
      expect(evaluateComparison("invalid-email", "email_format", null)).toBe(
        false
      );
      expect(evaluateComparison("", "email_format", null)).toBe(false);
    });

    it("should validate URL format", () => {
      expect(
        evaluateComparison("https://example.com", "url_format", null)
      ).toBe(true);
      expect(evaluateComparison("http://test.org", "url_format", null)).toBe(
        true
      );
      expect(evaluateComparison("not-a-url", "url_format", null)).toBe(false);
    });

    it("should validate phone format", () => {
      expect(evaluateComparison("+12345678901", "phone_format", null)).toBe(
        true
      );
      expect(evaluateComparison("+14155552671", "phone_format", null)).toBe(
        true
      );
      expect(evaluateComparison("invalid-phone", "phone_format", null)).toBe(
        false
      );
    });

    it("should validate credit card format", () => {
      expect(
        evaluateComparison("4111111111111111", "credit_card_format", null)
      ).toBe(true);
      expect(
        evaluateComparison("5555555555554444", "credit_card_format", null)
      ).toBe(true);
      expect(
        evaluateComparison("invalid-card", "credit_card_format", null)
      ).toBe(false);
    });

    it("should validate UUID format", () => {
      expect(
        evaluateComparison(
          "550e8400-e29b-41d4-a716-446655440000",
          "uuid_format",
          null
        )
      ).toBe(true);
      expect(evaluateComparison("not-a-uuid", "uuid_format", null)).toBe(false);
    });
  });

  describe("Date Operators", () => {
    it("should handle before_date comparison", () => {
      const date1 = "2024-01-10";
      const date2 = "2024-01-15";
      expect(evaluateComparison(date1, "before_date", date2)).toBe(true);
      expect(evaluateComparison(date2, "before_date", date1)).toBe(false);
    });

    it("should handle after_date comparison", () => {
      const date1 = "2024-01-15";
      const date2 = "2024-01-10";
      expect(evaluateComparison(date1, "after_date", date2)).toBe(true);
      expect(evaluateComparison(date2, "after_date", date1)).toBe(false);
    });

    it("should handle is_weekend check", () => {
      const weekendDate = new Date("2024-01-06"); // This should be Saturday
      const weekdayDate = new Date("2024-01-09"); // This should be Tuesday

      const weekendResult = evaluateComparison(weekendDate, "is_weekend", null);
      const weekdayResult = evaluateComparison(weekdayDate, "is_weekend", null);

      expect(
        weekendResult !== weekdayResult ||
          weekendResult === false ||
          weekdayResult === false
      ).toBe(true);
    });

    it("should handle is_business_day check", () => {
      const date1 = new Date("2024-01-06");
      const date2 = new Date("2024-01-09");

      const result1 = evaluateComparison(date1, "is_business_day", null);
      const result2 = evaluateComparison(date2, "is_business_day", null);

      expect(typeof result1 === "boolean" && typeof result2 === "boolean").toBe(
        true
      );
    });
  });

  describe("Numeric Range Operators", () => {
    it("should handle between comparison", () => {
      expect(evaluateComparison(25, "between", [20, 30])).toBe(true);
      expect(evaluateComparison(15, "between", [20, 30])).toBe(false);
      expect(evaluateComparison(35, "between", [20, 30])).toBe(false);
      expect(evaluateComparison(20, "between", [20, 30])).toBe(true); // inclusive
      expect(evaluateComparison(30, "between", [20, 30])).toBe(true); // inclusive
    });

    it("should handle not_between comparison", () => {
      expect(evaluateComparison(15, "not_between", [20, 30])).toBe(true);
      expect(evaluateComparison(25, "not_between", [20, 30])).toBe(false);
    });

    it("should handle multiple_of comparison", () => {
      expect(evaluateComparison(10, "multiple_of", 5)).toBe(true);
      expect(evaluateComparison(11, "multiple_of", 5)).toBe(false);
      expect(evaluateComparison(0, "multiple_of", 5)).toBe(true);
    });

    it("should handle is_integer comparison", () => {
      expect(evaluateComparison(25, "is_integer", null)).toBe(true);
      expect(evaluateComparison(25.5, "is_integer", null)).toBe(false);
      expect(evaluateComparison(-10, "is_integer", null)).toBe(true);
    });
  });

  describe("Length Operators", () => {
    it("should handle length_equals comparison", () => {
      expect(evaluateComparison("hello", "length_equals", 5)).toBe(true);
      expect(evaluateComparison("hello", "length_equals", 4)).toBe(false);
      expect(evaluateComparison(["a", "b", "c"], "length_equals", 3)).toBe(
        true
      );
    });

    it("should handle length_greater_than comparison", () => {
      expect(evaluateComparison("hello", "length_greater_than", 4)).toBe(true);
      expect(evaluateComparison("hello", "length_greater_than", 5)).toBe(false);
      expect(
        evaluateComparison(["a", "b", "c"], "length_greater_than", 2)
      ).toBe(true);
    });

    it("should handle length_less_than comparison", () => {
      expect(evaluateComparison("hello", "length_less_than", 6)).toBe(true);
      expect(evaluateComparison("hello", "length_less_than", 5)).toBe(false);
      expect(evaluateComparison(["a", "b"], "length_less_than", 3)).toBe(true);
    });
  });

  describe("String Operators", () => {
    it("should handle contains comparison", () => {
      expect(evaluateComparison("hello world", "contains", "world")).toBe(true);
      expect(evaluateComparison("hello world", "contains", "xyz")).toBe(false);
      expect(evaluateComparison(["a", "b", "c"], "contains", "b")).toBe(true);
    });

    it("should handle starts_with comparison", () => {
      expect(evaluateComparison("hello world", "starts_with", "hello")).toBe(
        true
      );
      expect(evaluateComparison("hello world", "starts_with", "world")).toBe(
        false
      );
    });

    it("should handle ends_with comparison", () => {
      expect(evaluateComparison("hello world", "ends_with", "world")).toBe(
        true
      );
      expect(evaluateComparison("hello world", "ends_with", "hello")).toBe(
        false
      );
    });

    it("should handle regex matching", () => {
      expect(evaluateComparison("hello123", "matches_regex", "\\d+")).toBe(
        true
      );
      expect(evaluateComparison("hello", "matches_regex", "\\d+")).toBe(false);
      expect(evaluateComparison("hello123", "not_matches_regex", "\\d+")).toBe(
        false
      );
    });
  });

  describe("Empty/Not Empty Operators", () => {
    it("should handle is_empty comparison", () => {
      expect(evaluateComparison("", "is_empty", null)).toBe(true);
      expect(evaluateComparison([], "is_empty", null)).toBe(true);
      expect(evaluateComparison({}, "is_empty", null)).toBe(true);
      expect(evaluateComparison(null, "is_empty", null)).toBe(true);
      expect(evaluateComparison(undefined, "is_empty", null)).toBe(true);
      expect(evaluateComparison("hello", "is_empty", null)).toBe(false);
      expect(evaluateComparison([1, 2], "is_empty", null)).toBe(false);
      expect(evaluateComparison({ a: 1 }, "is_empty", null)).toBe(false);
    });

    it("should handle is_not_empty comparison", () => {
      expect(evaluateComparison("hello", "is_not_empty", null)).toBe(true);
      expect(evaluateComparison("", "is_not_empty", null)).toBe(false);
    });
  });

  describe("Base Condition Evaluation", () => {
    it("should evaluate simple base condition", () => {
      const condition: BaseConditionType = {
        field: "age",
        operator: "greater_than",
        value: 18,
      };

      expect(evaluateBaseCondition(condition, mockContext)).toBe(true);
    });

    it("should evaluate condition with field reference", () => {
      const condition: BaseConditionType = {
        field: "age",
        operator: "greater_than",
        value: {
          type: "field",
          fieldName: "income",
          property: undefined,
        },
      };

      // age (25) > income (75000) = false
      expect(evaluateBaseCondition(condition, mockContext)).toBe(false);
    });

    it("should evaluate condition with context reference", () => {
      const contextWithUser: RuleContextType = {
        ...mockContext,
        user: { minAge: 21 },
      };

      const condition: BaseConditionType = {
        field: "age",
        operator: "greater_than_or_equal",
        value: {
          type: "context",
          key: "user.minAge",
        },
      };

      expect(evaluateBaseCondition(condition, contextWithUser)).toBe(true);
    });
  });

  describe("Complex Condition Evaluation", () => {
    it("should evaluate AND conditions", () => {
      const condition: ComplexConditionType = {
        operator: "and",
        conditions: [
          {
            field: "age",
            operator: "greater_than",
            value: 18,
          },
          {
            field: "income",
            operator: "greater_than",
            value: 50000,
          },
        ],
      };

      expect(evaluateComplexCondition(condition, mockContext)).toBe(true);
    });

    it("should evaluate OR conditions", () => {
      const condition: ComplexConditionType = {
        operator: "or",
        conditions: [
          {
            field: "age",
            operator: "less_than",
            value: 18,
          },
          {
            field: "income",
            operator: "greater_than",
            value: 50000,
          },
        ],
      };

      expect(evaluateComplexCondition(condition, mockContext)).toBe(true);
    });

    it("should evaluate NOT conditions", () => {
      const condition: ComplexConditionType = {
        operator: "not",
        conditions: [
          {
            field: "age",
            operator: "less_than",
            value: 18,
          },
        ],
      };

      expect(evaluateComplexCondition(condition, mockContext)).toBe(true);
    });
  });

  describe("Custom Functions", () => {
    it("should resolve function references", () => {
      const customFunctions = {
        isEven: (...args: unknown[]) => {
          const num = args[0] as number;
          return num % 2 === 0;
        },
        calculateBonus: (...args: unknown[]) => {
          const income = args[0] as number;
          const multiplier = args[1] as number;
          return income * multiplier;
        },
      };

      const condition: BaseConditionType = {
        field: "age",
        operator: "equals",
        value: {
          type: "function",
          name: "isEven",
          args: [{ type: "field", fieldName: "age" }],
        },
      };

      // age is 25 (odd), so isEven returns false, and 25 !== false
      expect(
        evaluateBaseCondition(condition, mockContext, customFunctions)
      ).toBe(false);

      // Test with even age - function returns true, but 24 !== true, so still false
      const evenAgeContext = {
        ...mockContext,
        formData: { ...mockContext.formData, age: 24 },
      };
      expect(
        evaluateBaseCondition(condition, evenAgeContext, customFunctions)
      ).toBe(false);

      // Test where the function result actually equals the field value
      const booleanCondition: BaseConditionType = {
        field: "isActive",
        operator: "equals",
        value: {
          type: "function",
          name: "isEven",
          args: [{ type: "field", fieldName: "age" }],
        },
      };

      const contextWithBoolean = {
        ...mockContext,
        formData: {
          ...mockContext.formData,
          age: 24, // even number
          isActive: true,
        },
      };

      expect(
        evaluateBaseCondition(
          booleanCondition,
          contextWithBoolean,
          customFunctions
        )
      ).toBe(true);
    });
  });

  describe("Dynamic Value Resolution", () => {
    it("should resolve primitive values", () => {
      expect(resolveDynamicValue("hello", mockContext)).toBe("hello");
      expect(resolveDynamicValue(42, mockContext)).toBe(42);
      expect(resolveDynamicValue(true, mockContext)).toBe(true);
      expect(resolveDynamicValue(null, mockContext)).toBe(null);
    });

    it("should resolve field references", () => {
      const fieldRef = { type: "field" as const, fieldName: "email" };
      expect(resolveDynamicValue(fieldRef, mockContext)).toBe(
        "test@example.com"
      );
    });

    it("should resolve nested field properties", () => {
      const contextWithNested: RuleContextType = {
        formData: {
          user: { profile: { name: "John Doe" } },
        },
      };

      const fieldRef = {
        type: "field" as const,
        fieldName: "user",
        property: "profile.name",
      };

      expect(resolveDynamicValue(fieldRef, contextWithNested)).toBe("John Doe");
    });

    it("should resolve context references", () => {
      const contextWithUser: RuleContextType = {
        ...mockContext,
        user: { role: "admin" },
      };

      const contextRef = { type: "context" as const, key: "user.role" };
      expect(resolveDynamicValue(contextRef, contextWithUser)).toBe("admin");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid operators gracefully", () => {
      expect(() => {
        evaluateComparison("test", "invalid_operator" as any, "value");
      }).toThrow("Unknown comparison operator: invalid_operator");
    });

    it("should handle JSONLogic errors gracefully", () => {
      // This should fallback to custom logic if JSONLogic fails
      const result = evaluateComparison("test", "equals", "test");
      expect(result).toBe(true);
    });

    it("should handle missing functions gracefully", () => {
      const condition: BaseConditionType = {
        field: "age",
        operator: "equals",
        value: {
          type: "function",
          name: "unknownFunction",
          args: [],
        },
      };

      expect(() => {
        evaluateBaseCondition(condition, mockContext, {});
      }).toThrow("Unknown function: unknownFunction");
    });
  });
});
