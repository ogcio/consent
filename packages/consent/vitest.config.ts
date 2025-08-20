/// <reference types="vitest" />
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: {
      junit: "./results.xml",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "cobertura"],
      exclude: [
        "node_modules/",
        "src/test/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
})
