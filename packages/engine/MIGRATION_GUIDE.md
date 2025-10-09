# 迁移指南

## v0.2.0 到 v0.2.1

本指南帮助你从 v0.2.0 迁移到 v0.2.1。

### 🎉 主要变化

#### 1. 文件结构优化

**删除的文件**:
- `src/index-lib.ts` - 已删除（仅重新导出，无实际价值）
- `src/index-core.ts` - 已删除（功能与 `core.ts` 重叠）

**影响**: 如果你直接导入这些文件，需要更新导入路径。

**迁移步骤**:

```typescript
// ❌ 旧代码 - 不再可用
import { createEngine } from '@ldesign/engine/index-lib'
import { createEngine } from '@ldesign/engine/index-core'

// ✅ 新代码 - 使用标准入口
import { createEngine } from '@ldesign/engine'        // 完整功能
import { createEngine } from '@ldesign/engine/core'   // 核心功能（无 Vue）
```

#### 2. 工具函数增强

**`debounce` 函数**:
- 新增 `cancel` 方法，可以取消待执行的防抖函数

```typescript
import { debounce } from '@ldesign/engine/utils'

const debouncedFn = debounce(() => {
  console.log('执行')
}, 300)

debouncedFn()
debouncedFn.cancel() // ✨ 新功能：取消防抖
```

**`throttle` 函数**:
- 新增 `leading` 和 `trailing` 选项，控制节流行为

```typescript
import { throttle } from '@ldesign/engine/utils'

// 只在开始时执行
const throttledFn = throttle(() => {
  console.log('执行')
}, 300, { leading: true, trailing: false })

// 只在结束时执行
const throttledFn2 = throttle(() => {
  console.log('执行')
}, 300, { leading: false, trailing: true })

// 开始和结束都执行（默认）
const throttledFn3 = throttle(() => {
  console.log('执行')
}, 300, { leading: true, trailing: true })
```

**影响**: 如果你使用了 `throttle` 函数，默认行为可能会改变。

**迁移步骤**:

```typescript
// ❌ 旧代码 - 可能行为不同
const throttledFn = throttle(fn, 300)

// ✅ 新代码 - 明确指定行为
const throttledFn = throttle(fn, 300, { leading: true, trailing: false })
```

#### 3. 重复导出移除

**删除的导出**:
- `utils.ts` 中的 `performanceDebounce` 和 `performanceThrottle` 已删除

**影响**: 如果你使用了这些导出，需要更新导入。

**迁移步骤**:

```typescript
// ❌ 旧代码 - 不再可用
import { performanceDebounce, performanceThrottle } from '@ldesign/engine/utils'

// ✅ 新代码 - 使用标准导出
import { debounce, throttle } from '@ldesign/engine/utils'
```

#### 4. DevTools 集成（新功能）

**新增功能**: Vue DevTools 深度集成

```typescript
import { createDevToolsIntegration } from '@ldesign/engine'

// 创建 DevTools 集成
const devtools = createDevToolsIntegration({
  enabled: process.env.NODE_ENV !== 'production',
  trackPerformance: true,
  trackStateChanges: true,
  trackErrors: true
})

// 初始化
devtools.init(app, engine)
```

**收益**:
- 在 Vue DevTools 中查看引擎状态
- 实时性能监控
- 错误追踪
- 状态编辑

### 📋 完整迁移清单

- [ ] 更新所有 `index-lib.ts` 和 `index-core.ts` 的导入
- [ ] 检查 `throttle` 函数的使用，确认行为符合预期
- [ ] 更新 `performanceDebounce` 和 `performanceThrottle` 的导入
- [ ] （可选）添加 DevTools 集成以提升开发体验
- [ ] 运行测试确保一切正常

### 🔧 测试你的迁移

```bash
# 运行类型检查
pnpm run type-check

# 运行测试
pnpm run test

# 运行构建
pnpm run build
```

### 💡 最佳实践

1. **使用标准入口**: 优先使用 `@ldesign/engine` 而不是子路径导入
2. **明确指定选项**: 使用 `throttle` 时明确指定 `leading` 和 `trailing` 选项
3. **启用 DevTools**: 在开发环境启用 DevTools 集成以提升调试体验
4. **渐进式迁移**: 可以逐步迁移，新旧代码可以共存

### 🆘 需要帮助？

如果在迁移过程中遇到问题：

1. 查看 [完整文档](./docs/README.md)
2. 查看 [示例代码](./examples/README.md)
3. 提交 [Issue](https://github.com/ldesign/engine/issues)
4. 参与 [讨论](https://github.com/ldesign/engine/discussions)

### 📊 性能改进

v0.2.1 带来了显著的性能改进：

- 📦 包体积减少 ~15%
- ⚡ 初始化时间优化（懒加载）
- 💾 内存占用降低
- 🌲 完全支持 Tree-shaking

### 🎯 向后兼容性

除了以下情况，v0.2.1 完全向后兼容 v0.2.0：

1. 直接导入已删除的文件（`index-lib.ts`、`index-core.ts`）
2. 使用已删除的导出（`performanceDebounce`、`performanceThrottle`）
3. 依赖 `throttle` 的旧默认行为

这些情况都有简单的迁移路径，详见上文。

### 🚀 新功能概览

#### DevTools 集成

```typescript
import { createDevToolsIntegration } from '@ldesign/engine'

const devtools = createDevToolsIntegration({
  enabled: true,
  trackPerformance: true,
  trackStateChanges: true,
  trackErrors: true,
  maxTimelineEvents: 1000
})

devtools.init(app, engine)
```

#### 增强的工具函数

```typescript
import { debounce, throttle } from '@ldesign/engine/utils'

// debounce 支持 cancel
const debouncedFn = debounce(fn, 300)
debouncedFn.cancel()

// throttle 支持 leading/trailing
const throttledFn = throttle(fn, 300, {
  leading: true,
  trailing: false
})
```

#### 优化的文件结构

```typescript
// 清晰的模块划分
import { createEngine } from '@ldesign/engine'           // 完整功能
import { createEngine } from '@ldesign/engine/core'      // 核心功能
import { createCacheManager } from '@ldesign/engine/managers'  // 管理器
import { debounce } from '@ldesign/engine/utils'         // 工具函数
import { useEngine } from '@ldesign/engine/vue'          // Vue 集成
```

---

**更新时间**: 2024-10-06  
**版本**: v0.2.1  
**作者**: LDesign Team

