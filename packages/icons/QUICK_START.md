# LDesign Icons 快速开始

## 安装

### Vue 3
```bash
npm install @ldesign/icons-vue
# or
yarn add @ldesign/icons-vue
# or  
pnpm add @ldesign/icons-vue
```

### React
```bash
npm install @ldesign/icons-react
```

### Vue 2
```bash
npm install @ldesign/icons-vue2
```

### Web Components (Lit)
```bash
npm install @ldesign/icons-lit
```

## 使用示例

### Vue 3
```vue
<template>
  <div>
    <!-- 基础用法 -->
    <HomeIcon />
    
    <!-- 自定义大小和颜色 -->
    <UserIcon :size="32" color="#1890ff" />
    
    <!-- 带旋转动画 -->
    <SettingsIcon :spin="true" />
    
    <!-- 响应式大小 -->
    <SearchIcon :size="iconSize" @click="handleSearch" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { HomeIcon, UserIcon, SettingsIcon, SearchIcon } from '@ldesign/icons-vue'
// 导入样式（只需导入一次）
import '@ldesign/icons-vue/style.css'

const iconSize = ref(24)
const handleSearch = () => {
  console.log('Search clicked')
}
</script>
```

### React
```tsx
import React, { useState } from 'react'
import { HomeIcon, UserIcon, SettingsIcon, SearchIcon } from '@ldesign/icons-react'
import '@ldesign/icons-react/style.css'

function App() {
  const [loading, setLoading] = useState(false)
  
  return (
    <div>
      {/* 基础用法 */}
      <HomeIcon />
      
      {/* 自定义属性 */}
      <UserIcon size={32} color="#1890ff" />
      
      {/* 带旋转动画 */}
      <SettingsIcon spin={loading} />
      
      {/* 事件处理 */}
      <SearchIcon 
        size={24} 
        onClick={() => console.log('Search clicked')}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )
}
```

### Vue 2
```vue
<template>
  <div>
    <home-icon />
    <user-icon :size="32" color="#1890ff" />
    <settings-icon :spin="loading" />
  </div>
</template>

<script>
import { HomeIcon, UserIcon, SettingsIcon } from '@ldesign/icons-vue2'
import '@ldesign/icons-vue2/style.css'

export default {
  components: {
    HomeIcon,
    UserIcon,
    SettingsIcon
  },
  data() {
    return {
      loading: false
    }
  }
}
</script>
```

### Web Components
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@ldesign/icons-lit'
  </script>
</head>
<body>
  <!-- 基础用法 -->
  <ld-home-icon></ld-home-icon>
  
  <!-- 自定义属性 -->
  <ld-user-icon size="32" color="#1890ff"></ld-user-icon>
  
  <!-- 带旋转动画 -->
  <ld-settings-icon spin></ld-settings-icon>
  
  <!-- JavaScript 控制 -->
  <ld-search-icon id="search"></ld-search-icon>
  
  <script>
    const searchIcon = document.getElementById('search')
    searchIcon.size = '24'
    searchIcon.addEventListener('click', () => {
      console.log('Search clicked')
    })
  </script>
</body>
</html>
```

## API 参考

### 通用属性

所有图标组件都支持以下属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| size | string \| number | '1em' | 图标大小 |
| color | string | 'currentColor' | 图标颜色 |
| strokeWidth | string \| number | 2 | 线条宽度（仅 outline 风格） |
| spin | boolean | false | 是否旋转 |

### Vue 特有

Vue 组件额外支持：
- 所有原生 DOM 属性通过 `v-bind="$attrs"` 透传
- 支持 `v-on` 事件绑定
- 支持插槽 `<slot>`

### React 特有

React 组件额外支持：
- 继承所有 `React.SVGProps<SVGSVGElement>` 属性
- 支持 `ref` 转发
- 支持 `className` 和 `style`

### Web Components 特有

Web Components 额外支持：
- Shadow DOM 隔离
- CSS 自定义属性：`--ld-icon-size`
- 原生事件监听
- `part` 属性用于样式穿透

## 进阶用法

### 按需导入

```js
// 只导入需要的图标，减小打包体积
import HomeIcon from '@ldesign/icons-vue/es/HomeIcon'
import UserIcon from '@ldesign/icons-vue/es/UserIcon'
```

### 自定义样式

```css
/* 全局样式 */
.ld-icon-spin {
  animation-duration: 2s; /* 修改旋转速度 */
}

/* Vue/React 组件样式 */
.my-icon {
  transition: all 0.3s;
}
.my-icon:hover {
  color: #1890ff;
  transform: scale(1.2);
}
```

### TypeScript 支持

```typescript
import type { IconName, IconComponentName } from '@ldesign/icons-vue'

const iconName: IconName = 'home' // 类型安全的图标名
const componentName: IconComponentName = 'Home' // 类型安全的组件名
```

### 动态图标

```vue
<template>
  <component :is="currentIcon" :size="24" />
</template>

<script setup>
import { computed } from 'vue'
import * as icons from '@ldesign/icons-vue'

const props = defineProps<{
  name: string
}>()

const currentIcon = computed(() => {
  const iconName = `${props.name}Icon`
  return icons[iconName]
})
</script>
```

## 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 51+ |
| Firefox | 54+ |
| Safari | 10+ |
| Edge | 79+ |
| IE | 不支持 |

## 常见问题

### Q: 如何修改所有图标的默认大小？

A: 可以通过 CSS 变量全局设置：
```css
:root {
  --ld-icon-size: 20px;
}
```

### Q: 支持 SSR 吗？

A: Vue 和 React 版本完全支持 SSR。Web Components 版本需要在客户端渲染。

### Q: 如何添加自定义图标？

A: 将 SVG 文件放入 `assets/svg/` 目录，然后运行构建命令：
```bash
npm run build:svg
npm run build:components
npm run build
```

## 获取帮助

- 📖 [完整文档](https://github.com/ldesign/icons)
- 🐛 [报告问题](https://github.com/ldesign/icons/issues)
- 💬 [讨论区](https://github.com/ldesign/icons/discussions)
