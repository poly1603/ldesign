# LDESIGN Cropper 示例

这里包含了 LDESIGN Cropper 的完整示例集合，涵盖了各种使用场景和框架集成。

## 📁 示例结构

```
examples/
├── vanilla/          # 原生 JavaScript 示例
├── vue/             # Vue 3 示例
├── react/           # React 示例
├── angular/         # Angular 示例
└── README.md        # 本文件
```

## 🚀 快速开始

### 原生 JavaScript 示例

最简单的使用方式，无需任何框架：

```bash
cd vanilla/
# 直接在浏览器中打开 index.html
open index.html
```

**特性展示：**
- ✅ 基本裁剪功能
- ✅ 多种裁剪形状（矩形、圆形、椭圆）
- ✅ 交互操作（缩放、旋转、翻转）
- ✅ 实时预览和结果下载
- ✅ 拖拽上传和示例图片

### Vue 3 示例

展示如何在 Vue 3 项目中集成：

```bash
cd vue/
pnpm install
pnpm dev
```

**特性展示：**
- ✅ Vue 3 组合式 API 集成
- ✅ 响应式数据绑定
- ✅ 组件化设计
- ✅ TypeScript 支持
- ✅ 拖拽上传和文件处理

### React 示例

展示如何在 React 项目中集成：

```bash
cd react/
npm install
npm start
```

**特性展示：**
- ✅ React Hooks 集成
- ✅ 状态管理
- ✅ 组件生命周期
- ✅ TypeScript 支持
- ✅ 现代 React 最佳实践

### Angular 示例

展示如何在 Angular 项目中集成：

```bash
cd angular/
npm install
ng serve
```

**特性展示：**
- ✅ Angular 组件集成
- ✅ 依赖注入
- ✅ 响应式表单
- ✅ TypeScript 支持
- ✅ Angular 最佳实践

## 🎯 功能演示

### 基础功能

所有示例都包含以下基础功能：

1. **图片上传**
   - 文件选择器上传
   - 拖拽上传
   - 示例图片选择

2. **裁剪操作**
   - 矩形、圆形、椭圆形裁剪
   - 自由比例和固定比例
   - 拖拽调整裁剪区域

3. **变换操作**
   - 缩放（放大/缩小）
   - 旋转（左转/右转）
   - 翻转（水平/垂直）
   - 重置操作

4. **结果输出**
   - 实时预览
   - 多格式导出（PNG、JPEG、WebP）
   - 质量控制
   - 尺寸调整

### 高级功能

部分示例还展示了高级功能：

1. **主题定制**
   - 亮色/暗色主题切换
   - 自定义颜色方案
   - CSS 变量定制

2. **性能优化**
   - 大图片处理
   - 内存管理
   - 懒加载

3. **移动端适配**
   - 触摸手势支持
   - 响应式布局
   - 移动端优化

## 🛠️ 开发指南

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/ldesign/cropper.git
   cd cropper/examples
   ```

2. **选择示例**
   ```bash
   # 原生 JavaScript
   cd vanilla && open index.html
   
   # Vue 3
   cd vue && pnpm install && pnpm dev
   
   # React
   cd react && npm install && npm start
   
   # Angular
   cd angular && npm install && ng serve
   ```

3. **修改和测试**
   - 修改示例代码
   - 在浏览器中查看效果
   - 测试不同功能

### 自定义示例

你可以基于现有示例创建自己的定制版本：

1. **复制示例目录**
   ```bash
   cp -r vue my-custom-example
   cd my-custom-example
   ```

2. **修改配置**
   - 更新 `package.json`
   - 修改组件代码
   - 调整样式和配置

3. **添加功能**
   - 集成其他库
   - 添加自定义工具
   - 实现特定业务逻辑

## 📱 在线演示

你可以在以下地址查看在线演示：

- **官方演示**: [ldesign-cropper.vercel.app](https://ldesign-cropper.vercel.app)
- **CodePen 示例**: [codepen.io/ldesign/cropper](https://codepen.io/ldesign/cropper)
- **StackBlitz 示例**: [stackblitz.com/ldesign-cropper](https://stackblitz.com/ldesign-cropper)

## 🎨 使用场景

### 内容管理系统
```javascript
// 文章封面图裁剪
const cropper = new Cropper({
  container: '#cover-cropper',
  aspectRatio: 16/9,
  minCropBoxWidth: 400,
  minCropBoxHeight: 225
})
```

### 用户头像上传
```javascript
// 圆形头像裁剪
const cropper = new Cropper({
  container: '#avatar-cropper',
  shape: 'circle',
  aspectRatio: 1,
  minCropBoxWidth: 100
})
```

### 电商商品图
```javascript
// 商品图片处理
const cropper = new Cropper({
  container: '#product-cropper',
  aspectRatio: 4/3,
  quality: 0.9,
  maxWidth: 800
})
```

### 社交媒体
```javascript
// 动态图片编辑
const cropper = new Cropper({
  container: '#social-cropper',
  aspectRatio: 1,
  toolbar: {
    tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right']
  }
})
```

## 🔧 技术栈

### 原生 JavaScript
- **无依赖**: 纯原生 JavaScript 实现
- **现代 ES6+**: 使用最新 JavaScript 特性
- **模块化**: ES Modules 支持

### Vue 3
- **组合式 API**: 使用 `<script setup>` 语法
- **TypeScript**: 完整的类型支持
- **Vite**: 快速的开发构建工具

### React
- **函数组件**: 使用 React Hooks
- **TypeScript**: 完整的类型支持
- **Create React App**: 标准的 React 脚手架

### Angular
- **组件架构**: Angular 组件和服务
- **TypeScript**: 原生 TypeScript 支持
- **Angular CLI**: 官方脚手架工具

## 📚 相关资源

- [完整文档](../docs/) - 详细的使用文档
- [API 参考](../docs/api/) - 完整的 API 文档
- [配置选项](../docs/config/) - 所有配置选项
- [GitHub 仓库](https://github.com/ldesign/cropper) - 源代码和问题反馈

## 🤝 贡献示例

欢迎贡献新的示例！请遵循以下步骤：

1. **Fork 仓库**
2. **创建示例目录**
3. **编写示例代码**
4. **添加 README 说明**
5. **提交 Pull Request**

### 示例要求

- ✅ 代码清晰易懂
- ✅ 包含详细注释
- ✅ 提供 README 说明
- ✅ 展示特定功能或场景
- ✅ 遵循最佳实践

---

<div align="center">
  <p>🎨 让图片裁剪变得简单而强大</p>
  <p>Built with ❤️ by LDESIGN Team</p>
</div>
