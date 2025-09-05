# LDesign Form - Vue 3 示例项目

这是一个完整的 Vue 3 示例项目，展示了如何使用 LDesign Form 的组件和 Composition API hooks。

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 在项目根目录安装依赖
pnpm install

# 进入示例目录
cd packages/form/examples/vue3-demo

# 安装示例项目依赖
pnpm install
```

### 运行项目

```bash
# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 预览构建结果
pnpm preview

# 类型检查
pnpm type-check
```

开发服务器将在 `http://localhost:3001` 启动，自动打开浏览器。

## 📁 项目结构

```
vue3-demo/
├── src/
│   ├── components/           # 自定义组件
│   ├── pages/               # 页面组件
│   │   ├── HomePage.vue     # 首页
│   │   ├── BasicFormPage.vue # 基础表单页面
│   │   ├── ComplexFormPage.vue # 复杂表单页面
│   │   ├── HooksUsagePage.vue # Hooks 用法页面
│   │   └── CustomComponentsPage.vue # 自定义组件页面
│   ├── router/              # 路由配置
│   ├── styles/              # 样式文件
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── public/                  # 静态资源
├── package.json             # 项目配置
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── index.html               # HTML 模板
└── README.md                # 说明文档
```

## 🎯 示例页面

### 1. 首页 (`/`)

项目介绍和导航页面，展示所有可用的示例。

### 2. 基础表单 (`/basic`)

展示 LDesignForm 和 LDesignFormItem 组件的基本用法：

- 基础字段类型（文本、邮箱、数字、单选、多行文本）
- 字段验证和错误显示
- 表单状态管理
- 实时数据预览

### 3. 复杂表单 (`/complex`)

展示高级功能的使用：

- 动态数组字段（FieldArray）
- 条件字段显示
- 嵌套表单结构
- 复杂验证规则

### 4. Hooks 用法 (`/hooks`)

展示如何直接使用 Composition API hooks：

- useForm 的使用
- useField 的使用
- useFieldArray 的使用
- useFormContext 的使用

### 5. 自定义组件 (`/custom`)

展示如何创建和集成自定义组件：

- 自定义输入组件
- 第三方组件库集成
- 组件封装最佳实践

## 🔧 技术栈

- **Vue 3**: 使用 Composition API
- **TypeScript**: 完整的类型支持
- **Vite**: 快速的构建工具
- **Vue Router**: 单页面应用路由
- **LDesign Form**: 表单解决方案

## 📚 核心概念

### 组件用法

```vue
<template>
  <LDesignForm :initial-values="initialValues" @submit="handleSubmit">
    <LDesignFormItem name="name" label="姓名" :required="true">
      <template #default="{ value, setValue }">
        <input :value="value" @input="setValue($event.target.value)" />
      </template>
    </LDesignFormItem>
    <button type="submit">提交</button>
  </LDesignForm>
</template>

<script setup>
import { LDesignForm, LDesignFormItem } from '@ldesign/form'

const initialValues = { name: '' }
const handleSubmit = (data, valid) => {
  console.log('提交:', data, valid)
}
</script>
```

### Hooks 用法

```vue
<template>
  <FormProvider :form="form">
    <input
      :value="nameField.value.value"
      @input="nameField.setValue($event.target.value)"
    />
    <button @click="handleSubmit">提交</button>
  </FormProvider>
</template>

<script setup>
import { useForm, useField, FormProvider } from '@ldesign/form'

const form = useForm({
  initialValues: { name: '' }
})

const nameField = useField('name', {
  form: form.form,
  rules: [{ required: true, message: '姓名是必填项' }]
})

const handleSubmit = async () => {
  const result = await form.submit()
  console.log('提交结果:', result)
}
</script>
```

## 🎨 样式定制

项目使用 LDesign 设计系统的 CSS 变量，可以通过修改 CSS 变量来定制样式：

```css
:root {
  --ldesign-brand-color-6: #your-brand-color;
  --ldesign-border-radius-base: 8px;
  /* 更多变量... */
}
```

## 🔍 开发指南

### 添加新页面

1. 在 `src/pages/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在导航栏中添加链接

### 创建自定义组件

1. 在 `src/components/` 目录下创建组件
2. 使用 LDesign Form 的 hooks 或组件
3. 导出组件供页面使用

### 样式开发

- 使用 LDesign 设计系统的 CSS 变量
- 遵循响应式设计原则
- 保持样式的一致性

## 🧪 测试

```bash
# 运行单元测试（如果有）
pnpm test

# 运行 E2E 测试（如果有）
pnpm test:e2e
```

## 📦 构建部署

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

构建产物将输出到 `dist/` 目录。

## 🤝 贡献

如果您发现问题或有改进建议：

1. 提交 Issue 描述问题
2. Fork 项目并创建分支
3. 提交 Pull Request

## 📄 许可证

MIT © LDesign Team
