# LDesign Form - 使用指南

## 📚 目录

1. [安装和配置](#安装和配置)
2. [基础用法](#基础用法)
3. [高级用法](#高级用法)
4. [最佳实践](#最佳实践)
5. [常见问题](#常见问题)

---

## 安装和配置

### 安装

```bash
npm install @ldesign/form
# 或
pnpm add @ldesign/form
# 或
yarn add @ldesign/form
```

### TypeScript 配置

确保你的 `tsconfig.json` 包含以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

## 基础用法

### 1. 创建简单表单

#### Vue 3

```vue
<template>
  <div>
    <input v-model="values.username" placeholder="用户名" />
    <input v-model="values.email" placeholder="邮箱" />
    <button @click="submit">提交</button>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'

const { values, submit } = useForm({
  initialValues: {
    username: '',
    email: ''
  },
  onSubmit: (values) => {
    console.log('提交:', values)
  }
})
</script>
```

#### React

```tsx
import { useForm } from '@ldesign/form/react'

function MyForm() {
  const { values, setFieldValue, submit } = useForm({
    initialValues: { username: '', email: '' },
    onSubmit: (values) => console.log(values)
  })

  return (
    <div>
      <input 
        value={values.username}
        onChange={e => setFieldValue('username', e.target.value)}
      />
      <input 
        value={values.email}
        onChange={e => setFieldValue('email', e.target.value)}
      />
      <button onClick={submit}>提交</button>
    </div>
  )
}
```

---

### 2. 添加验证

```typescript
const { values, validateField, submit } = useForm({
  initialValues: {
    username: '',
    email: ''
  },
  fields: [
    {
      name: 'username',
      rules: [
        { type: 'required', message: '请输入用户名' },
        { type: 'minLength', params: { value: 3 }, message: '至少3个字符' }
      ]
    },
    {
      name: 'email',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' }
      ]
    }
  ],
  onSubmit: async (values) => {
    // 提交前会自动验证
    await api.submit(values)
  }
})
```

---

### 3. 使用布局系统

```vue
<template>
  <LForm
    :span-width="200"
    :max-span="3"
    :space="16"
    :gap="8"
    label-align="right"
  >
    <LFormItem name="field1" label="字段1">
      <input />
    </LFormItem>
    
    <LFormItem name="field2" label="字段2">
      <input />
    </LFormItem>
    
    <LFormItem name="field3" label="字段3" :span="2">
      <input />
    </LFormItem>
  </LForm>
</template>
```

---

## 高级用法

### 1. 字段联动

```typescript
const form = useForm({
  initialValues: {
    country: '',
    city: ''
  },
  fields: [
    {
      name: 'country',
      label: '国家',
      options: [
        { label: '中国', value: 'china' },
        { label: '美国', value: 'usa' }
      ]
    },
    {
      name: 'city',
      label: '城市',
      dependencies: ['country'],
      visible: (values) => !!values.country,
      loadOptions: async () => {
        const country = form.getFieldValue('country')
        return await fetchCities(country)
      }
    }
  ],
  onChange: (field, value) => {
    if (field === 'country') {
      // 国家变更时清空城市
      form.setFieldValue('city', '')
    }
  }
})
```

---

### 2. 展开收起

```vue
<template>
  <LForm
    :collapsible="true"
    :preview-rows="1"
    expand-mode="visible"
    @expand-change="handleExpandChange"
  >
    <!-- 字段1、2、3在第一行，默认显示 -->
    <LFormItem name="field1" label="字段1">
      <input />
    </LFormItem>
    
    <LFormItem name="field2" label="字段2">
      <input />
    </LFormItem>
    
    <LFormItem name="field3" label="字段3">
      <input />
    </LFormItem>
    
    <!-- 字段4、5、6在第二行，默认隐藏 -->
    <LFormItem name="field4" label="字段4">
      <input />
    </LFormItem>
    
    <LFormItem name="field5" label="字段5">
      <input />
    </LFormItem>
    
    <LFormItem name="field6" label="字段6">
      <input />
    </LFormItem>
  </LForm>
</template>
```

---

### 3. 自定义验证

```typescript
{
  name: 'password',
  rules: [
    {
      type: 'custom',
      validator: async (value) => {
        // 异步验证密码强度
        const strength = await checkPasswordStrength(value)
        return {
          valid: strength >= 3,
          message: '密码强度不够，请包含大小写字母、数字和特殊字符'
        }
      }
    }
  ]
}
```

---

### 4. 表单分组

```typescript
import { createFormGroupManager } from '@ldesign/form'

const groupManager = createFormGroupManager()

// 注册分组
groupManager.registerGroup({
  name: 'basic',
  title: '基础信息',
  fields: ['username', 'email', 'phone'],
  collapsible: true,
  defaultCollapsed: false
})

groupManager.registerGroup({
  name: 'advanced',
  title: '高级设置',
  fields: ['avatar', 'bio', 'website'],
  collapsible: true,
  defaultCollapsed: true
})

// 切换分组折叠
groupManager.toggleGroupCollapse('advanced')
```

---

### 5. 动态字段

```typescript
import { createDynamicFieldManager } from '@ldesign/form'

const dynamicFields = createDynamicFieldManager()

// 添加字段
dynamicFields.addField({
  name: 'newField',
  label: '新字段',
  component: 'input',
  rules: [{ type: 'required' }]
})

// 监听字段添加
dynamicFields.on('field:added', (event) => {
  console.log('字段已添加:', event.field.name)
})

// 移除字段
dynamicFields.removeField('newField')
```

---

### 6. 数组字段（动态列表）

```typescript
import { createArrayFieldManager } from '@ldesign/form'

const arrayFields = createArrayFieldManager()

// 注册数组字段
arrayFields.registerArrayField({
  name: 'contacts',
  itemTemplate: [
    { name: 'name', label: '姓名', rules: [{ type: 'required' }] },
    { name: 'phone', label: '电话', rules: [{ type: 'phone' }] },
    { name: 'email', label: '邮箱', rules: [{ type: 'email' }] }
  ],
  minItems: 1,
  maxItems: 5,
  defaultItemValue: { name: '', phone: '', email: '' }
})

// 添加联系人
arrayFields.addItem('contacts')

// 移除联系人
arrayFields.removeItem('contacts', 0)

// 获取所有联系人字段配置
const allFields = arrayFields.getAllItemFields()
// 生成：contacts[0].name, contacts[0].phone, contacts[0].email, ...
```

---

## 最佳实践

### 1. 表单验证最佳实践

**推荐**：
- ✅ 使用内置验证规则
- ✅ 失焦时验证（validateOnBlur）
- ✅ 提交前验证（validateOnSubmit）
- ✅ 提供清晰的错误消息

**不推荐**：
- ❌ 每次输入都验证（影响性能）
- ❌ 使用模糊的错误提示

#### 示例

```typescript
const form = useForm({
  validateOnChange: false,  // 不在每次变更时验证
  validateOnBlur: true,      // 失焦时验证
  validateOnSubmit: true,    // 提交时验证
  fields: [
    {
      name: 'email',
      rules: [
        { type: 'required', message: '请输入邮箱' },  // 清晰
        { type: 'email', message: '请输入有效的邮箱地址' }  // 具体
      ]
    }
  ]
})
```

---

### 2. 性能优化最佳实践

**大量字段场景**：

```typescript
// 使用虚拟滚动
import { createVirtualScrollManager } from '@ldesign/form'

const virtualScroll = createVirtualScrollManager({
  itemHeight: 50,
  bufferSize: 5,
  containerHeight: 600
})

virtualScroll.setTotalItems(1000)
virtualScroll.subscribe((range) => {
  // 只渲染可见范围的字段
  renderFields(range.start, range.end)
})
```

**验证优化**：

```typescript
// 启用验证缓存
const engine = new ValidationEngine({
  enableCache: true,
  cacheSize: 200
})

// 使用防抖延迟验证
const debouncedValidate = debounce(
  (field) => form.validateField(field),
  300
)
```

---

### 3. 类型安全最佳实践

**定义表单值类型**：

```typescript
interface RegisterFormValues {
  username: string
  email: string
  password: string
  age: number
}

const { values } = useForm<RegisterFormValues>({
  initialValues: {
    username: '',
    email: '',
    password: '',
    age: 0
  }
})

// 现在 values 有完整的类型提示
values.username // string
values.age // number
```

---

### 4. 错误处理最佳实践

```typescript
const form = useForm({
  onSubmit: async (values) => {
    try {
      await api.submit(values)
      message.success('提交成功')
    } catch (error) {
      message.error('提交失败：' + error.message)
    }
  },
  onValidateFailed: (errors) => {
    console.error('验证失败:', errors)
    message.error('请检查表单输入')
  }
})
```

---

## 常见问题

### Q1: 如何在 Vue 中使用 v-model？

A: 直接绑定 values 对象：

```vue
<input v-model="values.username" />
```

或使用字段 Hook：

```vue
<script setup>
const { value, onChange } = useField('username')
</script>

<template>
  <input :value="value" @input="e => onChange(e.target.value)" />
</template>
```

---

### Q2: 如何实现条件必填？

A: 使用自定义验证器：

```typescript
{
  name: 'phone',
  rules: [
    {
      type: 'custom',
      validator: (value, values) => {
        // 如果选择了"手机注册"，手机号必填
        if (values.registerType === 'phone') {
          return !!value
        }
        return true
      },
      message: '请输入手机号'
    }
  ]
}
```

---

### Q3: 如何实现跨字段验证？

A: 在自定义验证器中访问其他字段：

```typescript
{
  name: 'confirmPassword',
  rules: [
    {
      type: 'custom',
      validator: (value, values) => {
        return value === values.password
      },
      message: '两次密码输入不一致'
    }
  ]
}
```

---

### Q4: 如何禁用表单提交按钮？

A: 根据表单状态：

```vue
<button @click="submit" :disabled="!valid || submitting">
  {{ submitting ? '提交中...' : '提交' }}
</button>
```

---

### Q5: 如何重置表单到特定值？

A: 使用 DataManager 的 resetTo 方法：

```typescript
// 通过表单实例访问
form.form.getDataManager().resetTo({
  username: 'default',
  email: 'default@example.com'
})
```

---

### Q6: 如何实现表单的撤销/重做？

A: 使用快照功能：

```typescript
// 创建快照
form.form.getDataManager().createSnapshot()

// 修改数据
form.setFieldValue('username', 'new value')

// 撤销（恢复快照）
form.form.getDataManager().restoreSnapshot()
```

---

### Q7: 如何优化大型表单性能？

A: 
1. 关闭实时验证
2. 使用虚拟滚动
3. 启用验证缓存

```typescript
const form = useForm({
  validateOnChange: false,  // 关闭实时验证
  fields: largeFieldList,
  // 其他配置...
})

// 使用虚拟滚动
const virtualScroll = createVirtualScrollManager({
  itemHeight: 50,
  containerHeight: 600
})
```

---

### Q8: 如何自定义主题？

A: 覆盖 CSS 变量：

```css
:root {
  --ldesign-brand-color: #your-color;
  --ldesign-border-radius-base: 8px;
  /* 更多变量... */
}
```

---

### Q9: 如何实现多语言表单？

A: 使用国际化 API：

```typescript
import { setLocale, t } from '@ldesign/form/i18n'

// 切换语言
setLocale('en-US')

// 使用翻译
const form = useForm({
  fields: [
    {
      name: 'username',
      label: t('field.username'),
      rules: [
        { type: 'required', message: t('validation.required') }
      ]
    }
  ]
})
```

---

### Q10: 如何处理异步加载选项？

A: 使用 loadOptions：

```typescript
{
  name: 'city',
  label: '城市',
  loadOptions: async () => {
    const response = await api.getCities()
    return response.data.map(city => ({
      label: city.name,
      value: city.id
    }))
  }
}
```

---

## 更多资源

- [API 参考文档](./API_REFERENCE.md)
- [快速开始示例](../QUICK_START_EXAMPLES.md)
- [在线示例](../examples)

---

**使用愉快！如有问题请提 Issue。**



