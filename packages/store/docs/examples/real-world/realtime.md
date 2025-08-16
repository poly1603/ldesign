# 实时数据同步系统

本示例展示了如何使用 @ldesign/store 构建一个完整的实时数据同步系统，包括 WebSocket 连接管理、消息处
理、数据冲突解决和离线同步等功能。

## 系统架构

### 实时同步架构

```
客户端                    服务端
   ↓                        ↓
WebSocket ←→ 消息队列 ←→ 数据库
   ↓                        ↓
本地存储 ←→ 冲突解决 ←→ 状态同步
```

### Store 架构

```
RealtimeSystem
├── WebSocketStore         # WebSocket 连接管理
├── MessageQueueStore      # 消息队列处理
├── SyncStore              # 数据同步管理
├── ConflictResolverStore  # 冲突解决
├── OfflineStore           # 离线数据管理
├── PresenceStore          # 在线状态管理
└── NotificationStore      # 实时通知
```

## 核心数据模型

### 类型定义

```typescript
// types/realtime.ts
export interface WebSocketMessage {
  id: string
  type: 'sync' | 'presence' | 'notification' | 'heartbeat'
  action: string
  payload: any
  timestamp: number
  userId?: string
  sessionId?: string
}

export interface SyncOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  resourceId: string
  data: any
  version: number
  timestamp: number
  userId: string
  clientId: string
}

export interface ConflictResolution {
  operationId: string
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual'
  resolvedData: any
  timestamp: number
}

export interface PresenceInfo {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  metadata: Record<string, any>
}

export interface OfflineOperation {
  id: string
  operation: SyncOperation
  retryCount: number
  maxRetries: number
  nextRetry: Date
  status: 'pending' | 'failed' | 'synced'
}
```

## Store 实现

### 1. WebSocket 连接管理 Store

```typescript
// stores/websocket.ts
import { Action, AsyncAction, BaseStore, Getter, State } from '@ldesign/store'

export class WebSocketStore extends BaseStore {
  @State({ default: null })
  connection: WebSocket | null = null

  @State({ default: 'disconnected' })
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' = 'disconnected'

  @State({ default: 0 })
  reconnectAttempts: number = 0

  @State({ default: 5 })
  maxReconnectAttempts: number = 5

  @State({ default: 1000 })
  reconnectDelay: number = 1000

  @State({ default: null })
  lastError: string | null = null

  @State({ default: new Date() })
  lastHeartbeat: Date = new Date()

  @State({ default: 30000 })
  heartbeatInterval: number = 30000

  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null

  @AsyncAction()
  async connect(url: string, protocols?: string[]) {
    if (this.connection?.readyState === WebSocket.OPEN) {
      return
    }

    this.connectionState = 'connecting'
    this.lastError = null

    try {
      this.connection = new WebSocket(url, protocols)
      this.setupEventHandlers()

      // 等待连接建立
      await new Promise((resolve, reject) => {
        this.connection!.onopen = () => {
          this.connectionState = 'connected'
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve(void 0)
        }

        this.connection!.onerror = error => {
          this.lastError = '连接失败'
          reject(error)
        }
      })
    } catch (error) {
      this.connectionState = 'disconnected'
      this.lastError = error instanceof Error ? error.message : '连接失败'
      throw error
    }
  }

  @Action()
  disconnect() {
    this.stopHeartbeat()
    this.stopReconnect()

    if (this.connection) {
      this.connection.close()
      this.connection = null
    }

    this.connectionState = 'disconnected'
    this.reconnectAttempts = 0
  }

  @Action()
  send(message: WebSocketMessage) {
    if (this.connectionState !== 'connected' || !this.connection) {
      throw new Error('WebSocket 未连接')
    }

    try {
      this.connection.send(JSON.stringify(message))
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return

    this.connection.onmessage = event => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    }

    this.connection.onclose = event => {
      this.connectionState = 'disconnected'
      this.stopHeartbeat()

      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect()
      }
    }

    this.connection.onerror = error => {
      this.lastError = '连接错误'
      console.error('WebSocket 错误:', error)
    }
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'heartbeat':
        this.lastHeartbeat = new Date()
        break
      case 'sync':
        this.handleSyncMessage(message)
        break
      case 'presence':
        this.handlePresenceMessage(message)
        break
      case 'notification':
        this.handleNotificationMessage(message)
        break
    }
  }

  private handleSyncMessage(message: WebSocketMessage) {
    const syncStore = new SyncStore('sync')
    syncStore.handleRemoteOperation(message.payload)
  }

  private handlePresenceMessage(message: WebSocketMessage) {
    const presenceStore = new PresenceStore('presence')
    presenceStore.updatePresence(message.payload)
  }

  private handleNotificationMessage(message: WebSocketMessage) {
    const notificationStore = new NotificationStore('notification')
    notificationStore.addNotification(message.payload)
  }

  private startHeartbeat() {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState === 'connected') {
        this.send({
          id: generateId(),
          type: 'heartbeat',
          action: 'ping',
          payload: {},
          timestamp: Date.now(),
        })
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect() {
    this.stopReconnect()
    this.connectionState = 'reconnecting'
    this.reconnectAttempts++

    const delay = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1)

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(this.connection?.url || '')
      } catch (error) {
        console.error('重连失败:', error)
      }
    }, delay)
  }

  private stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  @Getter()
  get isConnected() {
    return this.connectionState === 'connected'
  }

  @Getter()
  get isConnecting() {
    return this.connectionState === 'connecting' || this.connectionState === 'reconnecting'
  }

  @Getter()
  get connectionStatus() {
    return {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      lastError: this.lastError,
      lastHeartbeat: this.lastHeartbeat,
    }
  }
}
```

