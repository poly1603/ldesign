# API 文档

## 核心 API

### ExcelViewer

主类，提供 Excel 文件的加载、编辑、导出等功能。

#### 构造函数

```typescript
new ExcelViewer(options: ExcelViewerOptions)
```

**参数:**

- `options` - 配置选项，详见 [ExcelViewerOptions](#excelvieweroptions)

**示例:**

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  showToolbar: true,
  showFormulaBar: true,
  allowEdit: true,
  lang: 'zh'
});
```

#### 方法

##### loadFile()

加载 Excel 文件。

```typescript
loadFile(file: File | ArrayBuffer | string): Promise<void>
```

**参数:**

- `file` - 文件对象、ArrayBuffer 或 URL 字符串

**返回:**

- `Promise<void>` - 加载完成的 Promise

**示例:**

```javascript
// 从 File 对象加载
const file = document.querySelector('input[type="file"]').files[0];
await viewer.loadFile(file);

// 从 URL 加载
await viewer.loadFile('https://example.com/sample.xlsx');

// 从 ArrayBuffer 加载
const arrayBuffer = await file.arrayBuffer();
await viewer.loadFile(arrayBuffer);
```

##### getData()

获取所有工作表数据。

```typescript
getData(): SheetData[]
```

**返回:**

- `SheetData[]` - 工作表数据数组

**示例:**

```javascript
const sheets = viewer.getData();
console.log(sheets);
// [
//   { name: 'Sheet1', index: 0, data: [...] },
//   { name: 'Sheet2', index: 1, data: [...] }
// ]
```

##### getCurrentSheetData()

获取当前工作表数据。

```typescript
getCurrentSheetData(): any
```

**返回:**

- `any` - 当前工作表数据

##### exportFile()

导出文件为指定格式。

```typescript
exportFile(options: ExportOptions): Blob
```

**参数:**

- `options` - 导出选项，详见 [ExportOptions](#exportoptions)

**返回:**

- `Blob` - 导出的文件 Blob

**示例:**

```javascript
const blob = viewer.exportFile({
  format: 'xlsx',
  filename: 'export.xlsx',
  includeStyles: true,
  includeFormulas: true
});
```

##### downloadFile()

导出并下载文件。

```typescript
downloadFile(options: ExportOptions): void
```

**参数:**

- `options` - 导出选项

**示例:**

```javascript
viewer.downloadFile({
  format: 'xlsx',
  filename: 'my-data.xlsx'
});
```

##### exportScreenshot()

导出当前视图为截图。

```typescript
exportScreenshot(filename?: string): Promise<Blob>
```

**参数:**

- `filename` - 文件名（可选）

**返回:**

- `Promise<Blob>` - 截图 Blob

**示例:**

```javascript
const blob = await viewer.exportScreenshot('screenshot.png');
```

##### setCellValue()

设置单元格值。

```typescript
setCellValue(row: number, col: number, value: any): void
```

**参数:**

- `row` - 行索引（从 0 开始）
- `col` - 列索引（从 0 开始）
- `value` - 单元格值

**示例:**

```javascript
viewer.setCellValue(0, 0, 'Hello World');
```

##### getCellValue()

获取单元格值。

```typescript
getCellValue(row: number, col: number): any
```

**参数:**

- `row` - 行索引
- `col` - 列索引

**返回:**

- `any` - 单元格值

**示例:**

```javascript
const value = viewer.getCellValue(0, 0);
console.log(value); // 'Hello World'
```

##### setActiveSheet()

切换到指定工作表。

```typescript
setActiveSheet(index: number): void
```

**参数:**

- `index` - 工作表索引

**示例:**

```javascript
viewer.setActiveSheet(1); // 切换到第二个工作表
```

##### getCurrentSheetIndex()

获取当前工作表索引。

```typescript
getCurrentSheetIndex(): number
```

**返回:**

- `number` - 当前工作表索引

##### search()

搜索内容。

```typescript
search(options: SearchOptions): SearchResult[]
```

**参数:**

- `options` - 搜索选项，详见 [SearchOptions](#searchoptions)

**返回:**

- `SearchResult[]` - 搜索结果数组

**示例:**

```javascript
const results = viewer.search({
  keyword: 'Apple',
  caseSensitive: false,
  matchWholeWord: false
});

