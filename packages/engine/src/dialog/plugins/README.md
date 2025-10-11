# Delete Confirm Dialog Plugin

一个用于删除确认操作的 Dialog 插件，取代传统的 `alert` 弹窗，提供更美观和功能丰富的确认对话框。

## ✨ 特性

- 🎨 **美观的设计** - 现代化的 UI 设计，支持自定义样式
- 🔔 **警告图标** - 可选的警告图标，增强视觉提示
- ⌨️ **输入确认** - 对重要操作支持输入确认文本
- 🎯 **灵活配置** - 支持自定义按钮、消息、样式等
- 🔄 **回调支持** - 支持确认和取消回调
- 📱 **响应式** - 自适应移动端和桌面端
- ⚡ **轻量高效** - 无需额外依赖，开箱即用

## 📦 安装

插件已经集成在 `@ldesign/engine` 包中，无需额外安装。

```typescript
import { createDeleteConfirmPlugin, injectDeleteConfirmStyles } from '@ldesign/engine/dialog/plugins/delete-confirm'
```

## 🚀 快速开始

### 1. 基础用法

```typescript
import { createDialogManager } from '@ldesign/engine/dialog'
import { createDeleteConfirmPlugin, injectDeleteConfirmStyles } from '@ldesign/engine/dialog/plugins/delete-confirm'

// 创建 Dialog 管理器
const dialogManager = createDialogManager()
await dialogManager.initialize()

// 创建删除确认插件
const deletePlugin = createDeleteConfirmPlugin()

// 注入样式
injectDeleteConfirmStyles()

// 安装插件
const dialogAPI = {
  open: dialogManager.open.bind(dialogManager),
  alert: dialogManager.alert.bind(dialogManager),
  confirm: dialogManager.confirm.bind(dialogManager),
  prompt: dialogManager.prompt.bind(dialogManager),
  close: dialogManager.close.bind(dialogManager),
  closeAll: dialogManager.closeAll.bind(dialogManager),
  getById: dialogManager.getById.bind(dialogManager),
  getAll: dialogManager.getAll.bind(dialogManager),
  getVisible: dialogManager.getVisible.bind(dialogManager),
  config: dialogManager.updateConfig.bind(dialogManager),
}

deletePlugin.install(dialogAPI)

// 使用插件
const confirmed = await deletePlugin.showDeleteConfirm({
  itemName: '用户数据'
})

if (confirmed) {
  console.log('用户确认删除')
  // 执行删除操作
}
```

### 2. 简化用法（快速删除）

```typescript
// 最简单的用法
const confirmed = await deletePlugin.quickDeleteConfirm('这条记录')

if (confirmed) {
  await deleteRecord()
}
```

### 3. 危险删除（需要输入确认）

```typescript
// 对于重要数据的删除，需要用户输入 "DELETE" 确认
const confirmed = await deletePlugin.dangerousDeleteConfirm(
  '生产环境数据库',
  'DELETE' // 需要输入的确认文本
)

if (confirmed) {
  await deleteProductionDatabase()
}
```

## 📖 API 文档

### DeleteConfirmOptions

删除确认配置选项：

```typescript
interface DeleteConfirmOptions {
  /** 要删除的项目名称或描述 */
  itemName?: string

  /** 自定义提示内容 */
  message?: string

  /** 是否显示警告图标（默认: true） */
  showWarningIcon?: boolean

  /** 确认按钮文本（默认: "确认删除"） */
  confirmText?: string

  /** 取消按钮文本（默认: "取消"） */
  cancelText?: string

  /** 是否需要二次确认（输入确认文本）（默认: false） */
  requireConfirmInput?: boolean

  /** 需要输入的确认文本（默认: "DELETE"） */
  confirmInputText?: string

  /** 确认按钮类型（默认: "danger"） */
  confirmButtonType?: 'danger' | 'warning' | 'primary'

  /** 删除成功后的回调 */
  onConfirm?: () => void | Promise<void>

  /** 取消删除的回调 */
  onCancel?: () => void
}
```

### 方法

#### showDeleteConfirm(options)

显示删除确认弹窗。

```typescript
const confirmed = await deletePlugin.showDeleteConfirm({
  itemName: '文件 "document.pdf"',
  message: '删除后将无法恢复，确定要继续吗？',
  confirmText: '永久删除',
  cancelText: '保留',
  showWarningIcon: true,
  onConfirm: async () => {
    console.log('正在删除...')
    await deleteFile('document.pdf')
  }
})
```

**返回值：** `Promise<boolean>` - 用户是否确认删除

#### quickDeleteConfirm(itemName)

快速删除确认（简化 API）。

```typescript
const confirmed = await deletePlugin.quickDeleteConfirm('这条记录')
```

**参数：**
- `itemName` - 要删除的项目名称

