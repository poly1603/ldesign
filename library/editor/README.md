# Enhanced Rich Text Editor

一个现代化、可扩展的富文本编辑器，基于 Quill 架构设计，提供更强大的功能和更好的用户体验。

## ✨ 特性

### 🎯 核心功能
- **完整的文本格式化**：粗体、斜体、下划线、删除线、颜色、字体等
- **段落格式**：标题、列表、对齐、缩进等
- **媒体支持**：图片、链接、视频嵌入
- **撤销/重做**：完整的历史记录系统

### 🚀 增强功能
- **表格编辑器**：支持合并单元格、调整列宽、表格样式
- **代码块语法高亮**：支持 100+ 编程语言
- **数学公式编辑**：LaTeX 支持，实时预览
- **协作编辑**：实时多人编辑，冲突解决
- **文件上传**：拖拽上传，进度显示
- **自定义主题**：完全可定制的外观

### 🛠️ 开发者友好
- **TypeScript**：完整的类型定义
- **插件系统**：易于扩展的架构
- **框架集成**：React、Vue、Angular 支持
- **移动端优化**：触摸操作支持
- **无障碍访问**：ARIA 标准支持

## 📦 安装

```bash
# 使用 npm
npm install @ldesign/enhanced-rich-editor

# 使用 pnpm
pnpm add @ldesign/enhanced-rich-editor

# 使用 yarn
yarn add @ldesign/enhanced-rich-editor
```

## 🚀 快速开始

### 基础使用

```typescript
import { EnhancedEditor } from '@ldesign/enhanced-rich-editor';
import '@ldesign/enhanced-rich-editor/styles';

const editor = new EnhancedEditor('#editor', {
  theme: 'snow',
  modules: {
    toolbar: true,
    history: true,
  },
});
```

### React 集成

```tsx
import { useEnhancedEditor } from '@ldesign/enhanced-rich-editor/react';

function MyEditor() {
  const { editor, editorRef } = useEnhancedEditor({
    theme: 'snow',
    placeholder: '开始编写...',
  });

  return <div ref={editorRef} />;
}
```

### Vue 集成

```vue
<template>
  <EnhancedEditor
    v-model="content"
    :options="editorOptions"
    @change="handleChange"
  />
</template>

<script setup>
import { EnhancedEditor } from '@ldesign/enhanced-rich-editor/vue';

const content = ref('');
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: true,
  },
};
</script>
```

## 📖 文档

- [完整文档](./docs/README.md)
- [API 参考](./docs/api/README.md)
- [插件开发](./docs/plugins/README.md)
- [示例集合](./examples/README.md)

## 🏗️ 开发

```bash
# 克隆项目
git clone https://github.com/ldesign/enhanced-rich-editor.git
cd enhanced-rich-editor

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build
```

## 🧪 测试

```bash
# 单元测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# E2E 测试
pnpm test:e2e

# 测试 UI
pnpm test:ui
```

## 📋 项目状态

当前版本：`0.1.0` (开发中)

### 开发进度

- [x] 项目架构设计
- [x] 基础配置和工具链
- [ ] 核心编辑器引擎
- [ ] 基础格式化功能
- [ ] 插件系统
- [ ] UI 组件库
- [ ] 高级功能插件
- [ ] 框架集成
- [ ] 文档和示例

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

## 📄 许可证

[MIT License](./LICENSE)

## 🙏 致谢

本项目受到以下优秀项目的启发：

- [Quill](https://quilljs.com/) - 模块化富文本编辑器
- [ProseMirror](https://prosemirror.net/) - 工具包式编辑器
- [Slate](https://slatejs.org/) - 完全可定制的编辑器框架
