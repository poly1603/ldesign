# 插件概览

@ldesign/editor 通过插件系统提供丰富的功能。插件是模块化的、可组合的功能单元。

## 内置插件

@ldesign/editor 提供了一系列内置插件：

### 基础格式化

文本的基础格式化功能。

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| `BoldPlugin` | 粗体 | `Ctrl/Cmd + B` |
| `ItalicPlugin` | 斜体 | `Ctrl/Cmd + I` |
| `UnderlinePlugin` | 下划线 | `Ctrl/Cmd + U` |
| `StrikePlugin` | 删除线 | `Ctrl/Cmd + Shift + X` |
| `CodePlugin` | 行内代码 | `Ctrl/Cmd + E` |
| `ClearFormatPlugin` | 清除格式 | `Ctrl/Cmd + \\` |

**使用示例:**

```typescript
import {
  Editor,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin]
})
```

### 标题

提供 H1-H6 标题功能。

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| `HeadingPlugin` | 标题 | `Ctrl/Cmd + Alt + 1-6` |

**使用示例:**

```typescript
import { Editor, HeadingPlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [HeadingPlugin]
})

// 使用命令
editor.commands.execute('setHeading1')
editor.commands.execute('setHeading2')
```

### 列表

提供列表功能。

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| `BulletListPlugin` | 无序列表 | `Ctrl/Cmd + Shift + 8` |
| `OrderedListPlugin` | 有序列表 | `Ctrl/Cmd + Shift + 7` |
| `TaskListPlugin` | 任务列表 | - |

**使用示例:**

```typescript
import {
  Editor,
  BulletListPlugin,
  OrderedListPlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [BulletListPlugin, OrderedListPlugin]
})
```

### 块级元素

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| `BlockquotePlugin` | 引用块 | `Ctrl/Cmd + Shift + B` |
| `CodeBlockPlugin` | 代码块 | `Ctrl/Cmd + Alt + C` |

**使用示例:**

```typescript
import {
  Editor,
  BlockquotePlugin,
  CodeBlockPlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [BlockquotePlugin, CodeBlockPlugin]
})
```

### 媒体

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| `LinkPlugin` | 链接 | `Ctrl/Cmd + K` |
| `ImagePlugin` | 图片 | - |

**使用示例:**

```typescript
import {
  Editor,
  LinkPlugin,
  ImagePlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [LinkPlugin, ImagePlugin]
})
```

### 表格

| 插件 | 功能 |
|------|------|
| `TablePlugin` | 表格 |

**使用示例:**

```typescript
import { Editor, TablePlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [TablePlugin]
})

// 插入表格
editor.commands.execute('insertTable')
```

### 历史记录

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| `HistoryPlugin` | 撤销/重做 | `Ctrl/Cmd + Z` / `Ctrl/Cmd + Shift + Z` |

**使用示例:**

```typescript
import { Editor, HistoryPlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [HistoryPlugin]
})

// 撤销
editor.commands.execute('undo')

// 重做
editor.commands.execute('redo')
```

### 对齐

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| `AlignPlugin` | 文本对齐 | `Ctrl/Cmd + Shift + L/E/R/J` |

**使用示例:**

```typescript
import { Editor, AlignPlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [AlignPlugin]
})

// 左对齐
editor.commands.execute('alignLeft')

// 居中
editor.commands.execute('alignCenter')

// 右对齐
editor.commands.execute('alignRight')

// 两端对齐
editor.commands.execute('alignJustify')
```

## 使用所有插件

快速添加所有内置插件：

```typescript
import {
  Editor,
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
  HistoryPlugin,
  AlignPlugin
} from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [
    // 基础格式化
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikePlugin,
    CodePlugin,
    ClearFormatPlugin,

    // 标题
    HeadingPlugin,

    // 列表
    BulletListPlugin,
    OrderedListPlugin,
    TaskListPlugin,

    // 块级元素
    BlockquotePlugin,
    CodeBlockPlugin,

    // 媒体
    LinkPlugin,
    ImagePlugin,

    // 表格
    TablePlugin,

    // 历史记录
    HistoryPlugin,

    // 对齐
    AlignPlugin
  ]
})
```

## 插件配置

某些插件支持自定义配置：

```typescript
import { createPlugin } from '@ldesign/editor'

const CustomBoldPlugin = createPlugin({
  name: 'customBold',
  commands: {
    toggleBold: (state, dispatch) => {
      // 自定义实现
      return true
    }
  },
  keys: {
    'Ctrl-B': (state, dispatch) => {
      // 自定义快捷键处理
      return true
    }
  }
})
```

## 下一步

- [基础格式化](/plugins/formatting) - 了解格式化插件
- [自定义插件](/plugins/custom) - 开发自定义插件
- [插件 API](/api/plugin) - 插件 API 文档
