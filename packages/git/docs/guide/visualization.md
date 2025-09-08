# 代码可视化

在终端中呈现贡献者排行、变更热力图、提交活动、项目时间线、分支关系与代码统计等，帮助快速发现热点与趋势。

## 功能概览

- 贡献者排行与明细（提交、增删行、活跃天数、最后活动）
- 代码热力图（文件变更频率、作者参与度、热度分布）
- 提交活动热力图（周/小时维度、年度网格）
- 项目时间线（提交、标签、分支、合并等关键事件）
- 分支关系图（基于 `git log --graph` 渲染）
- 语言分布、复杂度、变更率、热点矩阵

## CLI 用法（增强模式）

- 进入交互式仪表盘：
  ```bash
  ldesign-git interactive
  ```
  在 UI 中选择“贡献者图表”“代码热力图”“提交活动图”“项目时间线”“分支关系图”“代码统计图”“文件变更矩阵”等模块。

- 常见问题：
  - Windows 终端若出现字符对齐异常，使用等宽字体与 Windows Terminal；必要时切换到经典模式。
  - 统计依赖 git 历史，请在仓库根目录或使用 `--cwd` 指定仓库路径。

## 编程式用法

```ts path=null start=null
import { Git } from '@ldesign/git'
import { Visualization } from '@ldesign/git/core/Visualization'

const git = Git.create()
const v = new Visualization(git)

await v.showContributorsChart()
await v.showCodeHeatmap()
await v.showActivityChart()
await v.showProjectTimeline()
await v.showBranchGraph()
await v.showStatisticsChart()
await v.showChangeMatrix()
```

## 依赖与建议

- 终端 UI 依赖 blessed / blessed-contrib（安装包已包含）。
- Windows 建议启用 ANSI 支持、使用等宽字体。
- 如果你的终端对绘制支持较弱，可切换到经典模式仅输出文本统计。

