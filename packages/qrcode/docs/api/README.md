# API 参考文档

LDesign QR Code Library 提供了丰富的API，支持多种前端框架和使用场景。

## 核心API

### QRCodeGenerator

主要的二维码生成器类，提供完整的生成功能。

```typescript
import { QRCodeGenerator } from '@ldesign/qrcode'

const generator = new QRCodeGenerator(options)
```

#### 构造函数

```typescript
constructor(options: QRCodeOptions)
```

**参数：**
- `options`: QRCodeOptions - 配置选项

#### 方法

##### generate(text: string): Promise<QRCodeResult>

生成二维码。

**参数：**
- `text`: string - 要编码的文本

**返回：**
- Promise<QRCodeResult> - 生成结果

**示例：**
```typescript
const result = await generator.generate('Hello World')
console.log(result.data) // 二维码数据
console.log(result.element) // DOM元素
```

##### updateOptions(options: Partial<QRCodeOptions>): void

更新生成器配置。

**参数：**
- `options`: Partial<QRCodeOptions> - 新的配置选项

##### getOptions(): QRCodeOptions

获取当前配置。

**返回：**
- QRCodeOptions - 当前配置选项

##### clearCache(): void

清除缓存。

##### getPerformanceMetrics(): PerformanceMetric[]

获取性能指标。

**返回：**
- PerformanceMetric[] - 性能指标数组

##### destroy(): void

销毁生成器，释放资源。

### QRCodeInstance

高级API实例，提供事件管理和更丰富的功能。

```typescript
import { createQRCodeInstance } from '@ldesign/qrcode'

const instance = createQRCodeInstance(options)
```

#### 方法

##### generate(text?: string, options?: Partial<QRCodeOptions>): Promise<QRCodeResult>

生成二维码。

##### updateOptions(options: Partial<QRCodeOptions>): void

更新选项。

##### on<K extends keyof QRCodeEvents>(event: K, listener: QRCodeEvents[K]): void

添加事件监听器。

**支持的事件：**
- `generated`: 生成成功
- `error`: 生成失败
- `optionsChanged`: 选项变更

**示例：**
```typescript
instance.on('generated', (result) => {
  console.log('Generated:', result)
})

instance.on('error', (error) => {
  console.error('Error:', error)
})
```

##### off<K extends keyof QRCodeEvents>(event: K, listener: QRCodeEvents[K]): void

移除事件监听器。

##### clearCache(): void

清除缓存。

##### getMetrics(): PerformanceMetric[]

获取性能指标。

##### destroy(): void

销毁实例。

## 原生JavaScript API

### generateQRCode

快速生成二维码的函数。

```typescript
import { generateQRCode } from '@ldesign/qrcode'

const result = await generateQRCode(text, options)
```

**参数：**
- `text`: string - 要编码的文本
- `options`: SimpleQRCodeOptions - 配置选项

**返回：**
- Promise<QRCodeResult> - 生成结果

**示例：**
```typescript
// 基础使用
const result = await generateQRCode('Hello World')

// 带选项
const result = await generateQRCode('https://example.com', {
  size: 300,
  format: 'svg',
  foregroundColor: '#000',
  backgroundColor: '#fff',
  container: '#qrcode-container'
})
```

### SimpleQRCodeGenerator

简化的生成器类。

```typescript
import { SimpleQRCodeGenerator } from '@ldesign/qrcode'

const generator = new SimpleQRCodeGenerator(options)
```

#### 方法

##### generate(text: string): Promise<QRCodeResult>

生成二维码。

##### updateOptions(options: SimpleQRCodeOptions): void

更新选项。

##### clearCache(): void

清除缓存。

##### destroy(): void

销毁生成器。

### generateQRCodeBatch

批量生成二维码。

```typescript
import { generateQRCodeBatch } from '@ldesign/qrcode'

const results = await generateQRCodeBatch(texts, options)
```

**参数：**
- `texts`: string[] - 文本数组
- `options`: SimpleQRCodeOptions - 配置选项

**返回：**
- Promise<QRCodeResult[]> - 生成结果数组

### downloadQRCode

下载二维码。

```typescript
import { downloadQRCode } from '@ldesign/qrcode'

await downloadQRCode(result, filename)
```

**参数：**
- `result`: QRCodeResult - 二维码结果
- `filename`: string - 文件名

## 框架适配器API

### detectFramework

检测当前框架环境。

```typescript
import { detectFramework } from '@ldesign/qrcode'

const detection = detectFramework()
console.log(detection.framework) // 'vue' | 'react' | 'angular' | 'vanilla'
```

**返回：**
- FrameworkDetection - 检测结果

### generateQRCodeAuto

自动检测框架并生成二维码。

```typescript
import { generateQRCodeAuto } from '@ldesign/qrcode'

const result = await generateQRCodeAuto(text, options)
```

**参数：**
- `text`: string - 要编码的文本
- `options`: AdapterOptions - 适配器选项

### createFrameworkFactory

创建框架特定的生成器工厂。

```typescript
import { createFrameworkFactory } from '@ldesign/qrcode'

const factory = createFrameworkFactory('vue')
const generator = factory({ size: 200 })
```

### getFrameworkBestPractices

获取框架最佳实践配置。

```typescript
import { getFrameworkBestPractices } from '@ldesign/qrcode'

const config = getFrameworkBestPractices('react')
```

### checkFrameworkCompatibility

检查框架兼容性。

```typescript
import { checkFrameworkCompatibility } from '@ldesign/qrcode'

const compatibility = checkFrameworkCompatibility('vue', ['ssr', 'logo'])
```

## 工具函数

### isValidColor

验证颜色值。

```typescript
import { isValidColor } from '@ldesign/qrcode'

const valid = isValidColor('#ff0000') // true
```

### validateOptions

验证配置选项。

```typescript
import { validateOptions } from '@ldesign/qrcode'

const validation = validateOptions(options)
```

### getDefaultOptions

获取默认配置。

```typescript
import { getDefaultOptions } from '@ldesign/qrcode'

const defaults = getDefaultOptions()
```

### generateCacheKey

生成缓存键。

```typescript
import { generateCacheKey } from '@ldesign/qrcode'

const key = generateCacheKey(options)
```

### createError

创建错误对象。

```typescript
import { createError } from '@ldesign/qrcode'

const error = createError('Message', 'ERROR_CODE')
```

### PerformanceMonitor

性能监控器。

```typescript
import { PerformanceMonitor } from '@ldesign/qrcode'

const monitor = new PerformanceMonitor()
const id = monitor.start('operation')
// ... 执行操作
const metric = monitor.end(id)
```
