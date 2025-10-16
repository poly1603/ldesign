# 配色方案动态更新功能

## 功能说明

现在可以直接更新地图图层的配色方案，无需重新渲染整个地图。

## 核心方法

### `updateColorScheme(layerId: string, colorScheme: ColorScheme)`

直接更新指定图层的配色方案。

**参数：**
- `layerId`: 图层 ID
- `colorScheme`: 颜色方案配置对象

## 使用示例

```javascript
// 初始化地图
const mapRenderer = new MapRenderer(container, {
  mode: '2d',
  autoFit: true
});

// 渲染 GeoJSON
mapRenderer.renderGeoJSON(geoJsonData, {
  id: 'my-layer',
  showLabels: true,
  colorScheme: {
    mode: 'gradient',
    startColor: [66, 165, 245],
    endColor: [255, 152, 0],
    opacity: 180
  }
});

// 稍后切换配色方案（不需要重新渲染）
mapRenderer.updateColorScheme('my-layer', {
  mode: 'category',
  categoryField: 'adcode',
  colors: [
    [26, 188, 156],
    [46, 204, 113],
    [52, 152, 219]
  ],
  opacity: 180
});
```

## 支持的配色模式

1. **单色模式 (single)**
   ```javascript
   {
     mode: 'single',
     color: [100, 149, 237, 180]
   }
   ```

2. **渐变色模式 (gradient)**
   ```javascript
   {
     mode: 'gradient',
     startColor: [66, 165, 245],
     endColor: [255, 152, 0],
     opacity: 180
   }
   ```

3. **分类色模式 (category)**
   ```javascript
   {
     mode: 'category',
     categoryField: 'adcode',
     colors: [[255, 0, 0], [0, 255, 0], [0, 0, 255]],
     opacity: 180
   }
   ```

4. **数据驱动模式 (data)**
   ```javascript
   {
     mode: 'data',
     dataField: 'adcode',  // 支持字符串和数字类型
     colorStops: [
       { value: 0, color: [68, 138, 255] },
       { value: 0.5, color: [255, 235, 59] },
       { value: 1, color: [255, 82, 82] }
     ],
     opacity: 180
   }
   ```

5. **随机色模式 (random)**
   ```javascript
   {
     mode: 'random',
     opacity: 180
   }
   ```

## 改进说明

### 1. 性能优化
- 使用 `updateColorScheme` 方法比清除并重新渲染快得多
- 只更新颜色属性，保留其他所有配置

### 2. 数据类型支持
- 数据驱动模式现在支持字符串类型的数据字段
- 自动将字符串转换为数字进行计算

### 3. 外部调用简化
- 外部代码只需调用一个方法
- 所有实现细节都在 MapRenderer 核心代码中处理

## 完整示例（main.js）

```javascript
// 颜色方案配置
const colorSchemes = {
  single: { mode: 'single', color: [100, 149, 237, 180] },
  gradient: {
    mode: 'gradient',
    startColor: [66, 165, 245],
    endColor: [255, 152, 0],
    opacity: 180
  },
  category: {
    mode: 'category',
    categoryField: 'adcode',
    colors: [[26, 188, 156], [46, 204, 113], [52, 152, 219]],
    opacity: 180
  }
};

// 切换配色方案的函数
function switchColorScheme(schemeName) {
  mapRenderer.updateColorScheme('my-layer', colorSchemes[schemeName]);
}

// 绑定按钮点击事件
document.getElementById('btn-single').onclick = () => switchColorScheme('single');
document.getElementById('btn-gradient').onclick = () => switchColorScheme('gradient');
document.getElementById('btn-category').onclick = () => switchColorScheme('category');
```
