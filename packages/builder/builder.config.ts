/**
 * @ldesign/builder 自身的构建配置
 * 
 * 使用自己来构建自己 - 这是一个很好的自举测试
 */

import { defineConfig } from './src/utils/config/config-loader'
import type { BuilderConfig } from './src/types/config'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true,
    fileName: '[name].[format].js'
  },
  
  // 使用 rollup 作为打包核心
  bundler: 'rollup',
  
  // 生产模式
  mode: 'production',
  
  // 库类型
  libraryType: 'typescript',
  
  // 外部依赖
  external: [
    // Node.js 内置模块
    'fs', 'path', 'url', 'util', 'events', 'stream', 'crypto', 'os',
    
    // 依赖包
    'chalk', 'commander', 'fast-glob', 'jiti', 'picocolors', 'chokidar',
    
    // 可选的 peer dependencies
    'rollup', 'rolldown'
  ],
  
  // TypeScript 配置
  typescript: {
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist',
    isolatedDeclarations: false
  },
  
  // 性能配置
  performance: {
    bundleAnalyzer: false,
    treeshaking: true,
    cache: true
  },
  
  // 清理输出目录
  clean: true,
  
  // 启用压缩
  minify: true,
  
  // 环境特定配置
  env: {
    development: {
      mode: 'development',
      minify: false,
      output: {
        sourcemap: 'inline'
      },
      debug: true
    },
    
    production: {
      mode: 'production',
      minify: true,
      output: {
        sourcemap: true
      },
      debug: false
    }
  }
} as BuilderConfig)
