# UI 构建问题修复完成

## 修复时间
2025-10-09 11:20

## 问题描述

### 原始问题
1. ❌ **UI 显示"执行失败"** - 虽然退出码为 0（成功）
2. ❌ **构建重复执行 4 次** - 导致日志重复输出
3. ❌ **出现 4 个成功弹窗** - 用户体验差

## 根本原因分析

### 问题 1: 构建重复触发
**原因**：WebSocket 事件监听器被重复订阅

在 `ProjectAction.vue` 中，`subscribeToProcess()` 函数可能被多次调用，但没有完全清理旧的监听器，导致同一个事件触发多次回调。

**代码位置**：`packages/cli/src/web/src/views/ProjectAction.vue:562-621`

### 问题 2: 缺少防重复执行机制
**原因**：`startAction()` 函数没有检查当前是否已有任务在运行

用户可能快速点击多次"开始打包"按钮，或者其他组件触发了多次构建。

**代码位置**：`packages/cli/src/web/src/views/ProjectAction.vue:631`

### 问题 3: 退出事件重复处理
**原因**：同一个 `process-exit` 事件被多个监听器捕获

即使只有一个构建进程，但由于订阅了多次，每次退出事件会触发多个回调。

## 修复方案

### 修复 1: 添加退出事件处理标记

```typescript
// 标记是否已经处理过退出事件，防止重复处理
let isExitHandled = false

const subscribeToProcess = () => {
  // 清理旧的订阅
  unsubscribeList.forEach(unsubscribe => unsubscribe())
  unsubscribeList = []
  
  // 重置退出处理标记
  isExitHandled = false
  
  const unsubscribeExit = subscribe('process-exit', (data: any) => {
    if (data.processId === currentProcessId.value && !isExitHandled) {
      // 标记已处理，防止重复触发
      isExitHandled = true
      
      // ... 处理退出事件
    }
  })
}
```

**效果**：即使事件被多次触发，也只会处理一次

### 修复 2: 添加运行状态检查

```typescript
const startAction = async () => {
  // 防止重复执行
  if (running.value) {
    message.warning('任务正在执行中，请稍候...')
    return
  }
  
  // ... 继续执行
}
```

**效果**：防止用户重复点击或程序重复调用

### 修复 3: 改进错误处理和消息提示

```typescript
// 基于退出码判断成功/失败
const isSuccess = data.code === 0
addLog(`进程已退出 (退出码: ${data.code})`, isSuccess ? 'success' : 'error')

// 只在成功时显示成功消息
if (isSuccess) {
  message.success('执行成功')
  // ... 记录构建时间
} else {
  // 失败时显示错误消息
  message.error('执行失败')
}
```

**效果**：明确区分成功和失败状态

## 修改的文件

### 1. `packages/cli/src/web/src/views/ProjectAction.vue`

**修改点 1** (第 561-563 行)：
- 添加 `isExitHandled` 标记变量

**修改点 2** (第 564-637 行)：
- 在 `subscribeToProcess()` 中重置标记
- 在退出事件处理中检查标记
- 添加失败时的错误消息

**修改点 3** (第 647-653 行)：
- 在 `startAction()` 开始处检查 `running` 状态
- 添加防重复执行的提示

## 验证步骤

### 1. 重启开发服务器
```bash
cd D:\WorkBench\ldesign\packages\cli
pnpm run dev
```

### 2. 访问 UI 界面
打开浏览器访问 LDesign UI

### 3. 测试构建功能
1. 进入任意包的详情页（如 cache）
2. 点击"开始打包"按钮
3. 观察：
   - ✅ 只应显示 1 个成功弹窗
   - ✅ 日志只输出 1 次
   - ✅ 状态正确显示"执行成功"
   - ✅ 快速重复点击按钮应显示"任务正在执行中"提示

### 4. 验证失败情况
1. 人为制造构建错误（如修改 package.json）
2. 点击"开始打包"
3. 观察：
   - ✅ 应显示"执行失败"
   - ✅ 状态卡片显示失败状态
   - ✅ 退出码非 0

## 预期效果

### 修复前
- ❌ 4 个成功弹窗
- ❌ 日志重复 4 次
- ❌ 显示"执行失败"（虽然实际成功）

### 修复后
- ✅ 1 个成功弹窗
- ✅ 日志输出 1 次
- ✅ 正确显示"执行成功"（退出码 0）
- ✅ 防止重复点击
- ✅ 失败时正确显示"执行失败"

## 技术细节

### 关键改进点

1. **去重机制**
   - 使用 `isExitHandled` 标记防止重复处理
   - 在新订阅开始时重置标记

2. **状态锁**
   - 在 `startAction()` 开始时检查 `running` 状态
   - 如果已运行，直接返回并提示

3. **明确的状态判断**
   - 基于退出码（`data.code === 0`）判断成功/失败
   - 不再依赖日志内容或其他不可靠的指标

4. **用户友好的提示**
   - 成功：`message.success('执行成功')`
   - 失败：`message.error('执行失败')`
   - 重复执行：`message.warning('任务正在执行中，请稍候...')`

## 注意事项

1. **不影响命令行构建**
   - 这些修改只影响 UI 界面
   - 命令行 `pnpm run build` 仍然正常工作

2. **不改变构建逻辑**
   - 只修复了 UI 显示和事件处理
   - 构建本身的逻辑没有改变

3. **向后兼容**
   - 修改不会破坏现有功能
   - 所有操作（dev、preview、test等）都应正常工作

## 后续建议

### 短期
- 测试其他操作（dev、preview、test）确保没有回归
- 检查其他可能有类似问题的组件

### 中期
- 考虑将事件订阅逻辑抽取到 composable
- 添加单元测试覆盖事件处理逻辑

### 长期
- 考虑使用状态机管理构建流程
- 实现更健壮的进程管理机制

---

**状态**: ✅ 修复完成  
**测试**: ⏳ 待验证  
**风险**: 低（仅修改 UI 层逻辑）
