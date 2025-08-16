import { createVitestConfig } from '../../tools/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  environment: 'happy-dom',
  setupFiles: ['__tests__/setup.ts'],
})
