# @ldesign/kit 扩展功能指南

本文档介绍最新添加的扩展功能和高级工具。

## 🆕 新增工具模块

### 1. Promise 工具 (`PromiseUtils`)

强大的异步操作工具集，提供并发控制、重试、超时等功能。

```typescript
import { PromiseUtils } from '@ldesign/kit'

// 并发限制 - 同时最多执行 3 个任务
const results = await PromiseUtils.mapLimit(
  items,
  3,
  async (item) => await processItem(item)
)

// 超时控制
const result = await PromiseUtils.timeout(
  longRunningTask(),
  5000,
  'Operation timed out after 5 seconds'
)

// 重试机制
const data = await PromiseUtils.retry(
  () => fetchData(),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`)
    },
  }
)

// 顺序执行
const results = await PromiseUtils.mapSeries(
  items,
  async (item, index) => await processItem(item)
)

// 批处理
const results = await PromiseUtils.batch(
  items,
  10, // 每批 10 个
  async (batch, batchIndex) => {
    return await processBatch(batch)
  }
)

// 并发批处理
const results = await PromiseUtils.batchConcurrent(
  items,
  10, // 每批 10 个
  3,  // 同时 3 批
  async (batch) => await processBatch(batch)
)

// 可取消的 Promise
const { promise, cancel } = PromiseUtils.cancellable(
  (resolve, reject, onCancel) => {
    const timer = setTimeout(() => resolve('done'), 5000)
    onCancel(() => clearTimeout(timer))
  }
)

// 稍后取消
setTimeout(() => cancel(), 2000)

// 等待条件
await PromiseUtils.waitFor(
  () => server.isReady,
  { timeout: 10000, interval: 100 }
)

// 轮询
const result = await PromiseUtils.poll(
  () => checkStatus(),
  {
    interval: 1000,
    timeout: 30000,
    validate: (status) => status === 'complete',
  }
)

// 去重执行（相同请求只执行一次）
const data1 = PromiseUtils.dedupe('user:123', () => fetchUser(123))
const data2 = PromiseUtils.dedupe('user:123', () => fetchUser(123)) // 使用第一次的结果

// 缓存结果
const cached = await PromiseUtils.memoize(
  'expensive:data',
  () => expensiveOperation(),
  60000 // 缓存 60 秒
)

// Promise 队列
const queue = PromiseUtils.queue()
queue.add(() => task1())
queue.add(() => task2())

// 限流器
const limiter = PromiseUtils.limiter(3) // 同时最多 3 个
await limiter(() => task())

// 信号量
const semaphore = PromiseUtils.semaphore(5)
await semaphore.acquire()
try {
  await criticalSection()
} finally {
  semaphore.release()
}
```

### 2. 正则表达式工具 (`RegexUtils` & `Patterns`)

提供常用正则表达式和验证方法。

```typescript
import { RegexUtils, Patterns } from '@ldesign/kit'

// 使用预定义的正则表达式
console.log(Patterns.email) // 邮箱正则
console.log(Patterns.url)   // URL 正则
console.log(Patterns.ipv4)  // IPv4 正则

// 验证方法
RegexUtils.isEmail('user@example.com')        // true
RegexUtils.isUrl('https://example.com')       // true
RegexUtils.isPhoneZh('13800138000')          // true (中国手机号)
RegexUtils.isIdCardZh('110101199001011234')  // true (中国身份证)
RegexUtils.isStrongPassword('MyPass123!')    // true

// 提取内容
const emails = RegexUtils.extractEmails(text)
const urls = RegexUtils.extractUrls(text)
const numbers = RegexUtils.extractNumbers(text)
const chinese = RegexUtils.extractChinese(text)

// 清理内容
const cleaned = RegexUtils.stripHtmlTags(html)
const noEmoji = RegexUtils.stripEmoji(text)
const emojis = RegexUtils.extractEmoji(text)

// 替换所有匹配
const result = RegexUtils.replaceAll(
  text,
  /\d+/,
  (match) => Number.parseInt(match) * 2
)

// 高亮匹配
const highlighted = RegexUtils.highlight(
  'Hello World',
  /world/i,
  'mark'
) // 'Hello <mark>World</mark>'

// 模糊匹配
const fuzzyRegex = RegexUtils.fuzzy('hello')
fuzzyRegex.test('h e l l o') // true

// 验证文件扩展名
RegexUtils.hasExtension('file.pdf', ['pdf', 'doc']) // true

// 验证域名
RegexUtils.isDomain('example.com')           // true
RegexUtils.isSubdomain('api.example.com', 'example.com') // true

// 验证其他格式
RegexUtils.isSemver('1.2.3')                 // true
RegexUtils.isMACAddress('00:1B:44:11:3A:B7') // true
RegexUtils.isISBN('978-0-596-52068-7')       // true
RegexUtils.isUUID('550e8400-e29b-41d4-a716-446655440000') // true
```

### 3. 格式化工具 (`FormatUtils`)

提供各种数据格式化方法。

```typescript
import { FormatUtils } from '@ldesign/kit'

