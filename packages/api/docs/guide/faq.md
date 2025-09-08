# 常见问题（FAQ）

## 为什么请求没有被缓存？
- 确认全局 `cache.enabled` 为 true
- 方法级/调用级未禁用缓存
- TTL 未过期；REST 插件中 `create/update/remove` 会清理相关 `list/get` 缓存

## 为什么中间件没有生效？
- 生效优先级：调用级 > 方法级 > 全局
- response 中间件在 transform 前执行
- error 中间件若返回 ResponseData 视为恢复成功（不会继续重试）

## 重试什么时候触发？
- `retry.enabled = true` 且 `attempt < retries` 且 `retryOn(error, attempt)` 返回 true
- 支持 fixed/exponential，`maxDelay` 限制指数退避

## 401 未授权如何处理？
- 安装 `authMiddlewaresPlugin`：自动注入 Authorization 与刷新 token
- 与系统 API 协同：检测到认证插件后会移除方法级 Authorization 头，避免重复

## REST 的路径占位符如何使用？
- `basePath` 支持 `:id` 和 `{id}`。
- 复杂路径可用 `pathParams` 返回一个 `{ key: value }` 映射（多占位符替换）。
- 若占位符未提供则回退到 `idParam`（默认 `id`）。

## Vue 组合式常见问题
- useApiCall({ immediate: true }) 内部使用 `execute().catch(() => {})` 避免未处理 Promise 噪音
- useInfiniteApi(auto=true) 需要传入 `target: Ref<Element|null>` 作为触发器
- useMutation 设置 `lockWhilePending: true` 可避免并发提交

## Typed Registry 生成
- 使用 `pnpm run generate:registry`，CI 发布前自动生成
- 结合 `withTypedApi` 获取按方法名的返回类型推断

