# 平滑缩放功能

## 功能说明

优化后的地图滚轮缩放体验，提供平滑的动画效果和高度可配置的缩放控制。

## 核心特性

### ✅ 平滑动画
- 使用 **easeOutCubic** 缓动函数，缩放更加自然
- 可配置动画时长
- 支持完全关闭动画

### ✅ 惯性效果
- 滚轮停止后有轻微的惯性延续
- 提供更自然的交互体验
- 可独立启用/禁用

### ✅ 可调节速度
- 自定义缩放速度（0.1 - 2.0）
- 适配不同用户习惯
- 默认速度 0.5（适中）

## 配置选项

### 基础配置

```javascript
const mapRenderer = new MapRenderer(container, {
  mode: '2d',
  autoFit: true,
  
  // 缩放配置
  smoothZoom: true,           // 启用平滑缩放动画，默认 true
  zoomSpeed: 0.5,             // 缩放速度，默认 0.5
  transitionDuration: 300,    // 动画时长（毫秒），默认 300
  inertia: true               // 启用惯性效果，默认 true
});
```

## 参数详解

### `smoothZoom: boolean`
- **默认值**: `true`
- **说明**: 是否启用平滑缩放动画
- **效果**: 
  - `true`: 缩放时有平滑过渡动画
  - `false`: 缩放时立即响应，无动画

### `zoomSpeed: number`
- **默认值**: `0.5`
- **范围**: `0.1` - `2.0`
- **说明**: 控制滚轮缩放的速度
- **建议值**:
  - `0.3` - 慢速，适合精细操作
  - `0.5` - 中速，推荐默认值
  - `0.8` - 快速，适合快速浏览
  - `1.0+` - 非常快，可能过于敏感

### `transitionDuration: number`
- **默认值**: `300`
- **单位**: 毫秒 (ms)
- **范围**: `0` - `1000`
- **说明**: 缩放动画的持续时间
- **建议值**:
  - `200` - 快速动画
  - `300` - 标准动画（推荐）
  - `500` - 缓慢动画，更加柔和
  - `0` - 禁用动画（等同于 `smoothZoom: false`）

### `inertia: boolean`
- **默认值**: `true`
- **说明**: 是否启用惯性效果
- **效果**:
  - `true`: 滚轮停止后有短暂的惯性延续（300ms）
  - `false`: 滚轮停止后立即停止缩放

## 使用场景

### 场景 1: 标准体验（推荐）
```javascript
{
  smoothZoom: true,
  zoomSpeed: 0.5,
  transitionDuration: 300,
  inertia: true
}
```
适合大多数应用，平衡流畅度和响应速度。

### 场景 2: 快速响应
```javascript
{
  smoothZoom: false,
  zoomSpeed: 0.8,
  transitionDuration: 0,
  inertia: false
}
```
适合需要快速精确操作的场景，如数据分析。

### 场景 3: 极致平滑
```javascript
{
  smoothZoom: true,
  zoomSpeed: 0.3,
  transitionDuration: 500,
  inertia: true
}
```
适合展示和演示场景，追求视觉效果。

### 场景 4: 移动端优化
```javascript
{
  smoothZoom: true,
  zoomSpeed: 0.4,
  transitionDuration: 250,
  inertia: true
}
```
适合移动设备，速度稍慢，动画略短。

## 动态修改配置

### 运行时更新

```javascript
// 切换到快速模式
mapRenderer.setZoomOptions({
  smoothZoom: false,
  zoomSpeed: 1.0
});

// 切换到平滑模式
mapRenderer.setZoomOptions({
  smoothZoom: true,
  zoomSpeed: 0.5,
  transitionDuration: 300
});

// 只修改速度
mapRenderer.setZoomOptions({
  zoomSpeed: 0.8
});
```

### 获取当前配置

```javascript
const currentOptions = mapRenderer.getZoomOptions();
console.log(currentOptions);
// {
//   smoothZoom: true,
//   zoomSpeed: 0.5,
//   transitionDuration: 300,
//   inertia: true
// }
```

## 缓动函数

使用 **easeOutCubic** 缓动函数，公式为：

```javascript
easeOutCubic(t) = 1 - (1 - t)³
```

这个函数特点：
- 开始时快速变化
- 结束时缓慢减速
- 提供自然的视觉体验

效果曲线：
```
1.0 |              ___---
    |         __---
0.5 |    __---
    | ---
0.0 +------------------
    0.0              1.0
```

## 其他交互控制

除了滚轮缩放，还支持：

- ✅ **触摸缩放** (touchZoom): 双指捏合
- ✅ **双击缩放** (doubleClickZoom): 双击放大
- ✅ **键盘控制** (keyboard): 方向键移动，+/- 缩放
- ✅ **拖拽平移** (dragPan): 鼠标拖拽
- ✅ **触摸旋转** (touchRotate): 3D 模式下旋转

这些控制都自动启用，与平滑缩放完美协同。

## 性能考虑

### 启用平滑缩放
- **优点**: 视觉体验更好，更自然
- **成本**: 轻微的 GPU 渲染负担
- **建议**: 推荐在所有现代设备上启用

### 禁用平滑缩放
- **优点**: 响应更快，性能更好
- **成本**: 视觉体验略显生硬
- **建议**: 仅在性能受限或需要极致响应的场景使用

### 优化建议

1. **移动设备**: 降低 `transitionDuration` 到 200-250ms
2. **大数据量**: 使用较小的 `zoomSpeed` (0.3-0.4)
3. **演示场景**: 增加 `transitionDuration` 到 500ms

## 完整示例

```javascript
import { MapRenderer } from '@ldesign/map-renderer';
import geoJsonData from './data.json';

// 创建地图，配置平滑缩放
const mapRenderer = new MapRenderer('#map-container', {
  mode: '2d',
  autoFit: true,
  
  // 平滑缩放配置
  smoothZoom: true,
  zoomSpeed: 0.5,
  transitionDuration: 300,
  inertia: true
});

// 渲染数据
mapRenderer.renderGeoJSON(geoJsonData, {
  id: 'my-layer',
  showLabels: true,
  colorScheme: {
    mode: 'gradient',
    startColor: [66, 165, 245],
    endColor: [255, 152, 0],
    opacity: 180
  },
  labelOptions: {
    getColor: 'auto',
    fontSize: 14
  }
});

// 稍后切换到快速模式
setTimeout(() => {
  mapRenderer.setZoomOptions({
    smoothZoom: false,
    zoomSpeed: 1.0
  });
}, 5000);
```

## 用户体验建议

### 推荐设置（按优先级）

1. **标准用户** → 默认配置即可
2. **追求流畅** → 提高 `transitionDuration` 到 400-500ms
3. **追求响应** → 降低 `transitionDuration` 到 200ms，提高 `zoomSpeed` 到 0.7
4. **触摸设备** → 降低 `zoomSpeed` 到 0.4，保持其他默认值

### 测试建议

在以下场景测试缩放体验：
- 快速连续滚动
- 单次轻微滚动
- 在不同 zoom 级别下测试
- 移动端双指缩放
- 双击缩放

确保在所有场景下都能提供流畅、自然的体验。

---

现在享受丝滑的地图缩放体验吧！ 🚀
