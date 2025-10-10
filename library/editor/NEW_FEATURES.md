# 新增功能说明

## 概述

本次更新为富文本编辑器添加了 10+ 项重要功能，大幅提升了编辑器的实用性和用户体验。所有新功能都已完整实现并集成到示例中。

## 新增插件列表

### 1. 颜色插件 (Color Plugins)

#### 文字颜色插件 (TextColorPlugin)
- **功能**: 设置选中文本的颜色
- **使用**: 点击工具栏"调色板"图标，选择预设颜色或自定义颜色
- **预设颜色**: 80 种常用颜色
- **命令**: `setTextColor(color: string)`
- **图标**: `palette`

#### 背景颜色插件 (BackgroundColorPlugin)
- **功能**: 为选中文本添加背景高亮
- **使用**: 点击工具栏"荧光笔"图标，选择颜色
- **预设颜色**: 80 种常用颜色
- **命令**: `setBackgroundColor(color: string)`
- **图标**: `highlighter`

**示例代码**:
```typescript
import { TextColorPlugin, BackgroundColorPlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [TextColorPlugin, BackgroundColorPlugin]
})

// 设置文字颜色
editor.commands.execute('setTextColor', '#e74c3c')

// 设置背景颜色
editor.commands.execute('setBackgroundColor', '#f1c40f')
```

---

### 2. 字体插件 (Font Plugins)

#### 字体大小插件 (FontSizePlugin)
- **功能**: 设置选中文本的字体大小
- **使用**: 点击工具栏"字体大小"按钮，选择预设大小
- **预设大小**: 12px, 14px, 16px, 18px, 20px, 24px, 28px, 32px, 36px, 48px, 72px
- **命令**: `setFontSize(size: string)`
- **图标**: `type`

#### 字体家族插件 (FontFamilyPlugin)
- **功能**: 设置选中文本的字体
- **使用**: 点击工具栏"字体家族"按钮，选择字体
- **预设字体**:
  - 默认
  - 宋体 (SimSun)
  - 黑体 (SimHei)
  - 微软雅黑 (Microsoft YaHei)
  - 楷体 (KaiTi)
  - Arial
  - Times New Roman
  - Courier New
  - Georgia
  - Verdana
- **命令**: `setFontFamily(family: string)`
- **图标**: `type`

**示例代码**:
```typescript
import { FontSizePlugin, FontFamilyPlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [FontSizePlugin, FontFamilyPlugin]
})

// 设置字体大小
editor.commands.execute('setFontSize', '24px')

// 设置字体家族
editor.commands.execute('setFontFamily', 'Arial, sans-serif')
```

---

### 3. 上标和下标插件 (Script Plugins)

#### 上标插件 (SuperscriptPlugin)
- **功能**: 将选中文本设置为上标格式（如：x²）
- **使用**: 点击工具栏"上标"按钮或按 `Mod+Shift+.`
- **命令**: `toggleSuperscript`
- **快捷键**: `Mod+Shift+.`
- **图标**: `superscript`
- **应用场景**: 数学公式、注释标记

#### 下标插件 (SubscriptPlugin)
- **功能**: 将选中文本设置为下标格式（如：H₂O）
- **使用**: 点击工具栏"下标"按钮或按 `Mod+Shift+,`
- **命令**: `toggleSubscript`
- **快捷键**: `Mod+Shift+,`
- **图标**: `subscript`
- **应用场景**: 化学公式、脚注

**示例代码**:
```typescript
import { SuperscriptPlugin, SubscriptPlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [SuperscriptPlugin, SubscriptPlugin]
})

// 切换上标
editor.commands.execute('toggleSuperscript')

// 切换下标
editor.commands.execute('toggleSubscript')
```

---

### 4. 水平线插件 (HorizontalRulePlugin)

- **功能**: 在当前位置插入水平分隔线
- **使用**: 点击工具栏"水平线"按钮或按 `Mod+Shift+-`
- **命令**: `insertHorizontalRule`
- **快捷键**: `Mod+Shift+-`
- **图标**: `minus`
- **特性**: 插入后自动在下方创建新段落，方便继续编辑

**示例代码**:
```typescript
import { HorizontalRulePlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [HorizontalRulePlugin]
})

// 插入水平线
editor.commands.execute('insertHorizontalRule')
```

---

### 5. 缩进插件 (IndentPlugin)

- **功能**: 增加或减少文本缩进级别
- **使用**:
  - 增加缩进: 点击"缩进"按钮或按 `Tab`
  - 减少缩进: 点击"取消缩进"按钮或按 `Shift+Tab`
- **命令**:
  - `indent` - 增加缩进
  - `outdent` - 减少缩进
