<!-- 29d70aa1-f0b5-4042-ab3e-e6b6e4c2b973 0b1778a3-3f36-4030-9cd3-4333525ec205 -->
# 3D Viewer 全面优化与功能扩展计划

## 📋 优化目标

基于现有 v2.0 架构，进行全面升级：

- **性能**: 首屏加载提升 5-8x，内存占用降低 50%，支持低端设备
- **功能**: 添加 24+ 新功能特性（标注、测量、高级渲染等）
- **设备**: 完整支持桌面/移动/平板/VR/AR，低端设备降级方案
- **示例**: 4 个框架示例功能完全一致，演示丰富专业

## 阶段 1: 性能深度优化 (1-2 周)

### 1.1 加载性能优化

**目标**: 首屏加载提升 5-8x

#### 核心优化点

1. **渐进式纹理加载增强**

   - 实现多级 LOD 加载（缩略图 → 低质量 → 高质量）
   - 添加智能预测加载（基于相机朝向）
   - 文件: `packages/core/src/utils/ProgressiveTextureLoader.ts`

2. **WebWorker 纹理解码**

   - 完善 `TextureLoader.worker.ts` 实现
   - 添加多 Worker 并行解码支持
   - 使用 OffscreenCanvas API
   - 文件: `packages/core/src/workers/TextureLoader.worker.ts`

3. **纹理压缩与格式优化**

   - 支持 WebP/AVIF 格式
   - 自动检测并使用 GPU 压缩纹理（Basis/KTX2）
   - 添加格式降级策略
   - 新增: `packages/core/src/utils/TextureFormatDetector.ts`

4. **HTTP/2 推送与预连接**

   - 添加资源预加载提示
   - 实现智能 prefetch
   - 新增: `packages/core/src/utils/ResourcePreloader.ts`

### 1.2 运行时性能优化

**目标**: 帧率稳定 60fps，CPU 使用降低 60%

#### 核心优化点

1. **渲染管线优化**

   - 实现 Frustum Culling（视锥体剔除）
   - 添加 Occlusion Culling（遮挡剔除）
   - 优化 Draw Call 批处理
   - 修改: `packages/core/src/PanoramaViewer.ts`

2. **对象池扩展**

   - 添加更多类型的对象池（Matrix4、Quaternion、Color）
   - 实现自适应池大小
   - 修改: `packages/core/src/utils/ObjectPool.ts`

3. **智能按需渲染**

   - 完善停止交互后的渲染暂停
   - 添加脏矩形检测
   - 实现增量渲染
   - 修改: `packages/core/src/PanoramaViewer.ts`

4. **事件系统优化**

   - 添加事件节流和防抖
   - 实现事件优先级队列
   - 优化 EventBus 性能
   - 修改: `packages/core/src/core/EventBus.ts`

### 1.3 内存优化

**目标**: 内存占用降低 50%，杜绝内存泄漏

#### 核心优化点

1. **纹理内存管理**

   - 实现 LRU 缓存淘汰策略增强
   - 添加纹理压缩在内存中的支持
   - 自动卸载不可见纹理
   - 修改: `packages/core/src/utils/TextureCache.ts`

2. **几何体优化**

   - 减少球体细分数（自适应质量）
   - 共享几何体实例
   - 修改: `packages/core/src/PanoramaViewer.ts`

3. **完善 dispose 机制**

   - 审计所有资源释放路径
   - 添加自动 dispose 检测
   - 完善 MemoryManager
   - 修改: `packages/core/src/core/MemoryManager.ts`

### 1.4 移动设备优化

**目标**: 完美支持低端移动设备

#### 核心优化点

1. **设备能力检测与降级**

   - 实现设备性能评分系统
   - 自动降级渲染质量
   - 新增: `packages/core/src/utils/DeviceCapability.ts`

2. **移动端特殊优化**

   - 降低默认纹理分辨率（低端设备 1K/2K）
   - 禁用部分后处理效果
   - 优化触摸事件处理
   - 修改: `packages/core/src/controls/TouchControls.ts`

3. **电量与发热控制**

   - 添加省电模式
   - 实现自适应帧率（30fps/60fps）
   - 新增: `packages/core/src/utils/PowerManager.ts`

