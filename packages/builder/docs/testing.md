# 测试策略和框架

## 概述

@ldesign/builder 采用多层次的测试策略，确保代码质量和功能稳定性。

## 测试架构

### 测试层次

1. **单元测试 (Unit Tests)**
   - 测试单个函数、类和模块
   - 快速执行，高覆盖率
   - 位置：`src/**/*.test.ts`

2. **集成测试 (Integration Tests)**
   - 测试模块间的交互
   - 验证组件协作
   - 位置：`src/__tests__/integration/`

3. **性能测试 (Performance Tests)**
   - 基准测试和性能回归检测
   - 内存泄漏检测
   - 位置：`src/__tests__/performance/`

4. **端到端测试 (E2E Tests)**
   - 完整用户场景测试
   - CLI 命令测试
   - 位置：`src/__tests__/e2e/`

### 测试工具

- **测试框架**: Vitest
- **断言库**: Vitest 内置
- **模拟库**: Vitest vi
- **覆盖率**: V8 Coverage
- **性能监控**: 自定义 PerformanceMonitor

## 测试配置

### Vitest 配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
})
```

### 测试设置

全局测试设置在 `src/__tests__/setup.ts` 中配置：

- 临时目录管理
- 模拟适配器
- 清理函数
- 测试工具函数

## 测试分类

### 核心模块测试

#### LibraryBuilder 测试
```typescript
describe('LibraryBuilder', () => {
  it('should create instance successfully', () => {
    const builder = new LibraryBuilder()
    expect(builder).toBeInstanceOf(LibraryBuilder)
  })
})
```

#### 适配器测试
```typescript
describe('RollupAdapter', () => {
  it('should transform config correctly', () => {
    // 测试配置转换逻辑
  })
})
```

#### 策略测试
```typescript
describe('TypeScriptStrategy', () => {
  it('should apply TypeScript configuration', () => {
    // 测试策略应用逻辑
  })
})
```

### 集成测试

#### 构建流程测试
```typescript
describe('Build Flow Integration', () => {
  it('should complete build process', async () => {
    // 测试完整构建流程
  })
})
```

### 性能测试

#### 内存使用测试
```typescript
describe('Memory Usage', () => {
  it('should track memory usage during operations', async () => {
    // 测试内存使用情况
  })
})
```

#### 时间测量测试
```typescript
describe('Timing Accuracy', () => {
  it('should measure execution time accurately', async () => {
    // 测试时间测量精度
  })
})
```

### 端到端测试

#### CLI 测试
```typescript
describe('CLI End-to-End Tests', () => {
  it('should build TypeScript library successfully', async () => {
    // 测试 CLI 构建命令
  })
})
```

## 测试工具函数

### 临时目录管理
```typescript
// 创建临时测试目录
const tempDir = await createTempDir('test-project-')

// 创建测试项目结构
await createTestProject(tempDir, 'typescript')
```

### 模拟适配器
```typescript
// 创建模拟适配器
const mockAdapter = createMockAdapter('rollup')
```

### 断言工具
```typescript
// 文件存在断言
await assertions.fileExists('dist/index.js')

// 文件内容断言
await assertions.fileContains('dist/index.js', 'export')
```

## 运行测试

### 基本命令

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test src/__tests__/core/library-builder.test.ts

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch
```

### 测试脚本

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run src/**/*.test.ts",
    "test:integration": "vitest run src/__tests__/integration/",
    "test:e2e": "vitest run src/__tests__/e2e/",
    "test:performance": "vitest run src/__tests__/performance/"
  }
}
```

## 测试最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 遵循 "should [expected behavior] when [condition]" 格式
- 使用嵌套的 describe 块组织测试

### 2. 测试隔离

- 每个测试应该独立运行
- 使用 beforeEach/afterEach 进行清理
- 避免测试间的依赖关系

### 3. 模拟和存根

- 模拟外部依赖（文件系统、网络等）
- 使用依赖注入便于测试
- 保持模拟的简单和可预测

### 4. 断言

- 使用具体的断言而不是通用的
- 测试边界条件和错误情况
- 验证副作用和状态变化

### 5. 性能测试

- 设置合理的性能阈值
- 监控内存使用和执行时间
- 检测性能回归

## 持续集成

### GitHub Actions 配置

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

### 覆盖率要求

- 行覆盖率: ≥ 80%
- 分支覆盖率: ≥ 80%
- 函数覆盖率: ≥ 80%
- 语句覆盖率: ≥ 80%

## 调试测试

### VS Code 配置

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--reporter=verbose"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### 调试技巧

- 使用 `console.log` 进行简单调试
- 使用 VS Code 断点调试复杂逻辑
- 利用 Vitest UI 进行可视化调试
- 使用 `test.only` 运行特定测试

## 测试数据管理

### 测试夹具

```typescript
// 测试数据文件
export const TEST_CONFIGS = {
  typescript: {
    input: 'src/index.ts',
    libraryType: LibraryType.TYPESCRIPT
  },
  vue3: {
    input: 'src/index.ts',
    libraryType: LibraryType.VUE3
  }
}
```

### 快照测试

```typescript
it('should generate correct config', () => {
  const config = generateConfig(options)
  expect(config).toMatchSnapshot()
})
```

## 总结

完善的测试策略确保了 @ldesign/builder 的质量和稳定性：

1. **多层次测试**覆盖了从单元到端到端的各个层面
2. **自动化测试**集成到 CI/CD 流程中
3. **性能监控**防止性能回归
4. **工具支持**提供了丰富的测试工具和断言
5. **最佳实践**指导团队编写高质量的测试代码

通过这套测试框架，我们能够：
- 快速发现和修复问题
- 确保代码质量
- 支持重构和功能扩展
- 提供可靠的用户体验
