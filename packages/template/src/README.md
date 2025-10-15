# @ldesign/template - 全新模板系统

## 📋 概述

全新设计的模板系统，使用 `import.meta.glob` 自动扫描和加载模板，支持开发和生产环境。

## 🏗️ 架构设计

### 核心特性

1. **自动扫描**：使用 `import.meta.glob` 自动扫描 `src/templates` 目录下的所有模板
2. **懒加载**：模板组件按需加载，优化性能
3. **类型安全**：完整的 TypeScript 类型支持
4. **环境兼容**：同时支持开发环境（.ts）和生产环境（.js）

### 目录结构

```
src/
├── types/                    # 类型定义
│   └── index.ts
├── core/                     # 核心模块
│   ├── scanner.ts           # 模板扫描器
│   ├── loader.ts            # 模板加载器
│   ├── manager.ts           # 模板管理器
│   └── index.ts
├── composables/             # Vue 组合式函数
│   ├── useTemplate.ts
│   └── index.ts
├── components/              # Vue 组件
│   ├── TemplateRenderer.vue
│   └── index.ts
├── templates/               # 模板库
│   ├── {category}/          # 模板分类
│   │   ├── {device}/        # 设备类型
│   │   │   ├── {name}/      # 模板名称
│   │   │   │   ├── config.ts    # 模板配置
│   │   │   │   └── index.vue    # 模板组件
└── index.ts                 # 主入口
```

## 🚀 使用方式

### 1. 基础使用

```typescript
import { getManager } from '@ldesign/template'

// 初始化并扫描所有模板
const manager = getManager()
await manager.initialize()

// 加载模板
const component = await manager.loadTemplate('login', 'desktop', 'default')
```

### 2. Vue 组合式函数

```vue
<script setup>
import { useTemplate } from '@ldesign/template'

const { component, loading, error } = useTemplate('login', 'desktop', 'default')
</script>

<template>
  <component :is="component" v-if="component" />
  <div v-else-if="loading">加载中...</div>
  <div v-else-if="error">{{ error.message }}</div>
</template>
```

### 3. 模板渲染组件

```vue
<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    name="default"
    :component-props="{ title: '欢迎登录' }"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { TemplateRenderer } from '@ldesign/template'

const handleSubmit = (data) => {
  console.log('提交数据:', data)
}
</script>
```

## 📝 创建模板

### 模板结构

每个模板包含两个文件：

1. **config.ts** - 模板元数据
2. **index.vue** - 模板组件

### 示例：创建登录模板

#### 1. 创建配置文件

`src/templates/login/desktop/custom/config.ts`

```typescript
import type { TemplateConfig } from '@ldesign/template'

export default {
  name: 'custom',
  displayName: '自定义登录页',
  description: '我的自定义登录页面',
  version: '1.0.0',
  author: 'Your Name',
  tags: ['login', 'custom'],
  isDefault: false,
} as TemplateConfig
```

#### 2. 创建组件文件

`src/templates/login/desktop/custom/index.vue`

```vue
<template>
  <div class="custom-login">
    <!-- 你的模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 你的逻辑
</script>

<style scoped>
/* 你的样式 */
</style>
```

### 路径规则

模板路径遵循以下格式：

```
templates/{category}/{device}/{name}/
```

- `category`: 模板分类（如 login, dashboard）
- `device`: 设备类型（desktop, mobile, tablet）
- `name`: 模板名称（自定义）

## 🔧 工作原理

### 扫描过程

1. **编译时**：`import.meta.glob` 在构建时扫描所有匹配的文件
2. **配置加载**：使用 `eager: true` 同步加载所有配置文件
3. **组件注册**：注册懒加载函数，按需加载组件
4. **元数据提取**：从配置和路径提取完整的模板元数据

### 关键代码

```typescript
// 扫描配置文件（同步加载）
const configModules = import.meta.glob(
  '/src/templates/**/config.{ts,js}',
  { eager: true }
)

// 扫描组件文件（懒加载）
const componentModules = import.meta.glob(
  '/src/templates/**/index.vue'
)
```

## 📦 打包说明

### 开发环境

- 配置文件：`.ts`
- 组件文件：`.vue`
- 使用 alias：`@/templates/*`

### 生产环境

- 配置文件：`.js`（由 TypeScript 编译）
- 组件文件：`.js`（由 Vue 编译）
- 使用相对路径

### import.meta.glob 处理

Vite/Rollup 会在构建时：

1. 将 `import.meta.glob` 转换为实际的 import 语句
2. 自动处理文件扩展名（.ts → .js，.vue → .js）
3. 生成正确的模块引用

## 🎯 最佳实践

1. **命名规范**：使用清晰的分类和设备类型
2. **配置完整**：提供完整的模板元数据
3. **类型安全**：使用 TypeScript 定义组件 Props
4. **样式隔离**：使用 scoped 样式
5. **事件定义**：明确定义组件事件类型

## 📚 API 文档

详细 API 文档请参考各模块的 TypeScript 类型定义。

## 🤝 贡献指南

欢迎提交新的模板！请遵循现有的目录结构和命名规范。
