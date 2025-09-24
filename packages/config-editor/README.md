# @ldesign/config-editor

LDesign 可视化配置编辑器 - 为配置文件提供直观的可视化编辑界面。

## 🎯 功能特性

- **🎨 可视化编辑** - 提供直观的 Web 界面编辑配置文件
- **📁 多格式支持** - 支持 TypeScript、JavaScript、JSON、YAML 等格式
- **🔧 智能验证** - 内置配置验证和错误提示
- **💾 实时保存** - 支持实时保存和备份功能
- **🚀 CLI 工具** - 提供命令行工具快速启动
- **📦 类型安全** - 完整的 TypeScript 类型定义
- **🔄 热重载** - 开发模式支持热重载
- **🌐 前后端分离** - Vue 3 + Express 架构

## 📋 支持的配置类型

- **Launcher 配置** (`launcher.config.ts`) - @ldesign/launcher 配置文件
- **App 配置** (`app.config.ts`) - 应用程序配置文件
- **Package.json** - NPM 包配置文件

## 📦 安装

```bash
# 使用 npm
npm install @ldesign/config-editor

# 使用 pnpm
pnpm add @ldesign/config-editor

# 使用 yarn
yarn add @ldesign/config-editor
```

## 🚀 快速开始

### 命令行使用

```bash
# 启动可视化编辑器
npx config-editor ui

# 指定端口和主机
npx config-editor ui --port 3000 --host 0.0.0.0

# 开发模式（同时启动前后端）
npx config-editor dev
```

启动后访问 `http://localhost:3001` 查看可视化界面。

### 编程使用

```typescript
import { ConfigEditor } from '@ldesign/config-editor'

// 创建配置编辑器实例
const editor = new ConfigEditor({
  cwd: process.cwd()
})

// 启动服务器
const server = await createServer({
  port: 3002,
  host: 'localhost',
  clientPort: 3001
})

// 解析配置文件
const launcherConfig = await editor.parseLauncherConfig('./launcher.config.ts')
const appConfig = await editor.parseAppConfig('./app.config.ts')
const packageJson = await editor.parsePackageJson('./package.json')
```

## 🎯 支持的配置文件

### launcher.config.ts

支持 @ldesign/launcher 的所有配置选项：

- 服务器配置 (server)
- 构建配置 (build)
- 插件配置 (plugins)
- 代理配置 (proxy)
- 环境变量 (env)

### app.config.ts

支持应用程序配置：

- API 配置 (api)
- 主题配置 (theme)
- 功能特性 (features)
- 国际化 (i18n)
- 路由配置 (router)

### package.json

支持 package.json 的可视化编辑：

- 基本信息 (name, version, description)
- 依赖管理 (dependencies, devDependencies)
- 脚本配置 (scripts)
- 发布配置 (files, exports)

## 🛠️ 开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/config-editor

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建项目
pnpm run build

# 运行测试
pnpm run test

# 代码检查
pnpm run lint
```

## 📚 文档

- [快速开始](./docs/guide/getting-started.md)
- [API 参考](./docs/api/index.md)
- [配置选项](./docs/config/index.md)
- [开发指南](./docs/development/index.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

[MIT](./LICENSE) © LDesign Team
