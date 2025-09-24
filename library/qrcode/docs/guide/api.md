# API 总览

## 核心类：QRCodeGenerator

```ts
new QRCodeGenerator(options?: Partial<QRCodeOptions>)
await generator.generate(text?: string, overrideOptions?: Partial<QRCodeOptions>): Promise<QRCodeResult>
```

- 关键选项：
  - `size`: number，二维码尺寸（像素）
  - `format`: 'canvas' | 'svg' | 'image'
  - `errorCorrectionLevel`: 'L' | 'M' | 'Q' | 'H'
  - `margin`: number
  - `style`：前景色/背景色/点样式等
  - `logo`：中心 Logo 配置
  - `enableCache`: boolean 是否启用缓存

- 返回 `QRCodeResult`：
  - `element`: Canvas | SVGElement | HTMLImageElement
  - `dataURL`: string
  - `format`: 同上
  - `width`/`height`/`text`/`generatedAt` 等

## 便捷函数（helpers）

```ts
import {
  generateQRCode,
  generateQRCodeCanvas,
  generateQRCodeSVG,
  generateQRCodeImage,
  downloadQRCode
} from '@ldesign/qrcode'
```

## Vue 组件

```vue
<QRCode text="内容" :width="200" :height="200" format="canvas" :logo="{ src: 'logo.png' }" />
```

Props 参考 `QRCodeProps`，与 `QRCodeOptions` 一致并额外支持：
- `autoGenerate`：自动生成
- `showDownloadButton`、`downloadFilename`、`downloadButtonText`
- 事件：`generated`、`error`、`download`

## Hook：useQRCode

```ts
const {
  result, loading, error,
  options,
  isReady, dataURL, format, element,
  generate, updateOptions, regenerate,
  download, clearCache, getMetrics, clearMetrics, getCacheStats
} = useQRCode({ size: 200 })
```

## 类型参考（节选）

```ts
type QRCodeFormat = 'canvas' | 'svg' | 'image'
interface QRCodeOptions {
  data: string
  size?: number
  format?: QRCodeFormat
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  style?: {
    backgroundColor?: string | GradientOptions
    foregroundColor?: string | GradientOptions
    dotStyle?: 'square' | 'rounded' | 'dots' | 'classy'
  }
  logo?: {
    src: string
    size?: number
    margin?: number
    shape?: 'square' | 'circle'
    borderWidth?: number
    borderColor?: string
    backgroundColor?: string
    opacity?: number
  }
  enableCache?: boolean
}
```
