# @ldesign/form Vue3 简洁演示

这是一个简洁的 `@ldesign/form` Vue3 示例项目，采用左右布局：左侧配置面板，右侧表单展示。

## 🎯 项目概述

`@ldesign/form` 是一个功能强大、类型安全的 Vue 3 动态表单系统，支持：

- 🚀 **多种使用方式**: Vue 组件、Composition API Hook 和原生 JavaScript
- 📝 **动态表单**: 基于配置生成表单，支持复杂的表单结构
- 🔧 **类型安全**: 完整的 TypeScript 支持
- ✅ **强大验证**: 内置多种验证规则，支持自定义验证器
- 📱 **响应式布局**: 自适应网格布局，支持多种屏幕尺寸
- 🎨 **主题定制**: 支持主题切换和深度样式定制
- 🔄 **条件渲染**: 支持字段的条件显示和动态配置
- 📊 **状态管理**: 完整的表单状态管理

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

### 访问示例

打开浏览器访问 `http://localhost:3001`

## 🎛️ 简洁演示界面

这个示例采用简洁的左右布局设计：

### 📋 左侧配置面板

- **布局设置**:
  - 列数调节（1-4 列）
  - 间距调节（8-32px）
- **显示设置**:
  - 显示/隐藏验证
  - 显示/隐藏标签
- **操作按钮**:
  - 填充示例数据
- **实时数据预览**:
  - JSON 格式显示当前表单数据

### 📝 右侧表单展示

- **100%宽度**: 完全利用可用空间
- **响应式布局**: 根据配置自动调整列数
- **实时更新**: 配置变更立即生效

### 📝 表单字段展示

包含多种常用表单组件：

#### 基础字段

- **姓名**: 文本输入（必填）
- **邮箱**: 邮箱输入（必填，格式验证）
- **手机号**: 电话输入
- **性别**: 单选按钮组

#### 工作信息

- **公司**: 文本输入
- **职位**: 文本输入
- **技能**: 多行文本（跨列显示）

#### 偏好设置

- **远程工作**: 开关组件

#### 条件渲染

- **联系方式**: 单选按钮组
- **微信号**: 条件显示（当选择微信时显示）

#### 协议确认

- **用户协议**: 复选框（必填）

## 🧪 测试功能

### 响应式布局测试

1. **调整浏览器窗口宽度** - 观察表单自动调整列数
2. **使用列数滑块** - 手动控制表单列数（1-4 列）
3. **调整默认行数** - 测试展开收起功能
4. **移动端适配** - 在不同设备上测试响应式效果

### 条件渲染测试

1. **选择不同联系方式** - 观察对应字段的显示/隐藏
2. **切换工作类型** - 查看作品集字段的条件显示
3. **实时状态更新** - 在字段状态面板中观察变化

### 表单验证测试

1. **必填字段验证** - 尝试提交空的必填字段
2. **格式验证** - 输入错误的邮箱、手机号格式
3. **自定义验证** - 测试用户协议的自定义验证规则
4. **实时验证** - 观察输入时的即时验证反馈

### 数据管理测试

1. **填充示例数据** - 测试批量数据填充
2. **手动验证** - 触发完整表单验证
3. **重置功能** - 测试表单重置功能
4. **数据监听** - 观察表单数据的实时变化

## 🔧 核心 API

### DynamicForm 组件

```vue
<template>
  <DynamicForm
    ref="formRef"
    v-model="formData"
    :options="formOptions"
    @submit="handleSubmit"
    @change="handleChange"
    @validate="handleValidate"
  />
</template>
```

### 表单配置示例

```typescript
const formOptions: FormOptions = {
  fields: [
    {
      name: 'name',
      title: '姓名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入您的姓名',
      rules: [
        { required: true, message: '姓名不能为空' },
        { min: 2, max: 20, message: '姓名长度应在2-20个字符之间' },
      ],
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      required: true,
      placeholder: '请输入邮箱地址',
      props: { type: 'email' },
      rules: [
        { required: true, message: '邮箱不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    {
      name: 'skills',
      title: '技能描述',
      component: 'FormTextarea',
      span: 'full', // 跨列显示
      placeholder: '请描述您的专业技能和特长',
      props: { rows: 3 },
    },
    {
      name: 'wechat',
      title: '微信号',
      component: 'FormInput',
      placeholder: '请输入微信号',
      showWhen: {
        // 条件渲染
        field: 'contactMethod',
        value: 'wechat',
      },
    },
  ],
  layout: {
    columns: 3, // 默认3列
    minColumns: 1, // 最小1列
    maxColumns: 4, // 最大4列
    defaultRows: 3, // 默认显示3行
    horizontalGap: 20,
    verticalGap: 16,
    label: {
      position: 'top',
      align: 'left',
    },
    button: {
      position: 'follow-last-row',
      align: 'right',
      expand: {
        expandText: '展开更多字段',
        collapseText: '收起字段',
      },
    },
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorMessage: true,
  },
}
```

