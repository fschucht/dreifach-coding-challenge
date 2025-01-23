import { Hono } from "hono";

export const emailsApi = new Hono().basePath("/emails").post("/");
