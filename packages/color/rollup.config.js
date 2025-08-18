import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageName: 'LDesignColor',
  external: ['@arco-design/color', 'chroma-js'],
  globals: {
    '@arco-design/color': 'ArcoColor',
    'chroma-js': 'chroma',
  },
})
