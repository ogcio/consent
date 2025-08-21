import path from "node:path"
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/server/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  treeshake: true,
  esbuildOptions: (options) => {
    options.alias = {
      "@": path.resolve(__dirname, "src"),
    }
  },
})
