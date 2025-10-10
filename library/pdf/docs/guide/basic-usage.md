# 基础用法

本页面介绍@ldesign/pdf的基本使用方法。

## 创建查看器

### 最简单的方式

```javascript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});

viewer.load('https://example.com/sample.pdf');
```

### 使用配置选项

```javascript
const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
  quality: 'high',
  layout: 'continuous',
});
```

## 加载PDF

### 从URL加载

```javascript
await viewer.load('https://example.com/document.pdf');
```

### 从本地文件加载

```javascript
const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    await viewer.load(url);
  }
});
```

### 从ArrayBuffer加载

```javascript
const response = await fetch('https://example.com/document.pdf');
const buffer = await response.arrayBuffer();
await viewer.load(buffer);
```

### 从Uint8Array加载

```javascript
const data = new Uint8Array([/* PDF数据 */]);
await viewer.load(data);
```

## 页面导航

### 跳转到指定页

```javascript
viewer.goToPage(5); // 跳转到第5页
```

### 下一页/上一页

```javascript
viewer.nextPage();      // 下一页
viewer.previousPage();  // 上一页
```

### 获取当前页码

```javascript
console.log('当前页:', viewer.currentPage);
console.log('总页数:', viewer.totalPages);
```

### 监听页面变化

```javascript
viewer.on('pageChange', (pageNumber) => {
  console.log(`切换到第${pageNumber}页`);
  updatePageDisplay(pageNumber);
});
```

## 缩放控制

### 设置缩放比例

```javascript
// 固定比例
viewer.setScale(1.5);  // 150%
viewer.setScale(2);    // 200%

// 自适应模式
viewer.setScale('auto');       // 自动
viewer.setScale('page-fit');   // 适应页面
viewer.setScale('page-width'); // 适应宽度
viewer.setScale('page-height');// 适应高度
```

### 放大/缩小

```javascript
viewer.zoomIn();       // 放大10%
viewer.zoomIn(0.2);    // 放大20%

viewer.zoomOut();      // 缩小10%
viewer.zoomOut(0.2);   // 缩小20%
```

### 获取当前缩放比例

```javascript
console.log('缩放比例:', viewer.scale);
console.log('百分比:', Math.round(viewer.scale * 100) + '%');
```

### 监听缩放变化

```javascript
viewer.on('scaleChange', (scale) => {
  console.log('缩放比例:', Math.round(scale * 100) + '%');
  updateScaleDisplay(scale);
});
```

## 页面旋转

### 旋转页面

```javascript
viewer.rotate(90);   // 顺时针旋转90度
viewer.rotate(-90);  // 逆时针旋转90度
viewer.rotate(180);  // 旋转180度
```

## 搜索文本

### 基础搜索

```javascript
const results = await viewer.search('关键词');

console.log(`找到 ${results.length} 个匹配项`);

results.forEach(result => {
  console.log(`页码: ${result.pageNumber}`);
  console.log(`文本: ${result.text}`);
  console.log(`上下文: ${result.context}`);
});
```

### 高级搜索

```javascript
const results = await viewer.search('关键词', {
  caseSensitive: true,  // 区分大小写
  wholeWords: true,     // 全词匹配
});
```

### 跳转到搜索结果

```javascript
const results = await viewer.search('关键词');

if (results.length > 0) {
  // 跳转到第一个匹配项所在页
  viewer.goToPage(results[0].pageNumber);
}
```

## 获取文档信息

### 基本信息

```javascript
const info = viewer.getDocumentInfo();

if (info) {
  console.log('标题:', info.title);
  console.log('作者:', info.author);
  console.log('主题:', info.subject);
  console.log('页数:', info.numPages);
  console.log('PDF版本:', info.pdfVersion);
}
```

### 页面信息

```javascript
const pageInfo = viewer.getPageInfo(1);

if (pageInfo) {
  console.log('宽度:', pageInfo.width);
  console.log('高度:', pageInfo.height);
  console.log('旋转角度:', pageInfo.rotation);
  console.log('缩放比例:', pageInfo.scale);
}
```

### 文档大纲

```javascript
const outline = await viewer.getOutline();

outline.forEach(item => {
  console.log(`${item.title} -> 第${item.pageNumber}页`);

  // 处理子项
  if (item.children) {
    item.children.forEach(child => {
      console.log(`  ${child.title} -> 第${child.pageNumber}页`);
    });
  }
});
```

## 缩略图

### 获取缩略图

```javascript
const thumbnail = await viewer.getThumbnail(1);

// 添加到页面
document.getElementById('thumbnails').appendChild(thumbnail);

// 添加点击事件
thumbnail.addEventListener('click', () => {
  viewer.goToPage(1);
});
```

