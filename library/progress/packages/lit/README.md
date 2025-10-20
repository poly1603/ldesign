# @ldesign/progress-lit

Lit Web Components 进度条组件封装。

## 安装

```bash
npm install @ldesign/progress-lit
```

## 使用

### 在 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@ldesign/progress-core/dist/index.css">
</head>
<body>
  <ld-linear-progress
    value="50"
    theme="primary"
  ></ld-linear-progress>
  
  <ld-circle-progress
    value="75"
    radius="60"
    theme="success"
  ></ld-circle-progress>

  <script type="module">
    import '@ldesign/progress-lit';
  </script>
</body>
</html>
```

### 在 JavaScript 中使用

```javascript
import { LinearProgress, CircleProgress } from '@ldesign/progress-lit';
import '@ldesign/progress-core/dist/index.css';

// 创建元素
const progress = document.createElement('ld-linear-progress');
progress.value = 50;
progress.theme = 'primary';

// 监听事件
progress.addEventListener('change', (e) => {
  console.log('Progress:', e.detail.value);
});

document.body.appendChild(progress);
```

## 属性和方法

所有 Web Components 都支持标准的属性和方法，与核心库保持一致。

查看主项目 README 获取详细文档。


