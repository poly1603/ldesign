# FAQ

## 需要什么 Node 版本？

需要 Node.js 18 及以上版本（构建与若干运行时特性要求）。

## 为什么默认是增强模式？

增强模式提供交互式体验、可视化与智能推荐，更适合日常开发；如需极简行为，可切换到经典模式：

- `ldesign-git classic ...`
- `ldesign-git --classic ...`
- `LGIT_MODE=classic ldesign-git ...`

## 智能命令推荐是否上传数据？

不会。所有历史与偏好数据均本地存储（conf），可随时清除或关闭推荐功能。

## Windows 终端字符显示错位？

使用等宽字体与支持 ANSI 的终端（如 Windows Terminal）。若问题仍存，切换到经典模式或关闭动画。

## SmartSync 会自动推送吗？

默认会在提交后执行 `push`；如遇冲突且自动解决失败，会提示手动处理或回滚。

## 如何快速回滚智能同步？

执行 `ldesign-git rollback [stashId]`；若未提供 `stashId`，会根据最近一次智能同步记录进行回滚。

## 如何清理推荐/配置数据？

通过增强 CLI 的 `config` 命令清理；或者删除本地配置目录下的存储文件（由 conf 管理，随平台而异）。

## 支持哪些可视化图表？

贡献者排行、代码热力图、提交活动热力图（月/周/小时）、项目时间线、分支关系图、语言分布与热点矩阵等。

## 如何在 CI 环境使用？

建议：
- 关闭确认：`--no-confirm`
- 关闭进度：`showProgress: false`
- 如需自动解决冲突：`autoResolveConflicts: true` 与 `conflictStrategy: 'theirs'`

