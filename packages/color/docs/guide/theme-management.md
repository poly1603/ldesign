# 主题管理

主题管理是 @ldesign/color 的核心功能，提供了完整的主题创建、注册、切换和管理能力。

## 主题配置结构

每个主题都遵循统一的配置结构：

```typescript
interface ThemeConfig {
  name: string // 主题唯一标识
  displayName?: string // 显示名称
  description?: string // 主题描述
  light: ColorConfig // 亮色模式配置
  dark?: ColorConfig // 暗色模式配置（可选）
  builtin?: boolean // 是否为内置主题
  meta?: Record<string, any> // 主题元数据
}

interface ColorConfig {
  primary: string // 主色调（必需）
  success?: string // 成功色（可选）
  warning?: string // 警告色（可选）
  danger?: string // 危险色（可选）
  gray?: string // 灰色（可选）
}
```

## 创建主题管理器

### 使用预设主题

```typescript
import { createThemeManagerWithPresets } from '@ldesign/color'

const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'default',
  fallbackTheme: 'default',
  autoDetect: true,
  storage: 'localStorage',
  storageKey: 'app-theme',
  cache: true,
  idleProcessing: true
})
```

### 使用自定义主题

```typescript
import { createThemeManager } from '@ldesign/color'

const customThemes = [
  {
    name: 'corporate',
    displayName: '企业主题',
    description: '适合企业应用的专业主题',
    light: {
      primary: '#0066cc',
      success: '#00a854',
      warning: '#ffbf00',
      danger: '#f04134',
      gray: '#666666'
    },
    dark: {
      primary: '#4d94ff',
      success: '#49aa19',
      warning: '#d4b106',
      danger: '#dc4446',
      gray: '#8c8c8c'
    }
  }
]

const themeManager = createThemeManager({
  themes: customThemes,
  defaultTheme: 'corporate'
})

await themeManager.init()
```

## 主题操作

### 切换主题

```typescript
// 切换到指定主题
await themeManager.setTheme('green')

// 切换主题和模式
await themeManager.setTheme('purple', 'dark')

// 只切换模式
await themeManager.setMode('dark')
```

### 获取主题信息

```typescript
// 获取当前主题
const currentTheme = themeManager.getCurrentTheme()
const currentMode = themeManager.getCurrentMode()

// 获取所有可用主题
const themeNames = themeManager.getThemeNames()

// 获取主题配置
const themeConfig = themeManager.getThemeConfig('green')
```

### 注册新主题

```typescript
// 注册单个主题
const newTheme = {
  name: 'sunset',
  displayName: '日落主题',
  light: { primary: '#ff6b35' },
  dark: { primary: '#e55a2b' }
}

themeManager.registerTheme(newTheme)

// 批量注册主题
const themes = [
  { name: 'ocean', light: { primary: '#0077be' } },
  { name: 'forest', light: { primary: '#228b22' } }
]

themeManager.registerThemes(themes)
```

## 预设主题

@ldesign/color 提供了 10 个精心设计的预设主题：

```typescript
import {
  getPresetTheme,
  getPresetThemeNames,
  presetThemes,
  themeCategories
} from '@ldesign/color'

// 获取所有预设主题
console.log('预设主题:', presetThemes)

// 按名称获取主题
const greenTheme = getPresetTheme('green')

// 获取主题名称列表
const themeNames = getPresetThemeNames()

// 按分类获取主题
const basicThemes = themeCategories.basic // 基础主题
const colorfulThemes = themeCategories.colorful // 彩色主题
```

### 主题分类和标签

```typescript
import {
  getThemesByCategory,
  getThemesByTag,
  recommendThemes
} from '@ldesign/color'

// 按分类获取
const professionalThemes = getThemesByTag('professional')
const vibrantThemes = getThemesByTag('vibrant')

// 智能推荐
const recommended = recommendThemes({
  style: 'professional',
  excludeColors: ['red', 'pink']
})
```

## 主题生成和缓存

### 预生成主题

为了提供最佳性能，建议预生成主题数据：

```typescript
// 预生成所有主题
await themeManager.preGenerateAllThemes()

// 预生成特定主题
await themeManager.preGenerateTheme('green')

// 获取生成的主题数据
const generatedTheme = themeManager.getGeneratedTheme('green')
if (generatedTheme) {
  console.log('主题名称:', generatedTheme.name)
  console.log('生成时间:', new Date(generatedTheme.timestamp))
  console.log('亮色模式变量:', generatedTheme.light.cssVariables)
  console.log('暗色模式变量:', generatedTheme.dark.cssVariables)
}
```

