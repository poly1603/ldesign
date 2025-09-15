# 示例：主题切换

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/color/vue'
const { currentMode, toggleMode } = useTheme()
</script>

<template>
  <button @click="toggleMode">当前: {{ currentMode }}，点击切换</button>
</template>
```

