# 安装指南

本指南将帮助你在不同的环境中安装和配置 @ldesign/http。

## 系统要求

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0 (可选，但推荐)
- **Vue**: >= 3.0.0 (仅在使用 Vue 集成时需要)

## 包管理器安装

### 使用 pnpm (推荐)

```bash
pnpm add @ldesign/http
```

### 使用 npm

```bash
npm install @ldesign/http
```

### 使用 yarn

```bash
yarn add @ldesign/http
```

## CDN 引入

如果你不使用构建工具，可以通过 CDN 直接引入：

### 通过 unpkg

```html
<!-- 引入主库 -->
<script src="https://unpkg.com/@ldesign/http/dist/index.umd.js"></script>

<!-- 如果需要 Vue 集成 -->
<script src="https://unpkg.com/@ldesign/http/dist/vue.umd.js"></script>
```

### 通过 jsDelivr

```html
<!-- 引入主库 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/http/dist/index.umd.js"></script>

<!-- 如果需要 Vue 集成 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/http/dist/vue.umd.js"></script>
```

使用 CDN 引入后，库会暴露在全局变量 `LDesignHttp` 和 `LDesignHttpVue` 中：

```html
<script>
  const { createHttpClient } = LDesignHttp
  const http = createHttpClient({
    baseURL: 'https://api.example.com'
  })
</script>
```

## 环境配置

### TypeScript 项目

如果你使用 TypeScript，确保在 `tsconfig.json` 中包含以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

### Vue 3 项目

在 Vue 3 项目中，你可能需要配置类型声明：

```typescript
// vite-env.d.ts 或 env.d.ts
/// <reference types="vite/client" />

declare module '@ldesign/http' {
  // 类型声明会自动加载
}
```

### Vite 项目

如果使用 Vite，建议在 `vite.config.ts` 中添加别名配置：

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@ldesign/http': '@ldesign/http/es'
    }
  }
})
```

### Webpack 项目

对于 Webpack 项目，可以配置别名：

```javascript
module.exports = {
  resolve: {
    alias: {
      '@ldesign/http': '@ldesign/http/es'
    }
  }
}
```

## 验证安装

创建一个简单的测试文件来验证安装是否成功：

```typescript
// test-installation.ts
import { createHttpClient } from '@ldesign/http'

const http = createHttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

async function test() {
  try {
    const response = await http.get('/posts/1')
    console.log('安装成功！', response.data)
  } catch (error) {
    console.error('安装验证失败：', error)
  }
}

test()
```

运行测试：

```bash
# 如果使用 ts-node
npx ts-node test-installation.ts

# 如果使用 Node.js (需要先编译)
tsc test-installation.ts && node test-installation.js
```

## 常见问题

### Q: 安装后提示找不到模块？

**A**: 确保你的 Node.js 版本 >= 16.0.0，并且使用的是支持 ES 模块的环境。

### Q: TypeScript 类型提示不工作？

**A**: 确保安装了 TypeScript 声明文件，并且 `tsconfig.json` 配置正确。

### Q: 在 Vue 项目中使用时出现类型错误？

**A**: 确保安装了 Vue 3 的类型声明：

```bash
pnpm add -D @vue/tsconfig
```

### Q: CDN 引入后无法使用？

**A**: 确保在使用前库已经完全加载，可以在 `window.onload` 事件中使用。

### Q: 构建时出现依赖问题？

**A**: 检查你的构建工具配置，确保正确处理了 ES 模块和 CommonJS 模块。

## 下一步

安装完成后，你可以：

1. 阅读 [基础用法](./basic-usage) 了解如何使用
2. 查看 [API 参考](../api/http-client) 了解详细的 API
3. 浏览 [示例](../examples/basic) 学习具体用法
4. 如果使用 Vue 3，查看 [Vue 集成指南](./vue-plugin)

如果遇到任何问题，请查看我们的 [故障排除指南](./troubleshooting) 或在 GitHub 上提交 issue。
