# Calendar API

Calendar 是 @ldesign/calendar 的核心类，提供了日历的主要功能和API接口。

## 构造函数

### `new Calendar(container, config?)`

创建一个新的日历实例。

**参数：**
- `container: HTMLElement | string` - 日历容器元素或选择器
- `config?: Partial<CalendarConfig>` - 可选的配置对象

**示例：**
```typescript
// 使用元素选择器
const calendar = new Calendar('#calendar')

// 使用DOM元素
const element = document.getElementById('calendar')
const calendar = new Calendar(element)

// 使用配置
const calendar = new Calendar('#calendar', {
  view: 'month',
  locale: 'zh-CN',
  showLunar: true
})
```

## 核心方法

### `render(): void`

渲染日历到容器中。

**示例：**
```typescript
calendar.render()
```

### `destroy(): void`

销毁日历实例，清理事件监听器和DOM元素。

**示例：**
```typescript
calendar.destroy()
```

## 视图管理

### `setView(view: CalendarViewType): void`

设置当前视图类型。

**参数：**
- `view: 'month' | 'week' | 'day'` - 视图类型

**示例：**
```typescript
calendar.setView('month')
calendar.setView('week')
calendar.setView('day')
```

### `getCurrentView(): CalendarViewType`

获取当前视图类型。

**返回值：**
- `CalendarViewType` - 当前视图类型

**示例：**
```typescript
const currentView = calendar.getCurrentView()
console.log(currentView) // 'month' | 'week' | 'day'
```

## 日期导航

### `next(): void`

导航到下一个时间段（下个月/周/日）。

**示例：**
```typescript
calendar.next()
```

### `prev(): void`

导航到上一个时间段（上个月/周/日）。

**示例：**
```typescript
calendar.prev()
```

### `today(): void`

导航到今天。

**示例：**
```typescript
calendar.today()
```

### `goToDate(date: Date | string): void`

导航到指定日期。

**参数：**
- `date: Date | string` - 目标日期

**示例：**
```typescript
calendar.goToDate(new Date('2023-12-25'))
calendar.goToDate('2023-12-25')
```

### `getCurrentDate(): Date`

获取当前显示的日期。

**返回值：**
- `Date` - 当前日期

**示例：**
```typescript
const currentDate = calendar.getCurrentDate()
console.log(currentDate)
```

## 事件管理

### `addEvent(event: CalendarEvent): void`

添加一个事件。

**参数：**
- `event: CalendarEvent` - 事件对象

**示例：**
```typescript
calendar.addEvent({
  id: '1',
  title: '会议',
  start: new Date('2023-12-25T10:00:00'),
  end: new Date('2023-12-25T11:00:00'),
  color: '#722ED1'
})
```

### `updateEvent(event: CalendarEvent): void`

更新一个事件。

**参数：**
- `event: CalendarEvent` - 更新后的事件对象

**示例：**
```typescript
calendar.updateEvent({
  id: '1',
  title: '重要会议',
  start: new Date('2023-12-25T10:00:00'),
  end: new Date('2023-12-25T12:00:00')
})
```

### `removeEvent(eventId: string): void`

删除一个事件。

**参数：**
- `eventId: string` - 事件ID

**示例：**
```typescript
calendar.removeEvent('1')
```

### `getEvent(eventId: string): CalendarEvent | undefined`

获取指定ID的事件。

**参数：**
- `eventId: string` - 事件ID

**返回值：**
- `CalendarEvent | undefined` - 事件对象或undefined

**示例：**
```typescript
const event = calendar.getEvent('1')
if (event) {
  console.log(event.title)
}
```

### `getEvents(): CalendarEvent[]`

获取所有事件。

**返回值：**
- `CalendarEvent[]` - 事件数组

**示例：**
```typescript
const events = calendar.getEvents()
console.log(`共有 ${events.length} 个事件`)
```

### `getEventsByDate(date: Date): CalendarEvent[]`

获取指定日期的事件。

**参数：**
- `date: Date` - 日期

**返回值：**
- `CalendarEvent[]` - 事件数组

**示例：**
```typescript
const events = calendar.getEventsByDate(new Date('2023-12-25'))
console.log(`12月25日有 ${events.length} 个事件`)
```

### `getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent[]`

获取指定日期范围内的事件。

**参数：**
- `startDate: Date` - 开始日期
- `endDate: Date` - 结束日期

**返回值：**
- `CalendarEvent[]` - 事件数组

**示例：**
```typescript
const startDate = new Date('2023-12-01')
const endDate = new Date('2023-12-31')
const events = calendar.getEventsByDateRange(startDate, endDate)
console.log(`12月份有 ${events.length} 个事件`)
```

### `clearEvents(): void`

清除所有事件。

**示例：**
```typescript
calendar.clearEvents()
```

## 事件监听

### `on(eventType: string, handler: Function): void`

添加事件监听器。

**参数：**
- `eventType: string` - 事件类型
- `handler: Function` - 事件处理函数

**示例：**
```typescript
calendar.on('eventAdd', (event) => {
  console.log('事件已添加:', event)
})

calendar.on('dateClick', (date) => {
  console.log('点击日期:', date)
})
```

### `off(eventType: string, handler?: Function): void`

移除事件监听器。

**参数：**
- `eventType: string` - 事件类型
- `handler?: Function` - 可选的事件处理函数

**示例：**
```typescript
// 移除特定处理函数
calendar.off('eventAdd', handler)

// 移除所有该类型的监听器
calendar.off('eventAdd')
```

## 配置管理

### `getConfig(): CalendarConfig`

获取当前配置。

**返回值：**
- `CalendarConfig` - 配置对象

**示例：**
```typescript
const config = calendar.getConfig()
console.log(config.view) // 当前视图
```

### `updateConfig(config: Partial<CalendarConfig>): void`

更新配置。

**参数：**
- `config: Partial<CalendarConfig>` - 部分配置对象

**示例：**
```typescript
calendar.updateConfig({
  locale: 'en-US',
  showLunar: false
})
```

## 工具方法

### `refresh(): void`

刷新日历视图。

**示例：**
```typescript
calendar.refresh()
```

### `resize(): void`

调整日历大小（响应容器大小变化）。

**示例：**
```typescript
calendar.resize()
```

### `getContainer(): HTMLElement`

获取日历容器元素。

**返回值：**
- `HTMLElement` - 容器元素

**示例：**
```typescript
const container = calendar.getContainer()
console.log(container.clientWidth)
```

## 事件类型

Calendar 支持以下事件类型：

- `render` - 日历渲染完成
- `destroy` - 日历销毁
- `viewChange` - 视图切换
- `dateChange` - 日期变化
- `eventAdd` - 事件添加
- `eventUpdate` - 事件更新
- `eventRemove` - 事件删除
- `eventClick` - 事件点击
- `dateClick` - 日期点击
- `dateSelect` - 日期选择

## 注意事项

1. **内存管理**：使用完毕后请调用 `destroy()` 方法清理资源
2. **事件监听**：及时移除不需要的事件监听器
3. **配置更新**：配置更新后会自动重新渲染
4. **日期格式**：建议使用 Date 对象而不是字符串
5. **容器要求**：确保容器元素存在且有足够的空间
