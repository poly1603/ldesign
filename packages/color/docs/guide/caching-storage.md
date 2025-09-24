# 缓存与存储

## 存储方式

- localStorage / sessionStorage / memory / cookie（见 core/storage）

```ts
import { createThemeManagerWithPresets } from '@ldesign/color'

const manager = await createThemeManagerWithPresets({
  storage: 'localStorage',
  storageKey: 'my-app-theme',
})
```

## 缓存（LRU）

```ts
import { createLRUCache } from '@ldesign/color'

const cache = createLRUCache({ maxSize: 100, defaultTTL: 60_000 })
cache.set('key', { foo: 1 })
```
