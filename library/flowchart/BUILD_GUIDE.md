# 构建指南

本指南说明如何构建和测试 ApprovalFlow 项目。

## 快速开始（无需完整安装）

如果你只想快速查看代码或文档，可以跳过依赖安装：

### 1. 查看源代码

所有源代码都在 `src/` 目录下，可以直接查看：

```bash
# 核心编辑器
src/core/ApprovalFlowEditor.ts

# 节点类型
src/nodes/StartNode.ts
src/nodes/ApprovalNode.ts
src/nodes/ConditionNode.ts
src/nodes/ParallelNode.ts
src/nodes/CCNode.ts
src/nodes/EndNode.ts

# 框架适配器
src/vue.ts
src/react.tsx
```

### 2. 查看文档

所有文档都是 Markdown 格式，可以直接在 GitHub 或编辑器中查看：

```bash
# 主文档
docs/index.md
docs/guide/getting-started.md
docs/api/editor.md
README.md
```

## 完整构建（需要安装依赖）

### 环境准备

1. **安装 Node.js**
   - 版本: >= 16.0.0
   - 下载: https://nodejs.org/

2. **验证安装**
   ```bash
   node --version  # 应该显示 v16.0.0 或更高
   npm --version   # 应该显示 7.0.0 或更高
   ```

### 安装依赖

#### 选项 1: 使用 npm（推荐新手）

```bash
# 清理缓存
npm cache clean --force

# 删除旧的依赖（如果有）
rm -rf node_modules package-lock.json

# 安装依赖
npm install --legacy-peer-deps
```

**注意**: `--legacy-peer-deps` 是必须的，因为项目同时支持 Vue 和 React。

#### 选项 2: 使用 pnpm（推荐高级用户）

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install
```

#### 选项 3: 分步安装（如果上述方法失败）

```bash
# 只安装核心依赖
npm install @logicflow/core @logicflow/extension --legacy-peer-deps

# 安装构建工具
npm install vite typescript --save-dev --legacy-peer-deps

# 安装其他开发依赖
npm install @types/node --save-dev --legacy-peer-deps
```

### 构建项目

```bash
# 完整构建（库 + 类型定义）
npm run build
```

构建成功后，`dist/` 目录将包含：

```
dist/
├── index.js          # ES 模块主入口
├── index.cjs         # CommonJS 模块主入口
├── index.d.ts        # TypeScript 类型定义
├── vue.js            # Vue 适配器 (ES)
├── vue.cjs           # Vue 适配器 (CJS)
├── vue.d.ts          # Vue 类型定义
├── react.js          # React 适配器 (ES)
├── react.cjs         # React 适配器 (CJS)
├── react.d.ts        # React 类型定义
└── style.css         # 样式文件
```

### 构建问题排查

#### 问题 1: 找不到 @logicflow/core

```bash
# 手动安装
npm install @logicflow/core @logicflow/extension --legacy-peer-deps
```

#### 问题 2: TypeScript 错误

```bash
# 只构建 JS，跳过类型检查
npm run build -- --mode production
```

#### 问题 3: 内存不足

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## 运行文档

### 最简单的方法（无需安装全部依赖）

```bash
# 只安装 VitePress
cd docs
npm init -y
npm install vitepress --legacy-peer-deps

# 启动文档
npx vitepress dev .
```

### 标准方法

```bash
# 从项目根目录
npm run docs:dev
```

访问 http://localhost:5173 查看文档。

### 构建文档

```bash
npm run docs:build
```

构建产物在 `docs/.vitepress/dist/`。

## 运行示例

### Vue 示例

```bash
cd examples/vue-demo

# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000。

### 示例说明

示例项目展示了：
- ✅ 如何使用 ApprovalFlow 组件
- ✅ 如何添加各种类型的节点
- ✅ 如何监听事件
- ✅ 如何验证流程
- ✅ 如何导出数据

## 运行测试

### 前提条件

测试需要额外的依赖（vitest、jsdom），可能安装较慢。

```bash
# 安装测试依赖
npm install vitest jsdom @vitest/ui --save-dev --legacy-peer-deps
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test:watch

# UI 模式
npm run test:ui
```

### 跳过测试

如果测试安装失败，可以跳过测试，直接使用库：

```bash
# 只构建，不运行测试
npm run build
```

## 不使用 npm 的替代方案

### 使用 CDN（无需构建）

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css">
</head>
<body>
  <div id="editor"></div>

  <script type="module">
    // 直接导入源代码（开发环境）
    import { ApprovalFlowEditor } from './src/index.ts';

    const editor = new ApprovalFlowEditor({
      container: '#editor',
      width: '100%',
      height: '600px',
    });
  </script>
</body>
</html>
```

### 使用 Deno（无需 npm）

```typescript
// 使用 Deno 运行
import { ApprovalFlowEditor } from "https://esm.sh/@ldesign/approval-flow";
```

## 验证构建结果

### 检查文件是否生成

```bash
ls -la dist/
```

应该看到所有的 `.js`、`.cjs` 和 `.d.ts` 文件。

### 测试构建产物

```javascript
// test-build.js
const { ApprovalFlowEditor } = require('./dist/index.cjs');

console.log('✅ CommonJS 导入成功');
console.log('ApprovalFlowEditor:', ApprovalFlowEditor);
```

```bash
node test-build.js
```

## 常见问题

### Q: 为什么安装这么慢？

A: 主要原因：
1. LogicFlow 依赖较多
2. jsdom 测试依赖体积大
3. 网络速度

**解决方案**:
- 使用国内镜像: `npm config set registry https://registry.npmmirror.com`
- 跳过可选依赖: `npm install --legacy-peer-deps --no-optional`
- 使用 pnpm: 更快的包管理器

### Q: 可以不安装依赖直接使用吗？

A: 可以！你可以：
1. 直接查看和学习源代码
2. 复制代码到你的项目
3. 使用 CDN 版本
4. 等待发布后从 npm 安装

### Q: 构建失败怎么办？

A: 请按顺序检查：
1. Node.js 版本 >= 16
2. 清理缓存: `npm cache clean --force`
3. 删除 node_modules: `rm -rf node_modules`
4. 重新安装: `npm install --legacy-peer-deps`
5. 只构建 JS: `npx vite build`

### Q: 文档可以离线查看吗？

A: 可以！所有文档都是 Markdown 格式：
- 主文档: `docs/` 目录
- API 文档: `docs/api/` 目录
- 指南: `docs/guide/` 目录
- README: `README.md`

## 发布到 npm

```bash
# 1. 登录 npm
npm login

# 2. 更新版本号
npm version patch  # 或 minor, major

# 3. 构建
npm run build

# 4. 发布
npm publish
```

## 获取帮助

如果遇到问题：

1. 📖 查看 [DEVELOPMENT.md](./DEVELOPMENT.md)
2. 📋 提交 [Issue](https://github.com/ldesign/approval-flow/issues)
3. 💬 加入 [讨论](https://github.com/ldesign/approval-flow/discussions)
4. 📧 发送邮件: support@ldesign.com

## 快速命令参考

```bash
# 安装
npm install --legacy-peer-deps

# 构建
npm run build

# 文档
npm run docs:dev

# 测试
npm run test

# 示例
cd examples/vue-demo && npm install --legacy-peer-deps && npm run dev
```
