import chalk from "chalk";

interface LoggerOptions {
  verbose?: boolean;
}

class Logger {
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
  }

  private get isVerbose() {
    return this.options.verbose || process.env.CONFORM_VERBOSE === "true";
  }

  info(message: string, ...args: unknown[]) {
    console.log(chalk.blue("ℹ"), message, ...args);
  }

  success(message: string, ...args: unknown[]) {
    console.log(chalk.green("✓"), message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.log(chalk.yellow("⚠"), message, ...args);
  }

  error(message: string, error?: Error | unknown) {
    console.error(chalk.red("✗"), message);
    if (error && this.isVerbose) {
      if (error instanceof Error) {
        console.error(chalk.red(error.stack || error.message));
      } else {
        console.error(chalk.red(String(error)));
      }
    }
  }

  debug(message: string, ...args: unknown[]) {
    if (this.isVerbose) {
      console.log(chalk.gray("🔍"), message, ...args);
    }
  }
}

export const logger = new Logger();
