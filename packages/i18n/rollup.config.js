import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: true, // 启用 Vue 支持，因为包含 Vue 集成
  external: ['vue'],
  globalName: 'LDesignI18n',
  globals: {
    vue: 'Vue',
  },
  // 构建所有格式，包含 UMD
  formats: ['es', 'cjs', 'umd'],
})