### 2. 数据同步管理 Store

```typescript
// stores/sync.ts
import { Action, AsyncAction, BaseStore, CachedGetter, Getter, State } from '@ldesign/store'

export class SyncStore extends BaseStore {
  @State({ default: new Map() })
  localOperations: Map<string, SyncOperation> = new Map()

  @State({ default: new Map() })
  remoteOperations: Map<string, SyncOperation> = new Map()

  @State({ default: new Map() })
  resourceVersions: Map<string, number> = new Map()

  @State({ default: [] })
  pendingOperations: SyncOperation[] = []

  @State({ default: [] })
  conflictedOperations: SyncOperation[] = []

  @State({ default: false })
  syncing: boolean = false

  @State({ default: new Date() })
  lastSyncTime: Date = new Date()

  @Action()
  createLocalOperation(
    type: SyncOperation['type'],
    resource: string,
    resourceId: string,
    data: any
  ): SyncOperation {
    const operation: SyncOperation = {
      id: generateId(),
      type,
      resource,
      resourceId,
      data,
      version: this.getNextVersion(resourceId),
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      clientId: this.getClientId(),
    }

    this.localOperations.set(operation.id, operation)
    this.pendingOperations.push(operation)

    // 立即应用本地操作
    this.applyLocalOperation(operation)

    // 尝试同步到服务器
    this.syncToServer(operation)

    return operation
  }

  @Action()
  handleRemoteOperation(operation: SyncOperation) {
    this.remoteOperations.set(operation.id, operation)

    // 检查是否有冲突
    const conflict = this.detectConflict(operation)
    if (conflict) {
      this.conflictedOperations.push(operation)
      this.resolveConflict(operation, conflict)
    } else {
      this.applyRemoteOperation(operation)
    }
  }

  @AsyncAction()
  async syncToServer(operation: SyncOperation) {
    const wsStore = new WebSocketStore('websocket')

    if (!wsStore.isConnected) {
      // 如果未连接，添加到离线队列
      const offlineStore = new OfflineStore('offline')
      offlineStore.addOperation(operation)
      return
    }

    try {
      wsStore.send({
        id: generateId(),
        type: 'sync',
        action: 'operation',
        payload: operation,
        timestamp: Date.now(),
      })

      // 从待同步队列中移除
      const index = this.pendingOperations.findIndex(op => op.id === operation.id)
      if (index > -1) {
        this.pendingOperations.splice(index, 1)
      }
    } catch (error) {
      console.error('同步操作失败:', error)

      // 添加到离线队列
      const offlineStore = new OfflineStore('offline')
      offlineStore.addOperation(operation)
    }
  }

  @AsyncAction()
  async syncPendingOperations() {
    if (this.syncing || this.pendingOperations.length === 0) return

    this.syncing = true

    try {
      for (const operation of this.pendingOperations) {
        await this.syncToServer(operation)
      }
      this.lastSyncTime = new Date()
    } catch (error) {
      console.error('批量同步失败:', error)
    } finally {
      this.syncing = false
    }
  }

  private applyLocalOperation(operation: SyncOperation) {
    // 更新本地数据
    this.updateLocalData(operation)

    // 更新版本号
    this.resourceVersions.set(operation.resourceId, operation.version)
  }

  private applyRemoteOperation(operation: SyncOperation) {
    // 检查版本号
    const currentVersion = this.resourceVersions.get(operation.resourceId) || 0
    if (operation.version <= currentVersion) {
      return // 忽略旧版本
    }

    // 应用远程操作
    this.updateLocalData(operation)

    // 更新版本号
    this.resourceVersions.set(operation.resourceId, operation.version)
  }

  private updateLocalData(operation: SyncOperation) {
    // 根据操作类型更新本地数据
    const resourceStore = this.getResourceStore(operation.resource)

    switch (operation.type) {
      case 'create':
        resourceStore.addItem(operation.data)
        break
      case 'update':
        resourceStore.updateItem(operation.resourceId, operation.data)
        break
      case 'delete':
        resourceStore.removeItem(operation.resourceId)
        break
    }
  }

  private detectConflict(remoteOperation: SyncOperation): SyncOperation | null {
    // 查找同一资源的本地操作
    for (const [_, localOperation] of this.localOperations) {
      if (
        localOperation.resourceId === remoteOperation.resourceId &&
        localOperation.timestamp > remoteOperation.timestamp &&
        !this.isOperationSynced(localOperation)
      ) {
        return localOperation
      }
    }
    return null
  }

  private async resolveConflict(remoteOperation: SyncOperation, localOperation: SyncOperation) {
    const conflictResolver = new ConflictResolverStore('conflict')

    const resolution = await conflictResolver.resolveConflict({
      remote: remoteOperation,
      local: localOperation,
      strategy: 'merge', // 默认合并策略
    })

    // 应用解决方案
    this.applyConflictResolution(resolution)
  }

  private applyConflictResolution(resolution: ConflictResolution) {
    // 根据解决方案更新数据
    const operation = this.localOperations.get(resolution.operationId)
    if (operation) {
      operation.data = resolution.resolvedData
      this.applyLocalOperation(operation)
    }

    // 从冲突列表中移除
    const index = this.conflictedOperations.findIndex(op => op.id === resolution.operationId)
    if (index > -1) {
      this.conflictedOperations.splice(index, 1)
    }
  }

  private getNextVersion(resourceId: string): number {
    const currentVersion = this.resourceVersions.get(resourceId) || 0
    return currentVersion + 1
  }

  private getCurrentUserId(): string {
    // 从认证 Store 获取当前用户 ID
    const authStore = new AuthStore('auth')
    return authStore.currentUser?.id || 'anonymous'
  }

  private getClientId(): string {
    // 生成或获取客户端 ID
    let clientId = localStorage.getItem('clientId')
    if (!clientId) {
      clientId = generateId()
      localStorage.setItem('clientId', clientId)
    }
    return clientId
  }

  private isOperationSynced(operation: SyncOperation): boolean {
    return !this.pendingOperations.some(op => op.id === operation.id)
  }

  private getResourceStore(resource: string): any {
    // 根据资源类型返回对应的 Store
    const storeMap = {
      user: () => new UserStore('user'),
      product: () => new ProductStore('product'),
      order: () => new OrderStore('order'),
    }

    const storeFactory = storeMap[resource]
    if (!storeFactory) {
      throw new Error(`未知的资源类型: ${resource}`)
    }

    return storeFactory()
  }

  @Getter()
  get syncStatus() {
    return {
      syncing: this.syncing,
      pendingCount: this.pendingOperations.length,
      conflictCount: this.conflictedOperations.length,
      lastSyncTime: this.lastSyncTime,
    }
  }

  @CachedGetter(['pendingOperations'])
  get operationsByResource() {
    return this.pendingOperations.reduce((acc, operation) => {
      if (!acc[operation.resource]) {
        acc[operation.resource] = []
      }
      acc[operation.resource].push(operation)
      return acc
    }, {} as Record<string, SyncOperation[]>)
  }

  @Getter()
  get hasConflicts() {
    return this.conflictedOperations.length > 0
  }

  @Getter()
  get hasPendingOperations() {
    return this.pendingOperations.length > 0
  }
}
```

