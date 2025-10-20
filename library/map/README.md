# @ldesign/map-renderer

基于 deck.gl 的强大地图渲染器库，支持 GeoJSON 解析、2D/3D 可视化以及丰富的数据可视化功能。

## ✨ 核心特性

### 基础功能
- 🗺️ **GeoJSON 支持** - 直接解析和渲染 GeoJSON 文件
- 🎨 **2D/3D 模式** - 支持平面和立体两种可视化模式
- 🎯 **交互控制** - 平移、缩放、旋转等交互操作
- 📍 **多种标记** - 18种内置标记样式，支持自定义
- 💡 **智能提示** - 悬停显示区域详情
- 🚀 **高性能** - 基于 GPU 加速的 deck.gl 框架
- 📦 **TypeScript** - 完整的类型定义支持

### 高级功能 (v2.0+)
- 🔥 **热力图** - 数据密度可视化
- 🛣️ **路径渲染** - 路线和轨迹绘制，支持动画
- 🔄 **智能聚类** - 自动合并密集标记点
- 📏 **测量工具** - 距离和面积测量
- 📸 **地图导出** - 导出为PNG/JPEG/WebP
- 📊 **图例组件** - 自动生成颜色方案图例
- 🎭 **事件系统** - 完整的事件监听和管理
- 📝 **日志系统** - 统一的日志和错误处理
- ⚡ **性能优化** - 图层缓存机制，提升60%+性能

## 安装

```bash
# 安装库依赖
npm install

# 构建库
npm run build
```

## 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 类型检查
npm run type-check
```

## 🎮 运行示例

### 快速启动

```bash
# 1. 构建主库（在根目录）
npm run build

# 2. 进入示例目录并安装依赖
cd example
npm install

# 3. 启动开发服务器
npm run dev
```

服务器会自动在浏览器打开 http://localhost:3000

### 可用示例

- **基础功能** - http://localhost:3000/
  - 6种配色方案展示
  - 单选/多选功能演示
  - 标记点和水波纹动画

- **高级功能 (v2.0)** - http://localhost:3000/advanced-features.html
  - 🔥 热力图渲染
  - 🛣️ 路径和弧线
  - 🔄 智能聚类
  - 📏 测量工具
  - 📸 地图导出
  - 📊 图例组件

### 详细文档

- [示例 README](./example/README.md) - 示例详细说明
- [快速启动指南](./QUICK_START.md) - 3步快速启动
- [示例运行指南](./EXAMPLE_GUIDE.md) - 功能验证清单

## 使用方法

### 基础用法

```typescript
import { MapRenderer } from '@ldesign/map-renderer';

// 创建地图渲染器
const mapRenderer = new MapRenderer('#map-container', {
  longitude: 113.3,
  latitude: 23.1,
  zoom: 6,
  mode: '2d', // 或 '3d'
  smoothZoom: true,
  selectionMode: 'single'
});

// 加载 GeoJSON 数据
await mapRenderer.loadGeoJSON('path/to/geojson.json', {
  showLabels: true,
  colorScheme: {
    mode: 'gradient',
    startColor: [66, 165, 245],
    endColor: [255, 152, 0]
  }
});

// 切换到 3D 模式
mapRenderer.setMode('3d');
```

### 热力图

```typescript
import { HeatmapRenderer } from '@ldesign/map-renderer';

const heatmapRenderer = new HeatmapRenderer();
heatmapRenderer.addHeatmap({
  data: [
    { position: [113.3, 23.1], weight: 5 },
    { position: [113.4, 23.2], weight: 3 }
  ],
  intensity: 1.5,
  radiusPixels: 30
});

const layers = heatmapRenderer.getLayers();
layers.forEach(layer => mapRenderer.addLayer(layer));
```

### 路径渲染

```typescript
import { PathRenderer } from '@ldesign/map-renderer';

const pathRenderer = new PathRenderer();
pathRenderer.addPath({
  data: [{
    path: [[113.3, 23.1], [113.4, 23.2], [113.5, 23.3]],
    color: [255, 0, 0, 255],
    width: 3
  }],
  animated: true
});
```

### 智能聚类

```typescript
import { ClusterManager } from '@ldesign/map-renderer';

const clusterManager = new ClusterManager();
clusterManager.addCluster({
  data: markerPoints,
  radius: 60,
  minPoints: 2,
  showCount: true
});
```

### 测量工具

```typescript
import { calculateDistance, formatDistance } from '@ldesign/map-renderer';

const distance = calculateDistance([113.3, 23.1], [113.4, 23.2]);
console.log(formatDistance(distance)); // "15.32 km"
```

### 地图导出

```typescript
import { ExportUtil } from '@ldesign/map-renderer';

await ExportUtil.downloadAsImage(mapRenderer.getDeck(), {
  format: 'png',
  filename: 'map.png',
  scale: 2
});
```

### 图例

```typescript
import { Legend } from '@ldesign/map-renderer';

