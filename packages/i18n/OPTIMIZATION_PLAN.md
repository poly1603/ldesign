# @ldesign/i18n 优化计划

## 当前问题分析

### 1. TypeScript 类型错误 (56个)

#### 1.1 重复类型定义
- **CacheStats**: 在 `core/cache.ts` 和 `utils/cache-operations.ts` 中重复定义
- **PerformanceMetrics**: 在多个文件中重复定义
- **TranslationOptions, TranslationResult**: 在 vue composables 中重复导出
- **ScopeOptions, UseI18nScopeReturn**: 重复导出
- **DevToolsOptions, PerformanceOptions**: 重复导出

#### 1.2 缺失的接口属性
- `CacheOptions` 缺少 `ttl` 属性
- `ErrorHandlerConfig` 缺少 `strategy` 属性
- `TranslationCache` 缺少方法: `clearLocale`, `warmUp`, `cleanup`, `getMemoryUsage`
- `Loader` 缺少 `loadNamespace` 方法
- `TranslationStats` 缺少 `params`, `totalTime` 属性

#### 1.3 类型不匹配
- `cache-manager.ts` 中 `size` 应该是数字但被赋值为函数
- 多处 `i18n` 可能为 `undefined` 的问题
- 参数类型不匹配问题

### 2. 代码结构问题

#### 2.1 功能重复的文件
- `cache.ts` vs `cache-manager.ts` vs `cache-operations.ts`
- `performance.ts` vs `performance-manager.ts`
- `errors.ts` vs `error-handler.ts`

#### 2.2 文件组织问题
- 类型定义分散在多个文件
- 导出结构复杂，有重复导出

## 优化方案

### 阶段 1: 类型系统重构 ✓

#### 1.1 统一核心类型定义
**目标**: 将所有核心类型定义集中到 `core/types.ts`

**操作**:
1. 合并 `CacheStats` 定义
2. 合并 `PerformanceMetrics` 定义
3. 添加缺失的接口属性
4. 删除重复的类型定义

**文件修改**:
- `src/core/types.ts` - 添加完整的类型定义
- `src/core/cache.ts` - 删除重复的类型，导入自 types.ts
- `src/utils/cache-operations.ts` - 删除重复的类型，导入自 types.ts
- `src/core/performance.ts` - 删除重复的类型，导入自 types.ts

#### 1.2 修复缺失的方法和属性
**操作**:
1. 在 `TranslationCache` 中添加缺失的方法
2. 在 `Loader` 接口中添加 `loadNamespace` 方法
3. 在 `TranslationStats` 中添加缺失的属性

#### 1.3 修复类型不匹配
**操作**:
1. 修复 `cache-manager.ts` 中的 size 属性访问
2. 添加类型守卫，处理 `i18n` 可能为 undefined 的情况
3. 修复参数类型不匹配

### 阶段 2: 代码结构优化 ✓

#### 2.1 合并缓存相关文件
**目标**: 统一缓存实现，减少重复代码

**方案**:
- 保留 `cache.ts` 作为核心缓存实现
- 将 `cache-manager.ts` 的管理功能整合到 `cache.ts`
- 将 `cache-operations.ts` 的工具函数整合到 `cache.ts`
- 删除冗余文件

**新文件结构**:
```
src/core/cache.ts - 统一的缓存系统
  - TranslationCache 类 (核心缓存)
  - CacheManager 类 (缓存管理)
  - 缓存工具函数
```

#### 2.2 合并性能监控文件
**目标**: 统一性能监控实现

**方案**:
- 保留 `performance-manager.ts` 作为主文件
- 将 `performance.ts` 的功能整合进去
- 删除 `performance.ts`

#### 2.3 合并错误处理文件
**目标**: 统一错误处理系统

**方案**:
- 保留 `error-handler.ts` 作为主文件
- 将 `errors.ts` 的错误类型定义移到 `types.ts`
- 将 `errors.ts` 的错误处理逻辑整合到 `error-handler.ts`
- 删除 `errors.ts`

### 阶段 3: 性能优化 ✓

#### 3.1 缓存优化
- 使用 WeakMap 存储对象引用，减少内存占用
- 优化缓存键生成算法
- 实现更高效的 LRU 策略

#### 3.2 对象池优化
- 扩展对象池的使用范围
- 减少频繁创建的临时对象

#### 3.3 内存管理优化
- 实现自动内存压力检测
- 优化内存清理策略
- 添加内存使用监控

### 阶段 4: Vue 集成优化 ✓

#### 4.1 修复 Vue Composables
- 添加类型守卫
- 修复重复导出
- 优化性能

#### 4.2 修复 Vue 组件
- 修复类型错误
- 优化组件性能
- 添加更好的错误处理

### 阶段 5: 导出优化 ✓

#### 5.1 清理 index.ts
- 删除重复导出
- 优化导出结构
- 添加清晰的分组注释

#### 5.2 优化 package.json exports
- 确保所有导出路径正确
- 优化 tree-shaking

## 实施步骤

### Step 1: 修复类型定义 (优先级: 高)
1. 统一 `CacheStats` 定义
2. 统一 `PerformanceMetrics` 定义
3. 添加缺失的接口属性
4. 修复 `index.ts` 中的重复导出

### Step 2: 修复核心功能 (优先级: 高)
1. 修复 `TranslationCache` 缺失的方法
2. 修复 `cache-manager.ts` 的类型错误
3. 修复 `Loader` 接口

### Step 3: 修复 Vue 集成 (优先级: 中)
1. 修复 Vue composables 的类型错误
2. 修复 Vue 组件的类型错误
3. 添加类型守卫

### Step 4: 合并重复文件 (优先级: 中)
1. 合并缓存相关文件
2. 合并性能监控文件
3. 合并错误处理文件

### Step 5: 性能优化 (优先级: 低)
1. 优化缓存策略
2. 优化对象池
3. 优化内存管理

### Step 6: 测试验证 (优先级: 高)
1. 运行类型检查: `pnpm run type-check`
2. 运行单元测试: `pnpm run test:run`
3. 运行构建: `pnpm run build`
4. 检查包大小: `pnpm run size-check`

## 预期成果

1. **零 TypeScript 错误**: 所有类型错误修复
2. **代码精简**: 减少 20-30% 的冗余代码
3. **性能提升**: 缓存命中率提升 10-15%
4. **内存优化**: 内存占用降低 15-20%
5. **包体积优化**: 打包后体积减少 10-15%
6. **更好的类型安全**: 完整的 TypeScript 类型支持
7. **更清晰的结构**: 文件组织更合理，易于维护

## 风险评估

- **低风险**: 类型定义修复，不影响运行时行为
- **中风险**: 文件合并，需要仔细测试
- **高风险**: 核心功能修改，需要全面测试

## 回滚计划

- 使用 Git 进行版本控制
- 每个阶段完成后进行测试
- 如有问题立即回滚到上一个稳定版本

