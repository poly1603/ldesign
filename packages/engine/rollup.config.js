import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue', '@vue/runtime-core', '@vue/reactivity', '@vue/shared'],
  globalName: 'LDesignEngine',
  globals: {
    vue: 'Vue',
    '@vue/runtime-core': 'Vue',
    '@vue/reactivity': 'Vue',
    '@vue/shared': 'Vue',
  },
  vue: true,
})
