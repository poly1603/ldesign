# 颜色处理 API

## 颜色格式转换

### HEX ↔ RGB

```typescript
import { hexToRgb, rgbToHex } from '@ldesign/color'

// HEX 转 RGB
const rgb = hexToRgb('#1890ff')
console.log(rgb) // { r: 24, g: 144, b: 255 }

// RGB 转 HEX
const hex = rgbToHex(24, 144, 255)
console.log(hex) // '#1890ff'
```

### RGB ↔ HSL

```typescript
import { rgbToHsl, hslToRgb } from '@ldesign/color'

// RGB 转 HSL
const hsl = rgbToHsl(24, 144, 255)
console.log(hsl) // { h: 210, s: 100, l: 55 }

// HSL 转 RGB
const rgb = hslToRgb(210, 100, 55)
console.log(rgb) // { r: 24, g: 144, b: 255 }
```

### RGB ↔ HSV

```typescript
import { rgbToHsv, hsvToRgb } from '@ldesign/color'

// RGB 转 HSV
const hsv = rgbToHsv(24, 144, 255)
console.log(hsv) // { h: 210, s: 91, v: 100 }

// HSV 转 RGB
const rgb = hsvToRgb(210, 91, 100)
console.log(rgb) // { r: 24, g: 144, b: 255 }
```

### 便捷转换函数

```typescript
import { hexToHsl, hexToHsv, hslToHex, hsvToHex } from '@ldesign/color'

// 直接转换
const hsl = hexToHsl('#1890ff')
const hsv = hexToHsv('#1890ff')
const hex1 = hslToHex(210, 100, 55)
const hex2 = hsvToHex(210, 91, 100)
```

## 颜色调整

### 亮度调整

```typescript
import { adjustBrightness } from '@ldesign/color'

// 增加亮度
const brighter = adjustBrightness('#1890ff', 20)
console.log(brighter) // '#4da6ff'

// 减少亮度
const darker = adjustBrightness('#1890ff', -20)
console.log(darker) // '#0066cc'
```

### 饱和度调整

```typescript
import { adjustSaturation } from '@ldesign/color'

// 增加饱和度
const moreSaturated = adjustSaturation('#1890ff', 20)

// 减少饱和度（更灰）
const lessSaturated = adjustSaturation('#1890ff', -30)
```

### 色相调整

```typescript
import { adjustHue } from '@ldesign/color'

// 色相偏移 60 度
const shifted = adjustHue('#1890ff', 60)

// 色相偏移 -120 度
const shifted2 = adjustHue('#1890ff', -120)
```

## 颜色混合

### 基础混合

```typescript
import { blendColors } from '@ldesign/color'

// 正常混合
const normal = blendColors('#ff0000', '#0000ff', 'normal', 0.5)

// 正片叠底
const multiply = blendColors('#ff0000', '#0000ff', 'multiply', 0.5)

// 滤色
const screen = blendColors('#ff0000', '#0000ff', 'screen', 0.5)
```

### 支持的混合模式

```typescript
type BlendMode = 
  | 'normal'      // 正常
  | 'multiply'    // 正片叠底
  | 'screen'      // 滤色
  | 'overlay'     // 叠加
  | 'soft-light'  // 柔光
  | 'hard-light'  // 强光
  | 'color-dodge' // 颜色减淡
  | 'color-burn'  // 颜色加深
  | 'darken'      // 变暗
  | 'lighten'     // 变亮
  | 'difference'  // 差值
  | 'exclusion'   // 排除
```

## 颜色插值

### 两色插值

```typescript
import { interpolateColors } from '@ldesign/color'

// 在红色和蓝色之间插值
const middle = interpolateColors('#ff0000', '#0000ff', 0.5)
console.log(middle) // '#800080'

// 更接近红色
const nearRed = interpolateColors('#ff0000', '#0000ff', 0.2)

// 更接近蓝色
const nearBlue = interpolateColors('#ff0000', '#0000ff', 0.8)
```

### 渐变序列生成

```typescript
import { generateColorGradient } from '@ldesign/color'

// 生成 5 步渐变
const gradient = generateColorGradient('#ff0000', '#0000ff', 5)
console.log(gradient)
// ['#ff0000', '#bf003f', '#80007f', '#4000bf', '#0000ff']
```

## 渐变 CSS 生成

### 线性渐变

```typescript
import { generateLinearGradient } from '@ldesign/color'

const config = {
  direction: 'to-right' as const,
  stops: [
    { color: '#ff0000', position: 0 },
    { color: '#00ff00', position: 50 },
    { color: '#0000ff', position: 100 }
  ]
}

const css = generateLinearGradient(config)
console.log(css)
// 'linear-gradient(to right, #ff0000 0%, #00ff00 50%, #0000ff 100%)'
```

### 径向渐变

```typescript
import { generateRadialGradient } from '@ldesign/color'

const stops = [
  { color: '#ff0000', position: 0 },
  { color: '#0000ff', position: 100 }
]

const css = generateRadialGradient(stops, 'circle', 'closest-side')
console.log(css)
// 'radial-gradient(circle closest-side, #ff0000 0%, #0000ff 100%)'
```

## 颜色感知

### 感知亮度

```typescript
import { getPerceivedBrightness, isDark, isLight } from '@ldesign/color'

// 获取感知亮度 (0-255)
const brightness = getPerceivedBrightness('#1890ff')
console.log(brightness) // 约 144

// 判断是否为深色
const dark = isDark('#1890ff') // false
const light = isLight('#1890ff') // true
```

### 最佳文本颜色

```typescript
import { getBestTextColor } from '@ldesign/color'

// 为背景色选择最佳文本颜色
const textColor1 = getBestTextColor('#000000') // '#ffffff'
const textColor2 = getBestTextColor('#ffffff') // '#000000'
const textColor3 = getBestTextColor('#1890ff') // '#ffffff'
```

## 类型定义

```typescript
// 颜色格式接口
interface RGB {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

interface HSL {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
}

interface HSV {
  h: number // 0-360
  s: number // 0-100
  v: number // 0-100
}

// 渐变配置
interface GradientStop {
  color: string
  position: number // 0-100
}

interface GradientConfig {
  direction: GradientDirection
  stops: GradientStop[]
}

type GradientDirection = 
  | 'to-right' | 'to-left' | 'to-bottom' | 'to-top'
  | 'to-bottom-right' | 'to-bottom-left' 
  | 'to-top-right' | 'to-top-left'
```
