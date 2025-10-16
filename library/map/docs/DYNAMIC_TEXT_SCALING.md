# 动态文本缩放功能

## 功能说明

文本标签现在会随着地图缩放级别（zoom）动态调整大小，提供更好的视觉体验。

## 工作原理

### 1. **实时监听缩放变化**
- 监听 deck.gl 的 `onViewStateChange` 事件
- 当 zoom 级别变化超过 **0.3** 时触发文本更新
- 避免频繁更新造成的性能问题

### 2. **动态计算文本大小**
```javascript
// 基础公式
dynamicFontSize = baseFontSize * 1.15^(currentZoom - 8)

// 示例：
// zoom = 7: fontSize = 14 * 1.15^(-1) ≈ 12.2px
// zoom = 8: fontSize = 14 * 1.15^(0) = 14px (基准)
// zoom = 9: fontSize = 14 * 1.15^(1) ≈ 16.1px
// zoom = 10: fontSize = 14 * 1.15^(2) ≈ 18.5px
```

### 3. **智能像素范围限制**
```javascript
sizeMinPixels = Math.max(8, dynamicFontSize * 0.6)
sizeMaxPixels = Math.min(48, dynamicFontSize * 1.8)
```

## 特性

### ✅ 自动调整
- 放大地图时文本变大，缩小时文本变小
- 与地图缩放比例协调一致

### ✅ 性能优化
- 仅在 zoom 变化超过阈值时更新
- 批量更新所有文本图层

### ✅ 保持可读性
- 设置最小和最大像素限制
- 文本不会过小或过大

### ✅ 配合自动对比色
- 文本大小调整时，颜色也会重新计算
- 始终保持最佳对比度

## 使用示例

```javascript
// 基础使用 - 自动启用
const mapRenderer = new MapRenderer(container, {
  mode: '2d',
  autoFit: true
});

mapRenderer.renderGeoJSON(geoJsonData, {
  id: 'my-layer',
  showLabels: true,
  colorScheme: myColorScheme,
  labelOptions: {
    getColor: 'auto',  // 自动对比色
    fontSize: 14       // 基础大小，会随 zoom 动态调整
  }
});

// 用户缩放地图时，文本会自动调整大小
```

## 配置选项

### 修改基础字体大小
```javascript
labelOptions: {
  fontSize: 16  // 增加基础大小
}
```

### 修改大小范围
```javascript
labelOptions: {
  fontSize: 14,
  sizeMinPixels: 10,  // 最小 10 像素
  sizeMaxPixels: 40   // 最大 40 像素
}
```

### 固定大小（禁用动态缩放）
```javascript
labelOptions: {
  getSize: 14,        // 使用固定大小
  sizeMinPixels: 14,
  sizeMaxPixels: 14
}
```

## 技术实现

### 核心方法

1. **handleViewStateChange**
   - 监听视图状态变化
   - 检测 zoom 级别变化

2. **updateTextLayersSize**
   - 遍历所有文本图层
   - 重新计算文本大小
   - 批量更新图层

3. **layerLabelOptions Map**
   - 保存每个图层的标签配置
   - 用于动态更新时恢复配置

### 更新触发条件

```javascript
// zoom 变化阈值
const ZOOM_THRESHOLD = 0.3;

// 从 zoom=8.0 到 zoom=8.3，触发更新
// 从 zoom=8.3 到 zoom=8.5，不触发（变化小于0.3）
// 从 zoom=8.5 到 zoom=8.9，触发更新
```

## 性能考虑

- **节流机制**: 只在 zoom 变化超过 0.3 时更新
- **批量操作**: 一次更新所有文本图层
- **增量更新**: 只更新文本图层，不影响地图图层
- **异步渲染**: deck.gl 自动优化渲染性能

## 与其他功能的协同

### 自动对比色
- 文本大小更新时，自动重新计算对比色
- 确保在新尺寸下依然清晰可读

### 地图适配
- 配合 `autoFit` 功能完美工作
- 初始渲染和缩放都使用最优文本大小

### 配色方案切换
- 切换配色时也会保持动态缩放
- 配置自动保存和恢复

## 最佳实践

1. **使用合理的基础大小**: 推荐 12-16px
2. **启用自动对比色**: `getColor: 'auto'`
3. **设置合理的像素范围**: 避免文本过大或过小
4. **测试不同缩放级别**: 确保在各个 zoom 下都可读

## 示例：完整配置

```javascript
mapRenderer.renderGeoJSON(geoJsonData, {
  id: 'city-layer',
  showLabels: true,
  colorScheme: {
    mode: 'category',
    categoryField: 'adcode',
    colors: [...],
    opacity: 180
  },
  labelOptions: {
    getColor: 'auto',           // 自动对比色
    fontSize: 14,               // 基础大小
    fontWeight: '600',          // 字体粗细
    sizeMinPixels: 8,          // 最小像素
    sizeMaxPixels: 40,         // 最大像素
    fontFamily: 'Microsoft YaHei'
  }
});
```

现在你的地图标签会智能地随着缩放调整大小！🎉
