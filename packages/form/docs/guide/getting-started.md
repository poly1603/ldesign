# 快速开始

本指南将帮助您快速上手 @ldesign/form，在几分钟内创建您的第一个表单。

## 安装

### 使用包管理器

::: code-group

```bash [pnpm]
pnpm add @ldesign/form
```

```bash [npm]
npm install @ldesign/form
```

```bash [yarn]
yarn add @ldesign/form
```

:::

### CDN

您也可以通过 CDN 直接使用：

```html
<script src="https://unpkg.com/@ldesign/form"></script>
```

## 基础使用

### 1. Vue 3 组件方式

#### 导入组件和样式

```vue
<script setup lang="ts">
import { useForm } from '@ldesign/form';
import { required, email } from '@ldesign/form/validators';
import {
  LDesignForm,
  LDesignFormItem,
  LDesignInput,
  LDesignButton
} from '@ldesign/form/vue';
import '@ldesign/form/styles/index.css';
</script>
```

#### 创建表单实例

```vue
<script setup lang="ts">
const form = useForm({
  initialValues: {
    username: '',
    email: '',
    gender: ''
  }
});

const handleSubmit = (result: any) => {
  if (result.valid) {
    console.log('提交成功:', result.data);
  } else {
    console.log('验证失败:', result.validation);
  }
};
</script>
```

#### 使用表单组件

```vue
<template>
  <div class="form-container">
    <h2>用户注册</h2>
    <LDesignForm :form="form" @submit="handleSubmit">
      <LDesignFormItem
        name="username"
        label="用户名"
        :rules="[
          { validator: required() },
          { validator: length({ min: 3, message: '用户名至少3个字符' }) }
        ]"
      >
        <LDesignInput
          v-model="form.data.username"
          placeholder="请输入用户名"
        />
      </LDesignFormItem>

      <LDesignFormItem
        name="email"
        label="邮箱"
        :rules="[
          { validator: required() },
          { validator: email() }
        ]"
      >
        <LDesignInput
          v-model="form.data.email"
          type="email"
          placeholder="请输入邮箱地址"
        />
      </LDesignFormItem>

      <LDesignFormItem name="gender" label="性别">
        <select v-model="form.data.gender">
          <option value="">请选择性别</option>
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
      </LDesignFormItem>

      <LDesignFormItem>
        <LDesignButton type="primary" html-type="submit">
          提交
        </LDesignButton>
        <LDesignButton html-type="reset">
          重置
        </LDesignButton>
      </LDesignFormItem>
    </LDesignForm>
  </div>
</template>
```

### 2. 纯 JavaScript 方式

如果您不使用 Vue，也可以直接使用核心 API：

```javascript
import { createForm } from '@ldesign/form';
import { required, email, length } from '@ldesign/form/validators';

// 创建表单实例
const form = createForm({
  initialValues: {
    username: '',
    email: '',
    gender: ''
  }
});

// 添加验证规则
form.getField('username').addRule({ validator: required() });
form.getField('username').addRule({
  validator: length({ min: 3, message: '用户名至少3个字符' })
});

form.getField('email').addRule({ validator: required() });
form.getField('email').addRule({ validator: email() });

// 设置值
form.setFieldValue('username', 'john');
form.setFieldValue('email', 'john@example.com');

// 验证表单
const result = await form.validate();
if (result.valid) {
  console.log('验证通过，可以提交');
  // 提交表单
  const submitResult = await form.submit();
  console.log('提交结果:', submitResult);
} else {
  console.log('验证失败:', result.errors);
}
```

### 完整示例

::: details 查看完整 Vue 3 代码

