# API 类型参考

完整的 TypeScript 类型定义参考。

## 核心类型

### QRCodeConfig

主要配置接口：

```typescript
interface QRCodeConfig {
  /** 二维码内容（必需） */
  content: string;

  /** 容器元素（必需） */
  container: HTMLElement;

  /** 错误纠正级别 */
  errorCorrectionLevel?: ErrorCorrectionLevel;

  /** 渲染类型 */
  renderType?: RenderType;

  /** 样式配置 */
  style?: StyleConfig;

  /** Logo 配置 */
  logo?: LogoConfig;

  /** 生成完成回调 */
  onGenerated?: (info: GenerationInfo) => void;

  /** 更新回调 */
  onUpdate?: (changes: Partial<QRCodeConfig>) => void;

  /** 错误回调 */
  onError?: (error: Error) => void;
}
```

**示例：**

```typescript
import { createQRCode } from '@ldesign/qrcode';
import type { QRCodeConfig } from '@ldesign/qrcode';

const config: QRCodeConfig = {
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'rounded',
  },
};

const qrCode = createQRCode(config);
```

## 枚举类型

### ErrorCorrectionLevel

错误纠正级别：

```typescript
enum ErrorCorrectionLevel {
  /** Low - 约 7% 容错率 */
  L = 'L',

  /** Medium - 约 15% 容错率（默认） */
  M = 'M',

  /** Quartile - 约 25% 容错率 */
  Q = 'Q',

  /** High - 约 30% 容错率 */
  H = 'H',
}
```

或使用字符串字面量：

```typescript
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
```

### RenderType

渲染类型：

```typescript
enum RenderType {
  /** Canvas 渲染（默认） */
  Canvas = 'canvas',

  /** SVG 渲染 */
  SVG = 'svg',
}
```

或：

```typescript
type RenderType = 'canvas' | 'svg';
```

### DotStyle

模块（点）样式：

```typescript
enum DotStyle {
  /** 方形（默认） */
  Square = 'square',

  /** 圆角方形 */
  Rounded = 'rounded',

  /** 圆点 */
  Dots = 'dots',

  /** 菱形 */
  Diamond = 'diamond',

  /** 星形 */
  Star = 'star',

  /** 优雅样式 */
  Classy = 'classy',

  /** 圆角优雅样式 */
  ClassyRounded = 'classy-rounded',
}
```

或：

```typescript
type DotStyle =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'diamond'
  | 'star'
  | 'classy'
  | 'classy-rounded';
```

### LogoShape

Logo 形状：

```typescript
enum LogoShape {
  /** 方形 */
  Square = 'square',

  /** 圆形 */
  Circle = 'circle',

  /** 圆角矩形 */
  Rounded = 'rounded',

  /** 自动（默认） */
  Auto = 'auto',
}
```

或：

```typescript
type LogoShape = 'square' | 'circle' | 'rounded' | 'auto';
```

### LogoAspectRatio

Logo 宽高比处理：

```typescript
enum LogoAspectRatio {
  /** 保持原始比例（推荐） */
  Keep = 'keep',

  /** 填充整个区域 */
  Fill = 'fill',

  /** 覆盖整个区域 */
  Cover = 'cover',

  /** 包含在区域内 */
  Contain = 'contain',
}
```

或：

```typescript
type LogoAspectRatio = 'keep' | 'fill' | 'cover' | 'contain';
```

## 样式配置

### StyleConfig

完整的样式配置接口：

```typescript
interface StyleConfig {
  /** 二维码尺寸（像素） */
  size?: number;

  /** 边距（模块数量） */
  margin?: number;

  /** 前景色 */
  fgColor?: string;

  /** 背景色 */
  bgColor?: string;

  /** 圆角半径（0-0.5） */
  cornerRadius?: number;

  /** 模块样式 */
  dotStyle?: DotStyle;

  /** 渐变配置 */
  gradient?: GradientConfig;

  /** 背景渐变 */
  backgroundGradient?: GradientConfig;

  /** 背景图片 */
  backgroundImage?: string;

  /** 眼睛样式 */
  eyeStyle?: EyeStyleConfig | EyeStyleConfig[];

  /** 阴影效果 */
  shadow?: ShadowConfig;

  /** 描边效果 */
  stroke?: StrokeConfig;
}
```