### 3. 冲突解决 Store

```typescript
// stores/conflict-resolver.ts
import { Action, AsyncAction, BaseStore, Getter, State } from '@ldesign/store'

interface ConflictContext {
  remote: SyncOperation
  local: SyncOperation
  strategy: 'client_wins' | 'server_wins' | 'merge' | 'manual'
}

export class ConflictResolverStore extends BaseStore {
  @State({ default: [] })
  activeConflicts: ConflictContext[] = []

  @State({ default: [] })
  resolutionHistory: ConflictResolution[] = []

  @AsyncAction()
  async resolveConflict(context: ConflictContext): Promise<ConflictResolution> {
    this.activeConflicts.push(context)

    let resolvedData: any

    switch (context.strategy) {
      case 'client_wins':
        resolvedData = context.local.data
        break
      case 'server_wins':
        resolvedData = context.remote.data
        break
      case 'merge':
        resolvedData = await this.mergeOperations(context.local, context.remote)
        break
      case 'manual':
        resolvedData = await this.requestManualResolution(context)
        break
    }

    const resolution: ConflictResolution = {
      operationId: context.local.id,
      strategy: context.strategy,
      resolvedData,
      timestamp: Date.now(),
    }

    this.resolutionHistory.push(resolution)

    // 从活跃冲突中移除
    const index = this.activeConflicts.findIndex(
      c => c.local.id === context.local.id && c.remote.id === context.remote.id
    )
    if (index > -1) {
      this.activeConflicts.splice(index, 1)
    }

    return resolution
  }

  private async mergeOperations(local: SyncOperation, remote: SyncOperation): Promise<any> {
    // 实现三路合并算法
    const baseData = await this.getBaseVersion(local.resourceId)

    return this.threeWayMerge(baseData, local.data, remote.data)
  }

  private threeWayMerge(base: any, local: any, remote: any): any {
    const merged = { ...base }

    // 简化的合并逻辑
    for (const key in local) {
      if (local[key] !== base[key]) {
        merged[key] = local[key]
      }
    }

    for (const key in remote) {
      if (remote[key] !== base[key]) {
        if (merged[key] === base[key]) {
          merged[key] = remote[key]
        } else {
          // 冲突：本地和远程都修改了同一字段
          merged[key] = this.resolveFieldConflict(key, local[key], remote[key])
        }
      }
    }

    return merged
  }

  private resolveFieldConflict(field: string, localValue: any, remoteValue: any): any {
    // 字段级冲突解决策略
    if (typeof localValue === 'string' && typeof remoteValue === 'string') {
      // 字符串合并
      return `${localValue} | ${remoteValue}`
    }

    if (typeof localValue === 'number' && typeof remoteValue === 'number') {
      // 数值取最大值
      return Math.max(localValue, remoteValue)
    }

    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      // 数组合并去重
      return [...new Set([...localValue, ...remoteValue])]
    }

    // 默认使用远程值
    return remoteValue
  }

  private async getBaseVersion(resourceId: string): Promise<any> {
    // 获取资源的基础版本（最后一次同步的版本）
    try {
      const response = await api.getResourceVersion(resourceId)
      return response.data
    } catch (error) {
      console.error('获取基础版本失败:', error)
      return {}
    }
  }

  private async requestManualResolution(context: ConflictContext): Promise<any> {
    // 触发手动解决界面
    return new Promise(resolve => {
      // 这里可以触发一个模态框或页面让用户手动解决冲突
      const event = new CustomEvent('conflict-resolution-required', {
        detail: { context, resolve },
      })
      window.dispatchEvent(event)
    })
  }

  @Action()
  setConflictStrategy(strategy: ConflictContext['strategy']) {
    // 设置默认冲突解决策略
    this.defaultStrategy = strategy
  }

  @Getter()
  get hasActiveConflicts() {
    return this.activeConflicts.length > 0
  }

  @Getter()
  get conflictCount() {
    return this.activeConflicts.length
  }

  @Getter()
  get resolutionStats() {
    const stats = {
      total: this.resolutionHistory.length,
      byStrategy: {} as Record<string, number>,
    }

    this.resolutionHistory.forEach(resolution => {
      stats.byStrategy[resolution.strategy] = (stats.byStrategy[resolution.strategy] || 0) + 1
    })

    return stats
  }
}
```

