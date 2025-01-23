import type pino from "pino";
import { baseConfig } from "./base.config.ts";

export const pinoConfig: pino.LoggerOptions = {
  transport: {
    targets:
      baseConfig.NODE_ENV === "development"
        ? [
            {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            },
          ]
        : [],
  },
};
