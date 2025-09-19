# LDesign 组件 API 设计规范

本文档定义了 LDesign 组件库的 API 设计标准，确保所有组件具有一致的接口设计和使用体验。

## 1. 通用设计原则

### 1.1 一致性原则
- 相同功能的属性在不同组件中使用相同的命名
- 相同类型的事件在不同组件中使用相同的参数结构
- 相同概念的插槽在不同组件中使用相同的命名

### 1.2 可预测性原则
- API 设计应该符合开发者的直觉和预期
- 属性名称应该清晰表达其功能和用途
- 默认值应该是最常用的选项

### 1.3 扩展性原则
- 预留扩展空间，避免破坏性变更
- 使用联合类型而非枚举，便于后续扩展
- 提供足够的自定义能力

## 2. Props 设计规范

### 2.1 命名规范

#### 基础命名
```typescript
// ✅ 正确：使用 camelCase
interface ComponentProps {
  modelValue: string
  placeholder: string
  maxLength: number
}

// ❌ 错误：使用其他命名方式
interface ComponentProps {
  model_value: string
  'max-length': number
  MaxLength: number
}
```

#### 布尔属性命名
```typescript
// ✅ 正确：使用描述性前缀
interface ComponentProps {
  disabled: boolean      // 状态类
  loading: boolean       // 状态类
  visible: boolean       // 状态类
  readonly: boolean      // 状态类
  required: boolean      // 状态类
  multiple: boolean      // 功能类
  clearable: boolean     // 功能类
  searchable: boolean    // 功能类
  sortable: boolean      // 功能类
}

// ❌ 错误：使用 is/has 前缀（Vue 中不推荐）
interface ComponentProps {
  isDisabled: boolean
  hasError: boolean
  canEdit: boolean
}
```

#### 事件处理器命名
```typescript
// ✅ 正确：使用 on 前缀
interface ComponentProps {
  onClick?: (event: MouseEvent) => void
  onChange?: (value: string) => void
  onFocus?: (event: FocusEvent) => void
}
```

### 2.2 类型定义规范

#### 基础类型
```typescript
// ✅ 正确：使用联合类型
export type ComponentSize = 'small' | 'medium' | 'large'
export type ComponentStatus = 'default' | 'primary' | 'success' | 'warning' | 'error'
export type ComponentVariant = 'filled' | 'outlined' | 'text' | 'ghost'

// ✅ 正确：使用 PropType 进行类型约束
export const componentProps = {
  size: {
    type: String as PropType<ComponentSize>,
    default: 'medium'
  },
  status: {
    type: String as PropType<ComponentStatus>,
    default: 'default'
  }
} as const
```

#### 复杂类型
```typescript
// ✅ 正确：定义清晰的接口
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  group?: string
}

export const selectProps = {
  options: {
    type: Array as PropType<SelectOption[]>,
    default: () => []
  },
  modelValue: {
    type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
    default: undefined
  }
} as const
```

### 2.3 默认值规范

#### 通用默认值
```typescript
// 所有组件必须包含的基础属性
export const baseProps = {
  // 尺寸：默认为 medium
  size: {
    type: String as PropType<ComponentSize>,
    default: 'medium'
  },
  
  // 禁用状态：默认为 false
  disabled: {
    type: Boolean,
    default: false
  },
  
  // 自定义类名
  class: {
    type: [String, Array, Object] as PropType<string | string[] | Record<string, boolean>>,
    default: undefined
  },
  
  // 自定义样式
  style: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    default: undefined
  }
} as const
```

#### 组件特定默认值
```typescript
// 表单组件
export const formComponentProps = {
  ...baseProps,
  
  // 只读状态：默认为 false
  readonly: {
    type: Boolean,
    default: false
  },
  
  // 必填状态：默认为 false
  required: {
    type: Boolean,
    default: false
  },
  
  // 占位符文本
  placeholder: {
    type: String,
    default: undefined
  }
} as const

// 交互组件
export const interactiveComponentProps = {
  ...baseProps,
  
  // 加载状态：默认为 false
  loading: {
    type: Boolean,
    default: false
  },
  
  // 类型：默认为 default
  type: {
    type: String as PropType<ComponentStatus>,
    default: 'default'
  }
} as const
```

## 3. Events 设计规范

### 3.1 事件命名规范

#### 原生事件
```typescript
// ✅ 正确：使用原生事件名称
export const componentEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
  focus: (event: FocusEvent) => event instanceof FocusEvent,
  blur: (event: FocusEvent) => event instanceof FocusEvent,
  keydown: (event: KeyboardEvent) => event instanceof KeyboardEvent,
  keyup: (event: KeyboardEvent) => event instanceof KeyboardEvent
} as const
```