### 批量生成缩略图

```javascript
async function generateThumbnails() {
  const container = document.getElementById('thumbnail-list');

  for (let i = 1; i <= viewer.totalPages; i++) {
    const thumbnail = await viewer.getThumbnail(i);

    const wrapper = document.createElement('div');
    wrapper.className = 'thumbnail-item';
    wrapper.appendChild(thumbnail);

    const label = document.createElement('div');
    label.textContent = `第${i}页`;
    wrapper.appendChild(label);

    wrapper.addEventListener('click', () => {
      viewer.goToPage(i);
    });

    container.appendChild(wrapper);
  }
}
```

## 打印和下载

### 打印

```javascript
// 使用默认选项
await viewer.print();

// 自定义选项
await viewer.print({
  dpi: 300,
  showDialog: true,
  orientation: 'portrait',
});
```

### 下载

```javascript
// 默认文件名
viewer.download();

// 自定义文件名
viewer.download('my-document.pdf');
```

### 导出

```javascript
// 导出为Blob
const blob = await viewer.export({
  format: 'pdf',
  quality: 1,
});

// 保存或处理Blob
const url = URL.createObjectURL(blob);
// ...
```

## 文本选择

### 获取选中文本

```javascript
const selectedText = viewer.getSelectedText();
console.log('选中的文本:', selectedText);
```

### 监听文本选择

```javascript
viewer.on('textSelect', (text) => {
  console.log('选中:', text);

  // 显示复制按钮等操作
  showCopyButton(text);
});
```

## 刷新渲染

重新渲染当前页面：

```javascript
viewer.refresh();
```

## 销毁实例

使用完毕后销毁实例以释放资源：

```javascript
viewer.destroy();
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer Example</title>
  <style>
    #pdf-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ccc;
    }

    .controls {
      margin-bottom: 10px;
    }

    .controls button {
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <div class="controls">
    <button id="prev-btn">上一页</button>
    <span id="page-info">1 / 1</span>
    <button id="next-btn">下一页</button>

    <button id="zoom-out-btn">缩小</button>
    <span id="scale-info">100%</span>
    <button id="zoom-in-btn">放大</button>

    <button id="rotate-btn">旋转</button>
    <button id="print-btn">打印</button>
    <button id="download-btn">下载</button>

    <input type="text" id="search-input" placeholder="搜索...">
    <button id="search-btn">搜索</button>
  </div>

  <div id="pdf-container"></div>

  <script type="module">
    import { PDFViewer } from '@ldesign/pdf';

    const viewer = new PDFViewer({
      container: '#pdf-container',
      workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
      on: {
        loadComplete: (info) => {
          console.log('加载完成:', info);
          updateUI();
        },
        pageChange: (page) => {
          updateUI();
        },
        scaleChange: (scale) => {
          document.getElementById('scale-info').textContent =
            Math.round(scale * 100) + '%';
        },
      },
    });

    // 加载PDF
    viewer.load('https://example.com/sample.pdf');

    // 绑定按钮事件
    document.getElementById('prev-btn').onclick = () => viewer.previousPage();
    document.getElementById('next-btn').onclick = () => viewer.nextPage();
    document.getElementById('zoom-out-btn').onclick = () => viewer.zoomOut();
    document.getElementById('zoom-in-btn').onclick = () => viewer.zoomIn();
    document.getElementById('rotate-btn').onclick = () => viewer.rotate(90);
    document.getElementById('print-btn').onclick = () => viewer.print();
    document.getElementById('download-btn').onclick = () => viewer.download('document.pdf');

    document.getElementById('search-btn').onclick = async () => {
      const query = document.getElementById('search-input').value;
      const results = await viewer.search(query);
      console.log(`找到 ${results.length} 个匹配项`);

      if (results.length > 0) {
        viewer.goToPage(results[0].pageNumber);
      }
    };

    function updateUI() {
      document.getElementById('page-info').textContent =
        `${viewer.currentPage} / ${viewer.totalPages}`;

      document.getElementById('prev-btn').disabled = viewer.currentPage <= 1;
      document.getElementById('next-btn').disabled = viewer.currentPage >= viewer.totalPages;
    }
  </script>
</body>
</html>
```

## 下一步

- [配置选项](/guide/configuration) - 了解所有配置选项
- [事件系统](/guide/events) - 了解如何监听事件
- [Vue集成](/guide/vue) - 在Vue中使用
- [高级功能](/guide/search) - 了解更多高级功能
