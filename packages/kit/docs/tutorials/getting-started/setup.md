# 环境搭建

本教程将指导您完成 @ldesign/kit 的环境搭建和基础配置。

## 系统要求

### Node.js 版本

@ldesign/kit 支持以下 Node.js 版本：

- **Node.js 16.x** (LTS)
- **Node.js 18.x** (LTS) ✅ 推荐
- **Node.js 20.x** (LTS) ✅ 推荐
- **Node.js 21.x** (Current)

### 操作系统

- **Windows** 10/11
- **macOS** 10.15+
- **Linux** (Ubuntu 18.04+, CentOS 7+, 其他主流发行版)

### 包管理器

推荐使用以下包管理器之一：

- **pnpm** 8.x+ ✅ 推荐
- **npm** 8.x+
- **yarn** 1.22.x+ 或 3.x+

## 安装步骤

### 1. 检查 Node.js 环境

首先检查您的 Node.js 版本：

```bash
node --version
npm --version
```

如果版本不符合要求，请访问 [Node.js 官网](https://nodejs.org/) 下载最新的 LTS 版本。

### 2. 安装 pnpm（推荐）

如果您还没有安装 pnpm，可以通过以下方式安装：

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 corepack（Node.js 16.10+）
corepack enable
corepack prepare pnpm@latest --activate
```

验证安装：

```bash
pnpm --version
```

### 3. 创建新项目

创建一个新的 Node.js 项目：

```bash
mkdir my-ldesign-project
cd my-ldesign-project
pnpm init
```

### 4. 安装 @ldesign/kit

使用 pnpm 安装 @ldesign/kit：

```bash
# 安装最新版本
pnpm add @ldesign/kit

# 或安装特定版本
pnpm add @ldesign/kit@^1.0.0
```

### 5. 安装 TypeScript（推荐）

虽然 @ldesign/kit 支持 JavaScript，但我们强烈推荐使用 TypeScript：

```bash
# 安装 TypeScript 和类型定义
pnpm add -D typescript @types/node

# 初始化 TypeScript 配置
npx tsc --init
```

### 6. 配置 TypeScript

编辑 `tsconfig.json` 文件：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## 项目结构

创建推荐的项目结构：

```
my-ldesign-project/
├── src/
│   ├── index.ts          # 主入口文件
│   ├── config/           # 配置文件
│   ├── utils/            # 工具函数
│   ├── services/         # 业务服务
│   └── types/            # 类型定义
├── tests/                # 测试文件
├── docs/                 # 文档
├── dist/                 # 编译输出
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

创建基础目录：

```bash
mkdir -p src/{config,utils,services,types}
mkdir tests docs
```

## 基础配置

### 1. 创建主入口文件

创建 `src/index.ts`：

```typescript
import { StringUtils, FileSystem, CacheManager } from '@ldesign/kit'

async function main() {
  console.log('🚀 @ldesign/kit 项目启动')

  // 测试字符串工具
  const slug = StringUtils.slugify('Hello World!')
  console.log('URL Slug:', slug)

  // 测试文件系统
  const exists = await FileSystem.exists('./package.json')
  console.log('package.json 存在:', exists)

  // 测试缓存
  const cache = CacheManager.create()
  await cache.set('test', 'Hello Cache!')
  const value = await cache.get('test')
  console.log('缓存值:', value)
}

main().catch(console.error)
```

### 2. 配置 package.json 脚本

编辑 `package.json`，添加常用脚本：

```json
{
  "name": "my-ldesign-project",
  "version": "1.0.0",
  "description": "使用 @ldesign/kit 的项目",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "clean": "rimraf dist"
  },
  "keywords": ["ldesign", "toolkit"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@ldesign/kit": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 3. 创建 .gitignore

创建 `.gitignore` 文件：

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Coverage
coverage/
.nyc_output/

# Cache
.cache/
.parcel-cache/

# Temporary files
tmp/
temp/
```

## 验证安装

### 1. 编译项目

```bash
pnpm run build
```

### 2. 运行项目

```bash
pnpm start
```

您应该看到类似以下的输出：

```
🚀 @ldesign/kit 项目启动
URL Slug: hello-world
package.json 存在: true
缓存值: Hello Cache!
```

### 3. 开发模式

在开发过程中，使用监听模式：

```bash
pnpm run dev
```

这将启动 TypeScript 编译器的监听模式，当文件发生变化时自动重新编译。

## 开发工具配置

### 1. ESLint 配置（可选）

安装 ESLint：

```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

创建 `.eslintrc.json`：

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 2. Prettier 配置（可选）

安装 Prettier：

```bash
pnpm add -D prettier
```

创建 `.prettierrc`：

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. VS Code 配置（可选）

创建 `.vscode/settings.json`：

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 常见问题

### Q: 安装时出现权限错误

**A**: 在 Windows 上，尝试以管理员身份运行命令提示符。在 macOS/Linux 上，避免使用 `sudo`，而是配置 npm 的全局目录。

### Q: TypeScript 编译错误

**A**: 确保 TypeScript 版本兼容，检查 `tsconfig.json` 配置是否正确。

### Q: 模块导入错误

**A**: 确保已正确安装 @ldesign/kit，检查 `package.json` 中的依赖版本。

### Q: 在 Windows 上路径问题

**A**: @ldesign/kit 会自动处理路径分隔符，但建议使用 `path.join()` 或 `FileSystem.join()` 来构建路径。

## 下一步

环境搭建完成后，您可以：

1. 阅读 [第一个应用](./first-app.md) 教程
2. 查看 [基础概念](./basic-concepts.md)
3. 探索 [API 文档](/api/)
4. 查看 [使用示例](/examples/)

## 获取帮助

如果在环境搭建过程中遇到问题：

1. 查看 [常见问题](/troubleshooting/faq.md)
2. 搜索 [GitHub Issues](https://github.com/ldesign/kit/issues)
3. 在社区论坛提问
4. 查看官方文档的故障排除部分

祝您使用愉快！🎉
