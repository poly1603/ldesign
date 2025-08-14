# 主题系统

LDesign Theme 的核心是一个强大而灵活的主题系统，它允许你轻松地在不同的视觉风格之间切换，为用户带来丰
富的视觉体验。

## 主题概念

### 什么是主题？

主题是一个完整的视觉设计方案，包含：

- **颜色配置** - 定义应用的色彩方案
- **装饰元素** - 各种视觉装饰，如雪花、灯笼等
- **动画效果** - 动态的视觉效果
- **资源文件** - 图片、图标、音效等
- **元数据** - 主题名称、描述、标签等

### 主题结构

每个主题都遵循统一的结构：

```typescript
interface ThemeConfig {
  // 基本信息
  name: string // 主题唯一标识
  displayName: string // 显示名称
  description?: string // 主题描述
  category: ThemeCategory // 主题分类
  version: string // 版本号
  author: string // 作者

  // 颜色配置
  colors: ColorScheme // 颜色方案

  // 装饰和动画
  decorations: DecorationConfig[] // 装饰元素
  animations: AnimationConfig[] // 动画配置

  // 资源文件
  resources: ThemeResources // 资源文件

  // 元数据
  tags?: string[] // 标签
  festival?: FestivalType // 节日类型
  timeRange?: TimeRange // 激活时间范围
  preview?: string // 预览图
}
```

## 内置主题

LDesign Theme 提供了多个精心设计的内置主题：

### 🎄 圣诞节主题

```typescript
import { christmasTheme } from '@ldesign/theme/themes'

// 主题特点
const features = {
  colors: '红绿配色，温馨节日氛围',
  decorations: ['雪花飘落', '圣诞树', '圣诞帽', '礼物盒'],
  animations: ['雪花下落', '树木发光', '星光闪烁'],
  timeRange: '12月1日 - 1月7日',
}
```

### 🧧 春节主题

```typescript
import { springFestivalTheme } from '@ldesign/theme/themes'

// 主题特点
const features = {
  colors: '红金配色，喜庆中国风',
  decorations: ['红灯笼', '烟花', '金币', '福字'],
  animations: ['灯笼摆动', '烟花绽放', '金币飞舞'],
  timeRange: '1月20日 - 2月20日',
}
```

### 🎃 万圣节主题

```typescript
import { halloweenTheme } from '@ldesign/theme/themes'

// 主题特点
const features = {
  colors: '橙黑配色，神秘恐怖风格',
  decorations: ['南瓜灯', '幽灵', '蝙蝠', '蜘蛛网'],
  animations: ['幽灵飘浮', '南瓜发光', '蝙蝠飞舞'],
  timeRange: '10月15日 - 11月5日',
}
```

## 主题管理

### 创建主题管理器

```typescript
import { createThemeManager } from '@ldesign/theme'
import { christmasTheme, springFestivalTheme } from '@ldesign/theme/themes'

const themeManager = createThemeManager({
  themes: [christmasTheme, springFestivalTheme],
  defaultTheme: 'christmas',
  autoActivate: true,
  debug: false,
})

await themeManager.init()
```

### 主题操作

```typescript
// 获取所有可用主题
const availableThemes = themeManager.getAvailableThemes()
console.log(availableThemes) // ['christmas', 'spring-festival']

// 获取当前主题
const currentTheme = themeManager.getCurrentTheme()
console.log(currentTheme) // 'christmas'

// 切换主题
await themeManager.setTheme('spring-festival')

// 获取主题配置
const themeConfig = themeManager.getTheme('christmas')
console.log(themeConfig.displayName) // '圣诞节'

// 添加新主题
themeManager.addTheme(myCustomTheme)

// 移除主题
themeManager.removeTheme('old-theme')
```

### 事件监听

主题管理器提供了丰富的事件系统：

```typescript
// 监听主题变化
themeManager.on('theme-changed', event => {
  console.log(`主题已切换到: ${event.theme}`)
  console.log(`切换时间: ${event.timestamp}`)
})

// 监听主题加载
themeManager.on('theme-loading', event => {
  console.log(`正在加载主题: ${event.theme}`)
})

// 监听错误
themeManager.on('theme-error', event => {
  console.error(`主题错误: ${event.error.message}`)
})

// 监听装饰变化
themeManager.on('decoration-added', event => {
  console.log(`添加装饰: ${event.decoration.name}`)
})

themeManager.on('decoration-removed', event => {
  console.log(`移除装饰: ${event.decorationId}`)
})
```

## 颜色系统

### 颜色配置

每个主题都包含完整的颜色配置，支持明暗两种模式：

```typescript
interface ColorScheme {
  name: string
  displayName: string
  light: ColorPalette // 浅色模式
  dark: ColorPalette // 深色模式
}

interface ColorPalette {
  // 主要颜色
  primary: string // 主色
  secondary: string // 辅助色
  accent: string // 强调色

  // 背景颜色
  background: string // 背景色
  surface: string // 表面色

  // 文本颜色
  text: string // 主文本色
  textSecondary: string // 次要文本色

  // 边框颜色
  border: string // 边框色

  // 状态颜色
  success: string // 成功色
  warning: string // 警告色
  error: string // 错误色
  info: string // 信息色
}
```

