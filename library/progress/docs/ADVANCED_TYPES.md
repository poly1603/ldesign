# 高级进度条类型文档

## 概述

除了 7 种基础进度条类型外，我们还提供了 7 种高级进度条类型，满足更多创意和特殊场景需求。

## 1. ImageProgress - 图片填充进度条

### 功能特点

- 使用图片作为进度指示器
- 支持三种填充方向
- 完美的图片加载处理
- 支持遮罩和裁剪两种模式

### 配置选项

```typescript
interface ImageProgressOptions {
  imageSrc: string;                    // 图片URL（必需）
  imageWidth?: number;                 // 图片宽度
  imageHeight?: number;                // 图片高度
  fillDirection?: 'horizontal' | 'vertical' | 'radial'; // 填充方向
  maskMode?: boolean;                  // 遮罩模式
  objectFit?: 'fill' | 'contain' | 'cover'; // 图片适配
}
```

### 使用示例

```javascript
// 水平填充
const progress = new ImageProgress('#container', {
  value: 60,
  imageSrc: 'path/to/image.jpg',
  fillDirection: 'horizontal',
  imageWidth: 300,
  imageHeight: 200,
  showText: true,
});

// 径向填充（从中心扩展）
const radialProgress = new ImageProgress('#container2', {
  value: 75,
  imageSrc: 'path/to/image.jpg',
  fillDirection: 'radial',
  imageWidth: 200,
  imageHeight: 200,
});
```

### 方法

- `setImageSrc(src)` - 动态改变图片
- `setFillDirection(direction)` - 改变填充方向

### 应用场景

- App 下载进度（显示 App 图标）
- 图片加载进度
- 游戏资源加载
- 品牌展示

---

## 2. CustomShapeProgress - 自定义形状进度条

### 功能特点

- 支持任意 SVG 路径
- 支持路径生成函数
- 沿路径渐变填充
- 无限的创意可能

### 配置选项

```typescript
interface CustomShapeProgressOptions {
  shapePath: string | ((width, height) => string); // SVG 路径（必需）
  shapeWidth?: number;                              // 宽度
  shapeHeight?: number;                             // 高度
  fillMode?: 'solid' | 'gradient' | 'pattern';     // 填充模式
}
```

### 使用示例

```javascript
// 使用静态路径
const progress = new CustomShapeProgress('#container', {
  value: 50,
  shapePath: 'M 20,100 Q 50,50 80,100 T 180,100',
  shapeWidth: 200,
  shapeHeight: 150,
  color: '#409eff',
  strokeWidth: 6,
});

// 使用动态生成函数
function createStarPath(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 10;
  const innerRadius = outerRadius * 0.4;
  const points = [];
  
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  points.push('Z');
  return points.join(' ');
}

const starProgress = new CustomShapeProgress('#star', {
  value: 70,
  shapePath: createStarPath,
  shapeWidth: 200,
  shapeHeight: 200,
  color: ['#ffd700', '#ff8c00'],
});
```

### 预设形状示例

#### 星形
```javascript
function createStarPath(width, height) {
  // 见上方示例
}
```

#### 无限符号（∞）
```javascript
const infinityPath = 'M 60,75 C 60,45 20,45 20,75 C 20,105 60,105 60,75 C 60,45 100,45 100,75 C 100,105 140,105 140,75 C 140,45 100,45 100,75';
```

#### 闪电
```javascript
const lightningPath = 'M 50,10 L 30,50 L 45,50 L 35,90 L 70,40 L 55,40 Z';
```

### 应用场景

- 品牌 Logo 进度
- 创意设计
- 游戏 UI
- 特殊形状需求

---

## 3. GaugeProgress - 高级仪表盘

### 功能特点

- 完整的数字刻度
- 主刻度和副刻度
- 多种指针样式
- 自定义数字格式

### 配置选项

```typescript
interface GaugeProgressOptions extends DashboardProgressOptions {
  showNumbers?: boolean;                        // 显示数字
  numberFormat?: (value: number) => string;    // 数字格式化
  tickCount?: number;                           // 主刻度数
  showMinorTicks?: boolean;                     // 显示副刻度
  minorTickCount?: number;                      // 副刻度数
  needleType?: 'arrow' | 'line' | 'triangle';  // 指针类型
}
```

### 使用示例

