# React 示例 - @ldesign/chart v1.2.0

Demonstrates @ldesign/chart usage and optimization features in React.

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Then open your browser to `http://localhost:5173`

## ✨ Example Features

### Basic Charts
- ✅ Line Chart (with cache)
- ✅ Bar Chart (high priority)
- ✅ Pie Chart
- ✅ Multi-Series Line Chart
- ✅ Scatter Chart
- ✅ Radar Chart

### Optimization Features
- 🚀 **Large Data Chart** - 50,000 data points
  - Virtual rendering enabled
  - Web Worker enabled
  - Cache enabled
  - High priority (9)
  
- 📊 **Performance Statistics Panel**
  - Cache hit rate
  - Active instances
  - Memory usage
  - Memory pressure level

### Interactive Features
- 🌙/🌞 Dark/Light mode toggle
- 🔼🔽 Font size adjustment
- 🔄 Data refresh
- 📊 View performance stats
- 🚀 Generate large dataset

## 📖 Key Learnings

### 1. Basic Usage

```tsx
import { Chart } from '@ldesign/chart/react'

function App() {
  return <Chart type="line" data={[1, 2, 3, 4, 5]} />
}
```

### 2. Enable Optimizations

```tsx
<Chart 
  type="line" 
  data={largeData}
  virtual     // Virtual rendering
  worker      // Web Worker
  cache       // Cache
  priority={8}  // Priority
/>
```

### 3. Performance Monitoring

```typescript
import { chartCache, instanceManager } from '@ldesign/chart'

// View statistics
console.log(chartCache.stats())
console.log(instanceManager.stats())
```

## 🎯 Performance Tips

1. **Enable cache** - For static data scenarios
2. **Use virtual rendering** - When data points > 10,000
3. **Use Worker** - When data points > 50,000
4. **Set priority** - Set high priority for important charts
5. **Monitor performance** - Check stats regularly

## 📚 Related Documentation

- [Performance Guide](../../docs/performance-guide.md)
- [Best Practices](../../docs/best-practices.md)
- [API Reference](../../docs/api-reference.md)

---

**Version**: v1.2.0  
**Framework**: React 18+  
**Performance**: 40-70% improvement