## Vue 组件集成

### 实时同步状态组件

```vue
<!-- components/SyncStatus.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { SyncStore } from '@/stores/sync'
import { WebSocketStore } from '@/stores/websocket'

const wsStore = new WebSocketStore('websocket')
const syncStore = new SyncStore('sync')

const statusClass = computed(() => ({
  'status-connected': wsStore.isConnected,
  'status-connecting': wsStore.isConnecting,
  'status-disconnected': !wsStore.isConnected && !wsStore.isConnecting,
  'has-conflicts': syncStore.hasConflicts,
}))

const statusIcon = computed(() => {
  if (wsStore.isConnected) return 'check-circle'
  if (wsStore.isConnecting) return 'loading'
  return 'x-circle'
})

const iconClass = computed(() => ({
  'text-green-500': wsStore.isConnected,
  'text-yellow-500 animate-spin': wsStore.isConnecting,
  'text-red-500': !wsStore.isConnected && !wsStore.isConnecting,
}))

const statusText = computed(() => {
  if (wsStore.isConnected) return '已连接'
  if (wsStore.isConnecting) return '连接中...'
  return '已断开'
})

async function reconnect() {
  try {
    await wsStore.connect(process.env.VUE_APP_WS_URL)
  } catch (error) {
    console.error('重连失败:', error)
  }
}
</script>

<template>
  <div class="sync-status" :class="statusClass">
    <div class="status-indicator">
      <Icon :name="statusIcon" :class="iconClass" />
      <span class="status-text">{{ statusText }}</span>
    </div>

    <div v-if="syncStore.hasPendingOperations" class="pending-info">
      <span class="pending-count">{{ syncStore.syncStatus.pendingCount }}</span>
      <span class="pending-text">待同步</span>
    </div>

    <div v-if="syncStore.hasConflicts" class="conflict-info">
      <Icon name="warning" class="text-yellow-500" />
      <span class="conflict-count">{{ syncStore.syncStatus.conflictCount }}</span>
      <span class="conflict-text">冲突</span>
    </div>

    <button v-if="!wsStore.isConnected" class="reconnect-btn" @click="reconnect">重新连接</button>
  </div>
</template>

<style scoped>
.sync-status {
  @apply flex items-center space-x-2 px-3 py-2 rounded-lg border;
}

.status-connected {
  @apply bg-green-50 border-green-200;
}

.status-connecting {
  @apply bg-yellow-50 border-yellow-200;
}

.status-disconnected {
  @apply bg-red-50 border-red-200;
}

.has-conflicts {
  @apply border-yellow-400;
}

.status-indicator {
  @apply flex items-center space-x-1;
}

.pending-info,
.conflict-info {
  @apply flex items-center space-x-1 text-sm;
}

.reconnect-btn {
  @apply px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600;
}
</style>
```

