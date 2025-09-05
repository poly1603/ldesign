---
title: 微前端架构
description: 基于 qiankun 或 Module Federation 的集成思路与配置要点
---

# 微前端架构

以 qiankun、Module Federation 为例说明 Vite/Launcher 的集成实践。

## qiankun（推荐思路）

- 使用社区插件（如 vite-plugin-qiankun）
- 子应用配置 publicPath 与沙箱隔离
- 主应用动态加载子应用入口

子应用（示意）：
```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig(({ mode }) => ({
  server: { port: 7101, host: '127.0.0.1' },
  plugins: [qiankun('subapp-name', { useDevMode: mode !== 'production' })]
}))
```

主应用（加载子应用）：
```ts
// 主应用路由中加载 http://127.0.0.1:7101 子应用资源
```

要点：
- 各子应用端口区分；生产部署需 CDN/publicPath 对齐
- 样式隔离与运行时沙箱；事件总线尽量约束边界

## Module Federation（说明）

- 通过 mf 方案共享远程模块（需相应 Vite 插件）
- 声明 exposes/remotes 与 shared 依赖
- 注意版本一致与单例依赖（如 React/Vue）

## 调试建议
- 本地多端口并行启动；使用 127.0.0.1 显式 host
- 对跨应用通信进行协议化与容错处理
- 结合 analyzer 监控共享依赖是否重复引入
