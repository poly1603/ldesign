# ColorUtils - 颜色处理工具

ColorUtils 是一个强大的颜色处理工具类，提供颜色格式转换、颜色操作和颜色分析功能。

## 功能特性

- 🎨 **颜色格式转换**: 支持 RGB、HSL、Hex 格式之间的相互转换
- 🌈 **颜色操作**: 提供颜色变亮、变暗、混合等操作
- 📊 **颜色分析**: 计算颜色对比度、亮度、获取补色等
- ♿ **可访问性**: 遵循 WCAG 2.0 标准的对比度计算
- 🎯 **调色板生成**: 基于基础颜色生成协调的调色板

## 安装使用

```typescript
import { ColorUtils } from '@ldesign/kit'

// 或者单独导入
import { ColorUtils } from '@ldesign/kit/utils'
```

## 基础用法

### 颜色格式转换

```typescript
// Hex 转 RGB
const rgb = ColorUtils.hexToRgb('#ff0000')
console.log(rgb) // { r: 255, g: 0, b: 0 }

// RGB 转 Hex
const hex = ColorUtils.rgbToHex({ r: 255, g: 0, b: 0 })
console.log(hex) // '#ff0000'

// RGB 转 HSL
const hsl = ColorUtils.rgbToHsl({ r: 255, g: 0, b: 0 })
console.log(hsl) // { h: 0, s: 100, l: 50 }

// HSL 转 RGB
const rgbFromHsl = ColorUtils.hslToRgb({ h: 0, s: 100, l: 50 })
console.log(rgbFromHsl) // { r: 255, g: 0, b: 0 }
```

### 颜色操作

```typescript
// 使颜色变亮
const lighter = ColorUtils.lighten('#ff0000', 0.2)
console.log(lighter) // '#ff6666'

// 使颜色变暗
const darker = ColorUtils.darken('#ff0000', 0.2)
console.log(darker) // '#cc0000'

// 混合两种颜色
const mixed = ColorUtils.mix('#ff0000', '#0000ff', 0.5)
console.log(mixed) // '#800080'
```

### 颜色分析

```typescript
// 计算对比度
const contrast = ColorUtils.getContrast('#000000', '#ffffff')
console.log(contrast) // 21 (最高对比度)

// 判断颜色明暗
const isLight = ColorUtils.isLight('#ffffff')
console.log(isLight) // true

const isDark = ColorUtils.isDark('#000000')
console.log(isDark) // true

// 获取补色
const complement = ColorUtils.getComplement('#ff0000')
console.log(complement) // '#00ffff'

// 计算亮度
const luminance = ColorUtils.getLuminance('#ff0000')
console.log(luminance) // 0.2126
```

### 调色板生成

```typescript
// 生成基于基础颜色的调色板
const palette = ColorUtils.generatePalette('#ff0000', 5)
console.log(palette)
// ['#ff0000', '#ff4000', '#ff8000', '#ffbf00', '#ffff00']
```

## 高级用法

### 可访问性检查

```typescript
// 检查文本和背景色的对比度是否符合 WCAG 标准
function checkAccessibility(textColor: string, backgroundColor: string) {
  const contrast = ColorUtils.getContrast(textColor, backgroundColor)
  
  if (contrast >= 7) {
    return 'AAA级别 - 最佳可访问性'
  } else if (contrast >= 4.5) {
    return 'AA级别 - 良好可访问性'
  } else {
    return '不符合可访问性标准'
  }
}

console.log(checkAccessibility('#000000', '#ffffff')) // 'AAA级别 - 最佳可访问性'
```

### 主题色生成

```typescript
// 基于主色生成完整的主题色板
function generateTheme(primaryColor: string) {
  return {
    primary: primaryColor,
    primaryLight: ColorUtils.lighten(primaryColor, 0.2),
    primaryDark: ColorUtils.darken(primaryColor, 0.2),
    secondary: ColorUtils.getComplement(primaryColor),
    palette: ColorUtils.generatePalette(primaryColor, 5)
  }
}

const theme = generateTheme('#3498db')
console.log(theme)
```

## API 参考

### 类型定义

```typescript
interface RgbColor {
  r: number  // 红色分量 (0-255)
  g: number  // 绿色分量 (0-255)
  b: number  // 蓝色分量 (0-255)
}

interface HslColor {
  h: number  // 色相 (0-360)
  s: number  // 饱和度 (0-100)
  l: number  // 亮度 (0-100)
}
```

### 方法列表

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `hexToRgb` | Hex转RGB | `hex: string` | `RgbColor` |
| `rgbToHex` | RGB转Hex | `rgb: RgbColor` | `string` |
| `rgbToHsl` | RGB转HSL | `rgb: RgbColor` | `HslColor` |
| `hslToRgb` | HSL转RGB | `hsl: HslColor` | `RgbColor` |
| `lighten` | 颜色变亮 | `color: string, amount: number` | `string` |
| `darken` | 颜色变暗 | `color: string, amount: number` | `string` |
| `mix` | 混合颜色 | `color1: string, color2: string, weight?: number` | `string` |
| `getContrast` | 计算对比度 | `color1: string, color2: string` | `number` |
| `isLight` | 判断是否为浅色 | `color: string` | `boolean` |
| `isDark` | 判断是否为深色 | `color: string` | `boolean` |
| `getLuminance` | 计算亮度 | `color: string` | `number` |
| `getComplement` | 获取补色 | `color: string` | `string` |
| `generatePalette` | 生成调色板 | `baseColor: string, count: number` | `string[]` |

## 注意事项

1. **颜色值范围**: 确保输入的颜色值在有效范围内
2. **性能考虑**: 大量颜色计算时考虑缓存结果
3. **浏览器兼容性**: 某些高级功能可能需要现代浏览器支持
4. **可访问性**: 使用对比度计算确保界面的可访问性

## 相关资源

- [WCAG 2.0 对比度指南](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [颜色理论基础](https://en.wikipedia.org/wiki/Color_theory)
- [HSL颜色模型](https://en.wikipedia.org/wiki/HSL_and_HSV)
