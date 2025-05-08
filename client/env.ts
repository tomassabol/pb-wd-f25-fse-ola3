/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `EXPO_PUBLIC_`.
   */
  client: {
    EXPO_PUBLIC_API_KEY: z.string(),
  },

  clientPrefix: "EXPO_PUBLIC_",

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  },

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
