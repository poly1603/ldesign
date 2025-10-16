# @ldesign/map-renderer

基于 deck.gl 的地图渲染器库，支持 GeoJSON 解析和 2D/3D 可视化。

## 特性

- 🗺️ **GeoJSON 支持** - 直接解析和渲染 GeoJSON 文件
- 🎨 **2D/3D 模式** - 支持平面和立体两种可视化模式
- 🎯 **交互控制** - 平移、缩放、旋转等交互操作
- 📍 **城市标记** - 可自定义的城市标记点
- 💡 **工具提示** - 悬停显示区域详情
- 🚀 **高性能** - 基于 GPU 加速的 deck.gl 框架
- 📦 **TypeScript** - 完整的类型定义支持

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

# 运行示例项目
npm run example
```

## 使用方法

### 基础用法

```typescript
import { MapRenderer } from '@ldesign/map-renderer';

// 创建地图渲染器
const mapRenderer = new MapRenderer('#map-container', {
  longitude: 113.3,
  latitude: 23.1,
  zoom: 6,
  mode: '2d' // 或 '3d'
});

// 加载 GeoJSON 数据
await mapRenderer.loadGeoJSON('path/to/geojson.json');

// 切换到 3D 模式
mapRenderer.setMode('3d');
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

## 项目结构

```
map-renderer/
├── src/                    # TypeScript 源码
│   ├── MapRenderer.ts      # 主类
│   ├── types.ts           # 类型定义
│   └── index.ts           # 导出入口
├── dist/                  # 构建输出
│   ├── index.esm.js       # ES Module
│   ├── index.cjs.js       # CommonJS
│   └── index.d.ts         # 类型定义
├── example/               # 示例项目
│   ├── src/
│   │   ├── main.js       # 示例代码
│   │   └── style.css     # 样式
│   ├── index.html        # HTML 入口
│   └── package.json      # 示例依赖
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
└── rollup.config.js      # Rollup 配置
```

## 数据源

示例使用的 GeoJSON 数据来自：
- [DataV.GeoAtlas](https://geo.datav.aliyun.com/) - 中国行政区划数据

## 依赖

- [deck.gl](https://deck.gl) - GPU 加速的数据可视化框架
- TypeScript - 类型安全
- Rollup - 模块打包
- Vite - 示例项目构建

## License

MIT