console.log(results);
// [
//   { sheetIndex: 0, sheetName: 'Sheet1', row: 0, col: 0, value: 'Apple' },
//   ...
// ]
```

##### getSelection()

获取当前选择区域。

```typescript
getSelection(): SelectionRange | null
```

**返回:**

- `SelectionRange | null` - 选择区域或 null

**示例:**

```javascript
const selection = viewer.getSelection();
console.log(selection);
// {
//   sheetIndex: 0,
//   startRow: 0,
//   startCol: 0,
//   endRow: 5,
//   endCol: 3
// }
```

##### setFreeze()

冻结行或列。

```typescript
setFreeze(type: 'row' | 'column' | 'both', row?: number, column?: number): void
```

**参数:**

- `type` - 冻结类型
- `row` - 冻结行数（可选）
- `column` - 冻结列数（可选）

**示例:**

```javascript
// 冻结前 3 行
viewer.setFreeze('row', 3);

// 冻结前 2 列
viewer.setFreeze('column', undefined, 2);

// 冻结前 3 行和前 2 列
viewer.setFreeze('both', 3, 2);
```

##### undo()

撤销操作。

```typescript
undo(): void
```

##### redo()

重做操作。

```typescript
redo(): void
```

##### refresh()

刷新视图。

```typescript
refresh(): void
```

##### on()

监听事件。

```typescript
on(event: EventType, listener: EventListener): void
```

**参数:**

- `event` - 事件类型
- `listener` - 事件监听器

**示例:**

```javascript
viewer.on('cellChange', (data) => {
  console.log('单元格变化:', data);
});
```

##### off()

取消监听事件。

```typescript
off(event: EventType, listener: EventListener): void
```

**参数:**

- `event` - 事件类型
- `listener` - 事件监听器

##### destroy()

销毁实例，释放资源。

```typescript
destroy(): void
```

**示例:**

```javascript
viewer.destroy();
```

## 类型定义

### ExcelViewerOptions

```typescript
interface ExcelViewerOptions {
  container: string | HTMLElement;
  showToolbar?: boolean;
  showFormulaBar?: boolean;
  showSheetTabs?: boolean;
  allowEdit?: boolean;
  allowCopy?: boolean;
  allowPaste?: boolean;
  enableVirtualScroll?: boolean;
  virtualScrollThreshold?: number;
  lang?: 'zh' | 'en';
  theme?: 'light' | 'dark';
  customStyle?: string;
  hooks?: ExcelViewerHooks;
  performance?: {
    useWebWorker?: boolean;
    chunkSize?: number;
    lazyLoad?: boolean;
  };
}
```

### ExportOptions

```typescript
interface ExportOptions {
  format: 'xlsx' | 'csv' | 'html' | 'json';
  filename?: string;
  includeStyles?: boolean;
  includeFormulas?: boolean;
  sheets?: number[] | string[];
}
```

### SearchOptions

```typescript
interface SearchOptions {
  keyword: string;
  caseSensitive?: boolean;
  matchWholeWord?: boolean;
  scope?: 'current' | 'all';
  searchFormulas?: boolean;
}
```

### SheetData

```typescript
interface SheetData {
  name: string;
  index: number;
  data: CellData[][];
  rows?: RowConfig[];
  columns?: ColumnConfig[];
  merges?: MergeCell[];
  frozen?: FrozenConfig;
  filter?: FilterConfig;
}
```

### CellData

```typescript
interface CellData {
  v?: string | number | boolean | Date;
  t?: 's' | 'n' | 'b' | 'd' | 'e' | 'z';
  f?: string;
  z?: string;
  s?: CellStyle;
  w?: string;
  mc?: MergeCell;
}
```

### SelectionRange

```typescript
interface SelectionRange {
  sheetIndex: number;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}
