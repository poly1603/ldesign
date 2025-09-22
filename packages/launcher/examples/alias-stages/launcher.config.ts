/**
 * 别名阶段配置示例
 * 
 * 演示如何使用新的别名阶段配置功能
 */

import { 
  defineConfig, 
  createAlias,
  createBasicAliases,
  createDevAlias,
  createBuildAlias,
  createUniversalAlias
} from '@ldesign/launcher'

export default defineConfig({
  // 使用工具函数创建别名
  resolve: {
    alias: [
      // 基本别名（@ -> src, ~ -> 项目根目录），默认在 dev 阶段生效
      ...createBasicAliases('./src'),
      
      // 只在开发阶段生效的别名
      createDevAlias('@mock', './src/mock'),
      createDevAlias('@debug', './src/debug'),
      createDevAlias('@test-utils', './src/test-utils'),
      
      // 只在构建阶段生效的别名
      createBuildAlias('@prod', './src/production'),
      createBuildAlias('@optimized', './src/optimized'),
      
      // 在所有阶段生效的别名
      createUniversalAlias('@shared', './src/shared'),
      createUniversalAlias('@constants', './src/constants'),
      
      // 自定义阶段配置
      createAlias('@preview', './src/preview', ['preview']),
      createAlias('@dev-build', './src/dev-build', ['dev', 'build']),
      
      // 手动配置的别名
      {
        find: '@api',
        replacement: './src/api/mock',
        stages: ['dev']
      },
      {
        find: '@api',
        replacement: './src/api/real',
        stages: ['build', 'preview']
      },
      
      // 正则表达式别名
      {
        find: /^@components\/(.*)$/,
        replacement: './src/components/$1',
        stages: ['dev', 'build', 'preview']
      },
      
      // 条件性库别名
      {
        find: '@ldesign/ui',
        replacement: '../packages/ui/src',
        stages: ['dev'] // 开发时使用源码
      },
      {
        find: '@ldesign/ui',
        replacement: '@ldesign/ui',
        stages: ['build', 'preview'] // 构建时使用编译版本
      }
    ]
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true
  },
  
  // Launcher 特定配置
  launcher: {
    // 启用别名调试
    debug: true,
    
    // 别名配置
    alias: {
      enabled: true,
      stages: ['dev', 'build', 'preview'] // 内置别名在所有阶段生效
    },
    
    hooks: {
      beforeStart: () => {
        console.log('🚀 开发服务器启动前')
      },
      beforeBuild: () => {
        console.log('🔨 构建开始前')
      },
      beforePreview: () => {
        console.log('👀 预览服务器启动前')
      }
    }
  }
})
