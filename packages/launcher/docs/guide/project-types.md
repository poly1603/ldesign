---
title: 项目类型
description: 支持的项目类型概览与典型项目结构、快速创建示例
---

# 项目类型

Vite Launcher 支持多种前端框架和项目类型，本章详细介绍每种类型的特性和配置。

## 支持的项目类型

| 类型 | 描述 | 框架 | 特性 |
|------|------|------|------|
| `vue3` | Vue 3 项目 | Vue 3 | Composition API, TypeScript 支持 |
| `vue2` | Vue 2 项目 | Vue 2 | Options API, 经典语法 |
| `react` | React 项目 | React | Hooks, JSX |
| `react-next` | Next.js 项目 | React + Next.js | SSR, 文件路由 |
| `vanilla` | 原生 JavaScript 项目 | 无框架 | 纯 JavaScript |
| `vanilla-ts` | TypeScript 项目 | 无框架 | TypeScript 支持 |
| `lit` | Lit 项目 | Lit | Web Components |
| `svelte` | Svelte 项目 | Svelte | 响应式框架 |
| `angular` | Angular 项目 | Angular | 企业级框架 |

## Vue 3 项目

### 特性

- Composition API
- TypeScript 支持
- 单文件组件 (SFC)
- 响应式系统

### 创建示例

```typescript
import { createProject } from '@ldesign/launcher'

// 创建 Vue 3 项目
await createProject('./my-vue3-app', 'vue3')

// 使用 TypeScript 模板
await createProject('./my-vue3-ts-app', 'vue3', { 
  template: 'typescript' 
})
```

### 项目结构

```
my-vue3-app/
├── src/
│   ├── components/
│   ├── views/
│   ├── App.vue
│   └── main.js
├── public/
├── index.html
├── package.json
└── launcher.config.ts
```

## Vue 2 项目

### 特性

- Options API
- 经典语法
- 向后兼容

### 创建示例

```typescript
await createProject('./my-vue2-app', 'vue2')
```

### 项目结构

```
my-vue2-app/
├── src/
│   ├── components/
│   ├── views/
│   ├── App.vue
│   └── main.js
├── public/
├── index.html
├── package.json
└── launcher.config.ts
```

## React 项目

### 特性

- Hooks
- JSX 语法
- 函数组件
- 状态管理

### 创建示例

```typescript
await createProject('./my-react-app', 'react')

// 使用 TypeScript
await createProject('./my-react-ts-app', 'react', { 
  template: 'typescript' 
})
```

### 项目结构

```
my-react-app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
└── launcher.config.ts
```

## Next.js 项目

### 特性

- 服务端渲染 (SSR)
- 文件路由
- API 路由
- 静态生成

### 创建示例

```typescript
await createProject('./my-next-app', 'react-next')
```

### 项目结构

```
my-next-app/
├── pages/
│   ├── api/
│   ├── _app.js
│   └── index.js
├── components/
├── styles/
├── public/
├── package.json
└── next.config.js
```

## Vanilla 项目

### 特性

- 纯 JavaScript
- 无框架依赖
- 轻量级
- 快速启动

### 创建示例

```typescript
await createProject('./my-vanilla-app', 'vanilla')
```

### 项目结构

```
my-vanilla-app/
├── src/
│   ├── js/
│   ├── css/
│   └── main.js
├── public/
├── index.html
├── package.json
└── launcher.config.ts
```

## TypeScript 项目

### 特性

- TypeScript 支持
- 类型安全
- 更好的开发体验
- 智能提示

### 创建示例

```typescript
await createProject('./my-ts-app', 'vanilla-ts')
```

### 项目结构

```
my-ts-app/
├── src/
│   ├── js/
│   ├── css/
│   └── main.ts
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── launcher.config.ts
```

## Lit 项目

### 特性

- Web Components
- 轻量级
- 原生支持
- 可复用组件

### 创建示例

```typescript
await createProject('./my-lit-app', 'lit')
```

### 项目结构

```
my-lit-app/
├── src/
│   ├── components/
│   └── main.js
├── public/
├── index.html
├── package.json
└── launcher.config.ts
```

## Svelte 项目

### 特性

- 响应式框架
- 编译时优化
- 简洁语法
- 高性能

### 创建示例

```typescript
await createProject('./my-svelte-app', 'svelte')
```

### 项目结构

```
my-svelte-app/
├── src/
│   ├── components/
│   ├── App.svelte
│   └── main.js
├── public/
├── index.html
├── package.json
└── launcher.config.ts
```

## Angular 项目

### 特性

- 企业级框架
- 依赖注入
- 模块化
- 完整的工具链

### 创建示例

```typescript
await createProject('./my-angular-app', 'angular')
```

### 项目结构

```
my-angular-app/
├── src/
│   ├── app/
│   ├── assets/
│   └── main.ts
├── public/
├── index.html
├── package.json
├── angular.json
└── launcher.config.ts
```

## 项目类型检测

### 自动检测

Vite Launcher 会自动检测项目类型：

```typescript
import { detectProject } from '@ldesign/launcher'

const result = await detectProject('./my-app')
console.log('项目类型:', result.projectType)
console.log('框架:', result.framework)
console.log('置信度:', result.confidence)
```

### 检测逻辑

1. **依赖分析**: 检查 package.json 中的依赖
2. **文件检测**: 查找特征文件 (如 .vue, .jsx)
3. **配置分析**: 分析构建配置文件
4. **置信度计算**: 基于多个因素计算检测置信度

## 自定义项目类型

### 扩展支持

可以通过插件系统扩展支持新的项目类型：

```typescript
// 自定义项目类型检测
const customDetector = {
  name: 'custom-framework',
  detect: async (projectPath) => {
    // 自定义检测逻辑
    return {
      type: 'custom',
      confidence: 0.8
    }
  }
}
```

## 最佳实践

### 1. 选择合适的项目类型
- 根据团队技术栈选择
- 考虑项目规模和复杂度
- 评估学习成本

### 2. 模板定制
- 根据项目需求定制模板
- 添加常用的工具和库
- 配置开发环境

### 3. 类型检测
- 在项目创建时启用自动检测
- 验证检测结果的准确性
- 手动指定类型作为备选

## 下一步

- [基础用法](./basic-usage.md) - 学习基本使用方法
- [高级用法](./advanced-usage.md) - 探索高级功能
- [配置选项](./configuration.md) - 了解详细配置
