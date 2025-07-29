# 通知系统

引擎提供了灵活的通知系统，支持多种通知类型、自定义样式和交互功能。

## 基本概念

通知系统提供了统一的API来显示各种类型的用户通知：

```typescript
interface NotificationManager {
  success(message: string, options?: NotificationOptions): string
  error(message: string, options?: NotificationOptions): string
  warning(message: string, options?: NotificationOptions): string
  info(message: string, options?: NotificationOptions): string
  show(type: NotificationType, message: string, options?: NotificationOptions): string
  dismiss(id: string): void
  dismissAll(): void
  getAll(): Notification[]
}

type NotificationType = 'success' | 'error' | 'warning' | 'info'
```

## 基本用法

### 显示通知

```typescript
import { createApp } from '@ldesign/engine'
import App from './App.vue'

const engine = createApp(App)

// 成功通知
engine.notifications.success('操作成功完成！')

// 错误通知
engine.notifications.error('操作失败，请重试')

// 警告通知
engine.notifications.warning('请注意：数据即将过期')

// 信息通知
engine.notifications.info('系统将在5分钟后维护')

// 使用通用方法
engine.notifications.show('success', '自定义成功消息')
```

### 通知选项

```typescript
// 带选项的通知
engine.notifications.success('文件上传成功', {
  duration: 5000,        // 显示时长（毫秒）
  persistent: false,     // 是否持久显示
  closable: true,        // 是否可关闭
  position: 'top-right', // 显示位置
  icon: '✅',            // 自定义图标
  className: 'custom-notification' // 自定义CSS类
})

// 持久通知（需要手动关闭）
const notificationId = engine.notifications.error('严重错误', {
  persistent: true,
  closable: true
})

// 稍后关闭通知
setTimeout(() => {
  engine.notifications.dismiss(notificationId)
}, 10000)
```

## 高级功能

### 带操作按钮的通知

```typescript
// 确认操作通知
engine.notifications.warning('确定要删除这个文件吗？', {
  persistent: true,
  actions: [
    {
      label: '确定',
      action: () => {
        deleteFile()
        engine.notifications.success('文件已删除')
      },
      style: 'danger'
    },
    {
      label: '取消',
      action: () => {
        engine.notifications.info('操作已取消')
      }
    }
  ]
})

// 撤销操作通知
let undoTimer: NodeJS.Timeout
engine.notifications.info('邮件已发送', {
  duration: 5000,
  actions: [
    {
      label: '撤销',
      action: () => {
        clearTimeout(undoTimer)
        undoEmail()
        engine.notifications.success('邮件发送已撤销')
      }
    }
  ]
})

// 5秒后自动确认发送
undoTimer = setTimeout(() => {
  confirmEmailSent()
}, 5000)
```

### 进度通知

```typescript
// 显示进度通知
const showProgressNotification = async (task: () => Promise<void>) => {
  const notificationId = engine.notifications.info('正在处理...', {
    persistent: true,
    progress: 0
  })
  
  try {
    // 模拟进度更新
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      engine.notifications.update(notificationId, {
        message: `处理中... ${i}%`,
        progress: i
      })
    }
    
    // 完成后更新通知
    engine.notifications.update(notificationId, {
      type: 'success',
      message: '处理完成！',
      duration: 3000,
      persistent: false,
      progress: undefined
    })
    
  } catch (error) {
    engine.notifications.update(notificationId, {
      type: 'error',
      message: '处理失败',
      duration: 5000,
      persistent: false,
      progress: undefined
    })
  }
}
```

### 富文本通知

```typescript
// HTML内容通知
engine.notifications.info('', {
  html: `
    <div>
      <h4>新版本可用</h4>
      <p>版本 <strong>2.1.0</strong> 已发布</p>
      <ul>
        <li>修复了若干bug</li>
        <li>新增了暗色主题</li>
        <li>提升了性能</li>
      </ul>
    </div>
  `,
  duration: 10000,
  actions: [
    {
      label: '立即更新',
      action: () => updateApp()
    },
    {
      label: '稍后提醒',
      action: () => scheduleUpdateReminder()
    }
  ]
})

// 带图片的通知
engine.notifications.success('', {
  html: `
    <div style="display: flex; align-items: center;">
      <img src="/avatar.jpg" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;">
      <div>
        <div><strong>张三</strong> 给你发送了消息</div>
        <div style="color: #666; font-size: 12px;">刚刚</div>
      </div>
    </div>
  `,
  duration: 8000
})
```