### 冲突解决组件

```vue
<!-- components/ConflictResolver.vue -->
<script setup lang="ts">
import { ConflictResolverStore } from '@/stores/conflict-resolver'

const conflictStore = new ConflictResolverStore('conflict')

function getResourceName(resource: string) {
  const nameMap = {
    user: '用户',
    product: '商品',
    order: '订单',
  }
  return nameMap[resource] || resource
}

function formatData(data: any) {
  return JSON.stringify(data, null, 2)
}

async function resolveConflict(conflict: any, strategy: string) {
  try {
    await conflictStore.resolveConflict({
      ...conflict,
      strategy,
    })
  } catch (error) {
    console.error('解决冲突失败:', error)
  }
}
</script>

<template>
  <div v-if="conflictStore.hasActiveConflicts" class="conflict-resolver">
    <div class="conflict-header">
      <Icon name="warning" class="text-yellow-500" />
      <h3>数据冲突</h3>
      <span class="conflict-count">{{ conflictStore.conflictCount }}</span>
    </div>

    <div class="conflict-list">
      <div
        v-for="conflict in conflictStore.activeConflicts"
        :key="`${conflict.local.id}-${conflict.remote.id}`"
        class="conflict-item"
      >
        <div class="conflict-info">
          <h4>{{ getResourceName(conflict.local.resource) }}</h4>
          <p class="text-sm text-gray-600">ID: {{ conflict.local.resourceId }}</p>
        </div>

        <div class="conflict-options">
          <div class="option-group">
            <h5>本地版本</h5>
            <pre class="data-preview">{{ formatData(conflict.local.data) }}</pre>
            <button @click="resolveConflict(conflict, 'client_wins')">使用本地版本</button>
          </div>

          <div class="option-group">
            <h5>服务器版本</h5>
            <pre class="data-preview">{{ formatData(conflict.remote.data) }}</pre>
            <button @click="resolveConflict(conflict, 'server_wins')">使用服务器版本</button>
          </div>

          <div class="option-group">
            <h5>自动合并</h5>
            <button @click="resolveConflict(conflict, 'merge')">尝试自动合并</button>
          </div>

          <div class="option-group">
            <h5>手动解决</h5>
            <button @click="resolveConflict(conflict, 'manual')">手动编辑</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conflict-resolver {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.conflict-header {
  @apply flex items-center space-x-2 mb-4;
}

.conflict-list {
  @apply space-y-4 max-h-96 overflow-y-auto;
}

.conflict-item {
  @apply bg-white rounded-lg p-4 shadow-lg;
}

.conflict-options {
  @apply grid grid-cols-2 gap-4 mt-4;
}

.option-group {
  @apply border rounded p-3;
}

.data-preview {
  @apply bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto;
}
</style>
```

