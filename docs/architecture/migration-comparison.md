# 迁移对比：Shared-State vs Engine

本文档展示从 `shared-state` 迁移到 `engine` 的具体代码对比。

## 1. 应用入口文件对比

### 之前: 使用 Shared-State

```typescript
// apps/app-vue/src/main.ts
import { createVueEngine } from '@ldesign/engine-vue3'
import { createI18nEnginePlugin } from '@ldesign/i18n-vue/plugins'
import { createColorEnginePlugin } from '@ldesign/color-vue/plugins'
import { createSizeEnginePlugin } from '@ldesign/size-vue/plugins'

const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ locale: 'zh-CN' }),
    createColorEnginePlugin({ theme: 'light' }),
    createSizeEnginePlugin({ baseSize: 'brand-default' })
  ]
})

await engine.mount('#app')

// ❌ 手动连接 shared-state 适配器
try {
  const { GlobalStateBus, I18nAdapter, ColorAdapter, SizeAdapter } = 
    await import('@ldesign/shared-state-core')
  
  const stateBus = GlobalStateBus.getInstance()
  
  // 连接 i18n
  const i18nService = engine.api.get('i18n')
  if (i18nService) {
    const i18nAdapter = new I18nAdapter(stateBus)
    i18nAdapter.connect(i18nService)
    console.log('✅ i18n adapter connected')
  }
  
  // 连接 color
  const colorService = engine.api.get('color')
  if (colorService?.themeManager) {
    const colorAdapter = new ColorAdapter(stateBus)
    colorAdapter.connect(colorService.themeManager)
    console.log('✅ color adapter connected')
  }
  
  // 连接 size
  const sizeService = engine.api.get('size')
  if (sizeService?.manager) {
    const sizeAdapter = new SizeAdapter(stateBus)
    sizeAdapter.connect(sizeService.manager)
    console.log('✅ size adapter connected')
  }
} catch (e) {
  console.warn('⚠️ shared-state connection failed:', e)
}
```

### 之后: 使用 Engine 桥接插件

```typescript
// apps/app-vue/src/main.ts
import { createVueEngine } from '@ldesign/engine-vue3'
import { createI18nEnginePlugin } from '@ldesign/i18n-vue/plugins'
import { createColorEnginePlugin } from '@ldesign/color-vue/plugins'
import { createSizeEnginePlugin } from '@ldesign/size-vue/plugins'
// ✅ 导入桥接插件
import { createI18nBridgePlugin } from '@ldesign/engine-plugins/i18n-bridge'
import { createColorBridgePlugin } from '@ldesign/engine-plugins/color-bridge'
import { createSizeBridgePlugin } from '@ldesign/engine-plugins/size-bridge'

const engine = createVueEngine({
  plugins: [
    createI18nEnginePlugin({ locale: 'zh-CN' }),
    createColorEnginePlugin({ theme: 'light' }),
    createSizeEnginePlugin({ baseSize: 'brand-default' }),
    
    // ✅ 添加桥接插件（自动连接）
    createI18nBridgePlugin(),
    createColorBridgePlugin(),
    createSizeBridgePlugin(),
  ]
})

await engine.mount('#app')

// ✅ 不再需要手动连接适配器！
```

**改进**:
- ✅ 删除 40+ 行手动连接代码
- ✅ 使用插件系统，自动管理生命周期
- ✅ 更清晰的依赖关系

## 2. Vue 组件对比

### 之前: 使用 useGlobalState

```vue
<!-- apps/app-vue/src/components/SharedStateDemo.vue -->
<script setup lang="ts">
import { useGlobalState, STATE_KEYS } from '@ldesign/shared-state-vue'

// 监听所有状态变化
const locale = useGlobalState(STATE_KEYS.I18N_LOCALE)
const theme = useGlobalState(STATE_KEYS.COLOR_THEME)
const colorPrimary = useGlobalState(STATE_KEYS.COLOR_PRIMARY)
const sizePreset = useGlobalState(STATE_KEYS.SIZE_PRESET)
const sizeBase = useGlobalState(STATE_KEYS.SIZE_BASE)
</script>

<template>
  <div class="shared-state-demo">
    <h2>🔗 跨包数据共享演示</h2>
    
    <div class="state-item">
      <h3>🌐 国际化状态</h3>
      <p>当前语言: {{ locale?.locale }}</p>
      <p>上次语言: {{ locale?.oldLocale }}</p>
    </div>
    
    <div class="state-item">
      <h3>🎨 主题状态</h3>
      <p>当前主题: {{ theme?.mode }}</p>
      <p>主色调: {{ colorPrimary?.value }}</p>
    </div>
    
    <div class="state-item">
      <h3>📏 尺寸状态</h3>
      <p>当前预设: {{ sizePreset?.preset }}</p>
      <p>基础尺寸: {{ sizeBase?.value }}{{ sizeBase?.unit }}</p>
    </div>
  </div>
</template>
```

### 之后: 使用 useEngineState

