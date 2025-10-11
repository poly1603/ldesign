# 富文本编辑器修复和改进

本文档详细说明了对富文本编辑器所做的所有修复和新增功能。

## 🔧 修复的问题

### 1. 字体大小设置无效 ✅
**问题**: 选择字体大小后，文本没有变化。
**原因**: `setFontSize` 命令执行后没有触发编辑器的输入事件。
**修复**: 在 `font.ts` 中的 `setFontSize` 函数末尾添加了事件触发代码：
```typescript
const event = new Event('input', { bubbles: true })
range.commonAncestorContainer.parentElement?.dispatchEvent(event)
```

### 2. 字体家族设置无效 ✅
**问题**: 选择字体家族后，文本没有变化。
**原因**: `setFontFamily` 命令执行后没有触发编辑器的输入事件。
**修复**: 在 `font.ts` 中的 `setFontFamily` 函数末尾添加了事件触发代码。

### 3. 插入表格功能没有效果 ✅
**问题**: 点击插入表格按钮后，表格对话框显示，但插入后编辑器没有更新。
**原因**: 表格插入后没有触发编辑器的输入事件。
**修复**: 在 `table.ts` 的 `insertTable` 命令中添加了事件触发代码：
```typescript
const event = new Event('input', { bubbles: true })
const editorContent = table.closest('.ldesign-editor-content')
if (editorContent) {
  editorContent.dispatchEvent(event)
}
```

### 4. 代码块功能没用 ✅
**问题**: 插入代码块后样式不正确，无法编辑。
**原因**: 
- 代码块没有设置合适的样式
- 缺少 `contentEditable` 属性
- 没有触发编辑器更新

**修复**: 
- 为代码块添加了完整的样式（背景色、边框、字体等）
- 设置 `contentEditable='true'` 确保可编辑
- 插入后添加一个空段落方便继续编辑
- 触发编辑器输入事件

### 5. 行高设置没用 ✅
**问题**: 设置行高后文本没有变化。
**原因**: 行高应用到元素后没有触发编辑器更新。
**修复**: 在 `line-height.ts` 中的 `setLineHeight` 函数末尾添加了事件触发代码。

### 6. 文本转换功能没用 ✅
**问题**: 大小写转换、全角半角转换等功能不工作。
**原因**: 文本转换后没有触发编辑器更新。
**修复**: 为以下所有文本转换命令添加了事件触发：
- `toUpperCase` - 转大写
- `toLowerCase` - 转小写
- `toCapitalize` - 首字母大写
- `toSentenceCase` - 句子大小写
- `toHalfWidth` - 全角转半角
- `toFullWidth` - 半角转全角

### 7. 全屏模式没有 toolbar ✅
**问题**: 进入全屏模式后工具栏消失。
**原因**: 全屏模式只是简单地将编辑器容器设置为全屏，没有考虑布局。
**修复**: 
- 将编辑器容器设置为 `display: flex; flex-direction: column`
- 确保工具栏 `flex-shrink: 0` 不会被压缩
- 内容区域设置 `flex: 1; overflow: auto` 占据剩余空间
- 退出全屏时恢复所有样式

## 🆕 新增功能

### 1. 图片样式设置插件 ✨
创建了全新的 `ImageStylePlugin`，提供强大的图片样式控制功能：

**功能列表**:
- ✅ 设置图片宽度 (`setImageWidth`)
- ✅ 设置图片高度 (`setImageHeight`)
- ✅ 设置图片对齐方式 (`setImageAlign`) - 左对齐、居中、右对齐
- ✅ 设置图片边框 (`setImageBorder`)
- ✅ 设置图片圆角 (`setImageBorderRadius`)
- ✅ 设置图片阴影 (`setImageShadow`)
- ✅ 设置图片透明度 (`setImageOpacity`)
- ✅ 重置图片样式 (`resetImageStyle`)

**预设选项** (`IMAGE_STYLE_PRESETS`):
- 宽度: 25%, 50%, 75%, 100%, 原始大小
- 对齐: 左对齐、居中、右对齐
- 边框: 无、细、中、粗
- 圆角: 无、小、中、大、圆形
- 阴影: 无、轻微、中等、明显

**使用方式**:
```typescript
import { ImageStylePlugin } from '@/plugins'

editor.commands.execute('setImageWidth', '50%')
editor.commands.execute('setImageAlign', 'center')
editor.commands.execute('setImageBorderRadius', '8px')
```

### 2. 字数统计插件 📊
创建了 `WordCountPlugin`，提供详细的文档统计信息：

**统计项目**:
- ✅ 字数（支持中英文混合）
- ✅ 字符数（含空格）
- ✅ 字符数（不含空格）
- ✅ 段落数
- ✅ 行数

**功能**:
- 弹出对话框显示统计信息
- 中英文字数智能统计
- 实时统计当前编辑器内容

**使用方式**:
```typescript
import { WordCountPlugin, getWordCount } from '@/plugins'

// 显示字数统计对话框
editor.commands.execute('showWordCount')

// 手动获取统计信息
const stats = getWordCount(text)
console.log(stats.words, stats.characters)
```

### 3. 导出为 Markdown 插件 📝
创建了 `ExportMarkdownPlugin`，支持将编辑器内容导出为 Markdown 格式：

**支持的元素**:
- ✅ 标题 (H1-H6)
- ✅ 段落
- ✅ 粗体、斜体、删除线
- ✅ 代码块和行内代码
- ✅ 引用块
- ✅ 无序列表和有序列表
- ✅ 链接
- ✅ 图片
- ✅ 表格
- ✅ 水平分隔线

