# @ldesign/qrcode Angular + TypeScript 示例

这是一个完整的 Angular + TypeScript 示例项目，展示了 `@ldesign/qrcode` 二维码生成库在 Angular 环境中的使用方法。

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录下
cd examples/angular-example
pnpm install
```

### 启动开发服务器

```bash
pnpm start
# 或者
ng serve --port 3002
```

访问 [http://localhost:3002](http://localhost:3002) 查看示例。

### 构建生产版本

```bash
pnpm build
# 或者
ng build
```

## 📁 项目结构

```
angular-example/
├── src/
│   ├── app/
│   │   ├── components/           # 示例组件
│   │   │   ├── basic-example.component.ts    # 基础功能示例
│   │   │   └── advanced-example.component.ts # 高级功能示例
│   │   ├── app.component.ts      # 主应用组件
│   │   └── app.routes.ts         # 路由配置
│   ├── styles.css               # 全局样式
│   ├── index.html               # HTML 模板
│   └── main.ts                  # 应用入口
├── angular.json                 # Angular 配置
├── package.json                 # 项目配置
├── tsconfig.json                # TypeScript 配置
└── README.md                    # 项目说明
```

## 🎯 功能特性

### 1. 基础示例 (BasicExampleComponent)
- 文本输入和二维码生成
- 尺寸、格式、错误纠正级别配置
- 实时预览和下载功能
- 快速示例模板

### 2. 高级功能 (AdvancedExampleComponent)
- Logo 嵌入功能
- 批量二维码生成
- 缓存管理和性能优化

## 🛠️ 技术栈

- **Angular 17** - 现代 Angular 框架
- **TypeScript** - 类型安全的 JavaScript
- **Standalone Components** - 独立组件架构
- **@ldesign/qrcode** - 二维码生成库
- **LDesign 设计系统** - 统一的设计语言

## 📖 使用方法

### 基本用法

```typescript
import { Component, ElementRef, ViewChild } from '@angular/core';
import { generateQRCode, type SimpleQRCodeOptions } from '@ldesign/qrcode';

@Component({
  selector: 'app-qr-example',
  template: `
    <input [(ngModel)]="qrText" placeholder="输入文本">
    <button (click)="generateQR()">生成二维码</button>
    <div #qrContainer></div>
  `
})
export class QRExampleComponent {
  @ViewChild('qrContainer', { static: false }) qrContainer!: ElementRef;
  qrText = 'Hello World';

  async generateQR(): Promise<void> {
    const options: SimpleQRCodeOptions = {
      size: 200,
      format: 'canvas',
      errorCorrectionLevel: 'M'
    };

    const result = await generateQRCode(this.qrText, options);
    
    if (this.qrContainer && result.element) {
      this.qrContainer.nativeElement.innerHTML = '';
      this.qrContainer.nativeElement.appendChild(result.element);
    }
  }
}
```

### 高级用法

```typescript
// 带 Logo 的二维码
const options: SimpleQRCodeOptions = {
  size: 300,
  format: 'canvas',
  errorCorrectionLevel: 'H',
  logo: {
    src: logoImageSrc,
    size: 60
  }
};

// 自定义样式
const options: SimpleQRCodeOptions = {
  size: 250,
  format: 'canvas',
  foregroundColor: '#722ED1',
  backgroundColor: '#f1ecf9',
  margin: 4
};
```

## 🎨 设计系统

项目使用 LDesign 设计系统，包含：

- **颜色系统** - 品牌色、灰色、功能色
- **间距系统** - 统一的间距规范
- **组件样式** - 按钮、表单、卡片等
- **响应式设计** - 移动端适配

## 🔧 开发指南

### 添加新组件

1. 在 `src/app/components/` 目录下创建新的组件文件
2. 在 `app.routes.ts` 中添加新的路由配置
3. 在组件中添加相应的样式

### 自定义样式

所有样式都使用 CSS 变量，可以通过修改 `styles.css` 中的变量来自定义主题：

```css
:root {
  --ldesign-brand-color-6: #your-color;
  --ldesign-text-color-primary: #your-text-color;
}
```

## 📝 注意事项

1. **类型安全** - 项目使用 TypeScript，确保类型正确
2. **错误处理** - 所有异步操作都包含错误处理
3. **独立组件** - 使用 Angular 17 的独立组件架构
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
