# 标签宽度计算优化

## 🎯 问题描述

原来的标签宽度计算使用估算方式（中文字符 14px，英文字符 8px），这种方式不够准确，经常导致计算出的宽
度偏大，影响表单布局的美观性。

## ❌ 原来的计算方式

```typescript
// 更精确的宽度计算：中文字符14px，英文字符8px，加上padding
const chineseChars = (labelText.match(/[\u4e00-\u9fa5]/g) || []).length
const englishChars = labelText.length - chineseChars
const estimatedWidth = chineseChars * 14 + englishChars * 8 + 24 // 24px padding
maxWidth = Math.max(maxWidth, estimatedWidth)

labelWidths[col] = Math.max(80, Math.min(200, maxWidth))
```

**问题**：

- 字符宽度估算不准确
- 不同字体、字重下宽度差异很大
- 计算结果经常偏大
- 没有考虑实际渲染字体

## ✅ 新的计算方式

### 1. 使用 Canvas 精确测量

```typescript
// 文本宽度测量缓存
const textWidthCache = new Map<string, number>()

// 使用Canvas精确测量文本宽度
const measureTextWidth = (
  text: string,
  font: string = '500 0.9rem -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
): number => {
  if (typeof window === 'undefined') return text.length * 10 // SSR fallback

  // 检查缓存
  const cacheKey = `${text}|${font}`
  if (textWidthCache.has(cacheKey)) {
    return textWidthCache.get(cacheKey)!
  }

  // 创建canvas元素来测量文本宽度
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return text.length * 10

  context.font = font
  const metrics = context.measureText(text)
  const width = Math.ceil(metrics.width)

  // 缓存结果
  textWidthCache.set(cacheKey, width)
  return width
}
```

### 2. 优化的宽度计算

```typescript
fieldsInColumn.forEach(field => {
  const labelText = field.label || ''
  if (labelText) {
    // 使用Canvas精确测量文本宽度
    const textWidth = measureTextWidth(labelText)
    // 加上必要的空间：必填星号(8px) + 一些余量(16px)
    const totalWidth = textWidth + 24 // 24px = 8px星号 + 16px余量
    maxWidth = Math.max(maxWidth, totalWidth)
  }
})

// 设置合理的最小和最大宽度范围，避免过大
labelWidths[col] = Math.max(50, Math.min(150, maxWidth))
```

## 🔧 技术优势

### 1. 精确测量

- **Canvas API**：使用浏览器原生的文本测量 API
- **真实字体**：使用与实际渲染相同的字体样式
- **像素级精度**：获得准确的像素宽度

### 2. 性能优化

- **缓存机制**：避免重复计算相同文本
- **懒加载**：只在需要时进行计算
- **SSR 兼容**：服务端渲染时使用 fallback

### 3. 合理范围

- **最小宽度**：50px（避免过窄）
- **最大宽度**：150px（避免过宽）
- **精简 padding**：只加必要的 24px 余量

## 📊 计算对比

### 示例文本："用户信息"

#### 原来的估算方式

```
中文字符：4个 × 14px = 56px
英文字符：0个 × 8px = 0px
Padding：24px
总计：80px（最小值限制）
```

#### 新的 Canvas 测量

```
Canvas测量："用户信息" = ~52px
必填星号：8px
余量：16px
总计：76px
```

### 示例文本："Email Address"

#### 原来的估算方式

```
中文字符：0个 × 14px = 0px
英文字符：13个 × 8px = 104px
Padding：24px
总计：128px
```

#### 新的 Canvas 测量

```
Canvas测量："Email Address" = ~89px
必填星号：8px
余量：16px
总计：113px
```

## 🚀 测试效果

1. **访问演示**：http://localhost:3000
2. **设置标签位置**：左侧
3. **启用自动计算宽度**：观察标签宽度更加紧凑合理
4. **对比不同文本**：短文本和长文本都有合适的宽度

## 📈 预期改进

- ✅ **更准确**：基于真实渲染的精确测量
- ✅ **更紧凑**：避免不必要的空白空间
- ✅ **更美观**：标签宽度与内容更匹配
- ✅ **更高效**：缓存机制避免重复计算
- ✅ **更稳定**：在不同浏览器和字体下表现一致

这个优化让标签宽度计算更加精确和合理，提升了整体的视觉效果！
