import type { Meta, StoryObj } from "@storybook/react";
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
import type { RuleDefinition } from "./hooks/useFormRules";

// Demo wrapper component that showcases all features
const ConformDemo = () => {
  const [activeDemo, setActiveDemo] = useState<"schema" | "rules" | "dynamic">(
    "schema"
  );
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

  // Dynamic schema rules
  const dynamicRules: RuleDefinition[] = [
    {
      id: "show-company-name",
      condition: {
        field: "accountType",
        operator: "equals",
        value: "business",
      },
      action: {
        type: "field-visibility",
        field: "companyName",
        visible: true,
      },
    },
    {
      id: "show-job-title",
      condition: {
        field: "accountType",
        operator: "equals",
        value: "business",
      },
      action: {
        type: "field-visibility",
        field: "jobTitle",
        visible: true,
      },
    },
    {
      id: "show-company-size",
      condition: {
        field: "accountType",
        operator: "equals",
        value: "enterprise",
      },
      action: {
        type: "field-visibility",
        field: "companySize",
        visible: true,
      },
    },
  ];

  const handleFormSubmit = async (values: any) => {
    setFormData(values);
    console.log("Form submitted:", values);
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
          Conform Demo
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
            onClick={() => setActiveDemo(card.id as any)}
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
                          {rule.action.type}
                        </span>{" "}
                        <span className="font-semibold">
                          {rule.action.field}
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

// Storybook configuration
const meta: Meta<typeof ConformDemo> = {
  title: "🚀 Conform Demo",
  component: ConformDemo,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Conform - Dynamic Form Builder

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

This demo showcases the three core capabilities of Conform in an interactive format.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveDemo: Story = {
  render: () => <ConformDemo />,
  parameters: {
    docs: {
      description: {
        story: `
An interactive demonstration of Conform's capabilities:

1. **Schema Forms**: See how complex forms are generated from Zod schemas
2. **Rule Builder**: Build conditional logic visually 
3. **Dynamic Forms**: Experience forms that adapt in real-time

Click between the feature cards to explore different aspects of the library.
        `,
      },
    },
  },
};

// Additional focused stories for specific features
export const SchemaFormShowcase: Story = {
  render: () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
      age: z.number().min(18, "Must be 18 or older"),
      subscribe: z.boolean().default(false),
      category: z.enum(["personal", "business"]),
    });

    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Quick Schema Form Example</h2>
        <SchemaForm
          schema={schema}
          onSubmit={async (data) => console.log(data)}
          submitLabel="Submit"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A focused example showing how easily forms can be generated from Zod schemas.",
      },
    },
  },
};

export const RuleBuilderShowcase: Story = {
  render: () => {
    const fields: FieldSchemas = {
      userType: {
        type: "string",
        options: ["admin", "user", "guest"],
        label: "User Type",
        metadata: fieldMeta({
          format: "select",
        }),
      },
      isActive: { type: "boolean", label: "Is Active" },
      score: { type: "number", label: "Score" },
    };

    return (
      <div className="max-w-4xl mx-auto">
        <RuleBuilder fields={fields} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Visual rule builder interface for creating conditional logic without code.",
      },
    },
  },
};
