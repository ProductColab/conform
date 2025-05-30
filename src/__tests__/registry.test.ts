import { z } from "zod/v4";
import { expect, it, describe, beforeEach } from "vitest";
import { createField } from "../lib/fieldUtils";
import { FieldRegistry } from "../field-registry";

describe("Registry System", () => {
  beforeEach(() => {
    // Clear registry before each test
    // Note: This assumes FieldRegistry has a clear method or we can recreate it
  });

  it("should register schema with metadata using createField", () => {
    const emailSchema = createField(z.string().email(), {
      inputType: "email",
      placeholder: "user@example.com",
    });

    // Verify the schema is registered
    expect(FieldRegistry.has(emailSchema)).toBe(true);

    // Verify the metadata is correct
    const metadata = FieldRegistry.get(emailSchema);
    expect(metadata).toEqual({
      inputType: "email",
      placeholder: "user@example.com",
    });
  });

  it("should convert to JSON Schema normally (without embedded metadata)", () => {
    const emailSchema = createField(z.string().email(), {
      inputType: "email",
      placeholder: "user@example.com",
    });

    const schema = z.object({
      email: emailSchema,
    });

    // Convert to JSON Schema
    const jsonSchema = z.toJSONSchema(schema);

    // JSON Schema should NOT contain our custom metadata
    expect(jsonSchema).toBeDefined();
    // Fix: jsonSchema.properties is of type unknown, so we need to type guard
    expect(
      (
        jsonSchema as unknown as {
          properties: { email: { metadata: unknown } };
        }
      )?.properties?.email?.metadata
    ).toBeUndefined();

    // But we can look up metadata from the registry
    const emailFieldSchema = emailSchema;
    expect(FieldRegistry.has(emailFieldSchema)).toBe(true);
    const metadata = FieldRegistry.get(emailFieldSchema);
    expect(metadata?.inputType).toBe("email");

    console.log("JSON Schema:", JSON.stringify(jsonSchema, null, 2));
    console.log("Email Field Metadata from Registry:", metadata);
  });

  it("should work with multiple registries", () => {
    // Create fields with different metadata
    const emailField = createField(z.string().email(), {
      inputType: "email",
      placeholder: "user@example.com",
    });

    const passwordField = createField(z.string().min(8), {
      inputType: "password",
      encrypted: true,
      showStrengthMeter: true,
    });

    // Both should be in FieldRegistry
    expect(FieldRegistry.has(emailField)).toBe(true);
    expect(FieldRegistry.has(passwordField)).toBe(true);

    // Metadata should be separate and correct
    expect(FieldRegistry.get(emailField)?.inputType).toBe("email");
    expect(FieldRegistry.get(passwordField)?.inputType).toBe("password");
    expect(FieldRegistry.get(passwordField)?.encrypted).toBe(true);
  });
});