#### 自定义事件
```typescript
// ✅ 正确：使用语义化命名
export const componentEmits = {
  // 值变更事件
  change: (value: string, oldValue: string) => typeof value === 'string',
  
  // 输入事件
  input: (value: string) => typeof value === 'string',
  
  // 选择事件
  select: (option: SelectOption, index: number) => typeof option === 'object',
  
  // 清空事件
  clear: () => true,
  
  // 搜索事件
  search: (query: string) => typeof query === 'string',
  
  // 展开/收起事件
  expand: (expanded: boolean) => typeof expanded === 'boolean',
  collapse: (collapsed: boolean) => typeof collapsed === 'boolean',
  
  // 显示/隐藏事件
  show: () => true,
  hide: () => true,
  
  // 打开/关闭事件
  open: () => true,
  close: () => true
} as const
```

### 3.2 事件参数规范

#### 参数顺序
```typescript
// ✅ 正确：新值在前，旧值在后，事件对象最后
export const componentEmits = {
  change: (newValue: string, oldValue: string, event?: Event) => true,
  select: (selectedItem: any, index: number, event?: Event) => true,
  click: (event: MouseEvent) => event instanceof MouseEvent
} as const
```

#### 参数类型
```typescript
// ✅ 正确：明确的参数类型
export const componentEmits = {
  // 基础类型
  change: (value: string | number | boolean) => true,
  
  // 对象类型
  select: (option: { label: string; value: any }) => true,
  
  // 数组类型
  multiSelect: (options: Array<{ label: string; value: any }>) => true,
  
  // 可选参数
  search: (query: string, filters?: Record<string, any>) => true
} as const
```

### 3.3 事件验证规范

```typescript
// ✅ 正确：完整的事件验证
export const componentEmits = {
  change: (value: string, oldValue: string) => {
    return typeof value === 'string' && typeof oldValue === 'string'
  },
  
  select: (option: SelectOption, index: number) => {
    return (
      typeof option === 'object' &&
      option !== null &&
      'label' in option &&
      'value' in option &&
      typeof index === 'number' &&
      index >= 0
    )
  },
  
  click: (event: MouseEvent) => {
    return event instanceof MouseEvent
  }
} as const
```

## 4. Slots 设计规范

### 4.1 插槽命名规范

#### 通用插槽
```typescript
// ✅ 正确：使用语义化命名
interface ComponentSlots {
  // 默认插槽
  default?: () => VNode[]
  
  // 头部插槽
  header?: () => VNode[]
  
  // 尾部插槽
  footer?: () => VNode[]
  
  // 前缀插槽
  prefix?: () => VNode[]
  
  // 后缀插槽
  suffix?: () => VNode[]
  
  // 图标插槽
  icon?: () => VNode[]
  
  // 标签插槽
  label?: () => VNode[]
  
  // 描述插槽
  description?: () => VNode[]
  
  // 额外内容插槽
  extra?: () => VNode[]
}
```

#### 特定功能插槽
```typescript
// 表单组件插槽
interface FormComponentSlots {
  // 错误信息插槽
  error?: (props: { error: string }) => VNode[]
  
  // 帮助信息插槽
  help?: (props: { help: string }) => VNode[]
  
  // 标签插槽
  label?: (props: { label: string; required: boolean }) => VNode[]
}

// 列表组件插槽
interface ListComponentSlots {
  // 列表项插槽
  item?: (props: { item: any; index: number }) => VNode[]
  
  // 空状态插槽
  empty?: () => VNode[]
  
  // 加载状态插槽
  loading?: () => VNode[]
}

// 弹窗组件插槽
interface ModalComponentSlots {
  // 标题插槽
  title?: () => VNode[]
  
  // 内容插槽
  default?: () => VNode[]
  
  // 底部插槽
  footer?: (props: { confirm: () => void; cancel: () => void }) => VNode[]
}
```

### 4.2 插槽参数规范

```typescript
// ✅ 正确：提供有用的插槽参数
interface ComponentSlots {
  // 提供当前状态
  default?: (props: {
    loading: boolean
    disabled: boolean
    size: ComponentSize
  }) => VNode[]
  
  // 提供数据和操作方法
  item?: (props: {
    item: any
    index: number
    selected: boolean
    toggle: () => void
    remove: () => void
  }) => VNode[]
  
  // 提供表单验证信息
  error?: (props: {
    error: string
    field: string
    touched: boolean
  }) => VNode[]
}
```

## 5. 实例方法设计规范

### 5.1 方法命名规范

