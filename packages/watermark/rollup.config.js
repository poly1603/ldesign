import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignWatermark',
  formats: ['es', 'cjs', 'umd'],
  external: ['vue', '@vue/runtime-core', '@vue/runtime-dom'],
  globals: {
    vue: 'Vue',
    '@vue/runtime-core': 'Vue',
    '@vue/runtime-dom': 'Vue',
  },
  vue: false, // 暂时禁用 Vue 支持，避免构建问题
  // 手动指定入口点，排除 Vue 模块
  entries: {
    index: './src/index.ts',
    utils: './src/utils/index.ts',
    types: './src/types/index.ts',
    security: './src/security/index.ts',
    responsive: './src/responsive/index.ts',
    renderers: './src/renderers/index.ts',
    core: './src/core/index.ts',
    animation: './src/animation/index.ts',
  },
})
