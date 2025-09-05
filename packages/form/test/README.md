# Vue Form Layout 测试文档

## 📋 概述

本目录包含 Vue Form Layout 库的完整测试套件，涵盖单元测试、集成测试、边界情况测试等多个层面。

## 🧪 测试结构

### 测试文件

```
test/
├── basic.test.ts           # 基础功能测试
├── integration.test.ts     # 集成测试  
├── edge-cases.test.ts      # 边界情况和错误处理测试
├── setup.ts               # 测试环境配置
├── run-tests.ts           # 测试运行脚本
└── README.md              # 本文档
```

### 测试覆盖范围

#### 1. 基础功能测试 (`basic.test.ts`)

**工具函数测试**
- `deepClone` - 深拷贝功能
- `deepMerge` - 深度合并对象
- `getValueByPath` / `setValueByPath` - 路径操作
- `validateFieldValue` - 字段验证
- `isEmpty` - 空值判断
- `getCurrentBreakpoint` - 响应式断点
- `generateClassName` - CSS类名生成
- `filterVisibleFields` - 字段过滤

**Hook功能测试**
- `useFormLayout` 初始化和配置
- 字段值的设置和获取
- 嵌套字段处理
- 表单验证（同步/异步）
- 表单重置
- 展开收起动画

**组件测试**
- `FormLayout` 组件渲染
- `FormItem` 组件功能
- CSS类名应用
- 事件触发
- Options模式支持

#### 2. 集成测试 (`integration.test.ts`)

**完整表单流程**
- 用户注册表单端到端测试
- 异步验证和提交处理
- 表单状态管理

**响应式布局**
- 不同屏幕尺寸适配
- 字段跨列布局
- 断点切换效果

**动态字段**
- 条件显示隐藏
- 运行时添加删除字段
- 字段配置更新

**字段联动**
- 省市联动选择
- 依赖字段验证
- 数据联动更新

**复杂场景**
- 嵌套表单数据结构
- 表单数组处理
- 大量字段性能测试

#### 3. 边界情况测试 (`edge-cases.test.ts`)

**异常输入处理**
- 空配置/无效配置处理
- 循环引用对象
- 大型数据结构
- 特殊字符和路径

**边界值测试**
- 极端数值处理
- 极端日期处理
- 极大数组和深层嵌套对象

**错误恢复机制**
- 验证错误恢复
- 异步验证超时处理
- 组件销毁清理

**内存泄漏检测**
- 事件监听器清理
- 定时器清理
- 大型数据结构释放

**兼容性测试**
- 旧版本浏览器API支持
- 不同Vue版本兼容
- SSR环境支持
- 多种数据类型处理

## 🚀 运行测试

### 基本命令

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 使用测试脚本

```bash
# 运行特定测试类型
ts-node test/run-tests.ts basic          # 基础功能测试
ts-node test/run-tests.ts integration    # 集成测试
ts-node test/run-tests.ts edge          # 边界情况测试

# 不同运行模式
ts-node test/run-tests.ts watch         # 监听模式
ts-node test/run-tests.ts coverage      # 覆盖率报告
ts-node test/run-tests.ts ui            # UI界面
ts-node test/run-tests.ts verbose       # 详细模式
ts-node test/run-tests.ts parallel      # 并发运行

# 查看帮助
ts-node test/run-tests.ts help
```

## 📊 测试覆盖率

本项目设定的覆盖率目标：

- **分支覆盖率**: ≥ 80%
- **函数覆盖率**: ≥ 80%
- **行覆盖率**: ≥ 80%
- **语句覆盖率**: ≥ 80%

覆盖率报告生成位置：
- 文本报告: 控制台输出
- JSON报告: `test-results/results.json`
- HTML报告: `test-results/index.html`

## 🛠️ 测试工具和框架

- **测试框架**: [Vitest](https://vitest.dev/)
- **Vue测试工具**: [@vue/test-utils](https://vue-test-utils.vuejs.org/)
- **测试环境**: jsdom
- **模拟工具**: Vitest Mock
- **覆盖率**: V8 Coverage

## 📝 编写测试的最佳实践

### 1. 测试命名

```typescript
// ✅ 好的测试命名
describe('useFormLayout Hook', () => {
  it('应该正确设置和获取字段值', () => {
    // 测试实现
  })
})

// ❌ 不好的测试命名
describe('form tests', () => {
  it('test form', () => {
    // 测试实现
  })
})
```

### 2. 测试结构

```typescript
it('应该执行某个功能', () => {
  // Arrange (准备)
  const { setFieldValue, getFieldValue } = useFormLayout({
    fields: [{ name: 'test', label: '测试' }]
  })

  // Act (执行)
  setFieldValue('test', 'value')

  // Assert (断言)
  expect(getFieldValue('test')).toBe('value')
})
```

### 3. 模拟和清理

```typescript
describe('测试组', () => {
  beforeEach(() => {
    // 每个测试前的准备工作
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 每个测试后的清理工作
    vi.restoreAllMocks()
  })
})
```

### 4. 异步测试

```typescript
it('应该处理异步操作', async () => {
  const result = await validateField('test')
  expect(result).toBe(true)
})
```

## 🐛 调试测试

### 1. 使用VS Code调试

在 `.vscode/launch.json` 中添加配置：

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### 2. 在测试中添加断点

```typescript
it('调试测试', () => {
  const data = someFunction()
  debugger; // 断点
  expect(data).toBeDefined()
})
```

### 3. 使用 console.log

```typescript
it('查看测试数据', () => {
  const result = performAction()
  console.log('测试结果:', result)
  expect(result).toBeTruthy()
})
```

## 📈 持续集成

测试在CI/CD流程中的集成：

```yaml
# .github/workflows/test.yml
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
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
```

## 🤝 贡献指南

添加新测试时请遵循以下原则：

1. **测试覆盖新功能**: 每个新功能都应该有对应的测试
2. **测试边界情况**: 不仅测试正常情况，也要测试异常情况
3. **保持测试独立**: 测试之间不应该相互依赖
4. **及时更新文档**: 添加新测试类型时更新此文档
5. **性能考虑**: 避免编写耗时过长的测试

## 📚 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://vue-test-utils.vuejs.org/)
- [Vue 3 测试指南](https://vuejs.org/guide/scaling-up/testing.html)
- [JavaScript 测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
