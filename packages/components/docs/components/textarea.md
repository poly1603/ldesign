# Textarea 多行文本框

用于输入多行文本信息。

## 基础用法

基础的多行文本框用法。

<ComponentDemo title="基础多行文本框" description="Textarea 组件提供了多行文本输入功能。">
  <template #demo>
    <ld-textarea placeholder="请输入多行文本内容"></ld-textarea>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-textarea placeholder="请输入多行文本内容"></ld-textarea>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-textarea placeholder="请输入多行文本内容"></ld-textarea>
```

  </template>
</ComponentDemo>

## 文本框尺寸

文本框有三种尺寸：small、medium（默认）、large。

<ComponentDemo title="文本框尺寸" description="通过设置 size 属性来配置文本框的尺寸。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-textarea size="small" placeholder="Small 尺寸" rows="3"></ld-textarea>
      <ld-textarea size="medium" placeholder="Medium 尺寸（默认）" rows="3"></ld-textarea>
      <ld-textarea size="large" placeholder="Large 尺寸" rows="3"></ld-textarea>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-textarea size="small" placeholder="Small 尺寸" rows="3"></ld-textarea>
    <ld-textarea size="medium" placeholder="Medium 尺寸（默认）" rows="3"></ld-textarea>
    <ld-textarea size="large" placeholder="Large 尺寸" rows="3"></ld-textarea>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-textarea size="small" placeholder="Small 尺寸" rows="3"></ld-textarea>
<ld-textarea size="medium" placeholder="Medium 尺寸（默认）" rows="3"></ld-textarea>
<ld-textarea size="large" placeholder="Large 尺寸" rows="3"></ld-textarea>
```

  </template>
</ComponentDemo>

## 禁用状态

文本框不可用状态。

<ComponentDemo title="禁用状态" description="添加 disabled 属性即可让文本框处于不可用状态。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-textarea disabled placeholder="禁用状态" rows="3"></ld-textarea>
      <ld-textarea disabled value="已有内容的禁用状态" rows="3"></ld-textarea>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-textarea disabled placeholder="禁用状态" rows="3"></ld-textarea>
    <ld-textarea disabled value="已有内容的禁用状态" rows="3"></ld-textarea>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-textarea disabled placeholder="禁用状态" rows="3"></ld-textarea>
<ld-textarea disabled value="已有内容的禁用状态" rows="3"></ld-textarea>
```

  </template>
</ComponentDemo>

## 只读状态

文本框只读状态。

<ComponentDemo title="只读状态" description="添加 readonly 属性即可让文本框处于只读状态。">
  <template #demo>
    <ld-textarea readonly value="只读状态的内容\n这是第二行内容" rows="3"></ld-textarea>
  </template>
  
  <template #code-vue>

```vue
<template>
  <ld-textarea readonly value="只读状态的内容\n这是第二行内容" rows="3"></ld-textarea>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-textarea readonly value="只读状态的内容
这是第二行内容" rows="3"></ld-textarea>
```

  </template>
</ComponentDemo>

## 字符计数

显示输入字符的统计。

<ComponentDemo title="字符计数" description="添加 show-count 属性即可显示字符计数。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-textarea show-count placeholder="显示字符计数" rows="3"></ld-textarea>
      <ld-textarea show-count maxlength="100" placeholder="限制最大长度并显示计数" rows="3"></ld-textarea>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-textarea show-count placeholder="显示字符计数" rows="3"></ld-textarea>
    <ld-textarea show-count maxlength="100" placeholder="限制最大长度并显示计数" rows="3"></ld-textarea>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-textarea show-count placeholder="显示字符计数" rows="3"></ld-textarea>
<ld-textarea show-count maxlength="100" placeholder="限制最大长度并显示计数" rows="3"></ld-textarea>
```

  </template>
</ComponentDemo>

## 自适应高度

文本框高度可根据内容自动调整。

<ComponentDemo title="自适应高度" description="添加 autosize 属性即可让文本框高度自适应内容。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-textarea autosize placeholder="自适应高度，输入更多内容试试"></ld-textarea>
      <ld-textarea autosize min-rows="2" max-rows="6" placeholder="限制最小2行，最大6行"></ld-textarea>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-textarea autosize placeholder="自适应高度，输入更多内容试试"></ld-textarea>
    <ld-textarea autosize min-rows="2" max-rows="6" placeholder="限制最小2行，最大6行"></ld-textarea>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-textarea autosize placeholder="自适应高度，输入更多内容试试"></ld-textarea>
