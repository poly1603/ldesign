# LDesign Map Vue 真实地图演示

基于 Vue 3 + Vite 的 LDesign Map 真实地图演示项目，展示完整的地图功能和交互效果。

## 🚀 快速开始

### 安装依赖

```bash
# 在当前目录安装依赖
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3004 查看真实地图演示。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 🎯 真实功能演示

### 1. 地图初始化
- ✅ 创建真实的 LDesignMap 实例
- ✅ 使用 OpenLayers 渲染地图
- ✅ 设置北京为中心点，缩放级别 10

### 2. 图层管理
- ✅ 添加 OpenStreetMap 瓦片图层
- ✅ 图层显示/隐藏控制
- ✅ 实时更新图层数量

### 3. 标记管理
- ✅ 添加地图标记点
- ✅ 标记弹窗显示
- ✅ 实时更新标记数量

### 4. 控件管理
- ✅ 添加缩放控件
- ✅ 添加比例尺控件
- ✅ 添加归属控件

### 5. 主题切换
- ✅ 默认主题
- ✅ 深色主题
- ✅ 浅色主题

### 6. 地图清空
- ✅ 清空所有图层
- ✅ 清空所有标记
- ✅ 重置地图状态

## 🏗️ 技术架构

### 核心技术栈
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **LDesignMap** - 基于 OpenLayers 的地图插件
- **OpenLayers** - 开源地图库

### 项目配置
- **Alias 配置** - `@ldesign/map` 指向 `../../src`
- **TypeScript 配置** - 完整的类型支持
- **Vite 优化** - OpenLayers 依赖预构建

## 📁 项目结构

```
vue/
├── src/
│   ├── App.vue          # 主应用组件（真实地图功能）
│   ├── main.ts          # 应用入口
│   └── style.css        # 全局样式
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置（alias 设置）
├── tsconfig.json        # TypeScript 配置
├── index.html           # HTML 模板
└── README.md           # 本文件
```

## 🔧 核心代码

### 地图初始化

```typescript
const initializeMap = async () => {
  // 创建真实的 LDesignMap 实例
  map = new LDesignMap({
    container: mapContainer.value,
    center: [116.404, 39.915], // 北京坐标
    zoom: 10,
    theme: 'default'
  })
  
  mapInitialized.value = true
  updateStatus()
}
```

### 添加图层

```typescript
const addOSMLayer = async () => {
  // 使用真实的图层管理器
  await map.getLayerManager().addLayer({
    id: 'osm',
    name: 'OpenStreetMap',
    type: LayerType.OSM,
    visible: true
  })
  
  updateStatus()
}
```

### 添加标记

```typescript
const addMarker = async () => {
  // 使用真实的标记管理器
  map.getMarkerManager().addMarker({
    id: `marker-${Date.now()}`,
    coordinate: [116.404, 39.915],
    title: '北京',
    popup: {
      content: '<h3>北京</h3><p>中华人民共和国首都</p>'
    }
  })
  
  updateStatus()
}
```

## 🎨 样式特性

### LDESIGN 设计系统
- **主色调** - #722ED1 (紫色)
- **渐变背景** - 紫色主题渐变
- **响应式布局** - 适配不同屏幕尺寸

### OpenLayers 样式
- **地图容器** - 圆角边框，阴影效果
- **控件样式** - 半透明背景，圆角设计
- **缩放控件** - 左上角定位
- **归属信息** - 右下角定位

## 🔍 与模拟版本的区别

| 功能 | 模拟版本 | 真实版本 |
|------|----------|----------|
| 地图渲染 | 占位符显示 | 真实 OpenLayers 地图 |
| 图层添加 | 计数器模拟 | 真实图层渲染 |
| 标记添加 | 计数器模拟 | 真实标记显示 |
| 主题切换 | 样式模拟 | 真实主题应用 |
| 地图交互 | 无交互 | 完整地图交互 |

## 🚨 注意事项

### 1. 依赖要求
- 确保 OpenLayers 正确安装
- 确保 LDesignMap 源码可访问

### 2. 浏览器兼容性
- 现代浏览器支持
- 需要 ES2020+ 支持

### 3. 性能考虑
- 地图瓦片加载需要网络连接
- 大量标记可能影响性能

## 🔗 相关链接

- [LDesignMap 源码](../../src/)
- [OpenLayers 官方文档](https://openlayers.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)

## 📄 许可证

MIT License
