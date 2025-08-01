import { createVitestConfig } from '../../tools/test/vitest.config.base.js'

export default createVitestConfig({
  vue: true,
  environment: 'jsdom',
  setupFiles: ['test/setup.ts'],
})
