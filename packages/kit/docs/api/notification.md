# Notification 系统通知

Notification 模块提供了跨平台系统通知功能，支持多种通知类型、自定义样式和通知历史管理。

## 导入方式

```typescript
// 完整导入
import { NotificationManager, NotificationUtils } from '@ldesign/kit'

// 按需导入
import { NotificationManager } from '@ldesign/kit/notification'

// 单独导入
import { NotificationManager, NotificationUtils } from '@ldesign/kit'
```

## NotificationManager

通知管理器类，提供完整的系统通知功能。

### 创建实例

#### `create(config?: NotificationConfig): NotificationManager`

创建通知管理器实例。

```typescript
// 默认配置
const notificationManager = NotificationManager.create()

// 自定义配置
const notificationManager = NotificationManager.create({
  appName: 'My Application',
  appIcon: './assets/icon.png',
  sound: true, // 启用声音
  timeout: 5000, // 超时时间（毫秒）
  position: 'topRight', // 位置
  maxNotifications: 5, // 最大通知数
  silent: false, // 静默模式
  urgency: 'normal', // 紧急程度
})
```

### 基本通知

#### `notify(options: NotificationOptions): Promise<string>`

发送基本通知。

```typescript
// 基本通知
const notificationId = await notificationManager.notify({
  title: '新消息',
  message: '您有一条新的消息',
})

// 带图标的通知
await notificationManager.notify({
  title: '文件下载完成',
  message: 'document.pdf 已下载到桌面',
  icon: './assets/download-icon.png',
})

// 带操作按钮的通知
await notificationManager.notify({
  title: '会议提醒',
  message: '团队会议将在5分钟后开始',
  actions: [
    { type: 'button', text: '加入会议', action: 'join-meeting' },
    { type: 'button', text: '稍后提醒', action: 'snooze' },
  ],
})

// 带自定义数据的通知
await notificationManager.notify({
  title: '任务完成',
  message: '数据备份已完成',
  data: {
    taskId: 'backup-001',
    completedAt: new Date().toISOString(),
  },
})
```

### 类型化通知

#### `success(title: string, message?: string, options?: Partial<NotificationOptions>): Promise<string>`

成功通知。

```typescript
await notificationManager.success('操作成功', '文件已保存')

await notificationManager.success('部署完成', '应用已成功部署到生产环境', {
  timeout: 10000,
  actions: [{ type: 'button', text: '查看应用', action: 'open-app' }],
})
```

#### `error(title: string, message?: string, options?: Partial<NotificationOptions>): Promise<string>`

错误通知。

```typescript
await notificationManager.error('操作失败', '网络连接错误')

await notificationManager.error('构建失败', '编译过程中发现错误', {
  timeout: 0, // 不自动消失
  actions: [
    { type: 'button', text: '查看日志', action: 'view-logs' },
    { type: 'button', text: '重试', action: 'retry-build' },
  ],
})
```

#### `warning(title: string, message?: string, options?: Partial<NotificationOptions>): Promise<string>`

警告通知。

```typescript
await notificationManager.warning('磁盘空间不足', '剩余空间少于1GB')

await notificationManager.warning('证书即将过期', 'SSL证书将在7天后过期', {
  actions: [{ type: 'button', text: '续期证书', action: 'renew-cert' }],
})
```

#### `info(title: string, message?: string, options?: Partial<NotificationOptions>): Promise<string>`

信息通知。

```typescript
await notificationManager.info('系统更新', '新版本可用')

await notificationManager.info('备份提醒', '建议定期备份重要数据', {
  timeout: 8000,
})
```

### 进度通知

#### `progress(options: ProgressNotificationOptions): ProgressNotification`

进度通知。

```typescript
// 创建进度通知
const progressNotification = notificationManager.progress({
  title: '文件上传',
  message: '正在上传文件...',
  progress: 0,
  total: 100,
})

// 更新进度
for (let i = 0; i <= 100; i += 10) {
  await progressNotification.update({
    progress: i,
    message: `上传进度 ${i}%`,
  })
  await new Promise(resolve => setTimeout(resolve, 500))
}

// 完成进度
await progressNotification.complete({
  title: '上传完成',
  message: '文件上传成功',
})
```

### 通知管理

#### `close(notificationId: string): Promise<void>`

关闭指定通知。

