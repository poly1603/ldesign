import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: true,
  external: ['vue', '@ldesign/engine'],
  globalName: 'LDesignRouter',
  globals: {
    vue: 'Vue',
    '@ldesign/engine': 'LDesignEngine',
  },
  // 排除 examples 目录
  excludePatterns: ['examples/**/*', 'test/**/*', '**/*.test.*', '**/*.spec.*'],
})
