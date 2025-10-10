# 如何运行项目

本文档提供详细的步骤说明，确保示例和文档能正常启动。

---

## 📋 前提条件

- Node.js >= 16.0.0
- npm >= 7.0.0

---

## 🚀 方式一：运行 Vue 示例（推荐）

Vue 示例已配置为直接使用源代码，无需构建主项目。

### 步骤 1: 进入示例目录

```bash
cd examples/vue-demo
```

### 步骤 2: 安装依赖

```bash
npm install --legacy-peer-deps
```

**重要**: 必须使用 `--legacy-peer-deps` 参数！

### 步骤 3: 启动开发服务器

```bash
npm run dev
```

### 步骤 4: 访问

打开浏览器访问: http://localhost:3000

---

## 📚 方式二：运行文档

文档使用 VitePress，可以独立运行。

### 方法 A: 从项目根目录运行

```bash
# 1. 安装根目录依赖
npm install --legacy-peer-deps

# 2. 启动文档
npm run docs:dev
```

访问: http://localhost:5173

### 方法 B: 只安装文档依赖（更快）

```bash
# 1. 进入文档目录
cd docs

# 2. 初始化并安装 VitePress
npm init -y
npm install vitepress vue --legacy-peer-deps

# 3. 启动文档
npx vitepress dev .
```

访问: http://localhost:5173

---

## 🔨 方式三：构建后使用

如果你想构建整个项目然后使用：

### 步骤 1: 安装主项目依赖

```bash
# 在项目根目录
npm install --legacy-peer-deps
```

### 步骤 2: 构建主项目

```bash
npm run build
```

构建产物将在 `dist/` 目录。

### 步骤 3: 使用构建产物

如果使用构建产物，需要修改示例的导入路径回到包导入。

---

## ❗ 常见问题

### 问题 1: 找不到 `@ldesign/approval-flow`

**原因**: 包还没有发布到 npm，需要使用源代码。

**解决**: 示例已配置为直接使用源代码，按照"方式一"操作即可。

### 问题 2: `Failed to resolve import "@ldesign/approval-flow/style.css"`

**原因**: 示例尝试导入不存在的构建文件。

**解决**: 已修复，现在直接引用源代码的样式文件 `../../../src/styles/index.css`。

### 问题 3: npm install 很慢

**解决方案**:

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 然后安装
npm install --legacy-peer-deps
```

### 问题 4: 为什么必须用 `--legacy-peer-deps`？

**原因**: 项目同时支持 Vue 和 React，它们的 peer dependencies 可能冲突。

**解决**: 始终使用 `--legacy-peer-deps` 参数安装。

### 问题 5: TypeScript 报错

**原因**: 某些类型定义可能需要构建后才有。

**解决**: 示例项目的 TypeScript 配置已优化，应该不会有问题。如果有，可以：

```bash
# 在示例目录运行
npm run build
```

### 问题 6: 端口被占用

**Vue 示例默认端口**: 3000
**文档默认端口**: 5173

如果端口被占用：

```bash
# 修改端口 - Vue 示例
# 编辑 examples/vue-demo/vite.config.ts
# 将 port: 3000 改为其他端口

# 修改端口 - 文档
npx vitepress dev docs --port 8080
```

---

## 🎯 快速测试

### 测试 Vue 示例是否正常

1. 进入目录: `cd examples/vue-demo`
2. 安装依赖: `npm install --legacy-peer-deps`
3. 启动: `npm run dev`
4. 访问: http://localhost:3000
5. 应该看到: 审批流程图编辑器界面，包含工具栏和画布

### 测试文档是否正常

1. 在根目录: `npm run docs:dev`
2. 访问: http://localhost:5173
3. 应该看到: ApprovalFlow 文档首页

---

## 📁 文件结构说明

```
flowchart/
├── src/                          # 源代码（示例直接引用）
│   ├── core/                     # 核心编辑器
│   ├── nodes/                    # 节点类型
│   ├── styles/index.css          # 样式文件 ⭐
│   ├── vue.ts                    # Vue 适配器 ⭐
│   └── types/index.ts            # 类型定义 ⭐
├── examples/vue-demo/            # Vue 示例
│   ├── src/
│   │   ├── App.vue               # 引用: ../../../src/vue.ts
│   │   └── main.ts               # 引用: ../../../src/styles/index.css
│   ├── vite.config.ts            # 已配置 resolve.extensions
│   └── package.json              # 已移除 workspace 依赖
├── docs/                         # 文档
│   ├── .vitepress/config.ts      # VitePress 配置
│   └── ...                       # Markdown 文档
└── dist/                         # 构建产物（构建后生成）
```

---

## 🔧 开发模式

### 修改源代码后

由于示例直接引用源代码，修改后会**自动热更新**：

1. 修改 `src/` 下的任何文件
2. 示例页面自动刷新
3. 立即看到效果

### 添加新功能

1. 在 `src/` 中添加代码
2. 在 `examples/vue-demo/src/App.vue` 中测试
3. 在 `docs/` 中编写文档

---

## 📝 检查清单

启动前请确认：

- [ ] Node.js 版本 >= 16
- [ ] 使用 `--legacy-peer-deps` 安装依赖
- [ ] 在正确的目录运行命令
- [ ] 端口没有被占用
- [ ] 网络连接正常（首次需要下载依赖）

启动后应该看到：

- [ ] Vue 示例：流程图编辑器界面
- [ ] 文档：VitePress 文档首页
- [ ] 控制台：无错误信息

---

## 🎓 学习建议

### 新手推荐流程

1. **先运行 Vue 示例**（10分钟）
   - 看看界面长什么样
   - 尝试添加节点
   - 尝试连接节点

2. **再看文档**（20分钟）
   - 阅读快速开始
   - 了解节点类型
   - 学习配置选项

3. **最后看源代码**（30分钟）
   - 查看 `src/core/ApprovalFlowEditor.ts`
   - 查看 `src/nodes/ApprovalNode.ts`
   - 理解实现原理

---

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的"常见问题"部分
2. 查看 `BUILD_GUIDE.md` 获取更多信息
3. 查看 `DEVELOPMENT.md` 了解开发环境
4. 提交 Issue 或发送邮件

---

## ✅ 验证成功

如果看到以下界面，说明启动成功：

### Vue 示例成功标志

```
✓ 看到"审批流程图编辑器 - Vue 示例"标题
✓ 看到工具栏按钮
✓ 看到流程图画布
✓ 画布上有初始节点（开始、审批、结束）
✓ 可以拖拽节点
✓ 控制台无错误
```

### 文档成功标志

```
✓ 看到 "ApprovalFlow" 大标题
✓ 看到"审批流程图编辑器"描述
✓ 看到"快速开始"按钮
✓ 侧边栏有导航菜单
✓ 控制台无错误
```

---

## 🎉 开始使用

现在你已经知道如何运行项目了！

选择你喜欢的方式：
- 💻 想快速看效果？→ 运行 Vue 示例
- 📖 想学习使用？→ 运行文档
- 🔨 想开发？→ 阅读 DEVELOPMENT.md

祝使用愉快！
