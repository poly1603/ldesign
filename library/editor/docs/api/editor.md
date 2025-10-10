# Editor API

Editor 是编辑器的核心类，负责管理编辑器的所有功能。

## 构造函数

```typescript
constructor(options: EditorOptions)
```

### 参数

- `options` - 编辑器配置选项

#### EditorOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `element` | `HTMLElement \| string` | - | 编辑器挂载的元素或选择器 |
| `content` | `string \| Node` | `''` | 初始内容（HTML 或 JSON） |
| `plugins` | `(Plugin \| string)[]` | `[]` | 插件列表 |
| `editable` | `boolean` | `true` | 是否可编辑 |
| `autofocus` | `boolean` | `false` | 是否自动聚焦 |
| `placeholder` | `string` | `''` | 占位符文本 |
| `onChange` | `(content: string) => void` | - | 内容变化回调 |
| `onUpdate` | `(state: EditorState) => void` | - | 状态更新回调 |
| `onFocus` | `() => void` | - | 聚焦回调 |
| `onBlur` | `() => void` | - | 失焦回调 |

### 示例

```typescript
import { Editor } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>',
  placeholder: '请输入内容...',
  autofocus: true,
  onChange: (content) => {
    console.log('内容变化:', content)
  }
})
```

## 实例方法

### mount()

挂载编辑器到指定元素。

```typescript
mount(element: HTMLElement | string): void
```

**示例:**

```typescript
editor.mount('#editor')
```

### getHTML()

获取编辑器的 HTML 内容。

```typescript
getHTML(): string
```

**返回值:** HTML 字符串

**示例:**

```typescript
const html = editor.getHTML()
console.log(html) // <p>Hello World!</p>
```

### setHTML()

设置编辑器的 HTML 内容。

```typescript
setHTML(html: string): void
```

**参数:**

- `html` - HTML 字符串

**示例:**

```typescript
editor.setHTML('<p>新内容</p>')
```

### getJSON()

获取编辑器的 JSON 数据。

```typescript
getJSON(): Node
```

**返回值:** 文档节点对象

**示例:**

```typescript
const json = editor.getJSON()
console.log(JSON.stringify(json, null, 2))
```

### setJSON()

设置编辑器的 JSON 数据。

```typescript
setJSON(json: Node): void
```

**参数:**

- `json` - 文档节点对象

**示例:**

```typescript
editor.setJSON({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }
  ]
})
```

### clear()

清空编辑器内容。

```typescript
clear(): void
```

**示例:**

```typescript
editor.clear()
```

### focus()

聚焦编辑器。

```typescript
focus(): void
```

**示例:**

```typescript
editor.focus()
```

### blur()

失焦编辑器。

```typescript
blur(): void
```

**示例:**

```typescript
editor.blur()
```

### setEditable()

设置编辑器的可编辑状态。

```typescript
setEditable(editable: boolean): void
```

**参数:**

- `editable` - 是否可编辑

**示例:**

```typescript
// 设置为只读
editor.setEditable(false)

// 设置为可编辑
editor.setEditable(true)
```

### isEditable()

检查编辑器是否可编辑。

```typescript
isEditable(): boolean
```

**返回值:** 是否可编辑

**示例:**

```typescript
if (editor.isEditable()) {
  console.log('编辑器可编辑')
}
```

### getState()

获取编辑器状态。

```typescript
getState(): EditorState
```

**返回值:** 编辑器状态对象

**示例:**

```typescript
const state = editor.getState()
console.log('文档:', state.doc)
console.log('选区:', state.selection)
```

### getSelection()

获取当前选区。

```typescript
getSelection(): Selection
```

**返回值:** 选区对象

**示例:**

```typescript
const selection = editor.getSelection()
console.log('锚点:', selection.anchor)
console.log('头部:', selection.head)
```

### setSelection()

设置选区。

```typescript
setSelection(selection: Selection): void
```

**参数:**

- `selection` - 选区对象

**示例:**

```typescript
import { Selection } from '@ldesign/editor'

// 设置光标位置
editor.setSelection(Selection.cursor(10))

// 设置选区范围
editor.setSelection(Selection.range(5, 15))
```

### destroy()

销毁编辑器实例。

```typescript
destroy(): void
```

**示例:**

```typescript
editor.destroy()
```

### isDestroyed()

检查编辑器是否已销毁。

```typescript
isDestroyed(): boolean
```

**返回值:** 是否已销毁

**示例:**

```typescript
if (editor.isDestroyed()) {
  console.log('编辑器已销毁')
}
```

## 事件系统

### on()

监听事件。

```typescript
on(event: string, handler: Function): () => void
```

**参数:**

- `event` - 事件名称
- `handler` - 事件处理函数

**返回值:** 取消监听的函数

**支持的事件:**

- `update` - 编辑器更新
- `selectionUpdate` - 选区更新
- `focus` - 编辑器聚焦
- `blur` - 编辑器失焦

**示例:**

```typescript
// 监听更新事件
const unsubscribe = editor.on('update', (state) => {
  console.log('编辑器更新:', state)
})

// 取消监听
unsubscribe()
```

### once()

监听一次事件。

```typescript
once(event: string, handler: Function): void
```

**示例:**

```typescript
editor.once('focus', () => {
  console.log('首次聚焦')
})
```

### off()

取消监听事件。

```typescript
off(event: string, handler: Function): void
```

**示例:**

```typescript
const handler = () => console.log('更新')
editor.on('update', handler)
editor.off('update', handler)
```

### emit()

触发事件。

```typescript
emit(event: string, ...args: any[]): void
```

**示例:**

```typescript
editor.emit('custom-event', { data: 'value' })
```

## 命令和插件

### commands

命令管理器实例，用于执行命令。

```typescript
commands: CommandManager
```

**示例:**

```typescript
// 执行命令
editor.commands.execute('toggleBold')

// 检查命令是否可用
if (editor.commands.canExecute('toggleBold')) {
  editor.commands.execute('toggleBold')
}
```

### keymap

快捷键管理器实例。

```typescript
keymap: KeymapManager
```

### plugins

插件管理器实例。

```typescript
plugins: PluginManager
```

**示例:**

```typescript
// 获取所有插件
const allPlugins = editor.plugins.getAll()

// 获取特定插件
const boldPlugin = editor.plugins.get('bold')

// 检查插件是否已注册
if (editor.plugins.has('bold')) {
  console.log('粗体插件已注册')
}
```
