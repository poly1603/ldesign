# @ldesign/form API 文档

## 目录

- [FormOptions](#formoptions) - 表单配置选项
- [FormItemConfig](#formitemconfig) - 字段配置
- [ValidationRule](#validationrule) - 验证规则
- [LayoutConfig](#layoutconfig) - 布局配置
- [ThemeConfig](#themeconfig) - 主题配置
- [Composition API](#composition-api) - Composition API Hook
- [组件 API](#组件-api) - Vue 组件 API
- [原生 JavaScript API](#原生-javascript-api) - 原生 JS API

## FormOptions

表单的主要配置选项。

```typescript
interface FormOptions {
  fields: FormItemConfig[] // 字段配置列表
  layout?: LayoutConfig // 布局配置
  validation?: ValidationConfig // 验证配置
  groups?: FormGroupConfig[] // 分组配置
  title?: string // 表单标题
  description?: string // 表单描述
  type?: 'edit' | 'query' | 'detail' // 表单类型
  disabled?: boolean // 是否禁用整个表单
  readonly?: boolean // 是否只读
  theme?: string | ThemeConfig // 主题配置
}
```

### 示例

```typescript
const formOptions: FormOptions = {
  title: '用户信息表单',
  description: '请填写完整的用户信息',
  type: 'edit',
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true,
      rules: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', params: 3, message: '用户名至少3个字符' },
      ],
    },
  ],
  layout: {
    columns: 2,
    horizontalGap: 16,
    verticalGap: 16,
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
  },
}
```

## FormItemConfig

单个表单字段的配置。

```typescript
interface FormItemConfig {
  name: string // 字段名（必填）
  title?: string // 字段标题
  component: string | Component // 组件类型
  type?: string // 输入类型（如 text, email, password 等）
  required?: boolean // 是否必填
  disabled?: boolean // 是否禁用
  readonly?: boolean // 是否只读
  hidden?: boolean // 是否隐藏
  placeholder?: string // 占位符文本
  defaultValue?: any // 默认值
  span?: number | string // 跨列数
  rules?: ValidationRule[] // 验证规则
  options?: FieldOption[] // 选项列表（用于 select、radio 等）
  props?: Record<string, any> // 传递给组件的额外属性
  className?: string // 自定义 CSS 类名
  style?: Record<string, any> // 自定义样式
  conditionalRender?: ConditionalRenderConfig // 条件渲染配置
}
```

### 内置组件类型

- `FormInput` - 输入框
- `FormTextarea` - 多行文本框
- `FormSelect` - 下拉选择器
- `FormRadio` - 单选按钮组
- `FormCheckbox` - 复选框组
- `FormDatePicker` - 日期选择器
- `FormTimePicker` - 时间选择器
- `FormSwitch` - 开关
- `FormSlider` - 滑块
- `FormRate` - 评分

### 示例

```typescript
const fieldConfig: FormItemConfig = {
  name: 'email',
  title: '邮箱地址',
  component: 'FormInput',
  type: 'email',
  required: true,
  placeholder: '请输入邮箱地址',
  span: 2,
  rules: [
    { type: 'required', message: '邮箱不能为空' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  props: {
    clearable: true,
    showCount: false,
  },
}
```

## ValidationRule

验证规则配置。

```typescript
interface ValidationRule {
  type: string // 验证类型
  params?: any // 验证参数
  message?: string // 错误消息
  trigger?: 'change' | 'blur' // 触发时机
  condition?: (value: any, formData: FormData) => boolean // 条件验证
  validator?: ValidationFunction // 自定义验证器
}
```

### 内置验证类型

| 类型        | 参数     | 说明         | 示例                                                                                   |
| ----------- | -------- | ------------ | -------------------------------------------------------------------------------------- |
| `required`  | -        | 必填验证     | `{ type: 'required', message: '此字段为必填项' }`                                      |
| `email`     | -        | 邮箱格式验证 | `{ type: 'email', message: '请输入有效的邮箱地址' }`                                   |
| `phone`     | -        | 手机号验证   | `{ type: 'phone', message: '请输入有效的手机号码' }`                                   |
| `url`       | -        | URL 格式验证 | `{ type: 'url', message: '请输入有效的URL' }`                                          |
| `number`    | -        | 数字验证     | `{ type: 'number', message: '请输入数字' }`                                            |
| `integer`   | -        | 整数验证     | `{ type: 'integer', message: '请输入整数' }`                                           |
| `minLength` | `number` | 最小长度     | `{ type: 'minLength', params: 3, message: '至少3个字符' }`                             |
| `maxLength` | `number` | 最大长度     | `{ type: 'maxLength', params: 20, message: '最多20个字符' }`                           |
| `min`       | `number` | 最小值       | `{ type: 'min', params: 18, message: '不能小于18' }`                                   |
| `max`       | `number` | 最大值       | `{ type: 'max', params: 100, message: '不能大于100' }`                                 |
| `pattern`   | `RegExp` | 正则表达式   | `{ type: 'pattern', params: /^[a-zA-Z]+$/, message: '只能包含字母' }`                  |
| `custom`    | -        | 自定义验证   | `{ type: 'custom', validator: (value) => value !== 'admin' \|\| '用户名不能是admin' }` |

### 自定义验证器

```typescript
const customRule: ValidationRule = {
  type: 'custom',
  validator: async (value, formData, fieldName) => {
    // 同步验证
    if (value === 'admin') {
      return '用户名不能是admin'
    }

    // 异步验证
    const exists = await checkUsernameExists(value)
    if (exists) {
      return '用户名已存在'
    }

    return true // 验证通过
  },
  message: '验证失败',
}
```

## LayoutConfig

布局配置选项。

```typescript
interface LayoutConfig {
  columns?: number // 列数
  minColumnWidth?: number // 最小列宽
  autoCalculate?: boolean // 是否自动计算列数
  horizontalGap?: number // 水平间距
  verticalGap?: number // 垂直间距
  defaultRows?: number // 默认显示行数
  label?: {
    // 标签配置
    position?: 'left' | 'top' // 标签位置
    width?: number // 标签宽度
    showColon?: boolean // 是否显示冒号
  }
  button?: {
    // 按钮配置
    position?: 'inline' | 'newline' // 按钮位置
    align?: 'left' | 'center' | 'right' // 按钮对齐
    span?: number // 按钮跨列数
  }
  breakpoints?: {
    // 响应式断点
    xs?: Partial<LayoutConfig>
    sm?: Partial<LayoutConfig>
    md?: Partial<LayoutConfig>
    lg?: Partial<LayoutConfig>
    xl?: Partial<LayoutConfig>
    xxl?: Partial<LayoutConfig>
  }
}
```

### 示例

```typescript
const layoutConfig: LayoutConfig = {
  columns: 3,
  horizontalGap: 20,
  verticalGap: 20,
  label: {
    position: 'left',
    width: 100,
    showColon: true,
  },
  button: {
    position: 'newline',
    align: 'center',
  },
  breakpoints: {
    xs: { columns: 1 },
    sm: { columns: 2 },
    md: { columns: 3 },
  },
}
```

## ThemeConfig

主题配置选项。

```typescript
interface ThemeConfig {
  name: string // 主题名称
  type?: 'light' | 'dark' // 主题类型
  colors?: {
    // 颜色配置
    primary?: string
    success?: string
    warning?: string
    error?: string
    info?: string
    text?: {
      primary?: string
      secondary?: string
      disabled?: string
      placeholder?: string
      link?: string
    }
    background?: {
      primary?: string
      secondary?: string
      hover?: string
      active?: string
      disabled?: string
    }
    border?: {
      default?: string
      hover?: string
      active?: string
      error?: string
      success?: string
    }
  }
  typography?: {
    // 字体配置
    fontFamily?: string
    fontSize?: {
      xs?: string
      sm?: string
      base?: string
      lg?: string
      xl?: string
      xxl?: string
    }
    fontWeight?: {
      light?: number
      normal?: number
      medium?: number
      bold?: number
    }
    lineHeight?: {
      tight?: number
      normal?: number
      loose?: number
    }
  }
  spacing?: {
    // 间距配置
    xs?: string
    sm?: string
    base?: string
    lg?: string
    xl?: string
    xxl?: string
  }
  border?: {
    // 边框配置
    width?: string
    style?: string
    radius?: {
      none?: string
      sm?: string
      base?: string
      lg?: string
      full?: string
    }
  }
  shadow?: {
    // 阴影配置
    none?: string
    sm?: string
    base?: string
    lg?: string
    xl?: string
  }
  animation?: {
    // 动画配置
    duration?: {
      fast?: string
      normal?: string
      slow?: string
    }
    easing?: {
      linear?: string
      easeIn?: string
      easeOut?: string
      easeInOut?: string
    }
    enabled?: boolean
  }
  cssVars?: Record<string, string> // 自定义 CSS 变量
}
```

### 预设主题

```typescript
import { getPresetTheme } from '@ldesign/form'

// 使用预设主题
const lightTheme = getPresetTheme('light')
const darkTheme = getPresetTheme('dark')
const blueTheme = getPresetTheme('blue')
```

可用的预设主题：

- `light` - 浅色主题
- `dark` - 暗色主题
- `blue` - 蓝色主题
- `green` - 绿色主题
- `purple` - 紫色主题
- `compact` - 紧凑主题
- `comfortable` - 宽松主题
- `rounded` - 圆角主题
- `flat` - 扁平主题
