"use client";

import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import { useFieldMetadata } from "@/hooks";
import {
  isStringSchema,
  isNumberSchema,
  isBooleanSchema,
  isArraySchema,
  hasEnum,
  isTextareaField,
  isSliderField,
  isFileUploadField,
  isSignatureField,
  isRichTextField,
  isDateRangeField,
  isAddressField,
  isArrayRepeaterField,
  isRadioField,
  isCheckboxGroupField,
  isDateField,
  isDateTimeField,
  isTimeField,
  isRatingField,
} from "@/utils";
import {
  SelectField,
  TextareaField,
  NumberField,
  SliderField,
  SwitchField,
  FileUploadField,
  ListField,
  SignatureField,
  TextField,
  RadioField,
  CheckboxGroupField,
  DateField,
  DateTimeField,
  TimeField,
  RatingField,
} from "@/field-types";

type SchemaFieldProps = {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  description?: string;
  disabled?: boolean;
};

export function SchemaField({
  name,
  property,
  required,
  description: customDescription,
  disabled = false,
}: SchemaFieldProps) {
  const formContext = useFormContext();
  const { metadata, label, description } = useFieldMetadata(
    name,
    property,
    customDescription
  );

  if (!formContext) {
    return null;
  }

  // Enum field with radio buttons
  if (hasEnum(property) && isRadioField(metadata)) {
    return (
      <RadioField
        name={name}
        property={
          property as z.core.JSONSchema.Schema & { enum: readonly unknown[] }
        }
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Enum field with checkbox group (for multi-select)
  if (hasEnum(property) && isCheckboxGroupField(metadata)) {
    return (
      <CheckboxGroupField
        name={name}
        property={
          property as z.core.JSONSchema.Schema & { enum: readonly unknown[] }
        }
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Enum field (Select) - check for enum first, type second
  // Note: Zod-generated enum schemas might not have explicit type: "string"
  if (hasEnum(property)) {
    return (
      <SelectField
        name={name}
        property={
          property as z.core.JSONSchema.Schema & { enum: readonly unknown[] }
        }
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // String field with enum (Select) - fallback for schemas that DO have explicit type
  if (isStringSchema(property) && hasEnum(property)) {
    return (
      <SelectField
        name={name}
        property={
          property as z.core.JSONSchema.Schema & { enum: readonly unknown[] }
        }
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Date field
  if (isStringSchema(property) && isDateField(metadata)) {
    return (
      <DateField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // DateTime field
  if (isStringSchema(property) && isDateTimeField(metadata)) {
    return (
      <DateTimeField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Time field
  if (isStringSchema(property) && isTimeField(metadata)) {
    return (
      <TimeField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // String field rendered as textarea
  if (isStringSchema(property) && isTextareaField(metadata)) {
    return (
      <TextareaField
        name={name}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Regular string field
  if (isStringSchema(property)) {
    return (
      <TextField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Number field with rating
  if (isNumberSchema(property) && isRatingField(metadata)) {
    return (
      <RatingField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Number field with slider
  if (isNumberSchema(property) && isSliderField(metadata)) {
    return (
      <SliderField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Regular number field
  if (isNumberSchema(property)) {
    return (
      <NumberField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
        disabled={disabled}
      />
    );
  }

  // Boolean field
  if (isBooleanSchema(property)) {
    return (
      <SwitchField
        name={name}
        required={required}
        label={label}
        description={description}
        disabled={disabled}
      />
    );
  }

  // Array field with checkbox group (for multi-select with enum items)
  if (isArraySchema(property) && isCheckboxGroupField(metadata)) {
    // Extract enum from items for checkbox group
    const items = property.items as z.core.JSONSchema.Schema;
    if (items && hasEnum(items)) {
      return (
        <CheckboxGroupField
          name={name}
          property={
            items as z.core.JSONSchema.Schema & { enum: readonly unknown[] }
          }
          required={required}
          label={label}
          description={description}
          metadata={metadata}
          disabled={disabled}
        />
      );
    }
  }

  // Array field
  if (isArraySchema(property)) {
    return (
      <ListField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
      />
    );
  }

  // File upload field - use metadata-based detection
  if (isFileUploadField(metadata)) {
    return (
      <FileUploadField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
      />
    );
  }

  // Signature field - use metadata-based detection
  if (isSignatureField(metadata)) {
    return (
      <SignatureField
        name={name}
        property={property}
        required={required}
        label={label}
        description={description}
        metadata={metadata}
      />
    );
  }

  // Rich text field - use metadata-based detection
  if (isStringSchema(property) && isRichTextField(metadata)) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-sm text-gray-600">
            Rich text editor would render here
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Detected: mode={metadata.mode}, toolbar=
            {JSON.stringify(metadata.toolbar)}
          </p>
        </div>
      </div>
    );
  }

  // Date range field - use metadata-based detection
  if (isStringSchema(property) && isDateRangeField(metadata)) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="p-4 border rounded-md bg-blue-50">
          <p className="text-sm text-gray-600">
            Date range picker would render here
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Detected: rangeType={metadata.rangeType}, presets=
            {metadata.presets?.length} items
          </p>
        </div>
      </div>
    );
  }

  // Address field - use metadata-based detection
  if (isStringSchema(property) && isAddressField(metadata)) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="p-4 border rounded-md bg-green-50">
          <p className="text-sm text-gray-600">
            Address input would render here
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Detected: addressType={metadata.addressType}, geocoding=
            {metadata.enableGeocoding}
          </p>
        </div>
      </div>
    );
  }

  // Array repeater field - use metadata-based detection
  if (isArraySchema(property) && isArrayRepeaterField(metadata)) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="p-4 border rounded-md bg-purple-50">
          <p className="text-sm text-gray-600">
            Array repeater would render here
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Detected: minItems={metadata.minItems}, maxItems={metadata.maxItems}
            , reorderable={metadata.allowReorder}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TextField
      name={name}
      property={property}
      required={required}
      label={label}
      description={description}
      metadata={metadata}
    />
  );
}
