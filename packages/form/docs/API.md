# API 参考文档

## FormManager

表单管理器是整个系统的核心类，提供完整的表单管理功能。

### 构造函数

```typescript
constructor(config: FormConfig, container: HTMLElement)
```

**参数：**

- `config`: 表单配置对象
- `container`: 表单容器DOM元素

### 核心方法

#### render()

渲染表单到容器中。

```typescript
public render(): void
```

#### getValue(key?)

获取表单值。

```typescript
public getValue(key?: string): any
```

**参数：**

- `key`: 可选，表单项键名。不传则返回所有值

**返回值：**

- 如果传入key，返回对应的值
- 如果不传key，返回所有表单值的对象

#### setValue(key, value?)

设置表单值。

```typescript
public setValue(key: string | Record<string, any>, value?: any): void
```

**参数：**

- `key`: 表单项键名或值对象
- `value`: 值（当key为字符串时）

#### validate(key?)

验证表单。

```typescript
public validate(key?: string): ValidationResult
```

**参数：**

- `key`: 可选，表单项键名。不传则验证所有项

**返回值：**

- `ValidationResult`: 验证结果对象

#### reset()

重置表单。

```typescript
public reset(): void
```

#### expand() / collapse()

展开/收起表单。

```typescript
public expand(): void
public collapse(): void
```

#### openModal() / closeModal()

打开/关闭弹窗。

```typescript
public openModal(): void
public closeModal(): void
```

### 配置方法

#### setReadonly(readonly)

设置只读模式。

```typescript
public setReadonly(readonly: boolean): void
```

#### setGap(gap)

设置表单项间距。

```typescript
public setGap(gap: { horizontal?: number; vertical?: number }): void
```

#### setLabelPosition(position)

设置标题位置。

```typescript
public setLabelPosition(position: 'left' | 'right' | 'top'): void
```

#### setLabelWidth(width)

设置标题宽度。

```typescript
public setLabelWidth(width: number): void
```

### 事件方法

#### on(event, handler)

监听事件。

```typescript
public on(event: FormEventType, handler: (data: FormEventData) => void): () => void
```

**参数：**

- `event`: 事件类型
- `handler`: 事件处理函数

**返回值：**

- 取消监听的函数

### 状态查询

#### isValid()

检查表单是否有效。

```typescript
public isValid(): boolean
```

#### isDirty()

检查表单是否已修改。

```typescript
public isDirty(): boolean
```

#### getState()

获取表单状态。

```typescript
public getState(): FormState
```

### 序列化

#### serialize()

序列化表单状态。

```typescript
public serialize(): string
```

#### deserialize(serialized)

反序列化表单状态。

```typescript
public deserialize(serialized: string): void
```

## FormConfig

表单配置对象的完整定义。

```typescript
interface FormConfig {
  items: FormItemConfig[]
  layout: LayoutConfig
  validation: ValidationConfig
  display: DisplayConfig
  behavior: BehaviorConfig
}
```

### FormItemConfig

表单项配置。

```typescript
interface FormItemConfig {
  key: string // 唯一键名
  label: string // 显示标签
  type: FormItemType // 表单项类型
  value?: any // 默认值
  span?: number // 占用列数
  required?: boolean // 是否必填
  readonly?: boolean // 是否只读
  disabled?: boolean // 是否禁用
  validation?: ValidationRule[] // 验证规则
  placeholder?: string // 占位符
  options?: SelectOption[] // 选项（用于select/radio）
  group?: string // 分组标识
  order?: number // 排序权重
  className?: string // 自定义CSS类
  style?: Record<string, any> // 自定义样式
  attrs?: Record<string, any> // 自定义属性
}
```

### LayoutConfig

布局配置。

```typescript
interface LayoutConfig {
  defaultRows?: number // 默认显示行数
  minColumns?: number // 最小列数
  maxColumns?: number // 最大列数
  columnWidth?: number // 列宽度
  gap?: { // 间距配置
    horizontal: number
    vertical: number
  }
  responsive?: ResponsiveConfig // 响应式配置
}
```

### DisplayConfig

显示配置。

```typescript
interface DisplayConfig {
  labelPosition: 'left' | 'right' | 'top' // 标题位置
  labelWidth?: number // 标题宽度
  showExpandButton?: boolean // 是否显示展开按钮
  expandMode: 'inline' | 'modal' // 展开模式
  modalConfig?: ModalConfig // 弹窗配置
}
```

### ValidationConfig

验证配置。

```typescript
interface ValidationConfig {
  validateOnChange?: boolean // 值变化时验证
  validateOnBlur?: boolean // 失去焦点时验证
  showErrorMessage?: boolean // 是否显示错误信息
  errorMessagePosition?: 'bottom' | 'right' // 错误信息位置
}
```

### BehaviorConfig

行为配置。

```typescript
interface BehaviorConfig {
  readonly?: boolean // 是否只读
  autoSave?: boolean // 是否自动保存
  expandThreshold?: number // 展开阈值
  debounceTime?: number // 防抖时间
}
```

## Vue3 集成

### AdaptiveForm 组件

Vue3 声明式组件。

```vue-html
<template>
  <AdaptiveForm
    v-model="formData"
    :config="formConfig"
    @change="handleChange"
    @submit="handleSubmit"
  />
</template>
```