**示例：**

```typescript
import type { StyleConfig } from '@ldesign/qrcode';

const style: StyleConfig = {
  size: 300,
  margin: 4,
  fgColor: '#2563eb',
  bgColor: '#ffffff',
  dotStyle: 'rounded',
  cornerRadius: 0.3,
};
```

### GradientConfig

渐变配置：

```typescript
interface GradientConfig {
  /** 渐变类型 */
  type: 'linear' | 'radial';

  /** 颜色数组（至少2个） */
  colors: string[];

  /** 颜色停止位置（0-1，可选） */
  stops?: number[];

  /** 渐变方向（度，仅用于 linear） */
  direction?: number;

  /** 渐变中心位置（仅用于 radial） */
  position?: {
    x: number;  // 0-1
    y: number;  // 0-1
  };
}
```

**线性渐变示例：**

```typescript
const linearGradient: GradientConfig = {
  type: 'linear',
  colors: ['#667eea', '#764ba2'],
  direction: 45,  // 45度角
};
```

**径向渐变示例：**

```typescript
const radialGradient: GradientConfig = {
  type: 'radial',
  colors: ['#f97316', '#dc2626'],
  position: { x: 0.5, y: 0.5 },  // 中心位置
};
```

**多色渐变示例：**

```typescript
const multiColorGradient: GradientConfig = {
  type: 'linear',
  colors: ['#ff0080', '#ff8c00', '#40e0d0'],
  stops: [0, 0.5, 1],
  direction: 90,
};
```

### EyeStyleConfig

眼睛（定位点）样式配置：

```typescript
interface EyeStyleConfig {
  /** 外圈样式 */
  outer?: {
    style?: DotStyle;
    color?: string;
    gradient?: GradientConfig;
  };

  /** 内圈样式 */
  inner?: {
    style?: DotStyle;
    color?: string;
    gradient?: GradientConfig;
  };
}
```

**单一样式示例：**

```typescript
const eyeStyle: EyeStyleConfig = {
  outer: {
    style: 'rounded',
    color: '#ef4444',
  },
  inner: {
    style: 'dots',
    color: '#dc2626',
  },
};
```

**多色眼睛示例：**

```typescript
const multiEyeStyle: EyeStyleConfig[] = [
  // 左上角
  {
    outer: { style: 'rounded', color: '#ef4444' },
    inner: { style: 'dots', color: '#dc2626' },
  },
  // 右上角
  {
    outer: { style: 'rounded', color: '#3b82f6' },
    inner: { style: 'dots', color: '#2563eb' },
  },
  // 左下角
  {
    outer: { style: 'rounded', color: '#10b981' },
    inner: { style: 'dots', color: '#059669' },
  },
];
```

### ShadowConfig

阴影配置：

```typescript
interface ShadowConfig {
  /** 模糊半径（像素） */
  blur: number;

  /** 阴影颜色 */
  color: string;

  /** 水平偏移（像素，可选） */
  offsetX?: number;

  /** 垂直偏移（像素，可选） */
  offsetY?: number;
}
```

**示例：**

```typescript
const shadow: ShadowConfig = {
  blur: 10,
  color: 'rgba(0, 0, 0, 0.3)',
  offsetX: 3,
  offsetY: 3,
};
```

### StrokeConfig

描边配置：

```typescript
interface StrokeConfig {
  /** 描边宽度（像素） */
  width: number;

  /** 描边颜色 */
  color: string;
}
```

**示例：**

```typescript
const stroke: StrokeConfig = {
  width: 2,
  color: '#ffffff',
};
```

