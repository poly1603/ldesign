# React 集成

`@ldesign/qrcode` 为 React 提供了开箱即用的组件和 Hook。

## 安装

```bash
npm install @ldesign/qrcode
```

## 组件方式

### 基础使用

使用 `QRCode` 组件：

```tsx
import { QRCode } from '@ldesign/qrcode/react';

function App() {
  return (
    <div>
      <QRCode content="https://example.com" />
    </div>
  );
}
```

### 自定义样式

```tsx
import { QRCode } from '@ldesign/qrcode/react';

function App() {
  return (
    <QRCode
      content="https://example.com"
      errorCorrectionLevel="M"
      styleConfig={{
        size: 300,
        fgColor: '#2563eb',
        bgColor: '#dbeafe',
        cornerRadius: 0.3,
      }}
    />
  );
}
```

### 响应式内容

```tsx
import { useState } from 'react';
import { QRCode } from '@ldesign/qrcode/react';

function App() {
  const [content, setContent] = useState('https://github.com');

  return (
    <div>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="输入内容"
      />
      <QRCode content={content} styleConfig={{ size: 250 }} />
    </div>
  );
}
```

### 完整配置

```tsx
import { QRCode } from '@ldesign/qrcode/react';
import type { StyleConfig, LogoConfig } from '@ldesign/qrcode';

function App() {
  const styleConfig: StyleConfig = {
    size: 300,
    dotStyle: 'rounded',
    gradient: {
      type: 'linear',
      colors: ['#667eea', '#764ba2'],
      direction: 45,
    },
  };

  const logoConfig: LogoConfig = {
    src: '/logo.png',
    width: '25%',
    height: '25%',
    logoBackground: true,
    logoBackgroundPadding: 8,
  };

  const handleGenerated = (info: any) => {
    console.log('二维码已生成:', info);
  };

  const handleError = (error: Error) => {
    console.error('生成失败:', error);
  };

  return (
    <QRCode
      content="https://example.com"
      errorCorrectionLevel="H"
      renderType="canvas"
      styleConfig={styleConfig}
      logo={logoConfig}
      onGenerated={handleGenerated}
      onError={handleError}
    />
  );
}
```

## Hook 方式

### useQRCode

使用 `useQRCode` Hook：

```tsx
import { useRef } from 'react';
import { useQRCode } from '@ldesign/qrcode/react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { qrCode, update, download, destroy } = useQRCode({
    content: 'https://example.com',
    container: containerRef,
    style: {
      size: 250,
    },
  });

  const handleUpdate = async () => {
    await update({ content: 'https://github.com' });
  };

  const handleDownload = () => {
    download({ fileName: 'qrcode', format: 'png' });
  };

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={handleUpdate}>更新内容</button>
      <button onClick={handleDownload}>下载</button>
    </div>
  );
}
```

### 响应式配置

```tsx
import { useRef, useState } from 'react';
import { useQRCode } from '@ldesign/qrcode/react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('https://example.com');
  const [fgColor, setFgColor] = useState('#2563eb');

  const { update } = useQRCode({
    content,
    container: containerRef,
    style: {
      size: 250,
      fgColor,
    },
  });

  const handleUpdate = async () => {
    await update({
      content,
      style: { fgColor },
    });
  };

  return (
    <div>
      <div ref={containerRef} />

      <div className="controls">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="内容"
        />
        <input
          type="color"
          value={fgColor}
          onChange={(e) => setFgColor(e.target.value)}
        />
        <button onClick={handleUpdate}>更新</button>
      </div>
    </div>
  );
}
```

### 自动更新

使用 `useEffect` 自动更新：

```tsx
import { useRef, useState, useEffect } from 'react';
import { useQRCode } from '@ldesign/qrcode/react';
import type { DotStyle } from '@ldesign/qrcode';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dotStyle, setDotStyle] = useState<DotStyle>('square');

  const { update } = useQRCode({
    content: 'https://example.com',
    container: containerRef,
    style: {
      size: 250,
      dotStyle,
    },
  });

  useEffect(() => {
    update({ style: { dotStyle } });
  }, [dotStyle]);

  return (
    <div>
      <div ref={containerRef} />

      <select value={dotStyle} onChange={(e) => setDotStyle(e.target.value as DotStyle)}>
        <option value="square">方形</option>
        <option value="rounded">圆角</option>
        <option value="dots">圆点</option>
      </select>
    </div>
  );
}
```

## 完整示例

### 交互式二维码生成器

