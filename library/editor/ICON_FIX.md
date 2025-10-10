# 图标修复说明

## 问题
之前使用 `lucide` 包作为图标库，但在实际使用中图标无法正常显示。

## 解决方案
移除了对 `lucide` 的依赖，使用内置的 SVG 图标系统。

## 修改内容

### 1. 创建图标系统 (`src/ui/icons.ts`)
- ✅ 定义了所有需要的图标 SVG
- ✅ 提供 `createIcon()` 函数创建图标元素
- ✅ 提供 `getIconHTML()` 函数获取图标 HTML

包含的图标：
- 基础格式化：bold, italic, underline, strikethrough, code, eraser
- 标题：heading-1, heading-2, heading-3
- 列表：list, list-ordered, list-checks
- 块级元素：quote, code-xml
- 媒体：link, image
- 表格：table
- 历史记录：undo, redo
- 对齐：align-left, align-center, align-right, align-justify

### 2. 修改工具栏组件 (`src/ui/Toolbar.ts`)
**修改前：**
```typescript
import * as lucide from 'lucide'

// 使用 lucide 创建图标
const Icon = lucide[iconName as keyof typeof lucide]
const iconElement = Icon()
```

**修改后：**
```typescript
import { createIcon } from './icons'

// 使用内置图标系统
const iconElement = createIcon(item.icon)
```

### 3. 更新依赖
- ✅ 从 `package.json` 移除 `lucide` 依赖
- ✅ 从 `examples/package.json` 移除 `lucide` 依赖

### 4. 更新文档
- ✅ README.md - 移除 lucide 安装说明
- ✅ docs/index.md - 更新安装命令
- ✅ docs/guide/installation.md - 移除 lucide 相关内容
- ✅ docs/guide/getting-started.md - 更新安装命令
- ✅ docs/guide/icons.md - 新增图标使用文档
- ✅ QUICK_START.md - 添加图标内置说明
- ✅ examples/README.md - 添加提示信息

### 5. 导出图标 API
```typescript
// src/index.ts
export { createIcon, getIconHTML } from './ui/icons'
```

## 优势

### 1. 无外部依赖
- 不需要安装额外的图标库
- 减少了包体积
- 避免了版本兼容问题

### 2. 更好的性能
- 图标直接内联在代码中
- 无需网络请求
- 加载速度更快

### 3. 完全可控
- 可以自定义任何图标
- 统一的图标风格
- 易于维护和更新

### 4. 简单易用
```typescript
// 自动使用
const toolbar = new Toolbar(editor)

// 手动使用
const icon = createIcon('bold')
```

## 使用示例

### 基础使用
```typescript
import { Editor, Toolbar, BoldPlugin } from '@ldesign/editor'

const editor = new Editor({
  element: '#editor',
  plugins: [BoldPlugin]
})

const toolbar = new Toolbar(editor)
// 图标自动显示 ✅
```

### 自定义使用
```typescript
import { createIcon } from '@ldesign/editor'

const boldIcon = createIcon('bold')
document.getElementById('my-button')?.appendChild(boldIcon)
```

### 获取 HTML
```typescript
import { getIconHTML } from '@ldesign/editor'

const html = getIconHTML('italic')
// 返回: <svg ...>...</svg>
```

## 图标样式自定义

```css
/* 更改图标颜色 */
.ldesign-editor-toolbar-button svg {
  color: #666;
}

/* 更改图标大小 */
.ldesign-editor-toolbar-button svg {
  width: 20px;
  height: 20px;
}

/* 激活状态 */
.ldesign-editor-toolbar-button.active svg {
  color: #fff;
}
```

## 验证

运行示例项目验证图标是否正常显示：

```bash
cd examples
npm install
npm run dev
```

访问 http://localhost:3000，检查：
- ✅ 工具栏中的所有图标都应该可见
- ✅ 图标应该随按钮状态改变颜色
- ✅ 所有功能按钮都应该正常工作

## 总结

通过这次修复：
1. ✅ 移除了对外部图标库的依赖
2. ✅ 所有图标现在都能正常显示
3. ✅ 性能得到优化
4. ✅ 代码更加简洁
5. ✅ 文档已更新

现在编辑器拥有完全自主的图标系统，无需任何外部依赖！