- **快捷键**:
  - `Tab` - 增加缩进
  - `Shift+Tab` - 减少缩进
- **图标**:
  - `indent` - 增加缩进
  - `outdent` - 减少缩进

**示例代码**:
```typescript
import { IndentPlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [IndentPlugin]
})

// 增加缩进
editor.commands.execute('indent')

// 减少缩进
editor.commands.execute('outdent')
```

---

### 6. 全屏插件 (FullscreenPlugin)

- **功能**: 切换编辑器全屏模式
- **使用**: 点击工具栏"全屏"按钮或按 `F11`
- **命令**: `toggleFullscreen`
- **快捷键**: `F11`
- **图标**: `maximize`
- **特性**:
  - 全屏状态下编辑器占据整个视口
  - 自动设置背景色和层级
  - 再次按 F11 或点击按钮退出全屏

**示例代码**:
```typescript
import { FullscreenPlugin } from '@ldesign/editor'

const editor = new Editor({
  plugins: [FullscreenPlugin]
})

// 切换全屏
editor.commands.execute('toggleFullscreen')

// 检查是否全屏
const isFullscreen = editor.element.classList.contains('fullscreen')
```

---

## UI 组件

### 颜色选择器 (ColorPicker)

全新的颜色选择器 UI 组件，提供直观的颜色选择体验：

- **80 种预设颜色**: 以网格形式展示，一键选择
- **自定义颜色**: 支持通过原生颜色选择器自定义任意颜色
- **悬停效果**: 颜色块悬停时放大显示
- **自动定位**: 根据按钮位置自动定位选择器
- **点击外部关闭**: 点击选择器外部自动关闭

**文件位置**: `src/ui/ColorPicker.ts`

### 下拉选择器 (Dropdown)

通用的下拉选择器组件，用于字体大小和字体家族选择：

- **选项列表**: 支持自定义选项列表
- **字体预览**: 字体家族选项使用对应字体渲染
- **滚动支持**: 选项过多时支持滚动
- **自动定位**: 根据按钮位置自动定位
- **样式化滚动条**: 美观的自定义滚动条样式

**文件位置**: `src/ui/Dropdown.ts`

---

## 图标更新

新增 9 个图标以支持新功能：

| 图标名称 | 用途 | 插件 |
|---------|------|------|
| `palette` | 调色板 | TextColorPlugin |
| `highlighter` | 荧光笔 | BackgroundColorPlugin |
| `type` | 字体 | FontSizePlugin, FontFamilyPlugin |
| `superscript` | 上标 | SuperscriptPlugin |
| `subscript` | 下标 | SubscriptPlugin |
| `minus` | 水平线 | HorizontalRulePlugin |
| `indent` | 增加缩进 | IndentPlugin |
| `outdent` | 减少缩进 | IndentPlugin |
| `maximize` | 全屏 | FullscreenPlugin |

所有图标均为内联 SVG，无需外部依赖。

---

## 工具栏集成

所有新插件已完全集成到工具栏系统中：

- **自动注册**: 插件安装时自动添加到工具栏
- **智能分组**: 相关功能自动分组，使用分隔符隔开
- **特殊处理**: 颜色和字体选择器在点击时显示选择 UI
- **快捷键提示**: 工具栏按钮显示对应的快捷键提示

**工具栏分组顺序**:
1. 历史操作 (撤销/重做)
2. 基础格式 (粗体/斜体/下划线/删除线/代码/清除格式)
3. 标题 (H1/H2/H3)
4. 列表 (无序/有序/任务列表)
5. 块级元素 (引用/代码块)
6. 媒体 (链接/图片/表格)
7. 对齐 (左对齐/居中/右对齐/两端对齐)
8. 颜色 (文字颜色/背景颜色)
9. 字体 (字体大小/字体家族)
10. 格式 (上标/下标)
11. 缩进 (增加缩进/减少缩进)
12. 其他 (水平线/全屏)

---

## 示例更新

所有示例已更新以展示新功能：

### 基础示例 (Basic Example)
- 新增所有 10 个插件
- 更新示例内容，展示颜色、字体、上下标等效果
- 添加"新增功能"章节说明

### 高级示例 (Advanced Example)
- 在表格功能基础上集成所有新插件
- 完整的工具栏功能演示

### Vue 示例 (Vue Example)
- Vue 3 + Composition API
- 所有新插件完整支持

### React 示例 (React Example)
- React 18 + Hooks
- 所有新插件完整支持

---

## 样式更新

新增 `ui.css` 样式文件，包含：

### 颜色选择器样式
- `.editor-color-picker` - 选择器容器
- `.editor-color-preset` - 预设颜色网格
- `.editor-color-item` - 单个颜色块
- `.editor-color-custom` - 自定义颜色区域

