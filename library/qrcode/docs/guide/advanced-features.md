# 高级功能

本指南介绍 `@ldesign/qrcode` 的高级功能和最佳实践。

## 批量生成

### 批量下载

批量生成多个二维码并打包下载：

```typescript
import { batchDownload } from '@ldesign/qrcode';

// 准备数据
const items = [
  { content: 'https://example.com/page1', fileName: 'qr-page-1' },
  { content: 'https://example.com/page2', fileName: 'qr-page-2' },
  { content: 'https://example.com/page3', fileName: 'qr-page-3' },
];

// 批量下载
await batchDownload({
  items,
  format: 'png',
  zipFileName: 'qrcodes.zip',
  style: {
    size: 300,
    fgColor: '#2563eb',
  },
  errorCorrectionLevel: 'M',
  onProgress: (current, total) => {
    console.log(`进度: ${current}/${total}`);
  },
});
```

**配置选项：**
- `items`: 二维码数组，每个包含 `content` 和 `fileName`
- `format`: 下载格式 `'png' | 'jpeg' | 'svg'`
- `zipFileName`: ZIP 文件名
- `style`: 统一的样式配置
- `errorCorrectionLevel`: 纠错级别
- `onProgress`: 进度回调函数

### 并行生成

使用 Promise.all 并行生成多个二维码：

```typescript
import { createQRCode } from '@ldesign/qrcode';

const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  'https://example.com/page3',
];

// 并行生成
const qrCodes = await Promise.all(
  urls.map((url, index) => {
    const container = document.getElementById(`qr-${index}`)!;
    return createQRCode({
      content: url,
      container,
      style: { size: 250 },
    });
  })
);

console.log(`生成了 ${qrCodes.length} 个二维码`);
```

### 批量导出数据

批量获取二维码的 Data URL：

```typescript
async function exportMultipleQRCodes(contents: string[]) {
  const results: Array<{ content: string; dataUrl: string }> = [];

  for (const content of contents) {
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);

    // 生成二维码
    const qrCode = createQRCode({
      content,
      container: tempContainer,
      style: { size: 300 },
    });

    // 获取 Data URL
    const dataUrl = qrCode.toDataURL('png');
    results.push({ content, dataUrl });

    // 清理
    qrCode.destroy();
    document.body.removeChild(tempContainer);
  }

  return results;
}

// 使用
const contents = ['URL1', 'URL2', 'URL3'];
const dataUrls = await exportMultipleQRCodes(contents);
console.log(dataUrls);
```

## 缓存机制

### 内存缓存

启用内存缓存以提高性能：

```typescript
import { createQRCode, enableCache } from '@ldesign/qrcode';

// 启用缓存（默认已启用）
enableCache(true);

// 第一次生成（耗时较长）
const qr1 = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr1')!,
});

// 相同内容的二维码会从缓存读取（几乎瞬间完成）
const qr2 = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr2')!,
});
```

### 清除缓存

```typescript
import { clearCache } from '@ldesign/qrcode';

// 清除所有缓存
clearCache();

// 或清除特定内容的缓存
clearCache('https://example.com');
```

### 缓存统计

```typescript
import { getCacheStats } from '@ldesign/qrcode';

const stats = getCacheStats();
console.log(`缓存命中率: ${stats.hitRate}%`);
console.log(`缓存大小: ${stats.size} 项`);
console.log(`内存占用: ${stats.memoryUsage} KB`);
```

## 性能优化

### 懒加载

延迟加载屏幕外的二维码：

```typescript
function lazyLoadQRCodes() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const container = entry.target as HTMLElement;
        const content = container.dataset.qrContent;

        if (content) {
          createQRCode({
            content,
            container,
            style: { size: 200 },
          });

          // 停止观察已加载的二维码
          observer.unobserve(container);
        }
      }
    });
  });

  // 观察所有二维码容器
  document.querySelectorAll('.qr-lazy').forEach((el) => {
    observer.observe(el);
  });
}

// HTML 结构
// <div class="qr-lazy" data-qr-content="https://example.com"></div>
```

### 虚拟滚动

处理大量二维码列表：

