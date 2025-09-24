# @ldesign/qrcode React + TypeScript 示例

这是一个完整的 React + TypeScript 示例项目，展示了 `@ldesign/qrcode` 二维码生成库在 React 环境中的使用方法。

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录下
cd examples/react-example
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看示例。

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
react-example/
├── src/
│   ├── pages/                 # 示例页面组件
│   │   ├── BasicExample.tsx   # 基础功能示例
│   │   ├── AdvancedExample.tsx # 高级功能示例
│   │   ├── StyleExample.tsx   # 样式定制示例
│   │   └── DataTypeExample.tsx # 数据类型示例
│   ├── styles/
│   │   └── main.css          # 主样式文件
│   ├── App.tsx               # 主应用组件
│   └── main.tsx              # 应用入口
├── public/                   # 静态资源
├── index.html               # HTML 模板
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 项目说明
```

## 🎯 功能特性

### 1. 基础示例 (BasicExample)
- 文本输入和二维码生成
- 尺寸、格式、错误纠正级别配置
- 实时预览和下载功能
- 快速示例模板

### 2. 高级功能 (AdvancedExample)
- Logo 嵌入功能
- 批量二维码生成
- 缓存管理和性能优化

### 3. 样式定制 (StyleExample)
- 颜色自定义（前景色、背景色）
- 预设样式模板
- 样式对比功能

### 4. 数据类型 (DataTypeExample)
- URL 链接
- WiFi 网络信息
- 联系人名片
- 邮件地址
- 短信内容
- 电话号码
- 地理位置
- 纯文本

## 🛠️ 技术栈

- **React 18** - 现代 React 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **@ldesign/qrcode** - 二维码生成库
- **LDesign 设计系统** - 统一的设计语言

## 📖 使用方法

### 基本用法

```tsx
import React, { useState, useRef } from 'react'
import { generateQRCode, type SimpleQRCodeOptions } from '@ldesign/qrcode'

const MyComponent: React.FC = () => {
  const [qrText, setQrText] = useState('Hello World')
  const qrContainer = useRef<HTMLDivElement>(null)

  const generateQR = async () => {
    const options: SimpleQRCodeOptions = {
      size: 200,
      format: 'canvas',
      errorCorrectionLevel: 'M'
    }

    const result = await generateQRCode(qrText, options)
    
    if (qrContainer.current && result.element) {
      qrContainer.current.innerHTML = ''
      qrContainer.current.appendChild(result.element)
    }
  }

  return (
    <div>
      <input 
        value={qrText} 
        onChange={(e) => setQrText(e.target.value)} 
      />
      <button onClick={generateQR}>生成二维码</button>
      <div ref={qrContainer}></div>
    </div>
  )
}
```

### 高级用法

```tsx
// 带 Logo 的二维码
const options: SimpleQRCodeOptions = {
  size: 300,
  format: 'canvas',
  errorCorrectionLevel: 'H',
  logo: {
    src: logoImageSrc,
    size: 60
  }
}

// 自定义样式
const options: SimpleQRCodeOptions = {
  size: 250,
  format: 'canvas',
  foregroundColor: '#722ED1',
  backgroundColor: '#f1ecf9',
  margin: 4
}
```

## 🎨 设计系统

项目使用 LDesign 设计系统，包含：

- **颜色系统** - 品牌色、灰色、功能色
- **间距系统** - 统一的间距规范
- **组件样式** - 按钮、表单、卡片等
- **响应式设计** - 移动端适配

## 🔧 开发指南

### 添加新示例

1. 在 `src/pages/` 目录下创建新的组件文件
2. 在 `App.tsx` 中添加新的标签配置
3. 在 `main.css` 中添加相应的样式

### 自定义样式

所有样式都使用 CSS 变量，可以通过修改 `:root` 中的变量来自定义主题：

```css
:root {
  --ldesign-brand-color-6: #your-color;
  --ldesign-text-color-primary: #your-text-color;
}
```

## 📝 注意事项

1. **类型安全** - 项目使用 TypeScript，确保类型正确
2. **错误处理** - 所有异步操作都包含错误处理
3. **性能优化** - 使用 React.memo 和 useCallback 优化性能
4. **响应式设计** - 支持移动端和桌面端

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