**Props:**

- `config`: FormConfig - 表单配置
- `modelValue`: Record<string, any> - 表单值（v-model）

**Events:**

- `update:modelValue`: 值变化事件
- `change`: 表单变化事件
- `submit`: 表单提交事件
- `reset`: 表单重置事件
- `expand-change`: 展开状态变化事件
- `modal-change`: 弹窗状态变化事件
- `validation-change`: 验证状态变化事件
- `focus-change`: 焦点状态变化事件

**暴露的方法:**

- `getValue(key?)`: 获取值
- `setValue(key, value)`: 设置值
- `validate(key?)`: 验证
- `reset()`: 重置
- `expand()`: 展开
- `collapse()`: 收起
- `openModal()`: 打开弹窗
- `closeModal()`: 关闭弹窗
- `isValid()`: 是否有效
- `isDirty()`: 是否已修改
- `getState()`: 获取状态
- `serialize()`: 序列化
- `deserialize(data)`: 反序列化

### useAdaptiveForm Hook

Vue3 组合式API。

```typescript
const {
  values,
  errors,
  isValid,
  isDirty,
  isValidating,
  getValue,
  setValue,
  validate,
  reset,
  expand,
  collapse,
  mount,
  unmount,
  on,
} = useAdaptiveForm(config, options)
```

**参数:**

- `config`: Ref<FormConfig> | FormConfig - 表单配置
- `options`: UseAdaptiveFormOptions - Hook选项

**返回值:**

- `values`: Ref<Record<string, any>> - 响应式表单值
- `errors`: Ref<Record<string, string[]>> - 响应式错误信息
- `isValid`: ComputedRef<boolean> - 是否有效
- `isDirty`: ComputedRef<boolean> - 是否已修改
- `isValidating`: Ref<boolean> - 是否验证中
- 其他方法同FormManager

### useFormValues Hook

简化版表单值管理Hook。

```typescript
const {
  values,
  errors,
  isValid,
  setValue,
  getValue,
  setError,
  clearError,
  reset,
} = useFormValues(initialValues)
```

## 验证系统

### ValidationEngine

验证引擎类。

```typescript
const engine = new ValidationEngine()

// 添加验证规则
engine.addRule('email', {
  id: 'email-format',
  type: 'email',
  message: '请输入有效的邮箱地址'
})

// 执行验证
const result = await engine.validate('email', 'test@example.com')
```

### 内置验证器

- `required`: 必填验证
- `pattern`: 正则表达式验证
- `length`: 长度验证
- `range`: 数值范围验证
- `email`: 邮箱格式验证
- `url`: URL格式验证
- `phone`: 手机号验证
- `idCard`: 身份证号验证

### 自定义验证器

```typescript
// 注册自定义验证器
engine.registerValidator('custom-validator', (value, rule, allValues) => {
  // 验证逻辑
  return value === 'expected'
})

// 使用自定义验证器
engine.addRule('field', {
  id: 'custom-rule',
  type: 'custom-validator',
  message: '验证失败'
})
```

## 事件系统

### 事件类型

```typescript
enum FormEventType {
  VALUE_CHANGE = 'value-change',
  VALIDATION_CHANGE = 'validation-change',
  LAYOUT_CHANGE = 'layout-change',
  EXPAND_CHANGE = 'expand-change',
  MODAL_CHANGE = 'modal-change',
  FOCUS_CHANGE = 'focus-change',
  SUBMIT = 'submit',
  RESET = 'reset',
}
```

### 事件监听

```typescript
// 监听值变化
formManager.on('VALUE_CHANGE', (data) => {
  console.log('值变化:', data.key, data.value)
})

// 监听验证变化
formManager.on('VALIDATION_CHANGE', (data) => {
  console.log('验证结果:', data.key, data.errors)
})
```

## 工具函数

### DOM操作工具

```typescript
import { addClass, createElement, querySelector } from '@ldesign/form'

// 创建元素
const element = createElement('div', {
  className: 'my-class',
  textContent: 'Hello World'
})

// 查询元素
const found = querySelector('.my-class')

// 添加CSS类
addClass(element, 'active')
```

### 数学计算工具

```typescript
import { calculateGridLayout, calculateOptimalColumns } from '@ldesign/form'

// 计算最佳列数
const columns = calculateOptimalColumns(800, 200, 4, 1, 16)

// 计算网格布局
const layout = calculateGridLayout(10, 800, 600, 3, 16)
```

### 事件和节流工具

```typescript
import { debounce, EventEmitter, throttle } from '@ldesign/form'

// 事件发射器
const emitter = new EventEmitter()
emitter.on('test', data => console.log(data))
emitter.emit('test', 'hello')

// 节流函数
const throttled = throttle(() => console.log('throttled'), 100)

// 防抖函数
const debounced = debounce(() => console.log('debounced'), 100)
```

## 类型定义

所有的TypeScript类型定义都可以从主包导入：

```typescript
import type {
  BehaviorConfig,
  DisplayConfig,
  FormConfig,
  FormEventData,
  FormEventType,
  FormItemConfig,
  FormState,
  LayoutConfig,
  ValidationConfig,
  ValidationResult,
} from '@ldesign/form'
```
