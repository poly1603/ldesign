# @ldesign/calendar

一个功能丰富、高性能的现代化日历组件，基于 TypeScript 开发，支持多种视图模式和丰富的交互功能。

## ✨ 特性

- 🗓️ **多种视图模式**：月视图、周视图、日视图，灵活切换
- 📅 **完整事件管理**：添加、编辑、删除、拖拽事件，支持重复事件
- 🎨 **强大主题系统**：内置多套主题，支持自定义主题和动态切换
- 🌍 **国际化支持**：内置中英文，支持自定义语言包
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🔌 **插件系统**：可扩展的插件架构，支持自定义功能
- ⚡ **高性能优化**：虚拟滚动、事件优化、内存管理
- 🎯 **TypeScript**：完整的类型定义，优秀的开发体验
- 🧪 **全面测试**：148个测试用例，100%覆盖核心功能
- 📖 **完整文档**：详细的API文档和使用示例

## 📦 安装

```bash
npm install @ldesign/calendar
# 或
yarn add @ldesign/calendar
# 或
pnpm add @ldesign/calendar
```

## 🚀 快速开始

### 基础用法

```typescript
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

// 创建日历实例
const calendar = new Calendar('#calendar', {
  view: 'month',
  locale: 'zh-CN',
  showLunar: true,
  showHolidays: true
})

// 添加事件
calendar.addEvent({
  id: '1',
  title: '重要会议',
  start: new Date('2023-12-25T10:00:00'),
  end: new Date('2023-12-25T11:00:00'),
  color: '#722ED1',
  description: '年度总结会议'
})

// 渲染日历
calendar.render()
```

### Vue 3 集成

```vue
<template>
  <div ref="calendarRef" class="calendar-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

const calendarRef = ref<HTMLElement>()
let calendar: Calendar | null = null

onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: 'month',
      locale: 'zh-CN'
    })
    calendar.render()
  }
})

onUnmounted(() => {
  calendar?.destroy()
})
</script>
```

### React 集成

```tsx
import React, { useRef, useEffect } from 'react'
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

const CalendarComponent: React.FC = () => {
  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarInstance = useRef<Calendar | null>(null)

  useEffect(() => {
    if (calendarRef.current) {
      calendarInstance.current = new Calendar(calendarRef.current, {
        view: 'month',
        locale: 'zh-CN'
      })
      calendarInstance.current.render()
    }

    return () => {
      calendarInstance.current?.destroy()
    }
  }, [])

  return <div ref={calendarRef} className="calendar-container" />
}

export default CalendarComponent
```

## 📚 文档

- [完整文档](./docs/README.md)
- [API 参考](./docs/api/README.md)
- [使用指南](./docs/guide/README.md)
- [示例代码](./examples/README.md)

## 🎯 核心功能

### 视图模式
- **月视图**：显示整月日期，支持农历和节假日
- **周视图**：显示一周日期，支持时间轴和事件拖拽
- **日视图**：显示单日详情，支持小时级别的事件管理

### 事件管理
- 创建、编辑、删除事件
- 拖拽调整事件时间
- 重复事件设置
- 事件提醒和通知
- 事件分类和颜色标记

### 主题系统
- 默认主题（紫色）
- 暗色主题
- 蓝色主题
- 绿色主题
- 支持自定义主题

### 插件扩展
- 时间选择器插件
- 事件提醒插件
- 导出插件（支持 iCal、JSON、CSV）
- 自定义插件开发

## 🛠️ 开发

```bash
# 克隆项目
git clone <repository-url>
cd ldesign/packages/calendar

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 启动文档
pnpm docs:dev
```

## 🧪 测试

项目包含完整的测试套件：

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test src/core

# 测试覆盖率
pnpm test:coverage
```

测试统计：
- **148个测试用例**
- **100%通过率**
- 覆盖核心功能、工具函数、组件交互

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请通过以下方式联系：
- 提交 [Issue](../../issues)
- 查看 [文档](./docs/README.md)
- 参考 [示例](./examples/README.md)
