import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: true,
  external: ['crypto', 'crypto-js', 'node-forge', 'vue'],
  globalName: 'LDesignCrypto',
  globals: {
    'crypto': 'crypto',
    'crypto-js': 'CryptoJS',
    'node-forge': 'forge',
    'vue': 'Vue',
  },
  // 添加额外的入口文件
  additionalInputs: {
    vue: 'vue.ts',
  },
})
