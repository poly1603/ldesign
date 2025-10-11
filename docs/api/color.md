# @ldesign/color - 颜色主题管理库

现代化的颜色主题管理解决方案，提供完整的颜色处理、主题管理和可访问性检查功能。

## ✨ 特性

- 🎨 **智能主题管理** - 支持亮色/暗色模式自动切换
- 🔄 **颜色格式转换** - HEX、RGB、HSL、HSV 等格式互转
- 🎭 **色阶生成** - 自动生成和谐的颜色色阶
- ♿ **可访问性检查** - 内置 WCAG 标准颜色对比度检查
- 🌈 **色彩和谐分析** - 基于色彩理论的智能颜色推荐
- 🚀 **高性能** - LRU 缓存、空闲时预生成优化
- 📦 **Tree-shakable** - 支持按需导入，减小打包体积
- 🎯 **TypeScript** - 完整的类型定义和类型安全
- 💾 **持久化** - 支持 localStorage、sessionStorage、Cookie 等多种存储方式
- 🔌 **框架集成** - Vue 3 深度集成,其他框架友好

## 📦 安装

```bash
# pnpm
pnpm add @ldesign/color

# npm
npm install @ldesign/color

# yarn
yarn add @ldesign/color
```

## 🚀 快速开始

### 基础使用

```typescript path=null start=null
import { ThemeManager } from '@ldesign/color'

// 创建主题管理器
const themeManager = new ThemeManager({
  defaultTheme: 'default',
  defaultMode: 'light',
  autoDetect: true  // 自动检测系统主题
})

// 初始化
await themeManager.init()

// 切换主题
await themeManager.setTheme('cyan')

// 切换颜色模式
await themeManager.setMode('dark')

// 获取当前主题
const currentTheme = themeManager.getCurrentTheme() // 'cyan'
const currentMode = themeManager.getCurrentMode()   // 'dark'
```

### 使用预设主题

```typescript path=null start=null
import { createThemeManagerWithPresets } from '@ldesign/color'

// 自动加载所有预设主题
const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'blue',
  storage: 'localStorage'
})

// 可用主题: default, cyan, green, orange, purple, red, yellow, pink, dark, minimal
```

### Vue 3 集成

```typescript path=null start=null
import { createApp } from 'vue'
import { createColorPlugin } from '@ldesign/color/vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(createColorPlugin({
  defaultTheme: 'default',
  defaultMode: 'light',
  themes: [
    {
      name: 'brand',
      colors: {
        light: { primary: '#1976d2' },
        dark: { primary: '#42a5f5' }
      }
    }
  ]
}))

app.mount('#app')
```

在组件中使用:

```vue path=null start=null
<template>
  <div>
    <p>当前主题: {{ currentTheme }}</p>
    <p>当前模式: {{ currentMode }}</p>
    
    <button @click="toggleTheme">切换主题</button>
    <button @click="toggleMode">切换模式</button>
  </div>
</template>

<script setup>
import { useColorTheme } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  setTheme,
  setMode,
  toggleMode
} = useColorTheme()

const toggleTheme = () => {
  setTheme(currentTheme.value === 'default' ? 'cyan' : 'default')
}
</script>
```

## 📖 核心 API

### ThemeManager

主题管理器核心类,负责主题的注册、切换、持久化等功能。

#### 构造函数

```typescript path=null start=null
new ThemeManager(options?: ThemeManagerOptions)
```

**选项 (ThemeManagerOptions):**

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `defaultTheme` | `string` | `'default'` | 默认主题名称 |
| `defaultMode` | `ColorMode` | `'light'` | 默认颜色模式 |
| `fallbackTheme` | `string` | `'default'` | 回退主题名称 |
| `storage` | `'localStorage' \| 'sessionStorage' \| 'cookie' \| 'memory'` | `'localStorage'` | 存储方式 |
| `storageKey` | `string` | `'ldesign-theme-manager'` | 存储键名 |
| `autoDetect` | `boolean` | `true` | 是否自动检测系统主题 |
| `themes` | `ThemeConfig[]` | `[]` | 预设主题配置 |
| `cache` | `boolean` | `true` | 是否启用缓存 |
| `cssPrefix` | `string` | `'--color'` | CSS 变量前缀 |
| `idleProcessing` | `boolean` | `true` | 是否启用空闲时预处理 |
| `autoAdjustContrast` | `boolean` | `false` | 是否自动调整对比度 |
| `contrastLevel` | `WCAGLevel` | `'AA'` | WCAG 对比度级别 |

#### 主要方法

##### init()

初始化主题管理器。

```typescript path=null start=null
async init(): Promise<void>
```

##### setTheme()

切换主题。

```typescript path=null start=null
async setTheme(theme: string): Promise<void>

// 示例
await themeManager.setTheme('cyan')
```

##### setMode()

切换颜色模式。

```typescript path=null start=null
async setMode(mode: ColorMode): Promise<void>

// 示例
await themeManager.setMode('dark')
```

##### toggleMode()

切换颜色模式 (light ↔ dark)。

