# @ldesign/docview

一个支持在 Web 页面中预览和编辑 Word、Excel、PowerPoint 文档的框架无关库，提供 Vue 3 集成支持。

## 特性

- 🚀 **多格式支持**: 支持 Word (.docx)、Excel (.xlsx)、PowerPoint (.pptx) 文档
- 📝 **预览和编辑**: 支持文档预览，部分格式支持在线编辑
- 🎨 **框架无关**: 核心库不依赖任何前端框架
- 🔧 **Vue 3 集成**: 提供开箱即用的 Vue 3 组件
- 🎯 **TypeScript**: 完整的 TypeScript 类型支持
- 📱 **响应式**: 支持移动端和桌面端
- 🎨 **可定制**: 支持主题定制和工具栏配置

## 安装

```bash
npm install @ldesign/docview
# 或
pnpm add @ldesign/docview
# 或
yarn add @ldesign/docview
```

## 快速开始

### 基础使用

```typescript
import { DocumentViewer } from '@ldesign/docview'

// 创建文档查看器实例
const viewer = new DocumentViewer({
  container: '#document-container', // 容器元素或选择器
  editable: true, // 启用编辑功能
  toolbar: {
    show: true,
    position: 'top'
  },
  callbacks: {
    onLoad: (document) => {
      console.log('文档加载完成:', document)
    },
    onError: (error) => {
      console.error('加载错误:', error)
    },
    onChange: (content) => {
      console.log('内容变化:', content)
    }
  }
})

// 加载文档
const fileInput = document.querySelector('#file-input')
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0]
  if (file) {
    await viewer.loadDocument(file)
  }
})
```

### Vue 3 组件使用

```vue
<template>
  <div>
    <input 
      type="file" 
      @change="handleFileChange"
      accept=".docx,.xlsx,.pptx"
    />
    
    <DocumentViewer
      :file="selectedFile"
      :editable="true"
      :height="600"
      @load="onDocumentLoad"
      @error="onDocumentError"
      @change="onDocumentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DocumentViewer } from '@ldesign/docview/vue'
import type { DocumentInfo, DocumentContent } from '@ldesign/docview'

const selectedFile = ref<File | null>(null)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const onDocumentLoad = (document: DocumentInfo) => {
  console.log('文档加载完成:', document)
}

const onDocumentError = (error: Error) => {
  console.error('加载错误:', error)
}

const onDocumentChange = (content: DocumentContent) => {
  console.log('内容变化:', content)
}
</script>
```

## API 文档

### DocumentViewer 类

#### 构造函数

```typescript
new DocumentViewer(options: DocumentViewerOptions)
```

#### 选项 (DocumentViewerOptions)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| container | HTMLElement \| string | - | 容器元素或选择器 |
| editable | boolean | false | 是否启用编辑功能 |
| toolbar | ToolbarConfig | - | 工具栏配置 |
| theme | ThemeConfig | - | 主题配置 |
| callbacks | CallbackConfig | - | 回调函数配置 |

#### 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| loadDocument | file: File \| string \| ArrayBuffer | Promise\<void\> | 加载文档 |
| getContent | - | DocumentContent \| null | 获取文档内容 |
| save | - | Promise\<Blob\> | 保存文档 |
| setEditable | editable: boolean | void | 设置编辑模式 |
| getDocumentInfo | - | DocumentInfo \| null | 获取文档信息 |
| destroy | - | void | 销毁实例 |

### Vue 组件 Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| file | File \| string \| ArrayBuffer | - | 文档文件或 URL |
| editable | boolean | false | 是否启用编辑功能 |
| height | string \| number | '600px' | 容器高度 |
| width | string \| number | '100%' | 容器宽度 |
| toolbar | ToolbarConfig | - | 工具栏配置 |
| theme | ThemeConfig | - | 主题配置 |

### Vue 组件事件

| 事件 | 参数 | 描述 |
|------|------|------|
| load | document: DocumentInfo | 文档加载完成 |
| error | error: Error | 文档加载错误 |
| change | content: DocumentContent | 文档内容变化 |
| save | content: DocumentContent | 保存事件 |
| ready | - | 组件准备就绪 |

## 支持的文档格式

### Word 文档 (.docx)
- ✅ 文本内容预览
- ✅ 基本格式（粗体、斜体、下划线）
- ✅ 表格显示
- ✅ 图片显示
- ✅ 简单编辑功能
- ❌ 复杂格式保存

### Excel 文档 (.xlsx)
- ✅ 工作表预览
- ✅ 单元格数据显示
- ✅ 多工作表支持
- ✅ 编辑功能
- ✅ 数据保存
- ❌ 复杂公式计算

### PowerPoint 文档 (.pptx)
- ✅ 幻灯片预览
- ✅ 幻灯片导航
- ✅ 缩略图显示
- ✅ 文本内容显示
- ✅ 简单编辑功能
- ❌ 动画效果
- ❌ 复杂布局保存

## 主题定制

```typescript
const viewer = new DocumentViewer({
  container: '#container',
  theme: {
    primaryColor: '#007bff',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderColor: '#dee2e6'
  }
})
```

## 工具栏定制

```typescript
const viewer = new DocumentViewer({
  container: '#container',
  toolbar: {
    show: true,
    position: 'top',
    items: [
      {
        type: 'button',
        id: 'save',
        label: '保存',
        icon: '💾',
        action: () => {
          // 自定义保存逻辑
        }
      },
      {
        type: 'separator',
        id: 'sep1'
      },
      {
        type: 'button',
        id: 'print',
        label: '打印',
        icon: '🖨️',
        action: () => {
          // 自定义打印逻辑
        }
      }
    ]
  }
})
```

## 注意事项

1. **文件大小限制**: 建议单个文件不超过 50MB
2. **浏览器兼容性**: 支持现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）
3. **编辑功能限制**: 编辑功能主要支持文本内容，复杂格式可能丢失
4. **保存格式**: 编辑后的文档可能以 HTML 格式保存，而非原始 Office 格式

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v0.1.0
- 初始版本
- 支持 Word、Excel、PowerPoint 文档预览
- 提供 Vue 3 组件
- 基础编辑功能
