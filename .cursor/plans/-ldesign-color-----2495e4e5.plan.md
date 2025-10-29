<!-- 2495e4e5-6685-4ca1-b966-a6593f87363e f243b4dd-6911-4f71-b6e1-21463b861e1e -->
# @ldesign/color 包全面优化计划

## 阶段 1: 核心性能优化（packages/core）

### 1.1 升级缓存系统为双向链表 LRU

**当前问题**：

- `packages/core/src/utils/cache.ts` 使用 Map 的简单 LRU，每次访问需要 delete + set
- 性能：O(1) 但有删除开销

**优化方案**：

- 参考 `packages/engine/packages/core/src/cache/cache-manager.ts` 实现
- 使用双向链表 + Map 实现真正的 O(1) LRU
- 添加内存占用估算
- 支持多种淘汰策略（LRU/LFU/FIFO）

**文件修改**：

- `packages/core/src/utils/cache.ts` - 重构为双向链表实现

### 1.2 增强对象池系统

**当前状态**：

- `packages/core/src/utils/objectPool.ts` 已有基础实现
- 缺少统计监控和自动优化

**优化方案**：

- 添加内存占用监控
- 实现自动扩缩容策略
- 添加池命中率统计
- 定时器使用 `unref()` 防止阻止进程退出

**文件修改**：

- `packages/core/src/utils/objectPool.ts` - 增强监控和统计

### 1.3 完善内存管理系统

**当前状态**：

- `packages/core/src/utils/memoryManager.ts` 有基础实现
- 缺少资源限制和警告机制

**优化方案**：

- 添加 `maxSize`、`maxMemory`、`maxDepth` 限制
- 实现阈值警告机制
- 添加 `destroy()` 方法完全释放资源
- 定时器使用 `unref()`

**文件修改**：

- `packages/core/src/utils/memoryManager.ts` - 添加限制和警告

### 1.4 优化 Color 类

**当前状态**：

- `packages/core/src/core/Color.ts` 已优化使用 32-bit integer 存储 RGB
- 使用对象池和缓存

**优化方案**：

- 减少缓存大小（从 50 降到 30）
- 优化对象池参数
- 添加批量操作优化
- 确保所有方法有完整 JSDoc 中文注释

**文件修改**：

- `packages/core/src/core/Color.ts` - 微调优化参数和注释

## 阶段 2: 代码复用和架构优化

### 2.1 提取框架无关的主题管理逻辑

**当前问题**：

- `packages/vue/src/composables/useTheme.ts`
- `packages/react/src/hooks/useTheme.tsx`
- `packages/svelte/src/stores/useTheme.ts`
- `packages/solid/src/primitives/useTheme.tsx`
- 这些文件有 90% 相同的逻辑，仅框架语法不同

**优化方案**：

- 在 `packages/core/src/themes/` 创建 `BaseThemeAdapter.ts`
- 提取所有共享逻辑：状态管理、主题应用、持久化
- 各框架包仅保留框架特定的响应式包装

**新增文件**：

- `packages/core/src/themes/BaseThemeAdapter.ts` - 框架无关的主题管理基类

**修改文件**：

- `packages/vue/src/composables/useTheme.ts` - 简化为薄包装层
- `packages/react/src/hooks/useTheme.tsx` - 简化为薄包装层
- `packages/svelte/src/stores/useTheme.ts` - 简化为薄包装层
- `packages/solid/src/primitives/useTheme.tsx` - 简化为薄包装层
- `packages/angular/src/services/theme.service.ts` - 简化为薄包装层

### 2.2 统一组件结构

**当前问题**：

- 各框架的 ThemePicker 和 ThemeModeSwitcher 组件有重复逻辑

**优化方案**：

- 在 core 提供组件逻辑控制器
- 各框架仅负责 UI 渲染

**新增文件**：

- `packages/core/src/components/ThemePickerController.ts`
- `packages/core/src/components/ThemeModeSwitcherController.ts`

**修改文件**：

- 各框架的组件文件 - 使用控制器简化逻辑

### 2.3 合并重复的工具函数

**当前问题**：

- `packages/core/src/utils/cache.ts`
- `packages/core/src/utils/advancedCache.ts`
- `packages/core/src/utils/adaptiveCache.ts`
- 三个缓存实现有重复代码

**优化方案**：

- 统一为一个高性能缓存实现（双向链表 LRU）
- 通过配置选项支持不同策略
- 移除重复代码

**文件整合**：

- 保留 `cache.ts` 作为主实现
- 删除 `advancedCache.ts` 和 `adaptiveCache.ts`
- 通过配置选项提供高级功能

## 阶段 3: 配置文件标准化

### 3.1 添加 builder.config.ts

**当前问题**：

- 所有子包缺少标准的 builder 配置文件

**优化方案**：

- 为每个子包添加 `builder.config.ts`
- 使用 `@ldesign/builder` 统一构建配置

**新增文件**（每个子包）：

```typescript
// packages/core/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs', 'dts'],
    dir: 'es',
  },
  dts: {
    enabled: true,
  },
  external: [], // 根据包依赖调整
})
```

