# 使用示例

本节提供了 LDesign QR Code 在不同框架中的详细使用示例，帮助您快速上手并掌握各种功能。

## 框架支持

LDesign QR Code 支持多种前端框架，为每个框架提供了原生的集成方式：

### 🟢 原生 JavaScript
- ✅ 简洁的函数式API
- ✅ 批量生成支持
- ✅ 自动资源管理
- ✅ 完整的错误处理

[查看原生JavaScript示例 →](./vanilla.md)

### 🟢 Vue 3
- ✅ 组件和Composition API
- ✅ 响应式数据绑定
- ✅ 自定义Hook支持
- ✅ TypeScript完整支持

[查看Vue示例 →](./vue.md)

### 🟢 React
- ✅ 函数组件和Hook
- ✅ forwardRef支持
- ✅ 错误边界集成
- ✅ 严格模式兼容

[查看React示例 →](./react.md)

### 🟢 Angular
- ✅ 组件和服务
- ✅ 依赖注入支持
- ✅ RxJS集成
- ✅ 自定义指令

[查看Angular示例 →](./angular.md)

## 快速开始

### 安装

::: code-group

```bash [npm]
npm install @ldesign/qrcode
```

```bash [yarn]
yarn add @ldesign/qrcode
```

```bash [pnpm]
pnpm add @ldesign/qrcode
```

:::

### 基础使用

#### 原生JavaScript

```javascript
import { generateQRCode } from '@ldesign/qrcode'

// 生成二维码
const result = await generateQRCode('Hello World', {
  size: 200,
  format: 'canvas'
})

// 添加到页面
document.body.appendChild(result.element)
```

#### Vue

```vue
<template>
  <QRCode text="Hello Vue!" :size="200" />
</template>

<script setup>
import { QRCode } from '@ldesign/qrcode/vue'
</script>
```

#### React

```jsx
import { QRCode } from '@ldesign/qrcode/react'

function App() {
  return <QRCode text="Hello React!" size={200} />
}
```

#### Angular

```typescript
// app.module.ts
import { QRCodeModule } from '@ldesign/qrcode/angular'

@NgModule({
  imports: [QRCodeModule]
})
export class AppModule { }
```

```html
<!-- app.component.html -->
<qr-code text="Hello Angular!" [size]="200"></qr-code>
```

## 功能特性

### 🎨 样式定制

```javascript
// 渐变色彩
const result = await generateQRCode('Gradient QR', {
  size: 300,
  color: {
    foreground: {
      type: 'linear',
      direction: 45,
      colors: [
        { offset: 0, color: '#ff0000' },
        { offset: 1, color: '#0000ff' }
      ]
    }
  }
})
```

### 🖼️ Logo嵌入

```javascript
// 添加Logo
const result = await generateQRCode('Logo QR', {
  size: 300,
  logo: {
    src: 'logo.png',
    size: 60,
    shape: 'circle',
    borderWidth: 2,
    borderColor: '#ffffff'
  }
})
```

### 📱 响应式设计

```javascript
// 自适应尺寸
function generateResponsiveQR(container) {
  const size = Math.min(container.offsetWidth - 40, 400)
  
  return generateQRCode('Responsive QR', {
    size: size,
    format: 'svg',  // SVG更适合响应式
    container: container
  })
}
```

### ⚡ 批量处理

```javascript
// 批量生成
const texts = ['URL 1', 'URL 2', 'URL 3']
const results = await generateQRCodeBatch(texts, {
  size: 200,
  format: 'svg'
})
```

### 💾 下载功能

```javascript
// 下载二维码
const result = await generateQRCode('Download QR', {
  size: 400,
  format: 'canvas'
})

await downloadQRCode(result, 'my-qrcode')
```

## 高级用法

### 🔧 自定义生成器

```javascript
import { SimpleQRCodeGenerator } from '@ldesign/qrcode'

const generator = new SimpleQRCodeGenerator({
  size: 200,
  format: 'canvas',
  performance: {
    enableCache: true,
    cacheSize: 50
  }
})

// 生成多个二维码
const result1 = await generator.generate('Text 1')
const result2 = await generator.generate('Text 2')

// 清理资源
generator.destroy()
```

### 📊 性能监控

```javascript
import { PerformanceMonitor } from '@ldesign/qrcode'

const monitor = new PerformanceMonitor()
const id = monitor.start('qr-generation')

const result = await generateQRCode('Performance Test', {
  size: 500
})

const metric = monitor.end(id)
console.log(`生成耗时: ${metric.duration}ms`)
```

### 🌐 跨框架兼容

```javascript
import { 
  detectFramework, 
  generateQRCodeAuto,
  getFrameworkBestPractices 
} from '@ldesign/qrcode'

// 自动检测框架
const detection = detectFramework()
console.log('当前框架:', detection.framework)

// 获取最佳实践配置
const config = getFrameworkBestPractices(detection.framework)

// 自动适配生成
const result = await generateQRCodeAuto('Auto QR', {
  ...config,
  autoDetect: true
})
```

## 错误处理

### 基础错误处理

```javascript
try {
  const result = await generateQRCode('', {  // 空文本会报错
    size: 200
  })
} catch (error) {
  console.error('生成失败:', error.message)
  console.error('错误代码:', error.code)
  
  // 根据错误类型处理
  switch (error.code) {
    case 'INVALID_TEXT':
      // 处理无效文本
      break
    case 'INVALID_OPTIONS':
      // 处理无效选项
      break
    default:
      // 处理其他错误
  }
}
```

### 框架特定错误处理

每个框架都有其特定的错误处理方式，详见各框架的示例页面：

- [Vue错误处理](./vue.md#错误处理)
- [React错误处理](./react.md#错误处理)
- [Angular错误处理](./angular.md#错误处理)

## 最佳实践

### 性能优化

1. **启用缓存** - 避免重复生成相同内容
2. **选择合适格式** - 根据使用场景选择最优格式
3. **批量处理** - 使用并行生成提高效率
4. **及时清理** - 释放不需要的资源

### 用户体验

1. **加载状态** - 显示生成进度
2. **错误提示** - 友好的错误信息
3. **响应式设计** - 适配不同屏幕尺寸
4. **可访问性** - 提供替代文本和键盘导航

### 安全性

1. **输入验证** - 验证文本内容和选项
2. **内容过滤** - 防止恶意内容
3. **隐私保护** - 避免敏感信息泄露

更多最佳实践请参考 [最佳实践指南](../best-practices.md)。

## 下一步

- 📖 阅读 [API参考文档](../api/) 了解详细的API说明
- 🎯 查看 [最佳实践](../best-practices.md) 学习优化技巧
- 🚀 探索 [高级功能](../guide/advanced-features.md) 发现更多可能性
- 💬 加入 [社区讨论](https://github.com/ldesign/qrcode/discussions) 获取帮助
