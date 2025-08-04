import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: false, // 暂时禁用 Vue 支持
})
