import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { RuleBuilder } from "./RuleBuilder";
import type { FieldSchemas } from "../lib/fieldUtils";
import { fieldMeta } from "../lib/fieldUtils";

// Demo field schemas following the established Zod pattern
const DEMO_FIELD_SCHEMAS: FieldSchemas = {
  email: {
    type: "string",
    title: "Email Address",
    description: "Email address with validation",
    format: "email",
    // Using .meta() to attach our field metadata (following the Zod pattern)
    metadata: fieldMeta({
      inputType: "email",
      placeholder: "user@example.com",
    }),
  } as any, // Type assertion needed for metadata

  name: {
    type: "string",
    title: "Full Name",
    description: "Person's full name",
    metadata: fieldMeta({
      placeholder: "Enter full name",
    }),
  } as any,

  city: {
    type: "string",
    title: "City",
    description: "City name",
    metadata: fieldMeta({
      placeholder: "Enter city name",
    }),
  } as any,

  age: {
    type: "number",
    title: "Age",
    description: "Age in years",
    minimum: 0,
    maximum: 150,
    metadata: fieldMeta({
      inputType: "number",
      step: 1,
    }),
  } as any,

  isActive: {
    type: "boolean",
    title: "Active Status",
    description: "Whether the user is active",
    metadata: fieldMeta({
      format: "switch",
    }),
  } as any,

  phoneNumber: {
    type: "string",
    title: "Phone Number",
    description: "Phone number with formatting",
    metadata: fieldMeta({
      inputType: "tel",
      placeholder: "+1 (555) 123-4567",
    }),
  } as any,

  website: {
    type: "string",
    title: "Website URL",
    description: "Personal or business website",
    format: "uri",
    metadata: fieldMeta({
      inputType: "url",
      placeholder: "https://example.com",
    }),
  } as any,

  salary: {
    type: "number",
    title: "Annual Salary",
    description: "Annual salary amount",
    minimum: 0,
    metadata: fieldMeta({
      inputType: "number",
      prefix: "$",
      step: 0.01,
    }),
  } as any,

  tags: {
    type: "array",
    title: "User Tags",
    description: "Tags for categorizing users",
    items: { type: "string" },
    metadata: fieldMeta({
      format: "checkbox-group",
    }),
  } as any,

  permissions: {
    type: "array",
    title: "User Permissions",
    description: "User access permissions",
    items: { type: "string" },
    metadata: fieldMeta({
      format: "multiselect",
    }),
  } as any,
};

const meta: Meta<typeof RuleBuilder> = {
  title: "Sprint 1/Visual Rule Builder",
  component: RuleBuilder,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# 🏃‍♂️ Sprint 1 MVP: Visual Rule Builder

**The team delivered BEYOND expectations!** Jordan & Sam built the code generation engine, Alex & Riley created the beautiful UI, and Emma made sure everything works with comprehensive tests.

## Features ✨
- **Visual Interface**: Select fields, operators, and values with dropdown menus
- **Action Support**: Complete rules with "When... Then..." logic
- **Real-time Code Generation**: See TypeScript code update as you build rules
- **Copy to Clipboard**: One-click copy of generated code
- **Clean TypeScript Output**: Properly formatted code that follows our API patterns

## Actions Supported 🎯
- **Show Message**: Display messages to users
- **Redirect**: Navigate to different URLs  
- **Set Field Value**: Dynamically update form fields
- **Prevent Default**: Block default browser behaviors

## Team Notes 📝
- Uses string templates for MVP (ts-morph integration planned for Sprint 2)
- Supports basic operators: equals, greater than, less than, contains, starts with
- Handles string, number, and boolean values with proper escaping
- Generated code imports from '@conform/rule-builder' and compiles cleanly
- **NEW**: Complete rule building with conditions AND actions!

*Built with ❤️ by the Sprint 1 team in just two days!*
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "🎯 Sprint 1 MVP Demo",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Our working MVP! Try selecting different fields, operators, values AND actions to see the complete rule generation in action.",
      },
    },
  },
};