## 🎨 支持的字段类型

- `FormInput` - 文本输入（支持各种 type）
- `FormTextarea` - 多行文本
- `FormSelect` - 下拉选择
- `FormRadio` - 单选按钮组
- `FormCheckbox` - 复选框组
- `FormSwitch` - 开关切换
- `FormDatePicker` - 日期选择器
- `FormTimePicker` - 时间选择器
- `FormSlider` - 滑块
- `FormRate` - 评分组件

## 🔍 验证规则

### 内置验证规则

- `required` - 必填验证
- `min/max` - 长度或数值范围
- `pattern` - 正则表达式验证
- `type` - 类型验证（email, url, number 等）

### 自定义验证器

```typescript
{
  validator: (value: any, formData: FormData) => {
    return value === formData.password
  },
  message: '两次输入的密码不一致'
}
```

## 📱 响应式布局特性

### 自动列计算

- 根据容器宽度自动计算最佳列数
- 支持设置最小和最大列数限制
- 字段可以设置跨列显示（span: 'full'）

### 展开收起功能

- 设置默认显示行数
- 超出部分自动隐藏，可展开查看
- 自定义展开/收起按钮文本

### 响应式断点

- 大屏幕：自动适配多列布局
- 中等屏幕：减少列数保持可读性
- 小屏幕：自动切换为单列布局

## 🎯 条件渲染功能

### 简单条件

```typescript
showWhen: {
  field: 'userType',
  value: 'student'
}
```

### 支持的操作符

- `equals` - 等于（默认）
- `not-equals` - 不等于
- `includes` - 包含（数组）
- `not-includes` - 不包含（数组）

### 复杂条件

```typescript
showWhen: {
  field: 'education',
  value: 'highschool',
  operator: 'not-equals'
}
```

## 🛠️ 开发

### 项目结构

```
src/
├── App.vue             # 综合功能演示主应用
├── main.ts             # 入口文件
└── style.css           # 基础样式
```

### 构建

```bash
pnpm run build
```

### 测试

```bash
pnpm run test
```

## 💡 使用技巧

### 1. 响应式布局测试

- 拖拽浏览器窗口边缘调整宽度
- 使用开发者工具模拟不同设备
- 观察列数的自动调整效果

### 2. 条件渲染调试

- 在字段状态面板中观察字段显示状态
- 修改触发条件的字段值
- 查看事件日志了解触发过程

### 3. 表单验证调试

- 使用手动验证按钮测试整体验证
- 观察实时验证反馈
- 在控制台查看详细错误信息

### 4. 性能优化建议

- 合理设置默认行数，避免一次渲染过多字段
- 使用条件渲染减少不必要的字段渲染
- 适当设置验证时机（onChange vs onBlur）

## 🔧 自定义配置

### 修改布局参数

```typescript
layout: {
  columns: 4,           // 调整默认列数
  minColumns: 2,        // 设置最小列数
  maxColumns: 6,        // 设置最大列数
  defaultRows: 2,       // 调整默认显示行数
  horizontalGap: 24,    // 调整水平间距
  verticalGap: 20       // 调整垂直间距
}
```

### 添加新字段

```typescript
{
  name: 'newField',
  title: '新字段',
  component: 'FormInput',
  placeholder: '请输入内容',
  // 可选配置
  required: true,
  span: 'full',
  showWhen: { field: 'condition', value: 'show' },
  rules: [{ required: true, message: '不能为空' }]
}
```

### 自定义验证规则

```typescript
{
  validator: (value, formData) => {
    // 自定义验证逻辑
    return value.length >= 6
  },
  message: '长度至少6个字符'
}
```

## 📚 相关资源

- [Form 包源码](../src/)
- [类型定义](../src/types/)
- [组件文档](../src/components/)
- [工具函数](../src/utils/)

## 🐛 问题排查

### 常见问题

1. **字段不显示**

   - 检查 `showWhen` 条件是否正确
   - 确认字段名称拼写无误
   - 查看字段状态面板确认显示状态

2. **验证不生效**

   - 检查验证规则配置
   - 确认 `validateOnChange` 或 `validateOnBlur` 设置
   - 查看控制台错误信息

3. **布局异常**

   - 检查容器宽度设置
   - 确认 `columns` 和 `span` 配置
   - 测试不同屏幕尺寸

4. **条件渲染不工作**
   - 检查依赖字段的值类型
   - 确认操作符使用正确
   - 查看事件日志确认触发时机

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

---

**注意**: 这是一个演示项目，主要用于测试和展示 `@ldesign/form` 的功能。在生产环境中使用时，请根据实
际需求进行适当的配置和优化。
