# 类型守卫 API

@ldesign/color 提供了一套完整的类型守卫函数，用于运行时类型检查和类型断言。

## 颜色格式检查

### isHexColor

检查字符串是否为有效的 HEX 颜色格式。

```typescript
function isHexColor(value: string): value is HexColor
```

**参数：**
- `value` - 要检查的字符串

**返回：**
- `true` - 如果是有效的 HEX 颜色
- `false` - 如果不是有效的 HEX 颜色

**示例：**

```typescript
import { isHexColor } from '@ldesign/color'

if (isHexColor('#ff0000')) {
  console.log('有效的 HEX 颜色')
}

if (isHexColor('#invalid')) {
  console.log('这行不会执行')
}
```

### isRgbColor

检查字符串是否为有效的 RGB 颜色格式。

```typescript
function isRgbColor(value: string): value is RgbColor
```

**参数：**
- `value` - 要检查的字符串

**返回：**
- `true` - 如果是有效的 RGB 颜色
- `false` - 如果不是有效的 RGB 颜色

**示例：**

```typescript
import { isRgbColor } from '@ldesign/color'

if (isRgbColor('rgb(255, 0, 0)')) {
  console.log('有效的 RGB 颜色')
}

if (isRgbColor('rgba(255, 0, 0, 0.5)')) {
  console.log('有效的 RGBA 颜色')
}
```

### isHslColor

检查字符串是否为有效的 HSL 颜色格式。

```typescript
function isHslColor(value: string): value is HslColor
```

**参数：**
- `value` - 要检查的字符串

**返回：**
- `true` - 如果是有效的 HSL 颜色
- `false` - 如果不是有效的 HSL 颜色

**示例：**

```typescript
import { isHslColor } from '@ldesign/color'

if (isHslColor('hsl(0, 100%, 50%)')) {
  console.log('有效的 HSL 颜色')
}

if (isHslColor('hsla(0, 100%, 50%, 0.8)')) {
  console.log('有效的 HSLA 颜色')
}
```

### isColorValue

检查字符串是否为任何有效的颜色格式。

```typescript
function isColorValue(value: string): value is ColorValue
```

**参数：**
- `value` - 要检查的字符串

**返回：**
- `true` - 如果是有效的颜色值
- `false` - 如果不是有效的颜色值

**示例：**

```typescript
import { isColorValue } from '@ldesign/color'

const colors = ['#ff0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)', 'red']

colors.forEach(color => {
  if (isColorValue(color)) {
    console.log(`${color} 是有效的颜色`)
  }
})
```

## 配置对象检查

### isColorConfig

检查对象是否为有效的颜色配置。

```typescript
function isColorConfig(value: unknown): value is ColorConfig
```

**参数：**
- `value` - 要检查的值

**返回：**
- `true` - 如果是有效的颜色配置
- `false` - 如果不是有效的颜色配置

**示例：**

```typescript
import { isColorConfig } from '@ldesign/color'

const config = {
  primary: '#1890ff',
  secondary: '#52c41a',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d'
}

if (isColorConfig(config)) {
  console.log('有效的颜色配置')
}
```

### isThemeConfig

检查对象是否为有效的主题配置。

```typescript
function isThemeConfig(value: unknown): value is ThemeConfig
```

**参数：**
- `value` - 要检查的值

**返回：**
- `true` - 如果是有效的主题配置
- `false` - 如果不是有效的主题配置

**示例：**

```typescript
import { isThemeConfig } from '@ldesign/color'

const themeConfig = {
  light: {
    primary: '#1890ff',
    secondary: '#52c41a'
  },
  dark: {
    primary: '#177ddc',
    secondary: '#49aa19'
  }
}

if (isThemeConfig(themeConfig)) {
  console.log('有效的主题配置')
}
```

## 类型断言

### assertColorValue

断言值为有效的颜色值，如果不是则抛出错误。

