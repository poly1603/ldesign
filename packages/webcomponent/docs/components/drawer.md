# Drawer 抽屉

抽屉组件是一个从屏幕边缘滑出的面板，常用于显示导航菜单、表单、详情信息等内容。该组件提供了丰富的功能和高性能的实现。

## 特性

- 🎯 **多方向支持** - 支持从左、右、上、下四个方向弹出
- 🎨 **多种尺寸** - 预设尺寸或自定义尺寸
- 🌗 **暗黑模式** - 内置亮色和暗色主题
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ✨ **流畅动画** - 自定义动画配置
- 🔧 **可调整大小** - 支持拖拽调整尺寸
- 📍 **吸附点** - 配置尺寸吸附点
- 👆 **滑动关闭** - 支持滑动手势关闭
- ⌨️ **键盘支持** - ESC 关闭、焦点管理
- ♿ **无障碍** - 完整的 ARIA 支持
- 🎭 **多层嵌套** - 支持多个抽屉同时打开
- 🚀 **高性能** - GPU 加速优化

## 基础用法

### 简单示例

打开和关闭抽屉的基本用法。

### 不同方向

支持从左、右、上、下四个方向弹出。

### 预设尺寸

提供 xs、sm、md、lg、xl、full 等预设尺寸，也可以使用自定义尺寸（像素或百分比）。

## 高级功能

### 可调整大小

启用 resizable 属性后，可以拖拽边缘调整抽屉大小。

### 滑动关闭

启用 swipe-to-close 属性，支持滑动手势关闭抽屉（移动端友好）。

### 底部按钮

通过 footerButtons 属性配置底部按钮。

### 加载状态

使用 showLoading() 和 hideLoading() 方法控制加载状态。

### 自定义内容

通过插槽自定义头部、底部和加载状态。

## API

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | boolean | false | 是否显示抽屉 |
| placement | string | right | 抽屉位置 |
| size | string/number | md | 抽屉大小 |
| mask | boolean | true | 是否显示遮罩 |
| mask-closable | boolean | true | 点击遮罩是否关闭 |
| closable | boolean | true | 是否显示关闭按钮 |
| z-index | number | 1000 | 层级 |
| theme | string | light | 主题 |
| resizable | boolean | false | 是否可调整大小 |
| min-size | number/string | 200 | 最小尺寸 |
| max-size | number/string | 90% | 最大尺寸 |
| swipe-to-close | boolean | false | 是否启用滑动关闭 |
| close-on-esc | boolean | true | 按ESC关闭 |
| auto-focus | boolean | true | 自动聚焦 |
| loading | boolean | false | 加载状态 |

### 方法

| 方法 | 参数 | 说明 |
|------|------|------|
| open() | - | 打开抽屉 |
| close(reason?) | string | 关闭抽屉 |
| toggle() | - | 切换状态 |
| resize(size) | number/string | 调整大小 |
| showLoading(text?) | string | 显示加载 |
| hideLoading() | - | 隐藏加载 |
| minimize() | - | 最小化 |
| maximize() | - | 最大化 |

### 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| drawerBeforeOpen | - | 打开前触发 |
| drawerOpen | - | 打开后触发 |
| drawerBeforeClose | { reason } | 关闭前触发 |
| drawerClose | { reason } | 关闭后触发 |
| drawerStateChange | { state } | 状态变化 |
| drawerResize | { width, height } | 大小变化 |

### 插槽

| 插槽 | 说明 |
|------|------|
| default | 主内容区域 |
| header | 自定义头部 |
| footer | 自定义底部 |
| loading | 自定义加载 |
| extra | 头部右侧额外内容 |

## 许可证

MIT License