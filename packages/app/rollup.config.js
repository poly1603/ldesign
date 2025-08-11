import { createVueConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createVueConfig(import.meta.url, {
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
})
