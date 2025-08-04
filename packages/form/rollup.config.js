import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: true, // 启用 Vue 支持，因为包含 Vue 组件和 JSX
})
