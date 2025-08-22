# Vanilla JavaScript PDF Viewer Example

这是一个使用原生 JavaScript 实现的 PDF 查看器示例，展示了如何在不使用任何框架的情况下集成 `@ldesign/pdf` 库。

## 🌟 特性

### 核心功能
- **PDF 文档加载和显示** - 支持本地文件和远程 URL
- **页面导航** - 上一页/下一页，跳转到指定页面
- **缩放控制** - 放大、缩小、适应宽度、适应页面
- **搜索功能** - 全文搜索，高亮显示结果
- **缩略图显示** - 侧边栏缩略图导航
- **下载和打印** - 支持文档下载和打印

### 用户界面
- **响应式设计** - 适配桌面和移动设备
- **主题切换** - 支持浅色和深色主题
- **工具栏** - 完整的操作工具栏
- **状态栏** - 显示当前页面和总页数
- **加载状态** - 优雅的加载动画和进度提示

### 技术特性
- **原生 JavaScript** - 不依赖任何框架
- **ES6+ 语法** - 使用现代 JavaScript 特性
- **模块化设计** - 清晰的代码组织结构
- **错误处理** - 完善的错误处理机制
- **性能优化** - 懒加载和虚拟滚动
- **无障碍支持** - 键盘导航和屏幕阅读器支持

## 📁 文件结构

```
vanilla-js-example/
├── index.html          # 主 HTML 文件
├── styles/
│   ├── main.css        # 主样式文件
│   ├── components.css  # 组件样式
│   ├── themes.css      # 主题样式
│   └── responsive.css  # 响应式样式
├── scripts/
│   ├── main.js         # 主入口文件
│   ├── pdf-viewer.js   # PDF 查看器核心类
│   ├── ui-manager.js   # UI 管理器
│   ├── theme-manager.js # 主题管理器
│   ├── search-manager.js # 搜索管理器
│   ├── utils.js        # 工具函数
│   └── constants.js    # 常量定义
├── assets/
│   ├── icons/          # 图标文件
│   └── sample.pdf      # 示例 PDF 文件
└── README.md           # 说明文档
```

## 🚀 快速开始

### 1. 直接打开

由于这是纯 JavaScript 实现，您可以直接在浏览器中打开 `index.html` 文件：

```bash
# 在文件管理器中双击 index.html
# 或者使用浏览器打开
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### 2. 使用本地服务器（推荐）

为了避免 CORS 问题，建议使用本地服务器：

```bash
# 使用 Python
python -m http.server 8080
# 或 Python 3
python3 -m http.server 8080

# 使用 Node.js (需要安装 http-server)
npx http-server -p 8080

# 使用 PHP
php -S localhost:8080

# 然后在浏览器中访问
# http://localhost:8080
```

### 3. 使用 Live Server（VS Code 扩展）

如果您使用 VS Code，可以安装 Live Server 扩展，然后右键点击 `index.html` 选择 "Open with Live Server"。

## 💻 核心用法

### 基础初始化

```javascript
// 创建 PDF 查看器实例
const viewer = new PDFViewer({
  container: '#pdf-container',
  toolbar: '#pdf-toolbar',
  sidebar: '#pdf-sidebar'
});

// 加载 PDF 文档
viewer.loadDocument('path/to/document.pdf')
  .then(() => {
    console.log('PDF 加载成功');
  })
  .catch(error => {
    console.error('PDF 加载失败:', error);
  });
```

### 页面导航

```javascript
// 跳转到指定页面
viewer.goToPage(5);

// 上一页
viewer.previousPage();

// 下一页
viewer.nextPage();

// 监听页面变化
viewer.on('pageChanged', (pageNumber) => {
  console.log('当前页面:', pageNumber);
});
```

### 缩放控制

```javascript
// 设置缩放级别
viewer.setZoom(1.5); // 150%

// 适应宽度
viewer.fitToWidth();

// 适应页面
viewer.fitToPage();

// 监听缩放变化
viewer.on('zoomChanged', (zoomLevel) => {
  console.log('当前缩放:', zoomLevel);
});
```

### 搜索功能

```javascript
// 搜索文本
viewer.search('关键词')
  .then(results => {
    console.log('搜索结果:', results);
  });

// 跳转到下一个搜索结果
viewer.findNext();

// 跳转到上一个搜索结果
viewer.findPrevious();

// 清除搜索
viewer.clearSearch();
```

### 主题切换

```javascript
// 切换到深色主题
viewer.setTheme('dark');

// 切换到浅色主题
viewer.setTheme('light');

// 自动主题（跟随系统）
viewer.setTheme('auto');
```

## 🎨 自定义配置

### 查看器选项

```javascript
const viewer = new PDFViewer({
  // 容器选择器
  container: '#pdf-container',
  
  // 工具栏配置
  toolbar: {
    enabled: true,
    container: '#pdf-toolbar',
    buttons: ['zoom', 'navigation', 'search', 'download', 'print']
  },
  
  // 侧边栏配置
  sidebar: {
    enabled: true,
    container: '#pdf-sidebar',
    defaultTab: 'thumbnails' // 'thumbnails' | 'outline' | 'attachments'
  },
  
  // 渲染选项
  renderOptions: {
    scale: 1.0,
    rotation: 0,
    enableWebGL: true,
    enableAnnotations: true
  },
  
  // 搜索选项
  searchOptions: {
    caseSensitive: false,
    wholeWords: false,
    highlightAll: true
  },
  
  // 主题配置
  theme: {
    default: 'light', // 'light' | 'dark' | 'auto'
    followSystem: true
  },
  
  // 性能选项
  performance: {
    enableVirtualScrolling: true,
    maxCacheSize: 50, // MB
    preloadPages: 2
  }
});
```

### 事件监听

```javascript
// 文档加载事件
viewer.on('documentLoaded', (info) => {
  console.log('文档信息:', info);
});