export const WithEmailRule: Story = {
  name: "📧 Email Validation Example",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Perfect for email validation rules - the most common use case developers asked for.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test email validation rule creation
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "email");
    await userEvent.selectOptions(canvas.getByLabelText("Operator"), "equals");
    await userEvent.type(canvas.getByLabelText("Value"), "user@example.com");

    // Verify the generated code
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent(
      "field('email').equals('user@example.com')"
    );
    expect(codeElement).toHaveTextContent(
      "import { field } from '@conform/rule-builder'"
    );
  },
};

export const WithCompleteRule: Story = {
  name: "🎯 Complete Rule with Action",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story: "Showcase the full power: condition + action = complete rule!",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Build complete rule: When age > 18, then show welcome message
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "age");
    await userEvent.selectOptions(
      canvas.getByLabelText("Operator"),
      "greater_than"
    );
    await userEvent.type(canvas.getByLabelText("Value"), "18");

    // Add action
    await userEvent.selectOptions(
      canvas.getByLabelText("Action"),
      "showMessage"
    );
    await userEvent.type(
      canvas.getByLabelText("Message"),
      "Welcome to our platform!"
    );

    // Verify complete rule generation
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent("field('age').greater_than(18)");
    expect(codeElement).toHaveTextContent(
      ".then(() => showMessage('Welcome to our platform!'))"
    );
    expect(codeElement).toHaveTextContent("import { field, showMessage");
  },
};

export const WithRedirectAction: Story = {
  name: "🔗 Redirect Action Example",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Perfect for navigation rules - redirect users based on conditions.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Build redirect rule
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "isActive");
    await userEvent.selectOptions(canvas.getByLabelText("Operator"), "equals");
    await userEvent.type(canvas.getByLabelText("Value"), "false");

    await userEvent.selectOptions(canvas.getByLabelText("Action"), "redirect");
    await userEvent.type(canvas.getByLabelText("URL"), "/login");

    // Verify redirect rule
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent("field('isActive').equals(false)");
    expect(codeElement).toHaveTextContent(".then(() => redirect('/login'))");
    expect(codeElement).toHaveTextContent(
      "import { field, showMessage, redirect, setFieldValue, preventDefault }"
    );
  },
};

export const WithAgeRule: Story = {
  name: "🔢 Age Comparison Example",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Numeric comparisons work perfectly with our type-safe code generation.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test numeric comparison rule
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "age");
    await userEvent.selectOptions(
      canvas.getByLabelText("Operator"),
      "greater_than"
    );
    await userEvent.type(canvas.getByLabelText("Value"), "18");

    // Verify numeric values aren't quoted in generated code
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent("field('age').greater_than(18)");
    expect(codeElement).not.toHaveTextContent("'18'"); // No quotes around numbers
  },
};