```typescript
function assertColorValue(value: unknown, name?: string): asserts value is ColorValue
```

**参数：**
- `value` - 要断言的值
- `name` - 可选的参数名称，用于错误信息

**抛出：**
- `TypeError` - 当值不是有效的颜色值时

**示例：**

```typescript
import { assertColorValue } from '@ldesign/color'

function processColor(color: unknown) {
  assertColorValue(color, 'color')
  // 现在 TypeScript 知道 color 是 ColorValue 类型
  console.log('处理颜色:', color)
}

try {
  processColor('#ff0000') // 正常执行
  processColor('invalid') // 抛出 TypeError
} catch (error) {
  console.error('颜色值无效:', error.message)
}
```

### assertColorConfig

断言值为有效的颜色配置，如果不是则抛出错误。

```typescript
function assertColorConfig(value: unknown, name?: string): asserts value is ColorConfig
```

**参数：**
- `value` - 要断言的值
- `name` - 可选的参数名称，用于错误信息

**抛出：**
- `TypeError` - 当值不是有效的颜色配置时

**示例：**

```typescript
import { assertColorConfig } from '@ldesign/color'

function createTheme(config: unknown) {
  assertColorConfig(config, 'config')
  // 现在 TypeScript 知道 config 是 ColorConfig 类型
  return new ThemeManager(config)
}
```

## 实用工具

### getColorFormat

检测颜色字符串的格式。

```typescript
function getColorFormat(color: string): ColorFormat | null
```

**参数：**
- `color` - 要检测的颜色字符串

**返回：**
- 颜色格式字符串（'hex', 'rgb', 'hsl', 'hsv', 'named'）
- 如果无法识别格式则返回 `null`

**示例：**

```typescript
import { getColorFormat } from '@ldesign/color'

console.log(getColorFormat('#ff0000')) // 'hex'
console.log(getColorFormat('rgb(255, 0, 0)')) // 'rgb'
console.log(getColorFormat('hsl(0, 100%, 50%)')) // 'hsl'
console.log(getColorFormat('red')) // 'named'
console.log(getColorFormat('invalid')) // null
```

### isValidColorFormat

检查字符串是否为有效的颜色格式名称。

```typescript
function isValidColorFormat(format: string): format is ColorFormat
```

**参数：**
- `format` - 要检查的格式字符串

**返回：**
- `true` - 如果是有效的颜色格式
- `false` - 如果不是有效的颜色格式

**示例：**

```typescript
import { isValidColorFormat } from '@ldesign/color'

console.log(isValidColorFormat('hex')) // true
console.log(isValidColorFormat('rgb')) // true
console.log(isValidColorFormat('invalid')) // false
```

## 最佳实践

### 1. 在函数入口处使用类型守卫

```typescript
import { isColorValue, isColorConfig } from '@ldesign/color'

function createColorPalette(baseColor: unknown, config: unknown) {
  if (!isColorValue(baseColor)) {
    throw new Error('Invalid base color')
  }
  
  if (!isColorConfig(config)) {
    throw new Error('Invalid color config')
  }
  
  // 现在可以安全地使用 baseColor 和 config
}
```

### 2. 结合类型断言进行严格检查

```typescript
import { assertColorValue } from '@ldesign/color'

function strictColorProcessor(color: unknown) {
  assertColorValue(color, 'color parameter')
  // TypeScript 现在知道 color 是 ColorValue 类型
  return processColor(color)
}
```

### 3. 使用格式检测进行条件处理

```typescript
import { getColorFormat } from '@ldesign/color'

function adaptiveColorConverter(color: string) {
  const format = getColorFormat(color)
  
  switch (format) {
    case 'hex':
      return convertFromHex(color)
    case 'rgb':
      return convertFromRgb(color)
    case 'hsl':
      return convertFromHsl(color)
    default:
      throw new Error(`Unsupported color format: ${format}`)
  }
}
```
