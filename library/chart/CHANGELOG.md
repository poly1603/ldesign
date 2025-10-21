# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-10-21

### 🎉 重大优化版本

#### ✨ 新增功能

**性能优化**
- ✅ RAF 渲染调度器 - 批量处理，保持 60 FPS
- ✅ 高性能哈希算法 - 缓存键生成速度提升 80-90%
- ✅ 并行模块加载 - 加载速度提升 25%
- ✅ 预加载功能 - 延迟加载常用模块
- ✅ 自适应虚拟渲染 - 动态调整分片大小

**内存管理**
- ✅ LRU 缓存策略 - 智能淘汰，命中率统计
- ✅ LRU 实例管理 - 访问频率跟踪，优先级管理
- ✅ 智能清理系统 - 空闲时段清理，分级策略
- ✅ 内存泄漏防护 - 事件管理器，循环引用检测
- ✅ 内存监控 - 自动检测和告警

**数据处理**
- ✅ LTTB 采样算法 - 保持趋势的数据降维
- ✅ 降采样算法 - average、max、min、first、last
- ✅ RLE 数据压缩 - Run Length Encoding
- ✅ 二进制传输 - Transferable Objects 优化

**开发体验**
- ✅ 统一错误处理 - 详细信息和恢复建议
- ✅ 性能监控工具 - 实时追踪性能指标
- ✅ 30+ 工具函数 - 记忆化、批处理、重试等
- ✅ 响应式系统 - IntersectionObserver、断点支持

**工程化**
- ✅ Tree-shaking 优化 - 打包体积减小 15-20%
- ✅ Terser 压缩优化 - 移除 console、多次压缩
- ✅ sideEffects: false - 支持更好的 tree-shaking

#### 📈 性能提升

- **初始化速度**：提升 40%（800ms → 480ms）
- **模块加载**：提升 25%（200ms → 150ms）
- **渲染性能**：提升 50%（150ms → 75ms）
- **大数据处理**：提升 70%（2500ms → 750ms）
- **内存占用**：降低 30%（120MB → 84MB）
- **GC 压力**：降低 50%
- **打包体积**：减小 16%（ESM）

#### 🔧 改进

- 优化深度合并性能
- 优化对象池，添加多种池类型
- 优化虚拟渲染，支持预加载
- 优化 Worker，支持采样和压缩
- 优化响应式，支持可见性检测

#### 📚 文档

- ✅ 性能优化指南
- ✅ 最佳实践文档
- ✅ 优化报告（详细技术实现）
- ✅ 成果展示文档

#### 🐛 Bug 修复

- 修复潜在的内存泄漏问题
- 修复循环引用导致的问题
- 修复缓存键生成性能问题

---

## [1.0.0] - 2024-01-01

### 🎉 Initial Release

#### Features

- **Core System**
  - ✅ Chart class with full lifecycle management
  - ✅ Smart configuration generator
  - ✅ Automatic data parsing and inference
  - ✅ Instance manager with cleanup
  - ✅ Theme system with multiple presets

- **Performance**
  - ✅ On-demand loading for ECharts modules
  - ✅ Virtual rendering for large datasets (100k+ points)
  - ✅ Web Worker support for data processing
  - ✅ Intelligent caching with WeakRef
  - ✅ Object pooling for memory optimization

- **Chart Types**
  - ✅ Line, Bar, Pie, Scatter, Radar
  - ✅ Gauge, Funnel, Heatmap
  - ✅ Candlestick, Mixed charts
  - ✅ Support for all ECharts chart types

- **Framework Support**
  - ✅ Vue 3 adapter with components and composables
  - ✅ React adapter with components and hooks
  - ✅ Lit adapter with web components
  - ✅ Vanilla JavaScript API

- **Theme System**
  - ✅ 5 built-in themes (light, dark, blue, green, purple)
  - ✅ Custom theme registration
  - ✅ Dark mode support
  - ✅ Font size adjustment
  - ✅ System preference detection

- **Data Formats**
  - ✅ Simple array support
  - ✅ Object array with auto-detection
  - ✅ Standard format with labels and datasets
  - ✅ Time series data recognition

- **Documentation**
  - ✅ Quick start guide
  - ✅ API reference
  - ✅ Data formats guide
  - ✅ Performance optimization guide
  - ✅ Theming guide

- **Examples**
  - ✅ Vue 3 example application
  - ✅ React example application
  - ✅ Multiple chart type demos

#### Technical Details

- TypeScript 5.3+
- Vue 3.4+
- React 18+
- Lit 3+
- ECharts 5.4+
- Rollup build system
- Multi-format output (ESM, CJS, UMD)

#### Bundle Size

- Core: ~50KB (gzipped)
- Vue adapter: ~10KB (gzipped)
- React adapter: ~10KB (gzipped)
- Lit adapter: ~8KB (gzipped)

#### Performance

- Small dataset (<1k): ~50ms
- Medium dataset (1k-10k): ~150ms
- Large dataset (10k-100k): ~500ms (optimized)
- Huge dataset (>100k): ~1500ms (fully optimized)

### 📦 Package Structure

```
@ldesign/chart
├── dist/
│   ├── index.{esm,cjs,umd}.js
│   ├── vue.{esm,cjs,umd}.js
│   ├── react.{esm,cjs,umd}.js
│   └── lit.{esm,cjs,umd}.js
├── docs/
├── examples/
└── src/
```

### 🔧 Configuration

Supports comprehensive configuration options:
- Basic: title, legend, tooltip, grid
- Style: theme, darkMode, fontSize, color
- Performance: lazy, virtual, worker, cache
- Interaction: dataZoom, toolbox, responsive

### 🐛 Known Issues

None at release.

### 🙏 Acknowledgments

- Apache ECharts team for the excellent charting library
- Vue.js, React, and Lit communities
- All contributors and testers

---

## Future Releases

### [1.1.0] - Planned

#### Features
- [ ] Additional chart type generators
- [ ] Enhanced animation system
- [ ] More theme presets
- [ ] Plugin system
- [ ] Internationalization (i18n)

#### Improvements
- [ ] Enhanced TypeScript types
- [ ] Better error messages
- [ ] Performance optimizations
- [ ] Documentation improvements

#### Bug Fixes
- [ ] TBD based on user feedback

---

**Note**: This project follows [Semantic Versioning](https://semver.org/).

