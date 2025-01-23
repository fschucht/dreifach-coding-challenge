import { pino } from "pino";
import { pinoConfig } from "#config/pino.config.ts";

const baseLogger = pino(pinoConfig);

export class Logger {
  private readonly logger: pino.Logger;

  constructor(moduleName: string) {
    this.logger = baseLogger.child({ module: moduleName });
  }

  info(message: string, params: Record<string, unknown> = {}): void {
    this.logger.info(params, message);
  }

  debug(message: string, params: Record<string, unknown> = {}): void {
    this.logger.debug(params, message);
  }

  warn(message: string, params: Record<string, unknown> = {}): void {
    this.logger.warn(params, message);
  }

  error(message: string, params: Record<string, unknown> = {}): void {
    this.logger.error(params, message);
  }
}
