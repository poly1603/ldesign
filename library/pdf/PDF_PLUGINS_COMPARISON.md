# PDF插件对比和使用指南

## 1. **ViewerJS** (免费、开源)
- **特点**: 轻量级，支持PDF和ODF文档，内置文本选择
- **安装**: 
```bash
npm install viewerjs-pdf
```
- **优势**: 
  - 支持文本选择和复制
  - 无需额外配置
  - 移动端友好

## 2. **React-PDF** (React专用)
- **特点**: React组件化，支持文本层
- **安装**:
```bash
npm install react-pdf
```
- **使用示例**:
```jsx
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function MyPDFViewer() {
  return (
    <Document file="myfile.pdf">
      <Page pageNumber={1} renderTextLayer={true} />
    </Document>
  );
}
```

## 3. **PDFObject** (嵌入式方案)
- **特点**: 使用浏览器原生PDF查看器
- **安装**:
```bash
npm install pdfobject
```
- **优势**: 
  - 依赖浏览器内置PDF渲染
  - 自动支持文本选择
  - 极其轻量

## 4. **PSPDFKit** (商业版，功能最全)
- **特点**: 功能最完整的商业解决方案
- **功能**:
  - 完整的文本选择和复制
  - 注释和标记
  - 表单填写
  - 数字签名
  - OCR文字识别
- **价格**: 需要商业许可证

## 5. **PDF-LIB** (用于PDF操作)
- **特点**: 创建和修改PDF
- **安装**:
```bash
npm install pdf-lib
```
- **适用场景**: PDF生成和编辑，而非查看

## 推荐方案

### 对于你的项目，我建议：

1. **继续使用 pdfjs-dist + 正确配置文本层** (最推荐)
   - 已经在使用，只需添加文本层渲染
   - 社区支持最好
   - 功能完整

2. **备选方案: ViewerJS**
   - 如果需要更简单的实现
   - 开箱即用的文本选择

3. **商业方案: PSPDFKit**
   - 如果需要高级功能（注释、签名等）
   - 预算充足的情况下

## 实现文本复制的关键CSS

无论使用哪个插件，确保添加以下CSS：

```css
/* 文本层样式 */
.textLayer {
  position: absolute;
  text-align: initial;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2;
  line-height: 1;
  -webkit-text-size-adjust: none;
  -moz-text-size-adjust: none;
  text-size-adjust: none;
  forced-color-adjust: none;
}

.textLayer span,
.textLayer br {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}

/* 文本选中时的样式 */
.textLayer ::selection {
  background: rgba(0, 0, 255, 0.3);
}

.textLayer ::-moz-selection {
  background: rgba(0, 0, 255, 0.3);
}

/* 确保文本可选择 */
.textLayer {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}
```