// 页面渲染事件
viewer.on('pageRendered', (pageNumber) => {
  console.log('页面渲染完成:', pageNumber);
});

// 错误事件
viewer.on('error', (error) => {
  console.error('查看器错误:', error);
});

// 搜索事件
viewer.on('searchResults', (results) => {
  console.log('搜索结果:', results);
});

// 主题变化事件
viewer.on('themeChanged', (theme) => {
  console.log('主题已切换:', theme);
});
```

## 🔧 高级功能

### 自定义工具栏

```javascript
// 添加自定义按钮
viewer.toolbar.addButton({
  id: 'custom-action',
  icon: 'custom-icon',
  title: '自定义操作',
  onClick: () => {
    // 自定义逻辑
  }
});

// 移除按钮
viewer.toolbar.removeButton('custom-action');
```

### 自定义渲染

```javascript
// 自定义页面渲染
viewer.setPageRenderer((page, canvas, context) => {
  // 自定义渲染逻辑
  return page.render({
    canvasContext: context,
    viewport: page.getViewport({ scale: 1.0 })
  });
});
```

### 插件系统

```javascript
// 注册插件
viewer.use({
  name: 'custom-plugin',
  init: (viewer) => {
    // 插件初始化逻辑
  },
  destroy: () => {
    // 插件清理逻辑
  }
});
```

## 📱 响应式设计

示例包含完整的响应式设计，支持：

- **桌面设备** (1200px+) - 完整功能界面
- **平板设备** (768px-1199px) - 适配的工具栏和侧边栏
- **手机设备** (< 768px) - 移动优化界面

### 移动端特性

- 触摸手势支持（缩放、滑动）
- 自适应工具栏
- 底部导航栏
- 全屏模式

## 🎯 最佳实践

### 性能优化

```javascript
// 启用虚拟滚动
viewer.enableVirtualScrolling(true);

// 设置缓存大小
viewer.setCacheSize(100); // MB

// 预加载页面
viewer.setPreloadPages(3);

// 懒加载缩略图
viewer.enableLazyThumbnails(true);
```

### 错误处理

```javascript
// 全局错误处理
viewer.on('error', (error) => {
  switch (error.type) {
    case 'LOAD_ERROR':
      showErrorMessage('文档加载失败');
      break;
    case 'RENDER_ERROR':
      showErrorMessage('页面渲染失败');
      break;
    case 'NETWORK_ERROR':
      showErrorMessage('网络连接错误');
      break;
    default:
      showErrorMessage('未知错误');
  }
});

// 重试机制
viewer.setRetryOptions({
  maxRetries: 3,
  retryDelay: 1000
});
```

### 无障碍支持

```javascript
// 启用键盘导航
viewer.enableKeyboardNavigation(true);

// 设置 ARIA 标签
viewer.setAriaLabels({
  previousPage: '上一页',
  nextPage: '下一页',
  zoomIn: '放大',
  zoomOut: '缩小'
});

// 屏幕阅读器支持
viewer.enableScreenReader(true);
```

## 🌐 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
|--------|----------|------|
| Chrome | 61+ | 完全支持 |
| Firefox | 60+ | 完全支持 |
| Safari | 12+ | 完全支持 |
| Edge | 79+ | 完全支持 |
| IE | 不支持 | 需要现代浏览器 |

### 必需的浏览器特性

- ES6+ 支持
- Canvas API
- Web Workers
- Fetch API
- Promise
- Intersection Observer

## 🔍 故障排除

### 常见问题

**Q: PDF 文档无法加载**
A: 检查文件路径是否正确，确保使用 HTTP(S) 协议访问，避免 CORS 问题。

**Q: 页面渲染缓慢**
A: 尝试降低渲染质量，启用硬件加速，或减少预加载页面数量。

**Q: 搜索功能不工作**
A: 确保 PDF 文档包含可搜索的文本内容，而不是纯图片扫描件。

**Q: 移动端体验不佳**
A: 检查视口设置，确保启用了触摸手势支持。

### 调试模式

```javascript
// 启用调试模式
viewer.setDebugMode(true);

// 查看性能指标
viewer.getPerformanceMetrics();

// 导出日志
viewer.exportLogs();
```

## 📄 许可证

本示例代码遵循 MIT 许可证。详情请参阅 [LICENSE](../../LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个示例！

## 📞 支持

如果您在使用过程中遇到问题，可以：

1. 查看 [常见问题](#故障排除)
2. 提交 [GitHub Issue](https://github.com/ldesign-team/pdf/issues)
3. 查看 [API 文档](../../docs/api.md)
4. 参考 [其他示例](../)

---

**注意**: 这是一个示例项目，仅用于演示目的。在生产环境中使用时，请根据实际需求进行适当的修改和优化。