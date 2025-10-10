# 基础使用

本指南将帮助你快速上手 `@ldesign/qrcode`，了解基本的配置和使用方法。

## 快速开始

### 安装

```bash
npm install @ldesign/qrcode
# 或
yarn add @ldesign/qrcode
# 或
pnpm add @ldesign/qrcode
```

### 最简单的示例

```typescript
import { createQRCode } from '@ldesign/qrcode';

// 创建一个基础的二维码
const qrCode = createQRCode({
  content: 'https://github.com',
  container: document.getElementById('qr-container')!,
});
```

就这么简单！这将在指定的容器中生成一个二维码。

## 基本配置

### 内容编码

`content` 参数支持任何字符串内容：

```typescript
// URL
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr-url')!,
});

// 纯文本
createQRCode({
  content: 'Hello, QR Code!',
  container: document.getElementById('qr-text')!,
});

// 电子邮件
createQRCode({
  content: 'mailto:contact@example.com',
  container: document.getElementById('qr-email')!,
});

// 电话号码
createQRCode({
  content: 'tel:+1234567890',
  container: document.getElementById('qr-phone')!,
});

// WiFi 连接信息
createQRCode({
  content: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;',
  container: document.getElementById('qr-wifi')!,
});

// vCard 联系人信息
createQRCode({
  content: `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD`,
  container: document.getElementById('qr-vcard')!,
});
```

### 尺寸和边距

使用 `style.size` 和 `style.margin` 控制二维码的大小：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 300,      // 二维码总尺寸（像素）
    margin: 4,      // 边距（以模块为单位），默认为 4
  },
});
```

**尺寸说明：**
- `size`: 二维码的总尺寸，包括边距
- `margin`: 安全边距，以模块数量为单位（推荐 4 或以上）
- 实际二维码图案尺寸 = `size - (margin * 2 * moduleSize)`

**推荐尺寸：**
- 小型二维码：150-200px
- 中型二维码：250-350px（推荐）
- 大型二维码：400-600px

### 基础颜色设置

使用 `fgColor` 和 `bgColor` 自定义颜色：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    fgColor: '#2563eb',    // 前景色（二维码图案颜色）
    bgColor: '#dbeafe',    // 背景色
  },
});
```

**颜色格式支持：**
- 十六进制：`#000000`, `#fff`
- RGB：`rgb(255, 0, 0)`
- RGBA：`rgba(255, 0, 0, 0.5)`
- 颜色名称：`red`, `blue`, `green`

**颜色对比度建议：**
- 确保前景色和背景色有足够的对比度
- 避免使用太浅的前景色或太深的背景色
- 推荐对比度比例至少为 4.5:1

### 圆角设置

使用 `cornerRadius` 为二维码模块添加圆角：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 250,
    cornerRadius: 0.3,  // 0-0.5 之间，0 为方形，0.5 为圆形
  },
});
```

**圆角值说明：**
- `0`：完全方形（默认）
- `0.1-0.3`：轻微圆角，保持专业外观
- `0.4-0.5`：圆角较大，更柔和的外观

## 错误纠正级别

二维码支持四种错误纠正级别，级别越高，容错能力越强，但二维码会更复杂：

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  errorCorrectionLevel: 'M',  // 'L' | 'M' | 'Q' | 'H'
});
```

**错误纠正级别对照：**

| 级别 | 容错率 | 适用场景 |
|------|--------|----------|
| `L`  | ~7%    | 打印质量好、扫描环境理想 |
| `M`  | ~15%   | 一般使用（默认推荐） |
| `Q`  | ~25%   | 可能有轻微损坏或遮挡 |
| `H`  | ~30%   | 需要添加 Logo 或可能有较多损坏 |

**选择建议：**
- 不添加 Logo：使用 `L` 或 `M`
- 添加小 Logo：使用 `M` 或 `Q`
- 添加大 Logo：使用 `Q` 或 `H`
- 打印到低质量材料：使用 `H`

## 渲染类型

支持 Canvas 和 SVG 两种渲染方式：

```typescript
// Canvas 渲染（默认，推荐）
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  renderType: 'canvas',  // 默认值
});

// SVG 渲染
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  renderType: 'svg',
});
```

**Canvas vs SVG：**

| 特性 | Canvas | SVG |
|------|--------|-----|
| 渲染性能 | 更快 | 较慢 |
| 缩放质量 | 可能有锯齿 | 无限缩放不失真 |
| 文件大小 | 较小 | 较大 |
| 浏览器兼容性 | 更好 | 好 |
| 推荐场景 | 一般使用 | 需要矢量图形或大尺寸打印 |

## 实例方法

创建二维码后，返回的实例提供了几个实用方法：

### 更新二维码

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// 更新内容
await qrCode.update({ content: 'https://github.com' });

// 更新样式
await qrCode.update({
  style: {
    fgColor: '#10b981',
    bgColor: '#d1fae5',
  },
});

