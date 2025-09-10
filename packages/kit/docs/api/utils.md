# Utils 工具函数

Utils 模块提供了一系列常用的工具函数，包括字符串、数字、日期、对象、数组、颜色、树形数据、URL等处理工具。

## 导入方式

```typescript
// 完整导入
import {
  StringUtils,
  NumberUtils,
  DateUtils,
  ObjectUtils,
  ArrayUtils,
  ValidationUtils,
  ColorUtils,
  TreeUtils,
  UrlUtils,
} from '@ldesign/kit'

// 按需导入
import { StringUtils, ColorUtils } from '@ldesign/kit/utils'

// 单独导入
import { StringUtils } from '@ldesign/kit'
```

## StringUtils

字符串处理工具类，提供常用的字符串操作方法。

### 方法

#### `camelCase(str: string): string`

将字符串转换为驼峰命名格式。

```typescript
StringUtils.camelCase('hello-world') // 'helloWorld'
StringUtils.camelCase('hello_world') // 'helloWorld'
StringUtils.camelCase('Hello World') // 'helloWorld'
StringUtils.camelCase('HELLO-WORLD') // 'helloWorld'
```

#### `kebabCase(str: string): string`

将字符串转换为短横线命名格式。

```typescript
StringUtils.kebabCase('helloWorld') // 'hello-world'
StringUtils.kebabCase('HelloWorld') // 'hello-world'
StringUtils.kebabCase('hello_world') // 'hello-world'
```

#### `snakeCase(str: string): string`

将字符串转换为下划线命名格式。

```typescript
StringUtils.snakeCase('helloWorld') // 'hello_world'
StringUtils.snakeCase('HelloWorld') // 'hello_world'
StringUtils.snakeCase('hello-world') // 'hello_world'
```

#### `pascalCase(str: string): string`

将字符串转换为帕斯卡命名格式。

```typescript
StringUtils.pascalCase('hello-world') // 'HelloWorld'
StringUtils.pascalCase('hello_world') // 'HelloWorld'
StringUtils.pascalCase('helloWorld') // 'HelloWorld'
```

#### `slugify(str: string, options?: SlugifyOptions): string`

将字符串转换为 URL 友好的格式。

```typescript
StringUtils.slugify('Hello World!') // 'hello-world'
StringUtils.slugify('中文测试') // 'zhong-wen-ce-shi'
StringUtils.slugify('Hello@World#123') // 'hello-world-123'

// 自定义选项
StringUtils.slugify('Hello World!', {
  separator: '_', // 'hello_world'
  lowercase: false, // 'Hello_World'
  trim: true,
})
```

#### `truncate(str: string, length: number, suffix?: string): string`

截断字符串到指定长度。

```typescript
StringUtils.truncate('很长的文本内容', 10) // '很长的文本内容...'
StringUtils.truncate('Long text content', 10) // 'Long text...'
StringUtils.truncate('Short', 10) // 'Short'
StringUtils.truncate('Long text', 5, '***') // 'Long***'
```

#### `capitalize(str: string): string`

将字符串首字母大写。

```typescript
StringUtils.capitalize('hello world') // 'Hello World'
StringUtils.capitalize('HELLO WORLD') // 'Hello World'
StringUtils.capitalize('hello') // 'Hello'
```

#### `template(template: string, data: Record<string, any>): string`

模板字符串替换。

```typescript
const template = 'Hello {{name}}, welcome to {{app}}!'
StringUtils.template(template, {
  name: 'John',
  app: 'MyApp',
})
// 'Hello John, welcome to MyApp!'

// 支持嵌套属性
const template = 'User: {{user.name}} ({{user.email}})'
StringUtils.template(template, {
  user: { name: 'John', email: 'john@example.com' },
})
// 'User: John (john@example.com)'
```

#### `escape(str: string): string`

转义 HTML 特殊字符。

```typescript
StringUtils.escape('<div>Hello & "World"</div>')
// '&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;'
```

#### `unescape(str: string): string`

反转义 HTML 特殊字符。

```typescript
StringUtils.unescape('&lt;div&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;')
// '<div>Hello & "World"</div>'
```

## NumberUtils

数字处理工具类，提供数字格式化和计算方法。

### 方法

#### `formatCurrency(amount: number, currency?: string, locale?: string): string`

格式化货币显示。

```typescript
NumberUtils.formatCurrency(1234.56) // '$1,234.56'
NumberUtils.formatCurrency(1234.56, 'EUR') // '€1,234.56'
NumberUtils.formatCurrency(1234.56, 'CNY', 'zh-CN') // '¥1,234.56'
```

