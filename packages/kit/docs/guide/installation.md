# 安装指南

本指南将帮助您在项目中安装和配置 @ldesign/kit。

## 系统要求

在开始之前，请确保您的系统满足以下要求：

- **Node.js**: 16.0.0 或更高版本
- **npm**: 7.0.0 或更高版本（或等效的包管理器）
- **TypeScript**: 4.6.0 或更高版本（可选，但推荐）

### 检查当前版本

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 TypeScript 版本（如果已安装）
tsc --version
```

## 安装方式

### 使用 npm

```bash
# 安装最新版本
npm install @ldesign/kit

# 安装指定版本
npm install @ldesign/kit@1.0.0

# 安装为开发依赖
npm install --save-dev @ldesign/kit
```

### 使用 yarn

```bash
# 安装最新版本
yarn add @ldesign/kit

# 安装指定版本
yarn add @ldesign/kit@1.0.0

# 安装为开发依赖
yarn add --dev @ldesign/kit
```

### 使用 pnpm

```bash
# 安装最新版本
pnpm add @ldesign/kit

# 安装指定版本
pnpm add @ldesign/kit@1.0.0

# 安装为开发依赖
pnpm add -D @ldesign/kit
```

## 验证安装

安装完成后，您可以通过以下方式验证安装是否成功：

### 1. 检查包信息

```bash
npm list @ldesign/kit
```

### 2. 简单测试

创建一个测试文件 `test.js` 或 `test.ts`：

```javascript
// test.js
const { StringUtils } = require('@ldesign/kit')

console.log(StringUtils.camelCase('hello-world'))
// 输出: helloWorld
```

```typescript
// test.ts
import { StringUtils } from '@ldesign/kit'

console.log(StringUtils.camelCase('hello-world'))
// 输出: helloWorld
```

运行测试：

```bash
# JavaScript
node test.js

# TypeScript (需要先编译或使用 ts-node)
npx ts-node test.ts
```

## TypeScript 配置

如果您使用 TypeScript，建议在 `tsconfig.json` 中进行以下配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

## 模块导入方式

@ldesign/kit 支持多种导入方式：

### 1. 完整导入

```typescript
import * as Kit from '@ldesign/kit'

Kit.StringUtils.camelCase('hello-world')
Kit.FileSystem.readFile('./config.json')
```

### 2. 按需导入（推荐）

```typescript
import { StringUtils, FileSystem, CacheManager } from '@ldesign/kit'

StringUtils.camelCase('hello-world')
FileSystem.readFile('./config.json')
CacheManager.create()
```

### 3. 子模块导入

```typescript
import { StringUtils } from '@ldesign/kit/utils'
import { FileSystem } from '@ldesign/kit/filesystem'
import { CacheManager } from '@ldesign/kit/cache'
```

### 4. CommonJS 导入

```javascript
const { StringUtils, FileSystem } = require('@ldesign/kit')

// 或者
const Kit = require('@ldesign/kit')
```

## 环境配置

### Node.js 项目

对于标准的 Node.js 项目，无需额外配置即可使用。

### Web 项目

如果在浏览器环境中使用，某些模块（如 FileSystem、Git 等）可能不可用。建议只使用兼容浏览器的模块：

```typescript
// 浏览器兼容的模块
import {
  StringUtils,
  NumberUtils,
  DateUtils,
  ObjectUtils,
  ArrayUtils,
  ValidationUtils,
} from '@ldesign/kit'
```

### Webpack 配置

如果使用 Webpack，可能需要配置 Node.js polyfills：

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
    },
  },
}
```

### Vite 配置

对于 Vite 项目：

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@ldesign/kit'],
  },
})
```

## 常见问题

### Q: 安装时出现权限错误

**A:** 尝试使用 `sudo`（macOS/Linux）或以管理员身份运行（Windows）：

```bash
# macOS/Linux
sudo npm install @ldesign/kit

# Windows (以管理员身份运行 PowerShell)
npm install @ldesign/kit
```

### Q: TypeScript 类型定义找不到

**A:** 确保安装了 TypeScript 并且版本兼容：

```bash
npm install -D typescript@latest
```

### Q: 模块导入错误

**A:** 检查您的模块系统配置：

```json
// package.json
{
  "type": "module" // 使用 ES 模块
}
```

或者

```json
// package.json
{
  "type": "commonjs" // 使用 CommonJS
}
```

### Q: 在浏览器中使用时出错

**A:** 某些模块仅适用于 Node.js 环境。请查看 [兼容性指南](/guide/compatibility) 了解详情。

## 下一步

安装完成后，您可以：

- 查看 [快速开始指南](./getting-started.md) 学习基本用法
- 浏览 [API 参考文档](/api/) 了解所有可用功能
- 查看 [使用示例](/examples/) 学习实际应用场景

## 获取帮助

如果在安装过程中遇到问题：

- 查看 [常见问题](/faq/)
- 在 [GitHub Issues](https://github.com/ldesign/kit/issues) 中搜索或提交问题
- 参与 [GitHub Discussions](https://github.com/ldesign/kit/discussions) 讨论
