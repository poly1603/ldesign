# 图标系统

@ldesign/editor 内置了完整的图标系统，无需安装额外的图标库。

## 内置图标

编辑器内置了所有工具栏所需的图标：

### 文本格式化
- `bold` - 粗体
- `italic` - 斜体
- `underline` - 下划线
- `strikethrough` - 删除线
- `code` - 代码
- `eraser` - 清除格式

### 标题
- `heading-1` - 标题 1
- `heading-2` - 标题 2
- `heading-3` - 标题 3

### 列表
- `list` - 无序列表
- `list-ordered` - 有序列表
- `list-checks` - 任务列表

### 块级元素
- `quote` - 引用块
- `code-xml` - 代码块

### 媒体
- `link` - 链接
- `image` - 图片

### 表格
- `table` - 表格

### 历史记录
- `undo` - 撤销
- `redo` - 重做

### 对齐
- `align-left` - 左对齐
- `align-center` - 居中对齐
- `align-right` - 右对齐
- `align-justify` - 两端对齐

## 使用图标

### 在工具栏中使用

图标会自动在工具栏中显示：

```typescript
import { Editor, Toolbar, BoldPlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [BoldPlugin]
})

const toolbar = new Toolbar(editor)
// 图标会自动显示
```

### 手动创建图标

如果需要在自定义 UI 中使用图标：

```typescript
import { createIcon } from '@ldesign/editor'

// 创建图标元素
const boldIcon = createIcon('bold')
if (boldIcon) {
  document.getElementById('my-button')?.appendChild(boldIcon)
}
```

### 获取图标 HTML

```typescript
import { getIconHTML } from '@ldesign/editor'

// 获取图标的 HTML 字符串
const iconHTML = getIconHTML('bold')
console.log(iconHTML)
// 输出: <svg width="18" height="18" ...>...</svg>
```

## 自定义图标

如果你想使用自定义图标，可以通过工具栏配置：

```typescript
import { Editor, Toolbar } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor'
})

// 自定义工具栏项
const toolbar = new Toolbar(editor, {
  items: [
    {
      name: 'customBold',
      title: '自定义粗体',
      icon: 'bold', // 使用内置图标
      command: (state, dispatch) => {
        // 自定义命令
        return true
      }
    }
  ]
})
```

## 图标样式

图标继承按钮的颜色，可以通过 CSS 自定义：

```css
/* 自定义图标颜色 */
.ldesign-editor-toolbar-button svg {
  color: #333;
}

/* 悬停时的颜色 */
.ldesign-editor-toolbar-button:hover svg {
  color: #000;
}

/* 激活状态的颜色 */
.ldesign-editor-toolbar-button.active svg {
  color: #fff;
}
```

## 图标尺寸

默认图标尺寸为 18x18 像素，可以通过 CSS 调整：

```css
.ldesign-editor-toolbar-button svg {
  width: 20px;
  height: 20px;
}
```

## 技术细节

- 图标使用 SVG 格式，确保在任何分辨率下都清晰
- 所有图标都是内联的，不需要网络请求
- 图标支持 `currentColor`，自动继承文字颜色
- 图标经过优化，体积小巧

## 图标列表

完整的图标列表可以在源代码中查看：`src/ui/icons.ts`

每个图标都是一个标准的 SVG 元素，可以直接在浏览器中渲染。
