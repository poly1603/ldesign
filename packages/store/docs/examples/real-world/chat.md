# 聊天应用示例

本示例展示如何使用 @ldesign/store 构建一个实时聊天应用，包括消息管理、用户状态、实时通信等功能。

## 🎯 功能特性

- 实时消息收发
- 用户在线状态
- 消息历史记录
- 文件上传分享
- 消息状态（已读/未读）
- 群组聊天支持

## 📁 项目结构

```
src/
├── stores/
│   ├── ChatStore.ts          # 聊天主 Store
│   ├── MessageStore.ts       # 消息管理
│   ├── UserStore.ts          # 用户状态
│   └── ConnectionStore.ts    # 连接管理
├── components/
│   ├── ChatRoom.vue          # 聊天室组件
│   ├── MessageList.vue       # 消息列表
│   ├── MessageInput.vue      # 消息输入
│   └── UserList.vue          # 用户列表
└── utils/
    ├── websocket.ts          # WebSocket 工具
    └── message.ts            # 消息处理工具
```

## 🏪 Store 实现

### 聊天主 Store

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'
import { MessageStore } from './MessageStore'
import { UserStore } from './UserStore'
import { ConnectionStore } from './ConnectionStore'

export class ChatStore extends BaseStore {
  @State
  currentRoom = null

  @State
  rooms = []

  @State
  activeUsers = []

  // 注入其他 Store
  messageStore = new MessageStore()
  userStore = new UserStore()
  connectionStore = new ConnectionStore()

  @Getter
  get currentMessages() {
    return this.messageStore.getMessagesByRoom(this.currentRoom?.id)
  }

  @Getter
  get unreadCount() {
    return this.messageStore.getUnreadCount()
  }

  @Action
  async joinRoom(roomId) {
    try {
      // 离开当前房间
      if (this.currentRoom) {
        await this.leaveRoom(this.currentRoom.id)
      }

      // 加入新房间
      const room = await api.joinRoom(roomId)
      this.currentRoom = room

      // 建立 WebSocket 连接
      await this.connectionStore.connect(roomId)

      // 加载历史消息
      await this.messageStore.loadMessages(roomId)

      // 标记消息为已读
      await this.messageStore.markAsRead(roomId)

    } catch (error) {
      console.error('加入房间失败:', error)
      throw error
    }
  }

  @Action
  async leaveRoom(roomId) {
    if (this.currentRoom?.id === roomId) {
      this.currentRoom = null
      await this.connectionStore.disconnect()
    }
  }

  @Action
  async sendMessage(content, type = 'text') {
    if (!this.currentRoom) return

    const message = {
      id: Date.now().toString(),
      roomId: this.currentRoom.id,
      userId: this.userStore.currentUser.id,
      content,
      type,
      timestamp: Date.now(),
      status: 'sending'
    }

    // 乐观更新
    this.messageStore.addMessage(message)

    try {
      // 发送到服务器
      const sentMessage = await this.connectionStore.sendMessage(message)
      
      // 更新消息状态
      this.messageStore.updateMessage(message.id, {
        ...sentMessage,
        status: 'sent'
      })

    } catch (error) {
      // 发送失败，标记错误状态
      this.messageStore.updateMessage(message.id, {
        status: 'failed'
      })
      throw error
    }
  }

  @Action
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('roomId', this.currentRoom.id)

    try {
      const response = await api.uploadFile(formData)
      
      await this.sendMessage(response.url, 'file')
      
      return response
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  }

  @Action
  updateActiveUsers(users) {
    this.activeUsers = users
  }
}
```

### 消息管理 Store

```typescript
export class MessageStore extends BaseStore {
  @State
  @Persist({ key: 'chat-messages' })
  messages = []

  @State
  @Persist({ key: 'message-status' })
  readStatus = {} // { roomId: lastReadMessageId }

  @Getter
  getMessagesByRoom() {
    return (roomId) => {
      return this.messages
        .filter(msg => msg.roomId === roomId)
        .sort((a, b) => a.timestamp - b.timestamp)
    }
  }

