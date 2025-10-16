# 地图标记点功能 API 文档

## 概述

MapRenderer 现已支持丰富的标记点功能，可以根据经纬度在地图上添加各种样式的标记点，并支持高度自定义。

## 主要特性

- ✅ **多种标记样式** - 圆形、方形、三角形、菱形、图钉、自定义图标
- ✅ **灵活的自定义选项** - 颜色、大小、透明度等
- ✅ **标签支持** - 为标记添加文本标签，支持样式自定义
- ✅ **交互功能** - 点击、悬停事件处理
- ✅ **批量操作** - 标记组、批量显示/隐藏、高亮等
- ✅ **动画支持** - pulse、bounce、spin 等动画效果
- ✅ **性能优化** - 自动按样式分组，优化渲染性能

## API 使用

### 1. 添加单个标记

```javascript
import { MapRenderer } from '@ldesign/map-renderer';

const mapRenderer = new MapRenderer(container, options);

// 添加一个简单标记
const markerId = mapRenderer.addMarker({
  position: [113.3241, 23.1063], // [经度, 纬度]
  style: 'pin',                   // 标记样式
  size: 20,                        // 大小
  color: [255, 0, 0, 255]         // 颜色 [R, G, B, A]
});
```

### 2. 标记配置选项

```typescript
interface MarkerOptions {
  id?: string;                    // 标记ID（可选，自动生成）
  position: [number, number];      // 位置 [经度, 纬度]
  style?: MarkerStyle;             // 样式类型
  size?: number;                   // 标记大小
  color?: number[] | Function;     // 颜色或颜色函数
  icon?: string | MarkerIconOptions; // 图标配置
  label?: MarkerLabelOptions;      // 标签配置
  animation?: MarkerAnimation;     // 动画类型
  animationDuration?: number;      // 动画持续时间
  opacity?: number;                // 透明度
  pickable?: boolean;              // 是否可交互
  visible?: boolean;               // 是否可见
  zIndex?: number;                 // 层级
  data?: any;                      // 自定义数据
  onClick?: Function;              // 点击回调
  onHover?: Function;              // 悬停回调
}
```

### 3. 标记样式类型

```typescript
type MarkerStyle = 
  | 'circle'   // 圆形
  | 'square'   // 方形
  | 'triangle' // 三角形
  | 'diamond'  // 菱形
  | 'pin'      // 图钉
  | 'icon'     // 自定义图标
  | 'custom';  // 完全自定义
```

### 4. 添加带标签的标记

```javascript
mapRenderer.addMarker({
  position: [113.3241, 23.1063],
  style: 'pin',
  size: 24,
  color: [255, 87, 34, 255],
  label: {
    text: '广州塔',
    offset: [0, -5],              // 标签偏移
    fontSize: 14,
    color: [33, 33, 33, 255],
    backgroundColor: [255, 255, 255, 200],
    backgroundPadding: [4, 2],
    visible: true
  },
  data: { 
    name: '广州塔',
    type: 'landmark'
  }
});
```

### 5. 使用自定义图标

```javascript
mapRenderer.addMarker({
  position: [113.28, 23.13],
  style: 'icon',
  icon: {
    url: 'https://example.com/icon.png',
    width: 32,
    height: 32,
    anchorX: 16,  // 锚点X坐标
    anchorY: 32   // 锚点Y坐标
  }
});
```

### 6. 批量添加标记

```javascript
const markers = [
  { position: [113.25, 23.12], style: 'circle', color: [255, 0, 0, 200] },
  { position: [113.30, 23.15], style: 'square', color: [0, 255, 0, 200] },
  { position: [113.35, 23.10], style: 'triangle', color: [0, 0, 255, 200] }
];

const markerIds = mapRenderer.addMarkers(markers);
```

### 7. 添加标记组

```javascript
mapRenderer.addMarkerGroup({
  id: 'city-markers',
  markers: [
    { position: [113.25, 23.12] },
    { position: [113.30, 23.15] },
    { position: [113.35, 23.10] }
  ],
  style: {
    style: 'circle',
    size: 15,
    color: [255, 140, 0, 200]
  }
});
```

### 8. 交互事件处理

```javascript
mapRenderer.addMarker({
  position: [113.28, 23.13],
  style: 'pin',
  onClick: (marker, event) => {
    console.log('Marker clicked:', marker.id);
    alert(`位置: ${marker.position[0]}, ${marker.position[1]}`);
  },
  onHover: (marker, event) => {
    console.log('Hovering over marker:', marker.id);
  }
});
```

### 9. 更新标记

```javascript
// 更新单个标记
mapRenderer.updateMarker(markerId, {
  color: [0, 255, 0, 255],
  size: 30,
  animation: 'pulse'
});

// 批量更新
const allMarkers = mapRenderer.getAllMarkers();
allMarkers.forEach(marker => {
  mapRenderer.updateMarker(marker.id, {
    visible: false
  });
});
```

### 10. 标记动画

