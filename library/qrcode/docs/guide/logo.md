# Logo 集成

为二维码添加 Logo 可以增强品牌识别度。`@ldesign/qrcode` 提供了强大而灵活的 Logo 集成功能。

## 基础 Logo

### 简单添加 Logo

最简单的 Logo 配置：

```typescript
import { createQRCode } from '@ldesign/qrcode';

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  logo: {
    src: '/path/to/logo.png',
  },
});
```

### 设置 Logo 尺寸

使用像素值或百分比设置尺寸：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',  // Logo 会覆盖部分区域，建议使用高纠错级别
  logo: {
    src: '/logo.png',
    width: 60,      // 像素值
    height: 60,
  },
});

// 或使用百分比
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '20%',   // 相对于二维码总尺寸的百分比
    height: '20%',
  },
});
```

**Logo 尺寸建议：**
- 小型 Logo：15-20% 的二维码尺寸
- 中型 Logo：20-25%（推荐）
- 大型 Logo：25-30%（需要 `H` 级别纠错）

## Logo 形状

支持四种 Logo 形状，确保 Logo 在各种场景下都美观。

### Square - 方形

强制 Logo 保持方形，防止变形：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'square',  // 强制方形
  },
});
```

**适用场景：**
- Logo 本身是方形设计
- 需要保持 Logo 的正方形比例
- 品牌标识要求严格的尺寸比例

### Circle - 圆形

将 Logo 裁剪为圆形：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'circle',
  },
});
```

**适用场景：**
- 圆形品牌标识
- 头像、肖像 Logo
- 需要柔和、友好的外观

### Rounded - 圆角矩形

带圆角的矩形 Logo：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'rounded',
    borderRadius: 8,  // 圆角大小（像素）
  },
});
```

**适用场景：**
- 现代品牌设计
- 应用图标
- 需要柔和边缘但保持矩形结构

### Auto - 自动

根据 Logo 原始形状自动处理（默认）：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'auto',  // 默认值
  },
});
```

## Logo 宽高比

控制 Logo 在指定尺寸区域内的显示方式。

### Keep - 保持原始比例

保持 Logo 的原始宽高比，推荐使用：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    aspectRatio: 'keep',  // 保持原始比例（推荐）
  },
});
```

**特点：**
- Logo 不会变形
- 在指定区域内完整显示
- 可能留有空白区域

### Fill - 填充

拉伸 Logo 以完全填充指定区域：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    aspectRatio: 'fill',
  },
});
```

**特点：**
- 完全填充指定区域
- 可能导致 Logo 变形
- 不推荐用于有严格比例要求的 Logo

### Cover - 覆盖

缩放 Logo 以覆盖整个区域，保持比例：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    aspectRatio: 'cover',
  },
});
```

**特点：**
- 完全覆盖指定区域
- 保持 Logo 比例
- Logo 可能被裁剪

### Contain - 包含

缩放 Logo 以完全包含在区域内，保持比例：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    aspectRatio: 'contain',
  },
});
```

**特点：**
- Logo 完整可见
- 保持比例
- 可能留有空白

## Logo 背景

为 Logo 添加背景可以提高可识别性和美观度。

### 启用 Logo 背景

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoBackground: true,                  // 启用背景
    logoBackgroundColor: '#ffffff',        // 背景颜色
    logoBackgroundPadding: 5,              // 背景内边距（像素）
  },
});
```

**配置选项：**
- `logoBackground`: 是否显示背景（默认 `false`）
- `logoBackgroundColor`: 背景颜色（默认白色）
- `logoBackgroundPadding`: Logo 与背景边缘的间距

### 背景形状

背景形状会自动匹配 `logoShape`：

```typescript
// 圆形背景
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'circle',
    logoBackground: true,
    logoBackgroundColor: '#ffffff',
    logoBackgroundPadding: 8,
  },
});

// 圆角矩形背景
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'rounded',
    borderRadius: 8,
    logoBackground: true,
    logoBackgroundColor: '#f3f4f6',
    logoBackgroundPadding: 10,
  },
});
```

## Logo 边框

