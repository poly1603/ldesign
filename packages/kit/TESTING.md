# 测试指南

本文档介绍如何运行和编写 @ldesign/kit 的测试。

## 🧪 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 只运行单元测试
npm run test:unit

# 只运行集成测试
npm run test:integration

# CI 模式运行测试
npm run test:run
```

### 测试结构

```
tests/
├── setup.ts                 # 测试环境设置
├── utils/                   # 工具模块测试
│   ├── string-utils.test.ts
│   ├── number-utils.test.ts
│   └── ...
├── filesystem/              # 文件系统模块测试
│   ├── filesystem.test.ts
│   └── file-watcher.test.ts
├── cache/                   # 缓存模块测试
│   ├── memory-cache.test.ts
│   ├── file-cache.test.ts
│   └── cache-manager.test.ts
├── events/                  # 事件系统测试
│   ├── event-emitter.test.ts
│   ├── event-bus.test.ts
│   └── typed-event-emitter.test.ts
├── validation/              # 验证系统测试
│   ├── validator.test.ts
│   ├── form-validator.test.ts
│   └── validation-rules.test.ts
├── logger/                  # 日志系统测试
│   └── logger.test.ts
└── integration/             # 集成测试
    └── full-stack.test.ts
```

## ✍️ 编写测试

### 测试模板

```typescript
/**
 * 模块名称 测试
 */

import { ModuleName } from '../../src/module-name'

describe('ModuleName', () => {
  let instance: ModuleName

  beforeEach(() => {
    instance = new ModuleName()
  })

  afterEach(() => {
    // 清理资源
  })

  describe('方法名', () => {
    it('应该执行预期行为', () => {
      // 准备
      const input = 'test-input'

      // 执行
      const result = instance.method(input)

      // 断言
      expect(result).toBe('expected-output')
    })

    it('应该处理边界情况', () => {
      expect(() => instance.method(null)).toThrow()
    })
  })
})
```

### 异步测试

```typescript
describe('异步操作', () => {
  it('应该处理Promise', async () => {
    const result = await asyncFunction()
    expect(result).toBeDefined()
  })

  it('应该处理错误', async () => {
    await expect(failingAsyncFunction()).rejects.toThrow('Expected error')
  })
})
```

### 模拟和间谍

```typescript
describe('模拟测试', () => {
  it('应该模拟依赖', () => {
    const mockDependency = jest.fn().mockReturnValue('mocked-value')
    const instance = new ClassWithDependency(mockDependency)

    const result = instance.usesDependency()

    expect(mockDependency).toHaveBeenCalledWith('expected-arg')
    expect(result).toBe('mocked-value')
  })

  it('应该监视方法调用', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()

    functionThatLogs('test message')

    expect(spy).toHaveBeenCalledWith('test message')
    spy.mockRestore()
  })
})
```

### 文件系统测试

```typescript
describe('文件操作', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir()
  })

  afterEach(() => {
    global.testUtils.cleanupTempDir(tempDir)
  })

  it('应该创建文件', async () => {
    const filePath = join(tempDir, 'test.txt')

    await FileSystem.writeFile(filePath, 'test content')

    expect(await FileSystem.exists(filePath)).toBe(true)
  })
})
```

### 事件测试

```typescript
describe('事件处理', () => {
  it('应该发出事件', () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()

    emitter.on('test', listener)
    emitter.emit('test', 'data')

    expect(listener).toHaveBeenCalledWith('data')
  })

  it('应该等待事件', async () => {
    const emitter = new EventEmitter()

    setTimeout(() => emitter.emit('delayed', 'result'), 50)

    const result = await emitter.waitFor('delayed')
    expect(result).toEqual(['result'])
  })
})
```

## 🔧 测试工具

### 全局测试工具

测试环境提供了以下全局工具：

```typescript
// 创建临时目录
const tempDir = global.testUtils.createTempDir()

// 清理临时目录
global.testUtils.cleanupTempDir(tempDir)

// 等待指定时间
await global.testUtils.sleep(1000)