#### `formatNumber(num: number, options?: NumberFormatOptions): string`

格式化数字显示。

```typescript
NumberUtils.formatNumber(1234567.89) // '1,234,567.89'
NumberUtils.formatNumber(1234567.89, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}) // '1,234,567.89'
```

#### `clamp(value: number, min: number, max: number): number`

将数值限制在指定范围内。

```typescript
NumberUtils.clamp(15, 0, 10) // 10
NumberUtils.clamp(-5, 0, 10) // 0
NumberUtils.clamp(5, 0, 10) // 5
```

#### `random(min: number, max: number): number`

生成指定范围内的随机数。

```typescript
NumberUtils.random(1, 100) // 随机数 1-100
NumberUtils.random(0, 1) // 随机数 0-1
```

#### `randomInt(min: number, max: number): number`

生成指定范围内的随机整数。

```typescript
NumberUtils.randomInt(1, 10) // 随机整数 1-10
NumberUtils.randomInt(0, 100) // 随机整数 0-100
```

#### `round(value: number, precision: number): number`

四舍五入到指定精度。

```typescript
NumberUtils.round(3.14159, 2) // 3.14
NumberUtils.round(3.14159, 0) // 3
NumberUtils.round(123.456, -1) // 120
```

#### `percentage(value: number, total: number, precision?: number): string`

计算百分比。

```typescript
NumberUtils.percentage(25, 100) // '25%'
NumberUtils.percentage(1, 3, 2) // '33.33%'
NumberUtils.percentage(2, 3, 1) // '66.7%'
```

## DateUtils

日期处理工具类，提供日期操作和格式化方法。

### 方法

#### `format(date: Date, format: string): string`

格式化日期。

```typescript
const date = new Date('2024-01-15 14:30:00')

DateUtils.format(date, 'YYYY-MM-DD') // '2024-01-15'
DateUtils.format(date, 'YYYY年MM月DD日') // '2024年01月15日'
DateUtils.format(date, 'HH:mm:ss') // '14:30:00'
DateUtils.format(date, 'YYYY-MM-DD HH:mm:ss') // '2024-01-15 14:30:00'
```

#### `addDays(date: Date, days: number): Date`

添加指定天数。

```typescript
const date = new Date('2024-01-15')
DateUtils.addDays(date, 7) // 2024-01-22
DateUtils.addDays(date, -3) // 2024-01-12
```

#### `addMonths(date: Date, months: number): Date`

添加指定月数。

```typescript
const date = new Date('2024-01-15')
DateUtils.addMonths(date, 2) // 2024-03-15
DateUtils.addMonths(date, -1) // 2023-12-15
```

#### `addYears(date: Date, years: number): Date`

添加指定年数。

```typescript
const date = new Date('2024-01-15')
DateUtils.addYears(date, 1) // 2025-01-15
DateUtils.addYears(date, -2) // 2022-01-15
```

#### `isWeekend(date: Date): boolean`

检查是否为周末。

```typescript
DateUtils.isWeekend(new Date('2024-01-13')) // true (Saturday)
DateUtils.isWeekend(new Date('2024-01-15')) // false (Monday)
```

#### `diffInDays(date1: Date, date2: Date): number`

计算两个日期之间的天数差。

```typescript
const date1 = new Date('2024-01-01')
const date2 = new Date('2024-01-08')
DateUtils.diffInDays(date1, date2) // 7
DateUtils.diffInDays(date2, date1) // -7
```

#### `startOfDay(date: Date): Date`

获取一天的开始时间。

```typescript
const date = new Date('2024-01-15 14:30:00')
DateUtils.startOfDay(date) // 2024-01-15 00:00:00
```

#### `endOfDay(date: Date): Date`

获取一天的结束时间。

```typescript
const date = new Date('2024-01-15 14:30:00')
DateUtils.endOfDay(date) // 2024-01-15 23:59:59
```

## ObjectUtils

对象处理工具类，提供对象深度操作方法。

### 方法

#### `deepMerge(target: object, ...sources: object[]): object`

深度合并对象。