<ld-textarea autosize min-rows="2" max-rows="6" placeholder="限制最小2行，最大6行"></ld-textarea>
```

  </template>
</ComponentDemo>

## 调整大小

控制文本框是否可以调整大小。

<ComponentDemo title="调整大小" description="通过 resize 属性控制文本框的调整大小行为。">
  <template #demo>
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ld-textarea resize="none" placeholder="禁止调整大小" rows="3"></ld-textarea>
      <ld-textarea resize="vertical" placeholder="只能垂直调整" rows="3"></ld-textarea>
      <ld-textarea resize="horizontal" placeholder="只能水平调整" rows="3"></ld-textarea>
      <ld-textarea resize="both" placeholder="可以任意调整" rows="3"></ld-textarea>
    </div>
  </template>
  
  <template #code-vue>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <ld-textarea resize="none" placeholder="禁止调整大小" rows="3"></ld-textarea>
    <ld-textarea resize="vertical" placeholder="只能垂直调整" rows="3"></ld-textarea>
    <ld-textarea resize="horizontal" placeholder="只能水平调整" rows="3"></ld-textarea>
    <ld-textarea resize="both" placeholder="可以任意调整" rows="3"></ld-textarea>
  </div>
</template>
```

  </template>
  
  <template #code-html>

```html
<ld-textarea resize="none" placeholder="禁止调整大小" rows="3"></ld-textarea>
<ld-textarea resize="vertical" placeholder="只能垂直调整" rows="3"></ld-textarea>
<ld-textarea resize="horizontal" placeholder="只能水平调整" rows="3"></ld-textarea>
<ld-textarea resize="both" placeholder="可以任意调整" rows="3"></ld-textarea>
```

  </template>
</ComponentDemo>

## 在 Vue 中使用

在 Vue 项目中使用 LDesign Textarea 组件。

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
    <ld-textarea 
      v-model:value="textareaValue"
      placeholder="请输入多行文本"
      show-count
      autosize
      :min-rows="2"
      :max-rows="6"
      @ldInput="handleInput"
      @ldChange="handleChange"
      @ldFocus="handleFocus"
      @ldBlur="handleBlur"
    ></ld-textarea>
    
    <p>当前值：{{ textareaValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const textareaValue = ref('');

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
| size | 文本框尺寸 | `string` | `small` / `medium` / `large` | `medium` |
| value | 文本框的值 | `string` | — | — |
| placeholder | 文本框占位文本 | `string` | — | — |
| disabled | 是否禁用 | `boolean` | — | `false` |
| readonly | 是否只读 | `boolean` | — | `false` |
| required | 是否必填 | `boolean` | — | `false` |
| maxlength | 最大输入长度 | `number` | — | — |
| minlength | 最小输入长度 | `number` | — | — |
| rows | 文本框行数 | `number` | — | `4` |
| cols | 文本框列数 | `number` | — | — |
| resize | 调整大小 | `string` | `none` / `both` / `horizontal` / `vertical` | `vertical` |
| showCount | 是否显示字符计数 | `boolean` | — | `false` |
| autosize | 是否自适应高度 | `boolean` | — | `false` |
| minRows | 自适应时的最小行数 | `number` | — | `1` |
| maxRows | 自适应时的最大行数 | `number` | — | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldInput | 输入时触发 | `(event: CustomEvent<{value: string}>) => void` |
| ldChange | 值改变时触发 | `(event: CustomEvent<{value: string}>) => void` |
| ldFocus | 获得焦点时触发 | `(event: CustomEvent) => void` |
| ldBlur | 失去焦点时触发 | `(event: CustomEvent) => void` |

## 主题定制

Textarea 组件使用 CSS 变量进行主题定制，你可以通过覆盖以下 CSS 变量来自定义文本框样式：

```css
:root {
  /* 文本框背景色 */
  --ld-textarea-bg-color: #ffffff;
  --ld-textarea-bg-color-hover: #f9fafb;
  --ld-textarea-bg-color-focus: #ffffff;
  --ld-textarea-bg-color-disabled: #f3f4f6;
  
  /* 文本框边框 */
  --ld-textarea-border-color: #d1d5db;
  --ld-textarea-border-color-hover: #9ca3af;
  --ld-textarea-border-color-focus: #646cff;
  --ld-textarea-border-color-disabled: #e5e7eb;
  
  /* 文本框文字颜色 */
  --ld-textarea-text-color: #111827;
  --ld-textarea-text-color-disabled: #9ca3af;
  --ld-textarea-placeholder-color: #9ca3af;
  
  /* 文本框圆角 */
  --ld-border-radius-base: 6px;
  
  /* 文本框字体大小 */
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