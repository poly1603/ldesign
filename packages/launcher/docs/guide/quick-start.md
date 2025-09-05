---
title: 快速开始
description: 5 分钟上手 @ldesign/launcher，从安装到运行的最短路径
---

# 快速开始

在 5 分钟内快速上手 @ldesign/launcher，开始您的前端开发之旅！

## 🚀 安装

### 使用 npm

```bash
npm install -g @ldesign/launcher
# 或者在项目中安装
npm install --save-dev @ldesign/launcher
```

### 使用 pnpm（推荐）

```bash
pnpm add -g @ldesign/launcher
# 或者在项目中安装
pnpm add -D @ldesign/launcher
```

### 使用 yarn

```bash
yarn global add @ldesign/launcher
# 或者在项目中安装
yarn add --dev @ldesign/launcher
```

## ⚡ 快速体验

### 1. 在现有项目中使用

如果您已有一个前端项目，可以直接使用 launcher 启动：

```bash
# 启动开发服务器
launcher dev

# 构建项目
launcher build

# 预览构建结果
launcher preview
```

### 2. 自动检测项目类型

Launcher 会自动检测您的项目类型并应用最佳配置：

- **Vue 3** 项目 → 自动配置 `@vitejs/plugin-vue`
- **Vue 2** 项目 → 自动配置 `@vitejs/plugin-vue2` + `@vitejs/plugin-legacy`
- **React** 项目 → 自动配置 `@vitejs/plugin-react`
- **Svelte** 项目 → 自动配置 `@sveltejs/vite-plugin-svelte`
- **TypeScript** 项目 → 自动优化 TypeScript 配置

### 3. 零配置启动

大多数情况下，您无需任何配置即可使用：

```bash
cd your-project
launcher dev
```

输出示例：
```
ℹ️  检测到 Vue 3 项目
ℹ️  智能插件加载完成 {"count":1}
ℹ️  开发服务器启动成功 {"url":"http://127.0.0.1:3000/","duration":207}
```

## 📝 创建配置文件

### 自动生成配置

使用命令行工具生成适合您项目的配置文件：

```bash
# 自动检测并生成配置
launcher config init

# 指定项目类型生成配置
launcher config init --preset vue3-ts
```

### 手动创建配置

创建 `launcher.config.ts`（推荐）或 `launcher.config.js`：

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 自动继承预设配置
  launcher: {
    preset: 'vue3-ts' // 可选: vue3, vue3-ts, react, react-ts, svelte, svelte-ts
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist'
  }
})
```

## 🎯 常见使用场景

### 1. Vue 3 + TypeScript 项目

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    preset: 'vue3-ts',
    env: {
      prefix: 'VITE_',
      envFile: ['.env', '.env.local']
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### 2. React 项目快速启动

```javascript
// launcher.config.js
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    preset: 'react',
    env: {
      prefix: 'REACT_APP_'
    }
  }
})
```

### 3. 多入口应用

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    entry: {
      entries: {
        main: './src/main.ts',
        admin: './src/admin.ts'
      }
    }
  }
})
```

### 4. 库模式构建

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd']
    }
  }
})
```

## 🔧 环境变量配置

### 1. 创建 .env 文件

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=My App

# .env.local（本地开发，不提交到版本控制）
VITE_API_KEY=your-secret-key
```

### 2. 在配置中引用

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    env: {
      envFile: ['.env', '.env.local'],
      variables: {
        APP_VERSION: '1.0.0'
      },
      required: ['VITE_API_BASE_URL']
    }
  }
})
```

### 3. 在代码中使用

```typescript
// 在 TypeScript/JavaScript 中使用
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

## 📦 脚本命令

在 `package.json` 中添加便捷脚本：

```json
{
  "scripts": {
    "dev": "launcher dev",
    "build": "launcher build",
    "preview": "launcher preview",
    "type-check": "launcher config validate"
  }
}
```

## 🐛 调试模式

需要详细日志信息时，启用调试模式：

```bash
# 开启详细日志
launcher dev --debug

# 或设置环境变量
DEBUG=* launcher dev
```

## 🆘 遇到问题？

### 常见问题

1. **端口冲突**：修改配置中的端口号或使用 `--port` 参数
2. **TypeScript 错误**：确保安装了 `typescript` 和相关类型定义
3. **插件冲突**：检查是否有重复的 Vite 插件配置

### 获取帮助

```bash
# 查看帮助信息
launcher --help

# 查看特定命令帮助
launcher dev --help

# 验证配置文件
launcher config validate
```

## 🎉 下一步

恭喜！您已经掌握了 @ldesign/launcher 的基本使用。现在您可以：

- 📖 查看 [配置文档](./configuration.md) 了解高级配置
- 🛠 参考 [命令行文档](./cli-reference.md) 掌握更多命令
- 💡 浏览 [最佳实践](./best-practices.md) 优化开发流程
- ❓ 查看 [常见问题](./faq.md) 解决疑难问题

## 💖 社区支持

- 🐛 [报告问题](https://github.com/ldesign/launcher/issues)
- 💬 [讨论区](https://github.com/ldesign/launcher/discussions)
- 📺 [视频教程](https://youtube.com/ldesign-launcher)
- 📧 [邮件支持](mailto:support@ldesign.com)

---

**祝您开发愉快！** 🎊
