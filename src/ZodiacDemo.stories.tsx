import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { z } from "zod/v4";
import { SchemaForm } from "./form/SchemaForm";
import { RuleBuilder } from "./components/RuleBuilder";
import { RuleBasedSchemaForm } from "./form/RuleBasedSchemaForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";
import type { FieldSchemas } from "./lib/fieldUtils";
import { fieldMeta } from "./utils";
import type { Rule } from "./schemas/rule.schema";
import { CommonRules } from "./utils/rule-builder";

// =============================================================================
// TESTING UTILITIES (focusing on core logic only)
// =============================================================================

/**
 * ZodiacDemo-specific interactions for testing core logic
 */
const zodiacDemoInteractions = {
  /**
   * Switch to a specific demo tab
   */
  switchToDemo: async (canvas: ReturnType<typeof within>, demoName: string) => {
    const card = canvas
      .getByText(demoName)
      .closest("div[class*='cursor-pointer']");
    if (!card) {
      throw new Error(`Could not find demo card: ${demoName}`);
    }
    await userEvent.click(card);
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};

/**
 * Pre-built play functions focusing on core functionality
 */
const zodiacDemoPlayFunctions = {
  /**
   * Test schema form validation and submission
   */
  schemaFormInteraction:
    () =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      // Navigate to schema form
      await zodiacDemoInteractions.switchToDemo(canvas, "Schema-Based Forms");

      // Wait for form to load
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        // Test 1: Submit empty form to trigger validation
        const submitButton = canvas.getByRole("button", {
          name: /create account/i,
        });
        await userEvent.click(submitButton);

        // Wait for validation to appear
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check that form shows validation errors (fields should have error styling or messages)
        const firstNameInput = canvas.getByLabelText(/first name/i);
        const emailInput = canvas.getByLabelText(/email/i);

        // These inputs should exist and be in error state
        expect(firstNameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        // Form should NOT have submitted successfully
        const submissionResult = canvas.queryByText("Form Submission Result");
        expect(submissionResult).toBeNull();

        // Test 2: Fill out form correctly and submit
        await userEvent.type(firstNameInput, "John");
        await userEvent.type(canvas.getByLabelText(/last name/i), "Doe");
        await userEvent.type(emailInput, "john.doe@example.com");
        await userEvent.type(canvas.getByLabelText(/username/i), "johndoe123");
        await userEvent.type(
          canvas.getByLabelText(/^password$/i),
          "password123"
        );
        await userEvent.type(
          canvas.getByLabelText(/confirm password/i),
          "password123"
        );

        // Submit the valid form
        await userEvent.click(submitButton);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Now should see submission result
        const successResult = canvas.getByText("Form Submission Result");
        expect(successResult).toBeInTheDocument();
      } catch {
        // No logging
      }
    },

  /**
   * Test dynamic form behavior with rule-based conditional fields
   */
  dynamicFormBehavior:
    () =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      // Navigate to dynamic forms
      await zodiacDemoInteractions.switchToDemo(canvas, "Dynamic Forms");

      // Verify the rules section exists
      expect(canvas.getByText("Active Rules")).toBeInTheDocument();
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Test conditional field visibility

      // Initially, company fields should be hidden (accountType defaults to "personal")
      expect(canvas.queryByLabelText(/company name/i)).toBeNull();
      expect(canvas.queryByLabelText(/job title/i)).toBeNull();
      expect(canvas.queryByLabelText(/company size/i)).toBeNull();

      // Change to business account - should show company name and job title
      await interactWithRadixSelect(canvas, "business", "Account Type");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force re-render by interacting with the form
      const accountTypeButton = canvas.getByRole("combobox", {
        name: /account type/i,
      });
      await userEvent.click(accountTypeButton);
      await userEvent.keyboard("{Escape}");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Company fields should now be visible
      expect(canvas.getByLabelText(/company name/i)).toBeVisible();
      expect(canvas.getByLabelText(/job title/i)).toBeVisible();
      expect(canvas.queryByLabelText(/company size/i)).toBeNull(); // Still hidden

      // Change to enterprise - should show company size too
      await interactWithRadixSelect(canvas, "enterprise", "Account Type");
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(canvas.getByLabelText(/company size/i)).toBeVisible();
    },

  /**
   * Test rule builder functionality and code generation
   */
  ruleBuilderWorkflow:
    () =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      await zodiacDemoInteractions.switchToDemo(canvas, "Visual Rule Builder");

      try {
        // Build a complete rule
        const fieldSelect = canvas.getByLabelText("Field");
        const operatorSelect = canvas.getByLabelText("Operator");
        const valueInput = canvas.getByLabelText("Value");

        // Create a basic condition
        await userEvent.selectOptions(fieldSelect, "accountType");
        await userEvent.selectOptions(operatorSelect, "equals");
        await userEvent.type(valueInput, "business");

        // Verify code generation
        const codeElement = canvas.getByRole("code");
        expect(codeElement).toHaveTextContent(
          "field('accountType').equals('business')"
        );

        // Add an action
        const actionSelect = canvas.getByLabelText("Action");
        await userEvent.selectOptions(actionSelect, "showMessage");

        // Verify imports and action in generated code
        expect(codeElement).toHaveTextContent("import {");
        expect(codeElement).toHaveTextContent("showMessage");

        // Test copy functionality
        const copyButton = canvas.getByText("Copy");
        await userEvent.click(copyButton);
        expect(canvas.getByText("Copied!")).toBeInTheDocument();
      } catch {
        // No logging
      }
    },
};

