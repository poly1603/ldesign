import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue', 'crypto-js', 'node-forge'],
  globalName: 'LDesignCrypto',
  globals: {
    'vue': 'Vue',
    'crypto-js': 'CryptoJS',
    'node-forge': 'forge',
  },
  vue: true,
})