// 同时更新多个属性
await qrCode.update({
  content: 'New content',
  style: { size: 300 },
  errorCorrectionLevel: 'H',
});
```

### 下载二维码

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// 下载为 PNG（默认）
qrCode.download({ fileName: 'my-qrcode', format: 'png' });

// 下载为 JPEG
qrCode.download({ fileName: 'my-qrcode', format: 'jpeg' });

// 下载为 SVG（仅当 renderType 为 'svg' 时）
qrCode.download({ fileName: 'my-qrcode', format: 'svg' });
```

**下载选项：**
- `fileName`：文件名（不包含扩展名）
- `format`：文件格式 `'png' | 'jpeg' | 'svg'`
- PNG：推荐用于保留透明背景
- JPEG：文件更小，但不支持透明背景
- SVG：矢量格式，仅支持 SVG 渲染类型

### 获取数据 URL

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// 获取 PNG 格式的 data URL
const dataUrl = qrCode.toDataURL('png');
console.log(dataUrl); // data:image/png;base64,...

// 在 img 标签中使用
document.getElementById('preview')!.src = dataUrl;
```

### 销毁实例

```typescript
const qrCode = createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
});

// 清理资源，移除 DOM 元素
qrCode.destroy();
```

**何时使用 destroy()：**
- 组件卸载时
- 切换路由前
- 动态生成大量二维码时，及时清理不需要的实例

## 完整示例

这是一个包含基本配置的完整示例：

```typescript
import { createQRCode } from '@ldesign/qrcode';

// HTML 结构
// <div id="qr-container"></div>
// <input id="content-input" value="https://github.com" />
// <button id="update-btn">更新</button>
// <button id="download-btn">下载</button>

const container = document.getElementById('qr-container')!;
const contentInput = document.getElementById('content-input') as HTMLInputElement;
const updateBtn = document.getElementById('update-btn')!;
const downloadBtn = document.getElementById('download-btn')!;

// 创建二维码
const qrCode = createQRCode({
  content: contentInput.value,
  container,
  errorCorrectionLevel: 'M',
  style: {
    size: 250,
    margin: 4,
    fgColor: '#2563eb',
    bgColor: '#ffffff',
    cornerRadius: 0.2,
  },
});

// 更新二维码
updateBtn.addEventListener('click', async () => {
  await qrCode.update({ content: contentInput.value });
  console.log('二维码已更新');
});

// 下载二维码
downloadBtn.addEventListener('click', () => {
  qrCode.download({ fileName: 'qrcode', format: 'png' });
  console.log('二维码已下载');
});

// 清理（在适当的时候调用）
// qrCode.destroy();
```

## 响应式设计

创建响应式二维码的建议：

```typescript
function createResponsiveQR() {
  const container = document.getElementById('qr')!;
  const containerWidth = container.clientWidth;

  // 根据容器宽度动态设置尺寸
  const qrSize = Math.min(containerWidth - 40, 400);

  return createQRCode({
    content: 'https://example.com',
    container,
    style: {
      size: qrSize,
      margin: 4,
    },
  });
}

// 窗口大小变化时重新生成
let qrCode = createResponsiveQR();

window.addEventListener('resize', () => {
  qrCode.destroy();
  qrCode = createResponsiveQR();
});
```

## 常见问题

### Q: 二维码扫描不出来？

**可能的原因：**
1. 前景色和背景色对比度不够
2. 内容太长导致二维码过于密集
3. 尺寸太小导致模块不清晰
4. 错误纠正级别太低

**解决方案：**
- 使用深色前景色和浅色背景色
- 减少内容长度或提高二维码尺寸
- 使用至少 200px 的尺寸
- 提高错误纠正级别到 `M` 或 `Q`

### Q: 如何提高二维码的清晰度？

```typescript
createQRCode({
  content: 'https://example.com',
  container: document.getElementById('qr')!,
  style: {
    size: 400,              // 增加尺寸
    margin: 4,              // 保持足够边距
  },
  errorCorrectionLevel: 'H', // 提高纠错级别
});
```

### Q: 支持多语言内容吗？

支持！二维码可以编码任何 UTF-8 字符：

```typescript
createQRCode({
  content: '你好，世界！Hello, World! こんにちは！',
  container: document.getElementById('qr')!,
});
```

### Q: 二维码可以离线使用吗？

完全可以！`@ldesign/qrcode` 不依赖任何外部服务，所有生成都在本地完成。

## 下一步

现在你已经掌握了基础用法，可以继续学习：

- [样式定制](./styling.md) - 了解渐变、模块样式、眼睛样式等高级样式
- [Logo 集成](./logo.md) - 为二维码添加 Logo 图片
- [高级功能](./advanced-features.md) - 阴影、描边、背景效果等
- [框架集成](./vue.md) - 在 Vue、React 等框架中使用
