import { createPlaywrightConfig } from '../../tools/playwright.config.base'

export default createPlaywrightConfig({
  webServer: {
    command: 'cd example && pnpm dev',
    port: 5173
  }
})
