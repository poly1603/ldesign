# 工具函数

本章节介绍 @ldesign/form 提供的工具函数。

## 表单实例创建

### createFormInstance

创建原生 JavaScript 表单实例。

```typescript
function createFormInstance(config: FormInstanceConfig): FormInstance

interface FormInstanceConfig {
  container: string | HTMLElement // 挂载容器
  options: FormOptions // 表单配置
  onSubmit?: (data: FormData) => void | Promise<void>
  onChange?: (data: FormData) => void
  onReset?: () => void
  onFieldChange?: (name: string, value: any, formData: FormData) => void
}

interface FormInstance {
  // 数据操作
  setFormData(data: FormData): void
  getFormData(): FormData
  setFieldValue(fieldName: string, value: any): void
  getFieldValue(fieldName: string): any

  // 验证操作
  validate(fieldNames?: string[]): Promise<boolean>
  validateField(fieldName: string): Promise<boolean>
  clearValidation(fieldNames?: string[]): void

  // 状态操作
  reset(): void
  clear(): void
  submit(): Promise<boolean>

  // 字段操作
  showField(fieldName: string): void
  hideField(fieldName: string): void
  enableField(fieldName: string): void
  disableField(fieldName: string): void
  addField(field: FieldConfig, index?: number): void
  removeField(fieldName: string): void

  // 事件操作
  on(event: string, handler: Function): void
  off(event: string, handler?: Function): void
  emit(event: string, ...args: any[]): void

  // 生命周期
  mount(): void
  unmount(): void
  destroy(): void
}
```

#### 基础用法

```javascript
import { createFormInstance } from '@ldesign/form'

const formInstance = createFormInstance({
  container: '#form-container',
  options: {
    fields: [
      {
        name: 'username',
        label: '用户名',
        component: 'FormInput',
        required: true,
      },
      {
        name: 'email',
        label: '邮箱',
        component: 'FormInput',
        props: { type: 'email' },
        required: true,
      },
    ],
  },
  onSubmit: async data => {
    console.log('提交数据:', data)
    // 处理提交逻辑
  },
  onChange: data => {
    console.log('数据变化:', data)
  },
})

// 设置表单数据
formInstance.setFormData({
  username: 'admin',
  email: 'admin@example.com',
})

// 验证表单
formInstance.validate().then(isValid => {
  if (isValid) {
    const data = formInstance.getFormData()
    console.log('表单数据:', data)
  }
})
```

## 验证工具

### createValidator

创建自定义验证器。

```typescript
function createValidator(
  name: string,
  validator: ValidationFunction,
  defaultMessage?: string
): ValidationRule

// 示例
const phoneValidator = createValidator(
  'phone',
  value => /^1[3-9]\d{9}$/.test(value),
  '请输入有效的手机号码'
)

// 使用
const field = {
  name: 'phone',
  label: '手机号',
  component: 'FormInput',
  rules: [phoneValidator],
}
```

### validateValue

验证单个值。

```typescript
function validateValue(
  value: any,
  rules: ValidationRule[],
  formData?: FormData
): Promise<ValidationResult>

// 示例
import { validateValue } from '@ldesign/form'

const rules = [
  { required: true, message: '请输入用户名' },
  { minLength: 3, message: '用户名至少3个字符' },
]

validateValue('ab', rules).then(result => {
  console.log('验证结果:', result)
  // { valid: false, errors: ['用户名至少3个字符'] }
})
```

### validateForm

验证整个表单数据。

```typescript
function validateForm(
  formData: FormData,
  fields: FieldConfig[]
): Promise<Record<string, ValidationResult>>

// 示例
import { validateForm } from '@ldesign/form'

const formData = { username: 'ab', email: 'invalid-email' }
const fields = [
  {
    name: 'username',
    rules: [
      { required: true, message: '请输入用户名' },
      { minLength: 3, message: '用户名至少3个字符' },
    ],
  },
  {
    name: 'email',
    rules: [
      { required: true, message: '请输入邮箱' },
      { email: true, message: '请输入有效的邮箱地址' },
    ],
  },
]

validateForm(formData, fields).then(results => {
  console.log('验证结果:', results)
  // {
  //   username: { valid: false, errors: ['用户名至少3个字符'] },
  //   email: { valid: false, errors: ['请输入有效的邮箱地址'] }
  // }
})
```

## 布局工具

### calculateLayout

计算表单布局。