**返回值：** `Promise<boolean>` - 用户是否确认删除

#### dangerousDeleteConfirm(itemName, confirmInputText?)

危险删除确认，需要用户输入确认文本。

```typescript
const confirmed = await deletePlugin.dangerousDeleteConfirm(
  '整个数据库',
  'DELETE' // 可选，默认为 "DELETE"
)
```

**参数：**
- `itemName` - 要删除的项目名称
- `confirmInputText` - 需要输入的确认文本（可选，默认 "DELETE"）

**返回值：** `Promise<boolean>` - 用户是否确认删除

## 🎯 使用场景

### 场景 1: 简单删除确认

适用于一般的删除操作。

```typescript
const deleteBtn = document.querySelector('#delete-btn')
deleteBtn.addEventListener('click', async () => {
  const confirmed = await deletePlugin.showDeleteConfirm({
    itemName: '用户账号'
  })

  if (confirmed) {
    await deleteUserAccount()
    showSuccessMessage('账号已删除')
  }
})
```

### 场景 2: 批量删除

删除多个项目时显示数量。

```typescript
const selectedItems = ['file1.txt', 'file2.txt', 'file3.txt']

const confirmed = await deletePlugin.showDeleteConfirm({
  itemName: `${selectedItems.length} 个文件`,
  message: `您选择了 ${selectedItems.length} 个文件，确定要全部删除吗？`,
  confirmText: '删除全部'
})

if (confirmed) {
  for (const item of selectedItems) {
    await deleteFile(item)
  }
  showSuccessMessage('批量删除完成')
}
```

### 场景 3: 危险操作确认

对于重要数据或不可恢复的操作。

```typescript
const confirmed = await deletePlugin.showDeleteConfirm({
  itemName: '生产环境配置',
  message: '您即将删除生产环境配置，这是一个非常危险的操作！',
  requireConfirmInput: true,
  confirmInputText: 'DELETE',
  confirmButtonType: 'danger'
})

if (confirmed) {
  await deleteProductionConfig()
}
```

### 场景 4: 与 Vue 集成

```vue
<script setup>
import { createDeleteConfirmPlugin, injectDeleteConfirmStyles } from '@ldesign/engine/dialog/plugins/delete-confirm'
import { onMounted } from 'vue'

let deletePlugin

onMounted(async () => {
  // 初始化插件（只需要一次）
  const { deleteConfirmPlugin } = await initDeletePlugin()
  deletePlugin = deleteConfirmPlugin
  injectDeleteConfirmStyles()
})

async function handleDelete() {
  const confirmed = await deletePlugin.showDeleteConfirm({
    itemName: '当前项',
    onConfirm: async () => {
      await api.delete('/item')
    }
  })

  if (confirmed) {
    // 更新 UI
    emit('deleted')
  }
}
</script>

<template>
  <button @click="handleDelete">
    删除
  </button>
</template>
```

### 场景 5: 与 React 集成

```jsx
import { createDeleteConfirmPlugin, injectDeleteConfirmStyles } from '@ldesign/engine/dialog/plugins/delete-confirm'
import { useEffect, useState } from 'react'

function DeleteButton() {
  const [deletePlugin, setDeletePlugin] = useState(null)

  useEffect(() => {
    // 初始化插件
    const initPlugin = async () => {
      const { deleteConfirmPlugin } = await initDeletePlugin()
      setDeletePlugin(deleteConfirmPlugin)
      injectDeleteConfirmStyles()
    }
    initPlugin()
  }, [])

  const handleDelete = async () => {
    if (!deletePlugin) return

    const confirmed = await deletePlugin.showDeleteConfirm({
      itemName: '当前项',
      message: '此操作无法撤销，确定要删除吗？'
    })

    if (confirmed) {
      await fetch('/api/delete', { method: 'DELETE' })
      console.log('删除成功')
    }
  }

  return <button onClick={handleDelete}>删除</button>
}
```

## 🎨 自定义样式

插件提供了完整的 CSS 类名，可以通过覆盖样式来自定义外观：

```css
/* 自定义弹窗样式 */
.delete-confirm-dialog .engine-dialog {
  border-radius: 16px;
}

/* 自定义消息样式 */
.delete-confirm-message {
  font-size: 18px;
  color: #000;
}

/* 自定义按钮样式 */
.delete-confirm-dialog .engine-dialog-footer button:last-child {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}
```

## 🧪 测试

打开 `delete-confirm.demo.html` 文件在浏览器中查看所有功能演示。

```bash
# 在项目根目录
open packages/engine/src/dialog/plugins/delete-confirm.demo.html
```

## 📝 完整示例

更多完整示例请参考：
- `delete-confirm.example.ts` - TypeScript 使用示例
- `delete-confirm.demo.html` - 浏览器演示页面

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
