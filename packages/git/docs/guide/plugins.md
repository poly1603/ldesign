# 插件系统

插件系统允许你为 @ldesign/git 扩展命令、Hook、配置 UI 与本地存储，打造符合团队需求的工作流与工具集。

## 能力概览

- 命令扩展：注册自定义命令与别名
- Hook 扩展：在预定义事件上执行插件逻辑
- 存储与配置：读写插件专属配置与 KV 存储
- 与 Git 集成：直接执行 git 子命令或调用内置 API
- 与用户交互：提示/确认/输入等交互能力

## 快速上手

插件目录（默认）位于用户目录：`~/.lgit/plugins`，配置目录为：`~/.lgit/config`。

一个最小插件目录结构示例：

```text path=null start=null
my-plugin/
  plugin.json
  index.js
```

plugin.json：

```json path=null start=null
{
  "name": "my-plugin",
  "version": "0.1.0",
  "description": "Example LGit plugin",
  "main": "index.js",
  "commands": [
    { "name": "hello", "description": "Say hello" }
  ],
  "hooks": [
    { "event": "post-commit", "handler": "onPostCommit" }
  ],
  "config": {
    "defaults": { "greeting": "Hello" }
  }
}
```

index.js：

```js path=null start=null
module.exports = {
  async onLoad(ctx) {
    ctx.logger.info('my-plugin loaded!')
  },
  async execute(command, args) {
    if (command === 'hello') {
      const cfg = ctx.api.getPluginConfig('my-plugin')
      console.log(`${cfg.greeting}, ${args?.name || 'world'}!`)
      return
    }
  },
  async onPostCommit() {
    console.log('A commit just happened!')
  }
}
```

> 插件通过 `plugin.json` 声明：名称、入口、命令、Hook、默认配置、权限等。入口文件导出生命周期与处理函数。

## 插件上下文（PluginContext）

插件运行时可获得以下上下文（ctx）：

- `git`：Git 实例
- `logger`：日志对象（info/warn/error/debug）
- `storage`：KV 存储（get/set/delete/clear）
- `events`：事件中心
- `api`：插件 API（见下）
- `config`：插件配置（合并了 defaults 与用户配置）

## 插件 API 一览

- `registerCommand(command)`：注册命令 `{ name, description, alias?, options? }`
- `registerHook(hook)`：注册 Hook `{ event, handler, priority? }`
- `executeGitCommand(cmd)`：执行 `git <cmd>`，返回 stdout
- `showNotification(message, type?)`：显示通知（info/success/warning/error）
- `promptUser(questions)`：交互提问（inquirer 兼容）
- `getPluginConfig(name)` / `setPluginConfig(name, cfg)`：读写插件配置
- `callPlugin(name, method, ...args)`：调用其他插件的导出方法

## 生命周期（可选）

插件可导出以下异步函数：

- `onLoad()`：插件加载时调用
- `onUnload()`：插件卸载时调用
- `onActivate()` / `onDeactivate()`：启用/停用时调用

## Hook 事件

内置若干 Git 与 CLI 相关事件（示例）：

- `pre-commit` / `post-commit`
- `pre-push` / `post-push`
- `pre-merge` / `post-merge`
- `pre-rebase` / `post-rebase`

## 存储与配置

- 存储：`~/.lgit/plugins/<pluginName>/storage.json`
- 配置：`~/.lgit/config/<pluginName>/config.json`

在插件中使用 `ctx.storage.get/set/delete/clear` 进行简易 KV 管理；使用 `ctx.api.getPluginConfig/setPluginConfig` 管理配置。

## 最佳实践

- 命令命名：与核心命令避免冲突，建议加上前缀（如 `my-`）。
- 安全与权限：避免执行不可信命令；如需网络访问，建议在 manifest 中声明 permissions（扩展能力时）。
- 版本兼容：在 manifest 声明最低 LGit 版本（engines.lgit），便于兼容性检查。

## 调试与发布

- 本地调试：将插件目录放入 `~/.lgit/plugins` 后，重启 CLI，或通过增强 CLI 的插件管理命令（待提供）刷新插件。
- 发布：推荐打包为压缩包并提供下载地址，或提交到团队内部插件仓库。

