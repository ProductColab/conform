import { z } from "zod/v4";
import type { FieldMetadata } from "./schemas/field.schema";
import { FieldRegistry } from "./field-registry";

/**
 * Helper function to create strongly-typed field metadata
 */
export const fieldMeta = (metadata: FieldMetadata): FieldMetadata => metadata;

/**
 * Type guard to check if a schema has metadata
 */
export function hasMetadata(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { metadata?: FieldMetadata } {
  return typeof schema === "object" && schema !== null;
}

/**
 * Extract metadata from a Zod schema or JSON Schema object
 * For Zod schemas: checks the FieldRegistry first
 * For JSON Schema objects: checks the manual metadata property
 */
export function extractMetadata(
  schema: z.ZodTypeAny | z.core.JSONSchema.Schema
): FieldMetadata {
  // If this is a Zod schema, check the registry first
  if (schema && typeof schema === "object" && "_def" in schema) {
    const zodSchema = schema as z.ZodTypeAny;
    if (FieldRegistry.has(zodSchema)) {
      const registryMetadata = FieldRegistry.get(zodSchema);
      if (registryMetadata) {
        return registryMetadata;
      }
    }
  }

  // Fall back to manual metadata property for JSON Schema objects
  const jsonSchema = schema as z.core.JSONSchema.Schema;
  if (
    hasMetadata(jsonSchema) &&
    jsonSchema.metadata &&
    typeof jsonSchema.metadata === "object"
  ) {
    return jsonSchema.metadata as FieldMetadata;
  }

  return {};
}

/**
 * Type guard for string schemas
 */
export function isStringSchema(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { type: "string" } {
  return schema.type === "string";
}

/**
 * Type guard for number schemas
 */
export function isNumberSchema(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { type: "number" | "integer" } {
  return schema.type === "number" || schema.type === "integer";
}

/**
 * Type guard for boolean schemas
 */
export function isBooleanSchema(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { type: "boolean" } {
  return schema.type === "boolean";
}

/**
 * Type guard for array schemas
 */
export function isArraySchema(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { type: "array" } {
  return schema.type === "array";
}

/**
 * Type guard for signature schemas
 */
export function isSignatureSchema(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { format: "signature" } {
  return schema.format === "signature";
}

/**
 * Type guard for file upload schemas
 */
export function isFileUploadSchema(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { format: "file-upload" } {
  return schema.format === "file-upload";
}

export function hasArrayConstraints(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & {
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
} {
  return (
    typeof schema === "object" &&
    schema !== null &&
    ("minItems" in schema ||
      "maxItems" in schema ||
      "minLength" in schema ||
      "maxLength" in schema)
  );
}

/**
 * Type guard for enum schemas
 */
export function hasEnum(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { enum: readonly unknown[] } {
  return "enum" in schema && Array.isArray(schema.enum);
}

/**
 * Type guard for schemas with min/max constraints
 */
export function hasMinMax(
  schema: z.core.JSONSchema.Schema
): schema is z.core.JSONSchema.Schema & { minimum: number; maximum: number } {
  return (
    "minimum" in schema &&
    "maximum" in schema &&
    typeof schema.minimum === "number" &&
    typeof schema.maximum === "number"
  );
}

/**
 * Get the display label for a field
 */
export function getFieldLabel(
  name: string,
  schema: z.core.JSONSchema.Schema
): string {
  if ("title" in schema && typeof schema.title === "string") {
    return schema.title;
  }
  return name;
}

/**
 * Get the description for a field
 */
export function getFieldDescription(
  schema: z.core.JSONSchema.Schema,
  customDescription?: string
): string | undefined {
  if (customDescription) {
    return customDescription;
  }
  if ("description" in schema && typeof schema.description === "string") {
    return schema.description;
  }
  return undefined;
}

/**
 * Determine if a field should render as a textarea
 */
export function shouldRenderAsTextarea(metadata: FieldMetadata): boolean {
  return isTextareaField(metadata);
}

/**
 * Determine if a field should render as a slider
 */
export function shouldRenderAsSlider(metadata: FieldMetadata): boolean {
  return isSliderField(metadata);
}

/**
 * Get the input type for a field
 */
export function getInputType(
  schema: z.core.JSONSchema.Schema,
  metadata: FieldMetadata
): string {
  // Use explicit inputType from metadata if available
  if ("inputType" in metadata && metadata.inputType) {
    return metadata.inputType;
  }

  // Default based on schema type
  if (isNumberSchema(schema)) {
    return "number";
  }

  return "text";
}

/**
 * Get numeric constraints from schema
 */
export function getNumericConstraints(
  schema: z.core.JSONSchema.Schema,
  metadata: FieldMetadata
) {
  const constraints = {
    min: undefined as number | undefined,
    max: undefined as number | undefined,
    step: undefined as number | undefined,
  };

  if ("minimum" in schema && typeof schema.minimum === "number") {
    constraints.min = schema.minimum;
  }

  if ("maximum" in schema && typeof schema.maximum === "number") {
    constraints.max = schema.maximum;
  }

  // Step from metadata takes precedence
  if (metadata.step !== undefined) {
    constraints.step = metadata.step;
  } else if ("step" in schema && typeof schema.step === "number") {
    constraints.step = schema.step;
  } else if (schema.type === "integer") {
    constraints.step = 1;
  } else if (isNumberSchema(schema)) {
    constraints.step = 0.01;
  }

  return constraints;
}

/**
 * Get step value for numeric fields
 */
export function getNumericStep(metadata: FieldMetadata): number {
  if (metadata.step !== undefined) {
    return metadata.step;
  }
  return 1; // Default step
}

/**
 * Get number of rows for textarea
 */
export function getTextareaRows(metadata: FieldMetadata): number {
  if (metadata?.rows !== undefined) {
    return metadata.rows;
  }
  return 3; // Default rows
}

/**
 * Ensure field value has a proper default
 */
export function ensureFieldValue<T>(
  field: { value: T },
  defaultValue: T
): { value: T } & typeof field {
  return {
    ...field,
    value: field.value === undefined ? defaultValue : field.value,
  };
}

/**
 * Type guard function to check if something is a schema object
 */
export function isSchemaObject(
  obj: unknown
): obj is z.core.JSONSchema.BaseSchema {
  return typeof obj === "object" && obj !== null;
}

export function getDefaultValuesFromSchema(schema: z.ZodType) {
  // Skip if schema is not valid
  if (!schema || typeof schema !== "object") {
    console.warn("Invalid schema provided to getDefaultValuesFromSchema");
    return {};
  }

  try {
    if (typeof schema.safeParse === "function") {
      const result = schema.safeParse(undefined);

      if (result.success) {
        return result.data;
      }

      const emptyResult = schema.safeParse({});
      if (emptyResult.success) {
        return emptyResult.data;
      }
    }

    return {};
  } catch (error) {
    console.error("Error getting default values from schema:", error);
    return {};
  }
}

/**
 * Get default values from JSON Schema objects (not Zod schemas)
 * This is useful for components working with raw JSON Schema like ListField
 */
export function getDefaultValuesFromJSONSchema(
  schema: z.core.JSONSchema.BaseSchema
): unknown {
  if (!schema || typeof schema !== "object") {
    return null;
  }

  const schemaType = schema.type;

  switch (schemaType) {
    case "string":
      return schema.default !== undefined ? schema.default : "";
    case "number":
    case "integer":
      return schema.default !== undefined ? schema.default : 0;
    case "boolean":
      return schema.default !== undefined ? schema.default : false;
    case "array":
      return schema.default !== undefined ? schema.default : [];
    case "object":
      if (schema.properties) {
        const defaultObj: Record<string, unknown> = {};
        Object.entries(schema.properties).forEach(([key, fieldSchema]) => {
          defaultObj[key] = getDefaultValuesFromJSONSchema(fieldSchema);
        });
        return defaultObj;
      }
      return schema.default !== undefined ? schema.default : {};
    default:
      return schema.default !== undefined ? schema.default : null;
  }
}

/**
 * Type guards for FieldMetadata formats
 */
export function isTextareaMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "textarea" } {
  return "format" in metadata && metadata.format === "textarea";
}

export function isSliderMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "slider" } {
  return "format" in metadata && metadata.format === "slider";
}

export function isSelectMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & {
  format: "select" | "multiselect" | "radio" | "checkbox-group";
} {
  return (
    "format" in metadata &&
    ["select", "multiselect", "radio", "checkbox-group"].includes(
      metadata.format as string
    )
  );
}

export function isFileUploadMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "file-upload" } {
  return "format" in metadata && metadata.format === "file-upload";
}

export function isRichTextMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "rich-text" } {
  return "format" in metadata && metadata.format === "rich-text";
}

export function isDateRangeMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "date-range" } {
  return "format" in metadata && metadata.format === "date-range";
}

export function isAddressMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "address" } {
  return "format" in metadata && metadata.format === "address";
}

export function isSignatureMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "signature" } {
  return "format" in metadata && metadata.format === "signature";
}

export function isArrayRepeaterMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "array-repeater" } {
  return "format" in metadata && metadata.format === "array-repeater";
}

export function isSwitchMetadata(
  metadata: FieldMetadata
): metadata is FieldMetadata & { format: "switch" } {
  return "format" in metadata && metadata.format === "switch";
}

/**
 * Type guards for FieldMetadata variants
 */
export function isMultilineVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "multiline" } {
  return "variant" in metadata && metadata.variant === "multiline";
}