```javascript
// 温度计
const tempGauge = new GaugeProgress('#temp', {
  value: 25,
  min: -20,
  max: 50,
  showNumbers: true,
  numberFormat: (value) => `${Math.round(value)}°C`,
  tickCount: 7,
  showMinorTicks: true,
  needleType: 'arrow',
  colorRanges: [
    { min: -20, max: 0, color: '#409eff' },
    { min: 0, max: 25, color: '#67c23a' },
    { min: 25, max: 50, color: '#f56c6c' },
  ],
});

// 速度表
const speedGauge = new GaugeProgress('#speed', {
  value: 80,
  min: 0,
  max: 200,
  showNumbers: true,
  numberFormat: (value) => `${Math.round(value)} km/h`,
  needleType: 'triangle',
});
```

### 方法

- `setNeedleType(type)` - 设置指针类型
- `setShowNumbers(show)` - 设置是否显示数字

### 应用场景

- 车速表
- 温度计
- 压力表
- 性能监控

---

## 4. RingProgress - 多环同心进度条

### 功能特点

- 多个同心圆环
- 每个环独立配置
- 适合多指标展示
- 环标签支持

### 配置选项

```typescript
interface RingProgressOptions {
  rings?: RingConfig[];    // 环配置数组
  ringGap?: number;        // 环间距
  baseRadius?: number;     // 基础半径
}

interface RingConfig {
  value: number;           // 值
  color?: string;          // 颜色
  strokeWidth?: number;    // 线宽
  label?: string;          // 标签
}
```

### 使用示例

```javascript
// 系统监控
const systemMonitor = new RingProgress('#monitor', {
  baseRadius: 60,
  ringGap: 15,
  showText: true,
  rings: [
    { value: 75, color: '#409eff', strokeWidth: 10, label: 'CPU' },
    { value: 60, color: '#67c23a', strokeWidth: 10, label: 'Memory' },
    { value: 45, color: '#e6a23c', strokeWidth: 10, label: 'Disk' },
    { value: 30, color: '#909399', strokeWidth: 10, label: 'Network' },
  ],
});

// 更新单个环
systemMonitor.updateRing(0, 85); // 更新 CPU 使用率

// 添加新环
systemMonitor.addRing({
  value: 50,
  color: '#f56c6c',
  strokeWidth: 10,
  label: 'GPU',
});
```

### 方法

- `updateRing(index, value)` - 更新指定环的值
- `addRing(config)` - 添加新环

### 应用场景

- 系统资源监控
- 多指标对比
- 技能雷达图
- 数据仪表板

---

## 5. PolygonProgress - 多边形进度条

### 功能特点

- 任意边数的正多边形
- 可旋转调整角度
- 沿边框填充
- 几何美学

### 配置选项

```typescript
interface PolygonProgressOptions {
  sides?: number;          // 边数（≥3）
  radius?: number;         // 半径
  rotation?: number;       // 旋转角度
  fillMode?: 'edge' | 'area'; // 填充模式
}
```

### 使用示例

```javascript
// 六边形
const hexagon = new PolygonProgress('#hex', {
  value: 70,
  sides: 6,
  radius: 60,
  rotation: 0,
  color: ['#409eff', '#67c23a'],
  strokeWidth: 8,
});

// 三角形
const triangle = new PolygonProgress('#triangle', {
  value: 50,
  sides: 3,
  radius: 60,
  color: '#f56c6c',
});

// 八边形
const octagon = new PolygonProgress('#octagon', {
  value: 80,
  sides: 8,
  rotation: 22.5, // 旋转使其平边朝上
  color: '#e6a23c',
});
```

### 方法

- `setSides(sides)` - 设置边数
- `setRotation(rotation)` - 设置旋转角度

### 应用场景

- 游戏 UI
- 创意展示
- 几何设计
- 移动应用

---

## 6. BatteryProgress - 电池样式进度条

### 功能特点

- 真实的电池外观
- 充电状态显示
- 低电量警告
- 脉冲动画效果

### 配置选项

```typescript
interface BatteryProgressOptions {
  orientation?: 'horizontal' | 'vertical';  // 方向
  batteryWidth?: number;                     // 宽度
  batteryHeight?: number;                    // 高度
  showBoltIcon?: boolean;                    // 闪电图标
  chargingColor?: string;                    // 充电颜色
  lowBatteryThreshold?: number;              // 低电量阈值
  lowBatteryColor?: string;                  // 低电量颜色
}
```

