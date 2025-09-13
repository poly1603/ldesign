# API 参考

@ldesign/calendar 提供了丰富的API接口，支持各种日历操作和自定义需求。

## 📚 API 文档目录

### 核心类
- [Calendar](./calendar.md) - 日历核心类，主要的API入口
- [EventManager](./event-manager.md) - 事件管理器，处理事件的增删改查
- [StateManager](./state-manager.md) - 状态管理器，管理日历状态

### 视图类
- [MonthView](./month-view.md) - 月视图实现
- [WeekView](./week-view.md) - 周视图实现
- [DayView](./day-view.md) - 日视图实现

### 管理器类
- [ThemeManager](./theme-manager.md) - 主题管理器
- [I18nManager](./i18n-manager.md) - 国际化管理器
- [PluginManager](./plugin-manager.md) - 插件管理器

### 工具函数
- [日期工具](./date-utils.md) - 日期处理相关工具函数
- [格式化工具](./format-utils.md) - 格式化相关工具函数
- [验证工具](./validation-utils.md) - 数据验证相关工具函数
- [性能工具](./performance-utils.md) - 性能优化相关工具函数

### 类型定义
- [Calendar Types](./types/calendar.md) - 日历相关类型
- [Event Types](./types/event.md) - 事件相关类型
- [View Types](./types/view.md) - 视图相关类型
- [Plugin Types](./types/plugin.md) - 插件相关类型

## 🚀 快速参考

### Calendar 核心方法

```typescript
// 创建日历
const calendar = new Calendar(container, config)

// 渲染日历
calendar.render()

// 视图操作
calendar.setView('month' | 'week' | 'day')
calendar.getCurrentView()

// 日期导航
calendar.next()
calendar.prev()
calendar.today()
calendar.goToDate(date)

// 事件操作
calendar.addEvent(event)
calendar.updateEvent(event)
calendar.removeEvent(eventId)
calendar.getEvents()

// 事件监听
calendar.on('eventAdd', handler)
calendar.off('eventAdd', handler)

// 销毁
calendar.destroy()
```

### EventManager 核心方法

```typescript
// 事件管理
eventManager.addEvent(event)
eventManager.updateEvent(event)
eventManager.removeEvent(eventId)
eventManager.getEvent(eventId)
eventManager.getEvents()
eventManager.clearEvents()

// 查询方法
eventManager.getEventsByDate(date)
eventManager.getEventsByDateRange(startDate, endDate)

// 事件监听
eventManager.on('eventAdd', handler)
eventManager.on('eventUpdate', handler)
eventManager.on('eventRemove', handler)
```

### StateManager 核心方法

```typescript
// 状态管理
stateManager.getCurrentDate()
stateManager.setCurrentDate(date)
stateManager.getCurrentView()
stateManager.setCurrentView(view)

// 事件状态
stateManager.getEvents()
stateManager.setEvents(events)
stateManager.getSelectedEvent()
stateManager.setSelectedEvent(eventId)

// 配置状态
stateManager.getConfig()
stateManager.updateConfig(config)
```

## 🎯 常用配置

### CalendarConfig

```typescript
interface CalendarConfig {
  // 基础配置
  container: HTMLElement | string
  view: 'month' | 'week' | 'day'
  date: Date
  locale: string
  timezone: string
  
  // 显示配置
  showWeekNumbers: boolean
  showLunar: boolean
  showHolidays: boolean
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  
  // 时间配置
  timeFormat: '12h' | '24h'
  dateFormat: string
  firstDayOfWeek: number
  
  // 功能配置
  editable: boolean
  selectable: boolean
  dragAndDrop: boolean
  
  // 主题配置
  theme: string
  customTheme: ThemeConfig
  
  // 插件配置
  plugins: PluginConfig[]
}
```

### CalendarEvent

```typescript
interface CalendarEvent {
  // 基础信息
  id: string
  title: string
  description?: string
  
  // 时间信息
  start: Date
  end: Date
  allDay: boolean
  
  // 显示配置
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  
  // 分类信息
  type?: string
  category?: string
  tags?: string[]
  
  // 位置信息
  location?: string
  
  // 重复配置
  recurrence?: RecurrenceConfig
  
  // 提醒配置
  reminders?: ReminderConfig[]
  
  // 自定义数据
  customData?: Record<string, any>
  
  // 状态信息
  editable?: boolean
  deletable?: boolean
  draggable?: boolean
}
```

## 🔧 事件系统

### 事件类型

```typescript
// 日历事件
'viewChange' | 'dateChange' | 'render' | 'destroy'

// 事件管理事件
'eventAdd' | 'eventUpdate' | 'eventRemove' | 'eventClick' | 'eventSelect'

// 交互事件
'dateClick' | 'dateSelect' | 'eventDrag' | 'eventDrop' | 'eventResize'

// 导航事件
'prev' | 'next' | 'today' | 'goToDate'
```

### 事件监听示例

```typescript
// 监听事件添加
calendar.on('eventAdd', (event) => {
  console.log('事件已添加:', event)
})

// 监听日期点击
calendar.on('dateClick', (date) => {
  console.log('点击日期:', date)
})

// 监听视图切换
calendar.on('viewChange', (view) => {
  console.log('视图已切换:', view)
})
```

## 📖 详细文档

每个API都有详细的文档说明，包括：
- 方法签名和参数说明
- 返回值类型和说明
- 使用示例和最佳实践
- 注意事项和常见问题

请点击上方链接查看具体的API文档。
