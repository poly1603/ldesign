/**
 * @ldesign/theme - Vitest 配置
 */

import { createVitestConfig } from '../../tools/configs/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  setupFiles: ['./tests/setup.ts'],
  coverage: {
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
