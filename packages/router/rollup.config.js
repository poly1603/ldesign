import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesignRouter',
  formats: ['es', 'cjs', 'umd'], // 构建所有格式
  globals: {
    vue: 'Vue',
  },
  vue: true,
  includeUmd: true, // 启用UMD构建
  umdEntry: 'src/index.umd.ts', // 使用完整功能的UMD入口文件
})
