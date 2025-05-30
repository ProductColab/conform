import { z } from "zod/v4";
import { createField } from "../lib/fieldUtils";
import type { FieldMetadata } from "@/schemas";

/**
 * Common field presets using the new createField API with registry system
 */
export const FieldPresets = {
  // Basic text fields
  email: createField(z.string().email(), {
    inputType: "email",
    placeholder: "user@example.com",
  }),

  password: createField(z.string().min(8), {
    inputType: "password",
    encrypted: true,
    showStrengthMeter: true,
  }),

  url: createField(z.string().url(), {
    inputType: "url",
    placeholder: "https://example.com",
  }),

  phone: createField(z.string(), {
    inputType: "tel",
    placeholder: "+1 (555) 123-4567",
  }),

  // Textarea fields
  bio: createField(z.string().min(10), {
    rows: 4,
    resizable: true,
  }),

  textarea: createField(z.string(), {
    rows: 4,
    resizable: true,
  }),

  // Numeric fields
  age: createField(z.number().min(0).max(150), {
    inputType: "number",
    step: 1,
  }),

  rating: createField(z.number().min(1).max(5), {
    showSlider: true,
    max: 5,
    allowHalf: true,
    showValue: true,
  }),

  percentage: createField(z.number().min(0).max(100), {
    inputType: "number",
    suffix: "%",
    step: 0.1,
    showSlider: true,
  }),

  currency: createField(z.number().min(0), {
    inputType: "number",
    prefix: "$",
    step: 0.01,
  }),

  // File upload fields
  avatar: createField(z.string(), {
    accept: "image/*",
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    dragDrop: true,
    showPreview: true,
    previewType: "thumbnail",
    compressionOptions: {
      enabled: true,
      quality: 0.8,
      maxWidth: 300,
      maxHeight: 300,
    },
  }),

  documents: createField(z.array(z.string()), {
    accept: ".pdf,.doc,.docx,.txt",
    multiple: true,
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    dragDrop: true,
    showPreview: true,
    previewType: "list",
  }),

  // Date/Time fields
  birthDate: createField(z.string(), {
    inputType: "date",
    maxDate: new Date().toISOString().split("T")[0], // Today
  }),

  appointmentDateTime: createField(z.string(), {
    inputType: "datetime-local",
  }),

  // Selection fields
  singleChoice: createField(z.enum(["option1", "option2", "option3"]), {
    format: "radio",
  }),

  multiChoice: createField(z.array(z.enum(["tag1", "tag2", "tag3"])), {
    format: "checkbox-group",
  }),

  // Rich text
  blogPost: createField(z.string().min(50), {
    mode: "wysiwyg",
    toolbar: ["bold", "italic", "link", "image", "code"],
    allowImages: true,
    allowCodeBlocks: true,
    syntaxHighlighting: true,
    autoSave: true,
  }),

  // Signature
  signature: createField(z.string(), {
    width: 400,
    height: 200,
    penColor: "#000000",
    backgroundColor: "#ffffff",
    outputFormat: "png",
    showClearButton: true,
  }),
} as const;

export const longTextPreset: FieldMetadata = {
  rows: 8,
  resizable: true,
  showCounter: true,
};

// Image upload preset
export const imageUploadPreset: FieldMetadata = {
  accept: "image/*",
  multiple: false,
  maxFiles: 1,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  dragDrop: true,
  showPreview: true,
  previewType: "thumbnail",
  uploadOnChange: true,
  allowedTypes: ["image"],
  compressionOptions: {
    enabled: true,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
  },
};

// Documents upload preset
export const documentsPreset: FieldMetadata = {
  accept: ".pdf,.doc,.docx,.txt",
  multiple: true,
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  dragDrop: true,
  showPreview: true,
  previewType: "list",
  allowedTypes: ["document"],
};

// Blog post rich text editor preset
export const blogPostPreset: FieldMetadata = {
  mode: "wysiwyg",
  toolbar: ["bold", "italic", "underline", "link", "image", "quote", "code"],
  allowImages: true,
  syntaxHighlighting: true,
  spellCheck: true,
  autoSave: true,
};

// Date range picker preset
export const dateRangePreset: FieldMetadata = {
  rangeType: "date",
  allowSingleDate: false,
  presets: [
    { label: "Last 7 days", value: { start: "2023-01-01", end: "2023-01-07" } },
    {
      label: "Last 30 days",
      value: { start: "2023-01-01", end: "2023-01-30" },
    },
    { label: "This month", value: { start: "2023-01-01", end: "2023-01-31" } },
  ],
  showTimezone: true,
  timezone: "UTC",
};

// Address field preset
export const addressPreset: FieldMetadata = {
  addressType: "full",
  enableGeocoding: true,
  enableAutocomplete: true,
  showMap: false,
  requireValidAddress: true,
};

// Basic signature preset
export const signaturePreset: FieldMetadata = {
  width: 400,
  height: 200,
  penColor: "#000000",
  penWidth: 2,
  backgroundColor: "rgba(255,255,255,0)",
  outputFormat: "png",
  showClearButton: true,
  showUndoButton: false,
  saveAsDataUrl: true,
  compressionLevel: 0.8,
};

// Legal document signature preset
export const legalSignaturePreset: FieldMetadata = {
  width: 500,
  height: 150,
  penColor: "#000080",
  penWidth: 1,
  backgroundColor: "#f8f9fa",
  outputFormat: "png",
  showClearButton: true,
  showUndoButton: true,
  required: true,
  saveAsDataUrl: true,
  compressionLevel: 0.9,
};

// Contract signature preset
export const contractSignaturePreset: FieldMetadata = {
  width: 600,
  height: 200,
  penColor: "#000000",
  penWidth: 2,
  backgroundColor: "rgba(255,255,255,1)",
  outputFormat: "svg",
  showClearButton: false,
  showUndoButton: true,
  required: true,
  saveAsDataUrl: false,
};

// Contact list array repeater preset
export const contactListPreset: FieldMetadata = {
  allowReorder: true,
  minItems: 1,
  maxItems: 10,
  showAddButton: true,
  showRemoveButton: true,
  addButtonText: "Add Contact",
  removeButtonText: "Remove",
  itemTemplate: {
    title: "Contact {index}",
    collapsible: true,
    defaultExpanded: false,
  },
  validation: {
    validateItems: true,
    stopOnFirstError: false,
  },
};
