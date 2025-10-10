# Vanilla JavaScript 集成

在原生 JavaScript 项目中使用 `@ldesign/qrcode`，无需任何框架。

## 安装

### NPM

```bash
npm install @ldesign/qrcode
```

### CDN

```html
<!-- 开发版本 -->
<script src="https://unpkg.com/@ldesign/qrcode/dist/index.umd.js"></script>

<!-- 生产版本（压缩） -->
<script src="https://unpkg.com/@ldesign/qrcode/dist/index.umd.min.js"></script>
```

## 基础使用

### ES Modules

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>QR Code Example</title>
</head>
<body>
  <div id="qr-container"></div>

  <script type="module">
    import { createQRCode } from '@ldesign/qrcode';

    createQRCode({
      content: 'https://example.com',
      container: document.getElementById('qr-container'),
    });
  </script>
</body>
</html>
```

### UMD (CDN)

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>QR Code Example</title>
</head>
<body>
  <div id="qr-container"></div>

  <script src="https://unpkg.com/@ldesign/qrcode/dist/index.umd.js"></script>
  <script>
    const { createQRCode } = window.LDesignQRCode;

    createQRCode({
      content: 'https://example.com',
      container: document.getElementById('qr-container'),
    });
  </script>
</body>
</html>
```

## 完整示例

### 交互式二维码生成器

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code Generator</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .qr-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      background: #f3f4f6;
      border-radius: 12px;
      margin-bottom: 30px;
      min-height: 350px;
    }

    .controls {
      display: grid;
      gap: 20px;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-group label {
      font-weight: 600;
      color: #374151;
    }

    .control-group input[type="text"],
    .control-group select {
      padding: 10px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
    }

    .control-group input[type="text"]:focus,
    .control-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .control-group input[type="range"] {
      width: 100%;
    }

    .color-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 20px;
    }

    button {
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    button:hover {
      opacity: 0.9;
    }

    button:active {
      transform: scale(0.98);
    }

    .stats {
      margin-top: 20px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      display: none;
    }

    .stats.show {
      display: block;
    }

    .stats p {
      margin: 5px 0;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 QR Code Generator</h1>

    <!-- 二维码预览 -->
    <div class="qr-preview" id="qr-preview"></div>

    <!-- 控制面板 -->
    <div class="controls">
      <!-- 内容 -->
      <div class="control-group">
        <label for="content">内容</label>
        <input type="text" id="content" value="https://example.com" placeholder="输入内容">
      </div>

      <!-- 纠错级别 -->
      <div class="control-group">
        <label for="error-level">纠错级别</label>
        <select id="error-level">
          <option value="L">Low (7%)</option>
          <option value="M" selected>Medium (15%)</option>
          <option value="Q">Quartile (25%)</option>
          <option value="H">High (30%)</option>
        </select>
      </div>

      <!-- 模块样式 -->
      <div class="control-group">
        <label for="dot-style">模块样式</label>
        <select id="dot-style">
          <option value="square">方形</option>
          <option value="rounded" selected>圆角</option>
          <option value="dots">圆点</option>
          <option value="diamond">菱形</option>
          <option value="star">星形</option>
          <option value="classy">优雅</option>
          <option value="classy-rounded">圆角优雅</option>
        </select>
      </div>

      <!-- 颜色 -->
      <div class="color-group">
        <div class="control-group">
          <label for="fg-color">前景色</label>
          <input type="color" id="fg-color" value="#2563eb">
        </div>
        <div class="control-group">
          <label for="bg-color">背景色</label>
          <input type="color" id="bg-color" value="#ffffff">
        </div>
      </div>

      <!-- 尺寸 -->
      <div class="control-group">
        <label for="size">尺寸: <span id="size-value">300</span>px</label>
        <input type="range" id="size" min="150" max="500" value="300">
      </div>

      <!-- Logo -->
      <div class="control-group">
        <label>
          <input type="checkbox" id="show-logo">
          显示 Logo
        </label>
      </div>

      <div class="control-group" id="logo-url-group" style="display: none;">
        <label for="logo-url">Logo URL</label>
        <input type="text" id="logo-url" value="https://via.placeholder.com/100" placeholder="Logo 图片地址">
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button id="update-btn">更新</button>
        <button id="download-png-btn">下载 PNG</button>
        <button id="download-svg-btn">下载 SVG</button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats" id="stats"></div>
  </div>

  <script type="module">
    import { createQRCode } from '@ldesign/qrcode';

    // DOM 元素
    const container = document.getElementById('qr-preview');
    const contentInput = document.getElementById('content');
    const errorLevelSelect = document.getElementById('error-level');
    const dotStyleSelect = document.getElementById('dot-style');
    const fgColorInput = document.getElementById('fg-color');
    const bgColorInput = document.getElementById('bg-color');
    const sizeInput = document.getElementById('size');
    const sizeValue = document.getElementById('size-value');
    const showLogoCheckbox = document.getElementById('show-logo');
    const logoUrlGroup = document.getElementById('logo-url-group');
    const logoUrlInput = document.getElementById('logo-url');
    const updateBtn = document.getElementById('update-btn');
    const downloadPngBtn = document.getElementById('download-png-btn');
    const downloadSvgBtn = document.getElementById('download-svg-btn');
    const statsDiv = document.getElementById('stats');

    // 二维码实例
    let qrCode = null;

    // 初始化二维码
    function initQRCode() {
      const config = getConfig();

      if (qrCode) {
        qrCode.destroy();
      }

      qrCode = createQRCode({
        ...config,
        container,
        onGenerated: (info) => {
          showStats(info);
        },
      });
    }

    // 获取当前配置
    function getConfig() {
      const showLogo = showLogoCheckbox.checked;
      const logoUrl = logoUrlInput.value.trim();

      return {
        content: contentInput.value,
        errorCorrectionLevel: errorLevelSelect.value,
        style: {
          size: parseInt(sizeInput.value),
          dotStyle: dotStyleSelect.value,
          fgColor: fgColorInput.value,
          bgColor: bgColorInput.value,
        },
        logo: showLogo && logoUrl ? {
          src: logoUrl,
          width: '25%',
          height: '25%',
          logoBackground: true,
          logoBackgroundPadding: 8,
        } : undefined,
      };
    }

    // 显示统计信息
    function showStats(info) {
      statsDiv.classList.add('show');
      statsDiv.innerHTML = `
        <p><strong>版本:</strong> ${info.version}</p>
        <p><strong>模块数:</strong> ${info.moduleCount}</p>
        <p><strong>纠错级别:</strong> ${info.errorCorrectionLevel}</p>
        <p><strong>生成耗时:</strong> ${info.renderTime}ms</p>
      `;
    }

    // 更新二维码
    async function updateQRCode() {
      const config = getConfig();
      await qrCode.update(config);
    }

    // 事件监听
    sizeInput.addEventListener('input', () => {
      sizeValue.textContent = sizeInput.value;
    });

    showLogoCheckbox.addEventListener('change', () => {
      logoUrlGroup.style.display = showLogoCheckbox.checked ? 'block' : 'none';
    });

    updateBtn.addEventListener('click', updateQRCode);

    downloadPngBtn.addEventListener('click', () => {
      qrCode.download({ fileName: 'qrcode', format: 'png' });
    });

    downloadSvgBtn.addEventListener('click', () => {
      qrCode.download({ fileName: 'qrcode', format: 'svg' });
    });

    // 初始化
    initQRCode();
  </script>
</body>
</html>
```

## 动态更新

### 更新内容

```javascript
import { createQRCode } from '@ldesign/qrcode';

const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
});

