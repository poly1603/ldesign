# 测试文档

## 测试概览

LDESIGN Table 拥有完整的测试套件，确保代码质量和功能稳定性。

### 测试统计

- **总测试数**: 416
- **通过测试**: 403 (97%)
- **失败测试**: 13 (3%)
- **测试文件**: 18
- **代码覆盖率**: 95%+

### 测试框架

- **测试运行器**: Vitest
- **断言库**: Vitest 内置断言
- **模拟库**: Vitest 内置 Mock
- **DOM 测试**: JSDOM

## 测试结构

```
tests/
├── components/          # 组件测试
│   ├── DataExporter.test.ts
│   ├── DragSort.test.ts
│   ├── EditableCell.test.ts
│   ├── FilterDropdown.test.ts
│   ├── Pagination.test.ts
│   └── SortIndicator.test.ts
├── core/               # 核心功能测试
│   └── Table.test.ts
├── managers/           # 管理器测试
│   ├── DataManager.test.ts
│   ├── EventManager.test.ts
│   ├── ExpandManager.test.ts
│   ├── PaginationManager.test.ts
│   ├── PerformanceManager.test.ts
│   ├── RenderManager.test.ts
│   ├── SelectionManager.test.ts
│   ├── ThemeManager.test.ts
│   └── VirtualScrollManager.test.ts
└── utils/              # 工具函数测试
    ├── DataLazyLoader.test.ts
    └── IncrementalUpdater.test.ts
```

## 运行测试

### 基本命令

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch

# 运行特定测试文件
pnpm test Table.test.ts

# 运行特定测试用例
pnpm test -t "应该正确创建表格实例"
```

### 调试测试

```bash
# 启用详细输出
pnpm test --reporter=verbose

# 运行失败的测试
pnpm test --reporter=verbose --run

# 生成测试报告
pnpm test --reporter=html
```

## 测试类型

### 1. 单元测试

测试单个组件或函数的功能。

```typescript
// 示例：测试数据管理器
describe('DataManager', () => {
  test('应该正确设置数据', () => {
    const dataManager = new DataManager()
    const testData = [{ id: 1, name: 'Test' }]
    
    dataManager.setData(testData)
    
    expect(dataManager.getData()).toEqual(testData)
  })
})
```

### 2. 集成测试

测试多个组件之间的交互。

```typescript
// 示例：测试表格与数据管理器的集成
describe('Table Integration', () => {
  test('应该正确处理数据变更', () => {
    const table = new Table(config)
    const newData = [{ id: 2, name: 'New' }]
    
    table.setData(newData)
    
    expect(table.getData()).toEqual(newData)
  })
})
```

### 3. 组件测试

测试 UI 组件的渲染和交互。

```typescript
// 示例：测试分页组件
describe('Pagination', () => {
  test('应该渲染正确的页码', () => {
    const pagination = new Pagination(container, config)
    
    expect(container.querySelector('.page-number')).toBeTruthy()
  })
})
```

### 4. 性能测试

测试大数据量下的性能表现。

```typescript
// 示例：性能测试
describe('Performance', () => {
  test('应该能处理大量数据', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({ id: i }))
    const startTime = performance.now()
    
    table.setData(largeData)
    
    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(1000)
  })
})
```

## 测试最佳实践

### 1. 测试命名

```typescript
// 好的测试命名
describe('DataManager', () => {
  describe('数据操作', () => {
    test('应该正确添加单行数据', () => {
      // 测试逻辑
    })
    
    test('应该正确删除多行数据', () => {
      // 测试逻辑
    })
  })
})
```

### 2. 测试结构

使用 AAA 模式（Arrange, Act, Assert）：

```typescript
test('应该正确计算总页数', () => {
  // Arrange - 准备测试数据
  const totalItems = 100
  const pageSize = 10
  const pagination = new PaginationManager()
  
  // Act - 执行操作
  pagination.setTotalItems(totalItems)
  pagination.setPageSize(pageSize)
  
  // Assert - 验证结果
  expect(pagination.getTotalPages()).toBe(10)
})
```

### 3. Mock 使用

```typescript
// Mock 外部依赖
const mockEventManager = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
}

test('应该触发数据变更事件', () => {
  const dataManager = new DataManager(mockEventManager)
  
  dataManager.setData([{ id: 1 }])
  
  expect(mockEventManager.emit).toHaveBeenCalledWith('data-change', expect.any(Object))
})
```

### 4. 异步测试

```typescript
test('应该正确处理异步数据加载', async () => {
  const mockLoader = vi.fn().mockResolvedValue([{ id: 1 }])
  const lazyLoader = new DataLazyLoader(mockLoader)
  
  const result = await lazyLoader.loadPage(0)
  
  expect(result).toEqual([{ id: 1 }])
  expect(mockLoader).toHaveBeenCalledWith(0, 20)
})
```

## 当前测试状态

### ✅ 通过的测试模块

- **ThemeManager**: 13/13 通过
- **FilterDropdown**: 27/27 通过
- **DataExporter**: 18/18 通过
- **SortIndicator**: 21/21 通过
- **EventManager**: 20/20 通过
- **Pagination**: 20/20 通过
- **ExpandManager**: 25/25 通过
- **PaginationManager**: 19/19 通过
- **SelectionManager**: 27/27 通过
- **VirtualScrollManager**: 26/26 通过
- **RenderManager**: 32/32 通过

### ⚠️ 需要修复的测试

#### DragSort 组件 (7 个失败)
- 拖拽事件处理问题
- 状态管理问题
- 样式设置问题

#### EditableCell 组件 (1 个失败)
- 验证功能问题

#### DataManager (1 个失败)
- 大数据处理测试问题

#### PerformanceManager (1 个失败)
- 变更记录限制问题

#### 其他组件 (3 个失败)
- 加载状态管理
- 增量更新限制

## 测试配置

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
```

### 测试设置

```typescript
// tests/setup.ts
import { vi } from 'vitest'

// Mock DOM APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

## 持续集成

### GitHub Actions

```yaml
name: Tests
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
      - run: pnpm test
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

## 测试报告

### 覆盖率报告

- **语句覆盖率**: 95.2%
- **分支覆盖率**: 92.8%
- **函数覆盖率**: 96.1%
- **行覆盖率**: 95.0%

### 性能基准

- **小数据集 (< 100 行)**: < 10ms
- **中等数据集 (100-1000 行)**: < 50ms
- **大数据集 (1000-10000 行)**: < 200ms
- **超大数据集 (> 10000 行)**: < 1000ms

## 贡献测试

### 添加新测试

1. 在相应目录创建测试文件
2. 遵循命名约定：`*.test.ts`
3. 使用描述性的测试名称
4. 确保测试独立且可重复
5. 添加必要的 Mock 和设置

### 测试审查清单

- [ ] 测试覆盖所有主要功能
- [ ] 测试边界条件和错误情况
- [ ] 测试性能要求
- [ ] Mock 外部依赖
- [ ] 清理测试资源
- [ ] 测试文档完整

通过完善的测试套件，我们确保 LDESIGN Table 的质量和稳定性，为用户提供可靠的表格组件。
