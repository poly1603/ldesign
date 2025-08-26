# 实时同步

@ldesign/store 提供了强大的实时同步功能，支持多实例状态同步、WebSocket 集成和实时数据更新。

## 🚀 基本概念

实时同步允许多个应用实例之间自动同步状态变化，确保数据的一致性和实时性。

### 同步机制

- **广播同步**: 状态变化自动广播到所有实例
- **选择性同步**: 只同步指定的状态字段
- **冲突解决**: 自动处理并发更新冲突
- **离线缓存**: 支持离线状态和重连同步

## 🔧 基本用法

### 启用状态同步

使用 `@Sync` 装饰器启用状态同步：

```typescript
import { BaseStore, State, Action, Sync } from '@ldesign/store'

export class SharedStore extends BaseStore {
  @State
  @Sync // 启用同步
  sharedData = {}

  @State
  @Sync({ channel: 'user-data' }) // 指定同步频道
  userData = null

  @State
  localData = {} // 不同步的本地状态

  @Action
  updateSharedData(data) {
    this.sharedData = { ...this.sharedData, ...data }
    // 变化会自动同步到其他实例
  }
}
```

### 配置同步选项

```typescript
export class ConfigurableStore extends BaseStore {
  @State
  @Sync({
    channel: 'app-state',
    debounce: 300, // 防抖300ms
    transform: (data) => {
      // 数据转换
      return { ...data, timestamp: Date.now() }
    },
    filter: (data, oldData) => {
      // 过滤不需要同步的变化
      return data.version !== oldData.version
    }
  })
  appState = {
    version: 1,
    settings: {}
  }
}
```

## 🌐 WebSocket 集成

### 基本 WebSocket 同步

```typescript
import { createWebSocketSync } from '@ldesign/store'

export class RealtimeStore extends BaseStore {
  @State
  @Sync
  messages = []

  @State
  @Sync
  onlineUsers = []

  @State
  connected = false

  private ws = null

  @Action
  async connect() {
    try {
      this.ws = new WebSocket('ws://localhost:8080/sync')
      
      this.ws.onopen = () => {
        this.connected = true
        console.log('WebSocket 连接已建立')
      }

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleSyncMessage(data)
      }

      this.ws.onclose = () => {
        this.connected = false
        this.scheduleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error)
      }

    } catch (error) {
      console.error('连接失败:', error)
    }
  }

  @Action
  private handleSyncMessage(data) {
    switch (data.type) {
      case 'state_update':
        this.applySyncUpdate(data.payload)
        break
      case 'user_joined':
        this.onlineUsers.push(data.user)
        break
      case 'user_left':
        this.onlineUsers = this.onlineUsers.filter(u => u.id !== data.user.id)
        break
    }
  }

  @Action
  private scheduleReconnect() {
    setTimeout(() => {
      if (!this.connected) {
        this.connect()
      }
    }, 3000)
  }
}
```

### 高级 WebSocket 配置

```typescript
export class AdvancedRealtimeStore extends BaseStore {
  @State
  @Sync({
    transport: 'websocket',
    url: 'ws://localhost:8080/sync',
    options: {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeat: {
        interval: 30000,
        message: { type: 'ping' }
      }
    }
  })
  syncedData = {}

  @Action
  async sendMessage(message) {
    // 乐观更新
    this.syncedData.messages = [...this.syncedData.messages, message]
    
    try {
      // 发送到服务器
      await this.syncTransport.send({
        type: 'message',
        data: message
      })
    } catch (error) {
      // 回滚更新
      this.syncedData.messages = this.syncedData.messages.filter(m => m.id !== message.id)
      throw error
    }
  }
}
```

## 🔄 多实例同步

### 浏览器标签页同步

```typescript
export class TabSyncStore extends BaseStore {
  @State
  @Sync({ 
    transport: 'broadcast',
    channel: 'tab-sync'
  })
  tabData = {
    activeTab: null,
    sharedState: {}
  }

  @Action
  setActiveTab(tabId) {
    this.tabData.activeTab = tabId
    // 自动同步到其他标签页
  }

  @Action
  updateSharedState(updates) {
    this.tabData.sharedState = {
      ...this.tabData.sharedState,
      ...updates
    }
  }
}
```

### 跨设备同步

```typescript
export class CrossDeviceStore extends BaseStore {
  @State
  @Sync({
    transport: 'server',
    endpoint: '/api/sync',
    auth: () => getAuthToken(),
    userId: () => getCurrentUserId()
  })
  userPreferences = {
    theme: 'light',
    language: 'zh-CN',
    settings: {}
  }

  @Action
  async syncAcrossDevices() {
    // 手动触发跨设备同步
    await this.syncTransport.fullSync()
  }
}
```

## ⚡ 实时数据流

### 数据流订阅

```typescript
export class DataStreamStore extends BaseStore {
  @State
  @Sync({ stream: true })
  liveData = []

  @State
  subscriptions = new Set()

  @Action
  subscribe(dataType) {
    this.subscriptions.add(dataType)
    
    // 订阅实时数据流
    this.syncTransport.subscribe(dataType, (data) => {
      this.liveData.push({
        type: dataType,
        data,
        timestamp: Date.now()
      })
    })
  }

  @Action
  unsubscribe(dataType) {
    this.subscriptions.delete(dataType)
    this.syncTransport.unsubscribe(dataType)
  }
}
```