// 更新内容
document.getElementById('update-btn').addEventListener('click', async () => {
  const newContent = document.getElementById('content-input').value;
  await qrCode.update({ content: newContent });
});
```

### 更新样式

```javascript
// 更新颜色
document.getElementById('color-input').addEventListener('change', async (e) => {
  await qrCode.update({
    style: {
      fgColor: e.target.value,
    },
  });
});

// 更新尺寸
document.getElementById('size-input').addEventListener('input', async (e) => {
  await qrCode.update({
    style: {
      size: parseInt(e.target.value),
    },
  });
});
```

### 实时预览

```javascript
// 使用防抖优化性能
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const contentInput = document.getElementById('content');
const updateQR = debounce(async () => {
  await qrCode.update({ content: contentInput.value });
}, 300);

contentInput.addEventListener('input', updateQR);
```

## 下载功能

### 下载为图片

```javascript
// 下载 PNG
document.getElementById('download-png').addEventListener('click', () => {
  qrCode.download({
    fileName: 'qrcode',
    format: 'png',
  });
});

// 下载 JPEG
document.getElementById('download-jpeg').addEventListener('click', () => {
  qrCode.download({
    fileName: 'qrcode',
    format: 'jpeg',
  });
});
```

### 获取 Data URL

```javascript
// 获取 Data URL
const dataUrl = qrCode.toDataURL('png');

// 在图片中显示
document.getElementById('preview-img').src = dataUrl;

// 复制到剪贴板
navigator.clipboard.writeText(dataUrl);
```

## 批量生成

### 生成多个二维码

```javascript
import { createQRCode } from '@ldesign/qrcode';

const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3',
];

urls.forEach((url, index) => {
  const container = document.getElementById(`qr-${index}`);
  createQRCode({
    content: url,
    container,
    style: { size: 200 },
  });
});
```

### 批量下载

```javascript
import { batchDownload } from '@ldesign/qrcode';