```typescript
const id = await notificationManager.notify({
  title: '临时通知',
  message: '这条通知将在3秒后关闭',
})

setTimeout(async () => {
  await notificationManager.close(id)
}, 3000)
```

#### `closeAll(): Promise<void>`

关闭所有通知。

```typescript
await notificationManager.closeAll()
```

#### `getActiveNotifications(): Promise<NotificationInfo[]>`

获取活跃的通知列表。

```typescript
const activeNotifications = await notificationManager.getActiveNotifications()

activeNotifications.forEach(notification => {
  console.log(`通知: ${notification.title} - ${notification.message}`)
})
```

### 事件监听

#### `on(event: string, listener: Function): void`

监听通知事件。

```typescript
// 通知点击事件
notificationManager.on('click', (notificationId, data) => {
  console.log(`通知被点击: ${notificationId}`)
  console.log('通知数据:', data)
})

// 通知关闭事件
notificationManager.on('close', (notificationId, reason) => {
  console.log(`通知关闭: ${notificationId}, 原因: ${reason}`)
})

// 操作按钮点击事件
notificationManager.on('action', (notificationId, actionId, data) => {
  console.log(`操作执行: ${actionId}`)

  switch (actionId) {
    case 'join-meeting':
      // 打开会议链接
      break
    case 'view-logs':
      // 打开日志文件
      break
    case 'retry-build':
      // 重新开始构建
      break
  }
})

// 通知显示事件
notificationManager.on('show', notificationId => {
  console.log(`通知显示: ${notificationId}`)
})

// 通知错误事件
notificationManager.on('error', error => {
  console.error('通知错误:', error)
})
```

### 权限管理

#### `requestPermission(): Promise<NotificationPermission>`

请求通知权限。

```typescript
const permission = await notificationManager.requestPermission()

switch (permission) {
  case 'granted':
    console.log('通知权限已授予')
    break
  case 'denied':
    console.log('通知权限被拒绝')
    break
  case 'default':
    console.log('通知权限未设置')
    break
}
```

#### `hasPermission(): Promise<boolean>`

检查是否有通知权限。

```typescript
const hasPermission = await notificationManager.hasPermission()

if (!hasPermission) {
  await notificationManager.requestPermission()
}
```

## NotificationUtils

通知工具函数类，提供快速通知方法。

### 快速通知

#### `notify(title: string, message?: string, options?: Partial<NotificationOptions>): Promise<string>`

快速发送通知。

```typescript
await NotificationUtils.notify('快速通知', '这是一个快速通知')

await NotificationUtils.notify('文件保存', '文档已保存', {
  icon: './save-icon.png',
  timeout: 3000,
})
```

#### `success(title: string, message?: string): Promise<string>`

快速成功通知。

```typescript
await NotificationUtils.success('操作成功')
await NotificationUtils.success('保存成功', '文件已保存到桌面')
```

#### `error(title: string, message?: string): Promise<string>`

快速错误通知。

```typescript
await NotificationUtils.error('操作失败')
await NotificationUtils.error('连接失败', '无法连接到服务器')
```

#### `warning(title: string, message?: string): Promise<string>`

快速警告通知。

```typescript
await NotificationUtils.warning('注意')
await NotificationUtils.warning('磁盘空间不足', '请清理磁盘空间')
```

#### `info(title: string, message?: string): Promise<string>`

快速信息通知。

```typescript
await NotificationUtils.info('提示')
await NotificationUtils.info('新版本可用', '点击更新到最新版本')
```

## 实际应用示例

### 任务监控通知