```typescript
const obj1 = { a: 1, b: { c: 2 } }
const obj2 = { b: { d: 3 }, e: 4 }
const result = ObjectUtils.deepMerge(obj1, obj2)
// { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

#### `get(obj: object, path: string, defaultValue?: any): any`

安全获取对象属性值。

```typescript
const obj = { user: { profile: { name: 'John' } } }
ObjectUtils.get(obj, 'user.profile.name') // 'John'
ObjectUtils.get(obj, 'user.profile.age', 25) // 25
ObjectUtils.get(obj, 'user.settings.theme', 'dark') // 'dark'
```

#### `set(obj: object, path: string, value: any): void`

设置对象属性值。

```typescript
const obj = {}
ObjectUtils.set(obj, 'user.profile.name', 'John')
// obj = { user: { profile: { name: 'John' } } }
```

#### `omit(obj: object, keys: string[]): object`

排除指定属性。

```typescript
const user = { id: 1, name: 'John', password: 'secret', email: 'john@example.com' }
const publicUser = ObjectUtils.omit(user, ['password'])
// { id: 1, name: 'John', email: 'john@example.com' }
```

#### `pick(obj: object, keys: string[]): object`

选择指定属性。

```typescript
const user = { id: 1, name: 'John', password: 'secret', email: 'john@example.com' }
const publicUser = ObjectUtils.pick(user, ['id', 'name', 'email'])
// { id: 1, name: 'John', email: 'john@example.com' }
```

#### `clone(obj: any): any`

深度克隆对象。

```typescript
const original = { a: 1, b: { c: 2 } }
const cloned = ObjectUtils.clone(original)
cloned.b.c = 3
// original.b.c 仍然是 2
```

## ArrayUtils

数组处理工具类，提供数组操作和分析方法。

### 方法

#### `unique<T>(array: T[]): T[]`

数组去重。

```typescript
ArrayUtils.unique([1, 2, 2, 3, 3, 4]) // [1, 2, 3, 4]
ArrayUtils.unique(['a', 'b', 'b', 'c']) // ['a', 'b', 'c']
```

#### `chunk<T>(array: T[], size: number): T[][]`

将数组分块。

```typescript
ArrayUtils.chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
ArrayUtils.chunk(['a', 'b', 'c', 'd'], 3) // [['a', 'b', 'c'], ['d']]
```

#### `groupBy<T>(array: T[], key: string): Record<string, T[]>`

按属性分组。

```typescript
const users = [
  { name: 'John', role: 'admin' },
  { name: 'Jane', role: 'user' },
  { name: 'Bob', role: 'admin' },
]
ArrayUtils.groupBy(users, 'role')
// { admin: [{ name: 'John', role: 'admin' }, { name: 'Bob', role: 'admin' }], user: [{ name: 'Jane', role: 'user' }] }
```

#### `shuffle<T>(array: T[]): T[]`

随机打乱数组。

```typescript
ArrayUtils.shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (随机顺序)
```

#### `sample<T>(array: T[], count?: number): T | T[]`

随机采样。

```typescript
ArrayUtils.sample([1, 2, 3, 4, 5]) // 3 (随机一个元素)
ArrayUtils.sample([1, 2, 3, 4, 5], 3) // [2, 4, 1] (随机三个元素)
```

## ValidationUtils

基础验证工具类，提供常用的验证方法。

### 方法

#### `isEmail(email: string): boolean`

验证邮箱格式。

```typescript
ValidationUtils.isEmail('user@example.com') // true
ValidationUtils.isEmail('invalid-email') // false
```

#### `isUrl(url: string): boolean`

验证 URL 格式。

```typescript
ValidationUtils.isUrl('https://example.com') // true
ValidationUtils.isUrl('invalid-url') // false
```

#### `isPhoneNumber(phone: string, region?: string): boolean`

验证手机号格式。

```typescript
ValidationUtils.isPhoneNumber('13800138000', 'CN') // true
ValidationUtils.isPhoneNumber('+1-555-123-4567', 'US') // true
```

#### `isIPAddress(ip: string): boolean`

验证 IP 地址格式。

```typescript
ValidationUtils.isIPAddress('192.168.1.1') // true
ValidationUtils.isIPAddress('invalid-ip') // false
```

#### `isCreditCard(card: string): boolean`

验证信用卡号格式。

```typescript
ValidationUtils.isCreditCard('4111111111111111') // true
ValidationUtils.isCreditCard('1234567890') // false
```

## ColorUtils

颜色处理工具类，提供颜色格式转换、颜色操作和颜色分析方法。

### 方法

#### `hexToRgb(hex: string): RgbColor`

将十六进制颜色转换为RGB格式。

```typescript
ColorUtils.hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }
ColorUtils.hexToRgb('#00ff00') // { r: 0, g: 255, b: 0 }
ColorUtils.hexToRgb('#0000ff') // { r: 0, g: 0, b: 255 }
```

#### `rgbToHex(rgb: RgbColor): string`

将RGB颜色转换为十六进制格式。

```typescript
ColorUtils.rgbToHex({ r: 255, g: 0, b: 0 }) // '#ff0000'
ColorUtils.rgbToHex({ r: 0, g: 255, b: 0 }) // '#00ff00'
ColorUtils.rgbToHex({ r: 0, g: 0, b: 255 }) // '#0000ff'
```

#### `rgbToHsl(rgb: RgbColor): HslColor`

将RGB颜色转换为HSL格式。

```typescript
ColorUtils.rgbToHsl({ r: 255, g: 0, b: 0 }) // { h: 0, s: 100, l: 50 }
ColorUtils.rgbToHsl({ r: 128, g: 128, b: 128 }) // { h: 0, s: 0, l: 50 }
```

#### `hslToRgb(hsl: HslColor): RgbColor`

将HSL颜色转换为RGB格式。

```typescript
ColorUtils.hslToRgb({ h: 0, s: 100, l: 50 }) // { r: 255, g: 0, b: 0 }
ColorUtils.hslToRgb({ h: 120, s: 100, l: 50 }) // { r: 0, g: 255, b: 0 }
```

#### `lighten(color: string, amount: number): string`

使颜色变亮。

```typescript
ColorUtils.lighten('#ff0000', 0.2) // '#ff6666'
ColorUtils.lighten('#000000', 0.5) // '#808080'
```

#### `darken(color: string, amount: number): string`

使颜色变暗。

```typescript
ColorUtils.darken('#ff0000', 0.2) // '#cc0000'
ColorUtils.darken('#ffffff', 0.5) // '#808080'
```

#### `mix(color1: string, color2: string, weight?: number): string`

混合两种颜色。

```typescript
ColorUtils.mix('#ff0000', '#0000ff') // '#800080' (紫色)
ColorUtils.mix('#ff0000', '#0000ff', 0.3) // '#4d00b3' (偏蓝)
ColorUtils.mix('#ff0000', '#0000ff', 0.7) // '#b3004d' (偏红)
```

#### `getContrast(color1: string, color2: string): number`

计算两种颜色的对比度。

```typescript
ColorUtils.getContrast('#000000', '#ffffff') // 21 (最高对比度)
ColorUtils.getContrast('#ff0000', '#00ff00') // ~2.9
```

#### `isLight(color: string): boolean`

判断颜色是否为浅色。

```typescript
ColorUtils.isLight('#ffffff') // true
ColorUtils.isLight('#000000') // false
ColorUtils.isLight('#ff0000') // false
```

#### `isDark(color: string): boolean`

判断颜色是否为深色。

```typescript
ColorUtils.isDark('#000000') // true
ColorUtils.isDark('#ffffff') // false
ColorUtils.isDark('#ff0000') // true
```

#### `getComplement(color: string): string`

获取颜色的补色。

```typescript
ColorUtils.getComplement('#ff0000') // '#00ffff' (青色)
ColorUtils.getComplement('#00ff00') // '#ff00ff' (洋红)
```

#### `generatePalette(baseColor: string, count: number): string[]`

基于基础颜色生成调色板。

```typescript
ColorUtils.generatePalette('#ff0000', 5)
// ['#ff0000', '#ff4000', '#ff8000', '#ffbf00', '#ffff00']
```

## TreeUtils

树形数据处理工具类，提供树形结构的转换、遍历和操作方法。

### 方法

#### `arrayToTree<T>(items: T[], options?: TreeOptions): TreeNode<T>[]`

将扁平数组转换为树形结构。

```typescript
const flatData = [
  { id: '1', name: 'Root', parentId: null },
  { id: '2', name: 'Child 1', parentId: '1' },
  { id: '3', name: 'Child 2', parentId: '1' },
  { id: '4', name: 'Grandchild', parentId: '2' }
]

