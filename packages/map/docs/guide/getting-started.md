# 快速开始

本指南将帮助您快速上手 @ldesign/map 地图插件。

## 安装

### 使用包管理器

```bash
# npm
npm install @ldesign/map

# yarn
yarn add @ldesign/map

# pnpm
pnpm add @ldesign/map
```

### CDN 引入

```html
<!-- 开发版本 -->
<script src="https://unpkg.com/@ldesign/map/dist/index.js"></script>

<!-- 生产版本 -->
<script src="https://unpkg.com/@ldesign/map/dist/index.min.js"></script>
```

## 准备工作

### 获取 Mapbox 访问令牌

@ldesign/map 基于 Mapbox GL JS 构建，您需要：

1. 访问 [Mapbox 官网](https://www.mapbox.com/)
2. 注册账户并创建访问令牌
3. 将令牌用于地图初始化

### HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>@ldesign/map 示例</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    #map {
      width: 100%;
      height: 400px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
</body>
</html>
```

## 基础使用

### 创建地图

```typescript
import { LDesignMap } from '@ldesign/map'

// 创建地图实例
const map = new LDesignMap({
  container: '#map', // 容器选择器或 DOM 元素
  center: [116.404, 39.915], // 地图中心点 [经度, 纬度]
  zoom: 10, // 缩放级别
  accessToken: 'your-mapbox-access-token' // Mapbox 访问令牌
})

// 初始化地图
await map.initialize()

console.log('地图初始化完成!')
```

### 添加标记点

```typescript
// 添加简单标记点
const markerId = map.addMarker({
  lngLat: [116.404, 39.915]
})

// 添加带弹窗的标记点
const markerWithPopup = map.addMarker({
  lngLat: [116.407, 39.918],
  popup: {
    content: '<h3>这里是北京</h3><p>中国的首都</p>'
  }
})

// 添加自定义样式的标记点
const customMarker = map.addMarker({
  lngLat: [116.410, 39.920],
  style: {
    color: '#722ED1',
    size: 'large'
  },
  popup: {
    content: '自定义标记点'
  }
})
```

### 地图事件监听

```typescript
// 监听地图点击事件
map.on('click', (event) => {
  console.log('点击位置:', event.lngLat)
  
  // 在点击位置添加标记点
  map.addMarker({
    lngLat: event.lngLat,
    popup: {
      content: `坐标: ${event.lngLat[0].toFixed(4)}, ${event.lngLat[1].toFixed(4)}`
    }
  })
})

// 监听地图移动事件
map.on('move', () => {
  const center = map.getCenter()
  const zoom = map.getZoom()
  console.log('地图中心:', center, '缩放级别:', zoom)
})

// 监听标记点点击事件
map.on('marker-click', (event) => {
  console.log('点击的标记点:', event.marker)
})
```

### 地图控制

```typescript
// 设置地图中心点
map.setCenter([121.473, 31.230]) // 上海

// 设置缩放级别
map.setZoom(12)

// 飞行到指定位置
map.flyTo({
  center: [113.264, 23.129], // 广州
  zoom: 11,
  duration: 2000 // 动画时长（毫秒）
})

// 适应边界
map.fitBounds([
  [116.404, 39.915], // 西南角
  [116.407, 39.918]  // 东北角
])
```

## 框架集成

### Vue 3

```vue
<template>
  <div>
    <LDesignMapComponent
      :center="center"
      :zoom="zoom"
      :access-token="accessToken"
      @map-ready="onMapReady"
      @click="onMapClick"
    >
      <!-- 使用插槽添加自定义控件 -->
      <template #controls>
        <div class="custom-controls">
          <button @click="addRandomMarker">添加随机标记</button>
        </div>
      </template>
    </LDesignMapComponent>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LDesignMapComponent } from '@ldesign/map/vue'

const center = ref([116.404, 39.915])
const zoom = ref(10)
const accessToken = 'your-mapbox-access-token'

let mapInstance = null

const onMapReady = (map) => {
  mapInstance = map
  console.log('Vue 地图准备就绪')
}

const onMapClick = (event) => {
  console.log('Vue 地图点击:', event.lngLat)
}

const addRandomMarker = () => {
  if (mapInstance) {
    const randomLng = 116.404 + (Math.random() - 0.5) * 0.01
    const randomLat = 39.915 + (Math.random() - 0.5) * 0.01
    
    mapInstance.addMarker({
      lngLat: [randomLng, randomLat],
      popup: {
        content: '随机标记点'
      }
    })
  }
}
</script>

<style scoped>
.custom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.custom-controls button {
  padding: 8px 16px;
  background: var(--ldesign-brand-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

### React

```tsx
import React, { useState, useCallback } from 'react'
import { LDesignMapComponent } from '@ldesign/map/react'

function MapExample() {
  const [center] = useState([116.404, 39.915])
  const [zoom] = useState(10)
  const [mapInstance, setMapInstance] = useState(null)
  
  const accessToken = 'your-mapbox-access-token'

  const handleMapReady = useCallback((map) => {
    setMapInstance(map)
    console.log('React 地图准备就绪')
  }, [])

  const handleMapClick = useCallback((event) => {
    console.log('React 地图点击:', event.lngLat)
  }, [])

  const addRandomMarker = useCallback(() => {
    if (mapInstance) {
      const randomLng = 116.404 + (Math.random() - 0.5) * 0.01
      const randomLat = 39.915 + (Math.random() - 0.5) * 0.01
      
      mapInstance.addMarker({
        lngLat: [randomLng, randomLat],
        popup: {
          content: '随机标记点'
        }
      })
    }
  }, [mapInstance])

  return (
    <div style={{ position: 'relative' }}>
      <LDesignMapComponent
        center={center}
        zoom={zoom}
        accessToken={accessToken}
        onMapReady={handleMapReady}
        onClick={handleMapClick}
      />
      
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000
      }}>
        <button
          onClick={addRandomMarker}
          style={{
            padding: '8px 16px',
            background: 'var(--ldesign-brand-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          添加随机标记
        </button>
      </div>
    </div>
  )
}

export default MapExample
```

## 常见问题

### 地图不显示

1. **检查访问令牌**：确保 Mapbox 访问令牌有效
2. **检查容器**：确保容器元素存在且有明确的宽高
3. **检查网络**：确保能够访问 Mapbox 服务

```typescript
// 调试模式
const map = new LDesignMap({
  container: '#map',
  center: [116.404, 39.915],
  zoom: 10,
  accessToken: 'your-token',
  debug: true // 启用调试模式
})
```

### 性能优化

```typescript
// 大量标记点时使用聚合
const map = new LDesignMap({
  container: '#map',
  center: [116.404, 39.915],
  zoom: 10,
  accessToken: 'your-token',
  clustering: true // 启用标记点聚合
})

// 延迟加载功能模块
const map = new LDesignMap({
  container: '#map',
  center: [116.404, 39.915],
  zoom: 10,
  accessToken: 'your-token',
  lazyLoad: ['routing', 'heatmap'] // 延迟加载指定模块
})
```

## 下一步

- 了解[基础概念](/guide/concepts)
- 学习[标记点管理](/guide/markers)
- 探索[路径规划](/guide/routing)
- 查看[完整 API](/api/core)
