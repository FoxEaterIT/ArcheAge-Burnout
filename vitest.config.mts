import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // orari degli eventi e date non devono dipendere dal fuso della macchina
    env: { TZ: "UTC" },
    passWithNoTests: true,
  },
})
