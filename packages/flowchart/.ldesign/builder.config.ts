/**
 * @ldesign/flowchart 构建配置
 * 
 * 使用 @ldesign/builder 进行构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',

  // 排除文件
  exclude: [
    'src/vue/**/*',
    'src/**/*.test.ts',
    'src/**/*.spec.ts',
    'src/__tests__/**/*'
  ],

  // 输出格式
  formats: ['esm', 'cjs', 'umd'],

  // 输出目录
  outDir: {
    esm: 'es',
    cjs: 'cjs',
    umd: 'dist'
  },

  // 生成类型声明文件
  dts: {
    skipDiagnostics: true,
    respectExternal: true
  },

  // 生成 sourcemap
  sourcemap: true,

  // 构建前清理输出目录
  clean: true,

  // 外部依赖（不打包到最终产物中）
  external: [
    '@logicflow/core',
    '@ldesign/shared'
  ],

  // UMD 格式的全局变量映射
  globals: {
    '@logicflow/core': 'LogicFlow',
    '@ldesign/shared': 'LDesignShared'
  },

  // 库名称（用于 UMD 格式）
  name: 'LDesignFlowchart',

  // 压缩配置
  minify: {
    level: 'basic'
  },

  // 样式处理
  css: {
    extract: true,
    modules: false,
    preprocessor: 'less'
  },

  // 构建钩子
  hooks: {
    beforeBuild: async () => {
      console.log('🚀 开始构建 @ldesign/flowchart...')
    },
    afterBuild: async () => {
      console.log('✅ @ldesign/flowchart 构建完成!')
    }
  }
})
