# 使用指南

## 目录

- [安装](#安装)
- [基础使用](#基础使用)
- [进阶功能](#进阶功能)
- [最佳实践](#最佳实践)
- [性能优化](#性能优化)

## 安装

### 选择合适的包

根据你的项目框架选择相应的包：

- **原生 JavaScript / TypeScript**: `@ldesign/progress-core`
- **Vue 3**: `@ldesign/progress-vue`
- **React**: `@ldesign/progress-react`
- **Web Components / 任意框架**: `@ldesign/progress-lit`

### 安装

```bash
# 使用 npm
npm install @ldesign/progress-core

# 使用 yarn
yarn add @ldesign/progress-core

# 使用 pnpm
pnpm add @ldesign/progress-core
```

### 引入样式

所有框架都需要引入核心样式：

```javascript
import '@ldesign/progress-core/dist/index.css';
```

## 基础使用

### 创建进度条

#### 原生 JavaScript

```javascript
import { LinearProgress } from '@ldesign/progress-core';

const progress = new LinearProgress('#container', {
  value: 50,
  showText: true,
});
```

#### Vue 3

```vue
<template>
  <LdLinearProgress :value="50" :show-text="true" />
</template>

<script setup>
import { LinearProgress as LdLinearProgress } from '@ldesign/progress-vue';
</script>
```

#### React

```tsx
import { LinearProgress } from '@ldesign/progress-react';

function App() {
  return <LinearProgress value={50} showText={true} />;
}
```

### 更新进度

#### 原生 JavaScript

```javascript
// 设置值
progress.setValue(80);

// 增加值
progress.increment(10);

// 减少值
progress.decrement(5);
```

#### Vue 3

```vue
<template>
  <LdLinearProgress :value="value" />
  <button @click="value += 10">+10</button>
</template>

<script setup>
import { ref } from 'vue';
const value = ref(50);
</script>
```

#### React

```tsx
const [value, setValue] = useState(50);

return (
  <>
    <LinearProgress value={value} />
    <button onClick={() => setValue(value + 10)}>+10</button>
  </>
);
```

## 进阶功能

### 渐变色

使用数组定义多色渐变：

```javascript
const progress = new LinearProgress('#container', {
  value: 60,
  color: ['#409eff', '#67c23a', '#e6a23c'],
});
```

### 缓冲进度

适合视频播放、文件下载等场景：

```javascript
const progress = new LinearProgress('#container', {
  value: 40,      // 当前进度
  buffer: 80,     // 缓冲进度
});

// 更新缓冲
progress.setBuffer(90);
```

### 自定义格式化

```javascript
const progress = new CircleProgress('#container', {
  value: 75,
  format: (percentage) => {
    if (percentage === 100) return '完成';
    if (percentage === 0) return '开始';
    return `${percentage.toFixed(1)}%`;
  },
});
```

### 事件处理

```javascript
const progress = new LinearProgress('#container', {
  value: 0,
  onChange: (value) => {
    console.log('进度变化:', value);
  },
  onComplete: () => {
    console.log('已完成!');
    // 可以触发其他操作
  },
  onStart: () => {
    console.log('开始!');
  },
});

// 或使用事件监听
progress.on('change', (value) => {
  console.log('值变化:', value);
});
```

### 动画控制

```javascript
const progress = new LinearProgress('#container', {
  value: 0,
  animated: true,
  duration: 1000,      // 1秒
  easing: 'easeInOutQuad',
});

// 禁用动画更新
progress.setValue(100, false);

// 使用自定义缓动函数
const customProgress = new LinearProgress('#container2', {
  easing: (t) => t * t * t, // 自定义三次方缓动
});
```

### 主题切换

```javascript
import { themeManager } from '@ldesign/progress-core';

const progress = new LinearProgress('#container', {
  theme: 'primary',
});

// 动态切换主题
setTimeout(() => {
  progress.updateOptions({ theme: 'success' });
}, 2000);

// 注册自定义主题
themeManager.register({
  name: 'night',
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2',
    track: '#262626',
    text: '#ffffff',
  },
  sizes: {
    small: 3,
    medium: 5,
    large: 7,
  },
});
```

## 最佳实践

### 1. 选择合适的进度条类型

- **文件上传/下载**: `LinearProgress` 带缓冲
- **任务完成度**: `CircleProgress` 或 `LinearProgress`
- **多步骤流程**: `StepProgress`
- **性能指标**: `DashboardProgress`
- **多任务进度**: `SegmentProgress`
- **创意展示**: `WaveProgress`

### 2. 合理使用动画

```javascript
// 频繁更新时禁用动画
const progress = new LinearProgress('#container', {
  animated: false, // 快速更新时禁用
});

// 大幅度变化时启用动画
progress.setValue(80, true);

// 小幅度变化时禁用动画
progress.increment(1, false);
```

### 3. 内存管理

```javascript
// 组件销毁时清理
class MyComponent {
  constructor() {
    this.progress = new LinearProgress('#container', { value: 0 });
  }

  destroy() {
    // 重要：销毁实例避免内存泄漏
    this.progress.destroy();
  }
}
```

### 4. 响应式设计

```javascript
// 使用百分比宽度
const progress = new LinearProgress('#container', {
  width: '100%',
  strokeWidth: 6,
});

// 或使用 CSS
```

```css
.progress-container {
  width: 100%;
  max-width: 600px;
}
```

### 5. 错误处理

```javascript
try {
  const progress = new LinearProgress('#not-exist', { value: 50 });
} catch (error) {
  console.error('容器不存在:', error);
  // 显示备用 UI
}

// 验证值范围
const safeValue = Math.max(0, Math.min(100, inputValue));
progress.setValue(safeValue);
```

## 性能优化

### 1. 批量更新

```javascript
// 不推荐：频繁单独更新
for (let i = 0; i <= 100; i++) {
  progress.setValue(i);
}

// 推荐：使用动画一次性更新
progress.setValue(100, true);
```

### 2. 节流更新

```javascript
import { throttle } from '@ldesign/progress-core';

const updateProgress = throttle((value) => {
  progress.setValue(value);
}, 100); // 每100ms最多更新一次

// 使用节流函数
window.addEventListener('scroll', () => {
  const scrollPercentage = /* 计算滚动百分比 */;
  updateProgress(scrollPercentage);
});
```

### 3. 懒加载

```javascript
// 仅在需要时创建
let progress = null;

function showProgress() {
  if (!progress) {
    progress = new LinearProgress('#container', { value: 0 });
  }
  progress.setValue(50);
}
```

### 4. 选择合适的渲染模式

```javascript
// Canvas 适合复杂动画
const waveProgress = new WaveProgress('#container', {
  renderMode: 'canvas', // 更好的性能
  value: 60,
});

// SVG 适合简单场景和更好的缩放
const simpleWave = new WaveProgress('#container2', {
  renderMode: 'svg', // 更好的清晰度
  value: 60,
});
```

### 5. 避免不必要的重渲染

#### Vue

```vue
<template>
  <!-- 使用 v-once 对于静态配置 -->
  <LdLinearProgress
    v-once
    :value="value"
    :color="staticColor"
  />
</template>
```

#### React

```tsx
// 使用 React.memo 避免不必要的重渲染
const MemoizedProgress = React.memo(LinearProgress);

// 或使用 useMemo
const progressConfig = useMemo(() => ({
  color: ['#409eff', '#67c23a'],
  strokeWidth: 8,
}), []); // 空依赖数组，配置不变
```

### 6. 监控性能

```javascript
const progress = new LinearProgress('#container', {
  value: 0,
  onUpdate: (value) => {
    // 记录帧率
    if (window.performance) {
      console.log('当前值:', value);
    }
  },
});

// 使用 Performance API
performance.mark('progress-start');
progress.setValue(100);
setTimeout(() => {
  performance.mark('progress-end');
  performance.measure('progress-animation', 'progress-start', 'progress-end');
  const measure = performance.getEntriesByName('progress-animation')[0];
  console.log('动画耗时:', measure.duration, 'ms');
}, 1000);
```

## 常见问题

### Q: 如何实现循环/无限进度？

```javascript
const progress = new LinearProgress('#container', {
  indeterminate: true, // 不确定状态，自动循环
});
```

### Q: 如何同步多个进度条？

```javascript
const progresses = [
  new LinearProgress('#p1', { value: 0 }),
  new CircleProgress('#p2', { value: 0 }),
  new WaveProgress('#p3', { value: 0 }),
];

function updateAll(value) {
  progresses.forEach(p => p.setValue(value));
}

updateAll(75);
```

### Q: 如何实现倒计时效果？

```javascript
const progress = new CircleProgress('#container', {
  value: 100,
  format: (percentage) => {
    const seconds = Math.ceil((percentage / 100) * 60);
    return `${seconds}s`;
  },
});

let currentValue = 100;
const timer = setInterval(() => {
  currentValue -= 100 / 60; // 60秒倒计时
  progress.setValue(currentValue);
  
  if (currentValue <= 0) {
    clearInterval(timer);
  }
}, 1000);
```

### Q: 如何处理大数值？

```javascript
const progress = new LinearProgress('#container', {
  min: 0,
  max: 10000,  // 大范围值
  value: 5000,
  format: (percentage) => {
    const actual = (percentage / 100) * 10000;
    return `${actual.toFixed(0)} / 10000`;
  },
});
```


