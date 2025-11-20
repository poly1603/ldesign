# Shared-State vs Engine 架构对比分析

## 1. 功能对比总览

### 1.1 核心功能对比表

| 功能特性 | `engine.state` + `engine.events` | `GlobalStateBus` | 差异说明 |
|---------|----------------------------------|------------------|---------|
| **状态存储** | ✅ Map-based | ✅ LRU Cache-based | Engine 使用 Map，Shared-State 使用 LRU 缓存（自动淘汰） |
| **状态监听** | ✅ `watch(key, listener)` | ✅ `subscribe(key, callback)` | API 名称不同，功能相同 |
| **事件发布** | ✅ `emit(event, payload)` | ✅ `publish(key, value)` | Engine 分离事件和状态，Shared-State 合并 |
| **批量更新** | ✅ `batch(fn)` | ✅ `batchUpdate(updates)` | 实现方式不同 |
| **深度比较** | ✅ 内置 deepEqual | ❌ 无 | Engine 避免不必要的更新 |
| **通配符事件** | ✅ 支持 `user:*` | ❌ 不支持 | Engine 事件系统更强大 |
| **优先级** | ❌ 无 | ✅ 支持 | Shared-State EventEmitter 支持优先级 |
| **性能监控** | ❌ 无 | ✅ 内置 | Shared-State 记录 publish/subscribe 性能 |
| **LRU 缓存** | ❌ 无 | ✅ 自动淘汰 | Shared-State 自动管理内存 |
| **单例模式** | ❌ 实例化 | ✅ 单例 | Shared-State 全局唯一 |

### 1.2 API 对比

#### Engine StateManager API
```typescript
// 状态管理
engine.state.set(key, value)           // 设置状态
engine.state.get(key)                  // 获取状态
engine.state.has(key)                  // 检查存在
engine.state.delete(key)               // 删除状态
engine.state.watch(key, listener)      // 监听变化
engine.state.batch(fn)                 // 批量更新

// 事件管理
engine.events.emit(event, payload)     // 触发事件
engine.events.on(event, handler)       // 监听事件
engine.events.once(event, handler)     // 一次性监听
engine.events.off(event, handler)      // 移除监听
```

#### GlobalStateBus API
```typescript
// 状态 + 事件合一
stateBus.publish(key, value, metadata)    // 发布状态变化
stateBus.subscribe(key, callback)         // 订阅状态变化
stateBus.subscribeOnce(key, callback)     // 一次性订阅
stateBus.getState(key)                    // 获取当前状态
stateBus.batchUpdate(updates)             // 批量更新
stateBus.getPerformanceReport()           // 性能报告
```

## 2. 架构设计差异

### 2.1 Engine 架构
```
CoreEngine
├── StateManager (状态管理)
│   ├── Map<string, any> (状态存储)
│   ├── Map<string, Set<Listener>> (监听器)
│   └── deepEqual (深度比较)
├── EventManager (事件管理)
│   ├── Map<string, Set<Handler>> (事件处理器)
│   ├── Map<string, Set<PatternListener>> (通配符监听)
│   └── patternToRegex (模式匹配)
└── PluginManager (插件系统)
    ├── 依赖管理
    ├── 生命周期
    └── 热重载
```

**特点**:
- **状态和事件分离**: StateManager 管理状态，EventManager 管理事件
- **实例化**: 每个 Engine 实例有独立的状态和事件系统
- **插件系统**: 强大的插件架构，支持依赖管理和生命周期

### 2.2 Shared-State 架构
```
GlobalStateBus (单例)
├── EventEmitter<GlobalStateMap>
│   ├── Map<key, Set<Listener>> (监听器)
│   └── 优先级排序
├── StateStore
│   └── LRUCache<string, any> (LRU 缓存)
└── PerformanceMetrics
    ├── publishCount
    ├── subscribeCount
    └── avgPublishTime

Adapters (适配器模式)
├── I18nAdapter
├── ColorAdapter
└── SizeAdapter
```

**特点**:
- **状态和事件合一**: 发布状态即触发事件
- **单例模式**: 全局唯一实例，跨包共享
- **适配器模式**: 桥接各个包的事件系统
- **零侵入**: 各包无需依赖 shared-state

## 3. 使用场景对比

