# 🎉 新增高级进度条类型

## 概述

在原有 7 种进度条的基础上，新增了 **7 种创新进度条类型**，现在总共支持 **14 种**进度条样式！

## 新增类型

### 1. 📸 ImageProgress - 图片填充进度条

基于图片的进度条，支持多种填充方式。

**特性：**
- ✅ 水平填充（从左到右）
- ✅ 垂直填充（从下到上）
- ✅ 径向填充（从中心向外）
- ✅ 遮罩模式
- ✅ 自定义图片适配方式

**使用示例：**
```javascript
import { ImageProgress } from '@ldesign/progress-core';

const progress = new ImageProgress('#container', {
  value: 60,
  imageSrc: 'https://example.com/image.jpg',
  imageWidth: 200,
  imageHeight: 200,
  fillDirection: 'horizontal', // 'horizontal' | 'vertical' | 'radial'
  maskMode: false,
  objectFit: 'cover',
  showText: true,
});
```

### 2. ✨ CustomShapeProgress - 自定义形状进度条

支持任意 SVG 路径的自定义形状进度条。

**特性：**
- ✅ 自定义 SVG 路径
- ✅ 动态路径生成函数
- ✅ 渐变色支持
- ✅ 沿路径填充

**使用示例：**
```javascript
import { CustomShapeProgress } from '@ldesign/progress-core';

// 星形进度条
function createStarPath(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  // ... 生成星形路径
  return pathString;
}

const progress = new CustomShapeProgress('#container', {
  value: 50,
  shapePath: createStarPath, // 或直接传入 SVG path 字符串
  shapeWidth: 200,
  shapeHeight: 200,
  color: ['#ffd700', '#ff8c00'],
  strokeWidth: 6,
});
```

**预设形状：**
- ⭐ 星形
- 🌊 波浪线
- ∞ 无限符号
- 💠 任意自定义形状

### 3. 🎯 GaugeProgress - 高级仪表盘

增强版仪表盘，带数字刻度和多种指针样式。

**特性：**
- ✅ 数字刻度显示
- ✅ 主刻度和副刻度
- ✅ 多种指针类型（箭头/线条/三角）
- ✅ 自定义数字格式化
- ✅ 颜色区间

**使用示例：**
```javascript
import { GaugeProgress } from '@ldesign/progress-core';

const progress = new GaugeProgress('#container', {
  value: 65,
  showNumbers: true,
  numberFormat: (value) => `${Math.round(value)}°C`,
  tickCount: 10,
  showMinorTicks: true,
  minorTickCount: 5,
  needleType: 'arrow', // 'arrow' | 'line' | 'triangle'
  colorRanges: [
    { min: 0, max: 30, color: '#67c23a' },
    { min: 30, max: 70, color: '#e6a23c' },
    { min: 70, max: 100, color: '#f56c6c' },
  ],
});
```

### 4. ⭕ RingProgress - 多环同心进度条

多个同心圆环显示不同指标。

**特性：**
- ✅ 多个同心环
- ✅ 每个环独立配置
- ✅ 环间距可调
- ✅ 环标签显示

**使用示例：**
```javascript
import { RingProgress } from '@ldesign/progress-core';

const progress = new RingProgress('#container', {
  value: 50,
  baseRadius: 60,
  ringGap: 15,
  showText: true,
  rings: [
    { value: 80, color: '#409eff', strokeWidth: 8, label: 'CPU' },
    { value: 60, color: '#67c23a', strokeWidth: 8, label: 'Memory' },
    { value: 40, color: '#e6a23c', strokeWidth: 8, label: 'Disk' },
  ],
});

// 更新单个环
progress.updateRing(0, 90); // 更新第一个环的值
```

### 5. 🔶 PolygonProgress - 多边形进度条

正多边形轮廓进度条。

**特性：**
- ✅ 自定义边数（3-∞）
- ✅ 可旋转
- ✅ 渐变色支持
- ✅ 沿边填充

**使用示例：**
```javascript
import { PolygonProgress } from '@ldesign/progress-core';

// 六边形进度条
const progress = new PolygonProgress('#container', {
  value: 70,
  sides: 6,        // 边数
  radius: 60,
  rotation: 0,     // 旋转角度
  color: ['#409eff', '#67c23a'],
  strokeWidth: 8,
  showText: true,
});

// 三角形
progress.setSides(3);

// 八边形
progress.setSides(8);
```

### 6. 🔋 BatteryProgress - 电池样式进度条

电池充电样式的进度条。

**特性：**
- ✅ 水平/垂直方向
- ✅ 充电状态（闪电图标）
- ✅ 低电量警告
- ✅ 低电量脉冲动画
- ✅ 自定义颜色

