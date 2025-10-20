# 快速开始

## 5分钟快速上手

### 1. 安装

选择你需要的包：

```bash
# 原生 JavaScript
npm install @ldesign/progress-core

# Vue 3
npm install @ldesign/progress-vue

# React
npm install @ldesign/progress-react

# Lit / Web Components
npm install @ldesign/progress-lit
```

### 2. 基础使用

#### 原生 JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@ldesign/progress-core/dist/index.css">
</head>
<body>
  <div id="progress"></div>

  <script type="module">
    import { LinearProgress } from '@ldesign/progress-core';
    
    const progress = new LinearProgress('#progress', {
      value: 0,
      color: '#409eff',
    });

    // 模拟进度
    let current = 0;
    const timer = setInterval(() => {
      current += 10;
      progress.setValue(current);
      if (current >= 100) clearInterval(timer);
    }, 500);
  </script>
</body>
</html>
```

#### Vue 3

```vue
<template>
  <div>
    <LdLinearProgress :value="progress" />
    <button @click="start">开始</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { LinearProgress as LdLinearProgress } from '@ldesign/progress-vue';
import '@ldesign/progress-core/dist/index.css';

const progress = ref(0);

const start = () => {
  const timer = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 100) {
      clearInterval(timer);
    }
  }, 500);
};
</script>
```

#### React

```tsx
import React, { useState } from 'react';
import { LinearProgress } from '@ldesign/progress-react';
import '@ldesign/progress-core/dist/index.css';

function App() {
  const [progress, setProgress] = useState(0);

  const start = () => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + 10;
        if (next >= 100) clearInterval(timer);
        return next;
      });
    }, 500);
  };

  return (
    <div>
      <LinearProgress value={progress} />
      <button onClick={start}>开始</button>
    </div>
  );
}
```

### 3. 更多示例

#### 圆形进度条

```javascript
import { CircleProgress } from '@ldesign/progress-core';

const circle = new CircleProgress('#circle', {
  value: 75,
  radius: 60,
  strokeWidth: 8,
  color: ['#ff6b6b', '#feca57'],
});
```

#### 步骤进度

```javascript
import { StepProgress } from '@ldesign/progress-core';

const step = new StepProgress('#steps', {
  currentStep: 1,
  steps: [
    { title: '步骤 1', status: 'completed' },
    { title: '步骤 2', status: 'active' },
    { title: '步骤 3', status: 'pending' },
  ],
});
```

#### 仪表盘

```javascript
import { DashboardProgress } from '@ldesign/progress-core';

const dashboard = new DashboardProgress('#dashboard', {
  value: 65,
  showPointer: true,
  colorRanges: [
    { min: 0, max: 30, color: '#67c23a' },
    { min: 30, max: 70, color: '#e6a23c' },
    { min: 70, max: 100, color: '#f56c6c' },
  ],
});
```

#### 水波纹

```javascript
import { WaveProgress } from '@ldesign/progress-core';

const wave = new WaveProgress('#wave', {
  value: 60,
  width: 200,
  height: 200,
  color: '#409eff',
});
```

### 4. 主题切换

```javascript
// 使用内置主题
const progress = new LinearProgress('#progress', {
  theme: 'success', // default, dark, primary, success, warning, error, info
});

// 注册自定义主题
import { themeManager } from '@ldesign/progress-core';

themeManager.register({
  name: 'custom',
  colors: {
    primary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    track: '#e5e7eb',
    text: '#1f2937',
  },
  sizes: {
    small: 4,
    medium: 6,
    large: 8,
  },
});

// 使用自定义主题
const customProgress = new LinearProgress('#progress', {
  theme: 'custom',
});
```

### 5. 事件处理

```javascript
const progress = new LinearProgress('#progress', {
  value: 0,
  onChange: (value) => {
    console.log('进度:', value);
  },
  onComplete: () => {
    console.log('完成！');
  },
});

// 或使用事件监听
progress.on('change', (value) => {
  console.log('值变化:', value);
});
```

### 6. 常用配置

```javascript
const progress = new LinearProgress('#progress', {
  // 基础配置
  value: 50,              // 当前值
  min: 0,                 // 最小值
  max: 100,               // 最大值
  
  // 样式配置
  color: '#409eff',       // 单色
  // color: ['#409eff', '#67c23a'], // 渐变色
  trackColor: '#e4e7ed',  // 轨道颜色
  strokeWidth: 6,         // 线条宽度
  
  // 显示配置
  showText: true,         // 显示文本
  textInside: false,      // 文本内部显示
  format: (value) => `${value}%`, // 格式化函数
  
  // 动画配置
  animated: true,         // 启用动画
  duration: 300,          // 动画时长
  easing: 'easeOutQuad',  // 缓动函数
  
  // 特殊样式
  striped: true,          // 条纹样式
  active: true,           // 激活动画
  indeterminate: false,   // 不确定状态
});
```

### 7. API 方法

```javascript
// 设置值
progress.setValue(80);

// 增加/减少
progress.increment(10);
progress.decrement(5);

// 获取值
const value = progress.getValue();
const percentage = progress.getPercentage();

// 重置
progress.reset();

// 更新配置
progress.updateOptions({ color: '#67c23a' });

// 销毁
progress.destroy();
```

## 下一步

- 查看 [完整文档](./README.md)
- 查看 [API 参考](./docs/API.md)
- 查看 [使用指南](./docs/GUIDE.md)
- 查看 [示例代码](./examples/)

## 获取帮助

如有问题，请查看文档或提交 issue。


