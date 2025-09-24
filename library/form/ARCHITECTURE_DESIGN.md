# 新表单组件架构设计

## 1. 设计原则

### 1.1 核心原则
- **微内核架构**: 核心功能最小化，通过插件和组合扩展
- **组件原子化**: 每个组件职责单一，可独立使用和测试
- **类型安全**: 完整的TypeScript类型定义，避免any类型
- **高内聚低耦合**: 相关功能聚合，减少组件间依赖
- **可扩展性**: 支持自定义组件、验证器、布局等

### 1.2 技术选型
- **开发语言**: TypeScript 最新版本
- **模块系统**: ESM
- **样式系统**: Less + CSS变量
- **测试框架**: Vitest
- **构建工具**: @ldesign/builder
- **启动工具**: @ldesign/launcher

## 2. 架构设计

### 2.1 整体架构
```
packages/form/
├── src/
│   ├── core/                 # 核心模块
│   │   ├── form/            # 表单核心
│   │   ├── field/           # 字段管理
│   │   ├── validation/      # 验证系统
│   │   └── layout/          # 布局系统
│   ├── components/          # 组件模块
│   │   ├── form/            # Form组件
│   │   ├── form-item/       # FormItem组件
│   │   ├── inputs/          # 输入组件
│   │   └── advanced/        # 高级组件
│   ├── hooks/               # 自定义Hooks
│   │   ├── useForm/         # 表单Hook
│   │   ├── useField/        # 字段Hook
│   │   ├── useValidation/   # 验证Hook
│   │   └── useLayout/       # 布局Hook
│   ├── types/               # 类型定义
│   │   ├── core.ts          # 核心类型
│   │   ├── components.ts    # 组件类型
│   │   └── validation.ts    # 验证类型
│   ├── utils/               # 工具函数
│   │   ├── validation.ts    # 验证工具
│   │   ├── layout.ts        # 布局工具
│   │   └── helpers.ts       # 辅助函数
│   ├── styles/              # 样式文件
│   │   ├── variables.less   # CSS变量
│   │   ├── components/      # 组件样式
│   │   └── themes/          # 主题样式
│   └── index.ts             # 入口文件
├── tests/                   # 测试文件
├── docs/                    # 文档
├── examples/                # 示例
└── dev/                     # 开发环境
```

### 2.2 核心模块设计

#### 2.2.1 Form核心 (core/form)
```typescript
// 表单状态管理
interface FormState<T = Record<string, any>> {
  values: T
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
  submitting: boolean
  validating: boolean
}

// 表单配置
interface FormConfig {
  initialValues?: Record<string, any>
  validationSchema?: ValidationSchema
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnSubmit?: boolean
}
```

#### 2.2.2 字段管理 (core/field)
```typescript
// 字段定义
interface FieldConfig {
  name: string
  label?: string
  component: Component
  props?: Record<string, any>
  rules?: ValidationRule[]
  dependencies?: string[]
  visible?: boolean | ((values: any) => boolean)
}

// 字段状态
interface FieldState {
  value: any
  error?: string
  touched: boolean
  dirty: boolean
  validating: boolean
}
```

#### 2.2.3 验证系统 (core/validation)
```typescript
// 验证规则
interface ValidationRule {
  type: 'required' | 'pattern' | 'min' | 'max' | 'custom'
  message: string
  validator?: (value: any, values: any) => boolean | Promise<boolean>
}

// 验证模式
interface ValidationSchema {
  [fieldName: string]: ValidationRule[]
}
```

#### 2.2.4 布局系统 (core/layout)
```typescript
// 布局配置
interface LayoutConfig {
  columns: number
  gutter: number
  labelWidth?: number | string
  labelAlign?: 'left' | 'right' | 'top'
  responsive?: boolean
}

// 字段布局
interface FieldLayout {
  span?: number
  offset?: number
  order?: number
}
```

## 3. 组件设计

### 3.1 Form组件
```typescript
interface FormProps<T = Record<string, any>> {
  // 数据相关
  initialValues?: T
  values?: T
  onValuesChange?: (values: T, changedValues: Partial<T>) => void
  
  // 验证相关
  validationSchema?: ValidationSchema
  validateOnChange?: boolean
  validateOnBlur?: boolean
  
  // 布局相关
  layout?: LayoutConfig
  
  // 提交相关
  onSubmit?: (values: T) => void | Promise<void>
  onSubmitFailed?: (errors: Record<string, string[]>) => void
  
  // 其他
  disabled?: boolean
  readonly?: boolean
}
```

