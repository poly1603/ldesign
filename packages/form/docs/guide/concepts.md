# 基础概念

本章节将介绍 @ldesign/form 的核心概念，帮助你更好地理解和使用这个表单库。

## 表单配置 (Form Options)

表单配置是 @ldesign/form 的核心概念，通过 JSON 配置来定义表单的结构、行为和样式。

### 基本结构

```typescript
interface FormOptions {
  fields: FieldConfig[] // 字段配置数组
  layout?: LayoutConfig // 布局配置
  validation?: ValidationConfig // 验证配置
  theme?: ThemeConfig // 主题配置
  submitButton?: ButtonConfig // 提交按钮配置
  resetButton?: ButtonConfig // 重置按钮配置
}
```

### 示例配置

```javascript
const formOptions = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      required: true,
    },
  ],
  layout: {
    columns: 2,
    gap: 16,
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
  },
}
```

## 字段配置 (Field Config)

字段配置定义了表单中每个字段的属性和行为。

### 基本属性

```typescript
interface FieldConfig {
  name: string // 字段名称（必需）
  label?: string // 字段标签
  component: string // 组件类型（必需）
  required?: boolean // 是否必填
  disabled?: boolean // 是否禁用
  hidden?: boolean // 是否隐藏
  readonly?: boolean // 是否只读
  placeholder?: string // 占位符
  defaultValue?: any // 默认值
  props?: Record<string, any> // 组件属性
  rules?: ValidationRule[] // 验证规则
  span?: number | 'full' // 跨列数
  order?: number // 排序权重
}
```

### 字段类型

@ldesign/form 提供了多种内置字段类型：

#### 文本输入类

```javascript
// 单行文本输入
{
  name: 'username',
  label: '用户名',
  component: 'FormInput',
  props: {
    type: 'text',        // text | email | password | number | tel | url
    maxlength: 50,
    autocomplete: 'username'
  }
}

// 多行文本输入
{
  name: 'description',
  label: '描述',
  component: 'FormTextarea',
  props: {
    rows: 4,
    maxlength: 200,
    resize: 'vertical'   // none | both | horizontal | vertical
  }
}
```

#### 选择类

```javascript
// 下拉选择
{
  name: 'category',
  label: '分类',
  component: 'FormSelect',
  props: {
    options: [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' }
    ],
    multiple: false,     // 是否多选
    filterable: true,    // 是否可搜索
    clearable: true      // 是否可清空
  }
}

// 单选框组
{
  name: 'gender',
  label: '性别',
  component: 'FormRadio',
  props: {
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    direction: 'horizontal' // horizontal | vertical
  }
}

// 复选框组
{
  name: 'hobbies',
  label: '爱好',
  component: 'FormCheckbox',
  props: {
    options: [
      { label: '阅读', value: 'reading' },
      { label: '运动', value: 'sports' }
    ],
    max: 3               // 最大选择数量
  }
}
```

#### 日期时间类

```javascript
// 日期选择器
{
  name: 'birthday',
  label: '生日',
  component: 'FormDatePicker',
  props: {
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
    type: 'date',        // date | datetime | daterange | datetimerange
    disabledDate: (date) => date > new Date()
  }
}

// 时间选择器
{
  name: 'time',
  label: '时间',
  component: 'FormTimePicker',
  props: {
    format: 'HH:mm:ss',
    step: '00:15:00'     // 时间间隔
  }
}
```

#### 交互类

```javascript
// 开关
{
  name: 'enabled',
  label: '启用',
  component: 'FormSwitch',
  props: {
    activeText: '开启',
    inactiveText: '关闭',
    activeValue: true,
    inactiveValue: false
  }
}

// 滑块
{
  name: 'score',
  label: '评分',
  component: 'FormSlider',
  props: {
    min: 0,
    max: 100,
    step: 1,
    showStops: true,     // 显示间断点
    showTooltip: true    // 显示提示
  }
}

// 评分
{
  name: 'rating',
  label: '满意度',
  component: 'FormRate',
  props: {
    max: 5,
    allowHalf: true,     // 允许半星
    showText: true,      // 显示文字
    texts: ['极差', '失望', '一般', '满意', '惊喜']
  }
}
```

## 布局系统 (Layout System)

布局系统控制表单的整体布局和字段排列。

### 布局配置

```typescript
interface LayoutConfig {
  columns?: number | ResponsiveColumns // 列数配置
  gap?: number | GapConfig // 间距配置
  labelPosition?: 'top' | 'left' | 'right' // 标签位置
  labelWidth?: number | string // 标签宽度
  labelAlign?: 'left' | 'center' | 'right' // 标签对齐
  size?: 'small' | 'medium' | 'large' // 组件尺寸
}
```