**需要添加的包**：

- `packages/core/builder.config.ts`
- `packages/vue/builder.config.ts`
- `packages/react/builder.config.ts`
- `packages/svelte/builder.config.ts`
- `packages/solid/builder.config.ts`
- `packages/angular/builder.config.ts`

### 3.2 统一 ESLint 配置

**当前状态**：

- `packages/color/eslint.config.js` 存在但可能不符合规范

**优化方案**：

- 更新为标准的 `@antfu/eslint-config`
- 为每个子包添加 ESLint 配置

**文件修改/新增**：

```javascript
// packages/core/eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: false,
  ignores: ['dist', 'es', 'lib', 'node_modules', '*.md']
})
```

### 3.3 标准化 package.json

**优化方案**：

- 确保所有子包的 package.json 符合规范
- 统一脚本命名（build, dev, type-check, clean）
- 使用 workspace protocol 引用内部包

**需要检查的文件**：

- `packages/core/package.json`
- `packages/vue/package.json`
- `packages/react/package.json`
- `packages/svelte/package.json`
- `packages/solid/package.json`
- `packages/angular/package.json`

## 阶段 4: 类型定义和 JSDoc 完善

### 4.1 添加完整的 JSDoc 注释

**当前状态**：

- 部分函数有 JSDoc，部分没有
- 部分注释是英文

**优化方案**：

- 所有公开 API 必须有完整的中文 JSDoc
- 包含：功能描述、参数说明、返回值、示例、性能注释

**重点文件**：

- `packages/core/src/core/Color.ts`
- `packages/core/src/core/conversions.ts`
- `packages/core/src/core/manipulations.ts`
- `packages/core/src/utils/*.ts`
- 所有导出的函数和类

### 4.2 完善类型定义

**优化方案**：

- 确保无 `any` 类型（除非必要且有注释）
- 使用泛型提供类型推断
- 导出所有公开类型

**文件检查**：

- `packages/core/src/types.ts`
- `packages/core/src/types/enhanced.ts`
- 各模块的类型定义

## 阶段 5: 测试覆盖率提升

### 5.1 补充单元测试

**当前状态**：

- `__tests__/` 目录有基础测试
- 需要补充边界条件和错误情况

**优化方案**：

- 目标覆盖率：> 80%
- 重点测试：缓存系统、对象池、内存管理
- 添加性能测试（关键功能）

**新增测试文件**：

- `__tests__/utils/cache.test.ts` - 缓存系统测试
- `__tests__/utils/objectPool.test.ts` - 对象池测试
- `__tests__/utils/memoryManager.test.ts` - 内存管理测试
- `__tests__/performance/benchmark.test.ts` - 性能测试

### 5.2 更新 vitest 配置

**文件修改**：

- `packages/color/vitest.config.ts` - 确保覆盖率阈值配置正确

## 阶段 6: 文档更新

### 6.1 更新 README

**需要更新的文件**：

- `packages/color/README.md` - 主 README
- `packages/core/README.md` - 核心包文档
- 各框架包的 README - 更新使用方式

### 6.2 更新 API 文档

**文件更新**：

- `packages/color/docs/API.md` - API 参考
- `packages/color/docs/PERFORMANCE.md` - 性能说明
- `packages/color/guide/*.md` - 使用指南

## 实施顺序

1. **阶段 1（核心优化）** - 最重要，影响所有功能
2. **阶段 2（代码复用）** - 大幅减少代码量
3. **阶段 3（配置标准化）** - 确保构建和检查正常
4. **阶段 4（类型和注释）** - 提高代码质量
5. **阶段 5（测试）** - 保证质量
6. **阶段 6（文档）** - 最后更新

## 预期效果

### 性能提升

- 缓存访问：从 O(1) + 删除开销 → 真正的 O(1)
- 内存占用：减少 30-40%（通过优化缓存大小和对象池）
- 对象创建：减少 60-80%（通过改进对象池）

### 代码质量

- 代码行数：减少 40-50%（通过提取共享逻辑）
- 重复代码：减少 80%+（框架包使用共享基类）
- 类型覆盖：100%（无 any）
- 测试覆盖率：> 80%

### 可维护性

- 统一配置：所有包使用标准配置
- 文档完整：所有 API 有中文 JSDoc
- 架构清晰：核心逻辑 vs 框架包装明确分离

### To-dos

- [ ] 升级缓存系统为双向链表 LRU（参考 engine 实现）
- [ ] 增强对象池系统（内存监控、自动优化、unref）
- [ ] 完善内存管理（资源限制、警告、destroy）
- [ ] 提取框架无关的主题管理逻辑到 BaseThemeAdapter
- [ ] 简化各框架的 useTheme 为薄包装层
- [ ] 合并三个缓存实现为一个高性能实现
- [ ] 为所有子包添加 builder.config.ts
- [ ] 统一所有子包的 ESLint 配置
- [ ] 补充所有公开 API 的中文 JSDoc 注释
- [ ] 补充测试至覆盖率 > 80%
- [ ] 更新所有文档（README、API、指南）