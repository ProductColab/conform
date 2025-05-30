import { Command } from "commander";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { logger } from "../utils/logger";
import { CodeGenerator } from "../utils/codegen";
import type { FieldConfig, SchemaConfig } from "../utils/codegen";
import inquirer from "inquirer";

interface GenerateOptions {
  output?: string;
  template?: string;
  force?: boolean;
  interactive?: boolean;
}

export const generateCommand = new Command("generate")
  .description("Generate schemas, forms, and add fields")
  .argument("[type]", "What to generate: schema, field, form")
  .argument("[name]", "Name of the item to generate")
  .option("-o, --output <path>", "Output directory", "src")
  .option("-t, --template <template>", "Component template", "react")
  .option("-f, --force", "Overwrite existing files", false)
  .option("-i, --interactive", "Interactive mode with prompts", false)
  .action(async (type?: string, name?: string, options?: GenerateOptions) => {
    try {
      const generator = new CodeGenerator();

      if (!type || options?.interactive) {
        await runInteractiveMode(generator, options);
      } else {
        await runDirectMode(generator, type, name, options);
      }
    } catch (error) {
      logger.error("Failed to generate:", error);
      process.exit(1);
    }
  });

// Add help examples
generateCommand.on("--help", () => {
  console.log("");
  console.log("Examples:");
  console.log("  $ conform generate schema Contact");
  console.log(
    "  $ conform generate field email --output src/schemas/contact.ts"
  );
  console.log("  $ conform generate form Contact");
  console.log("  $ conform generate --interactive");
  console.log("");
  console.log("Generation Types:");
  console.log("  schema     Generate a new Zod schema with fields");
  console.log("  field      Add a field to an existing schema");
  console.log("  form       Generate a React form component");
  console.log("");
  console.log("Features:");
  console.log("  • TypeScript AST-based generation (ts-morph)");
  console.log("  • Interactive field configuration");
  console.log("  • Automatic import management");
  console.log("  • Type-safe code generation");
});

async function runInteractiveMode(
  generator: CodeGenerator,
  options?: GenerateOptions
) {
  logger.info("🚀 Welcome to Conform Interactive Generator!");

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to generate?",
      choices: [
        {
          name: "📋 New Schema - Complete schema with multiple fields",
          value: "schema",
        },
        {
          name: "🔧 Add Field - Add a field to existing schema",
          value: "field",
        },
        {
          name: "🎨 Form Component - Generate React form from schema",
          value: "form",
        },
      ],
    },
  ]);

  switch (action) {
    case "schema":
      await generateSchemaInteractive(generator, options);
      break;
    case "field":
      await addFieldInteractive(generator, options);
      break;
    case "form":
      await generateFormInteractive(generator, options);
      break;
  }
}

async function runDirectMode(
  generator: CodeGenerator,
  type: string,
  name?: string,
  options?: GenerateOptions
) {
  switch (type.toLowerCase()) {
    case "schema":
      if (!name) {
        logger.error("Schema name is required");
        process.exit(1);
      }
      await generateSchemaInteractive(generator, options, name);
      break;
    case "field":
      await addFieldInteractive(generator, options, name);
      break;
    case "form":
      if (!name) {
        logger.error("Form name is required");
        process.exit(1);
      }
      await generateFormInteractive(generator, options, name);
      break;
    default:
      logger.error(`Unknown generation type: ${type}`);
      logger.info("Available types: schema, field, form");
      process.exit(1);
  }
}

