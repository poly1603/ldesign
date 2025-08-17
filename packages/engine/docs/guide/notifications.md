# 通知系统

引擎提供了强大而灵活的通知系统，支持多种通知类型、位置、动画效果和交互功能。

## ✨ 主要特性

- 🎯 **多位置支持**: 6 个不同位置的通知显示
- 🎨 **丰富动画**: 5 种内置动画效果，支持自定义
- 🌈 **主题系统**: 浅色、深色、自动主题切换
- ⚡ **高性能**: 基于 Web Animations API
- 🔧 **高度可定制**: 支持自定义样式、图标、操作按钮
- ♿ **无障碍支持**: 完整的键盘导航和屏幕阅读器支持
- 📱 **响应式设计**: 适配各种屏幕尺寸

## 基本概念

通知系统提供了统一的 API 来显示各种类型的用户通知：

```typescript
interface NotificationManager {
  show: (options: NotificationOptions) => string
  hide: (id: string) => Promise<void>
  hideAll: () => Promise<void>
  getAll: () => NotificationOptions[]
  setPosition: (position: NotificationPosition) => void
  setTheme: (theme: NotificationTheme) => void
  setMaxNotifications: (max: number) => void
  getStats: () => NotificationStats
}

type NotificationType = 'success' | 'error' | 'warning' | 'info'
type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
type NotificationAnimation = 'slide' | 'fade' | 'bounce' | 'scale' | 'flip'
type NotificationTheme = 'light' | 'dark' | 'auto'
```

## 基本用法

### 快速开始

```typescript
import { createNotificationHelpers, createNotificationManager } from '@ldesign/engine'

// 创建通知管理器
const notificationManager = createNotificationManager()

// 创建便捷方法
const notifications = createNotificationHelpers(notificationManager)

// 显示不同类型的通知
notifications.success('操作成功完成！')
notifications.error('操作失败，请重试')
notifications.warning('请注意：数据即将过期')
notifications.info('系统将在5分钟后维护')
```

### 基本通知选项

```typescript
// 完整的通知配置
notificationManager.show({
  type: 'success',
  title: '上传成功',
  message: '文件已成功上传到服务器',
  duration: 5000, // 显示时长（毫秒）
  closable: true, // 是否可关闭
  position: 'top-right', // 显示位置
  animation: 'slide', // 动画效果
  theme: 'light', // 主题
  persistent: false, // 是否持久显示
  priority: 1, // 优先级
  icon: '✅', // 自定义图标
  className: 'custom-notification', // 自定义CSS类
  onClick: () => console.log('通知被点击'),
  onClose: () => console.log('通知被关闭'),
  onShow: () => console.log('通知已显示'),
})
```

### 位置控制

通知系统支持 6 个不同的显示位置：

```typescript
// 顶部位置
notificationManager.show({
  message: '顶部左侧通知',
  position: 'top-left',
})

notificationManager.show({
  message: '顶部中央通知',
  position: 'top-center',
})

notificationManager.show({
  message: '顶部右侧通知',
  position: 'top-right',
})

// 底部位置
notificationManager.show({
  message: '底部左侧通知',
  position: 'bottom-left',
})

notificationManager.show({
  message: '底部中央通知',
  position: 'bottom-center',
})

notificationManager.show({
  message: '底部右侧通知',
  position: 'bottom-right',
})

// 设置默认位置
notificationManager.setPosition('bottom-right')
```

### 动画效果

通知系统内置了 5 种动画效果，所有动画都包含平滑的高度变化，确保其他通知能够自然地调整位置：

```typescript
// 滑入动画（默认）- 从侧边滑入，带高度展开
notificationManager.show({
  message: '滑入效果',
  animation: 'slide',
})

// 淡入动画 - 淡入淡出，带缩放和高度变化
notificationManager.show({
  message: '淡入效果',
  animation: 'fade',
})

// 弹跳动画 - 弹性缩放效果，带高度展开
notificationManager.show({
  message: '弹跳效果',
  animation: 'bounce',
})

// 缩放动画 - 从中心缩放，带高度变化
notificationManager.show({
  message: '缩放效果',
  animation: 'scale',
})

// 翻转动画 - 3D翻转效果，带高度展开
notificationManager.show({
  message: '翻转效果',
  animation: 'flip',
})
```

