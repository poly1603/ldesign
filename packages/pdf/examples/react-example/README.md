# React集成示例

这个示例展示了如何在React应用中集成PDF预览组件。

## 功能特性

- React Hook集成
- TypeScript支持
- 组件化设计
- 状态管理
- 错误边界
- 性能优化
- 响应式设计

## 文件说明

- `package.json` - 项目依赖配置
- `src/App.tsx` - 主应用组件
- `src/components/PdfViewer.tsx` - PDF查看器组件
- `src/components/PdfControls.tsx` - 控制面板组件
- `src/hooks/usePdfViewer.tsx` - PDF查看器Hook
- `src/types/index.ts` - TypeScript类型定义
- `src/styles/` - 样式文件
- `public/index.html` - HTML模板

## 安装依赖

```bash
npm install
# 或
yarn install
```

## 运行示例

```bash
npm start
# 或
yarn start
```

## 核心用法

### 1. 基础组件使用

```tsx
import React from 'react';
import { PdfViewer } from './components/PdfViewer';

function App() {
  return (
    <div className="app">
      <PdfViewer
        src="/sample.pdf"
        width="100%"
        height="600px"
        enableControls={true}
        enableSearch={true}
      />
    </div>
  );
}
```

### 2. 使用Hook进行状态管理

```tsx
import React from 'react';
import { usePdfViewer } from './hooks/usePdfViewer';

function CustomPdfViewer() {
  const {
    loadPdf,
    currentPage,
    totalPages,
    zoomLevel,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    isLoading,
    error
  } = usePdfViewer();

  React.useEffect(() => {
    loadPdf('/sample.pdf');
  }, [loadPdf]);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <div className="controls">
        <button onClick={previousPage}>上一页</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={nextPage}>下一页</button>
        <button onClick={zoomIn}>放大</button>
        <button onClick={zoomOut}>缩小</button>
      </div>
      {/* PDF渲染区域 */}
    </div>
  );
}
```

### 3. 高级配置

```tsx
import React from 'react';
import { PdfViewer } from './components/PdfViewer';

function AdvancedExample() {
  const handlePageChange = (page: number) => {
    console.log('页面切换到:', page);
  };

  const handleZoomChange = (zoom: number) => {
    console.log('缩放级别:', zoom);
  };

  const handleError = (error: Error) => {
    console.error('PDF错误:', error);
  };

  return (
    <PdfViewer
      src="/sample.pdf"
      initialPage={1}
      initialZoom={1.0}
      enableCache={true}
      cacheSize={50}
      enableWebGL={true}
      onPageChange={handlePageChange}
      onZoomChange={handleZoomChange}
      onError={handleError}
      renderOptions={{
        enableWebGL: true,
        devicePixelRatio: window.devicePixelRatio
      }}
    />
  );
}
```

## 组件API

### PdfViewer Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `src` | `string \| File \| ArrayBuffer` | - | PDF文档源 |
| `width` | `string \| number` | `'100%'` | 容器宽度 |
| `height` | `string \| number` | `'600px'` | 容器高度 |
| `initialPage` | `number` | `1` | 初始页面 |
| `initialZoom` | `number` | `1.0` | 初始缩放级别 |
| `enableControls` | `boolean` | `true` | 是否显示控制面板 |
| `enableSearch` | `boolean` | `false` | 是否启用搜索功能 |
| `enableCache` | `boolean` | `true` | 是否启用缓存 |
| `cacheSize` | `number` | `50` | 缓存大小 |
| `onPageChange` | `(page: number) => void` | - | 页面变化回调 |
| `onZoomChange` | `(zoom: number) => void` | - | 缩放变化回调 |
| `onError` | `(error: Error) => void` | - | 错误回调 |

### usePdfViewer Hook

```tsx
const {
  // 状态
  currentPage,
  totalPages,
  zoomLevel,
  isLoading,
  error,
  
  // 方法
  loadPdf,
  nextPage,
  previousPage,
  goToPage,
  zoomIn,
  zoomOut,
  setZoom,
  fitWidth,
  search,
  
  // 配置
  setConfig
} = usePdfViewer(options);
```

## 最佳实践

### 1. 错误处理

```tsx
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-fallback">
      <h2>PDF加载出错</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PdfViewer src="/sample.pdf" />
    </ErrorBoundary>
  );
}
```

### 2. 性能优化

```tsx
import React, { memo, useMemo } from 'react';

const PdfViewer = memo(({ src, ...props }) => {
  const viewerConfig = useMemo(() => ({
    enableCache: true,
    cacheSize: 50,
    enableWebGL: true,
    ...props
  }), [props]);

  return (
    <div className="pdf-viewer">
      {/* PDF内容 */}
    </div>
  );
});
```

### 3. 响应式设计

```tsx
import React, { useState, useEffect } from 'react';

function ResponsivePdfViewer({ src }) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <PdfViewer
      src={src}
      width={containerSize.width}
      height={containerSize.height}
      initialZoom={containerSize.width < 768 ? 0.8 : 1.0}
    />
  );
}
```

## 注意事项

1. **内存管理**: 大型PDF文件可能消耗大量内存，建议启用缓存并合理设置缓存大小
2. **性能优化**: 使用React.memo和useMemo优化渲染性能
3. **错误处理**: 使用ErrorBoundary捕获组件错误
4. **类型安全**: 充分利用TypeScript的类型检查
5. **响应式**: 考虑不同屏幕尺寸的适配