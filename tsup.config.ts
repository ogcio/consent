import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts", // Client bundle
    "server/index": "src/server/index.ts", // Server bundle
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "next", "@govie-ds/react"],
  treeshake: true,
  minify: true,
  target: "es2020",
  outDir: "dist",
})