### 3.1 Engine 适用场景
- ✅ **应用级状态管理**: 单个应用内的状态管理
- ✅ **插件间通信**: 通过 engine 实例共享状态
- ✅ **生命周期管理**: 需要插件生命周期控制
- ✅ **通配符事件**: 需要 `user:*` 这样的模式匹配

### 3.2 Shared-State 适用场景
- ✅ **跨包数据共享**: 多个独立包之间的状态同步
- ✅ **零侵入集成**: 包不需要依赖 shared-state
- ✅ **性能监控**: 需要跟踪状态变化性能
- ✅ **内存优化**: 需要 LRU 缓存自动淘汰

## 4. 当前项目使用情况

### 4.1 apps/app-vue 中的使用

#### Engine 使用
```typescript
// main.ts
const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ locale: 'zh-CN' }),
    createColorEnginePlugin({ theme: 'light' }),
    createSizeEnginePlugin({ baseSize: 'brand-default' })
  ]
})

// 监听事件
engine.events.on('i18n:localeChanged', (payload) => {
  console.log('语言变化:', payload)
})
```

#### Shared-State 使用
```typescript
// main.ts (手动连接适配器)
const { GlobalStateBus, I18nAdapter, ColorAdapter, SizeAdapter } = await import('@ldesign/shared-state-core')
const stateBus = GlobalStateBus.getInstance()

const i18nAdapter = new I18nAdapter(stateBus)
i18nAdapter.connect(i18nService)

// SharedStateDemo.vue (组件中使用)
const locale = useGlobalState(STATE_KEYS.I18N_LOCALE)
const theme = useGlobalState(STATE_KEYS.COLOR_THEME)
```

### 4.2 功能重叠分析

**重叠部分**:
1. ✅ i18n、color、size 包已经通过 engine 插件集成
2. ✅ engine.events 已经发布 `i18n:localeChanged` 等事件
3. ✅ shared-state 适配器监听相同的事件并重新发布

**结论**: 存在明显的功能重复！

## 5. 整合可行性评估

### 5.1 技术可行性 ✅

#### 方案 A: 将 Shared-State 功能整合到 Engine
**优点**:
- ✅ 消除功能重复
- ✅ 减少包数量和依赖
- ✅ 统一状态管理入口
- ✅ 利用 engine 的插件系统

**缺点**:
- ❌ 破坏包的独立性（i18n、color、size 需要依赖 engine）
- ❌ 增加 engine 包的复杂度
- ❌ 迁移成本较高

#### 方案 B: 保留 Shared-State，但基于 Engine 实现
**优点**:
- ✅ 保持包的独立性
- ✅ 复用 engine 的状态和事件系统
- ✅ 减少代码重复
- ✅ 迁移成本较低

**缺点**:
- ❌ 仍然需要维护 shared-state 包
- ❌ 增加一层抽象

#### 方案 C: 使用 Engine 插件替代适配器
**优点**:
- ✅ 利用 engine 的插件系统
- ✅ 统一的架构模式
- ✅ 更好的生命周期管理
- ✅ 保持包的独立性

**缺点**:
- ❌ 需要重构适配器为插件
- ❌ 需要修改 Vue composables

### 5.2 包独立性分析

#### 当前各包的独立性
```typescript
// @ldesign/i18n-core - 完全独立
export class OptimizedI18n {
  private eventEmitter = new WeakEventEmitter()
  on(event, listener) { /* ... */ }
  emit(event, data) { /* ... */ }
}

// @ldesign/color-core - 完全独立
export class ThemeManager {
  private subscribers = new Set()
  subscribe(callback) { /* ... */ }
  notify() { /* ... */ }
}

// @ldesign/size-core - 完全独立
export class SizeManager {
  private subscribers = new Set()
  subscribe(callback) { /* ... */ }
  notify() { /* ... */ }
}
```

**关键发现**: 所有包都有自己的事件系统，完全独立！

#### 如果整合到 Engine 会怎样？
```typescript
// ❌ 方案 A: 直接依赖 engine
import { CoreEngine } from '@ldesign/engine-core'

export class OptimizedI18n {
  constructor(private engine: CoreEngine) {}
  setLocale(locale) {
    this.engine.state.set('i18n.locale', locale)
    this.engine.events.emit('i18n:localeChanged', { locale })
  }
}
```
**问题**: i18n 包失去独立性，必须依赖 engine！

