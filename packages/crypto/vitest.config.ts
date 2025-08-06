import { createVitestConfig } from '../../tools/configs/vitest.base.config'

export default createVitestConfig({
  vue: true,
  environment: 'node',
  setupFiles: ['test/setup.ts'],
})
