# 字符串处理

字符串处理工具函数提供了丰富的字符串操作功能，包括格式转换、验证、格式化等常用操作。

## 概述

字符串处理模块包含以下功能：
- **命名转换**：驼峰、短横线、下划线等命名格式转换
- **字符串验证**：邮箱、URL、手机号等格式验证
- **文本格式化**：文件大小、数字、货币等格式化
- **字符串操作**：截取、填充、替换等基础操作
- **编码处理**：Base64、URL 编码等

## 安装和导入

```typescript
// 按需导入
import { 
  toCamelCase, 
  toKebabCase, 
  isValidEmail, 
  formatFileSize 
} from '@ldesign/shared'

// 或者导入整个字符串模块
import { string } from '@ldesign/shared'
```

## API 参考

### toCamelCase

将字符串转换为驼峰命名格式。

**函数签名**
```typescript
function toCamelCase(str: string): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| str | string | ✓ | - | 要转换的字符串 |

**返回值**
- `string` - 驼峰格式的字符串

**使用示例**

```typescript
// 短横线转驼峰
console.log(toCamelCase('hello-world')) // 'helloWorld'
console.log(toCamelCase('user-profile-settings')) // 'userProfileSettings'

// 下划线转驼峰
console.log(toCamelCase('hello_world')) // 'helloWorld'
console.log(toCamelCase('API_BASE_URL')) // 'apiBaseUrl'

// 空格转驼峰
console.log(toCamelCase('hello world')) // 'helloWorld'

// 混合格式转驼峰
console.log(toCamelCase('hello-world_test case')) // 'helloWorldTestCase'

// 实际应用：CSS 属性名转换
const cssProps = ['background-color', 'font-size', 'margin-top']
const jsProps = cssProps.map(toCamelCase)
console.log(jsProps) // ['backgroundColor', 'fontSize', 'marginTop']
```

### toKebabCase

将字符串转换为短横线命名格式。

**函数签名**
```typescript
function toKebabCase(str: string): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| str | string | ✓ | - | 要转换的字符串 |

**返回值**
- `string` - 短横线格式的字符串

**使用示例**

```typescript
// 驼峰转短横线
console.log(toKebabCase('helloWorld')) // 'hello-world'
console.log(toKebabCase('userProfileSettings')) // 'user-profile-settings'

// 下划线转短横线
console.log(toKebabCase('hello_world')) // 'hello-world'

// 空格转短横线
console.log(toKebabCase('Hello World')) // 'hello-world'

// 实际应用：生成 CSS 类名
const componentName = 'UserProfileCard'
const cssClass = toKebabCase(componentName)
console.log(cssClass) // 'user-profile-card'
```

### isValidEmail

验证邮箱地址格式是否正确。

**函数签名**
```typescript
function isValidEmail(email: string): boolean
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| email | string | ✓ | - | 要验证的邮箱地址 |

**返回值**
- `boolean` - 是否为有效的邮箱格式

**使用示例**

```typescript
// 有效邮箱
console.log(isValidEmail('user@example.com')) // true
console.log(isValidEmail('test.email+tag@domain.co.uk')) // true
console.log(isValidEmail('user123@sub.domain.org')) // true

// 无效邮箱
console.log(isValidEmail('invalid-email')) // false
console.log(isValidEmail('user@')) // false
console.log(isValidEmail('@domain.com')) // false
console.log(isValidEmail('user..name@domain.com')) // false

// 实际应用：表单验证
function validateEmailInput(email: string): string | null {
  if (!email) {
    return '邮箱地址不能为空'
  }
  
  if (!isValidEmail(email)) {
    return '请输入有效的邮箱地址'
  }
  
  return null // 验证通过
}

console.log(validateEmailInput('user@example.com')) // null
console.log(validateEmailInput('invalid')) // '请输入有效的邮箱地址'
```

### formatFileSize

格式化文件大小，将字节数转换为可读的格式。

**函数签名**
```typescript
function formatFileSize(bytes: number, decimals?: number): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| bytes | number | ✓ | - | 文件大小（字节） |
| decimals | number | ✗ | 2 | 小数位数 |

**返回值**
- `string` - 格式化后的文件大小字符串

**使用示例**

```typescript
// 基础用法
console.log(formatFileSize(1024)) // '1.00 KB'
console.log(formatFileSize(1048576)) // '1.00 MB'
console.log(formatFileSize(1073741824)) // '1.00 GB'

// 自定义小数位数
console.log(formatFileSize(1536, 0)) // '2 KB'
console.log(formatFileSize(1536, 1)) // '1.5 KB'
console.log(formatFileSize(1536, 3)) // '1.500 KB'

// 各种文件大小
console.log(formatFileSize(0)) // '0 Bytes'
console.log(formatFileSize(512)) // '512.00 Bytes'
console.log(formatFileSize(1024 * 1024 * 1024 * 1024)) // '1.00 TB'

// 实际应用：文件上传显示
const files = [
  { name: 'document.pdf', size: 2048576 },
  { name: 'image.jpg', size: 524288 },
  { name: 'video.mp4', size: 104857600 }
]

files.forEach(file => {
  console.log(`${file.name}: ${formatFileSize(file.size)}`)
})
// document.pdf: 1.95 MB
// image.jpg: 512.00 KB
// video.mp4: 100.00 MB
```

