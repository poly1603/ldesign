import { createVitestConfig } from '../../tools/test/vitest.config.base.js'

export default createVitestConfig({
  vue: true,
  environment: 'happy-dom',
  setupFiles: ['test/setup.ts'],
})
