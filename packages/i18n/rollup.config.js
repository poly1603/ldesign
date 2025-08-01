import { createRollupConfig } from '../../tools/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesignI18n',
  globals: {
    'vue': 'Vue'
  },
  vue: true
})
