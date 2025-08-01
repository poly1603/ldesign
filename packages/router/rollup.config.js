import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesignRouter',
  globals: {
    vue: 'Vue',
  },
  vue: true,
})
