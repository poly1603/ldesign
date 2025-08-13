# 🧩 组件化架构设计

## 📖 概述

LDesign App 采用高度模块化的组件化架构，将复杂的页面拆分为独立、可复用的组件。这种设计提高了代码的可
维护性、可测试性和可扩展性。

## 🏗️ 架构原则

### 1. 单一职责原则

每个组件只负责一个特定的功能，确保组件的职责清晰明确。

### 2. 高内聚，低耦合

- **高内聚**: 组件内部功能高度相关
- **低耦合**: 组件之间依赖最小化

### 3. 可复用性

组件设计考虑复用性，通过 props 和 slots 提供灵活的配置选项。

## 🎯 组件分类

### 1. 页面组件 (Page Components)

- **位置**: `src/views/`
- **职责**: 页面级别的布局和逻辑
- **示例**: `Home.tsx`, `Login.tsx`, `Dashboard.tsx`

### 2. 业务组件 (Business Components)

- **位置**: `src/views/[PageName]/components/`
- **职责**: 特定业务逻辑的封装
- **示例**: `UserCard`, `PostCard`, `HttpPanel`

### 3. 通用组件 (Common Components)

- **位置**: `src/components/`
- **职责**: 跨页面复用的通用功能
- **示例**: `Button`, `Modal`, `Loading`

## 📁 组件目录结构

```
src/views/Home/
├── Home.tsx              # 页面主组件
├── Home.less             # 页面样式
└── components/           # 页面专用组件
    ├── UserCard/         # 用户卡片组件
    │   ├── UserCard.tsx
    │   ├── UserCard.less
    │   └── index.ts
    ├── PostCard/         # 文章卡片组件
    │   ├── PostCard.tsx
    │   ├── PostCard.less
    │   └── index.ts
    ├── HttpPanel/        # HTTP 操作面板
    │   ├── HttpPanel.tsx
    │   ├── HttpPanel.less
    │   └── index.ts
    ├── CreatePost/       # 创建文章组件
    │   ├── CreatePost.tsx
    │   ├── CreatePost.less
    │   └── index.ts
    └── StatusPanel/      # 状态统计面板
        ├── StatusPanel.tsx
        ├── StatusPanel.less
        └── index.ts
```

## 🔧 组件设计模式

### 1. Props 接口设计

```typescript
// 明确的 Props 类型定义
interface UserCardProps {
  user: User
  showDetails?: boolean
  onViewDetails?: (user: User) => void
}

// 使用 defineProps 定义
const props = defineProps<UserCardProps>()
```

### 2. 事件处理

```typescript
// 明确的事件类型定义
interface UserCardEmits {
  viewDetails: [user: User]
  edit: [user: User]
  delete: [userId: number]
}

// 使用 defineEmits 定义
const emit = defineEmits<UserCardEmits>()
```

### 3. 样式隔离

```less
// 使用 BEM 命名规范
.user-card {
  // 组件根样式

  &__avatar {
    // 元素样式
  }

  &--loading {
    // 修饰符样式
  }
}
```

## 🎨 样式管理

### 1. 样式文件组织

- 每个组件都有独立的 `.less` 文件
- 使用 CSS Modules 或 scoped 样式避免冲突
- 共享样式通过变量和 mixins 管理

### 2. 主题变量

```less
// 使用主题变量
.user-card {
  background: @background-color;
  border: 1px solid @border-color;
  border-radius: @border-radius;
  padding: @spacing-md;
}
```

### 3. 响应式设计

```less
// 移动端适配
@media (max-width: @mobile-breakpoint) {
  .user-card {
    padding: @spacing-sm;

    &__avatar {
      width: 40px;
      height: 40px;
    }
  }
}
```

## 🔄 状态管理

### 1. 本地状态

使用 Vue 3 的 Composition API 管理组件内部状态：

```typescript
const { loading, error, data } = useAsyncData(fetchUsers)
```

### 2. 全局状态

通过 LDesign Engine 的状态管理系统：

```typescript
const { users, posts } = useAppState()
```

### 3. 状态同步

组件间通过事件系统进行状态同步：

```typescript
// 发送事件
engine.emit('user:updated', user)

// 监听事件
engine.on('user:updated', handleUserUpdate)
```

## 🧪 测试策略

### 1. 单元测试

每个组件都有对应的单元测试：

```typescript
// UserCard.test.tsx
describe('UserCard', () => {
  it('should render user information', () => {
    // 测试组件渲染
  })

  it('should emit viewDetails event', () => {
    // 测试事件发送
  })
})
```

### 2. 集成测试

测试组件间的交互：

```typescript
// Home.test.tsx
describe('Home Page', () => {
  it('should load users and posts', () => {
    // 测试页面功能
  })
})
```

## 🚀 性能优化

### 1. 懒加载

大型组件使用懒加载：

```typescript
const PostCard = defineAsyncComponent(() => import('./PostCard'))
```

### 2. 虚拟滚动

长列表使用虚拟滚动：

```typescript
const { virtualList } = useVirtualScroll(users, { itemHeight: 120 })
```

### 3. 缓存策略

合理使用组件缓存：

```typescript
// 缓存计算结果
const processedUsers = computed(() => {
  return users.value.map(processUser)
})
```

## 🔮 扩展性设计

### 1. 插槽系统

提供灵活的内容插槽：

```typescript
// 组件定义
<template>
  <div class="user-card">
    <slot name="header" :user="user" />
    <slot :user="user" />
    <slot name="footer" :user="user" />
  </div>
</template>

// 使用组件
<UserCard :user="user">
  <template #header="{ user }">
    <CustomHeader :user="user" />
  </template>
</UserCard>
```

### 2. 配置化

通过配置对象控制组件行为：

```typescript
interface UserCardConfig {
  showAvatar?: boolean
  showContact?: boolean
  actions?: Array<'view' | 'edit' | 'delete'>
}
```

### 3. 主题定制

支持主题定制和样式覆盖：

```less
// 主题变量覆盖
.user-card {
  --user-card-bg: var(--custom-bg, @background-color);
  --user-card-border: var(--custom-border, @border-color);
}
```

## 📈 最佳实践

### 1. 组件命名

- 使用 PascalCase 命名组件
- 名称要具有描述性
- 避免过于通用的名称

### 2. Props 设计

- 使用 TypeScript 接口定义 Props
- 提供合理的默认值
- 避免过多的 Props

### 3. 事件设计

- 事件名称使用 kebab-case
- 明确事件的数据结构
- 避免事件冒泡污染

### 4. 样式管理

- 使用 BEM 命名规范
- 避免深层嵌套选择器
- 合理使用 CSS 变量

## 🔧 开发工具

### 1. Vue DevTools

使用 Vue DevTools 调试组件状态和事件。

### 2. TypeScript

利用 TypeScript 的类型检查确保组件接口正确。

### 3. ESLint

使用 ESLint 规则确保代码质量。

### 4. 测试工具

- **Vitest**: 单元测试
- **Vue Test Utils**: 组件测试
- **Playwright**: E2E 测试

---

通过这种组件化架构，LDesign App 实现了高度的模块化和可维护性，为大型应用的开发提供了坚实的基础。
