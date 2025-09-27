# LDesign Time Picker 时间选择器

一个功能丰富、易于使用的时间选择器组件，支持12/24小时制、国际化、时间范围限制等多种高级功能。

## ✨ 特性

- 🕐 支持 24 小时制和 12 小时制（带 AM/PM 选择）
- 🌍 国际化支持，可自定义文本
- 🚀 预设时间快速选择
- 🔒 时间范围限制和禁用特定时间
- 🧹 可清除功能
- 📱 响应式设计，支持移动端
- ⚡ 高性能滚动动画
- 🎨 多种尺寸和显示模式
- ♿ 完整的键盘导航支持

## 📦 安装

```bash
npm install @ldesign/webcomponent
```

## 🔨 基本用法

### 24小时制（默认）

```html
<ldesign-time-picker value="14:30:00"></ldesign-time-picker>
```

### 12小时制

```html
<ldesign-time-picker 
    output-format="12h" 
    value="14:30:00">
</ldesign-time-picker>
<!-- 输出: 02:30:00 PM -->
```

### 可清除

```html
<ldesign-time-picker 
    clearable="true" 
    value="10:30:00">
</ldesign-time-picker>
```

## 🎯 API

### 属性 (Props)

#### 基础属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 当前时间值 | `string` | - |
| defaultValue | 默认时间值 | `string` | - |
| placeholder | 占位文本 | `string` | '选择时间' |
| disabled | 是否禁用 | `boolean` | false |
| readonly | 是否只读 | `boolean` | false |
| clearable | 是否可清除 | `boolean` | false |
| loading | 是否加载中 | `boolean` | false |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | 'medium' |
| outputFormat | 输出格式 | `'12h' \| '24h'` | '24h' |

#### 显示控制

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| showSeconds | 是否显示秒 | `boolean` | true |
| showNow | 是否显示"此刻"按钮 | `boolean` | true |
| confirm | 是否需要确认按钮 | `boolean` | true |
| inline | 内联模式（直接显示面板） | `boolean` | false |
| steps | 时分秒的步进 | `number[]` | [1, 1, 1] |
| visibleItems | 可见选项数量 | `number` | 5 |

#### 时间限制

| 属性 | 说明 | 类型 | 默认值 | 示例 |
|------|------|------|--------|------|
| minTime | 最小时间 | `string` | - | "09:00:00" |
| maxTime | 最大时间 | `string` | - | "18:00:00" |
| disabledHours | 禁用的小时 | `number[]` | - | [0, 1, 2, 22, 23] |
| disabledMinutes | 禁用的分钟 | `number[]` | - | [30, 45] |
| disabledSeconds | 禁用的秒 | `number[]` | - | [0] |

#### 高级功能

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| presets | 预设时间列表 | `TimePreset[]` | - |
| locale | 国际化配置 | `TimePickerLocale` | - |

#### 弹层控制

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| trigger | 触发方式 | `'click' \| 'focus' \| 'manual'` | 'click' |
| placement | 弹层位置 | `Placement` | 'bottom-start' |
| visible | 是否显示（manual模式） | `boolean` | false |
| overlay | 弹层类型 | `'auto' \| 'popup' \| 'drawer'` | 'auto' |

### 事件 (Events)

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldesignChange | 值变化时触发 | `(value: string \| undefined) => void` |
| ldesignPick | 选择时间时触发 | `({ value: string, context: { trigger: string } }) => void` |
| ldesignOpen | 打开面板时触发 | `() => void` |
| ldesignClose | 关闭面板时触发 | `() => void` |
| ldesignVisibleChange | 显示状态变化时触发 | `(visible: boolean) => void` |

### 类型定义

#### TimePreset
```typescript
interface TimePreset {
  label: string;    // 预设名称
  value: string;    // 时间值
  icon?: string;    // 图标名称（可选）
}
```

#### TimePickerLocale
```typescript
interface TimePickerLocale {
  placeholder?: string;  // 占位文本
  now?: string;         // "此刻"按钮文本
  confirm?: string;     // "确定"按钮文本
  clear?: string;       // "清除"按钮文本
  am?: string;          // 上午文本
  pm?: string;          // 下午文本
}
```

## 🌟 进阶用法

### 时间范围限制

限制可选时间在工作时间内：

```html
<ldesign-time-picker 
    min-time="09:00:00"
    max-time="18:00:00"
    value="12:00:00">
</ldesign-time-picker>
```

