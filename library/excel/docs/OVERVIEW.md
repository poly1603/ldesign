# Excel Viewer 项目概述

## 项目简介

Excel Viewer 是一个功能强大的 Excel 文件预览编辑插件，支持在浏览器中完整查看和编辑 Excel 文件。项目采用 TypeScript 开发，提供原生 JavaScript、Vue 3、React 和 Lit Web Components 等多种使用方式。

## 核心特性

### 1. 文件处理能力
- **多格式支持**: .xlsx, .xls, .csv
- **多种加载方式**: File 对象、ArrayBuffer、URL
- **大文件优化**: 虚拟滚动、Web Worker、懒加载
- **性能优化**: 支持 10 万+ 行数据

### 2. 完整的编辑功能
- **单元格编辑**: 支持文本、数字、日期等多种类型
- **公式计算**: 内置常用 Excel 函数
- **格式设置**: 字体、颜色、边框、对齐
- **操作历史**: 撤销/重做功能
- **批量操作**: 复制、粘贴、批量编辑

### 3. 高级交互
- **多工作表**: 完整的多 sheet 支持
- **搜索功能**: 快速查找单元格内容
- **筛选排序**: 数据筛选和排序
- **冻结窗格**: 冻结行列
- **合并单元格**: 自动识别和处理

### 4. 导出能力
- **Excel**: 导出为 .xlsx 格式
- **CSV**: 导出为 CSV 文件
- **HTML**: 导出为 HTML 表格
- **JSON**: 导出为 JSON 数据
- **截图**: 导出当前视图为图片

### 5. 框架集成
- **原生 JS**: 纯 JavaScript API
- **Vue 3**: Composition API 组件
- **React**: Hooks 支持
- **Lit**: 标准 Web Components

## 技术架构

### 核心依赖

```
┌─────────────────────────────────────┐
│         Excel Viewer Core          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────────┐   │
│  │  Parser  │  │   Renderer   │   │
│  │ (SheetJS)│  │ (Luckysheet) │   │
│  └──────────┘  └──────────────┘   │
│                                     │
│  ┌──────────┐  ┌──────────────┐   │
│  │ Exporter │  │Event System  │   │
│  └──────────┘  └──────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 包结构

```
@ldesign/excel-viewer
├── core        (核心功能)
│   ├── Parser      (文件解析)
│   ├── Renderer    (视图渲染)
│   ├── Exporter    (文件导出)
│   └── Viewer      (主类)
├── vue         (Vue 3 封装)
├── react       (React 封装)
└── lit         (Lit 封装)
```

## 数据流

```
加载文件
  ↓
解析 (SheetJS)
  ↓
数据转换
  ↓
渲染 (Luckysheet)
  ↓
用户交互
  ↓
数据更新
  ↓
导出/保存
```

## 模块说明

### 核心模块 (packages/core)

#### Parser (parser.ts)
- 负责 Excel 文件的解析
- 使用 SheetJS 库读取文件
- 支持多种文件格式
- 提取样式和格式信息
- 转换为标准数据结构

**主要方法:**
- `loadFromFile()` - 从文件加载
- `loadFromArrayBuffer()` - 从 ArrayBuffer 加载
- `loadFromUrl()` - 从 URL 加载
- `parseWorkbook()` - 解析工作簿
- `convertToLuckysheetFormat()` - 转换为渲染格式

#### Renderer (renderer.ts)
- 负责 Excel 的视图渲染
- 集成 Luckysheet 渲染引擎
- 处理虚拟滚动
- 管理用户交互
- 处理事件回调

**主要方法:**
- `init()` - 初始化渲染器
- `getData()` - 获取数据
- `setCellValue()` - 设置单元格值
- `search()` - 搜索功能
- `setFreeze()` - 冻结窗格

#### Exporter (exporter.ts)
- 负责文件导出
- 支持多种导出格式
- 处理样式导出
- 生成文件 Blob

**主要方法:**
- `exportToExcel()` - 导出 Excel
- `exportToCSV()` - 导出 CSV
- `exportToHTML()` - 导出 HTML
- `exportToJSON()` - 导出 JSON
- `exportToImage()` - 导出截图

#### Viewer (viewer.ts)
- 主要 API 类
- 协调各个模块
- 管理事件系统
- 提供公共接口

**主要方法:**
- `loadFile()` - 加载文件
- `getData()` - 获取数据
- `exportFile()` - 导出文件
- `search()` - 搜索
- `on()/off()` - 事件监听

### 框架封装

#### Vue 组件 (packages/vue)
- 提供 `<ExcelViewer>` 组件
- 支持 Composition API
- 响应式数据绑定
- Vue 事件系统

#### React 组件 (packages/react)
- 提供 `<ExcelViewer>` 组件
- 提供 `useExcelViewer` Hook
- TypeScript 类型支持
- Ref 转发

#### Lit 组件 (packages/lit)
- 提供 `<excel-viewer>` Web Component
- 标准 Custom Element
- Shadow DOM 支持
- 跨框架使用

## 性能优化策略

### 1. 虚拟滚动
- 只渲染可见区域
- 动态加载/卸载行列
- 大幅减少 DOM 节点

### 2. Web Worker
- 异步解析文件
- 不阻塞主线程
- 提升响应速度

### 3. 懒加载
- 按需加载工作表
- 分块加载数据
- 减少初始加载时间

### 4. 内存管理
- 及时清理无用数据
- 合理的缓存策略
- 提供 `destroy()` 方法

### 5. 代码优化
- Tree Shaking
- 代码分割
- 压缩混淆

## 兼容性

### 浏览器支持
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动浏览器

### 框架版本
- Vue 3.0+
- React 16.8+ (Hooks)
- 任何支持 Web Components 的环境

## 使用场景

1. **在线表格编辑器**
   - Web 应用中的表格编辑功能
   - 在线办公套件

2. **数据展示**
   - 报表展示
   - 数据分析结果展示

3. **文件预览**
   - 文件管理系统
   - 云盘预览功能

4. **数据导入导出**
   - Excel 数据导入
   - 数据导出为 Excel

5. **移动端查看**
   - 手机/平板上查看 Excel
   - 移动办公应用

## 开发路线图

### v1.0 (已完成)
- ✅ 核心功能实现
- ✅ 框架封装
- ✅ 基础示例
- ✅ 完整文档

### v1.1 (计划中)
- 图表支持
- 数据透视表
- 高级条件格式
- 批注功能

### v1.2 (计划中)
- 协同编辑
- 插件系统
- 主题定制器
- 更多函数支持

### v2.0 (未来)
- 完整的 Excel 功能支持
- 性能进一步优化
- 移动端专属优化

## 贡献

欢迎贡献代码、报告问题或提出建议！详见 [贡献指南](../CONTRIBUTING.md)。

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](../LICENSE)。

## 相关资源

- [GitHub 仓库](https://github.com/ldesign/excel-viewer)
- [API 文档](API.md)
- [使用指南](GUIDE.md)
- [常见问题](FAQ.md)
- [更新日志](../CHANGELOG.md)


