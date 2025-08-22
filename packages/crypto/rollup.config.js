import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageName: 'LDesignCrypto',
  external: ['crypto-js', 'node-forge'],
  globals: {
    'crypto-js': 'CryptoJS',
    'node-forge': 'forge',
  },
})
