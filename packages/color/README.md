# @ldesign/color 🎨

一个功能强大、性能卓越的现代颜色处理库，为您的应用提供完整的颜色管理解决方案！

## ✨ 核心特性

### 🎨 智能颜色处理
- **智能颜色生成** - 基于 a-nice-red 算法生成和谐配色
- **完整颜色转换** - 支持 HEX、RGB、HSL、HSV 格式互转
- **颜色混合** - 支持 12 种混合模式（正常、正片叠底、滤色等）
- **颜色调整** - 亮度、饱和度、色相调整
- **渐变生成** - 线性和径向渐变 CSS 生成

### 🌈 调色板生成
- **单色调色板** - 基于单一颜色生成明暗变化
- **类似色调色板** - 生成相邻色相的和谐配色
- **互补色调色板** - 生成对比强烈的配色方案
- **三元色/四元色** - 专业的配色理论支持

### ♿ 可访问性检查
- **WCAG 标准** - 支持 AA/AAA 级别对比度检查
- **颜色盲模拟** - 8 种颜色盲类型模拟
- **智能建议** - 自动生成符合标准的配色建议
- **批量检查** - 一键检查整套配色方案

### 🎯 主题管理
- **动态主题切换** - 无缝切换明暗主题
- **系统主题检测** - 自动跟随系统主题
- **自定义主题** - 灵活的主题配置系统
- **CSS 变量注入** - 自动管理 CSS 自定义属性

### ⚡ 性能优化
- **闲时处理** - 利用浏览器空闲时间处理任务
- **LRU 缓存** - 智能缓存提升性能
- **预生成策略** - 预先计算常用颜色
- **内存管理** - 自动清理过期缓存

### 🔧 框架集成
- **Vue 3 支持** - 完整的组合式 API 和组件
- **TypeScript** - 100% TypeScript 编写，完整类型定义
- **现代构建** - ESM/CJS 双格式输出
- **Tree Shaking** - 按需引入，减小包体积

## 🚀 快速开始

### 安装

```bash
# npm
npm install @ldesign/color

# yarn
yarn add @ldesign/color

# pnpm
pnpm add @ldesign/color
```

### 基础使用

```typescript
import { 
  hexToRgb, 
  generateMonochromaticPalette,
  checkAccessibility,
  blendColors 
} from '@ldesign/color'

// 颜色转换
const rgb = hexToRgb('#1890ff')
console.log(rgb) // { r: 24, g: 144, b: 255 }

// 生成调色板
const palette = generateMonochromaticPalette('#1890ff', 5)
console.log(palette) // ['#0d4377', '#1890ff', '#40a9ff', '#69c0ff', '#91d5ff']

// 可访问性检查
const result = checkAccessibility('#ffffff', '#1890ff')
console.log(result.isAccessible) // true
console.log(result.contrastRatio) // 3.26

// 颜色混合
const mixed = blendColors('#ff0000', '#0000ff', 'multiply', 0.5)
console.log(mixed) // '#800080'
```

### Vue 3 集成

```vue
<template>
  <div>
    <!-- 颜色选择器 -->
    <ColorPicker v-model:color="selectedColor" />
    
    <!-- 主题切换器 -->
    <ThemeToggle />
    
    <!-- 调色板生成器 -->
    <PaletteGenerator 
      :base-color="selectedColor"
      palette-type="monochromatic"
      @palette-change="onPaletteChange"
    />
    
    <!-- 可访问性检查器 -->
    <AccessibilityChecker 
      :foreground-color="textColor"
      :background-color="backgroundColor"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  ColorPicker, 
  ThemeToggle, 
  PaletteGenerator,
  AccessibilityChecker 
} from '@ldesign/color/vue'

const selectedColor = ref('#1890ff')
const textColor = ref('#000000')
const backgroundColor = ref('#ffffff')

const onPaletteChange = (colors: string[]) => {
  console.log('新调色板:', colors)
}
</script>
```

## 📚 API 文档

### 颜色转换