## 通知分组

### 创建通知组

```typescript
// 创建通知组
const createNotificationGroup = (groupId: string) => {
  return {
    success: (message: string, options?: NotificationOptions) => {
      return engine.notifications.success(message, {
        ...options,
        group: groupId
      })
    },
    error: (message: string, options?: NotificationOptions) => {
      return engine.notifications.error(message, {
        ...options,
        group: groupId
      })
    },
    warning: (message: string, options?: NotificationOptions) => {
      return engine.notifications.warning(message, {
        ...options,
        group: groupId
      })
    },
    info: (message: string, options?: NotificationOptions) => {
      return engine.notifications.info(message, {
        ...options,
        group: groupId
      })
    },
    dismissAll: () => {
      engine.notifications.dismissGroup(groupId)
    }
  }
}

// 使用通知组
const emailNotifications = createNotificationGroup('email')
const systemNotifications = createNotificationGroup('system')

// 邮件相关通知
emailNotifications.info('正在发送邮件...')
emailNotifications.success('邮件发送成功')

// 系统相关通知
systemNotifications.warning('系统即将重启')
systemNotifications.info('系统重启完成')

// 清除特定组的所有通知
emailNotifications.dismissAll()
```

### 通知合并

```typescript
// 合并相似通知
class NotificationMerger {
  private pendingNotifications = new Map<string, {
    count: number
    timer: NodeJS.Timeout
    lastMessage: string
  }>()
  
  merge(key: string, message: string, type: NotificationType = 'info') {
    const existing = this.pendingNotifications.get(key)
    
    if (existing) {
      // 更新计数和消息
      existing.count++
      existing.lastMessage = message
      clearTimeout(existing.timer)
    } else {
      // 创建新的合并通知
      this.pendingNotifications.set(key, {
        count: 1,
        timer: null as any,
        lastMessage: message
      })
    }
    
    // 延迟显示合并后的通知
    const notification = this.pendingNotifications.get(key)!
    notification.timer = setTimeout(() => {
      const { count, lastMessage } = notification
      
      if (count === 1) {
        engine.notifications.show(type, lastMessage)
      } else {
        engine.notifications.show(type, `${lastMessage} (${count}条消息)`)
      }
      
      this.pendingNotifications.delete(key)
    }, 1000)
  }
}

const notificationMerger = new NotificationMerger()

// 使用合并通知
for (let i = 0; i < 5; i++) {
  notificationMerger.merge('api-error', 'API调用失败', 'error')
}
// 1秒后显示："API调用失败 (5条消息)"
```

## 通知模板

### 预定义模板

```typescript
// 创建通知模板
const notificationTemplates = {
  // 用户操作模板
  userAction: (action: string, target: string) => {
    return engine.notifications.success(`${action}${target}成功`)
  },
  
  // API错误模板
  apiError: (endpoint: string, error: string) => {
    return engine.notifications.error(`API调用失败: ${endpoint}`, {
      html: `
        <div>
          <div><strong>接口:</strong> ${endpoint}</div>
          <div><strong>错误:</strong> ${error}</div>
          <div style="margin-top: 8px;">
            <button onclick="retryApiCall('${endpoint}')">重试</button>
          </div>
        </div>
      `,
      persistent: true
    })
  },
  
  // 表单验证模板
  formValidation: (errors: string[]) => {
    const errorList = errors.map(error => `<li>${error}</li>`).join('')
    return engine.notifications.warning('表单验证失败', {
      html: `
        <div>
          <div>请修正以下错误:</div>
          <ul style="margin: 8px 0; padding-left: 20px;">
            ${errorList}
          </ul>
        </div>
      `,
      duration: 8000
    })
  },
  
  // 网络状态模板
  networkStatus: (isOnline: boolean) => {
    if (isOnline) {
      return engine.notifications.success('网络连接已恢复')
    } else {
      return engine.notifications.error('网络连接已断开', {
        persistent: true,
        actions: [
          {
            label: '重试连接',
            action: () => checkNetworkConnection()
          }
        ]
      })
    }
  }
}

// 使用模板
notificationTemplates.userAction('删除', '文件')
notificationTemplates.apiError('/api/users', '服务器超时')
notificationTemplates.formValidation(['邮箱格式不正确', '密码长度不足'])
notificationTemplates.networkStatus(false)
```

