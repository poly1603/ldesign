# @ldesign/map

功能全面的地图插件，支持多种地图类型和前端框架。

## 特性

- 🗺️ **多种地图类型** - 支持2D平面地图、3D立体地图、行政区划地图等
- 🎯 **框架兼容** - 支持 Vue 3、React、原生 JavaScript
- 🛣️ **路径规划** - 集成路径规划API，支持多种出行方式
- 🔍 **地址搜索** - 强大的地址搜索和地理编码功能
- 📍 **地理围栏** - 支持地理围栏创建和进出检测
- 🔥 **热力图** - 数据可视化热力图显示
- 📏 **测量工具** - 距离测量和面积计算
- 🎨 **样式定制** - 遵循 LDESIGN 设计系统
- 📱 **响应式** - 完美适配移动端和桌面端
- ⚡ **高性能** - 优化的渲染性能和内存管理

## 快速开始

### 安装

```bash
npm install @ldesign/map
# 或
yarn add @ldesign/map
# 或
pnpm add @ldesign/map
```

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
  <div>
    <LDesignMapComponent
      :center="[116.404, 39.915]"
      :zoom="10"
      :access-token="accessToken"
      @map-ready="onMapReady"
    />
  </div>
</template>

<script setup>
import { LDesignMapComponent } from '@ldesign/map/vue'

const accessToken = 'your-mapbox-token'

const onMapReady = (map) => {
  // 地图准备就绪
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

## 核心功能

### 路径规划

```typescript
// 计算路径
const route = await map.routing.addRoute({
  waypoints: [
    [116.404, 39.915], // 起点
    [116.407, 39.918]  // 终点
  ],
  profile: 'driving' // 驾车路线
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
  if (event.type === 'enter') {
    console.log('进入围栏:', event.geofence.name)
  }
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
// 开始距离测量
map.measurement.startMeasurement('distance')

// 添加测量点
map.measurement.addMeasurementPoint([116.404, 39.915])
map.measurement.addMeasurementPoint([116.407, 39.918])

// 完成测量
const result = map.measurement.finishMeasurement()
console.log('距离:', result.value, '米')
```

## 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [GitHub 仓库](https://github.com/ldesign/map)
- [API 文档](/api/core)
- [示例代码](/examples/basic)
- [更新日志](https://github.com/ldesign/map/releases)
