# @ldesign/pdf Vue 3 示例项目

这是一个完整的Vue 3 + Vite示例项目，展示了@ldesign/pdf包的所有功能特性。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看示例。

### 构建项目

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 📋 功能演示

本示例项目展示了以下功能：

### 🔧 基础功能
- ✅ PDF文件加载（URL、File、ArrayBuffer）
- ✅ 页面导航（上一页、下一页、跳转）
- ✅ 缩放控制（放大、缩小、自适应）
- ✅ 旋转控制（90度旋转）
- ✅ 全屏预览

### 📊 高级功能
- ✅ 实时加载进度显示
- ✅ 性能监控面板
- ✅ 缓存统计信息
- ✅ 错误处理和恢复
- ✅ 响应式布局设计

### 🎨 用户体验
- ✅ 拖拽上传文件
- ✅ 键盘快捷键支持
- ✅ 触摸手势支持（移动端）
- ✅ 加载状态动画
- ✅ 错误提示信息

## 🎯 代码结构

```
src/
├── main.ts          # 应用入口
├── App.vue          # 主应用组件
├── style.css        # 全局样式
└── env.d.ts         # 类型声明
```

## 🎨 主要组件

### App.vue
主应用组件，包含：
- 文件上传区域
- PDF预览器
- 控制面板
- 性能监控

## 🔧 技术栈

- **Vue 3** - 现代响应式框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **@ldesign/pdf** - PDF预览组件包
- **pdfjs-dist** - PDF.js核心库

## 📱 响应式设计

项目完全支持响应式设计：
- 📱 手机端：垂直布局，触摸友好
- 💻 桌面端：水平布局，功能完整
- 🖥️ 大屏：优化的宽屏体验

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `←` `↑` | 上一页 |
| `→` `↓` `Space` | 下一页 |
| `Ctrl/Cmd + Plus` | 放大 |
| `Ctrl/Cmd + Minus` | 缩小 |
| `Ctrl/Cmd + 0` | 重置缩放 |
| `Home` | 第一页 |
| `End` | 最后一页 |

## 🎯 测试文件

项目包含测试PDF文件：
- `public/sample.pdf` - 示例PDF文档
- 支持从URL加载外部PDF
- 支持本地文件上传

## 📦 构建配置

- **目标环境**: ES2022+
- **代码分割**: vendor、pdfjs、ldesign分离
- **压缩**: Terser压缩
- **Source Map**: 支持调试
- **Tree Shaking**: 自动优化

## 🐛 故障排除

### PDF.js Worker 错误
确保Worker路径正确配置：
```javascript
import * as pdfjs from 'pdfjs-dist'
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
```

### 跨域问题
对于外部PDF，确保CORS配置正确。

### 内存问题
大型PDF可能导致内存不足，建议：
- 启用分页加载
- 调整缓存大小
- 及时清理资源

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT © LDesign Team