### 下拉选择器样式
- `.editor-dropdown` - 下拉框容器
- `.editor-dropdown-list` - 选项列表
- `.editor-dropdown-option` - 单个选项
- 自定义滚动条样式

所有样式已通过 `@import` 集成到主样式文件中。

---

## 快捷键列表

新增快捷键：

| 快捷键 | 功能 | 插件 |
|--------|------|------|
| `Mod+Shift+.` | 切换上标 | SuperscriptPlugin |
| `Mod+Shift+,` | 切换下标 | SubscriptPlugin |
| `Mod+Shift+-` | 插入水平线 | HorizontalRulePlugin |
| `Tab` | 增加缩进 | IndentPlugin |
| `Shift+Tab` | 减少缩进 | IndentPlugin |
| `F11` | 切换全屏 | FullscreenPlugin |

注：`Mod` 在 Mac 上为 `Cmd`，在 Windows/Linux 上为 `Ctrl`

---

## 完整使用示例

```typescript
import { Editor } from '@ldesign/editor'
import {
  // 基础格式化
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikePlugin,
  CodePlugin,
  ClearFormatPlugin,

  // 标题和列表
  HeadingPlugin,
  BulletListPlugin,
  OrderedListPlugin,
  TaskListPlugin,

  // 块级元素
  BlockquotePlugin,
  CodeBlockPlugin,

  // 媒体
  LinkPlugin,
  ImagePlugin,
  TablePlugin,

  // 对齐
  AlignPlugin,

  // 颜色（新）
  TextColorPlugin,
  BackgroundColorPlugin,

  // 字体（新）
  FontSizePlugin,
  FontFamilyPlugin,

  // 上下标（新）
  SuperscriptPlugin,
  SubscriptPlugin,

  // 其他（新）
  HorizontalRulePlugin,
  IndentPlugin,
  FullscreenPlugin,

  // 历史记录
  HistoryPlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: document.getElementById('editor'),
  plugins: [
    // 加载所有插件
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikePlugin,
    CodePlugin,
    ClearFormatPlugin,
    HeadingPlugin,
    BulletListPlugin,
    OrderedListPlugin,
    TaskListPlugin,
    BlockquotePlugin,
    CodeBlockPlugin,
    LinkPlugin,
    ImagePlugin,
    TablePlugin,
    AlignPlugin,
    TextColorPlugin,
    BackgroundColorPlugin,
    FontSizePlugin,
    FontFamilyPlugin,
    SuperscriptPlugin,
    SubscriptPlugin,
    HorizontalRulePlugin,
    IndentPlugin,
    FullscreenPlugin,
    HistoryPlugin
  ],
  content: '<p>开始编辑...</p>'
})
```

---

## 技术亮点

### 1. 模块化设计
- 每个功能独立为单独的插件
- 可按需加载，减小包体积
- 易于扩展和维护

### 2. 类型安全
- 完整的 TypeScript 类型定义
- 命令参数类型检查
- IDE 智能提示支持

### 3. 用户体验
- 直观的颜色和字体选择 UI
- 智能的工具栏分组
- 完善的快捷键支持
- 平滑的动画过渡

### 4. 兼容性
- 支持所有现代浏览器
- Vue 3 和 React 18 完整支持
- 框架无关的核心架构

---

## 浏览器兼容性

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

---

## 文件结构

```
src/
├── plugins/
│   ├── color.ts          # 颜色插件（新）
│   ├── font.ts           # 字体插件（新）
│   ├── script.ts         # 上下标插件（新）
│   ├── horizontal-rule.ts # 水平线插件（新）
│   ├── indent.ts         # 缩进插件（新）
│   ├── fullscreen.ts     # 全屏插件（新）
│   └── index.ts          # 插件导出（已更新）
├── ui/
│   ├── ColorPicker.ts    # 颜色选择器（新）
│   ├── Dropdown.ts       # 下拉选择器（新）
│   ├── icons.ts          # 图标库（已更新）
│   └── Toolbar.ts        # 工具栏（已更新）
├── styles/
│   ├── editor.css        # 主样式（已更新）
│   └── ui.css            # UI组件样式（新）
└── index.ts              # 主入口（已更新）
```

---

## 总结

本次更新共新增：
- ✅ 6 个新插件（10 个具体功能）
- ✅ 2 个 UI 组件
- ✅ 9 个新图标
- ✅ 6 个新快捷键
- ✅ 80 种预设颜色
- ✅ 11 种字体大小
- ✅ 10 种字体家族
- ✅ 完整的文档和示例

富文本编辑器现已功能完备，支持所有常见的文本编辑需求！🎉
