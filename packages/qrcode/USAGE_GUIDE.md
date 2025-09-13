# 🚀 LDesign QRCode 使用指南

欢迎使用 LDesign QRCode！这是一个功能强大、类型安全的二维码生成库，支持多种框架和丰富的自定义选项。

## 📦 安装

```bash
npm install @ldesign/qrcode
# 或
pnpm add @ldesign/qrcode
# 或
yarn add @ldesign/qrcode
```

## 🎯 快速开始

### 基础用法

```typescript
import { generateQRCode } from '@ldesign/qrcode'

// 最简单的使用
const result = await generateQRCode('Hello World')
document.body.appendChild(result.element!)

// 带选项的使用
const result = await generateQRCode('https://example.com', {
  size: 300,
  format: 'svg',
  color: {
    foreground: '#000000',
    background: '#FFFFFF'
  }
})
```

### Vue 3 集成

```vue
<template>
  <div>
    <canvas v-if="qrResult" :ref="(el) => el?.appendChild(qrResult.element!)"></canvas>
    <button @click="generate">生成二维码</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQRCode } from '@ldesign/qrcode'

const { result: qrResult, generate } = useQRCode({
  data: 'Hello Vue!',
  size: 200
})
</script>
```

## 🎨 主题系统

### 使用预设主题

```typescript
import { applyTheme, getAllThemes } from '@ldesign/qrcode'

// 应用预设主题
const options = applyTheme('dark', { data: 'Hello World' })
const result = await generateQRCode('Hello World', options)

// 获取所有可用主题
const themes = getAllThemes()
console.log(Object.keys(themes)) // ['light', 'dark', 'blue', 'green', ...]
```

### 预设主题列表

- `light` - 经典黑白主题
- `dark` - 深色主题  
- `blue` - 蓝色渐变主题
- `green` - 绿色自然主题
- `purple` - 紫色皇家主题
- `minimal` - 极简主题
- `neon` - 霓虹发光主题
- `sunset` - 日落渐变主题

### 自定义主题

```typescript
import { registerTheme, ThemeManager } from '@ldesign/qrcode'

// 注册自定义主题
registerTheme('myTheme', {
  name: 'My Custom Theme',
  colors: {
    foreground: '#ff6b35',
    background: '#f7931e',
    accent: '#ffd23f'
  },
  style: {
    dotStyle: 'rounded',
    cornerStyle: 'extra-rounded',
    borderRadius: 16
  }
})

// 使用自定义主题
const options = applyTheme('myTheme', { data: 'Custom Theme!' })
```

## ✅ 数据验证

### 基础验证

```typescript
import { QRDataValidator } from '@ldesign/qrcode'

const validator = new QRDataValidator()
const result = validator.validate('https://example.com')

console.log(result.isValid) // true
console.log(result.metadata?.dataType) // 'url'
console.log(result.metadata?.complexity) // 'low'
```

### 预设验证器

```typescript
import { ValidatorPresets } from '@ldesign/qrcode'

// 严格验证（仅HTTPS，无多余空格等）
const strictValidator = ValidatorPresets.strict()

// 宽松验证（允许HTTP，各种协议）
const lenientValidator = ValidatorPresets.lenient()

// 仅URL验证
const urlValidator = ValidatorPresets.urlOnly()

const result = strictValidator.validate('https://secure-site.com')
```

### 自定义验证

```typescript
const validator = new QRDataValidator({
  maxLength: 500,
  allowedProtocols: ['https:', 'mailto:'],
  customValidators: [
    (data) => data.includes('@company.com') || 'Must be company email',
    (data) => data.length > 10 || 'Too short'
  ]
})

const result = validator.validate('user@company.com')
```

## 📥 批量下载

### 基本批量下载

```typescript
import { batchDownload } from '@ldesign/qrcode'

const texts = ['Text 1', 'Text 2', 'Text 3']
const results = await Promise.all(
  texts.map(text => generateQRCode(text, { size: 200 }))
)

// 批量下载为ZIP
await batchDownload(results, {
  zipFilename: 'my-qrcodes.zip',
  format: 'png',
  includeIndex: true
})
```

### 高级批量处理

```typescript
import { BatchDownloader } from '@ldesign/qrcode'

const downloader = new BatchDownloader()
const items = results.map(result => ({ result }))

await downloader.downloadAsZip(items, {
  zipFilename: 'custom-qrcodes.zip',
  nameTemplate: 'qr-{index}-{timestamp}',
  onProgress: (completed, total) => {
    console.log(`进度: ${completed}/${total}`)
  },
  onItemComplete: (filename, index) => {
    console.log(`完成: ${filename}`)
  }
})
```

## ⚡ 性能优化

### DOM元素池

```typescript
import { getPerformanceManager } from '@ldesign/qrcode'

const pm = getPerformanceManager()
const elementPool = pm.getElementPool()

// 获取复用的Canvas元素
const canvas = elementPool.getCanvas(300, 300)
// 使用完后归还
elementPool.returnCanvas(canvas)
```

### 懒加载

