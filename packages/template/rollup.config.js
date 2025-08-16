import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesignTemplate',
  globals: {
    vue: 'Vue',
  },
  vue: true,
})
