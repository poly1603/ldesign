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
  // 只构建 ES 和 CJS 格式，避免 UMD 的复杂性
  formats: ['es', 'cjs'],
})
