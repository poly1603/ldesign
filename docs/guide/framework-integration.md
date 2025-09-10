# 框架集成

LDesign 基于 Web Components，可在不同前端框架中无缝使用。本页给出最小可用示例与注意事项。

## 原生 HTML

无需适配器，直接使用：

```html
<script type="module" src="https://unpkg.com/@ldesign/component/dist/ldesign/ldesign.esm.js"></script>
<ld-button type="primary">Hello</ld-button>
```

## Vue 3

安装适配器：

```bash
npm install @ldesign/component-vue
```

在组件中直接使用 `<ld-*>`：

```vue
<template>
  <ld-button type="primary" @click="onClick">点击我</ld-button>
  <ld-input v-model="value" placeholder="请输入" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
const onClick = () => console.log('clicked')
</script>
```

## React

安装适配器：

```bash
npm install @ldesign/component-react
```

在组件中使用：

```jsx
import { LdButton, LdInput } from '@ldesign/component-react'

export default function App() {
  const [value, setValue] = useState('')
  return (
    <>
      <LdButton type="primary" onClick={() => console.log('clicked')}>按钮</LdButton>
      <LdInput value={value} onInput={(e) => setValue(e.target.value)} />
    </>
  )
}
```

## Angular

无需适配器，建议在模块中启用自定义元素 schema：

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@NgModule({
  declarations: [...],
  imports: [...],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

在 `index.html` 中引入运行时：

```html
<script type="module" src="https://unpkg.com/@ldesign/component/dist/ldesign/ldesign.esm.js"></script>
```

然后可直接在模板中使用：

```html
<ld-button type="primary">提交</ld-button>
<ld-input placeholder="请输入" />
```

## 常见问题

- 属性与事件：Web Components 使用原生事件机制；React 适配器已做封装，Vue 可用 `@event` 监听。
- 表单双向绑定：Vue 使用 `v-model`，React 通过 `value` 和 `onInput` 组合实现。

## 相关文档

- [快速开始](./getting-started)
- [安装](./installation)
- [主题定制](./theming)

