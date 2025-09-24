# Vue 组合式 API

这个目录包含了 @ldesign/color 的 Vue
3 组合式 API 实现，提供了一套完整的主题管理解决方案。

## 📁 文件结构

```
composables/
├── README.md                    # 本文件
├── useThemeSelector.ts          # 高级主题选择器
├── useThemeToggle.ts           # 简单主题切换
└── useSystemThemeSync.ts       # 系统主题同步
```

## 🚀 快速开始

### 安装插件

首先在您的 Vue 应用中安装 color 插件：

```typescript
// main.ts
import { createApp } from 'vue'
import { createColorPlugin } from '@ldesign/color/vue'
import App from './App.vue'

const app = createApp(App)

app.use(
  createColorPlugin({
    defaultTheme: 'blue',
    defaultMode: 'light',
  })
)

app.mount('#app')
```

### 使用组合式 API

```vue
<script setup>
import { useTheme } from '@ldesign/color/vue'

const { currentTheme, currentMode, setTheme, toggleMode } = useTheme()
</script>

<template>
  <div>
    <p>当前主题: {{ currentTheme }}</p>
    <button @click="toggleMode">切换模式</button>
  </div>
</template>
```

## 📚 API 概览

### useTheme

主要的主题管理 API，提供基础的主题控制功能。

**特性：**

- ✅ 响应式主题状态
- ✅ 主题和模式切换
- ✅ 与主题管理器集成
- ✅ 自动状态同步

**适用场景：**

- 基础主题切换需求
- 简单的明暗模式切换
- 与现有主题管理器集成

### useThemeSelector

高级主题选择器 API，提供完整的主题管理功能。

**特性：**

- ✅ 支持自定义主题
- ✅ 主题配置管理
- ✅ 自动存储同步
- ✅ 主题信息获取

**适用场景：**

- 复杂的主题选择界面
- 需要自定义主题的应用
- 主题配置管理

### useThemeToggle

简单的主题模式切换 API，专注于明暗模式切换。

**特性：**

- ✅ 简单的 API 设计
- ✅ 系统主题检测
- ✅ 切换回调支持
- ✅ 自动存储管理

**适用场景：**

- 只需要明暗模式切换
- 简单的切换按钮
- 系统主题跟随

### useSystemThemeSync

系统主题同步 API，与操作系统主题保持同步。

**特性：**

- ✅ 实时系统主题检测
- ✅ 自动同步机制
- ✅ 页面可见性优化
- ✅ 错误处理

**适用场景：**

- 需要跟随系统主题
- 自动主题切换
- 用户体验优化

## 🔧 高级用法

### 组合使用

您可以组合使用多个 API 来实现复杂的主题管理：

```vue
<script setup>
import {
  useTheme,
  useThemeSelector,
  useSystemThemeSync,
} from '@ldesign/color/vue'

// 基础主题管理
const theme = useTheme()

// 高级主题选择
const selector = useThemeSelector({
  customThemes: [
    {
      name: 'brand',
      displayName: '品牌主题',
      description: '符合品牌色彩的主题',
      builtin: false,
      light: { primary: '#1890ff' },
      dark: { primary: '#177ddc' },
    },
  ],
})

// 系统主题同步
const systemSync = useSystemThemeSync({
  autoStart: true,
  onSync: async systemTheme => {
    await theme.setMode(systemTheme)
  },
})
</script>
```

### 自定义存储

```typescript
const selector = useThemeSelector({
  autoSave: true,
  storageKey: 'my-app-theme',
  defaultTheme: 'custom',
})
```

### 回调处理

```typescript
const toggle = useThemeToggle({
  onBeforeToggle: async newMode => {
    // 切换前的准备工作
    console.log('准备切换到:', newMode)
  },
  onAfterToggle: async newMode => {
    // 切换后的清理工作
    console.log('已切换到:', newMode)
    // 可以在这里触发其他副作用
  },
})
```

## 🎯 最佳实践

### 1. 选择合适的 API

- **简单应用**：使用 `useTheme` 或 `useThemeToggle`
- **复杂应用**：使用 `useThemeSelector`
- **需要系统同步**：添加 `useSystemThemeSync`

### 2. 性能优化

```vue
<script setup>
// 避免在每个组件中都调用，考虑使用 provide/inject
const theme = useTheme()

// 在根组件中提供主题状态
provide('theme', theme)
</script>
```

### 3. 错误处理

```typescript
const systemSync = useSystemThemeSync({
  onError: error => {
    console.error('系统主题同步失败:', error)
    // 可以显示用户友好的错误信息
  },
})
```

### 4. 类型安全

```typescript
import type { ColorMode, ThemeConfig } from '@ldesign/color'

const customThemes: ThemeConfig[] = [
  // 类型安全的主题配置
]

const selector = useThemeSelector({
  customThemes,
  defaultMode: 'light' as ColorMode,
})
```

## 🔍 调试技巧

### 1. 开发模式调试

```typescript
const theme = useTheme()

// 在开发环境中监听主题变化
if (process.env.NODE_ENV === 'development') {
  watch([theme.currentTheme, theme.currentMode], ([theme, mode]) => {
    console.log('主题变化:', { theme, mode })
  })
}
```

### 2. 状态检查

```vue
<template>
  <div v-if="process.env.NODE_ENV === 'development'">
    <details>
      <summary>主题调试信息</summary>
      <pre>{{
        JSON.stringify(
          {
            currentTheme: theme.currentTheme,
            currentMode: theme.currentMode,
            availableThemes: theme.availableThemes,
          },
          null,
          2
        )
      }}</pre>
    </details>
  </div>
</template>
```

## 📖 相关文档

- [Vue 组合式 API 详细文档](../../docs/api/vue-composables.md)
- [Vue 插件文档](../plugin.ts)
- [Vue 组件文档](../components/)
- [主题管理指南](../../docs/guide/theme-management.md)

## 🤝 贡献

如果您发现问题或有改进建议，请：

1. 查看现有的 [Issues](https://github.com/ldesign/color/issues)
2. 创建新的 Issue 或 Pull Request
3. 遵循项目的代码规范和测试要求

## 📄 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](../../../../LICENSE) 文件。