```vue
<template>
  <div class="form-container">
    <h2>用户注册</h2>
    <LDesignForm :form="form" @submit="handleSubmit">
      <LDesignFormItem
        name="username"
        label="用户名"
        :rules="[
          { validator: required() },
          { validator: length({ min: 3, message: '用户名至少3个字符' }) }
        ]"
      >
        <LDesignInput
          v-model="form.data.username"
          placeholder="请输入用户名"
        />
      </LDesignFormItem>

      <LDesignFormItem
        name="email"
        label="邮箱"
        :rules="[
          { validator: required() },
          { validator: email() }
        ]"
      >
        <LDesignInput
          v-model="form.data.email"
          type="email"
          placeholder="请输入邮箱地址"
        />
      </LDesignFormItem>

      <LDesignFormItem name="gender" label="性别">
        <select v-model="form.data.gender" class="form-select">
          <option value="">请选择性别</option>
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
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

    <!-- 表单数据预览 -->
    <div class="form-preview">
      <h3>表单数据</h3>
      <pre>{{ JSON.stringify(form.data, null, 2) }}</pre>
    </div>
  </div>
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
import '@ldesign/form/styles/index.css';

const form = useForm({
  initialValues: {
    username: '',
    email: '',
    gender: ''
  }
});

const handleSubmit = (result: any) => {
  if (result.valid) {
    console.log('提交成功:', result.data);
    alert('提交成功！');
  } else {
    console.log('验证失败:', result.validation);
    alert('请检查表单输入！');
  }
};
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-select {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-preview {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.form-preview h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
}

.form-preview pre {
  background-color: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  margin: 0;
}
</style>
```

:::

## 高级用法

### 使用 Composition API

@ldesign/form 提供了强大的 Composition API，让您可以更灵活地控制表单：

```vue
<script setup lang="ts">
import { useForm, useField } from '@ldesign/form';
import { required, email } from '@ldesign/form/validators';

// 创建表单实例
const form = useForm({
  initialValues: {
    username: '',
    email: ''
  }
});

// 创建单个字段
const usernameField = useField({
  name: 'username',
  form,
  rules: [{ validator: required() }]
});

// 手动验证表单
const handleValidate = async () => {
  const result = await form.validate();
  console.log('表单是否有效:', result.valid);
  if (!result.valid) {
    console.log('验证错误:', result.errors);
  }
};

// 设置字段值
const setUsername = () => {
  form.setFieldValue('username', 'newuser');
};

// 获取字段值
const getUsername = () => {
  const username = form.getFieldValue('username');
  console.log('用户名:', username);
};

// 重置表单
const resetForm = () => {
  form.reset();
};

// 监听字段变化
form.getField('username').onChange((value) => {
  console.log('用户名变化:', value);
});
</script>
```

### 自定义验证器

您可以创建自定义验证器来满足特定的业务需求：

```javascript
// 异步验证器示例
const checkUsernameAvailable = async (value) => {
  if (!value) return { valid: true, message: '' };

  try {
    const response = await fetch(`/api/check-username?username=${value}`);
    const result = await response.json();

    if (result.exists) {
      return { valid: false, message: '用户名已存在' };
    }
    return { valid: true, message: '' };
  } catch (error) {
    return { valid: false, message: '验证失败，请重试' };
  }
};

// 依赖其他字段的验证器
const confirmPasswordValidator = (value, context) => {
  const password = context.form.getFieldValue('password');
  if (value !== password) {
    return { valid: false, message: '两次输入的密码不一致' };
  }
  return { valid: true, message: '' };
};

// 使用自定义验证器
form.getField('username').addRule({ validator: checkUsernameAvailable });
form.getField('confirmPassword').addRule({ validator: confirmPasswordValidator });
```

## 下一步

现在您已经成功创建了第一个 @ldesign/form 表单！接下来您可以：

- [API 文档](/API) - 查看完整的 API 参考
- [使用指南](/USAGE) - 学习更多高级用法和最佳实践
- [TSX 组件](/TSX_COMPONENTS) - 了解如何使用 TSX 组件
- [查看示例](http://localhost:5173/) - 浏览实际运行的示例

## 常见问题

### 如何处理表单提交？

```javascript
const handleSubmit = async (result) => {
  if (!result.valid) {
    console.log('验证失败:', result.validation);
    return;
  }

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });

    if (response.ok) {
      console.log('提交成功');
    } else {
      console.log('提交失败');
    }
  } catch (error) {
    console.error('提交错误:', error);
  }
};
```

### 如何动态添加/删除字段？

```javascript
// 动态添加字段到表单数据
form.setFieldValue('newField', 'defaultValue');

// 动态删除字段
delete form.data.fieldToRemove;

// 对于数组字段
form.data.items.push('新项目');
form.data.items.splice(index, 1); // 删除指定索引的项目
```

### 如何自定义样式？

@ldesign/form 使用 CSS 变量进行样式定制：

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-border-color: #d9d9d9;
  --ldesign-text-color-primary: rgba(0, 0, 0, 90%);
  /* 更多变量请参考样式文档 */
}
```
