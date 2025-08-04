import { createVitestConfig } from '../../tools/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  environment: 'jsdom',
  setupFiles: ['__tests__/setup.ts'],
})
