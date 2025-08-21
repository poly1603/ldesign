# Input 输入框

通过鼠标或键盘输入字符。

## 基础用法

基础的输入框用法。

<ComponentDemo title="基础输入框" description="Input 组件提供了基础的文本输入功能。">
  <template #demo>
    <ld-input placeholder="请输入内容"></ld-input>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-input placeholder="请输入内容"></ld-input>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input placeholder="请输入内容"></ld-input>
```

  </template>
</ComponentDemo>

## 输入框尺寸

输入框有三种尺寸：small、medium（默认）、large。

<ComponentDemo title="输入框尺寸" description="通过设置 size 属性来配置输入框的尺寸。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-input size="small" placeholder="Small 尺寸"></ld-input>
      <ld-input size="medium" placeholder="Medium 尺寸（默认）"></ld-input>
      <ld-input size="large" placeholder="Large 尺寸"></ld-input>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-input size="small" placeholder="Small 尺寸"></ld-input>
    <ld-input size="medium" placeholder="Medium 尺寸（默认）"></ld-input>
    <ld-input size="large" placeholder="Large 尺寸"></ld-input>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input size="small" placeholder="Small 尺寸"></ld-input>
<ld-input size="medium" placeholder="Medium 尺寸（默认）"></ld-input>
<ld-input size="large" placeholder="Large 尺寸"></ld-input>
```

  </template>
</ComponentDemo>

## 禁用状态

输入框不可用状态。

<ComponentDemo title="禁用状态" description="添加 disabled 属性即可让输入框处于不可用状态。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-input disabled placeholder="禁用状态"></ld-input>
      <ld-input disabled value="已有内容的禁用状态"></ld-input>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-input disabled placeholder="禁用状态"></ld-input>
    <ld-input disabled value="已有内容的禁用状态"></ld-input>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input disabled placeholder="禁用状态"></ld-input>
<ld-input disabled value="已有内容的禁用状态"></ld-input>
```

  </template>
</ComponentDemo>

## 只读状态

输入框只读状态。

<ComponentDemo title="只读状态" description="添加 readonly 属性即可让输入框处于只读状态。">
  <template #demo>
    <ld-input readonly value="只读状态的内容"></ld-input>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-input readonly value="只读状态的内容"></ld-input>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input readonly value="只读状态的内容"></ld-input>
```

  </template>
</ComponentDemo>

## 可清空

可以快速清空输入框内容。

<ComponentDemo title="可清空" description="添加 clearable 属性即可得到一个可清空的输入框。">
  <template #demo>
    <ld-input clearable placeholder="可清空的输入框" value="可以清空我"></ld-input>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-input clearable placeholder="可清空的输入框" value="可以清空我"></ld-input>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input clearable placeholder="可清空的输入框" value="可以清空我"></ld-input>
```

  </template>
</ComponentDemo>

## 密码输入框

用于输入密码的输入框。

<ComponentDemo title="密码输入框" description="添加 show-password 属性即可得到一个可切换显示隐藏的密码输入框。">
  <template #demo>
    <ld-input type="password" show-password placeholder="请输入密码"></ld-input>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-input type="password" show-password placeholder="请输入密码"></ld-input>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input type="password" show-password placeholder="请输入密码"></ld-input>
```

  </template>
</ComponentDemo>

## 输入长度限制

限制输入内容的长度。

<ComponentDemo title="输入长度限制" description="使用 maxlength 和 minlength 属性来限制输入内容的长度。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-input maxlength="10" placeholder="最多输入10个字符"></ld-input>
      <ld-input minlength="5" placeholder="最少输入5个字符"></ld-input>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-input maxlength="10" placeholder="最多输入10个字符"></ld-input>
    <ld-input minlength="5" placeholder="最少输入5个字符"></ld-input>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input maxlength="10" placeholder="最多输入10个字符"></ld-input>
<ld-input minlength="5" placeholder="最少输入5个字符"></ld-input>
```

  </template>
</ComponentDemo>

## 输入验证

使用正则表达式验证输入内容。

<ComponentDemo title="输入验证" description="使用 pattern 属性来验证输入内容格式。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-input pattern="[0-9]*" placeholder="只能输入数字"></ld-input>
      <ld-input pattern="[a-zA-Z]*" placeholder="只能输入字母"></ld-input>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-input pattern="[0-9]*" placeholder="只能输入数字"></ld-input>
    <ld-input pattern="[a-zA-Z]*" placeholder="只能输入字母"></ld-input>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-input pattern="[0-9]*" placeholder="只能输入数字"></ld-input>
<ld-input pattern="[a-zA-Z]*" placeholder="只能输入字母"></ld-input>
```

  </template>
</ComponentDemo>

## 在 Vue 中使用

在 Vue 项目中使用 LDesign Input 组件。

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
    <ld-input 
      v-model:value="inputValue"
      placeholder="请输入内容"
      @ldInput="handleInput"
      @ldChange="handleChange"
      @ldFocus="handleFocus"
      @ldBlur="handleBlur"
    ></ld-input>
    
    <p>当前值：{{ inputValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputValue = ref('');

const handleInput = (event: CustomEvent) => {
  console.log('输入中', event.detail.value);
};

const handleChange = (event: CustomEvent) => {
  console.log('值改变', event.detail.value);
};

const handleFocus = (event: CustomEvent) => {
  console.log('获得焦点');
};

const handleBlur = (event: CustomEvent) => {
  console.log('失去焦点');
};
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 输入框类型 | `string` | `text` / `password` / `email` / `number` / `tel` / `url` | `text` |
| size | 输入框尺寸 | `string` | `small` / `medium` / `large` | `medium` |
| value | 输入框的值 | `string` | — | — |
| placeholder | 输入框占位文本 | `string` | — | — |
| disabled | 是否禁用 | `boolean` | — | `false` |
| readonly | 是否只读 | `boolean` | — | `false` |
| required | 是否必填 | `boolean` | — | `false` |
| maxlength | 最大输入长度 | `number` | — | — |
| minlength | 最小输入长度 | `number` | — | — |
| pattern | 输入验证的正则表达式 | `string` | — | — |
| clearable | 是否可清空 | `boolean` | — | `false` |
| showPassword | 是否显示密码切换按钮 | `boolean` | — | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldInput | 输入时触发 | `(event: CustomEvent<{value: string}>) => void` |
| ldChange | 值改变时触发 | `(event: CustomEvent<{value: string}>) => void` |
| ldFocus | 获得焦点时触发 | `(event: CustomEvent) => void` |
| ldBlur | 失去焦点时触发 | `(event: CustomEvent) => void` |
| ldClear | 清空按钮点击时触发 | `(event: CustomEvent) => void` |

## 主题定制

Input 组件使用 CSS 变量进行主题定制，你可以通过覆盖以下 CSS 变量来自定义输入框样式：

```css
:root {
  /* 输入框背景色 */
  --ld-input-bg-color: #ffffff;
  --ld-input-bg-color-hover: #f9fafb;
  --ld-input-bg-color-focus: #ffffff;
  --ld-input-bg-color-disabled: #f3f4f6;
  
  /* 输入框边框 */
  --ld-input-border-color: #d1d5db;
  --ld-input-border-color-hover: #9ca3af;
  --ld-input-border-color-focus: #646cff;
  --ld-input-border-color-disabled: #e5e7eb;
  
  /* 输入框文字颜色 */
  --ld-input-text-color: #111827;
  --ld-input-text-color-disabled: #9ca3af;
  --ld-input-placeholder-color: #9ca3af;
  
  /* 输入框圆角 */
  --ld-border-radius-base: 6px;
  
  /* 输入框字体大小 */
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

