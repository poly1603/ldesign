# API 文档

## 目录

- [基础类](#基础类)
- [基础进度条类型](#基础进度条类型)
- [高级进度条类型](#高级进度条类型) ⭐ 新增
- [工具类](#工具类)
- [主题系统](#主题系统)
- [类型定义](#类型定义)

## 基础类

### ProgressBase

所有进度条的基类。

#### 构造函数

```typescript
constructor(container: HTMLElement | string, options?: Partial<T>)
```

**参数：**
- `container`: 容器元素或选择器
- `options`: 配置选项

#### 实例方法

##### setValue(value, animated?)

设置进度值。

```typescript
setValue(value: number, animated?: boolean): void
```

**参数：**
- `value`: 新的进度值
- `animated`: 是否使用动画（默认使用配置中的 `animated` 选项）

##### getValue()

获取当前值。

```typescript
getValue(): number
```

**返回：** 当前进度值

##### getPercentage()

获取当前百分比。

```typescript
getPercentage(): number
```

**返回：** 当前进度百分比（0-100）

##### increment(delta?)

增加进度值。

```typescript
increment(delta?: number): void
```

**参数：**
- `delta`: 增加的值（默认为 1）

##### decrement(delta?)

减少进度值。

```typescript
decrement(delta?: number): void
```

**参数：**
- `delta`: 减少的值（默认为 1）

##### reset()

重置进度到最小值。

```typescript
reset(): void
```

##### updateOptions(options)

更新配置。

```typescript
updateOptions(options: Partial<T>): void
```

**参数：**
- `options`: 新的配置选项

##### getOptions()

获取当前配置。

```typescript
getOptions(): T
```

**返回：** 当前配置对象

##### destroy()

销毁实例。

```typescript
destroy(): void
```

##### on(event, handler)

监听事件。

```typescript
on(event: EventType, handler: EventHandler): this
```

**参数：**
- `event`: 事件类型
- `handler`: 事件处理函数

**事件类型：**
- `'change'`: 值变化时触发
- `'complete'`: 达到最大值时触发
- `'start'`: 从最小值开始时触发
- `'update'`: 动画更新时触发
- `'destroy'`: 销毁时触发

##### off(event, handler?)

取消监听事件。

```typescript
off(event: EventType, handler?: EventHandler): this
```

##### once(event, handler)

监听一次事件。

```typescript
once(event: EventType, handler: EventHandler): this
```

## 基础进度条类型

### LinearProgress

线性进度条。

#### 特有配置

```typescript
interface LinearProgressOptions extends BaseProgressOptions {
  direction?: 'horizontal' | 'vertical';  // 方向
  buffer?: number;                         // 缓冲值
  segments?: SegmentConfig[];              // 分段配置
  striped?: boolean;                       // 条纹样式
  active?: boolean;                        // 激活动画
  indeterminate?: boolean;                 // 不确定状态
}
```

#### 特有方法

##### setBuffer(buffer)

设置缓冲值。

```typescript
setBuffer(buffer: number): void
```

##### setDirection(direction)

设置方向。

```typescript
setDirection(direction: 'horizontal' | 'vertical'): void
```

##### setStriped(striped)

设置条纹样式。

```typescript
setStriped(striped: boolean): void
```

##### setActive(active)

设置激活动画。

```typescript
setActive(active: boolean): void
```

##### setIndeterminate(indeterminate)

设置不确定状态。

```typescript
setIndeterminate(indeterminate: boolean): void
```

### CircleProgress

圆形进度条。

#### 特有配置

```typescript
interface CircleProgressOptions extends BaseProgressOptions {
  radius?: number;                        // 半径
  clockwise?: boolean;                    // 顺时针
  startAngle?: number;                    // 起始角度
  lineCap?: 'round' | 'square' | 'butt'; // 线帽样式
}
```

#### 特有方法

##### setRadius(radius)

设置半径。

```typescript
setRadius(radius: number): void
```

##### setClockwise(clockwise)

设置方向。

```typescript
setClockwise(clockwise: boolean): void
```

##### setStartAngle(angle)

设置起始角度。

```typescript
setStartAngle(angle: number): void
```

##### setLineCap(lineCap)

设置线帽样式。

```typescript
setLineCap(lineCap: 'round' | 'square' | 'butt'): void
```

### SemiCircleProgress

半圆进度条。

#### 特有配置

```typescript
interface SemiCircleProgressOptions extends CircleProgressOptions {
  angleRange?: number;    // 角度范围
  showScale?: boolean;    // 显示刻度
  scaleCount?: number;    // 刻度数量
}
```

#### 特有方法

##### setAngleRange(angleRange)

设置角度范围。

```typescript
setAngleRange(angleRange: number): void
```

##### setShowScale(showScale)

设置是否显示刻度。

```typescript
setShowScale(showScale: boolean): void
```

##### setScaleCount(count)

设置刻度数量。

```typescript
setScaleCount(count: number): void
```

### DashboardProgress

仪表盘进度。

#### 特有配置

```typescript
interface DashboardProgressOptions extends SemiCircleProgressOptions {
  showPointer?: boolean;      // 显示指针
  colorRanges?: ColorRange[]; // 颜色范围
  warningZones?: WarningZone[]; // 警告区域
}
```

#### 特有方法

##### setShowPointer(show)

设置是否显示指针。

```typescript
setShowPointer(show: boolean): void
```

##### setColorRanges(ranges)

设置颜色范围。

```typescript
setColorRanges(ranges: ColorRange[]): void
```

### StepProgress

步骤进度条。

#### 特有配置

```typescript
interface StepProgressOptions extends BaseProgressOptions {
  steps?: Step[];                         // 步骤数组
  currentStep?: number;                   // 当前步骤
  layout?: 'horizontal' | 'vertical';    // 布局
  showDescription?: boolean;              // 显示描述
}

interface Step {
  title?: string;                         // 标题
  description?: string;                   // 描述
  icon?: string;                          // 图标
  status?: 'completed' | 'active' | 'pending' | 'error'; // 状态
}
```

#### 特有方法

##### setCurrentStep(step)

设置当前步骤。

```typescript
setCurrentStep(step: number): void
```

##### next()

下一步。

```typescript
next(): void
```

##### prev()

上一步。

```typescript
prev(): void
```

##### setStepStatus(index, status)

设置步骤状态。

```typescript
setStepStatus(index: number, status: Step['status']): void
```

##### addStep(step)

添加步骤。

```typescript
addStep(step: Step): void
```

##### removeStep(index)

移除步骤。

```typescript
removeStep(index: number): void
```

##### setLayout(layout)

设置布局。

```typescript
setLayout(layout: 'horizontal' | 'vertical'): void
```

### SegmentProgress

分段进度条。

#### 特有配置

```typescript
interface SegmentProgressOptions extends BaseProgressOptions {
  segments?: SegmentConfig[]; // 分段配置
  gap?: number;                // 段间间隔
}

interface SegmentConfig {
  value: number;   // 值
  color?: string;  // 颜色
  label?: string;  // 标签
}
```

#### 特有方法

##### setSegments(segments)

设置分段。

```typescript
setSegments(segments: SegmentConfig[]): void
```

##### addSegment(segment)

添加分段。

```typescript
addSegment(segment: SegmentConfig): void
```

##### setGap(gap)

设置间隙。

```typescript
setGap(gap: number): void
```

### WaveProgress

水波纹进度条。

#### 特有配置

```typescript
interface WaveProgressOptions extends BaseProgressOptions {
  waveHeight?: number;              // 波浪高度
  waveCount?: number;               // 波浪数量
  waveSpeed?: number;               // 波浪速度
  renderMode?: 'canvas' | 'svg';   // 渲染模式
}
```

#### 特有方法

##### setWaveHeight(height)

设置波浪高度。

```typescript
setWaveHeight(height: number): void
```

##### setWaveCount(count)

设置波浪数量。

```typescript
setWaveCount(count: number): void
```

##### setWaveSpeed(speed)

设置波浪速度。

```typescript
setWaveSpeed(speed: number): void
```

## 高级进度条类型 ⭐

### ImageProgress

图片填充进度条。

#### 特有配置

```typescript
interface ImageProgressOptions extends BaseProgressOptions {
  imageSrc: string;                    // 图片URL（必需）
  imageWidth?: number;                 // 图片宽度
  imageHeight?: number;                // 图片高度
  fillDirection?: 'horizontal' | 'vertical' | 'radial'; // 填充方向
  maskMode?: boolean;                  // 遮罩模式
  objectFit?: 'fill' | 'contain' | 'cover'; // 图片适配
}
```

#### 特有方法

##### setImageSrc(src)

设置图片源。

```typescript
setImageSrc(src: string): void
```

##### setFillDirection(direction)

设置填充方向。

```typescript
setFillDirection(direction: 'horizontal' | 'vertical' | 'radial'): void
```

---

### CustomShapeProgress

自定义形状进度条。

#### 特有配置

```typescript
interface CustomShapeProgressOptions extends BaseProgressOptions {
  shapePath: string | ((width: number, height: number) => string); // SVG路径
  shapeWidth?: number;                 // 宽度
  shapeHeight?: number;                // 高度
  fillMode?: 'solid' | 'gradient' | 'pattern'; // 填充模式
}
```

#### 特有方法

##### setShapePath(path)

设置自定义路径。

```typescript
setShapePath(path: string | ((width: number, height: number) => string)): void
```

---

### GaugeProgress

高级仪表盘进度条。

#### 特有配置

```typescript
interface GaugeProgressOptions extends DashboardProgressOptions {
  showNumbers?: boolean;               // 显示数字
  numberFormat?: (value: number) => string; // 数字格式化
  tickCount?: number;                  // 主刻度数
  showMinorTicks?: boolean;            // 显示副刻度
  minorTickCount?: number;             // 副刻度数
  needleType?: 'arrow' | 'line' | 'triangle'; // 指针类型
}
```

#### 特有方法

##### setNeedleType(type)

设置指针类型。

```typescript
setNeedleType(type: 'arrow' | 'line' | 'triangle'): void
```

##### setShowNumbers(show)

设置是否显示数字。

```typescript
setShowNumbers(show: boolean): void
```

---

### RingProgress

多环同心进度条。

#### 特有配置

```typescript
interface RingProgressOptions extends BaseProgressOptions {
  rings?: RingConfig[];    // 环配置
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

#### 特有方法

##### updateRing(index, value)

更新指定环的值。

```typescript
updateRing(index: number, value: number): void
```

##### addRing(config)

添加新环。

```typescript
addRing(config: RingConfig): void
```

---

### PolygonProgress

多边形进度条。

#### 特有配置

```typescript
interface PolygonProgressOptions extends BaseProgressOptions {
  sides?: number;          // 边数（≥3）
  radius?: number;         // 半径
  rotation?: number;       // 旋转角度
  fillMode?: 'edge' | 'area'; // 填充模式
}
```

#### 特有方法

##### setSides(sides)

设置边数。

```typescript
setSides(sides: number): void
```

##### setRotation(rotation)

设置旋转角度。

```typescript
setRotation(rotation: number): void
```

---

### BatteryProgress

电池样式进度条。

#### 特有配置

```typescript
interface BatteryProgressOptions extends BaseProgressOptions {
  orientation?: 'horizontal' | 'vertical';  // 方向
  batteryWidth?: number;                     // 宽度
  batteryHeight?: number;                    // 高度
  showBoltIcon?: boolean;                    // 闪电图标
  chargingColor?: string;                    // 充电颜色
  lowBatteryThreshold?: number;              // 低电量阈值
  lowBatteryColor?: string;                  // 低电量颜色
}
```

#### 特有方法

##### setOrientation(orientation)

设置方向。

```typescript
setOrientation(orientation: 'horizontal' | 'vertical'): void
```

##### setCharging(charging)

设置充电状态。

```typescript
setCharging(charging: boolean): void
```

---

### HeartProgress

心形进度条。

#### 特有配置

```typescript
interface HeartProgressOptions extends BaseProgressOptions {
  heartSize?: number;                           // 心形大小
  fillMode?: 'bottom-up' | 'center-out' | 'pulse'; // 填充模式
  beatAnimation?: boolean;                      // 心跳动画
  beatSpeed?: number;                           // 心跳速度(ms)
}
```

#### 特有方法

##### setBeatAnimation(enabled)

启用/禁用心跳动画。

```typescript
setBeatAnimation(enabled: boolean): void
```

##### setFillMode(mode)

设置填充模式。

```typescript
setFillMode(mode: 'bottom-up' | 'center-out' | 'pulse'): void
```

---

## 工具类

### ThemeManager

主题管理器。

#### 方法

##### register(theme)

注册主题。

```typescript
register(theme: ThemeConfig): void
```

##### get(name)

获取主题。

```typescript
get(name: string): ThemeConfig | undefined
```

##### getCurrent()

获取当前主题。

```typescript
getCurrent(): ThemeConfig
```

##### setCurrent(name)

设置当前主题。

```typescript
setCurrent(name: string): void
```

##### applyTheme(element, themeName?)

应用主题到元素。

```typescript
applyTheme(element: HTMLElement, themeName?: string): void
```

##### getColor(colorKey, themeName?)

获取主题颜色。

```typescript
getColor(colorKey: keyof ThemeConfig['colors'], themeName?: string): string
```

##### createGradient(colors, direction?)

创建渐变色。

```typescript
createGradient(colors: string[], direction?: string): string
```

### AnimationController

动画控制器。

#### 方法

##### start(options)

启动动画。

```typescript
start(options: {
  from: number;
  to: number;
  duration: number;
  easing?: EasingFunction | keyof typeof EasingFunctions;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}): void
```

##### pause()

暂停动画。

```typescript
pause(): void
```

##### resume()

恢复动画。

```typescript
resume(): void
```

##### stop()

停止动画。

```typescript
stop(): void
```

##### reset()

重置动画。

```typescript
reset(): void
```

##### isAnimating()

检查是否正在运行。

```typescript
isAnimating(): boolean
```

## 主题系统

### 内置主题

- `default` - 默认主题
- `dark` - 深色主题
- `primary` - 主色主题
- `success` - 成功主题
- `warning` - 警告主题
- `error` - 错误主题
- `info` - 信息主题

### 自定义主题

```typescript
import { themeManager } from '@ldesign/progress-core';

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
  borderRadius: '8px',
  shadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
});
```

## 类型定义

### BaseProgressOptions

```typescript
interface BaseProgressOptions {
  value?: number;
  min?: number;
  max?: number;
  size?: string | number;
  width?: string | number;
  height?: string | number;
  strokeWidth?: number;
  color?: string | string[];
  trackColor?: string;
  theme?: string;
  className?: string;
  animated?: boolean;
  duration?: number;
  easing?: EasingFunction | keyof typeof EasingFunctions;
  showText?: boolean;
  format?: (value: number) => string;
  textInside?: boolean;
  icon?: string | ((value: number) => string);
  indeterminate?: boolean;
  striped?: boolean;
  active?: boolean;
  onChange?: (value: number) => void;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: (value: number) => void;
}
```

### EasingFunctions

```typescript
const EasingFunctions = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
};
```


