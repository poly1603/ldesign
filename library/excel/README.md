# @ldesign/excel-editor

基于Web的现代化Excel表格编辑器插件，支持TypeScript，提供完整的表格渲染、编辑、公式计算等功能。

## ✨ 特性

- 🎯 **单元格编辑** - 支持双击或按Enter键编辑单元格，支持多种数据类型
- ⌨️ **键盘导航** - 使用方向键在单元格间导航，支持Tab键快速移动
- 📁 **文件操作** - 支持导入导出Excel文件，兼容.xlsx和.xls格式
- 🎨 **主题定制** - 支持浅色和深色主题，可自定义样式和颜色
- 📱 **响应式设计** - 适配各种屏幕尺寸，在移动设备上也能良好使用
- 🔧 **TypeScript支持** - 完整的TypeScript类型定义，提供更好的开发体验
- 🚀 **高性能** - 虚拟滚动支持，可处理大量数据
- 🎪 **事件系统** - 完整的事件监听机制，支持自定义扩展

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/excel-editor

# 使用 npm
npm install @ldesign/excel-editor

# 使用 yarn
yarn add @ldesign/excel-editor
```

## 🚀 快速开始

### 基础用法

```typescript
import { createExcelEditor } from '@ldesign/excel-editor'

// 创建Excel编辑器
const editor = createExcelEditor({
  container: '#excel-container', // 容器选择器或DOM元素
  data: {
    worksheets: [{
      name: 'Sheet1',
      cells: {
        'A1': { value: 'Hello' },
        'B1': { value: 'World' },
        'A2': { value: 123 },
        'B2': { value: true }
      },
      rowCount: 100,
      columnCount: 26
    }],
    activeSheetIndex: 0
  }
})

// 监听单元格变化
editor.on('cellChange', (data) => {
  console.log('单元格变化:', data)
})
```

### HTML结构

```html
<!DOCTYPE html>
<html>
<head>
  <title>Excel Editor Example</title>
</head>
<body>
  <div id="excel-container" style="width: 100%; height: 600px;"></div>
  <script src="your-script.js"></script>
</body>
</html>
```

## 📖 API文档

### ExcelEditor类

#### 构造函数

```typescript
new ExcelEditor(options: ExcelEditorOptions)
```

#### 配置选项

```typescript
interface ExcelEditorOptions {
  container: HTMLElement | string        // 容器元素或选择器
  data?: Workbook                       // 初始数据
  readonly?: boolean                    // 是否只读模式
  theme?: 'light' | 'dark'             // 主题
  showGridlines?: boolean              // 是否显示网格线
  showRowNumbers?: boolean             // 是否显示行号
  showColumnHeaders?: boolean          // 是否显示列标题
  enableFormulas?: boolean             // 是否启用公式计算
  enableUndo?: boolean                 // 是否启用撤销重做
  maxUndoSteps?: number               // 最大撤销步数
  virtualScroll?: VirtualScrollOptions // 虚拟滚动配置
}
```

#### 主要方法

```typescript
// 获取/设置单元格值
getCellValue(position: CellPosition, worksheetIndex?: number): CellValueType
setCellValue(position: CellPosition, value: CellValueType, worksheetIndex?: number): void

// 获取/设置单元格对象
getCell(position: CellPosition, worksheetIndex?: number): Cell | undefined
setCell(position: CellPosition, cell: Cell, worksheetIndex?: number): void

// 获取/设置工作簿数据
getData(): Workbook
setData(data: Workbook): void

// 文件操作
exportToExcel(filename?: string): Promise<void>
importFromExcel(file: File): Promise<void>

// 工作表操作
getActiveWorksheet(): Worksheet
setActiveWorksheet(index: number): void

// 事件监听
on(eventType: ExcelEventType, listener: ExcelEventListener): this
off(eventType: ExcelEventType, listener?: ExcelEventListener): this

// 销毁编辑器
destroy(): void
```

### 便捷函数

```typescript
// 创建Excel编辑器
createExcelEditor(options: ExcelEditorOptions): ExcelEditor

// 创建空工作簿
createEmptyWorkbook(worksheetName?: string, rowCount?: number, columnCount?: number): Workbook

// 列索引转换
columnIndexToName(columnIndex: number): string
columnNameToIndex(columnName: string): number

// 单元格引用
getCellReference(position: CellPosition): string
parseCellReference(reference: string): CellPosition | null
```

## 🎯 事件系统

```typescript
// 支持的事件类型
type ExcelEventType = 
  | 'cellChange'      // 单元格值变化
  | 'cellSelect'      // 单元格选择
  | 'worksheetChange' // 工作表切换
  | 'beforeEdit'      // 编辑前
  | 'afterEdit'       // 编辑后
  | 'beforeSave'      // 保存前
  | 'afterSave'       // 保存后
  | 'error'           // 错误

// 事件监听示例
editor.on('cellChange', (data) => {
  console.log('单元格变化:', {
    position: data.position,
    oldValue: data.oldValue,
    newValue: data.newValue,
    worksheetIndex: data.worksheetIndex
  })
})

editor.on('error', (data) => {
  console.error('编辑器错误:', data.error)
})
```

## 🎨 样式定制

编辑器使用LDesign设计系统的CSS变量，可以通过覆盖这些变量来自定义样式：

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-bg-color-container: #ffffff;
  --ldesign-border-color: #d9d9d9;
  --ldesign-text-color-primary: rgba(0, 0, 0, 90%);
  /* 更多变量... */
}

/* 自定义编辑器样式 */
.ldesign-excel-editor {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.ldesign-excel-editor .excel-cell.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
}
```

## 📱 响应式支持

编辑器内置响应式设计，在不同屏幕尺寸下自动调整：

```typescript
// 移动端优化配置
const editor = createExcelEditor({
  container: '#excel-container',
  virtualScroll: {
    enabled: true,
    rowHeight: 35,      // 移动端增加行高
    columnWidth: 120,   // 移动端增加列宽
    bufferSize: 5       // 减少缓冲区大小
  }
})
```

## 🔧 开发

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ldesign/library.git
cd library/excel

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build
```

### 运行示例

```bash
# 启动示例项目
pnpm example:dev

# 构建示例项目
pnpm example:build

# 预览示例项目
pnpm example:preview
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行测试UI
pnpm test:ui
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📞 支持

- 📧 邮箱: support@ldesign.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/ldesign/library/issues)
- 📖 文档: [在线文档](https://ldesign.github.io/library/excel)

## 🙏 致谢

感谢以下开源项目：

- [SheetJS](https://github.com/SheetJS/sheetjs) - Excel文件处理
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具
- [Vitest](https://vitest.dev/) - 测试框架
