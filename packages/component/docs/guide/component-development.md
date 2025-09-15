# 组件开发规范

本文档定义了 LDesign Component 组件库的开发规范，确保所有组件的一致性、可维护性和高质量。

## 1. 组件命名规范

### 1.1 组件名称

- **组件名称**：使用 PascalCase，以 `L` 开头
- **文件名称**：使用 PascalCase，与组件名称一致
- **目录名称**：使用 kebab-case

```
✅ 正确示例：
- 组件名：LButton
- 文件名：Button.vue
- 目录名：button

❌ 错误示例：
- 组件名：lButton, l-button, LDesignButton
- 文件名：button.vue, l-button.vue
- 目录名：Button, lButton
```

### 1.2 Props 命名

- 使用 camelCase
- 布尔类型 props 使用 `is`、`has`、`can`、`should` 等前缀
- 事件处理器使用 `on` 前缀

```typescript
// ✅ 正确示例
interface ButtonProps {
  type: 'primary' | 'default' | 'success' | 'warning' | 'error'
  size: 'small' | 'medium' | 'large'
  disabled: boolean
  loading: boolean
  onClick: (event: MouseEvent) => void
}

// ❌ 错误示例
interface ButtonProps {
  button_type: string
  is_disabled: boolean
  clickHandler: Function
}
```

### 1.3 CSS 类名

- 使用 BEM 命名规范
- 组件前缀：`ld-`
- 块名称：组件名的 kebab-case 形式

```less
// ✅ 正确示例
.ld-button {
  &__content { }
  &__icon { }
  &--primary { }
  &--disabled { }
}

// ❌ 错误示例
.button { }
.ldButton { }
.ld_button { }
```

## 2. 文件结构规范

每个组件必须包含以下文件：

```
src/components/button/
├── Button.vue          # 组件主文件
├── button.less         # 组件样式
├── types.ts           # 类型定义
├── index.ts           # 导出文件
├── Button.test.ts     # 单元测试
└── README.md          # 组件文档
```

### 2.1 组件主文件 (Button.vue)

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 1. 导入依赖
import { computed, ref } from 'vue'
import { buttonProps, buttonEmits } from './types'

// 2. 组件名称定义
defineOptions({
  name: 'LButton'
})

// 3. Props 和 Emits 定义
const props = defineProps(buttonProps)
const emit = defineEmits(buttonEmits)

// 4. 响应式数据
const buttonRef = ref<HTMLElement>()

// 5. 计算属性
const buttonClasses = computed(() => {
  // 计算逻辑
})

// 6. 方法定义
const handleClick = (event: MouseEvent) => {
  // 处理逻辑
}

// 7. 暴露给父组件的方法
defineExpose({
  $el: buttonRef,
  focus: () => buttonRef.value?.focus()
})
</script>

<style lang="less">
@import './button.less';
</style>
```

### 2.2 类型定义文件 (types.ts)

```typescript
import type { ExtractPropTypes, PropType } from 'vue'

// 1. 基础类型定义
export type ButtonType = 'default' | 'primary' | 'success' | 'warning' | 'error'
export type ButtonSize = 'small' | 'medium' | 'large'

// 2. Props 定义
export const buttonProps = {
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  size: {
    type: String as PropType<ButtonSize>,
    default: 'medium'
  },
  disabled: {
    type: Boolean,
    default: false
  }
} as const

// 3. Emits 定义
export const buttonEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent
}

// 4. 导出类型
export type ButtonProps = ExtractPropTypes<typeof buttonProps>
export type ButtonEmits = typeof buttonEmits
export type ButtonInstance = {
  $el: HTMLElement
  focus: () => void
}
```

### 2.3 导出文件 (index.ts)

```typescript
import type { App } from 'vue'
import Button from './Button.vue'

// 组件安装函数
Button.install = (app: App): void => {
  app.component(Button.name!, Button)
}

// 导出组件
export default Button

