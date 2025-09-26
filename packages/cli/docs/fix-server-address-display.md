# 修复：UI界面服务器地址显示问题

## 问题描述

在 `ldesign cli ui` 命令打开的可视化界面中，当服务（dev 或 preview）已经停止时，界面仍然会显示之前运行时的服务器地址（本地地址、网络地址和二维码）。这会给用户带来困惑，因为用户可能会尝试访问这些已经无效的地址。

## 问题原因

1. **状态持久化问题**：应用使用了 TaskStateContext 来管理任务状态，并将状态持久化到 localStorage。当页面刷新或重新打开时，会从 localStorage 恢复之前的状态，包括服务器地址信息。

2. **显示逻辑问题**：服务器地址的显示条件只判断了 `serverInfo.localUrl` 或 `serverInfo.networkUrl` 是否存在，没有判断服务是否正在运行。

## 解决方案

### 1. 修改服务器地址显示逻辑

在 `DevPage.tsx` 和 `PreviewPage.tsx` 中，将服务器地址显示的条件从：
```tsx
{(serverInfo.localUrl || serverInfo.networkUrl) && (
```

改为：
```tsx
{isProcessRunning && (serverInfo.localUrl || serverInfo.networkUrl) && (
```

这确保只有在服务正在运行时才显示服务器地址。

### 2. 停止服务时清理服务器信息

在 `stopProcess` 函数中添加清理服务器信息的逻辑：

```tsx
// 清理服务器信息
updateServerInfo(processKey, {
  localUrl: undefined,
  networkUrl: undefined,
  qrCode: undefined,
  port: undefined
})
```

这确保在停止服务时立即清除服务器地址信息。

## 修改的文件

1. **`packages/cli/web-ui/src/pages/DevPage.tsx`**
   - 第 560 行：添加 `isProcessRunning` 条件判断
   - 第 401-406 行：在 `stopProcess` 函数中添加清理服务器信息的代码

2. **`packages/cli/web-ui/src/pages/PreviewPage.tsx`**
   - 第 656 行：添加 `isProcessRunning` 条件判断（第一处）
   - 第 803 行：添加 `isProcessRunning` 条件判断（第二处）
   - 第 466-471 行：在 `stopProcess` 函数中添加清理服务器信息的代码

## 效果

修改后的效果：
1. 当服务运行中时，正常显示服务器地址信息
2. 当服务停止后，服务器地址信息会立即消失
3. 刷新页面或重新打开 UI 界面时，如果服务未运行，不会显示之前的服务器地址
4. 只有重新启动服务后，才会显示新的服务器地址

## 测试步骤

1. 构建 Web UI：`pnpm run build:ui`
2. 运行 UI 命令：`ldesign ui`
3. 启动开发服务器，确认服务器地址显示
4. 停止开发服务器，确认服务器地址消失
5. 刷新页面，确认服务器地址仍然不显示
6. 重新启动服务器，确认新的服务器地址显示

## 注意事项

- 这个修改不影响日志输出的显示，用户仍然可以在日志中看到之前的服务器地址信息
- 修改后需要重新构建 Web UI 才能生效