**使用示例：**
```javascript
import { BatteryProgress } from '@ldesign/progress-core';

const progress = new BatteryProgress('#container', {
  value: 75,
  orientation: 'horizontal', // 'horizontal' | 'vertical'
  batteryWidth: 120,
  batteryHeight: 50,
  showText: true,
  showBoltIcon: false,      // 充电图标
  chargingColor: '#67c23a',
  lowBatteryThreshold: 20,  // 低电量阈值
  lowBatteryColor: '#f56c6c',
});

// 设置充电状态
progress.setCharging(true);
```

### 7. 💖 HeartProgress - 心形进度条

浪漫的心形进度条，适合点赞、喜欢等场景。

**特性：**
- ✅ 底部向上填充
- ✅ 中心向外扩展
- ✅ 脉冲模式
- ✅ 心跳动画
- ✅ 渐变色支持

**使用示例：**
```javascript
import { HeartProgress } from '@ldesign/progress-core';

const progress = new HeartProgress('#container', {
  value: 80,
  heartSize: 120,
  fillMode: 'bottom-up', // 'bottom-up' | 'center-out' | 'pulse'
  color: ['#ff6b6b', '#ee5a6f'],
  showText: true,
  beatAnimation: true,   // 心跳动画
  beatSpeed: 1000,       // 心跳速度(ms)
});

// 启用/禁用心跳
progress.setBeatAnimation(true);

// 改变填充模式
progress.setFillMode('center-out');
```

## 完整类型列表

### 原有类型（7种）
1. ✅ LinearProgress - 线性进度条
2. ✅ CircleProgress - 圆形进度条
3. ✅ SemiCircleProgress - 半圆进度条
4. ✅ DashboardProgress - 仪表盘进度
5. ✅ StepProgress - 步骤进度条
6. ✅ SegmentProgress - 分段进度条
7. ✅ WaveProgress - 水波纹进度

### 新增类型（7种）⭐
8. ✨ ImageProgress - 图片填充进度条
9. ✨ CustomShapeProgress - 自定义形状进度条
10. ✨ GaugeProgress - 高级仪表盘
11. ✨ RingProgress - 多环同心进度条
12. ✨ PolygonProgress - 多边形进度条
13. ✨ BatteryProgress - 电池样式进度条
14. ✨ HeartProgress - 心形进度条

**总计：14 种进度条类型！**

## 查看演示

### 启动高级示例

```bash
# 在项目根目录
pnpm dev:vanilla

# 然后访问
# http://localhost:3000/advanced.html
```

### 或直接打开

在浏览器中打开：`examples/vanilla/advanced.html`

## 应用场景

### ImageProgress
- 📱 App 下载进度
- 🖼️ 图片加载进度
- 🎮 游戏资源加载
- 📊 数据可视化

### CustomShapeProgress
- ⭐ 创意设计
- 🎨 品牌定制
- 🎯 特殊形状需求
- 🌟 独特视觉效果

### GaugeProgress
- 🌡️ 温度计
- ⚡ 速度表
- 📈 性能指标
- 🎚️ 仪表板

### RingProgress
- 💻 系统监控（CPU、内存、磁盘）
- 📊 多指标对比
- 🎯 目标达成度
- 📈 数据分析

### PolygonProgress
- 🎮 游戏 UI
- 🎨 创意展示
- 📱 移动应用
- 🔷 几何设计

### BatteryProgress
- 🔋 电池电量
- 📱 设备状态
- ⚡ 能源监控
- 💾 存储空间

### HeartProgress
- 💖 点赞/喜欢
- ❤️ 健康应用
- 💕 社交互动
- 🎵 音乐应用

## TypeScript 支持

所有新类型都有完整的 TypeScript 类型定义：

```typescript
import {
  ImageProgress,
  ImageProgressOptions,
  CustomShapeProgress,
  CustomShapeProgressOptions,
  GaugeProgress,
  GaugeProgressOptions,
  RingProgress,
  RingProgressOptions,
  PolygonProgress,
  PolygonProgressOptions,
  BatteryProgress,
  BatteryProgressOptions,
  HeartProgress,
  HeartProgressOptions,
} from '@ldesign/progress-core';
```

## 配置选项

所有新类型都继承了基础配置选项，并添加了各自的特有配置。

### 通用基础配置
- value, min, max
- color, trackColor
- theme
- animated, duration, easing
- showText, format
- onChange, onComplete, onStart

### 每种类型的特有配置
详见上方各类型的使用示例。

## 性能

所有新增的进度条类型都经过性能优化：
- ✅ 使用 requestAnimationFrame
- ✅ 高效的 DOM 操作
- ✅ SVG 优化
- ✅ CSS 硬件加速
- ✅ 内存管理

## 浏览器兼容性

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 下一步

1. 启动演示查看效果
2. 在项目中使用新类型
3. 自定义配置和样式
4. 反馈和建议

---

**更新时间**: 2024-01-20  
**新增类型数**: 7 种  
**总类型数**: 14 种  
**状态**: ✅ 已完成，可用


