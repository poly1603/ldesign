# LDesign Progress 完整API文档

## 📖 目录

- [安装与引入](#安装与引入)
- [LinearProgress 线性进度条](#linearprogress-线性进度条)
- [CircularProgress 圆形进度条](#circularprogress-圆形进度条)
- [SemicircleProgress 半圆形进度条](#semicircleprogress-半圆形进度条)
- [视觉效果 Effects](#视觉效果-effects)
- [文本格式化器 TextFormatters](#文本格式化器-textformatters)
- [TypeScript 类型定义](#typescript-类型定义)
- [最佳实践](#最佳实践)

## 安装与引入

### 安装

```bash
npm install @ldesign/progress
# 或
yarn add @ldesign/progress
# 或
pnpm add @ldesign/progress
```

### 引入

```javascript
// ES6 模块
import { LinearProgress, CircularProgress, SemicircleProgress, TextFormatters } from '@ldesign/progress'

// CommonJS
const { LinearProgress, CircularProgress } = require('@ldesign/progress')

// CDN
<script src="https://unpkg.com/@ldesign/progress/dist/index.umd.js"></script>
```

## LinearProgress 线性进度条

### 基础用法

```javascript
const progress = new LinearProgress({
  container: '#my-progress', // 或 document.getElementById('my-progress')
  value: 50,
  height: 20,
  rounded: true
})
```

### 配置选项

```typescript
interface LinearOptions {
  // 基础配置
  container: string | HTMLElement      // 容器元素，必需
  renderType?: 'svg' | 'canvas'       // 渲染方式，默认 'svg'
  value?: number                       // 当前值，默认 0
  min?: number                         // 最小值，默认 0
  max?: number                         // 最大值，默认 100
  height?: number                      // 高度（像素），默认 12
  progressColor?: string               // 进度条颜色，默认 '#165DFF'
  backgroundColor?: string             // 背景颜色，默认 '#f0f0f0'
  rounded?: boolean                    // 是否圆角，默认 false
  
  // 文本配置
  text?: {
    enabled?: boolean                  // 是否显示文本，默认 true
    format?: (value: number, max: number) => string  // 格式化函数
  }
  
  // 动画配置
  animation?: {
    duration?: number                  // 动画时长（毫秒），默认 300
    easing?: string                    // 缓动函数，默认 'ease-in-out'
  }
  
  // 状态
  status?: 'normal' | 'success' | 'warning' | 'error' | 'loading'
  
  // 分段配置
  segments?: {
    enabled?: boolean                  // 是否启用分段
    count?: number                     // 分段数量，默认 5
    gap?: number                       // 分段间隙，默认 4
  }
  
  // 缓冲区配置
  buffer?: {
    showBuffer?: boolean               // 是否显示缓冲区
    buffer?: number                    // 缓冲区值（0-1）
    bufferColor?: string               // 缓冲区颜色
  }
  
  // 不确定进度
  indeterminate?: boolean              // 是否为不确定进度
  
  // 视觉效果
  effects?: EffectOptions              // 视觉效果配置
}
```

### 方法

```javascript
// 设置值
progress.setValue(75)           // 设置为75
progress.setValue(75, true)     // 带动画设置

// 设置进度（0-1）
progress.setProgress(0.75)      // 设置为75%
progress.setProgress(0.75, true) // 带动画

// 设置缓冲区
progress.setBuffer(0.8)         // 设置缓冲区为80%
```

### 示例

#### 基础进度条
```javascript
const basic = new LinearProgress({
  container: '#basic',
  value: 60,
  height: 20,
  rounded: true,
  text: {
    enabled: true,
    format: TextFormatters.percentage
  }
})
```

#### 带缓冲区的进度条
```javascript
const buffered = new LinearProgress({
  container: '#buffered',
  value: 40,
  buffer: {
    showBuffer: true,
    buffer: 0.6,
    bufferColor: 'rgba(0,0,0,0.1)'
  }
})
```

#### 分段进度条
```javascript
const segmented = new LinearProgress({
  container: '#segmented',
  value: 60,
  segments: {
    enabled: true,
    count: 5,
    gap: 4
  },
  text: {
    format: (value, max) => `${Math.ceil(value/20)}/5 步骤`
  }
})
```

#### 带特效的进度条
```javascript
const fancy = new LinearProgress({
  container: '#fancy',
  value: 70,
  height: 25,
  effects: {
    gradient: {
      enabled: true,
      colors: ['#667eea', '#764ba2']
    },
    stripe: {
      enabled: true,
      animated: true
    },
    glow: {
      enabled: true,
      size: 10,
      animated: true
    }
  }
})
```

## CircularProgress 圆形进度条

### 基础用法

```javascript
const circle = new CircularProgress({
  container: '#my-circle',
  radius: 60,
  strokeWidth: 10,
  value: 75
})
```

### 配置选项

```typescript
interface CircularOptions {
  // 基础配置
  container: string | HTMLElement
  renderType?: 'svg' | 'canvas'
  value?: number
  min?: number
  max?: number
  radius?: number                      // 半径，默认 60
  strokeWidth?: number                 // 线宽，默认 8
  progressColor?: string
  backgroundColor?: string
  
  // 文本配置
  text?: TextOptions
  
  // 动画配置
  animation?: AnimationOptions
  
  // 状态
  status?: StatusType
  
  // 分段配置
  segments?: {
    enabled?: boolean
    count?: number                     // 分段数量
    gap?: number                       // 分段间隙
  }
  
  // 方向配置
  clockwise?: boolean                  // 是否顺时针，默认 true
  startAngle?: number                  // 起始角度，默认 -90
  
  // 多环配置
  multiRing?: {
    enabled?: boolean
    rings?: Array<{
      value: number                    // 环的值
      color?: string                   // 环的颜色
      radius?: number                  // 环的半径
    }>
  }
}
```

### 方法

```javascript
// 设置值
circle.setValue(80, true)

// 设置进度
circle.setProgress(0.8, true)

// 设置状态
circle.setStatus('success')
```

### 示例

#### 基础圆形进度条
```javascript
const circle = new CircularProgress({
  container: '#circle',
  radius: 60,
  strokeWidth: 10,
  value: 75,
  text: {
    enabled: true
  }
})
```

#### 多环进度条
```javascript
const multiRing = new CircularProgress({
  container: '#multi-ring',
  radius: 70,
  strokeWidth: 8,
  value: 85,
  multiRing: {
    enabled: true,
    rings: [
      { value: 90, color: '#00b42a' },
      { value: 75, color: '#ff7d00' },
      { value: 60, color: '#f53f3f' }
    ]
  }
})
```

#### 分段圆形进度条
```javascript
const segmentCircle = new CircularProgress({
  container: '#segment-circle',
  radius: 60,
  value: 70,
  segments: {
    enabled: true,
    count: 12,
    gap: 3
  },
  animation: {
    duration: 600
  }
})
```

#### 仪表盘样式
```javascript
const dashboard = new CircularProgress({
  container: '#dashboard',
  radius: 80,
  strokeWidth: 12,
  value: 120,
  max: 200,
  startAngle: -135,    // 起始角度
  clockwise: true,
  segments: {
    enabled: true,
    count: 20,
    gap: 2
  },
  text: {
    format: (value) => `${value} km/h`
  }
})
```

## SemicircleProgress 半圆形进度条

### 基础用法

```javascript
const semicircle = new SemicircleProgress({
  container: '#semicircle',
  radius: 80,
  direction: 'bottom',
  value: 75
})
```

### 配置选项

```typescript
interface SemicircleOptions {
  container: string | HTMLElement
  radius?: number                      // 半径，默认 80
  strokeWidth?: number                 // 线宽，默认 10
  direction?: 'top' | 'bottom' | 'left' | 'right'  // 方向，默认 'bottom'
  value?: number
  min?: number
  max?: number
  progressColor?: string
  backgroundColor?: string
  text?: TextOptions
  animation?: AnimationOptions
  segments?: SegmentOptions
}
```

### 示例

#### 不同方向的半圆
```javascript
// 顶部半圆
const topSemicircle = new SemicircleProgress({
  container: '#top',
  direction: 'top',
  radius: 60,
  value: 60
})

// 底部半圆
const bottomSemicircle = new SemicircleProgress({
  container: '#bottom',
  direction: 'bottom',
  radius: 60,
  value: 75,
  progressColor: '#00b42a'
})

// 左侧半圆
const leftSemicircle = new SemicircleProgress({
  container: '#left',
  direction: 'left',
  radius: 60,
  value: 80,
  progressColor: '#ff7d00'
})

// 右侧半圆
const rightSemicircle = new SemicircleProgress({
  container: '#right',
  direction: 'right',
  radius: 60,
  value: 65,
  progressColor: '#f53f3f'
})
```

## 视觉效果 Effects

### 效果配置

```typescript
interface EffectOptions {
  // 条纹效果
  stripe?: {
    enabled?: boolean
    width?: number          // 条纹宽度，默认 20
    gap?: number           // 条纹间隙
    angle?: number         // 条纹角度，默认 45
    animated?: boolean     // 是否动画
  }
  
  // 波浪效果
  wave?: {
    enabled?: boolean
    amplitude?: number     // 振幅，默认 5
    frequency?: number     // 频率，默认 2
    animated?: boolean     // 是否流动
  }
  
  // 发光效果
  glow?: {
    enabled?: boolean
    color?: string         // 发光颜色
    size?: number         // 发光大小，默认 10
    animated?: boolean    // 脉冲动画
  }
  
  // 渐变效果
  gradient?: {
    enabled?: boolean
    colors?: string[]     // 渐变颜色数组
    angle?: number        // 渐变角度，默认 90
  }
  
  // 脉冲效果
  pulse?: {
    enabled?: boolean
    duration?: number     // 脉冲周期，默认 1500
    scale?: number        // 缩放比例，默认 1.05
  }
}
```

### 示例

#### 条纹动画
```javascript
const stripe = new LinearProgress({
  container: '#stripe',
  effects: {
    stripe: {
      enabled: true,
      width: 20,
      angle: 45,
      animated: true
    }
  }
})
```

#### 渐变 + 发光
```javascript
const glowing = new LinearProgress({
  container: '#glowing',
  effects: {
    gradient: {
      enabled: true,
      colors: ['#667eea', '#764ba2']
    },
    glow: {
      enabled: true,
      color: '#764ba2',
      size: 15,
      animated: true
    }
  }
})
```

#### 波浪效果
```javascript
const wave = new LinearProgress({
  container: '#wave',
  height: 30,
  effects: {
    wave: {
      enabled: true,
      amplitude: 8,
      frequency: 3,
      animated: true
    }
  }
})
```

## 文本格式化器 TextFormatters

### 内置格式化器

```javascript
import { TextFormatters } from '@ldesign/progress'

// 百分比（默认）
TextFormatters.percentage                         // "75%"

// 带小数的百分比
TextFormatters.percentageDecimal(1)               // "75.5%"
TextFormatters.percentageDecimal(2)               // "75.50%"

// 分数格式
TextFormatters.fraction                           // "75/100"

// 步骤格式
TextFormatters.steps(5)                           // "Step 4 of 5"

// 文件大小
TextFormatters.fileSize                           // "750 MB / 1 GB"

// 时间格式（秒）
TextFormatters.time                               // "1m 30s"

// 剩余时间
TextFormatters.remaining(10)                      // "1:30 remaining"

// 速度
TextFormatters.speed('MB/s')                      // "7.5 MB/s"

// 自定义模板
TextFormatters.custom('{value}/{max} ({percent.1}%)')  // "75/100 (75.0%)"

// 评级（星星）
TextFormatters.rating(5)                          // "★★★★☆"

// 等级
TextFormatters.level(['初级', '中级', '高级', '专家'])  // "高级"

// 温度
TextFormatters.temperature('C')                   // "75°C"

// 货币
TextFormatters.currency('¥', 2)                   // "¥75.00"

// 完成状态描述
TextFormatters.completion                         // "Almost done"

// 表情符号
TextFormatters.emoji                              // "😊"

// 加载提示
TextFormatters.loading([
  '连接中...',
  '验证身份...',
  '加载数据...',
  '渲染界面...',
  '即将完成...'
])                                                // 根据进度显示不同提示

// 无文本
TextFormatters.none                               // ""
```

### 自定义格式化器

```javascript
// 简单自定义
const customFormat = (value, max) => {
  return `已完成 ${value} 项，共 ${max} 项`
}

// 复杂自定义
const advancedFormat = (value, max) => {
  const percent = (value / max) * 100
  
  if (percent < 25) {
    return `🚀 刚刚开始 (${percent.toFixed(1)}%)`
  } else if (percent < 50) {
    return `💪 继续努力 (${percent.toFixed(1)}%)`
  } else if (percent < 75) {
    return `🎯 超过一半了 (${percent.toFixed(1)}%)`
  } else if (percent < 100) {
    return `🏁 即将完成 (${percent.toFixed(1)}%)`
  } else {
    return `🎉 完成！`
  }
}

const progress = new LinearProgress({
  container: '#custom',
  text: {
    enabled: true,
    format: advancedFormat
  }
})
```

## TypeScript 类型定义

```typescript
// 状态类型
type StatusType = 'normal' | 'success' | 'warning' | 'error' | 'loading'

// 文本配置
interface TextOptions {
  enabled?: boolean
  format?: (value: number, max: number) => string
}

// 动画配置
interface AnimationOptions {
  duration?: number
  easing?: string
}

// 缓冲区配置
interface BufferOptions {
  showBuffer?: boolean
  buffer?: number
  bufferColor?: string
}

// 分段配置
interface SegmentOptions {
  enabled?: boolean
  count?: number
  gap?: number
}

// 基础配置
interface BaseOptions {
  container: string | HTMLElement
  renderType?: 'svg' | 'canvas'
  value?: number
  min?: number
  max?: number
  height?: number
  progressColor?: string
  backgroundColor?: string
  rounded?: boolean
  text?: TextOptions
  animation?: AnimationOptions
  status?: StatusType
}
```

## 最佳实践

### 1. 性能优化

```javascript
// 批量更新时关闭动画
progress.setValue(50, false)  // 无动画
progress.setValue(75, false)
progress.setValue(100, true)  // 最后一次启用动画

// 大量进度条时使用 Canvas 渲染
const manyBars = Array.from({ length: 100 }, (_, i) => 
  new LinearProgress({
    container: `#bar-${i}`,
    renderType: 'canvas',  // Canvas 性能更好
    animation: { duration: 200 }  // 缩短动画时间
  })
)
```

### 2. 响应式设计

```javascript
// 容器自适应
const responsive = new LinearProgress({
  container: '#responsive',
  height: window.innerWidth < 768 ? 8 : 20,
  text: {
    enabled: window.innerWidth >= 768
  }
})

// 监听窗口变化
window.addEventListener('resize', () => {
  responsive.updateOptions({
    height: window.innerWidth < 768 ? 8 : 20
  })
})
```

### 3. 实时更新

```javascript
// WebSocket 实时进度
const ws = new WebSocket('ws://localhost:8080')
const realtime = new LinearProgress({
  container: '#realtime',
  text: {
    format: TextFormatters.fileSize
  }
})

ws.onmessage = (event) => {
  const { progress, total } = JSON.parse(event.data)
  realtime.setValue(progress)
}
```

### 4. 错误处理

```javascript
try {
  const progress = new LinearProgress({
    container: '#may-not-exist'
  })
} catch (error) {
  console.error('进度条创建失败:', error)
  // 显示备用UI
}
```

### 5. 内存管理

```javascript
class ProgressManager {
  constructor() {
    this.instances = new Map()
  }
  
  create(id, options) {
    // 清理旧实例
    if (this.instances.has(id)) {
      this.instances.get(id).destroy()
    }
    
    const instance = new LinearProgress(options)
    this.instances.set(id, instance)
    return instance
  }
  
  destroy(id) {
    const instance = this.instances.get(id)
    if (instance) {
      instance.destroy()
      this.instances.delete(id)
    }
  }
  
  destroyAll() {
    this.instances.forEach(instance => instance.destroy())
    this.instances.clear()
  }
}
```

## 常见问题

### Q: 如何实现上传进度？

```javascript
const uploadProgress = new LinearProgress({
  container: '#upload',
  buffer: {
    showBuffer: true,
    buffer: 0
  },
  text: {
    format: TextFormatters.fileSize
  },
  effects: {
    stripe: {
      enabled: true,
      animated: true
    }
  }
})

// 上传函数
async function upload(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const xhr = new XMLHttpRequest()
  
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const progress = e.loaded
      const total = e.total
      
      uploadProgress.setValue(progress)
      uploadProgress.setBuffer((progress + 1024 * 1024) / total)
    }
  }
  
  xhr.open('POST', '/upload')
  xhr.send(formData)
}
```

### Q: 如何创建步骤进度条？

```javascript
const steps = ['填写信息', '确认订单', '支付', '完成']
const currentStep = 2  // 当前在第2步

const stepProgress = new LinearProgress({
  container: '#steps',
  value: currentStep * 25,  // 每步25%
  segments: {
    enabled: true,
    count: 4,
    gap: 10
  },
  text: {
    format: () => steps[currentStep - 1]
  }
})
```

### Q: 如何实现倒计时进度？

```javascript
const countdown = new CircularProgress({
  container: '#countdown',
  value: 60,
  max: 60,
  clockwise: false,  // 逆时针
  text: {
    format: (value) => `${Math.ceil(value)}s`
  }
})

let remaining = 60
const timer = setInterval(() => {
  remaining--
  countdown.setValue(remaining, true)
  
  if (remaining <= 0) {
    clearInterval(timer)
    countdown.setStatus('error')
  }
}, 1000)
```

---

更多示例和详细文档请访问 [GitHub](https://github.com/ldesign/progress)
