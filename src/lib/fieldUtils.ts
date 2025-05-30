import { z } from "zod/v4";
import type { FieldMetadata } from "../schemas/field.schema";
import {
  extractMetadata,
  getFieldLabel as extractFieldLabel,
  getFieldDescription as extractFieldDescription,
} from "../utils";

/**
 * Helper function to create strongly-typed field metadata
 */
export const fieldMeta = (metadata: FieldMetadata): FieldMetadata => metadata;

/**
 * Type definition for user field schema definitions - following established pattern
 */
export type FieldSchemas = Record<string, z.core.JSONSchema.Schema>;

/**
 * Extract field information from a schema following the established pattern
 */
export function extractFieldInfo(
  name: string,
  schema: z.core.JSONSchema.Schema
) {
  return {
    name,
    schema,
    label: extractFieldLabel(name, schema),
    description: extractFieldDescription(schema),
    metadata: extractMetadata(schema),
    type: schema.type || "string",
  };
}

/**
 * Auto-categorize fields by type - no user category required!
 */
export function getFieldsByCategory(schemas: FieldSchemas) {
  const result: Record<string, { meta: any; fields: Record<string, any> }> = {};

  // Auto-organize by field type - much simpler for users!
  Object.entries(schemas).forEach(([fieldName, schema]) => {
    const fieldInfo = extractFieldInfo(fieldName, schema);
    const type = schema.type || "string";

    // Auto-categorize by type
    let category = "text";
    if (type === "number" || type === "integer") {
      category = "numeric";
    } else if (type === "boolean") {
      category = "boolean";
    } else if (type === "array") {
      category = "arrays";
    } else if (schema.format === "email") {
      category = "contact";
    } else if (schema.format === "date" || schema.format === "datetime") {
      category = "dates";
    }

    if (!result[category]) {
      const categoryLabels: Record<string, string> = {
        text: "Text Fields",
        numeric: "Numbers",
        boolean: "Yes/No",
        arrays: "Lists",
        contact: "Contact Info",
        dates: "Dates & Times",
      };

      result[category] = {
        meta: {
          label: categoryLabels[category] || "Other Fields",
          order: Object.keys(result).length,
        },
        fields: {},
      };
    }

    result[category].fields[fieldName] = fieldInfo;
  });

  return result;
}

/**
 * Get a simple flat list of fields - for when categorization isn't needed
 */
export function getFieldsFlat(schemas: FieldSchemas) {
  return Object.entries(schemas).reduce((acc, [fieldName, schema]) => {
    acc[fieldName] = extractFieldInfo(fieldName, schema);
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Get fields for a specific type from schemas
 */
export function getFieldsForType(schemas: FieldSchemas, fieldType: string) {
  return Object.entries(schemas)
    .filter(([_, schema]) => schema.type === fieldType)
    .reduce((acc, [fieldName, schema]) => {
      acc[fieldName] = extractFieldInfo(fieldName, schema);
      return acc;
    }, {} as Record<string, any>);
}

/**
 * Type guards for field types using schema type information
 */
export function isStringField(
  schemas: FieldSchemas,
  fieldKey: string
): boolean {
  const schema = schemas[fieldKey];
  return schema?.type === "string";
}

export function isNumberField(
  schemas: FieldSchemas,
  fieldKey: string
): boolean {
  const schema = schemas[fieldKey];
  return schema?.type === "number" || schema?.type === "integer";
}

export function isBooleanField(
  schemas: FieldSchemas,
  fieldKey: string
): boolean {
  const schema = schemas[fieldKey];
  return schema?.type === "boolean";
}

export function isDateField(schemas: FieldSchemas, fieldKey: string): boolean {
  const schema = schemas[fieldKey];
  const metadata = extractMetadata(schema);
  return metadata.inputType === "date";
}

export function isArrayField(schemas: FieldSchemas, fieldKey: string): boolean {
  const schema = schemas[fieldKey];
  return schema?.type === "array";
}

/**
 * Get field label using established utility
 */
export function getFieldLabel(schemas: FieldSchemas, fieldKey: string): string {
  const schema = schemas[fieldKey];
  if (!schema) return fieldKey;
  return extractFieldLabel(fieldKey, schema);
}

/**
 * Get field description using established utility
 */
export function getFieldDescription(
  schemas: FieldSchemas,
  fieldKey: string
): string {
  const schema = schemas[fieldKey];
  if (!schema) return "";
  return extractFieldDescription(schema) || "";
}

/**
 * Get field type from schema
 */
export function getFieldType(schemas: FieldSchemas, fieldKey: string): string {
  const schema = schemas[fieldKey];
  return schema?.type || "string";
}

/**
 * Get field metadata using established utility
 */
export function getFieldMetadata(
  schemas: FieldSchemas,
  fieldKey: string
): FieldMetadata {
  const schema = schemas[fieldKey];
  if (!schema) return {};
  return extractMetadata(schema);
}