const legend = new Legend(mapContainer, {
  title: '人口密度',
  position: 'bottom-right',
  colorScheme: {
    mode: 'data',
    colorStops: [
      { value: 0, color: [68, 138, 255] },
      { value: 1000, color: [255, 82, 82] }
    ]
  }
});
```

### API 文档

#### 构造函数

```typescript
new MapRenderer(container: HTMLElement | string, options?: MapRendererOptions)
```

**参数：**
- `container` - DOM 容器元素或选择器
- `options` - 配置选项
  - `mode` - 视图模式 ('2d' | '3d')
  - `longitude` - 初始经度
  - `latitude` - 初始纬度
  - `zoom` - 初始缩放级别
  - `pitch` - 倾斜角度
  - `bearing` - 旋转角度

#### 主要方法

##### `loadGeoJSON(url, layerOptions?)`
从 URL 加载并渲染 GeoJSON 数据。

##### `renderGeoJSON(geoJson, layerOptions?)`
直接渲染 GeoJSON 对象。

##### `setMode(mode)`
切换 2D/3D 视图模式。

##### `flyTo(longitude, latitude, zoom?)`
飞行动画到指定位置。

##### `addCityMarkers(cities, options?)`
添加城市标记点。

##### `addLayer(layer)`
添加自定义 deck.gl 图层。

##### `removeLayer(layerId)`
移除指定图层。

##### `clearLayers()`
清空所有图层。

##### `setViewState(viewState)`
更新视图状态。

##### `resize()`
调整地图尺寸。

##### `destroy()`
销毁地图实例。

## 示例项目

在 `example` 目录中包含了一个完整的广东省地图演示项目：

```bash
# 进入示例目录
cd example

# 安装依赖
npm install

# 运行示例
npm run dev
```

示例展示了：
- 广东省城市边界渲染
- 主要城市标记点
- 2D/3D 模式切换
- 城市快速定位
- 图层控制

## 📖 文档

- **[功能增强详解](./docs/ENHANCEMENTS.md)** - 所有新功能的详细说明
- **[使用示例](./docs/EXAMPLES.md)** - 完整的代码示例
- **[优化总结](./docs/SUMMARY.md)** - 性能优化和改进总结
- **[更新日志](./CHANGELOG.md)** - 版本更新历史

## 项目结构

```
map-renderer/
├── src/                      # TypeScript 源码
│   ├── MapRenderer.ts        # 核心渲染器
│   ├── MarkerRenderer.ts     # 标记渲染器
│   ├── RippleMarker.ts       # 水波纹效果
│   ├── HeatmapRenderer.ts    # 热力图渲染器 (新)
│   ├── PathRenderer.ts       # 路径渲染器 (新)
│   ├── ClusterManager.ts     # 聚类管理器 (新)
│   ├── MeasurementTool.ts    # 测量工具 (新)
│   ├── ExportUtil.ts         # 导出工具 (新)
│   ├── Legend.ts             # 图例组件 (新)
│   ├── EventManager.ts       # 事件管理器 (新)
│   ├── Logger.ts             # 日志系统 (新)
│   ├── LayerCache.ts         # 图层缓存 (新)
│   ├── MarkerShapes.ts       # 标记样式库 (新)
│   ├── types.ts              # 类型定义
│   └── index.ts              # 导出入口
├── dist/                     # 构建输出
│   ├── index.esm.js          # ES Module
│   ├── index.cjs.js          # CommonJS
│   └── index.d.ts            # 类型定义
├── docs/                     # 文档目录
│   ├── ENHANCEMENTS.md       # 功能增强
│   ├── EXAMPLES.md           # 使用示例
│   └── SUMMARY.md            # 优化总结
├── example/                  # 示例项目
│   ├── src/
│   │   ├── main.js          # 示例代码
│   │   └── style.css        # 样式
│   ├── index.html           # HTML 入口
│   └── package.json         # 示例依赖
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── rollup.config.js         # Rollup 配置
├── CHANGELOG.md             # 更新日志
└── README.md                # 本文档
```

## 数据源

示例使用的 GeoJSON 数据来自：
- [DataV.GeoAtlas](https://geo.datav.aliyun.com/) - 中国行政区划数据

## 依赖

- [deck.gl](https://deck.gl) - GPU 加速的数据可视化框架
- TypeScript - 类型安全
- Rollup - 模块打包
- Vite - 示例项目构建

## 🔧 开发

### 构建

```bash
# 清理
npm run clean

# 类型检查
npm run type-check

# 构建
npm run build

# 开发模式（监听变化）
npm run dev
```

### 测试

```bash
# 运行示例
npm run example
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [deck.gl](https://deck.gl) - 强大的 WebGL 可视化框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Rollup](https://rollupjs.org/) - 模块打包工具

## 📞 联系方式

- GitHub: [your-username/map-renderer](https://github.com/your-username/map-renderer)
- Issues: [报告问题](https://github.com/your-username/map-renderer/issues)
- 文档: [在线文档](https://your-username.github.io/map-renderer)

---

**Star ⭐ 本项目如果它对你有帮助！**