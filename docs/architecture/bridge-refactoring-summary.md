# 桥接插件重构总结

## 问题分析

### 原有设计的问题

之前的实现方案中，桥接插件（i18n-bridge、color-bridge、size-bridge）作为独立包存在于 `packages/engine/packages/plugins/` 目录下，这些插件依赖了 `@ldesign/engine-core`，导致以下问题：

1. **功能包与 engine 高度耦合**：如果功能包（i18n、color、size）要使用这些桥接插件，就必须间接依赖 engine
2. **违背包独立性原则**：功能包无法完全独立使用，破坏了"功能包可以独立使用"的设计原则
3. **架构层次混乱**：桥接逻辑应该属于应用层关注点，而不是包级别的关注点

## 解决方案

### 核心思路

将桥接逻辑从独立包移到应用层（`apps/app-vue`），利用功能包自身的事件系统特性，在应用层编写桥接代码。

### 具体实现

#### 1. 删除桥接插件包

删除了以下目录：
- `packages/engine/packages/plugins/i18n-bridge`
- `packages/engine/packages/plugins/color-bridge`
- `packages/engine/packages/plugins/size-bridge`

#### 2. 应用层桥接工具

在 `apps/app-vue/src/utils/state-bridge.ts` 中实现桥接逻辑：

```typescript
/**
 * 状态桥接工具
 * 
 * 将各个功能包（i18n、color、size）的状态桥接到 engine.state
 * 
 * 注意：这是应用层代码，可以依赖 engine
 * 功能包（i18n、color、size）保持完全独立，不依赖 engine
 */

// 提供三个独立的桥接函数
export function connectI18nToEngine(engine: VueEngine, i18n: OptimizedI18n): () => void
export function connectColorToEngine(engine: VueEngine, themeManager: ThemeManager): () => void
export function connectSizeToEngine(engine: VueEngine, sizeManager: SizeManager): () => void

// 提供一个便捷的统一桥接函数
export function connectAllToEngine(engine: VueEngine): () => void
```

#### 3. 修改 main.ts

```typescript
// 创建引擎并配置插件
const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ /* ... */ }),
    createRouterEnginePlugin({ /* ... */ }),
    createColorEnginePlugin({ /* ... */ }),
    createSizeEnginePlugin({ /* ... */ }),
    // ❌ 移除了桥接插件的使用
  ],
})

// 挂载应用
await engine.mount('#app')

// ✅ 在应用层连接功能包状态到 engine.state
const cleanupBridges = connectAllToEngine(engine)
```

## 架构优势

### 1. 功能包完全独立 ✅

- i18n、color、size 等功能包不依赖 engine
- 可以在任何项目中独立使用
- 符合单一职责原则

### 2. 清晰的架构层次 ✅

```
应用层 (apps/app-vue)
  ├── 依赖 engine
  ├── 依赖功能包 (i18n, color, size)
  └── 负责桥接逻辑 (state-bridge.ts)

功能包层 (packages/i18n, packages/color, packages/size)
  ├── 完全独立
  ├── 提供事件系统
  └── 不依赖 engine

Engine 层 (packages/engine)
  ├── 提供插件系统
  ├── 提供状态管理
  └── 不依赖具体功能包
```

### 3. 灵活的桥接控制 ✅

- 应用层可以选择性地桥接需要的功能
- 可以自定义桥接逻辑
- 返回清理函数，便于资源管理

### 4. 更好的可测试性 ✅

- 功能包可以独立测试
- 桥接逻辑可以独立测试
- 应用层可以模拟桥接

## 使用示例

### 完整桥接（推荐）

```typescript
import { connectAllToEngine } from './utils/state-bridge'

const engine = createVueEngine({ /* ... */ })
await engine.mount('#app')

// 自动桥接所有功能包
const cleanup = connectAllToEngine(engine)

// 应用卸载时清理
onUnmounted(() => {
  cleanup()
})
```

### 选择性桥接

```typescript
import { connectI18nToEngine, connectColorToEngine } from './utils/state-bridge'

const engine = createVueEngine({ /* ... */ })
await engine.mount('#app')

// 只桥接 i18n 和 color
const i18n = engine.api.get('i18n')
const color = engine.api.get('color')

const cleanupI18n = connectI18nToEngine(engine, i18n)
const cleanupColor = connectColorToEngine(engine, color.themeManager)
```

## 迁移指南

如果你的项目之前使用了桥接插件，请按以下步骤迁移：

### 1. 移除桥接插件的导入和使用

```diff
- import { createI18nBridgePlugin } from '@ldesign/engine-plugins/i18n-bridge'
- import { createColorBridgePlugin } from '@ldesign/engine-plugins/color-bridge'
- import { createSizeBridgePlugin } from '@ldesign/engine-plugins/size-bridge'

const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ /* ... */ }),
-   createI18nBridgePlugin(),
    createColorEnginePlugin({ /* ... */ }),
-   createColorBridgePlugin(),
    createSizeEnginePlugin({ /* ... */ }),
-   createSizeBridgePlugin(),
  ],
})
```

### 2. 添加应用层桥接

```diff
+ import { connectAllToEngine } from './utils/state-bridge'

await engine.mount('#app')

+ // 在应用层连接功能包状态到 engine.state
+ const cleanupBridges = connectAllToEngine(engine)
```

## 总结

这次重构彻底解决了功能包与 engine 的耦合问题，实现了真正的包独立性。桥接逻辑现在属于应用层关注点，符合架构设计的最佳实践。

