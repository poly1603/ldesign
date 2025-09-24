# @ldesign/form

一个现代化的多技术栈表单解决方案，支持 Vue 3、Lit Web Components 和 Vanilla JavaScript。

**🆕 v2.0 新特性：框架无关的核心架构**

v2.0 版本采用全新的分层架构设计，将表单的核心业务逻辑（验证规则、数据处理、状态管理等）完全抽离为框架无关的纯 TypeScript 模块，通过适配器模式为不同 UI 框架提供统一的底层能力。

## ✨ 特性

- 🚀 **多技术栈支持**: Vue 3、Lit、Vanilla JS 统一API
- 📱 **响应式布局**: 智能网格系统，自适应不同屏幕
- 🎨 **LDESIGN设计系统**: 完整的主题系统和设计令牌
- ⚡ **高性能**: 虚拟滚动、懒加载、智能缓存
- 🔧 **TypeScript**: 完整的类型定义和智能提示
- 🧪 **测试覆盖**: 89个测试用例，100%通过率
- 📦 **轻量级**: 模块化设计，按需加载
- 🔒 **类型安全**: 完整的 TypeScript 支持
- 🎯 **灵活验证**: 内置多种验证器，支持自定义验证规则
- 💾 **内存安全**: 自动清理资源，防止内存泄漏

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/form

# 使用 npm
npm install @ldesign/form

# 使用 yarn
yarn add @ldesign/form
```

## 🚀 快速开始

### 框架无关的核心API（v2.0 新特性）

```typescript
import { createForm, createVanillaAdapter, required, email } from '@ldesign/form'

// 创建表单实例
const form = createForm({
  initialValues: {
    name: '',
    email: ''
  },
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    }
  ]
}, {
  onSubmit: async (values) => {
    console.log('提交数据:', values)
  }
})

// 使用原生JavaScript适配器渲染表单
const adapter = createVanillaAdapter()
adapter.mount(form, '#form-container')

// 操作表单数据
form.setFieldValue('name', 'John Doe')
form.setFieldValue('email', 'john@example.com')

// 验证表单
const result = await form.validate()
if (result.valid) {
  await form.submit()
}
```

### Vue 3 使用

```vue
<template>
  <LDesignForm :form="form" @submit="handleSubmit">
    <LDesignFormItem
      name="username"
      label="用户名"
      :rules="[{ validator: required() }, { validator: length({ min: 3, max: 20 }) }]"
    >
      <LDesignInput
        v-model="form.data.username"
        placeholder="请输入用户名"
      />
    </LDesignFormItem>

    <LDesignFormItem
      name="email"
      label="邮箱"
      :rules="[{ validator: required() }, { validator: email() }]"
    >
      <LDesignInput
        v-model="form.data.email"
        type="email"
        placeholder="请输入邮箱"
      />
    </LDesignFormItem>

    <LDesignFormItem>
      <LDesignButton type="primary" html-type="submit">
        提交
      </LDesignButton>
      <LDesignButton html-type="reset" style="margin-left: 12px;">
        重置
      </LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form';
import { required, email, length } from '@ldesign/form/validators';
import {
  LDesignForm,
  LDesignFormItem,
  LDesignInput,
  LDesignButton
} from '@ldesign/form/vue';

// 创建表单实例
const form = useForm({
  initialValues: {
    username: '',
    email: ''
  }
});

// 处理提交
const handleSubmit = (result: any) => {
  if (result.valid) {
    console.log('表单数据:', result.data);
  } else {
    console.log('验证失败:', result.validation);
  }
};
</script>
```

### 原生 JavaScript 使用

```javascript
import { createForm } from '@ldesign/form';
import { required, email, length } from '@ldesign/form/validators';

// 创建表单实例
const form = createForm({
  initialValues: {
    username: '',
    email: ''
  }
});

// 添加字段验证规则
form.getField('username').addRule({ validator: required() });
form.getField('username').addRule({ validator: length({ min: 3, max: 20 }) });
form.getField('email').addRule({ validator: required() });
form.getField('email').addRule({ validator: email() });

