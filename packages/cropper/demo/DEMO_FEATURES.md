# @ldesign/cropper 演示项目功能说明

## 🎯 项目概述

这是一个完整的 Vite + Vue 3 演示项目，展示了 `@ldesign/cropper` 图片裁剪插件的四种不同使用方式。

## 🚀 快速开始

```bash
# 进入演示项目目录
cd packages/cropper/demo

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 访问演示项目
open http://localhost:3000
```

## 📱 演示页面

### 1. 首页 (/)
- **功能**: 项目介绍和导航
- **特色**: 
  - 响应式设计
  - 功能特性展示
  - 使用方式导航卡片
  - 快速开始指南

### 2. 原生 JavaScript (/native-js)
- **功能**: 直接使用 SimpleCropper 类
- **特色**:
  - 文件选择和上传
  - 实时裁剪预览
  - 控制按钮（旋转、缩放、翻转、重置）
  - 裁剪信息显示
  - 图片导出功能

**使用示例**:
```javascript
import { SimpleCropper } from './utils/SimpleCropper.js'

const cropper = new SimpleCropper(container, {
  theme: 'light',
  aspectRatio: 'free',
  showGrid: true,
  responsive: true
})

await cropper.setImageSource(file)
const result = await cropper.export({ format: 'png', quality: 0.9 })
```

### 3. Vue 组件 (/vue-component)
- **功能**: 使用 SimpleImageCropper 组件
- **特色**:
  - 声明式组件使用
  - Props 配置
  - 事件监听
  - 主题切换
  - 宽高比控制

**使用示例**:
```vue
<template>
  <ImageCropper 
    :src="imageSrc"
    :theme="theme"
    :aspect-ratio="aspectRatio"
    @ready="handleReady"
    @crop-change="handleCropChange"
    @export="handleExport"
  />
</template>
```

### 4. Vue Hook (/vue-hook)
- **功能**: 使用 useSimpleCropper Hook
- **特色**:
  - Composition API 风格
  - 响应式状态管理
  - 灵活的配置选项
  - 生命周期管理

**使用示例**:
```javascript
import { useSimpleCropper } from './utils/SimpleCropper.js'

const {
  cropperRef,
  cropper,
  isReady,
  cropData,
  setImageSource,
  exportImage
} = useSimpleCropper({
  aspectRatio: '16:9',
  theme: 'light'
})
```

### 5. Vue 指令 (/vue-directive)
- **功能**: 使用 v-simple-cropper 指令
- **特色**:
  - 最简使用方式
  - 指令式配置
  - 自动生命周期管理
  - 事件回调支持

**使用示例**:
```vue
<template>
  <div v-cropper="cropperOptions"></div>
</template>

<script>
const cropperOptions = {
  src: '/path/to/image.jpg',
  config: { aspectRatio: '16:9' },
  onReady: (cropper) => console.log('就绪'),
  onCropChange: (cropper, data) => console.log('变化', data)
}
</script>
```

## 🛠️ 技术实现

### SimpleCropper 核心功能
- **图片加载**: 支持 File 对象和 URL
- **Canvas 渲染**: 高性能图片显示
- **交互控制**: 鼠标拖拽裁剪框
- **事件系统**: 完整的事件监听机制
- **导出功能**: 多格式图片导出

### Vue 集成
- **组件封装**: 完整的 Vue 组件实现
- **Hook 封装**: Composition API 风格
- **指令封装**: 简化的指令使用
- **类型支持**: 完整的 TypeScript 类型定义

## 🎨 界面特色

### 响应式设计
- 桌面端优化布局
- 移动端友好界面
- 自适应导航栏
- 弹性网格布局

### 现代化样式
- 渐变背景效果
- 圆角和阴影
- 平滑过渡动画
- 交互状态反馈

### 代码展示
- 语法高亮显示
- 多标签代码示例
- 实时代码更新
- 复制功能支持

## 🔧 配置选项

### 基础配置
```javascript
{
  theme: 'light' | 'dark',           // 主题
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9' | '3:2',  // 宽高比
  showGrid: boolean,                 // 显示网格
  responsive: boolean                // 响应式
}
```

### 事件回调
```javascript
{
  onReady: (data) => {},            // 就绪事件
  onCropChange: (data) => {},       // 裁剪变化
  onImageLoad: (data) => {},        // 图片加载
  onError: (error) => {}            // 错误处理
}
```

## 📊 功能对比

| 功能 | 原生 JS | Vue 组件 | Vue Hook | Vue 指令 |
|------|---------|----------|----------|----------|
| 易用性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 灵活性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 集成度 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 学习成本 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |

## 🎯 使用建议

- **新手推荐**: Vue 指令 - 最简单的使用方式
- **组件开发**: Vue 组件 - 完整的功能封装
- **高级用法**: Vue Hook - 灵活的状态管理
- **框架无关**: 原生 JS - 适用于任何项目

## 🚀 下一步

1. **功能扩展**: 添加更多裁剪形状和效果
2. **性能优化**: 大图片处理和内存管理
3. **测试完善**: 单元测试和 E2E 测试
4. **文档完善**: API 文档和使用指南
5. **生态建设**: React、Angular 等框架适配

## 📝 注意事项

- 当前为演示版本，功能相对简化
- 生产环境请使用完整版 @ldesign/cropper
- 建议在现代浏览器中使用
- 移动端体验可能需要进一步优化
