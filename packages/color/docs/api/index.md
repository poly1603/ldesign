# API 参考

@ldesign/color 提供了丰富的 API 来满足各种主题管理需求。本节包含所有公开 API 的详细文档。

## 快速导航

### 核心 API

- [ThemeManager](/api/theme-manager) - 主题管理器核心类
- [创建函数](/api/create-functions) - 便捷的创建函数
- [类型定义](/api/types) - TypeScript 类型定义

### 工具 API

- [颜色转换](/api/color-converter) - 颜色格式转换工具
- [颜色生成](/api/color-generator) - 智能颜色生成器
- [色阶生成](/api/color-scales) - 色阶生成系统
- [CSS 注入](/api/css-injector) - CSS 变量注入器

### Vue API

- [组合式 API](/api/vue-composables) - Vue 3 组合式 API
- [Vue 插件](/api/vue-plugin) - Vue 插件和配置

## 主要导出

### 核心类和函数

```typescript
// 主题管理器
export { ThemeManager } from './core/theme-manager'

// 便捷创建函数
export {
  createCustomThemeManager,
  createSimpleThemeManager,
  createThemeManager,
  createThemeManagerWithPresets
} from './index'

// 颜色生成
export {
  ColorGeneratorImpl,
  createColorGenerator,
  generateColorConfig,
  safeGenerateColorConfig
} from './utils/color-generator'

// 色阶生成
export {
  ColorScaleGenerator,
  createColorScaleGenerator,
  generateColorScale,
  generateColorScales
} from './utils/color-scale'
```

### 类型定义

```typescript
// 核心类型
export type {
  ColorCategory,
  ColorConfig,
  ColorMode,
  ColorScale,
  ColorValue,
  GeneratedTheme,
  ThemeConfig,
  ThemeManagerInstance,
  ThemeManagerOptions
} from './core/types'

// 工具类型
export type {
  HSL,
  RGB
} from './utils/color-converter'

export type {
  ColorScaleOptions
} from './utils/color-scale'

export type {
  CSSInjectionOptions
} from './utils/css-injector'
```

### Vue 集成

```typescript
// Vue 组合式 API
export {
  useSystemThemeSync,
  useTheme,
  useThemeSelector,
  useThemeToggle
} from './vue'

// Vue 插件
export {
  installThemePlugin,
  ThemePlugin
} from './vue'
```

## 使用模式

### 基础使用

```typescript
import { createThemeManagerWithPresets } from '@ldesign/color'

const themeManager = await createThemeManagerWithPresets()
await themeManager.setTheme('green')
```

### 高级使用

```typescript
import {
  COLOR_GENERATION_PRESETS,
  createColorGenerator,
  generateColorConfig,
  ThemeManager
} from '@ldesign/color'

// 自定义颜色生成
const generator = createColorGenerator(COLOR_GENERATION_PRESETS.vibrant)
const colors = generator.generateColors('#1890ff')

// 创建自定义主题
const customTheme = {
  name: 'custom',
  light: colors,
  dark: colors
}

// 创建管理器
const themeManager = new ThemeManager({
  themes: [customTheme],
  defaultTheme: 'custom'
})

await themeManager.init()
```

### Vue 集成使用

```typescript
// 插件安装
import { ThemePlugin } from '@ldesign/color/vue'

// 组合式 API
import { useTheme } from '@ldesign/color/vue'
app.use(ThemePlugin)
const { currentTheme, setTheme } = useTheme()
```

## 错误处理

所有异步 API 都可能抛出错误，建议使用 try-catch 处理：

```typescript
try {
  const themeManager = await createThemeManagerWithPresets()
  await themeManager.setTheme('nonexistent-theme')
}
catch (error) {
  console.error('主题操作失败:', error.message)
}
```

## 浏览器兼容性

@ldesign/color 支持所有现代浏览器：

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

对于不支持 `requestIdleCallback` 的浏览器，会自动回退到 `setTimeout`。

## 性能考虑

### 按需导入

```typescript
// 推荐：按需导入
import { createThemeManager } from '@ldesign/color'
// 避免：全量导入
import * as LDesignColor from '@ldesign/color'

import { useTheme } from '@ldesign/color/vue'
```

### 预生成优化

```typescript
// 在应用启动时预生成主题
const themeManager = await createThemeManagerWithPresets({
  idleProcessing: true
})

// 预生成所有主题
await themeManager.preGenerateAllThemes()
```

## 调试

启用调试模式查看详细日志：

```typescript
// 在开发环境中启用详细日志
const themeManager = await createThemeManagerWithPresets({
  onThemeChanged: (theme, mode) => {
    console.log(`[DEBUG] 主题变化: ${theme} - ${mode}`)
  },
  onError: (error) => {
    console.error('[DEBUG] 主题错误:', error)
  }
})
```

## 下一步

选择您感兴趣的 API 部分深入了解：

- [ThemeManager](/api/theme-manager) - 核心主题管理器 API
- [创建函数](/api/create-functions) - 便捷的创建和配置函数
- [颜色生成](/api/color-generator) - 智能颜色生成算法
- [Vue 组合式 API](/api/vue-composables) - Vue 3 集成 API
