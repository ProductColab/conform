import { z } from "zod/v4";
import { Rule, RuleSet } from "./rule.schema";

/**
 * Dedicated Zod schemas for field metadata subgroups.
 */

// Input type control
export const InputTypeSchema = z.enum([
  "text",
  "password",
  "email",
  "url",
  "tel",
  "search",
  "number",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
  "color",
]);

// Special formats
export const FormatSchema = z.enum([
  "textarea",
  "select",
  "multiselect",
  "slider",
  "switch",
  "radio",
  "checkbox-group",
  // Advanced field types
  "file-upload",
  "rich-text",
  "date-range",
  "address",
  "signature",
  "array-repeater",
]);

// Number/slider specific
export const NumberSliderSchema = z.object({
  step: z.number().optional(),
  showSlider: z.boolean().optional(),
  marks: z.record(z.number(), z.string()).optional(),
});

// Select/multiselect specific
export const SelectSchema = z.object({
  allowCustomValues: z.boolean().optional(),
  searchable: z.boolean().optional(),
});

// Textarea specific
export const TextareaSchema = z.object({
  rows: z.number().optional(),
  resizable: z.boolean().optional(),
});

// UI customization
export const UICustomizationSchema = z.object({
  placeholder: z.string().optional(),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
  icon: z.string().optional(),
});

// Validation display hints
export const ValidationDisplaySchema = z.object({
  showCounter: z.boolean().optional(),
  showStrengthMeter: z.boolean().optional(),
});

// Security and privacy
export const SecuritySchema = z.object({
  encrypted: z.boolean().optional(),
});

// Advanced UI hints
export const AdvancedUISchema = z.object({
  warningText: z.string().optional(),
  confirmRequired: z.boolean().optional(),
});

// Conditional display - NEW: Using the flexible rules system
export const ConditionalDisplaySchema = z.object({
  // Legacy support (deprecated)
  dependsOn: z.string().optional(),
  showWhen: z.unknown().optional(),

  // NEW: Flexible rules system
  rules: z.array(Rule).optional(),
  ruleSet: RuleSet.optional(),
});

// Accessibility
export const AccessibilitySchema = z.object({
  ariaLabel: z.string().optional(),
  ariaDescription: z.string().optional(),
});

// File upload specific
export const FileUploadSchema = z.object({
  accept: z.string().optional(), // MIME types: "image/*", ".pdf,.doc"
  multiple: z.boolean().optional(),
  maxFiles: z.number().optional(),
  maxFileSize: z.number().optional(), // bytes
  dragDrop: z.boolean().optional(),
  showPreview: z.boolean().optional(),
  previewType: z.enum(["thumbnail", "list", "grid"]).optional(),
  uploadOnChange: z.boolean().optional(), // vs manual upload
  allowedTypes: z.array(z.string()).optional(), // ["image", "document", "video"]
  compressionOptions: z
    .object({
      enabled: z.boolean(),
      quality: z.number().min(0).max(1),
      maxWidth: z.number().optional(),
      maxHeight: z.number().optional(),
    })
    .optional(),
});

// Rich text editor specific
export const RichTextSchema = z.object({
  mode: z.enum(["wysiwyg", "markdown", "hybrid"]).optional(),
  toolbar: z
    .array(
      z.enum(["bold", "italic", "link", "image", "code", "quote", "underline"])
    )
    .optional(),
  plugins: z.enum(["tables", "code", "emoji"]).optional(),
  maxLength: z.number().optional(),
  allowImages: z.boolean().optional(),
  allowTables: z.boolean().optional(),
  allowCodeBlocks: z.boolean().optional(),
  syntaxHighlighting: z.boolean().optional(),
  spellCheck: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  placeholder: z.string().optional(),
});

// Date/time range specific
export const DateRangeSchema = z.object({
  rangeType: z.enum(["date", "datetime", "time"]).optional(),
  allowSingleDate: z.boolean().optional(), // Can select just start date
  minDate: z.string().optional(), // ISO date string
  maxDate: z.string().optional(),
  disabledDates: z.array(z.string()).optional(),
  presets: z
    .array(
      z.object({
        label: z.string(),
        value: z.object({
          start: z.string(),
          end: z.string(),
        }),
      })
    )
    .optional(), // "Last 7 days", "This month", etc.
  showTimezone: z.boolean().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(), // "MM/DD/YYYY"
});

