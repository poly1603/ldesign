# 色阶系统

通过 `ColorScaleGenerator` 为每个颜色生成 10 级（可扩展）色阶，并自动映射为 CSS 变量。

## 快速示例

```ts
import { generateColorScales, injectThemeVariables } from '@ldesign/color'

const colors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  danger:  '#ff4d4f',
  gray:    '#8c8c8c',
}

const lightScales = generateColorScales(colors, 'light')

// 注入 CSS 变量（亮/暗两套可分别注入）
injectThemeVariables(
  { primary: '#1890ff' },
  { primary: lightScales.primary },
)
```

## 使用索引

- 标准索引：1-10（默认 10 级）
- 常用主色位于索引 5 或 6

```css
.button {
  background: var(--color-primary-5);
}
.button:hover {
  background: var(--color-primary-6);
}
```

## 暗色模式

- 暗色模式下色阶反向：1 更深、10 更浅
- 推荐在 `data-theme-mode="dark"` 选择器下使用暗色变量组

## 语义化变量

库会自动生成部分语义化变量：
- 文本：`--color-text-primary/secondary/...`
- 背景：`--color-bg-primary/secondary/...`
- 边框：`--color-border-primary/secondary/...`

