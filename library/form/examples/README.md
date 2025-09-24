# @ldesign/form 示例项目

这是一个基于 Vite + Vue 3 的示例项目，展示了 @ldesign/form 的各种功能和用法。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
npm run dev
```

然后在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📖 示例说明

### 1. 首页 (/)
- 项目介绍和特性展示
- 快速开始指南
- 代码示例

### 2. 基础表单 (/basic)
- 基本的表单创建和使用
- 数据绑定和事件处理
- 表单提交和重置
- 实时数据和状态显示

### 3. 验证示例 (/validation)
- **内置验证器**: 展示常用的内置验证规则
  - 必填验证 (required)
  - 邮箱验证 (email)
  - URL验证 (url)
  - 手机号验证 (phone)
  - 数值范围验证 (min/max)
  - 长度验证 (minLength/maxLength)

- **自定义验证器**: 展示如何创建自定义验证逻辑
  - 密码强度验证
  - 确认密码验证
  - 用户名格式验证

- **异步验证**: 展示异步验证功能
  - 模拟服务器端验证
  - 用户名重复检查

### 4. 高级功能 (/advanced)
- **字段联动**: 根据用户选择动态显示/隐藏字段
- **动态表单**: 运行时添加和删除字段
- **状态管理**: 展示表单状态的实时变化

### 5. 适配器示例 (/adapter)
- **Vanilla 适配器**: 使用原生JavaScript适配器
- **手动渲染**: 不使用适配器，手动处理表单
- **核心 API**: 直接使用表单核心API的各种操作

## 🎯 核心特性演示

### 框架无关的设计
```typescript
import { createForm, VanillaAdapter } from '@ldesign/form'

// 创建表单实例（框架无关）
const form = createForm({
  initialValues: { name: '', email: '' },
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    }
  ]
})

// 使用适配器渲染到DOM
const adapter = new VanillaAdapter()
adapter.mount(form, '#form-container')
```

### 强大的验证系统
```typescript
import { custom } from '@ldesign/form'

// 自定义验证器
const passwordValidator = custom((value) => {
  const hasLower = /[a-z]/.test(value)
  const hasUpper = /[A-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  
  if (![hasLower, hasUpper, hasNumber].every(Boolean)) {
    return '密码必须包含大小写字母和数字'
  }
  
  return true
})

// 异步验证器
const asyncValidator = custom(async (value) => {
  const exists = await checkUsernameExists(value)
  return exists ? '用户名已存在' : true
})
```

### 字段联动
```typescript
const form = createForm({
  fields: [
    {
      name: 'userType',
      type: 'select',
      options: [
        { label: '企业用户', value: 'company' },
        { label: '个人用户', value: 'personal' }
      ]
    },
    {
      name: 'companyName',
      type: 'input',
      visible: (values) => values.userType === 'company',
      rules: [
        { 
          type: 'required', 
          condition: (formData) => formData.userType === 'company'
        }
      ]
    }
  ]
})
```

## 🛠️ 技术栈

- **Vue 3**: 响应式UI框架
- **TypeScript**: 类型安全
- **Vite**: 快速构建工具
- **Vue Router**: 路由管理
- **Less**: CSS预处理器
- **@ldesign/form**: 表单组件库

## 📁 项目结构

```
examples/
├── src/
│   ├── views/           # 示例页面
│   │   ├── Home.vue           # 首页
│   │   ├── BasicForm.vue      # 基础表单
│   │   ├── ValidationExample.vue  # 验证示例
│   │   ├── AdvancedForm.vue   # 高级功能
│   │   └── AdapterExample.vue # 适配器示例
│   ├── styles/          # 样式文件
│   ├── App.vue          # 主应用组件
│   ├── main.ts          # 应用入口
│   └── routes.ts        # 路由配置
├── index.html           # HTML模板
├── package.json         # 项目配置
├── vite.config.ts       # Vite配置
└── tsconfig.json        # TypeScript配置
```

## 🎨 样式系统

项目使用 LDESIGN 设计系统的 CSS 变量，支持主题定制：

```less
// 使用设计系统变量
.form-field {
  padding: var(--ls-padding-base);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
}
```

## 🔧 开发说明

### 添加新示例

1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/routes.ts` 中添加路由配置
3. 在导航菜单中添加链接

### 调试技巧

- 使用浏览器开发者工具查看表单状态
- 查看控制台输出的表单数据和验证结果
- 使用 Vue DevTools 调试组件状态

## 📚 相关文档

- [API 文档](../docs/api.md)
- [架构设计](../docs/architecture.md)
- [迁移指南](../docs/migration-guide.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进示例项目！
