# 消息系统

LDesign Engine 提供了轻量级的消息提示系统，支持多种消息类型和丰富的配置选项。

## 快速开始

```typescript
import { message } from '@ldesign/engine'

// 显示不同类型的消息
message.success('操作成功！')
message.error('操作失败！')
message.warning('请注意！')
message.info('提示信息')
const loadingMsg = message.loading('加载中...')

// 关闭特定消息
setTimeout(() => {
  loadingMsg.close()
}, 3000)
```

## 消息类型

### 成功消息

```typescript
message.success('数据保存成功！')

// 带配置的成功消息
message.success('操作成功', {
  duration: 5000,
  showClose: true,
  onClose: () => console.log('消息已关闭')
})
```

### 错误消息

```typescript
message.error('网络连接失败！')

// 错误消息默认不自动关闭
message.error('严重错误', {
  duration: 0, // 不自动关闭
  showClose: true
})
```

### 警告消息

```typescript
message.warning('数据即将过期')

message.warning('请检查输入', {
  position: 'center',
  customClass: 'my-warning'
})
```

### 信息消息

```typescript
message.info('系统维护通知')

message.info('新功能上线', {
  title: '通知',
  html: true,
  content: '<strong>新功能</strong>已上线，快来体验吧！'
})
```

### 加载消息

```typescript
const loading = message.loading('数据加载中...')

// 模拟异步操作
setTimeout(() => {
  loading.close()
  message.success('加载完成！')
}, 3000)
```

## 配置选项

### 基础配置

```typescript
message.show({
  type: 'success',
  title: '成功',
  content: '操作完成',
  duration: 4000,
  position: 'top',
  offset: 20,
  showClose: true,
  html: false,
  customClass: 'my-message',
  zIndex: 3000
})
```

### 回调函数

```typescript
message.success('操作成功', {
  onClose: () => {
    console.log('消息已关闭')
  },
  onClick: () => {
    console.log('消息被点击')
  }
})
```

### 位置设置

```typescript
// 顶部显示（默认）
message.info('顶部消息', { position: 'top' })

// 居中显示
message.info('居中消息', { position: 'center' })

// 底部显示
message.info('底部消息', { position: 'bottom' })
```

### HTML内容

```typescript
message.info('HTML消息', {
  html: true,
  content: '<p>支持<strong>HTML</strong>内容</p>'
})
```

## 全局配置

```typescript
import { MessageManager } from '@ldesign/engine'

const messageManager = new MessageManager({
  maxCount: 5,
  defaultDuration: 3000,
  defaultPosition: 'top',
  defaultOffset: 20,
  zIndex: 3000,
  gap: 16
})

await messageManager.initialize()
```

## 高级用法

### 自定义消息管理器

```typescript
import { createMessageManager } from '@ldesign/engine'

const customMessageManager = createMessageManager({
  maxCount: 3,
  defaultDuration: 5000,
  defaultPosition: 'center'
})

await customMessageManager.initialize()

customMessageManager.success('自定义管理器消息')
```

### 消息构建器

```typescript
import { messageBuilder } from '@ldesign/engine'

const config = messageBuilder
  .success('操作成功')
  .title('提示')
  .duration(5000)
  .showClose(true)
  .onClick(() => console.log('clicked'))
  .build()

message.show(config)
```

### 消息队列

```typescript
import { MessageQueue } from '@ldesign/engine'

const queue = new MessageQueue(100)

// 添加消息到队列
queue.enqueue({
  type: 'info',
  content: '队列消息1'
})

queue.enqueue({
  type: 'success',
  content: '队列消息2'
})

// 处理队列
while (queue.size() > 0) {
  const config = queue.dequeue()
  if (config) {
    message.show(config)
  }
}
```

## API 参考

### MessageManager

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `show(options)` | 显示消息 | `MessageOptions` | `MessageInstance` |
| `success(content, options?)` | 显示成功消息 | `string, Partial<MessageOptions>` | `MessageInstance` |
| `error(content, options?)` | 显示错误消息 | `string, Partial<MessageOptions>` | `MessageInstance` |
| `warning(content, options?)` | 显示警告消息 | `string, Partial<MessageOptions>` | `MessageInstance` |
| `info(content, options?)` | 显示信息消息 | `string, Partial<MessageOptions>` | `MessageInstance` |
| `loading(content, options?)` | 显示加载消息 | `string, Partial<MessageOptions>` | `MessageInstance` |
| `close(id)` | 关闭指定消息 | `string` | `boolean` |
| `closeAll()` | 关闭所有消息 | - | `void` |

### MessageOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | 自动生成 | 消息唯一标识 |
| `type` | `'success' \| 'error' \| 'warning' \| 'info' \| 'loading'` | `'info'` | 消息类型 |
| `title` | `string` | - | 消息标题 |
| `content` | `string` | - | 消息内容 |
| `duration` | `number` | `3000` | 显示时长（毫秒），0表示不自动关闭 |
| `position` | `'top' \| 'center' \| 'bottom'` | `'top'` | 显示位置 |
| `offset` | `number` | `20` | 偏移距离 |
| `showClose` | `boolean` | `true` | 是否显示关闭按钮 |
| `html` | `boolean` | `false` | 是否支持HTML内容 |
| `customClass` | `string` | - | 自定义CSS类名 |
| `zIndex` | `number` | `3000` | 层级 |
| `onClose` | `() => void` | - | 关闭回调 |
| `onClick` | `() => void` | - | 点击回调 |

### MessageInstance

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `id` | `string` | 消息唯一标识 |
| `options` | `MessageOptions` | 消息配置 |
| `element` | `HTMLElement` | 消息DOM元素 |
| `visible` | `boolean` | 是否可见 |
| `close()` | `() => void` | 关闭消息 |

## 样式定制

### CSS变量

```css
:root {
  --message-success-color: #67c23a;
  --message-error-color: #f56c6c;
  --message-warning-color: #e6a23c;
  --message-info-color: #909399;
  --message-loading-color: #409eff;
  
  --message-background: #fff;
  --message-border-radius: 4px;
  --message-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --message-padding: 12px 16px;
  --message-font-size: 14px;
  --message-line-height: 1.4;
}
```

### 自定义样式

```css
.my-custom-message {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border: none;
  border-radius: 20px;
}

.my-custom-message .engine-message-icon {
  color: white;
}
```

## 最佳实践

1. **合理设置持续时间**：成功消息3-5秒，错误消息不自动关闭或较长时间
2. **控制消息数量**：避免同时显示过多消息，建议最多3-5个
3. **提供关闭按钮**：对于重要消息，提供手动关闭选项
4. **使用合适的类型**：根据消息重要性选择合适的类型
5. **避免HTML注入**：谨慎使用html选项，确保内容安全

## 无障碍支持

消息系统内置了无障碍支持：

- 自动设置ARIA属性
- 支持屏幕阅读器
- 键盘导航支持
- 高对比度模式兼容
