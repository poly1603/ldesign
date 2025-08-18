import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignApp',
  formats: ['es', 'cjs', 'umd'],
  external: ['vue'],
  globals: {
    vue: 'Vue',
  },
  vue: true,
  jsx: true,
})
