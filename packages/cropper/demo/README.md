# @ldesign/cropper Demo

这是 @ldesign/cropper 图片裁剪插件的完整演示项目，展示了四种不同的使用方式。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看演示。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📱 演示页面

### 1. 首页 (/)
- 项目介绍和特性展示
- 快速导航到各个演示页面

### 2. 原生 JavaScript (/native-js)
- 展示如何在原生 JavaScript 中使用 Cropper 类
- 完整的事件处理和方法调用示例
- 实时显示裁剪信息和导出功能

### 3. Vue 组件 (/vue-component)
- 展示 ImageCropper Vue 组件的使用
- 完整的 Props 和 Events 演示
- 动态配置和事件日志

### 4. Vue Hook (/vue-hook)
- 展示 useCropper Composition API Hook
- 响应式状态管理
- 灵活的方法调用

### 5. Vue 指令 (/vue-directive)
- 展示 v-cropper 指令的使用
- 最简单的集成方式
- 动态配置更新

## 🎯 功能特性

每个演示页面都包含以下功能：

- **文件上传**: 支持拖拽和点击上传
- **实时裁剪**: 所见即所得的裁剪体验
- **多种操作**: 旋转、缩放、翻转、重置
- **宽高比控制**: 自由比例和预设比例
- **主题切换**: 浅色/深色主题
- **导出功能**: 多格式导出和下载
- **代码示例**: 每个页面都有对应的代码示例

## 🛠️ 技术栈

- **Vue 3**: 使用 Composition API
- **Vite**: 快速的构建工具
- **Vue Router**: 单页面应用路由
- **TypeScript**: 类型安全（通过 .ts 导入）
- **Less**: CSS 预处理器

## 📁 项目结构

```
demo/
├── src/
│   ├── views/           # 演示页面
│   │   ├── Home.vue     # 首页
│   │   ├── NativeJS.vue # 原生 JS 演示
│   │   ├── VueComponent.vue # Vue 组件演示
│   │   ├── VueHook.vue  # Vue Hook 演示
│   │   └── VueDirective.vue # Vue 指令演示
│   ├── components/      # 公共组件
│   │   └── Navigation.vue # 导航组件
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
└── index.html           # HTML 模板
```

## 🎨 样式说明

- 使用了响应式设计，支持桌面和移动设备
- 采用现代化的 UI 设计风格
- 支持深色和浅色主题
- 使用 CSS Grid 和 Flexbox 布局

## 📝 使用说明

1. **选择演示页面**: 通过顶部导航选择要查看的演示
2. **上传图片**: 点击"选择图片"按钮或拖拽图片到指定区域
3. **调整裁剪**: 使用鼠标或触摸操作调整裁剪区域
4. **配置选项**: 修改主题、宽高比等配置选项
5. **查看代码**: 右侧代码面板显示对应的实现代码
6. **导出图片**: 点击导出按钮下载裁剪后的图片

## 🔧 开发说明

### 添加新的演示

1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.js` 中添加路由配置
3. 在 `src/components/Navigation.vue` 中添加导航链接

### 修改样式

- 全局样式在各组件的 `<style scoped>` 中定义
- 响应式断点: 768px (移动设备)
- 主要颜色: #667eea (主色调), #28a745 (成功), #dc3545 (错误)

### 调试技巧

- 打开浏览器开发者工具查看控制台输出
- 每个演示都有详细的事件日志
- 可以通过修改配置实时查看效果变化

## 📄 许可证

MIT License
