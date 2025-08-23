# Button 按钮

按钮用于触发一个操作，如提交表单、打开对话框、取消操作等。

## 基础用法

基础的按钮用法。

<ComponentDemo title="基础按钮" description="Button 组件提供了四种基础类型：primary、secondary、danger 和 ghost。">
  <template #demo>
    <ld-button type="primary">Primary</ld-button>
    <ld-button type="secondary">Secondary</ld-button>
    <ld-button type="danger">Danger</ld-button>
    <ld-button type="ghost">Ghost</ld-button>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-button type="primary">Primary</ld-button>
  <ld-button type="secondary">Secondary</ld-button>
  <ld-button type="danger">Danger</ld-button>
  <ld-button type="ghost">Ghost</ld-button>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-button type="primary">Primary</ld-button>
<ld-button type="secondary">Secondary</ld-button>
<ld-button type="danger">Danger</ld-button>
<ld-button type="ghost">Ghost</ld-button>
```

  </template>
</ComponentDemo>

## 按钮尺寸

按钮有三种尺寸：small、medium（默认）、large。

<ComponentDemo title="按钮尺寸" description="通过设置 size 属性来配置按钮的尺寸。">
  <template #demo>
    <ld-button size="small">Small</ld-button>
    <ld-button size="medium">Medium</ld-button>
    <ld-button size="large">Large</ld-button>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-button size="small">Small</ld-button>
  <ld-button size="medium">Medium</ld-button>
  <ld-button size="large">Large</ld-button>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-button size="small">Small</ld-button>
<ld-button size="medium">Medium</ld-button>
<ld-button size="large">Large</ld-button>
```

  </template>
</ComponentDemo>

## 禁用状态

按钮不可用状态。

<ComponentDemo title="禁用状态" description="添加 disabled 属性即可让按钮处于不可用状态。">
  <template #demo>
    <ld-button disabled>Disabled</ld-button>
    <ld-button type="primary" disabled>Primary Disabled</ld-button>
    <ld-button type="danger" disabled>Danger Disabled</ld-button>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-button disabled>Disabled</ld-button>
  <ld-button type="primary" disabled>Primary Disabled</ld-button>
  <ld-button type="danger" disabled>Danger Disabled</ld-button>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-button disabled>Disabled</ld-button>
<ld-button type="primary" disabled>Primary Disabled</ld-button>
<ld-button type="danger" disabled>Danger Disabled</ld-button>
```

  </template>
</ComponentDemo>

## 加载状态

点击按钮后进行数据加载操作，在按钮上显示加载状态。

<ComponentDemo title="加载状态" description="添加 loading 属性即可让按钮处于加载状态。">
  <template #demo>
    <ld-button loading>Loading</ld-button>
    <ld-button type="primary" loading>Primary Loading</ld-button>
    <ld-button type="danger" loading>Danger Loading</ld-button>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-button loading>Loading</ld-button>
  <ld-button type="primary" loading>Primary Loading</ld-button>
  <ld-button type="danger" loading>Danger Loading</ld-button>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-button loading>Loading</ld-button>
<ld-button type="primary" loading>Primary Loading</ld-button>
<ld-button type="danger" loading>Danger Loading</ld-button>
```

  </template>
</ComponentDemo>

## 在 Vue 中使用

在 Vue 项目中使用 LDesign Button 组件。

### 1. 安装

```bash
npm install @ldesign/web-components
```

### 2. 引入组件

```typescript
// main.ts
import { createApp } from 'vue';
import { defineCustomElements } from '@ldesign/web-components/loader';
import App from './App.vue';

// 定义自定义元素
defineCustomElements();

const app = createApp(App);
app.mount('#app');
```

### 3. 配置 Vue 编译器

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将所有以 ld- 开头的标签视为自定义元素
          isCustomElement: (tag) => tag.startsWith('ld-')
        }
      }
    })
  ]
});
```

### 4. 在组件中使用

```vue
<template>
  <div>
    <ld-button 
      type="primary" 
      @ldClick="handleClick"
    >
      点击我
    </ld-button>
  </div>
</template>

<script setup lang="ts">
const handleClick = (event: CustomEvent) => {
  console.log('按钮被点击了', event.detail);
};
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 按钮类型 | `string` | `primary` / `secondary` / `danger` / `ghost` | `secondary` |
| size | 按钮尺寸 | `string` | `small` / `medium` / `large` | `medium` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| loading | 是否加载中 | `boolean` | — | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldClick | 点击按钮时触发 | `(event: CustomEvent) => void` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 按钮内容 |

## 主题定制

Button 组件使用 CSS 变量进行主题定制，你可以通过覆盖以下 CSS 变量来自定义按钮样式：

```css
:root {
  /* 主色调 */
  --ld-color-primary: #646cff;
  --ld-color-primary-hover: #535bf2;
  --ld-color-primary-active: #454ce1;
  
  /* 次要色调 */
  --ld-color-secondary: #6b7280;
  --ld-color-secondary-hover: #4b5563;
  --ld-color-secondary-active: #374151;
  
  /* 危险色调 */
  --ld-color-danger: #ef4444;
  --ld-color-danger-hover: #dc2626;
  --ld-color-danger-active: #b91c1c;
  
  /* 按钮圆角 */
  --ld-border-radius-base: 6px;
  
  /* 按钮字体 */
  --ld-font-size-small: 12px;
  --ld-font-size-medium: 14px;
  --ld-font-size-large: 16px;
}
```

### 暗黑主题

组件支持暗黑主题，通过在根元素添加 `data-theme="dark"` 属性即可启用：

```html
<html data-theme="dark">
  <!-- 页面内容 -->
</html>
```

或者使用 JavaScript 动态切换：

```javascript
import { setThemeMode } from '@ldesign/web-components';

// 切换到暗黑主题
setThemeMode('dark');

// 切换到亮色主题
setThemeMode('light');

// 自动切换主题
setThemeMode('auto');
```



