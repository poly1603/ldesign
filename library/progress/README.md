# @ldesign/progress

功能全面、性能优越的进度条插件库，支持多种进度条类型和框架。

## ✨ 特性

- 🎨 **丰富的进度条类型**：14 种进度条类型，覆盖所有使用场景 ⭐
- 🎯 **框架无关**：核心库不依赖任何框架
- 🔧 **框架封装**：提供 Vue 3、React、Lit Web Components 封装
- 🎭 **主题系统**：内置多种主题，支持自定义主题
- 🌈 **渐变色支持**：支持线性渐变和多色渐变
- 💫 **动画效果**：平滑的动画过渡，多种缓动函数
- ⚡ **高性能**：使用 requestAnimationFrame 优化动画
- 📦 **TypeScript**：完整的类型定义
- 🎪 **配置灵活**：丰富的配置选项
- 🎁 **创新样式**：图片填充、自定义形状、心形、电池等创意进度条 ⭐

## 📦 安装

### NPM

```bash
# 核心库（框架无关）
npm install @ldesign/progress-core

# Vue 3 封装
npm install @ldesign/progress-vue

# React 封装
npm install @ldesign/progress-react

# Lit Web Components 封装
npm install @ldesign/progress-lit
```

### PNPM

```bash
pnpm add @ldesign/progress-core
pnpm add @ldesign/progress-vue
pnpm add @ldesign/progress-react
pnpm add @ldesign/progress-lit
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import { LinearProgress } from '@ldesign/progress-core';
import '@ldesign/progress-core/dist/index.css';

const progress = new LinearProgress('#container', {
  value: 50,
  color: '#409eff',
  showText: true,
  animated: true,
});

// 更新进度
progress.setValue(80);
```

### Vue 3

```vue
<template>
  <div>
    <LdLinearProgress
      :value="value"
      :color="['#409eff', '#67c23a']"
      :show-text="true"
      @change="handleChange"
      @complete="handleComplete"
    />
    
    <LdCircleProgress
      :value="value"
      :radius="60"
      :stroke-width="8"
      theme="success"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { LinearProgress as LdLinearProgress, CircleProgress as LdCircleProgress } from '@ldesign/progress-vue';
import '@ldesign/progress-core/dist/index.css';

const value = ref(50);

const handleChange = (newValue) => {
  console.log('Progress changed:', newValue);
};

const handleComplete = () => {
  console.log('Progress completed!');
};
</script>
```

### React

```tsx
import React, { useState } from 'react';
import { LinearProgress, CircleProgress } from '@ldesign/progress-react';
import '@ldesign/progress-core/dist/index.css';

function App() {
  const [value, setValue] = useState(50);

  return (
    <div>
      <LinearProgress
        value={value}
        color={['#409eff', '#67c23a']}
        showText={true}
        onChange={(newValue) => console.log('Progress:', newValue)}
        onComplete={() => console.log('Completed!')}
      />
      
      <CircleProgress
        value={value}
        radius={60}
        strokeWidth={8}
        theme="success"
      />
    </div>
  );
}
```

### Lit Web Components

```html
<script type="module">
  import { LinearProgress, CircleProgress } from '@ldesign/progress-lit';
  import '@ldesign/progress-core/dist/index.css';
</script>

<ld-linear-progress
  value="50"
  color="#409eff"
  show-text="true"
></ld-linear-progress>

<ld-circle-progress
  value="75"
  radius="60"
  stroke-width="8"
  theme="success"
></ld-circle-progress>
```

## 📚 进度条类型

**总计 14 种类型：**
- 基础类型（7种）：线性、圆形、半圆、仪表盘、步骤、分段、水波纹
- 高级类型（7种）⭐：图片、自定义形状、高级仪表盘、多环、多边形、电池、心形

### 基础类型

#### 线性进度条 (LinearProgress)

支持水平和垂直方向，缓冲进度，条纹样式，不确定状态等。

```javascript
const progress = new LinearProgress('#container', {
  value: 60,
  direction: 'horizontal', // 'horizontal' | 'vertical'
  buffer: 80,              // 缓冲进度
  striped: true,           // 条纹样式
  active: true,            // 激活动画
  indeterminate: false,    // 不确定状态
  color: ['#409eff', '#67c23a'], // 渐变色
});
```

