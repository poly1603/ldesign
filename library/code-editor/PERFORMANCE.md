# 性能优化与高级功能

## 概述

本次更新对代码编辑器进行了大幅性能优化，并添加了多项高级功能，包括：

1. **友好的 Loading 提示** - 解决首次加载慢的问题
2. **Monaco Editor Workers 优化** - 显著提升加载性能
3. **Vue 代码高亮支持** - 完整的 Vue SFC 语法支持
4. **TSX/JSX 代码高亮** - React 开发友好
5. **Emmet 代码补全** - 快速编写 HTML/CSS
6. **插件系统** - 动态加载功能模块
7. **代码片段补全** - 内置常用代码片段

## 核心更新

### 1. 增强型编辑器（EnhancedCodeEditor）

新增 `EnhancedCodeEditor` 类，提供更好的用户体验：

```typescript
import { createEnhancedCodeEditor } from '@ldesign/code-editor'

const editor = createEnhancedCodeEditor('#editor', {
  value: 'console.log("Hello")',
  language: 'javascript',
  theme: 'vs-dark',

  // 显示 Loading 动画
  showLoading: true,
  loadingText: '正在初始化编辑器...',

  // 插件配置
  plugins: {
    emmet: true,          // Emmet 补全
    snippets: true,       // 代码片段
    bracketMatching: true,// 括号匹配
    autoClosingTags: true // 自动闭合标签
  },

  // Loading 状态回调
  onLoadingChange: (state) => {
    console.log(`进度: ${state.progress}% - ${state.message}`)
  }
})
```

### 2. Monaco Editor Workers 配置

自动配置 Workers，优化加载性能：

```typescript
import { setupMonacoWorkers, preloadLanguages } from '@ldesign/code-editor'

// 在应用启动时调用（可选，增强型编辑器会自动调用）
setupMonacoWorkers()

// 预加载语言支持
await preloadLanguages(['typescript', 'json', 'html'])
```

### 3. Vue 语言支持

完整的 Vue 单文件组件语法高亮：

```typescript
import { createEnhancedCodeEditor } from '@ldesign/code-editor'

const editor = createEnhancedCodeEditor('#editor', {
  language: 'vue',
  value: `<template>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const message = ref('Hello Vue!')
</script>

<style scoped>
div { color: red; }
</style>`,
  plugins: {
    emmet: true  // Vue 中自动启用 Emmet
  }
})
```

### 4. TSX/JSX 支持

React 开发的完整支持：

```typescript
const editor = createEnhancedCodeEditor('#editor', {
  language: 'tsx',
  value: `import React, { useState } from 'react'

const Counter: React.FC = () => {
  const [count, setCount] = useState(0)
  return <div onClick={() => setCount(count + 1)}>{count}</div>
}`
})
```

### 5. Emmet 代码补全

在 HTML、CSS、Vue 中使用 Emmet：

```typescript
const editor = createEnhancedCodeEditor('#editor', {
  language: 'html',
  plugins: {
    emmet: true
  }
})

// 支持的 Emmet 缩写：
// div.container -> <div class="container"></div>
// ul>li*3 -> <ul><li></li><li></li><li></li></ul>
// div#app -> <div id="app"></div>
// table>tr*2>td*3 -> 创建 2x3 表格
```

CSS Emmet 支持：

```css
/* 输入 df 触发 */
display: flex;

/* 输入 m 触发 */
margin: ;

/* 输入 posa 触发 */
position: absolute;
```

### 6. 代码片段补全

内置常用代码片段：

**JavaScript/TypeScript:**
- `log` → `console.log()`
- `func` → 函数定义
- `arrow` → 箭头函数
- `foreach` → forEach 循环
- `map` → map 映射
- `filter` → filter 过滤
- `reduce` → reduce 归约
- `promise` → Promise
- `async` → 异步函数
- `try` → try-catch

**TypeScript 专用:**
- `interface` → 接口定义
- `type` → 类型���名
- `class` → 类定义
- `enum` → 枚举定义

### 7. 插件系统

动态加载功能模块：

```typescript
import { PluginManager } from '@ldesign/code-editor'

const pluginManager = PluginManager.getInstance()

// 加载单个插件
await pluginManager.loadPlugin('emmet')
await pluginManager.loadPlugin('vue')
await pluginManager.loadPlugin('react')

// 批量加载
await pluginManager.loadPlugins(['emmet', 'vue'])

// 检查插件状态
const isLoaded = pluginManager.isPluginLoaded('emmet')
```

可用插件：
- `emmet` - Emmet 补全
- `vue` - Vue 语言支持
- `react` - React/TSX 支持
- `typescript` - TypeScript 增强

## 性能优化

### 首次加载优化

**问题**: 首次加载 Monaco Editor 较慢，用户体验不佳

**解决方案**:
1. **Loading 动画**: 显示友好的加载提示，包含进度条和状态信息
2. **Workers 配置**: 使用 Web Workers 异步加载语言服务
3. **按需加载**: 只加载当前需要的语言支持
4. **预加载优化**: 在后台预加载常用语言

