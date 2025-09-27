# 📚 演示中心

欢迎来到 @ldesign/cropper 演示中心！这里提供了多种技术栈的完整演示，帮助您快速了解和集成图片裁剪功能。

## 🎯 演示概览

### 🚀 可用演示

#### 1. Vite + JavaScript 真实库演示
- **路径**: `./vite-real-demo/`
- **技术栈**: Vite + JavaScript + 真实库
- **特点**: 直接使用 `src` 中的真实 Cropper 类
- **状态**: ✅ 可用

**主要特性**:
- ✅ 真实库 API 调用
- ✅ 完整事件系统
- ✅ 多格式导出 (PNG/JPEG/WebP)
- ✅ 实时预览
- ✅ 响应式设计
- ✅ 性能监控
- ✅ 拖拽上传
- ✅ 触摸支持

### 🚧 计划中的演示

#### 2. Vue 3 组件演示
- **技术栈**: Vue 3 + Composition API + TypeScript
- **状态**: 🚧 开发中
- **预计特性**: 组合式 API、响应式绑定、组件封装

#### 3. React Hooks 演示
- **技术栈**: React + Hooks + TypeScript
- **状态**: 🚧 开发中
- **预计特性**: React Hooks、函数式组件、forwardRef

#### 4. Angular 组件演示
- **技术栈**: Angular + Component + RxJS
- **状态**: 🚧 开发中
- **预计特性**: Angular 组件、依赖注入、RxJS 集成

## 🚀 快速开始

### 访问演示中心
```bash
# 在浏览器中打开
open examples/index.html
```

### 运行真实库演示
```bash
# 进入演示目录
cd examples/vite-real-demo

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📁 目录结构

```
examples/
├── index.html              # 演示中心主页
├── README.md               # 演示说明文档
└── vite-real-demo/         # Vite + JavaScript 真实库演示
    ├── index.html          # 演示页面
    ├── main.js             # 主要逻辑
    ├── style.css           # 样式文件
    ├── package.json        # 项目配置
    ├── vite.config.js      # Vite 配置
    ├── README.md           # 演示文档
    └── public/
        └── vite.svg        # 图标文件
```

## 🎨 演示特色

### 1. 真实库集成
- **直接导入**: 从 `../../src` 导入真实的 Cropper 类
- **完整功能**: 使用库的所有真实功能和 API
- **真实事件**: 监听真实的事件系统
- **无模拟代码**: 不包含任何功能模拟实现

### 2. 现代化 UI
- **响应式设计**: 适配桌面端和移动端
- **渐变背景**: 美观的视觉效果
- **平滑动画**: 优雅的交互体验
- **直观控件**: 易于理解和使用

### 3. 完整功能展示
- **图片上传**: 点击选择、拖拽上传
- **裁剪操作**: 多种形状、宽高比控制
- **图片变换**: 旋转、翻转、缩放
- **实时预览**: 多尺寸预览
- **导出功能**: 多格式、质量控制

## 🔧 技术实现

### Vite + JavaScript 演示

#### 核心配置
```javascript
// vite.config.js
export default defineConfig({
  resolve: {
    alias: {
      '@cropper': resolve(__dirname, '../../src')
    }
  }
})
```

#### 真实库导入
```javascript
// main.js
import { Cropper } from '@cropper/core/Cropper'
import { CropShape, ImageFormat, AspectRatio, CropperEventType } from '@cropper/types'
import '@cropper/styles/cropper.css'
```

#### 真实 API 调用
```javascript
// 初始化
this.cropper = new Cropper({
    container: '#cropperContainer',
    shape: CropShape.RECTANGLE,
    aspectRatio: AspectRatio.FREE,
    // ... 其他配置
})

// 事件监听
this.cropper.on(CropperEventType.READY, () => {
    this.enableControls()
})

// 操作调用
this.cropper.rotateLeft()
this.cropper.flipHorizontal()
const canvas = this.cropper.getCroppedCanvas()
```

## 📊 功能对比

| 功能 | 真实库演示 | 计划中的框架演示 |
|------|------------|------------------|
| **库来源** | `src/` 真实代码 | 框架适配器 |
| **功能实现** | 真实库功能 | 框架封装 |
| **事件系统** | 真实事件 | 框架事件 |
| **API 调用** | 直接调用 | 组件方法 |
| **类型支持** | 完整 TypeScript | 框架类型 |
| **开发体验** | 原生 API | 框架特性 |

## 🌟 演示亮点

### 1. 真实性
- 使用真实的库代码，不是模拟实现
- 展示真实的性能和功能
- 提供真实的开发体验

### 2. 完整性
- 涵盖所有核心功能
- 包含错误处理
- 提供完整的用户流程

### 3. 实用性
- 可直接复制代码使用
- 提供最佳实践示例
- 包含详细的注释说明

### 4. 现代化
- 使用最新的技术栈
- 遵循现代开发规范
- 提供优秀的用户体验

## 🔮 未来计划

### 短期目标
- [ ] 完成 Vue 3 组件演示
- [ ] 完成 React Hooks 演示
- [ ] 完成 Angular 组件演示
- [ ] 添加更多使用场景

### 长期目标
- [ ] 添加 Svelte 演示
- [ ] 添加 Solid.js 演示
- [ ] 添加 Web Components 演示
- [ ] 创建在线演示平台

## 📞 技术支持

### 问题反馈
如果您在使用演示时遇到问题：

1. **检查控制台** - 查看错误信息
2. **查看文档** - 阅读相应的 README
3. **提交 Issue** - 在 GitHub 仓库报告问题
4. **参与讨论** - 加入社区讨论

### 贡献指南
欢迎为演示项目贡献代码：

1. **Fork 仓库** - 创建您的分支
2. **添加演示** - 创建新的演示项目
3. **测试验证** - 确保演示正常工作
4. **提交 PR** - 提交您的贡献

## 📄 许可证

所有演示项目均采用 MIT 许可证，与主库保持一致。

---

**开始探索**: 访问 [演示中心](./index.html) 体验所有功能！