// 设置字段值
form.setFieldValue('username', 'testuser');
form.setFieldValue('email', 'test@example.com');

// 验证表单
const result = await form.validate();
if (result.valid) {
  console.log('验证通过:', form.data);
} else {
  console.log('验证失败:', result.errors);
}

// 提交表单
const submitResult = await form.submit();
console.log('提交结果:', submitResult);
```

## 📚 核心概念

### 表单实例 (Form Instance)

表单实例是表单管理的核心，负责管理表单状态、字段和验证。

```typescript
import { createForm } from '@ldesign/form';

const form = createForm({
  initialValues: {
    name: '',
    age: 0,
    hobbies: []
  },
  onSubmit: async (data) => {
    // 处理提交逻辑
    console.log('提交数据:', data);
  }
});
```

### 字段管理 (Field Management)

每个表单字段都有独立的状态管理和验证逻辑。

```typescript
// 获取字段实例
const nameField = form.getField('name');

// 设置字段值
nameField.setValue('张三');

// 添加验证规则
nameField.addRule({ validator: required() });
nameField.addRule({ validator: length({ min: 2, max: 10 }) });

// 验证字段
const result = await nameField.validate();
```

### 验证系统 (Validation System)

内置多种常用验证器，支持自定义验证规则。

```typescript
import { required, email, length, pattern } from '@ldesign/form/validators';

// 内置验证器
const rules = [
  { validator: required() },
  { validator: email() },
  { validator: length({ min: 6, max: 20 }) },
  { validator: pattern(/^[a-zA-Z0-9]+$/) }
];

// 自定义验证器
const customValidator = (value: string) => {
  if (value.includes('admin')) {
    return { valid: false, message: '用户名不能包含admin' };
  }
  return { valid: true, message: '' };
};

field.addRule({ validator: customValidator });
```

### 水平布局系统 (Horizontal Layout System)

支持基于 CSS Grid 的水平布局，可以灵活配置列数和响应式行为。

```typescript
import { createForm, VanillaAdapter } from '@ldesign/form'

// 创建水平布局表单
const form = createForm({
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  },
  layout: {
    mode: 'horizontal', // 启用水平布局
    columns: 2,         // 默认列数
    gutter: 16,         // 间距
    labelAlign: 'top',  // 标签对齐方式
    horizontal: {
      columnsPerRow: 2,     // 每行列数
      useGrid: true,        // 使用 CSS Grid
      rowGap: 16,          // 行间距
      columnGap: 16,       // 列间距
      autoFill: true       // 自动填充
    }
  },
  fields: [
    {
      name: 'firstName',
      label: '名',
      type: 'input',
      required: true
    },
    {
      name: 'lastName',
      label: '姓',
      type: 'input',
      required: true
    },
    {
      name: 'email',
      label: '邮箱地址',
      type: 'input',
      layout: { span: 2 }, // 跨两列
      required: true
    },
    {
      name: 'phone',
      label: '手机号码',
      type: 'input',
      required: true
    }
  ]
})