export const Interactive: Story = {
  name: "🚀 Interactive Playground",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Try the complete flow!**

1. Select "email" from the Field dropdown
2. Choose "equals" as the operator
3. Enter "test@example.com" as the value
4. Select "Show Message" as the action
5. Enter "Valid email!" as the message
6. Watch the complete rule generate in real-time!
7. Click "Copy" to get the generated TypeScript

The generated code will be:
\`\`\`typescript
import { field, showMessage } from '@conform/rule-builder';

const rule = field('email').equals('test@example.com')
  .then(() => showMessage('Valid email!'));
\`\`\`
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Demonstrate the complete interactive flow step by step
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "email");

    // Small delay to show real-time updates
    await new Promise((resolve) => setTimeout(resolve, 500));

    await userEvent.selectOptions(canvas.getByLabelText("Operator"), "equals");

    await new Promise((resolve) => setTimeout(resolve, 500));

    await userEvent.type(canvas.getByLabelText("Value"), "test@example.com");

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add action
    await userEvent.selectOptions(
      canvas.getByLabelText("Action"),
      "showMessage"
    );
    await userEvent.type(canvas.getByLabelText("Message"), "Valid email!");

    // Verify final result
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent(
      "field('email').equals('test@example.com')"
    );
    expect(codeElement).toHaveTextContent(
      ".then(() => showMessage('Valid email!'))"
    );

    // Test copy functionality
    const copyButton = canvas.getByText("Copy");
    await userEvent.click(copyButton);

    // Verify button text changes to "Copied!"
    await expect(canvas.getByText("Copied!")).toBeInTheDocument();
  },
};

export const RealTimeUpdates: Story = {
  name: "⚡ Real-Time Code Generation",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Watch the code update instantly as you make changes - Alex and Jordan's integration magic!",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const codeElement = canvas.getByRole("code");

    // Start with empty state message
    expect(codeElement).toHaveTextContent(
      "Select a field, operator, and value to see generated code"
    );

    // Add field - should still show placeholder
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "name");
    expect(codeElement).toHaveTextContent(
      "Select a field, operator, and value to see generated code"
    );

    // Add operator - still placeholder
    await userEvent.selectOptions(
      canvas.getByLabelText("Operator"),
      "contains"
    );
    expect(codeElement).toHaveTextContent(
      "Select a field, operator, and value to see generated code"
    );

    // Add value - NOW it should generate code!
    await userEvent.type(canvas.getByLabelText("Value"), "John");
    expect(codeElement).toHaveTextContent("field('name').contains('John')");
    expect(codeElement).toHaveTextContent(
      "import { field } from '@conform/rule-builder'"
    );

    // Add action - imports should update!
    await userEvent.selectOptions(
      canvas.getByLabelText("Action"),
      "showMessage"
    );
    expect(codeElement).toHaveTextContent("import { field, showMessage");
  },
};

export const ActionTypes: Story = {
  name: "🎬 All Action Types",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Test all four action types with proper code generation and UI adaptation.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Set up base condition
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "email");
    await userEvent.selectOptions(canvas.getByLabelText("Operator"), "equals");
    await userEvent.type(canvas.getByLabelText("Value"), "test@example.com");

    const codeElement = canvas.getByRole("code");
    const actionSelect = canvas.getByLabelText("Action");

    // Test showMessage action
    await userEvent.selectOptions(actionSelect, "showMessage");
    const messageInput = canvas.getByLabelText("Message");
    await userEvent.type(messageInput, "Hello!");
    expect(codeElement).toHaveTextContent(".then(() => showMessage('Hello!'))");

    // Test redirect action
    await userEvent.selectOptions(actionSelect, "redirect");
    const urlInput = canvas.getByLabelText("URL");
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, "/dashboard");
    expect(codeElement).toHaveTextContent(
      ".then(() => redirect('/dashboard'))"
    );

    // Test preventDefault action (no input needed)
    await userEvent.selectOptions(actionSelect, "preventDefault");
    expect(codeElement).toHaveTextContent(".then(() => preventDefault())");

    // Verify the input is disabled for preventDefault
    const configInput = canvas.getByLabelText("Configuration");
    expect(configInput).toBeDisabled();
    expect(configInput).toHaveValue("No configuration required");
  },
};

export const StringEscaping: Story = {
  name: "🛡️ String Escaping Test",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests that special characters in strings are properly escaped in generated code.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test string with single quotes
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "name");
    await userEvent.selectOptions(canvas.getByLabelText("Operator"), "equals");
    await userEvent.type(canvas.getByLabelText("Value"), "O'Connor");

    // Test action with single quotes
    await userEvent.selectOptions(
      canvas.getByLabelText("Action"),
      "showMessage"
    );
    await userEvent.type(canvas.getByLabelText("Message"), "Welcome O'Connor!");

    // Verify quotes are escaped in both condition and action
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent("field('name').equals('O\\'Connor')");
    expect(codeElement).toHaveTextContent(
      ".then(() => showMessage('Welcome O\\'Connor!'))"
    );
  },
};

export const AllOperators: Story = {
  name: "🔧 All Operators Test",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates all five operators working with proper code generation.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fieldSelect = canvas.getByLabelText("Field");
    const operatorSelect = canvas.getByLabelText("Operator");
    const valueInput = canvas.getByLabelText("Value");
    const codeElement = canvas.getByRole("code");

    // Test key operators one by one (using schema names)
    const operators = [
      { value: "equals", expected: "equals" },
      { value: "greater_than", expected: "greater_than" },
      { value: "less_than", expected: "less_than" },
      { value: "contains", expected: "contains" },
      { value: "starts_with", expected: "starts_with" },
    ];

    await userEvent.selectOptions(fieldSelect, "email");
    await userEvent.clear(valueInput);
    await userEvent.type(valueInput, "test@example.com");

    for (const operator of operators) {
      await userEvent.selectOptions(operatorSelect, operator.value);
      expect(codeElement).toHaveTextContent(
        `field('email').${operator.expected}('test@example.com')`
      );
    }
  },
};

export const MobileView: Story = {
  name: "📱 Mobile Responsive",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Riley made sure our builder works on mobile too! The panels stack vertically on smaller screens.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that mobile interactions work the same
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "city");
    await userEvent.selectOptions(
      canvas.getByLabelText("Operator"),
      "starts_with"
    );
    await userEvent.type(canvas.getByLabelText("Value"), "New");

    // Test mobile action selection
    await userEvent.selectOptions(canvas.getByLabelText("Action"), "redirect");
    await userEvent.type(canvas.getByLabelText("URL"), "/cities/new");

    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent("field('city').starts_with('New')");
    expect(codeElement).toHaveTextContent(
      ".then(() => redirect('/cities/new'))"
    );
  },
};

export const SchemaBasedFields: Story = {
  name: "🎯 Schema-Driven Fields (NEW!)",
  parameters: {
    docs: {
      description: {
        story: `
**🚀 NEW: Schema-Driven Field Selector!**

This story demonstrates how FieldSelector works with user-provided field definitions. The best part? **No special metadata required!** Just provide your standard Zod schemas and we'll auto-organize them intelligently.

**Features:**
- **Auto-Categorization**: Fields are automatically organized by type (text, numbers, booleans, arrays, etc.)
- **Standard Schemas**: Users just provide normal field schemas - no "category" or special UI metadata required!
- **Type Safety**: Full TypeScript support for field definitions
- **Extensible**: Users can define any fields they want with any metadata they need

**Auto-Categories:**
- 📝 **Text Fields**: String fields and text inputs
- 🔢 **Numbers**: Numeric fields with proper validation
- ✅ **Yes/No**: Boolean fields with switches
- 📧 **Contact Info**: Email and URL fields (auto-detected by format)
- 📅 **Dates & Times**: Date/datetime fields
- 📋 **Lists**: Array fields for multiple values

**This is what users want:** Just define your schemas, and the UI handles the rest intelligently!
        `,
      },
    },
  },
  render: () => {
    // Now actually using the demo field definitions!
    return <RuleBuilder fields={DEMO_FIELD_SCHEMAS} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test with categorized fields - notice the updated labels!
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "email");
    await userEvent.selectOptions(canvas.getByLabelText("Operator"), "equals");
    await userEvent.type(canvas.getByLabelText("Value"), "admin@company.com");

    await userEvent.selectOptions(canvas.getByLabelText("Action"), "redirect");
    await userEvent.type(canvas.getByLabelText("URL"), "/admin/dashboard");

    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent(
      "field('email').equals('admin@company.com')"
    );
    expect(codeElement).toHaveTextContent(
      ".then(() => redirect('/admin/dashboard'))"
    );
  },
};