```typescript
// ✅ 方案 C: 通过插件桥接
// @ldesign/i18n-core 保持独立
export class OptimizedI18n {
  private eventEmitter = new WeakEventEmitter()
  // 保持原有实现
}

// @ldesign/i18n-engine-plugin (新包)
export function createI18nEnginePlugin(options) {
  return {
    name: 'i18n',
    install(ctx, opts) {
      const i18n = createI18n(opts)

      // 桥接 i18n 事件到 engine
      i18n.on('localeChanged', ({ locale, oldLocale }) => {
        ctx.engine.state.set('i18n.locale', { locale, oldLocale })
        ctx.engine.events.emit('i18n:localeChanged', { locale, oldLocale })
      })

      // 注册到 engine
      ctx.engine.api.register('i18n', i18n)
    }
  }
}
```
**优点**: i18n 包保持独立，通过插件桥接到 engine！

### 5.3 性能对比

#### Engine StateManager 性能
- ✅ O(1) 读写（Map-based）
- ✅ 深度比较避免不必要更新
- ✅ 批量更新优化
- ❌ 无内存限制（可能内存泄漏）

#### GlobalStateBus 性能
- ✅ O(1) 读写（LRU Cache）
- ✅ 自动内存管理（LRU 淘汰）
- ✅ 性能监控
- ❌ 无深度比较（可能重复更新）

**结论**: 两者性能相当，各有优势

## 6. 推荐方案

### 🎯 推荐方案 C: 使用 Engine 插件替代 Shared-State 适配器

#### 6.1 方案概述
1. **保留各包的独立性**: i18n、color、size 包保持完全独立
2. **移除 shared-state 包**: 不再需要独立的 GlobalStateBus
3. **使用 engine 插件桥接**: 将适配器改为 engine 插件
4. **统一状态管理**: 通过 `engine.state` 和 `engine.events` 管理所有状态

#### 6.2 架构设计

```
packages/
├── engine/
│   └── packages/
│       ├── core/              # 核心引擎（已有）
│       └── plugins/           # 新增：内置插件包
│           ├── i18n-bridge/   # i18n 桥接插件
│           ├── color-bridge/  # color 桥接插件
│           └── size-bridge/   # size 桥接插件
├── i18n/                      # 保持独立
├── color/                     # 保持独立
├── size/                      # 保持独立
└── shared-state/              # 🗑️ 删除
```

#### 6.3 实现示例

##### 6.3.1 I18n 桥接插件
```typescript
// packages/engine/packages/plugins/i18n-bridge/src/index.ts
import type { Plugin } from '@ldesign/engine-core'
import type { OptimizedI18n } from '@ldesign/i18n-core'

export interface I18nBridgeOptions {
  i18n: OptimizedI18n
}

export function createI18nBridgePlugin(options: I18nBridgeOptions): Plugin<I18nBridgeOptions> {
  return {
    name: 'i18n-bridge',
    version: '1.0.0',

    install(ctx, opts) {
      const { i18n } = opts

      // 监听 i18n 事件，同步到 engine.state
      const unsubLocale = i18n.on('localeChanged', ({ locale, oldLocale }) => {
        ctx.engine.state.set('i18n.locale', { locale, oldLocale, timestamp: Date.now() })
        ctx.engine.events.emit('i18n:localeChanged', { locale, oldLocale })
      })

      const unsubLoaded = i18n.on('loaded', ({ locale }) => {
        ctx.engine.state.set('i18n.messages', {
          locale,
          messages: i18n.getMessages(locale) || {},
          timestamp: Date.now()
        })
        ctx.engine.events.emit('i18n:messagesLoaded', { locale })
      })

      // 注册 i18n 实例到 engine API
      ctx.engine.api.register('i18n', i18n)

      // 发布初始状态
      ctx.engine.state.set('i18n.locale', {
        locale: i18n.locale,
        oldLocale: null,
        timestamp: Date.now()
      })
    },

    uninstall(ctx) {
      // 清理状态
      ctx.engine.state.delete('i18n.locale')
      ctx.engine.state.delete('i18n.messages')
      ctx.engine.api.unregister('i18n')
    }
  }
}
```