```typescript
function calculateLayout(
  fields: FieldConfig[],
  config: LayoutConfig,
  containerWidth?: number
): LayoutResult

interface LayoutResult {
  columns: number
  rows: number
  fieldPositions: Record<string, FieldPosition>
  gridStyle: CSSProperties
}

interface FieldPosition {
  row: number
  column: number
  span: number
}

// 示例
import { calculateLayout } from '@ldesign/form'

const fields = [
  { name: 'field1', span: 1 },
  { name: 'field2', span: 2 },
  { name: 'field3', span: 'full' },
]

const layout = calculateLayout(
  fields,
  {
    columns: 3,
    gap: 16,
  },
  800
)

console.log('布局结果:', layout)
```

### getResponsiveColumns

获取响应式列数。

```typescript
function getResponsiveColumns(columns: number | ResponsiveColumns, containerWidth: number): number

// 示例
import { getResponsiveColumns } from '@ldesign/form'

const columns = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
}

const actualColumns = getResponsiveColumns(columns, 1024)
console.log('实际列数:', actualColumns) // 4
```

## 数据工具

### cloneDeep

深度克隆对象。

```typescript
function cloneDeep<T>(obj: T): T

// 示例
import { cloneDeep } from '@ldesign/form'

const original = {
  user: { name: 'John', age: 30 },
  hobbies: ['reading', 'coding'],
}

const cloned = cloneDeep(original)
cloned.user.name = 'Jane'

console.log(original.user.name) // 'John'
console.log(cloned.user.name) // 'Jane'
```

### isEqual

深度比较两个值是否相等。

```typescript
function isEqual(a: any, b: any): boolean

// 示例
import { isEqual } from '@ldesign/form'

const obj1 = { name: 'John', age: 30 }
const obj2 = { name: 'John', age: 30 }
const obj3 = { name: 'Jane', age: 30 }

console.log(isEqual(obj1, obj2)) // true
console.log(isEqual(obj1, obj3)) // false
```

### get

安全地获取嵌套对象属性。

```typescript
function get(obj: any, path: string, defaultValue?: any): any

// 示例
import { get } from '@ldesign/form'

const data = {
  user: {
    profile: {
      name: 'John',
    },
  },
}

console.log(get(data, 'user.profile.name')) // 'John'
console.log(get(data, 'user.profile.age', 0)) // 0
console.log(get(data, 'user.settings.theme')) // undefined
```

### set

安全地设置嵌套对象属性。

```typescript
function set(obj: any, path: string, value: any): void

// 示例
import { set } from '@ldesign/form'

const data = {}

set(data, 'user.profile.name', 'John')
set(data, 'user.profile.age', 30)

console.log(data)
// {
//   user: {
//     profile: {
//       name: 'John',
//       age: 30
//     }
//   }
// }
```

### omit

从对象中排除指定属性。

```typescript
function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>

// 示例
import { omit } from '@ldesign/form'

const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
}

const publicUser = omit(user, ['password'])
console.log(publicUser)
// { id: 1, name: 'John', email: 'john@example.com' }
```

### pick

从对象中选择指定属性。

```typescript
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>

// 示例
import { pick } from '@ldesign/form'

const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
}

const basicInfo = pick(user, ['id', 'name'])
console.log(basicInfo)
// { id: 1, name: 'John' }
```

## 类型工具

### isString

检查值是否为字符串。

```typescript
function isString(value: any): value is string

// 示例
import { isString } from '@ldesign/form'

console.log(isString('hello')) // true
console.log(isString(123)) // false
```

### isNumber

检查值是否为数字。

```typescript
function isNumber(value: any): value is number

// 示例
import { isNumber } from '@ldesign/form'

console.log(isNumber(123)) // true
console.log(isNumber('123')) // false
console.log(isNumber(NaN)) // false
```

### isBoolean

检查值是否为布尔值。

```typescript
function isBoolean(value: any): value is boolean

// 示例
import { isBoolean } from '@ldesign/form'

console.log(isBoolean(true)) // true
console.log(isBoolean(false)) // true
console.log(isBoolean(1)) // false
```

### isArray

检查值是否为数组。

```typescript
function isArray(value: any): value is any[]

// 示例
import { isArray } from '@ldesign/form'

console.log(isArray([1, 2, 3])) // true
console.log(isArray('123')) // false
```

### isObject

检查值是否为对象。

```typescript
function isObject(value: any): value is object

// 示例
import { isObject } from '@ldesign/form'

console.log(isObject({})) // true
console.log(isObject([])) // false
console.log(isObject(null)) // false
```

### isFunction

检查值是否为函数。

```typescript
function isFunction(value: any): value is Function

// 示例
import { isFunction } from '@ldesign/form'

console.log(isFunction(() => {})) // true
console.log(isFunction('hello')) // false
```

### isEmpty

检查值是否为空。

