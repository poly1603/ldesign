# @ldesign/form - Vue 3 演示项目

这是一个使用 Vue 3 + TypeScript 和 @ldesign/form 库的演示项目，展示了如何在 Vue 应用中使用动态表单系
统。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:3002 启动。

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 类型检查

```bash
npm run type-check
```

## 📋 功能演示

### 1. 基础表单演示

- **Vue 组件方式**: 使用 `<DynamicForm>` 组件的标准用法
- **Composition API 方式**: 使用 `useForm` Hook 获得更多控制能力
- **数据绑定**: v-model 双向数据绑定和响应式状态
- **表单验证**: 内置验证规则和自定义验证
- **事件处理**: 表单提交、字段变化等事件

### 2. 高级表单演示

- **条件渲染**: 基于字段值的动态显示控制
- **异步验证**: 模拟服务器端验证（如用户名重复检查）
- **自定义验证**: 复杂的验证逻辑和跨字段验证
- **动态字段**: 运行时添加和删除字段
- **数据导出**: 表单数据的导出功能

### 3. 表单分组演示

- **分组管理**: 将相关字段组织成逻辑分组
- **分组控制**: 分组展开/折叠、可见性控制
- **分组验证**: 独立的分组验证功能
- **复杂结构**: 多层级的表单结构组织

### 4. 主题系统演示

- **多种主题**: 9 种预设主题的实时切换
- **主题预览**: 所有主题的视觉效果预览
- **主题配置**: 主题参数的动态配置
- **响应式主题**: 主题在不同设备上的适配

## 🔧 核心 API 使用

### Vue 组件方式

```vue
<template>
  <DynamicForm
    v-model="formData"
    :options="formOptions"
    @submit="handleSubmit"
    @field-change="handleFieldChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'
import type { FormOptions } from '@ldesign/form'

const formData = ref({})
const formOptions: FormOptions = {
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true,
      rules: [{ type: 'required', message: '用户名不能为空' }],
    },
  ],
}

const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
}
</script>
```

### Composition API 方式

```vue
<template>
  <div>
    <!-- 渲染表单 -->
    <component :is="form.renderForm()" />

    <!-- 表单状态 -->
    <div>
      <p>有效: {{ form.formState.valid }}</p>
      <p>已修改: {{ form.formState.dirty }}</p>
      <p>数据: {{ form.formData }}</p>
    </div>

    <!-- 操作按钮 -->
    <button @click="form.submit()">提交表单</button>
    <button @click="form.reset()">重置表单</button>
    <button @click="form.validate()">验证表单</button>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form'

const form = useForm({
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true,
    },
  ],
})

// 监听表单事件
form.on('submit', data => {
  console.log('表单提交:', data)
})

form.on('change', (data, fieldName) => {
  console.log('字段变化:', fieldName, data[fieldName])
})

// 字段操作
const toggleField = () => {
  const isVisible = form.isFieldVisible('username')
  if (isVisible) {
    form.hideField('username')
  } else {
    form.showField('username')
  }
}
</script>
```

### 高级功能配置

```typescript
// 条件渲染
{
  name: 'company',
  title: '公司名称',
  component: 'FormInput',
  conditionalRender: {
    dependsOn: 'hasJob',
    condition: (values) => values.hasJob === true
  }
}

// 异步验证
{
  name: 'username',
  title: '用户名',
  component: 'FormInput',
  rules: [
    {
      type: 'custom',
      validator: async (value) => {
        const response = await checkUsernameAvailable(value)
        return response.available || '用户名已存在'
      }
    }
  ]
}

// 分组配置
{
  groups: [
    {
      name: 'personal',
      title: '个人信息',
      collapsible: true,
      collapsed: false,
      fields: [
        // ... 字段配置
      ]
    }
  ]
}

// 主题配置
{
  theme: 'dark', // 或者使用主题对象
  // theme: {
  //   name: 'custom',
  //   colors: {
  //     primary: '#1890ff'
  //   }
  // }
}
```

## 📁 项目结构

```
vue-demo/
├── src/
│   ├── components/          # 演示组件
│   │   ├── BasicFormDemo.vue      # 基础表单演示
│   │   ├── ComposableDemo.vue     # Composition API 演示
│   │   ├── AdvancedFormDemo.vue   # 高级功能演示
│   │   ├── GroupedFormDemo.vue    # 分组表单演示
│   │   └── ThemeDemo.vue          # 主题系统演示
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 应用入口
│   └── style.css            # 全局样式
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── package.json             # 项目配置
└── README.md               # 项目说明
```

## 🎯 技术特点

- **Vue 3 + TypeScript**: 现代化的 Vue 开发体验
- **Composition API**: 充分利用 Vue 3 的 Composition API
- **类型安全**: 完整的 TypeScript 类型支持
- **响应式设计**: 移动端友好的界面设计
- **模块化组件**: 清晰的组件结构和代码组织
- **实时预览**: 所有功能的实时演示和预览

## 🔗 相关链接

- [@ldesign/form 文档](../../docs/API.md)
- [原生 JavaScript 演示项目](../vanilla-js-demo/)
- [GitHub 仓库](https://github.com/ldesign/form)

## 📝 注意事项

1. 确保已正确安装 @ldesign/form 依赖
2. 项目使用 TypeScript，需要支持 TS 的开发环境
3. 开发时请确保 Vite 开发服务器正常运行
4. 生产构建前请运行类型检查确保代码正确性

## 🎨 自定义主题

项目演示了如何使用和自定义主题：

```typescript
import { getPresetTheme, createCustomTheme } from '@ldesign/form'

// 使用预设主题
const darkTheme = getPresetTheme('dark')

// 创建自定义主题
const customTheme = createCustomTheme({
  name: 'custom',
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
  },
  typography: {
    fontSize: {
      base: '16px',
    },
  },
})
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个演示项目。

## 📄 许可证

MIT License
