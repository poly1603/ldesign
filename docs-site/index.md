---
layout: home

hero:
  name: LDesign
  text: 企业级前端设计系统
  tagline: 70+ 功能包，26+ 组件库，完整的工具链支持
  image:
    src: /logo.svg
    alt: LDesign
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/ldesign/ldesign

features:
  - icon: 🎨
    title: 设计系统
    details: 统一的设计语言和视觉规范，提供一致的用户体验
  - icon: 📦
    title: 模块化架构
    details: 基于 Monorepo 的模块化设计，按需引入，减少打包体积
  - icon: 🚀
    title: 高性能
    details: 优化的构建流程和运行时性能，快速响应用户操作
  - icon: 🛠️
    title: 完整工具链
    details: 从开发到部署的完整工具链支持，提升开发效率
  - icon: 💪
    title: TypeScript
    details: 100% TypeScript 编写，提供完整的类型定义
  - icon: 🌍
    title: 国际化
    details: 内置国际化支持，轻松构建多语言应用
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 可以在这里添加首页特效
})
</script>

## 🚀 快速开始

```bash
# 安装 CLI 工具
npm install -g @ldesign/cli

# 创建新项目
ldesign create my-project

# 进入项目目录
cd my-project

# 启动开发服务器
npm run dev
```

## 📦 核心包

### 数据管理
- **[@ldesign/cache](/packages/cache/)** - 智能缓存管理器，支持多存储引擎
- **[@ldesign/store](/packages/store/)** - 基于 Pinia 的状态管理库
- **[@ldesign/storage](/packages/storage/)** - 统一的存储抽象层

### 网络通信
- **[@ldesign/http](/packages/http/)** - 现代化 HTTP 客户端
- **[@ldesign/websocket](/packages/websocket/)** - WebSocket 封装
- **[@ldesign/api](/packages/api/)** - API 管理和集成

### 用户界面
- **[@ldesign/animation](/packages/animation/)** - 动画系统
- **[@ldesign/notification](/packages/notification/)** - 通知系统
- **[@ldesign/theme](/packages/theme/)** - 主题管理

## 🎯 特色组件

### 编辑器系列
- **[Code Editor](/libraries/code-editor/)** - Monaco Editor 封装，支持 AI 代码补全
- **[Rich Text Editor](/libraries/editor/)** - 功能丰富的富文本编辑器
- **[Markdown Editor](/libraries/markdown/)** - Markdown 编辑和预览

### 数据可视化
- **[Charts](/libraries/chart/)** - 基于 ECharts 的图表组件
- **[3D Viewer](/libraries/3d-viewer/)** - 3D 模型和全景图查看器
- **[Timeline](/libraries/timeline/)** - 时间轴组件

### 办公组件
- **[Excel](/libraries/excel/)** - Excel 文件处理和在线编辑
- **[PDF Viewer](/libraries/pdf/)** - PDF 文档查看器
- **[Form Builder](/libraries/form/)** - 可视化表单生成器

## 🛠️ 工具链

- **[CLI](/tools/cli/)** - 命令行工具，项目初始化和管理
- **[Builder](/tools/builder/)** - 统一的构建工具
- **[Analyzer](/tools/analyzer/)** - 代码分析和优化建议
- **[DevTools](/tools/devtools/)** - 浏览器开发者工具扩展

## 💡 为什么选择 LDesign？

### 🏗️ 企业级架构
- Monorepo 架构，统一管理
- 完善的 CI/CD 流程
- 严格的代码质量控制

### 📈 持续维护
- 活跃的社区支持
- 定期版本更新
- 及时的安全修复

### 🤝 开放生态
- 开源协议，自由使用
- 插件化架构，易于扩展
- 丰富的第三方集成

## 🌟 谁在使用

<div class="users-list">
  <!-- 这里可以展示使用 LDesign 的公司/项目 logo -->
</div>

## 📊 项目状态

- **包总数**: 70+
- **组件数量**: 26+
- **测试覆盖率**: 80%+
- **TypeScript 覆盖**: 100%
- **活跃贡献者**: 50+

## 🤝 参与贡献

我们欢迎所有形式的贡献，无论是新功能、错误修复还是文档改进。

```bash
# Fork 项目
git clone https://github.com/your-username/ldesign.git
cd ldesign

# 安装依赖
pnpm install

# 创建功能分支
git checkout -b feature/your-feature

# 开发和测试
pnpm dev
pnpm test

# 提交 PR
git push origin feature/your-feature
```

查看[贡献指南](https://github.com/ldesign/ldesign/blob/main/CONTRIBUTING.md)了解更多信息。

<style>
.users-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin: 2rem 0;
  padding: 2rem;
  background-color: var(--vp-c-bg-alt);
  border-radius: 12px;
}
</style>
