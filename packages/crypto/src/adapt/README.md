# 框架适配器

这个目录包含了针对不同前端框架的适配器实现。

## 目录结构

```
adapt/
├── vue/           # Vue 3 适配器
│   ├── composables/   # Vue Composition API hooks
│   ├── plugin.ts      # Vue 插件
│   └── index.ts       # 主入口文件
├── react/         # React 适配器 (计划中)
├── angular/       # Angular 适配器 (计划中)
└── svelte/        # Svelte 适配器 (计划中)
```

## 适配器设计原则

1. **框架无关的核心**: 所有加解密逻辑都在核心模块中实现，适配器只负责框架特定的集成
2. **统一的 API**: 不同框架的适配器提供相似的 API 接口
3. **类型安全**: 每个适配器都提供完整的 TypeScript 类型定义
4. **按需加载**: 用户只需要安装和使用他们需要的框架适配器

## Vue 适配器

Vue 适配器提供了以下功能：

- **Composition API Hooks**: `useCrypto`, `useHash`, `useSignature`
- **Vue 插件**: 全局注册加解密功能
- **响应式状态管理**: 自动处理加载状态和错误状态
- **TypeScript 支持**: 完整的类型定义

### 使用示例

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
import { createApp } from 'vue'

const app = createApp(App)
app.use(CryptoPlugin)
```

## 未来计划

- **React 适配器**: 提供 React Hooks 和 Context
- **Angular 适配器**: 提供 Angular Services 和 Directives
- **Svelte 适配器**: 提供 Svelte Stores 和 Actions