```

### SearchResult

```typescript
interface SearchResult {
  sheetIndex: number;
  sheetName: string;
  row: number;
  col: number;
  value: any;
  matchIndex: number;
}
```

## 事件

### 事件类型

```typescript
type EventType =
  | 'load'
  | 'loadError'
  | 'cellChange'
  | 'cellClick'
  | 'cellDoubleClick'
  | 'selectionChange'
  | 'sheetChange'
  | 'export'
  | 'error'
  | 'destroy';
```

### 事件数据

#### load

文件加载完成。

```javascript
viewer.on('load', (data) => {
  console.log(data);
  // { status: 'success', sheets: [...] }
});
```

#### cellChange

单元格内容变化。

```javascript
viewer.on('cellChange', (data) => {
  console.log(data);
  // { row: 0, col: 0, oldValue: 'old', newValue: 'new' }
});
```

#### cellClick

单元格点击。

```javascript
viewer.on('cellClick', (data) => {
  console.log(data);
  // { sheetIndex: 0, row: 0, col: 0, value: 'Hello' }
});
```

#### selectionChange

选择区域变化。

```javascript
viewer.on('selectionChange', (range) => {
  console.log(range);
  // { sheetIndex: 0, startRow: 0, startCol: 0, endRow: 5, endCol: 3 }
});
```

## Vue 组件 API

### Props

```typescript
interface ExcelViewerProps {
  file?: File | ArrayBuffer | string;
  showToolbar?: boolean;
  showFormulaBar?: boolean;
  showSheetTabs?: boolean;
  allowEdit?: boolean;
  allowCopy?: boolean;
  allowPaste?: boolean;
  lang?: 'zh' | 'en';
  theme?: 'light' | 'dark';
  customStyle?: string;
  height?: string | number;
  width?: string | number;
}
```

### Events

- `@load` - 加载完成
- `@load-error` - 加载错误
- `@cell-change` - 单元格变化
- `@cell-click` - 单元格点击
- `@cell-double-click` - 单元格双击
- `@selection-change` - 选择变化
- `@sheet-change` - 工作表切换
- `@error` - 错误

### 方法

通过 ref 访问组件实例方法：

```vue
<template>
  <ExcelViewer ref="viewerRef" />
</template>

<script setup>
const viewerRef = ref();

// 调用方法
viewerRef.value.loadFile(file);
viewerRef.value.exportFile({ format: 'xlsx' });
</script>
```

## React 组件 API

### Props

同 Vue 组件，但使用 camelCase 命名。

### Ref 方法

```typescript
interface ExcelViewerRef {
  loadFile: (file: File | ArrayBuffer | string) => Promise<void>;
  getData: () => SheetData[];
  exportFile: (options: ExportOptions) => Blob | null;
  downloadFile: (options: ExportOptions) => void;
  // ... 其他方法
}
```

### 使用示例

```tsx
const viewerRef = useRef<ExcelViewerRef>(null);

viewerRef.current?.loadFile(file);
viewerRef.current?.exportFile({ format: 'xlsx' });
```

## Lit Web Component API

### 属性

- `file-url` - 文件 URL
- `show-toolbar` - 显示工具栏
- `show-formula-bar` - 显示公式栏
- `show-sheet-tabs` - 显示工作表标签
- `allow-edit` - 允许编辑
- `lang` - 语言
- `theme` - 主题
- `height` - 高度
- `width` - 宽度

### 事件

- `load` - 加载完成
- `load-error` - 加载错误
- `cell-change` - 单元格变化
- `cell-click` - 单元格点击
- `cell-double-click` - 单元格双击
- `selection-change` - 选择变化
- `sheet-change` - 工作表切换

### 方法

通过 DOM API 调用：

```javascript
const viewer = document.querySelector('excel-viewer');
await viewer.loadFile(file);
viewer.downloadFile({ format: 'xlsx' });
```


