import { createVitestConfig } from '../../tools/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  environment: 'node',
  setupFiles: ['test/setup.ts'],
})
