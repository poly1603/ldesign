# 安装和配置指南

本指南将帮助你快速设置和运行@ldesign/pdf项目。

## ⚠️ 重要：PDF.js Worker配置

PDF.js需要一个Worker文件才能正常工作。项目提供了两种方案：

### 方案1：自动安装（推荐）

运行以下命令会自动安装依赖并复制Worker文件：

```bash
# 安装所有依赖
pnpm install

# Worker文件会自动复制到示例项目的public目录
```

### 方案2：手动复制

如果自动复制失败，可以手动复制：

```bash
# 手动复制Worker文件
pnpm copy-worker

# 或者手动操作：
# 1. 找到文件: node_modules/pdfjs-dist/build/pdf.worker.min.js
# 2. 复制到:
#    - examples/vue3-demo/public/pdf.worker.min.js
#    - examples/vanilla-demo/public/pdf.worker.min.js
```

### 方案3：使用CDN（备选）

如果本地Worker无法加载，可以使用CDN：

```javascript
// 在示例代码中修改workerSrc:
workerSrc: 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js'

// 或使用jsDelivr:
workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'
```

## 📦 完整安装步骤

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install
```

这会安装：
- 主项目依赖
- 所有示例项目依赖（通过workspace）
- 自动复制Worker文件

### 2. 验证安装

检查Worker文件是否存在：

```bash
# 检查文件
ls examples/vue3-demo/public/pdf.worker.min.js
ls examples/vanilla-demo/public/pdf.worker.min.js
```

如果文件不存在，运行：

```bash
pnpm copy-worker
```

### 3. 运行示例

```bash
# Vue3示例
pnpm dev:vue3
# 访问 http://localhost:3000

# 原生JS示例
pnpm dev:vanilla
# 访问 http://localhost:3001

# 文档站点
pnpm docs:dev
# 访问 http://localhost:5173
```

## 🐛 故障排除

### Worker加载失败

**错误信息:**
```
Setting up fake worker failed
```

**解决方案:**

1. **确认Worker文件存在**
   ```bash
   ls examples/vue3-demo/public/pdf.worker.min.js
   ```

2. **检查Worker路径配置**
   ```javascript
   // 确保使用正确的路径
   workerSrc: '/pdf.worker.min.js'  // ✅ 正确
   workerSrc: 'pdf.worker.min.js'   // ❌ 错误（缺少前导斜杠）
   ```

3. **清除缓存并重启**
   ```bash
   # 停止开发服务器
   # 清除浏览器缓存
   # 重新运行
   pnpm dev:vue3
   ```

4. **使用CDN Worker（临时方案）**
   ```javascript
   workerSrc: 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js'
   ```

### PDF加载失败

**错误信息:**
```
Failed to load PDF
```

**可能原因和解决方案:**

1. **CORS问题**
   - 使用测试PDF: `https://pdfobject.com/pdf/sample.pdf`
   - 或上传本地PDF文件

2. **PDF文件损坏**
   - 尝试其他PDF文件
   - 使用示例中提供的测试PDF

3. **Worker未加载**
   - 参考上面的"Worker加载失败"解决方案

### 依赖安装失败

**解决方案:**

```bash
# 清理缓存
pnpm store prune

# 删除锁文件和node_modules
rm -rf node_modules pnpm-lock.yaml
rm -rf examples/*/node_modules

# 重新安装
pnpm install
```

### 示例无法启动

**检查清单:**

- [ ] 是否运行了 `pnpm install`
- [ ] Worker文件是否存在
- [ ] 端口是否被占用
- [ ] Node版本是否>=18

**解决方案:**

```bash
# 1. 确保依赖已安装
pnpm install

# 2. 复制Worker文件
pnpm copy-worker

# 3. 重新运行
pnpm dev:vue3
```

## 📝 开发工作流

### 日常开发

```bash
# 1. 启动示例项目
pnpm dev:vue3

# 2. 修改源代码 src/

# 3. 重新构建
pnpm build

# 4. 刷新浏览器查看更改
```

### 测试所有功能

```bash
# 1. 运行Vue3示例
pnpm dev:vue3

# 2. 测试功能清单:
# - [ ] PDF加载（URL和本地文件）
# - [ ] 页面导航（上一页、下一页、跳转）
# - [ ] 缩放控制（放大、缩小、适应）
# - [ ] 页面旋转
# - [ ] 文本搜索
# - [ ] 打印
# - [ ] 下载
```

### 构建发布

```bash
# 构建主库
pnpm build

# 构建所有（包括示例和文档）
pnpm build:all

# 发布到npm
npm publish
```

## 🎯 快速测试

### 最小化测试

创建一个简单的HTML文件测试：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer Test</title>
</head>
<body>
  <h1>PDF Viewer Test</h1>
  <div id="pdf-container" style="width: 100%; height: 600px;"></div>

  <script type="module">
    import { PDFViewer } from './dist/index.js';

    // 配置Worker
    const viewer = new PDFViewer({
      container: '#pdf-container',
      workerSrc: './examples/vue3-demo/public/pdf.worker.min.js',
    });

    // 加载测试PDF
    viewer.load('https://pdfobject.com/pdf/sample.pdf')
      .then(() => console.log('✅ PDF加载成功'))
      .catch(err => console.error('❌ PDF加载失败:', err));
  </script>
</body>
</html>
```

保存为`test.html`，然后：

```bash
# 构建项目
pnpm build

# 启动简单服务器
npx serve .

# 访问 http://localhost:3000/test.html
```

## ✅ 验证清单

安装完成后，检查以下内容：

- [ ] `node_modules`目录存在
- [ ] `examples/vue3-demo/public/pdf.worker.min.js`存在
- [ ] `examples/vanilla-demo/public/pdf.worker.min.js`存在
- [ ] 能够成功运行`pnpm dev:vue3`
- [ ] 能够在浏览器中看到示例页面
- [ ] PDF文件能够正常加载和显示

## 📞 需要帮助？

如果遇到问题：

1. 查看[DEVELOPMENT.md](./DEVELOPMENT.md)了解详细开发指南
2. 查看[QUICKSTART.md](./QUICKSTART.md)了解快速开始
3. 提交[Issue](https://github.com/ldesign/pdf/issues)

## 🔗 相关链接

- [PDF.js文档](https://mozilla.github.io/pdf.js/)
- [Vue 3文档](https://vuejs.org/)
- [Vite文档](https://vitejs.dev/)

---

如果按照本指南操作后仍有问题，请提供：
- 操作系统
- Node版本
- pnpm版本
- 完整错误信息
- 执行的命令

以便我们更好地帮助你解决问题。
