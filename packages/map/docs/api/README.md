# API 文档

## 核心 API

### LDesignMap

主地图类，提供地图的核心功能。

#### 构造函数

```typescript
new LDesignMap(config: MapConfig)
```

**参数：**

- `config: MapConfig` - 地图配置对象

**MapConfig 接口：**

```typescript
interface MapConfig {
  container: string | HTMLElement;  // 地图容器
  center?: [number, number];        // 地图中心点 [经度, 纬度]
  zoom?: number;                    // 缩放级别 (0-20)
  theme?: string;                   // 主题名称
  projection?: string;              // 投影坐标系
  controls?: ControlConfig;         // 控件配置
  interactions?: InteractionConfig; // 交互配置
}
```

#### 核心方法

##### 地图操作

```typescript
// 设置地图中心点
setCenter(center: [number, number]): void

// 获取地图中心点
getCenter(): [number, number]

// 设置缩放级别
setZoom(zoom: number): void

// 获取缩放级别
getZoom(): number

// 适应指定范围
fitExtent(extent: [number, number, number, number]): void

// 获取地图视图状态
getViewState(): ViewState
```

##### 管理器访问

```typescript
// 获取事件管理器
getEventManager(): EventManager

// 获取图层管理器
getLayerManager(): LayerManager

// 获取标记管理器
getMarkerManager(): MarkerManager

// 获取控件管理器
getControlManager(): ControlManager

// 获取样式管理器
getStyleManager(): StyleManager

// 获取主题管理器
getThemeManager(): ThemeManager
```

##### 主题管理

```typescript
// 设置主题
setTheme(themeName: string): boolean

// 获取当前主题
getCurrentTheme(): string

// 获取主题管理器
getThemeManager(): ThemeManager
```

##### 配置管理

```typescript
// 获取地图配置
getConfig(): MapConfig

// 更新地图配置
updateConfig(config: Partial<MapConfig>): void
```

##### 销毁

```typescript
// 销毁地图实例
destroy(): void
```

#### 事件

```typescript
// 地图点击事件
map.on('click', (event: MapClickEvent) => {
  console.log('点击坐标:', event.coordinate);
});

// 地图移动事件
map.on('moveend', (event: MapMoveEvent) => {
  console.log('地图中心:', event.center);
});

// 缩放变化事件
map.on('zoomend', (event: MapZoomEvent) => {
  console.log('缩放级别:', event.zoom);
});
```

### LayerManager

图层管理器，负责地图图层的添加、删除和管理。

#### 方法

```typescript
// 添加 OSM 图层
addOSMLayer(config: OSMLayerConfig): Promise<string>

// 添加 XYZ 图层
addXYZLayer(config: XYZLayerConfig): Promise<string>

// 添加 WMS 图层
addWMSLayer(config: WMSLayerConfig): Promise<string>

// 添加矢量图层
addVectorLayer(config: VectorLayerConfig): Promise<string>

// 移除图层
removeLayer(layerId: string): boolean

// 获取图层
getLayer(layerId: string): Layer | null

// 获取所有图层
getLayers(): Layer[]

// 设置图层可见性
setLayerVisible(layerId: string, visible: boolean): boolean

// 设置图层透明度
setLayerOpacity(layerId: string, opacity: number): boolean

// 设置图层层级
setLayerZIndex(layerId: string, zIndex: number): boolean
```

#### 图层配置接口

```typescript
interface OSMLayerConfig {
  id: string;
  name: string;
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
}

interface XYZLayerConfig {
  id: string;
  name: string;
  url: string;
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
  attribution?: string;
}

interface WMSLayerConfig {
  id: string;
  name: string;
  url: string;
  layers: string;
  format?: string;
  version?: string;
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
}
```

### MarkerManager

标记管理器，负责地图标记点的添加、删除和管理。

#### 方法

```typescript
// 添加标记点
addMarker(config: MarkerConfig): string

// 添加聚合标记
addClusterMarkers(markers: MarkerConfig[]): string

// 移除标记
removeMarker(markerId: string): boolean

// 获取标记
getMarker(markerId: string): Marker | null

// 获取所有标记
getMarkers(): Marker[]

// 清空所有标记
clearMarkers(): void

// 设置标记可见性
setMarkerVisible(markerId: string, visible: boolean): boolean

// 更新标记位置
updateMarkerPosition(markerId: string, coordinate: [number, number]): boolean
```