### 使用示例

```javascript
// 基础电池
const battery = new BatteryProgress('#battery', {
  value: 75,
  orientation: 'horizontal',
  batteryWidth: 120,
  batteryHeight: 50,
  showText: true,
});

// 充电中的电池
const chargingBattery = new BatteryProgress('#charging', {
  value: 45,
  showBoltIcon: true,
  chargingColor: '#67c23a',
});

// 低电量警告
const lowBattery = new BatteryProgress('#low', {
  value: 15,
  lowBatteryThreshold: 20,
  lowBatteryColor: '#f56c6c',
});
```

### 方法

- `setOrientation(orientation)` - 设置方向
- `setCharging(charging)` - 设置充电状态

### 应用场景

- 设备电量显示
- 能源监控
- 存储空间
- 移动应用

---

## 7. HeartProgress - 心形进度条

### 功能特点

- 浪漫的心形外观
- 三种填充模式
- 心跳动画效果
- 渐变色支持

### 配置选项

```typescript
interface HeartProgressOptions {
  heartSize?: number;                           // 心形大小
  fillMode?: 'bottom-up' | 'center-out' | 'pulse'; // 填充模式
  beatAnimation?: boolean;                      // 心跳动画
  beatSpeed?: number;                           // 心跳速度(ms)
}
```

### 使用示例

```javascript
// 底部向上填充
const heart1 = new HeartProgress('#heart1', {
  value: 70,
  heartSize: 120,
  fillMode: 'bottom-up',
  color: ['#ff6b6b', '#ee5a6f'],
  showText: true,
});

// 中心向外扩展
const heart2 = new HeartProgress('#heart2', {
  value: 50,
  fillMode: 'center-out',
  color: '#ff4757',
});

// 带心跳动画
const heart3 = new HeartProgress('#heart3', {
  value: 80,
  fillMode: 'bottom-up',
  beatAnimation: true,
  beatSpeed: 800,
});
```

### 方法

- `setBeatAnimation(enabled)` - 启用/禁用心跳
- `setFillMode(mode)` - 设置填充模式

### 应用场景

- 点赞/喜欢功能
- 健康应用（心率）
- 社交互动
- 音乐应用（喜欢的歌曲）
- 情人节主题

---

## 对比表格

| 类型 | 适用场景 | 视觉效果 | 复杂度 | 性能 |
|------|---------|---------|--------|------|
| ImageProgress | 品牌展示、资源加载 | ⭐⭐⭐⭐⭐ | 中 | 高 |
| CustomShapeProgress | 创意设计、品牌定制 | ⭐⭐⭐⭐⭐ | 高 | 高 |
| GaugeProgress | 仪表盘、监控面板 | ⭐⭐⭐⭐ | 中 | 高 |
| RingProgress | 多指标对比 | ⭐⭐⭐⭐ | 中 | 高 |
| PolygonProgress | 游戏UI、几何设计 | ⭐⭐⭐⭐ | 低 | 高 |
| BatteryProgress | 电量显示、能源监控 | ⭐⭐⭐⭐ | 低 | 高 |
| HeartProgress | 社交互动、点赞 | ⭐⭐⭐⭐⭐ | 低 | 高 |

## 组合使用

这些高级类型可以与基础类型组合使用：

```javascript
// 同时显示多种进度条
const battery = new BatteryProgress('#battery', { value: 60 });
const heart = new HeartProgress('#heart', { value: 60 });
const polygon = new PolygonProgress('#polygon', { value: 60 });

// 同步更新
function updateAll(value) {
  battery.setValue(value);
  heart.setValue(value);
  polygon.setValue(value);
}
```

## 性能说明

所有高级类型都经过性能优化：

- ✅ 使用 SVG 硬件加速
- ✅ requestAnimationFrame 动画
- ✅ 高效的 DOM 操作
- ✅ 内存管理和清理
- ✅ 60fps 流畅动画

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 查看演示

```bash
pnpm dev:vanilla
```

然后访问：http://localhost:3000/advanced.html

## 下一步

- 查看 [NEW_FEATURES.md](../NEW_FEATURES.md)
- 查看 [API 文档](./API.md)
- 尝试在你的项目中使用

---

**文档版本**: 1.1.0  
**更新时间**: 2024-01-20