## Logo 配置

### LogoConfig

Logo 完整配置：

```typescript
interface LogoConfig {
  /** Logo 图片源（必需） */
  src: string;

  /** Logo 宽度（像素或百分比） */
  width?: number | string;

  /** Logo 高度（像素或百分比） */
  height?: number | string;

  /** 水平位置（0-1，默认 0.5） */
  x?: number;

  /** 垂直位置（0-1，默认 0.5） */
  y?: number;

  /** Logo 形状 */
  logoShape?: LogoShape;

  /** 宽高比处理 */
  aspectRatio?: LogoAspectRatio;

  /** 是否显示背景 */
  logoBackground?: boolean;

  /** 背景颜色 */
  logoBackgroundColor?: string;

  /** 背景内边距（像素） */
  logoBackgroundPadding?: number;

  /** 是否显示边框 */
  border?: boolean;

  /** 边框颜色 */
  borderColor?: string;

  /** 边框宽度（像素） */
  borderWidth?: number;

  /** 边框圆角（像素） */
  borderRadius?: number;

  /** Logo 加载错误回调 */
  onError?: (error: Error) => string | void;
}
```

**完整示例：**

```typescript
import type { LogoConfig } from '@ldesign/qrcode';

const logo: LogoConfig = {
  src: '/logo.png',
  width: '25%',
  height: '25%',
  logoShape: 'circle',
  aspectRatio: 'keep',
  logoBackground: true,
  logoBackgroundColor: '#ffffff',
  logoBackgroundPadding: 8,
  border: true,
  borderColor: '#e5e7eb',
  borderWidth: 2,
  borderRadius: 8,
  onError: (error) => {
    console.error('Logo 加载失败:', error);
    return '/fallback-logo.png';
  },
};
```

## 实例接口

### QRCodeInstance

二维码实例接口：

```typescript
interface QRCodeInstance {
  /** 更新二维码配置 */
  update(config: Partial<QRCodeConfig>): Promise<void>;

  /** 下载二维码 */
  download(options: DownloadOptions): void;

  /** 获取 Data URL */
  toDataURL(format: 'png' | 'jpeg'): string;

  /** 销毁实例 */
  destroy(): void;

  /** 获取配置 */
  getConfig(): QRCodeConfig;

  /** 获取容器元素 */
  getContainer(): HTMLElement;

  /** 获取渲染元素 */
  getElement(): HTMLCanvasElement | SVGSVGElement;
}
```

### DownloadOptions

下载选项：

```typescript
interface DownloadOptions {
  /** 文件名（不含扩展名） */
  fileName: string;

  /** 文件格式 */
  format: 'png' | 'jpeg' | 'svg';

  /** JPEG 质量（0-1，可选） */
  quality?: number;
}
```

**示例：**

```typescript
// 下载 PNG
qrCode.download({
  fileName: 'qrcode',
  format: 'png',
});

// 下载高质量 JPEG
qrCode.download({
  fileName: 'qrcode',
  format: 'jpeg',
  quality: 0.95,
});
```

### GenerationInfo

生成信息：

```typescript
interface GenerationInfo {
  /** QR 码版本（1-40） */
  version: number;

  /** 模块数量 */
  moduleCount: number;

  /** 错误纠正级别 */
  errorCorrectionLevel: ErrorCorrectionLevel;

  /** 渲染耗时（毫秒） */
  renderTime: number;

  /** 内容长度 */
  contentLength: number;

  /** 是否有 Logo */
  hasLogo: boolean;
}
```

## 高级功能类型

### BatchDownloadOptions

批量下载选项：

