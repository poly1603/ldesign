# 调色板 API

## 调色板生成

### 单色调色板

基于单一颜色生成明暗变化的调色板。

```typescript
import { generateMonochromaticPalette } from '@ldesign/color'

// 生成 5 个颜色的单色调色板
const palette = generateMonochromaticPalette('#1890ff', 5)
console.log(palette)
// ['#0d4377', '#1890ff', '#40a9ff', '#69c0ff', '#91d5ff']

// 生成更多颜色
const largePalette = generateMonochromaticPalette('#1890ff', 10)
```

**特点：**

- 基于亮度变化生成
- 保持色相和饱和度一致
- 适合创建层次感设计

### 类似色调色板

生成相邻色相的和谐配色。

```typescript
import { generateAnalogousPalette } from '@ldesign/color'

// 生成类似色调色板
const palette = generateAnalogousPalette('#1890ff', 5)
console.log(palette)
// ['#1890ff', '#18c7ff', '#18ffb8', '#51ff18', '#b8ff18']

// 生成 3 色类似色
const triadic = generateAnalogousPalette('#ff6b6b', 3)
```

**特点：**

- 色相范围 ±30 度
- 自然和谐的配色
- 适合温和的设计风格

### 互补色调色板

生成对比强烈的配色方案。

```typescript
import { generateComplementaryPalette } from '@ldesign/color'

// 生成互补色调色板
const palette = generateComplementaryPalette('#1890ff')
console.log(palette)
// ['#1890ff', '#ff9018'] // 蓝色和橙色

// 互补色总是返回 2 个颜色
```

**特点：**

- 色相相差 180 度
- 强烈的视觉对比
- 适合突出重点元素

### 三元色调色板

基于三元色理论的配色。

```typescript
import { generateTriadicPalette } from '@ldesign/color'

// 生成三元色调色板
const palette = generateTriadicPalette('#1890ff')
console.log(palette)
// ['#1890ff', '#ff1890', '#90ff18'] // 120度间隔

// 三元色总是返回 3 个颜色
```

**特点：**

- 色相间隔 120 度
- 平衡的视觉效果
- 适合多元素设计

### 四元色调色板

基于四元色理论的配色。

```typescript
import { generateTetradicPalette } from '@ldesign/color'

// 生成四元色调色板
const palette = generateTetradicPalette('#1890ff')
console.log(palette)
// ['#1890ff', '#90ff18', '#ff9018', '#ff1890'] // 90度间隔

// 四元色总是返回 4 个颜色
```

**特点：**

- 色相间隔 90 度
- 丰富的色彩组合
- 适合复杂的设计系统

## 调色板应用

### 设计系统配色

```typescript
import {
  generateMonochromaticPalette,
  generateComplementaryPalette,
  generateTriadicPalette,
} from '@ldesign/color'

// 主色调色板
const primaryPalette = generateMonochromaticPalette('#1890ff', 10)

// 辅助色
const [primary, secondary] = generateComplementaryPalette('#1890ff')

// 状态色
const [success, warning, error] = generateTriadicPalette('#52c41a')

const designSystem = {
  primary: {
    50: primaryPalette[0],
    100: primaryPalette[1],
    200: primaryPalette[2],
    // ... 更多层级
    900: primaryPalette[9],
  },
  secondary,
  success,
  warning,
  error,
}
```

### 数据可视化配色

```typescript
import { generateAnalogousPalette, interpolateColors } from '@ldesign/color'

// 为图表生成配色
function generateChartColors(baseColor: string, count: number) {
  if (count <= 5) {
    return generateAnalogousPalette(baseColor, count)
  }

  // 大量颜色时使用插值
  const colors = []
  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1)
    colors.push(interpolateColors(baseColor, adjustHue(baseColor, 180), factor))
  }
  return colors
}

const chartColors = generateChartColors('#1890ff', 8)
```

### 主题配色生成

