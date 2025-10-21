# @ldesign/kit 新功能指南

本文档介绍了最新添加的功能和工具模块。

## 📦 新增模块

### 1. JSON 工具 (`JsonUtils`)

提供安全的 JSON 解析、序列化、深度克隆、对象操作等功能。

```typescript
import { JsonUtils } from '@ldesign/kit'

// 安全解析（不会抛出异常）
const data = JsonUtils.safeParse('{"name":"John"}', { 
  defaultValue: {} 
})

// 美化输出
const pretty = JsonUtils.stringify(data, { 
  pretty: true, 
  sortKeys: true 
})

// 深度克隆
const cloned = JsonUtils.deepClone(data)

// 深度合并
const merged = JsonUtils.deepMerge(obj1, obj2, obj3)

// 获取/设置嵌套属性
const name = JsonUtils.get(data, 'user.profile.name', 'Unknown')
JsonUtils.set(data, 'user.profile.age', 25)

// 扁平化和反扁平化
const flat = JsonUtils.flatten({ user: { name: 'John', age: 30 } })
// => { 'user.name': 'John', 'user.age': 30 }

const unflat = JsonUtils.unflatten(flat)
// => { user: { name: 'John', age: 30 } }

// 比较对象
const isEqual = JsonUtils.equals(obj1, obj2)

// 获取对象差异
const diff = JsonUtils.diff(oldObj, newObj)

// 文件操作
const config = await JsonUtils.parseFile('./config.json')
await JsonUtils.writeFile('./output.json', data, { pretty: true })
```

### 2. Base64 工具 (`Base64Utils`)

提供 Base64 编码、解码、URL安全编码等功能。

```typescript
import { Base64Utils } from '@ldesign/kit'

// 基础编解码
const encoded = Base64Utils.encode('Hello World')
const decoded = Base64Utils.decode(encoded)

// URL 安全编码
const urlSafe = Base64Utils.encodeUrlSafe('Hello World')
const urlDecoded = Base64Utils.decodeUrlSafe(urlSafe)

// 编码对象
const tokenData = Base64Utils.encodeObject({ userId: 123, role: 'admin' })
const decoded = Base64Utils.decodeObject(tokenData)

// 文件操作
const fileData = await Base64Utils.encodeFile('./image.png')
await Base64Utils.decodeToFile(fileData, './output.png')

// Data URL
const dataUrl = Base64Utils.encodeDataUrl(buffer, 'image/png')
const { data, mimeType } = Base64Utils.decodeDataUrl(dataUrl)

// 验证
const isValid = Base64Utils.isValid(encoded)

// 批量操作
const encodedArray = Base64Utils.encodeBatch(['a', 'b', 'c'])
```

### 3. 环境变量工具 (`EnvUtils`)

提供环境变量读取、验证、类型转换等功能。

```typescript
import { EnvUtils } from '@ldesign/kit'

// 类型安全的读取
const port = EnvUtils.getNumber('PORT', 3000)
const debug = EnvUtils.getBoolean('DEBUG', false)
const hosts = EnvUtils.getArray('ALLOWED_HOSTS', ['localhost'])
const config = EnvUtils.getJson('CONFIG', {})

// 验证必需的环境变量
EnvUtils.require(['API_KEY', 'DATABASE_URL'])

// 加载 .env 文件
await EnvUtils.load('.env')
await EnvUtils.load('.env.local', true) // 覆盖现有变量

// 模式验证
const { valid, errors } = EnvUtils.validate({
  PORT: {
    type: 'number',
    required: true,
    default: 3000,
  },
  NODE_ENV: {
    type: 'string',
    choices: ['development', 'production', 'test'],
    default: 'development',
  },
  API_KEY: {
    type: 'string',
    required: true,
    pattern: /^[a-zA-Z0-9]{32}$/,
  },
})

// 环境检测
if (EnvUtils.isDevelopment()) {
  console.log('Running in development mode')
}

// 保存环境变量
await EnvUtils.save('.env.local', {
  API_KEY: 'xxx',
  DATABASE_URL: 'postgres://...',
})

// 快照和恢复
const snapshot = EnvUtils.snapshot(['API_KEY', 'DATABASE_URL'])
// ... 修改环境变量
EnvUtils.restore(snapshot)
```

### 4. 数据结构工具

提供队列、栈、双端队列、优先队列、链表、树、LRU缓存等数据结构。

```typescript
import { 
  Queue, 
  Stack, 
  Deque, 
  PriorityQueue,
  LinkedList,
  TreeNode,
  BinaryTreeNode,
  LRUCache 
} from '@ldesign/kit'

// 队列
const queue = new Queue<number>()
queue.enqueue(1)
queue.enqueue(2)
queue.dequeue() // 1

// 栈
const stack = new Stack<string>()
stack.push('hello')
stack.push('world')
stack.pop() // 'world'

// 双端队列
const deque = new Deque<number>()
deque.addFront(1)
deque.addRear(2)
deque.removeFront() // 1

// 优先队列
const pq = new PriorityQueue<string>()
pq.enqueue('low priority', 1)
pq.enqueue('high priority', 10)
pq.dequeue() // 'high priority'

// 链表
const list = new LinkedList<number>()
list.append(1)
list.append(2)
list.prepend(0)
list.reverse()

// LRU 缓存
const cache = new LRUCache<string, any>(100)
cache.set('key', { data: 'value' })
const value = cache.get('key')
```

