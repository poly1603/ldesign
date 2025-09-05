# 通知管理器（NotificationManager）

用于展示全局通知，支持位置、主题、动画、操作按钮、进度条等。

## 快速上手

```ts
// 基础通知
const id = engine.notifications.show({
  type: 'success',
  title: '操作成功',
  message: '数据已保存',
  duration: 3000,
})

// 关闭
await engine.notifications.hide(id)
engine.notifications.hideAll()

// 便捷方法
engine.notifications.show({ type: 'error', message: '出错了', duration: 0 })
```

## 进阶用法

```ts
// 操作按钮
engine.notifications.show({
  type: 'warning',
  message: '有未保存内容，是否离开？',
  duration: 0,
  actions: [
    { label: '留下', style: 'primary', action: async () => {/* ... */} },
    { label: '离开', action: async () => {/* ... */} },
  ],
})

// 进度通知
const helper = engine.notificationsHelpers?.progress('正在导入...', 0)
helper?.update?.(20)
helper?.complete?.('导入完成')
```

## API

- show(options): string
- hide(id): Promise<void>
- hideAll(): Promise<void>
- getAll(): EngineNotification[]
- setPosition(position)
- getPosition()
- setTheme(theme)
- getTheme()
- setMaxNotifications(n)
- getMaxNotifications()
- setDefaultDuration(ms)
- getDefaultDuration()
- getStats()
- destroy()

## 推荐配置

- 开发环境：position = 'top-right'，duration = 3000
- 生产环境：合理限制 maxNotifications，避免刷屏
