import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignForm',
  formats: ['es', 'cjs', 'umd'],
  external: ['vue'],
  globals: {
    vue: 'Vue',
  },
  vue: false,
})
