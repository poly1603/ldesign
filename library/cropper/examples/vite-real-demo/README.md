# 真实库演示 - Vite + JavaScript

这是一个使用 Vite + JavaScript 构建的 @ldesign/cropper 真实库演示，直接使用 `src` 目录中的真实 Cropper 类。

## 🎯 项目特点

### ✅ 使用真实库
- **直接导入** - 从 `../../src` 导入真实的 Cropper 类
- **完整功能** - 使用库的所有真实功能和 API
- **真实事件** - 监听真实的事件系统
- **无模拟代码** - 不包含任何功能模拟实现

### 🔧 技术栈
- **Vite** - 现代化构建工具
- **JavaScript ES6+** - 原生 JavaScript
- **真实 Cropper 类** - 来自 `src/core/Cropper.js`
- **真实类型定义** - 来自 `src/types/index.js`
- **真实样式** - 来自 `src/styles/cropper.css`

## 🚀 快速开始

### 1. 安装依赖

```bash
# 进入演示目录
cd examples/vite-real-demo

# 安装依赖
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:3001`

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 📋 功能演示

### 🖼️ 真实图片处理
- ✅ **真实图片加载** - 使用 `cropper.setImage()`
- ✅ **真实事件监听** - 监听 `CropperEventType` 事件
- ✅ **真实裁剪操作** - 调用真实的裁剪方法
- ✅ **真实导出功能** - 使用 `getCroppedCanvas()` 等方法

### ✂️ 真实裁剪功能
- ✅ **形状切换** - 矩形、圆形、椭圆（需要库支持）
- ✅ **宽高比控制** - 使用 `AspectRatio` 枚举
- ✅ **拖拽调整** - 真实的交互响应
- ✅ **实时预览** - 真实的裁剪结果

### 🔄 真实变换操作
- ✅ **旋转** - `rotateLeft()` / `rotateRight()`
- ✅ **翻转** - `flipHorizontal()` / `flipVertical()`
- ✅ **缩放** - `zoom()` / `zoomIn()` / `zoomOut()`
- ✅ **重置** - `reset()`

### 📤 真实导出功能
- ✅ **多格式** - 使用 `ImageFormat` 枚举
- ✅ **质量控制** - 真实的质量参数
- ✅ **Canvas 导出** - `getCroppedCanvas()`
- ✅ **Blob 导出** - `getCroppedBlob()`

## 🔧 配置说明

### Vite 配置 (`vite.config.js`)

```javascript
export default defineConfig({
  resolve: {
    alias: {
      '@cropper': resolve(__dirname, '../../src')
    }
  },
  optimizeDeps: {
    exclude: ['@cropper']
  }
})
```

### 导入配置 (`main.js`)

```javascript
// 导入真实的裁剪器库
import { Cropper } from '@cropper/core/Cropper'
import { CropShape, ImageFormat, AspectRatio, CropperEventType } from '@cropper/types'
import '@cropper/styles/cropper.css'
```

## 📁 项目结构

```
vite-real-demo/
├── index.html          # 主页面
├── main.js             # 主逻辑（使用真实库）
├── style.css           # 样式文件
├── package.json        # 项目配置
├── vite.config.js      # Vite 配置（路径别名）
└── README.md           # 说明文档
```

## 🎨 核心实现

### 1. 真实库初始化

```javascript
this.cropper = new Cropper({
    container: '#cropperContainer',
    shape: CropShape.RECTANGLE,
    aspectRatio: AspectRatio.FREE,
    movable: true,
    resizable: true,
    zoomable: true,
    rotatable: true,
    guides: true,
    responsive: true,
    touchEnabled: true
})
```

### 2. 真实事件监听

```javascript
// 使用真实的事件类型
this.cropper.on(CropperEventType.READY, () => {
    this.enableControls()
})

this.cropper.on(CropperEventType.IMAGE_LOADED, (event) => {
    this.currentImageInfo = event.imageInfo
    this.updateImageInfo()
})

this.cropper.on(CropperEventType.CROP_CHANGE, (event) => {
    this.updateCropInfo(event.cropData)
    this.updatePreviews()
})
```

### 3. 真实操作调用

```javascript
// 直接调用真实的库方法
this.cropper.rotateLeft()
this.cropper.flipHorizontal()
this.cropper.zoom(1.5)
this.cropper.reset()

// 真实的导出功能
const canvas = this.cropper.getCroppedCanvas(options)
const blob = await this.cropper.getCroppedBlob(options)
```

## 🔍 与模拟演示的区别

| 特性 | 真实库演示 | 模拟演示 |
|------|------------|----------|
| **库来源** | `src/` 真实代码 | 自定义 MockCropper |
| **功能实现** | 真实库功能 | 模拟实现 |
| **事件系统** | 真实事件 | 模拟事件 |
| **API 调用** | 真实 API | 模拟 API |
| **错误处理** | 真实错误 | 模拟错误 |
| **性能** | 真实性能 | 模拟性能 |

## 🐛 调试和开发

### 开发者工具
- 打开浏览器开发者工具
- 查看 Console 面板的真实日志
- 检查 Network 面板的资源加载
- 使用 Sources 面板调试真实代码

### 常见问题

#### 1. 导入错误
```
Error: Cannot resolve module '@cropper/core/Cropper'
```
**解决方案**: 检查 `vite.config.js` 中的路径别名配置

#### 2. 样式缺失
```
裁剪器显示异常或样式错误
```
**解决方案**: 确保正确导入 `@cropper/styles/cropper.css`

#### 3. 方法不存在
```
TypeError: this.cropper.someMethod is not a function
```
**解决方案**: 检查真实库是否实现了该方法

### 调试技巧

```javascript
// 在控制台中访问裁剪器实例
window.cropper = this.cropper

// 查看当前状态
console.log('裁剪数据:', this.cropper.getCropData())
console.log('图片信息:', this.currentImageInfo)

// 监听所有事件
Object.values(CropperEventType).forEach(eventType => {
    this.cropper.on(eventType, (event) => {
        console.log(`事件: ${eventType}`, event)
    })
})
```

## 📊 性能监控

### 事件监听器计数
- 实时显示当前活跃的事件监听器数量
- 帮助检测内存泄漏

### 操作响应时间
- 监控各种操作的响应时间
- 识别性能瓶颈

## 🔮 扩展开发

### 添加新功能
1. 在真实库中实现新功能
2. 在演示中添加对应的 UI 控件
3. 调用真实的 API 方法

### 自定义配置
```javascript
// 修改初始化配置
this.cropper = new Cropper({
    // 添加自定义配置
    customOption: true,
    // 覆盖默认配置
    backgroundColor: '#ffffff'
})
```

## 📞 技术支持

### 问题排查
1. **检查控制台** - 查看真实的错误信息
2. **验证路径** - 确认 `src` 目录结构
3. **测试 API** - 在控制台直接调用方法
4. **查看源码** - 检查 `src` 中的实现

### 开发建议
- 始终使用真实的库 API
- 不要在演示中重复实现功能
- 专注于 UI 交互和用户体验
- 利用真实的事件系统

---

**注意**: 这个演示直接使用 `src` 目录中的真实代码，确保您的开发环境能够正确解析模块路径。
