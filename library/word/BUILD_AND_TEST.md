# 构建和测试指南

本文档说明如何构建所有包并测试功能。

## 🔧 准备工作

### 1. 环境要求

- Node.js >= 16
- npm >= 7

### 2. 项目结构

```
word-viewer/
├── packages/
│   ├── core/       ← 核心包（必须先构建）
│   ├── vue/        ← Vue 组件包
│   ├── react/      ← React 组件包
│   └── lit/        ← Lit 组件包
└── examples/       ← 示例和测试
```

## 📦 构建包

### 方法 1: 构建所有包（推荐）

```bash
# 在根目录执行
npm run build
```

### 方法 2: 单独构建

**必须按顺序构建！**

```bash
# 1. 先构建核心包
cd packages/core
npm run build

# 2. 返回根目录
cd ../..

# 3. 构建 Vue 包（可选）
cd packages/vue
npm run build

# 4. 构建 React 包（可选）
cd packages/react
npm run build

# 5. 构建 Lit 包（可选）
cd packages/lit
npm run build
```

## ✅ 验证构建

### 检查核心包

```bash
cd packages/core
ls dist/
```

应该看到：
- `index.esm.js`
- `index.cjs.js`
- `index.umd.js`
- `index.d.ts`

### 快速测试

打开 `examples/simple-test.html` 在浏览器中：

```bash
# Windows
start examples/simple-test.html

# Mac/Linux
open examples/simple-test.html
```

## 🧪 测试功能

### 1. 使用简单测试页面

1. 在浏览器中打开 `examples/simple-test.html`
2. 选择一个 .docx 文件
3. 测试缩放和其他功能

### 2. 测试核心 API

创建测试文件 `test.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <div id="viewer" style="height: 600px;"></div>
  
  <script type="module">
    import { WordViewer } from './packages/core/dist/index.esm.js';
    
    const viewer = new WordViewer('#viewer');
    console.log('WordViewer initialized:', viewer);
    
    viewer.on('loaded', () => {
      console.log('Document loaded successfully!');
    });
  </script>
</body>
</html>
```

### 3. 测试 UMD 格式

```html
<!DOCTYPE html>
<html>
<head>
  <title>UMD Test</title>
</head>
<body>
  <div id="viewer" style="height: 600px;"></div>
  
  <script src="./packages/core/dist/index.umd.js"></script>
  <script>
    const viewer = new WordViewer.WordViewer('#viewer');
    console.log('UMD WordViewer:', viewer);
  </script>
</body>
</html>
```

## 🐛 常见问题

### Q1: 构建失败 - 找不到模块

**问题**: `Cannot find module '@word-viewer/core'`

**解决**:
1. 确保先构建了核心包
2. 检查 `packages/core/dist/` 目录是否存在

```bash
cd packages/core
npm run build
```

### Q2: TypeScript 错误

**问题**: TypeScript 类型错误

**解决**:
1. 检查 tsconfig.json 配置
2. 确保所有依赖已安装

```bash
npm install
```

### Q3: Vue 包构建失败

**问题**: `Expression expected` 错误

**解决**:
1. 确保安装了 postcss 相关依赖
2. 检查 rollup.config.js 配置

### Q4: 浏览器报错找不到模块

**问题**: 浏览器控制台显示模块加载失败

**解决**:
1. 使用 HTTP 服务器而不是直接打开文件
2. 使用 Live Server 或 http-server

```bash
# 使用 npx
npx http-server

# 或安装 http-server
npm install -g http-server
http-server
```

## 🚀 开发模式

### 监听核心包变化

```bash
cd packages/core
npm run dev
```

这将监听文件变化并自动重新构建。

### 同时开发多个包

在不同的终端窗口中：

```bash
# 终端 1
cd packages/core
npm run dev

# 终端 2  
cd packages/vue
npm run dev
```

## 📊 构建输出

### 核心包 (@word-viewer/core)

```
packages/core/dist/
├── index.esm.js         # ES Module
├── index.cjs.js         # CommonJS
├── index.umd.js         # UMD (浏览器)
└── index.d.ts           # TypeScript 类型
```

### 框架包 (Vue/React/Lit)

```
packages/[framework]/dist/
├── index.esm.js         # ES Module
├── index.cjs.js         # CommonJS
└── index.d.ts           # TypeScript 类型
```

## ✨ 最佳实践

### 1. 开发流程

```bash
# 1. 修改核心包代码
cd packages/core/src

# 2. 监听模式重新构建
npm run dev

# 3. 在浏览器中刷新测试页面
```

### 2. 发布前检查

```bash
# 清理并重新构建所有包
npm run clean
npm run build

# 测试所有示例
# 打开 examples/ 中的所有 HTML 文件
```

### 3. 版本管理

```bash
# 更新版本号
cd packages/core
npm version patch  # 或 minor, major

# 构建
npm run build

# 发布（如果需要）
npm publish
```

## 🎯 测试清单

在发布或提交前，确保：

- [ ] 核心包构建无错误
- [ ] 所有框架包构建无错误
- [ ] 简单测试页面能正常加载
- [ ] 能成功加载 .docx 文件
- [ ] 缩放功能正常工作
- [ ] 事件系统正常触发
- [ ] 没有浏览器控制台错误
- [ ] TypeScript 类型定义正确

## 📝 日志

### 已知问题

1. ~~useMathMLPolyfill 选项错误~~ (已修复)
2. ~~workspace 协议不支持~~ (已改为版本引用)

### 待办事项

- [ ] 添加自动化测试
- [ ] 创建 CI/CD 流程
- [ ] 添加性能测试

---

**提示**: 如果遇到问题，请查看浏览器控制台和构建输出的详细错误信息。