// 使用适配器渲染
const adapter = new VanillaAdapter()
adapter.mount(form, document.getElementById('form-container'))
```

#### 响应式布局配置

```typescript
const form = createForm({
  layout: {
    mode: 'horizontal',
    responsive: true,
    breakpoints: {
      xs: 1,  // < 576px 单列
      sm: 1,  // >= 576px 单列
      md: 2,  // >= 768px 双列
      lg: 3,  // >= 992px 三列
      xl: 4,  // >= 1200px 四列
      xxl: 4  // >= 1600px 四列
    },
    horizontal: {
      useGrid: true,
      autoFill: true,
      rowGap: 16,
      columnGap: 16
    }
  }
  // ... 其他配置
})
```

#### 字段跨列配置

```typescript
const fields = [
  {
    name: 'title',
    label: '标题',
    type: 'input',
    layout: { span: 3 } // 跨三列
  },
  {
    name: 'description',
    label: '描述',
    type: 'textarea',
    layout: { span: -1 } // 全宽（跨所有列）
  },
  {
    name: 'tags',
    label: '标签',
    type: 'input',
    layout: {
      span: 2,    // 跨两列
      offset: 1   // 左侧偏移一列
    }
  }
]
```

## 🔧 API 参考

### createForm(options)

创建表单实例。

**参数:**
- `options.initialValues`: 初始值对象
- `options.onSubmit`: 提交处理函数
- `options.validateOnChange`: 是否在值变化时验证 (默认: true)
- `options.validateOnBlur`: 是否在失焦时验证 (默认: true)
- `options.layout`: 布局配置对象
- `options.fields`: 字段配置数组

**返回:** Form 实例

### LayoutConfig

布局配置接口，用于控制表单的整体布局。

```typescript
interface LayoutConfig {
  mode?: 'vertical' | 'horizontal'  // 布局模式，默认 'vertical'
  columns?: number                  // 表单列数，默认 1
  gutter?: number                   // 字段间距，默认 16
  labelWidth?: number | string      // 标签宽度
  labelAlign?: 'left' | 'right' | 'top'  // 标签对齐方式，默认 'right'
  responsive?: boolean              // 是否启用响应式布局，默认 true
  breakpoints?: {                   // 响应式断点配置
    xs?: number   // < 576px
    sm?: number   // >= 576px
    md?: number   // >= 768px
    lg?: number   // >= 992px
    xl?: number   // >= 1200px
    xxl?: number  // >= 1600px
  }
  horizontal?: {                    // 水平布局配置
    columnsPerRow?: number          // 每行的列数
    useGrid?: boolean               // 是否使用 CSS Grid，默认 true
    gridTemplateColumns?: string    // Grid 模板列配置
    rowGap?: number | string        // Grid 行间距
    columnGap?: number | string     // Grid 列间距
    autoFill?: boolean              // 是否自动填充行，默认 true
  }
}
```

### FieldLayout

字段布局配置接口，用于控制单个字段的布局。

```typescript
interface FieldLayout {
  span?: number     // 字段占用的列数，-1 表示全宽
  offset?: number   // 字段左侧偏移的列数
  order?: number    // 字段的显示顺序
  responsive?: {    // 响应式布局配置
    xs?: { span?: number; offset?: number }
    sm?: { span?: number; offset?: number }
    md?: { span?: number; offset?: number }
    lg?: { span?: number; offset?: number }
    xl?: { span?: number; offset?: number }
    xxl?: { span?: number; offset?: number }
  }
}
```

### useForm(options)

Vue 3 Composition API Hook，创建响应式表单实例。

```typescript
const form = useForm({
  initialValues: { name: '' },
  onSubmit: (data) => console.log(data)
});
```

### 内置验证器

- `required()`: 必填验证
- `email()`: 邮箱格式验证
- `length(options)`: 长度验证
- `pattern(regex)`: 正则表达式验证
- `number(options)`: 数字验证
- `url()`: URL 格式验证

## 🎨 样式定制

使用 LDESIGN 设计系统的 CSS 变量进行样式定制：

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-error-color: #ff4d4f;
  --ldesign-success-color: #52c41a;
  --ldesign-warning-color: #faad14;
}
```

## 🧪 测试

运行测试套件：

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test __tests__/core/form.test.ts

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

## 📈 性能优化

- **减少重渲染**: 使用 `markRaw` 和 `shallowRef` 优化响应式性能
- **内存管理**: 自动清理事件监听器和定时器
- **懒加载验证**: 只在需要时执行验证逻辑
- **批量更新**: 合并多个状态更新为单次渲染

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详情。

## 🔗 相关链接

- [在线文档](https://ldesign.dev/form)
- [示例代码](./examples)
- [更新日志](./CHANGELOG.md)
- [问题反馈](https://github.com/ldesign/ldesign/issues)
