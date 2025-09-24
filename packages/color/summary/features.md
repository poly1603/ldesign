# 主要功能详解

## 🎨 颜色处理功能

### 1. 多格式颜色转换

@ldesign/color 支持主流颜色格式之间的无损转换：

#### 支持的颜色格式

- **HEX**: `#ff0000`, `#f00`
- **RGB**: `rgb(255, 0, 0)`, `{r: 255, g: 0, b: 0}`
- **HSL**: `hsl(0, 100%, 50%)`, `{h: 0, s: 100, l: 50}`
- **HSV**: `hsv(0, 100%, 100%)`, `{h: 0, s: 100, v: 100}`

#### 转换特性

- **高精度算法**: 基于 CIE 色彩空间的精确转换
- **输入验证**: 自动验证和规范化输入格式
- **错误处理**: 优雅处理无效输入
- **性能缓存**: LRU 缓存提升转换性能

```typescript
// 示例：颜色格式转换
import { hexToRgb, rgbToHsl, hslToHex } from '@ldesign/color'

const rgb = hexToRgb('#1890ff') // {r: 24, g: 144, b: 255}
const hsl = rgbToHsl(24, 144, 255) // {h: 210, s: 100, l: 55}
const hex = hslToHex(210, 100, 55) // '#1890ff'
```

### 2. 智能颜色调整

#### 亮度调整

- **线性调整**: 基于 RGB 值的线性亮度调整
- **感知调整**: 基于人眼感知的亮度调整
- **自适应调整**: 根据颜色特性自动选择最佳调整方式

#### 饱和度调整

- **HSL 饱和度**: 传统的 HSL 饱和度调整
- **HSV 饱和度**: 基于 HSV 模型的饱和度调整
- **感知饱和度**: 基于人眼感知的饱和度调整

#### 色相调整

- **色相旋转**: 在色环上旋转指定角度
- **色相偏移**: 向特定色相方向偏移
- **色相锁定**: 保持色相不变的调整

```typescript
// 示例：颜色调整
import { adjustBrightness, adjustSaturation, adjustHue } from '@ldesign/color'

const brighter = adjustBrightness('#1890ff', 20) // 增加20%亮度
const saturated = adjustSaturation('#1890ff', -10) // 降低10%饱和度
const shifted = adjustHue('#1890ff', 30) // 色相偏移30度
```

## 🌈 调色板生成功能

### 1. 基于色彩理论的配色方案

#### 单色配色 (Monochromatic)

- **原理**: 基于同一色相的不同明度和饱和度
- **特点**: 和谐统一，适合简洁设计
- **应用**: 品牌色系、渐变背景

#### 类似色配色 (Analogous)

- **原理**: 色环上相邻的颜色组合
- **特点**: 自然和谐，视觉舒适
- **应用**: 自然主题、温馨界面

#### 互补色配色 (Complementary)

- **原理**: 色环上相对的颜色组合
- **特点**: 对比强烈，视觉冲击力强
- **应用**: 强调元素、警告提示

#### 三元色配色 (Triadic)

- **原理**: 色环上等距的三个颜色
- **特点**: 平衡而富有活力
- **应用**: 多彩界面、儿童产品

#### 四元色配色 (Tetradic)

- **原理**: 色环上形成矩形的四个颜色
- **特点**: 丰富多样，层次分明
- **应用**: 复杂界面、数据可视化

```typescript
// 示例：调色板生成
import {
  generateMonochromaticPalette,
  generateAnalogousPalette,
  generateComplementaryPalette,
  generateTriadicPalette,
} from '@ldesign/color'

const mono = generateMonochromaticPalette('#1890ff', 5)
const analogous = generateAnalogousPalette('#1890ff', 3)
const complementary = generateComplementaryPalette('#1890ff')
const triadic = generateTriadicPalette('#1890ff')
```

### 2. 智能色阶生成

#### 色阶算法

- **线性插值**: 在色彩空间中的线性插值
- **感知均匀**: 基于人眼感知的均匀分布
- **贝塞尔曲线**: 使用贝塞尔曲线的平滑过渡

#### 色阶特性

- **10级标准**: 提供标准的10级色阶
- **自定义级数**: 支持任意级数的色阶生成
- **双向生成**: 同时生成亮色和暗色变体

```typescript
// 示例：色阶生成
import { generateColorScale } from '@ldesign/color'

const scale = generateColorScale('#1890ff', {
  levels: 10,
  lightVariants: 5,
  darkVariants: 5,
  algorithm: 'perceptual',
})
```

## ♿ 可访问性功能

### 1. WCAG 标准检查

#### 对比度计算

- **WCAG 2.1 算法**: 严格按照 WCAG 2.1 标准实现
- **相对亮度**: 基于 sRGB 色彩空间的相对亮度计算
- **Gamma 校正**: 考虑显示设备的 Gamma 特性

#### 等级判定

- **AA 级**: 普通文本 4.5:1，大文本 3:1
- **AAA 级**: 普通文本 7:1，大文本 4.5:1
- **自定义**: 支持自定义对比度要求

```typescript
// 示例：可访问性检查
import { checkAccessibility, getContrastRatio } from '@ldesign/color'

const result = checkAccessibility('#ffffff', '#1890ff')
// {
//   isAccessible: true,
//   level: 'AA',
//   contrastRatio: 4.52,
//   normalText: true,
//   largeText: true
// }
```

