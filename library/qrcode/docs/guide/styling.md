# 样式定制

`@ldesign/qrcode` 提供了丰富的样式定制选项，让你可以创建独特、美观的二维码。

## 模块样式 (Dot Style)

模块样式决定了二维码中每个"点"的形状。支持 7 种不同的样式：

### Square - 方形

默认样式，标准的方形模块：

```typescript
import { createQRCode } from '@ldesign/qrcode';

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'square',  // 默认值
  },
});
```

**特点：**
- 最标准的二维码样式
- 扫描识别率最高
- 适合所有场景

### Rounded - 圆角方形

带圆角的方形，更加柔和：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'rounded',
  },
});
```

**特点：**
- 现代、友好的外观
- 识别率高
- 适合品牌展示

### Dots - 圆点

完全圆形的模块：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'dots',
    fgColor: '#10b981',
  },
});
```

**特点：**
- 柔和、有机的外观
- 适合创意设计
- 可能需要较高的错误纠正级别

### Diamond - 菱形

菱形模块，独特的视觉效果：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'diamond',
    fgColor: '#f59e0b',
  },
});
```

**特点：**
- 独特的几何美感
- 适合设计类项目
- 建议使用 `Q` 或 `H` 错误纠正级别

### Star - 星形

星形模块，最具艺术感：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'star',
    fgColor: '#8b5cf6',
  },
});
```

**特点：**
- 高度创意的外观
- 适合艺术、娱乐项目
- 必须使用 `H` 错误纠正级别

### Classy - 优雅样式

带切角的方形，优雅而专业：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'classy',
  },
});
```

**特点：**
- 专业、高端的外观
- 适合商务场景
- 良好的识别率

### Classy Rounded - 圆角优雅样式

优雅样式的圆角版本：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'classy-rounded',
  },
});
```

**特点：**
- 最柔和的优雅样式
- 适合高端品牌
- 现代感十足

### 样式选择建议

| 场景 | 推荐样式 | 错误纠正级别 |
|------|----------|--------------|
| 标准使用 | `square`, `rounded` | M |
| 品牌展示 | `classy`, `classy-rounded` | M 或 Q |
| 创意设计 | `dots`, `diamond` | Q 或 H |
| 艺术项目 | `star` | H |

## 渐变色

支持线性渐变和径向渐变，让二维码更加生动。

### 线性渐变

从一个方向到另一个方向的颜色过渡：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,  // 渐变角度（度）
    },
  },
});
```

**配置选项：**
- `type`: `'linear'`
- `colors`: 颜色数组，至少 2 个颜色
- `direction`: 渐变方向（0-360 度）
  - `0`: 从下到上 ↑
  - `90`: 从左到右 →
  - `180`: 从上到下 ↓
  - `270`: 从右到左 ←
  - `45`: 对角线 ↗
- `stops`: 可选，颜色停止位置（0-1 之间）

**多色渐变示例：**

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    gradient: {
      type: 'linear',
      colors: ['#ff0080', '#ff8c00', '#40e0d0'],
      stops: [0, 0.5, 1],
      direction: 90,
    },
  },
});
```

### 径向渐变

从中心点向外辐射的颜色过渡：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    gradient: {
      type: 'radial',
      colors: ['#f97316', '#dc2626'],
      position: { x: 0.5, y: 0.5 },  // 渐变中心位置
    },
  },
});
```

**配置选项：**
- `type`: `'radial'`
- `colors`: 颜色数组
- `position`: 渐变中心位置
  - `x`: 水平位置（0-1，0 为左，1 为右）
  - `y`: 垂直位置（0-1，0 为上，1 为下）
- `stops`: 可选，颜色停止位置

**偏心渐变示例：**

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    gradient: {
      type: 'radial',
      colors: ['#fbbf24', '#f59e0b', '#d97706'],
      position: { x: 0.3, y: 0.3 },  // 左上偏移
    },
  },
});
```

### 渐变 + 模块样式

