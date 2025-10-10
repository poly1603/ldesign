# 开发指南

## 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 pnpm >= 7.0.0

## 安装依赖

由于项目包含多个子包（主库、示例、文档），建议按照以下步骤安装：

### 方法 1: 使用 npm（推荐）

```bash
# 清理缓存（如果之前安装失败）
npm cache clean --force

# 安装依赖（使用legacy-peer-deps避免依赖冲突）
npm install --legacy-peer-deps
```

### 方法 2: 使用 pnpm（更快）

```bash
# 安装 pnpm（如果还没有安装）
npm install -g pnpm

# 安装依赖
pnpm install
```

### 常见安装问题

#### 问题 1: jsdom 安装失败

如果遇到 jsdom 相关错误，可以跳过测试依赖：

```bash
npm install --legacy-peer-deps --no-optional
```

#### 问题 2: 网络超时

如果网络较慢，可以使用国内镜像：

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install --legacy-peer-deps
```

#### 问题 3: 权限错误

Windows 用户如果遇到权限问题，请以管理员身份运行命令行。

## 开发

### 启动开发服务器

```bash
npm run dev
```

这will 启动 Vite 开发服务器，用于开发和测试。

### 构建项目

```bash
# 构建库和类型定义
npm run build

# 只构建类型定义
npm run build:types
```

构建产物will 输出到 `dist/` 目录：

```
dist/
├── index.js          # ES模块
├── index.cjs         # CommonJS模块
├── index.d.ts        # 类型定义
├── vue.js            # Vue适配器
├── vue.cjs
├── vue.d.ts
├── react.js          # React适配器
├── react.cjs
├── react.d.ts
└── style.css         # 样式文件
```

## 文档

### 启动文档开发服务器

```bash
npm run docs:dev
```

访问 http://localhost:5173 查看文档。

### 构建文档

```bash
npm run docs:build
```

构建产物will 输出到 `docs/.vitepress/dist/` 目录。

### 预览文档

```bash
npm run docs:preview
```

## 运行示例

### Vue 示例

```bash
cd examples/vue-demo
npm install --legacy-peer-deps
npm run dev
```

访问 http://localhost:3000 查看 Vue 示例。

## 测试

### 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test:watch

# UI 模式
npm run test:ui
```

## 项目结构

```
flowchart/
├── src/                    # 源代码
│   ├── core/               # 核心编辑器
│   ├── nodes/              # 节点类型
│   ├── styles/             # 样式
│   ├── types/              # TypeScript类型
│   ├── index.ts            # 主入口
│   ├── vue.ts              # Vue适配器
│   └── react.tsx           # React适配器
├── __tests__/              # 测试文件
├── docs/                   # VitePress文档
├── examples/               # 示例项目
│   └── vue-demo/           # Vue示例
├── dist/                   # 构建产物（自动生成）
└── node_modules/           # 依赖包（自动生成）
```

## 发布

### 发布前检查

1. 确保所有测试通过
2. 更新版本号
3. 更新 CHANGELOG.md
4. 构建项目

```bash
# 运行测试
npm run test

# 更新版本号
npm version patch  # 或 minor, major

# 构建
npm run build
```

### 发布到 npm

```bash
# 登录 npm（首次）
npm login

# 发布
npm publish
```

## 常见问题

### Q1: 为什么使用 --legacy-peer-deps？

A: 因为项目同时支持 Vue 和 React，这两个框架的依赖可能会有冲突。使用 `--legacy-peer-deps` 可以让 npm 像旧版本一样处理 peer dependencies，避免冲突。

### Q2: 可以只安装部分依赖吗？

A: 可以。如果你只需要开发文档，可以只安装文档相关的依赖：

```bash
cd docs
npm install vitepress
npm run dev
```

### Q3: 构建失败怎么办？

A: 请检查：
1. Node.js 版本是否 >= 16
2. 依赖是否完整安装
3. tsconfig.json 和 vite.config.ts 是否正确
4. 清理 dist 目录后重新构建

### Q4: 文档启动失败怎么办？

A: 文档使用 VitePress，确保：
1. 已安装 vitepress 依赖
2. docs/.vitepress/config.ts 配置正确
3. 所有文档 markdown 文件存在

## 贡献指南

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 编写测试用例
- 更新相关文档

## 技术栈

- **构建工具**: Vite 5.x
- **类型系统**: TypeScript 5.x
- **测试框架**: Vitest 1.x
- **文档工具**: VitePress 1.x
- **核心依赖**: LogicFlow 1.x

## 获取帮助

- 📋 [GitHub Issues](https://github.com/ldesign/approval-flow/issues)
- 💬 [讨论区](https://github.com/ldesign/approval-flow/discussions)
- 📧 Email: support@ldesign.com
