---
title: 最佳实践
description: 项目结构、配置管理、性能优化、调试与团队协作建议
---

# 最佳实践

项目结构、代码规范、性能优化与团队协作建议汇总。

## 项目结构

```
my-project/
├── src/
│   ├── components/
│   ├── pages/ (或 views/)
│   ├── assets/
│   ├── styles/
│   └── main.ts(x)
├── public/
├── tests/
├── launcher.config.ts
├── package.json
└── README.md
```

建议：
- 组件与页面分层，保持目录整洁
- 公共样式与变量集中管理（如 styles/）
- 使用路径别名（@、@/components 等）

## 配置管理
- 使用 launcher.config.ts，结合 `defineConfig` 获得类型提示
- 采用“基础 + 环境差异”的配置组织方式（base/dev/prod）
- 通过 `launcher.launcher.env` 管理环境变量，敏感变量勿暴露到客户端
- 配置查找顺序建议统一（launcher.* 优先，vite.* 作为兼容）

## 环境变量
- 采用 `VITE_` 前缀向客户端暴露变量，避免误暴露敏感信息
- 为不同环境准备 `.env.development / .env.staging / .env.production`
- 在配置中声明 `required`，在构建前即失败而非运行时失败

## 开发体验
- 使用 `host: '127.0.0.1'` 避免 localhost 解析差异
- 需要外部访问时使用 `host: '0.0.0.0'`
- HMR 异常时优先检查代理/WebSocket 配置
- 使用 `--debug` 透视启动与构建开销

## 性能优化
- 依赖预构建：将常用依赖加入 `optimizeDeps.include`
- 拆分大包：使用 `manualChunks`、Analyzer 报告定位大模块
- 压缩器：开发时禁用压缩，生产使用 `esbuild` 或 `terser`
- Source map：生产环境谨慎开启，避免泄露源码/影响体积

## 资产与样式
- 小图标内联（assetsInlineLimit），大图使用现代格式（webp/avif）
- CSS Modules 用于局部样式隔离，公共样式置于全局
- 使用 PostCSS/Tailwind/UnoCSS 时将配置与 tokens 统一管理

## 代理与网络
- 为 API 设置代理，必要时处理 cookieDomainRewrite 与 CORS
- WebSocket 单独走 ws 代理，提高调试可见性
- 在容器/远程环境中，固定 HMR host/port

## 构建与发布
- CI 中生成体积报告（analyzer），上传为工件
- 将 `dist/` 与报告归档，保留回溯能力
- 多应用或多入口项目，显式指定 entry 与 output 命名模板

## 代码质量
- 接入 ESLint + Prettier + TypeScript 严格模式
- PR 中运行构建与单测，保证稳定性
- 对关键路径添加调试日志（可通过环境开关）

## 常见陷阱
- 误把敏感变量暴露到客户端（前缀与过滤）
- 生产仍启用详尽 source map 与调试日志
- HMR 端口/host 未在代理或容器环境中显式设置

## 清单
- [ ] launcher.config.ts 存在并通过 validate
- [ ] dev/build/preview 脚本可用
- [ ] 环境变量有默认值与 required 校验
- [ ] 构建报告生成并在 CI 中存档
- [ ] 代理/CORS/HTTPS 在目标环境下验证通过
