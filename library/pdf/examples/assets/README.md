# 示例PDF文件

这个目录包含用于测试PDF阅读器的示例文件。

## 📄 sample.html

这是一个包含多页内容的HTML文件，可以转换为PDF用于测试。

### 如何转换为PDF

#### 方法1：使用浏览器打印功能

1. 在浏览器中打开 `sample.html` 文件
2. 按 `Ctrl+P` (Windows) 或 `Cmd+P` (Mac) 打开打印对话框
3. 选择"保存为PDF"或"Microsoft Print to PDF"
4. 点击"保存"，将文件保存为 `sample.pdf`

#### 方法2：使用在线转换工具

1. 访问在线HTML转PDF工具，如：
   - https://www.ilovepdf.com/html-to-pdf
   - https://html-pdf-converter.com/
   - https://www.sejda.com/html-to-pdf

2. 上传 `sample.html` 文件或粘贴HTML内容
3. 下载生成的PDF文件

#### 方法3：使用命令行工具

如果你安装了 `wkhtmltopdf`：

```bash
wkhtmltopdf sample.html sample.pdf
```

如果你安装了 `puppeteer`：

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/sample.html');
  await page.pdf({ 
    path: 'sample.pdf', 
    format: 'A4',
    printBackground: true
  });
  await browser.close();
})();
```

## 📚 在线示例PDF

示例项目中已经预设了一些在线PDF文件链接：

1. **技术论文** - Mozilla的TraceMonkey论文，14页技术文档
2. **WCAG指南** - W3C的无障碍指南，多页文档
3. **Hello World** - PDF.js的简单示例文件
4. **PDF规范** - Adobe的PDF格式规范文档

这些文件可以直接在示例项目中点击加载，无需本地文件。

## 🔧 自定义测试文件

你也可以创建自己的测试PDF文件：

1. 创建包含不同内容的HTML文件（文本、图片、表格等）
2. 使用上述方法转换为PDF
3. 在示例项目中上传测试

### 建议的测试内容

- **多页文档** - 测试页面导航功能
- **不同字体大小** - 测试缩放功能
- **图片内容** - 测试图片渲染
- **表格和列表** - 测试复杂布局
- **长文档** - 测试性能和滚动
- **特殊字符** - 测试文本搜索功能

## 📱 移动端测试

建议创建一些适合移动端测试的PDF文件：

- 窄屏幕布局
- 大字体内容
- 简单的单列布局
- 触摸友好的交互元素

## 🎯 功能测试清单

使用示例PDF文件测试以下功能：

- [ ] 文件加载和显示
- [ ] 页面导航（上一页/下一页）
- [ ] 页面跳转
- [ ] 缩放控制（放大/缩小）
- [ ] 适合宽度/适合页面
- [ ] 文本搜索
- [ ] 键盘快捷键
- [ ] 响应式布局
- [ ] 主题切换
- [ ] 错误处理

## 📝 注意事项

1. **文件大小** - 避免使用过大的PDF文件，可能影响加载性能
2. **跨域问题** - 在线PDF文件可能存在跨域限制
3. **浏览器兼容性** - 确保在不同浏览器中测试
4. **移动端适配** - 在移动设备上测试触摸操作

## 🔗 有用的资源

- [PDF.js官方示例](https://mozilla.github.io/pdf.js/examples/)
- [PDF测试文件集合](https://github.com/mozilla/pdf.js/tree/master/test/pdfs)
- [在线PDF工具](https://smallpdf.com/)
- [PDF格式规范](https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf)