#### 🎨 平滑动画特性

- **高度自适应**: 进入动画包含从 0 到自然高度的展开
- **同步动画**: 通知消失时，同时执行退出动画、高度收缩和其他通知的位置调整
- **智能移动**: 其他通知根据消失通知的位置智能地向上或向下移动
- **性能优化**: 基于 Web Animations API，GPU 加速，多个动画并行执行
- **自然过渡**: 使用贝塞尔曲线缓动函数，提供自然的动画感觉

#### 🔧 动画实现原理

**进入动画**：

1. **初始状态**: 通知从 0 高度、透明、位置偏移开始
2. **同步展开**: 高度展开和位置移动同时进行（400ms）
3. **自然定位**: 动画完成后，通知回到自然位置

**消失动画**：

1. **退出滑动**: 通知向设定方向滑出（350ms）
2. **高度收缩**: 同时进行高度、内边距、外边距收缩（350ms）
3. **平滑上移**: 下方通知同时平滑向上移动填补空位（350ms）

**关键特性**：

- 所有相关动画完全同步，确保无缝过渡
- 使用 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动函数提供自然感觉
- 动画完成后自动清理样式，避免布局问题

```typescript
// 演示平滑动画效果
const notificationIds = []

// 显示多个通知
for (let i = 1; i <= 5; i++) {
  const id = notificationManager.show({
    message: `通知 ${i}`,
    type: 'info',
    position: 'top-right',
    animation: 'slide',
    duration: 0, // 不自动消失，便于观察
  })
  notificationIds.push(id)
}

// 移除中间的通知，观察其他通知的平滑移动
setTimeout(() => {
  notificationManager.hide(notificationIds[2]) // 移除第3个通知
}, 2000)
```

#### 📱 最佳实践

- **位置选择**: 顶部位置的通知消失时，上方通知向下移动；底部位置相反
- **动画时长**: 所有相关动画都使用相同的 350ms 时长，确保同步
- **缓动函数**: 统一使用 `cubic-bezier(0.4, 0, 0.2, 1)` 提供自然感觉
- **性能考虑**: 多个动画并行执行，避免阻塞 UI 线程

### 主题系统

支持浅色、深色和自动主题：

```typescript
// 设置浅色主题
notificationManager.setTheme('light')

// 设置深色主题
notificationManager.setTheme('dark')

// 自动跟随系统主题
notificationManager.setTheme('auto')

// 为单个通知指定主题
notificationManager.show({
  message: '深色主题通知',
  theme: 'dark',
})
```

### 隐藏通知

```typescript
// 隐藏特定通知
const id = notificationManager.show({
  message: '这条消息将被隐藏',
})

setTimeout(async () => {
  await notificationManager.hide(id)
}, 2000)

// 隐藏所有通知
await notificationManager.hideAll()

// 持久通知（需要手动关闭）
const persistentId = notificationManager.show({
  message: '严重错误，需要处理',
  type: 'error',
  persistent: true,
  duration: 0,
  closable: true,
})
```

## 高级功能

### 带操作按钮的通知

```typescript
// 确认操作通知
notificationManager.show({
  type: 'warning',
  title: '确认删除',
  message: '确定要删除这个文件吗？此操作无法撤销。',
  duration: 0,
  actions: [
    {
      label: '删除',
      style: 'danger',
      action: async () => {
        // 执行删除操作
        console.log('文件已删除')
      },
    },
    {
      label: '取消',
      style: 'secondary',
      action: () => {
        console.log('取消删除')
      },
    },
  ],
})

// 使用便捷方法
const confirmed = await notifications.confirm('确定要删除这个文件吗？', '确认删除')

if (confirmed) {
  console.log('用户确认删除')
}
else {
  console.log('用户取消删除')
}
```

### 进度通知

```typescript
// 创建进度通知
const progressNotification = notifications.progress('正在上传文件...', 0)

// 模拟进度更新
let progress = 0
const interval = setInterval(() => {
  progress += 10
  progressNotification.update(progress, `上传进度: ${progress}%`)

  if (progress >= 100) {
    clearInterval(interval)
    progressNotification.complete('文件上传成功！')
  }
}, 500)

// 或者直接使用进度选项
notificationManager.show({
  message: '处理中...',
  type: 'info',
  duration: 0,
  progress: {
    value: 45,
    showText: true,
    color: '#3b82f6',
  },
})
```

