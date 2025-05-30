#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init";
import { generateCommand } from "./commands/generate";
import { docsCommand } from "./commands/docs";
import { validateCommand } from "./commands/validate";
import { auditCommand } from "./commands/audit";
import { migrateCommand } from "./commands/migrate";
import chalk from "chalk";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, "../..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

const program = new Command();

program
  .name("zodiac")
  .description("🎯 zodiac - Dynamic Schema-Driven Forms CLI")
  .version(version, "-v, --version", "Show version number")
  .helpOption("-h, --help", "Show help information");

// Add global options
program
  .option("--verbose", "Enable verbose logging")
  .option("--config <path>", "Path to config file", "zodiac.config.js")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.verbose) {
      process.env.ZODIAC_VERBOSE = "true";
    }
  });

// Commands
program.addCommand(initCommand);
program.addCommand(generateCommand);
program.addCommand(docsCommand);
program.addCommand(validateCommand);
program.addCommand(auditCommand);
program.addCommand(migrateCommand);

// Enhanced help
program.on("--help", () => {
  console.log("");
  console.log(chalk.bold("Examples:"));
  console.log("  $ zodiac init my-app");
  console.log("  $ zodiac generate contact-form");
  console.log("  $ zodiac docs --format html --output docs/");
  console.log("  $ zodiac validate src/schemas/");
  console.log("  $ zodiac audit --unused-fields");
  console.log("");
  console.log(chalk.bold("Learn more:"));
  console.log("  Documentation: https://zodiac.dev/docs");
  console.log("  Issues: https://github.com/your-org/zodiac/issues");
});

// Error handling
program.exitOverride((err) => {
  if (err.code === "commander.help") {
    process.exit(0);
  }
  if (err.code === "commander.version") {
    process.exit(0);
  }
  console.error(chalk.red("Error:"), err.message);
  process.exit(1);
});

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