### capitalize

将字符串首字母大写。

**函数签名**
```typescript
function capitalize(str: string): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| str | string | ✓ | - | 要处理的字符串 |

**返回值**
- `string` - 首字母大写的字符串

**使用示例**

```typescript
// 基础用法
console.log(capitalize('hello')) // 'Hello'
console.log(capitalize('world')) // 'World'
console.log(capitalize('HELLO')) // 'Hello'

// 处理空字符串和特殊情况
console.log(capitalize('')) // ''
console.log(capitalize('a')) // 'A'
console.log(capitalize('123abc')) // '123abc'

// 实际应用：用户名显示
const userNames = ['john', 'jane', 'bob']
const displayNames = userNames.map(capitalize)
console.log(displayNames) // ['John', 'Jane', 'Bob']
```

### truncate

截取字符串到指定长度，超出部分用省略号表示。

**函数签名**
```typescript
function truncate(str: string, length: number, suffix?: string): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| str | string | ✓ | - | 要截取的字符串 |
| length | number | ✓ | - | 最大长度 |
| suffix | string | ✗ | '...' | 省略号后缀 |

**返回值**
- `string` - 截取后的字符串

**使用示例**

```typescript
// 基础用法
const longText = 'This is a very long text that needs to be truncated'
console.log(truncate(longText, 20)) // 'This is a very lo...'

// 自定义后缀
console.log(truncate(longText, 20, '…')) // 'This is a very lo…'
console.log(truncate(longText, 20, ' [更多]')) // 'This is a very [更多]'

// 字符串长度小于限制
console.log(truncate('Short text', 20)) // 'Short text'

// 实际应用：文章摘要
const articles = [
  {
    title: 'Understanding JavaScript Closures and Their Practical Applications',
    content: 'JavaScript closures are a fundamental concept that every developer should understand...'
  }
]

articles.forEach(article => {
  console.log(`标题: ${truncate(article.title, 30)}`)
  console.log(`摘要: ${truncate(article.content, 50)}`)
})
```

### padStart / padEnd

在字符串开头或结尾填充字符到指定长度。

**函数签名**
```typescript
function padStart(str: string, length: number, fillString?: string): string
function padEnd(str: string, length: number, fillString?: string): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| str | string | ✓ | - | 要填充的字符串 |
| length | number | ✓ | - | 目标长度 |
| fillString | string | ✗ | ' ' | 填充字符 |

**返回值**
- `string` - 填充后的字符串

**使用示例**

```typescript
// 数字补零
console.log(padStart('5', 3, '0')) // '005'
console.log(padStart('42', 4, '0')) // '0042'

// 文本对齐
console.log(padEnd('Name', 10, '.')) // 'Name......'
console.log(padStart('Price', 10, '.')) // '.....Price'

// 实际应用：格式化表格
const data = [
  { name: 'John', age: 25, score: 95 },
  { name: 'Jane Smith', age: 30, score: 87 },
  { name: 'Bob', age: 22, score: 92 }
]

console.log('姓名'.padEnd(12) + '年龄'.padStart(6) + '分数'.padStart(6))
console.log('-'.repeat(24))

data.forEach(item => {
  const name = item.name.padEnd(12)
  const age = String(item.age).padStart(6)
  const score = String(item.score).padStart(6)
  console.log(name + age + score)
})
```

## 注意事项

### 性能考虑
- 字符串操作会创建新的字符串对象
- 对于大量字符串处理，考虑使用数组 join 方法
- 正则表达式验证在大量数据时可能影响性能

### 国际化支持
- 某些函数可能不完全支持非 ASCII 字符
- 对于多语言应用，建议使用专门的国际化库

### 边界情况处理
```typescript
// 空字符串和 null/undefined 处理
console.log(toCamelCase('')) // ''
console.log(formatFileSize(0)) // '0 Bytes'
console.log(truncate('', 10)) // ''

// 特殊字符处理
console.log(toCamelCase('hello--world')) // 'helloWorld'
console.log(toKebabCase('hello__world')) // 'hello-world'
```

## 相关功能

- [验证函数](/utils/validate) - 更多验证相关的工具函数
- [格式化](/utils/format) - 数字、日期等格式化工具
- [通用工具](/utils/general) - 其他通用工具函数
