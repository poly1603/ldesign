# 颜色主题管理模块

这个模块为应用提供完整的颜色主题管理功能，基于 `@ldesign/color` 包实现。

## 📁 模块结构

```
color/
├── README.md          # 本文件 - 模块使用说明
└── index.ts           # 主题插件配置和导出
```

## 🚀 功能特性

### 核心功能
- ✅ **多主题支持** - 内置12个精心设计的预设主题
- ✅ **明暗模式** - 完整的明暗模式切换支持
- ✅ **系统主题同步** - 自动跟随操作系统主题设置
- ✅ **CSS变量注入** - 自动生成和注入主题CSS变量
- ✅ **性能优化** - 智能缓存和闲时处理
- ✅ **Vue组件** - 开箱即用的主题切换组件

### 预设主题
- **Arco蓝** (default) - 专业稳重的蓝色主题
- **Arco绿** (green) - 清新自然的绿色主题
- **魅力紫** (purple) - 优雅神秘的紫色主题
- **活力红** (red) - 热情活力的红色主题
- **温暖橙** (orange) - 温暖友好的橙色主题
- **清新青** (cyan) - 清新淡雅的青色主题
- **浪漫粉** (pink) - 温柔浪漫的粉色主题
- **金盏花** (yellow) - 明亮活泼的黄色主题
- **午夜蓝** (dark) - 深邃专业的深蓝主题
- **石墨灰** (minimal) - 简约现代的灰色主题
- **薰衣草** (lavender) - 宁静舒缓的淡紫主题
- **森林绿** (forest) - 自然沉稳的深绿主题

## 🔧 配置说明

### 插件配置

```typescript
export const colorPlugin = createColorEnginePlugin({
  // 基础配置
  defaultTheme: 'default',     // 默认主题
  defaultMode: 'light',        // 默认模式
  debug: true,                 // 调试模式

  // 组件配置
  registerComponents: true,    // 自动注册组件
  componentPrefix: 'LColor',   // 组件前缀

  // 回调函数
  onThemeChanged: async (theme, mode) => {
    // 主题切换回调
  },
  onError: (error) => {
    // 错误处理回调
  }
})
```

### 可用配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `defaultTheme` | `string` | `'default'` | 默认主题名称 |
| `defaultMode` | `'light' \| 'dark'` | `'light'` | 默认颜色模式 |
| `debug` | `boolean` | `false` | 是否启用调试模式 |
| `registerComponents` | `boolean` | `true` | 是否自动注册组件 |
| `componentPrefix` | `string` | `'LColor'` | 组件名称前缀 |
| `onThemeChanged` | `Function` | - | 主题变化回调 |
| `onError` | `Function` | - | 错误处理回调 |

## 🎯 使用方式

### 1. 在组件中使用

```vue
<script setup>
import { useTheme } from '@ldesign/color/vue'

const { currentTheme, currentMode, setTheme, toggleMode } = useTheme()
</script>

<template>
  <div>
    <!-- 显示当前主题信息 -->
    <p>当前主题: {{ currentTheme }}</p>
    <p>当前模式: {{ currentMode }}</p>
    
    <!-- 主题切换按钮 -->
    <button @click="setTheme('blue')">蓝色主题</button>
    <button @click="setTheme('green')">绿色主题</button>
    <button @click="toggleMode()">切换模式</button>
  </div>
</template>
```

### 2. 使用内置组件

```vue
<template>
  <div>
    <!-- 主题选择器 -->
    <LColorThemeSelector 
      size="medium"
      @theme-change="onThemeChange"
    />
    
    <!-- 暗黑模式切换 -->
    <LColorDarkModeToggle 
      size="medium"
      @change="onModeChange"
    />
  </div>
</template>

<script setup>
const onThemeChange = (theme, mode) => {
  console.log('主题已切换:', theme, mode)
}

const onModeChange = (isDark) => {
  console.log('模式已切换:', isDark ? '暗色' : '亮色')
}
</script>
```

### 3. 高级主题管理

```vue
<script setup>
import { useThemeSelector } from '@ldesign/color/vue'

const {
  availableThemes,
  themeConfigs,
  selectTheme,
  getThemeDisplayName,
  getThemeDescription
} = useThemeSelector()
</script>

<template>
  <div class="theme-gallery">
    <div 
      v-for="theme in availableThemes" 
      :key="theme.name"
      class="theme-card"
      @click="selectTheme(theme.name)"
    >
      <h3>{{ getThemeDisplayName(theme.name) }}</h3>
      <p>{{ getThemeDescription(theme.name) }}</p>
      <div class="theme-preview" :style="{ 
        backgroundColor: theme.light?.primary || '#1890ff' 
      }"></div>
    </div>
  </div>
</template>
```

### 4. 系统主题同步

```vue
<script setup>
import { useSystemThemeSync } from '@ldesign/color/vue'

const {
  systemTheme,
  isSystemDark,
  isSyncing,
  startSync,
  stopSync,
  syncWithSystem
} = useSystemThemeSync({
  autoStart: true,
  onSync: (theme) => {
    console.log('系统主题变化:', theme)
  }
})
</script>

<template>
  <div>
    <p>系统主题: {{ systemTheme }}</p>
    <p>正在同步: {{ isSyncing }}</p>
    
    <button @click="syncWithSystem">立即同步</button>
    <button @click="isSyncing ? stopSync() : startSync()">
      {{ isSyncing ? '停止' : '开始' }}同步
    </button>
  </div>
</template>
```

## 🎨 CSS 变量

插件会自动注入以下CSS变量：

```css
:root {
  /* 主色调 */
  --color-primary: #165DFF;
  --color-primary-50: #f0f5ff;
  --color-primary-100: #d6e4ff;
  /* ... 更多色阶 */
  
  /* 功能色 */
  --color-success: #00B42A;
  --color-warning: #FF7D00;
  --color-danger: #F53F3F;
  --color-gray: #86909C;
  
  /* 语义化变量 */
  --color-text: var(--color-gray-900);
  --color-background: #ffffff;
  --color-border: var(--color-gray-300);
}
```

## 🔍 调试和监控

### 开发环境调试

```typescript
// 在开发环境中启用详细日志
export const colorPlugin = createColorEnginePlugin({
  debug: true, // 启用调试模式
  onThemeChanged: async (theme, mode) => {
    console.log(`🎨 主题切换: ${theme} (${mode})`)
    
    // 输出当前CSS变量
    const root = document.documentElement
    const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary')
    console.log('主色调:', primaryColor)
  }
})
```

### 错误处理

```typescript
export const colorPlugin = createColorEnginePlugin({
  onError: (error) => {
    console.error('🚨 主题管理错误:', error)
    
    // 在生产环境中发送到监控系统
    if (process.env.NODE_ENV === 'production') {
      // 发送错误报告
      errorReporting.captureException(error)
    }
  }
})
```

## 📚 相关文档

- [Color包完整文档](../../../packages/color/README.md)
- [Vue组合式API文档](../../../packages/color/docs/api/vue-composables.md)
- [主题管理指南](../../../packages/color/docs/guide/theme-management.md)
- [颜色处理API](../../../packages/color/docs/api/color-processing.md)

## 🚀 最佳实践

1. **性能优化**: 在根组件中使用主题API，避免在每个子组件中重复调用
2. **用户体验**: 提供主题预览功能，让用户在切换前看到效果
3. **可访问性**: 确保主题切换后的对比度符合WCAG标准
4. **持久化**: 利用自动存储功能保存用户的主题偏好
5. **响应式**: 结合系统主题同步提供更好的用户体验
