# 常见问题（FAQ）

## 1. createCache 会自动选择什么预设？
- 浏览器（含 jsdom 测试环境）默认选择 browser 预设
- 纯 Node 环境默认选择 node 预设
- 其他环境（如 SSR 渲染器）默认选择 ssr 预设
- 你也可以显式指定：`createCache({ preset: 'node' })`

## 2. 如何强制使用某个存储引擎？
在 `set/get` 的第三个参数中指定 `engine`，或在创建时设置 `defaultEngine`。

```ts
const cache = createCache({ preset: 'browser', defaultEngine: 'localStorage' })
await cache.set('k', 'v', { engine: 'indexedDB' })
```

## 3. 覆盖率 100% 如何保证？
- 本地与 CI 均通过 Vitest 配置强制 100% 覆盖率阈值
- 建议：为边界条件（循环引用/异常路径/超时/重试等）添加用例

## 4. Windows 终端里偶发看到“终止批处理操作吗(Y/N)?”？
- 该提示来自 Windows 批处理系统，不代表用例失败
- CI/Linux Runner 不会出现该提示
- 如果需要，我可以提供 Node 启动器脚本避免该提示影响退出码

## 5. 如何为 Vue 使用缓存？
- 使用 `@ldesign/cache/vue` 中的组合式函数或 `<CacheProvider />`
- 文档：/guide/vue-integration 与 /api/vue-composables

## 6. 如何选择合适的 TTL？
- 参考 /guide/best-practices 中的 TTL 建议区间
- 短期数据：30 秒 ~ 5 分钟；长期数据：1 天 ~ 7 天

## 7. 是否支持批量操作？
- 支持：mset/mget/mremove/mhas 以及 setBatch/getBatch

## 8. 是否支持数据压缩和加密？
- 压缩：gzip、brotli、lz 等算法（自动回退）
- 加密：内置 AES，可自定义实现

## 9. 如何迁移已有项目？
- 见 /guide/migration，提供从本地散落存储迁移到 @ldesign/cache 的策略

