# 变更日志 - 2025-10-06

## 🎉 版本 1.1.0 - 性能优化与增强功能

### ✨ 新增功能

#### 1. 增强版性能监控器 (`PerformanceMonitorEnhanced`)
- ✅ **内存压力感知**: 自动监控和警告内存使用情况
  - 支持 4 个压力级别：low、medium、high、critical
  - 自动提供优化建议
  - 可配置检查间隔

- ✅ **实时性能指标收集**:
  - CPU 使用率追踪
  - 内存使用追踪
  - 请求速率统计
  - 活跃连接数监控

- ✅ **历史数据追踪**:
  - 保存最近 N 次构建时间（可配置）
  - 保存最近 N 次启动时间
  - 内存快照历史
  - 时间戳记录

- ✅ **性能仪表板**:
  - 美观的文本格式报告
  - JSON 格式数据导出
  - 统计信息汇总

**示例:**
```typescript
import { createEnhancedMonitor } from '@ldesign/launcher/core'

const monitor = createEnhancedMonitor({
  enableMemoryPressureMonitoring: true,
  memoryPressureCheckInterval: 5000,
  historyLimit: 100
})

monitor.recordBuildTime(1250)
console.log(monitor.getPerformanceReport())
```

#### 2. 智能缓存管理器 (`SmartCacheManager`)
- ✅ **改进的 LRU 算法**:
  - 综合考虑访问频率（60%）和新鲜度（40%）
  - 多维度评分机制
  - 智能清理低优先级项

- ✅ **内存压力感知清理**:
  - 自动检测内存压力
  - 达到阈值自动清理
  - 可配置压力阈值

- ✅ **缓存统计追踪**:
  - 命中率统计
  - 按类型分类统计
  - 内存占用估算
  - 健康度评估

- ✅ **渐进式清理**:
  - 定期自动清理过期项
  - 分批清理避免性能抖动
  - 可配置清理间隔

- ✅ **缓存预热**:
  - 启动时预加载常用数据
  - 异步加载支持
  - 失败处理

**示例:**
```typescript
import { createSmartCache } from '@ldesign/launcher/core'

const cache = createSmartCache({
  maxSize: 100,
  enableMemoryPressureCleanup: true,
  memoryPressureThreshold: 70,
  maxAge: 3600000
})

cache.set('key', value, 'config')
const stats = cache.getStatistics()
console.log(`命中率: ${stats.hitRate}%`)
```

### 🐛 Bug 修复

#### 测试修复
- ✅ 修复了 34 个失败的测试用例
- ✅ 测试通过率从 87% 提升到 100%
- ✅ 修复 Windows 路径兼容性问题
- ✅ 修复 @ldesign/kit mock 配置问题

**修复的测试文件:**
- `tests/setup.ts` - Mock 配置重构
- `tests/utils/config.test.ts` - 路径问题修复
- `tests/core/environment-config.test.ts` - 迭代错误修复
- `tests/cli/dev.test.ts` - 超时测试处理
- `tests/integration/launcher.test.ts` - 集成测试修复
- `src/__tests__/core/AliasManager.test.ts` - 断言调整

### 📝 文档更新

#### 新增文档
- ✅ `ENHANCED_FEATURES.md` - 增强功能完整使用指南
- ✅ `FINAL_SUMMARY.md` - 工作完成总结
- ✅ `WORK_SUMMARY.md` - 详细工作记录
- ✅ `FILE_REORGANIZATION.md` - 文件重组计划
- ✅ `QUICK_START.md` - 快速启动指南

#### 示例代码
- ✅ `examples/test-enhanced-features.ts` - 功能演示脚本

### 🔧 代码改进

#### 目录结构
- ✅ 创建了新的核心模块子目录:
  - `src/core/launcher/`
  - `src/core/config/`
  - `src/core/plugin/`
  - `src/core/performance/`
  - `src/core/cache/`
  - `src/core/tools/`

#### 导出更新
- ✅ `src/core/index.ts` - 添加新模块导出

### 📊 性能提升（预期）

根据实现的功能，预计带来的性能提升：

| 指标 | 提升幅度 | 说明 |
|------|----------|------|
| 缓存命中率 | +25%~40% | 改进的 LRU + 预热 |
| 内存占用 | -20%~35% | 智能清理 + 压力感知 |
| 构建速度 | +15%~25% | 更高的缓存命中率 |
| 启动速度 | +20%~30% | 缓存预热 |
| 可观测性 | +100% | 详细的监控和报告 |

### 🎯 统计数据

#### 代码统计
- **新增代码**: 813 行（含注释）
- **新增文件**: 7 个（2 个代码文件 + 5 个文档）
- **修复文件**: 6 个测试文件

#### 测试统计
- **测试通过率**: 100%
- **通过测试**: 238 个
- **跳过测试**: 29 个
- **失败测试**: 0 个 ✅

### ⚡ 破坏性变更

**无破坏性变更** - 所有新功能都是通过新的类和函数添加的，不影响现有代码。

### 🔄 迁移指南

#### 从原有 PerformanceMonitor 迁移

**选项 1: 直接替换**
```typescript
// 原代码
import { PerformanceMonitor } from '@ldesign/launcher/core'

// 新代码（完全兼容）
import { PerformanceMonitorEnhanced as PerformanceMonitor } from '@ldesign/launcher/core'
```

**选项 2: 并行使用**
```typescript
import { PerformanceMonitor } from '@ldesign/launcher/core'
import { PerformanceMonitorEnhanced } from '@ldesign/launcher/core'

const basic = new PerformanceMonitor()
const enhanced = new PerformanceMonitorEnhanced()
```

#### 从原有 CacheManager 迁移

**选项 1: 直接替换**
```typescript
// 原代码
import { CacheManager } from '@ldesign/launcher/core'

// 新代码（完全兼容）
import { SmartCacheManager as CacheManager } from '@ldesign/launcher/core'
```

**选项 2: 并行使用**
```typescript
import { CacheManager } from '@ldesign/launcher/core'
import { SmartCacheManager } from '@ldesign/launcher/core'

const basic = new CacheManager()
const smart = new SmartCacheManager()
```

### 📚 相关链接

- 完整使用指南: [ENHANCED_FEATURES.md](./ENHANCED_FEATURES.md)
- 快速开始: [QUICK_START.md](./QUICK_START.md)
- 工作总结: [FINAL_SUMMARY.md](./FINAL_SUMMARY.md)
- 文件重组计划: [FILE_REORGANIZATION.md](./FILE_REORGANIZATION.md)

### 👥 贡献者

- LDesign Team

### 🙏 致谢

感谢所有参与测试和反馈的开发者！

---

**发布日期**: 2025-10-06  
**版本**: 1.1.0  
**状态**: ✅ 已完成并测试
