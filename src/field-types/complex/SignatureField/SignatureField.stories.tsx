import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";
import { SignatureField } from "./SignatureField";
import {
  createFieldMeta,
  createStoryArgs,
  withFormProvider,
} from "@/lib/storybook-utils";

const meta: Meta<typeof SignatureField> = {
  ...createFieldMeta("complex/SignatureField", SignatureField),
  argTypes: {
    name: {
      control: { type: "text" },
      description: "Field name for form submission",
    },
    property: {
      control: { type: "object" },
      description: "JSON Schema defining signature field constraints",
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
        "Signature configuration including canvas size, pen settings, output format, button visibility, etc.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schemas for signature fields
const basicSignatureSchema = {
  type: "string",
  format: "uri",
  description: "Base64 encoded signature image or signature point data",
} as const;

const signatureDataSchema = {
  type: "array",
  items: {
    type: "array",
    items: {
      type: "object",
      properties: {
        x: { type: "number" },
        y: { type: "number" },
        time: { type: "number" },
      },
    },
  },
  description: "Signature point data for precise storage",
} as const;

/**
 * Basic signature field with default settings
 */
export const Default: Story = {
  args: createStoryArgs({
    name: "signature",
    property: basicSignatureSchema,
    required: false,
    label: "Your Signature",
    metadata: {},
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for field label - use more flexible text matching
    const labelElement = canvas.getByText("Your Signature");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for buttons (these should be easier to find than canvas elements)
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toBeDisabled(); // Should be disabled when empty

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toBeDisabled(); // Should be disabled when empty
  },
};

/**
 * Required signature field
 */
export const Required: Story = {
  args: createStoryArgs({
    name: "requiredSignature",
    property: basicSignatureSchema,
    required: true,
    label: "Legal Signature Required",
    metadata: {
      width: 500,
      height: 150,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-2xl">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for required indicator - label and asterisk are in separate elements
    const labelElement = canvas.getByText("Legal Signature Required");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    const asterisk = canvas.getByText("*");
    expect(asterisk).toBeInTheDocument();

    // Check for basic controls
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * Signature field with description
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    name: "documentSignature",
    property: basicSignatureSchema,
    required: false,
    label: "Document Signature",
    description:
      "Please sign above to acknowledge that you have read and understood the terms",
    metadata: {
      width: 450,
      height: 180,
      penColor: "#1f2937",
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("Document Signature");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Please sign above to acknowledge that you have read and understood the terms"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check for basic controls
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * Customized pen and canvas settings
 */
export const CustomPenSettings: Story = {
  args: createStoryArgs({
    name: "customSignature",
    property: basicSignatureSchema,
    required: false,
    label: "Custom Pen Signature",
    description: "Blue pen with thicker stroke on larger canvas",
    metadata: {
      width: 600,
      height: 250,
      penColor: "#2563eb",
      penWidth: 4,
      backgroundColor: "#f8fafc",
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-4xl">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("Custom Pen Signature");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Blue pen with thicker stroke on larger canvas"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check for controls
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * With undo functionality enabled
 */
export const WithUndoButton: Story = {
  args: createStoryArgs({
    name: "undoSignature",
    property: basicSignatureSchema,
    required: false,
    label: "Signature with Undo",
    description: "You can undo individual strokes",
    metadata: {
      width: 400,
      height: 200,
      showUndoButton: true,
      penColor: "#059669",
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("Signature with Undo");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for undo button
    const undoButton = canvas.getByText("Undo");
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).toBeDisabled(); // Should be disabled when no strokes

    // Check for clear button
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * Minimal interface without clear button
 */
export const MinimalInterface: Story = {
  args: createStoryArgs({
    name: "minimalSignature",
    property: basicSignatureSchema,
    required: false,
    label: "Minimal Signature Pad",
    metadata: {
      width: 350,
      height: 150,
      showClearButton: false,
      showUndoButton: false,
      penColor: "#374151",
      penWidth: 2,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-md">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("Minimal Signature Pad");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Should only have download button
    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();

    // Should not have clear or undo buttons
    expect(canvas.queryByText("Clear")).not.toBeInTheDocument();
    expect(canvas.queryByText("Undo")).not.toBeInTheDocument();
  },
};

/**
 * PNG output format with compression
 */
export const PngOutput: Story = {
  args: createStoryArgs({
    name: "pngSignature",
    property: basicSignatureSchema,
    required: false,
    label: "PNG Signature (High Quality)",
    description: "Saves as PNG format with no compression",
    metadata: {
      outputFormat: "png",
      saveAsDataUrl: true,
      compressionLevel: 1.0,
      width: 400,
      height: 180,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("PNG Signature (High Quality)");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Saves as PNG format with no compression"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check for controls
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * JPEG output format with compression
 */
export const JpegOutput: Story = {
  args: createStoryArgs({
    name: "jpegSignature",
    property: basicSignatureSchema,
    required: false,
    label: "JPEG Signature (Compressed)",
    description: "Saves as JPEG format with 60% quality for smaller file size",
    metadata: {
      outputFormat: "jpeg",
      saveAsDataUrl: true,
      compressionLevel: 0.6,
      width: 400,
      height: 180,
      backgroundColor: "#ffffff", // JPEG doesn't support transparency
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("JPEG Signature (Compressed)");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Saves as JPEG format with 60% quality for smaller file size"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check for controls
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * SVG output format for vector graphics
 */
export const SvgOutput: Story = {
  args: createStoryArgs({
    name: "svgSignature",
    property: basicSignatureSchema,
    required: false,
    label: "SVG Signature (Vector)",
    description:
      "Saves as scalable vector graphics for crisp display at any size",
    metadata: {
      outputFormat: "svg",
      saveAsDataUrl: true,
      width: 400,
      height: 180,
      penColor: "#7c3aed",
      penWidth: 3,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("SVG Signature (Vector)");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Saves as scalable vector graphics for crisp display at any size"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check for controls
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * Point data storage instead of image
 */
export const PointDataStorage: Story = {
  args: createStoryArgs({
    name: "pointDataSignature",
    property: signatureDataSchema,
    required: false,
    label: "Point Data Signature",
    description:
      "Stores signature as coordinate points for maximum flexibility",
    metadata: {
      saveAsDataUrl: false, // Save as point data instead
      width: 450,
      height: 200,
      showUndoButton: true,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("Point Data Signature");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Stores signature as coordinate points for maximum flexibility"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Should have undo button
    const undoButton = canvas.getByText("Undo");
    expect(undoButton).toBeInTheDocument();

    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * Interactive testing playground
 */
export const InteractiveTesting: Story = {
  args: createStoryArgs({
    name: "interactiveSignature",
    property: basicSignatureSchema,
    required: false,
    label: "Interactive Test Signature",
    description: "Try drawing, clearing, and downloading",
    metadata: {
      width: 500,
      height: 220,
      showUndoButton: true,
      penColor: "#dc2626",
      penWidth: 3,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-2xl">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("Interactive Test Signature");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Try drawing, clearing, and downloading"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check all buttons are present
    const clearButton = canvas.getByText("Clear");
    const undoButton = canvas.getByText("Undo");
    const downloadButton = canvas.getByText("Download");

    expect(clearButton).toBeInTheDocument();
    expect(undoButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();

    // All should be disabled initially
    expect(clearButton).toBeDisabled();
    expect(undoButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
  },
};

/**
 * Accessibility testing
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    name: "accessibleSignature",
    property: basicSignatureSchema,
    required: true,
    label: "Accessible Signature Field",
    description:
      "This signature field is designed for accessibility compliance",
    metadata: {
      width: 400,
      height: 200,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check proper labeling
    const labelElement = canvas.getByText("Accessible Signature Field");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    const asterisk = canvas.getByText("*");
    expect(asterisk).toBeInTheDocument();

    // Check for description
    const descriptionElement = canvas.getByText(
      "This signature field is designed for accessibility compliance"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check button accessibility
    const clearButton = canvas.getByText("Clear");
    const downloadButton = canvas.getByText("Download");
    expect(clearButton).toHaveAttribute("type", "button");
    expect(downloadButton).toHaveAttribute("type", "button");
  },
};

/**
 * Contract signing example
 */
export const ContractSigning: Story = {
  args: createStoryArgs({
    name: "contractSignature",
    property: basicSignatureSchema,
    required: true,
    label: "Contract Signature",
    description:
      "By signing below, you agree to the terms and conditions of this contract",
    metadata: {
      width: 500,
      height: 160,
      penColor: "#1f2937",
      penWidth: 2,
      backgroundColor: "#fafafa",
      outputFormat: "png",
    },
  }),
  render: (args) => (
    <div className="p-6 max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Service Agreement</h3>
        <div className="bg-gray-50 p-4 rounded mb-6 text-sm">
          <p className="mb-2">
            I hereby acknowledge that I have read, understood, and agree to be
            bound by the terms and conditions set forth in this Service
            Agreement.
          </p>
          <p className="text-gray-600">
            This electronic signature has the same legal effect as a handwritten
            signature.
          </p>
        </div>
        <SignatureField {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for required signature field
    const labelElement = canvas.getByText("Contract Signature");
    expect(labelElement).toBeInTheDocument();

    const asterisk = canvas.getByText("*");
    expect(asterisk).toBeInTheDocument();

    // Check for description
    const descriptionElement = canvas.getByText(
      "By signing below, you agree to the terms and conditions of this contract"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check for controls
    const clearButton = canvas.getByText("Clear");
    expect(clearButton).toBeInTheDocument();

    const downloadButton = canvas.getByText("Download");
    expect(downloadButton).toBeInTheDocument();
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">Standard Signature</h3>
        <SignatureField
          name="standardSignature"
          property={basicSignatureSchema}
          required={false}
          label="Standard Signature Pad"
          metadata={{
            width: 400,
            height: 180,
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Pen & Colors</h3>
        <SignatureField
          name="customSignature"
          property={basicSignatureSchema}
          required={false}
          label="Custom Styled Signature"
          metadata={{
            width: 450,
            height: 200,
            penColor: "#7c3aed",
            penWidth: 4,
            backgroundColor: "#f1f5f9",
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">With Undo Functionality</h3>
        <SignatureField
          name="undoSignature"
          property={basicSignatureSchema}
          required={false}
          label="Signature with Undo"
          metadata={{
            width: 400,
            height: 180,
            showUndoButton: true,
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Minimal Interface</h3>
        <SignatureField
          name="minimalSignature"
          property={basicSignatureSchema}
          required={false}
          label="Minimal Signature"
          metadata={{
            width: 350,
            height: 150,
            showClearButton: false,
            showUndoButton: false,
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
          "Showcase of different SignatureField configurations and use cases.",
      },
    },
  },
};

/**
 * Playground for testing custom configurations
 */
export const Playground: Story = {
  args: createStoryArgs({
    name: "playgroundSignature",
    property: basicSignatureSchema,
    required: false,
    label: "Playground Signature",
    description: "Use the controls below to customize this signature field",
    metadata: {
      width: 400,
      height: 200,
      showUndoButton: true,
    },
  }),
  render: (args) => (
    <div className="p-4 max-w-lg">
      <SignatureField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label
    const labelElement = canvas.getByText("Playground Signature");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for description
    const descriptionElement = canvas.getByText(
      "Use the controls below to customize this signature field"
    );
    expect(descriptionElement).toBeInTheDocument();

    // Check all controls are present
    const clearButton = canvas.getByText("Clear");
    const undoButton = canvas.getByText("Undo");
    const downloadButton = canvas.getByText("Download");

    expect(clearButton).toBeInTheDocument();
    expect(undoButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
  },
};
