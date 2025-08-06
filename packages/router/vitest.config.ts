import { createVitestConfig } from '../../tools/configs/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  environment: 'happy-dom',
  setupFiles: ['test/setup.ts'],
})
