# LDesign Calendar - Simple Vite + JavaScript Example

这是一个使用 Vite + 纯 JavaScript 的 LDesign Calendar 简单示例。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd examples/simple-vite-js
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 http://localhost:3003

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
simple-vite-js/
├── index.html          # HTML 入口文件（只有一个日历容器标签）
├── main.js             # JavaScript 主文件（直接使用 Calendar 类）
├── package.json        # 项目配置
├── vite.config.js      # Vite 配置
└── README.md           # 说明文档
```

## 🎯 核心特性

### 简单使用
- **单标签**: 只需要一个 `<div id="calendar"></div>` 标签
- **直接导入**: 直接从源码导入 Calendar 类
- **即开即用**: 无需复杂配置，开箱即用

### 完整功能
- ✅ 右键菜单（新建日程、查看详情、回到今天）
- ✅ 事件弹窗（创建、编辑、删除日程）
- ✅ 视图切换（月视图、周视图、日视图、台历视图）
- ✅ 农历显示（农历日期、传统节日、天干地支）
- ✅ 主题系统（多种主题风格）
- ✅ 国际化支持（中文/英文）
- ✅ 拖拽功能（事件拖拽和调整大小）
- ✅ 键盘操作（方向键导航、快捷键）
- ✅ 触摸支持（移动端友好）

## 💻 代码示例

### HTML（只需一个标签）

```html
<div id="calendar"></div>
```

### JavaScript（直接使用 Calendar 类）

```javascript
import { Calendar } from '../../src/index.ts'
import '../../src/index.css'

// 创建日历实例
const calendar = new Calendar('#calendar', {
  locale: 'zh-CN',
  theme: 'default',
  view: 'month',
  showLunar: true,
  showHolidays: true,
  enableDragDrop: true
})

// 监听事件
calendar.on('dateSelect', (date) => {
  console.log('选择日期:', date.format('YYYY-MM-DD'))
})

// 添加事件
calendar.addEvent({
  title: '会议',
  start: new Date(),
  end: new Date(Date.now() + 2 * 60 * 60 * 1000),
  color: '#1890ff'
})
```

## 🎮 交互功能

### 鼠标操作
- **左键点击日期** - 选择日期
- **右键点击日期** - 显示上下文菜单
- **双击日期** - 查看日期详情
- **拖拽事件** - 移动事件到其他日期

### 键盘操作
- **方向键** - 导航日期
- **Enter** - 选择当前日期
- **Escape** - 关闭弹窗/菜单
- **Space** - 回到今天

### 触摸操作
- **点击** - 选择日期
- **长按** - 显示上下文菜单
- **滑动** - 切换月份

## 🔧 配置选项

```javascript
const config = {
  // 基础配置
  locale: 'zh-CN',           // 语言
  theme: 'default',          // 主题
  view: 'month',             // 默认视图
  
  // 显示选项
  showLunar: true,           // 显示农历
  showHolidays: true,        // 显示节日
  showWeekNumbers: false,    // 显示周数
  showToday: true,           // 高亮今天
  
  // 交互功能
  enableDragDrop: true,      // 拖拽功能
  enableResize: true,        // 调整大小
  enableKeyboard: true,      // 键盘操作
  enableTouch: true,         // 触摸操作
  
  // 动画配置
  animation: {
    enabled: true,           // 启用动画
    duration: 300,           // 动画时长
    easing: 'ease-in-out'    // 缓动函数
  }
}
```

## 🎨 主题系统

支持多种内置主题：
- `default` - 默认主题
- `dark` - 深色主题
- `blue` - 蓝色主题
- `green` - 绿色主题

```javascript
// 切换主题
calendar.setTheme('dark')
```

## 🌍 国际化

支持多语言：
- `zh-CN` - 简体中文
- `en-US` - 英语

```javascript
// 切换语言
calendar.setLocale('en-US')
```

## 📱 响应式设计

自动适配不同屏幕尺寸：
- **桌面端** - 完整功能体验
- **平板端** - 优化的触摸交互
- **手机端** - 简化的移动界面

## 🐛 调试

在浏览器控制台中可以访问：
- `window.calendar` - 日历实例
- 完整的事件日志
- 详细的错误信息

## 📄 许可证

MIT License