**功能**:
- ✅ 导出为 .md 文件 (`exportMarkdown`)
- ✅ 复制为 Markdown 到剪贴板 (`copyAsMarkdown`)
- ✅ 智能转换 HTML 结构为 Markdown 语法
- ✅ 保留表格格式

**使用方式**:
```typescript
import { ExportMarkdownPlugin, htmlToMarkdown } from '@/plugins'

// 导出为文件
editor.commands.execute('exportMarkdown')

// 复制到剪贴板
editor.commands.execute('copyAsMarkdown')

// 手动转换
const markdown = htmlToMarkdown(htmlContent)
```

### 4. 改进的清除格式功能 🧹
虽然已有 `ClearFormatPlugin`，但确保了其正常工作：
- 使用 `Mod-\` 快捷键清除格式
- 工具栏按钮可以清除选中文本的所有格式

## 📦 使用新功能

### 在项目中引入新插件

```typescript
import { Editor } from '@ldesign/editor'
import {
  // ... 其他插件
  ImageStylePlugin,
  WordCountPlugin,
  ExportMarkdownPlugin
} from '@ldesign/editor/plugins'

const editor = new Editor({
  element: '#editor',
  plugins: [
    // ... 其他插件
    ImageStylePlugin,
    WordCountPlugin,
    ExportMarkdownPlugin
  ]
})
```

### 图片样式设置示例

```typescript
// 选中图片后执行
editor.commands.execute('setImageWidth', '75%')
editor.commands.execute('setImageAlign', 'center')
editor.commands.execute('setImageBorderRadius', '8px')
editor.commands.execute('setImageShadow', '0 4px 8px rgba(0,0,0,0.15)')
```

### 字数统计示例

```typescript
// 显示统计对话框
editor.commands.execute('showWordCount')

// 或者获取统计数据
import { getWordCount } from '@ldesign/editor/plugins'
const text = editor.contentElement.textContent
const stats = getWordCount(text)
console.log(`字数: ${stats.words}, 字符: ${stats.characters}`)
```

### 导出 Markdown 示例

```typescript
// 导出为文件下载
editor.commands.execute('exportMarkdown')

// 复制到剪贴板
editor.commands.execute('copyAsMarkdown')

// 获取 Markdown 文本
import { htmlToMarkdown } from '@ldesign/editor/plugins'
const html = editor.getHTML()
const markdown = htmlToMarkdown(html)
```

## 🎨 工具栏集成

所有新功能都已集成到工具栏中：
- 图片样式: 选中图片时显示
- 字数统计: 点击显示统计对话框
- 导出 Markdown: 点击下载 .md 文件

## 🔧 技术细节

### 事件触发机制
所有修复的核心是确保 DOM 操作后触发 `input` 事件：

```typescript
const event = new Event('input', { bubbles: true })
element.dispatchEvent(event)
```

这样编辑器的事件监听器会捕获到变化并更新内部状态。

### 图片选择检测
图片样式插件使用智能选择检测：

```typescript
function getSelectedImage(): HTMLImageElement | null {
  const selection = window.getSelection()
  let node = selection?.anchorNode
  
  while (node && node !== document.body) {
    if (node.nodeName === 'IMG') {
      return node as HTMLImageElement
    }
    node = node.parentNode
  }
  
  return null
}
```

### Markdown 转换算法
使用递归节点遍历算法：
1. 遍历 DOM 树的每个节点
2. 根据元素类型转换为对应的 Markdown 语法
3. 递归处理子节点
4. 合并结果

## 📝 更新日志

**2025-10-10**
- ✅ 修复字体大小设置无效问题
- ✅ 修复字体家族设置无效问题
- ✅ 修复表格插入功能无效问题
- ✅ 修复代码块样式和编辑问题
- ✅ 修复行高设置无效问题
- ✅ 修复文本转换功能无效问题
- ✅ 修复全屏模式工具栏消失问题
- ✨ 新增图片样式设置插件
- ✨ 新增字数统计插件
- ✨ 新增导出 Markdown 插件

## 🚀 下一步计划

可以考虑添加的功能：
- [ ] 打印预览功能
- [ ] 导出为 PDF
- [ ] 协作编辑支持
- [ ] 拼写检查
- [ ] 自动保存
- [ ] 版本历史
- [ ] 模板系统
- [ ] 更多图片编辑功能（裁剪、滤镜等）

## 📚 相关文件

- `src/plugins/font.ts` - 字体设置修复
- `src/plugins/table.ts` - 表格功能修复
- `src/plugins/codeblock.ts` - 代码块修复
- `src/plugins/line-height.ts` - 行高设置修复
- `src/plugins/text-transform.ts` - 文本转换修复
- `src/plugins/fullscreen.ts` - 全屏模式修复
- `src/plugins/image-style.ts` - 图片样式（新）
- `src/plugins/word-count.ts` - 字数统计（新）
- `src/plugins/export-markdown.ts` - 导出 Markdown（新）

## 💡 提示

1. 所有命令都支持通过 `editor.commands.execute()` 调用
2. 可以通过 `editor.on('update')` 监听编辑器变化
3. 全屏模式按 F11 或点击工具栏按钮切换
4. 字数统计支持中英文混合文本
5. 导出的 Markdown 保留大部分格式

## 🐛 已知限制

1. 表格的复杂样式可能在 Markdown 导出时丢失（Markdown 表格限制）
2. 某些 HTML 特定的样式（如颜色）在 Markdown 中使用内联 HTML 保留
3. 图片样式设置仅对选中的图片有效
