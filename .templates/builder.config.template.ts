/**
 * @ldesign/builder 标准配置模板
 * 
 * 用于 packages/ 下所有包的打包配置
 * 
 * 使用方法：
 * 1. 复制此文件到你的包根目录，重命名为 builder.config.ts
 * 2. 根据需要调整配置项
 * 3. 运行 pnpm build 进行打包
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出格式：esm（ES模块）、cjs（CommonJS）、umd（UMD）、dts（类型定义）
  formats: ['esm', 'cjs', 'umd', 'dts'],
  
  // 输出目录配置
  outDir: {
    esm: 'es',      // ES模块输出到 es/
    cjs: 'lib',     // CommonJS输出到 lib/
    umd: 'dist',    // UMD输出到 dist/
    dts: 'es'       // 类型定义输出到 es/
  },
  
  // 外部依赖（不会被打包进最终产物）
  external: [
    // 框架依赖
    'vue',
    'react',
    'react-dom',
    '@angular/core',
    'svelte',
    'solid-js',
    'lit',
    'preact',
    '@builder.io/qwik',
    
    // LDesign 依赖
    '@ldesign/engine-core',
    // 根据需要添加其他 @ldesign/* 依赖
  ],
  
  // 压缩选项
  minify: {
    esm: false,    // ESM 不压缩（让使用方自行处理）
    cjs: false,    // CJS 不压缩
    umd: true      // UMD 压缩（用于 CDN）
  },
  
  // Source Map
  sourcemap: {
    esm: true,
    cjs: true,
    umd: false
  },
  
  // 是否清理输出目录
  clean: true,
  
  // 自定义 Rollup 插件
  plugins: [],
})