// 文件大小
FormatUtils.fileSize(1024 * 1024)           // '1.00 MB'
FormatUtils.fileSize(1500, 0)               // '1 KB'

// 数字格式化
FormatUtils.number(1234567.89, {
  locale: 'en-US',
  precision: 2,
  prefix: '$',
  suffix: ' USD',
})                                           // '$1,234,567.89 USD'

// 货币
FormatUtils.currency(1234.56, 'USD')        // '$1,234.56'
FormatUtils.currency(1234.56, 'EUR')        // '€1,234.56'
FormatUtils.currency(1234.56, 'CNY', { locale: 'zh-CN' }) // '¥1,234.56'

// 百分比
FormatUtils.percentage(0.1234, 2)           // '12.34%'

// 时间持续
FormatUtils.duration(90000)                 // '1m 30s'
FormatUtils.duration(90000, 'long')         // '1 minute, 30 seconds'
FormatUtils.duration(3665000)               // '1h 1m 5s'

// 日期
FormatUtils.date(new Date(), 'YYYY-MM-DD')  // '2024-01-15'
FormatUtils.date(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 相对时间
FormatUtils.relativeTime(yesterday)         // '1 day ago'
FormatUtils.relativeTime(lastWeek)          // '7 days ago'

// 电话号码
FormatUtils.phone('1234567890')             // '(123) 456-7890'

// 信用卡
FormatUtils.creditCard('1234567890123456')  // '1234 5678 9012 3456'

// 列表
FormatUtils.list(['apple', 'banana', 'orange']) // 'apple, banana, and orange'
FormatUtils.list(['A', 'B'], 'disjunction')     // 'A or B'

// 名称
FormatUtils.name('John', 'Doe', 'first-last')       // 'John Doe'
FormatUtils.name('John', 'Doe', 'last-comma-first') // 'Doe, John'

// 地址
FormatUtils.address({
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'USA',
})                                          // '123 Main St, New York, NY, 10001, USA'

// 坐标
FormatUtils.coordinates(40.7128, -74.0060) // '40.712800° N, 74.006000° W'

// 缩写数字
FormatUtils.abbreviateNumber(1234)         // '1.2K'
FormatUtils.abbreviateNumber(1234567)      // '1.2M'

// 序数
FormatUtils.ordinal(1)                     // '1st'
FormatUtils.ordinal(2)                     // '2nd'
FormatUtils.ordinal(21)                    // '21st'

// 罗马数字
FormatUtils.roman(123)                     // 'CXXIII'

// 进制转换
FormatUtils.binary(255)                    // '11111111'
FormatUtils.hex(255)                       // 'FF'

// 分数
FormatUtils.fraction(0.75)                 // '3/4'
FormatUtils.fraction(1.5)                  // '1 1/2'

// JSON 和 YAML
FormatUtils.json(obj, 2)                   // 美化的 JSON
FormatUtils.yaml(obj)                      // YAML 格式

// 表格（ASCII）
FormatUtils.table(data, ['ID', 'Name', 'Email'])

// Markdown
FormatUtils.codeBlock(code, 'typescript')
FormatUtils.markdownLink('GitHub', 'https://github.com')
```

### 4. 装饰器工具

提供常用的方法装饰器。

```typescript
import {
  memoize,
  debounce,
  throttle,
  retry,
  timeout,
  log,
  measure,
  validate,
  deprecated,
  singleton,
  bind,
  lock,
  rateLimit,
} from '@ldesign/kit'

class MyService {
  // 缓存结果
  @memoize({ ttl: 60000 })
  async fetchData(id: number) {
    return await api.get(`/data/${id}`)
  }

  // 防抖 - 300ms 内多次调用只执行最后一次
  @debounce(300)
  handleSearch(query: string) {
    this.performSearch(query)
  }

  // 节流 - 1000ms 内只执行一次
  @throttle(1000)
  handleScroll() {
    this.updatePosition()
  }

  // 重试
  @retry({ maxAttempts: 3, delay: 1000, backoff: true })
  async riskyOperation() {
    return await unreliableAPI()
  }

  // 超时
  @timeout(5000, 'Operation timeout')
  async slowOperation() {
    return await verySlowAPI()
  }

  // 日志
  @log({ level: 'debug', logArgs: true, logResult: true })
  processData(data: any) {
    return transform(data)
  }

  // 性能监控
  @measure({ label: 'ExpensiveOp', logThreshold: 1000 })
  expensiveOperation() {
    // 只有超过 1000ms 才会记录
  }

  // 验证参数
  @validate([
    (id) => typeof id === 'number' || 'ID must be a number',
    (name) => name.length > 0 || 'Name cannot be empty',
  ])
  createUser(id: number, name: string) {
    // ...
  }

  // 弃用警告
  @deprecated('Use newMethod instead', 'newMethod')
  oldMethod() {
    // ...
  }

  // 异步锁 - 同时只能有一个实例在执行
  @lock()
  async criticalSection() {
    // ...
  }

  // 速率限制
  @rateLimit({ maxCalls: 10, windowMs: 60000 })
  async apiCall() {
    // 每分钟最多 10 次
  }
}

// 单例类
@singleton
class ConfigManager {
  // 永远只有一个实例
}

// 绑定 this
class Component {
  name = 'MyComponent'

  @bind
  handleClick() {
    console.log(this.name) // this 始终正确
  }
}
```

## 🎯 实用场景

### 场景1: 批量处理大量数据

```typescript
import { PromiseUtils } from '@ldesign/kit'

// 处理 10000 个项目，每批 100 个，同时 5 批
const results = await PromiseUtils.batchConcurrent(
  items,
  100,  // 批次大小
  5,    // 并发数
  async (batch) => {
    return await Promise.all(batch.map(item => processItem(item)))
  }
)
```

### 场景2: API 请求重试和超时

```typescript
import { PromiseUtils } from '@ldesign/kit'

class APIClient {
  @timeout(10000)
  @retry({ maxAttempts: 3, delay: 1000, backoff: true })
  async fetchData(endpoint: string) {
    const response = await fetch(endpoint)
    return response.json()
  }
}
```

### 场景3: 表单验证

```typescript
import { RegexUtils } from '@ldesign/kit'

function validateForm(data: any) {
  const errors: string[] = []

  if (!RegexUtils.isEmail(data.email)) {
    errors.push('Invalid email address')
  }

  if (!RegexUtils.isPhoneZh(data.phone)) {
    errors.push('Invalid phone number')
  }

  if (!RegexUtils.isStrongPassword(data.password)) {
    errors.push('Password must contain uppercase, lowercase, number and special character')
  }

  return errors
}
```

### 场景4: 数据格式化展示

```typescript
import { FormatUtils } from '@ldesign/kit'

// 用户资料卡
function renderUserProfile(user: User) {
  return {
    name: FormatUtils.name(user.firstName, user.lastName),
    phone: FormatUtils.phone(user.phone),
    joinedAt: FormatUtils.relativeTime(user.createdAt),
    balance: FormatUtils.currency(user.balance, 'USD'),
  }
}

// 文件列表
function renderFileList(files: File[]) {
  return files.map(file => ({
    name: file.name,
    size: FormatUtils.fileSize(file.size),
    modified: FormatUtils.relativeTime(file.modifiedAt),
  }))
}
```

### 场景5: 搜索高亮

```typescript
import { RegexUtils } from '@ldesign/kit'

function searchAndHighlight(text: string, query: string) {
  const regex = RegexUtils.fuzzy(query)
  return RegexUtils.highlight(text, regex, 'mark')
}

// 使用
const result = searchAndHighlight('Hello World', 'helo')
// 返回: '<mark>H</mark><mark>e</mark>l<mark>l</mark><mark>o</mark> W<mark>o</mark>rld'
```

### 场景6: 缓存优化

```typescript
import { memoize } from '@ldesign/kit'

class DataService {
  @memoize({ ttl: 300000 }) // 缓存 5 分钟
  async getUserProfile(userId: number) {
    return await db.users.findOne({ id: userId })
  }

  @memoize({ 
    ttl: 60000,
    key: (params) => JSON.stringify(params) 
  })
  async searchUsers(params: SearchParams) {
    return await db.users.search(params)
  }
}
```

## 📊 性能对比

### Promise 并发控制

```typescript
// ❌ 不好：一次性发起 1000 个请求
const bad = await Promise.all(
  items.map(item => api.get(`/item/${item.id}`))
)

// ✅ 好：控制并发数为 10
const good = await PromiseUtils.mapLimit(
  items,
  10,
  async (item) => await api.get(`/item/${item.id}`)
)
```

### 缓存装饰器

```typescript
// ❌ 不好：每次都查询数据库
class BadService {
  async getUser(id: number) {
    return await db.users.findOne({ id })
  }
}

// ✅ 好：使用缓存
class GoodService {
  @memoize({ ttl: 60000 })
  async getUser(id: number) {
    return await db.users.findOne({ id })
  }
}
```

## 🔗 相关文档

- [新功能指南](./NEW_FEATURES.md)
- [优化总结](./OPTIMIZATION_SUMMARY.md)
- [主文档](../README.md)

## 💡 最佳实践

1. **使用 Promise 并发控制** - 避免一次性发起过多请求
2. **使用装饰器简化代码** - 让代码更清晰、可维护
3. **使用正则验证** - 统一的验证逻辑
4. **使用格式化工具** - 一致的数据展示
5. **使用重试机制** - 提高系统健壮性
6. **使用缓存** - 减少重复计算和请求

## 🎉 总结

这些扩展工具大大增强了 `@ldesign/kit` 的功能：

- **PromiseUtils** - 强大的异步控制
- **RegexUtils** - 完整的正则验证
- **FormatUtils** - 丰富的格式化方法
- **装饰器** - 优雅的功能增强

所有工具都经过精心设计，类型安全，易于使用！




