# 颜色生成

@ldesign/color 基于 HSL 与色彩和谐理论，从单一主色自动生成一套语义化颜色。

## 快速示例

```ts
import { generateColorConfig } from '@ldesign/color'

const colors = generateColorConfig('#1890ff')
// {
//   primary: '#1890ff',
//   success: '#52c41a',
//   warning: '#faad14',
//   danger:  '#ff4d4f',
//   gray:    '#8c8c8c'
// }
```

## 自定义生成策略

```ts
import { COLOR_GENERATION_PRESETS, createColorGenerator } from '@ldesign/color'

// 使用预设（vibrant/soft 等）
const colorsVibrant = createColorGenerator(COLOR_GENERATION_PRESETS.vibrant)
  .generateColors('#1890ff')

// 自定义配置
const generator = createColorGenerator({
  successHueOffset: 90,
  warningHueOffset: 30,
  saturationRange: [0.8, 1.2],
})
const colorsCustom = generator.generateColors('#1890ff')
```

## 暗色模式适配

```ts
import { createColorGenerator } from '@ldesign/color'

const g = createColorGenerator()
g.setMode('dark')
const darkColors = g.generateColorsForCurrentMode('#1890ff')
```

## 最佳实践

- 主色建议为 HEX 格式，保证算法一致性
- 主题场景下建议结合色阶系统使用（见“色阶系统”）

