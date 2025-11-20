# 架构清理总结

## 清理日期
2025-11-20

## 清理内容

### 1. 删除桥接插件包 ✅

删除了以下独立的桥接插件包：
- `packages/engine/packages/plugins/i18n-bridge`
- `packages/engine/packages/plugins/color-bridge`
- `packages/engine/packages/plugins/size-bridge`

**原因**：这些插件依赖 `@ldesign/engine-core`，导致功能包与 engine 高度耦合，违背包独立性原则。

**替代方案**：在应用层（`apps/app-vue/src/utils/state-bridge.ts`）实现桥接逻辑。

### 2. 删除 shared-state 包 ✅

删除了整个 `packages/shared-state` 目录，包括：
- `packages/shared-state/packages/core` - 核心包
- `packages/shared-state/packages/vue` - Vue 集成包

**原因**：
1. 当前项目没有使用 `@ldesign/shared-state`
2. 已有更简单的应用层桥接方案（`state-bridge.ts`）
3. 功能重复，增加维护成本
4. 保持架构简洁

**影响分析**：
- ✅ `apps/app-vue` 不依赖 `shared-state`
- ✅ 功能包（i18n、color、size）不依赖 `shared-state`
- ✅ 删除后不影响任何现有功能

### 3. 更新 package.json ✅

修改了 `apps/app-vue/package.json`，移除了对已删除桥接插件的依赖：

```diff
  "dependencies": {
    "@ldesign/color-vue": "workspace:*",
-   "@ldesign/engine-plugin-color-bridge": "workspace:*",
-   "@ldesign/engine-plugin-i18n-bridge": "workspace:*",
-   "@ldesign/engine-plugin-size-bridge": "workspace:*",
    "@ldesign/engine-vue3": "workspace:*",
    "@ldesign/i18n-vue": "workspace:*",
    "@ldesign/router-vue": "workspace:*",
    "@ldesign/size-vue": "workspace:*",
    "vue": "^3.4.0"
  }
```

## 架构优势

### 清理前的问题

```
功能包 (i18n, color, size)
  ↓ (间接依赖)
桥接插件 (i18n-bridge, color-bridge, size-bridge)
  ↓ (依赖)
@ldesign/engine-core

问题：功能包无法独立使用
```

### 清理后的架构

```
应用层 (apps/app-vue)
  ├── 依赖 engine
  ├── 依赖功能包 (i18n, color, size)
  └── 负责桥接逻辑 (state-bridge.ts)

功能包层 (i18n, color, size)
  ├── 完全独立 ✅
  ├── 提供事件系统
  └── 不依赖 engine ✅

Engine 层
  ├── 提供插件系统
  ├── 提供状态管理
  └── 不依赖具体功能包 ✅
```

## 清理效果

### 1. 包独立性 ✅
- i18n、color、size 等功能包完全独立
- 可以在任何项目中独立使用
- 不依赖 engine 或其他包

### 2. 架构简洁 ✅
- 删除了冗余的桥接插件包
- 删除了未使用的 shared-state 包
- 桥接逻辑集中在应用层

### 3. 维护成本降低 ✅
- 减少了需要维护的包数量
- 桥接逻辑更直观、更易理解
- 减少了依赖关系的复杂度

### 4. 性能优化 ✅
- 减少了包的加载和解析时间
- 减少了依赖树的深度
- 应用启动更快

## 迁移指南

如果你的项目之前使用了桥接插件或 shared-state，请参考以下步骤迁移：

### 1. 移除桥接插件依赖

```diff
// package.json
{
  "dependencies": {
-   "@ldesign/engine-plugin-i18n-bridge": "workspace:*",
-   "@ldesign/engine-plugin-color-bridge": "workspace:*",
-   "@ldesign/engine-plugin-size-bridge": "workspace:*"
  }
}
```

### 2. 移除桥接插件使用

```diff
// main.ts
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

### 3. 使用应用层桥接

```diff
// main.ts
+ import { connectAllToEngine } from './utils/state-bridge'

await engine.mount('#app')

+ // 在应用层连接功能包状态到 engine.state
+ const cleanupBridges = connectAllToEngine(engine)
```

### 4. 移除 shared-state 依赖（如果有）

```diff
// package.json
{
  "dependencies": {
-   "@ldesign/shared-state-core": "workspace:*",
-   "@ldesign/shared-state-vue": "workspace:*"
  }
}
```

## 相关文档

- [桥接重构总结](./bridge-refactoring-summary.md)
- [桥接重构检查清单](./bridge-refactoring-checklist.md)
- [状态桥接工具源码](../../apps/app-vue/src/utils/state-bridge.ts)

## 总结

这次清理彻底解决了以下问题：
1. ✅ 功能包与 engine 的耦合问题
2. ✅ 冗余包的维护成本问题
3. ✅ 架构复杂度问题
4. ✅ 包独立性问题

现在的架构更加简洁、清晰、易维护，符合最佳实践！