为 Logo 添加边框增强视觉效果：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    border: true,                  // 启用边框
    borderColor: '#ffffff',        // 边框颜色
    borderWidth: 4,                // 边框宽度（像素）
    borderRadius: 8,               // 边框圆角（像素）
  },
});
```

**边框 + 背景组合：**

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'rounded',
    // 背景
    logoBackground: true,
    logoBackgroundColor: '#ffffff',
    logoBackgroundPadding: 8,
    // 边框
    border: true,
    borderColor: '#e5e7eb',
    borderWidth: 2,
    borderRadius: 12,
  },
});
```

## Logo 位置

默认情况下，Logo 居中显示。可以自定义位置：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    x: 0.5,  // 水平位置（0-1，0.5 为居中）
    y: 0.5,  // 垂直位置（0-1，0.5 为居中）
  },
});
```

**位置说明：**
- `x`: 0 为左边缘，1 为右边缘，0.5 为水平居中
- `y`: 0 为顶边缘，1 为底边缘，0.5 为垂直居中

## 完整 Logo 配置示例

### 示例 1：简洁白色背景 Logo

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    fgColor: '#1e40af',
  },
  logo: {
    src: '/brand-logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'square',
    aspectRatio: 'keep',
    logoBackground: true,
    logoBackgroundColor: '#ffffff',
    logoBackgroundPadding: 10,
  },
});
```

### 示例 2：圆形头像 Logo

```typescript
createQRCode({
  content: 'https://example.com/profile',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
  },
  logo: {
    src: '/avatar.jpg',
    width: '30%',
    height: '30%',
    logoShape: 'circle',
    aspectRatio: 'cover',
    border: true,
    borderColor: '#ffffff',
    borderWidth: 4,
  },
});
```

### 示例 3：带阴影的圆角 Logo

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    fgColor: '#059669',
  },
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoShape: 'rounded',
    borderRadius: 12,
    aspectRatio: 'keep',
    logoBackground: true,
    logoBackgroundColor: '#ffffff',
    logoBackgroundPadding: 8,
    border: true,
    borderColor: '#d1fae5',
    borderWidth: 3,
  },
});
```

### 示例 4：企业品牌 Logo

```typescript
createQRCode({
  content: 'https://company.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 350,
    dotStyle: 'classy-rounded',
    fgColor: '#1f2937',
  },
  logo: {
    src: '/company-logo.svg',
    width: '28%',
    height: '28%',
    logoShape: 'square',
    aspectRatio: 'keep',
    logoBackground: true,
    logoBackgroundColor: '#ffffff',
    logoBackgroundPadding: 12,
    border: true,
    borderColor: '#e5e7eb',
    borderWidth: 2,
  },
});
```

## Logo 格式支持

支持所有主流图片格式：

```typescript
// PNG（推荐，支持透明）
logo: { src: '/logo.png' }

// JPEG
logo: { src: '/logo.jpg' }

// SVG（矢量图，最佳质量）
logo: { src: '/logo.svg' }

// WebP（更小文件，现代浏览器）
logo: { src: '/logo.webp' }

// Data URL（Base64 编码）
logo: { src: 'data:image/png;base64,iVBORw0KGgoAAAANS...' }

// 外部 URL
logo: { src: 'https://example.com/logo.png' }
```

**格式推荐：**
- **PNG**：推荐用于带透明背景的 Logo
- **SVG**：推荐用于矢量 Logo，缩放不失真
- **JPEG**：用于照片类 Logo，文件较小
- **WebP**：现代格式，最佳压缩比

## 错误纠正级别与 Logo

Logo 会覆盖部分二维码数据，需要合适的错误纠正级别：

| Logo 尺寸 | 推荐纠错级别 | 说明 |
|-----------|--------------|------|
| 15-20%    | M 或 Q       | 小型 Logo，M 级通常足够 |
| 20-25%    | Q            | 中型 Logo（推荐尺寸） |
| 25-30%    | H            | 大型 Logo，必须使用 H |
| 30%+      | 不推荐       | Logo 过大可能无法扫描 |

```typescript
// 大型 Logo 示例
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',  // 必须！
  logo: {
    src: '/logo.png',
    width: '30%',  // 大型 Logo
    height: '30%',
  },
});
```

## 动态更新 Logo

可以在运行时更新 Logo：

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo1.png',
    width: '25%',
    height: '25%',
  },
});

// 更新 Logo
await qrCode.update({
  logo: {
    src: '/logo2.png',
    width: '30%',
    height: '30%',
    logoShape: 'circle',
  },
});

// 移除 Logo
await qrCode.update({
  logo: undefined,
});
```