// 导出类型
export * from './types'
```

## 3. API 设计规范

### 3.1 Props 设计原则

1. **最小化原则**：只暴露必要的 props
2. **一致性原则**：相同功能的 props 在不同组件中保持一致
3. **可扩展性原则**：考虑未来的扩展需求
4. **类型安全**：所有 props 必须有明确的类型定义

### 3.2 通用 Props

所有组件都应该支持以下通用 props：

```typescript
interface BaseProps {
  /** 组件大小 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>
  /** 自定义样式 */
  style?: string | Record<string, any>
}
```

### 3.3 事件设计规范

1. **事件命名**：使用原生事件名称或语义化名称
2. **事件参数**：第一个参数为原生事件对象，后续参数为组件特定数据
3. **事件验证**：所有事件都必须有验证函数

```typescript
// ✅ 正确示例
export const buttonEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
  focus: (event: FocusEvent) => event instanceof FocusEvent,
  change: (value: string, event: Event) => typeof value === 'string'
}

// ❌ 错误示例
export const buttonEmits = ['click', 'focus']
```

## 4. 样式规范

### 4.1 CSS 变量使用

- 优先使用设计系统中定义的 CSS 变量
- 组件特定的变量以组件名为前缀

```less
.ld-button {
  // ✅ 使用设计系统变量
  height: var(--ldesign-height-base);
  padding: 0 var(--ldesign-spacing-base);
  font-size: var(--ldesign-font-size-base);
  border-radius: var(--ldesign-border-radius-base);
  
  // ✅ 组件特定变量
  --ld-button-min-width: 64px;
  min-width: var(--ld-button-min-width);
}
```

### 4.2 响应式设计

- 使用设计系统中定义的断点
- 优先考虑移动端体验

```less
.ld-button {
  // 基础样式（移动端优先）
  padding: 0 var(--ldesign-spacing-sm);
  
  // 平板及以上
  @media (min-width: 768px) {
    padding: 0 var(--ldesign-spacing-base);
  }
  
  // 桌面端
  @media (min-width: 1024px) {
    padding: 0 var(--ldesign-spacing-lg);
  }
}
```

### 4.3 主题支持

- 所有颜色相关的样式都必须支持主题切换
- 使用 CSS 变量实现主题切换

```less
.ld-button {
  background-color: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-level-1-color);
  
  &:hover {
    background-color: var(--ldesign-bg-color-component-hover);
  }
}
```

## 5. 测试规范

### 5.1 测试覆盖要求

- 单元测试覆盖率不低于 80%
- 必须测试所有 props 和事件
- 必须测试所有用户交互场景

### 5.2 测试文件结构

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  // 1. 基础渲染测试
  describe('Rendering', () => {
    it('should render correctly', () => {
      // 测试逻辑
    })
  })
  
  // 2. Props 测试
  describe('Props', () => {
    it('should handle type prop correctly', () => {
      // 测试逻辑
    })
  })
  
  // 3. 事件测试
  describe('Events', () => {
    it('should emit click event', () => {
      // 测试逻辑
    })
  })
  
  // 4. 交互测试
  describe('Interactions', () => {
    it('should handle keyboard navigation', () => {
      // 测试逻辑
    })
  })
})
```

## 6. 文档规范

### 6.1 组件文档结构

每个组件的 README.md 必须包含：

1. 组件描述
2. 基础用法示例
3. API 文档（Props、Events、Slots、Methods）
4. 高级用法示例
5. 无障碍访问说明

### 6.2 代码注释规范

- 所有公开的 API 都必须有 JSDoc 注释
- 复杂的业务逻辑必须有行内注释
- 使用中文注释，保持简洁明了

```typescript
/**
 * 按钮组件
 * 
 * 提供多种类型、大小和状态的按钮，支持图标、加载状态等功能
 * 
 * @example
 * ```vue
 * <template>
 *   <l-button type="primary" @click="handleClick">
 *     点击我
 *   </l-button>
 * </template>
 * ```
 */
```

## 7. 无障碍访问规范

### 7.1 基本要求

- 所有交互元素必须支持键盘导航
- 必须提供适当的 ARIA 属性
- 颜色对比度必须符合 WCAG 2.1 AA 标准

### 7.2 实现指南

```vue
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :aria-pressed="pressed"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot />
  </button>
</template>
```

## 8. 版本管理规范

### 8.1 语义化版本

- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 8.2 变更日志

- 所有变更都必须记录在 CHANGELOG.md 中
- 使用标准的变更日志格式
- 包含破坏性变更的详细说明

---

遵循以上规范，可以确保组件库的一致性、可维护性和高质量。所有开发者都应该严格按照这些规范进行开发。
