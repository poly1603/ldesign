import { createPlaywrightConfig } from '../../tools/playwright.config.base'

export default createPlaywrightConfig({
  webServer: {
    command: 'cd examples/basic && pnpm dev',
    port: 5173
  }
})
