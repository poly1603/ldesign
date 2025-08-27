# 核心 API

@ldesign/watermark 提供了简洁而强大的 API，让您可以轻松地在应用中集成水印功能。

## createWatermark

创建水印实例的主要方法。

### 语法

```typescript
function createWatermark(
  container: string | HTMLElement,
  config: WatermarkConfig
): Promise<WatermarkInstance>
```

### 参数

#### container
- **类型**: `string | HTMLElement`
- **描述**: 水印容器，可以是 CSS 选择器字符串或 DOM 元素

#### config
- **类型**: `WatermarkConfig`
- **描述**: 水印配置对象

### 返回值

- **类型**: `Promise<WatermarkInstance>`
- **描述**: 返回水印实例的 Promise

### 示例

```javascript
// 使用选择器
const watermark = await createWatermark('#container', {
  content: '水印文字'
})

// 使用 DOM 元素
const element = document.getElementById('container')
const watermark = await createWatermark(element, {
  content: '水印文字'
})
```

## destroyWatermark

销毁水印实例。

### 语法

```typescript
function destroyWatermark(
  instance: WatermarkInstance
): Promise<void>
```

### 参数

#### instance
- **类型**: `WatermarkInstance`
- **描述**: 要销毁的水印实例

### 示例

```javascript
const watermark = await createWatermark('#container', {
  content: '水印文字'
})

// 销毁水印
await destroyWatermark(watermark)
```

## WatermarkInstance

水印实例对象，包含控制水印的方法和属性。

### 属性

#### id
- **类型**: `string`
- **描述**: 水印实例的唯一标识符
- **只读**: 是

#### state
- **类型**: `'active' | 'paused' | 'destroyed'`
- **描述**: 水印当前状态
- **只读**: 是

#### config
- **类型**: `WatermarkConfig`
- **描述**: 水印配置对象
- **只读**: 是

#### container
- **类型**: `HTMLElement`
- **描述**: 水印容器元素
- **只读**: 是

#### elements
- **类型**: `HTMLElement[]`
- **描述**: 水印元素数组
- **只读**: 是

#### visible
- **类型**: `boolean`
- **描述**: 水印是否可见
- **只读**: 是

#### createdAt
- **类型**: `number`
- **描述**: 水印创建时间戳
- **只读**: 是

#### updatedAt
- **类型**: `number`
- **描述**: 水印最后更新时间戳
- **只读**: 是

### 方法

#### update()

更新水印配置。

```typescript
update(config: Partial<WatermarkConfig>): Promise<void>
```

**示例**:
```javascript
await watermark.update({
  content: '新的水印内容',
  style: { color: 'red' }
})
```

#### pause()

暂停水印显示。

```typescript
pause(): void
```

**示例**:
```javascript
watermark.pause()
```

#### resume()

恢复水印显示。

```typescript
resume(): void
```

**示例**:
```javascript
watermark.resume()
```

#### show()

显示水印。

```typescript
show(): void
```

**示例**:
```javascript
watermark.show()
```

#### hide()

隐藏水印。

```typescript
hide(): void
```

**示例**:
```javascript
watermark.hide()
```

#### destroy()

销毁水印实例。

```typescript
destroy(): Promise<void>
```

**示例**:
```javascript
await watermark.destroy()
```

#### on()

监听水印事件。

```typescript
on(event: WatermarkEvent, handler: EventHandler): void
```

**参数**:
- `event`: 事件名称
- `handler`: 事件处理函数

**示例**:
```javascript
watermark.on('updated', (instance) => {
  console.log('水印已更新', instance)
})
```

#### off()

移除事件监听器。

```typescript
off(event: WatermarkEvent, handler?: EventHandler): void
```

**参数**:
- `event`: 事件名称
- `handler`: 事件处理函数（可选，不传则移除所有监听器）

**示例**:
```javascript
watermark.off('updated', handler)
// 或移除所有监听器
watermark.off('updated')
```

## 事件系统

水印实例支持事件监听，您可以监听各种水印状态变化。

### 事件类型

#### created
水印创建完成时触发。

```javascript
watermark.on('created', (instance) => {
  console.log('水印创建成功', instance)
})
```

#### updated
水印更新完成时触发。

```javascript
watermark.on('updated', (instance) => {
  console.log('水印更新成功', instance)
})
```

#### destroyed
水印销毁时触发。

```javascript
watermark.on('destroyed', (instanceId) => {
  console.log('水印已销毁', instanceId)
})
```

#### error
发生错误时触发。

```javascript
watermark.on('error', (error) => {
  console.error('水印错误', error)
})
```

#### securityViolation
检测到安全违规时触发。

```javascript
watermark.on('securityViolation', (event) => {
  console.warn('检测到安全违规', event)
})
```

#### visibilityChanged
水印可见性改变时触发。

```javascript
watermark.on('visibilityChanged', (visible) => {
  console.log('水印可见性改变', visible)
})
```

## 全局配置

### setGlobalConfig

设置全局默认配置。

```typescript
function setGlobalConfig(config: Partial<WatermarkConfig>): void
```

**示例**:
```javascript
import { setGlobalConfig } from '@ldesign/watermark'

setGlobalConfig({
  style: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.15)'
  },
  security: {
    level: 'medium'
  }
})
```

### getGlobalConfig

获取当前全局配置。

```typescript
function getGlobalConfig(): WatermarkConfig
```

**示例**:
```javascript
import { getGlobalConfig } from '@ldesign/watermark'

const globalConfig = getGlobalConfig()
console.log(globalConfig)
```

## 工具函数

### isSupported

检查当前环境是否支持水印功能。

```typescript
function isSupported(): boolean
```

**示例**:
```javascript
import { isSupported } from '@ldesign/watermark'

if (isSupported()) {
  // 创建水印
} else {
  console.warn('当前环境不支持水印功能')
}
```

### getVersion

获取库的版本信息。

```typescript
function getVersion(): string
```

**示例**:
```javascript
import { getVersion } from '@ldesign/watermark'

console.log('当前版本:', getVersion())
```

## 错误处理

所有异步方法都可能抛出错误，建议使用 try-catch 进行错误处理：

```javascript
try {
  const watermark = await createWatermark('#container', {
    content: '水印文字'
  })
} catch (error) {
  console.error('创建水印失败:', error)
}
```

常见错误类型：

- `WatermarkError` - 水印相关错误
- `ConfigError` - 配置错误
- `RenderError` - 渲染错误
- `SecurityError` - 安全相关错误

## TypeScript 支持

@ldesign/watermark 提供完整的 TypeScript 类型定义：

```typescript
import type {
  WatermarkConfig,
  WatermarkInstance,
  WatermarkEvent,
  WatermarkStyle,
  WatermarkLayout
} from '@ldesign/watermark'
```

## 下一步

- [配置选项](/api/configuration) - 了解所有配置选项
- [渲染器 API](/api/renderers) - 自定义渲染器开发
- [Vue 组件 API](/api/vue-watermark) - Vue 组件使用指南
