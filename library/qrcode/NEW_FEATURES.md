# QR Code 新功能更新 🎉

## 📋 更新概览

本次更新主要解决了用户反馈的问题，并新增了4种精美的二维码样式。

---

## ✅ 问题修复

### 1. Logo 示例无法显示的问题

**问题原因：** 原示例使用了占位图片URL（placeholder.com），可能存在跨域或加载失败的问题。

**解决方案：**
- 使用 Canvas API 将 emoji 转换为 base64 图片
- 避免跨域问题
- 确保 logo 可以正常显示

**修复位置：** `demo-advanced.html:234-273`

**示例代码：**
```javascript
const createEmojiLogo = (emoji, size = 100) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.font = `${size * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);

  return canvas.toDataURL();
};

// 使用
createQRCode({
  content: 'https://example.com/logo',
  errorCorrectionLevel: 'H', // 使用高容错等级
  logo: {
    src: createEmojiLogo('🚀'),
    width: '20%',
    logoShape: 'square',
    logoBackground: true,
  },
});
```

---

### 2. Combined Effects 示例无法扫描的问题 ⚠️

**问题原因：**
1. 使用了圆点（dots）样式，降低了二维码的可识别性
2. 内眼使用白色，对比度不足
3. 径向渐变比线性渐变更难识别
4. 错误修正等级不够高

**解决方案：**
- 将 `dotStyle` 从 `'dots'` 改为 `'rounded'`（圆角方形比圆点更易识别）
- 将 `errorCorrectionLevel` 提升到 `'H'`（最高容错等级 30%）
- 内眼颜色从白色改为深灰色 `'#4b5563'`，确保对比度
- 渐变从径向改为线性

**修复位置：** `demo-advanced.html:291-324`

**修复前后对比：**

```javascript
// 修复前 - 无法扫描 ❌
createQRCode({
  content: 'https://example.com/combined',
  style: {
    dotStyle: 'dots', // ❌ 圆点不易识别
    gradient: {
      type: 'radial', // ❌ 径向渐变不易识别
      colors: ['#f97316', '#dc2626'],
    },
    eyeStyle: {
      inner: { style: 'dots', color: '#ffffff' } // ❌ 白色对比度不足
    },
  },
});