  @Getter
  getUnreadCount() {
    const counts = {}
    
    this.messages.forEach(msg => {
      const lastRead = this.readStatus[msg.roomId]
      if (!lastRead || msg.id > lastRead) {
        counts[msg.roomId] = (counts[msg.roomId] || 0) + 1
      }
    })
    
    return counts
  }

  @Action
  async loadMessages(roomId, limit = 50) {
    try {
      const messages = await api.getMessages(roomId, { limit })
      
      // 合并消息，避免重复
      const existingIds = new Set(this.messages.map(m => m.id))
      const newMessages = messages.filter(m => !existingIds.has(m.id))
      
      this.messages.push(...newMessages)
      
    } catch (error) {
      console.error('加载消息失败:', error)
      throw error
    }
  }

  @Action
  addMessage(message) {
    // 检查是否已存在
    const exists = this.messages.find(m => m.id === message.id)
    if (!exists) {
      this.messages.push(message)
    }
  }

  @Action
  updateMessage(messageId, updates) {
    const index = this.messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      this.messages[index] = { ...this.messages[index], ...updates }
    }
  }

  @Action
  markAsRead(roomId) {
    const roomMessages = this.getMessagesByRoom(roomId)
    if (roomMessages.length > 0) {
      const lastMessage = roomMessages[roomMessages.length - 1]
      this.readStatus[roomId] = lastMessage.id
    }
  }

  @Action
  @Debounce(1000)
  async syncReadStatus() {
    try {
      await api.updateReadStatus(this.readStatus)
    } catch (error) {
      console.error('同步已读状态失败:', error)
    }
  }
}
```

### 连接管理 Store

```typescript
export class ConnectionStore extends BaseStore {
  @State
  connected = false

  @State
  reconnecting = false

  @State
  connectionError = null

  private ws = null
  private reconnectTimer = null
  private heartbeatTimer = null

  @Action
  async connect(roomId) {
    if (this.ws) {
      this.ws.close()
    }

    try {
      this.ws = new WebSocket(`ws://localhost:8080/chat/${roomId}`)
      
      this.ws.onopen = () => {
        this.connected = true
        this.reconnecting = false
        this.connectionError = null
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data))
      }

      this.ws.onclose = () => {
        this.connected = false
        this.stopHeartbeat()
        this.scheduleReconnect(roomId)
      }

      this.ws.onerror = (error) => {
        this.connectionError = error.message
      }

    } catch (error) {
      this.connectionError = error.message
      throw error
    }
  }

  @Action
  async disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.clearTimers()
    this.connected = false
    this.reconnecting = false
  }

  @Action
  async sendMessage(message) {
    if (!this.connected || !this.ws) {
      throw new Error('连接未建立')
    }

    return new Promise((resolve, reject) => {
      const messageWithId = { ...message, id: Date.now().toString() }
      
      this.ws.send(JSON.stringify({
        type: 'message',
        data: messageWithId
      }))

      // 简化处理，实际应该等待服务器确认
      setTimeout(() => resolve(messageWithId), 100)
    })
  }

  @Action
  private handleMessage(data) {
    const chatStore = useChatStore()
    const messageStore = chatStore.messageStore

    switch (data.type) {
      case 'message':
        messageStore.addMessage(data.message)
        break
        
      case 'user_joined':
        chatStore.updateActiveUsers(data.users)
        break
        
      case 'user_left':
        chatStore.updateActiveUsers(data.users)
        break
        
      case 'typing':
        // 处理打字状态
        break
    }
  }

  @Action
  private scheduleReconnect(roomId) {
    if (this.reconnectTimer) return

    this.reconnecting = true
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(roomId)
      this.reconnectTimer = null
    }, 3000)
  }

  @Action
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.connected) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  @Action
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  @Action
  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.stopHeartbeat()
  }
}
```

## 🎨 Vue 组件

### 聊天室组件

```vue
<template>
  <div class="chat-room">
    <div class="chat-header">
      <h3>{{ currentRoom?.name }}</h3>
      <div class="connection-status">
        <span :class="connectionClass">
          {{ connectionStatus }}
        </span>
      </div>
    </div>

    <div class="chat-content">
      <MessageList 
        :messages="currentMessages"
        @load-more="loadMoreMessages"
      />
      
      <MessageInput 
        @send="sendMessage"
        @upload="uploadFile"
        :disabled="!connected"
      />
    </div>

    <UserList 
      :users="activeUsers"
      class="user-sidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/ChatStore'

