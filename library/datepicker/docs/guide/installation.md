# 安装

## 包管理器安装

### Vue 3

::: code-group

```bash [pnpm]
pnpm add @ldesign/datepicker-vue
```

```bash [npm]
npm install @ldesign/datepicker-vue
```

```bash [yarn]
yarn add @ldesign/datepicker-vue
```

:::

### React

::: code-group

```bash [pnpm]
pnpm add @ldesign/datepicker-react
```

```bash [npm]
npm install @ldesign/datepicker-react
```

```bash [yarn]
yarn add @ldesign/datepicker-react
```

:::

### Lit/Web Components

::: code-group

```bash [pnpm]
pnpm add @ldesign/datepicker-lit
```

```bash [npm]
npm install @ldesign/datepicker-lit
```

```bash [yarn]
yarn add @ldesign/datepicker-lit
```

:::

### 核心包（框架无关）

如果你想自己实现框架适配，可以只安装核心包：

```bash
pnpm add @ldesign/datepicker-core @ldesign/datepicker-shared
```

## CDN

你也可以通过 CDN 直接使用（适用于快速原型开发）：

### Vue 3

```html
<!-- 引入 Vue 3 -->
<script src="https://unpkg.com/vue@3"></script>

<!-- 引入 LDesign DatePicker -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/datepicker-vue/dist/style.css">
<script src="https://unpkg.com/@ldesign/datepicker-vue"></script>

<div id="app">
  <date-picker v-model="date"></date-picker>
</div>

<script>
  const { createApp, ref } = Vue;
  const { DatePicker } = LDatePickerVue;
  
  createApp({
    components: { DatePicker },
    setup() {
      const date = ref(null);
      return { date };
    }
  }).mount('#app');
</script>
```

### React

```html
<!-- 引入 React -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- 引入 LDesign DatePicker -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/datepicker-react/dist/style.css">
<script src="https://unpkg.com/@ldesign/datepicker-react"></script>

<div id="root"></div>

<script>
  const { useState } = React;
  const { DatePicker } = LDatePickerReact;
  
  function App() {
    const [date, setDate] = useState(null);
    return React.createElement(DatePicker, { value: date, onChange: setDate });
  }
  
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
</script>
```

### Web Components

```html
<!-- 引入 LDesign DatePicker -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/datepicker-lit/dist/style.css">
<script type="module" src="https://unpkg.com/@ldesign/datepicker-lit"></script>

<ldate-picker type="date"></ldate-picker>
```

## 导入样式

别忘了导入 CSS 样式文件：

```js
// Vue
import '@ldesign/datepicker-vue/style.css';

// React
import '@ldesign/datepicker-react/style.css';

// Lit
import '@ldesign/datepicker-lit/style.css';
```

## 按需导入

所有包都支持 Tree-shaking，打包工具会自动删除未使用的代码。

如果你只想导入特定的功能：

```js
// 只导入日期工具函数
import { formatDate, parseDate } from '@ldesign/datepicker-shared';

// 只导入核心状态管理
import { DatePickerCore } from '@ldesign/datepicker-core';
```

## TypeScript 支持

所有包都包含完整的 TypeScript 类型定义，无需额外安装 `@types` 包。

```ts
import type { PickerType, PickerValue, Locale } from '@ldesign/datepicker-shared';
```

## 版本要求

- Node.js >= 18
- Vue >= 3.3 (Vue 适配层)
- React >= 18.0 (React 适配层)
- Lit >= 3.0 (Lit 适配层)

## 浏览器兼容性

| Browser | Version |
|---------|---------|
| Chrome  | >= 90   |
| Firefox | >= 88   |
| Safari  | >= 14   |
| Edge    | >= 90   |

## 下一步

安装完成后，前往[快速开始](/guide/getting-started)开始使用。





