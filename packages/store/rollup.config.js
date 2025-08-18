import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignStore',
  external: ['vue', 'pinia'],
  globals: {
    vue: 'Vue',
    pinia: 'Pinia',
  },
  vue: true,
})
