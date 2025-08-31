# 字符串工具

字符串工具模块提供了丰富的字符串处理、格式化、验证等功能。

## 命名转换

### toCamelCase

将字符串转换为驼峰命名法。

```typescript
function toCamelCase(str: string): string
```

**参数：**
- `str` - 要转换的字符串

**返回值：**
- `string` - 驼峰命名法字符串

**示例：**

```typescript
import { toCamelCase } from '@ldesign/shared'

toCamelCase('hello-world') // 'helloWorld'
toCamelCase('hello_world') // 'helloWorld'
toCamelCase('hello world') // 'helloWorld'
toCamelCase('HelloWorld') // 'helloWorld'
```

### toPascalCase

将字符串转换为帕斯卡命名法。

```typescript
function toPascalCase(str: string): string
```

**参数：**
- `str` - 要转换的字符串

**返回值：**
- `string` - 帕斯卡命名法字符串

**示例：**

```typescript
import { toPascalCase } from '@ldesign/shared'

toPascalCase('hello-world') // 'HelloWorld'
toPascalCase('hello_world') // 'HelloWorld'
toPascalCase('hello world') // 'HelloWorld'
```

### toKebabCase

将字符串转换为短横线命名法。

```typescript
function toKebabCase(str: string): string
```

**参数：**
- `str` - 要转换的字符串

**返回值：**
- `string` - 短横线命名法字符串

**示例：**

```typescript
import { toKebabCase } from '@ldesign/shared'

toKebabCase('helloWorld') // 'hello-world'
toKebabCase('HelloWorld') // 'hello-world'
toKebabCase('hello world') // 'hello-world'
toKebabCase('hello_world') // 'hello-world'
```

### toSnakeCase

将字符串转换为下划线命名法。

```typescript
function toSnakeCase(str: string): string
```

**参数：**
- `str` - 要转换的字符串

**返回值：**
- `string` - 下划线命名法字符串

**示例：**

```typescript
import { toSnakeCase } from '@ldesign/shared'

toSnakeCase('helloWorld') // 'hello_world'
toSnakeCase('HelloWorld') // 'hello_world'
toSnakeCase('hello world') // 'hello_world'
toSnakeCase('hello-world') // 'hello_world'
```

## 格式化

### capitalize

首字母大写。

```typescript
function capitalize(str: string): string
```

**参数：**
- `str` - 要处理的字符串

**返回值：**
- `string` - 首字母大写的字符串

**示例：**

```typescript
import { capitalize } from '@ldesign/shared'

capitalize('hello') // 'Hello'
capitalize('HELLO') // 'Hello'
capitalize('hELLO') // 'Hello'
```

### truncate

截断字符串并添加省略号。

```typescript
function truncate(str: string, maxLength: number, suffix?: string): string
```

**参数：**
- `str` - 要截断的字符串
- `maxLength` - 最大长度
- `suffix` - 后缀（默认为 '...'）

**返回值：**
- `string` - 截断后的字符串

**示例：**

```typescript
import { truncate } from '@ldesign/shared'

truncate('Hello World', 8) // 'Hello...'
truncate('Hello World', 8, '***') // 'Hello***'
truncate('Hello', 10) // 'Hello' (不截断)
```

### formatFileSize

格式化文件大小。

```typescript
function formatFileSize(bytes: number, decimals?: number): string
```

**参数：**
- `bytes` - 字节数
- `decimals` - 小数位数（默认为 2）

**返回值：**
- `string` - 格式化后的文件大小字符串

**示例：**

```typescript
import { formatFileSize } from '@ldesign/shared'

formatFileSize(0) // '0 Bytes'
formatFileSize(1024) // '1.00 KB'
formatFileSize(1048576) // '1.00 MB'
formatFileSize(1073741824, 1) // '1.0 GB'
```

## HTML 处理

### stripHtml

移除字符串中的 HTML 标签。

```typescript
function stripHtml(str: string): string
```

**参数：**
- `str` - 包含 HTML 的字符串

**返回值：**
- `string` - 移除 HTML 标签后的纯文本

**示例：**

