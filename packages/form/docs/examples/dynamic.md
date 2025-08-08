# 动态表单

本章节展示如何创建动态表单，包括条件渲染、动态字段添加等高级功能。

## 条件渲染表单

根据用户选择显示不同的字段：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({
  userType: 'personal',
})

const formOptions = computed(() => ({
  fields: [
    {
      name: 'userType',
      label: '用户类型',
      component: 'FormRadio',
      required: true,
      props: {
        options: [
          { label: '个人用户', value: 'personal' },
          { label: '企业用户', value: 'business' },
        ],
      },
      span: 'full',
    },

    // 个人用户字段
    ...(formData.value.userType === 'personal'
      ? [
          {
            name: 'firstName',
            label: '名',
            component: 'FormInput',
            required: true,
            placeholder: '请输入名',
          },
          {
            name: 'lastName',
            label: '姓',
            component: 'FormInput',
            required: true,
            placeholder: '请输入姓',
          },
        ]
      : []),

    // 企业用户字段
    ...(formData.value.userType === 'business'
      ? [
          {
            name: 'companyName',
            label: '公司名称',
            component: 'FormInput',
            required: true,
            placeholder: '请输入公司名称',
            span: 'full',
          },
          {
            name: 'businessLicense',
            label: '营业执照号',
            component: 'FormInput',
            required: true,
            placeholder: '请输入营业执照号',
          },
        ]
      : []),

    // 通用字段
    {
      name: 'email',
      label: '邮箱地址',
      component: 'FormInput',
      required: true,
      props: { type: 'email' },
      placeholder: '请输入邮箱地址',
      span: 'full',
    },
  ],
  layout: {
    columns: 2,
    gap: 16,
  },
  submitButton: {
    text: '提交',
    type: 'primary',
  },
}))

const handleSubmit = data => {
  console.log('提交数据:', data)
  alert('提交成功！')
}
</script>
```

## 动态添加字段

用户可以动态添加和删除联系人信息：

```vue
<template>
  <div>
    <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />

    <div class="dynamic-actions">
      <button @click="addContact" type="button">添加联系人</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const formData = ref({
  name: '',
  contacts: [{ name: '', phone: '', email: '' }],
})

const formOptions = computed(() => {
  const fields = [
    {
      name: 'name',
      label: '姓名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入姓名',
      span: 'full',
    },
  ]

  // 动态生成联系人字段
  formData.value.contacts.forEach((contact, index) => {
    fields.push(
      {
        name: 'contacts[' + index + '].name',
        label: '联系人' + (index + 1) + '姓名',
        component: 'FormInput',
        placeholder: '请输入姓名',
        required: true,
      },
      {
        name: 'contacts[' + index + '].phone',
        label: '联系人' + (index + 1) + '电话',
        component: 'FormInput',
        placeholder: '请输入电话号码',
        required: true,
      }
    )

    // 添加删除按钮（除了第一个联系人）
    if (index > 0) {
      fields.push({
        name: 'remove_' + index,
        label: '',
        component: 'FormButton',
        props: {
          text: '删除',
          type: 'danger',
          onClick: () => removeContact(index),
        },
      })
    }
  })

  return {
    fields,
    layout: {
      columns: 3,
      gap: 16,
    },
    submitButton: {
      text: '提交',
      type: 'primary',
    },
  }
})

const addContact = () => {
  formData.value.contacts.push({ name: '', phone: '', email: '' })
}

const removeContact = index => {
  formData.value.contacts.splice(index, 1)
}

const handleSubmit = data => {
  console.log('提交数据:', data)
  alert('提交成功！')
}
</script>

<style scoped>
.dynamic-actions {
  margin-top: 16px;
  text-align: center;
}

.dynamic-actions button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## 总结

动态表单的核心特性：

1. **条件渲染** - 根据表单数据动态显示/隐藏字段
2. **动态字段** - 运行时添加或删除字段
3. **响应式更新** - 使用 `computed` 确保表单配置实时更新

这些功能让你可以创建高度灵活和交互性强的表单界面。