```typescript
import { createQRCode } from '@ldesign/qrcode';

class QRCodeVirtualList {
  private items: string[];
  private visibleItems: Map<number, any>;
  private container: HTMLElement;

  constructor(items: string[], container: HTMLElement) {
    this.items = items;
    this.visibleItems = new Map();
    this.container = container;
    this.setupScroll();
  }

  private setupScroll() {
    this.container.addEventListener('scroll', () => {
      this.renderVisible();
    });
    this.renderVisible();
  }

  private renderVisible() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    const itemHeight = 250;

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

    // 清理不可见的二维码
    this.visibleItems.forEach((qrCode, index) => {
      if (index < startIndex || index > endIndex) {
        qrCode.destroy();
        this.visibleItems.delete(index);
      }
    });

    // 渲染可见的二维码
    for (let i = startIndex; i <= endIndex && i < this.items.length; i++) {
      if (!this.visibleItems.has(i)) {
        const itemContainer = this.container.querySelector(
          `[data-index="${i}"]`
        ) as HTMLElement;

        if (itemContainer) {
          const qrCode = createQRCode({
            content: this.items[i],
            container: itemContainer,
            style: { size: 200 },
          });
          this.visibleItems.set(i, qrCode);
        }
      }
    }
  }
}

// 使用
const urls = Array.from({ length: 1000 }, (_, i) => `https://example.com/${i}`);
const list = new QRCodeVirtualList(urls, document.getElementById('qr-list')!);
```

### Web Worker

使用 Web Worker 在后台生成二维码：

```typescript
// qrcode-worker.ts
import { createQRCode } from '@ldesign/qrcode';

self.addEventListener('message', async (e) => {
  const { id, content, options } = e.data;

  try {
    // 创建离屏 canvas
    const canvas = new OffscreenCanvas(options.size, options.size);
    const ctx = canvas.getContext('2d');

    // 生成二维码（简化示例）
    // 实际实现需要适配 OffscreenCanvas

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    const dataUrl = await blobToDataURL(blob);

    self.postMessage({ id, success: true, dataUrl });
  } catch (error) {
    self.postMessage({ id, success: false, error: error.message });
  }
});

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
```

```typescript
// main.ts
const worker = new Worker('qrcode-worker.ts', { type: 'module' });

worker.onmessage = (e) => {
  const { id, success, dataUrl, error } = e.data;
  if (success) {
    document.getElementById(id)!.src = dataUrl;
  } else {
    console.error('生成失败:', error);
  }
};

// 发送任务
worker.postMessage({
  id: 'qr-1',
  content: 'https://example.com',
  options: { size: 300 },
});
```

## 预设主题

### 使用内置主题

```typescript
import { createQRCode, themes } from '@ldesign/qrcode';

// 使用预设主题
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  ...themes.modern,  // 使用现代主题
});
```

**内置主题：**

```typescript
// themes.modern - 现代蓝色
{
  errorCorrectionLevel: 'M',
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
  },
}

// themes.elegant - 优雅紫色
{
  errorCorrectionLevel: 'M',
  style: {
    size: 300,
    dotStyle: 'classy-rounded',
    gradient: {
      type: 'linear',
      colors: ['#8b5cf6', '#ec4899'],
      direction: 90,
    },
  },
}

// themes.minimal - 极简黑白
{
  errorCorrectionLevel: 'M',
  style: {
    size: 300,
    dotStyle: 'square',
    fgColor: '#000000',
    bgColor: '#ffffff',
  },
}
```

### 自定义主题

创建自己的主题库：

```typescript
import type { QRCodeConfig } from '@ldesign/qrcode';

export const myThemes = {
  corporate: {
    errorCorrectionLevel: 'H',
    style: {
      size: 300,
      dotStyle: 'classy',
      fgColor: '#1e40af',
      bgColor: '#ffffff',
    },
    logo: {
      width: '25%',
      height: '25%',
      logoBackground: true,
      logoBackgroundColor: '#ffffff',
    },
  } as Partial<QRCodeConfig>,

  creative: {
    errorCorrectionLevel: 'H',
    style: {
      size: 300,
      dotStyle: 'dots',
      gradient: {
        type: 'radial',
        colors: ['#ff6b6b', '#ee5a6f'],
        position: { x: 0.5, y: 0.5 },
      },
      shadow: {
        blur: 10,
        color: 'rgba(255, 107, 107, 0.3)',
        offsetY: 5,
      },
    },
  } as Partial<QRCodeConfig>,
};