```typescript
import { stripHtml } from '@ldesign/shared'

stripHtml('<p>Hello <strong>World</strong></p>') // 'Hello World'
stripHtml('<div><span>Test</span></div>') // 'Test'
stripHtml('Hello <br/> World') // 'Hello  World'
```

### escapeHtml

转义 HTML 特殊字符。

```typescript
function escapeHtml(str: string): string
```

**参数：**
- `str` - 要转义的字符串

**返回值：**
- `string` - 转义后的字符串

**示例：**

```typescript
import { escapeHtml } from '@ldesign/shared'

escapeHtml('<script>alert("xss")</script>')
// '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'

escapeHtml('Tom & Jerry') // 'Tom &amp; Jerry'
escapeHtml("It's a test") // 'It&#39;s a test'
```

### unescapeHtml

反转义 HTML 特殊字符。

```typescript
function unescapeHtml(str: string): string
```

**参数：**
- `str` - 要反转义的字符串

**返回值：**
- `string` - 反转义后的字符串

**示例：**

```typescript
import { unescapeHtml } from '@ldesign/shared'

unescapeHtml('&lt;div&gt;Hello&lt;/div&gt;') // '<div>Hello</div>'
unescapeHtml('Tom &amp; Jerry') // 'Tom & Jerry'
unescapeHtml('It&#39;s a test') // "It's a test"
```

## 验证

### isValidEmail

检查字符串是否为有效的邮箱地址。

```typescript
function isValidEmail(email: string): boolean
```

**参数：**
- `email` - 要验证的邮箱地址

**返回值：**
- `boolean` - 如果是有效邮箱则返回 true，否则返回 false

**示例：**

```typescript
import { isValidEmail } from '@ldesign/shared'

isValidEmail('user@example.com') // true
isValidEmail('test.email@domain.co.uk') // true
isValidEmail('user+tag@example.org') // true
isValidEmail('invalid-email') // false
isValidEmail('user@') // false
```

### isValidUrl

检查字符串是否为有效的 URL。

```typescript
function isValidUrl(url: string): boolean
```

**参数：**
- `url` - 要验证的 URL

**返回值：**
- `boolean` - 如果是有效 URL 则返回 true，否则返回 false

**示例：**

```typescript
import { isValidUrl } from '@ldesign/shared'

isValidUrl('https://example.com') // true
isValidUrl('http://localhost:3000') // true
isValidUrl('ftp://files.example.com') // true
isValidUrl('invalid-url') // false
isValidUrl('http://') // false
```

## 工具函数

### randomString

生成随机字符串。

```typescript
function randomString(length: number, charset?: string): string
```

**参数：**
- `length` - 字符串长度
- `charset` - 字符集（可选，默认包含大小写字母和数字）

**返回值：**
- `string` - 随机字符串

**示例：**

```typescript
import { randomString } from '@ldesign/shared'

randomString(8) // 'aBc3Def9'
randomString(6, 'ABCDEF0123456789') // 'A3F2E1'
randomString(10, '0123456789') // '1234567890'
```

### interpolate

字符串模板替换。

```typescript
function interpolate(template: string, data: Record<string, any>): string
```

**参数：**
- `template` - 模板字符串
- `data` - 替换数据

**返回值：**
- `string` - 替换后的字符串

**示例：**

```typescript
import { interpolate } from '@ldesign/shared'

const template = 'Hello {{name}}, you have {{count}} messages'
const data = { name: 'John', count: 5 }

interpolate(template, data) // 'Hello John, you have 5 messages'

// 未找到的变量会保留原样
interpolate('Hello {{name}}, {{unknown}} variable', { name: 'John' })
// 'Hello John, {{unknown}} variable'
```

## 使用技巧

### 链式调用

你可以组合使用多个字符串函数：

```typescript
import { toCamelCase, capitalize } from '@ldesign/shared'

const result = capitalize(toCamelCase('hello-world-example'))
// 'HelloWorldExample'
```

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <p>{{ formatFileSize(fileSize) }}</p>
    <p>{{ truncate(longText, 50) }}</p>
  </div>
</template>

<script setup>
import { formatFileSize, truncate } from '@ldesign/shared'

const fileSize = ref(1048576)
const longText = ref('这是一段很长的文本内容...')
</script>
```
