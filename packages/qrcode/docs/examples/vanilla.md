# 原生JavaScript使用示例

## 基础使用

### 快速开始

```html
<!DOCTYPE html>
<html>
<head>
  <title>QR Code Example</title>
</head>
<body>
  <div id="qrcode-container"></div>
  
  <script type="module">
    import { generateQRCode } from '@ldesign/qrcode'
    
    // 最简单的使用
    const result = await generateQRCode('Hello World', {
      container: '#qrcode-container'
    })
    
    console.log('QR Code generated:', result)
  </script>
</body>
</html>
```

### 基础配置

```javascript
import { generateQRCode } from '@ldesign/qrcode'

// 带基础配置的生成
const result = await generateQRCode('https://example.com', {
  size: 300,
  format: 'svg',
  margin: 8,
  errorCorrectionLevel: 'H',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff'
})

// 手动添加到页面
document.body.appendChild(result.element)
```

### 使用SimpleQRCodeGenerator类

```javascript
import { SimpleQRCodeGenerator } from '@ldesign/qrcode'

// 创建生成器实例
const generator = new SimpleQRCodeGenerator({
  size: 200,
  format: 'canvas',
  foregroundColor: '#2563eb',
  backgroundColor: '#f8fafc'
})

// 生成多个二维码
const result1 = await generator.generate('Text 1')
const result2 = await generator.generate('Text 2')

// 更新配置
generator.updateOptions({
  size: 300,
  foregroundColor: '#dc2626'
})

const result3 = await generator.generate('Text 3')

// 清理资源
generator.destroy()
```

## 高级功能

### 添加Logo

```javascript
import { generateQRCode } from '@ldesign/qrcode'

const result = await generateQRCode('https://example.com', {
  size: 300,
  format: 'canvas',
  logo: {
    src: 'logo.png',
    size: 60,
    margin: 8,
    shape: 'circle',
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff'
  }
})
```

### 渐变色彩

```javascript
import { generateQRCode } from '@ldesign/qrcode'

// 线性渐变
const linearResult = await generateQRCode('Linear Gradient', {
  size: 300,
  foregroundColor: {
    type: 'linear',
    direction: 45,
    colors: [
      { offset: 0, color: '#ff0000' },
      { offset: 0.5, color: '#00ff00' },
      { offset: 1, color: '#0000ff' }
    ]
  }
})

// 径向渐变
const radialResult = await generateQRCode('Radial Gradient', {
  size: 300,
  foregroundColor: {
    type: 'radial',
    center: [0.5, 0.5],
    radius: 0.8,
    colors: [
      { offset: 0, color: '#fbbf24' },
      { offset: 1, color: '#f59e0b' }
    ]
  }
})
```

### 自定义样式

```javascript
import { generateQRCode } from '@ldesign/qrcode'

const result = await generateQRCode('Styled QR Code', {
  size: 300,
  format: 'svg',
  style: {
    dotStyle: 'rounded',
    cornerStyle: 'circle',
    borderRadius: 4,
    padding: 10
  },
  foregroundColor: '#1f2937',
  backgroundColor: '#f9fafb'
})
```

### 批量生成

```javascript
import { generateQRCodeBatch } from '@ldesign/qrcode'

const texts = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3'
]

const results = await generateQRCodeBatch(texts, {
  size: 200,
  format: 'svg',
  foregroundColor: '#059669'
})

// 添加到页面
results.forEach((result, index) => {
  const container = document.createElement('div')
  container.className = 'qrcode-item'
  container.appendChild(result.element)
  document.body.appendChild(container)
})
```

### 下载功能

```javascript
import { generateQRCode, downloadQRCode } from '@ldesign/qrcode'

// 生成二维码
const result = await generateQRCode('Download Example', {
  size: 400,
  format: 'canvas'
})

// 创建下载按钮
const downloadBtn = document.createElement('button')
downloadBtn.textContent = '下载二维码'
downloadBtn.onclick = async () => {
  await downloadQRCode(result, 'my-qrcode')
}

document.body.appendChild(result.element)
document.body.appendChild(downloadBtn)
```