// 使用
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  ...myThemes.corporate,
});
```

## 数据验证

### 内容验证

验证二维码内容是否有效：

```typescript
import { validateContent } from '@ldesign/qrcode';

const content = 'https://example.com';
const result = validateContent(content);

if (result.valid) {
  console.log('内容有效');
  console.log(`类型: ${result.type}`); // 'url', 'text', 'email' 等
  console.log(`估计大小: ${result.estimatedSize} bytes`);
} else {
  console.error('内容无效:', result.errors);
}
```

**验证规则：**
- URL 格式检查
- 内容长度限制
- 特殊字符验证
- 编码能力评估

### 尺寸推荐

根据内容获取推荐的二维码尺寸：

```typescript
import { getRecommendedSize } from '@ldesign/qrcode';

const content = 'Very long content that needs a larger QR code...';
const recommendedSize = getRecommendedSize(content, 'M');

console.log(`推荐尺寸: ${recommendedSize}px`);

createQRCode({
  content,
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'M',
  style: {
    size: recommendedSize,
  },
});
```

## 错误处理

### 全局错误处理

```typescript
import { createQRCode, QRCodeError } from '@ldesign/qrcode';

try {
  const qrCode = createQRCode({
    content: 'https://example.com',
    container: document.getElementById('qr')!,
  });
} catch (error) {
  if (error instanceof QRCodeError) {
    switch (error.code) {
      case 'INVALID_CONTENT':
        console.error('内容无效:', error.message);
        break;
      case 'CONTAINER_NOT_FOUND':
        console.error('容器不存在:', error.message);
        break;
      case 'LOGO_LOAD_FAILED':
        console.error('Logo 加载失败:', error.message);
        break;
      default:
        console.error('未知错误:', error.message);
    }
  } else {
    console.error('系统错误:', error);
  }
}
```

### Logo 加载失败处理

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  logo: {
    src: '/logo.png',
    onError: (error) => {
      console.error('Logo 加载失败:', error);
      // 可以提供回退 Logo
      return '/fallback-logo.png';
    },
  },
});
```

## 事件监听

### 生成事件

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  onGenerated: (info) => {
    console.log('二维码已生成');
    console.log(`版本: ${info.version}`);
    console.log(`模块数: ${info.moduleCount}`);
    console.log(`纠错级别: ${info.errorCorrectionLevel}`);
    console.log(`生成耗时: ${info.renderTime}ms`);
  },
});
```

### 更新事件

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  onUpdate: (changes) => {
    console.log('二维码已更新');
    console.log('变更:', changes);
  },
});

await qrCode.update({ content: 'New content' });
```

### 扫描事件

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  trackScans: true,  // 启用扫描追踪（需要后端支持）
  onScan: (scanInfo) => {
    console.log('二维码被扫描');
    console.log(`扫描时间: ${scanInfo.timestamp}`);
    console.log(`扫描位置: ${scanInfo.location}`);
  },
});
```

## 响应式设计

### 自适应尺寸

```typescript
import { createQRCode } from '@ldesign/qrcode';

class ResponsiveQRCode {
  private qrCode: any;
  private container: HTMLElement;
  private config: any;

  constructor(container: HTMLElement, config: any) {
    this.container = container;
    this.config = config;
    this.render();
    this.setupResize();
  }

  private render() {
    const size = this.calculateSize();

    if (this.qrCode) {
      this.qrCode.destroy();
    }

    this.qrCode = createQRCode({
      ...this.config,
      container: this.container,
      style: {
        ...this.config.style,
        size,
      },
    });
  }

  private calculateSize(): number {
    const containerWidth = this.container.clientWidth;
    const maxSize = 400;
    const minSize = 150;
    return Math.min(Math.max(containerWidth - 40, minSize), maxSize);
  }

