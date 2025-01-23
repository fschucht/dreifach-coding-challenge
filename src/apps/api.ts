import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";
import { emailsApi } from "#api/emails.ts";
import { apiConfig } from "#config/api.config.ts";
import { pinoConfig } from "#config/pino.config.ts";
import { Logger } from "#infra/pino/logger.ts";

const app = new Hono();
const logger = new Logger("api");

app.use(trimTrailingSlash());
app.use(pinoLogger({ pino: pinoConfig }));
app.use(cors());
app.use(compress());

app.route("/", emailsApi);

app.notFound((context) => {
  return context.json({
    error: "Not found",
  });
});
app.onError((_error, context) => {
  return context.json({
    error: "Internal server error",
  });
});

const server = serve(
  {
    fetch: app.fetch,
    hostname: apiConfig.HOSTNAME,
    port: apiConfig.PORT,
  },
  () => {
    logger.info("Started server", {
      hostname: apiConfig.HOSTNAME,
      port: apiConfig.PORT,
    });
  },
);

process.on("exit", (signal) => {
  logger.info("Received SIGTERM signal", { signal });
  logger.info("Closing http server");

  server.close(() => {
    logger.info("Closed http server");
    process.exit(0);
  });
});
