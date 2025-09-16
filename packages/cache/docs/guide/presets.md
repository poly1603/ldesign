# 预设与快速使用

本节介绍内置的缓存预设（presets）以及快速创建缓存实例的方式，帮助你在不同场景下零配置上手。

## 快速 API

```ts
import { createCache, cache } from '@ldesign/cache'

// 1) 手动创建实例
const cm = createCache({ keyPrefix: 'app' })
await cm.set('k', 'v')

// 2) 使用简洁门面（惰性单例）
await cache.set('k', 'v')
const v = await cache.get('k')
```

## 预设 Presets

```ts
import { createBrowserCache, createSSRCache, createNodeCache, createOfflineCache } from '@ldesign/cache'

// 浏览器优先：本地策略启用，偏好 localStorage / sessionStorage / IndexedDB
const browser = createBrowserCache()

// SSR：禁用策略，强制使用内存，避免触发浏览器 API
const ssr = createSSRCache()

// Node：偏内存引擎，定期清理
const node = createNodeCache()

// 离线优先：偏好 IndexedDB / localStorage，适合 PWA
const offline = createOfflineCache()
```

### 可选覆盖

所有预设均支持传入额外配置进行覆盖：

```ts
const ssr = createSSRCache({ keyPrefix: 'ssr', cleanupInterval: 0 })
```

### getPresetOptions

如需获取预设的默认配置用于组合：

```ts
import { getPresetOptions } from '@ldesign/cache'

const base = getPresetOptions('browser')
const cache = createCache({ ...base, keyPrefix: 'my-app' })
```

> 预设仅提供“合理默认值”，可根据业务情况自由覆盖或扩展。

