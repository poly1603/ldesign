# @ldesign/form - 原生 JavaScript 演示项目

这是一个使用原生 JavaScript 和 @ldesign/form 库的演示项目，展示了如何在非 Vue 环境中使用动态表单系统
。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:3001 启动。

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📋 功能演示

### 1. 基础表单演示

- **表单创建**: 使用 `createFormInstance` 创建表单实例
- **数据绑定**: 双向数据绑定和实时状态更新
- **表单验证**: 内置验证规则和自定义验证
- **状态管理**: 表单状态（有效、已修改、已访问）的实时显示

### 2. 高级表单演示

- **条件渲染**: 基于字段值的动态显示控制
- **自定义验证**: 异步验证和复杂验证逻辑
- **动态字段**: 运行时添加和删除字段
- **主题切换**: 运行时主题切换功能

### 3. 表单分组演示

- **分组管理**: 将相关字段组织成逻辑分组
- **分组控制**: 分组展开/折叠、可见性控制
- **分组验证**: 独立的分组验证功能

### 4. API 演示

- **字段操作**: 显示/隐藏、启用/禁用字段
- **状态管理**: 获取和设置表单状态
- **事件监听**: 表单事件的监听和处理
- **数据导出**: 表单数据的导出功能

## 🔧 核心 API 使用

### 创建表单实例

```javascript
import { createFormInstance } from '@ldesign/form/vanilla'

const form = createFormInstance({
  container: '#form-container',
  options: {
    fields: [
      {
        name: 'username',
        title: '用户名',
        component: 'FormInput',
        required: true,
        rules: [{ type: 'required', message: '用户名不能为空' }],
      },
    ],
  },
  onChange: data => {
    console.log('表单数据变化:', data)
  },
  onSubmit: data => {
    console.log('表单提交:', data)
  },
})
```

### 表单操作

```javascript
// 设置表单数据
form.setFormData({
  username: 'john',
  email: 'john@example.com',
})

// 获取表单数据
const data = form.getFormData()

// 验证表单
const isValid = await form.validate()

// 重置表单
form.reset()

// 清空表单
form.clear()
```

### 字段操作

```javascript
// 设置字段值
form.setFieldValue('username', 'newvalue')

// 获取字段值
const value = form.getFieldValue('username')

// 显示/隐藏字段
form.showField('username')
form.hideField('username')

// 启用/禁用字段
form.enableField('username')
form.disableField('username')

// 验证单个字段
const isFieldValid = await form.validateField('username')
```

### 状态管理

```javascript
// 获取表单状态
const state = form.getFormState()
console.log(state.valid) // 表单是否有效
console.log(state.dirty) // 表单是否已修改
console.log(state.touched) // 表单是否已访问

// 获取验证错误
const errors = form.getErrors()
const fieldErrors = form.getFieldErrors('username')
```

### 事件监听

```javascript
// 监听表单变化
form.on('change', (data, fieldName) => {
  console.log('字段变化:', fieldName, data[fieldName])
})

// 监听表单提交
form.on('submit', data => {
  console.log('表单提交:', data)
})

// 监听验证事件
form.on('validate', (valid, errors) => {
  console.log('验证结果:', valid, errors)
})

// 移除事件监听
form.off('change', handler)
```

## 📁 项目结构

```
vanilla-js-demo/
├── src/
│   └── main.js          # 主应用文件
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
├── package.json         # 项目配置
└── README.md           # 项目说明
```

## 🎯 技术特点

- **零框架依赖**: 纯原生 JavaScript，无需 Vue 或其他框架
- **模块化设计**: 使用 ES6 模块和 Vite 构建
- **类型安全**: 支持 TypeScript（可选）
- **响应式设计**: 移动端友好的界面设计
- **完整功能**: 展示 @ldesign/form 的所有核心功能

## 🔗 相关链接

- [@ldesign/form 文档](../../docs/API.md)
- [Vue 演示项目](../vue-demo/)
- [GitHub 仓库](https://github.com/ldesign/form)

## 📝 注意事项

1. 确保已正确安装 @ldesign/form 依赖
2. 项目使用 ES6 模块，需要现代浏览器支持
3. 开发时请确保 Vite 开发服务器正常运行
4. 生产构建前请运行测试确保功能正常

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个演示项目。

## 📄 许可证

MIT License