## 阶段 2: 功能扩展 (2-3 周)

### 2.1 实用工具类功能 (6 个)

#### 2.1.1 标注系统 (P0 高优先级)

- 支持文字、箭头、矩形、圆形、多边形标注
- 可编辑、可导入导出 JSON
- 新增: `packages/core/src/tools/AnnotationManager.ts`
- 新增: `packages/core/src/tools/annotations/` 目录

#### 2.1.2 区域选择器 (P1)

- 支持矩形、圆形、多边形区域定义
- 点在区域内判断
- 新增: `packages/core/src/tools/RegionSelector.ts`

#### 2.1.3 路径绘制工具 (P1)

- 绘制导览路径
- 路径动画播放
- 新增: `packages/core/src/tools/PathDrawer.ts`

#### 2.1.4 多场景管理器 (P0)

- 场景切换与过渡动画
- 场景预加载
- 新增: `packages/core/src/managers/SceneManager.ts`

#### 2.1.5 比较模式 (P1)

- 分屏对比两个全景
- 同步控制
- 新增: `packages/core/src/tools/ComparisonView.ts`

#### 2.1.6 时间轴播放器 (P2)

- 时间序列全景播放
- 时间刻度控制
- 新增: `packages/core/src/tools/TimelinePlayer.ts`

### 2.2 高级渲染效果 (6 个)

#### 2.2.1 环境映射与反射 (P0)

- 实现实时环境映射
- 添加反射物体支持
- 新增: `packages/core/src/rendering/EnvironmentMapping.ts`

#### 2.2.2 粒子系统 (P1)

- 雨、雪、烟雾等效果
- 可配置粒子发射器
- 新增: `packages/core/src/rendering/ParticleSystem.ts`

#### 2.2.3 动态光照 (P1)

- 添加点光源、聚光灯
- 实时阴影
- 新增: `packages/core/src/rendering/DynamicLighting.ts`

#### 2.2.4 天气系统 (P2)

- 晴天、雨天、雾天效果
- 天气过渡动画
- 新增: `packages/core/src/rendering/WeatherSystem.ts`

#### 2.2.5 景深效果增强 (P1)

- 可调节焦距和光圈
- 实时景深预览
- 修改: `packages/core/src/postprocessing/PostProcessing.ts`

#### 2.2.6 色彩分级预设 (P0)

- 电影级调色预设（暖色调、冷色调等）
- 自定义 LUT 支持
- 新增: `packages/core/src/rendering/ColorGrading.ts`

### 2.3 集成能力扩展 (6 个)

#### 2.3.1 数据分析集成 (P0)

- 热力图显示（点击、停留时间）
- 用户行为追踪
- 新增: `packages/core/src/analytics/HeatmapAnalytics.ts`

#### 2.3.2 CDN 优化 (P0)

- 自动 CDN 路径重写
- 多 CDN 容错
- 新增: `packages/core/src/utils/CDNManager.ts`

#### 2.3.3 社交分享增强 (P1)

- 生成分享图片（带水印）
- 社交平台元数据
- 完善 SharePlugin

#### 2.3.4 数据导出系统 (P1)

- 导出配置 JSON
- 导出场景快照
- 新增: `packages/core/src/utils/DataExporter.ts`

#### 2.3.5 第三方库集成 (P2)

- Google Analytics 集成
- 地图服务集成
- 新增: `packages/core/src/integrations/` 目录

#### 2.3.6 AI 辅助功能 (P2)

- 自动热点推荐
- 智能场景描述
- 新增: `packages/core/src/ai/AIAssistant.ts`

### 2.4 企业级功能 (6 个)

#### 2.4.1 访问控制与权限 (P0)

- 基于角色的访问控制
- 水印与版权保护
- 新增: `packages/core/src/security/AccessControl.ts`

#### 2.4.2 离线支持 (P0)

- Service Worker 缓存
- IndexedDB 存储
- 新增: `packages/core/src/offline/OfflineManager.ts`

#### 2.4.3 多语言国际化 (P0)

- i18n 集成
- RTL 布局支持
- 新增: `packages/core/src/i18n/LocaleManager.ts`

#### 2.4.4 白标定制 (P1)

