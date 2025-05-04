/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "dotenv/config"

import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

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
    API_KEY: z.string(),
    JWT_SECRET: z.string().min(32),
  },

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_KEY: process.env.API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
})
