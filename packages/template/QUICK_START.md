# 快速开始

## 🚀 5 分钟上手

### 1. 安装

```bash
npm install @ldesign/template
# or
pnpm add @ldesign/template
# or
yarn add @ldesign/template
```

### 2. 初始化（在应用启动时）

```typescript
// main.ts 或 App.vue
import { getManager } from '@ldesign/template'

const manager = getManager()
await manager.initialize()

console.log('模板系统已就绪！')
```

### 3. 使用模板

#### 方式一：使用 Vue 组件（推荐）

```vue
<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    name="default"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { TemplateRenderer } from '@ldesign/template'

const handleSubmit = (data) => {
  console.log('登录数据:', data)
}
</script>
```

#### 方式二：使用 Composable

```vue
<template>
  <component :is="component" v-if="component" @submit="handleSubmit" />
  <div v-else-if="loading">加载中...</div>
  <div v-else-if="error">{{ error.message }}</div>
</template>

<script setup>
import { useTemplate } from '@ldesign/template'

const { component, loading, error } = useTemplate('login', 'desktop', 'default')

const handleSubmit = (data) => {
  console.log('登录数据:', data)
}
</script>
```

#### 方式三：使用 API

```typescript
import { getManager } from '@ldesign/template'

const manager = getManager()
const component = await manager.loadTemplate('login', 'desktop', 'default')
```

## 📚 下一步

- 查看 [使用示例](./USAGE_EXAMPLE.md) 了解更多用法
- 查看 [架构说明](./ARCHITECTURE_NEW.md) 了解系统设计
- 查看 [src/README.md](./src/README.md) 了解如何创建模板

## 💡 常见问题

### Q: 如何切换模板？

```vue
<script setup>
import { ref } from 'vue'

const templateName = ref('default')

function switchTemplate() {
  templateName.value = templateName.value === 'default' ? 'split' : 'default'
}
</script>

<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    :name="templateName"
  />
  <button @click="switchTemplate">切换模板</button>
</template>
```

### Q: 如何根据设备自动选择模板？

```vue
<script setup>
import { computed } from 'vue'

const device = computed(() => {
  const width = window.innerWidth
  return width < 768 ? 'mobile' : 'desktop'
})
</script>

<template>
  <TemplateRenderer
    category="login"
    :device="device"
    name="default"
  />
</template>
```

### Q: 如何查询可用模板？

```typescript
import { getManager } from '@ldesign/template'

const manager = getManager()
await manager.initialize()

// 获取所有模板
const allTemplates = await manager.getAllTemplates()

// 按分类查询
const loginTemplates = await manager.getTemplatesByCategory('login')

// 高级查询
const templates = await manager.queryTemplates({
  category: 'login',
  device: 'desktop',
  tags: 'simple'
})
```

## 🎨 创建自定义模板

### 1. 创建目录

```bash
mkdir -p src/templates/login/desktop/custom
```

### 2. 创建配置文件

`src/templates/login/desktop/custom/config.ts`

```typescript
import type { TemplateConfig } from '@ldesign/template'

export default {
  name: 'custom',
  displayName: '自定义登录',
  description: '我的自定义登录页面',
  version: '1.0.0',
  author: 'Your Name',
  tags: ['login', 'custom'],
} as TemplateConfig
```

### 3. 创建组件文件

`src/templates/login/desktop/custom/index.vue`

```vue
<template>
  <div class="custom-login">
    <h1>{{ title }}</h1>
    <!-- 你的模板内容 -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<style scoped>
.custom-login {
  /* 你的样式 */
}
</style>
```

### 4. 使用新模板

```vue
<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    name="custom"
    :component-props="{ title: '欢迎' }"
  />
</template>
```

完成！系统会自动识别并加载你的新模板。

## 🔗 相关链接

- [完整文档](./src/README.md)
- [使用示例](./USAGE_EXAMPLE.md)
- [架构说明](./ARCHITECTURE_NEW.md)
- [重构总结](./REFACTOR_SUMMARY.md)