### 事件驱动更新

```typescript
export class EventDrivenStore extends BaseStore {
  @State
  @Sync
  events = []

  @Action
  @SyncEvent('user_action')
  recordUserAction(action) {
    this.events.push({
      type: 'user_action',
      action,
      timestamp: Date.now(),
      userId: this.getCurrentUserId()
    })
  }

  @Action
  @SyncEvent('system_event')
  recordSystemEvent(event) {
    this.events.push({
      type: 'system_event',
      event,
      timestamp: Date.now()
    })
  }
}
```

## 🛠️ 冲突解决

### 自动冲突解决

```typescript
export class ConflictResolutionStore extends BaseStore {
  @State
  @Sync({
    conflictResolution: 'last-write-wins' // 最后写入获胜
  })
  document = {
    content: '',
    version: 0,
    lastModified: Date.now()
  }

  @State
  @Sync({
    conflictResolution: 'merge', // 自动合并
    mergeStrategy: (local, remote) => {
      return {
        ...local,
        ...remote,
        version: Math.max(local.version, remote.version) + 1
      }
    }
  })
  settings = {}
}
```

### 手动冲突解决

```typescript
export class ManualConflictStore extends BaseStore {
  @State
  @Sync({
    conflictResolution: 'manual'
  })
  collaborativeDoc = {
    content: '',
    version: 0
  }

  @State
  conflicts = []

  @Action
  handleConflict(conflict) {
    this.conflicts.push(conflict)
    // 通知用户处理冲突
    this.notifyConflict(conflict)
  }

  @Action
  resolveConflict(conflictId, resolution) {
    const conflict = this.conflicts.find(c => c.id === conflictId)
    if (conflict) {
      // 应用解决方案
      this.applyResolution(conflict, resolution)
      
      // 移除已解决的冲突
      this.conflicts = this.conflicts.filter(c => c.id !== conflictId)
    }
  }
}
```

## 📱 离线支持

### 离线缓存

```typescript
export class OfflineSyncStore extends BaseStore {
  @State
  @Sync({
    offline: true,
    cacheStrategy: 'persistent'
  })
  offlineData = []

  @State
  isOnline = navigator.onLine

  @State
  pendingSync = []

  @Action
  addOfflineAction(action) {
    this.pendingSync.push({
      ...action,
      timestamp: Date.now(),
      id: generateId()
    })
  }

  @Action
  async syncWhenOnline() {
    if (this.isOnline && this.pendingSync.length > 0) {
      try {
        await this.syncTransport.batchSync(this.pendingSync)
        this.pendingSync = []
      } catch (error) {
        console.error('同步失败:', error)
      }
    }
  }

  @Action
  handleOnlineStatusChange(isOnline) {
    this.isOnline = isOnline
    if (isOnline) {
      this.syncWhenOnline()
    }
  }
}
```

## 🔐 安全考虑

### 权限控制

```typescript
export class SecureSyncStore extends BaseStore {
  @State
  @Sync({
    auth: true,
    permissions: ['read', 'write'],
    validate: (data, user) => {
      return user.hasPermission('sync_data')
    }
  })
  secureData = {}

  @Action
  @RequirePermission('admin')
  updateSecureData(data) {
    this.secureData = { ...this.secureData, ...data }
  }
}
```

### 数据加密

```typescript
export class EncryptedSyncStore extends BaseStore {
  @State
  @Sync({
    encryption: {
      algorithm: 'AES-256-GCM',
      key: () => getUserEncryptionKey()
    }
  })
  sensitiveData = {}

  @Action
  updateSensitiveData(data) {
    // 数据会自动加密后同步
    this.sensitiveData = data
  }
}
```

## 🎯 最佳实践

### 1. 选择性同步

只同步必要的状态，避免同步大量数据：

```typescript
// ✅ 好的做法
export class OptimizedStore extends BaseStore {
  @State
  @Sync
  criticalData = {} // 只同步关键数据

  @State
  localCache = {} // 本地缓存不同步
}
```

### 2. 合理使用防抖

对于频繁变化的状态使用防抖：

```typescript
@State
@Sync({ debounce: 500 })
frequentlyChangingData = {}
```

### 3. 错误处理

实现完善的错误处理机制：

```typescript
@Action
async handleSyncError(error) {
  console.error('同步错误:', error)
  
  // 根据错误类型采取不同策略
  switch (error.type) {
    case 'network':
      this.scheduleRetry()
      break
    case 'conflict':
      this.handleConflict(error.conflict)
      break
    case 'auth':
      this.refreshAuth()
      break
  }
}
```

## 🚀 下一步

- 查看[性能优化](./performance.md)了解同步性能优化
- 阅读[最佳实践](./best-practices.md)获取更多建议
- 查看[API 文档](/api/)了解详细的 API 参考
