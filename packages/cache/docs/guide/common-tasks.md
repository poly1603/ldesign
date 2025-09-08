# 常见任务（How-To）

本页收录高频场景的操作步骤与示例，帮助你快速完成具体任务。

## 1. 迁移命名空间数据（v1 -> v2）
步骤：
1) 导出旧空间快照；
2) 转换（重命名/过滤/结构升级）；
3) 导入新空间；
4) 验证后清理旧空间。

代码要点：
- 使用 ns.export(true) 获取含子命名空间的树；
- transform/过滤仅保留需要迁移的键；
- 分批导入以避免长任务阻塞。

参考：/examples/namespace-migration · /api/namespace

## 2. 冷启动进行缓存预热
步骤：
1) 准备预热快照（本地导出或后端提供 URL）；
2) 构建 WarmupManager；
3) importSnapshot 或 prewarmFromUrl；
4) 大体量时设置 chunkSize 与 concurrency。

示例要点：
- transform：在导入前统一调整键/值（如前缀升级、字段改名）；
- filter：按白/黑名单筛选；
- 建议：chunkSize=200~1000，concurrency=4~8（依据业务与设备性能微调）。

参考：/api/warmup · /api/batch

## 3. 启用跨标签页同步
步骤：
1) 构建 SyncManager（建议 mode=auto）；
2) 设置 keyFilter 仅广播必要命名空间（如 'app:'）；
3) 视写入频率设置 debounce/throttle，避免广播风暴；
4) 订阅 change/error 事件以监控运行状态。

推荐值：
- debounce：50~100ms；
- throttle：50~200ms；
- 仅在确实需要跨页一致性时启用同步。

参考：/api/sync · /guide/namespaces

## 4. 使用批量 API 读写数据
要点：
- mset/mget/mremove/mhas 可显著减少序列化与往返成本；
- 与命名空间联用时，键为“相对键”（无需手动加前缀）。

参考：/api/batch · /api/namespace

## 5. 分层缓存（L1/L2/L3）
建议：
- L1 用内存（高频、短 TTL），L2 用 localStorage，L3 用 IndexedDB；
- 缓存未命中时逐层回退，并在命中后上移提升；
- 按命名空间配置不同策略与容量。

参考：/guide/best-practices · /guide/performance

## 6. 清理与回收
要点：
- clear(true) 递归删除子命名空间，谨慎使用；
- 结合淘汰策略（LRU/LFU/FIFO/ARC）与 TTL 控制占用；
- 定期清理过期项，结合性能监控评估效果。

参考：/api/cache-manager · /api/performance-monitor

## 7. 冲突避免与幂等
建议：
- 高频写入场景引入锁/版本号，避免“后写覆盖先写”；
- 跨页写入通过 SyncManager 广播，必要时设计“最后写入获胜”或版本比较策略；
- 失败重试结合指数回退与熔断，避免级联故障。

参考：/api/error-handling（重试/熔断/降级）

## 8. 监控与调试
建议：
- 启用性能监控，记录命中率、时延、淘汰数、内存占用等；
- 为关键路径设置阈值告警；
- 使用“示例/演示”脚本复现与定位问题。

参考：/api/performance-monitor · /examples

