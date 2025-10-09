import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 库类型
  libraryType: 'typescript',

  // 输出格式
  format: ['esm', 'cjs', 'umd'],

  // 输出目录配置
  output: {
    esm: 'es',
    cjs: 'lib', 
    umd: 'dist'
  },

  // 生成类型定义文件
  dts: true,

  // 清理输出目录
  clean: true,

  // 生成 sourcemap
  sourcemap: true,

  // 禁用构建后验证（库项目不需要运行测试验证）
  postBuildValidation: {
    enabled: false
  },

  // 构建完成钩子
  onSuccess: async () => {
    console.log('✅ @ldesign/cache 构建完成')
  }
})
