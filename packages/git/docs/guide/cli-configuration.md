# CLI 配置总览

本页汇总增强 CLI 的配置项、默认值与管理方式（存储于本地，隐私友好）。

## 配置结构

```ts path=null start=null
interface CLIConfig {
  theme: {
    primary: string
    secondary: string
    success: string
    error: string
    warning: string
    info: string
  }
  aliases: Record<string, string>
  defaults: Record<string, any>
  features: {
    autoCorrect: boolean
    suggestions: boolean
    animations: boolean
    colors: boolean
    icons: boolean
  }
}
```

默认值（摘要）：

- 主题（theme）
  - primary: #00bcd4, secondary: #8bc34a, success: #4caf50, error: #f44336, warning: #ff9800, info: #2196f3
- 别名（aliases）：空对象（示例可自定义）
- 默认项（defaults）：空对象（按需扩展）
- 特性（features）：autoCorrect/suggestions/animations/colors/icons 均为 true

## 配置文件位置

- 使用 `conf` 存储于用户配置目录（不同系统路径不同）。
- 项目名：`ldesign-git`，版本：与 CLI 对应。

## 命令行管理

增强模式提供 `config` 命令来管理 CLI 配置：

```bash
# 查看配置（示例）
ldesign-git config get theme
ldesign-git config get features

# 设置配置（示例）
ldesign-git config set features.colors false
ldesign-git config set features.animations false

# 设置主题颜色
ldesign-git config set theme.primary "#42b983"
ldesign-git config set theme.error "#ff4d4f"

# 管理别名
ldesign-git config set aliases.st "status"
ldesign-git config set aliases.ci "commit"

# 删除配置键
ldesign-git config unset aliases.st

# 导入/导出（如 CLI 支持）
ldesign-git config export > lgit.config.json
ldesign-git config import lgit.config.json
```

> 如果你的 CLI 版本暂未提供以上子命令，可通过增强 CLI 的交互模式或在用户配置目录手工修改。

## 最佳实践

- 主题：根据终端背景（深/浅）调整 primary 与 info，确保可读性。
- 动画：在 CI 或远程终端建议关闭 animations。
- 颜色：遇到色彩异常时临时设置 colors=false。
- 别名：为高频命令（status、commit、push、pull、branch 等）设置易记缩写。
- 默认值：在 defaults 中预置团队约定（如默认远程、默认分支）。

