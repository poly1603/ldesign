# 核心 API

@ldesign/map 的核心 API 提供了地图的基础功能和模块管理。

## LDesignMap

主要的地图类，提供地图的创建、初始化和基础操作。

### 构造函数

```typescript
new LDesignMap(options: MapOptions)
```

#### MapOptions

| 属性 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| container | `string \| HTMLElement` | ✓ | - | 地图容器选择器或 DOM 元素 |
| center | `LngLat` | ✓ | - | 地图初始中心点 [经度, 纬度] |
| zoom | `number` | ✓ | - | 地图初始缩放级别 (0-24) |
| accessToken | `string` | ✓ | - | Mapbox 访问令牌 |
| style | `string \| object` | ✗ | `'mapbox://styles/mapbox/streets-v11'` | 地图样式 |
| bearing | `number` | ✗ | `0` | 地图初始方向角度 |
| pitch | `number` | ✗ | `0` | 地图初始倾斜角度 |
| minZoom | `number` | ✗ | `0` | 最小缩放级别 |
| maxZoom | `number` | ✗ | `24` | 最大缩放级别 |
| bounds | `LngLatBounds` | ✗ | - | 地图边界限制 |
| clustering | `boolean` | ✗ | `false` | 是否启用标记点聚合 |
| debug | `boolean` | ✗ | `false` | 是否启用调试模式 |
| lazyLoad | `string[]` | ✗ | `[]` | 延迟加载的模块列表 |

### 实例方法

#### 初始化和销毁

```typescript
// 初始化地图
await map.initialize(): Promise<void>

// 销毁地图
map.destroy(): void

// 检查是否已初始化
map.isInitialized(): boolean
```

#### 地图控制

```typescript
// 获取/设置中心点
map.getCenter(): LngLat
map.setCenter(center: LngLat): void

// 获取/设置缩放级别
map.getZoom(): number
map.setZoom(zoom: number): void

// 获取/设置方向角度
map.getBearing(): number
map.setBearing(bearing: number): void

// 获取/设置倾斜角度
map.getPitch(): number
map.setPitch(pitch: number): void

// 飞行到指定位置
map.flyTo(options: FlyToOptions): void

// 适应边界
map.fitBounds(bounds: LngLatBounds, options?: FitBoundsOptions): void

// 获取地图边界
map.getBounds(): LngLatBounds

// 调整地图大小
map.resize(): void
```

#### FlyToOptions

| 属性 | 类型 | 描述 |
|------|------|------|
| center | `LngLat` | 目标中心点 |
| zoom | `number` | 目标缩放级别 |
| bearing | `number` | 目标方向角度 |
| pitch | `number` | 目标倾斜角度 |
| duration | `number` | 动画时长（毫秒） |
| easing | `function` | 缓动函数 |

#### 标记点管理

```typescript
// 添加标记点
map.addMarker(options: MarkerOptions): string

// 移除标记点
map.removeMarker(markerId: string): void

// 更新标记点
map.updateMarker(markerId: string, options: Partial<MarkerOptions>): void

// 获取标记点
map.getMarker(markerId: string): MarkerOptions | undefined

// 获取所有标记点
map.getAllMarkers(): MarkerOptions[]

// 清除所有标记点
map.clearMarkers(): void
```

#### MarkerOptions

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| lngLat | `LngLat` | ✓ | 标记点位置 |
| popup | `PopupOptions` | ✗ | 弹窗配置 |
| style | `MarkerStyle` | ✗ | 标记点样式 |
| draggable | `boolean` | ✗ | 是否可拖拽 |
| data | `Record<string, any>` | ✗ | 自定义数据 |

#### 事件监听

```typescript
// 添加事件监听器
map.on(event: string, callback: Function): void

// 移除事件监听器
map.off(event: string, callback?: Function): void

// 触发事件
map.emit(event: string, data?: any): void
```

#### 支持的事件

