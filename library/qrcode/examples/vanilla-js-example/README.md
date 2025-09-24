# @ldesign/qrcode Vanilla JavaScript 示例

这是一个完整的原生 JavaScript/HTML 示例项目，展示了 `@ldesign/qrcode` 二维码生成库在纯前端环境中的使用方法。

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录下
cd examples/vanilla-js-example
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
# 或者
pnpm serve
```

访问 [http://localhost:3003](http://localhost:3003) 查看示例。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
vanilla-js-example/
├── styles/
│   └── main.css                # 主样式文件
├── js/
│   └── main.js                 # 主脚本文件
├── index.html                  # 主页面
├── package.json                # 项目配置
├── vite.config.js              # Vite 配置
└── README.md                   # 项目说明
```

## 🎯 功能特性

### 1. 基础示例
- 文本输入和二维码生成
- 尺寸、格式、错误纠正级别配置
- 实时预览和下载功能
- 快速示例模板

### 2. 高级功能
- Logo 嵌入功能
- 批量二维码生成
- 缓存管理和性能优化

### 3. 样式定制（开发中）
- 颜色自定义
- 预设样式模板
- 样式对比功能

### 4. 数据类型（开发中）
- 多种数据类型支持
- 动态表单生成
- 快速示例模板

## 🛠️ 技术栈

- **原生 JavaScript (ES6+)** - 现代 JavaScript 语法
- **HTML5** - 语义化标记
- **CSS3** - 现代样式特性
- **Vite** - 快速的构建工具
- **@ldesign/qrcode** - 二维码生成库
- **LDesign 设计系统** - 统一的设计语言

## 📖 使用方法

### 基本用法

```html
<!DOCTYPE html>
<html>
<head>
  <title>QR Code Example</title>
</head>
<body>
  <input id="qr-text" placeholder="输入文本">
  <button id="generate-btn">生成二维码</button>
  <div id="qr-container"></div>

  <script type="module">
    import { generateQRCode } from '@ldesign/qrcode'

    document.getElementById('generate-btn').addEventListener('click', async () => {
      const text = document.getElementById('qr-text').value
      const container = document.getElementById('qr-container')
      
      const options = {
        size: 200,
        format: 'canvas',
        errorCorrectionLevel: 'M'
      }
      
      const result = await generateQRCode(text, options)
      
      if (result.element) {
        container.innerHTML = ''
        container.appendChild(result.element)
      }
    })
  </script>
</body>
</html>
```

### 高级用法

```javascript
// 带 Logo 的二维码
const options = {
  size: 300,
  format: 'canvas',
  errorCorrectionLevel: 'H',
  logo: {
    src: logoImageSrc,
    size: 60
  }
}

// 自定义样式
const options = {
  size: 250,
  format: 'canvas',
  foregroundColor: '#722ED1',
  backgroundColor: '#f1ecf9',
  margin: 4
}

// 批量生成
const texts = ['text1', 'text2', 'text3']
const results = []

for (const text of texts) {
  const result = await generateQRCode(text, options)
  results.push(result)
}
```

## 🎨 设计系统

项目使用 LDesign 设计系统，包含：

- **颜色系统** - 品牌色、灰色、功能色
- **间距系统** - 统一的间距规范
- **组件样式** - 按钮、表单、卡片等
- **响应式设计** - 移动端适配

## 🔧 开发指南

### 添加新功能

1. 在 `js/main.js` 中添加新的功能函数
2. 在 `index.html` 中添加相应的 HTML 结构
3. 在 `styles/main.css` 中添加相应的样式

### 自定义样式

所有样式都使用 CSS 变量，可以通过修改 `:root` 中的变量来自定义主题：

```css
:root {
  --ldesign-brand-color-6: #your-color;
  --ldesign-text-color-primary: #your-text-color;
}
```

### 事件处理

使用现代 JavaScript 事件处理：

```javascript
// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 初始化代码
})

// 异步函数处理
async function handleGenerate() {
  try {
    const result = await generateQRCode(text, options)
    // 处理结果
  } catch (error) {
    console.error('生成失败:', error)
  }
}
```

## 📝 注意事项

1. **模块化** - 使用 ES6 模块语法
2. **错误处理** - 所有异步操作都包含错误处理
3. **性能优化** - 避免不必要的 DOM 操作
4. **响应式设计** - 支持移动端和桌面端
5. **浏览器兼容性** - 支持现代浏览器

## 🌐 浏览器支持

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件

## 🔗 相关链接

- [LDesign 官网](https://www.ldesign.com)
- [GitHub 仓库](https://github.com/ldesign/qrcode)
- [API 文档](../../docs/api.md)
- [更新日志](../../CHANGELOG.md)
