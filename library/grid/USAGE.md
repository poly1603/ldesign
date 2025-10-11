# @ldesign/gridstack 项目使用指南

## 📁 项目结构

```
grid/
├── src/                          # 源代码
│   ├── core/                     # 核心封装层
│   │   ├── GridStackCore.ts     # 核心类
│   │   └── index.ts
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts
│   ├── vanilla/                  # Vanilla JS 适配器
│   │   ├── GridStackManager.ts
│   │   └── index.ts
│   ├── vue/                      # Vue 3 适配器
│   │   ├── GridStack.vue        # Grid 组件
│   │   ├── GridStackItem.vue    # Item 组件
│   │   ├── useGridStack.ts      # Hook
│   │   └── index.ts
│   ├── react/                    # React 适配器
│   │   ├── GridStack.tsx        # Grid 组件
│   │   ├── GridStackItem.tsx    # Item 组件
│   │   ├── useGridStack.tsx     # Hook
│   │   └── index.tsx
│   ├── styles/                   # 样式文件
│   │   └── index.css
│   └── index.ts                  # 主入口
├── examples/                     # 示例项目
│   ├── vanilla-demo/            # Vanilla TS 示例
│   ├── vue-demo/                # Vue 3 示例
│   └── react-demo/              # React 示例
├── docs/                         # VitePress 文档
│   ├── .vitepress/
│   │   └── config.ts            # 文档配置
│   ├── guide/                   # 指南
│   ├── api/                     # API 文档
│   ├── examples/                # 示例文档
│   └── index.md                 # 首页
├── package.json                  # 主项目配置
├── vite.config.ts               # Vite 构建配置
├── tsconfig.json                # TypeScript 配置
├── pnpm-workspace.yaml          # PNPM workspace 配置
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建库

```bash
pnpm build
```

### 3. 运行示例

**Vanilla TypeScript 示例 (端口 3000):**
```bash
cd examples/vanilla-demo
pnpm install
pnpm dev
```

**Vue 3 示例 (端口 3001):**
```bash
cd examples/vue-demo
pnpm install
pnpm dev
```

**React 示例 (端口 3002):**
```bash
cd examples/react-demo
pnpm install
pnpm dev
```

### 4. 运行文档

```bash
# 开发模式
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览文档
pnpm docs:preview
```

## 📦 使用方法

### Vanilla JS / TypeScript

```typescript
import { GridStackManager } from '@ldesign/gridstack/vanilla'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

const grid = new GridStackManager('#grid', {
  column: 12,
  cellHeight: 70,
  animate: true
})

grid.addWidget({
  x: 0, y: 0, w: 4, h: 2,
  content: '<div>Widget 1</div>'
})
```

### Vue 3

**组件方式:**
```vue
<template>
  <GridStack :column="12" :cell-height="70">
    <GridStackItem v-for="item in items" :key="item.id" v-bind="item">
      {{ item.content }}
    </GridStackItem>
  </GridStack>
</template>

<script setup lang="ts">
import { GridStack, GridStackItem } from '@ldesign/gridstack/vue'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

const items = ref([
  { id: 1, x: 0, y: 0, w: 4, h: 2, content: 'Item 1' }
])
</script>
```

**Hook 方式:**
```vue
<template>
  <div ref="gridRef" class="grid-stack">
    <!-- 网格项 -->
  </div>
</template>

<script setup lang="ts">
import { useGridStack } from '@ldesign/gridstack/vue'

const { gridRef, addWidget, isReady } = useGridStack({
  column: 12,
  cellHeight: 70
})
</script>
```

### React

**组件方式:**
```tsx
import { GridStack, GridStackItem } from '@ldesign/gridstack/react'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

function App() {
  const items = [
    { id: '1', x: 0, y: 0, w: 4, h: 2 }
  ]

  return (
    <GridStack column={12} cellHeight={70}>
      {items.map(item => (
        <GridStackItem key={item.id} {...item}>
          Content
        </GridStackItem>
      ))}
    </GridStack>
  )
}
```

**Hook 方式:**
```tsx
import { useGridStack } from '@ldesign/gridstack/react'

function App() {
  const { gridRef, addWidget, isReady } = useGridStack({
    column: 12,
    cellHeight: 70
  })

  return <div ref={gridRef} className="grid-stack" />
}
```

## 🎯 核心功能

### 基础操作

- ✅ **添加网格项**: `addWidget()`, `addWidgets()`
- ✅ **删除网格项**: `removeWidget()`, `removeAll()`
- ✅ **更新网格项**: `update()`
- ✅ **保存布局**: `save()`
- ✅ **加载布局**: `load()`

### 交互控制

- ✅ **启用/禁用**: `enable()`, `disable()`
- ✅ **锁定/解锁**: `lock()`, `unlock()`
- ✅ **静态模式**: `setStatic()`
- ✅ **动画控制**: `setAnimation()`

### 布局管理

- ✅ **列数调整**: `column()`
- ✅ **紧凑布局**: `compact()`
- ✅ **浮动模式**: `float()`
- ✅ **批量更新**: `batchUpdate()`

### 事件系统

- ✅ `added` - 添加网格项时触发
- ✅ `removed` - 删除网格项时触发
- ✅ `change` - 布局变化时触发
- ✅ `dragstart`, `drag`, `dragstop` - 拖拽事件
- ✅ `resizestart`, `resize`, `resizestop` - 调整大小事件

## 📖 API 文档

完整的 API 文档请查看：

- [核心 API](./docs/api/core.md)
- [Vanilla API](./docs/api/vanilla.md)
- [Vue API](./docs/api/vue.md)
- [React API](./docs/api/react.md)
- [类型定义](./docs/api/types.md)

## 🛠️ 开发指南

### 修改源码

1. 修改 `src/` 目录下的源文件
2. 运行 `pnpm build` 重新构建
3. 在示例项目中测试更改

### 添加新功能

1. 在对应的适配器目录中添加代码
2. 更新类型定��� `src/types/index.ts`
3. 添加单元测试（如果有）
4. 更新文档

### 发布流程

```bash
# 1. 确保所有测试通过
pnpm test

# 2. 构建项目
pnpm build

# 3. 更新版本号
npm version patch|minor|major

# 4. 发布到 npm
npm publish
```

## 🌟 特性亮点

1. **多框架支持**: 原生支持 Vanilla JS、Vue 3 和 React
2. **TypeScript**: 完整的类型定义
3. **灵活用法**: 组件式和 Hook 式两种用法
4. **高性能**: 优化的渲染和内存管理
5. **丰富配置**: 支持 GridStack 所有配置项
6. **完善文档**: 详细的文档和示例

## 📝 许可证

MIT License © 2024 LDesign

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- GitHub: https://github.com/ldesign/gridstack
- Email: support@ldesign.com

---

**现在你可以开始使用 @ldesign/gridstack 构建强大的拖拽网格布局了！** 🎉
