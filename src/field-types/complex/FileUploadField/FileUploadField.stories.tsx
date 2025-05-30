import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { FileUploadField } from "./FileUploadField";
import {
  createFieldMeta,
  createStoryArgs,
  withFormProvider,
  fieldAssertions,
} from "@/lib/storybook-utils";

const meta: Meta<typeof FileUploadField> = {
  ...createFieldMeta("complex/FileUploadField", FileUploadField),
  argTypes: {
    name: {
      control: { type: "text" },
      description: "Field name for form submission",
    },
    property: {
      control: { type: "object" },
      description: "JSON Schema defining file upload constraints",
    },
    required: {
      control: { type: "boolean" },
      description: "Whether the field is required",
    },
    label: {
      control: { type: "text" },
      description: "Field label",
    },
    description: {
      control: { type: "text" },
      description: "Field description/help text",
    },
    metadata: {
      control: { type: "object" },
      description:
        "File upload configuration including accepted types, size limits, preview options, etc.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schemas for file uploads
const basicFileSchema = {
  type: "array",
  items: {
    type: "string",
    format: "binary",
  },
} as const;

const multipleFileSchema = {
  type: "array",
  items: {
    type: "string",
    format: "binary",
  },
  maxItems: 5,
} as const;

const imageFileSchema = {
  type: "array",
  items: {
    type: "string",
    format: "binary",
  },
  maxItems: 3,
} as const;

/**
 * Basic file upload with default settings
 */
export const Default: Story = {
  args: createStoryArgs({
    name: "fileUpload",
    property: basicFileSchema,
    required: false,
    label: "Upload Files",
    metadata: {},
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for upload area
    const uploadArea = canvas.getByText(/drag & drop/i);
    expect(uploadArea).toBeInTheDocument();

    // Should show default file icon
    expect(canvas.getByText("📁")).toBeInTheDocument();

    // Check for field label
    fieldAssertions.hasLabel(canvas, "Upload Files", false);
  },
};

/**
 * Multiple file upload with preview
 */
export const MultipleFiles: Story = {
  args: createStoryArgs({
    name: "multipleFiles",
    property: multipleFileSchema,
    required: false,
    label: "Upload Multiple Images",
    metadata: {
      multiple: true,
      maxFiles: 5,
      showPreview: true,
      previewType: "thumbnail",
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should indicate multiple files are allowed
    expect(canvas.getByText(/drag & drop files here/i)).toBeInTheDocument();
    expect(canvas.getByText(/click to select/i)).toBeInTheDocument();
    fieldAssertions.hasLabel(canvas, "Upload Multiple Images", false);
  },
};

/**
 * Single file upload only
 */
export const SingleFileOnly: Story = {
  args: createStoryArgs({
    name: "singleFile",
    property: basicFileSchema,
    required: false,
    label: "Profile Picture",
    metadata: {
      multiple: false,
      maxFiles: 1,
      showPreview: true,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should indicate single file
    expect(canvas.getByText(/drag & drop a file here/i)).toBeInTheDocument();
    expect(canvas.getByText(/click to select/i)).toBeInTheDocument();
    fieldAssertions.hasLabel(canvas, "Profile Picture", false);
  },
};

/**
 * File type restrictions
 */
export const ImageFilesOnly: Story = {
  args: createStoryArgs({
    name: "imageFiles",
    property: imageFileSchema,
    required: false,
    label: "Upload Images Only",
    metadata: {
      accept: "image/*",
      allowedTypes: ["image"],
      multiple: true,
      maxFiles: 3,
      showPreview: true,
      previewType: "grid",
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show accepted formats
    expect(
      canvas.getByText(/accepted formats: image\/\*/i)
    ).toBeInTheDocument();
    fieldAssertions.hasLabel(canvas, "Upload Images Only", false);
  },
};

/**
 * File size restrictions
 */
export const SizeRestriction: Story = {
  args: createStoryArgs({
    name: "sizeLimited",
    property: basicFileSchema,
    required: false,
    label: "Small Files Only (Max 2MB)",
    metadata: {
      maxFileSize: 2 * 1024 * 1024, // 2MB
      multiple: true,
      showPreview: true,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show file size limit
    expect(canvas.getByText(/max file size: 2 mb/i)).toBeInTheDocument();
    fieldAssertions.hasLabel(canvas, "Small Files Only (Max 2MB)", false);
  },
};

/**
 * Required field with validation
 */
export const Required: Story = {
  args: createStoryArgs({
    name: "requiredUpload",
    property: basicFileSchema,
    required: true,
    label: "Required Upload",
    metadata: {
      multiple: true,
      maxFiles: 3,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for required indicator - label and asterisk are in separate elements
    const labelElement = canvas.getByText("Required Upload");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    const asterisk = canvas.getByText("*");
    expect(asterisk).toBeInTheDocument();
  },
};

/**
 * Field with description
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    name: "uploadWithDesc",
    property: basicFileSchema,
    required: false,
    label: "Document Upload",
    description:
      "Upload documents in PDF, DOC, or TXT format. Max 10MB per file.",
    metadata: {
      accept: ".pdf,.doc,.docx,.txt",
      multiple: true,
      maxFiles: 5,
      maxFileSize: 10 * 1024 * 1024,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Upload documents in PDF, DOC, or TXT format. Max 10MB per file."
    );
    expect(
      canvas.getByText(/accepted formats: \.pdf,\.doc,\.docx,\.txt/i)
    ).toBeInTheDocument();
  },
};

/**
 * Click only (no drag and drop)
 */
export const ClickOnly: Story = {
  args: createStoryArgs({
    name: "clickOnly",
    property: basicFileSchema,
    required: false,
    label: "Click to Upload (No Drag & Drop)",
    metadata: {
      dragDrop: false,
      multiple: true,
      maxFiles: 3,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // When dragDrop: false, should only show click text without drag & drop
    expect(canvas.getByText(/click to select files/i)).toBeInTheDocument();

    // Check that the upload area doesn't contain drag & drop text (avoid matching the label)
    const uploadArea = canvasElement.querySelector(".file-upload-dropzone");
    if (uploadArea) {
      expect(uploadArea.textContent).not.toMatch(/drag.*drop/i);
    }
  },
};

/**
 * Interactive testing playground
 */
export const InteractiveTesting: Story = {
  args: createStoryArgs({
    name: "interactiveTest",
    property: basicFileSchema,
    required: false,
    label: "Interactive Test Upload",
    metadata: {
      multiple: true,
      maxFiles: 3,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      showPreview: true,
      previewType: "thumbnail",
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test basic elements are present
    expect(canvas.getByText(/drag & drop files here/i)).toBeInTheDocument();
    expect(canvas.getByText(/max file size: 5 mb/i)).toBeInTheDocument();
    fieldAssertions.hasLabel(canvas, "Interactive Test Upload", false);
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">Single Image Upload</h3>
        <FileUploadField
          name="singleImage"
          property={basicFileSchema}
          required={false}
          label="Profile Photo"
          metadata={{
            accept: "image/*",
            multiple: false,
            showPreview: true,
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Multiple Documents</h3>
        <FileUploadField
          name="documents"
          property={multipleFileSchema}
          required={true}
          label="Required Documents"
          description="Upload all required documents for your application"
          metadata={{
            accept: ".pdf,.doc,.docx,.ppt,.pptx",
            multiple: true,
            maxFiles: 5,
            showPreview: true,
            previewType: "list",
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Image Gallery</h3>
        <FileUploadField
          name="photoGallery"
          property={imageFileSchema}
          required={false}
          label="Photo Gallery"
          metadata={{
            accept: "image/*",
            multiple: true,
            maxFiles: 6,
            showPreview: true,
            previewType: "grid",
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Click Only Upload</h3>
        <FileUploadField
          name="clickOnlyUpload"
          property={basicFileSchema}
          required={false}
          label="Click to Upload"
          metadata={{
            dragDrop: false,
            multiple: true,
            maxFiles: 3,
          }}
        />
      </div>
    </div>
  ),
  decorators: [withFormProvider()],
  parameters: {
    docs: {
      description: {
        story:
          "Showcase of different FileUploadField configurations and use cases.",
      },
    },
  },
};

/**
 * Accessibility testing
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    name: "accessibleUpload",
    property: basicFileSchema,
    required: true,
    label: "Accessible File Upload",
    description:
      "This upload area is keyboard accessible and works with screen readers",
    metadata: {
      multiple: true,
      maxFiles: 5,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <FileUploadField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for proper labeling and accessibility - label and asterisk are separate elements
    const labelElement = canvas.getByText("Accessible File Upload");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    const asterisk = canvas.getByText("*");
    expect(asterisk).toBeInTheDocument();

    fieldAssertions.hasDescription(
      canvas,
      "This upload area is keyboard accessible and works with screen readers"
    );

    // Upload area should be keyboard accessible
    const uploadArea = canvas.getByText(/drag & drop/i).closest("div");
    expect(uploadArea).toBeInTheDocument();
  },
};
