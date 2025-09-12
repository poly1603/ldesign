# @ldesign/map

[![npm version](https://badge.fury.io/js/%40ldesign%2Fmap.svg)](https://badge.fury.io/js/%40ldesign%2Fmap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

基于 OpenLayers 的通用地图插件，支持多种地图类型、框架兼容性和丰富的地图功能。提供简洁易用的 API 接口，适用于各种 Web 应用场景。

## ✨ 特性

- 🗺️ **多种地图类型** - 支持 OSM、XYZ、WMS、WMTS、矢量地图、热力图等
- 🌐 **丰富地图服务** - 内置 15+ 种地图服务，包括 OpenStreetMap、Google Maps、CartoDB、Stamen、天地图等
- 🎯 **框架兼容** - 支持 Vue、React、Angular 等任意前端框架
- 📍 **标记管理** - 支持标记点、弹窗、聚类等功能
- 🎨 **图层管理** - 灵活的图层添加、删除、显示控制
- 🎪 **事件系统** - 完善的事件监听和处理机制
- 🎨 **绘制工具** - 支持点、线、面、圆等几何图形绘制
- 🎭 **主题系统** - 内置多套主题，支持自定义样式
- 📱 **响应式** - 完美适配移动端和桌面端
- ⚡ **高性能** - 支持地图懒加载、瓦片缓存、视口优化
- 🔧 **TypeScript** - 完整的类型定义支持
- 🧪 **完整测试** - 单元测试和集成测试覆盖
- 🎨 **样式定制** - 遵循 LDESIGN 设计系统，支持主题定制

## 📦 安装

```bash
# npm
npm install @ldesign/map

# yarn
yarn add @ldesign/map

# pnpm
pnpm add @ldesign/map
```

## 🚀 快速开始

### 基础使用

```typescript
import { LDesignMap, LayerType } from '@ldesign/map'

// 创建地图实例
const map = new LDesignMap({
  container: 'map', // 地图容器 ID 或 DOM 元素
  center: [116.404, 39.915], // 北京 [经度, 纬度]
  zoom: 10,
  theme: 'default'
})

// 添加 OSM 图层
await map.getLayerManager().addLayer({
  id: 'osm',
  name: 'OpenStreetMap',
  type: LayerType.OSM,
  visible: true
})

// 添加标记点
map.getMarkerManager().addMarker({
  id: 'marker1',
  coordinate: [116.404, 39.915],
  title: '北京',
  popup: {
    content: '<h3>北京</h3><p>中华人民共和国首都</p>'
  }
})
```

### Vue 3 使用

```vue
<template>
  <LDesignMapComponent
    :center="[116.404, 39.915]"
    :zoom="10"
    :access-token="accessToken"
    @map-ready="onMapReady"
  />
</template>

<script setup>
import { LDesignMapComponent } from '@ldesign/map/vue'

const accessToken = 'your-mapbox-token'

const onMapReady = (map) => {
  map.addMarker({
    lngLat: [116.404, 39.915],
    popup: { content: '北京' }
  })
}
</script>
```

### React 使用

```tsx
import React from 'react'
import { LDesignMapComponent } from '@ldesign/map/react'

function App() {
  const handleMapReady = (map) => {
    map.addMarker({
      lngLat: [116.404, 39.915],
      popup: { content: '北京' }
    })
  }

  return (
    <LDesignMapComponent
      center={[116.404, 39.915]}
      zoom={10}
      accessToken="your-mapbox-token"
      onMapReady={handleMapReady}
    />
  )
}
```

## 🌐 地图服务

### 使用预定义地图服务

```typescript
import {
  LDesignMap,
  MAP_SERVICES,
  getServiceById,
  createLayerConfigWithApiKey
} from '@ldesign/map'

// 创建地图实例
const map = new LDesignMap({
  container: 'map-container',
  center: [116.404, 39.915],
  zoom: 10
})

// 使用 OpenStreetMap 标准地图
const osmService = getServiceById('osm-standard')
await map.getLayerManager().addLayer(osmService.layerConfig)

// 使用 CartoDB 深色地图
const cartoDarkService = getServiceById('cartodb-dark')
await map.getLayerManager().addLayer(cartoDarkService.layerConfig)

// 使用需要 API Key 的服务（如天地图）
const tiandituService = getServiceById('tianditu-vec')
const layerConfig = createLayerConfigWithApiKey('tianditu-vec', 'your-api-key')
await map.getLayerManager().addLayer(layerConfig)
```

### 可用地图服务

#### 街道地图
- **OpenStreetMap 标准** - 开源的世界地图，详细的街道信息
- **OpenStreetMap 人道主义** - 适合人道主义用途的地图样式
- **CartoDB Positron** - 简洁的浅色地图样式
- **CartoDB Dark Matter** - 简洁的深色地图样式
- **Stamen Watercolor** - 水彩风格的艺术地图
- **Google 街道地图** - Google Maps 街道地图

#### 卫星地图
- **天地图影像** - 国家地理信息公共服务平台卫星影像 🔑
- **Google 卫星地图** - Google Maps 卫星影像

#### 地形地图
- **Stamen Terrain** - 地形地图，显示山脉和地形特征
- **Google 地形地图** - Google Maps 地形地图

#### 混合地图
- **Google 混合地图** - Google Maps 卫星影像 + 标注

#### 中国地图
- **高德街道地图** - 高德地图街道地图，适合中国用户使用
- **百度街道地图** - 百度地图街道地图，详细的中国地区信息
- **腾讯街道地图** - 腾讯地图街道地图，适合中国用户使用
- **OpenStreetMap 中国镜像** - 使用中国镜像的 OpenStreetMap，访问更稳定
- **天地图矢量** - 国家地理信息公共服务平台矢量地图 🔑

#### 卫星地图（中国服务）
- **高德卫星地图** - 高德地图卫星影像，清晰的卫星图像
- **腾讯卫星地图** - 腾讯地图卫星影像，清晰的卫星图像
- **天地图影像** - 国家地理信息公共服务平台卫星影像 🔑

#### 地形地图（中国服务）
- **天地图地形** - 国家地理信息公共服务平台地形地图 🔑

> 🔑 表示需要 API Key
>
> **🇨🇳 针对中国用户优化**：默认使用高德地图服务，确保在中国大陆地区的访问稳定性和加载速度。

### 切换地图服务

```typescript
// 清除现有图层
map.getLayerManager().clearLayers()

// 添加新的地图服务
const newService = getServiceById('stamen-terrain')
await map.getLayerManager().addLayer(newService.layerConfig)
```

## 🔧 核心功能

### 路径规划

```typescript
// 计算驾车路线
const route = await map.routing.addRoute({
  waypoints: [
    [116.404, 39.915], // 起点
    [116.407, 39.918]  // 终点
  ],
  profile: 'driving'
})

// 开始导航
map.routing.startNavigation(route.id)
```

### 地理围栏

```typescript
// 创建地理围栏
const geofenceId = map.geofence.addGeofence({
  name: '重要区域',
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [116.404, 39.915],
      [116.407, 39.915],
      [116.407, 39.918],
      [116.404, 39.918],
      [116.404, 39.915]
    ]]
  }
})

// 监听进出事件
map.geofence.onGeofenceEvent((event) => {
  console.log(event.type === 'enter' ? '进入围栏' : '离开围栏')
})
```

### 热力图

```typescript
// 添加热力图
map.heatmap.addHeatmap({
  data: [
    { lng: 116.404, lat: 39.915, weight: 1 },
    { lng: 116.405, lat: 39.916, weight: 2 },
    { lng: 116.406, lat: 39.917, weight: 3 }
  ],
  style: {
    intensity: 1,
    radius: 20,
    gradient: {
      0: 'blue',
      0.5: 'green',
      1: 'red'
    }
  }
})
```

### 地址搜索

```typescript
// 搜索地址
const results = await map.search.search({
  query: '北京市朝阳区',
  limit: 10
})

// 地理编码
const geocoded = await map.search.geocode('北京市天安门广场')
```

### 测量工具

```typescript
// 距离测量
map.measurement.startMeasurement('distance')
map.measurement.addMeasurementPoint([116.404, 39.915])
map.measurement.addMeasurementPoint([116.407, 39.918])
const result = map.measurement.finishMeasurement()
console.log('距离:', result.value, '米')
```

### 3D地图

```typescript
// 启用3D建筑物
await map.threeD.enableBuildings()

// 添加自定义建筑物
map.threeD.addBuilding({
  name: '自定义建筑',
  coordinates: [[116.404, 39.915], [116.405, 39.915], [116.405, 39.916], [116.404, 39.916]],
  height: 100,
  color: '#722ED1'
})
```

## 📚 文档

- [快速开始](./docs/guide/getting-started.md)
- [API 文档](./docs/api/core.md)
- [Vue 集成](./docs/guide/vue.md)
- [React 集成](./docs/guide/react.md)
- [示例代码](./examples/)

## 🌐 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## 📋 开发

### 环境要求

- Node.js >= 16
- pnpm >= 7

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/ldesign/map.git
cd map

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build
```

### 项目结构

```
packages/map/
├── src/                    # 源代码
│   ├── core/              # 核心模块
│   ├── features/          # 功能模块
│   ├── adapters/          # 框架适配器
│   ├── styles/            # 样式文件
│   └── types/             # 类型定义
├── examples/              # 示例项目
│   ├── vue/              # Vue 示例
│   ├── react/            # React 示例
│   └── vanilla/          # 原生 JS 示例
├── docs/                  # 文档
├── tests/                 # 测试文件
└── dist/                  # 构建输出
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行集成测试
pnpm test:integration

# 测试覆盖率
pnpm test:coverage
```

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

### 贡献者

感谢所有贡献者的努力！

## 📞 支持

- [GitHub Issues](https://github.com/ldesign/map/issues) - 报告 Bug 或请求新功能
- [GitHub Discussions](https://github.com/ldesign/map/discussions) - 社区讨论
- [文档网站](https://ldesign.github.io/map/) - 完整文档

## 🔗 相关链接

- [LDESIGN 设计系统](https://github.com/ldesign/design-system)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [更新日志](./CHANGELOG.md)

## ⭐ Star History

如果这个项目对您有帮助，请给我们一个 Star！

[![Star History Chart](https://api.star-history.com/svg?repos=ldesign/map&type=Date)](https://star-history.com/#ldesign/map&Date)