```vue
<!-- apps/app-vue/src/components/SharedStateDemo.vue -->
<script setup lang="ts">
import { useEngineState } from '@ldesign/engine-vue3'
import type { I18nLocaleState } from '@ldesign/engine-plugins/i18n-bridge'
import type { ColorThemeState, ColorPrimaryState } from '@ldesign/engine-plugins/color-bridge'
import type { SizePresetState, SizeBaseState } from '@ldesign/engine-plugins/size-bridge'

// 监听所有状态变化（带类型安全）
const locale = useEngineState<I18nLocaleState>('i18n.locale')
const theme = useEngineState<ColorThemeState>('color.theme')
const colorPrimary = useEngineState<ColorPrimaryState>('color.primary')
const sizePreset = useEngineState<SizePresetState>('size.preset')
const sizeBase = useEngineState<SizeBaseState>('size.base')
</script>

<template>
  <div class="shared-state-demo">
    <h2>🔗 跨包数据共享演示</h2>
    
    <div class="state-item">
      <h3>🌐 国际化状态</h3>
      <p>当前语言: {{ locale?.locale }}</p>
      <p>上次语言: {{ locale?.oldLocale }}</p>
    </div>
    
    <div class="state-item">
      <h3>🎨 主题状态</h3>
      <p>当前主题: {{ theme?.mode }}</p>
      <p>主色调: {{ colorPrimary?.value }}</p>
    </div>
    
    <div class="state-item">
      <h3>📏 尺寸状态</h3>
      <p>当前预设: {{ sizePreset?.preset }}</p>
      <p>基础尺寸: {{ sizeBase?.value }}{{ sizeBase?.unit }}</p>
    </div>
  </div>
</template>
```

**改进**:
- ✅ 更好的类型安全（TypeScript 类型推断）
- ✅ 更清晰的状态键命名（`i18n.locale` vs `STATE_KEYS.I18N_LOCALE`）
- ✅ 统一的 API（都使用 engine）

## 3. 事件监听对比

### 之前: 使用 Shared-State

```typescript
// 方式 1: 使用 GlobalStateBus
import { GlobalStateBus, STATE_KEYS } from '@ldesign/shared-state-core'

const stateBus = GlobalStateBus.getInstance()

stateBus.subscribe(STATE_KEYS.I18N_LOCALE, (data) => {
  console.log('语言变化:', data.locale)
})

// 方式 2: 使用 engine.events（重复监听）
engine.events.on('i18n:localeChanged', (payload) => {
  console.log('语言变化:', payload.locale)
})
```

### 之后: 使用 Engine Events

```typescript
// 统一使用 engine.events
engine.events.on('i18n:localeChanged', (payload) => {
  console.log('语言变化:', payload.locale)
})

// 或在 Vue 组件中
import { useEngineEvent } from '@ldesign/engine-vue3'

useEngineEvent('i18n:localeChanged', (payload) => {
  console.log('语言变化:', payload.locale)
})
```

**改进**:
- ✅ 消除重复监听
- ✅ 统一的事件系统
- ✅ 支持通配符（`i18n:*`）

## 4. 包依赖对比

### 之前: 依赖 Shared-State

```json
{
  "dependencies": {
    "@ldesign/engine-vue3": "workspace:*",
    "@ldesign/i18n-vue": "workspace:*",
    "@ldesign/color-vue": "workspace:*",
    "@ldesign/size-vue": "workspace:*",
    "@ldesign/shared-state-core": "workspace:*",
    "@ldesign/shared-state-vue": "workspace:*"
  }
}
```

### 之后: 只依赖 Engine

```json
{
  "dependencies": {
    "@ldesign/engine-vue3": "workspace:*",
    "@ldesign/i18n-vue": "workspace:*",
    "@ldesign/color-vue": "workspace:*",
    "@ldesign/size-vue": "workspace:*",
    "@ldesign/engine-plugins": "workspace:*"
  }
}
```

**改进**:
- ✅ 减少 2 个依赖包
- ✅ 更清晰的依赖关系

## 5. 代码量对比

| 项目 | 之前 (Shared-State) | 之后 (Engine) | 减少 |
|------|---------------------|---------------|------|
| **应用入口** | ~80 行 | ~40 行 | -50% |
| **组件代码** | ~30 行 | ~30 行 | 0% |
| **包数量** | 2 个 (core + vue) | 1 个 (plugins) | -50% |
| **总代码量** | ~1000 行 | ~450 行 | -55% |

## 6. 性能对比

| 指标 | Shared-State | Engine | 改进 |
|------|--------------|--------|------|
| **状态读取** | O(1) LRU Cache | O(1) Map | 相同 |
| **状态写入** | O(1) | O(1) + deepEqual | 更优（避免重复更新） |
| **事件触发** | 2 次（adapter + engine） | 1 次 | 减少 50% |
| **内存占用** | LRU 自动淘汰 | Map 无限制 | Shared-State 更优 |

**建议**: 在 Engine StateManager 中添加可选的 LRU 缓存支持

## 7. 迁移清单

- [ ] 创建桥接插件包 (`@ldesign/engine-plugins`)
- [ ] 实现 `createI18nBridgePlugin`
- [ ] 实现 `createColorBridgePlugin`
- [ ] 实现 `createSizeBridgePlugin`
- [ ] 在 `@ldesign/engine-vue3` 中添加 `useEngineState`
- [ ] 在 `@ldesign/engine-vue3` 中添加 `useEngineEvent`
- [ ] 更新 `apps/app-vue/src/main.ts`
- [ ] 更新 `apps/app-vue/src/components/SharedStateDemo.vue`
- [ ] 删除 `packages/shared-state`
- [ ] 更新文档

**预计时间**: 2-3 天