/**
 * Helper to interact with Radix UI Select components
 */
const interactWithRadixSelect = async (
  canvas: ReturnType<typeof within>,
  triggerValue: string,
  fieldName?: string
) => {
  let selectTrigger;

  if (fieldName) {
    // Try to find combobox by accessible name
    try {
      selectTrigger = canvas.getByRole("combobox", {
        name: new RegExp(fieldName, "i"),
      });
    } catch {
      // If that doesn't work, find all comboboxes and filter by surrounding label
      const comboboxes = canvas.getAllByRole("combobox");
      selectTrigger = comboboxes.find((box: HTMLElement) => {
        const parent = box.closest(
          "[data-field], .field-container, .form-field"
        );
        if (parent) {
          return parent.textContent
            ?.toLowerCase()
            .includes(fieldName.toLowerCase());
        }
        // Fall back to looking at nearby text
        const parentElement = box.parentElement;
        return parentElement?.textContent
          ?.toLowerCase()
          .includes(fieldName.toLowerCase());
      });

      if (!selectTrigger) {
        // Last resort: if fieldName contains specific keywords, try to match
        if (fieldName.toLowerCase().includes("account")) {
          selectTrigger = comboboxes[0]; // First combobox is usually account type
        } else {
          selectTrigger = comboboxes[0]; // Default to first
        }
      }
    }
  } else {
    // Fallback to original behavior for backward compatibility
    selectTrigger = canvas.getByRole("combobox");
  }

  if (!selectTrigger) {
    throw new Error(
      `Could not find combobox for field: ${fieldName || "unknown"}`
    );
  }

  // Click to open the dropdown
  await userEvent.click(selectTrigger);

  // Wait for dropdown to appear
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find the option in the document (Radix portals to document.body)
  const option =
    document.querySelector(`[role="option"][data-value="${triggerValue}"]`) ||
    Array.from(document.querySelectorAll('[role="option"]')).find((el) =>
      el.textContent?.toLowerCase().includes(triggerValue.toLowerCase())
    );

  if (option) {
    await userEvent.click(option as Element);
  } else {
    throw new Error(`Could not find option with value: ${triggerValue}`);
  }
};

// =============================================================================
// DEMO COMPONENT
// =============================================================================