## Logo 最佳实践

### 1. Logo 清晰度

```typescript
// ✅ 推荐：使用高分辨率 Logo
logo: {
  src: '/logo@2x.png',  // 2倍图
  width: '25%',
  height: '25%',
}

// ❌ 避免：使用低分辨率图片
logo: {
  src: '/logo-32x32.png',  // 太小
  width: '25%',
  height: '25%',
}
```

### 2. Logo 对比度

```typescript
// ✅ 推荐：Logo 与二维码有明显区分
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    fgColor: '#000000',
  },
  logo: {
    src: '/logo.png',
    logoBackground: true,
    logoBackgroundColor: '#ffffff',  // 白色背景与黑色二维码对比
    logoBackgroundPadding: 8,
  },
});
```

### 3. Logo 尺寸适中

```typescript
// ✅ 推荐：20-25% 的二维码尺寸
logo: {
  src: '/logo.png',
  width: '25%',
  height: '25%',
}

// ❌ 避免：过大的 Logo
logo: {
  src: '/logo.png',
  width: '40%',  // 太大，可能无法扫描
  height: '40%',
}
```

### 4. 保持 Logo 比例

```typescript
// ✅ 推荐：使用 keep 保持原始比例
logo: {
  src: '/logo.png',
  width: '25%',
  height: '25%',
  aspectRatio: 'keep',
}

// ❌ 避免：使用 fill 导致变形
logo: {
  src: '/logo.png',
  width: '25%',
  height: '25%',
  aspectRatio: 'fill',  // 可能变形
}
```

### 5. 测试扫描

```typescript
// 生成后务必测试扫描
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
  },
});

// 使用多个二维码扫描应用测试
// - 确保在不同光线条件下可扫描
// - 测试不同距离
// - 在实际打印后再次测试
```

## 常见问题

### Q: Logo 太模糊怎么办？

**解决方案：**
1. 使用更高分辨率的 Logo 图片
2. 增加二维码的整体尺寸
3. 使用 SVG 格式的 Logo

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 400,  // 增加尺寸
  },
  logo: {
    src: '/logo.svg',  // 使用 SVG
    width: '25%',
    height: '25%',
  },
});
```

### Q: Logo 边缘有锯齿？

**解决方案：**
使用 PNG 或 SVG 格式，启用背景和边框：

```typescript
logo: {
  src: '/logo.png',
  logoBackground: true,
  logoBackgroundColor: '#ffffff',
  logoBackgroundPadding: 5,
  border: true,
  borderWidth: 2,
  borderColor: '#e5e7eb',
}
```

### Q: 带 Logo 的二维码扫不出来？

**可能原因和解决方案：**

1. **Logo 太大**
```typescript
// 将 Logo 尺寸减小到 25% 以下
logo: { width: '20%', height: '20%' }
```

2. **错误纠正级别太低**
```typescript
errorCorrectionLevel: 'H'  // 使用最高级别
```

3. **对比度不足**
```typescript
style: {
  fgColor: '#000000',  // 使用深色
  bgColor: '#ffffff',  // 使用浅色
}
```

### Q: 如何处理透明 Logo？

透明 PNG Logo 可以直接使用，如果需要背景：

```typescript
logo: {
  src: '/transparent-logo.png',
  logoBackground: true,
  logoBackgroundColor: '#ffffff',
  logoBackgroundPadding: 8,
}
```

## 类型定义

```typescript
import type { LogoConfig, LogoShape, LogoAspectRatio } from '@ldesign/qrcode';

// Logo 形状
type LogoShape = 'square' | 'circle' | 'rounded' | 'auto';

// 宽高比处理
type LogoAspectRatio = 'keep' | 'fill' | 'cover' | 'contain';

// Logo 完整配置
interface LogoConfig {
  src: string;
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
  logoShape?: LogoShape;
  aspectRatio?: LogoAspectRatio;
  logoBackground?: boolean;
  logoBackgroundColor?: string;
  logoBackgroundPadding?: number;
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}
```

## 下一步

了解更多功能：

- [高级功能](./advanced-features.md) - 批量生成、性能优化
- [样式定制](./styling.md) - 渐变、模块样式、眼睛样式
- [框架集成](./vue.md) - 在 Vue、React 中使用
