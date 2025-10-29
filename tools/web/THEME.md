# LDesign Web 主题系统

## 主题配置

### 主题色
**主色调**: `#667eea` (紫蓝色)
**辅助色**: `#764ba2` (紫色)
**渐变色**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### 颜色使用场景

#### 主色调 (#667eea)
- Logo 渐变起始色
- 菜单选中状态边框
- 按钮主色
- 卡片悬停边框色
- 链接色

#### 辅助色 (#764ba2)
- Logo 渐变结束色
- 装饰性渐变背景

### 明暗主题

#### 明亮主题 (Light Mode)
- **背景色**: 由 Naive UI 提供的默认浅色背景
- **文字色**: 深色文字
- **边框色**: 浅灰色边框
- **卡片背景**: 白色

#### 暗黑主题 (Dark Mode)
- **背景色**: 由 Naive UI 提供的深色背景
- **文字色**: 浅色文字
- **边框色**: 深灰色边框
- **卡片背景**: 深灰色

### 主题切换

#### 自动检测系统主题
首次访问时，系统会自动检测用户的系统主题偏好：
```typescript
window.matchMedia('(prefers-color-scheme: dark)').matches
```

#### 持久化
主题设置会保存在 `localStorage` 中：
```typescript
localStorage.setItem('ldesign-theme', 'dark' | 'light')
```

#### CSS 类切换
切换主题时会在 `document.documentElement` 上添加/移除 `.dark` 类：
```typescript
document.documentElement.classList.add('dark')    // 暗黑模式
document.documentElement.classList.remove('dark')  // 明亮模式
```

## 使用方法

### 在组件中使用主题

```vue
<script setup lang="ts">
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()

// 切换主题
function toggleTheme() {
  themeStore.toggle()
}

// 设置为暗黑模式
function setDarkMode() {
  themeStore.setDark(true)
}

// 设置为明亮模式
function setLightMode() {
  themeStore.setLight()
}
</script>
```

### 在样式中适配暗黑模式

```vue
<style scoped>
/* 通用样式 */
.my-component {
  background: var(--n-color);
  color: var(--n-text-color);
  border: 1px solid var(--n-border-color);
}

/* 暗黑模式特定样式 */
:global(.dark) .my-component {
  box-shadow: 0 8px 24px rgba(100, 126, 234, 0.25);
}
</style>
```

## 主题色变量

### Naive UI 内置变量
Naive UI 提供了以下 CSS 变量，会随主题自动切换：

- `--n-color` - 背景色
- `--n-text-color` - 主文字色
- `--n-text-color-2` - 次要文字色
- `--n-text-color-3` - 三级文字色
- `--n-border-color` - 边框色
- `--n-divider-color` - 分割线色
- `--n-close-color-hover` - 悬停背景色
- `--n-close-color-pressed` - 按下背景色

### 自定义颜色

```css
:root {
  --ldesign-primary: #667eea;
  --ldesign-secondary: #764ba2;
  --ldesign-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 暗黑模式下的透明度调整 */
:global(.dark) {
  --ldesign-primary-alpha: rgba(102, 126, 234, 0.8);
  --ldesign-secondary-alpha: rgba(118, 75, 162, 0.8);
}
```

## 组件主题适配

### 卡片悬停效果

```vue
<style scoped>
.card {
  transition: all 0.3s ease;
  border: 1px solid var(--n-border-color);
}

.card:hover {
  transform: translateY(-4px);
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(100, 126, 234, 0.15);
}

/* 暗黑模式下增强阴影 */
:global(.dark) .card:hover {
  box-shadow: 0 8px 24px rgba(100, 126, 234, 0.25);
}
</style>
```

### 渐变背景

```vue
<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, rgba(100, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

/* 暗黑模式下增强渐变 */
:global(.dark) .gradient-bg {
  background: linear-gradient(135deg, rgba(100, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
}
</style>
```

### 文字渐变

```vue
<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
```

## 最佳实践

### 1. 优先使用 Naive UI 变量
尽可能使用 Naive UI 提供的 CSS 变量，确保主题切换的一致性。

### 2. 渐进增强暗黑模式
先编写明亮模式样式，然后使用 `:global(.dark)` 选择器增强暗黑模式效果。

### 3. 避免硬编码颜色
避免直接使用颜色值，使用 CSS 变量或主题相关的变量。

### 4. 透明度处理
在暗黑模式下，适当增加主色调的透明度以柔和显示效果。

### 5. 阴影优化
暗黑模式下的阴影应该更明显，使用更大的透明度值。

## 主题切换示例

### 顶部栏主题切换按钮

```vue
<template>
  <n-button text @click="themeStore.toggle" class="theme-button">
    <Sun v-if="themeStore.isDark" :size="20" />
    <Moon v-else :size="20" />
  </n-button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-button {
  cursor: pointer;
  transition: transform 0.3s;
}

.theme-button:hover {
  transform: scale(1.1);
}
</style>
```

## 调试主题

### 查看当前主题
```javascript
// 在浏览器控制台
localStorage.getItem('ldesign-theme')  // 'dark' 或 'light'
document.documentElement.classList.contains('dark')  // true 或 false
```

### 强制设置主题
```javascript
// 在浏览器控制台
// 设置为暗黑模式
localStorage.setItem('ldesign-theme', 'dark')
document.documentElement.classList.add('dark')

// 设置为明亮模式
localStorage.setItem('ldesign-theme', 'light')
document.documentElement.classList.remove('dark')
```

## 未来扩展

### 自定义主题色
可以考虑添加主题色选择器，让用户自定义主题色：

```typescript
interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  mode: 'light' | 'dark' | 'auto'
}
```

### 多主题支持
可以添加更多预设主题：
- 蓝色主题
- 绿色主题
- 橙色主题
- 粉色主题

### 动画效果
主题切换时添加平滑的过渡动画：

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```