渐变可以与任何模块样式组合：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    dotStyle: 'dots',
    gradient: {
      type: 'linear',
      colors: ['#ec4899', '#8b5cf6'],
      direction: 135,
    },
  },
});
```

## 眼睛样式定制

二维码的三个定位点（称为"眼睛"）可以单独定制样式。

### 统一眼睛样式

为所有三个眼睛设置相同的样式：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    eyeStyle: {
      outer: {
        style: 'rounded',
        color: '#ef4444',
      },
      inner: {
        style: 'dots',
        color: '#dc2626',
      },
    },
  },
});
```

**配置选项：**
- `outer`: 外圈（7x7 方框）
  - `style`: 模块样式（任意 DotStyle）
  - `color`: 颜色
  - `gradient`: 渐变配置
- `inner`: 内圈（3x3 中心点）
  - `style`: 模块样式
  - `color`: 颜色
  - `gradient`: 渐变配置

### 眼睛渐变

眼睛也可以使用渐变：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    eyeStyle: {
      outer: {
        style: 'rounded',
        gradient: {
          type: 'linear',
          colors: ['#8b5cf6', '#ec4899'],
          direction: 45,
        },
      },
      inner: {
        style: 'dots',
        color: '#ffffff',
      },
    },
  },
});
```

### 多色眼睛

为三个眼睛分别设置不同的样式：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    fgColor: '#333333',
    eyeStyle: [
      // 左上角眼睛 - 红色
      {
        outer: { style: 'rounded', color: '#ef4444' },
        inner: { style: 'dots', color: '#dc2626' },
      },
      // 右上角眼睛 - 蓝色
      {
        outer: { style: 'rounded', color: '#3b82f6' },
        inner: { style: 'dots', color: '#2563eb' },
      },
      // 左下角眼睛 - 绿色
      {
        outer: { style: 'rounded', color: '#10b981' },
        inner: { style: 'dots', color: '#059669' },
      },
    ],
  },
});
```

**眼睛顺序：**
1. 第一个元素 → 左上角眼睛
2. 第二个元素 → 右上角眼睛
3. 第三个元素 → 左下角眼睛

## 阴影效果

为二维码模块添加阴影，增加立体感和深度：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    fgColor: '#7c3aed',
    shadow: {
      blur: 10,              // 模糊半径（像素）
      color: 'rgba(124, 58, 237, 0.3)',  // 阴影颜色（支持透明）
      offsetX: 3,            // 水平偏移（像素）
      offsetY: 3,            // 垂直偏移（像素）
    },
  },
});
```

**配置选项：**
- `blur`: 模糊程度（0 为清晰阴影）
- `color`: 阴影颜色（建议使用 RGBA 控制透明度）
- `offsetX`: 水平偏移，正值向右
- `offsetY`: 垂直偏移，正值向下

**常用阴影效果：**

```typescript
// 1. 轻微阴影
shadow: {
  blur: 5,
  color: 'rgba(0, 0, 0, 0.1)',
  offsetX: 0,
  offsetY: 2,
}

// 2. 深层阴影
shadow: {
  blur: 15,
  color: 'rgba(0, 0, 0, 0.3)',
  offsetX: 0,
  offsetY: 8,
}

// 3. 发光效果
shadow: {
  blur: 20,
  color: 'rgba(124, 58, 237, 0.6)',
  offsetX: 0,
  offsetY: 0,
}
```

## 描边效果

为模块添加描边：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    fgColor: '#3b82f6',
    stroke: {
      width: 2,            // 描边宽度（像素）
      color: '#ffffff',    // 描边颜色
    },
  },
});
```

**使用场景：**
- 在深色背景上创建白色描边
- 增加模块之间的分离感
- 创建特殊的视觉效果

## 背景效果

### 背景渐变

