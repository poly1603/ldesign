import { resolve } from 'node:path'
import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageName: 'LDesignI18n',
  // 解决外部依赖警告
  external: [
    'node:process',
    'vue',
    '@vue/runtime-core',
    '@vue/runtime-dom',
  ],
  // 解决全局变量警告
  globals: {
    'node:process': 'process',
    'vue': 'Vue',
    '@vue/runtime-core': 'Vue',
    '@vue/runtime-dom': 'Vue',
  },
  // 使用构建专用的 tsconfig
  tsconfig: resolve(process.cwd(), 'tsconfig.build.json'),
})
