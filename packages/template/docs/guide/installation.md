# 安装

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: >= 16.0.0
- **Vue**: >= 3.2.0
- **TypeScript**: >= 4.5.0 (可选，但推荐)

## 包管理器安装

LDesign Template 可以通过多种包管理器安装：

::: code-group

```bash [pnpm]
pnpm add @ldesign/template
```

```bash [npm]
npm install @ldesign/template
```

```bash [yarn]
yarn add @ldesign/template
```

:::

## CDN 引入

如果你不使用构建工具，也可以通过 CDN 直接引入：

```html
<!-- 引入 Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<!-- 引入 LDesign Template -->
<script src="https://unpkg.com/@ldesign/template/dist/index.umd.js"></script>
```

## 验证安装

安装完成后，你可以通过以下方式验证安装是否成功：

```typescript
import { TemplateManager } from '@ldesign/template'

// 创建模板管理器实例
const manager = new TemplateManager()
console.log('LDesign Template 安装成功！', manager)
```

## 开发环境配置

### Vite 配置

如果你使用 Vite，建议在 `vite.config.ts` 中添加以下配置：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['@ldesign/template']
  }
})
```

### Webpack 配置

如果你使用 Webpack，可能需要配置别名：

```javascript
module.exports = {
  resolve: {
    alias: {
      '@ldesign/template': '@ldesign/template/es'
    }
  }
}
```

### TypeScript 配置

为了获得更好的类型支持，建议在 `tsconfig.json` 中添加：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 下一步

安装完成后，你可以：

- 查看 [快速开始](./getting-started.md) 了解基本用法
- 阅读 [基础概念](./concepts.md) 理解核心概念
- 浏览 [示例](../examples/) 查看实际应用

## 常见问题

### 安装失败

如果遇到安装失败的问题，请尝试：

1. 清除包管理器缓存
2. 检查网络连接
3. 使用不同的镜像源

### 类型错误

如果遇到 TypeScript 类型错误，请确保：

1. Vue 版本 >= 3.2.0
2. TypeScript 版本 >= 4.5.0
3. 正确配置了 `tsconfig.json`

### 构建错误

如果在构建时遇到错误，请检查：

1. 构建工具配置是否正确
2. 是否正确引入了必要的依赖
3. 查看构建工具的文档获取更多帮助
