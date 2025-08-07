import { createPlaywrightConfig } from '../../tools/configs/test/playwright.config.base'

export default createPlaywrightConfig({
  testDir: './e2e',
  webServer: {
    command: 'cd examples/vanilla && pnpm dev',
    port: 5173,
  },
})
