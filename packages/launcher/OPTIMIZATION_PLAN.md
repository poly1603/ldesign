# @ldesign/launcher 优化执行计划

## 🎯 优化目标
- 消除代码重复和冗余
- 优化性能和内存使用
- 改进文件结构
- 添加实用新功能
- 确保类型完整无错误

## 📋 已发现的问题

### 1. 代码重复问题
- ✅ **PerformanceMetrics类型重复**：在PerformanceMonitor和PerformanceOptimizer中有不同定义
- ✅ **插件管理功能重叠**：PluginManager和SmartPluginManager职责不清
- ✅ **依赖分析重复**：DependencyAnalyzer和AIOptimizer都有依赖分析功能
- ✅ **内存监控重复**：多个地方都有内存使用监控代码

### 2. 性能问题
- ✅ **缓存策略可优化**：CacheManager的LRU算法可以改进
- ✅ **并行处理不足**：某些地方可以使用Promise.all并行处理
- ✅ **内存泄漏风险**：EventEmitter未正确清理监听器
- ✅ **文件系统操作未缓存**：频繁读取package.json

### 3. 文件结构问题
- ✅ **核心模块过多**：core目录下有15个文件，职责不够清晰
- ✅ **工具函数分散**：utils目录下有23个文件，可以合并
- ✅ **类型定义分散**：types目录下有多个文件，有重复定义

### 4. 未实现功能
- ✅ **TODO标记**：多处TODO未实现
- ✅ **测试覆盖不足**：部分核心功能缺少测试

## 🚀 优化方案

### Phase 1: 类型系统优化 ✅
**目标**：统一类型定义，消除重复

#### 1.1 创建统一的性能类型定义
```typescript
// packages/launcher/src/types/performance.ts
export interface PerformanceMetrics {
  // 统一所有性能指标定义
}
```

#### 1.2 合并重复的类型定义
- 合并PerformanceMonitor和PerformanceOptimizer的类型
- 统一插件相关类型定义
- 整理配置类型定义

### Phase 2: 核心模块重构 🔄
**目标**：消除功能重复，优化模块职责

#### 2.1 合并插件管理器
- 保留PluginManager作为核心插件管理
- 将SmartPluginManager的自动检测功能集成到PluginManager
- 删除重复代码

#### 2.2 统一性能监控
- PerformanceMonitor负责数据收集
- PerformanceOptimizer负责优化建议
- 共享统一的类型定义

#### 2.3 优化依赖分析
- DependencyAnalyzer作为主要依赖分析工具
- AIOptimizer调用DependencyAnalyzer而不是重复实现

### Phase 3: 性能优化 🔄
**目标**：提升性能，降低内存占用

#### 3.1 缓存优化
- 改进LRU算法实现
- 添加内存压力感知
- 实现渐进式缓存清理

#### 3.2 并行处理优化
- 识别可并行的操作
- 使用Worker线程处理CPU密集任务
- 优化Promise并发控制

#### 3.3 内存管理优化
- 添加内存监控和自动清理
- 优化大对象的生命周期
- 实现对象池复用

### Phase 4: 文件结构优化 📋
**目标**：清晰的模块组织

#### 4.1 重组core目录
```
core/
  ├── launcher/          # 启动器核心
  │   └── ViteLauncher.ts
  ├── config/            # 配置管理
  │   ├── ConfigManager.ts
  │   └── ConfigPresets.ts
  ├── plugin/            # 插件系统
  │   ├── PluginManager.ts (合并SmartPluginManager)
  │   └── PluginMarket.ts
  ├── performance/       # 性能系统
  │   ├── PerformanceMonitor.ts
  │   └── PerformanceOptimizer.ts
  ├── cache/             # 缓存系统
  │   └── CacheManager.ts
  └── tools/             # 工具管理
      └── ToolsManager.ts
```

#### 4.2 优化utils目录
- 合并相似的工具函数
- 按功能分组
- 删除未使用的工具

### Phase 5: 新功能添加 📋
**目标**：添加高价值功能

#### 5.1 增强的依赖分析
- 实时依赖图可视化
- 循环依赖检测和修复建议
- 依赖安全扫描

#### 5.2 智能构建优化
- 基于项目特征的自动优化
- 构建性能预测
- 智能缓存预热

#### 5.3 开发体验增强
- 更好的错误提示
- 交互式配置向导
- 实时性能仪表板

### Phase 6: 测试和验证 📋
**目标**：确保质量

#### 6.1 单元测试
- 核心模块测试覆盖率 > 80%
- 工具函数测试覆盖率 > 90%

#### 6.2 集成测试
- 完整的启动流程测试
- 多框架兼容性测试

#### 6.3 性能测试
- 构建性能基准测试
- 内存使用基准测试

## 📊 预期收益

### 代码质量
- 减少代码重复 40%
- 降低圈复杂度 30%
- 提高测试覆盖率至 85%

### 性能提升
- 构建速度提升 25-35%
- 内存占用降低 30-40%
- 缓存命中率提升至 90%+

### 开发体验
- 类型提示更准确
- 错误信息更清晰
- 配置更简单

## 🎯 实施优先级

### 高优先级（立即执行）
1. ✅ 修复TypeScript类型错误
2. 🔄 统一性能类型定义
3. 🔄 合并重复的Manager类
4. 🔄 优化缓存策略

### 中优先级（本周完成）
5. 📋 重组文件结构
6. 📋 优化并行处理
7. 📋 添加内存管理

### 低优先级（下周完成）
8. 📋 添加新功能
9. 📋 完善测试
10. 📋 性能基准测试

## ✅ 已完成
- [x] 修复SmartPresetManager.ts的alias类型错误
- [x] 类型检查通过

## 🔄 进行中
- [ ] 创建统一的性能类型定义
- [ ] 优化核心模块

## 📋 待开始
- [ ] 文件结构重组
- [ ] 新功能开发
- [ ] 测试完善