```typescript
const lazyLoader = pm.getLazyLoader()

// 注册懒加载元素
lazyLoader.register(element, async () => {
  const result = await generateQRCode('Lazy loaded content')
  element.appendChild(result.element!)
})
```

### 性能监控

```typescript
const stats = pm.getPerformanceStats()
console.log('DOM元素池状态:', stats.elementPool)
console.log('内存使用:', stats.memoryStats)
console.log('Worker可用:', stats.workerAvailable)
```

## 🔧 高级用法

### 生成器实例

```typescript
import { QRCodeGenerator } from '@ldesign/qrcode'

const generator = new QRCodeGenerator({
  size: 300,
  format: 'canvas',
  enableCache: true
})

// 生成多个二维码
const result1 = await generator.generate('Text 1')
const result2 = await generator.generate('Text 2')

// 获取性能指标
const metrics = generator.getPerformanceMetrics()
console.log('平均生成时间:', metrics[0]?.duration)

// 清理资源
generator.destroy()
```

### 错误处理

```typescript
try {
  const result = await generateQRCode('')
} catch (error) {
  if (error.code === 'INVALID_DATA') {
    console.log('数据无效')
  } else if (error.code === 'GENERATION_ERROR') {
    console.log('生成失败')
  }
}
```

### Logo添加

```typescript
const result = await generateQRCode('Hello World', {
  size: 300,
  logo: {
    src: 'https://example.com/logo.png',
    size: 0.15, // 15% of QR code size
    shape: 'circle',
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff'
  }
})
```

## 🌐 框架集成

### React

```jsx
import { useEffect, useState } from 'react'
import { generateQRCode } from '@ldesign/qrcode'

function QRCodeComponent({ text }) {
  const [qrElement, setQrElement] = useState(null)

  useEffect(() => {
    generateQRCode(text).then(result => {
      setQrElement(result.element)
    })
  }, [text])

  return (
    <div>
      {qrElement && <div ref={el => el?.appendChild(qrElement)} />}
    </div>
  )
}
```

### Angular

```typescript
import { Component, ElementRef, Input, OnChanges } from '@angular/core'
import { generateQRCode } from '@ldesign/qrcode'

@Component({
  selector: 'app-qrcode',
  template: '<div #qrContainer></div>'
})
export class QRCodeComponent implements OnChanges {
  @Input() text: string = ''
  @ViewChild('qrContainer', { static: true }) container!: ElementRef

  async ngOnChanges() {
    if (this.text) {
      const result = await generateQRCode(this.text)
      this.container.nativeElement.innerHTML = ''
      this.container.nativeElement.appendChild(result.element!)
    }
  }
}
```

## 🎭 在线演示

打开项目中的演示文件体验完整功能：

```bash
# 在项目目录中
open examples/complete-demo/index.html
```

演示包含：
- ✨ 8种预设主题
- 🎯 实时数据验证
- 📊 性能统计
- 🎲 随机主题生成
- 📥 一键下载
- 📋 剪贴板复制

## 💡 最佳实践

### 1. 数据验证优先

```typescript
// 在生成前验证数据
const validation = validator.validate(userInput)
if (!validation.isValid) {
  console.error('验证失败:', validation.errors)
  return
}

// 应用优化建议
const suggestions = validator.getOptimizationSuggestions(userInput)
if (suggestions.length > 0) {
  console.warn('优化建议:', suggestions)
}
```

### 2. 合理使用缓存

```typescript
// 启用缓存提升性能
const generator = new QRCodeGenerator({
  enableCache: true,
  performance: {
    enableCache: true
  }
})

// 定期清理缓存
setInterval(() => {
  generator.clearCache()
}, 1000 * 60 * 30) // 30分钟
```

### 3. 错误边界处理

```typescript
const generateWithFallback = async (text: string) => {
  try {
    return await generateQRCode(text, { format: 'canvas' })
  } catch (error) {
    console.warn('Canvas生成失败，尝试SVG:', error)
    try {
      return await generateQRCode(text, { format: 'svg' })
    } catch (svgError) {
      console.error('所有格式都失败了:', svgError)
      throw new Error('QR码生成完全失败')
    }
  }
}
```

### 4. 批量操作优化

```typescript
// 分批处理大量数据
const processBatch = async (texts: string[], batchSize = 10) => {
  const results = []
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(text => generateQRCode(text))
    )
    results.push(...batchResults)
    
    // 给浏览器喘息时间
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}
```

## 📚 API 文档

详细的API文档请参考：
- [类型定义](./src/types/index.ts)
- [高级类型](./src/types/advanced.ts)
- [核心生成器](./src/core/generator.ts)
- [主题系统](./src/features/themes.ts)
- [验证系统](./src/features/validation.ts)

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解更多信息。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件。

---

## 🎉 快速测试

想要立即测试？运行：

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build

# 查看演示
open examples/complete-demo/index.html
```

需要帮助？[创建Issue](https://github.com/ldesign/qrcode/issues) 或查看 [常见问题](./FAQ.md)。