```typescript path=null start=null
async toggleMode(): Promise<void>
```

##### registerTheme()

注册新主题。

```typescript path=null start=null
registerTheme(theme: ThemeConfig): void

// 示例
themeManager.registerTheme({
  name: 'custom',
  colors: {
    light: {
      primary: '#1976d2',
      success: '#4caf50',
      warning: '#ff9800',
      danger: '#f44336',
      gray: '#9e9e9e'
    },
    dark: {
      primary: '#42a5f5',
      success: '#66bb6a',
      warning: '#ffa726',
      danger: '#ef5350',
      gray: '#757575'
    }
  }
})
```

##### on()

监听主题事件。

```typescript path=null start=null
on<T extends ThemeEventType>(
  event: T,
  listener: ThemeEventListener<T>
): void

// 示例
themeManager.on('theme-changed', ({ theme, mode }) => {
  console.log(`主题已切换: ${theme} (${mode})`)
})

themeManager.on('mode-changed', ({ mode, theme }) => {
  console.log(`模式已切换: ${mode}`)
})
```

支持的事件类型:
- `theme-changed` - 主题已切换
- `mode-changed` - 颜色模式已切换
- `error` - 发生错误

## 🎨 颜色处理 API

### 颜色转换

```typescript path=null start=null
import {
  hexToRgb,
  hexToHsl,
  hexToHsv,
  rgbToHex,
  rgbToHsl,
  hslToHex,
  hslToRgb,
} from '@ldesign/color/exports/color-processing'

// HEX → RGB
const rgb = hexToRgb('#1976d2')
// { r: 25, g: 118, b: 210 }

// RGB → HSL
const hsl = rgbToHsl(25, 118, 210)
// { h: 207, s: 79, l: 46 }

// HSL → HEX
const hex = hslToHex(207, 79, 46)
// '#1976d2'
```

### 颜色工具函数

```typescript path=null start=null
import {
  adjustBrightness,
  adjustHue,
  adjustSaturation,
  getContrastRatio,
  isDark,
  isLight,
  getBestTextColor
} from '@ldesign/color/exports/color-processing'

// 调整亮度
const lighter = adjustBrightness('#1976d2', 20)  // 变亮 20%
const darker = adjustBrightness('#1976d2', -20)  // 变暗 20%

// 调整色相
const shifted = adjustHue('#1976d2', 30)  // 色相偏移 30°

// 调整饱和度
const saturated = adjustSaturation('#1976d2', 20)  // 饱和度增加 20%

// 获取对比度
const contrast = getContrastRatio('#1976d2', '#ffffff')
// 4.5 (符合 WCAG AA 标准)

// 判断颜色明暗
const isColorDark = isDark('#1976d2')  // true
const isColorLight = isLight('#1976d2')  // false

// 获取最佳文本颜色
const textColor = getBestTextColor('#1976d2')  // '#ffffff'
```

### 色阶生成

```typescript path=null start=null
import {
  ColorScaleGenerator,
  generateColorScale
} from '@ldesign/color/exports/color-processing'

// 方式1: 使用辅助函数
const scale = generateColorScale('#1976d2', {
  steps: 10,
  mode: 'light'
})
// ['#e3f2fd', '#bbdefb', ..., '#0d47a1']

// 方式2: 使用生成器类
const generator = new ColorScaleGenerator()
const scales = generator.generateScales(
  {
    primary: '#1976d2',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    gray: '#9e9e9e'
  },
  { steps: 10, mode: 'light' }
)
```

### 颜色分析

```typescript path=null start=null
import {
  analyzeColor,
  analyzeColors,
  extractDominantColors,
  getColorName
} from '@ldesign/color/exports/color-processing'

// 分析单个颜色
const analysis = analyzeColor('#1976d2')
// {
//   hex: '#1976d2',
//   rgb: { r: 25, g: 118, b: 210 },
//   hsl: { h: 207, s: 79, l: 46 },
//   brightness: 118,
//   isDark: true,
//   temperature: 'cool',
//   emotion: 'calm',
//   season: 'winter'
// }

// 获取颜色名称
const name = getColorName('#1976d2')  // 'blue'

// 提取主色
const dominant = extractDominantColors(['#1976d2', '#4caf50', '#ff9800'], 2)
// ['#1976d2', '#4caf50']
```

## ♿ 可访问性 API

### WCAG 对比度检查

```typescript path=null start=null
import {
  checkAccessibility,
  getAccessibleColorSuggestions
} from '@ldesign/color/exports/accessibility'

// 检查可访问性
const result = checkAccessibility('#1976d2', '#ffffff')
// {
//   contrastRatio: 4.5,
//   wcagAA: true,     // 符合 AA 级
//   wcagAAA: false,   // 不符合 AAA 级
//   largeTextAA: true,
//   largeTextAAA: true
// }

// 获取可访问的颜色建议
const suggestions = getAccessibleColorSuggestions(
  '#1976d2',
  '#cccccc',  // 不符合 WCAG 的背景色
  'AA'
)
// 返回符合 WCAG AA 标准的颜色建议
```

