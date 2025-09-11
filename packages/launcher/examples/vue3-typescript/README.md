# Vue 3 + TypeScript 示例项目

这是一个使用 LDesign Launcher 构建的 Vue 3 + TypeScript 示例项目。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run type-check
```

## 📦 特性

- ⚡ **快速热更新** - 基于 Vite 的极速热更新
- 📘 **TypeScript** - 完整的类型安全支持
- 🎨 **单文件组件** - Vue 3 SFC 支持
- ⚡ **组合式 API** - Vue 3 Composition API
- 🔧 **智能插件** - 自动检测和配置 Vue 插件
- 📱 **响应式设计** - 现代化的响应式布局

## 🛠️ 配置说明

### launcher.config.ts

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### 关键配置

- **server.port**: 开发服务器端口 (默认: 3001)
- **build.outDir**: 构建输出目录 (默认: dist)
- **resolve.alias**: 路径别名配置
- **rollupOptions**: Rollup 构建选项
- **optimizeDeps**: 依赖预构建优化

## 📁 项目结构

```
vue3-typescript/
├── src/
│   ├── components/
│   │   └── Counter.vue     # 计数器组件
│   ├── App.vue             # 主应用组件
│   ├── main.ts             # 入口文件
│   └── style.css           # 全局样式
├── launcher.config.ts      # Launcher 配置
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
└── index.html              # HTML 模板
```

## 🎯 开发指南

1. **组件开发**: 在 `src/components/` 目录下创建新的 Vue 组件
2. **单文件组件**: 使用 `.vue` 文件格式，支持 `<template>`、`<script setup lang="ts">` 和 `<style scoped>`
3. **组合式 API**: 使用 Vue 3 的 Composition API 进行状态管理
4. **类型安全**: 充分利用 TypeScript 的类型检查和 Props 类型定义
5. **热更新**: 修改代码后自动刷新页面
6. **路径别名**: 使用 `@/` 作为 `src/` 的别名

## 🧩 组件示例

### 使用 TypeScript 定义 Props

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
</script>
```

### 组合式 API 示例

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

const increment = () => {
  count.value++
}
</script>
```

## 📚 相关文档

- [LDesign Launcher 文档](../../docs/)
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
