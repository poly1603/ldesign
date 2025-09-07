# @ldesign/form 演示项目

> 统一演示项目，展示查询表单的多种实现方式：原生JavaScript、Web Components、Vue组件

## 🎯 项目概述

本项目是 `@ldesign/form` 的统一演示项目，展示了如何使用三种不同的技术栈实现相同的查询表单功能：

- **原生JavaScript** - 使用纯JavaScript实现，无框架依赖
- **Web Components** - 使用Lit框架创建可复用的Web Components
- **Vue组件** - 使用Vue 3组合式API和响应式特性

## ✨ 核心功能特性

### 🎯 智能按钮布局
- 根据字段数量自动调整按钮位置
- 支持行内和新行两种模式
- 当最后一行字段少于3个时，按钮显示在行内
- 当最后一行字段达到3个时，按钮显示在新行

### 📱 展开收起功能
- 支持表单的展开和收起
- 可配置默认显示行数
- 提供更好的用户体验

### ⚙️ 实时配置面板
- 可以实时调整表单配置
- 立即查看配置变化的效果
- 支持以下配置项：
  - 默认行数（1-3行）
  - 是否支持展开收起
  - 按钮位置（行内/新行）
  - 按钮对齐方式（左对齐/居中/右对齐）

### 🎨 LDESIGN 设计系统
- 使用统一的设计系统变量
- 保证视觉一致性
- 支持主题定制

### 📝 多字段支持
- 支持9个字段，分3行显示
- 包含文本输入框和选择框
- 字段类型：关键词、分类、状态、日期范围、创建人、优先级、部门、项目、标签

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Windows 11 (开发环境)

### 安装依赖

```bash
# 在项目根目录安装依赖
pnpm install
```

### 启动开发服务器

```bash
# 启动开发服务器
pnpm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
# 构建生产版本
pnpm run build
```

### 预览生产版本

```bash
# 预览生产版本
pnpm run preview
```

## 📁 项目结构

```
packages/form/examples/demo/
├── src/
│   ├── components/          # 组件目录
│   │   ├── QueryFormComponent.ts    # Lit Web Components
│   │   └── VueQueryForm.vue         # Vue组件
│   ├── views/              # 页面视图
│   │   ├── Home.vue        # 首页
│   │   ├── VanillaDemo.vue # 原生JavaScript演示
│   │   ├── WebComponentsDemo.vue # Web Components演示
│   │   └── VueDemo.vue     # Vue组件演示
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义
│   ├── App.vue             # 主应用组件
│   └── main.ts             # 应用入口
├── public/                 # 静态资源
├── index.html              # HTML模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── README.md               # 项目文档
```

## 🛠️ 技术栈

- **构建工具**: Vite 5.0+
- **开发语言**: TypeScript 5.3+
- **包管理器**: pnpm 8.0+
- **前端框架**: Vue 3.4+
- **路由管理**: Vue Router 4.2+
- **组件库**: Lit 3.1+ (Web Components)
- **设计系统**: LDESIGN CSS Variables

## 📖 实现方式详解

### 1. 原生JavaScript实现 (`/vanilla`)

**特点**:
- 无框架依赖，使用纯JavaScript
- 直接操作DOM元素
- 事件处理和状态管理都通过原生API

**核心实现**:
- 使用 `document.createElement` 创建DOM元素
- 通过 `addEventListener` 绑定事件
- 使用闭包管理组件状态
- 智能按钮布局通过计算字段数量实现

**适用场景**:
- 不希望引入框架的轻量级项目
- 学习DOM操作和JavaScript基础
- 需要最大兼容性的项目

### 2. Web Components实现 (`/webcomponents`)

**特点**:
- 使用Lit框架创建标准Web Components
- 支持Shadow DOM封装
- 可在任何框架中使用

**核心实现**:
- 继承 `LitElement` 基类
- 使用 `@customElement` 装饰器注册组件
- 通过 `@property` 和 `@state` 管理属性和状态
- 使用 `html` 模板字面量渲染模板
- CSS样式通过 `static styles` 定义

**适用场景**:
- 需要跨框架复用的组件
- 希望使用Web标准的项目
- 构建组件库

### 3. Vue组件实现 (`/vue`)

**特点**:
- 使用Vue 3组合式API
- 响应式数据绑定
- 声明式模板语法

**核心实现**:
- 使用 `<script setup>` 语法
- 通过 `ref` 和 `reactive` 管理状态
- 使用 `computed` 计算属性
- 通过 `emit` 向父组件传递事件
- 模板中使用 `v-model`、`v-for`、`v-if` 等指令

**适用场景**:
- Vue.js项目
- 需要响应式数据绑定的复杂表单
- 快速开发和原型验证

## 🎨 设计系统

项目使用LDESIGN设计系统的CSS变量，确保视觉一致性：

### 颜色变量
- `--ldesign-brand-color`: 主品牌色
- `--ldesign-text-color-primary`: 主要文本色
- `--ldesign-text-color-secondary`: 次要文本色
- `--ldesign-border-color`: 边框色
- `--ldesign-bg-color-container`: 容器背景色

### 尺寸变量
- `--ls-font-size-*`: 字体大小
- `--ls-spacing-*`: 间距
- `--ls-padding-*`: 内边距
- `--ls-margin-*`: 外边距
- `--ls-border-radius-*`: 圆角

## 🧪 测试

### 功能测试清单

- [ ] 首页导航正常显示
- [ ] 三个演示页面都能正常访问
- [ ] 表单字段正确渲染（9个字段，3行布局）
- [ ] 智能按钮布局功能正常
- [ ] 展开收起功能正常
- [ ] 配置面板实时更新
- [ ] 查询和重置按钮功能正常
- [ ] 响应式布局在不同屏幕尺寸下正常
- [ ] 无控制台错误

### 手动测试步骤

1. **首页测试**
   - 访问 `http://localhost:3000`
   - 检查页面布局和导航
   - 点击各个实现方式的卡片

2. **原生JavaScript页面测试**
   - 访问 `/vanilla` 页面
   - 测试展开收起功能
   - 修改配置面板选项
   - 测试查询和重置按钮

3. **Web Components页面测试**
   - 访问 `/webcomponents` 页面
   - 重复原生JavaScript的测试步骤
   - 检查Web Components是否正确注册

4. **Vue组件页面测试**
   - 访问 `/vue` 页面
   - 重复功能测试
   - 检查Vue响应式更新

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 作者

LDESIGN Team

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！
