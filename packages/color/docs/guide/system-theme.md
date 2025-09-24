# 系统主题检测

## 工具函数

```ts
import {
  getSystemTheme,
  watchSystemTheme,
  isSystemThemeSupported,
} from '@ldesign/color'

console.log(getSystemTheme()) // 'light' | 'dark'

const unwatch = watchSystemTheme(mode => console.log('system:', mode))
// ... 需要时取消：unwatch()

console.log(isSystemThemeSupported())
```

## Vue 组合式：useSystemThemeSync

```vue
<script setup lang="ts">
import { useSystemThemeSync } from '@ldesign/color/vue'

const { systemTheme, isSupported, isSyncing, toggleSync } = useSystemThemeSync({
  autoStart: true,
})
</script>
```