### 5. 测试工具

提供 Mock、Spy、Stub、测试数据生成等测试辅助功能。

```typescript
import { 
  SpyManager, 
  StubManager, 
  MockBuilder,
  TestDataGenerator,
  TimeUtils 
} from '@ldesign/kit'

// Spy - 监视函数调用
const spy = SpyManager.spy(myFunction)
const result = spy.function(1, 2, 3)

console.log(spy.called) // true
console.log(spy.callCount) // 1
console.log(spy.firstCall.args) // [1, 2, 3]
spy.reset()

// Spy - 监视对象方法
const objSpy = SpyManager.spyOn(myObject, 'method')

// Stub - 模拟函数返回值
const stub = StubManager.stub()
stub.returns(42)
console.log(stub.call()) // 42

// Stub - 按顺序返回不同值
const seqStub = StubManager.stub()
seqStub.returnsSequence(1, 2, 3)
console.log(seqStub.call()) // 1
console.log(seqStub.call()) // 2
console.log(seqStub.call()) // 3

// Stub - 抛出错误
const errorStub = StubManager.stubThrows(new Error('Test error'))

// Mock 对象
const mockUser = MockBuilder.create({
  id: 1,
  name: 'John',
  email: 'john@example.com',
})

// 测试数据生成
const randomEmail = TestDataGenerator.randomEmail()
const randomDate = TestDataGenerator.randomDate()
const randomUuid = TestDataGenerator.randomUuid()

const users = TestDataGenerator.randomArray(() => ({
  id: TestDataGenerator.randomNumber(),
  name: TestDataGenerator.randomString(10),
  email: TestDataGenerator.randomEmail(),
}), 5)

// 时间控制
TimeUtils.freeze(new Date('2024-01-01'))
console.log(Date.now()) // 固定时间

TimeUtils.advance(1000) // 前进1秒
TimeUtils.restore() // 恢复真实时间

// 等待条件
await TimeUtils.waitFor(() => someCondition === true, {
  timeout: 5000,
  interval: 100,
})
```

### 6. 安全工具

提供加密、哈希、Token生成等安全功能。

```typescript
import { SecurityUtils, HashUtils, TokenUtils } from '@ldesign/kit'

// 加密和解密
const encrypted = SecurityUtils.encrypt('sensitive data', 'secret-key')
const decrypted = SecurityUtils.decrypt(encrypted, 'secret-key')

// 生成随机字符串
const random = SecurityUtils.randomString(32, 'hex')
const uuid = SecurityUtils.generateUuid()
const randomInt = SecurityUtils.randomInt(1, 100)

// HMAC
const hmac = SecurityUtils.hmac('data', 'secret', 'sha256')
const valid = SecurityUtils.verifyHmac('data', 'secret', hmac, 'sha256')

// 密码强度
const strength = SecurityUtils.passwordStrength('MyPass123!') // 0-100
const password = SecurityUtils.generatePassword(16, {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
})

// 哈希
const sha256 = HashUtils.sha256('data')
const md5 = HashUtils.md5('data')

// 密码哈希（PBKDF2）
const hashed = await HashUtils.hashPassword('password123')
const valid = await HashUtils.verifyPassword('password123', hashed)

// 密码哈希（Scrypt）
const scryptHash = await HashUtils.hashPasswordScrypt('password123')
const scryptValid = await HashUtils.verifyPasswordScrypt('password123', scryptHash)

// 文件哈希
const fileHash = await HashUtils.hashFile('./file.txt', 'sha256')

// Token 生成
const token = TokenUtils.generateToken(32)
const apiKey = TokenUtils.generateApiKey('sk', 32)
const sessionId = TokenUtils.generateSessionId()
const csrfToken = TokenUtils.generateCsrfToken()
const otp = TokenUtils.generateOtp(6)

// JWT 风格 Token
const jwtToken = TokenUtils.generateJwtLike(
  { userId: 123, role: 'admin' },
  'secret',
  { expiresIn: 3600000 } // 1小时
)

const payload = TokenUtils.verifyJwtLike(jwtToken, 'secret')
if (payload) {
  console.log('User ID:', payload.userId)
}
```

### 7. 错误处理工具

提供统一的错误处理机制和错误码系统。