## 最佳实践

### 1. 连接管理

```typescript
// 连接状态监控
export class ConnectionMonitor {
  private wsStore: WebSocketStore
  private syncStore: SyncStore

  constructor() {
    this.wsStore = new WebSocketStore('websocket')
    this.syncStore = new SyncStore('sync')
    this.setupMonitoring()
  }

  private setupMonitoring() {
    // 监听网络状态
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // 监听页面可见性
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  private async handleOnline() {
    if (!this.wsStore.isConnected) {
      await this.wsStore.connect(process.env.VUE_APP_WS_URL)
      await this.syncStore.syncPendingOperations()
    }
  }

  private handleOffline() {
    // 网络断开时的处理
    console.log('网络已断开，切换到离线模式')
  }

  private async handleVisibilityChange() {
    if (document.visibilityState === 'visible' && !this.wsStore.isConnected) {
      // 页面重新可见时尝试重连
      await this.wsStore.connect(process.env.VUE_APP_WS_URL)
    }
  }
}
```

### 2. 性能优化

```typescript
// 批量操作优化
export class BatchOperationManager {
  private operations: SyncOperation[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private batchSize = 10
  private batchDelay = 1000

  addOperation(operation: SyncOperation) {
    this.operations.push(operation)
    this.scheduleBatch()
  }

  private scheduleBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch()
    }, this.batchDelay)
  }

  private async processBatch() {
    if (this.operations.length === 0) return

    const batch = this.operations.splice(0, this.batchSize)
    const syncStore = new SyncStore('sync')

    try {
      await syncStore.syncBatchOperations(batch)
    } catch (error) {
      console.error('批量同步失败:', error)
      // 重新加入队列
      this.operations.unshift(...batch)
    }

    // 如果还有操作，继续处理
    if (this.operations.length > 0) {
      this.scheduleBatch()
    }
  }
}
```

### 3. 数据一致性保证

```typescript
// 数据版本管理
export class DataVersionManager {
  private versions = new Map<string, number>()

  getVersion(resourceId: string): number {
    return this.versions.get(resourceId) || 0
  }

  setVersion(resourceId: string, version: number) {
    this.versions.set(resourceId, version)
  }

  isNewer(resourceId: string, version: number): boolean {
    return version > this.getVersion(resourceId)
  }

  validateOperation(operation: SyncOperation): boolean {
    const currentVersion = this.getVersion(operation.resourceId)

    // 检查版本号是否连续
    if (operation.version !== currentVersion + 1) {
      console.warn('版本号不连续，可能存在数据丢失')
      return false
    }

    return true
  }
}
```

## 总结

这个实时数据同步系统示例展示了：

1. **WebSocket 连接管理**：自动重连、心跳检测、错误处理
2. **数据同步机制**：本地优先、服务器同步、冲突检测
3. **冲突解决策略**：多种解决方案、三路合并算法
4. **离线支持**：离线操作队列、网络恢复同步
5. **性能优化**：批量操作、版本管理、缓存策略

通过这种架构，你可以构建出可靠、高效的实时数据同步应用。
