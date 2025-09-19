# LDesign 主题系统

LDesign 组件库提供了完整的主题系统，支持亮色主题、暗色主题和高对比度主题，基于 CSS 变量实现，支持运行时切换和自定义主题。

## 特性

- 🎨 **多主题支持**：亮色、暗色、高对比度主题
- 🔄 **运行时切换**：无需重新加载页面即可切换主题
- 🎯 **自动适配**：支持系统偏好自动切换
- 🛠️ **高度可定制**：基于 CSS 变量，易于自定义
- ♿ **无障碍友好**：支持高对比度和减少动画偏好
- 💾 **持久化存储**：自动保存用户的主题偏好

## 快速开始

### 基础使用

```vue
<template>
  <div>
    <!-- 主题切换按钮 -->
    <LThemeToggle />
    
    <!-- 其他组件会自动应用当前主题 -->
    <LButton type="primary">主要按钮</LButton>
    <LCard>卡片内容</LCard>
  </div>
</template>

<script setup>
import { LThemeToggle, LButton, LCard } from '@ldesign/component'
</script>
```

### 编程式主题控制

```typescript
import { setTheme, getTheme, toggleTheme, addThemeChangeListener } from '@ldesign/component'

// 设置主题
setTheme('dark')

// 获取当前主题
const currentTheme = getTheme()

// 切换主题（在 light 和 dark 之间切换）
toggleTheme()

// 监听主题变化
const removeListener = addThemeChangeListener((event) => {
  console.log('主题已切换:', event.theme)
  console.log('之前的主题:', event.previousTheme)
  console.log('是否由系统触发:', event.isSystemTriggered)
})

// 移除监听器
removeListener()
```

## 主题类型

### 亮色主题（默认）

```typescript
setTheme('light')
```

亮色主题是默认主题，提供清晰明亮的视觉体验。

### 暗色主题

```typescript
setTheme('dark')
```

暗色主题适合在低光环境下使用，减少眼部疲劳。

### 高对比度主题

```typescript
setTheme('high-contrast')
```

高对比度主题提供更强的视觉对比，提高可访问性。

### 自动主题

```typescript
setTheme('auto')
```

自动主题会根据系统偏好自动选择合适的主题。

## 主题切换组件

### ThemeToggle 组件

```vue
<template>
  <!-- 基础用法 -->
  <LThemeToggle />
  
  <!-- 显示标签 -->
  <LThemeToggle show-label />
  
  <!-- 不同尺寸 -->
  <LThemeToggle size="small" />
  <LThemeToggle size="medium" />
  <LThemeToggle size="large" />
  
  <!-- 自定义图标和标签 -->
  <LThemeToggle 
    :icons="{
      light: '☀️',
      dark: '🌙',
      'high-contrast': '🔆'
    }"
    :labels="{
      light: '亮色',
      dark: '暗色',
      'high-contrast': '高对比'
    }"
    @change="handleThemeChange"
  />
</template>

<script setup>
function handleThemeChange(theme, previousTheme) {
  console.log(`主题从 ${previousTheme} 切换到 ${theme}`)
}
</script>
```

### 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 组件尺寸 |
| disabled | `boolean` | `false` | 是否禁用 |
| showLabel | `boolean` | `false` | 是否显示文字标签 |
| icons | `Partial<Record<ThemeType, any>>` | `{}` | 自定义图标映射 |
| labels | `Partial<Record<ThemeType, string>>` | `{}` | 自定义标签映射 |

### 组件事件

| 事件 | 参数 | 说明 |
|------|------|------|
| change | `(theme: ThemeType, previousTheme: ThemeType)` | 主题变更时触发 |
| click | `(event: MouseEvent)` | 点击时触发 |

## 自定义主题

### 覆盖 CSS 变量

```css
/* 自定义品牌色 */
:root {
  --ldesign-brand-color-7: #1976d2;
  --ldesign-brand-color-6: #42a5f5;
  --ldesign-brand-color-8: #1565c0;
}

/* 自定义暗色主题 */
[data-theme="dark"] {
  --ldesign-bg-color-page: #121212;
  --ldesign-bg-color-container: #1e1e1e;
  --ldesign-text-color-primary: #ffffff;
}
```