### 圆形进度条 (CircleProgress)

基于 SVG 绘制，支持渐变色，自定义起始角度。

```javascript
const progress = new CircleProgress('#container', {
  value: 75,
  radius: 50,
  strokeWidth: 6,
  clockwise: true,         // 顺时针
  startAngle: -90,         // 起始角度
  lineCap: 'round',        // 线帽样式
  color: ['#ff0000', '#00ff00', '#0000ff'], // 多色渐变
});
```

### 半圆进度条 (SemiCircleProgress)

仪表盘样式，支持刻度显示。

```javascript
const progress = new SemiCircleProgress('#container', {
  value: 60,
  angleRange: 180,         // 角度范围
  showScale: true,         // 显示刻度
  scaleCount: 10,          // 刻度数量
});
```

### 仪表盘进度 (DashboardProgress)

带指针和多色区间的仪表盘。

```javascript
const progress = new DashboardProgress('#container', {
  value: 65,
  showPointer: true,
  colorRanges: [
    { min: 0, max: 30, color: '#67c23a' },
    { min: 30, max: 70, color: '#e6a23c' },
    { min: 70, max: 100, color: '#f56c6c' },
  ],
});
```

### 步骤进度条 (StepProgress)

支持水平和垂直布局，自定义步骤状态。

```javascript
const progress = new StepProgress('#container', {
  currentStep: 1,
  layout: 'horizontal',    // 'horizontal' | 'vertical'
  steps: [
    { title: '步骤1', description: '描述1', status: 'completed' },
    { title: '步骤2', description: '描述2', status: 'active' },
    { title: '步骤3', description: '描述3', status: 'pending' },
  ],
});
```

### 分段进度条 (SegmentProgress)

多段不同颜色，支持段间间隔。

```javascript
const progress = new SegmentProgress('#container', {
  value: 75,
  gap: 4,                  // 段间间隔
  segments: [
    { value: 30, color: '#67c23a', label: '已完成' },
    { value: 20, color: '#e6a23c', label: '进行中' },
    { value: 25, color: '#409eff', label: '待处理' },
  ],
});
```

### 水波纹进度 (WaveProgress)

动态波浪效果，支持 Canvas 和 SVG 渲染。

```javascript
const progress = new WaveProgress('#container', {
  value: 60,
  width: 200,
  height: 200,
  waveHeight: 10,          // 波浪高度
  waveCount: 2,            // 波浪数量
  waveSpeed: 0.05,         // 波浪速度
  renderMode: 'canvas',    // 'canvas' | 'svg'
});
```

### 高级类型 ⭐ 新增

#### 图片进度条 (ImageProgress) 🆕

基于图片填充的进度条。

```javascript
const progress = new ImageProgress('#container', {
  value: 60,
  imageSrc: 'image.jpg',
  fillDirection: 'horizontal', // 'horizontal' | 'vertical' | 'radial'
  imageWidth: 200,
  imageHeight: 200,
});
```

#### 自定义形状进度条 (CustomShapeProgress) 🆕

支持任意 SVG 路径。

```javascript
const progress = new CustomShapeProgress('#container', {
  value: 50,
  shapePath: 'M 20,100 Q 50,50 80,100...', // SVG path
  shapeWidth: 200,
  shapeHeight: 200,
});
```

#### 高级仪表盘 (GaugeProgress) 🆕

带数字刻度和多种指针的仪表盘。

```javascript
const progress = new GaugeProgress('#container', {
  value: 65,
  showNumbers: true,
  needleType: 'arrow', // 'arrow' | 'line' | 'triangle'
});
```

#### 多环进度条 (RingProgress) 🆕

多个同心圆环。

```javascript
const progress = new RingProgress('#container', {
  rings: [
    { value: 80, color: '#409eff', label: 'CPU' },
    { value: 60, color: '#67c23a', label: 'RAM' },
  ],
});
```

#### 多边形进度条 (PolygonProgress) 🆕

正多边形轮廓进度。

```javascript
const progress = new PolygonProgress('#container', {
  value: 70,
  sides: 6, // 边数
  radius: 60,
});
```

#### 电池进度条 (BatteryProgress) 🆕

电池样式进度条。

```javascript
const progress = new BatteryProgress('#container', {
  value: 75,
  orientation: 'horizontal',
  showBoltIcon: true, // 充电图标
});
```