```tsx
import { useState } from 'react';
import { QRCode } from '@ldesign/qrcode/react';
import type { DotStyle, ErrorCorrectionLevel } from '@ldesign/qrcode';

interface Config {
  content: string;
  errorLevel: ErrorCorrectionLevel;
  dotStyle: DotStyle;
  fgColor: string;
  bgColor: string;
  size: number;
  logoSrc: string;
  showLogo: boolean;
}

function QRGenerator() {
  const [config, setConfig] = useState<Config>({
    content: 'https://example.com',
    errorLevel: 'M',
    dotStyle: 'rounded',
    fgColor: '#2563eb',
    bgColor: '#ffffff',
    size: 300,
    logoSrc: '',
    showLogo: false,
  });

  const [stats, setStats] = useState<any>(null);

  const updateConfig = (updates: Partial<Config>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleGenerated = (info: any) => {
    setStats(info);
    console.log('二维码已生成:', info);
  };

  const handleReset = () => {
    setConfig({
      content: 'https://example.com',
      errorLevel: 'M',
      dotStyle: 'rounded',
      fgColor: '#2563eb',
      bgColor: '#ffffff',
      size: 300,
      logoSrc: '',
      showLogo: false,
    });
  };

  const styleConfig = {
    size: config.size,
    dotStyle: config.dotStyle,
    fgColor: config.fgColor,
    bgColor: config.bgColor,
  };

  const logoConfig =
    config.showLogo && config.logoSrc
      ? {
          src: config.logoSrc,
          width: '25%',
          height: '25%',
          logoBackground: true,
          logoBackgroundPadding: 8,
        }
      : undefined;

  return (
    <div className="qr-generator">
      <h2>二维码生成器</h2>

      {/* 二维码展示 */}
      <div className="qr-preview">
        <QRCode
          content={config.content}
          errorCorrectionLevel={config.errorLevel}
          styleConfig={styleConfig}
          logo={logoConfig}
          onGenerated={handleGenerated}
        />
      </div>

      {/* 控制面板 */}
      <div className="controls">
        {/* 内容 */}
        <div className="control-group">
          <label>内容</label>
          <input
            value={config.content}
            onChange={(e) => updateConfig({ content: e.target.value })}
            placeholder="输入内容"
          />
        </div>

        {/* 纠错级别 */}
        <div className="control-group">
          <label>纠错级别</label>
          <select
            value={config.errorLevel}
            onChange={(e) =>
              updateConfig({ errorLevel: e.target.value as ErrorCorrectionLevel })
            }
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>

        {/* 样式选择 */}
        <div className="control-group">
          <label>模块样式</label>
          <select
            value={config.dotStyle}
            onChange={(e) => updateConfig({ dotStyle: e.target.value as DotStyle })}
          >
            <option value="square">方形</option>
            <option value="rounded">圆角</option>
            <option value="dots">圆点</option>
            <option value="diamond">菱形</option>
            <option value="star">星形</option>
          </select>
        </div>

        {/* 颜色 */}
        <div className="control-group">
          <label>前景色</label>
          <input
            type="color"
            value={config.fgColor}
            onChange={(e) => updateConfig({ fgColor: e.target.value })}
          />
        </div>

        <div className="control-group">
          <label>背景色</label>
          <input
            type="color"
            value={config.bgColor}
            onChange={(e) => updateConfig({ bgColor: e.target.value })}
          />
        </div>

        {/* 尺寸 */}
        <div className="control-group">
          <label>尺寸: {config.size}px</label>
          <input
            type="range"
            min="150"
            max="500"
            value={config.size}
            onChange={(e) => updateConfig({ size: Number(e.target.value) })}
          />
        </div>

        {/* Logo */}
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={config.showLogo}
              onChange={(e) => updateConfig({ showLogo: e.target.checked })}
            />
            显示 Logo
          </label>
        </div>

        {config.showLogo && (
          <div className="control-group">
            <label>Logo URL</label>
            <input
              value={config.logoSrc}
              onChange={(e) => updateConfig({ logoSrc: e.target.value })}
              placeholder="Logo 图片地址"
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="actions">
          <button onClick={handleReset}>重置</button>
        </div>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="stats">
          <p>版本: {stats.version}</p>
          <p>模块数: {stats.moduleCount}</p>
          <p>生成耗时: {stats.renderTime}ms</p>
        </div>
      )}
    </div>
  );
}

export default QRGenerator;
```

### 使用 useQRCode 的版本

