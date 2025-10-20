# @word-viewer/react

React 组件封装 - Word 文档查看器。

## 📦 安装

```bash
npm install @word-viewer/react
```

## 🚀 快速开始

```tsx
import React, { useState } from 'react';
import { WordViewerComponent } from '@word-viewer/react';

function App() {
  const [file, setFile] = useState(null);

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <WordViewerComponent
        source={file}
        zoom={1.2}
        editable={false}
        theme="light"
        onLoaded={(data) => console.log('已加载', data)}
        onError={(error) => console.error('错误', error)}
      />
    </div>
  );
}
```

## 📖 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `DocumentSource` | - | 文档源 |
| `options` | `ViewerOptions` | - | 配置选项 |
| `zoom` | `number` | `1.0` | 缩放级别 |
| `editable` | `boolean` | `false` | 是否可编辑 |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | 主题 |
| `className` | `string` | - | CSS 类名 |
| `style` | `React.CSSProperties` | - | 内联样式 |
| `onLoaded` | `(data: any) => void` | - | 加载完成回调 |
| `onError` | `(error: any) => void` | - | 错误回调 |
| `onChanged` | `() => void` | - | 内容改变回调 |
| `onZoom` | `(level: number) => void` | - | 缩放改变回调 |
| `onPageChange` | `(pageInfo: any) => void` | - | 页面改变回调 |

## 🎯 示例

### 使用 Ref

```tsx
import React, { useRef } from 'react';
import { WordViewerComponent, WordViewerRef } from '@word-viewer/react';

function App() {
  const viewerRef = useRef<WordViewerRef>(null);

  const handleExport = async () => {
    const viewer = viewerRef.current?.getViewer();
    if (viewer) {
      const pdf = await viewer.exportToPDF();
      // 下载 PDF
    }
  };

  return (
    <div>
      <button onClick={handleExport}>导出 PDF</button>
      <WordViewerComponent ref={viewerRef} source={file} />
    </div>
  );
}
```

### TypeScript 类型

```tsx
import type {
  WordViewerProps,
  WordViewerRef,
  ViewerOptions,
  DocumentSource,
} from '@word-viewer/react';
```

## 📄 许可证

MIT


