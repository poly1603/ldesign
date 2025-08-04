# 自适应表单布局系统 - 示例项目

本目录包含了自适应表单布局系统的完整示例项目，展示了系统在不同环境下的使用方法。

## 📁 项目结构

```
examples/
├── vanilla-js/          # 原生JavaScript示例
│   ├── index.html       # 主页面
│   ├── main.js          # 主要逻辑
│   ├── package.json     # 项目配置
│   └── vite.config.js   # Vite配置
├── vue-app/             # Vue3示例应用
│   ├── src/
│   │   ├── components/  # 示例组件
│   │   ├── App.vue      # 主应用
│   │   └── main.js      # 入口文件
│   ├── index.html       # HTML模板
│   ├── package.json     # 项目配置
│   └── vite.config.js   # Vite配置
├── basic-usage.html     # 基础用法示例
├── modal-example.html   # 弹窗模式示例
├── comprehensive-example.html # 综合功能示例
└── README.md           # 本文件
```

## 🚀 快速开始

### 原生JavaScript示例

```bash
cd vanilla-js
npm install
npm run dev
```

访问 http://localhost:3000 查看示例。

### Vue3示例应用

```bash
cd vue-app
npm install
npm run dev
```

访问 http://localhost:3001 查看示例。

### 静态HTML示例

直接在浏览器中打开以下文件：

- `basic-usage.html` - 基础用法演示
- `modal-example.html` - 弹窗模式演示
- `comprehensive-example.html` - 综合功能演示

## 📋 示例说明

### 1. 原生JavaScript示例 (`vanilla-js/`)

**特点：**

- 完整的原生JavaScript实现
- 展示所有核心功能
- 性能监控和测试
- 响应式设计

**包含功能：**

- ✅ 基础自适应布局
- ✅ 展开收起功能
- ✅ 实时表单验证
- ✅ 表单分组管理
- ✅ 性能指标监控
- ✅ 动态字段添加

**运行方式：**

```bash
cd vanilla-js
npm run dev
```

### 2. Vue3示例应用 (`vue-app/`)

**特点：**

- 完整的Vue3应用
- 组件化架构
- 多个功能演示页面
- 现代化UI设计

**包含组件：**

- `BasicExample.vue` - 基础用法示例
- `AdvancedExample.vue` - 高级功能示例
- `ValidationExample.vue` - 表单验证示例
- `GroupExample.vue` - 表单分组示例
- `HookExample.vue` - Hook用法示例
- `PerformanceExample.vue` - 性能测试示例

**运行方式：**

```bash
cd vue-app
npm run dev
```

### 3. 静态HTML示例

#### `basic-usage.html`

- 最简单的使用示例
- 适合快速了解基本功能
- 无需构建工具

#### `modal-example.html`

- 专门演示弹窗模式
- 包含动画效果
- 数据同步演示

#### `comprehensive-example.html`

- 综合功能演示
- 所有特性的完整展示
- 性能监控面板

## 🎯 功能演示

### 自适应布局

- 根据容器宽度自动调整列数
- 响应式断点支持
- 智能表单项排列

### 展开收起

- 内联展开模式
- 弹窗展开模式
- 平滑动画过渡

### 表单验证

- 实时验证反馈
- 多种验证规则
- 自定义验证函数

### 表单分组

- 分组管理和展示
- 独立的分组展开收起
- 分组统计信息

### 性能优化

- 高效的渲染机制
- 内存使用优化
- 事件处理优化

## 🔧 开发说明

### 本地开发

1. 克隆项目

```bash
git clone <repository-url>
cd packages/form/examples
```

2. 选择示例项目

```bash
# 原生JavaScript
cd vanilla-js && npm install && npm run dev

# Vue3应用
cd vue-app && npm install && npm run dev
```

### 自定义示例

您可以基于现有示例创建自己的演示：

1. 复制示例目录
2. 修改配置和代码
3. 运行开发服务器

### 构建部署

```bash
# 构建原生JS示例
cd vanilla-js && npm run build

# 构建Vue应用
cd vue-app && npm run build
```

## 📚 学习路径

### 初学者

1. 查看 `basic-usage.html` 了解基本概念
2. 运行 `vanilla-js` 示例体验核心功能
3. 阅读源码了解实现原理

### Vue开发者

1. 运行 `vue-app` 示例
2. 查看各个组件的实现
3. 学习Hook的使用方法

### 高级用户

1. 查看 `comprehensive-example.html` 了解所有功能
2. 运行性能测试了解系统性能
3. 自定义配置和扩展功能

## 🤝 贡献

欢迎提交示例和改进建议：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件。

## 🔗 相关链接

- [项目主页](https://form.ldesign.dev)
- [API文档](https://form.ldesign.dev/api)
- [GitHub仓库](https://github.com/ldesign/form)
- [问题反馈](https://github.com/ldesign/form/issues)
