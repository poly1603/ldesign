# 类型定义

## 核心类型

### QRCodeOptions

二维码生成的完整配置选项。

```typescript
interface QRCodeOptions {
  // 基础选项
  data: string                              // 要编码的数据
  size?: number                            // 尺寸，默认200
  format?: QRCodeFormat                    // 输出格式，默认'canvas'
  margin?: number                          // 边距，默认4
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'  // 纠错级别，默认'M'
  
  // 颜色选项
  color?: ColorOptions                     // 颜色配置
  
  // 样式选项
  style?: StyleOptions                     // 样式配置
  
  // Logo选项
  logo?: LogoOptions                       // Logo配置
  
  // 性能选项
  performance?: {
    enableCache?: boolean                  // 启用缓存，默认true
    cacheSize?: number                     // 缓存大小，默认100
  }
}
```

### QRCodeResult

二维码生成结果。

```typescript
interface QRCodeResult {
  data: string                             // 二维码数据（base64或SVG字符串）
  element?: HTMLElement                    // DOM元素（Canvas或SVG）
  format: QRCodeFormat                     // 输出格式
  size: number                             // 实际尺寸
  timestamp: number                        // 生成时间戳
  cacheKey?: string                        // 缓存键
}
```

### QRCodeError

二维码错误对象。

```typescript
interface QRCodeError extends Error {
  code: string                             // 错误代码
  details?: any                            // 错误详情
  timestamp: number                        // 错误时间戳
}
```

### ColorOptions

颜色配置选项。

```typescript
interface ColorOptions {
  foreground?: string | GradientColor      // 前景色
  background?: string | GradientColor      // 背景色
}
```

### GradientColor

渐变色配置。

```typescript
interface GradientColor {
  type: 'linear' | 'radial'                // 渐变类型
  colors: ColorStop[]                      // 颜色停止点
  direction?: number                       // 方向（角度）
  center?: [number, number]                // 中心点（径向渐变）
  radius?: number                          // 半径（径向渐变）
}
```

### ColorStop

颜色停止点。

```typescript
interface ColorStop {
  offset: number                           // 偏移量（0-1）
  color: string                            // 颜色值
}
```

### StyleOptions

样式配置选项。

```typescript
interface StyleOptions {
  dotStyle?: 'square' | 'circle' | 'rounded'     // 点样式
  cornerStyle?: 'square' | 'circle' | 'rounded'  // 角样式
  borderRadius?: number                          // 圆角半径
  padding?: number                               // 内边距
}
```

### LogoOptions

Logo配置选项。

```typescript
interface LogoOptions {
  src: string                              // Logo图片源
  size?: number                            // Logo尺寸
  margin?: number                          // Logo边距
  shape?: 'square' | 'circle'              // Logo形状
  borderWidth?: number                     // 边框宽度
  borderColor?: string                     // 边框颜色
  backgroundColor?: string                 // 背景色
}
```

### PerformanceMetric

性能指标。

```typescript
interface PerformanceMetric {
  id: string                               // 指标ID
  name: string                             // 指标名称
  startTime: number                        // 开始时间
  endTime: number                          // 结束时间
  duration: number                         // 持续时间
  memory?: number                          // 内存使用
}
```

## 框架特定类型

### SimpleQRCodeOptions

简化的配置选项（原生JavaScript）。

```typescript
interface SimpleQRCodeOptions {
  // 基础选项
  size?: number
  format?: 'canvas' | 'svg' | 'image'
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  
  // 颜色选项
  foregroundColor?: string
  backgroundColor?: string
  
  // Logo选项
  logo?: string | {
    src: string
    size?: number
    margin?: number
  }
  
  // 容器选项
  container?: string | HTMLElement
  className?: string
  
  // 回调函数
  onGenerated?: (result: QRCodeResult) => void
  onError?: (error: QRCodeError) => void
}
```

### FrameworkDetection

框架检测结果。

```typescript
interface FrameworkDetection {
  framework: 'vue' | 'react' | 'angular' | 'vanilla' | 'unknown'
  version?: string
  detected: boolean
}
```