- 主题系统
- 品牌定制
- 新增: `packages/core/src/theming/ThemeManager.ts`

#### 2.4.5 审计日志 (P2)

- 操作记录
- 性能日志
- 新增: `packages/core/src/logging/AuditLogger.ts`

#### 2.4.6 协作功能 (P2)

- 多人同时查看
- 标注协作
- 新增: `packages/core/src/collaboration/CollaborationManager.ts`

## 阶段 3: 设备兼容性完善 (1 周)

### 3.1 桌面浏览器优化

- 完善键盘快捷键
- 鼠标手势支持（侧键、中键）
- 修改: `packages/core/src/controls/KeyboardControls.ts`

### 3.2 移动设备适配

- 完善触摸手势（三指、四指）
- 摇一摇交互
- iOS Safari 特殊处理
- 修改: `packages/core/src/controls/AdvancedGestureControls.ts`

### 3.3 平板设备优化

- 响应式 UI 布局
- 手写笔支持
- 新增: `packages/core/src/utils/TabletOptimizer.ts`

### 3.4 VR/AR 设备增强

- 完善双手控制器支持
- 添加手势识别
- 修改: `packages/core/src/vr/VRManager.ts`

### 3.5 低端设备降级

- 自动质量降级
- 功能禁用策略
- 修改: `packages/core/src/utils/AdaptiveQuality.ts`

### 3.6 跨浏览器兼容性

- Safari 特殊处理
- Firefox 优化
- Edge 兼容性测试

## 阶段 4: 示例项目统一与丰富 (1-2 周)

### 4.1 统一功能实现

#### 所有 4 个示例项目必须包含

1. **基础功能**（已有）

   - 图像加载与切换
   - 自动旋转
   - 陀螺仪控制
   - 全屏模式
   - 截图功能

2. **高级功能**（新增）

   - 多场景切换（至少 3 个场景）
   - 热点交互（点击、悬停、自定义样式）
   - 标注系统演示
   - 测量工具演示
   - 后处理效果切换（Bloom、景深、晕影）
   - HDR 曝光调节
   - 色彩分级预设
   - 相机路径动画（自动导览）
   - 小地图显示
   - 性能监控面板

3. **媒体功能**

   - 360° 视频播放示例
   - 空间音频演示
   - 音量控制

4. **VR/AR 功能**

   - VR 模式入口
   - WebXR 支持检测

5. **工具功能**

   - 距离测量
   - 角度测量
   - 区域选择

### 4.2 示例项目文件结构

#### Vue Demo (`examples/vue-demo/`)

```
src/
├── App.vue (主应用，包含所有功能)
├── components/
│   ├── ControlPanel.vue (控制面板组件)
│   ├── StatsPanel.vue (统计面板)
│   ├── SceneSelector.vue (场景选择器)
│   └── FeatureToggles.vue (功能开关)
├── composables/
│   ├── useViewer.ts (Viewer 逻辑)
│   ├── useHotspots.ts (热点管理)
│   └── useScenes.ts (场景管理)
├── assets/
│   ├── scenes/ (示例场景图片)
│   └── audio/ (示例音频)
└── main.ts
```

#### React Demo (`examples/react-demo/`)

```
src/
├── App.tsx (主应用)
├── components/
│   ├── ControlPanel.tsx
│   ├── StatsPanel.tsx
│   ├── SceneSelector.tsx
│   └── FeatureToggles.tsx
├── hooks/
│   ├── useViewer.ts
│   ├── useHotspots.ts
│   └── useScenes.ts
├── assets/
└── main.tsx
```

#### Lit Demo (`examples/lit-demo/`)

```
src/
├── app-component.ts (主应用)
├── components/
│   ├── control-panel.ts
│   ├── stats-panel.ts
│   ├── scene-selector.ts
│   └── feature-toggles.ts
├── assets/
└── main.ts
```

#### Advanced Example (原生 JS)

- 保持现有实现，但添加缺失功能
- 确保与框架示例功能对等

### 4.3 演示内容丰富化

#### 4.3.1 示例场景资源

- 准备至少 5 个高质量全景场景
  - 室内场景（客厅、厨房、卧室）
  - 室外场景（城市、自然风光）