  private setupResize() {
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.render();
      }, 300); // 防抖
    });
  }
}

// 使用
new ResponsiveQRCode(document.getElementById('qr')!, {
  content: 'https://example.com',
  errorCorrectionLevel: 'M',
});
```

### 暗色模式

自动适配系统暗色模式：

```typescript
function createThemeAwareQRCode(container: HTMLElement, content: string) {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const config = isDark
    ? {
        // 暗色主题
        style: {
          size: 250,
          fgColor: '#ffffff',
          bgColor: '#1f2937',
        },
      }
    : {
        // 亮色主题
        style: {
          size: 250,
          fgColor: '#000000',
          bgColor: '#ffffff',
        },
      };

  const qrCode = createQRCode({
    content,
    container,
    ...config,
  });

  // 监听主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    qrCode.update({
      style: e.matches
        ? { fgColor: '#ffffff', bgColor: '#1f2937' }
        : { fgColor: '#000000', bgColor: '#ffffff' },
    });
  });

  return qrCode;
}
```

## 打印优化

### 打印样式

优化二维码以用于打印：

```typescript
function createPrintableQRCode(content: string) {
  return createQRCode({
    content,
    container: document.getElementById('qr')!,
    errorCorrectionLevel: 'H',  // 高纠错，适合打印
    style: {
      size: 600,  // 大尺寸，确保打印清晰
      margin: 6,  // 较大边距
      fgColor: '#000000',  // 纯黑色
      bgColor: '#ffffff',  // 纯白色
      dotStyle: 'square',  // 方形，打印最清晰
    },
  });
}

// 打印前设置
function setupPrint() {
  const qrCode = createPrintableQRCode('https://example.com');

  window.print();

  // 打印后恢复原状
  window.addEventListener('afterprint', () => {
    qrCode.destroy();
  });
}
```

### 打印媒体查询

```typescript
// 在打印时自动调整二维码
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
  },
});

// CSS 媒体查询
const style = document.createElement('style');
style.textContent = `
  @media print {
    #qr canvas {
      width: 10cm !important;
      height: 10cm !important;
    }
  }
`;
document.head.appendChild(style);
```

## 类型定义

```typescript
import type {
  QRCodeError,
  ValidationResult,
  CacheStats,
  BatchDownloadOptions,
  PerformanceMonitor,
} from '@ldesign/qrcode';

// 错误类型
class QRCodeError extends Error {
  code: string;
  details?: any;
}

// 验证结果
interface ValidationResult {
  valid: boolean;
  type?: 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';
  errors?: string[];
  estimatedSize?: number;
}

// 缓存统计
interface CacheStats {
  size: number;
  hitRate: number;
  memoryUsage: number;
}

// 批量下载选项
interface BatchDownloadOptions {
  items: Array<{ content: string; fileName: string }>;
  format: 'png' | 'jpeg' | 'svg';
  zipFileName: string;
  style?: StyleConfig;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  onProgress?: (current: number, total: number) => void;
}
```

## 最佳实践总结

### 1. 性能优化

```typescript
// ✅ 推荐：启用缓存
enableCache(true);

// ✅ 推荐：懒加载屏幕外的二维码
useLazyLoading();

// ✅ 推荐：批量生成时使用简单样式
batchDownload({
  items,
  style: { dotStyle: 'square' },  // 最快
});
```

### 2. 用户体验

```typescript
// ✅ 推荐：提供加载提示
createQRCode({
  content,
  container,
  onGenerated: () => {
    hideLoadingIndicator();
  },
});

// ✅ 推荐：优雅降级
try {
  createQRCode({ /* ... */ });
} catch (error) {
  showFallbackContent();
}
```

### 3. 可访问性

```typescript
// ✅ 推荐：添加 alt 文本
const container = document.getElementById('qr')!;
container.setAttribute('role', 'img');
container.setAttribute('aria-label', 'QR code for https://example.com');
```

## 下一步

继续学习：

- [Vue 集成](./vue.md) - 在 Vue 3 中使用
- [React 集成](./react.md) - 在 React 中使用
- [API 参考](../api/types.md) - 完整的类型定义
