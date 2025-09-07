# @ldesign/form 示例项目

这个目录包含了展示 @ldesign/form 表单库各种使用方式的完整示例项目。

## 📁 项目结构

```
examples/
├── vanilla-js/         # 原生 JavaScript 示例
│   ├── index.html      # 主页面
│   ├── main.js         # 主要逻辑
│   ├── styles.css      # 样式文件
│   └── README.md       # 项目说明
├── vue3-demo/          # Vue 3 + TypeScript 示例
│   ├── src/
│   │   ├── App.vue     # 主组件
│   │   └── main.ts     # 入口文件
│   ├── index.html      # HTML 模板
│   └── README.md       # 项目说明
├── lit-demo/           # Lit Web Components 示例
│   ├── src/
│   │   ├── main.ts     # 主入口文件
│   │   └── styles.css  # 样式文件
│   ├── index.html      # HTML 模板
│   └── README.md       # 项目说明
└── README.md           # 总体说明（本文件）
```

## 🚀 快速开始

### 原生 JavaScript 示例

```bash
# 进入原生 JavaScript 示例目录
cd vanilla-js

# 安装依赖
pnpm install

# 启动开发服务器（端口 3001）
pnpm run dev
```

访问 http://localhost:3001 查看示例。

### Vue 3 示例

```bash
# 进入 Vue 3 示例目录
cd vue3-demo

# 安装依赖
pnpm install

# 启动开发服务器（端口 3002）
pnpm run dev
```

访问 http://localhost:3002 查看示例。

### Lit Web Components 示例

```bash
# 进入 Lit 示例目录
cd lit-demo

# 安装依赖
pnpm install

# 启动开发服务器（端口 3003）
pnpm run dev
```

访问 http://localhost:3003 查看示例。

## 📋 功能展示

### 原生 JavaScript 示例特性

- ✅ **基础表单**: 使用 `createForm` 创建表单实例
- ✅ **查询表单**: 展示查询表单的展开收起功能
- ✅ **登录表单**: 用户名密码登录，记住密码功能
- ✅ **注册表单**: 多字段注册，密码确认验证
- ✅ **联系表单**: 包含文本域的完整联系表单
- ✅ **表单验证**: 内置验证器的使用演示
- ✅ **数据绑定**: 表单数据的双向绑定
- ✅ **事件处理**: 提交、重置等事件处理

### Vue 3 示例特性

- ✅ **配置式使用**: 通过配置对象渲染表单
- ✅ **组合式使用**: 组件组合的使用方式
- ✅ **Hook式使用**: 使用 `useForm` 等 Composition API
- ✅ **查询表单**: `LDesignQueryForm` 组件演示
- ✅ **基础表单类型**: 登录、注册、个人信息、联系表单
- ✅ **高级表单类型**: 分步、动态、表格、文件上传表单
- ✅ **TypeScript 支持**: 完整的类型定义和类型安全
- ✅ **响应式数据**: Vue 3 响应式系统集成

### Lit Web Components 示例特性

- ✅ **Web Components 标准**: 基于 W3C 标准的自定义元素
- ✅ **跨框架兼容**: 可在任何前端框架中使用
- ✅ **Shadow DOM 封装**: 样式和 DOM 完全隔离
- ✅ **响应式属性**: 使用 Lit 的响应式系统
- ✅ **事件系统**: 通过 CustomEvent 进行通信
- ✅ **查询表单**: 完整的展开收起功能
- ✅ **基础表单类型**: 登录、注册、联系表单
- ✅ **TypeScript 支持**: 完整的类型定义和装饰器支持
- ✅ **原生性能**: 无框架依赖，原生浏览器支持

## 🛠️ 技术栈

### 原生 JavaScript 示例
- **构建工具**: Vite
- **语言**: JavaScript (ES6+)
- **样式**: CSS + LDESIGN 设计系统变量
- **表单库**: @ldesign/form 核心 API

### Vue 3 示例
- **框架**: Vue 3.4+
- **语言**: TypeScript 5.0+
- **构建工具**: Vite
- **样式**: Less + LDESIGN 设计系统变量
- **表单库**: @ldesign/form Vue 适配器

### Lit Web Components 示例
- **框架**: Lit 3.1+
- **语言**: TypeScript 5.0+
- **构建工具**: Vite
- **样式**: CSS + LDESIGN 设计系统变量
- **表单库**: @ldesign/form Lit 适配器

## 🎯 学习路径

### 初学者
1. 从 **原生 JavaScript 示例** 开始，了解核心概念
2. 学习表单创建、字段注册、验证规则
3. 理解数据绑定和事件处理机制

### Vue 开发者
1. 查看 **Vue 3 示例** 的三种使用方式
2. 学习 `useForm` 等 Composition API
3. 了解 TypeScript 类型定义和类型安全

### 高级用户
1. 研究查询表单的高级功能
2. 学习自定义验证器的使用
3. 探索表单状态管理和性能优化

## 📖 核心概念

### 表单实例
```javascript
// 创建表单实例
const form = createForm({
  initialValues: { username: '', email: '' }
})

// 注册字段
form.registerField({ 
  name: 'username',
  rules: [{ validator: required(), message: '请输入用户名' }]
})
```

### 验证系统
```javascript
// 内置验证器
import { required, email, length, pattern } from '@ldesign/form'

// 验证规则
const rules = [
  { validator: required(), message: '此字段为必填项' },
  { validator: email(), message: '请输入有效的邮箱地址' },
  { validator: length({ min: 6, max: 20 }), message: '长度应在6-20个字符之间' }
]
```

### Vue 3 集成
```vue
<script setup>
import { useForm } from '@ldesign/form/vue'

const form = useForm({
  initialValues: { username: '', email: '' }
})

// 响应式数据
const formData = form.data
const isValid = form.isValid
const isDirty = form.isDirty
</script>
```

### Lit Web Components 集成
```typescript
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { LDesignForm } from '@ldesign/form/lit'

@customElement('my-app')
export class MyApp extends LitElement {
  @property({ type: Object })
  formConfig = {
    initialValues: { username: '', email: '' },
    fields: [
      { name: 'username', label: '用户名', required: true },
      { name: 'email', label: '邮箱', type: 'email', required: true }
    ]
  }

  render() {
    return html`
      <ldesign-form
        .config="${this.formConfig}"
        @form-submit="${this.handleSubmit}"
      ></ldesign-form>
    `
  }
}
```

## 🔧 开发指南

### 运行所有示例

```bash
# 在项目根目录运行
pnpm run dev:examples
```

这将同时启动三个示例项目：
- 原生 JavaScript 示例: http://localhost:3001
- Vue 3 示例: http://localhost:3002
- Lit Web Components 示例: http://localhost:3003

### 构建所有示例

```bash
# 在项目根目录运行
pnpm run build:examples
```

### 代码规范

1. **只使用库提供的 API**: 不编写自定义表单逻辑
2. **使用设计系统变量**: 确保样式一致性
3. **保持代码简洁**: 专注于展示库的使用方法
4. **完整的注释**: 帮助用户理解代码逻辑

## 🤝 贡献

### 添加新示例

1. 在 `examples/` 目录下创建新的示例项目
2. 遵循现有的项目结构和命名规范
3. 编写完整的 README.md 文档
4. 确保示例能正常运行且无错误

### 改进现有示例

1. 提交 Issue 描述问题或改进建议
2. Fork 项目并创建功能分支
3. 进行修改并确保所有示例正常运行
4. 提交 Pull Request

## 📄 许可证

MIT License

---

更多详细信息请查看各个示例项目的 README.md 文件。