## 错误处理

### 基础错误处理

```javascript
import { generateQRCode } from '@ldesign/qrcode'

try {
  const result = await generateQRCode('', {  // 空文本会报错
    size: 200
  })
} catch (error) {
  console.error('生成失败:', error.message)
  console.error('错误代码:', error.code)
}
```

### 使用回调处理错误

```javascript
import { generateQRCode } from '@ldesign/qrcode'

const result = await generateQRCode('Hello World', {
  size: 200,
  container: '#qrcode-container',
  onGenerated: (result) => {
    console.log('生成成功:', result)
    // 显示成功消息
  },
  onError: (error) => {
    console.error('生成失败:', error)
    // 显示错误消息
  }
})
```

## 性能优化

### 缓存管理

```javascript
import { SimpleQRCodeGenerator } from '@ldesign/qrcode'

const generator = new SimpleQRCodeGenerator({
  size: 200,
  performance: {
    enableCache: true,
    cacheSize: 50  // 缓存50个结果
  }
})

// 第一次生成（会缓存）
const result1 = await generator.generate('Cached Text')

// 第二次生成相同内容（从缓存读取）
const result2 = await generator.generate('Cached Text')

// 清除缓存
generator.clearCache()

// 获取性能指标
const metrics = generator.getMetrics()
console.log('性能指标:', metrics)
```

### 性能监控

```javascript
import { PerformanceMonitor } from '@ldesign/qrcode'

const monitor = new PerformanceMonitor()

// 开始监控
const operationId = monitor.start('qrcode-generation')

// 执行生成操作
const result = await generateQRCode('Performance Test', {
  size: 500,
  format: 'canvas'
})

// 结束监控
const metric = monitor.end(operationId)

console.log(`生成耗时: ${metric.duration}ms`)
console.log(`内存使用: ${metric.memory}MB`)
```

## 响应式设计

### 自适应尺寸

```javascript
import { generateQRCode } from '@ldesign/qrcode'

function generateResponsiveQRCode(text, container) {
  const containerWidth = container.offsetWidth
  const size = Math.min(containerWidth - 40, 400)  // 最大400px，留40px边距
  
  return generateQRCode(text, {
    size: size,
    format: 'svg',  // SVG更适合响应式
    container: container,
    className: 'responsive-qrcode'
  })
}

// 使用
const container = document.getElementById('qrcode-container')
await generateResponsiveQRCode('Responsive QR Code', container)

// 监听窗口大小变化
window.addEventListener('resize', async () => {
  container.innerHTML = ''  // 清空容器
  await generateResponsiveQRCode('Responsive QR Code', container)
})
```

### CSS样式

```css
.responsive-qrcode {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.qrcode-item {
  display: inline-block;
  margin: 10px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .qrcode-item {
    display: block;
    margin: 10px 0;
  }
}
```

## 与其他库集成

### 与Chart.js集成

```javascript
import { generateQRCode } from '@ldesign/qrcode'
import Chart from 'chart.js/auto'

// 创建图表
const chart = new Chart(ctx, {
  type: 'bar',
  data: chartData
})

// 生成包含图表数据的二维码
const chartDataUrl = chart.toBase64Image()
const qrResult = await generateQRCode(chartDataUrl, {
  size: 200,
  errorCorrectionLevel: 'H'  // 高纠错级别，因为数据较长
})
```

### 与表单集成

```javascript
import { generateQRCode } from '@ldesign/qrcode'

const form = document.getElementById('qr-form')
const preview = document.getElementById('qr-preview')

form.addEventListener('input', async (e) => {
  const formData = new FormData(form)
  const text = formData.get('text')
  const size = parseInt(formData.get('size'))
  const color = formData.get('color')
  
  if (text) {
    try {
      preview.innerHTML = ''  // 清空预览
      
      const result = await generateQRCode(text, {
        size: size,
        foregroundColor: color,
        container: preview
      })
    } catch (error) {
      preview.innerHTML = `<p>错误: ${error.message}</p>`
    }
  }
})
```
