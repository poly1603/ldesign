# @ldesign/map Vue 示例项目

这是一个完整的Vue 3示例项目，展示了@ldesign/map地图插件的所有功能和样式。

## 🚀 快速开始

### 🎉 无需配置，开箱即用！

本示例项目使用 **Leaflet + OpenStreetMap**，完全免费且无需任何API密钥或访问令牌！

- ✅ **零配置**：无需注册账号或申请API密钥
- ✅ **完全免费**：基于开源的OpenStreetMap数据
- ✅ **功能完整**：支持所有地图功能和样式
- ✅ **性能优秀**：轻量级Leaflet引擎，加载速度快

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

## 📋 功能展示

### 🗺️ 地图样式

本示例展示了6种不同的地图样式：

1. **街道地图 (streets)** - 标准的街道地图，显示道路、建筑物和地名
2. **卫星地图 (satellite)** - 高清卫星影像，真实展现地表情况
3. **混合地图 (hybrid)** - 卫星影像与道路标注的结合
4. **地形地图 (terrain)** - 显示地形起伏和海拔信息
5. **暗色主题 (dark)** - 深色背景的地图样式，适合夜间使用
6. **亮色主题 (light)** - 浅色背景的地图样式，简洁明亮

### 🎯 地图类型

支持4种不同的地图类型：

1. **2D平面地图** - 传统的平面地图视图
2. **3D立体地图** - 支持倾斜和旋转的3D地图
3. **行政区划地图** - 突出显示行政边界
4. **自定义区块地图** - 自定义样式的地图

### ⚡ 功能模块

展示了地图插件的核心功能模块：

1. **热力图 (heatmap)** - 数据可视化热力图显示
2. **3D建筑 (buildings3d)** - 3D建筑物渲染
3. **粒子效果 (particles)** - 雨、雪、流星等粒子效果
4. **地理围栏 (geofence)** - 地理围栏创建和监控
5. **路径规划 (routing)** - 驾车、步行等路径规划
6. **地址搜索 (search)** - 地址搜索和地理编码
7. **测量工具 (measurement)** - 距离测量和面积计算

## 🔧 使用方法

### 基础用法

```vue
<template>
  <LDesignMapComponent
    :options="mapOptions"
    @map-ready="onMapReady"
  />
</template>

<script setup>
import { LDesignMapComponent } from '@ldesign/map/vue'
import '@ldesign/map/style.css'

const mapOptions = {
  center: [116.404, 39.915],
  zoom: 10,
  style: 'streets',
  engine: 'leaflet' // 使用Leaflet引擎，无需API密钥
}

const onMapReady = (map) => {
  console.log('地图加载完成:', map)
}
</script>
```

### 使用组合式API

```vue
<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref } from 'vue'
import { useLDesignMap } from '@ldesign/map/vue'

const mapContainer = ref()

const { map, isInitialized, addMarker } = useLDesignMap(
  mapContainer,
  {
    center: [116.404, 39.915],
    zoom: 10,
    engine: 'leaflet' // 使用Leaflet引擎
  }
)
</script>
```

## 🎨 样式定制

项目使用LDESIGN设计系统的CSS变量，支持主题定制：

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-bg-color-container: #ffffff;
  --ldesign-border-color: #e5e5e5;
  /* 更多变量... */
}
```

## 📱 响应式设计

示例项目完全支持响应式设计，在移动端和桌面端都有良好的体验。

## 🔗 相关链接

- [@ldesign/map 文档](../../README.md)
- [Vue 3 官方文档](https://vuejs.org/)
- [Mapbox GL JS 文档](https://docs.mapbox.com/mapbox-gl-js/)

## 📄 许可证

MIT License
