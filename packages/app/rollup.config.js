import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  vue: true,
  globalName: 'LDesignApp',
  external: ['vue', '@ldesign/engine', '@ldesign/router', '@ldesign/template'],
  globals: {
    vue: 'Vue',
    '@ldesign/engine': 'LDesignEngine',
    '@ldesign/router': 'LDesignRouter',
    '@ldesign/template': 'LDesignTemplate',
  },
  // 只构建 ES 和 CJS 格式，避免 UMD 的复杂性
  formats: ['es', 'cjs'],
  // 自定义 Less 配置
  lessOptions: {
    javascriptEnabled: true,
    additionalData: `@import "${resolve(
      __dirname,
      'src/styles/variables.less'
    )}";`,
  },
})
