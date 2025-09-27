# LDesign DocView - Vite 演示项目

这是一个使用 Vite + JavaScript 构建的 LDesign DocView 库演示项目，展示了如何在 Web 应用中集成文档预览和编辑功能。

## 功能特性

- 📄 **多格式支持**: 支持 Word (.docx)、Excel (.xlsx)、PowerPoint (.pptx) 文档
- 👀 **实时预览**: 即时预览文档内容
- ✏️ **在线编辑**: 支持文档内容的在线编辑
- 💾 **保存下载**: 支持文档保存和下载
- 🖨️ **打印功能**: 支持文档打印
- 📱 **响应式设计**: 适配桌面端和移动端
- 🎨 **现代 UI**: 美观的用户界面设计

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm run dev
# 或
yarn dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
# 或
pnpm run build
# 或
yarn build
```

### 预览生产版本

```bash
npm run preview
# 或
pnpm run preview
# 或
yarn preview
```

## 使用说明

### 上传文档

1. 点击"选择文档"按钮选择本地文件
2. 或者直接拖拽文件到查看器区域
3. 支持的格式：.docx、.xlsx、.pptx

### 示例文件

点击示例文件按钮可以快速加载演示内容：
- **Word 示例**: 展示文本格式化、表格等功能
- **Excel 示例**: 展示表格数据显示
- **PPT 示例**: 展示幻灯片导航功能

### 编辑功能

1. 勾选"启用编辑"选项
2. 在文档内容区域直接编辑
3. 修改会实时保存到内存中

### 工具栏

- **保存**: 保存当前文档内容
- **下载**: 下载文档文件
- **打印**: 打印文档内容

## 技术栈

- **构建工具**: Vite 5.x
- **语言**: JavaScript (ES6+)
- **样式**: CSS3 + CSS Variables
- **文档处理**: 
  - mammoth.js (Word 文档)
  - xlsx.js (Excel 文档)
  - JSZip (PowerPoint 文档)

## 项目结构

```
vite-demo/
├── public/                 # 静态资源
│   └── favicon.svg        # 网站图标
├── src/                   # 源代码
│   ├── styles/           # 样式文件
│   │   └── main.css      # 主样式文件
│   ├── main.js           # 主 JavaScript 文件
│   └── mock-docview.js   # 模拟的 DocView 库
├── index.html            # HTML 入口文件
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
└── README.md            # 项目说明
```

## 核心功能实现

### 文档加载

```javascript
const viewer = new DocumentViewer({
  container: '#documentViewer',
  editable: true,
  toolbar: { show: true },
  callbacks: {
    onLoad: (info) => console.log('文档加载完成', info),
    onError: (error) => console.error('加载失败', error)
  }
})

await viewer.loadDocument(file)
```

### 编辑模式

```javascript
// 启用编辑
viewer.setEditable(true)

// 获取内容
const content = viewer.getContent()

// 保存文档
const blob = await viewer.save()
```

## 注意事项

1. **文件格式**: 目前支持现代 Office 格式 (.docx, .xlsx, .pptx)
2. **文件大小**: 建议单个文件不超过 50MB
3. **浏览器兼容**: 支持现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+)
4. **编辑限制**: 编辑功能主要支持文本内容，复杂格式可能丢失

## 开发说明

这个演示项目使用了模拟的 DocumentViewer 类 (`mock-docview.js`)，在实际项目中应该：

1. 安装完整的 `@ldesign/docview` 包
2. 替换导入语句：
   ```javascript
   // 替换
   import { DocumentViewer } from './mock-docview.js'
   
   // 为
   import { DocumentViewer } from '@ldesign/docview'
   ```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
