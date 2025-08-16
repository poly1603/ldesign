import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesignI18n',
  globals: {
    vue: 'Vue',
  },
  vue: true,
})