### 3.2 FormItem组件
```typescript
interface FormItemProps {
  name: string
  label?: string
  required?: boolean
  rules?: ValidationRule[]
  layout?: FieldLayout
  dependencies?: string[]
  visible?: boolean | ((values: any) => boolean)
}
```

### 3.3 输入组件
```typescript
// 基础输入组件接口
interface BaseInputProps<T = any> {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  onBlur?: () => void
  onFocus?: () => void
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  size?: 'small' | 'medium' | 'large'
}

// 具体组件
interface InputProps extends BaseInputProps<string> {
  type?: 'text' | 'password' | 'email' | 'number'
  maxLength?: number
  showCount?: boolean
}

interface SelectProps extends BaseInputProps<any> {
  options: Array<{ label: string; value: any }>
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
}
```

## 4. Hook设计

### 4.1 useForm Hook
```typescript
function useForm<T = Record<string, any>>(config?: FormConfig) {
  // 返回表单状态和操作方法
  return {
    values: Ref<T>
    errors: Ref<Record<string, string[]>>
    touched: Ref<Record<string, boolean>>
    dirty: Ref<Record<string, boolean>>
    submitting: Ref<boolean>
    
    // 操作方法
    setFieldValue: (name: string, value: any) => void
    setFieldError: (name: string, error: string) => void
    validateField: (name: string) => Promise<boolean>
    validateForm: () => Promise<boolean>
    resetForm: () => void
    submitForm: () => Promise<void>
  }
}
```

### 4.2 useField Hook
```typescript
function useField(name: string, config?: FieldConfig) {
  return {
    value: Ref<any>
    error: Ref<string | undefined>
    touched: Ref<boolean>
    dirty: Ref<boolean>
    
    // 操作方法
    setValue: (value: any) => void
    setError: (error: string) => void
    validate: () => Promise<boolean>
    reset: () => void
  }
}
```

## 5. 样式系统设计

### 5.1 CSS变量系统
```less
// 基础变量
:root {
  // 表单相关
  --form-gutter: var(--ls-spacing-base);
  --form-label-width: 120px;
  --form-label-color: var(--ldesign-text-color-primary);
  --form-error-color: var(--ldesign-error-color);
  
  // 输入组件
  --input-height-small: var(--ls-input-height-small);
  --input-height-medium: var(--ls-input-height-medium);
  --input-height-large: var(--ls-input-height-large);
  --input-border-color: var(--ldesign-border-color);
  --input-border-radius: var(--ls-border-radius-base);
}
```

### 5.2 组件样式结构
```less
// Form组件样式
.ldesign-form {
  &__container {
    // 容器样式
  }
  
  &__row {
    display: flex;
    margin: 0 calc(var(--form-gutter) / -2);
  }
  
  &__col {
    padding: 0 calc(var(--form-gutter) / 2);
  }
}

// FormItem组件样式
.ldesign-form-item {
  margin-bottom: var(--form-gutter);
  
  &__label {
    color: var(--form-label-color);
    width: var(--form-label-width);
  }
  
  &__content {
    flex: 1;
  }
  
  &__error {
    color: var(--form-error-color);
    font-size: var(--ls-font-size-xs);
  }
}
```

## 6. API设计

### 6.1 简化API
```typescript
// 基础用法
<Form onSubmit={handleSubmit}>
  <FormItem name="username" label="用户名" required>
    <Input placeholder="请输入用户名" />
  </FormItem>
  <FormItem name="password" label="密码" required>
    <Input type="password" placeholder="请输入密码" />
  </FormItem>
</Form>

// 配置式用法
<Form
  fields={[
    {
      name: 'username',
      label: '用户名',
      component: Input,
      rules: [{ type: 'required', message: '请输入用户名' }]
    },
    {
      name: 'password',
      label: '密码',
      component: Input,
      props: { type: 'password' },
      rules: [{ type: 'required', message: '请输入密码' }]
    }
  ]}
  onSubmit={handleSubmit}
/>
```

### 6.2 Hook用法
```typescript
function MyForm() {
  const form = useForm({
    initialValues: { username: '', password: '' },
    validationSchema: {
      username: [{ type: 'required', message: '请输入用户名' }],
      password: [{ type: 'required', message: '请输入密码' }]
    }
  })
  
  return (
    <Form form={form}>
      {/* 表单内容 */}
    </Form>
  )
}
```

这个架构设计提供了清晰的模块划分、完整的类型定义和灵活的使用方式，为后续的实现提供了坚实的基础。
