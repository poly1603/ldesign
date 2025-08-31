# 安装

本指南将详细介绍如何在不同环境中安装和配置 @ldesign/shared。

## 系统要求

### 运行环境
- **Node.js**: 14.0 或更高版本
- **Vue**: 3.0 或更高版本（使用 Vue Hooks 时）
- **TypeScript**: 4.5 或更高版本（可选，但推荐）

### 浏览器支持
- **现代浏览器**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **移动浏览器**: iOS Safari 12+, Chrome Mobile 60+

## 包管理器安装

### 使用 pnpm（推荐）

```bash
pnpm add @ldesign/shared
```

### 使用 npm

```bash
npm install @ldesign/shared
```

### 使用 yarn

```bash
yarn add @ldesign/shared
```

## CDN 引入

### 通过 unpkg

```html
<!-- 最新版本 -->
<script src="https://unpkg.com/@ldesign/shared@latest/dist/index.umd.js"></script>

<!-- 指定版本 -->
<script src="https://unpkg.com/@ldesign/shared@1.0.0/dist/index.umd.js"></script>
```

### 通过 jsDelivr

```html
<!-- 最新版本 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/shared@latest/dist/index.umd.js"></script>

<!-- 指定版本 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/shared@1.0.0/dist/index.umd.js"></script>
```

### ES 模块引入

```html
<script type="module">
  import { debounce, formatDate } from 'https://unpkg.com/@ldesign/shared@latest/dist/index.esm.js'
  
  // 使用函数
  const debouncedFn = debounce(() => console.log('Hello'), 300)
</script>
```

## 项目配置

### Vue 3 项目

#### Vite 项目

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['@ldesign/shared']
  }
})
```

#### Vue CLI 项目

```javascript
// vue.config.js
module.exports = {
  transpileDependencies: ['@ldesign/shared']
}
```

### TypeScript 配置

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "node_modules/@ldesign/shared/dist/types/**/*"
  ]
}
```

### Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@ldesign/shared': require.resolve('@ldesign/shared')
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]@ldesign[\\/]shared[\\/]/,
          name: 'ldesign-shared',
          chunks: 'all'
        }
      }
    }
  }
}
```

## 导入方式

### 按需导入（推荐）

```typescript
// 导入具体函数
import { debounce, formatDate, unique } from '@ldesign/shared'

// 导入 Vue Hooks
import { useLocalStorage, useDebounce } from '@ldesign/shared'

// 导入类型定义
import type { DeepPartial, Nullable } from '@ldesign/shared'
```

### 分类导入

```typescript
// 导入工具函数模块
import { array, string, date, validate } from '@ldesign/shared'

// 使用
const uniqueArray = array.unique([1, 2, 2, 3])
const camelCase = string.toCamelCase('hello-world')
const formatted = date.formatDate(new Date(), 'YYYY-MM-DD')
const isValid = validate.isValidEmail('user@example.com')
```

### 全量导入

```typescript
// 导入所有功能（不推荐，会增加打包体积）
import * as LDesignShared from '@ldesign/shared'

// 使用
const result = LDesignShared.debounce(() => {}, 300)
```

## Tree Shaking 配置

### Vite 项目

Vite 默认支持 Tree Shaking，无需额外配置。

### Webpack 项目

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  }
}
```

### Rollup 项目

```javascript
// rollup.config.js
import { terser } from 'rollup-plugin-terser'

export default {
  plugins: [
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true
      }
    })
  ]
}
```

## 环境变量配置

### 开发环境

```bash
# .env.development
NODE_ENV=development
VITE_LDESIGN_DEBUG=true
```

### 生产环境

```bash
# .env.production
NODE_ENV=production
VITE_LDESIGN_DEBUG=false
```

### 使用环境变量

```typescript
// 在代码中使用
if (import.meta.env.VITE_LDESIGN_DEBUG) {
  console.log('LDesign Shared 调试模式已启用')
}
```

## 版本管理

### 查看当前版本

```bash
npm list @ldesign/shared
```

### 更新到最新版本

```bash
# pnpm
pnpm update @ldesign/shared

# npm
npm update @ldesign/shared

# yarn
yarn upgrade @ldesign/shared
```

### 锁定版本

```json
{
  "dependencies": {
    "@ldesign/shared": "1.0.0"
  }
}
```

## 常见问题

### TypeScript 类型错误

**问题**: 导入时出现类型错误

**解决方案**:
```typescript
// 确保正确导入类型
import type { DeepPartial } from '@ldesign/shared'

// 或者使用类型断言
const data = someValue as DeepPartial<MyType>
```

### 构建体积过大

**问题**: 打包后体积过大

**解决方案**:
1. 使用按需导入而不是全量导入
2. 确保 Tree Shaking 正确配置
3. 检查是否有重复依赖

```typescript
// ❌ 错误：全量导入
import * as LDesignShared from '@ldesign/shared'

// ✅ 正确：按需导入
import { debounce, formatDate } from '@ldesign/shared'
```

### SSR 兼容性问题

**问题**: 服务端渲染时出现错误

**解决方案**:
```typescript
// 使用动态导入
const { useLocalStorage } = await import('@ldesign/shared')

// 或者在客户端组件中使用
onMounted(() => {
  const { useLocalStorage } = require('@ldesign/shared')
})
```

### Vue 版本兼容性

**问题**: Vue 版本不兼容

**解决方案**:
确保使用 Vue 3.0 或更高版本：

```bash
npm install vue@^3.0.0
```

## 验证安装

创建一个简单的测试文件来验证安装是否成功：

```typescript
// test-installation.ts
import { debounce, formatDate, useLocalStorage } from '@ldesign/shared'

// 测试工具函数
const debouncedFn = debounce(() => console.log('Debounced!'), 300)
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD')

console.log('格式化日期:', formattedDate)

// 测试 Vue Hook（需要在 Vue 组件中使用）
// const [value, setValue] = useLocalStorage('test', 'default')

console.log('@ldesign/shared 安装成功！')
```

运行测试：

```bash
npx tsx test-installation.ts
```

## 下一步

安装完成后，您可以：

1. 查看 [快速开始指南](/guide/getting-started) 学习基础用法
2. 浏览 [API 参考](/api/) 了解所有可用功能
3. 查看具体的 [工具函数文档](/utils/array) 和 [Hooks 文档](/hooks/use-async-validator)

如果遇到问题，请查看 [常见问题](https://github.com/ldesign/shared/wiki/FAQ) 或在 [GitHub Issues](https://github.com/ldesign/shared/issues) 中提问。