##### 6.3.2 Vue Composables (替代 useGlobalState)
```typescript
// packages/engine/packages/vue3/src/composables/useEngineState.ts
import { ref, shallowRef, onUnmounted, computed } from 'vue'
import { useEngine } from './useEngine'
import type { Ref, ComputedRef } from 'vue'

/**
 * 使用 Engine 状态
 *
 * 替代 useGlobalState，直接使用 engine.state
 */
export function useEngineState<T = any>(
  key: string,
  shallow = true
): Ref<T | undefined> {
  const engine = useEngine()

  const state = shallow
    ? shallowRef<T | undefined>(engine.state.get(key))
    : ref<T | undefined>(engine.state.get(key))

  // 监听状态变化
  const unwatch = engine.state.watch(key, (newValue) => {
    state.value = newValue
  })

  // 组件卸载时取消监听
  onUnmounted(() => {
    unwatch()
  })

  return state
}

/**
 * 使用 Engine 状态（带发布功能）
 */
export function useEngineStateWithPublish<T = any>(
  key: string,
  shallow = true
): [Ref<T | undefined>, (value: T) => void] {
  const engine = useEngine()
  const state = useEngineState<T>(key, shallow)

  const publish = (value: T) => {
    engine.state.set(key, value)
  }

  return [state, publish]
}

/**
 * 使用 Engine 事件
 */
export function useEngineEvent<T = any>(
  event: string,
  handler: (payload: T) => void
): void {
  const engine = useEngine()

  const unsubscribe = engine.events.on(event, handler)

  onUnmounted(() => {
    unsubscribe()
  })
}
```

##### 6.3.3 组件使用示例
```vue
<!-- 之前: 使用 shared-state -->
<script setup lang="ts">
import { useGlobalState, STATE_KEYS } from '@ldesign/shared-state-vue'

const locale = useGlobalState(STATE_KEYS.I18N_LOCALE)
const theme = useGlobalState(STATE_KEYS.COLOR_THEME)
const sizePreset = useGlobalState(STATE_KEYS.SIZE_PRESET)
</script>

<!-- 之后: 使用 engine state -->
<script setup lang="ts">
import { useEngineState } from '@ldesign/engine-vue3'

const locale = useEngineState('i18n.locale')
const theme = useEngineState('color.theme')
const sizePreset = useEngineState('size.preset')
</script>

<template>
  <div>
    <div>当前语言: {{ locale?.locale }}</div>
    <div>当前主题: {{ theme?.primaryColor }}</div>
    <div>当前尺寸: {{ sizePreset?.preset }}</div>
  </div>
</template>
```

#### 6.4 迁移步骤

##### 步骤 1: 创建桥接插件包
```bash
# 创建新的插件包
mkdir -p packages/engine/packages/plugins/i18n-bridge
mkdir -p packages/engine/packages/plugins/color-bridge
mkdir -p packages/engine/packages/plugins/size-bridge
```

##### 步骤 2: 实现桥接插件
- 将 `I18nAdapter` 逻辑迁移到 `createI18nBridgePlugin`
- 将 `ColorAdapter` 逻辑迁移到 `createColorBridgePlugin`
- 将 `SizeAdapter` 逻辑迁移到 `createSizeBridgePlugin`

##### 步骤 3: 添加 Vue Composables
- 在 `@ldesign/engine-vue3` 中添加 `useEngineState`
- 在 `@ldesign/engine-vue3` 中添加 `useEngineEvent`

##### 步骤 4: 更新应用代码
```typescript
// apps/app-vue/src/main.ts

// ❌ 删除 shared-state 相关代码
// const { GlobalStateBus, I18nAdapter } = await import('@ldesign/shared-state-core')

// ✅ 使用桥接插件
import { createI18nBridgePlugin } from '@ldesign/engine-plugins/i18n-bridge'
import { createColorBridgePlugin } from '@ldesign/engine-plugins/color-bridge'
import { createSizeBridgePlugin } from '@ldesign/engine-plugins/size-bridge'

const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ locale: 'zh-CN' }),
    createColorEnginePlugin({ theme: 'light' }),
    createSizeEnginePlugin({ baseSize: 'brand-default' }),

    // 添加桥接插件（在对应插件之后）
    createI18nBridgePlugin({ /* 自动从 engine.api.get('i18n') 获取 */ }),
    createColorBridgePlugin({ /* 自动从 engine.api.get('color') 获取 */ }),
    createSizeBridgePlugin({ /* 自动从 engine.api.get('size') 获取 */ }),
  ]
})
```

