# 示例集合

实用的二维码生成示例，涵盖各种场景和功能组合。

## 基础示例

### 最简单的二维码

```typescript
import { createQRCode } from '@ldesign/qrcode';

createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});
```

### 自定义尺寸和颜色

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    fgColor: '#2563eb',
    bgColor: '#dbeafe',
  },
});
```

### 带 Logo 的二维码

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  logo: {
    src: '/logo.png',
    width: '25%',
    height: '25%',
  },
});
```

## 样式示例

### 现代蓝色渐变

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
  },
});
```

### 优雅紫色圆点

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    dotStyle: 'dots',
    gradient: {
      type: 'radial',
      colors: ['#f97316', '#dc2626'],
      position: { x: 0.5, y: 0.5 },
    },
    eyeStyle: {
      outer: {
        style: 'rounded',
        gradient: {
          type: 'linear',
          colors: ['#8b5cf6', '#ec4899'],
          direction: 45,
        },
      },
      inner: { style: 'dots', color: '#ffffff' },
    },
    shadow: {
      blur: 8,
      color: 'rgba(0, 0, 0, 0.2)',
      offsetY: 4,
    },
  },
});
```

### 极简黑白

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,
    dotStyle: 'square',
    fgColor: '#000000',
    bgColor: '#ffffff',
  },
});
```

### 企业品牌风格

```typescript
createQRCode({
  content: 'https://company.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 350,
    dotStyle: 'classy-rounded',
    fgColor: '#1e40af',
  },
  logo: {
    src: '/company-logo.svg',
    width: '28%',
    height: '28%',
    logoShape: 'square',
    aspectRatio: 'keep',
    logoBackground: true,
    logoBackgroundColor: '#ffffff',
    logoBackgroundPadding: 12,
    border: true,
    borderColor: '#e5e7eb',
    borderWidth: 2,
  },
});
```

## 内容类型示例

### URL 二维码

```typescript
createQRCode({
  content: 'https://example.com/page?param=value',
  container: document.getElementById('qr')!,
  style: { size: 250 },
});
```

### Email 二维码

```typescript
createQRCode({
  content: 'mailto:contact@example.com?subject=Hello&body=Message',
  container: document.getElementById('qr')!,
  style: { size: 250 },
});
```

### 电话号码二维码

```typescript
createQRCode({
  content: 'tel:+1234567890',
  container: document.getElementById('qr')!,
  style: { size: 250 },
});
```

### SMS 二维码

```typescript
createQRCode({
  content: 'sms:+1234567890?body=Hello',
  container: document.getElementById('qr')!,
  style: { size: 250 },
});
```

### WiFi 二维码

```typescript
createQRCode({
  content: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: {
    size: 300,
    fgColor: '#3b82f6',
  },
});
```

### vCard 联系人

```typescript
const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Example Company
TEL:+1234567890
EMAIL:john@example.com
URL:https://example.com
END:VCARD`;

createQRCode({
  content: vcard,
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'H',
  style: { size: 350 },
});
```

### 地理位置

```typescript
createQRCode({
  content: 'geo:37.7749,-122.4194',  // San Francisco
  container: document.getElementById('qr')!,
  style: { size: 250 },
});
```

## 交互示例

### 动态内容更新

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// 更新按钮
document.getElementById('update-btn')!.addEventListener('click', async () => {
  const input = document.getElementById('content-input') as HTMLInputElement;
  await qrCode.update({ content: input.value });
});
```

### 实时颜色选择器

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: { size: 250 },
});

// 前景色选择器
document.getElementById('fg-color')!.addEventListener('change', async (e) => {
  const color = (e.target as HTMLInputElement).value;
  await qrCode.update({ style: { fgColor: color } });
});

// 背景色选择器
document.getElementById('bg-color')!.addEventListener('change', async (e) => {
  const color = (e.target as HTMLInputElement).value;
  await qrCode.update({ style: { bgColor: color } });
});
```

### 样式切换器

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: { size: 250 },
});

const styles = ['square', 'rounded', 'dots', 'diamond', 'star'];
let currentIndex = 0;

