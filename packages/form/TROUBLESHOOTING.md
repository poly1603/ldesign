# 故障排除指南

本文档提供了解决 @ldesign/form 项目中常见问题的方法。

## 🔧 快速修复

### 运行自动修复脚本

```bash
# 验证项目配置
pnpm validate

# 自动修复类型问题
pnpm fix-types
```

### 手动检查步骤

```bash
# 1. 检查 TypeScript 类型
pnpm type-check

# 2. 检查 ESLint
pnpm lint

# 3. 自动修复 ESLint 问题
pnpm lint:fix

# 4. 构建项目
pnpm build
```

## 🐛 常见问题

### TypeScript 类型错误

#### 问题：找不到模块声明

```
Cannot find module '*.vue' or its corresponding type declarations.
```

**解决方案：**

1. 确保 `src/types/vue.d.ts` 文件存在
2. 检查 `tsconfig.json` 中的 `include` 配置

#### 问题：Vue 组件类型错误

```
Property 'xxx' does not exist on type 'ComponentPublicInstance'
```

**解决方案：**

1. 检查组件的 `defineProps` 和 `defineEmits` 定义
2. 确保所有 props 都有正确的类型声明

#### 问题：导入路径错误

```
Module '"@/xxx"' has no exported member 'xxx'
```

**解决方案：**

1. 检查 `tsconfig.json` 中的路径映射
2. 确保导出的模块存在且正确

### ESLint 错误

#### 问题：未使用的变量

```
'xxx' is defined but never used
```

**解决方案：**

```bash
# 自动修复
pnpm lint:fix

# 或手动添加 eslint-disable 注释
// eslint-disable-next-line @typescript-eslint/no-unused-vars
```

#### 问题：Vue 组件命名

```
Component name should be multi-word
```

**解决方案：** 在 `eslint.config.js` 中已禁用此规则，如果仍有问题：

```javascript
rules: {
  'vue/multi-word-component-names': 'off'
}
```

### 构建错误

#### 问题：Vite 构建失败

```
Build failed with errors
```

**解决方案：**

1. 检查 `vite.config.ts` 配置
2. 确保所有依赖都已安装
3. 清理 `node_modules` 重新安装

```bash
rm -rf node_modules
pnpm install
```

#### 问题：类型声明生成失败

```
vite-plugin-dts: Type check failed
```

**解决方案：**

1. 在 `vite.config.ts` 中设置 `skipDiagnostics: true`
2. 手动运行类型检查找出具体问题

### 示例项目问题

#### 问题：Vue 示例启动失败

```
Failed to resolve import "@ldesign/form"
```

**解决方案：**

1. 确保主包已构建：`pnpm build`
2. 检查 `vite.config.ts` 中的别名配置
3. 重新安装依赖

#### 问题：原生 JavaScript 示例错误

```
Cannot resolve module
```

**解决方案：**

1. 检查 `vanilla-pure.ts` 文件是否存在
2. 确保 Vite 配置正确指向该文件

## 🔍 调试技巧

### 1. 逐步检查

```bash
# 步骤 1: 检查基础配置
node validate-project.js

# 步骤 2: 检查类型
pnpm type-check

# 步骤 3: 检查语法
pnpm lint

# 步骤 4: 尝试构建
pnpm build
```

### 2. 查看详细错误

```bash
# 详细的 TypeScript 错误
npx vue-tsc --noEmit --pretty

# 详细的 ESLint 错误
npx eslint src --ext .ts,.vue --format=detailed

# 详细的构建错误
npx vite build --mode development
```

### 3. 清理和重置

```bash
# 清理构建产物
rm -rf dist

# 清理依赖
rm -rf node_modules
pnpm install

# 清理缓存
pnpm store prune
```

## 📝 配置文件说明

### tsconfig.json

- 配置了 Vue 3 和 TypeScript 的兼容性
- 设置了路径映射 `@/*` -> `src/*`
- 包含了必要的类型声明

### vite.config.ts

- 配置了 Vue 插件和 DTS 插件
- 设置了多入口构建
- 配置了外部依赖和全局变量

### eslint.config.js

- 简化的 ESLint 配置
- 禁用了一些严格的规则
- 支持 TypeScript 和 Vue 文件

## 🚀 最佳实践

### 1. 开发流程

1. 修改代码后先运行 `pnpm type-check`
2. 提交前运行 `pnpm lint:fix`
3. 发布前运行 `pnpm build`

### 2. 类型安全

- 为所有 Vue 组件定义明确的 Props 和 Emits 类型
- 使用 `defineProps<T>()` 而不是运行时 props
- 导出所有必要的类型定义

### 3. 代码质量

- 遵循 ESLint 规则
- 使用 TypeScript 严格模式
- 编写单元测试

## 📞 获取帮助

如果以上方法都无法解决问题：

1. 运行 `pnpm validate` 获取详细的诊断信息
2. 检查控制台输出的具体错误信息
3. 查看项目的 GitHub Issues
4. 提交新的 Issue 并附上错误信息

## 🔄 版本兼容性

确保使用兼容的版本：

- Node.js >= 16
- Vue >= 3.4.0
- TypeScript >= 5.0.0
- Vite >= 5.0.0
