import { defineConfig } from "@playwright/test"

// porta di `pnpm dev`: Next non avvia un secondo dev server sulla stessa cartella, quindi si riusa quello aperto
const port = 3000

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${port}`,
    // usa Google Chrome installato: niente download di browser
    channel: "chrome",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "pnpm dev",
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