#### 心形进度条 (HeartProgress) 🆕

浪漫的心形进度条。

```javascript
const progress = new HeartProgress('#container', {
  value: 80,
  fillMode: 'bottom-up', // 'bottom-up' | 'center-out' | 'pulse'
  beatAnimation: true,   // 心跳动画
});
```

**查看完整文档**: [NEW_FEATURES.md](./NEW_FEATURES.md)

## 🎨 主题系统

内置主题：`default`、`dark`、`primary`、`success`、`warning`、`error`、`info`

```javascript
import { themeManager } from '@ldesign/progress-core';

// 使用预设主题
const progress = new LinearProgress('#container', {
  theme: 'success',
});

// 注册自定义主题
themeManager.register({
  name: 'custom',
  colors: {
    primary: '#ff6b6b',
    success: '#51cf66',
    warning: '#ffd43b',
    error: '#ff6b6b',
    info: '#74c0fc',
    track: '#e9ecef',
    text: '#212529',
  },
  sizes: {
    small: 4,
    medium: 6,
    large: 8,
  },
});
```

## ⚙️ 配置选项

### 基础配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | number | 0 | 当前值 |
| min | number | 0 | 最小值 |
| max | number | 100 | 最大值 |
| size | string \| number | - | 尺寸 |
| width | string \| number | - | 宽度 |
| height | string \| number | - | 高度 |
| strokeWidth | number | 6 | 线条宽度 |

### 样式配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| color | string \| string[] | - | 颜色（支持渐变数组） |
| trackColor | string | - | 轨道颜色 |
| theme | string | 'default' | 主题名称 |
| className | string | '' | 自定义类名 |

### 动画配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| animated | boolean | true | 是否启用动画 |
| duration | number | 300 | 动画时长（ms） |
| easing | string \| Function | 'easeOutQuad' | 缓动函数 |

### 显示配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showText | boolean | true | 显示文本 |
| format | (value: number) => string | - | 格式化函数 |
| textInside | boolean | false | 文本内部显示 |

### 事件回调

| 选项 | 类型 | 说明 |
|------|------|------|
| onChange | (value: number) => void | 值变化回调 |
| onComplete | () => void | 完成回调 |
| onStart | () => void | 开始回调 |

## 🎯 API

### 实例方法

```javascript
// 设置值
progress.setValue(80, true); // 第二个参数控制是否动画

// 获取值
const value = progress.getValue();

// 增加值
progress.increment(10);

// 减少值
progress.decrement(10);

// 重置
progress.reset();

// 更新配置
progress.updateOptions({ color: '#67c23a' });

// 销毁
progress.destroy();
```

### 事件监听

```javascript
progress.on('change', (value) => {
  console.log('Progress changed:', value);
});

progress.on('complete', () => {
  console.log('Progress completed!');
});

progress.once('start', () => {
  console.log('Progress started!');
});
```

## 🎪 缓动函数

支持的缓动函数：

- `linear`
- `easeInQuad` / `easeOutQuad` / `easeInOutQuad`
- `easeInCubic` / `easeOutCubic` / `easeInOutCubic`
- `easeInQuart` / `easeOutQuart` / `easeInOutQuart`
- `easeInQuint` / `easeOutQuint` / `easeInOutQuint`

也可以传入自定义函数：

```javascript
const progress = new LinearProgress('#container', {
  easing: (t) => t * t * t, // 自定义缓动函数
});
```

## 📖 示例

查看 `examples/` 目录获取更多示例。

## 🔨 开发

### 安装依赖

```bash
pnpm install
```

### 启动示例项目（推荐）

```bash
# Vue 示例（端口 3001）
pnpm dev:vue

# React 示例（端口 3002）
pnpm dev:react

# 原生 JavaScript 示例（端口 3000）
pnpm dev:vanilla
```

示例项目使用 Vite + alias 直接引用源码，无需构建即可开发。

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm build:core
pnpm build:vue
pnpm build:react
pnpm build:lit

# 构建并测试
pnpm build:all
```

### 测试构建

```bash
pnpm test:build
```

更多信息请查看：
- [构建指南](./BUILD.md)
- [开发指南](./DEV_GUIDE.md)

## 📄 License

MIT © ldesign