async function generateSchemaInteractive(
  generator: CodeGenerator,
  options?: GenerateOptions,
  schemaName?: string
) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Schema name:",
      default: schemaName,
      when: !schemaName,
      validate: (input: string) =>
        input.length > 0 || "Schema name is required",
    },
    {
      type: "input",
      name: "description",
      message: "Schema description (optional):",
    },
  ]);

  const name = schemaName || answers.name;
  const fields: FieldConfig[] = [];

  logger.info(
    "📝 Let's add fields to your schema. Press Enter with no name when done."
  );

  while (true) {
    const fieldAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "fieldName",
        message: "Field name (or press Enter to finish):",
      },
    ]);

    if (!fieldAnswers.fieldName) break;

    const fieldConfig = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Field type:",
        choices: [
          { name: "📝 Text (string)", value: "string" },
          { name: "📧 Email (string with email validation)", value: "email" },
          { name: "🔢 Number", value: "number" },
          { name: "✅ Boolean", value: "boolean" },
          { name: "📅 Date", value: "date" },
          { name: "📋 Array", value: "array" },
          { name: "🗂️ Object", value: "object" },
        ],
      },
      {
        type: "checkbox",
        name: "validation",
        message: "Validation rules:",
        choices: [
          { name: "Required", value: "required" },
          { name: "Email format", value: "email", checked: false },
          { name: "Minimum length", value: "min" },
          { name: "Maximum length", value: "max" },
        ],
      },
      {
        type: "confirm",
        name: "optional",
        message: "Is this field optional?",
        default: false,
      },
    ]);

    // Handle email type
    if (fieldConfig.type === "email") {
      fieldConfig.type = "string";
      fieldConfig.validation = [...(fieldConfig.validation || []), "email"];
    }

    fields.push({
      name: fieldAnswers.fieldName,
      type: fieldConfig.type,
      validation: fieldConfig.validation,
      optional: fieldConfig.optional,
    });

    logger.success(
      `✅ Added field: ${fieldAnswers.fieldName} (${fieldConfig.type})`
    );
  }

  if (fields.length === 0) {
    logger.warn("No fields added. Generating empty schema.");
  }

  const schemaConfig: SchemaConfig = {
    name,
    fields,
    description: answers.description,
  };

  const outputPath = join(
    options?.output || "src",
    "schemas",
    `${name.toLowerCase()}.ts`
  );
  await generator.generateSchema(schemaConfig, outputPath);

  logger.info("🎉 Schema generation complete!");
  logger.info(`📁 Generated: ${outputPath}`);
  logger.info(`💡 Next steps:`);
  logger.info(`   conform generate form ${name}`);
}

async function addFieldInteractive(
  generator: CodeGenerator,
  options?: GenerateOptions,
  fieldName?: string
) {
  // Find schema files
  const schemaFiles = findSchemaFiles(options?.output || "src");

  if (schemaFiles.length === 0) {
    logger.error(
      "No schema files found. Generate a schema first with 'conform generate schema'"
    );
    process.exit(1);
  }

  const { schemaFile } = await inquirer.prompt([
    {
      type: "list",
      name: "schemaFile",
      message: "Which schema to add the field to?",
      choices: schemaFiles.map((file) => ({ name: file, value: file })),
    },
  ]);

  const fieldAnswers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Field name:",
      default: fieldName,
      when: !fieldName,
      validate: (input: string) => input.length > 0 || "Field name is required",
    },
    {
      type: "list",
      name: "type",
      message: "Field type:",
      choices: [
        { name: "📝 Text", value: "string" },
        { name: "📧 Email", value: "email" },
        { name: "🔢 Number", value: "number" },
        { name: "✅ Boolean", value: "boolean" },
        { name: "📅 Date", value: "date" },
      ],
    },
    {
      type: "confirm",
      name: "optional",
      message: "Is this field optional?",
      default: false,
    },
  ]);

  const field: FieldConfig = {
    name: fieldName || fieldAnswers.name,
    type: fieldAnswers.type === "email" ? "string" : fieldAnswers.type,
    validation: fieldAnswers.type === "email" ? ["email"] : [],
    optional: fieldAnswers.optional,
  };

  await generator.addFieldToSchema(schemaFile, field);
  logger.success(`🎉 Field '${field.name}' added to ${schemaFile}`);
}

async function generateFormInteractive(
  generator: CodeGenerator,
  options?: GenerateOptions,
  formName?: string
) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Form component name:",
      default: formName,
      when: !formName,
      validate: (input: string) => input.length > 0 || "Form name is required",
    },
  ]);

  const name = formName || answers.name;
  const outputPath = join(
    options?.output || "src",
    "components",
    `${name}Form.tsx`
  );

  await generator.generateFormComponent(name, outputPath);
  logger.success(`🎉 Form component generated: ${outputPath}`);
}

function findSchemaFiles(basePath: string): string[] {
  const schemasDir = join(basePath, "schemas");
  if (!existsSync(schemasDir)) {
    return [];
  }

  // In a real implementation, you'd recursively find .ts files
  // For now, return a mock
  return [join(schemasDir, "contact.ts"), join(schemasDir, "user.ts")].filter(
    (file) => existsSync(file)
  );
}
