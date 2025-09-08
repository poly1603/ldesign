# 最佳实践清单

## 配置
- 将 `retry/cache/debounce/deduplication` 保持在合理默认，按环境（dev/prod）调整
- 在 CI 的 prepublish 或构建前加入 `generate:registry`

## 插件
- 系统 API + 认证中间件：统一 Authorization 与刷新；移除方法级重复头
- REST 插件：规范命名；对 create/update/remove 提供缓存失效策略
- 自定义插件：统一 transform/validate 与错误上报

## 组合式
- 查询类：useApiCall/usePaginatedApi/useInfiniteApi
- 变更类：useMutation（乐观 + 回滚 + 可选并发保护）
- 清理：useApiCleanup

## 中间件建议
- request：注入标头、埋点 ID、幂等键
- response：统一解包（如 { code,data } => data）
- error：可恢复错误（降级数据），否则上报并重试

## 命名与结构
- 统一 `${namespace}.${action}`，如 `user.list`、`user.get`
- 将资源相关 API 汇集到 REST 插件或一个自定义插件文件

## 性能与稳定
- 开启请求去重与防抖（查询类接口）
- 合理设置缓存 TTL；大列表缓存谨慎
- 使用指数退避避免风暴

## 文档与示例
- 为每个模块给出最小可运行示例
- 常见错误与 FAQ 放在 docs/guide/faq.md