```javascript
// 设置动画
mapRenderer.updateMarker(markerId, {
  animation: 'pulse',        // 'none' | 'pulse' | 'bounce' | 'spin'
  animationDuration: 1000    // 毫秒
});

// 批量设置动画
const markerIds = ['marker-1', 'marker-2', 'marker-3'];
markerIds.forEach(id => {
  mapRenderer.updateMarker(id, {
    animation: 'bounce',
    animationDuration: 2000
  });
});
```

### 11. 显示/隐藏标记

```javascript
// 隐藏单个标记
mapRenderer.setMarkerVisibility(markerId, false);

// 显示单个标记
mapRenderer.setMarkerVisibility(markerId, true);

// 批量操作
const markerIds = ['marker-1', 'marker-2'];
markerIds.forEach(id => {
  mapRenderer.setMarkerVisibility(id, false);
});
```

### 12. 高亮标记

```javascript
// 高亮标记
mapRenderer.highlightMarker(markerId, [255, 255, 0, 255]); // 黄色高亮

// 取消高亮
mapRenderer.unhighlightMarker(markerId);

// 临时高亮
mapRenderer.highlightMarker(markerId);
setTimeout(() => {
  mapRenderer.unhighlightMarker(markerId);
}, 2000); // 2秒后自动取消高亮
```

### 13. 查找标记

```javascript
// 根据条件查找标记
const landmarkMarkers = mapRenderer.findMarkers(marker => {
  return marker.data && marker.data.type === 'landmark';
});

// 获取所有标记
const allMarkers = mapRenderer.getAllMarkers();

// 获取单个标记
const marker = mapRenderer.getMarker(markerId);
```

### 14. 删除标记

```javascript
// 删除单个标记
mapRenderer.removeMarker(markerId);

// 删除标记组
mapRenderer.removeMarkerGroup('city-markers');

// 清空所有标记
mapRenderer.clearMarkers();
```

## 完整示例

```javascript
import { MapRenderer } from '@ldesign/map-renderer';

// 初始化地图
const mapRenderer = new MapRenderer('map-container', {
  mode: '2d',
  longitude: 113.28,
  latitude: 23.13,
  zoom: 10
});

// 定义地标数据
const landmarks = [
  {
    name: '广州塔',
    position: [113.3241, 23.1063],
    type: 'tower',
    height: 600
  },
  {
    name: '白云山',
    position: [113.3020, 23.1756],
    type: 'mountain',
    height: 382
  },
  {
    name: '珠江新城',
    position: [113.3210, 23.1188],
    type: 'cbd',
    buildings: 150
  }
];

// 添加地标标记
landmarks.forEach(landmark => {
  const markerId = mapRenderer.addMarker({
    position: landmark.position,
    style: landmark.type === 'mountain' ? 'triangle' : 'pin',
    size: 20,
    color: getColorByType(landmark.type),
    label: {
      text: landmark.name,
      fontSize: 14,
      offset: [0, -5],
      visible: true
    },
    data: landmark,
    onClick: (marker) => {
      showLandmarkInfo(marker.data);
    },
    onHover: (marker) => {
      mapRenderer.highlightMarker(marker.id);
    }
  });
});

// 根据类型获取颜色
function getColorByType(type) {
  const colors = {
    tower: [255, 87, 34, 255],    // 橙色
    mountain: [76, 175, 80, 255],  // 绿色
    cbd: [33, 150, 243, 255]       // 蓝色
  };
  return colors[type] || [128, 128, 128, 255];
}

// 显示地标信息
function showLandmarkInfo(landmark) {
  alert(`
    名称: ${landmark.name}
    类型: ${landmark.type}
    位置: ${landmark.position.join(', ')}
  `);
}

// 添加交互控制
document.getElementById('toggle-labels').addEventListener('click', () => {
  const markers = mapRenderer.getAllMarkers();
  markers.forEach(marker => {
    if (marker.label) {
      mapRenderer.updateMarker(marker.id, {
        label: { ...marker.label, visible: !marker.label.visible }
      });
    }
  });
});

// 添加动画效果
document.getElementById('animate-markers').addEventListener('click', () => {
  const markers = mapRenderer.getAllMarkers();
  markers.forEach(marker => {
    mapRenderer.updateMarker(marker.id, {
      animation: 'pulse',
      animationDuration: 2000
    });
  });
});
```

## 性能优化建议

1. **批量添加** - 使用 `addMarkers()` 或 `addMarkerGroup()` 批量添加标记
2. **样式分组** - 相同样式的标记会自动分组渲染，提高性能
3. **按需显示** - 使用 `setMarkerVisibility()` 控制标记显示，而不是频繁添加/删除
4. **合理使用标签** - 大量标签可能影响性能，可按需显示
5. **图标优化** - 使用合适大小的图标，避免过大的图片

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 注意事项

1. 经纬度坐标使用 `[经度, 纬度]` 格式
2. 颜色使用 RGBA 格式：`[R, G, B, A]`，取值范围 0-255
3. 标记 ID 如不指定会自动生成
4. 动画功能需要浏览器支持 CSS 动画
5. 图标 URL 需要支持跨域访问（CORS）