# PDF查看器高级功能示例

这个示例展示了PDF查看器的高级功能，包括性能监控、自定义插件、高级搜索、批注支持、多文档管理等功能。

## 🚀 功能特性

### 核心高级功能
- **性能监控** - 实时监控渲染性能、内存使用、加载时间
- **高级搜索** - 支持正则表达式、全文索引、搜索历史
- **批注支持** - 添加、编辑、删除PDF批注和标记
- **多文档管理** - 同时打开多个PDF文档，标签页切换
- **自定义插件** - 可扩展的插件系统
- **数据分析** - PDF内容分析、统计信息

### UI/UX增强
- **自适应布局** - 响应式设计，支持多种屏幕尺寸
- **手势支持** - 触摸设备的手势操作
- **键盘导航** - 完整的键盘快捷键支持
- **无障碍访问** - ARIA标签、屏幕阅读器支持
- **主题系统** - 多种预设主题，支持自定义主题

### 性能优化
- **虚拟滚动** - 大文档的高效渲染
- **懒加载** - 按需加载页面内容
- **缓存策略** - 智能缓存管理
- **Web Workers** - 后台处理，避免UI阻塞
- **内存管理** - 自动内存清理和优化

### 数据处理
- **文本提取** - 提取PDF中的文本内容
- **图像提取** - 提取PDF中的图像资源
- **元数据读取** - 读取PDF文档属性和元信息
- **表单处理** - 支持PDF表单填写和提交
- **数字签名** - 验证PDF数字签名

## 📁 文件结构

```
advanced-features/
├── README.md                 # 说明文档
├── index.html               # 主HTML文件
├── package.json             # 项目配置
├── vite.config.ts           # Vite配置
├── tsconfig.json            # TypeScript配置
├── src/                     # 源代码目录
│   ├── main.ts              # 主入口文件
│   ├── types/               # 类型定义
│   │   ├── index.ts
│   │   ├── performance.ts
│   │   ├── annotations.ts
│   │   └── plugins.ts
│   ├── core/                # 核心功能
│   │   ├── PDFManager.ts    # PDF文档管理器
│   │   ├── PerformanceMonitor.ts # 性能监控
│   │   ├── AnnotationManager.ts  # 批注管理
│   │   ├── SearchEngine.ts      # 搜索引擎
│   │   └── PluginSystem.ts      # 插件系统
│   ├── plugins/             # 插件目录
│   │   ├── analytics/       # 分析插件
│   │   ├── export/          # 导出插件
│   │   ├── collaboration/   # 协作插件
│   │   └── security/        # 安全插件
│   ├── components/          # UI组件
│   │   ├── PerformancePanel.ts
│   │   ├── AnnotationToolbar.ts
│   │   ├── SearchPanel.ts
│   │   ├── DocumentTabs.ts
│   │   └── PluginManager.ts
│   ├── utils/               # 工具函数
│   │   ├── performance.ts
│   │   ├── storage.ts
│   │   ├── analytics.ts
│   │   └── validation.ts
│   └── workers/             # Web Workers
│       ├── pdf-worker.ts
│       ├── search-worker.ts
│       └── analysis-worker.ts
├── styles/                  # 样式文件
│   ├── main.css
│   ├── components.css
│   ├── themes.css
│   ├── animations.css
│   └── responsive.css
├── assets/                  # 静态资源
│   ├── icons/
│   ├── fonts/
│   └── samples/
└── docs/                    # 文档
    ├── api.md
    ├── plugins.md
    ├── performance.md
    └── examples.md
```

## 🛠️ 快速开始

### 安装依赖

```bash
# 使用npm
npm install

# 使用pnpm
pnpm install

# 使用yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或者指定端口
npm run dev -- --port 3000
```

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 运行测试

```bash
# 运行单元测试
npm run test

# 运行性能测试
npm run test:performance

# 运行端到端测试
npm run test:e2e
```

## 📊 性能监控

### 实时性能指标

```typescript
import { PerformanceMonitor } from './src/core/PerformanceMonitor';

const monitor = new PerformanceMonitor();

// 开始监控
monitor.start();

// 获取性能数据
const metrics = monitor.getMetrics();
console.log('渲染时间:', metrics.renderTime);
console.log('内存使用:', metrics.memoryUsage);
console.log('FPS:', metrics.fps);

// 设置性能阈值
monitor.setThresholds({
  renderTime: 100, // 100ms
  memoryUsage: 50 * 1024 * 1024, // 50MB
  fps: 30
});

// 监听性能警告
monitor.on('warning', (metric, value, threshold) => {
  console.warn(`性能警告: ${metric} = ${value}, 阈值: ${threshold}`);
});
```