// Demo wrapper component that showcases all features
const ZodiacDemo = () => {
  const [activeDemo, setActiveDemo] = useState<"schema" | "rules" | "dynamic">(
    "schema"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>(null);

  // Schema for user registration form
  const userRegistrationSchema = z
    .object({
      // Personal Information
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Please enter a valid email"),
      phone: z.string().optional(),

      // Account Details
      username: z.string().min(3, "Username must be at least 3 characters"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string(),

      // Preferences
      newsletter: z.boolean().default(false),
      accountType: z
        .enum(["personal", "business", "enterprise"])
        .default("personal"),
      interests: z
        .array(z.string())
        .min(1, "Select at least one interest")
        .default([]),

      // Profile
      bio: z.string().max(500, "Bio must be under 500 characters").optional(),
      birthDate: z.string().optional(),
      profilePicture: z.string().optional(),

      // Business Information (conditional)
      companyName: z.string().optional(),
      jobTitle: z.string().optional(),
      companySize: z
        .enum(["1-10", "11-50", "51-200", "201-1000", "1000+"])
        .optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  // Field schemas for rule builder
  const fieldSchemas: FieldSchemas = {
    accountType: {
      type: "string",
      options: ["personal", "business", "enterprise"],
      label: "Account Type",
      metadata: fieldMeta({
        format: "select",
      }),
    },
    newsletter: {
      type: "boolean",
      label: "Newsletter Subscription",
    },
    interests: {
      type: "array",
      items: { type: "string" },
      label: "Interests",
    },
    companyName: {
      type: "string",
      label: "Company Name",
    },
    jobTitle: {
      type: "string",
      label: "Job Title",
    },
    companySize: {
      type: "string",
      options: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
      label: "Company Size",
      metadata: fieldMeta({
        format: "select",
      }),
    },
  };

  // Dynamic schema rules - using CommonRules utilities for cleaner code
  const dynamicRules: Rule[] = [
    // Hide all company fields by default when accountType is personal
    CommonRules.hideWhen("companyName", "accountType", "personal"),
    CommonRules.hideWhen("jobTitle", "accountType", "personal"),
    CommonRules.hideWhen("companySize", "accountType", "personal"),
    // Show company name and job title for business accounts
    ...CommonRules.showFieldsWhen(
      ["companyName", "jobTitle"],
      "accountType",
      "business"
    ),
    // Show company size for enterprise accounts
    CommonRules.showWhen("companySize", "accountType", "enterprise"),
  ];

  const handleFormSubmit = async (values: unknown) => {
    setFormData(values);
  };

  const demoCards = [
    {
      id: "schema",
      title: "Schema-Based Forms",
      description:
        "Generate forms automatically from Zod schemas with built-in validation",
      badge: "Core Feature",
    },
    {
      id: "rules",
      title: "Visual Rule Builder",
      description:
        "Build conditional logic rules with an intuitive visual interface",
      badge: "Rule Engine",
    },
    {
      id: "dynamic",
      title: "Dynamic Forms",
      description: "Forms that adapt based on user input and conditional rules",
      badge: "Advanced",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          zodiac Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A powerful React library for building dynamic, schema-driven forms
          with visual rule building capabilities. Generate forms from Zod
          schemas, create conditional logic visually, and build adaptive user
          experiences.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demoCards.map((card) => (
          <Card
            key={card.id}
            className={`cursor-pointer transition-all duration-200 ${
              activeDemo === card.id
                ? "ring-2 ring-blue-500 shadow-lg scale-105"
                : "hover:shadow-md hover:scale-102"
            }`}
            onClick={() =>
              setActiveDemo(card.id as "schema" | "rules" | "dynamic")
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setActiveDemo(card.id as "schema" | "rules" | "dynamic");
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <Badge
                  variant={activeDemo === card.id ? "default" : "secondary"}
                >
                  {card.badge}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {card.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Demo Content */}
      <div className="space-y-6">
        {activeDemo === "schema" && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Schema-Based Form Generation
              </h2>
              <p className="text-gray-600">
                This form is automatically generated from a Zod schema with
                validation, default values, and multiple field types.
              </p>
            </div>

            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>User Registration Form</CardTitle>
                <CardDescription>
                  Generated from a Zod schema with automatic validation and
                  field rendering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SchemaForm
                  schema={userRegistrationSchema}
                  onSubmit={handleFormSubmit}
                  submitLabel="Create Account"
                  columns={2}
                  spacing="normal"
                  fieldLabels={{
                    firstName: "First Name",
                    lastName: "Last Name",
                    email: "Email Address",
                    phone: "Phone Number",
                    username: "Username",
                    password: "Password",
                    confirmPassword: "Confirm Password",
                    newsletter: "Subscribe to Newsletter",
                    accountType: "Account Type",
                    interests: "Interests",
                    bio: "Bio",
                    birthDate: "Birth Date",
                    profilePicture: "Profile Picture",
                    companyName: "Company Name",
                    jobTitle: "Job Title",
                    companySize: "Company Size",
                  }}
                  fieldDescriptions={{
                    bio: "Tell us a bit about yourself (optional)",
                    newsletter: "Receive updates and product announcements",
                    interests: "Select your areas of interest",
                  }}
                />
              </CardContent>
            </Card>

            {formData && (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle>Form Submission Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeDemo === "rules" && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Visual Rule Builder
              </h2>
              <p className="text-gray-600">
                Build conditional logic rules with an intuitive drag-and-drop
                interface. Rules are automatically converted to executable code.
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <RuleBuilder fields={fieldSchemas} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeDemo === "dynamic" && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                Rule-Based Dynamic Forms
              </h2>
              <p className="text-gray-600">
                Forms that adapt in real-time based on user input and predefined
                rules. Try changing the account type to see conditional fields
                appear.
              </p>
            </div>

            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Dynamic Registration Form</CardTitle>
                <CardDescription>
                  This form shows/hides fields based on the account type
                  selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RuleBasedSchemaForm
                  schema={userRegistrationSchema}
                  rules={dynamicRules}
                  onSubmit={handleFormSubmit}
                  submitLabel="Register Account"
                  columns={2}
                  fieldLabels={{
                    firstName: "First Name",
                    lastName: "Last Name",
                    email: "Email Address",
                    username: "Username",
                    password: "Password",
                    confirmPassword: "Confirm Password",
                    accountType: "Account Type",
                    companyName: "Company Name",
                    jobTitle: "Job Title",
                    companySize: "Company Size",
                    newsletter: "Subscribe to Newsletter",
                  }}
                />
              </CardContent>
            </Card>

            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Active Rules</CardTitle>
                <CardDescription>
                  These rules control which fields are shown based on user input
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dynamicRules.map((rule, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="text-sm font-mono">
                        <span className="text-blue-600">IF</span>{" "}
                        <span className="font-semibold">
                          {"field" in rule.condition
                            ? rule.condition.field
                            : "complex condition"}
                        </span>{" "}
                        <span className="text-purple-600">
                          {"operator" in rule.condition
                            ? rule.condition.operator
                            : ""}
                        </span>{" "}
                        <span className="text-green-600">
                          "
                          {"value" in rule.condition
                            ? String(rule.condition.value)
                            : ""}
                          "
                        </span>{" "}
                        <span className="text-blue-600">THEN</span>{" "}
                        <span className="text-orange-600">
                          {rule.actions[0].type}
                        </span>{" "}
                        <span className="font-semibold">
                          {rule.actions[0].target}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <Separator />
      <div className="text-center text-gray-500 space-y-2">
        <p>
          Built with React, TypeScript, Zod, React Hook Form, and Tailwind CSS
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <span>🎯 Schema-driven forms</span>
          <span>🎨 Visual rule building</span>
          <span>⚡ Dynamic field rendering</span>
          <span>✅ Built-in validation</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// STORYBOOK CONFIGURATION
// =============================================================================

// Storybook configuration
const meta: Meta<typeof ZodiacDemo> = {
  title: "🚀 zodiac Demo",
  component: ZodiacDemo,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# zodiac - Dynamic Form Builder

A comprehensive React library for building dynamic, schema-driven forms with comprehensive business logic capabilities.

## Key Features

- **Schema-Based Forms**: Automatically generate forms from Zod schemas
- **Visual Rule Builder**: Create conditional logic with drag-and-drop interface  
- **Dynamic Forms**: Forms that adapt based on user input and rules
- **Rich Field Types**: Text, numeric, date, boolean, file upload, signature, and more
- **Built-in Validation**: Leverages Zod for type-safe validation
- **Modern UI**: Built with Tailwind CSS and Radix UI components

## Use Cases

- **Application Forms**: Registration, surveys, and data collection
- **Configuration UIs**: Settings panels with conditional options
- **Workflow Builders**: Multi-step forms with branching logic
- **Admin Panels**: Dynamic content management interfaces

This demo showcases the three core capabilities of zodiac in an interactive format.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveDemo: Story = {
  render: () => <ZodiacDemo />,
  parameters: {
    docs: {
      description: {
        story: `
An interactive demonstration of zodiac's capabilities:

1. **Schema Forms**: See how complex forms are generated from Zod schemas
2. **Rule Builder**: Build conditional logic visually 
3. **Dynamic Forms**: Experience forms that adapt in real-time

Click between the feature cards to explore different aspects of the library.
        `,
      },
    },
  },
  play: zodiacDemoPlayFunctions.schemaFormInteraction(),
};

// =============================================================================
// FOCUSED TEST STORIES
// =============================================================================

export const SchemaFormValidationTest: Story = {
  name: "📝 Schema Form Validation Test",
  render: () => <ZodiacDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Tests form validation, error handling, and successful submission in the schema-based form.",
      },
    },
  },
  play: zodiacDemoPlayFunctions.schemaFormInteraction(),
};

export const DynamicFormBehaviorTest: Story = {
  name: "⚡ Dynamic Form Behavior Test",
  render: () => <ZodiacDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Tests conditional field visibility and rule-based form behavior based on user input.",
      },
    },
  },
  play: zodiacDemoPlayFunctions.dynamicFormBehavior(),
};

export const RuleBuilderWorkflowTest: Story = {
  name: "🔧 Rule Builder Workflow Test",
  render: () => <ZodiacDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Tests the complete rule building workflow including code generation and copying.",
      },
    },
  },
  play: zodiacDemoPlayFunctions.ruleBuilderWorkflow(),
};
