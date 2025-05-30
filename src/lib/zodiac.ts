import { z } from "zod/v4";
import type { FieldMetadata } from "../schemas/field.schema";
import { createField } from "./fieldUtils";
import { SchemaForm } from "../form/SchemaForm";

/**
 * Streamlined field builders with sensible defaults
 */
export const field = {
  // Text fields
  text: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), { inputType: "text", ...options }),

  email: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string().email(), {
      inputType: "email",
      placeholder: "user@example.com",
      ...options,
    }),

  password: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string().min(8), {
      inputType: "password",
      showStrengthMeter: true,
      ...options,
    }),

  url: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string().url(), {
      inputType: "url",
      placeholder: "https://example.com",
      ...options,
    }),

  phone: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      inputType: "tel",
      placeholder: "+1 (555) 123-4567",
      ...options,
    }),

  textarea: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      rows: 4,
      resizable: true,
      ...options,
    }),

  // Numeric fields
  number: (
    constraints: { min?: number; max?: number } = {},
    options: Partial<FieldMetadata> = {}
  ) => {
    const baseSchema = z.number();
    const schema =
      constraints.min !== undefined && constraints.max !== undefined
        ? baseSchema.min(constraints.min).max(constraints.max)
        : constraints.min !== undefined
          ? baseSchema.min(constraints.min)
          : constraints.max !== undefined
            ? baseSchema.max(constraints.max)
            : baseSchema;
    return createField(schema, { inputType: "number", ...options });
  },

  slider: (
    constraints: { min: number; max: number; step?: number } = {
      min: 0,
      max: 100,
    },
    options: Partial<FieldMetadata> = {}
  ) => {
    const schema = z.number().min(constraints.min).max(constraints.max);
    return createField(schema, {
      showSlider: true,
      step: constraints.step || 1,
      ...options,
    });
  },

  rating: (max: number = 5, options: Partial<FieldMetadata> = {}) =>
    createField(z.number().min(1).max(max), {
      max,
      allowHalf: false,
      showValue: true,
      icon: "star",
      ...options,
    }),

  // Boolean fields
  checkbox: (options: Partial<FieldMetadata> = {}) =>
    createField(z.boolean().default(false), options),

  switch: (options: Partial<FieldMetadata> = {}) =>
    createField(z.boolean().default(false), {
      format: "switch",
      ...options,
    }),

  // Selection fields
  select: <T extends readonly [string, ...string[]]>(
    options: T,
    fieldOptions: Partial<FieldMetadata> = {}
  ) =>
    createField(z.enum(options), {
      format: "select",
      ...fieldOptions,
    }),

  radio: <T extends readonly [string, ...string[]]>(
    options: T,
    fieldOptions: Partial<FieldMetadata> = {}
  ) =>
    createField(z.enum(options), {
      format: "radio",
      ...fieldOptions,
    }),

  multiselect: <T extends readonly [string, ...string[]]>(
    options: T,
    fieldOptions: Partial<FieldMetadata> = {}
  ) =>
    createField(z.array(z.enum(options)), {
      format: "multiselect",
      ...fieldOptions,
    }),

  // Date/time fields
  date: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      inputType: "date",
      ...options,
    }),

  datetime: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      inputType: "datetime-local",
      ...options,
    }),

  time: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      inputType: "time",
      ...options,
    }),

  dateRange: (options: Partial<FieldMetadata> = {}) =>
    createField(
      z.object({
        start: z.string(),
        end: z.string(),
      }),
      {
        format: "date-range",
        ...options,
      }
    ),

  // File upload
  file: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      format: "file-upload",
      accept: "*/*",
      showPreview: true,
      dragDrop: true,
      ...options,
    }),

  image: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      format: "file-upload",
      accept: "image/*",
      showPreview: true,
      dragDrop: true,
      ...options,
    }),

  // Advanced fields
  richText: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      format: "rich-text",
      toolbar: ["bold", "italic", "link", "image"],
      allowImages: false,
      ...options,
    }),

  signature: (options: Partial<FieldMetadata> = {}) =>
    createField(z.string(), {
      format: "signature",
      width: 400,
      height: 200,
      penColor: "#000000",
      backgroundColor: "#ffffff",
      outputFormat: "png",
      showClearButton: true,
      ...options,
    }),

  address: (options: Partial<FieldMetadata> = {}) =>
    createField(
      z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string().default("US"),
      }),
      {
        format: "address",
        enableAutocomplete: true,
        enableGeocoding: false,
        ...options,
      }
    ),

  // Array fields
  array: <T extends z.ZodTypeAny>(
    itemSchema: T,
    options: Partial<FieldMetadata> = {}
  ) =>
    createField(z.array(itemSchema), {
      format: "array-repeater",
      allowReorder: true,
      showAddButton: true,
      minItems: 0,
      ...options,
    }),
};

/**
 * Main zodiac API - single entry point for creating forms
 */
export const zodiac = {
  /**
   * Create a form with a fluent schema definition
   */
  form: <T extends Record<string, z.ZodTypeAny>>(fields: T) => {
    const schema = z.object(fields);

    return {
      schema,
      render: (props: Omit<Parameters<typeof SchemaForm>[0], "schema">) =>
        SchemaForm({ ...props, schema }),
      // Add utility methods
      getDefaults: () => {
        // Extract default values from schema
        try {
          return schema.parse({});
        } catch {
          return {};
        }
      },
    };
  },

  /**
   * Quick form creation with common patterns
   */
  quick: {
    // Common form patterns
    contact: () =>
      zodiac.form({
        name: field.text({ placeholder: "Full Name" }),
        email: field.email(),
        phone: field.phone(),
        message: field.textarea({ placeholder: "Your message..." }),
      }),

    signup: () =>
      zodiac.form({
        firstName: field.text({ placeholder: "First Name" }),
        lastName: field.text({ placeholder: "Last Name" }),
        email: field.email(),
        password: field.password(),
        agreeToTerms: field.checkbox(),
      }),

    profile: () =>
      zodiac.form({
        name: field.text({ placeholder: "Display Name" }),
        email: field.email(),
        bio: field.textarea({ placeholder: "Tell us about yourself..." }),
        website: field.url(),
        avatar: field.image(),
      }),

    survey: () =>
      zodiac.form({
        satisfaction: field.rating(5, { icon: "star" }),
        recommendation: field.slider({ min: 0, max: 10 }),
        category: field.select(["product", "service", "support", "other"]),
        feedback: field.textarea({ placeholder: "Additional feedback..." }),
        followUp: field.checkbox(),
      }),
  },

  // Expose field builders for custom use
  field,
};

export default zodiac;