### 响应式布局

```javascript
const layoutConfig = {
  columns: {
    xs: 1, // < 576px
    sm: 1, // >= 576px
    md: 2, // >= 768px
    lg: 3, // >= 992px
    xl: 4, // >= 1200px
    xxl: 4, // >= 1600px
  },
  gap: {
    horizontal: 16,
    vertical: 16,
  },
}
```

### 字段跨列

```javascript
const fields = [
  {
    name: 'title',
    label: '标题',
    component: 'FormInput',
    span: 2, // 跨2列
  },
  {
    name: 'description',
    label: '描述',
    component: 'FormTextarea',
    span: 'full', // 跨全部列
  },
]
```

## 验证系统 (Validation System)

验证系统提供了强大的表单验证功能。

### 验证规则

```typescript
interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  phone?: boolean
  url?: boolean
  number?: boolean
  integer?: boolean
  validator?: (value: any, formData: any) => boolean | Promise<boolean>
  message?: string
  trigger?: 'change' | 'blur' | 'submit'
}
```

### 内置验证规则

```javascript
const rules = [
  { required: true, message: '此字段为必填项' },
  { minLength: 3, message: '最少输入3个字符' },
  { maxLength: 20, message: '最多输入20个字符' },
  { min: 0, message: '数值不能小于0' },
  { max: 100, message: '数值不能大于100' },
  { email: true, message: '请输入有效的邮箱地址' },
  { phone: true, message: '请输入有效的手机号码' },
  { url: true, message: '请输入有效的URL地址' },
  { pattern: /^\d+$/, message: '只能输入数字' },
]
```

### 自定义验证器

```javascript
// 同步验证器
{
  validator: (value, formData) => {
    return value === formData.password
  },
  message: '两次输入的密码不一致'
}

// 异步验证器
{
  validator: async (value) => {
    const response = await fetch(`/api/check-username?username=${value}`)
    const result = await response.json()
    return result.available
  },
  message: '用户名已存在'
}
```

## 事件系统 (Event System)

事件系统允许你监听表单和字段的各种状态变化。

### 表单级事件

```javascript
// 表单提交
onSubmit: formData => {
  console.log('表单提交:', formData)
}

// 表单重置
onReset: () => {
  console.log('表单已重置')
}

// 表单数据变化
onChange: formData => {
  console.log('表单数据变化:', formData)
}

// 表单验证
onValidate: result => {
  console.log('验证结果:', result)
}
```

### 字段级事件

```javascript
// 字段值变化
onFieldChange: (fieldName, value, formData) => {
  console.log('字段变化:', fieldName, value)
}

// 字段获得焦点
onFieldFocus: fieldName => {
  console.log('字段获得焦点:', fieldName)
}

// 字段失去焦点
onFieldBlur: fieldName => {
  console.log('字段失去焦点:', fieldName)
}
```

## 状态管理 (State Management)

@ldesign/form 内置了完整的状态管理系统。

### 表单状态

```typescript
interface FormState {
  submitting: boolean // 是否正在提交
  validating: boolean // 是否正在验证
  dirty: boolean // 是否有修改
  valid: boolean // 是否验证通过
  touched: boolean // 是否有交互
}
```

### 字段状态

```typescript
interface FieldState {
  value: any // 字段值
  dirty: boolean // 是否有修改
  touched: boolean // 是否有交互
  valid: boolean // 是否验证通过
  errors: string[] // 错误信息
  visible: boolean // 是否可见
  disabled: boolean // 是否禁用
  readonly: boolean // 是否只读
}
```

## 主题系统 (Theme System)

主题系统允许你自定义表单的外观。

### 预设主题

```javascript
// 使用预设主题
const formOptions = {
  theme: 'light', // light | dark | blue | green | purple | compact | comfortable | rounded | flat
  fields: [
    // 字段配置...
  ],
}
```

### 自定义主题

```javascript
// 自定义主题
const customTheme = {
  primaryColor: '#1890ff',
  borderRadius: '6px',
  fontSize: '14px',
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
}

const formOptions = {
  theme: customTheme,
  fields: [
    // 字段配置...
  ],
}
```

## 下一步

现在你已经了解了核心概念，可以继续学习：

1. [自定义组件](/guide/custom-components) - 学习如何创建自定义组件
2. [基础示例](/examples/basic) - 查看实际使用示例
3. [动态表单](/examples/dynamic) - 学习动态表单的创建
