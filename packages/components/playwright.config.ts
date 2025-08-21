import { createPlaywrightConfig } from '../../tools/configs/test/playwright.config.base'

export default createPlaywrightConfig({
  webServer: {
    command: 'pnpm dev',
    port: 5173,
  },
})