// Address/location specific
export const AddressSchema = z.object({
  addressType: z
    .enum(["full", "street-only", "city-state", "country-only"])
    .optional(),
  enableGeocoding: z.boolean().optional(),
  enableAutocomplete: z.boolean().optional(),
  showMap: z.boolean().optional(),
  mapProvider: z.enum(["google", "mapbox", "osm"]).optional(),
  mapZoom: z.number().optional(),
  requireValidAddress: z.boolean().optional(),
  countries: z.array(z.string()).optional(), // Restrict to specific countries
  fields: z
    .object({
      street: z.boolean().optional(),
      city: z.boolean().optional(),
      state: z.boolean().optional(),
      zipCode: z.boolean().optional(),
      country: z.boolean().optional(),
      latitude: z.boolean().optional(),
      longitude: z.boolean().optional(),
    })
    .optional(),
});

// Signature capture specific
export const SignatureSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  penColor: z.string().optional(),
  penWidth: z.number().optional(),
  backgroundColor: z.string().optional(),
  outputFormat: z.enum(["png", "svg", "jpeg"]).optional(),
  showClearButton: z.boolean().optional(),
  showUndoButton: z.boolean().optional(),
  required: z.boolean().optional(),
  saveAsDataUrl: z.boolean().optional(),
  compressionLevel: z.number().min(0).max(1).optional(),
});

// Array/repeater fields specific
export const ArrayRepeaterSchema = z.object({
  minItems: z.number().optional(),
  maxItems: z.number().optional(),
  allowReorder: z.boolean().optional(),
  showAddButton: z.boolean().optional(),
  showRemoveButton: z.boolean().optional(),
  addButtonText: z.string().optional(),
  removeButtonText: z.string().optional(),
  itemTemplate: z
    .object({
      title: z.string().optional(), // Template for item titles: "Item {index}"
      collapsible: z.boolean().optional(),
      defaultExpanded: z.boolean().optional(),
    })
    .optional(),
  validation: z
    .object({
      validateItems: z.boolean().optional(),
      stopOnFirstError: z.boolean().optional(),
    })
    .optional(),
});

// Rating field specific
export const RatingSchema = z.object({
  max: z.number().optional(), // Maximum rating value (default: 5)
  allowHalf: z.boolean().optional(), // Allow half-star ratings
  showValue: z.boolean().optional(), // Show numeric value alongside stars
  icon: z.enum(["star", "heart", "thumb", "circle"]).optional(), // Rating icon type
  size: z.enum(["sm", "md", "lg"]).optional(), // Icon size
  color: z.string().optional(), // Custom color for filled icons
});

// Add to the FieldMetadata interface
export interface FieldExamples {
  /** Basic example value */
  basic?: unknown;
  /** Edge case examples (min/max values, empty, etc.) */
  edgeCases?: unknown[];
  /** Realistic example data for documentation */
  realistic?: unknown[];
  /** Invalid examples that should fail validation */
  invalid?: unknown[];
}

// Single comprehensive field metadata schema
// No discriminated union - components use duck typing based on property presence
export const FieldMetadataSchema = z.object({
  // Basic UI properties
  inputType: InputTypeSchema.optional(),
  format: FormatSchema.optional(),

  // UI customization
  ...UICustomizationSchema.shape,

  // Validation display hints
  ...ValidationDisplaySchema.shape,

  // Security and privacy
  ...SecuritySchema.shape,

  // Advanced UI hints
  ...AdvancedUISchema.shape,

  // Conditional display
  ...ConditionalDisplaySchema.shape,

  // Accessibility
  ...AccessibilitySchema.shape,

  // Textarea properties (if present, render as textarea)
  ...TextareaSchema.shape,

  // Number/slider properties (if present, render as slider)
  ...NumberSliderSchema.shape,

  // Select properties (if present, enable select features)
  ...SelectSchema.shape,

  // File upload properties (if present, render as file upload)
  ...FileUploadSchema.shape,

  // Rich text properties (if present, render as rich text editor)
  ...RichTextSchema.shape,

  // Date range properties (if present, render as date range picker)
  ...DateRangeSchema.shape,

  // Address properties (if present, render as address input)
  ...AddressSchema.shape,

  // Signature properties (if present, render as signature pad)
  ...SignatureSchema.shape,

  // Array/repeater properties (if present, render as repeater)
  ...ArrayRepeaterSchema.shape,

  // Rating properties (if present, render as rating field)
  ...RatingSchema.shape,

  /**
   * Examples for documentation, testing, and demos
   * If not provided, examples will be auto-generated
   */
  examples: z.custom<FieldExamples>().optional(),
});

export type FieldMetadata = z.infer<typeof FieldMetadataSchema>;
