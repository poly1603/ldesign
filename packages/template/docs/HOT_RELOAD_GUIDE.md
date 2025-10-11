# 热更新系统使用指南

@ldesign/template 提供了强大的热更新系统，支持增量更新、版本控制、回滚机制和更新通知。

## 📑 目录

- [核心功能](#核心功能)
- [快速开始](#快速开始)
- [增量更新](#增量更新)
- [版本控制](#版本控制)
- [回滚机制](#回滚机制)
- [更新通知](#更新通知)
- [Vue Composable](#vue-composable)
- [高级用法](#高级用法)
- [最佳实践](#最佳实践)

## 🎯 核心功能

### 1. 增量更新
- ✅ 支持细粒度的更新（文件、组件、属性级别）
- ✅ 智能差异计算
- ✅ 批量更新合并
- ✅ 更新队列管理

### 2. 版本控制
- ✅ 自动版本号递增
- ✅ 版本标签和元数据
- ✅ 版本历史追踪
- ✅ 语义化版本支持

### 3. 回滚机制
- ✅ 全量回滚
- ✅ 增量回滚
- ✅ 自动快照备份
- ✅ 历史记录管理

### 4. 更新通知
- ✅ 多种通知类型（控制台、Toast、WebSocket）
- ✅ 可配置的通知级别
- ✅ 自定义通知处理器
- ✅ 通知操作支持

## 🚀 快速开始

### 基础使用

```typescript
import { createEnhancedHotReloadManager } from '@ldesign/template'

// 创建热更新管理器
const hotReload = createEnhancedHotReloadManager({
  debug: true,
  enabled: import.meta.env.DEV,
  versionControl: {
    enabled: true,
    autoIncrement: true,
  },
  notification: {
    enabled: true,
    types: ['console'],
    level: 'normal',
  },
})

// 监听模板更新
hotReload.on('template', (update) => {
  console.log('模板已更新:', update.path)
  // 重新加载模板
})

// 监听配置更新
hotReload.on('config', (update) => {
  console.log('配置已更新:', update.path)
  // 应用新配置
})

// 监听通知
hotReload.onNotification((notification) => {
  console.log('收到通知:', notification.title, notification.message)
})
```

### Vue 中使用

```vue
<script setup lang="ts">
import { useHotReload } from '@ldesign/template'

const {
  state,
  currentVersion,
  notifications,
  onUpdate,
  rollback,
  getHistory,
} = useHotReload()

// 监听模板更新
onUpdate('template', (update) => {
  console.log('模板更新:', update)
})

// 回滚到特定版本
async function handleRollback(version: string) {
  const success = await rollback(version)
  if (success) {
    console.log('回滚成功')
  }
}
</script>

<template>
  <div class="hot-reload-status">
    <div>当前版本: {{ currentVersion.version }}</div>
    <div>历史记录: {{ state.historyCount }}</div>
    <div v-if="notifications.length > 0">
      通知数: {{ notifications.length }}
    </div>
  </div>
</template>
```

## 📦 增量更新

### 添加更新

```typescript
// 添加模板更新
hotReload.addUpdate({
  type: 'template',
  operation: 'modify',
  path: '/templates/login/mobile/default/index.vue',
  oldValue: previousTemplate,
  newValue: newTemplate,
  diff: {
    // 差异数据
    changed: ['<template>', '<script>'],
    additions: 10,
    deletions: 5,
  },
})

// 添加配置更新
hotReload.addUpdate({
  type: 'config',
  operation: 'modify',
  path: '/config/theme.json',
  oldValue: { theme: 'light' },
  newValue: { theme: 'dark' },
})

// 添加样式更新
hotReload.addUpdate({
  type: 'style',
  operation: 'modify',
  path: '/styles/main.css',
  newValue: 'body { background: #fff; }',
})
```

### 部分更新配置

```typescript
const hotReload = createEnhancedHotReloadManager({
  partialUpdate: {
    enabled: true,
    granularity: 'component', // 'file' | 'component' | 'property'
    smartMerge: true,
    mergeStrategy: 'merge', // 'override' | 'merge' | 'append'
  },
})
```

### 增量更新策略

```typescript
const hotReload = createEnhancedHotReloadManager({
  incrementalUpdate: {
    enabled: true,
    chunkSize: 10, // 每批处理的更新数量
    compression: false, // 是否压缩更新数据
  },
  updateDelay: 100, // 更新延迟（毫秒）
})
```

## 🏷️ 版本控制

### 自动版本管理

```typescript
const hotReload = createEnhancedHotReloadManager({
  versionControl: {
    enabled: true,
    autoIncrement: true, // 自动递增版本号
    format: 'v{major}.{minor}.{patch}',
  },
})

// 添加更新时自动递增版本
hotReload.addUpdate({
  type: 'template',
  operation: 'modify',
  path: '/templates/login/mobile/default/index.vue',
  newValue: newTemplate,
})

// 查看当前版本
const version = hotReload.getCurrentVersion()
console.log('当前版本:', version.version) // 例如: "1.0.1"
```

### 手动版本管理

```typescript
// 设置版本
hotReload.setVersion('2.0.0', '重大更新：新增暗黑模式')

// 获取版本信息
const version = hotReload.getCurrentVersion()
console.log('版本:', version.version)
console.log('时间:', new Date(version.timestamp))
console.log('说明:', version.message)
console.log('标签:', version.tags)
```

### 版本历史

```typescript
// 获取历史记录
const history = hotReload.getHistory()

history.forEach((entry) => {
  console.log(`版本 ${entry.version.version}:`)
  console.log(`  更新数量: ${entry.updates.length}`)
  console.log(`  时间: ${new Date(entry.timestamp)}`)
  console.log(`  说明: ${entry.version.message || '无'}`)
})
```

## ⏮️ 回滚机制

### 回滚到指定版本

```typescript
// 全量回滚（使用快照）
const hotReload = createEnhancedHotReloadManager({
  rollback: {
    enabled: true,
    strategy: 'full', // 使用完整快照
    autoBackup: true, // 自动创建备份
    maxHistory: 50, // 最大历史记录数
  },
})

// 回滚到特定版本
await hotReload.rollback('1.0.5')

// 增量回滚（反向应用更新）
const hotReload2 = createEnhancedHotReloadManager({
  rollback: {
    enabled: true,
    strategy: 'incremental', // 增量回滚
  },
})

await hotReload2.rollback('1.0.3')
```

### Vue 中的回滚

```vue
<script setup lang="ts">
import { useHotReload } from '@ldesign/template'

const { rollback, getHistory } = useHotReload()

const history = computed(() => getHistory())

async function handleRollback(version: string) {
  try {
    const success = await rollback(version)
    if (success) {
      ElMessage.success(`已回滚到版本 ${version}`)
    } else {
      ElMessage.error('回滚失败')
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<template>
  <div class="version-history">
    <el-timeline>
      <el-timeline-item
        v-for="entry in history"
        :key="entry.id"
        :timestamp="new Date(entry.timestamp).toLocaleString()"
      >
        <div class="version-entry">
          <h4>版本 {{ entry.version }}</h4>
          <p>更新数量: {{ entry.updateCount }}</p>
          <el-button @click="handleRollback(entry.version)">
            回滚到此版本
          </el-button>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>
```

## 🔔 更新通知

### 通知配置

```typescript
const hotReload = createEnhancedHotReloadManager({
  notification: {
    enabled: true,
    types: ['console', 'toast', 'custom'],
    level: 'verbose', // 'silent' | 'minimal' | 'normal' | 'verbose'
    customHandler: (notification) => {
      // 自定义通知处理
      console.log('自定义通知:', notification)
      
      // 发送到监控系统
      analytics.track('hot-reload-notification', {
        type: notification.type,
        title: notification.title,
        updateCount: notification.updates.length,
      })
    },
  },
})
```

### 监听通知

```typescript
hotReload.onNotification((notification) => {
  console.log('通知类型:', notification.type) // 'info' | 'success' | 'warning' | 'error'
  console.log('标题:', notification.title)
  console.log('消息:', notification.message)
  console.log('更新列表:', notification.updates)

  // 执行操作
  if (notification.actions) {
    notification.actions.forEach((action) => {
      console.log('可用操作:', action.label)
      // action.handler() // 执行操作
    })
  }
})
```

### Vue 通知组件

```vue
<script setup lang="ts">
import { useHotReloadNotifications } from '@ldesign/template'

const {
  notifications,
  hasNotifications,
  clearNotifications,
  clearNotification,
} = useHotReloadNotifications()

// 通知会自动显示在组件中
</script>

<template>
  <div v-if="hasNotifications" class="notifications">
    <el-alert
      v-for="notification in notifications"
      :key="notification.id"
      :title="notification.title"
      :type="notification.type"
      :description="notification.message"
      :closable="true"
      @close="clearNotification(notification.id)"
    >
      <template #default>
        <div v-if="notification.updates.length > 0">
          <p>更新详情:</p>
          <ul>
            <li v-for="update in notification.updates" :key="update.id">
              {{ update.type }}: {{ update.path }}
            </li>
          </ul>
        </div>
      </template>
    </el-alert>
    
    <el-button @click="clearNotifications">清除所有通知</el-button>
  </div>
</template>

<style scoped>
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  z-index: 9999;
}
</style>
```

## 🧩 Vue Composable

### useHotReload

```typescript
import { useHotReload } from '@ldesign/template'

const {
  manager,           // 热更新管理器实例
  state,             // 当前状态
  currentVersion,    // 当前版本信息
  notifications,     // 通知列表
  hasNotifications,  // 是否有通知
  onUpdate,          // 监听特定类型更新
  onAnyUpdate,       // 监听所有更新
  onNotify,          // 监听通知
  addUpdate,         // 添加更新
  rollback,          // 回滚
  getHistory,        // 获取历史
  clearNotifications,// 清除通知
  setVersion,        // 设置版本
} = useHotReload()
```

### useHotReloadNotifications

简化版本，只处理通知：

```typescript
import { useHotReloadNotifications } from '@ldesign/template'

const {
  notifications,
  hasNotifications,
  clearNotifications,
  clearNotification,
} = useHotReloadNotifications()
```

### useHotReloadVersion

简化版本，只处理版本：

```typescript
import { useHotReloadVersion } from '@ldesign/template'

const {
  currentVersion,
  setVersion,
  rollback,
  getHistory,
} = useHotReloadVersion()
```

## 🎓 高级用法

### 自定义更新处理

```typescript
// 监听特定类型的更新
hotReload.on('template', async (update) => {
  if (update.operation === 'modify') {
    // 重新加载模板
    const newTemplate = await import(update.path)
    
    // 应用更新
    templateManager.updateTemplate(
      update.path,
      newTemplate,
      { preserveState: true }
    )
  } else if (update.operation === 'delete') {
    // 删除模板
    templateManager.removeTemplate(update.path)
  }
})

// 监听所有更新
hotReload.on('template', handleUpdate)
hotReload.on('config', handleUpdate)
hotReload.on('style', handleUpdate)
hotReload.on('component', handleUpdate)
hotReload.on('asset', handleUpdate)

function handleUpdate(update: IncrementalUpdate) {
  console.log('更新:', update.type, update.operation, update.path)
  
  // 根据更新类型和操作执行相应的处理
  // ...
}
```

### 条件回滚

```typescript
// 回滚到特定条件的版本
async function rollbackToStable() {
  const history = hotReload.getHistory()
  
  // 找到最近的稳定版本（例如：标记为 'stable' 的版本）
  const stableVersion = history
    .reverse()
    .find((entry) => entry.version.tags?.includes('stable'))
  
  if (stableVersion) {
    await hotReload.rollback(stableVersion.version.version)
    console.log('已回滚到稳定版本:', stableVersion.version.version)
  }
}
```

### 集成 WebSocket

```typescript
// 服务器端推送更新
const ws = new WebSocket('ws://localhost:3000/hot-reload')

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  
  // 添加到热更新管理器
  hotReload.addUpdate({
    type: update.type,
    operation: update.operation,
    path: update.path,
    newValue: update.newValue,
    diff: update.diff,
  })
}
```

## ✅ 最佳实践

### 1. 开发环境专用

```typescript
// 只在开发环境启用
const hotReload = createEnhancedHotReloadManager({
  enabled: import.meta.env.DEV,
  debug: import.meta.env.DEV,
})

// 生产环境自动禁用
if (import.meta.env.PROD) {
  // 热更新在生产环境完全不可用
}
```

### 2. 状态保持

```typescript
const hotReload = createEnhancedHotReloadManager({
  preserveState: true, // 保持组件状态
})

// 在应用更新时保存状态
hotReload.on('template', async (update) => {
  // 保存当前状态
  const state = saveCurrentState()
  
  // 应用更新
  await applyUpdate(update)
  
  // 恢复状态
  restoreState(state)
})
```

### 3. 错误处理

```typescript
hotReload.on('template', async (update) => {
  try {
    await applyUpdate(update)
  } catch (error) {
    console.error('更新失败:', error)
    
    // 回滚到上一个版本
    const history = hotReload.getHistory()
    if (history.length > 1) {
      const previousVersion = history[history.length - 2]
      await hotReload.rollback(previousVersion.version.version)
    }
  }
})
```

### 4. 性能优化

```typescript
const hotReload = createEnhancedHotReloadManager({
  updateDelay: 100, // 防抖延迟
  incrementalUpdate: {
    enabled: true,
    chunkSize: 10, // 批量处理
  },
})
```

### 5. 版本标记

```typescript
// 标记重要版本
hotReload.setVersion('1.0.0', '首次发布')
hotReload.getCurrentVersion().tags = ['stable', 'release']

hotReload.setVersion('1.1.0', '添加新功能')
hotReload.getCurrentVersion().tags = ['feature', 'beta']

hotReload.setVersion('1.1.1', '修复bug')
hotReload.getCurrentVersion().tags = ['bugfix', 'stable']
```

## 📚 相关资源

- [Hot Module Replacement (HMR)](https://vitejs.dev/guide/api-hmr.html)
- [Vue HMR API](https://vuejs.org/api/hmr.html)
- [模板系统文档](./README.md)

## 🐛 故障排除

### 热更新不生效

1. 检查是否在开发环境
2. 确认 HMR 是否启用
3. 查看控制台错误信息

### 回滚失败

1. 确认版本是否存在于历史记录中
2. 检查回滚配置是否启用
3. 查看是否有足够的历史记录

### 通知不显示

1. 检查通知配置是否启用
2. 确认通知级别设置
3. 验证通知处理器是否正确注册

---

**文档版本**: v2.0.0  
**更新时间**: 2025-10-10