### 使用建议

**基础编辑器** (`createCodeEditor`):
- 适用于简单场景
- 加载最快
- 无额外功能

**增强型编辑器** (`createEnhancedCodeEditor`):
- 适用于复杂场景
- 带 Loading 提示
- 自动优化性能
- 支持插件系统

### 性能对比

| 指标 | 基础编辑器 | 增强型编辑器 |
|------|-----------|-------------|
| 首次加载时间 | ~2-3s | ~2-3s |
| 用户感知 | 等待时黑屏 | 友好的 Loading |
| 语言支持 | 按需手动 | 自动加载 |
| 插件管理 | 手动 | 自动 |

## API 更新

### 新增类型

```typescript
// 扩展配置类型
interface ExtendedCodeEditorConfig extends CodeEditorConfig {
  showLoading?: boolean
  loadingText?: string
  plugins?: PluginConfig
  workers?: WorkerConfig
  onLoadingChange?: (state: LoadingState) => void
}

// Loading 状态
interface LoadingState {
  isLoading: boolean
  progress: number
  message: string
}

// 插件配置
interface PluginConfig {
  emmet?: boolean
  snippets?: boolean
  bracketMatching?: boolean
  autoClosingTags?: boolean
  formatOnPaste?: boolean
  formatOnType?: boolean
}
```

### 新增工具函数

```typescript
// Worker 配置
export { setupMonacoWorkers, preloadLanguages } from '@ldesign/code-editor'

// 插件管理
export { PluginManager, registerCommonSnippets } from '@ldesign/code-editor'

// 语言注册
export { registerVueLanguage, registerReactLanguage } from '@ldesign/code-editor'

// Emmet 支持
export { registerEmmetProvider } from '@ldesign/code-editor'
```

## 示例更新

### Vanilla JS 示例

更新了 `examples/vanilla-demo` 包含：
- ✅ 增强型编辑器演示（带 Loading）
- ✅ Vue 代码高亮
- ✅ TSX 代码高亮
- ✅ Emmet 补全演示
- ✅ 代码片段演示
- ✅ 原有的所有功能

运行示例：
```bash
cd examples/vanilla-demo
pnpm install
pnpm dev
```

### Vue 3 示例

更新 Vue 示例（计划中）

## 迁移指南

### 从基础编辑器迁移

如果你当前使用 `createCodeEditor`，可以无缝迁移到 `createEnhancedCodeEditor`：

```typescript
// 之前
import { createCodeEditor } from '@ldesign/code-editor'
const editor = createCodeEditor('#editor', config)

// 现在（向下兼容）
import { createEnhancedCodeEditor } from '@ldesign/code-editor'
const editor = createEnhancedCodeEditor('#editor', {
  ...config,
  showLoading: true,  // 启用 Loading
  plugins: {
    emmet: true,
    snippets: true
  }
})
```

### 性能优化建议

1. **使用增强型编辑器**
   ```typescript
   import { createEnhancedCodeEditor } from '@ldesign/code-editor'
   ```

2. **根据语言选择插件**
   ```typescript
   // HTML/CSS/Vue
   plugins: { emmet: true }

   // React/TSX
   // 自动加载，无需配置

   // 纯 JS/TS
   plugins: { snippets: true }
   ```

3. **自定义 Loading 文本**
   ```typescript
   showLoading: true,
   loadingText: '正在加载代码编辑器...'
   ```

## 常见问题

### Q: 为什么首次加载还是有点慢？

A: Monaco Editor 本身体积较大（约 3-4MB），首次加载需要时间。增强型编辑器通过以下方式改善体验：
- 显示友好的 Loading 动画
- 显示加载进度和状态
- 使用 Workers 异步加载
- 建议在生产环境启用 CDN 和 Gzip 压缩

### Q: 如何禁用 Loading 动画？

A: 设置 `showLoading: false`：
```typescript
createEnhancedCodeEditor('#editor', {
  showLoading: false
})
```

### Q: Emmet 不工作？

A: 确保：
1. 使用 `createEnhancedCodeEditor`
2. 启用 Emmet 插件：`plugins: { emmet: true }`
3. 语言设置为支持的类型：html, css, vue 等

### Q: 如何手动加载插件？

A: 使用 PluginManager：
```typescript
import { PluginManager } from '@ldesign/code-editor'

const pm = PluginManager.getInstance()
await pm.loadPlugin('emmet')
```

## 性能最佳实践

1. **延迟初始化**: 在用户需要时再创建编辑器
2. **按需加载语言**: 只加载需要的语言支持
3. **复用实例**: 避免频繁创建和销毁
4. **及时清理**: 组件卸载时调用 `dispose()`
5. **禁用不需要的功能**: 如 minimap, folding 等

## 后续计划

- [ ] 更多语言支持（Python, Go, Rust 等）
- [ ] 自定义 Emmet 配置
- [ ] 主题编辑器
- [ ] 协同编辑支持
- [ ] 更多代码片段
- [ ] Vue 3 组件更新
- [ ] React 组件支持

## 反馈

如有问题或建议，欢迎提 Issue！
