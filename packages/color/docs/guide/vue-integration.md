# Vue 3 集成

本页介绍如何在 Vue 3 中使用插件与组合式 API。

## 安装插件

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { createColorPlugin } from '@ldesign/color/vue'

const app = createApp(App)
app.use(
  createColorPlugin({
    defaultTheme: 'default',
    defaultMode: 'light',
  })
)
app.mount('#app')
```

## 组合式 API：useTheme

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  isDark,
  setTheme,
  toggleMode,
  availableThemes,
} = useTheme()
</script>

<template>
  <div>
    <select :value="currentTheme" @change="setTheme($event.target.value)">
      <option v-for="t in availableThemes" :key="t" :value="t">{{ t }}</option>
    </select>

    <button @click="toggleMode">切换到{{ isDark ? '亮色' : '暗色' }}</button>
  </div>
</template>
```

更多组合式 API 详见 API - Vue 组合式。