```typescript
// HEX ↔ RGB
hexToRgb('#1890ff') // { r: 24, g: 144, b: 255 }
rgbToHex(24, 144, 255) // '#1890ff'

// RGB ↔ HSL
rgbToHsl(24, 144, 255) // { h: 210, s: 100, l: 55 }
hslToRgb(210, 100, 55) // { r: 24, g: 144, b: 255 }

// RGB ↔ HSV
rgbToHsv(24, 144, 255) // { h: 210, s: 91, v: 100 }
hsvToRgb(210, 91, 100) // { r: 24, g: 144, b: 255 }
```

### 颜色调整

```typescript
// 调整亮度 (-100 到 100)
adjustBrightness('#1890ff', 20) // '#4da6ff'

// 调整饱和度 (-100 到 100)
adjustSaturation('#1890ff', -30) // '#4d8fb8'

// 调整色相 (-360 到 360)
adjustHue('#1890ff', 60) // '#1890ff' -> '#18ff90'
```

### 颜色混合

```typescript
// 支持的混合模式
type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay'
  | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn'
  | 'darken' | 'lighten' | 'difference' | 'exclusion'

blendColors('#ff0000', '#0000ff', 'multiply', 0.5)
```

### 调色板生成

```typescript
// 单色调色板
generateMonochromaticPalette('#1890ff', 5)

// 类似色调色板
generateAnalogousPalette('#1890ff', 5)

// 互补色调色板
generateComplementaryPalette('#1890ff')

// 三元色调色板
generateTriadicPalette('#1890ff')

// 四元色调色板
generateTetradicPalette('#1890ff')
```

### 可访问性检查

```typescript
// WCAG 对比度检查
checkAccessibility('#000000', '#ffffff', 'normal')
// {
//   isAccessible: true,
//   contrastRatio: 21,
//   level: 'AAA',
//   recommendations: []
// }

// 颜色盲模拟
simulateColorBlindness('#ff0000', 'protanopia')
// {
//   original: '#ff0000',
//   simulated: '#b8860b',
//   type: 'protanopia',
//   severity: 1
// }
```

## 🎨 Vue 组件

### ColorPicker - 颜色选择器

```vue
<ColorPicker 
  v-model:color="color"
  :show-alpha="true"
  :show-presets="true"
  @color-change="onColorChange"
/>
```

### PaletteGenerator - 调色板生成器

```vue
<PaletteGenerator 
  :base-color="baseColor"
  palette-type="monochromatic"
  :count="5"
  @palette-change="onPaletteChange"
/>
```

### AccessibilityChecker - 可访问性检查器

```vue
<AccessibilityChecker 
  :foreground-color="textColor"
  :background-color="bgColor"
  level="AA"
  text-size="normal"
/>
```

### ColorMixer - 颜色混合器

```vue
<ColorMixer 
  :base-color="color1"
  :overlay-color="color2"
  mode="multiply"
  :opacity="0.5"
  @color-change="onMixedColorChange"
/>
```

## 🔧 高级用法

### 主题管理

```typescript
import { ThemeManager } from '@ldesign/color'

const themeManager = new ThemeManager({
  themes: {
    light: { primary: '#1890ff', background: '#ffffff' },
    dark: { primary: '#177ddc', background: '#000000' }
  },
  defaultTheme: 'light',
  storage: 'localStorage'
})

// 切换主题
themeManager.setTheme('dark')

// 监听主题变化
themeManager.on('themeChange', (theme) => {
  console.log('主题已切换到:', theme)
})
```

### 性能优化

```typescript
import { IdleProcessor, createLRUCache } from '@ldesign/color'

// 使用闲时处理器
const processor = new IdleProcessor()
processor.schedule(() => {
  // 在浏览器空闲时执行的任务
  generateColorPalettes()
})

// 使用 LRU 缓存
const cache = createLRUCache<string, string>(100)
cache.set('color1', '#1890ff')
```

## 📖 更多文档

- [完整 API 文档](./docs/api/README.md)
- [使用指南](./docs/guide/README.md)
- [示例项目](./examples/README.md)
- [项目架构](./summary/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
