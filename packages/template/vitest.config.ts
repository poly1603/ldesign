import { createVitestConfig } from '../../tools/configs/vitest.base.config'

export default createVitestConfig({
  vue: true,
  environment: 'jsdom',
  setupFiles: ['tests/setup.ts'],
})