export function isRangeVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "range" } {
  return "variant" in metadata && metadata.variant === "range";
}

export function isAutocompleteVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "autocomplete" } {
  return "variant" in metadata && metadata.variant === "autocomplete";
}

export function isMultiselectVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "multiselect" } {
  return "variant" in metadata && metadata.variant === "multiselect";
}

export function isTagsVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "tags" } {
  return "variant" in metadata && metadata.variant === "tags";
}

export function isDragDropVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "drag-drop" } {
  return "variant" in metadata && metadata.variant === "drag-drop";
}

export function isRichTextVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "rich-text" } {
  return "variant" in metadata && metadata.variant === "rich-text";
}

export function isDateRangeVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "date-range" } {
  return "variant" in metadata && metadata.variant === "date-range";
}

export function isAddressVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "address" } {
  return "variant" in metadata && metadata.variant === "address";
}

export function isSignatureVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "signature" } {
  return "variant" in metadata && metadata.variant === "signature";
}

export function isArrayRepeaterVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "array-repeater" } {
  return "variant" in metadata && metadata.variant === "array-repeater";
}

export function isSwitchVariant(
  metadata: FieldMetadata
): metadata is FieldMetadata & { variant: "switch" } {
  return "variant" in metadata && metadata.variant === "switch";
}

