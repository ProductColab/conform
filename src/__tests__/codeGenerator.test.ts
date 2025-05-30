import { describe, it, expect } from "vitest";
import {
  generateCode,
  generateFullCode,
  type Condition,
} from "../lib/codeGenerator";

describe("CodeGenerator", () => {
  it("should generate simple equals condition", () => {
    const condition: Condition = {
      field: "email",
      operator: "equals",
      value: "test@example.com",
    };

    const result = generateCode(condition);

    expect(result).toBe("field('email').equals('test@example.com')");
  });

  it("should handle numeric values", () => {
    const condition: Condition = {
      field: "age",
      operator: "greaterThan",
      value: 18,
    };

    const result = generateCode(condition);

    expect(result).toBe("field('age').greaterThan(18)");
  });

  it("should handle boolean values", () => {
    const condition: Condition = {
      field: "isActive",
      operator: "equals",
      value: true,
    };

    const result = generateCode(condition);

    expect(result).toBe("field('isActive').equals(true)");
  });

  it("should escape single quotes in string values", () => {
    const condition: Condition = {
      field: "name",
      operator: "equals",
      value: "O'Connor",
    };

    const result = generateCode(condition);

    expect(result).toBe("field('name').equals('O\\'Connor')");
  });

  it("should generate full code with imports", () => {
    const condition: Condition = {
      field: "email",
      operator: "equals",
      value: "test@example.com",
    };

    const result = generateFullCode(condition);

    expect(result).toBe(
      "import { field } from '@conform/rule-builder';\n\nconst rule = field('email').equals('test@example.com');"
    );
  });
});
