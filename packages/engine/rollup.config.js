import { createRollupConfig } from '../../tools/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesignEngine',
  globals: {
    'vue': 'Vue'
  },
  vue: true
})