### 缓存管理

```typescript
// 配置缓存选项
const themeManager = await createThemeManagerWithPresets({
  cache: {
    maxSize: 100, // 最大缓存条目数
    defaultTTL: 3600000 // 默认过期时间（1小时）
  }
})

// 手动清理缓存（通常不需要）
// themeManager.cache.clear()
```

## 事件监听

监听主题变化事件：

```typescript
// 监听主题变化
themeManager.on('theme-changed', (data) => {
  console.log('主题已变化:', data.theme, data.mode)
  console.log('之前的主题:', data.oldTheme, data.oldMode)
})

// 监听主题注册
themeManager.on('theme-registered', (data) => {
  console.log('新主题已注册:', data.theme)
})

// 监听主题生成完成
themeManager.on('theme-generated', (data) => {
  console.log('主题生成完成:', data.theme)
})

// 监听错误
themeManager.on('error', (error) => {
  console.error('主题管理器错误:', error)
})
```

## 存储和持久化

### 存储配置

```typescript
// 使用不同的存储方式
// 使用自定义存储
import { createStorage } from '@ldesign/color'

const themeManager = await createThemeManagerWithPresets({
  storage: 'localStorage', // 'localStorage' | 'sessionStorage' | 'memory' | 'cookie'
  storageKey: 'my-app-theme' // 存储键名
})

const customStorage = createStorage('cookie')
const themeManager = createThemeManager({
  storage: customStorage
})
```

### 存储的数据结构

存储的主题数据包含：

```json
{
  "theme": "green",
  "mode": "dark"
}
```

## 高级配置

### 完整配置选项

```typescript
interface ThemeManagerOptions {
  defaultTheme?: string // 默认主题
  fallbackTheme?: string // 回退主题
  storage?: 'localStorage' | 'sessionStorage' | 'memory' | Storage
  storageKey?: string // 存储键名
  autoDetect?: boolean // 自动检测系统主题
  themes?: ThemeConfig[] // 预设主题
  cache?: boolean | CacheOptions // 缓存配置
  cssPrefix?: string // CSS 变量前缀
  idleProcessing?: boolean // 闲时处理
  onThemeChanged?: (theme: string, mode: ColorMode) => void
  onError?: (error: Error) => void
}
```

### 性能调优

```typescript
const themeManager = await createThemeManagerWithPresets({
  // 启用所有性能优化
  idleProcessing: true,
  cache: {
    maxSize: 50,
    defaultTTL: 7200000 // 2小时
  },

  // 预加载常用主题
  themes: [
    // 只包含应用中实际使用的主题
    getPresetTheme('default'),
    getPresetTheme('green'),
    getPresetTheme('dark')
  ]
})

// 应用启动后预生成主题
await themeManager.preGenerateAllThemes()
```

## 最佳实践

### 1. 主题命名规范

```typescript
// 推荐的主题命名
const themes = [
  { name: 'brand-primary', displayName: '品牌主色' },
  { name: 'brand-secondary', displayName: '品牌辅色' },
  { name: 'high-contrast', displayName: '高对比度' },
  { name: 'accessibility', displayName: '无障碍模式' }
]
```

### 2. 渐进式加载

```typescript
// 先加载核心主题
const coreThemes = [getPresetTheme('default')]
const themeManager = createThemeManager({ themes: coreThemes })

// 后续按需加载其他主题
const additionalThemes = [
  getPresetTheme('green'),
  getPresetTheme('purple')
]
themeManager.registerThemes(additionalThemes)
```

### 3. 错误处理

```typescript
const themeManager = await createThemeManagerWithPresets({
  onError: (error) => {
    // 记录错误日志
    console.error('主题管理器错误:', error)

    // 回退到安全主题
    themeManager.setTheme('default', 'light').catch(() => {
      console.error('无法回退到默认主题')
    })
  }
})
```

## 下一步

- [颜色生成](/guide/color-generation) - 了解颜色生成算法
- [色阶系统](/guide/color-scales) - 学习色阶生成和使用
- [Vue 3 集成](/guide/vue-integration) - Vue 3 专门集成指南