#### 标记配置接口

```typescript
interface MarkerConfig {
  id: string;
  coordinate: [number, number];
  title?: string;
  content?: string;
  icon?: {
    src: string;
    size?: [number, number];
    anchor?: [number, number];
  };
  popup?: {
    content: string;
    offset?: [number, number];
    className?: string;
  };
  draggable?: boolean;
  visible?: boolean;
  zIndex?: number;
  data?: any;
}
```

### ThemeManager

主题管理器，负责地图主题的管理和切换。

#### 方法

```typescript
// 设置主题
setTheme(themeName: string): boolean

// 获取当前主题
getCurrentTheme(): string

// 获取主题配置
getTheme(themeName?: string): Theme | null

// 获取可用主题列表
getAvailableThemes(): ThemeInfo[]

// 注册自定义主题
registerTheme(theme: Theme): void

// 移除主题
removeTheme(themeName: string): boolean

// 获取主题颜色
getThemeColor(colorKey: string, themeName?: string): string | null

// 获取主题样式
getThemeStyle(styleKey: string, themeName?: string): any
```

#### 主题接口

```typescript
interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    accent: string;
  };
  styles: {
    map: any;
    marker: any;
    popup: any;
    control: any;
  };
}

interface ThemeInfo {
  name: string;
  displayName: string;
}
```

### 工具类

#### CoordinateUtils

坐标转换工具类。

```typescript
// 获取单例实例
CoordinateUtils.getInstance(): CoordinateUtils

// WGS84 转 Web Mercator
wgs84ToWebMercator(coordinate: [number, number]): [number, number]

// Web Mercator 转 WGS84
webMercatorToWgs84(coordinate: [number, number]): [number, number]

// 通用坐标转换
transformCoordinate(
  coordinate: [number, number], 
  fromProjection: string, 
  toProjection: string
): CoordinateTransformResult

// 范围转换
transformExtent(
  extent: [number, number, number, number], 
  fromProjection: string, 
  toProjection: string
): [number, number, number, number]

// 注册投影
registerProjection(code: string, definition: string): void

// 检查投影是否已注册
isProjectionRegistered(code: string): boolean
```

#### DrawingTools

绘制工具类。

```typescript
// 构造函数
new DrawingTools(map: Map)

// 开始绘制
startDrawing(type: DrawType): void

// 结束绘制
stopDrawing(): void

// 启用编辑模式
enableEdit(): void

// 禁用编辑模式
disableEdit(): void

// 清空绘制内容
clear(): void

// 获取绘制结果
getFeatures(): Feature[]
```

#### MeasureTools

测量工具类。

```typescript
// 构造函数
new MeasureTools(map: Map)

// 开始距离测量
startDistanceMeasure(): void

// 开始面积测量
startAreaMeasure(): void

// 结束测量
stopMeasure(): void

// 清空测量结果
clearMeasurements(): void

// 获取测量结果
getMeasurements(): MeasureResult[]
```

## 类型定义

### 基础类型

```typescript
type Coordinate = [number, number];
type Extent = [number, number, number, number];

enum LayerType {
  OSM = 'osm',
  XYZ = 'xyz',
  WMS = 'wms',
  WMTS = 'wmts',
  Vector = 'vector',
  Heatmap = 'heatmap'
}

enum DrawType {
  POINT = 'Point',
  LINE = 'LineString',
  POLYGON = 'Polygon',
  CIRCLE = 'Circle'
}
```

### 事件类型

```typescript
interface MapClickEvent {
  coordinate: Coordinate;
  pixel: [number, number];
  originalEvent: Event;
}

interface MapMoveEvent {
  center: Coordinate;
  zoom: number;
  extent: Extent;
}

interface MapZoomEvent {
  zoom: number;
  center: Coordinate;
}
```

更多详细的 API 文档请参考各个模块的具体文档：

- [LayerManager API](./layer-manager.md)
- [MarkerManager API](./marker-manager.md)
- [ThemeManager API](./theme-manager.md)
- [工具类 API](./tools.md)
- [事件系统 API](./events.md)