### 使用颜色

```typescript
// 在 Vue 组件中使用
import { useCurrentTheme } from '@ldesign/theme/vue'

const theme = useCurrentTheme()

// 获取当前主题的颜色
const colors = computed(() => {
  const isDark = // 检测当前是否为深色模式
  return isDark ? theme.value?.colors.dark : theme.value?.colors.light
})

// 在模板中使用
const primaryColor = colors.value?.primary
```

### CSS 变量

主题系统会自动将颜色注入到 CSS 变量中：

```css
/* 这些变量会根据当前主题自动更新 */
.my-component {
  background-color: var(--theme-background);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
}

.primary-button {
  background-color: var(--theme-primary);
  color: white;
}

.success-message {
  background-color: var(--theme-success);
  color: white;
}
```

## 主题切换

### 手动切换

```typescript
// 使用主题管理器
await themeManager.setTheme('spring-festival')

// 使用 Vue 组合式函数
const { setTheme } = useTheme()
await setTheme('spring-festival')
```

### 自动切换

主题系统支持基于时间的自动切换：

```typescript
// 配置时间范围
const christmasTheme = {
  // ... 其他配置
  timeRange: {
    start: '12-01', // 12月1日
    end: '01-07', // 1月7日
  },
}

// 启用自动激活
const themeManager = createThemeManager({
  themes: [christmasTheme],
  autoActivate: true, // 启用自动激活
})
```

### 条件切换

```typescript
// 基于用户偏好
const userPreference = getUserPreference()
if (userPreference.enableFestivalThemes) {
  await setTheme('christmas')
}

// 基于地理位置
const location = await getUserLocation()
if (location.country === 'CN') {
  await setTheme('spring-festival')
}

// 基于设备类型
const isMobile = window.innerWidth < 768
const theme = isMobile ? 'mobile-christmas' : 'christmas'
await setTheme(theme)
```

## 主题预加载

为了提升用户体验，可以预加载主题资源：

```typescript
// 预加载单个主题
await themeManager.preloadResources('spring-festival')

// 预加载所有主题
const themes = themeManager.getAvailableThemes()
await Promise.all(themes.map(theme => themeManager.preloadResources(theme)))

// 使用 Vue 组合式函数
const { preloadTheme, preloadAllThemes } = useThemePreload()

await preloadTheme('christmas')
await preloadAllThemes()
```

## 主题持久化

主题选择可以持久化到本地存储：

```typescript
// 自动保存主题选择
const themeManager = createThemeManager({
  themes: [christmasTheme, springFestivalTheme],
  defaultTheme: 'christmas',
  persistence: {
    enabled: true,
    key: 'app-theme',
    storage: 'localStorage', // 或 'sessionStorage'
  },
})

// 手动保存和恢复
const saveTheme = (themeName: string) => {
  localStorage.setItem('selected-theme', themeName)
}

const loadTheme = (): string | null => {
  return localStorage.getItem('selected-theme')
}

// 应用启动时恢复主题
const savedTheme = loadTheme()
if (savedTheme) {
  await themeManager.setTheme(savedTheme)
}
```

## 最佳实践

### 1. 主题命名

使用有意义的主题名称：

```typescript
// ✅ 好的命名
'christmas'
'spring-festival'
'halloween'
'corporate-blue'

// ❌ 避免的命名
'theme1'
'red-theme'
'style-a'
```

### 2. 性能优化

```typescript
// 延迟加载主题资源
const lazyThemes = {
  christmas: () => import('./themes/christmas'),
  'spring-festival': () => import('./themes/spring-festival'),
}

// 按需加载
const loadTheme = async (name: string) => {
  const themeModule = await lazyThemes[name]()
  return themeModule.default
}
```

### 3. 错误处理

```typescript
try {
  await themeManager.setTheme('new-theme')
} catch (error) {
  console.error('主题切换失败:', error)
  // 回退到默认主题
  await themeManager.setTheme('default')
}
```

### 4. 响应式设计

```typescript
// 根据屏幕尺寸调整主题
const getResponsiveTheme = (baseName: string) => {
  const width = window.innerWidth
  if (width < 768) {
    return `${baseName}-mobile`
  } else if (width < 1024) {
    return `${baseName}-tablet`
  }
  return baseName
}

const theme = getResponsiveTheme('christmas')
await setTheme(theme)
```

## 下一步

- 📖 [了解装饰系统](./decorations.md) - 学习如何使用和创建装饰元素
- 🎬 [掌握动画系统](./animations.md) - 了解动画的创建和控制
- 🎨 [创建自定义主题](./custom-themes.md) - 设计你自己的主题
- 🔧 [Vue 集成指南](./vue-integration.md) - 深入了解 Vue 集成功能