```typescript
function isEmpty(value: any): boolean

// 示例
import { isEmpty } from '@ldesign/form'

console.log(isEmpty('')) // true
console.log(isEmpty([])) // true
console.log(isEmpty({})) // true
console.log(isEmpty(null)) // true
console.log(isEmpty(undefined)) // true
console.log(isEmpty(0)) // false
console.log(isEmpty(false)) // false
```

## 事件工具

### debounce

防抖函数。

```typescript
function debounce<T extends (...args: any[]) => any>(func: T, wait: number, immediate?: boolean): T

// 示例
import { debounce } from '@ldesign/form'

const debouncedSearch = debounce((query: string) => {
  console.log('搜索:', query)
}, 300)

// 连续调用只会执行最后一次
debouncedSearch('a')
debouncedSearch('ab')
debouncedSearch('abc') // 只有这次会执行
```

### throttle

节流函数。

```typescript
function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T

// 示例
import { throttle } from '@ldesign/form'

const throttledScroll = throttle(() => {
  console.log('滚动事件')
}, 100)

window.addEventListener('scroll', throttledScroll)
```

## DOM 工具

### getElement

获取 DOM 元素。

```typescript
function getElement(selector: string | HTMLElement): HTMLElement | null

// 示例
import { getElement } from '@ldesign/form'

const element1 = getElement('#my-form')
const element2 = getElement(document.getElementById('my-form'))
```

### addClass

添加 CSS 类。

```typescript
function addClass(element: HTMLElement, className: string): void

// 示例
import { addClass } from '@ldesign/form'

const element = document.getElementById('my-form')
addClass(element, 'form-loading')
```

### removeClass

移除 CSS 类。

```typescript
function removeClass(element: HTMLElement, className: string): void

// 示例
import { removeClass } from '@ldesign/form'

const element = document.getElementById('my-form')
removeClass(element, 'form-loading')
```

### hasClass

检查是否包含 CSS 类。

```typescript
function hasClass(element: HTMLElement, className: string): boolean

// 示例
import { hasClass } from '@ldesign/form'

const element = document.getElementById('my-form')
if (hasClass(element, 'form-loading')) {
  console.log('表单正在加载')
}
```

## 格式化工具

### formatDate

格式化日期。

```typescript
function formatDate(date: Date | string, format: string): string

// 示例
import { formatDate } from '@ldesign/form'

const date = new Date('2024-01-15')
console.log(formatDate(date, 'YYYY-MM-DD')) // '2024-01-15'
console.log(formatDate(date, 'YYYY年MM月DD日')) // '2024年01月15日'
```

### parseDate

解析日期字符串。

```typescript
function parseDate(dateString: string, format?: string): Date | null

// 示例
import { parseDate } from '@ldesign/form'

const date1 = parseDate('2024-01-15')
const date2 = parseDate('2024年01月15日', 'YYYY年MM月DD日')
```

### formatNumber

格式化数字。

```typescript
function formatNumber(
  value: number,
  options?: {
    decimals?: number
    thousandsSeparator?: string
    decimalSeparator?: string
  }
): string

// 示例
import { formatNumber } from '@ldesign/form'

console.log(formatNumber(1234.56)) // '1,234.56'
console.log(formatNumber(1234.56, { decimals: 1 })) // '1,234.6'
console.log(
  formatNumber(1234.56, {
    thousandsSeparator: ' ',
    decimalSeparator: ',',
  })
) // '1 234,56'
```

## 组合使用示例

```javascript
import { createFormInstance, validateValue, cloneDeep, debounce, formatDate } from '@ldesign/form'

// 创建带有自定义验证的表单
const formInstance = createFormInstance({
  container: '#advanced-form',
  options: {
    fields: [
      {
        name: 'username',
        label: '用户名',
        component: 'FormInput',
        rules: [
          { required: true, message: '请输入用户名' },
          {
            validator: debounce(async value => {
              // 异步验证用户名是否可用
              const response = await fetch(`/api/check-username?username=${value}`)
              const result = await response.json()
              return result.available
            }, 500),
            message: '用户名已存在',
          },
        ],
      },
      {
        name: 'birthday',
        label: '生日',
        component: 'FormDatePicker',
        props: {
          format: 'YYYY-MM-DD',
          disabledDate: date => date > new Date(),
        },
      },
    ],
  },
  onSubmit: async data => {
    // 克隆数据避免修改原始数据
    const submitData = cloneDeep(data)

    // 格式化日期
    if (submitData.birthday) {
      submitData.birthday = formatDate(submitData.birthday, 'YYYY-MM-DD')
    }

    console.log('提交数据:', submitData)
  },
})
```