```tsx
import { useRef } from 'react';
import { useQRCode } from '@ldesign/qrcode/react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { download } = useQRCode({
    content: 'https://example.com',
    container: containerRef,
    style: {
      size: 300,
      dotStyle: 'rounded',
    },
  });

  const handleDownload = () => {
    download({ fileName: 'qrcode', format: 'png' });
  };

  return (
    <div>
      <div ref={containerRef} />
      <button onClick={handleDownload}>下载</button>
    </div>
  );
}
```

## 与状态管理集成

### Redux

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { QRCode } from '@ldesign/qrcode/react';
import { updateQRContent } from './store/qrSlice';

function QRDisplay() {
  const content = useSelector((state: RootState) => state.qr.content);
  const style = useSelector((state: RootState) => state.qr.style);
  const dispatch = useDispatch();

  const handleGenerated = (info: any) => {
    dispatch(updateQRContent({ ...info }));
  };

  return (
    <QRCode
      content={content}
      styleConfig={style}
      onGenerated={handleGenerated}
    />
  );
}
```

### Context API

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import type { QRCodeConfig } from '@ldesign/qrcode';

interface QRContextType {
  config: QRCodeConfig;
  updateConfig: (updates: Partial<QRCodeConfig>) => void;
}

const QRContext = createContext<QRContextType | null>(null);

export function QRProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<QRCodeConfig>({
    content: 'https://example.com',
    style: {
      size: 250,
    },
  });

  const updateConfig = (updates: Partial<QRCodeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <QRContext.Provider value={{ config, updateConfig }}>
      {children}
    </QRContext.Provider>
  );
}

export function useQRContext() {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error('useQRContext must be used within QRProvider');
  }
  return context;
}

// 使用
function QRDisplay() {
  const { config } = useQRContext();
  return <QRCode {...config} />;
}
```

## TypeScript 支持

完整的类型定义：

```typescript
import type {
  QRCodeConfig,
  StyleConfig,
  LogoConfig,
  DotStyle,
  ErrorCorrectionLevel,
} from '@ldesign/qrcode';

interface QRCodeProps {
  content: string;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  renderType?: 'canvas' | 'svg';
  styleConfig?: StyleConfig;
  logo?: LogoConfig;
  onGenerated?: (info: any) => void;
  onError?: (error: Error) => void;
  onUpdate?: (changes: any) => void;
}

interface UseQRCodeOptions extends QRCodeConfig {
  container: React.RefObject<HTMLElement>;
}

interface UseQRCodeReturn {
  qrCode: QRCodeInstance | null;
  update: (config: Partial<QRCodeConfig>) => Promise<void>;
  download: (options: DownloadOptions) => void;
  toDataURL: (format: 'png' | 'jpeg') => string;
  destroy: () => void;
}
```

## 最佳实践

### 1. 性能优化

使用 `React.memo` 避免不必要的重渲染：

```tsx
import { memo } from 'react';
import { QRCode } from '@ldesign/qrcode/react';

const MemoizedQRCode = memo(QRCode, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content;
});

function App() {
  return <MemoizedQRCode content="https://example.com" />;
}
```

### 2. 懒加载

使用 React.lazy 延迟加载：

```tsx
import { lazy, Suspense } from 'react';

const QRCode = lazy(() => import('@ldesign/qrcode/react').then(m => ({ default: m.QRCode })));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <QRCode content="https://example.com" />
    </Suspense>
  );
}
```

### 3. 错误边界

```tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

class QRErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('QR Code Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <QRErrorBoundary fallback={<div>二维码生成失败</div>}>
      <QRCode content="https://example.com" />
    </QRErrorBoundary>
  );
}
```

### 4. 清理资源

```tsx
import { useRef, useEffect } from 'react';
import { useQRCode } from '@ldesign/qrcode/react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { destroy } = useQRCode({
    content: 'https://example.com',
    container: containerRef,
  });

  useEffect(() => {
    return () => {
      destroy();
    };
  }, []);

  return <div ref={containerRef} />;
}
```

## Next.js 集成

### 客户端组件

```tsx
'use client';

import { QRCode } from '@ldesign/qrcode/react';

export default function QRDisplay() {
  return <QRCode content="https://example.com" />;
}
```

### 动态导入

```tsx
import dynamic from 'next/dynamic';

const QRCode = dynamic(
  () => import('@ldesign/qrcode/react').then((mod) => mod.QRCode),
  { ssr: false }
);

export default function Page() {
  return <QRCode content="https://example.com" />;
}
```

## 下一步

继续学习：

- [Vue 集成](./vue.md) - 在 Vue 3 中使用
- [Vanilla JS](./vanilla.md) - 在原生 JavaScript 中使用
- [API 参考](../api/types.md) - 完整的类型定义
