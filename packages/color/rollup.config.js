import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: true, // 启用Vue支持以处理adapt/vue目录
  external: ['vue'], // Vue作为外部依赖
  globals: {
    vue: 'Vue',
  },
  globalName: 'LDesignColor',
})