### 色盲模拟

```typescript path=null start=null
import {
  simulateColorBlindness,
  checkColorBlindnessAccessibility
} from '@ldesign/color/exports/accessibility'

// 模拟色盲视角
const protanopia = simulateColorBlindness('#1976d2', 'protanopia')
// 返回红色盲用户看到的颜色

// 检查对色盲用户的可访问性
const accessible = checkColorBlindnessAccessibility('#1976d2', '#ffffff')
// {
//   protanopia: true,
//   deuteranopia: true,
//   tritanopia: true,
//   achromatopsia: false
// }
```

## 🎭 色彩和谐分析

```typescript path=null start=null
import {
  ColorHarmonyAnalyzer
} from '@ldesign/color/exports/color-processing'

const analyzer = new ColorHarmonyAnalyzer()

// 分析色彩和谐关系
const harmony = analyzer.analyze('#1976d2')
// {
//   primary: '#1976d2',
//   complementary: '#d2761a',    // 互补色
//   analogous: ['#1a76d2', ...], // 类似色
//   triadic: ['#1976d2', ...],   // 三角色
//   tetradic: ['#1976d2', ...]   // 四角色
// }
```

## 🔧 工厂函数

便捷的工厂函数用于快速创建实例:

```typescript path=null start=null
import {
  createThemeManager,
  createThemeManagerWithPresets,
  createSimpleThemeManager,
  createCustomThemeManager,
  createColorProcessor,
  createAccessibilityChecker
} from '@ldesign/color'

// 创建基础主题管理器
const manager1 = await createThemeManager()

// 创建带预设主题的管理器
const manager2 = await createThemeManagerWithPresets()

// 创建简单主题管理器
const manager3 = await createSimpleThemeManager()

// 创建自定义主题管理器
const manager4 = await createCustomThemeManager('#1976d2', {
  themeName: 'brand',
  darkPrimaryColor: '#42a5f5'
})

// 创建颜色处理器
const processor = await createColorProcessor()

// 创建可访问性检查器
const checker = await createAccessibilityChecker()
```

## 📦 导出模块

为了优化打包体积,建议使用子路径导入:

```typescript path=null start=null
// 核心功能
import { ThemeManager } from '@ldesign/color/exports/core'

// 颜色处理
import { hexToRgb, hslToHex } from '@ldesign/color/exports/color-processing'

// 可访问性
import { checkAccessibility } from '@ldesign/color/exports/accessibility'

// CSS 集成
import { globalThemeApplier } from '@ldesign/color/exports/css-integration'

// 工具函数
import type { Result, Option } from '@ldesign/color/exports/utilities'

// Vue 集成
import { useColorTheme } from '@ldesign/color/vue'
```

## 🎯 TypeScript 支持

完整的 TypeScript 类型定义:

```typescript path=null start=null
import type {
  // 核心类型
  ThemeConfig,
  ColorConfig,
  ColorMode,
  ThemeManagerOptions,
  
  // 颜色类型
  HexColor,
  RgbColor,
  HslColor,
  HsvColor,
  
  // 高级类型
  ColorHarmonyType,
  ColorAnalysisResult,
  WCAGLevel,
  
  // 事件类型
  ThemeEventType,
  ThemeChangeEventData,
  ModeChangeEventData
} from '@ldesign/color'
```

## 💡 最佳实践

### 1. 使用工厂函数

```typescript path=null start=null
// ✅ 推荐 - 使用工厂函数
const manager = await createThemeManagerWithPresets()

// ❌ 不推荐 - 手动实例化和初始化
const manager = new ThemeManager()
await manager.init()
```

### 2. 按需导入

```typescript path=null start=null
// ✅ 推荐 - 按需导入减小体积
import { hexToRgb } from '@ldesign/color/exports/color-processing'

// ❌ 不推荐 - 导入所有功能
import { hexToRgb } from '@ldesign/color'
```

### 3. 使用 TypeScript

```typescript path=null start=null
// ✅ 推荐 - 明确类型
const manager: ThemeManagerInstance = await createThemeManager()

// ✅ 推荐 - 类型守卫
import { isHexColor } from '@ldesign/color/exports/color-processing'

if (isHexColor(color)) {
  // TypeScript 知道 color 是 HexColor 类型
}
```

### 4. 监听主题变化

```typescript path=null start=null
// ✅ 推荐 - 响应主题变化
themeManager.on('theme-changed', ({ theme, mode }) => {
  // 更新你的应用状态
  updateAppTheme(theme, mode)
})
```

### 5. 错误处理

```typescript path=null start=null
// ✅ 推荐 - 捕获错误
themeManager.on('error', (error) => {
  console.error('主题错误:', error)
  // 可选: 切换到备用主题
  themeManager.setTheme('default')
})
```

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ldesign-org/ldesign)
- [NPM 包](https://www.npmjs.com/package/@ldesign/color)
- [更多示例](../examples/)
- [贡献指南](../contributing/)

## 📄 许可证

MIT License © 2024 LDesign Team
