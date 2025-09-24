# 可访问性与高对比度

@ldesign/color 提供基于 WCAG 的可访问性检查工具与高对比度覆盖能力，帮助你在不同背景与主题下保证文本可读性。

## 可访问性检查

```ts
import {
  checkAccessibility,
  getAccessibleColorSuggestions,
} from '@ldesign/color'

// 检查前景/背景对比度
const result = checkAccessibility('#000000', '#ffffff', 'normal')
console.log(result.isAccessible, result.contrastRatio, result.level)

// 获取符合 AA/AAA 的建议组合
const suggestions = getAccessibleColorSuggestions('#1890ff', 'AA', 'normal')
```

## 颜色盲模拟与检查

```ts
import {
  simulateColorBlindness,
  checkColorBlindnessAccessibility,
} from '@ldesign/color'

const simulated = simulateColorBlindness('#1890ff', 'deuteranopia', 1)
const report = checkColorBlindnessAccessibility([
  '#1890ff',
  '#52c41a',
  '#faad14',
])
```

## 高对比度覆盖（High Contrast Overrides）

在某些场景下，你可以为页面或应用启用高对比度覆盖以提升文本与边框可读性：

```ts
import { ThemeManager } from '@ldesign/color'

const tm = new ThemeManager({
  themes: [
    /* ... */
  ],
  cssPrefix: '--color',
})
await tm.init()

// 启用高对比度覆盖
tm.enableHighContrast(true, { level: 'AA', textSize: 'normal' })

// 关闭高对比度覆盖
tm.enableHighContrast(false)
```

说明：

- 启用后，会在页面注入一个覆盖层 style（ldesign-theme-variables-contrast），对常见文本/边框变量进行更强对比度的覆盖。
- 该覆盖层与 SSR、Scoped Theming 及 Constructable 注入兼容。
- 这是一个安全兜底策略，建议优先在主题设计阶段通过色阶/语义变量的合理配置满足可访问性。
