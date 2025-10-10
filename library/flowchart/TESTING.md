# 测试指南

本文档说明如何测试 ApprovalFlow 项目。

## 快速测试（无需安装）

### 方法 1: 直接查看代码

所有测试文件都在 `__tests__/` 目录：

```bash
__tests__/
├── ApprovalFlowEditor.test.ts   # 编辑器核心功能测试
└── setup.ts                      # 测试环境配置
```

你可以直接查看测试代码了解功能。

### 方法 2: 手动测试

创建一个简单的 HTML 文件进行手动测试：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ApprovalFlow Manual Test</title>
  <style>
    #editor {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <h1>ApprovalFlow 手动测试</h1>
  <div id="editor"></div>

  <script type="module">
    // 注意：需要先 npm install
    import { ApprovalFlowEditor } from './src/index.ts';

    const editor = new ApprovalFlowEditor({
      container: '#editor',
      width: '100%',
      height: '600px',
    });

    // 测试：设置数据
    editor.setData({
      nodes: [
        { id: '1', type: 'start', name: '开始' },
        { id: '2', type: 'approval', name: '审批', approvers: [{ id: '1', name: '张三' }] },
        { id: '3', type: 'end', name: '结束' },
      ],
      edges: [
        { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
        { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
      ],
    });

    // 测试：获取数据
    console.log('数据:', editor.getData());

    // 测试：验证
    console.log('验证结果:', editor.validate());

    // 测试：事件
    editor.on('node:click', (node) => {
      console.log('节点点击:', node);
    });

    console.log('✅ 所有测试通过！');
  </script>
</body>
</html>
```

## 自动化测试

### 前提条件

```bash
# 安装依赖
npm install --legacy-peer-deps
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式（文件改变时自动运行）
npm run test:watch

# UI 模式（图形界面）
npm run test:ui
```

### 测试覆盖率

```bash
# 生成覆盖率报告
npm run test -- --coverage
```

覆盖率报告将在 `coverage/` 目录生成。

## 测试内容

### 1. 初始化测试

测试编辑器是否能正确初始化：

```typescript
describe('初始化', () => {
  it('应该成功创建编辑器实例', () => {
    const editor = new ApprovalFlowEditor({
      container: document.createElement('div'),
      width: 800,
      height: 600,
    });
    expect(editor).toBeDefined();
  });
});
```

### 2. 数据操作测试

测试数据的设置和获取：

```typescript
describe('数据操作', () => {
  it('应该能够设置数据', () => {
    editor.setData(testData);
    const data = editor.getData();
    expect(data.nodes.length).toBe(3);
  });
});
```

### 3. 节点操作测试

测试节点的增删改：

```typescript
describe('节点操作', () => {
  it('应该能够添加节点', () => {
    const nodeId = editor.addNode({
      type: 'approval',
      name: '新节点',
    });
    expect(nodeId).toBeDefined();
  });
});
```

### 4. 验证测试

测试流程验证功能：

```typescript
describe('验证', () => {
  it('应该验证缺少开始节点', () => {
    editor.setData({ nodes: [], edges: [] });
    const result = editor.validate();
    expect(result.valid).toBe(false);
  });
});
```

### 5. 事件测试

测试事件监听：

```typescript
describe('事件', () => {
  it('应该能够监听节点点击', () => {
    const handler = vi.fn();
    editor.on('node:click', handler);
    // 触发点击
    expect(handler).toHaveBeenCalled();
  });
});
```

## 浏览器测试

### 启动测试服务器

```bash
# 启动 Vite 开发服务器
npm run dev
```

然后在浏览器中打开 http://localhost:5173，手动测试各项功能。

### 测试项目清单

- [ ] 编辑器正常渲染
- [ ] 可以添加各种节点
- [ ] 可以连接节点
- [ ] 可以拖拽节点
- [ ] 可以缩放画布
- [ ] 可以删除节点
- [ ] 验证功能正常
- [ ] 事件正常触发
- [ ] 只读模式正常

## E2E 测试（可选）

如果需要端到端测试，可以使用 Playwright：

```bash
# 安装 Playwright
npm install -D @playwright/test

# 运行 E2E 测试
npx playwright test
```

E2E 测试示例：

```typescript
import { test, expect } from '@playwright/test';

test('编辑器加载', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 检查编辑器是否渲染
  const editor = await page.locator('#editor');
  await expect(editor).toBeVisible();

  // 检查节点是否显示
  const nodes = await page.locator('.lf-node');
  await expect(nodes).toHaveCount(3);
});
```

## 测试问题排查

### 问题 1: jsdom 安装失败

如果 jsdom 安装失败，可以使用替代方案：

```bash
# 使用 happy-dom 替代
npm install -D happy-dom

# 修改 vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
});
```

### 问题 2: 测试超时

增加超时时间：

```typescript
describe('慢速测试', () => {
  it('应该成功', { timeout: 10000 }, async () => {
    // 测试代码
  });
});
```

### 问题 3: 内存泄漏

确保测试后清理：

```typescript
afterEach(() => {
  if (editor) {
    editor.destroy();
  }
});
```

## 性能测试

### 测试大规模流程图

```typescript
it('应该能处理大规模流程图', () => {
  const nodes = [];
  const edges = [];

  // 生成 1000 个节点
  for (let i = 0; i < 1000; i++) {
    nodes.push({
      id: `node-${i}`,
      type: 'approval',
      name: `节点${i}`,
    });
  }

  const startTime = Date.now();
  editor.setData({ nodes, edges });
  const endTime = Date.now();

  expect(endTime - startTime).toBeLessThan(1000); // 应在1秒内完成
});
```

### 测试渲染性能

```typescript
it('应该快速渲染', () => {
  const fps = [];

  // 记录帧率
  const measure = () => {
    const start = performance.now();
    editor.render();
    const end = performance.now();
    fps.push(1000 / (end - start));
  };

  // 测试 60 帧
  for (let i = 0; i < 60; i++) {
    measure();
  }

  const avgFps = fps.reduce((a, b) => a + b) / fps.length;
  expect(avgFps).toBeGreaterThan(30); // 平均帧率应大于30
});
```

## 持续集成

### GitHub Actions

创建 `.github/workflows/test.yml`:

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
          node-version: 18
      - run: npm install --legacy-peer-deps
      - run: npm run test
```

## 测试最佳实践

1. **编写独立的测试** - 每个测试应该独立运行
2. **使用描述性名称** - 测试名称应清楚说明测试内容
3. **测试边界情况** - 包括空值、极值、错误输入
4. **清理资源** - 测试后清理创建的资源
5. **避免随机性** - 使用固定的测试数据
6. **保持简单** - 每个测试只测一个功能点

## 快速命令

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch

# UI 模式
npm run test:ui

# 覆盖率
npm test -- --coverage

# 单个文件
npm test -- ApprovalFlowEditor.test.ts
```

## 获取帮助

- 📋 [Vitest 文档](https://vitest.dev/)
- 💬 [GitHub Discussions](https://github.com/ldesign/approval-flow/discussions)
- 📧 Email: support@ldesign.com
