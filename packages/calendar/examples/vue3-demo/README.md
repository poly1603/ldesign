# @ldesign/calendar Vue3 示例

这是一个使用 Vue 3 + Vite 构建的 @ldesign/calendar 完整示例项目，展示了日历组件的各种功能和用法。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
vue3-demo/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── BasicCalendar.vue       # 基础日历示例
│   │   ├── AdvancedCalendar.vue    # 高级功能示例
│   │   ├── FullFeaturedCalendar.vue # 完整功能示例
│   │   ├── EventModal.vue          # 事件编辑弹窗
│   │   └── ThemeDemo.vue           # 主题演示
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 应用入口
│   ├── style.css            # 全局样式
│   └── env.d.ts             # 类型声明
├── index.html               # HTML 模板
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 项目说明
```

## 🎯 功能演示

### 1. 基础日历 (BasicCalendar.vue)

展示日历的基本功能：
- 月视图显示
- 日期导航（上个月/下个月/今天）
- 农历和节假日显示
- 基础事件展示
- 日期点击事件

**核心代码：**
```vue
<script setup lang="ts">
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

const calendar = new Calendar('#calendar', {
  view: 'month',
  locale: 'zh-CN',
  showLunar: true,
  showHolidays: true
})

calendar.render()
</script>
```

### 2. 高级功能 (AdvancedCalendar.vue)

展示日历的高级功能：
- 多视图切换（月/周/日）
- 功能开关（农历/节假日）
- 事件管理（添加/编辑/删除）
- 拖拽支持
- 统计信息显示

**核心功能：**
- 视图切换
- 配置动态更新
- 事件交互
- 实时统计

### 3. 完整功能 (FullFeaturedCalendar.vue)

展示日历的完整功能：
- 完整的工具栏
- 事件列表侧边栏
- 事件编辑弹窗
- 导出功能
- 主题切换
- 响应式布局

**特色功能：**
- 事件管理界面
- 数据导出
- 主题系统
- 移动端适配

### 4. 事件编辑弹窗 (EventModal.vue)

功能完整的事件编辑界面：
- 表单验证
- 时间选择
- 全天事件支持
- 颜色选择
- 位置信息

### 5. 主题演示 (ThemeDemo.vue)

展示主题系统：
- 多套内置主题
- 实时主题切换
- 主题变量展示
- 颜色预览

## 🎨 主题系统

项目包含5套内置主题：

1. **默认主题** - 紫色系，适合大多数场景
2. **蓝色主题** - 商务风格，专业稳重
3. **绿色主题** - 自然清新，健康环保
4. **橙色主题** - 温暖活力，创意场景
5. **深色主题** - 夜间模式，专业场景

### 自定义主题

通过CSS变量自定义主题：

```css
:root {
  --ldesign-brand-color: #your-color;
  --ldesign-brand-color-hover: #your-hover-color;
  --ldesign-brand-color-active: #your-active-color;
  --ldesign-brand-color-focus: #your-focus-color;
}
```

## 📱 响应式设计

项目完全支持响应式设计：

- **桌面端** (>1024px): 完整功能布局
- **平板端** (768px-1024px): 适配布局调整
- **移动端** (<768px): 移动优化布局

### 响应式特性

- 自适应工具栏布局
- 侧边栏折叠
- 触摸友好的交互
- 移动端优化的弹窗

## 🔧 开发指南

### 集成到现有项目

1. **安装依赖**
```bash
npm install @ldesign/calendar
```

2. **引入组件**
```typescript
import { Calendar } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'
```

3. **创建日历**
```typescript
const calendar = new Calendar('#calendar', {
  view: 'month',
  locale: 'zh-CN'
})
calendar.render()
```

### Vue 3 最佳实践

1. **组件封装**
```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const calendarRef = ref<HTMLElement>()
let calendar: Calendar | null = null

onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, config)
    calendar.render()
  }
})

onUnmounted(() => {
  calendar?.destroy()
})
</script>
```

2. **事件处理**
```typescript
// 监听日历事件
calendar.on('eventClick', (event) => {
  console.log('事件点击:', event)
})

calendar.on('dateClick', (date) => {
  console.log('日期点击:', date)
})
```

3. **响应式数据**
```typescript
const events = ref<CalendarEvent[]>([])

// 监听事件变化
watch(events, (newEvents) => {
  calendar?.clearEvents()
  newEvents.forEach(event => {
    calendar?.addEvent(event)
  })
}, { deep: true })
```

## 🧪 测试

运行类型检查：
```bash
pnpm type-check
```

## 📚 相关文档

- [Calendar API 文档](../../docs/api/calendar.md)
- [Vue 3 集成指南](../../docs/guide/vue-integration.md)
- [主题系统文档](../../docs/themes/overview.md)
- [完整文档](../../docs/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
