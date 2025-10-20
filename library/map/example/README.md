# Map Renderer 示例项目

## 🚀 快速启动

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

服务器将在 http://localhost:3002/ (或其他可用端口) 启动。

### 3. 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
example/
├── src/
│   ├── main.js              # 主示例代码
│   ├── advanced-demo.js     # 高级功能演示
│   ├── style.css            # 样式文件
│   └── maps/                # 地图数据
│       ├── china.json
│       ├── province/        # 省级地图
│       ├── city/            # 市级地图
│       └── district/        # 区县级地图
├── index.html               # 主示例页面
├── all-features.html        # 全功能演示页面
├── advanced-features.html   # 高级功能页面
├── test-ripple.html         # 水波纹测试页面
├── package.json
└── vite.config.js
```

## 🎯 示例页面说明

### 1. index.html - 主示例页面
完整的功能演示，包含7个标签页：

#### 📍 配色方案
- 单色模式
- 渐变色模式
- 分类色模式
- 随机色模式
- 数据驱动模式
- 自定义函数模式

#### 🎯 区域选择
- 禁用选择
- 单选模式
- 多选模式
- 自定义选中样式

#### 📌 标记点
- 添加地标
- 添加随机标记
- 水波纹动画标记
- 显示/隐藏控制
- 清除所有标记

#### 🔥 热力图
- 500点热力图
- 1000点热力图
- 彩色标记模拟

#### 🎯 智能聚类
- 1000点聚类
- 5000点聚类
- 自动聚类算法

#### 📏 测量工具
- 距离测量
- 面积测量
- 使用Haversine公式

#### 📸 地图导出
- PNG导出
- JPEG导出
- 高分辨率导出

### 2. all-features.html - 全功能演示
新增的综合演示页面，展示所有v2.2新功能：

#### 🎬 动画功能
- 旋转动画
- 缩放动画
- 30+种缓动函数演示

#### 📐 几何工具
- 距离测量
- 面积计算
- 方位角计算
- 缓冲区创建

#### 🔄 数据转换
- CSV转GeoJSON
- 统计计算
- 数据过滤

#### 📊 性能监控
- FPS监控
- 内存统计
- 性能压力测试

### 3. advanced-features.html - 高级功能页面
专注于高级API的使用示例

### 4. test-ripple.html - 水波纹测试
专门测试水波纹动画效果

## 🎨 功能演示

### 基础功能
```javascript
import { MapRenderer } from '@ldesign/map-renderer';

const mapRenderer = new MapRenderer('#map', {
  mode: '2d',
  autoFit: true,
  smoothZoom: true,
  showTooltip: true
});

// 加载地图数据
await mapRenderer.loadGeoJSON('./maps/city/440100.json', {
  colorScheme: {
    mode: 'gradient',
    startColor: [66, 165, 245],
    endColor: [255, 152, 0],
    opacity: 180
  },
  showLabels: true
});
```

### 动画演示
```javascript
import { animate, Easings } from '@ldesign/map-renderer';

// 缩放动画
animate({
  from: 6,
  to: 10,
  duration: 2000,
  easing: Easings.easeInOutCubic,
  onUpdate: (zoom) => {
    mapRenderer.setViewState({ zoom });
  }
});

// 旋转动画
const controller = new AnimationController();
controller.createAnimation('rotation', {
  duration: 3000,
  loop: false,
  onUpdate: (progress) => {
    mapRenderer.setViewState({ bearing: progress * 360 });
  }
});
```

### 标记点添加
```javascript
// 添加普通标记
mapRenderer.addMarker({
  position: [113.3241, 23.1063],
  style: 'star',
  size: 15,
  color: [255, 59, 48, 255],
  label: {
    text: '广州塔',
    fontSize: 14,
    color: [255, 255, 255, 255],
    backgroundColor: [33, 33, 33, 230],
    visible: true
  }
});

// 添加水波纹标记
mapRenderer.addMarker({
  position: [113.28, 23.13],
  style: 'circle',
  size: 15,
  color: [255, 0, 0, 255],
  animation: 'ripple'
});
```

### 几何计算
```javascript
import { GeometryUtils } from '@ldesign/map-renderer';

