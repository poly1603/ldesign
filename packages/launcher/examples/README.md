# Launcher Examples

本目录包含了使用 @ldesign/launcher 的各种框架示例项目。每个项目都配置了 `.ldesign` 目录，包含 `launcher.config.ts` 和 `app.config.ts` 配置文件。

## 📁 项目列表

| 项目 | 框架 | 端口 | 描述 |
|------|------|------|------|
| [react-typescript](./react-typescript) | React 18 + TypeScript | 3002 | React TypeScript 应用示例 |
| [vue3-typescript](./vue3-typescript) | Vue 3 + TypeScript | 3003 | Vue 3 组合式 API 示例 |
| [vue2](./vue2) | Vue 2 | 3004 | Vue 2 经典应用示例 |
| [vanilla](./vanilla) | Vanilla JS/TS | 3005 | 原生 JavaScript/TypeScript 示例 |
| [lit](./lit) | Lit Web Components | 3006 | Lit 元素组件库示例 |
| [angular](./angular) | Angular 17 | 3007 | Angular 应用示例 |
| [typescript-library](./typescript-library) | TypeScript Library | - | TypeScript 库构建示例 |

## 🚀 快速开始

### 1. 安装依赖

在 launcher 包根目录运行：

```bash
pnpm install
pnpm build
```

### 2. 启动示例项目

进入任意示例项目目录：

```bash
cd examples/react-typescript
pnpm launcher dev
```

或者使用 npm scripts：

```bash
pnpm dev
```

### 3. 访问应用

打开浏览器访问对应端口，例如：
- React: http://localhost:3002
- Vue3: http://localhost:3003
- Vue2: http://localhost:3004

## 📂 项目结构

每个示例项目都包含以下结构：

```
example-project/
├── .ldesign/
│   ├── launcher.config.ts    # Vite 配置（通过 launcher 扩展）
│   └── app.config.ts          # 应用配置（注入到 import.meta.env.appConfig）
├── src/
│   └── main.ts/tsx            # 应用入口
├── index.html                 # HTML 模板
└── package.json               # 项目依赖
```

## ⚙️ 配置说明

### launcher.config.ts

Vite 配置文件，支持所有 Vite 配置选项，并扩展了 launcher 特有配置：

```typescript
import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    open: false
  },
  launcher: {
    logLevel: 'info',
    mode: 'development'
  }
})
```

### app.config.ts

应用配置文件，会被自动注入到 `import.meta.env.appConfig`：

```typescript
export default {
  appName: 'My App',
  version: '1.0.0',
  api: {
    baseUrl: 'https://api.example.com'
  },
  features: {
    darkMode: true
  }
}
```

在应用中使用：

```typescript
// React/Vue/Lit
const appConfig = import.meta.env.appConfig

// 使用配置
console.log(appConfig.appName)
console.log(appConfig.api.baseUrl)
```

## 🔥 热更新

修改 `.ldesign/app.config.ts` 文件后保存，配置会自动热更新，无需重启开发服务器。

## 📦 构建

在任意示例项目中运行：

```bash
pnpm launcher build
# 或
pnpm build
```

构建产物会输出到 `dist` 目录。

## 🔍 预览构建产物

```bash
pnpm launcher preview
# 或
pnpm preview
```

## 🛠️ 特性

- ✅ **统一配置管理** - 所有配置集中在 `.ldesign` 目录
- ✅ **应用配置注入** - 通过 `import.meta.env.appConfig` 访问配置
- ✅ **热更新支持** - 修改配置文件后自动更新
- ✅ **框架自动检测** - 自动加载对应框架的 Vite 插件
- ✅ **TypeScript 支持** - 完整的类型定义和智能提示
- ✅ **零配置启动** - 即使没有配置文件也能使用默认配置

## 📝 注意事项

1. 确保先在 launcher 包根目录执行 `pnpm build` 构建 launcher
2. 每个项目需要安装对应的框架依赖（如 vite、@vitejs/plugin-react 等）
3. 端口冲突时会自动尝试下一个可用端口
4. TypeScript 配置文件需要 `typescript` 和 `jiti` 依赖

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