const chatStore = useChatStore()

const currentRoom = computed(() => chatStore.currentRoom)
const currentMessages = computed(() => chatStore.currentMessages)
const activeUsers = computed(() => chatStore.activeUsers)
const connected = computed(() => chatStore.connectionStore.connected)
const reconnecting = computed(() => chatStore.connectionStore.reconnecting)

const connectionStatus = computed(() => {
  if (reconnecting.value) return '重连中...'
  if (connected.value) return '已连接'
  return '未连接'
})

const connectionClass = computed(() => ({
  'status-connected': connected.value,
  'status-reconnecting': reconnecting.value,
  'status-disconnected': !connected.value && !reconnecting.value
}))

const sendMessage = async (content: string) => {
  try {
    await chatStore.sendMessage(content)
  } catch (error) {
    // 显示错误提示
    console.error('发送消息失败:', error)
  }
}

const uploadFile = async (file: File) => {
  try {
    await chatStore.uploadFile(file)
  } catch (error) {
    console.error('文件上传失败:', error)
  }
}

const loadMoreMessages = async () => {
  if (currentRoom.value) {
    await chatStore.messageStore.loadMessages(currentRoom.value.id)
  }
}
</script>

<style scoped>
.chat-room {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.connection-status {
  font-size: 0.875rem;
}

.status-connected {
  color: #4caf50;
}

.status-reconnecting {
  color: #ff9800;
}

.status-disconnected {
  color: #f44336;
}

.user-sidebar {
  width: 200px;
  background: white;
  border-left: 1px solid #e0e0e0;
}
</style>
```

## 🚀 使用方式

### 1. 初始化聊天

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useChatStore } from '@/stores/ChatStore'

const app = createApp(App)
app.use(createPinia())

// 初始化聊天 Store
const chatStore = useChatStore()

// 加入默认房间
chatStore.joinRoom('general')
```

### 2. 在组件中使用

```vue
<script setup>
import { useChatStore } from '@/stores/ChatStore'

const chatStore = useChatStore()

// 发送消息
const sendMessage = (content) => {
  chatStore.sendMessage(content)
}

// 切换房间
const switchRoom = (roomId) => {
  chatStore.joinRoom(roomId)
}
</script>
```

## 📱 移动端适配

```vue
<template>
  <div class="mobile-chat" :class="{ 'sidebar-open': sidebarOpen }">
    <!-- 移动端布局 -->
  </div>
</template>

<style>
@media (max-width: 768px) {
  .chat-room {
    flex-direction: column;
  }
  
  .user-sidebar {
    position: fixed;
    top: 0;
    right: -200px;
    height: 100vh;
    transition: right 0.3s ease;
  }
  
  .sidebar-open .user-sidebar {
    right: 0;
  }
}
</style>
```

## 🎯 特性说明

### 实时通信
- WebSocket 连接管理
- 自动重连机制
- 心跳检测

### 消息管理
- 消息持久化
- 已读状态同步
- 乐观更新

### 用户体验
- 连接状态显示
- 发送状态反馈
- 离线消息缓存

### 性能优化
- 消息分页加载
- 防抖处理
- 内存管理

这个聊天应用示例展示了如何使用 @ldesign/store 构建复杂的实时应用，包含了状态管理、实时通信、数据持久化等多个方面的最佳实践。