为整个二维码背景应用渐变：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    fgColor: '#333333',
    backgroundGradient: {
      type: 'linear',
      colors: ['#ffeaa7', '#fdcb6e'],
      direction: 90,
    },
  },
});
```

**与前景渐变的区别：**
- `gradient`: 应用于二维码模块（前景）
- `backgroundGradient`: 应用于背景区域

**组合使用示例：**

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    // 前景渐变
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
    // 背景渐变
    backgroundGradient: {
      type: 'linear',
      colors: ['#e0c3fc', '#8ec5fc'],
      direction: 135,
    },
  },
});
```

### 背景图片

使用图片作为背景：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    fgColor: '#000000',
    backgroundImage: '/path/to/pattern.png',
  },
});
```

**背景图片建议：**
- 使用低对比度的图案
- 确保前景色足够深以保证识别
- 推荐使用纹理或水印效果
- 避免使用过于复杂的图片

## 综合样式示例

### 示例 1：现代商务风格

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'classy-rounded',
    gradient: {
      type: 'linear',
      colors: ['#1e3a8a', '#3b82f6'],
      direction: 135,
    },
    eyeStyle: {
      outer: { style: 'rounded', color: '#1e40af' },
      inner: { style: 'dots', color: '#3b82f6' },
    },
  },
});
```

### 示例 2：活力橙色风格

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#ff6b6b', '#ee5a6f', '#c44569'],
      position: { x: 0.5, y: 0.5 },
    },
    shadow: {
      blur: 12,
      color: 'rgba(255, 107, 107, 0.4)',
      offsetX: 0,
      offsetY: 6,
    },
  },
});
```

### 示例 3：优雅紫色风格

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#f97316', '#dc2626'],
      position: { x: 0.5, y: 0.5 },
    },
    eyeStyle: {
      outer: {
        style: 'rounded',
        gradient: {
          type: 'linear',
          colors: ['#8b5cf6', '#ec4899'],
          direction: 45,
        },
      },
      inner: { style: 'dots', color: '#ffffff' },
    },
    shadow: {
      blur: 8,
      color: 'rgba(0, 0, 0, 0.2)',
      offsetY: 4,
    },
  },
});
```

## 性能考虑

### 渲染性能

不同样式的渲染性能（从快到慢）：

1. `square` - 最快
2. `rounded` - 快
3. `classy`, `classy-rounded` - 中等
4. `dots`, `diamond` - 较慢
5. `star` - 最慢

**优化建议：**
- 批量生成时使用简单样式
- 在性能敏感场景避免复杂渐变
- 缓存生成的二维码

### 文件大小

使用渐变和复杂样式会增加导出的文件大小：

- 纯色 PNG：约 5-15 KB
- 渐变 PNG：约 20-50 KB
- SVG（复杂样式）：约 10-30 KB

## 类型定义

```typescript
import type {
  DotStyle,
  GradientConfig,
  EyeStyleConfig,
  ShadowConfig,
  StrokeConfig,
} from '@ldesign/qrcode';

// 模块样式
type DotStyle =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'diamond'
  | 'star'
  | 'classy'
  | 'classy-rounded';

// 渐变配置
interface GradientConfig {
  type: 'linear' | 'radial';
  colors: string[];
  stops?: number[];
  direction?: number;  // 仅用于 linear
  position?: { x: number; y: number };  // 仅用于 radial
}

// 眼睛样式配置
interface EyeStyleConfig {
  outer?: {
    style?: DotStyle;
    color?: string;
    gradient?: GradientConfig;
  };
  inner?: {
    style?: DotStyle;
    color?: string;
    gradient?: GradientConfig;
  };
}

// 阴影配置
interface ShadowConfig {
  blur: number;
  color: string;
  offsetX?: number;
  offsetY?: number;
}

// 描边配置
interface StrokeConfig {
  width: number;
  color: string;
}
```

## 下一步

继续学习更多功能：

- [Logo 集成](./logo.md) - 为二维码添加品牌 Logo
- [高级功能](./advanced-features.md) - 批量生成、缓存等
- [框架集成](./vue.md) - 在各种框架中使用
