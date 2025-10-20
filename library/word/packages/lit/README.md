# @word-viewer/lit

Lit Web Component - Word 文档查看器。

## 📦 安装

```bash
npm install @word-viewer/lit
```

## 🚀 快速开始

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@word-viewer/lit';
  </script>
</head>
<body>
  <word-viewer
    src="document.docx"
    zoom="1.2"
    theme="light"
  ></word-viewer>
</body>
</html>
```

## 📖 Attributes

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | - | 文档 URL |
| `zoom` | `number` | `1.0` | 缩放级别 |
| `editable` | `boolean` | `false` | 是否可编辑 |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | 主题 |
| `readonly` | `boolean` | `false` | 只读模式 |

## 📡 Events

| 事件 | 详情 | 说明 |
|------|------|------|
| `loaded` | `CustomEvent` | 文档加载完成 |
| `error` | `CustomEvent` | 发生错误 |
| `changed` | `CustomEvent` | 内容改变 |
| `zoom` | `CustomEvent<number>` | 缩放改变 |
| `page-change` | `CustomEvent` | 页面改变 |

## 🎯 示例

### JavaScript 控制

```javascript
const viewer = document.querySelector('word-viewer');

// 监听事件
viewer.addEventListener('loaded', (e) => {
  console.log('已加载', e.detail);
});

// 设置文档源
const file = document.querySelector('input').files[0];
viewer.source = file;

// 调用方法
viewer.setZoom(1.5);
viewer.enableEdit();

// 导出
const pdf = await viewer.exportToPDF();
```

### 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@word-viewer/lit';

    window.onload = () => {
      const viewer = document.querySelector('word-viewer');
      const fileInput = document.querySelector('#file');
      
      fileInput.onchange = (e) => {
        viewer.source = e.target.files[0];
      };

      viewer.addEventListener('loaded', () => {
        console.log('文档已加载');
      });

      document.querySelector('#export').onclick = async () => {
        const pdf = await viewer.exportToPDF();
        // 下载 PDF
      };
    };
  </script>
</head>
<body>
  <input type="file" id="file" />
  <button id="export">导出 PDF</button>
  
  <word-viewer zoom="1.2" theme="light"></word-viewer>
</body>
</html>
```

## 🛠️ 方法

| 方法 | 说明 |
|------|------|
| `getViewer()` | 获取核心 WordViewer 实例 |
| `loadDocument(source)` | 加载文档 |
| `setZoom(level)` | 设置缩放 |
| `enableEdit()` | 启用编辑 |
| `disableEdit()` | 禁用编辑 |
| `exportToPDF()` | 导出为 PDF |
| `exportToHTML()` | 导出为 HTML |

## 📄 许可证

MIT