```typescript
class TaskMonitor {
  private notificationManager = NotificationManager.create({
    appName: 'Task Monitor',
    appIcon: './assets/monitor-icon.png',
  })

  async monitorTask(taskId: string) {
    // 任务开始通知
    await this.notificationManager.info('任务开始', `任务 ${taskId} 已开始执行`)

    // 创建进度通知
    const progressNotification = this.notificationManager.progress({
      title: '任务执行中',
      message: `正在执行任务 ${taskId}...`,
      progress: 0,
      total: 100,
    })

    try {
      // 模拟任务执行
      for (let progress = 0; progress <= 100; progress += 10) {
        await this.simulateTaskProgress(progress)

        await progressNotification.update({
          progress,
          message: `任务进度 ${progress}%`,
        })
      }

      // 任务完成通知
      await progressNotification.complete({
        title: '任务完成',
        message: `任务 ${taskId} 已成功完成`,
      })

      await this.notificationManager.success('任务成功', `任务 ${taskId} 执行成功`, {
        actions: [
          { type: 'button', text: '查看结果', action: 'view-result' },
          { type: 'button', text: '下载报告', action: 'download-report' },
        ],
        data: { taskId, completedAt: new Date().toISOString() },
      })
    } catch (error) {
      // 任务失败通知
      await progressNotification.fail({
        title: '任务失败',
        message: `任务 ${taskId} 执行失败`,
      })

      await this.notificationManager.error('任务失败', error.message, {
        actions: [
          { type: 'button', text: '查看错误', action: 'view-error' },
          { type: 'button', text: '重试', action: 'retry-task' },
        ],
        data: { taskId, error: error.message },
      })
    }
  }

  private async simulateTaskProgress(progress: number) {
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟可能的错误
    if (progress === 70 && Math.random() < 0.3) {
      throw new Error('模拟任务执行错误')
    }
  }

  setupEventHandlers() {
    this.notificationManager.on('action', async (notificationId, actionId, data) => {
      switch (actionId) {
        case 'view-result':
          console.log('查看任务结果:', data.taskId)
          break
        case 'download-report':
          console.log('下载任务报告:', data.taskId)
          break
        case 'view-error':
          console.log('查看错误详情:', data.error)
          break
        case 'retry-task':
          console.log('重试任务:', data.taskId)
          await this.monitorTask(data.taskId)
          break
      }
    })
  }
}
```

### 系统状态监控

```typescript
class SystemMonitor {
  private notificationManager = NotificationManager.create({
    appName: 'System Monitor',
    sound: true,
  })

  private lastNotifications = new Map<string, number>()

  async startMonitoring() {
    setInterval(async () => {
      await this.checkSystemHealth()
    }, 30000) // 每30秒检查一次

    console.log('系统监控已启动')
  }

  private async checkSystemHealth() {
    const metrics = await this.getSystemMetrics()

    // 检查 CPU 使用率
    if (metrics.cpu > 90) {
      await this.sendThrottledNotification(
        'high-cpu',
        'CPU 使用率过高',
        `当前 CPU 使用率: ${metrics.cpu}%`,
        'warning'
      )
    }

    // 检查内存使用率
    if (metrics.memory > 85) {
      await this.sendThrottledNotification(
        'high-memory',
        '内存使用率过高',
        `当前内存使用率: ${metrics.memory}%`,
        'warning'
      )
    }

    // 检查磁盘空间
    if (metrics.disk > 95) {
      await this.sendThrottledNotification(
        'low-disk',
        '磁盘空间不足',
        `剩余磁盘空间: ${100 - metrics.disk}%`,
        'error'
      )
    }

    // 检查网络连接
    if (!metrics.networkConnected) {
      await this.sendThrottledNotification(
        'network-down',
        '网络连接断开',
        '请检查网络连接',
        'error'
      )
    }

    // 检查服务状态
    for (const service of metrics.services) {
      if (!service.running) {
        await this.sendThrottledNotification(
          `service-${service.name}`,
          '服务停止',
          `服务 ${service.name} 已停止运行`,
          'error'
        )
      }
    }
  }

  private async sendThrottledNotification(
    key: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error'
  ) {
    const now = Date.now()
    const lastSent = this.lastNotifications.get(key) || 0
    const throttleTime = 5 * 60 * 1000 // 5分钟

    if (now - lastSent < throttleTime) {
      return // 节流，避免频繁通知
    }

    this.lastNotifications.set(key, now)

    const actions = []
    if (key === 'high-cpu' || key === 'high-memory') {
      actions.push({ type: 'button', text: '查看进程', action: 'view-processes' })
    } else if (key === 'low-disk') {
      actions.push({ type: 'button', text: '清理磁盘', action: 'clean-disk' })
    } else if (key.startsWith('service-')) {
      actions.push({ type: 'button', text: '重启服务', action: 'restart-service' })
    }

    switch (type) {
      case 'info':
        await this.notificationManager.info(title, message, { actions })
        break
      case 'warning':
        await this.notificationManager.warning(title, message, { actions })
        break
      case 'error':
        await this.notificationManager.error(title, message, { actions })
        break
    }
  }

  private async getSystemMetrics() {
    // 模拟系统指标获取
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      networkConnected: Math.random() > 0.1,
      services: [
        { name: 'web-server', running: Math.random() > 0.05 },
        { name: 'database', running: Math.random() > 0.02 },
        { name: 'cache', running: Math.random() > 0.03 },
      ],
    }
  }
}
```