document.getElementById('next-style')!.addEventListener('click', async () => {
  currentIndex = (currentIndex + 1) % styles.length;
  await qrCode.update({
    style: { dotStyle: styles[currentIndex] },
  });
});
```

## 下载示例

### 下载为 PNG

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

document.getElementById('download-png')!.addEventListener('click', () => {
  qrCode.download({ fileName: 'qrcode', format: 'png' });
});
```

### 批量下载

```typescript
import { batchDownload } from '@ldesign/qrcode';

const items = [
  { content: 'https://example.com/page1', fileName: 'qr-page-1' },
  { content: 'https://example.com/page2', fileName: 'qr-page-2' },
  { content: 'https://example.com/page3', fileName: 'qr-page-3' },
];

document.getElementById('batch-download')!.addEventListener('click', async () => {
  await batchDownload({
    items,
    format: 'png',
    zipFileName: 'qrcodes.zip',
    style: { size: 300 },
    onProgress: (current, total) => {
      const progress = Math.round((current / total) * 100);
      document.getElementById('progress')!.textContent = `${progress}%`;
    },
  });
});
```

### 获取 Data URL 用于预览

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// 获取 Data URL
const dataUrl = qrCode.toDataURL('png');

// 显示在 img 标签中
document.getElementById('preview')!.setAttribute('src', dataUrl);

// 复制到剪贴板
navigator.clipboard.writeText(dataUrl);
```

## 响应式示例

### 自适应容器尺寸

```typescript
function createResponsiveQR() {
  const container = document.getElementById('qr')!;
  const size = Math.min(container.clientWidth - 40, 400);

  return createQRCode({
    content: 'https://example.com',
    container,
    style: { size },
  });
}

let qrCode = createResponsiveQR();

// 窗口大小变化时重新生成
let resizeTimeout: NodeJS.Timeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    qrCode.destroy();
    qrCode = createResponsiveQR();
  }, 300);
});
```

### 暗色模式自适应

```typescript
function getThemeColors() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark
    ? { fgColor: '#ffffff', bgColor: '#1f2937' }
    : { fgColor: '#000000', bgColor: '#ffffff' };
}

const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    ...getThemeColors(),
  },
});

// 监听主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async () => {
  await qrCode.update({ style: getThemeColors() });
});
```

## 性能优化示例

### 懒加载

```typescript
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
        observer.unobserve(container);
      }
    }
  });
});

// 观察所有二维码容器
document.querySelectorAll('.qr-lazy').forEach((el) => {
  observer.observe(el);
});
```

HTML 结构：

```html
<div class="qr-lazy" data-qr-content="https://example.com/1"></div>
<div class="qr-lazy" data-qr-content="https://example.com/2"></div>
```

### 防抖优化

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

const input = document.getElementById('content') as HTMLInputElement;

const updateQR = debounce(async () => {
  await qrCode.update({ content: input.value });
}, 500);

input.addEventListener('input', updateQR);
```

## 实际应用场景

### 活动签到系统

