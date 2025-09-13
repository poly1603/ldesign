# @ldesign/calendar 文档

欢迎使用 @ldesign/calendar！这是一个功能丰富、高性能的现代化日历组件。

## 📖 文档导航

### 🚀 快速开始
- [安装和基础使用](./guide/getting-started.md)
- [Vue 3 集成](./guide/vue-integration.md)
- [React 集成](./guide/react-integration.md)
- [配置选项](./guide/configuration.md)

### 📚 API 参考
- [Calendar 核心类](./api/calendar.md)
- [EventManager 事件管理](./api/event-manager.md)
- [StateManager 状态管理](./api/state-manager.md)
- [工具函数](./api/utils.md)
- [类型定义](./api/types.md)

### 🎨 主题系统
- [主题概述](./themes/overview.md)
- [内置主题](./themes/built-in.md)
- [自定义主题](./themes/custom.md)
- [主题切换](./themes/switching.md)

### 🔌 插件系统
- [插件概述](./plugins/overview.md)
- [内置插件](./plugins/built-in.md)
- [插件开发](./plugins/development.md)
- [插件API](./plugins/api.md)

### 🌍 国际化
- [多语言支持](./i18n/overview.md)
- [语言包](./i18n/language-packs.md)
- [自定义翻译](./i18n/custom.md)

### 📱 视图系统
- [月视图](./views/month-view.md)
- [周视图](./views/week-view.md)
- [日视图](./views/day-view.md)
- [视图切换](./views/switching.md)

### 📅 事件管理
- [事件基础](./events/basics.md)
- [事件操作](./events/operations.md)
- [重复事件](./events/recurring.md)
- [事件拖拽](./events/drag-drop.md)

### ⚡ 性能优化
- [性能最佳实践](./performance/best-practices.md)
- [内存管理](./performance/memory.md)
- [渲染优化](./performance/rendering.md)

### 🧪 测试
- [测试指南](./testing/guide.md)
- [测试用例](./testing/test-cases.md)

### 📦 构建和部署
- [构建配置](./build/configuration.md)
- [打包优化](./build/optimization.md)
- [部署指南](./build/deployment.md)

## 🎯 特性概览

### 核心功能
- **多视图模式**：月视图、周视图、日视图
- **事件管理**：完整的CRUD操作，支持拖拽
- **国际化**：内置中英文，支持自定义语言包
- **主题系统**：多套内置主题，支持自定义
- **响应式设计**：完美适配各种屏幕尺寸

### 高级功能
- **插件系统**：可扩展的架构，支持自定义插件
- **性能优化**：虚拟滚动、事件优化、内存管理
- **农历支持**：显示农历日期和传统节日
- **节假日标记**：内置节假日数据
- **键盘导航**：完整的快捷键支持

### 开发体验
- **TypeScript**：完整的类型定义
- **全面测试**：148个测试用例，100%覆盖
- **详细文档**：完整的API文档和使用示例
- **示例代码**：丰富的示例和最佳实践

## 🚀 快速开始

```typescript
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

// 创建日历实例
const calendar = new Calendar('#calendar', {
  view: 'month',
  locale: 'zh-CN'
})

// 添加事件
calendar.addEvent({
  id: '1',
  title: '重要会议',
  start: new Date('2023-12-25T10:00:00'),
  end: new Date('2023-12-25T11:00:00')
})

// 渲染日历
calendar.render()
```

## 📞 获取帮助

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

1. **查看文档**：本文档包含了详细的使用说明和API参考
2. **查看示例**：[examples](../examples/) 目录包含了丰富的示例代码
3. **提交Issue**：在GitHub上提交问题和建议
4. **参与讨论**：加入我们的社区讨论

## 🤝 贡献

我们欢迎任何形式的贡献！请查看 [贡献指南](./contributing.md) 了解如何参与项目开发。

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](../LICENSE) 文件。