```typescript
interface BatchDownloadOptions {
  /** 二维码项目列表 */
  items: Array<{
    content: string;
    fileName: string;
  }>;

  /** 文件格式 */
  format: 'png' | 'jpeg' | 'svg';

  /** ZIP 文件名 */
  zipFileName: string;

  /** 统一样式配置（可选） */
  style?: StyleConfig;

  /** 统一纠错级别（可选） */
  errorCorrectionLevel?: ErrorCorrectionLevel;

  /** 进度回调（可选） */
  onProgress?: (current: number, total: number) => void;
}
```

### ValidationResult

验证结果：

```typescript
interface ValidationResult {
  /** 是否有效 */
  valid: boolean;

  /** 内容类型 */
  type?: 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';

  /** 错误信息数组 */
  errors?: string[];

  /** 估计大小（字节） */
  estimatedSize?: number;

  /** 推荐纠错级别 */
  recommendedErrorLevel?: ErrorCorrectionLevel;
}
```

### CacheStats

缓存统计：

```typescript
interface CacheStats {
  /** 缓存项数量 */
  size: number;

  /** 缓存命中率（百分比） */
  hitRate: number;

  /** 内存使用（KB） */
  memoryUsage: number;

  /** 最大缓存大小 */
  maxSize: number;
}
```

## 错误类型

### QRCodeError

自定义错误类：

```typescript
class QRCodeError extends Error {
  /** 错误代码 */
  code: string;

  /** 错误详情 */
  details?: any;

  constructor(code: string, message: string, details?: any);
}
```

**错误代码：**

```typescript
type ErrorCode =
  | 'INVALID_CONTENT'           // 无效内容
  | 'CONTAINER_NOT_FOUND'       // 容器未找到
  | 'LOGO_LOAD_FAILED'          // Logo 加载失败
  | 'RENDER_FAILED'             // 渲染失败
  | 'INVALID_CONFIG'            // 无效配置
  | 'UNSUPPORTED_FORMAT'        // 不支持的格式
  | 'CACHE_ERROR';              // 缓存错误
```

## 工具函数类型

### 验证函数

```typescript
/** 验证内容 */
function validateContent(content: string): ValidationResult;

/** 验证配置 */
function validateConfig(config: QRCodeConfig): ValidationResult;

/** 获取推荐尺寸 */
function getRecommendedSize(
  content: string,
  errorLevel: ErrorCorrectionLevel
): number;
```

### 缓存函数

```typescript
/** 启用/禁用缓存 */
function enableCache(enabled: boolean): void;

/** 清除缓存 */
function clearCache(content?: string): void;

/** 获取缓存统计 */
function getCacheStats(): CacheStats;
```

### 批量操作

```typescript
/** 批量下载 */
function batchDownload(options: BatchDownloadOptions): Promise<void>;

/** 批量生成 */
function batchGenerate(
  items: Array<{ content: string; config?: Partial<QRCodeConfig> }>
): Promise<QRCodeInstance[]>;
```

## 预设主题类型

```typescript
interface ThemeConfig extends Partial<QRCodeConfig> {
  name: string;
  description?: string;
}

const themes: Record<string, ThemeConfig> = {
  modern: { /* ... */ },
  elegant: { /* ... */ },
  minimal: { /* ... */ },
};
```

## Vue 特定类型

### Vue 组件 Props

```typescript
interface QRCodeProps {
  content: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  renderType?: RenderType;
  styleConfig?: StyleConfig;
  logo?: LogoConfig;
}

interface QRCodeEmits {
  generated: [info: GenerationInfo];
  error: [error: Error];
  update: [changes: Partial<QRCodeConfig>];
}
```

### Vue Composable

```typescript
interface UseQRCodeOptions extends QRCodeConfig {
  container: Ref<HTMLElement | undefined>;
}

interface UseQRCodeReturn {
  qrCode: Ref<QRCodeInstance | null>;
  update: (config: Partial<QRCodeConfig>) => Promise<void>;
  download: (options: DownloadOptions) => void;
  toDataURL: (format: 'png' | 'jpeg') => string;
  destroy: () => void;
}

function useQRCode(options: UseQRCodeOptions): UseQRCodeReturn;
```