### 加载通知

```typescript
// 创建加载通知
const loading = notifications.loading('正在加载数据...')

try {
  // 模拟异步操作
  const data = await fetchData()
  loading.success('数据加载成功！')
} catch (error) {
  loading.error('数据加载失败，请重试')
}

// 手动控制加载状态
const loadingId = notificationManager.show({
  message: '正在处理请求...',
  type: 'info',
  duration: 0,
  icon: `<svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
      <animate attributeName="stroke-dasharray" dur="2s"
               values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
    </circle>
  </svg>`
})
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
async function showProgressNotification(task: () => Promise<void>) {
  const notificationId = engine.notifications.info('正在处理...', {
    persistent: true,
    progress: 0,
  })

  try {
    // 模拟进度更新
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))

      engine.notifications.update(notificationId, {
        message: `处理中... ${i}%`,
        progress: i,
      })
    }

    // 完成后更新通知
    engine.notifications.update(notificationId, {
      type: 'success',
      message: '处理完成！',
      duration: 3000,
      persistent: false,
      progress: undefined,
    })
  }
  catch (error) {
    engine.notifications.update(notificationId, {
      type: 'error',
      message: '处理失败',
      duration: 5000,
      persistent: false,
      progress: undefined,
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
      action: () => updateApp(),
    },
    {
      label: '稍后提醒',
      action: () => scheduleUpdateReminder(),
    },
  ],
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
  duration: 8000,
})
```

## 通知分组

### 创建通知组

```typescript
// 创建通知组
function createNotificationGroup(groupId: string) {
  return {
    success: (message: string, options?: NotificationOptions) => {
      return engine.notifications.success(message, {
        ...options,
        group: groupId,
      })
    },
    error: (message: string, options?: NotificationOptions) => {
      return engine.notifications.error(message, {
        ...options,
        group: groupId,
      })
    },
    warning: (message: string, options?: NotificationOptions) => {
      return engine.notifications.warning(message, {
        ...options,
        group: groupId,
      })
    },
    info: (message: string, options?: NotificationOptions) => {
      return engine.notifications.info(message, {
        ...options,
        group: groupId,
      })
    },
    dismissAll: () => {
      engine.notifications.dismissGroup(groupId)
    },
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
  private pendingNotifications = new Map<
    string,
    {
      count: number
      timer: NodeJS.Timeout
      lastMessage: string
    }
  >()

  merge(key: string, message: string, type: NotificationType = 'info') {
    const existing = this.pendingNotifications.get(key)

    if (existing) {
      // 更新计数和消息
      existing.count++
      existing.lastMessage = message
      clearTimeout(existing.timer)
    }
    else {
      // 创建新的合并通知
      this.pendingNotifications.set(key, {
        count: 1,
        timer: null as any,
        lastMessage: message,
      })
    }

    // 延迟显示合并后的通知
    const notification = this.pendingNotifications.get(key)!
    notification.timer = setTimeout(() => {
      const { count, lastMessage } = notification

      if (count === 1) {
        engine.notifications.show(type, lastMessage)
      }
      else {
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
      persistent: true,
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
      duration: 8000,
    })
  },

  // 网络状态模板
  networkStatus: (isOnline: boolean) => {
    if (isOnline) {
      return engine.notifications.success('网络连接已恢复')
    }
    else {
      return engine.notifications.error('网络连接已断开', {
        persistent: true,
        actions: [
          {
            label: '重试连接',
            action: () => checkNetworkConnection(),
          },
        ],
      })
    }
  },
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
        read: false,
      })
    }
  },
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
      },
    })

    this.activeNotifications.push(id)
    return id
  }

  dismissAll() {
    this.activeNotifications.forEach((id) => {
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
  ariaLabel: '成功通知：操作已完成',
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
  },
})
```

通过通知系统，你可以为用户提供及时、清晰的反馈，提升应用的用户体验和可用性。
