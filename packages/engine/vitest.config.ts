import { createVitestConfig } from '../../tools/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  environment: 'jsdom',
  setupFiles: ['tests/setup.ts'],
})