// 修复后 - 完全可扫描 ✅
createQRCode({
  content: 'https://example.com/combined',
  errorCorrectionLevel: 'H', // ✅ 最高容错等级
  style: {
    dotStyle: 'rounded', // ✅ 圆角方形更易识别
    gradient: {
      type: 'linear', // ✅ 线性渐变更易识别
      colors: ['#f97316', '#dc2626'],
      direction: 45,
    },
    eyeStyle: {
      inner: { style: 'rounded', color: '#4b5563' } // ✅ 深色确保对比度
    },
  },
});
```

---

## 🆕 新增样式

新增了 **4 种全新的二维码模块样式**：

### 1. Extra Rounded（超级圆角）✨

<img src="https://via.placeholder.com/200/667eea/ffffff?text=Extra+Rounded" width="200" alt="Extra Rounded" />

- **枚举值：** `DotStyle.ExtraRounded` 或 `'extra-rounded'`
- **特点：** 超级圆润的边角，完美的圆形模块
- **适用场景：** 科技、互联网、现代风格产品
- **实现位置：** `src/types/index.ts:44` | `src/renderers/styles/dots.ts:36-37`

```javascript
createQRCode({
  content: 'https://example.com',
  style: {
    dotStyle: 'extra-rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
  },
});
```

---

### 2. Hexagon（六边形蜂巢）🔶

- **枚举值：** `DotStyle.Hexagon` 或 `'hexagon'`
- **特点：** 六边形蜂巢结构，科技感十足
- **适用场景：** 创意、设计、科技类应用
- **实现位置：** `src/types/index.ts:46` | `src/renderers/styles/dots.ts:39-40,192-211`

```javascript
createQRCode({
  content: 'https://example.com',
  style: {
    dotStyle: 'hexagon',
    gradient: {
      type: 'linear',
      colors: ['#f59e0b', '#f97316'],
      direction: 135,
    },
  },
});
```

---

### 3. Liquid（流体液态）💧

- **枚举值：** `DotStyle.Liquid` 或 `'liquid'`
- **特点：** 有机流体形状，独特的艺术感
- **适用场景：** 艺术、时尚、美妆行业
- **实现位置：** `src/types/index.ts:48` | `src/renderers/styles/dots.ts:42-43,213-253`

```javascript
createQRCode({
  content: 'https://example.com',
  style: {
    dotStyle: 'liquid',
    gradient: {
      type: 'linear',
      colors: ['#ec4899', '#8b5cf6'],
      direction: 90,
    },
  },
});
```

---

### 4. Smooth Dots（柔和圆点）⭕

- **枚举值：** `DotStyle.SmoothDots` 或 `'smooth-dots'`
- **特点：** 柔和的圆点，边缘平滑过渡，需使用高容错等级
- **适用场景：** 健康、环保、教育类应用
- **实现位置：** `src/types/index.ts:50` | `src/renderers/styles/dots.ts:45-46,255-277`

```javascript
createQRCode({
  content: 'https://example.com',
  errorCorrectionLevel: 'H', // 推荐使用高容错等级
  style: {
    dotStyle: 'smooth-dots',
    gradient: {
      type: 'linear',
      colors: ['#14b8a6', '#06b6d4'],
      direction: 45,
    },
  },
});
```

---

## 📋 完整样式列表

现在支持的所有 DotStyle 样式：

| 序号 | 样式名 | 枚举值 | 说明 | 容错等级建议 |
|------|--------|--------|------|-------------|
| 1 | 方形 | `square` | 方形模块（默认） | M |
| 2 | 圆角 | `rounded` | 圆角方形 | M |
| 3 | 圆点 | `dots` | 圆点 | **H** |
| 4 | 菱形 | `diamond` | 菱形 | M |
| 5 | 星形 | `star` | 星形 | **H** |
| 6 | 优雅 | `classy` | 优雅风格（切角） | M |
| 7 | 优雅圆角 | `classy-rounded` | 圆角优雅风格 | M |
| 8 | **超级圆角** ⭐ | `extra-rounded` | 超级圆角 | M |
| 9 | **六边形** ⭐ | `hexagon` | 六边形蜂巢 | M |
| 10 | **流体** ⭐ | `liquid` | 流体液态 | M |
| 11 | **柔和圆点** ⭐ | `smooth-dots` | 柔和圆点 | **H** |

---

## 🎨 演示页面

创建了 **3 个完整的演示页面**：

### 1. demo-advanced.html（修复版）
- ✅ 修复了 logo 和 combined effects 的问题
- 展示 8 个常用样式组合
- 所有二维码均可扫描 ✓

### 2. demo-showcase.html（精品集锦）
- 12 个精选样式展示
- 包含经典渐变、优雅圆点、炫彩菱形等
- 精美的 UI 设计

### 3. demo-new-styles.html（新样式专场）
- 专门展示 4 种新增样式
- 8 个创意组合示例
- 详细的样式说明和适用场景

---

## 💡 使用建议

### 关于错误修正等级

不同的样式需要不同的错误修正等级：

```javascript
// 错误修正等级对照
errorCorrectionLevel: 'L', // 7% - 仅适合简单样式
errorCorrectionLevel: 'M', // 15% - 默认，适合大多数样式 ⭐
errorCorrectionLevel: 'Q', // 25% - 适合装饰性样式
errorCorrectionLevel: 'H', // 30% - 适合Logo、复杂样式 ⭐⭐
```

**推荐配置：**
- **方形、圆角、菱形** → 使用 `'M'` (15%)
- **圆点、星形、液态** → 使用 `'H'` (30%)
- **带 Logo** → 必须使用 `'H'` (30%)
- **多重效果组合** → 使用 `'H'` (30%)

---

### 关于可扫描性

确保二维码可扫描的 **6 个关键因素**：

1. **对比度** ⚠️ - 前景色和背景色要有足够的对比度
2. **模块清晰度** - 避免过于复杂的形状
3. **眼睛可见性** - 定位点（眼睛）要清晰可见，避免使用浅色
4. **渐变方向** - 线性渐变 > 径向渐变
5. **阴影效果** - 阴影模糊半径不要过大（建议 ≤ 10）
6. **Logo 尺寸** - Logo 不要超过 25%，推荐 20-22%

**最佳实践：**

```javascript
// ✅ 推荐 - 高可扫描性
createQRCode({
  content: 'https://example.com',
  errorCorrectionLevel: 'H',
  style: {
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
    eyeStyle: {
      outer: { style: 'rounded', color: '#4b5563' },
      inner: { style: 'dots', color: '#1f2937' }
    },
  },
});

