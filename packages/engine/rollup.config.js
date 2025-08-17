import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  globalName: 'LDesignEngine',
  vue: true,
  external: ['vue'],
  globals: {
    vue: 'Vue',
  },
})
