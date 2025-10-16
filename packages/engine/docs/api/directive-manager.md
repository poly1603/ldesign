# 指令管理器（DirectiveManager）

统一管理内置与自定义指令，提供适配器在 Vue 指令与引擎指令之间转换。

## 内置指令

- v-debounce / v-throttle
- v-click-outside
- v-loading
- v-copy
- v-infinite-scroll / v-lazy / v-resize / v-drag / v-tooltip

```vue
<template>
  <input v-debounce:input="onInput">
  <button v-throttle:click="onClick">
    提交
  </button>
  <div v-click-outside="onOutside">
    内容
  </div>
</template>
```

## 自定义指令（引擎风格）

```ts
import { defineEngineDirective } from '@ldesign/engine/directives'

export const myDirective = defineEngineDirective({
  name: 'my',
  mounted: () => { /* 无参数 */ },
})

engine.directives.register('my', myDirective)
```

## Vue 指令适配

```ts
import { createVueDirectiveAdapter } from '@ldesign/engine/directives'

const vueDirective = {
  mounted(el, binding) { /* ... */ },
}

app.directive('legacy', createVueDirectiveAdapter('legacy', vueDirective))
```

## API

- register(name, directive)
- registerBatch(map)
- get(name)
- getAll()
- remove(name)

