# @ldesign/map

[![npm version](https://badge.fury.io/js/%40ldesign%2Fmap.svg)](https://badge.fury.io/js/%40ldesign%2Fmap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

功能全面的地图插件，支持多种地图类型和前端框架。基于 Mapbox GL JS 构建，提供统一的 API 接口和丰富的功能模块。

## ✨ 特性

- 🗺️ **多种地图类型** - 支持2D平面地图、3D立体地图、行政区划地图、自定义区块地图
- 🎯 **框架兼容** - 支持 Vue 3、React、原生 JavaScript，提供统一的 API 接口
- 🛣️ **路径规划** - 集成路径规划API，支持驾车、步行、骑行等多种出行方式
- 🔍 **地址搜索** - 强大的地址搜索和地理编码功能，支持模糊搜索和建议
- 📍 **地理围栏** - 支持地理围栏创建、编辑和进出检测，实时监控位置变化
- 🔥 **热力图** - 数据可视化热力图显示，支持动画和自定义渐变
- 📏 **测量工具** - 距离测量和面积计算，支持交互式测量
- 🏢 **3D建筑** - 3D建筑物渲染和自定义建筑物添加
- 🗾 **行政区划** - 省市区县边界显示和行政区域管理
- 🎨 **样式定制** - 遵循 LDESIGN 设计系统，支持主题定制
- 📱 **响应式** - 完美适配移动端和桌面端
- ⚡ **高性能** - 优化的渲染性能和内存管理
- 🧪 **完整测试** - 单元测试和集成测试覆盖

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
import { LDesignMap } from '@ldesign/map'

// 创建地图实例
const map = new LDesignMap({
  container: '#map',
  center: [116.404, 39.915], // 北京
  zoom: 10,
  accessToken: 'your-mapbox-token'
})

// 初始化地图
await map.initialize()

// 添加标记点
map.addMarker({
  lngLat: [116.404, 39.915],
  popup: {
    content: '这里是北京'
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