### AdapterOptions

适配器选项。

```typescript
interface AdapterOptions extends Partial<QRCodeOptions> {
  autoDetect?: boolean
  framework?: 'vue' | 'react' | 'angular' | 'vanilla'
}
```

## Vue特定类型

### QRCodeProps

Vue组件属性。

```typescript
interface QRCodeProps extends Partial<QRCodeOptions> {
  text?: string                            // 文本内容
  width?: number                           // 宽度
  height?: number                          // 高度
  showDownloadButton?: boolean             // 显示下载按钮
  downloadButtonText?: string              // 下载按钮文本
  downloadFilename?: string                // 下载文件名
}
```

### UseQRCodeReturn

Vue Hook返回类型。

```typescript
interface UseQRCodeReturn {
  // 状态
  result: Ref<QRCodeResult | null>
  loading: Ref<boolean>
  error: Ref<QRCodeError | null>
  
  // 方法
  generate: (text?: string, options?: Partial<QRCodeOptions>) => Promise<QRCodeResult>
  regenerate: () => Promise<QRCodeResult>
  clearCache: () => void
  getMetrics: () => PerformanceMetric[]
  
  // 生成器实例
  generator: QRCodeGenerator
}
```

## React特定类型

### QRCodeProps (React)

React组件属性。

```typescript
interface QRCodeProps extends Partial<QRCodeOptions> {
  // 基础属性
  text?: string
  className?: string
  style?: React.CSSProperties
  
  // 显示选项
  showDownloadButton?: boolean
  downloadButtonText?: string
  downloadFilename?: string
  
  // 事件回调
  onGenerated?: (result: QRCodeResult) => void
  onError?: (error: QRCodeError) => void
  onDownload?: (result: QRCodeResult) => void
  
  // 加载状态自定义
  loadingComponent?: React.ReactNode
  errorComponent?: (error: QRCodeError) => React.ReactNode
}
```

### QRCodeRef

React组件引用。

```typescript
interface QRCodeRef {
  generate: (text?: string, options?: Partial<QRCodeOptions>) => Promise<QRCodeResult>
  regenerate: () => Promise<QRCodeResult>
  download: () => Promise<void>
  clearCache: () => void
  getMetrics: () => PerformanceMetric[]
  result: QRCodeResult | null
  loading: boolean
  error: QRCodeError | null
  isLoading: boolean
  generator: any
}
```

### UseQRCodeReturn (React)

React Hook返回类型。

```typescript
interface UseQRCodeReturn {
  // 状态
  result: QRCodeResult | null
  loading: boolean
  error: QRCodeError | null
  
  // 方法
  generate: (text?: string, options?: Partial<QRCodeOptions>) => Promise<QRCodeResult>
  regenerate: () => Promise<QRCodeResult>
  clearCache: () => void
  getMetrics: () => PerformanceMetric[]
  
  // 生成器实例
  generator: QRCodeGenerator
}
```

## Angular特定类型

### QRCodeState

Angular服务状态。

```typescript
interface QRCodeState {
  result: QRCodeResult | null
  loading: boolean
  error: QRCodeError | null
}
```

## 枚举类型

### QRCodeFormat

输出格式。

```typescript
type QRCodeFormat = 'canvas' | 'svg' | 'image'
```

### ErrorCorrectionLevel

纠错级别。

```typescript
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
```

### DotStyle

点样式。

```typescript
type DotStyle = 'square' | 'circle' | 'rounded'
```

### CornerStyle

角样式。

```typescript
type CornerStyle = 'square' | 'circle' | 'rounded'
```

### LogoShape

Logo形状。

```typescript
type LogoShape = 'square' | 'circle'
```

## 事件类型

### QRCodeEvents

事件映射。

```typescript
interface QRCodeEvents {
  generated: (result: QRCodeResult) => void
  error: (error: QRCodeError) => void
  optionsChanged: (options: QRCodeOptions) => void
}
```
