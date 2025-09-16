# Basic TypeScript Example

一个简单的 TypeScript 库示例，展示如何使用 `@ldesign/builder` 构建和发布 TypeScript 库。

## 特性

- ✅ **TypeScript 支持** - 完整的类型定义和类型检查
- ✅ **多格式输出** - 支持 ESM、CommonJS 和 UMD 格式
- ✅ **自动化构建** - 使用 @ldesign/builder 进行自动化构建
- ✅ **类型声明** - 自动生成 .d.ts 类型声明文件
- ✅ **Source Maps** - 支持源码映射，便于调试

## 快速开始

### 安装

```bash
npm install @example/basic-typescript
# 或
yarn add @example/basic-typescript
# 或
pnpm add @example/basic-typescript
```

### 基础用法

```typescript
import { createUser, validateEmail, formatUser } from '@example/basic-typescript'

// 创建用户
const user = createUser('张三', 'zhangsan@example.com', 25)
console.log(user)
// 输出: { id: 1234, name: '张三', email: 'zhangsan@example.com', age: 25 }

// 验证邮箱
const isValid = validateEmail('test@example.com')
console.log(isValid) // 输出: true

// 格式化用户信息
const formatted = formatUser(user)
console.log(formatted) // 输出: "张三 (25岁) - zhangsan@example.com"
```

## API 概览

### 函数

- [`createUser(name, email, age?)`](/api/create-user) - 创建用户对象
- [`validateEmail(email)`](/api/validate-email) - 验证邮箱格式
- [`formatUser(user)`](/api/format-user) - 格式化用户信息

### 类型

- [`User`](/api#user) - 用户信息接口
- [`Options`](/api#options) - 配置选项接口

### 常量

- [`DEFAULT_OPTIONS`](/api#default-options) - 默认配置
- [`VERSION`](/api#version) - 版本信息
- [`LIBRARY_NAME`](/api#library-name) - 库名称

## 示例

查看更多使用示例：

- [基础用法](/examples) - 基本功能演示
- [高级用法](/examples/advanced) - 高级功能和配置
- [集成示例](/examples/integration) - 与其他库的集成使用

## 构建配置

本项目使用 `@ldesign/builder` 进行构建，配置文件 `.ldesign/builder.config.ts`：

```typescript
import { defineConfig, LibraryType } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'BasicTypescript'
  },
  libraryType: LibraryType.TYPESCRIPT,
  bundler: 'rollup'
})
```

## 许可证

MIT © LDesign Team