// ❌ 不推荐 - 低可扫描性
createQRCode({
  content: 'https://example.com',
  style: {
    dotStyle: 'dots',
    gradient: {
      type: 'radial', // 径向渐变不易识别
      colors: ['#fca5a5', '#fecaca'], // 颜色对比度不足
    },
    eyeStyle: {
      inner: { color: '#ffffff' } // 白色内眼不易识别
    },
  },
});
```

---

## 🔧 技术细节

### Canvas 实现
所有新样式都在 `src/renderers/styles/dots.ts` 中实现：

| 函数 | 说明 | 算法 |
|------|------|------|
| `drawHexagon()` | 六边形绘制 | 正六边形顶点算法 |
| `drawLiquid()` | 流体效果 | 贝塞尔曲线（quadraticCurveTo） |
| `drawSmoothDots()` | 柔和圆点 | 径向渐变（createRadialGradient） |

### SVG 实现
同时提供了 SVG 路径生成函数：
- `getHexagonSVGPath()` - 六边形 SVG 路径
- `getLiquidSVGPath()` - 流体 SVG 路径
- SVG smooth dots 使用标准圆形路径

### 类型定义
在 `src/types/index.ts` 中添加了新的枚举值，**保持向后兼容**。

---

## 🚀 快速开始

```bash
# 1. 重新构建项目
npm run build

# 2. 启动本地服务器
# 方式1: 使用 Live Server 扩展（推荐）
# 方式2: 使用 Python
python -m http.server 8000

# 3. 在浏览器中访问
http://localhost:8000/demo-showcase.html
http://localhost:8000/demo-new-styles.html
http://localhost:8000/demo-advanced.html
```

---

## 📊 性能对比

| 样式类型 | 渲染时间 | 内存占用 | 推荐场景 |
|---------|---------|---------|---------|
| square | 最快 | 最低 | 批量生成 |
| rounded | 快 | 低 | 日常使用 |
| extra-rounded | 快 | 低 | 现代风格 |
| hexagon | 中等 | 中等 | 创意设计 |
| liquid | 慢 | 高 | 艺术展示 |
| smooth-dots | 慢 | 高 | 特殊场景 |

---

## 📝 更新总结

本次更新：
- ✅ 修复了 Logo 示例无法显示的问题
- ✅ 修复了 Combined Effects 无法扫描的问题
- ✅ 新增 4 种精美样式（extra-rounded, hexagon, liquid, smooth-dots）
- ✅ 创建 3 个完整演示页面
- ✅ 提供详细的使用指南和最佳实践

**所有样式都经过测试，确保可扫描性！** 🎉

---

## 🌐 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📦 类型支持

所有新功能都有完整的 TypeScript 类型支持：

```typescript
import {
  DotStyle,
  GradientConfig,
  EyeStyleConfig,
  LogoConfig,
  LogoShape,
  LogoAspectRatio,
  createQRCode,
} from '@ldesign/qrcode';
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如有任何问题或建议，请通过以下方式联系：
- GitHub Issues
- Email: support@ldesign.com

---

**Happy Coding! 🎨**