document.getElementById('batch-download').addEventListener('click', async () => {
  const items = [
    { content: 'https://example.com/1', fileName: 'qr-1' },
    { content: 'https://example.com/2', fileName: 'qr-2' },
    { content: 'https://example.com/3', fileName: 'qr-3' },
  ];

  await batchDownload({
    items,
    format: 'png',
    zipFileName: 'qrcodes.zip',
    style: {
      size: 300,
    },
    onProgress: (current, total) => {
      console.log(`进度: ${current}/${total}`);
      document.getElementById('progress').textContent =
        `${Math.round((current / total) * 100)}%`;
    },
  });
});
```

## 事件处理

### 监听生成完成

```javascript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
  onGenerated: (info) => {
    console.log('二维码已生成');
    console.log(`版本: ${info.version}`);
    console.log(`模块数: ${info.moduleCount}`);
    document.getElementById('loading').style.display = 'none';
  },
});
```

### 错误处理

```javascript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
  logo: {
    src: '/logo.png',
    onError: (error) => {
      console.error('Logo 加载失败:', error);
      alert('Logo 加载失败，将使用默认样式');
    },
  },
  onError: (error) => {
    console.error('生成失败:', error);
    document.getElementById('error-message').textContent = error.message;
  },
});
```

## 响应式设计

### 自适应容器

```javascript
function createResponsiveQR() {
  const container = document.getElementById('qr');
  const containerWidth = container.clientWidth;
  const size = Math.min(containerWidth - 40, 400);

  return createQRCode({
    content: 'https://example.com',
    container,
    style: { size },
  });
}

let qrCode = createResponsiveQR();

// 监听窗口大小变化
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    qrCode.destroy();
    qrCode = createResponsiveQR();
  }, 300);
});
```

### 媒体查询

```javascript
function getQRSize() {
  if (window.matchMedia('(max-width: 768px)').matches) {
    return 200; // 移动设备
  } else if (window.matchMedia('(max-width: 1024px)').matches) {
    return 250; // 平板
  } else {
    return 300; // 桌面
  }
}

const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
  style: {
    size: getQRSize(),
  },
});
```

## 懒加载

### Intersection Observer

```javascript
const qrContainers = document.querySelectorAll('.qr-lazy');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const container = entry.target;
      const content = container.dataset.qrContent;

      createQRCode({
        content,
        container,
        style: { size: 200 },
      });

      observer.unobserve(container);
    }
  });
});

qrContainers.forEach((container) => {
  observer.observe(container);
});
```

```html
<!-- HTML 结构 -->
<div class="qr-lazy" data-qr-content="https://example.com/1"></div>
<div class="qr-lazy" data-qr-content="https://example.com/2"></div>
<div class="qr-lazy" data-qr-content="https://example.com/3"></div>
```

## 打印优化

```javascript
// 切换到打印样式
function switchToPrintStyle() {
  return createQRCode({
    content: 'https://example.com',
    container: document.getElementById('qr'),
    errorCorrectionLevel: 'H',
    style: {
      size: 600,
      margin: 6,
      fgColor: '#000000',
      bgColor: '#ffffff',
      dotStyle: 'square',
    },
  });
}

// 打印
window.addEventListener('beforeprint', () => {
  switchToPrintStyle();
});

window.addEventListener('afterprint', () => {
  // 恢复正常样式
  initQRCode();
});
```

## 缓存管理

```javascript
import { enableCache, clearCache, getCacheStats } from '@ldesign/qrcode';

// 启用缓存
enableCache(true);

// 清除缓存
document.getElementById('clear-cache').addEventListener('click', () => {
  clearCache();
  alert('缓存已清除');
});

// 显示缓存统计
const stats = getCacheStats();
console.log(`缓存大小: ${stats.size}`);
console.log(`命中率: ${stats.hitRate}%`);
```

## 与其他库集成

### jQuery

```javascript
$.fn.qrcode = function(options) {
  return this.each(function() {
    createQRCode({
      ...options,
      container: this,
    });
  });
};

// 使用
$('#qr').qrcode({
  content: 'https://example.com',
  style: { size: 250 },
});
```

### Alpine.js

```html
<div x-data="qrCode()">
  <input x-model="content" @input="update">
  <div x-ref="container"></div>
</div>

<script>
  function qrCode() {
    return {
      content: 'https://example.com',
      qrCode: null,

      init() {
        this.qrCode = createQRCode({
          content: this.content,
          container: this.$refs.container,
        });
      },

      async update() {
        await this.qrCode.update({ content: this.content });
      },
    };
  }
</script>
```

## 最佳实践

### 1. 资源清理

```javascript
// 页面离开时清理
window.addEventListener('beforeunload', () => {
  qrCode.destroy();
});

// SPA 路由切换时清理
router.on('leave', () => {
  qrCode.destroy();
});
```

### 2. 错误处理

```javascript
try {
  const qrCode = createQRCode({
    content: userInput,
    container: document.getElementById('qr'),
  });
} catch (error) {
  console.error('生成失败:', error);
  showErrorMessage('二维码生成失败，请检查输入');
}
```

### 3. 加载提示

```javascript
const loading = document.getElementById('loading');
loading.style.display = 'block';

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr'),
  onGenerated: () => {
    loading.style.display = 'none';
  },
});
```

## 下一步

继续学习：

- [Vue 集成](./vue.md) - 在 Vue 3 中使用
- [React 集成](./react.md) - 在 React 中使用
- [API 参考](../api/types.md) - 完整的类型定义