const tree = TreeUtils.arrayToTree(flatData)
// 转换为树形结构，包含 children 属性
```

#### `treeToArray<T>(tree: TreeNode<T>[]): T[]`

将树形结构转换为扁平数组。

```typescript
const flatArray = TreeUtils.treeToArray(tree)
// 返回扁平化的数组，移除 children 属性
```

#### `findNode<T>(tree: TreeNode<T>[], predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | null`

在树中查找节点。

```typescript
const foundNode = TreeUtils.findNode(tree, node => node.id === '4')
// 返回匹配的节点或 null
```

#### `filterTree<T>(tree: TreeNode<T>[], predicate: (node: TreeNode<T>) => boolean): TreeNode<T>[]`

过滤树节点。

```typescript
const filteredTree = TreeUtils.filterTree(tree, node => node.name.includes('Child'))
// 返回包含匹配节点及其父节点的树
```

#### `mapTree<T, R>(tree: TreeNode<T>[], mapper: (node: TreeNode<T>) => R): TreeNode<R>[]`

映射树节点。

```typescript
const mappedTree = TreeUtils.mapTree(tree, node => ({
  ...node,
  displayName: `[${node.id}] ${node.name}`
}))
// 返回转换后的树结构
```

#### `getDepth<T>(tree: TreeNode<T>[]): number`

获取树的最大深度。

```typescript
const depth = TreeUtils.getDepth(tree) // 3
```

#### `getNodePath<T>(tree: TreeNode<T>[], nodeId: string, idKey?: string): TreeNode<T>[]`

获取到指定节点的路径。

```typescript
const path = TreeUtils.getNodePath(tree, '4')
// 返回从根节点到目标节点的路径数组
```

## UrlUtils

URL处理工具类，提供URL构建、解析和操作方法。

### 方法

#### `buildUrl(baseUrl: string, params?: Record<string, any>): string`

构建URL，支持查询参数。

```typescript
UrlUtils.buildUrl('https://api.example.com/users')
// 'https://api.example.com/users'

UrlUtils.buildUrl('https://api.example.com/users', { page: 1, limit: 10 })
// 'https://api.example.com/users?page=1&limit=10'
```

#### `parseQuery(queryString: string): Record<string, string | string[]>`

解析查询字符串。

```typescript
UrlUtils.parseQuery('?name=john&age=25&tags=a&tags=b')
// { name: 'john', age: '25', tags: ['a', 'b'] }
```

#### `stringifyQuery(params: Record<string, any>): string`

将对象转换为查询字符串。

```typescript
UrlUtils.stringifyQuery({ name: 'john', age: 25, tags: ['a', 'b'] })
// 'name=john&age=25&tags=a&tags=b'
```

#### `normalize(url: string): string`

规范化URL。

```typescript
UrlUtils.normalize('https://example.com//path/../api/')
// 'https://example.com/api/'
```

#### `isAbsolute(url: string): boolean`

检查URL是否为绝对路径。

```typescript
UrlUtils.isAbsolute('https://example.com') // true
UrlUtils.isAbsolute('/api/users') // false
UrlUtils.isAbsolute('api/users') // false
```

#### `join(...parts: string[]): string`

连接URL片段。

```typescript
UrlUtils.join('https://api.example.com', 'v1', 'users', '123')
// 'https://api.example.com/v1/users/123'
```

#### `getDomain(url: string): string`

提取URL的域名。

```typescript
UrlUtils.getDomain('https://sub.example.com/path') // 'example.com'
UrlUtils.getDomain('https://example.com:8080/api') // 'example.com'
```

#### `getSubdomain(url: string): string | null`

提取URL的子域名。

```typescript
UrlUtils.getSubdomain('https://api.example.com') // 'api'
UrlUtils.getSubdomain('https://example.com') // null
```

#### `isSameDomain(url1: string, url2: string): boolean`

检查两个URL是否属于同一域名。

```typescript
UrlUtils.isSameDomain('https://api.example.com', 'https://www.example.com') // true
UrlUtils.isSameDomain('https://example.com', 'https://other.com') // false
```

## 类型定义

```typescript
interface SlugifyOptions {
  separator?: string
  lowercase?: boolean
  trim?: boolean
}

interface NumberFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

// 颜色相关类型
interface RgbColor {
  r: number
  g: number
  b: number
}

interface HslColor {
  h: number
  s: number
  l: number
}

// 树形数据相关类型
interface TreeNode<T = any> extends Record<string, unknown> {
  id: string
  children?: TreeNode<T>[]
}

interface TreeOptions {
  idKey?: string
  parentIdKey?: string
  childrenKey?: string
  rootValue?: any
}
```

## 最佳实践

1. **性能考虑**: 对于大量数据处理，考虑使用流式处理
2. **类型安全**: 使用 TypeScript 类型定义确保类型安全
3. **错误处理**: 对可能失败的操作进行适当的错误处理
4. **内存管理**: 避免在循环中创建大量临时对象
5. **颜色处理**:
   - 使用 ColorUtils 进行颜色转换时，注意颜色值的有效范围
   - 对比度计算遵循 WCAG 2.0 标准，确保可访问性
6. **树形数据**:
   - 处理大型树结构时，考虑使用懒加载
   - 避免深度过大的树结构，可能导致栈溢出
7. **URL处理**:
   - 始终验证URL的有效性
   - 处理用户输入的URL时要进行安全检查

## 示例应用

查看 [使用示例](/examples/) 了解更多实际应用场景。
