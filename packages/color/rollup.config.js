import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue', '@arco-design/color', 'chroma-js'],
  globalName: 'LDesignColor',
  globals: {
    vue: 'Vue',
    '@arco-design/color': 'ArcoColor',
    'chroma-js': 'chroma',
  },
  vue: true,
})