// 计算两点距离
const distance = GeometryUtils.haversineDistance(
  113.28, 23.13,  // 点1
  113.50, 23.25   // 点2
);
console.log(GeometryUtils.formatDistance(distance)); // "25.3 km"

// 计算多边形面积
const polygon = [
  [113.28, 23.13],
  [113.32, 23.13],
  [113.32, 23.16],
  [113.28, 23.16],
  [113.28, 23.13]
];
const area = GeometryUtils.polygonArea(polygon);
console.log(GeometryUtils.formatArea(area)); // "158.5 km²"

// 计算方位角
const bearing = GeometryUtils.bearing(
  113.28, 23.13,
  113.50, 23.25
);
console.log(`方位角: ${bearing.toFixed(2)}°`);
```

### 数据转换
```javascript
import { DataTransformer } from '@ldesign/map-renderer';

// CSV转GeoJSON
const csvData = `
name,longitude,latitude,value
广州塔,113.3241,23.1063,100
白云山,113.3020,23.1756,85
`;

const geoJSON = DataTransformer.csvToGeoJSON(
  csvData, 
  'longitude', 
  'latitude'
);

// 计算统计
const stats = DataTransformer.calculateStatistics(geoJSON, 'value');
console.log(stats); 
// { min: 85, max: 100, mean: 92.5, median: 92.5, sum: 185, count: 2 }

// GeoJSON转CSV
const csv = DataTransformer.geoJSONToCSV(geoJSON);
console.log(csv);
```

### 性能监控
```javascript
import { PerformanceMonitor, MemoryManager } from '@ldesign/map-renderer';

// 性能监控
const monitor = new PerformanceMonitor(container, {
  position: 'top-left',
  showFPS: true,
  showMemory: true
});

// 内存管理
const memoryManager = new MemoryManager({
  maxMemoryMB: 500,
  autoCleanup: true,
  onMemoryWarning: (usage) => {
    console.warn(`内存警告: ${usage.toFixed(2)}%`);
  }
});
memoryManager.startMonitoring();
```

## 🎯 使用技巧

### 1. 选择合适的配色方案
- **单色**: 适合简单展示
- **渐变**: 适合数值范围展示
- **分类**: 适合类别区分
- **数据驱动**: 适合复杂数据可视化

### 2. 优化大数据量渲染
```javascript
// 使用聚类
import { ClusterManager } from '@ldesign/map-renderer';

const clusterManager = new ClusterManager({
  radius: 40,
  extent: 512
});

// 添加点
points.forEach(point => {
  clusterManager.addPoint({
    coordinates: point.position,
    properties: point.data
  });
});

// 获取聚类结果
const clusters = clusterManager.getClusters({ zoom: 8 });
```

### 3. 自定义动画
```javascript
import { AnimationController, Easings } from '@ldesign/map-renderer';

const controller = new AnimationController();

// 创建自定义缓动函数
const customEasing = (t) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

controller.createAnimation('custom', {
  duration: 2000,
  easing: customEasing,
  onUpdate: (progress) => {
    // 自定义动画逻辑
  }
});
```

## 🐛 常见问题

### Q: 地图不显示？
A: 检查容器元素是否有高度，确保CSS设置了 `height` 属性。

### Q: 标记点不显示？
A: 确保坐标格式正确 `[longitude, latitude]`，经度在前，纬度在后。

### Q: 性能问题？
A: 使用聚类功能处理大量标记点，启用 `LayerCache` 缓存图层。

### Q: 内存泄漏？
A: 使用 `MemoryManager` 监控内存，在组件卸载时调用 `destroy()` 方法。

## 📚 相关文档

- [主文档](../README.md)
- [API文档](../docs/MARKER_API.md)
- [配色方案文档](../docs/COLOR_SCHEME_UPDATE.md)
- [性能优化指南](../docs/ENHANCEMENTS.md)
- [示例说明](../docs/EXAMPLES.md)

## 🤝 贡献

欢迎提交问题和改进建议！

## 📄 许可证

MIT