/**
 * Property-based type guards for FieldMetadata (duck typing approach)
 * No more magic strings - just check for the presence of relevant properties!
 */

export function isTextareaField(metadata: FieldMetadata): boolean {
  return metadata.rows !== undefined || metadata.resizable !== undefined;
}

export function isSliderField(metadata: FieldMetadata): boolean {
  return (
    metadata.step !== undefined ||
    metadata.showSlider !== undefined ||
    metadata.marks !== undefined
  );
}

export function isSelectField(metadata: FieldMetadata): boolean {
  return (
    metadata.allowCustomValues !== undefined ||
    metadata.searchable !== undefined
  );
}

export function isFileUploadField(metadata: FieldMetadata): boolean {
  return (
    metadata.accept !== undefined ||
    metadata.multiple !== undefined ||
    metadata.maxFiles !== undefined ||
    metadata.dragDrop !== undefined ||
    metadata.showPreview !== undefined
  );
}

export function isRichTextField(metadata: FieldMetadata): boolean {
  return (
    metadata.mode !== undefined ||
    metadata.toolbar !== undefined ||
    metadata.allowImages !== undefined ||
    metadata.syntaxHighlighting !== undefined
  );
}

export function isDateRangeField(metadata: FieldMetadata): boolean {
  return (
    metadata.rangeType !== undefined ||
    metadata.allowSingleDate !== undefined ||
    metadata.presets !== undefined ||
    metadata.showTimezone !== undefined
  );
}

export function isAddressField(metadata: FieldMetadata): boolean {
  return (
    metadata.addressType !== undefined ||
    metadata.enableGeocoding !== undefined ||
    metadata.enableAutocomplete !== undefined ||
    metadata.showMap !== undefined
  );
}

export function isSignatureField(metadata: FieldMetadata): boolean {
  return (
    metadata.width !== undefined ||
    metadata.height !== undefined ||
    metadata.penColor !== undefined ||
    metadata.outputFormat !== undefined ||
    metadata.showClearButton !== undefined
  );
}

export function isArrayRepeaterField(metadata: FieldMetadata): boolean {
  return (
    metadata.minItems !== undefined ||
    metadata.maxItems !== undefined ||
    metadata.allowReorder !== undefined ||
    metadata.showAddButton !== undefined ||
    metadata.itemTemplate !== undefined
  );
}

export function isRadioField(metadata: FieldMetadata): boolean {
  return "format" in metadata && metadata.format === "radio";
}

export function isCheckboxGroupField(metadata: FieldMetadata): boolean {
  return "format" in metadata && metadata.format === "checkbox-group";
}

export function isDateField(metadata: FieldMetadata): boolean {
  return "inputType" in metadata && metadata.inputType === "date";
}

export function isDateTimeField(metadata: FieldMetadata): boolean {
  return "inputType" in metadata && metadata.inputType === "datetime-local";
}

export function isTimeField(metadata: FieldMetadata): boolean {
  return "inputType" in metadata && metadata.inputType === "time";
}

export function isRatingField(metadata: FieldMetadata): boolean {
  return (
    metadata.max !== undefined ||
    metadata.allowHalf !== undefined ||
    metadata.showValue !== undefined ||
    metadata.icon !== undefined
  );
}
