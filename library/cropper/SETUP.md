# 快速启动指南

本指南帮助您快速启动并运行 @ldesign/cropper 项目。

## 环境要求

- Node.js 18+
- npm 或 yarn 或 pnpm

## 步骤 1: 安装依赖

在项目根目录运行：

```bash
npm install
```

## 步骤 2: 构建库

```bash
npm run build
```

这将在 `dist/` 目录生成构建文件。

## 步骤 3: 运行示例项目

### 方式一：直接运行（推荐）

```bash
cd examples/vite-demo
npm install
npm run dev
```

打开浏览器访问：http://localhost:5173

### 方式二：链接本地包

在项目根目录：

```bash
npm link
```

在示例项目目录：

```bash
cd examples/vite-demo
npm link @ldesign/cropper
npm run dev
```

## 步骤 4: 查看文档

运行文档开发服务器：

```bash
npm run docs:dev
```

打开浏览器访问：http://localhost:5173

## 常见问题

### 1. 构建失败

确保已安装所有依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. 示例无法启动

检查是否已构建主项目：

```bash
# 在项目根目录
npm run build
```

### 3. TypeScript 错误

重新生成类型声明：

```bash
npm run build
```

### 4. 热更新不工作

在示例项目中使用别名配置（已配置在 vite.config.ts）：

```typescript
resolve: {
  alias: {
    '@ldesign/cropper': resolve(__dirname, '../../src/index.ts')
  }
}
```

## 开发工作流

### 开发库代码

1. 修改 `src/` 下的源代码
2. 运行 `npm run build` 重新构建
3. 在示例项目中测试

### 开发示例

1. 进入 `examples/vite-demo/`
2. 运行 `npm run dev`
3. 修改 `src/App.vue` 进行测试

### 开发文档

1. 修改 `docs/` 下的 Markdown 文件
2. 运行 `npm run docs:dev`
3. 实时预览更改

## 项目结构

```
cropper/
├── src/                # 源代码
│   ├── core/          # 核心功能
│   ├── adapters/      # 框架适配器
│   ├── utils/         # 工具函数
│   └── styles/        # 样式
├── examples/          # 示例项目
│   └── vite-demo/    # Vue 3 示例
├── docs/              # 文档
├── dist/              # 构建输出
└── package.json
```

## 脚本命令

### 主项目

- `npm run dev` - 开发模式
- `npm run build` - 构建库
- `npm run preview` - 预览构建
- `npm test` - 运行测试
- `npm run docs:dev` - 文档开发服务器
- `npm run docs:build` - 构建文档

### 示例项目

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建示例
- `npm run preview` - 预览构建

## 下一步

- 查看 [README.md](./README.md) 了解项目概述
- 查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献指南
- 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解项目详情
- 访问在线文档了解API使用

## 需要帮助？

- 查看 GitHub Issues
- 查看在线文档
- 查看示例代码

祝您开发愉快！
