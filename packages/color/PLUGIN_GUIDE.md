# Color Plugin 使用指南

## 🎯 为什么需要 Plugin 系统？

Color Plugin 提供了完整的主题管理能力，而不仅仅是一个组件。它支持：

- ✅ 全局配置（前缀、存储方式等）
- ✅ 自定义预设主题
- ✅ 禁用不需要的内置主题
- ✅ 生命周期钩子（切换前后、保存时等）
- ✅ 自定义存储（如存储到数据库）
- ✅ 主题持久化控制
- ✅ 统一的主题管理

## 📦 安装和配置

### 基础配置

```typescript
// main.ts
import { createApp } from 'vue'
import { createColorPlugin } from '@ldesign/color'
import App from './App.vue'

const app = createApp(App)

// 创建 color plugin
const colorPlugin = createColorPlugin({
  prefix: 'my-app',              // CSS 变量前缀
  defaultTheme: 'blue',          // 默认主题
  persistence: true,             // 启用持久化
  storageKey: 'my-app-theme',    // 存储键名
})

// 安装 plugin
app.use(colorPlugin)
app.mount('#app')
```

### 完整配置示例

```typescript
import { createColorPlugin } from '@ldesign/color'

const colorPlugin = createColorPlugin({
  // 基础配置
  prefix: 'my-app',
  storageKey: 'my-app-theme',
  
  // 持久化配置
  persistence: true,
  storageType: 'localStorage', // 'localStorage' | 'sessionStorage' | 'custom'
  
  // 预设主题配置
  presets: 'all', // 使用所有内置主题
  disabledPresets: ['gray', 'dark-blue'], // 禁用特定主题
  
  // 自定义主题
  customThemes: [
    {
      name: 'brand',
      label: '品牌色',
      color: '#FF6B6B',
      description: '公司品牌色'
    },
    {
      name: 'custom-green',
      label: '自定义绿',
      color: '#00D9A3'
    }
  ],
  
  // 自动应用
  autoApply: true,
  defaultTheme: 'brand',
  
  // CSS 变量配置
  includeSemantics: true,
  includeGrays: true,
  
  // 自定义颜色名称映射
  nameMap: {
    primary: 'brand',
    success: 'positive',
    danger: 'negative'
  },
  
  // 生命周期钩子
  hooks: {
    // 主题切换前
    beforeChange: async (newTheme, oldTheme) => {
      console.log('切换主题:', oldTheme?.themeName, '->', newTheme.themeName)
      
      // 返回 false 可以取消切换
      if (newTheme.themeName === 'forbidden') {
        return false
      }
      
      return true
    },
    
    // 主题切换后
    afterChange: async (theme) => {
      console.log('主题已切换:', theme)
      
      // 发送分析事件
      analytics.track('theme_changed', {
        theme: theme.themeName,
        color: theme.primaryColor
      })
    },
    
    // 从存储加载时
    onLoad: async (theme) => {
      console.log('主题已加载:', theme)
    },
    
    // 保存到存储时
    onSave: async (theme) => {
      console.log('主题已保存:', theme)
      
      // 同步到服务器
      await fetch('/api/user/theme', {
        method: 'POST',
        body: JSON.stringify(theme)
      })
    },
    
    // 错误处理
    onError: (error) => {
      console.error('主题系统错误:', error)
      // 上报错误
      errorReporter.report(error)
    }
  }
})
```

### 自定义存储（存储到数据库）

```typescript
const colorPlugin = createColorPlugin({
  persistence: true,
  storageType: 'custom',
  
  storage: {
    // 从数据库读取
    async getItem(key: string) {
      try {
        const response = await fetch(`/api/user/settings/${key}`)
        if (!response.ok) return null
        const data = await response.json()
        return data.value
      } catch {
        return null
      }
    },
    
    // 保存到数据库
    async setItem(key: string, value: string) {
      await fetch(`/api/user/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      })
    },
    
    // 从数据库删除
    async removeItem(key: string) {
      await fetch(`/api/user/settings/${key}`, {
        method: 'DELETE'
      })
    }
  }
})
```

## 🎨 在组件中使用

### 使用 Composable

```vue
<script setup lang="ts">
import { useColorPlugin } from '@ldesign/color'

const color = useColorPlugin()

// 获取可用的预设主题
const presets = color.presets

// 获取当前主题
const currentTheme = color.getCurrentTheme()

// 切换到预设主题
const switchToBlue = async () => {
  await color.applyPresetTheme('blue')
}

// 应用自定义颜色
const applyCustomColor = async () => {
  await color.applyTheme('#FF6B6B')
}

