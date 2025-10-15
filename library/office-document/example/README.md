# Office Viewer Example

这是一个使用 `@ldesign/office-viewer` 的完整示例项目，展示如何在实际应用中使用 Office 文档查看器。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备示例文件（可选）

如果你想使用示例文件链接功能，请在 `public/samples` 目录下添加以下文件：

- `sample.docx` - Word 文档示例
- `sample.xlsx` - Excel 表格示例
- `sample.pptx` - PowerPoint 演示文稿示例

查看 `public/samples/README.md` 了解更多信息。

### 3. 启动开发服务器

```bash
npm run dev
```

然后在浏览器中打开显示的地址（通常是 `http://localhost:5173`）。

## 📖 功能特性

### 文件上传
- 支持拖拽或点击上传 Office 文档
- 自动检测文件类型（.docx, .xlsx, .pptx）
- 可手动指定文档类型

### 查看器控制
- **缩放**：放大/缩小文档查看
- **下载**：下载原始文档
- **打印**：打印文档
- **全屏**：全屏查看模式
- **主题切换**：明亮/暗黑主题

### 文档类型支持

#### Word 文档 (.docx)
- 支持文本格式、样式
- 支持图片、表格
- 支持页面布局

#### Excel 表格 (.xlsx)
- 多工作表切换
- 公式栏显示
- 网格线显示
- 冻结窗格

#### PowerPoint 演示文稿 (.pptx)
- 幻灯片导航
- 缩略图预览
- 自动播放（可配置）
- 演示模式

## 🛠️ 技术栈

- **Vite** - 快速的开发服务器和构建工具
- **TypeScript** - 类型安全
- **@ldesign/office-viewer** - Office 文档查看器核心库

## 📝 代码示例

查看 `src/main.ts` 了解完整的使用示例，包括：

- 创建查看器实例
- 配置选项
- 事件监听
- 错误处理
- 主题切换

## 🔧 自定义配置

你可以修改 `src/main.ts` 中的配置来自定义查看器行为：

```typescript
const viewer = new OfficeViewer({
 container: '#viewer',
 source: file,
 theme: 'light', // 'light' 或 'dark'
 enableZoom: true,
 enableDownload: true,
 enablePrint: true,
 enableFullscreen: true,
 showToolbar: true,
 // 更多配置选项...
});
```

## 📦 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 📄 许可证

MIT