```typescript
// 生成唯一的签到二维码
function generateCheckInQR(eventId: string, userId: string) {
  const timestamp = Date.now();
  const checkInUrl = `https://example.com/checkin?event=${eventId}&user=${userId}&time=${timestamp}`;

  return createQRCode({
    content: checkInUrl,
    container: document.getElementById('checkin-qr')!,
    errorCorrectionLevel: 'H',
    style: {
      size: 400,
      dotStyle: 'rounded',
      gradient: {
        type: 'linear',
        colors: ['#3b82f6', '#8b5cf6'],
        direction: 45,
      },
    },
  });
}
```

### 名片二维码

```typescript
function createBusinessCardQR(info: {
  name: string;
  company: string;
  phone: string;
  email: string;
  website: string;
}) {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${info.name}
ORG:${info.company}
TEL:${info.phone}
EMAIL:${info.email}
URL:${info.website}
END:VCARD`;

  return createQRCode({
    content: vcard,
    container: document.getElementById('business-card-qr')!,
    errorCorrectionLevel: 'H',
    style: {
      size: 300,
      dotStyle: 'classy-rounded',
      fgColor: '#1e40af',
    },
    logo: {
      src: '/company-logo.png',
      width: '25%',
      height: '25%',
      logoBackground: true,
    },
  });
}

// 使用
createBusinessCardQR({
  name: 'John Doe',
  company: 'Example Inc.',
  phone: '+1234567890',
  email: 'john@example.com',
  website: 'https://example.com',
});
```

### WiFi 分享

```typescript
function createWiFiQR(network: {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
}) {
  const wifiString = `WIFI:T:${network.security};S:${network.ssid};P:${network.password};;`;

  return createQRCode({
    content: wifiString,
    container: document.getElementById('wifi-qr')!,
    errorCorrectionLevel: 'H',
    style: {
      size: 350,
      dotStyle: 'rounded',
      gradient: {
        type: 'radial',
        colors: ['#10b981', '#059669'],
        position: { x: 0.5, y: 0.5 },
      },
    },
  });
}

// 使用
createWiFiQR({
  ssid: 'MyWiFi',
  password: 'MyPassword123',
  security: 'WPA',
});
```

### 支付二维码

```typescript
function createPaymentQR(paymentInfo: {
  amount: number;
  currency: string;
  recipient: string;
  note?: string;
}) {
  const paymentUrl = `https://pay.example.com/pay?amount=${paymentInfo.amount}&currency=${paymentInfo.currency}&to=${paymentInfo.recipient}&note=${paymentInfo.note || ''}`;

  return createQRCode({
    content: paymentUrl,
    container: document.getElementById('payment-qr')!,
    errorCorrectionLevel: 'H',
    style: {
      size: 400,
      dotStyle: 'rounded',
      fgColor: '#059669',
    },
    logo: {
      src: '/payment-logo.png',
      width: '30%',
      height: '30%',
      logoShape: 'circle',
      logoBackground: true,
      logoBackgroundColor: '#ffffff',
      logoBackgroundPadding: 10,
    },
  });
}

// 使用
createPaymentQR({
  amount: 50.00,
  currency: 'USD',
  recipient: 'merchant@example.com',
  note: 'Order #12345',
});
```

### 产品溯源

```typescript
function createProductTraceQR(productInfo: {
  id: string;
  batch: string;
  manufactureDate: string;
  expiryDate: string;
}) {
  const traceUrl = `https://trace.example.com/product/${productInfo.id}?batch=${productInfo.batch}`;

  return createQRCode({
    content: traceUrl,
    container: document.getElementById('trace-qr')!,
    errorCorrectionLevel: 'H',
    style: {
      size: 300,
      dotStyle: 'square',
      fgColor: '#000000',
      bgColor: '#ffffff',
    },
  });
}
```

## 错误处理示例

### 完整的错误处理

```typescript
import { createQRCode, QRCodeError } from '@ldesign/qrcode';

try {
  const qrCode = createQRCode({
    content: 'https://example.com',
    container: document.getElementById('qr')!,
    logo: {
      src: '/logo.png',
      onError: (error) => {
        console.error('Logo 加载失败:', error);
        return '/fallback-logo.png';
      },
    },
    onError: (error) => {
      console.error('生成失败:', error);
      showErrorMessage('二维码生成失败，请重试');
    },
  });
} catch (error) {
  if (error instanceof QRCodeError) {
    switch (error.code) {
      case 'INVALID_CONTENT':
        showErrorMessage('内容格式不正确');
        break;
      case 'CONTAINER_NOT_FOUND':
        showErrorMessage('容器元素不存在');
        break;
      default:
        showErrorMessage('未知错误');
    }
  }
}

function showErrorMessage(message: string) {
  const errorDiv = document.getElementById('error')!;
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}
```

## 下一步

- [基础使用](../guide/basic-usage.md) - 学习基础概念
- [样式定制](../guide/styling.md) - 深入了解样式
- [Logo 集成](../guide/logo.md) - Logo 详细指南
- [Vue 集成](../guide/vue.md) - Vue 3 框架集成
- [React 集成](../guide/react.md) - React 框架集成