```typescript
import {
  generateMonochromaticPalette,
  generateComplementaryPalette,
  adjustBrightness,
} from '@ldesign/color'

function generateThemeColors(brandColor: string) {
  const [primary, secondary] = generateComplementaryPalette(brandColor)
  const primaryShades = generateMonochromaticPalette(primary, 9)

  return {
    // 主色系
    primary: {
      50: primaryShades[0],
      100: primaryShades[1],
      200: primaryShades[2],
      300: primaryShades[3],
      400: primaryShades[4],
      500: primary, // 基础色
      600: primaryShades[5],
      700: primaryShades[6],
      800: primaryShades[7],
      900: primaryShades[8],
    },

    // 辅助色
    secondary,

    // 中性色
    gray: generateMonochromaticPalette('#8c8c8c', 9),

    // 语义色
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: primary,
  }
}

const themeColors = generateThemeColors('#1890ff')
```

## 调色板工具

### 调色板分析

```typescript
import { getContrastRatio, getPerceivedBrightness } from '@ldesign/color'

function analyzePalette(colors: string[]) {
  return colors.map((color, index) => ({
    color,
    brightness: getPerceivedBrightness(color),
    contrasts: colors.map(otherColor => getContrastRatio(color, otherColor)),
  }))
}

const palette = generateMonochromaticPalette('#1890ff', 5)
const analysis = analyzePalette(palette)
```

### 调色板优化

```typescript
import { isAccessible, adjustBrightness } from '@ldesign/color'

function optimizePaletteForAccessibility(
  colors: string[],
  backgroundColor: string = '#ffffff'
) {
  return colors.map(color => {
    if (isAccessible(color, backgroundColor)) {
      return color
    }

    // 尝试调整亮度以满足可访问性
    for (let adjustment = -50; adjustment <= 50; adjustment += 10) {
      const adjusted = adjustBrightness(color, adjustment)
      if (isAccessible(adjusted, backgroundColor)) {
        return adjusted
      }
    }

    return color // 如果无法优化，返回原色
  })
}

const originalPalette = generateAnalogousPalette('#ffeb3b', 5)
const optimizedPalette = optimizePaletteForAccessibility(originalPalette)
```

## 类型定义

```typescript
// 调色板生成函数类型
type PaletteGenerator = (baseColor: string, count?: number) => string[]

// 调色板类型
type PaletteType =
  | 'monochromatic' // 单色
  | 'analogous' // 类似色
  | 'complementary' // 互补色
  | 'triadic' // 三元色
  | 'tetradic' // 四元色

// 调色板配置
interface PaletteConfig {
  type: PaletteType
  baseColor: string
  count?: number
  options?: {
    hueRange?: number // 色相范围（类似色）
    brightnessRange?: number // 亮度范围（单色）
    saturationRange?: number // 饱和度范围
  }
}

// 调色板分析结果
interface PaletteAnalysis {
  color: string
  brightness: number
  contrasts: number[]
  accessibility: {
    wcagAA: boolean
    wcagAAA: boolean
  }
}
```

## 最佳实践

### 1. 选择合适的调色板类型

- **单色调色板**：适合简洁、专业的设计
- **类似色调色板**：适合自然、和谐的设计
- **互补色调色板**：适合需要强对比的设计
- **三元色/四元色**：适合丰富、活泼的设计

### 2. 考虑可访问性

```typescript
import { checkAccessibility } from '@ldesign/color'

// 检查调色板的可访问性
function validatePaletteAccessibility(colors: string[]) {
  const results = []

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const result = checkAccessibility(colors[i], colors[j])
      if (!result.isAccessible) {
        results.push({
          color1: colors[i],
          color2: colors[j],
          ratio: result.contrastRatio,
          recommendations: result.recommendations,
        })
      }
    }
  }

  return results
}
```

### 3. 响应式调色板

```typescript
// 为不同主题模式生成调色板
function generateResponsivePalette(baseColor: string) {
  return {
    light: generateMonochromaticPalette(baseColor, 9),
    dark: generateMonochromaticPalette(
      adjustBrightness(baseColor, -20),
      9
    ).reverse(), // 深色模式反转顺序
  }
}
```
