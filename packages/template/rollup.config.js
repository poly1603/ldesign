import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignTemplate',
  external: ['vue'],
  globals: {
    vue: 'Vue',
  },
  vue: true,
})
