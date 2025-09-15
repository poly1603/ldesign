# 核心 API 参考

```ts
import {
  createApiEngine,
  systemApiPlugin,
  createRestApiPlugin,
  withTypedApi,
  type ApiEngine,
  type ApiEngineConfig,
  type ApiCallOptions,
} from '@ldesign/api'
```

- createApiEngine(config?) => ApiEngine
- engine.use(plugin)
- engine.register(name, config)
- engine.call(name, params?, options?)
- engine.callBatch(calls)
- engine.clearCache(name?)
- engine.getCacheStats()
- engine.destroy()