### 禁用特定时间

禁用凌晨和深夜时段：

```html
<ldesign-time-picker 
    disabled-hours="[0,1,2,3,4,5,22,23]"
    value="09:00:00">
</ldesign-time-picker>
```

### 预设时间

提供快速选择的预设时间：

```html
<ldesign-time-picker 
    presets='[
        {"label": "上班", "value": "09:00:00", "icon": "work"},
        {"label": "午餐", "value": "12:00:00", "icon": "restaurant"},
        {"label": "下班", "value": "18:00:00", "icon": "home"}
    ]'>
</ldesign-time-picker>
```

### 步进控制

设置15分钟的步进间隔：

```html
<ldesign-time-picker 
    steps="[1,15,1]"
    value="10:15:00">
</ldesign-time-picker>
```

### 国际化

英文界面示例：

```html
<ldesign-time-picker 
    output-format="12h"
    locale='{
        "placeholder": "Select time", 
        "now": "Now", 
        "confirm": "OK", 
        "clear": "Clear",
        "am": "AM",
        "pm": "PM"
    }'>
</ldesign-time-picker>
```

中文界面示例：

```html
<ldesign-time-picker 
    output-format="12h"
    locale='{
        "placeholder": "请选择时间", 
        "now": "此刻", 
        "confirm": "确定", 
        "clear": "清除",
        "am": "上午",
        "pm": "下午"
    }'>
</ldesign-time-picker>
```

### 内联模式

直接显示时间选择面板，无需弹层：

```html
<ldesign-time-picker 
    inline="true"
    output-format="12h"
    value="14:30:00">
</ldesign-time-picker>
```

### 组合使用

一个完整的示例，包含多个功能：

```html
<ldesign-time-picker 
    output-format="12h"
    clearable="true"
    show-now="true"
    min-time="09:00:00"
    max-time="18:00:00"
    steps="[1,15,1]"
    presets='[
        {"label": "Morning", "value": "09:00:00"},
        {"label": "Noon", "value": "12:00:00"},
        {"label": "Evening", "value": "17:00:00"}
    ]'
    locale='{"placeholder": "Pick a time", "now": "Now", "clear": "Clear"}'
    value="12:00:00">
</ldesign-time-picker>
```

## 🎨 样式定制

组件使用 CSS 变量，可以通过覆盖这些变量来自定义样式：

```css
ldesign-time-picker {
  --ldesign-border-color: #e5e7eb;
  --ldesign-border-color-hover: #d1d5db;
  --ldesign-bg-color: #ffffff;
  --ldesign-bg-color-readonly: #f9fafb;
  --ldesign-text-color: #111827;
  --ldesign-text-color-secondary: #6b7280;
}
```

## 📱 响应式设计

组件会根据屏幕宽度自动切换显示模式：

- 桌面端（≥1024px）：使用弹出层（Popup）
- 移动端（<1024px）：使用抽屉（Drawer）

可以通过 `overlay` 属性强制指定显示模式：

```html
<!-- 强制使用弹出层 -->
<ldesign-time-picker overlay="popup"></ldesign-time-picker>

<!-- 强制使用抽屉 -->
<ldesign-time-picker overlay="drawer"></ldesign-time-picker>
```

## ⌨️ 键盘支持

- `Enter` / `Space`: 打开时间选择器
- `Escape`: 关闭时间选择器
- `ArrowDown`: 打开时间选择器
- `Tab`: 在选项间导航

## 📝 示例页面

查看完整的功能演示：

1. 构建组件
```bash
npm run build
```

2. 启动测试服务器
```bash
python serve.py
```

3. 访问示例页面
- 完整功能演示: http://localhost:8000/src/components/time-picker/examples.html
- 12小时制测试: http://localhost:8000/src/components/time-picker/test-12hour.html

## 🔄 版本历史

### v1.2.0 (最新)
- ✅ 新增清除功能 (`clearable`)
- ✅ 新增只读模式 (`readonly`)
- ✅ 新增加载状态 (`loading`)
- ✅ 新增时间范围限制 (`minTime`, `maxTime`)
- ✅ 新增禁用特定时间功能
- ✅ 新增预设时间功能
- ✅ 新增国际化支持
- ✅ 修复12小时制AM/PM选择器显示问题
- ✅ 优化滚动动画性能

### v1.1.0
- 添加12小时制支持
- 添加步进控制
- 添加内联模式

### v1.0.0
- 初始版本发布

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*