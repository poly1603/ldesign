# 使用示例

本文档提供各种功能的完整使用示例。

## 目录

1. [基础地图渲染](#基础地图渲染)
2. [热力图](#热力图)
3. [路径和轨迹](#路径和轨迹)
4. [标记聚类](#标记聚类)
5. [测量工具](#测量工具)
6. [地图导出](#地图导出)
7. [图例](#图例)
8. [事件监听](#事件监听)
9. [综合示例](#综合示例)

---

## 基础地图渲染

### 简单的2D地图

```typescript
import { MapRenderer } from '@ldesign/map-renderer';

const mapRenderer = new MapRenderer('#map', {
  mode: '2d',
  longitude: 113.3,
  latitude: 23.1,
  zoom: 8,
  smoothZoom: true
});

await mapRenderer.loadGeoJSON('data/guangdong.json', {
  showLabels: true,
  colorScheme: {
    mode: 'single',
    color: [100, 150, 250, 180]
  }
});
```

### 3D地图with自定义颜色

```typescript
const mapRenderer = new MapRenderer('#map', {
  mode: '3d',
  autoFit: true
});

await mapRenderer.loadGeoJSON('data/city.json', {
  showLabels: true,
  colorScheme: {
    mode: 'gradient',
    startColor: [66, 165, 245],
    endColor: [255, 152, 0],
    opacity: 200
  },
  getElevation: (feature) => {
    // 根据人口设置高度
    return feature.properties.population * 0.1;
  }
});
```

---

## 热力图

### 基础热力图

```typescript
import { HeatmapRenderer } from '@ldesign/map-renderer';

const heatmapRenderer = new HeatmapRenderer();

// 添加热力图数据
const heatmapId = heatmapRenderer.addHeatmap({
  data: [
    { position: [113.28, 23.13], weight: 100 },
    { position: [113.32, 23.12], weight: 80 },
    { position: [113.30, 23.15], weight: 120 },
    // ... 更多数据点
  ],
  intensity: 1,
  threshold: 0.05,
  radiusPixels: 30,
  colorRange: [
    [255, 255, 204],  // 低密度 - 浅黄
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]      // 高密度 - 深红
  ]
});

// 将热力图图层添加到地图
const layers = heatmapRenderer.getLayers();
layers.forEach(layer => mapRenderer.addLayer(layer));
```

### 动态热力图

```typescript
// 根据时间段更新热力图数据
function updateHeatmap(timeRange) {
  const filteredData = allData.filter(point => 
    point.timestamp >= timeRange.start && 
    point.timestamp <= timeRange.end
  );
  
  heatmapRenderer.updateHeatmap(heatmapId, {
    data: filteredData,
    intensity: 1.5  // 增强显示效果
  });
}

// 绑定时间滑块
document.querySelector('#time-slider').addEventListener('input', (e) => {
  const value = e.target.value;
  updateHeatmap(getTimeRange(value));
});
```

---

## 路径和轨迹

### 绘制路线

```typescript
import { PathRenderer } from '@ldesign/map-renderer';

const pathRenderer = new PathRenderer();

// 添加路径
pathRenderer.addPath({
  data: [{
    path: [
      [113.28, 23.13],
      [113.32, 23.15],
      [113.35, 23.12],
      [113.40, 23.14]
    ],
    name: '公交线路1',
    color: [255, 0, 0, 255],
    width: 3
  }],
  widthMinPixels: 2,
  widthMaxPixels: 10,
  rounded: true,
  animated: true  // 启用动画
});
```

### 绘制弧线连接

```typescript
// 显示城市间的连接关系
pathRenderer.addArc({
  data: [
    {
      sourcePosition: [113.28, 23.13],  // 广州
      targetPosition: [114.06, 22.54],  // 深圳
      color: [0, 128, 255, 200]
    },
    {
      sourcePosition: [113.28, 23.13],  // 广州
      targetPosition: [116.40, 39.90],  // 北京
      color: [255, 128, 0, 200]
    }
  ],
  greatCircle: true,  // 使用大圆路径
  getHeight: (d) => 0.2,  // 弧线高度
  getWidth: 3
});

// 获取所有图层
const layers = pathRenderer.getLayers();
layers.forEach(layer => mapRenderer.addLayer(layer));
```

---

## 标记聚类

### 自动聚类

```typescript
import { ClusterManager } from '@ldesign/map-renderer';

const clusterManager = new ClusterManager();

// 准备标记数据
const markerData = [
  { position: [113.28, 23.13], weight: 1 },
  { position: [113.29, 23.14], weight: 1 },
  { position: [113.30, 23.13], weight: 2 },
  // ... 数百或数千个点
];

// 添加聚类
const clusterId = clusterManager.addCluster({
  data: markerData,
  radius: 60,           // 聚类半径（像素）
  minPoints: 2,         // 最小聚类点数
  maxZoom: 15,          // 超过此级别不再聚类
  showCount: true,      // 显示聚类点数
  clusterColor: [0, 140, 255, 200],
  pointColor: [255, 100, 0, 200]
});

// 监听缩放变化，更新聚类
mapRenderer.on('zoomEnd', (event) => {
  const zoom = event.data.zoom;
  const layers = clusterManager.getLayers(zoom);
  // 更新图层...
});

// 获取聚类统计
const stats = clusterManager.getStats(clusterId, 10);
console.log('聚类统计:', stats);
// { totalPoints: 1000, clusterCount: 50, avgClusterSize: 20, maxClusterSize: 100 }
```

---

## 测量工具

### 距离测量

```typescript
import { 
  MeasurementTool,
  calculateDistance,
  formatDistance 
} from '@ldesign/map-renderer';

// 方法1: 直接计算
const distance = calculateDistance(
  [113.28, 23.13],  // 点1
  [113.40, 23.20]   // 点2
);
console.log(formatDistance(distance));  // "15.32 km"

// 方法2: 使用测量工具
const distanceTool = new MeasurementTool('distance', (result) => {
  document.querySelector('#result').textContent = 
    `距离: ${result.formatted}`;
});

// 激活测量
distanceTool.activate();

// 监听地图点击
mapRenderer.on('click', (event) => {
  if (distanceTool.isActivated()) {
    distanceTool.addPoint(event.data.coordinate);
  }
});

// 完成测量
document.querySelector('#finish-btn').addEventListener('click', () => {
  const result = distanceTool.finish();
  if (result) {
    console.log('测量结果:', result);
  }
});
```

### 面积测量

```typescript
import { 
  MeasurementTool,
  calculatePolygonArea,
  formatArea 
} from '@ldesign/map-renderer';

// 创建面积测量工具
const areaTool = new MeasurementTool('area', (result) => {
  document.querySelector('#area-result').textContent = 
    `面积: ${result.formatted}`;
});

areaTool.activate();

// 添加多个点形成多边形
const points = [
  [113.28, 23.13],
  [113.32, 23.13],
  [113.32, 23.16],
  [113.28, 23.16]
];

points.forEach(point => areaTool.addPoint(point));

// 完成测量
const result = areaTool.finish();
console.log(formatArea(result.value));  // "12.34 km²"
```

---

## 地图导出

### 导出为图片

```typescript
import { ExportUtil } from '@ldesign/map-renderer';

// 导出为PNG
document.querySelector('#export-png').addEventListener('click', async () => {
  await ExportUtil.downloadAsImage(mapRenderer.getDeck(), {
    format: 'png',
    filename: `map-${Date.now()}.png`,
    scale: 2  // 2x分辨率
  });
});

// 导出为JPEG
document.querySelector('#export-jpg').addEventListener('click', async () => {
  await ExportUtil.downloadAsImage(mapRenderer.getDeck(), {
    format: 'jpeg',
    quality: 0.95,
    filename: 'map.jpg'
  });
});

// 导出为Base64（用于上传）
async function uploadMapImage() {
  const base64 = await ExportUtil.exportToBase64(mapRenderer.getDeck(), {
    format: 'png',
    scale: 1
  });
  
  // 上传到服务器
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 })
  });
}
```

### 打印地图

```typescript
document.querySelector('#print-btn').addEventListener('click', async () => {
  await ExportUtil.print(mapRenderer.getDeck(), {
    scale: 2  // 高分辨率打印
  });
});
```

### 复制到剪贴板

```typescript
document.querySelector('#copy-btn').addEventListener('click', async () => {
  try {
    await ExportUtil.copyToClipboard(mapRenderer.getDeck());
    alert('地图已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
  }
});
```

---

## 图例

### 自动图例

```typescript
import { Legend } from '@ldesign/map-renderer';

// 从颜色方案自动生成图例
const legend = new Legend(mapContainer, {
  title: '人口密度分布',
  position: 'bottom-right',
  colorScheme: {
    mode: 'data',
    dataField: 'population',
    colorStops: [
      { value: 0, color: [68, 138, 255] },
      { value: 500, color: [255, 235, 59] },
      { value: 1000, color: [255, 82, 82] }
    ]
  }
});
```

### 自定义图例

```typescript
const legend = new Legend(mapContainer, {
  title: '地区类型',
  position: 'top-right',
  items: [
    { label: '住宅区', color: [100, 200, 100] },
    { label: '商业区', color: [200, 100, 100] },
    { label: '工业区', color: [150, 150, 200] },
    { label: '公园绿地', color: [50, 150, 50] }
  ],
  width: 180,
  style: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  }
});

// 动态更新
legend.update({
  title: '新标题',
  items: [/* 新的图例项 */]
});

// 显示/隐藏
document.querySelector('#toggle-legend').addEventListener('click', () => {
  legend.toggle();
});
```

---

## 事件监听

### 基础事件

```typescript
import { EventManager } from '@ldesign/map-renderer';

const eventManager = new EventManager();

// 监听缩放事件
eventManager.on('zoomEnd', (event) => {
  console.log('当前缩放级别:', event.data.zoom);
  updateUIBasedOnZoom(event.data.zoom);
});

// 监听平移事件
eventManager.on('panEnd', (event) => {
  console.log('地图中心:', event.data.longitude, event.data.latitude);
});

// 监听点击事件
eventManager.on('click', (event) => {
  console.log('点击位置:', event.data.coordinate);
  showPopup(event.data);
});
```

### 一次性事件

```typescript
// 只监听一次加载完成事件
eventManager.once('load', (event) => {
  console.log('地图加载完成');
  hideLoadingSpinner();
});
```

### 移除监听

```typescript
// 方法1: 使用返回的取消函数
const unsubscribe = eventManager.on('hover', handleHover);
// 稍后移除
unsubscribe();

// 方法2: 直接移除
eventManager.off('hover', handleHover);

// 方法3: 移除所有监听
eventManager.removeAllListeners();
```

---

## 综合示例

### 完整的数据可视化应用

```typescript
import {
  MapRenderer,
  HeatmapRenderer,
  PathRenderer,
  ClusterManager,
  Legend,
  EventManager,
  Logger,
  LogLevel,
  ExportUtil
} from '@ldesign/map-renderer';

class DataVisualizationApp {
  constructor() {
    // 初始化日志
    this.logger = Logger.getInstance();
    this.logger.setLevel(LogLevel.INFO);
    
    // 创建事件管理器
    this.eventManager = new EventManager();
    
    // 创建地图
    this.mapRenderer = new MapRenderer('#map', {
      mode: '2d',
      autoFit: true,
      smoothZoom: true,
      selectionMode: 'single',
      showTooltip: false
    });
    
    // 创建渲染器
    this.heatmapRenderer = new HeatmapRenderer();
    this.pathRenderer = new PathRenderer();
    this.clusterManager = new ClusterManager();
    
    this.initEventListeners();
  }
  
  async init() {
    try {
      // 加载地图数据
      await this.loadMapData();
      
      // 加载热力数据
      await this.loadHeatmapData();
      
      // 加载路径数据
      await this.loadPathData();
      
      // 加载标记数据
      await this.loadMarkerData();
      
      // 创建图例
      this.createLegend();
      
      this.logger.info('应用初始化完成');
    } catch (error) {
      this.logger.error('初始化失败', error);
    }
  }
  
  async loadMapData() {
    await this.mapRenderer.loadGeoJSON('data/map.json', {
      showLabels: true,
      colorScheme: {
        mode: 'gradient',
        startColor: [66, 165, 245],
        endColor: [255, 152, 0]
      }
    });
  }
  
  async loadHeatmapData() {
    const response = await fetch('data/heatmap.json');
    const data = await response.json();
    
    this.heatmapRenderer.addHeatmap({
      data,
      intensity: 1.5,
      radiusPixels: 30
    });
    
    const layers = this.heatmapRenderer.getLayers();
    layers.forEach(layer => this.mapRenderer.addLayer(layer));
  }
  
  async loadPathData() {
    const response = await fetch('data/routes.json');
    const routes = await response.json();
    
    this.pathRenderer.addPath({
      data: routes,
      animated: true
    });
  }
  
  async loadMarkerData() {
    const response = await fetch('data/markers.json');
    const markers = await response.json();
    
    this.clusterManager.addCluster({
      data: markers,
      radius: 60,
      minPoints: 2,
      showCount: true
    });
  }
  
  createLegend() {
    this.legend = new Legend(document.querySelector('#map'), {
      title: '数据分布',
      position: 'bottom-right',
      colorScheme: this.mapRenderer.getColorScheme()
    });
  }
  
  initEventListeners() {
    // 缩放事件
    this.eventManager.on('zoomEnd', (event) => {
      const zoom = event.data.zoom;
      const layers = this.clusterManager.getLayers(zoom);
      // 更新聚类图层
    });
    
    // 导出按钮
    document.querySelector('#export-btn').addEventListener('click', () => {
      this.exportMap();
    });
    
    // 切换模式按钮
    document.querySelector('#toggle-mode').addEventListener('click', () => {
      const currentMode = this.mapRenderer.getMode();
      this.mapRenderer.setMode(currentMode === '2d' ? '3d' : '2d');
    });
  }
  
  async exportMap() {
    try {
      await ExportUtil.downloadAsImage(this.mapRenderer.getDeck(), {
        format: 'png',
        filename: `visualization-${Date.now()}.png`,
        scale: 2
      });
      this.logger.info('地图导出成功');
    } catch (error) {
      this.logger.error('地图导出失败', error);
    }
  }
}

// 启动应用
const app = new DataVisualizationApp();
app.init();
```

---

## 更多示例

查看 [example](../example/) 目录获取更多实际运行的示例代码。

## 相关文档

- [功能增强文档](./ENHANCEMENTS.md)
- [API 参考](./API.md)
- [README](../README.md)









