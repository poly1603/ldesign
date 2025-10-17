# @ldesign/color

<div align="center">
  <h3>🎨 A modern, high-performance color manipulation library for JavaScript/TypeScript</h3>
  <p>
    <strong>Powerful</strong> • <strong>Fast</strong> • <strong>Easy to Use</strong> • <strong>Tree-Shakeable</strong>
  </p>
</div>

## ✨ Features

### Core Features
- **Multiple Color Formats**: RGB, HSL, HSV, HEX, HWB, Named Colors
- **Color Manipulation**: lighten, darken, saturate, desaturate, rotate, mix, blend
- **Color Analysis**: luminance, contrast, WCAG compliance, color temperature
- **Smart Palette Generation**: Tailwind-style, Material Design, semantic colors
- **Accessibility Tools**: Color blindness simulation, WCAG auto-adjustment
- **Color Schemes**: Monochromatic, complementary, triadic, and more
- **Theme Management**: Import/export, system theme detection, persistence
- **Smart Caching**: High-performance LRU cache for conversions
- **Immutable Operations**: All methods return new instances
- **Chain Operations**: Fluent API for complex transformations

### Theme & Accessibility Features
- **Theme Manager**: Apply, save, restore, import/export themes
- **System Theme Detection**: Auto-detect light/dark mode preference
- **Color Accessibility**: WCAG compliance checking and auto-adjustment
- **Color Blindness Support**: Simulate 8 types of color vision deficiencies
- **Accessible Pairs**: Generate accessible color combinations
- **Smart Schemes**: Generate harmonious color schemes automatically

### Advanced Utilities
- **Natural Palette**: Generate natural-looking color scales
- **CSS Variables**: Generate and inject CSS custom properties
- **Dark Mode**: Automatic dark theme generation
- **Semantic Colors**: Generate UI semantic color sets
- **Plugin System**: Extensible architecture for custom features

### Framework Support
- **React Components**: ThemePicker, useTheme hook
- **Vue 3 Components**: ThemePicker, useTheme composable
- **Framework Agnostic**: Works with any JavaScript framework
- **TypeScript First**: Full type safety and IntelliSense support

## 📦 Installation

```bash
npm install @ldesign/color
# or
yarn add @ldesign/color
# or
pnpm add @ldesign/color
```

## 🚀 Quick Start

```typescript
import { Color, ColorAdvanced, ColorAnimation } from '@ldesign/color';

// Basic usage
const color = new Color('#3498db');
const lighter = color.lighten(20);
const complementary = color.rotate(180);

// Advanced color spaces
const advanced = new ColorAdvanced('#e74c3c');
const lab = advanced.toLAB();
const deltaE = advanced.deltaE2000(new ColorAdvanced('#c0392b'));

// Animation
const animation = new ColorAnimation();
animation.fromTo(
  new Color('#2ecc71'),
  new Color('#9b59b6'),
  {
    duration: 1000,
    easing: 'easeInOutCubic',
    onUpdate: (color) => {
      element.style.backgroundColor = color.toHex();
    }
  }
);
```

## 📖 API Overview

### Color Class

```typescript
// Creation
const color = new Color('#ff5733');
const color2 = Color.fromRGB(255, 87, 51);
const color3 = Color.fromHSL(9, 100, 60);
const random = Color.random();

// Conversions
color.toHex();        // '#ff5733'
color.toRGB();        // { r: 255, g: 87, b: 51 }
color.toHSL();        // { h: 9, s: 100, l: 60 }

// Manipulations
color.lighten(20);    // 20% lighter
color.darken(20);     // 20% darker
color.saturate(30);   // 30% more saturated
color.rotate(180);    // Rotate hue by 180°

// Analysis
color.getLuminance(); // 0.364
color.contrast('#000000'); // 7.59
color.isLight();      // true
color.isWCAGCompliant('#ffffff', 'AA'); // true
```

### ColorAdvanced Class

```typescript
const color = new ColorAdvanced('#e67e22');

// Professional color spaces
color.toLAB();        // { l: 62.5, a: 31.3, b: 56.7 }
color.toLCH();        // { l: 62.5, c: 64.7, h: 60.9 }
color.toOKLAB();      // OKLAB color space

// Color analysis
color.getColorTemperature(); // 3500 (warm)
color.getColorPsychology();  // { energy: 'high', ... }
color.deltaE2000(otherColor); // 2.3 (barely perceptible)

// Design systems
color.toMaterialDesign(); // Material Design palette
color.toAntDesign();       // Ant Design palette
```

### Animation System

```typescript
const animation = new ColorAnimation();

// Simple animation
animation.fromTo(startColor, endColor, {
  duration: 1000,
  easing: 'easeInOutQuad'
});

// Keyframe animation
animation.animate([
  { color: '#ff0000', offset: 0 },
  { color: '#00ff00', offset: 0.5 },
  { color: '#0000ff', offset: 1 }
], {
  duration: 2000,
  iterations: Infinity
});
```

## 🏗 Project Structure

```
@ldesign/color/
├── src/
│   ├── core/          # Core Color class
│   ├── advanced/      # Advanced color spaces
│   ├── animation/     # Animation system
│   ├── plugins/       # Plugin architecture
│   ├── visualization/ # Data visualization
│   └── types/         # TypeScript definitions
├── es/                # ESM build output
├── lib/               # CommonJS build output
└── examples/          # Usage examples
```

## 🛠 Development

```bash
# Install dependencies
npm install

# Build the project
npm run build:all

# Type checking
npm run type-check

# Development mode
npm run dev
```

## 📊 Performance

- **Small Bundle Size**: Core ~8KB gzipped
- **Tree-Shakeable**: Import only what you need
- **Smart Caching**: LRU cache for expensive operations
- **Optimized Algorithms**: Fast color space conversions
- **Zero Dependencies**: No external runtime dependencies

## 🔧 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Node.js 14+

## 📄 License

MIT © LDesign Team

---

<div align="center">
  <p>Built with ❤️ by the LDesign Team</p>
  <p>
    <a href="#">Documentation</a> •
    <a href="#">Examples</a> •
    <a href="#">API Reference</a>
  </p>
</div>

一个功能强大、性能优越、使用简单的颜色处理库，支持链式调用、不可变操作和智能缓存。

## 特性

- 🚀 **零依赖** - 无任何外部依赖，体积小巧
- 🎨 **全面的颜色操作** - 支持各种颜色格式转换和操作
- ⚡ **高性能** - 内置智能缓存，优化性能
- 🔗 **链式调用** - 流畅的API设计，支持链式操作
- 🛡️ **类型安全** - 完整的TypeScript支持
- ♿ **无障碍支持** - 内置WCAG对比度检查
- 🎯 **不可变性** - 所有操作返回新实例，原始颜色不变

## 安装

```bash
npm install @ldesign/color
# 或
yarn add @ldesign/color
# 或
pnpm add @ldesign/color
```

## 快速开始

```typescript
import { Color, color } from '@ldesign/color';

// 创建颜色实例
const c1 = new Color('#3B82F6');
const c2 = Color.fromRGB(59, 130, 246);
const c3 = color('blue');

// 颜色操作（链式调用）
const result = c1
  .lighten(20)     // 加亮 20%
  .saturate(10)    // 增加饱和度
  .rotate(30)      // 旋转色相 30度
  .alpha(0.8);     // 设置透明度

console.log(result.toHex());      // 输出 HEX 格式
console.log(result.toRGBString()); // 输出 RGB 字符串
```

## 许可证

MIT