### 性能优化建议

```typescript
// 启用虚拟滚动（大文档）
const viewer = new PDFViewer({
  virtualScrolling: true,
  pageBufferSize: 3, // 缓存前后3页
  lazyLoading: true
});

// 使用Web Worker进行后台处理
const worker = new Worker('./src/workers/pdf-worker.ts');
worker.postMessage({ action: 'loadPDF', data: pdfData });

// 启用缓存
viewer.enableCache({
  maxSize: 100 * 1024 * 1024, // 100MB
  strategy: 'lru' // 最近最少使用
});
```

## 🔍 高级搜索

### 基础搜索

```typescript
import { SearchEngine } from './src/core/SearchEngine';

const searchEngine = new SearchEngine(pdfDocument);

// 简单文本搜索
const results = await searchEngine.search('关键词');

// 正则表达式搜索
const regexResults = await searchEngine.searchRegex(/\d{4}-\d{2}-\d{2}/);

// 模糊搜索
const fuzzyResults = await searchEngine.fuzzySearch('keywrd', {
  threshold: 0.8,
  distance: 100
});
```

### 高级搜索选项

```typescript
// 配置搜索选项
const searchOptions = {
  caseSensitive: false,
  wholeWords: true,
  regex: false,
  fuzzy: true,
  context: 50, // 上下文字符数
  highlight: true,
  maxResults: 100
};

const results = await searchEngine.search('查询词', searchOptions);

// 搜索结果包含详细信息
results.forEach(result => {
  console.log('页面:', result.pageNumber);
  console.log('位置:', result.position);
  console.log('上下文:', result.context);
  console.log('匹配文本:', result.matchText);
});
```

### 搜索历史和建议

```typescript
// 保存搜索历史
searchEngine.saveSearchHistory('查询词');

// 获取搜索历史
const history = searchEngine.getSearchHistory();

// 获取搜索建议
const suggestions = await searchEngine.getSuggestions('查询');

// 清除搜索历史
searchEngine.clearSearchHistory();
```

## ✏️ 批注功能

### 添加批注

```typescript
import { AnnotationManager } from './src/core/AnnotationManager';

const annotationManager = new AnnotationManager(pdfDocument);

// 添加文本批注
const textAnnotation = await annotationManager.addTextAnnotation({
  pageNumber: 1,
  x: 100,
  y: 200,
  width: 200,
  height: 50,
  content: '这是一个文本批注',
  author: '用户名',
  color: '#ffff00'
});

// 添加高亮批注
const highlightAnnotation = await annotationManager.addHighlight({
  pageNumber: 1,
  startX: 50,
  startY: 100,
  endX: 250,
  endY: 120,
  color: '#ffff00',
  opacity: 0.5
});

// 添加形状批注
const shapeAnnotation = await annotationManager.addShape({
  pageNumber: 1,
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 150,
  height: 100,
  strokeColor: '#ff0000',
  fillColor: '#ff000020',
  strokeWidth: 2
});
```

### 批注管理

```typescript
// 获取所有批注
const annotations = annotationManager.getAllAnnotations();

// 按页面获取批注
const pageAnnotations = annotationManager.getAnnotationsByPage(1);

// 按类型获取批注
const textAnnotations = annotationManager.getAnnotationsByType('text');

// 编辑批注
const updatedAnnotation = await annotationManager.updateAnnotation(annotationId, {
  content: '更新后的内容',
  color: '#00ff00'
});

// 删除批注
const deleted = await annotationManager.deleteAnnotation(annotationId);

// 导出批注
const exportData = annotationManager.exportAnnotations();

// 导入批注
const imported = await annotationManager.importAnnotations(exportData);
```

## 🔌 插件系统

### 创建插件

```typescript
import { Plugin } from './src/core/PluginSystem';

class MyCustomPlugin extends Plugin {
  name = 'my-custom-plugin';
  version = '1.0.0';
  description = '我的自定义插件';

  async initialize() {
    console.log('插件初始化');
    
    // 注册事件监听器
    this.on('document:loaded', this.onDocumentLoaded.bind(this));
    this.on('page:rendered', this.onPageRendered.bind(this));
  }

  async onDocumentLoaded(document) {
    console.log('文档已加载:', document.title);
  }

  async onPageRendered(pageNumber) {
    console.log('页面已渲染:', pageNumber);
  }

  async destroy() {
    console.log('插件销毁');
  }
}

// 注册插件
const pluginSystem = new PluginSystem();
pluginSystem.register(new MyCustomPlugin());
```

