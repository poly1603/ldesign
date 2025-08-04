# 安装

## 环境要求

- Node.js >= 16
- 现代浏览器支持 (Chrome >= 88, Firefox >= 78, Safari >= 14, Edge >= 88)

## 包管理器安装

### npm

```bash
npm install @ldesign/form
```

### yarn

```bash
yarn add @ldesign/form
```

### pnpm

```bash
pnpm add @ldesign/form
```

## CDN 引入

### 通过 unpkg

```html
<!-- 核心库 -->
<script src="https://unpkg.com/@ldesign/form@latest/dist/index.js"></script>

<!-- Vue3 集成 -->
<script src="https://unpkg.com/@ldesign/form@latest/dist/vue.js"></script>
```

### 通过 jsDelivr

```html
<!-- 核心库 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/form@latest/dist/index.js"></script>

<!-- Vue3 集成 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/form@latest/dist/vue.js"></script>
```

## 框架集成

### Vue3 项目

如果您使用 Vue3，建议安装完整版本：

```bash
npm install @ldesign/form vue@^3.0.0
```

然后在项目中注册插件：

```javascript
import { AdaptiveFormPlugin } from '@ldesign/form/vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 注册插件
app.use(AdaptiveFormPlugin, {
  // 全局配置
  theme: {
    primaryColor: '#1890ff'
  }
})

app.mount('#app')
```

### React 项目

React 集成正在开发中，敬请期待。

### 原生 JavaScript 项目

```javascript
import { AdaptiveForm } from '@ldesign/form'

// 或者使用适配器
import { JSAdapter } from '@ldesign/form/adapters'
```

## TypeScript 支持

本库完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type {
  FormConfig,
  FormItemConfig,
  ValidationResult
} from '@ldesign/form'

const config: FormConfig = {
  items: [
    {
      key: 'name',
      label: '姓名',
      type: 'input',
      required: true
    }
  ]
}
```

## 构建工具配置

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@ldesign/form']
  }
})
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@ldesign/form': '@ldesign/form/es'
    }
  }
}
```

### Rollup

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'

export default {
  plugins: [
    resolve({
      preferBuiltins: false
    })
  ]
}
```

## 样式引入

系统提供了基础样式，您可以选择引入：

```css
/* 引入基础样式 */
@import '@ldesign/form/dist/style.css';

/* 或者引入主题样式 */
@import '@ldesign/form/dist/themes/default.css';
```

## 验证安装

创建一个简单的示例来验证安装是否成功：

```html
<!doctype html>
<html>
  <head>
    <title>安装验证</title>
  </head>
  <body>
    <div id="form-container"></div>

    <script type="module">
      import { AdaptiveForm } from '@ldesign/form'

      const form = new AdaptiveForm({
        selector: '#form-container',
        items: [{ key: 'test', label: '测试字段', type: 'input' }],
      })

      console.log('安装成功！')
    </script>
  </body>
</html>
```

## 常见问题

### 模块解析错误

如果遇到模块解析错误，请检查：

1. Node.js 版本是否 >= 16
2. 包管理器是否正确安装了依赖
3. 构建工具配置是否正确

### TypeScript 类型错误

确保在 `tsconfig.json` 中包含了正确的类型：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Vue3 集成问题

确保 Vue 版本兼容：

```json
{
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

## 下一步

- 查看[快速开始](/guide/getting-started)
- 了解[基础概念](/guide/concepts)
- 探索[示例代码](/examples/basic)