## 通知持久化

### 保存重要通知

```typescript
// 持久化重要通知
class PersistentNotifications {
  private storageKey = 'app_notifications'
  
  save(notification: {
    id: string
    type: NotificationType
    message: string
    timestamp: number
    read: boolean
  }) {
    const notifications = this.getAll()
    notifications.push(notification)
    
    // 限制数量
    if (notifications.length > 100) {
      notifications.splice(0, notifications.length - 100)
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(notifications))
  }
  
  getAll() {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : []
  }
  
  markAsRead(id: string) {
    const notifications = this.getAll()
    const notification = notifications.find((n: any) => n.id === id)
    if (notification) {
      notification.read = true
      localStorage.setItem(this.storageKey, JSON.stringify(notifications))
    }
  }
  
  getUnread() {
    return this.getAll().filter((n: any) => !n.read)
  }
}

const persistentNotifications = new PersistentNotifications()

// 保存重要通知
engine.notifications.error('系统错误', {
  onShow: (notification) => {
    if (notification.type === 'error') {
      persistentNotifications.save({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        timestamp: Date.now(),
        read: false
      })
    }
  }
})
```

## 通知最佳实践

### 1. 通知时机

```typescript
// ✅ 合适的通知时机
// 用户操作完成后
engine.notifications.success('文件保存成功')

// 重要状态变化
engine.notifications.info('系统将在5分钟后维护')

// 错误发生时
engine.notifications.error('网络连接失败')

// ❌ 不合适的通知时机
// 过于频繁的通知
setInterval(() => {
  engine.notifications.info('心跳检测') // 太频繁
}, 1000)

// 不重要的信息
engine.notifications.info('鼠标移动了') // 不重要
```

### 2. 通知内容

```typescript
// ✅ 清晰的通知内容
engine.notifications.success('邮件发送成功')
engine.notifications.error('文件上传失败：文件大小超过限制')
engine.notifications.warning('密码将在3天后过期')

// ❌ 模糊的通知内容
engine.notifications.success('成功') // 太模糊
engine.notifications.error('错误') // 没有具体信息
engine.notifications.info('注意') // 没有说明什么
```

### 3. 通知管理

```typescript
// 通知管理器
class NotificationController {
  private maxNotifications = 5
  private activeNotifications: string[] = []
  
  show(type: NotificationType, message: string, options?: NotificationOptions) {
    // 限制同时显示的通知数量
    if (this.activeNotifications.length >= this.maxNotifications) {
      const oldestId = this.activeNotifications.shift()
      if (oldestId) {
        engine.notifications.dismiss(oldestId)
      }
    }
    
    const id = engine.notifications.show(type, message, {
      ...options,
      onDismiss: () => {
        this.activeNotifications = this.activeNotifications.filter(nId => nId !== id)
        options?.onDismiss?.()
      }
    })
    
    this.activeNotifications.push(id)
    return id
  }
  
  dismissAll() {
    this.activeNotifications.forEach(id => {
      engine.notifications.dismiss(id)
    })
    this.activeNotifications = []
  }
}

const notificationController = new NotificationController()
```

### 4. 无障碍支持

```typescript
// 支持屏幕阅读器
engine.notifications.success('操作成功', {
  ariaLive: 'polite', // 或 'assertive'
  role: 'status',
  ariaLabel: '成功通知：操作已完成'
})

// 键盘导航支持
engine.notifications.error('发生错误', {
  focusable: true,
  onFocus: () => {
    // 通知获得焦点时的处理
  },
  onKeyDown: (event) => {
    if (event.key === 'Escape') {
      engine.notifications.dismiss(notificationId)
    }
  }
})
```

通过通知系统，你可以为用户提供及时、清晰的反馈，提升应用的用户体验和可用性。