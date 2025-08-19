import { createRollupConfig } from '../../tools/build/rollup.config.base.js'
import copy from 'rollup-plugin-copy'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignTemplate',
  external: ['vue'],
  globals: {
    vue: 'Vue',
  },
  vue: true,
  plugins: [
    copy({
      targets: [{ src: 'src/templates/**/*', dest: 'dist/templates' }],
    }),
  ],
})