##### 步骤 5: 更新组件
```vue
<!-- apps/app-vue/src/components/SharedStateDemo.vue -->
<script setup lang="ts">
// ❌ 删除
// import { useGlobalState, STATE_KEYS } from '@ldesign/shared-state-vue'

// ✅ 替换为
import { useEngineState } from '@ldesign/engine-vue3'

const locale = useEngineState('i18n.locale')
const theme = useEngineState('color.theme')
const sizePreset = useEngineState('size.preset')
</script>
```

##### 步骤 6: 删除 shared-state 包
```bash
# 删除包
rm -rf packages/shared-state

# 更新依赖
pnpm install
```

#### 6.5 优势总结

✅ **消除重复**: 不再有两套状态管理系统
✅ **保持独立性**: i18n、color、size 包完全独立
✅ **统一架构**: 所有状态通过 engine 管理
✅ **更好的类型安全**: 利用 engine 的类型系统
✅ **减少包数量**: 删除 shared-state-core 和 shared-state-vue
✅ **更好的性能**: 利用 engine.state 的深度比较
✅ **更强大的事件系统**: 支持通配符、优先级等

## 7. 替代方案：保留 Shared-State 但简化

如果不想进行大规模重构，可以考虑简化方案：

### 7.1 方案 D: Shared-State 基于 Engine 实现

```typescript
// packages/shared-state/packages/core/src/GlobalStateBus.ts
import type { CoreEngine } from '@ldesign/engine-core'

export class GlobalStateBus {
  private static instance: GlobalStateBus
  private engine: CoreEngine | null = null

  // 连接到 engine
  connectEngine(engine: CoreEngine): void {
    this.engine = engine
  }

  publish<K extends StateKey>(key: K, value: GlobalStateMap[K]): void {
    if (this.engine) {
      // 使用 engine.state 而不是自己的 StateStore
      this.engine.state.set(key, value)
      this.engine.events.emit(key, value)
    } else {
      // 降级到独立模式
      this.stateStore.set(key, value)
      this.eventEmitter.emit(key, value)
    }
  }

  subscribe<K extends StateKey>(key: K, callback: StateCallback<GlobalStateMap[K]>): Unsubscribe {
    if (this.engine) {
      // 使用 engine.state.watch
      return this.engine.state.watch(key, callback)
    } else {
      // 降级到独立模式
      return this.eventEmitter.on(key, callback)
    }
  }
}
```

**优点**:
- ✅ 最小化迁移成本
- ✅ 向后兼容
- ✅ 复用 engine 的状态管理

**缺点**:
- ❌ 仍然维护两个包
- ❌ 增加复杂度

## 8. 最终建议

### 🎯 推荐采用方案 C: 使用 Engine 插件替代 Shared-State

**理由**:
1. ✅ **架构统一**: 所有状态通过 engine 管理，避免重复
2. ✅ **保持独立性**: 各功能包（i18n、color、size）保持完全独立
3. ✅ **减少维护成本**: 删除 shared-state 包，减少代码量
4. ✅ **更好的扩展性**: 利用 engine 的插件系统
5. ✅ **性能优化**: 利用 engine.state 的深度比较和批量更新

**迁移成本评估**:
- 📦 新增 3 个桥接插件包（约 300 行代码）
- 🔧 修改 2 个 Vue composables（约 100 行代码）
- 📝 更新应用代码（约 50 行代码）
- 🗑️ 删除 shared-state 包（约 1000 行代码）

**净收益**: 减少约 550 行代码，消除功能重复，架构更清晰！

### 不推荐方案 A 的原因
❌ 破坏包的独立性，i18n、color、size 必须依赖 engine

### 不推荐方案 D 的原因
❌ 仍然需要维护 shared-state 包，增加复杂度

## 9. 下一步行动

如果决定采用方案 C，建议按以下顺序执行：

1. ✅ **创建桥接插件**: 先实现 i18n-bridge 插件并测试
2. ✅ **添加 Vue Composables**: 实现 useEngineState 并测试
3. ✅ **迁移一个组件**: 先迁移 SharedStateDemo.vue 验证可行性
4. ✅ **迁移所有组件**: 批量替换 useGlobalState 为 useEngineState
5. ✅ **删除 shared-state**: 确认无依赖后删除包
6. ✅ **更新文档**: 更新架构文档和使用指南

**预计时间**: 2-3 天（包括测试和文档更新）


