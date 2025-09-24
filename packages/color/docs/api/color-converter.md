# 颜色转换（Color Converter）

```ts
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  rgbToHsv,
  hsvToRgb,
  hexToHsv,
  hsvToHex,
  normalizeHex,
  normalizeHue,
  isValidHex,
} from '@ldesign/color'
```

示例：

```ts
hexToRgb('#1890ff') // { r: 24, g: 144, b: 255 }
rgbToHex(24, 144, 255) // '#1890ff'
```
