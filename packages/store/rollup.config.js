import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue', 'pinia'],
  globalName: 'LDesignStore',
  globals: {
    vue: 'Vue',
    pinia: 'Pinia',
  },
  vue: true,
})
