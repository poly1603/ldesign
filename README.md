# LDesign Icons

现代化的图标系统，基于参考实现重新设计，采用更现代的技术栈和统一的项目结构。

## ✨ 特性

- 🚀 **现代化构建**：基于 Vite + Rollup，构建速度提升 10-50 倍
- 📦 **多格式支持**：React、Vue、Web Components、SVG、图标字体、SVG Sprite
- 🎯 **TypeScript 优先**：完整的类型支持和智能提示
- 🔧 **开发友好**：热更新、Storybook 预览、完善的开发工具
- 📱 **统一结构**：所有源代码统一在 `src/` 目录下管理
- ⚡ **性能优化**：SVG 优化、Tree-shaking、按需加载

## 🏗️ 项目结构

```
src/
├── assets/                 # 原始 SVG 文件
│   └── icons/
│       ├── filled/         # 填充图标
│       ├── outlined/       # 线性图标
│       └── index.ts        # 图标索引
├── core/                   # 核心处理逻辑
│   ├── svg-processor/      # SVG 处理器
│   ├── template-engine/    # 模板引擎
│   ├── generators/         # 各种格式生成器
│   └── utils/              # 工具函数
├── packages/               # 输出包
│   ├── react/              # React 组件包
│   ├── vue/                # Vue 组件包
│   ├── web-components/     # Web Components 包
│   ├── svg/                # 纯 SVG 包
│   └── resources/          # 字体和 Sprite 资源
├── tools/                  # 开发工具
│   ├── preview/            # 图标预览工具
│   ├── docs/               # 文档生成
│   └── cli/                # 命令行工具
└── tests/                  # 测试文件
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 生成图标

```bash
pnpm run generate
```

### 开发模式

```bash
pnpm run dev
```

### 构建

```bash
pnpm run build
```

### 预览图标

```bash
pnpm run storybook
```

## 📖 使用方法

### React

```tsx
import { AddIcon, AddCircleIcon } from 'ldesign-icons/react'

function App() {
  return (
    <div>
      <AddIcon size="large" color="#1890ff" />
      <AddCircleIcon size={24} />
    </div>
  )
}
```

### Vue

```vue
<template>
  <div>
    <AddIcon size="large" color="#1890ff" />
    <AddCircleIcon :size="24" />
  </div>
</template>

<script setup>
import { AddIcon, AddCircleIcon } from 'ldesign-icons/vue'
</script>
```

### Web Components

```html
<script src="ldesign-icons/web-components"></script>

<ld-icon name="add" size="large" color="#1890ff"></ld-icon>
<ld-icon name="add-circle" size="24"></ld-icon>
```

## 🔧 开发

### 添加新图标

1. 将 SVG 文件放入 `src/assets/icons/filled/` 或 `src/assets/icons/outlined/`
2. 运行 `pnpm run generate` 生成组件
3. 运行 `pnpm run build` 构建包

### 自定义构建

编辑 `scripts/generate.ts` 来自定义生成逻辑。

## 📊 技术栈对比

| 功能 | 原实现 | 新实现 | 改进 |
|------|--------|--------|------|
| 构建工具 | Gulp | Vite + Rollup | 速度提升 10-50 倍 |
| 开发体验 | 无热更新 | HMR + Storybook | 开发效率大幅提升 |
| 项目结构 | 多 workspace | 统一 src/ 目录 | 更清晰的组织结构 |
| 类型支持 | 部分支持 | 完整 TypeScript | 更好的开发体验 |
| 测试 | 无 | Vitest + 测试覆盖 | 更高的代码质量 |

## 📝 许可证

MIT License
