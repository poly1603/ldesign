import copy from 'rollup-plugin-copy'
import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignTemplate',
  external: ['vue', '@vue/runtime-core'],
  globals: {
    'vue': 'Vue',
    '@vue/runtime-core': 'Vue',
  },
  vue: true,
  tsconfig: './tsconfig.build.json',
  plugins: [
    copy({
      targets: [{ src: 'src/templates/**/*', dest: 'dist/templates' }],
    }),
  ],
})
