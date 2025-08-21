import { resolve } from 'node:path'
import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  external: ['vue', '@ldesign/device', '@ldesign/engine', '@ldesign/template'],
  packageName: 'LDesignRouter',
  formats: ['es', 'cjs', 'umd'],
  globals: {
    'vue': 'Vue',
    '@ldesign/device': 'LDesignDevice',
    '@ldesign/engine': 'LDesignEngine',
    '@ldesign/template': 'LDesignTemplate',
  },
  vue: true,
  tsconfig: resolve(process.cwd(), 'tsconfig.build.json'),
})
