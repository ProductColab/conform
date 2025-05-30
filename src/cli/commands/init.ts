import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { logger } from "../utils/logger";
import { templates } from "../templates";

interface InitOptions {
  template?: string;
  force?: boolean;
  typescript?: boolean;
  install?: boolean;
}

export const initCommand = new Command("init")
  .description("Initialize a new zodiac project")
  .argument("<project-name>", "Name of the project to create")
  .option("-t, --template <template>", "Project template", "react-ts")
  .option("-f, --force", "Overwrite existing directory", false)
  .option("--no-typescript", "Use JavaScript instead of TypeScript")
  .option("--no-install", "Skip package installation")
  .action(async (projectName: string, options: InitOptions) => {
    try {
      await initProject(projectName, options);
    } catch (error) {
      logger.error("Failed to initialize project:", error);
      process.exit(1);
    }
  });

// Add help examples
initCommand.on("--help", () => {
  console.log("");
  console.log(chalk.bold("Examples:"));
  console.log("  $ zodiac init my-form-app");
  console.log("  $ zodiac init my-app --template nextjs");
  console.log("  $ zodiac init my-app --no-typescript --no-install");
  console.log("");
  console.log(chalk.bold("Available templates:"));
  console.log("  react-ts      React with TypeScript (default)");
  console.log("  react-js      React with JavaScript");
  console.log("  nextjs        Next.js with TypeScript");
  console.log("  vite          Vite + React + TypeScript");
  console.log("  storybook     Storybook component library");
});

async function initProject(projectName: string, options: InitOptions) {
  const projectPath = join(process.cwd(), projectName);

  logger.info(`🎯 Creating zodiac project: ${chalk.cyan(projectName)}`);

  // Check if directory exists
  if (existsSync(projectPath) && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory ${projectName} already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      logger.info("Cancelled.");
      return;
    }
  }

  // Create project directory
  if (!existsSync(projectPath)) {
    mkdirSync(projectPath, { recursive: true });
  }

  // Select template
  const templateName = options.template || "react-ts";
  const template = templates[templateName];

  if (!template) {
    throw new Error(
      `Template "${templateName}" not found. Available: ${Object.keys(
        templates
      ).join(", ")}`
    );
  }

  logger.info(`📦 Using template: ${chalk.cyan(templateName)}`);

  // Generate project files
  await generateProjectFiles(projectPath, template, {
    projectName,
    typescript: options.typescript !== false,
  });

  // Install dependencies
  if (options.install !== false) {
    logger.info("📥 Installing dependencies...");
    await installDependencies(projectPath);
  }

  // Success message
  console.log("");
  logger.success("🎉 Project created successfully!");
  console.log("");
  console.log(chalk.bold("Next steps:"));
  console.log(`  cd ${projectName}`);
  if (options.install === false) {
    console.log("  npm install");
  }
  console.log("  npm run dev");
  console.log("");
  console.log(chalk.bold("Learn more:"));
  console.log("  $ zodiac generate --help");
  console.log("  $ zodiac docs --help");
}

async function generateProjectFiles(
  projectPath: string,
  template: (typeof templates)[string],
  context: { projectName: string; typescript: boolean }
) {
  for (const [filePath, content] of Object.entries(template.files)) {
    const fullPath = join(projectPath, filePath);
    const dir = join(fullPath, "..");

    // Create directories if needed
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Process template content
    const processedContent =
      typeof content === "function" ? content(context) : (content as string);

    writeFileSync(fullPath, processedContent);
    logger.debug(`Created: ${filePath}`);
  }
}

async function installDependencies(projectPath: string) {
  const { spawn } = await import("node:child_process");

  return new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["install"], {
      cwd: projectPath,
      stdio: "pipe",
    });

    child.on("close", (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm install failed with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}
