# 使用指南

## 快速开始

### 安装

```bash
pnpm add @ldesign/form
```

### 基础用法

#### 1. 创建简单表单

```javascript
import { createForm } from '@ldesign/form';
import { required, email } from '@ldesign/form/validators';

// 创建表单实例
const form = createForm({
  initialValues: {
    username: '',
    email: ''
  }
});

// 添加验证规则
form.getField('username').addRule({ validator: required() });
form.getField('email').addRule({ validator: required() });
form.getField('email').addRule({ validator: email() });

// 设置值
form.setFieldValue('username', 'john');
form.setFieldValue('email', 'john@example.com');

// 验证表单
const result = await form.validate();
if (result.valid) {
  console.log('验证通过');
} else {
  console.log('验证失败:', result.errors);
}
```

#### 2. Vue 3 组件用法

```vue
<template>
  <LDesignForm :form="form" @submit="handleSubmit">
    <LDesignFormItem
      name="username"
      label="用户名"
      :rules="[{ validator: required() }]"
    >
      <LDesignInput v-model="form.data.username" />
    </LDesignFormItem>

    <LDesignFormItem
      name="email"
      label="邮箱"
      :rules="[{ validator: required() }, { validator: email() }]"
    >
      <LDesignInput v-model="form.data.email" type="email" />
    </LDesignFormItem>

    <LDesignFormItem>
      <LDesignButton type="primary" html-type="submit">
        提交
      </LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup>
import { useForm } from '@ldesign/form';
import { required, email } from '@ldesign/form/validators';
import {
  LDesignForm,
  LDesignFormItem,
  LDesignInput,
  LDesignButton
} from '@ldesign/form/vue';

const form = useForm({
  initialValues: {
    username: '',
    email: ''
  }
});

const handleSubmit = (result) => {
  if (result.valid) {
    console.log('提交成功:', result.data);
  } else {
    console.log('验证失败:', result.validation);
  }
};
</script>
```

## 高级用法

### 1. 动态字段

```vue
<template>
  <LDesignForm :form="form">
    <!-- 基础字段 -->
    <LDesignFormItem name="name" label="姓名">
      <LDesignInput v-model="form.data.name" />
    </LDesignFormItem>

    <LDesignFormItem name="userType" label="用户类型">
      <select v-model="form.data.userType">
        <option value="individual">个人</option>
        <option value="company">企业</option>
      </select>
    </LDesignFormItem>

    <!-- 条件字段 -->
    <LDesignFormItem
      v-if="form.data.userType === 'company'"
      name="companyName"
      label="公司名称"
      :rules="[{ validator: required() }]"
    >
      <LDesignInput v-model="form.data.companyName" />
    </LDesignFormItem>
  </LDesignForm>
</template>
```

### 2. 字段数组

```vue
<template>
  <LDesignForm :form="form">
    <div class="hobby-section">
      <h3>兴趣爱好</h3>
      <div
        v-for="(hobby, index) in form.data.hobbies"
        :key="index"
        class="hobby-item"
      >
        <LDesignFormItem
          :name="`hobbies.${index}`"
          :label="`爱好 ${index + 1}`"
        >
          <LDesignInput v-model="form.data.hobbies[index]" />
          <button @click="removeHobby(index)">删除</button>
        </LDesignFormItem>
      </div>
      <button @click="addHobby">添加爱好</button>
    </div>
  </LDesignForm>
</template>

<script setup>
const form = useForm({
  initialValues: {
    hobbies: ['']
  }
});

const addHobby = () => {
  form.data.hobbies.push('');
};

const removeHobby = (index) => {
  if (form.data.hobbies.length > 1) {
    form.data.hobbies.splice(index, 1);
  }
};
</script>
```

### 3. 自定义验证器

```javascript
// 异步验证器
const asyncValidator = async (value) => {
  const response = await fetch(`/api/check-username?username=${value}`);
  const result = await response.json();
  
  if (result.exists) {
    return { valid: false, message: '用户名已存在' };
  }
  return { valid: true, message: '' };
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
form.getField('username').addRule({ validator: asyncValidator });
form.getField('confirmPassword').addRule({ validator: confirmPasswordValidator });
```

### 4. 表单布局

```vue
<template>
  <!-- 水平布局 -->
  <LDesignForm :form="form" layout="horizontal">
    <LDesignFormItem name="username" label="用户名" label-width="100px">
      <LDesignInput v-model="form.data.username" />
    </LDesignFormItem>
  </LDesignForm>

  <!-- 内联布局 -->
  <LDesignForm :form="form" layout="inline">
    <LDesignFormItem name="startDate" label="开始日期">
      <LDesignInput v-model="form.data.startDate" type="date" />
    </LDesignFormItem>
    <LDesignFormItem name="endDate" label="结束日期">
      <LDesignInput v-model="form.data.endDate" type="date" />
    </LDesignFormItem>
  </LDesignForm>
</template>
```

