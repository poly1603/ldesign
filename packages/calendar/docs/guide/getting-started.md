# 快速开始

本指南将帮助您快速上手 @ldesign/calendar，从安装到创建第一个日历应用。

## 📦 安装

### 使用 npm

```bash
npm install @ldesign/calendar
```

### 使用 yarn

```bash
yarn add @ldesign/calendar
```

### 使用 pnpm

```bash
pnpm add @ldesign/calendar
```

## 🚀 基础使用

### 1. 引入样式和脚本

```typescript
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'
```

### 2. 创建HTML容器

```html
<div id="calendar" style="width: 100%; height: 600px;"></div>
```

### 3. 初始化日历

```typescript
// 创建日历实例
const calendar = new Calendar('#calendar', {
  view: 'month',
  locale: 'zh-CN'
})

// 渲染日历
calendar.render()
```

## 🎯 完整示例

### HTML

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>日历示例</title>
  <style>
    .calendar-container {
      width: 100%;
      height: 600px;
      margin: 20px auto;
      max-width: 1200px;
    }
  </style>
</head>
<body>
  <div class="calendar-container">
    <div id="calendar"></div>
  </div>
</body>
</html>
```

### JavaScript

```typescript
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

// 创建日历实例
const calendar = new Calendar('#calendar', {
  // 基础配置
  view: 'month',
  locale: 'zh-CN',
  date: new Date(),
  
  // 显示配置
  showLunar: true,
  showHolidays: true,
  showWeekNumbers: true,
  
  // 功能配置
  editable: true,
  selectable: true,
  dragAndDrop: true,
  
  // 事件回调
  onEventClick: (event) => {
    console.log('点击事件:', event)
  },
  onDateClick: (date) => {
    console.log('点击日期:', date)
  }
})

// 添加示例事件
calendar.addEvent({
  id: '1',
  title: '团队会议',
  start: new Date('2023-12-25T10:00:00'),
  end: new Date('2023-12-25T11:00:00'),
  color: '#722ED1',
  description: '讨论项目进展'
})

calendar.addEvent({
  id: '2',
  title: '项目评审',
  start: new Date('2023-12-26T14:00:00'),
  end: new Date('2023-12-26T16:00:00'),
  color: '#52C41A',
  description: '产品功能评审'
})

// 渲染日历
calendar.render()

// 添加事件监听
calendar.on('eventAdd', (event) => {
  console.log('新增事件:', event)
})

calendar.on('viewChange', (view) => {
  console.log('视图切换:', view)
})
```

## 🎨 配置选项

### 基础配置

```typescript
const calendar = new Calendar('#calendar', {
  // 视图类型：'month' | 'week' | 'day'
  view: 'month',
  
  // 初始日期
  date: new Date(),
  
  // 语言设置
  locale: 'zh-CN',
  
  // 时区设置
  timezone: 'Asia/Shanghai'
})
```

### 显示配置

```typescript
const calendar = new Calendar('#calendar', {
  // 显示农历
  showLunar: true,
  
  // 显示节假日
  showHolidays: true,
  
  // 显示周数
  showWeekNumbers: true,
  
  // 一周开始日（0=周日，1=周一）
  weekStartsOn: 1,
  
  // 时间格式
  timeFormat: '24h'
})
```

### 功能配置

```typescript
const calendar = new Calendar('#calendar', {
  // 是否可编辑
  editable: true,
  
  // 是否可选择
  selectable: true,
  
  // 是否支持拖拽
  dragAndDrop: true,
  
  // 最小时间
  minTime: '08:00',
  
  // 最大时间
  maxTime: '18:00'
})
```

## 📅 事件管理

### 添加事件

```typescript
// 基础事件
calendar.addEvent({
  id: '1',
  title: '会议',
  start: new Date('2023-12-25T10:00:00'),
  end: new Date('2023-12-25T11:00:00')
})

// 全天事件
calendar.addEvent({
  id: '2',
  title: '假期',
  start: new Date('2023-12-25'),
  end: new Date('2023-12-26'),
  allDay: true
})

// 带样式的事件
calendar.addEvent({
  id: '3',
  title: '重要会议',
  start: new Date('2023-12-25T14:00:00'),
  end: new Date('2023-12-25T16:00:00'),
  color: '#722ED1',
  backgroundColor: '#F1ECF9',
  borderColor: '#722ED1',
  textColor: '#FFFFFF'
})
```

### 更新事件

```typescript
calendar.updateEvent({
  id: '1',
  title: '更新后的会议',
  start: new Date('2023-12-25T11:00:00'),
  end: new Date('2023-12-25T12:00:00')
})
```

### 删除事件

```typescript
calendar.removeEvent('1')
```

### 查询事件

```typescript
// 获取所有事件
const allEvents = calendar.getEvents()

// 获取指定日期的事件
const dayEvents = calendar.getEventsByDate(new Date('2023-12-25'))

// 获取日期范围内的事件
const rangeEvents = calendar.getEventsByDateRange(
  new Date('2023-12-01'),
  new Date('2023-12-31')
)
```

## 🎭 视图切换

```typescript
// 切换到月视图
calendar.setView('month')

// 切换到周视图
calendar.setView('week')

// 切换到日视图
calendar.setView('day')

// 获取当前视图
const currentView = calendar.getCurrentView()
```

## 🧭 日期导航

```typescript
// 下一个时间段
calendar.next()

// 上一个时间段
calendar.prev()

// 回到今天
calendar.today()

// 跳转到指定日期
calendar.goToDate(new Date('2023-12-25'))
```

## 🎧 事件监听

```typescript
// 监听事件添加
calendar.on('eventAdd', (event) => {
  console.log('事件已添加:', event)
})

// 监听日期点击
calendar.on('dateClick', (date) => {
  console.log('点击日期:', date)
  // 可以在这里添加新事件
})

// 监听事件点击
calendar.on('eventClick', (event) => {
  console.log('点击事件:', event)
  // 可以在这里显示事件详情
})

// 监听视图切换
calendar.on('viewChange', (view) => {
  console.log('视图已切换到:', view)
})
```

## 🧹 清理资源

```typescript
// 销毁日历实例
calendar.destroy()
```

## 📱 响应式设计

日历组件自动适配不同屏幕尺寸：

```css
/* 移动端优化 */
@media (max-width: 768px) {
  .calendar-container {
    height: 400px;
  }
}

/* 平板端优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .calendar-container {
    height: 500px;
  }
}

/* 桌面端优化 */
@media (min-width: 1025px) {
  .calendar-container {
    height: 600px;
  }
}
```

## 🔧 常见问题

### Q: 如何自定义主题？
A: 可以通过CSS变量或主题配置来自定义主题，详见[主题系统文档](../themes/overview.md)。

### Q: 如何添加自定义插件？
A: 可以通过插件系统添加自定义功能，详见[插件开发文档](../plugins/development.md)。

### Q: 如何处理时区问题？
A: 可以通过配置 `timezone` 选项来处理时区，详见[配置文档](./configuration.md)。

## 🎯 下一步

- 查看 [配置选项](./configuration.md) 了解更多配置
- 学习 [Vue 3 集成](./vue-integration.md) 或 [React 集成](./react-integration.md)
- 探索 [主题系统](../themes/overview.md) 自定义样式
- 了解 [插件系统](../plugins/overview.md) 扩展功能
