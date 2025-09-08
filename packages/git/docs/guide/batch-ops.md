# 批量操作

提供常见 Git 批量任务的交互式/自动化执行，显著减少重复劳动。

- 支持能力：
- 批量 cherry-pick / revert / merge / rebase
- 批量创建/删除分支、标签
- 批量 stash、清理合并分支

- 交互式入口：
- lgit interactive → 批量操作

- 编程式示例：
- import { BatchOperations } from '@ldesign/git/core/BatchOperations'
- const ops = new BatchOperations(Git.create())
- // 按模式生成多个提交消息/标签：
- // 例如 feat/part-{n}、v1.2.{n}

- 注意事项：
- 批量操作对历史影响较大，请先在临时分支测试；必要时使用 --no-verify 跳过 Hook。
