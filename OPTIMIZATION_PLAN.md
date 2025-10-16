# LDesign 项目优化计划

## 1. 问题分析

### 1.1 代码冗余问题

#### 严重重复的工具类：
1. **CacheManager** - 重复实现于10+个包：
   - `api/src/utils/CacheManager.ts`
   - `kit/src/cache/cache-manager.ts`
   - `cache/src/core/cache-manager.ts`
   - `launcher/src/core/CacheManager.ts`
   - `size/src/core/cache-manager.ts`
   - `engine/src/cache/unified-cache-manager.ts`
   - `i18n/src/core/cache.ts`
   - `http/src/utils/cache.ts`
   - 等等...

2. **PerformanceMonitor** - 重复实现于10+个包：
   - `api/src/utils/PerformanceMonitor.ts`
   - `device/src/utils/PerformanceMonitor.ts`
   - `crypto/src/utils/performance-monitor.ts`
   - `i18n/src/core/performance-monitor.ts`
   - `size/src/core/performance-monitor.ts`
   - `kit/src/performance/performance-monitor.ts`
   - `store/src/utils/performance-monitor.ts`
   - `cache/src/core/performance-monitor.ts`
   - `launcher/src/core/PerformanceMonitor.ts`
   - `builder/src/core/PerformanceMonitor.ts`
   - 等等...

3. **LRUCache** - 重复实现于：
   - `api/src/utils/LRUCache.ts`
   - `crypto/src/utils/lru-cache.ts`

4. **类型定义重复**：
   - 很多通用类型在多个包中重复定义
   - 缺乏统一的类型导出

### 1.2 包依赖混乱
- 有些包之间的依赖关系不清晰
- 缺少明确的包层次结构

### 1.3 打包配置不统一
- 不同包使用不同的打包工具和配置
- 应该统一使用 `@ldesign/builder`

## 2. 优化策略

### 2.1 代码重构策略

#### 阶段一：统一基础工具类
1. **在 `@ldesign/shared` 中创建通用工具**：
   - 创建统一的 `CacheManager` 基类
   - 创建统一的 `PerformanceMonitor` 基类
   - 创建统一的 `LRUCache` 实现
   - 其他通用工具（如 debounce、throttle 等）

2. **在 `@ldesign/kit` 中保留Node.js专用工具**：
   - 文件系统操作
   - 进程管理
   - 网络工具
   - 数据库工具

#### 阶段二：删除重复实现
1. 逐个包检查并删除重复的工具类
2. 改为从 `@ldesign/shared` 或 `@ldesign/kit` 导入
3. 保留包特有的扩展实现

#### 阶段三：统一类型定义
1. 在 `@ldesign/shared` 中定义通用类型
2. 删除各包中重复的类型定义
3. 确保类型导出路径清晰

#### 阶段四：统一打包配置
1. 所有包统一使用 `@ldesign/builder`
2. 删除各包中的自定义 rollup 配置
3. 通过 builder 配置文件进行自定义

### 2.2 具体执行计划

#### Step 1: 准备 shared 包 (1-2天)
- [ ] 在 `@ldesign/shared` 中创建 `utils/cache-manager.ts`
- [ ] 在 `@ldesign/shared` 中创建 `utils/performance-monitor.ts`
- [ ] 在 `@ldesign/shared` 中创建 `utils/lru-cache.ts`
- [ ] 完善类型定义
- [ ] 编写单元测试
- [ ] 打包并验证

#### Step 2: 迁移 api 包 (半天)
- [ ] 更新 package.json 添加 shared 依赖
- [ ] 删除重复的工具类
- [ ] 更新导入路径
- [ ] 运行类型检查
- [ ] 运行测试
- [ ] 打包验证

#### Step 3: 迁移其他包 (2-3天)
按照以下顺序依次迁移：
- [ ] cache
- [ ] http
- [ ] device
- [ ] crypto
- [ ] i18n
- [ ] size
- [ ] store
- [ ] engine
- [ ] router
- [ ] launcher
- [ ] builder
- [ ] template

每个包的迁移步骤：
1. 添加依赖
2. 删除重复代码
3. 更新导入
4. 类型检查
5. 测试
6. 打包

#### Step 4: 全局验证 (1天)
- [ ] 运行所有包的类型检查
- [ ] 运行所有包的 lint
- [ ] 运行所有包的测试
- [ ] 运行所有包的打包
- [ ] 检查打包产物大小

#### Step 5: 清理和文档 (半天)
- [ ] 删除未使用的文件
- [ ] 更新文档
- [ ] 更新 README
- [ ] 提交代码

### 2.3 风险控制

1. **分阶段进行**：一次只迁移一个包
2. **保持测试覆盖**：每次迁移后立即测试
3. **版本管理**：使用 git 分支管理
4. **可回滚**：出问题立即回滚

## 3. 预期效果

### 3.1 代码量减少
- 预计减少 30-40% 的重复代码
- 每个包平均减少 500-1000 行代码

### 3.2 维护性提升
- 统一的工具类更易维护
- 修复bug只需要改一处
- 新功能可以快速在所有包中使用

### 3.3 打包体积优化
- 通过 tree-shaking 减少重复代码
- 共享依赖减少总体积

### 3.4 类型安全
- 统一的类型定义
- 更好的 IDE 支持
- 减少类型错误

## 4. 时间估算

- 总计：5-7个工作日
- 建议分多次提交，每次1-2个包

## 5. 优先级

### 高优先级（立即执行）
1. CacheManager 统一
2. PerformanceMonitor 统一
3. LRUCache 统一

### 中优先级（本周内完成）
4. 类型定义统一
5. 删除未使用的代码

### 低优先级（有时间再做）
6. 打包配置优化
7. 文档更新

## 6. 后续维护

1. **代码审查**：新代码必须通过审查
2. **重复检测**：定期检查重复代码
3. **依赖管理**：定期更新依赖
4. **性能监控**：持续监控性能指标
