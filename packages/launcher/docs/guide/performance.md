---
title: 性能优化指南
description: 从冷启动、HMR、依赖预构建到构建拆包与体积分析的系统优化建议
---

# 性能优化指南

本指南从开发与构建两个阶段系统梳理可落地的优化手段，帮助你在大中型工程中取得稳定的体验与产物体积。

## 开发阶段（Dev）

### 1) 依赖预构建（optimizeDeps）

```ts path=null start=null
export default defineConfig({
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['@testing-library/*'],
    entries: ['./src/**/*.vue', './src/**/*.ts'],
    force: false,
    esbuildOptions: {
      target: 'es2020',
      supported: { 'top-level-await': true }
    }
  }
})
```

- include：强制预构建常用依赖，提升冷启动/热更新
- exclude：排除较少使用或不希望预构建的包
- entries：扫描入口，避免遗漏懒加载路径
- force：升级依赖后可临时 true 以刷新缓存

### 2) HMR 与 Watch

```ts path=null start=null
export default defineConfig({
  server: {
    hmr: { port: 24678, host: '127.0.0.1' },
    watch: { ignored: ['**/node_modules/**', '**/dist/**'] }
  }
})
```

- 在代理/容器/跨网段时，固定 HMR 的 host/port
- 忽略 dist 与大体量目录，减少无效监听

### 3) 源码映射（Source Map）

- 开发：sourcemap:true 以提升调试体验
- 生产：谨慎开启，避免体积膨胀与源码泄露（可使用 hidden）

## 构建阶段（Build）

### 1) 拆包策略（manualChunks）

```ts path=null start=null
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vue-vendor'
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('element-plus')) return 'ui-vendor'
            return 'vendor'
          }
        }
      }
    }
  }
})
```

- 目标：稳定缓存（vendor/ui 等），提升二次访问速度

### 2) 压缩器与目标

```ts path=null start=null
export default defineConfig({
  build: {
    minify: 'esbuild',     // 体积与速度折中，亦可使用 'terser'
    target: 'es2018',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1024
  }
})
```

- reportCompressedSize：关闭可减少构建统计开销
- chunkSizeWarningLimit：按业务体量调整告警阈值

### 3) 体积分析

```ts path=null start=null
import analyzer from '@ldesign/plugin-analyzer'
export default defineConfig({ plugins: [analyzer({ open: true })] })
```

- 关注重复依赖与最大模块；拆分或压缩

### 4) 缓存

- Node 层缓存（pnpm store）与构建缓存配合
- CI 中缓存依赖与构建中间文件（按需）

## Monorepo 场景

```ts path=null start=null
export default defineConfig({
  resolve: {
    alias: {
      '@ui': '../../packages/ui/src',
      '@utils': '../../packages/utils/src'
    },
    dedupe: ['vue', 'react']
  },
  optimizeDeps: { include: ['@ui', '@utils'] }
})
```

- 路径别名直连源码；对框架类依赖去重（dedupe）避免多份副本
- 子包改动频繁时关注 HMR 稳定性与预构建命中情况

## 诊断与排查（Dev/CI）

### DEBUG 日志
```bash
# Launcher 与 Vite 调试日志
DEBUG=launcher:* vite:* launcher dev --debug
```
- 结合 CLI 的 --debug，定位插件执行、代理、HMR 连接等问题

### 内存与进程参数
```bash
# 增加 Node 内存上限（按需）
set NODE_OPTIONS=--max-old-space-size=4096  # Windows PowerShell 用 $env:NODE_OPTIONS
```
- 若构建耗时异常，检查是否开启 reportCompressedSize、是否存在超大 Sourcemap

### Watch 高占用
- 缩小监听范围（watch.ignored），或在 WSL/网络盘下启用 usePolling 并增大 interval

### 资源优化提示
- 图片：用外部工具（如 imagemin/squoosh-cli）预优化，再参与构建
- 字体：子集化与按需加载，减少初始载入体积

## 平台/环境提示

- Windows：路径区分大小写与换行编码差异；如遇轮询高 CPU，可调低 watch.interval 或缩小监听范围
- Node 内存：超大项目构建可设置 NODE_OPTIONS=--max-old-space-size=4096
- Host：本地推荐 127.0.0.1；对外访问使用 0.0.0.0