// 监听主题变化
color.onChange((theme) => {
  console.log('主题变化:', theme)
})
</script>

<template>
  <div>
    <h2>当前主题: {{ currentTheme?.themeName }}</h2>
    
    <div class="theme-list">
      <button
        v-for="preset in presets"
        :key="preset.name"
        @click="color.applyPresetTheme(preset.name)"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>
```

### 使用内置组件

```vue
<script setup lang="ts">
import { VueThemePicker } from '@ldesign/color/vue'
import { useColorPlugin } from '@ldesign/color'

const color = useColorPlugin()

// 组件会自动使用 plugin 的配置
// 显示的预设主题列表来自 plugin 配置
</script>

<template>
  <VueThemePicker />
</template>
```

## 🔧 高级用法

### 动态添加主题

```typescript
const color = useColorPlugin()

// 运行时添加新主题
color.presets.push({
  name: 'dynamic-theme',
  label: '动态主题',
  color: '#00FF00'
})
```

### 主题切换动画

```typescript
const colorPlugin = createColorPlugin({
  hooks: {
    beforeChange: async (newTheme) => {
      // 添加过渡类
      document.body.classList.add('theme-transitioning')
      return true
    },
    
    afterChange: async () => {
      // 等待动画完成后移除类
      await new Promise(resolve => setTimeout(resolve, 300))
      document.body.classList.remove('theme-transitioning')
    }
  }
})
```

```css
/* 主题切换动画 */
body.theme-transitioning * {
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}
```

### 权限控制

```typescript
const colorPlugin = createColorPlugin({
  hooks: {
    beforeChange: async (newTheme) => {
      // 检查用户是否有权限使用该主题
      if (newTheme.themeName === 'premium') {
        const hasPermission = await checkUserPermission('premium_theme')
        if (!hasPermission) {
          alert('该主题仅供会员使用')
          return false
        }
      }
      return true
    }
  }
})
```

### 主题使用统计

```typescript
const colorPlugin = createColorPlugin({
  hooks: {
    afterChange: async (theme) => {
      // 记录主题使用情况
      await fetch('/api/analytics/theme-usage', {
        method: 'POST',
        body: JSON.stringify({
          theme: theme.themeName,
          timestamp: Date.now(),
          userId: getCurrentUserId()
        })
      })
    }
  }
})
```

## 📊 完整示例

```typescript
// main.ts
import { createApp } from 'vue'
import { createColorPlugin } from '@ldesign/color'
import App from './App.vue'

const app = createApp(App)

const colorPlugin = createColorPlugin({
  prefix: 'my-app',
  defaultTheme: 'blue',
  
  // 只使用部分内置主题
  presets: 'all',
  disabledPresets: ['gray'],
  
  // 添加自定义主题
  customThemes: [
    {
      name: 'brand-primary',
      label: '品牌主色',
      color: '#FF6B6B',
      description: '公司品牌主色调'
    },
    {
      name: 'brand-secondary',
      label: '品牌辅色',
      color: '#4ECDC4'
    }
  ],
  
  // 持久化到数据库
  persistence: true,
  storageType: 'custom',
  storage: {
    async getItem(key) {
      const res = await fetch(`/api/settings/${key}`)
      return res.ok ? (await res.json()).value : null
    },
    async setItem(key, value) {
      await fetch(`/api/settings/${key}`, {
        method: 'POST',
        body: JSON.stringify({ value })
      })
    },
    async removeItem(key) {
      await fetch(`/api/settings/${key}`, { method: 'DELETE' })
    }
  },
  
  // 生命周期钩子
  hooks: {
    beforeChange: async (newTheme) => {
      console.log('准备切换主题:', newTheme.themeName)
      return true
    },
    
    afterChange: async (theme) => {
      console.log('主题已切换:', theme.themeName)
      
      // 发送分析事件
      window.gtag?.('event', 'theme_change', {
        theme_name: theme.themeName
      })
    },
    
    onSave: async (theme) => {
      console.log('主题已保存到服务器')
    },
    
    onError: (error) => {
      console.error('主题错误:', error)
    }
  }
})

app.use(colorPlugin)
app.mount('#app')
```

## 📚 总结

使用 Color Plugin 的优势：

1. **统一管理**：全局配置，所有组件共享
2. **灵活配置**：支持自定义主题、存储、钩子
3. **类型安全**：完整的 TypeScript 支持
4. **扩展性强**：通过钩子实现自定义逻辑
5. **易于使用**：简单的 API，强大的功能

参考 `@ldesign/router` 和 `@ldesign/i18n` 的设计模式，Color Plugin 提供了一致的开发体验！
