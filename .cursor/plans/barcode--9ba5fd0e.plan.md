<!-- 9ba5fd0e-c426-490e-80e9-bda196eff365 68d4ed34-1441-43c5-b031-15f6ddf65638 -->
# Barcode 库全面优化计划

## 一、性能优化

### 1.1 包体积优化

- 分析当前构建产物大小，识别冗余代码
- 优化 Quagga2 的导入方式，改为完全的按需加载
- 实现编码器的动态导入，只加载用户需要的格式
- 添加 sideEffects 配置，改善 tree-shaking
- 创建独立的子包入口：`@ldesign/barcode/generator`、`@ldesign/barcode/scanner`

关键文件：

- `src/index.ts` - 重构为按需导出
- `src/formats/index.ts` - 创建格式编码器注册表
- `package.json` - 添加 sideEffects 和更细粒度的 exports

### 1.2 渲染性能优化

- Canvas 渲染器：使用 OffscreenCanvas (Web Worker 支持)
- SVG 渲染器：优化 DOM 操作，减少重绘
- 添加渲染缓存机制，相同配置直接复用
- 实现批量生成优化器，一次性渲染多个条码
- 添加虚拟滚动支持（针对大量条码展示场景）

关键文件：

- `src/renderers/canvas-renderer.ts` - 添加 OffscreenCanvas
- `src/renderers/svg-renderer.ts` - 优化 DOM 构建
- `src/core/barcode-cache.ts` - 新建缓存层
- `src/core/batch-generator.ts` - 新建批量生成器

### 1.3 扫描性能优化

- 实现图像预处理的 Web Worker 版本
- 添加扫描结果缓存（基于图像哈希）
- 优化旋转重试策略，使用智能角度检测
- 添加扫描区域裁剪功能，减少处理面积

关键文件：

- `src/scanner/preprocessor.ts` - 优化算法
- `src/scanner/image-scanner.ts` - 添加缓存和智能重试
- `src/scanner/workers/preprocess.worker.ts` - 新建 Worker

## 二、完整测试体系

### 2.1 单元测试

- 为每个编码器编写完整测试（7个格式）
- 测试所有校验和计算函数
- 测试格式验证器和自动检测
- 测试渲染器的输出正确性
- 测试扫描预处理算法

文件结构：

- `src/formats/__tests__/` - 编码器测试
- `src/utils/__tests__/` - 工具函数测试
- `src/renderers/__tests__/` - 渲染器测试
- `src/scanner/__tests__/` - 扫描器测试

### 2.2 集成测试

- 端到端生成测试（配置 → 编码 → 渲染 → 导出）
- 端到端扫描测试（图片 → 预处理 → 解码 → 结果）
- Vue/React 组件集成测试
- 批量处理测试

文件：

- `tests/integration/generation.test.ts`
- `tests/integration/scanning.test.ts`
- `tests/integration/vue.test.ts`
- `tests/integration/react.test.tsx`

### 2.3 测试基础设施

- 配置 Vitest
- 添加测试覆盖率报告（目标 >85%）
- 创建测试用的条码图片资源
- 添加性能基准测试

文件：

- `vitest.config.ts` - 测试配置
- `tests/fixtures/` - 测试资源
- `tests/benchmarks/` - 性能测试

## 三、示例完善

### 3.1 完善 example.html

- 实现完整的生成示例（所有7种格式）
- 实现文件上传扫描功能
- 添加实时配置调整 UI
- 添加性能监控面板
- 支持从构建产物加载（使用 UMD 格式）

关键改进：

- 添加 UMD 构建支持
- 创建可直接运行的演示页面
- 添加交互式配置面板

### 3.2 优化 Vite 演示应用

- 完善 `examples/vite-demo/src/App.vue`
- 添加所有格式的生成演示
- 添加摄像头实时扫描（新功能预览）
- 添加批量生成和导出示例
- 创建漂亮的 UI 界面

文件：

- `examples/vite-demo/src/App.vue` - 主应用
- `examples/vite-demo/src/components/` - 拆分组件
- `examples/vite-demo/src/composables/` - 演示用 hooks

## 四、代码质量提升

### 4.1 错误处理增强

- 统一的错误类型定义
- 添加详细的错误消息和恢复建议
- 实现错误边界（Vue/React）
- 添加降级策略（如 Scanner 不可用时的提示）