## React 特定类型

### React 组件 Props

```typescript
interface QRCodeProps {
  content: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  renderType?: RenderType;
  styleConfig?: StyleConfig;
  logo?: LogoConfig;
  onGenerated?: (info: GenerationInfo) => void;
  onError?: (error: Error) => void;
  onUpdate?: (changes: Partial<QRCodeConfig>) => void;
}
```

### React Hook

```typescript
interface UseQRCodeOptions extends QRCodeConfig {
  container: RefObject<HTMLElement>;
}

interface UseQRCodeReturn {
  qrCode: QRCodeInstance | null;
  update: (config: Partial<QRCodeConfig>) => Promise<void>;
  download: (options: DownloadOptions) => void;
  toDataURL: (format: 'png' | 'jpeg') => string;
  destroy: () => void;
}

function useQRCode(options: UseQRCodeOptions): UseQRCodeReturn;
```

## 类型导出

完整的导出列表：

```typescript
// 核心类型
export type {
  QRCodeConfig,
  QRCodeInstance,
  StyleConfig,
  LogoConfig,
  GradientConfig,
  EyeStyleConfig,
  ShadowConfig,
  StrokeConfig,
  DownloadOptions,
  GenerationInfo,
  ValidationResult,
  CacheStats,
  BatchDownloadOptions,
};

// 枚举类型
export {
  ErrorCorrectionLevel,
  RenderType,
  DotStyle,
  LogoShape,
  LogoAspectRatio,
};

// 错误类型
export { QRCodeError };

// 函数签名
export {
  createQRCode,
  validateContent,
  validateConfig,
  getRecommendedSize,
  enableCache,
  clearCache,
  getCacheStats,
  batchDownload,
  batchGenerate,
};

// 主题
export { themes };

// Vue
export type { QRCodeProps as VueQRCodeProps, UseQRCodeOptions as VueUseQRCodeOptions };
export { QRCode as VueQRCode, useQRCode as vueUseQRCode };

// React
export type { QRCodeProps as ReactQRCodeProps, UseQRCodeOptions as ReactUseQRCodeOptions };
export { QRCode as ReactQRCode, useQRCode as reactUseQRCode };
```

## 完整示例

```typescript
import { createQRCode } from '@ldesign/qrcode';
import type {
  QRCodeConfig,
  QRCodeInstance,
  StyleConfig,
  LogoConfig,
  ErrorCorrectionLevel,
  DotStyle,
  GenerationInfo,
} from '@ldesign/qrcode';

// 完整类型安全的配置
const errorLevel: ErrorCorrectionLevel = 'H';
const dotStyle: DotStyle = 'rounded';

const style: StyleConfig = {
  size: 300,
  dotStyle,
  gradient: {
    type: 'linear',
    colors: ['#667eea', '#764ba2'],
    direction: 45,
  },
  shadow: {
    blur: 10,
    color: 'rgba(0, 0, 0, 0.2)',
    offsetY: 4,
  },
};

const logo: LogoConfig = {
  src: '/logo.png',
  width: '25%',
  height: '25%',
  logoShape: 'circle',
  aspectRatio: 'keep',
  logoBackground: true,
  logoBackgroundPadding: 8,
};

const config: QRCodeConfig = {
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: errorLevel,
  style,
  logo,
  onGenerated: (info: GenerationInfo) => {
    console.log(`生成完成，版本: ${info.version}`);
  },
};

const qrCode: QRCodeInstance = createQRCode(config);

// 使用实例方法
await qrCode.update({ content: 'New content' });
qrCode.download({ fileName: 'qrcode', format: 'png' });
const dataUrl: string = qrCode.toDataURL('png');
qrCode.destroy();
```

## 下一步

- [基础使用](../guide/basic-usage.md) - 开始使用
- [样式定制](../guide/styling.md) - 样式配置
- [Logo 集成](../guide/logo.md) - Logo 配置