## 常见场景

### 1. 登录表单

```vue
<template>
  <LDesignForm :form="loginForm" @submit="handleLogin">
    <LDesignFormItem
      name="username"
      label="用户名"
      :rules="[{ validator: required() }]"
    >
      <LDesignInput
        v-model="loginForm.data.username"
        placeholder="请输入用户名"
      />
    </LDesignFormItem>

    <LDesignFormItem
      name="password"
      label="密码"
      :rules="[{ validator: required() }]"
    >
      <LDesignInput
        v-model="loginForm.data.password"
        type="password"
        placeholder="请输入密码"
      />
    </LDesignFormItem>

    <LDesignFormItem>
      <LDesignButton type="primary" html-type="submit" :loading="loading">
        登录
      </LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);

const loginForm = useForm({
  initialValues: {
    username: '',
    password: ''
  }
});

const handleLogin = async (result) => {
  if (!result.valid) return;
  
  loading.value = true;
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    });
    
    if (response.ok) {
      console.log('登录成功');
    } else {
      console.log('登录失败');
    }
  } finally {
    loading.value = false;
  }
};
</script>
```

### 2. 搜索表单

```vue
<template>
  <LDesignForm :form="searchForm" layout="inline" @submit="handleSearch">
    <LDesignFormItem name="keyword" label="关键词">
      <LDesignInput
        v-model="searchForm.data.keyword"
        placeholder="请输入搜索关键词"
      />
    </LDesignFormItem>

    <LDesignFormItem name="category" label="分类">
      <select v-model="searchForm.data.category">
        <option value="">全部分类</option>
        <option value="tech">技术</option>
        <option value="design">设计</option>
      </select>
    </LDesignFormItem>

    <LDesignFormItem>
      <LDesignButton type="primary" html-type="submit">
        搜索
      </LDesignButton>
      <LDesignButton html-type="reset">
        重置
      </LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup>
const searchForm = useForm({
  initialValues: {
    keyword: '',
    category: ''
  }
});

const handleSearch = (result) => {
  console.log('搜索参数:', result.data);
  // 执行搜索逻辑
};
</script>
```

## 性能优化

### 1. 减少不必要的验证

```javascript
// 只在提交时验证
const form = createForm({
  initialValues: { /* ... */ },
  validateOnChange: false,
  validateOnBlur: false
});

// 手动触发验证
const handleSubmit = async () => {
  const result = await form.validate();
  if (result.valid) {
    // 提交逻辑
  }
};
```

### 2. 懒加载验证器

```javascript
// 动态导入验证器
const loadEmailValidator = async () => {
  const { email } = await import('@ldesign/form/validators');
  return email();
};

// 在需要时添加验证规则
const addEmailValidation = async () => {
  const emailValidator = await loadEmailValidator();
  form.getField('email').addRule({ validator: emailValidator });
};
```

### 3. 批量操作

```javascript
// 批量设置值
form.setValues({
  username: 'john',
  email: 'john@example.com',
  age: 25
});

// 批量验证
const results = await Promise.all([
  form.getField('username').validate(),
  form.getField('email').validate(),
  form.getField('age').validate()
]);
```

## 错误处理

### 1. 全局错误处理

```javascript
const form = createForm({
  initialValues: { /* ... */ },
  onSubmit: async (data) => {
    try {
      await submitData(data);
    } catch (error) {
      console.error('提交失败:', error);
      // 显示错误提示
    }
  }
});
```

### 2. 字段级错误处理

```javascript
const customValidator = async (value) => {
  try {
    await validateValue(value);
    return { valid: true, message: '' };
  } catch (error) {
    return { valid: false, message: error.message };
  }
};
```

## 调试技巧

### 1. 开发模式日志

```javascript
if (process.env.NODE_ENV === 'development') {
  // 监听所有字段变化
  Object.keys(form.data).forEach(fieldName => {
    form.getField(fieldName).onChange((value) => {
      console.log(`字段 ${fieldName} 变化:`, value);
    });
  });
  
  // 监听验证状态变化
  form.onValidationChange((result) => {
    console.log('验证状态变化:', result);
  });
}
```

### 2. 表单状态检查

```javascript
// 检查表单状态
console.log('表单数据:', form.data);
console.log('表单是否有效:', form.valid);
console.log('表单是否已修改:', form.dirty);
console.log('表单是否已提交:', form.submitted);
```