- 准备 360° 视频示例
- 准备空间音频文件

#### 4.3.2 交互演示

- 每个场景 5-10 个预设热点
- 预设标注示例
- 预设测量示例
- 场景切换过渡动画

#### 4.3.3 UI/UX 提升

- 统一设计语言
- 响应式布局
- 暗黑/明亮主题切换
- 完善的加载状态
- 错误处理提示

### 4.4 示例代码质量

#### 代码规范

- 完整的 TypeScript 类型
- 详细的注释说明
- 性能最佳实践演示
- 错误处理示例

#### 文档完善

- 每个示例的 README
- 功能使用说明
- API 调用示例
- 常见问题解答

## 阶段 5: 测试与文档 (1 周)

### 5.1 测试覆盖

- 单元测试覆盖率 > 70%
- 性能基准测试
- 跨设备兼容性测试
- 压力测试

### 5.2 文档完善

- API 文档更新
- 性能优化指南
- 最佳实践文档
- 迁移指南

### 5.3 构建优化

- 使用 `@ldesign/builder` 统一构建
- 优化打包体积
- Tree-shaking 验证

## 技术实现要点

### 性能优化关键技术

1. **WebGL 优化**: 减少 Draw Call，使用 instancing
2. **内存管理**: LRU 缓存，对象池，及时 dispose
3. **加载优化**: 渐进式加载，WebWorker，压缩纹理
4. **渲染优化**: 按需渲染，视锥体剔除，LOD

### 功能实现关键技术

1. **Canvas 叠加层**: 用于标注、UI 元素
2. **Raycaster**: 用于拾取、交互检测
3. **Shader**: 自定义渲染效果
4. **WebXR API**: VR/AR 功能

### 设备兼容关键技术

1. **特性检测**: 渐进增强
2. **性能评分**: 自动降级
3. **触摸事件**: 手势识别
4. **媒体查询**: 响应式适配

## 预期成果

### 性能指标

- 首屏加载: < 1.5s (4K 图片)
- 内存占用: < 80MB (单场景)
- 帧率: 稳定 60fps (高端设备)
- 帧率: 稳定 30fps (低端设备)
- 包体积: Core < 120KB (gzip)

### 功能清单

- 核心功能: 24 项
- 工具功能: 12 项
- 渲染效果: 10+ 种
- 设备支持: 全平台

### 示例质量

- 4 个框架示例功能 100% 对等
- 每个示例 15+ 交互功能
- 专业级 UI/UX
- 完整的文档和注释

## 风险与应对

### 主要风险

1. **性能优化可能引入 bug** → 完善测试覆盖
2. **功能过多增加复杂度** → 插件化设计
3. **跨设备兼容性问题** → 充分测试
4. **开发时间可能超期** → 优先级管理

### 质量保证

- 每个阶段独立测试
- 性能回归测试
- 代码审查
- 用户测试反馈

### To-dos

- [ ] 阶段1.1: 实现加载性能优化（渐进式加载、WebWorker、纹理压缩、资源预加载）
- [ ] 阶段1.2: 优化运行时性能（渲染管线、对象池、按需渲染、事件系统）
- [ ] 阶段1.3: 优化内存管理（LRU缓存、几何体优化、dispose机制）
- [ ] 阶段1.4: 移动设备优化（设备检测、降级策略、省电模式）
- [ ] 阶段2.1: 实现实用工具类功能（标注系统、区域选择器、路径绘制等6个功能）
- [ ] 阶段2.2: 实现高级渲染效果（环境映射、粒子系统、动态光照等6个功能）
- [ ] 阶段2.3: 扩展集成能力（数据分析、CDN优化、社交分享等6个功能）
- [ ] 阶段2.4: 实现企业级功能（访问控制、离线支持、多语言等6个功能）
- [ ] 阶段3: 完善设备兼容性（桌面、移动、平板、VR/AR、低端设备、跨浏览器）
- [ ] 阶段4.1-4.2: 统一4个示例项目功能，确保完全对等
- [ ] 阶段4.3-4.4: 丰富示例演示内容，提升代码质量和文档
- [ ] 阶段5: 完善测试覆盖、文档更新、构建优化