// 创建模拟数据
const user = global.testUtils.createMockData('user')
const users = global.testUtils.createMockData('user', 5)
```

### Jest 匹配器

```typescript
// 基本匹配
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// 数字匹配
expect(number).toBeGreaterThan(3)
expect(number).toBeGreaterThanOrEqual(3.5)
expect(number).toBeLessThan(5)
expect(number).toBeCloseTo(4.2, 1)

// 字符串匹配
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')

// 数组匹配
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toEqual(expect.arrayContaining([item1, item2]))

// 对象匹配
expect(object).toHaveProperty('key')
expect(object).toHaveProperty('key', value)
expect(object).toMatchObject({ key: value })

// 函数匹配
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(arg1, arg2)
expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveReturnedWith(value)

// 异常匹配
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('error message')
expect(async () => await asyncFn()).rejects.toThrow()
```

## 📊 覆盖率报告

运行 `npm run test:coverage` 后，覆盖率报告将生成在 `coverage/` 目录中：

- `coverage/lcov-report/index.html` - HTML 格式的详细报告
- `coverage/lcov.info` - LCOV 格式，用于 CI/CD 集成
- `coverage/coverage-final.json` - JSON 格式的原始数据

### 覆盖率目标

- **语句覆盖率**: >= 90%
- **分支覆盖率**: >= 85%
- **函数覆盖率**: >= 90%
- **行覆盖率**: >= 90%

## 🚀 持续集成

### GitHub Actions 配置示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16, 18, 20]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 🐛 调试测试

### VS Code 调试配置

在 `.vscode/launch.json` 中添加：

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "disableOptimisticBPs": true,
  "windows": {
    "program": "${workspaceFolder}/node_modules/jest/bin/jest"
  }
}
```

### 调试单个测试

```bash
# 运行特定测试文件
npm test -- string-utils.test.ts

# 运行特定测试用例
npm test -- --testNamePattern="应该转换为驼峰命名"

# 详细输出
npm test -- --verbose

# 监听特定文件
npm test -- --watch string-utils.test.ts
```

## 📝 最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 使用 "应该..." 的格式
- 包含测试的条件和预期结果

```typescript
// ✅ 好的命名
it('应该在输入为空字符串时返回空字符串', () => {})
it('应该在用户不存在时抛出NotFoundError', () => {})

// ❌ 不好的命名
it('测试字符串', () => {})
it('错误情况', () => {})
```

### 2. 测试结构

使用 AAA 模式（Arrange, Act, Assert）：

```typescript
it('应该计算正确的总和', () => {
  // Arrange - 准备
  const calculator = new Calculator()
  const a = 5
  const b = 3

  // Act - 执行
  const result = calculator.add(a, b)

  // Assert - 断言
  expect(result).toBe(8)
})
```

### 3. 测试隔离

- 每个测试应该独立运行
- 使用 `beforeEach` 和 `afterEach` 进行设置和清理
- 避免测试之间的依赖

### 4. 模拟外部依赖

```typescript
// 模拟整个模块
jest.mock('fs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}))

// 模拟特定函数
const mockReadFile = jest.fn()
jest.mock('fs', () => ({ readFile: mockReadFile }))
```

### 5. 测试边界情况

确保测试覆盖：

- 正常情况
- 边界值（空值、最大值、最小值）
- 错误情况
- 异常输入

## 🔍 故障排除

### 常见问题

1. **测试超时**

   ```typescript
   // 增加超时时间
   it('长时间运行的测试', async () => {
     // 测试代码
   }, 30000) // 30秒超时
   ```

2. **异步测试未等待**

   ```typescript
   // ❌ 错误
   it('异步测试', () => {
     asyncFunction().then(result => {
       expect(result).toBe('expected')
     })
   })

   // ✅ 正确
   it('异步测试', async () => {
     const result = await asyncFunction()
     expect(result).toBe('expected')
   })
   ```

3. **模拟未正确重置**

   ```typescript
   afterEach(() => {
     jest.clearAllMocks()
   })
   ```

4. **文件路径问题**
   ```typescript
   // 使用绝对路径
   import { join } from 'path'
   const filePath = join(__dirname, 'test-file.txt')
   ```

## 📚 参考资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Node.js 测试最佳实践](https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-overall-quality-practices)