### 创建自定义主题

```css
/* 自定义主题：蓝色主题 */
[data-theme="blue"] {
  --ldesign-brand-color: #2196f3;
  --ldesign-brand-color-hover: #1976d2;
  --ldesign-brand-color-active: #0d47a1;
  --ldesign-bg-color-page: #e3f2fd;
  --ldesign-bg-color-container: #ffffff;
}
```

```typescript
// 应用自定义主题
document.documentElement.setAttribute('data-theme', 'blue')
```

## 主题管理器

### 创建主题管理器

```typescript
import { createThemeManager } from '@ldesign/component'

const themeManager = createThemeManager({
  theme: 'auto',
  enableTransition: true,
  persistent: true,
  storageKey: 'my-app-theme'
})

// 初始化
themeManager.init()

// 设置主题
themeManager.setTheme('dark')

// 监听主题变化
themeManager.addListener((event) => {
  console.log('主题变化:', event)
})
```

### 主题管理器配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| theme | `ThemeType` | `'auto'` | 初始主题 |
| enableTransition | `boolean` | `true` | 是否启用过渡动画 |
| persistent | `boolean` | `true` | 是否持久化主题设置 |
| storageKey | `string` | `'ldesign-theme'` | 本地存储键名 |

## 系统偏好适配

主题系统会自动检测并适配系统偏好：

### 暗色模式偏好

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* 自动应用暗色主题变量 */
  }
}
```

### 高对比度偏好

```css
@media (prefers-contrast: high) {
  :root:not([data-theme]) {
    /* 自动应用高对比度变量 */
  }
}
```

### 减少动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --ldesign-transition-fast: none;
    --ldesign-transition-base: none;
    --ldesign-transition-slow: none;
  }
}
```

## 最佳实践

### 1. 主题切换动画

```css
.theme-transition {
  transition: 
    background-color var(--ldesign-transition-base),
    border-color var(--ldesign-transition-base),
    color var(--ldesign-transition-base);
}
```

### 2. 主题适配组件

```vue
<template>
  <div class="my-component">
    <slot />
  </div>
</template>

<style lang="less">
.my-component {
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  border: 1px solid var(--ldesign-border-color);
  
  // 主题过渡
  transition: all var(--ldesign-transition-base);
}
</style>
```

### 3. 条件样式

```vue
<template>
  <div 
    :class="[
      'my-component',
      `my-component--${currentTheme}`
    ]"
  >
    内容
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getResolvedTheme, addThemeChangeListener } from '@ldesign/component'

const currentTheme = ref(getResolvedTheme())

onMounted(() => {
  addThemeChangeListener(() => {
    currentTheme.value = getResolvedTheme()
  })
})
</script>
```

### 4. 主题检测

```typescript
import { supportsDarkMode, supportsHighContrast } from '@ldesign/component'

// 检查是否支持暗色模式
if (supportsDarkMode()) {
  console.log('系统支持暗色模式')
}

// 检查是否支持高对比度
if (supportsHighContrast()) {
  console.log('系统支持高对比度')
}
```

## 注意事项

1. **CSS 变量兼容性**：确保目标浏览器支持 CSS 自定义属性
2. **主题切换性能**：避免在主题切换时进行大量 DOM 操作
3. **无障碍性**：确保所有主题都符合 WCAG 对比度要求
4. **测试覆盖**：在所有支持的主题下测试组件表现
5. **渐进增强**：为不支持主题切换的环境提供降级方案

## 故障排除

### 主题不生效

1. 检查是否正确引入了样式文件
2. 确认 CSS 变量是否正确定义
3. 检查浏览器开发者工具中的 CSS 变量值

### 主题切换卡顿

1. 减少过渡动画的复杂度
2. 使用 `will-change` 属性优化性能
3. 避免在主题切换时触发重排

### 自定义主题不显示

1. 确认 CSS 选择器优先级
2. 检查 CSS 变量的作用域
3. 验证主题属性值是否正确设置