```typescript
// ✅ 正确：使用动词开头的方法名
export interface ComponentInstance {
  // 焦点控制
  focus(): void
  blur(): void
  
  // 状态控制
  show(): void
  hide(): void
  open(): void
  close(): void
  toggle(): void
  
  // 数据操作
  clear(): void
  reset(): void
  refresh(): void
  reload(): void
  
  // 验证相关
  validate(): boolean | Promise<boolean>
  clearValidation(): void
  
  // 滚动相关
  scrollTo(position: number): void
  scrollIntoView(): void
}
```

### 5.2 方法返回值规范

```typescript
// ✅ 正确：明确的返回值类型
export interface ComponentInstance {
  // 无返回值的操作
  focus(): void
  clear(): void
  
  // 返回布尔值的查询
  isVisible(): boolean
  isValid(): boolean
  
  // 返回数据的查询
  getValue(): string | number | any[]
  getSelectedItems(): any[]
  
  // 返回 Promise 的异步操作
  validate(): Promise<boolean>
  submit(): Promise<any>
  
  // 返回清理函数的订阅
  onValueChange(callback: (value: any) => void): () => void
}
```

## 6. 类型导出规范

### 6.1 导出结构

```typescript
// types.ts 文件结构
export type ComponentSize = 'small' | 'medium' | 'large'
export type ComponentStatus = 'default' | 'primary' | 'success' | 'warning' | 'error'

export const componentProps = {
  // props 定义
} as const

export const componentEmits = {
  // emits 定义
} as const

export type ComponentProps = ExtractPropTypes<typeof componentProps>
export type ComponentEmits = typeof componentEmits
export type ComponentSlots = {
  // slots 定义
}
export interface ComponentInstance {
  // 实例方法定义
}

// 导出组件相关的所有类型
export type {
  ComponentSize,
  ComponentStatus,
  ComponentProps,
  ComponentEmits,
  ComponentSlots,
  ComponentInstance
}
```

### 6.2 命名约定

```typescript
// ✅ 正确：统一的命名约定
export type ButtonSize = 'small' | 'medium' | 'large'
export type ButtonProps = ExtractPropTypes<typeof buttonProps>
export type ButtonEmits = typeof buttonEmits
export type ButtonSlots = { /* ... */ }
export interface ButtonInstance { /* ... */ }

export type InputSize = 'small' | 'medium' | 'large'
export type InputProps = ExtractPropTypes<typeof inputProps>
export type InputEmits = typeof inputEmits
export type InputSlots = { /* ... */ }
export interface InputInstance { /* ... */ }
```

## 7. 文档规范

### 7.1 JSDoc 注释

```typescript
/**
 * 按钮组件属性定义
 */
export const buttonProps = {
  /**
   * 按钮类型
   * @default 'default'
   */
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  
  /**
   * 按钮尺寸
   * @default 'medium'
   */
  size: {
    type: String as PropType<ButtonSize>,
    default: 'medium'
  },
  
  /**
   * 是否禁用按钮
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false
  }
} as const

/**
 * 按钮组件事件定义
 */
export const buttonEmits = {
  /**
   * 点击事件
   * @param event - 鼠标事件对象
   */
  click: (event: MouseEvent) => event instanceof MouseEvent,
  
  /**
   * 值变更事件
   * @param value - 新值
   * @param oldValue - 旧值
   */
  change: (value: string, oldValue: string) => typeof value === 'string'
} as const
```

### 7.2 使用示例

```typescript
/**
 * 按钮组件使用示例
 * 
 * @example
 * ```vue
 * <template>
 *   <LButton 
 *     type="primary" 
 *     size="large"
 *     @click="handleClick"
 *   >
 *     点击我
 *   </LButton>
 * </template>
 * 
 * <script setup>
 * function handleClick(event) {
 *   console.log('按钮被点击', event)
 * }
 * </script>
 * ```
 */
```

## 8. 验证和测试

### 8.1 类型检查

```typescript
// 确保所有组件都有完整的类型定义
import type { ComponentProps, ComponentEmits, ComponentSlots, ComponentInstance } from './types'

// 类型测试
const props: ComponentProps = {
  size: 'medium',
  disabled: false
}

const emits: ComponentEmits = {
  click: (event: MouseEvent) => true,
  change: (value: string, oldValue: string) => true
}
```

### 8.2 API 一致性测试

```typescript
// 测试所有组件是否遵循 API 规范
describe('API 一致性测试', () => {
  test('所有组件都有 size 属性', () => {
    // 测试逻辑
  })
  
  test('所有组件都有 disabled 属性', () => {
    // 测试逻辑
  })
  
  test('所有事件都有正确的验证函数', () => {
    // 测试逻辑
  })
})
```

这个 API 设计规范确保了组件库的一致性和可维护性，为开发者提供了清晰的指导原则。