### 使用内置插件

```typescript
// 分析插件
import { AnalyticsPlugin } from './src/plugins/analytics';
pluginSystem.register(new AnalyticsPlugin({
  trackPageViews: true,
  trackSearches: true,
  trackAnnotations: true
}));

// 导出插件
import { ExportPlugin } from './src/plugins/export';
pluginSystem.register(new ExportPlugin({
  formats: ['pdf', 'png', 'jpeg', 'svg'],
  quality: 'high'
}));

// 协作插件
import { CollaborationPlugin } from './src/plugins/collaboration';
pluginSystem.register(new CollaborationPlugin({
  serverUrl: 'ws://localhost:8080',
  roomId: 'document-123'
}));
```

## 📱 多文档管理

### 文档标签页

```typescript
import { PDFManager } from './src/core/PDFManager';

const pdfManager = new PDFManager();

// 打开新文档
const document1 = await pdfManager.openDocument(file1);
const document2 = await pdfManager.openDocument(file2);

// 切换活动文档
pdfManager.setActiveDocument(document1.id);

// 获取所有打开的文档
const openDocuments = pdfManager.getOpenDocuments();

// 关闭文档
pdfManager.closeDocument(document1.id);

// 关闭所有文档
pdfManager.closeAllDocuments();
```

### 文档同步

```typescript
// 同步滚动位置
pdfManager.syncScrollPosition(true);

// 同步缩放级别
pdfManager.syncZoomLevel(true);

// 同步主题设置
pdfManager.syncTheme(true);
```

## 🎨 自定义主题

### 创建主题

```typescript
const customTheme = {
  name: 'my-theme',
  colors: {
    primary: '#007acc',
    secondary: '#f0f0f0',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  fonts: {
    primary: 'Inter, sans-serif',
    monospace: 'Fira Code, monospace'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
};

// 应用主题
themeManager.applyTheme(customTheme);
```

## 🧪 测试和调试

### 性能测试

```typescript
// 渲染性能测试
const renderTest = async () => {
  const startTime = performance.now();
  await viewer.renderPage(1);
  const endTime = performance.now();
  console.log(`页面渲染时间: ${endTime - startTime}ms`);
};

// 内存使用测试
const memoryTest = () => {
  const memory = performance.memory;
  console.log('已使用内存:', memory.usedJSHeapSize / 1024 / 1024, 'MB');
  console.log('总内存:', memory.totalJSHeapSize / 1024 / 1024, 'MB');
};

// 搜索性能测试
const searchTest = async () => {
  const startTime = performance.now();
  const results = await searchEngine.search('测试');
  const endTime = performance.now();
  console.log(`搜索时间: ${endTime - startTime}ms, 结果数: ${results.length}`);
};
```

### 调试工具

```typescript
// 启用调试模式
const viewer = new PDFViewer({
  debug: true,
  logLevel: 'debug'
});

// 性能分析
viewer.enableProfiling();

// 内存监控
viewer.enableMemoryMonitoring();

// 事件日志
viewer.enableEventLogging();
```

## 📚 API参考

### 核心类

- `PDFManager` - PDF文档管理器
- `PerformanceMonitor` - 性能监控器
- `AnnotationManager` - 批注管理器
- `SearchEngine` - 搜索引擎
- `PluginSystem` - 插件系统

### 工具函数

- `performance.ts` - 性能相关工具
- `storage.ts` - 存储相关工具
- `analytics.ts` - 分析相关工具
- `validation.ts` - 验证相关工具

详细的API文档请参考 [docs/api.md](./docs/api.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

- 📖 [文档](./docs/)
- 🐛 [问题反馈](https://github.com/your-org/ldesign/issues)
- 💬 [讨论区](https://github.com/your-org/ldesign/discussions)
- 📧 [邮件支持](mailto:support@ldesign.com)

## 🔗 相关链接

- [基础使用示例](../basic-usage/)
- [React示例](../react-example/)
- [Vue示例](../vue-example/)
- [原生JavaScript示例](../vanilla-js-example/)
- [主项目文档](../../README.md)