```typescript
import { 
  ErrorUtils, 
  AppError, 
  ValidationError,
  NotFoundError,
  ErrorCode,
  errorBoundary,
  retryDecorator 
} from '@ldesign/kit'

// 创建应用错误
throw new AppError('Something went wrong', ErrorCode.INTERNAL_ERROR, {
  userId: 123,
  action: 'updateProfile',
})

// 使用特定错误类
throw new ValidationError('Invalid email format', { email: 'invalid' })
throw new NotFoundError('User not found', { userId: 123 })

// 注册错误处理器
ErrorUtils.registerHandler(async (error) => {
  console.error('Error occurred:', error)
  // 发送到日志服务
  await logService.error(error)
})

// 处理错误
try {
  throw new Error('Something failed')
} catch (error) {
  await ErrorUtils.handle(error)
}

// 包装异步函数
const safeFunction = ErrorUtils.wrap(async (id: number) => {
  return await fetchUser(id)
})

// 安全执行
const result = await ErrorUtils.safe(async () => {
  return await riskyOperation()
})

if (result.success) {
  console.log(result.value)
} else {
  console.error(result.error)
}

// 重试
const data = await ErrorUtils.retry(
  async () => await fetchData(),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`)
    },
  }
)

// 断言
ErrorUtils.assert(userId > 0, 'Invalid user ID', ErrorCode.INVALID_INPUT)
ErrorUtils.assertDefined(user, 'User is required')

// 装饰器
class UserService {
  @errorBoundary()
  async getUser(id: number) {
    return await fetchUser(id)
  }

  @retryDecorator({ maxAttempts: 3 })
  async fetchData() {
    return await fetch('/api/data')
  }
}
```

## 🔧 配置优化

### tsup 配置

- ✅ 启用类型定义生成
- ✅ 添加完整的 Node.js 内置模块外部化
- ✅ 优化构建钩子
- ✅ 改进源码映射

### TypeScript 配置

- ✅ 启用严格模式
- ✅ 配置路径别名
- ✅ 优化编译选项

## 📝 使用建议

### 1. 错误处理最佳实践

```typescript
// 在应用启动时注册全局错误处理器
ErrorUtils.registerHandler(async (error) => {
  // 记录错误
  logger.error(error)
  
  // 发送到错误追踪服务
  if (error instanceof AppError && error.level === ErrorLevel.CRITICAL) {
    await errorTrackingService.capture(error)
  }
})

// 在 API 路由中使用
app.post('/api/users', async (req, res) => {
  const result = await ErrorUtils.safe(async () => {
    return await userService.create(req.body)
  })
  
  if (result.success) {
    res.json(result.value)
  } else {
    const status = result.error.code === ErrorCode.VALIDATION_ERROR ? 400 : 500
    res.status(status).json({
      error: result.error.message,
      code: result.error.code,
    })
  }
})
```

### 2. 环境变量管理

```typescript
// 在应用启动时加载和验证环境变量
await EnvUtils.load('.env')

const { valid, errors } = EnvUtils.validate({
  PORT: { type: 'number', required: true, default: 3000 },
  DATABASE_URL: { type: 'string', required: true },
  API_KEY: { 
    type: 'string', 
    required: true,
    pattern: /^[a-zA-Z0-9]{32}$/,
    validate: (value) => value.length === 32 || 'API key must be 32 characters',
  },
})

if (!valid) {
  console.error('Invalid environment variables:', errors)
  process.exit(1)
}
```

### 3. 缓存策略

```typescript
// 使用 LRU 缓存进行内存缓存
const userCache = new LRUCache<number, User>(1000)

async function getUser(id: number): Promise<User> {
  // 检查缓存
  const cached = userCache.get(id)
  if (cached) {
    return cached
  }
  
  // 从数据库获取
  const user = await db.users.findById(id)
  
  // 缓存结果
  userCache.set(id, user)
  
  return user
}
```

### 4. 安全实践

```typescript
// 密码处理
const hashedPassword = await HashUtils.hashPassword(plainPassword)
await db.users.create({
  email,
  password: hashedPassword,
})

// 验证密码
const valid = await HashUtils.verifyPassword(inputPassword, user.password)

// Token 管理
const accessToken = TokenUtils.generateJwtLike(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: 900000 } // 15分钟
)

const refreshToken = TokenUtils.generateRefreshToken()
await db.refreshTokens.create({
  userId: user.id,
  token: await HashUtils.sha256(refreshToken),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天
})
```

## 🎯 迁移指南

如果你正在使用旧版本，以下是迁移建议：

### 替换自定义 JSON 解析

```typescript
// 旧代码
function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// 新代码
import { JsonUtils } from '@ldesign/kit'
const data = JsonUtils.safeParse(text)
```

### 替换环境变量读取

```typescript
// 旧代码
const port = parseInt(process.env.PORT || '3000', 10)
const debug = process.env.DEBUG === 'true'

// 新代码
import { EnvUtils } from '@ldesign/kit'
const port = EnvUtils.getNumber('PORT', 3000)
const debug = EnvUtils.getBoolean('DEBUG', false)
```

### 替换错误处理

```typescript
// 旧代码
class CustomError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

// 新代码
import { AppError, ErrorCode } from '@ldesign/kit'
throw new AppError(message, ErrorCode.VALIDATION_ERROR)
```

## 🔗 相关资源

- [完整 API 文档](./README.md)
- [示例代码](./examples/)
- [更新日志](./CHANGELOG.md)





