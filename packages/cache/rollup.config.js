import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignCache',
  formats: ['es', 'cjs', 'umd'],
  external: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
  globals: {
    vue: 'Vue',
    '@vue/runtime-core': 'Vue',
    '@vue/runtime-dom': 'Vue',
  },
  vue: true,
})