| 事件名 | 描述 | 回调参数 |
|--------|------|----------|
| `load` | 地图加载完成 | - |
| `click` | 地图点击 | `{ lngLat: LngLat, point: Point }` |
| `dblclick` | 地图双击 | `{ lngLat: LngLat, point: Point }` |
| `move` | 地图移动 | - |
| `moveend` | 地图移动结束 | - |
| `zoom` | 地图缩放 | - |
| `zoomend` | 地图缩放结束 | - |
| `rotate` | 地图旋转 | - |
| `rotateend` | 地图旋转结束 | - |
| `marker-click` | 标记点点击 | `{ marker: MarkerOptions }` |
| `marker-drag` | 标记点拖拽 | `{ marker: MarkerOptions, lngLat: LngLat }` |

### 功能模块

LDesignMap 提供了多个功能模块，每个模块都有独立的 API。

```typescript
// 路径规划模块
map.routing: IRoutingModule

// 地理围栏模块
map.geofence: IGeofenceModule

// 热力图模块
map.heatmap: IHeatmapModule

// 搜索模块
map.search: ISearchModule

// 测量模块
map.measurement: IMeasurementModule

// 图层管理模块
map.layers: ILayerModule

// 3D 模块
map.threeD: IThreeDModule

// 行政区划模块
map.administrative: IAdministrativeModule
```

### 工具方法

```typescript
// 坐标转换
map.project(lngLat: LngLat): Point
map.unproject(point: Point): LngLat

// 距离计算
map.distance(from: LngLat, to: LngLat): number

// 边界计算
map.getBoundsFromPoints(points: LngLat[]): LngLatBounds

// 获取地图容器
map.getContainer(): HTMLElement

// 获取原生 Mapbox 实例
map.getMapInstance(): mapboxgl.Map
```

## 类型定义

### 基础类型

```typescript
// 经纬度坐标
type LngLat = [number, number] // [经度, 纬度]

// 屏幕坐标
type Point = [number, number] // [x, y]

// 边界框
type LngLatBounds = [LngLat, LngLat] // [西南角, 东北角]

// 颜色
type Color = string // CSS 颜色值

// 尺寸
type Size = 'small' | 'medium' | 'large' | number
```

### 样式类型

```typescript
interface MarkerStyle {
  color?: Color
  size?: Size
  icon?: string
  className?: string
}

interface PopupOptions {
  content: string | HTMLElement
  className?: string
  closeButton?: boolean
  closeOnClick?: boolean
  maxWidth?: number
  offset?: number | Point
}
```

## 示例

### 基础地图创建

```typescript
import { LDesignMap } from '@ldesign/map'

const map = new LDesignMap({
  container: '#map',
  center: [116.404, 39.915],
  zoom: 10,
  accessToken: 'your-mapbox-token'
})

await map.initialize()
```

### 添加交互功能

```typescript
// 点击添加标记点
map.on('click', (event) => {
  map.addMarker({
    lngLat: event.lngLat,
    popup: {
      content: `坐标: ${event.lngLat.join(', ')}`
    }
  })
})

// 标记点拖拽
const markerId = map.addMarker({
  lngLat: [116.404, 39.915],
  draggable: true
})

map.on('marker-drag', (event) => {
  console.log('标记点移动到:', event.lngLat)
})
```

### 地图控制

```typescript
// 平滑飞行到新位置
map.flyTo({
  center: [121.473, 31.230],
  zoom: 12,
  duration: 2000
})

// 适应多个点的边界
const points = [
  [116.404, 39.915],
  [121.473, 31.230],
  [113.264, 23.129]
]
const bounds = map.getBoundsFromPoints(points)
map.fitBounds(bounds, { padding: 50 })
```

## 错误处理

```typescript
try {
  await map.initialize()
} catch (error) {
  if (error.code === 'INVALID_TOKEN') {
    console.error('无效的 Mapbox 访问令牌')
  } else if (error.code === 'CONTAINER_NOT_FOUND') {
    console.error('找不到地图容器')
  } else {
    console.error('地图初始化失败:', error.message)
  }
}
```

## 性能优化

```typescript
// 启用标记点聚合
const map = new LDesignMap({
  container: '#map',
  center: [116.404, 39.915],
  zoom: 10,
  accessToken: 'your-token',
  clustering: true
})

// 延迟加载功能模块
const map = new LDesignMap({
  container: '#map',
  center: [116.404, 39.915],
  zoom: 10,
  accessToken: 'your-token',
  lazyLoad: ['routing', 'heatmap', 'measurement']
})
```