文件：

- `src/errors/index.ts` - 错误类型定义
- `src/adapters/vue/components/ErrorBoundary.vue`
- `src/adapters/react/components/ErrorBoundary.tsx`

### 4.2 类型安全改进

- 添加更严格的泛型约束
- 完善所有公共 API 的 JSDoc 注释
- 添加类型守卫函数
- 导出所有必要的类型工具

文件：

- `src/types/index.ts` - 扩展类型定义
- `src/types/guards.ts` - 类型守卫
- `src/types/utils.ts` - 类型工具

### 4.3 内存管理

- 审查所有事件监听器，确保清理
- 检查 Canvas/SVG 元素的生命周期
- 添加资源池（复用 Canvas 对象）
- 实现自动垃圾回收提示

文件：

- `src/core/resource-pool.ts` - 资源池
- `src/renderers/` - 改进生命周期管理

### 4.4 性能监控

- 添加可选的性能追踪
- 实现编码/渲染/扫描的耗时统计
- 添加性能建议 API
- 创建性能报告工具

文件：

- `src/performance/monitor.ts` - 性能监控器
- `src/performance/profiler.ts` - 性能分析器

## 五、构建优化

### 5.1 多格式构建

- ESM（现代浏览器和打包工具）
- CommonJS（Node.js 兼容）
- UMD（直接浏览器使用，用于 example.html）
- TypeScript 类型定义

### 5.2 模块拆分

```
@ldesign/barcode          - 完整包
@ldesign/barcode/core     - 核心（无框架适配器）
@ldesign/barcode/generator - 仅生成
@ldesign/barcode/scanner  - 仅扫描
@ldesign/barcode/vue      - Vue 适配器
@ldesign/barcode/react    - React 适配器
```

### 5.3 构建配置

- 优化 tsconfig.json
- 配置 builder 支持 UMD
- 添加 sourcemap
- 压缩和混淆配置

文件：

- `package.json` - 完善 exports
- `tsconfig.json` - 构建优化
- `rollup.config.js` - 如需自定义配置

## 六、文档和开发体验

### 6.1 API 文档改进

- 为所有公共函数添加完整 JSDoc
- 添加使用示例到注释中
- 改进类型提示的可读性

### 6.2 README 更新

- 添加性能对比数据
- 添加最佳实践章节
- 更新示例代码（展示新优化）
- 添加常见问题解答

### 6.3 迁移指南

- 如有 breaking changes，创建迁移文档
- 提供从 v0.1 升级的指南

## 实施顺序

1. **Phase 1**: 测试基础设施 + 单元测试（保证重构安全）
2. **Phase 2**: 性能优化（渲染、包体积、扫描）
3. **Phase 3**: 代码质量提升（错误处理、内存管理）
4. **Phase 4**: 示例完善（example.html + Vite demo）
5. **Phase 5**: 构建优化 + 文档更新
6. **Phase 6**: 集成测试 + 性能基准测试

## 成功标准

- ✅ 测试覆盖率 >85%
- ✅ 包体积减少 >30%（通过按需加载）
- ✅ 渲染性能提升 >50%（批量场景）
- ✅ 所有示例可独立运行
- ✅ 零内存泄漏
- ✅ 完整的 TypeScript 类型覆盖
- ✅ 文档完善，所有 API 有注释

### To-dos

- [ ] 配置测试基础设施（Vitest、覆盖率、fixtures）
- [ ] 编写7个编码器的完整单元测试
- [ ] 编写工具函数和校验函数的单元测试
- [ ] 优化包体积（按需加载、sideEffects、动态导入）
- [ ] 优化渲染性能（OffscreenCanvas、缓存、批量生成）
- [ ] 优化扫描性能（Web Worker、智能重试、缓存）
- [ ] 增强错误处理（错误类型、边界、降级策略）
- [ ] 改进内存管理（资源池、生命周期、清理）
- [ ] 添加性能监控和分析工具
- [ ] 完善 example.html（UMD构建、完整功能、UI优化）
- [ ] 优化 Vite 演示应用（完整功能、美化UI）
- [ ] 优化构建配置（UMD、模块拆分、sourcemap）
- [ ] 编写集成测试（端到端、框架组件）
- [ ] 更新文档（JSDoc、README、性能数据、最佳实践）