### 2. 色盲友好设计

#### 色盲类型支持

- **红色盲 (Protanopia)**: 缺少L型视锥细胞
- **绿色盲 (Deuteranopia)**: 缺少M型视锥细胞
- **蓝色盲 (Tritanopia)**: 缺少S型视锥细胞
- **红色弱 (Protanomaly)**: L型视锥细胞异常
- **绿色弱 (Deuteranomaly)**: M型视锥细胞异常
- **蓝色弱 (Tritanomaly)**: S型视锥细胞异常
- **全色盲 (Achromatopsia)**: 完全缺乏色觉
- **蓝锥单色觉 (Achromatomaly)**: 只有蓝色感知

#### 模拟算法

- **Brettel 1997**: 基于 Brettel 等人的色盲模拟算法
- **Viénot 1999**: 改进的色盲模拟算法
- **Machado 2009**: 最新的高精度色盲模拟

```typescript
// 示例：色盲模拟
import { simulateColorBlindness } from '@ldesign/color'

const protanopia = simulateColorBlindness('#ff0000', 'protanopia')
const deuteranopia = simulateColorBlindness('#00ff00', 'deuteranopia')
const tritanopia = simulateColorBlindness('#0000ff', 'tritanopia')
```

## 🎯 主题管理功能

### 1. 动态主题系统

#### 主题结构

- **基础颜色**: primary, secondary, success, warning, danger
- **语义颜色**: background, surface, text, border
- **状态颜色**: hover, active, disabled, focus
- **扩展颜色**: 支持自定义颜色类别

#### 模式支持

- **亮色模式**: 适合日间使用的亮色主题
- **暗色模式**: 适合夜间使用的暗色主题
- **自动模式**: 根据系统设置自动切换
- **自定义模式**: 支持自定义模式定义

```typescript
// 示例：主题管理
import { ThemeManager } from '@ldesign/color'

const themeManager = new ThemeManager({
  themes: [
    {
      name: 'blue',
      light: { primary: '#1890ff', secondary: '#722ed1' },
      dark: { primary: '#177ddc', secondary: '#531dab' },
    },
  ],
  defaultTheme: 'blue',
  defaultMode: 'light',
})

await themeManager.setTheme('blue', 'dark')
```

### 2. CSS 变量集成

#### 自动注入

- **CSS 变量**: 自动生成和注入 CSS 变量
- **作用域控制**: 支持全局和局部作用域
- **命名规范**: 遵循 BEM 命名规范
- **前缀管理**: 支持自定义变量前缀

#### 实时更新

- **无刷新切换**: 主题切换无需页面刷新
- **平滑过渡**: 支持 CSS 过渡动画
- **批量更新**: 批量更新减少重绘次数

```css
/* 自动生成的 CSS 变量 */
:root {
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-primary-active: #096dd9;
  --color-background: #ffffff;
  --color-text: #000000;
}
```

## ⚡ 性能优化功能

### 1. 智能缓存系统

#### LRU 缓存

- **最近最少使用**: 自动清理最少使用的缓存项
- **内存限制**: 可配置的内存使用上限
- **命中率统计**: 实时监控缓存命中率

#### 多级缓存

- **内存缓存**: 快速访问的内存缓存
- **本地存储**: 持久化的本地存储缓存
- **会话缓存**: 会话级别的临时缓存

### 2. 闲时处理优化

#### requestIdleCallback

- **空闲时处理**: 利用浏览器空闲时间处理任务
- **优先级队列**: 支持任务优先级管理
- **降级处理**: 不支持的浏览器自动降级

#### 预生成策略

- **主题预生成**: 提前生成常用主题
- **颜色预计算**: 预计算常用颜色转换
- **渐进加载**: 按需加载和渐进增强

```typescript
// 示例：性能优化配置
const themeManager = new ThemeManager({
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 3600000, // 1小时
  },
  idleProcessing: {
    enabled: true,
    timeout: 5000,
    priority: 'low',
  },
})
```

## 🔧 开发者功能

### 1. TypeScript 支持

#### 完整类型定义

- **接口定义**: 所有公开 API 的完整接口定义
- **泛型支持**: 灵活的泛型类型支持
- **类型推导**: 智能的类型推导和提示

#### 开发体验

- **智能提示**: IDE 中的完整智能提示
- **类型检查**: 编译时的严格类型检查
- **重构支持**: 安全的代码重构支持

### 2. 调试和监控

#### 调试模式

- **详细日志**: 开发模式下的详细操作日志
- **性能监控**: 实时的性能指标监控
- **错误追踪**: 完整的错误堆栈追踪

#### 开发工具

- **浏览器扩展**: 专用的浏览器开发工具
- **可视化面板**: 主题和颜色的可视化管理面板
- **性能分析**: 详细的性能分析报告

```typescript
// 示例：调试配置
const themeManager = new ThemeManager({
  debug: process.env.NODE_ENV === 'development',
  onThemeChange: (theme, mode) => {
    console.log(`[Theme] Changed to ${theme} (${mode})`)
  },
  onError: error => {
    console.error('[Theme] Error:', error)
  },
})
```

---

> 💡
> **提示**: 这些功能都经过精心设计和优化，确保在提供强大功能的同时保持优秀的性能和用户体验。