### 构建通知系统

```typescript
class BuildNotificationSystem {
  private notificationManager = NotificationManager.create({
    appName: 'Build System',
    appIcon: './assets/build-icon.png',
  })

  async notifyBuildStart(projectName: string, branch: string) {
    await this.notificationManager.info('构建开始', `项目 ${projectName} (${branch}) 开始构建`)
  }

  async notifyBuildProgress(projectName: string, stage: string, progress: number) {
    // 这里可以使用进度通知
    console.log(`${projectName}: ${stage} - ${progress}%`)
  }

  async notifyBuildSuccess(projectName: string, branch: string, duration: number) {
    await this.notificationManager.success(
      '构建成功',
      `项目 ${projectName} (${branch}) 构建成功，耗时 ${duration}s`,
      {
        actions: [
          { type: 'button', text: '查看构建', action: 'view-build' },
          { type: 'button', text: '部署', action: 'deploy' },
        ],
        data: { projectName, branch, duration },
      }
    )
  }

  async notifyBuildFailure(projectName: string, branch: string, error: string) {
    await this.notificationManager.error('构建失败', `项目 ${projectName} (${branch}) 构建失败`, {
      timeout: 0, // 不自动消失
      actions: [
        { type: 'button', text: '查看日志', action: 'view-logs' },
        { type: 'button', text: '重新构建', action: 'rebuild' },
      ],
      data: { projectName, branch, error },
    })
  }

  async notifyDeploymentSuccess(projectName: string, environment: string) {
    await this.notificationManager.success(
      '部署成功',
      `项目 ${projectName} 已成功部署到 ${environment}`,
      {
        actions: [{ type: 'button', text: '访问应用', action: 'open-app' }],
        data: { projectName, environment },
      }
    )
  }

  setupEventHandlers() {
    this.notificationManager.on('action', async (notificationId, actionId, data) => {
      switch (actionId) {
        case 'view-build':
          console.log('查看构建详情:', data.projectName)
          break
        case 'deploy':
          console.log('开始部署:', data.projectName)
          break
        case 'view-logs':
          console.log('查看构建日志:', data.projectName)
          break
        case 'rebuild':
          console.log('重新构建:', data.projectName)
          break
        case 'open-app':
          console.log('打开应用:', data.projectName)
          break
      }
    })
  }
}
```

## 类型定义

```typescript
interface NotificationConfig {
  appName?: string
  appIcon?: string
  sound?: boolean
  timeout?: number
  position?: NotificationPosition
  maxNotifications?: number
  silent?: boolean
  urgency?: NotificationUrgency
}

interface NotificationOptions {
  title: string
  message?: string
  icon?: string
  timeout?: number
  silent?: boolean
  actions?: NotificationAction[]
  data?: any
}

interface NotificationAction {
  type: 'button'
  text: string
  action: string
}

interface ProgressNotificationOptions {
  title: string
  message?: string
  progress: number
  total: number
  icon?: string
}

interface NotificationInfo {
  id: string
  title: string
  message?: string
  timestamp: Date
  type: NotificationType
}

type NotificationPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
type NotificationUrgency = 'low' | 'normal' | 'critical'
type NotificationType = 'info' | 'success' | 'warning' | 'error'
type NotificationPermission = 'granted' | 'denied' | 'default'
```

## 平台兼容性

### Windows

- 使用 Windows Toast 通知
- 支持操作按钮和进度显示
- 集成系统通知中心

### macOS

- 使用 macOS 通知中心
- 支持横幅和警告样式
- 集成 Dock 徽章

### Linux

- 使用 libnotify (notify-send)
- 支持桌面环境集成
- 兼容 GNOME、KDE 等

## 最佳实践

1. **权限管理**: 在发送通知前检查和请求权限
2. **通知节流**: 避免频繁发送相同类型的通知
3. **用户体验**: 提供有意义的标题和消息
4. **操作按钮**: 为重要通知提供快速操作
5. **数据传递**: 使用 data 字段传递上下文信息

## 示例应用

查看 [使用示例](/examples/system-notifications) 了解更多系统通知的实际应用场景。
