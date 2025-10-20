import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 库类型
  libraryType: 'typescript',

  // 输入文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    // 全局名称（UMD 构建时使用）
    name: 'LDesignCache',
    // 全局变量映射
    globals: {
      vue: 'Vue'
    },
    // 启用 sourcemap
    sourcemap: true,
    // ESM 输出配置
    esm: {
      dir: 'es',
      preserveStructure: true
    },
    // CJS 输出配置
    cjs: {
      dir: 'lib',
      preserveStructure: true
    },
    // UMD 输出配置
    umd: {
      dir: 'dist'
    }
  },

  // 生成类型定义文件
  dts: true,

  // 清理输出目录
  clean: true,

  // 外部依赖
  external: [
    'vue',
    '@ldesign/shared'
  ],

  // 禁用构建后验证（库项目不需要运行测试验证）
  postBuildValidation: {
    enabled: false
  },

  // 构建完成钩子
  onSuccess: async () => {
    console.info('✅ @ldesign/cache 构建完成')
  }
})
