# 故障排查

本页汇总常见问题与解决方案，涵盖 Windows、终端兼容、Git 环境与依赖问题。

## 环境与兼容

- Node 版本
  - 需要 Node.js 18+（tsup 目标与若干 API 对应），建议使用 LTS。
  - 检查：`node -v`

- Git 可用性
  - 检查：`git --version`
  - 确保在 PATH 中可用。

- Windows 终端显示异常
  - 若出现字符错位或色彩异常，建议：
    - 使用等宽字体（如 Cascadia Code）。
    - 启用 ANSI 支持或使用 Windows Terminal/PowerShell 7+。

- 交互/可视化依赖
  - 终端 UI 依赖 blessed / blessed-contrib，如发生渲染问题：
    - 尝试更换终端或关闭“增强模式”（使用经典模式）。

## 模式相关

- 切换到经典模式
  - 子命令：`ldesign-git classic ...`
  - 参数：`ldesign-git --classic ...`
  - 环境变量：`LGIT_MODE=classic ldesign-git ...`

- 经典模式下无交互/可视化
  - 这是预期行为，经典模式为轻量化设计；如需交互式体验，请使用增强模式（默认）。

## 智能同步（SmartSync）

- 同步卡住 / 网络慢
  - 检查 Git 远程可达性与代理设置；必要时临时使用 `git pull` 验证网络。

- 自动冲突解决不符合预期
  - 切换策略为 `manual`，按提示手动解决；或从 `theirs/ours` 改回 `manual`。

- 回滚找不到 stash
  - 使用 `git stash list` 查看并手动恢复；或在下次执行后记录返回的 `stashId`。

## 可视化与分析

- blessed-contrib 图表不显示
  - 尝试更换终端（Windows Terminal/Cmder）或禁用动画；确认终端窗口足够大。

- Git log/统计为空
  - 确认当前目录为 Git 仓库且存在提交；必要时使用 `--cwd` 指定仓库路径。

## 配置与存储

- 清除本地历史/推荐数据
  - 推荐数据本地存储于用户配置目录（conf），可通过 CLI 配置命令或删除配置文件清理。

- 重置 CLI 配置
  - 使用增强 CLI 的 `config` 命令或删除配置文件（见“配置与存储”章节）。

## 其他

- 终端中文字符对齐
  - 在混合中英文输出场景，优先使用增强模式的表格输出；或更换等宽/中文友好的字体。

- 依赖安装失败
  - 使用国内镜像或启用网络代理；清理 lockfile 与 node_modules 后重装：
    - `pnpm install --force`

