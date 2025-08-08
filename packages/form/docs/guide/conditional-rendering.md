# 条件渲染

条件渲染是 @ldesign/form 的强大功能之一，允许你根据表单数据动态显示或隐藏字段，创建智能的交互式表单
。

## 基础概念

条件渲染通过以下方式实现：

1. **字段级条件**：在字段配置中定义显示条件
2. **计算属性**：使用 Vue 的计算属性动态生成字段列表
3. **事件监听**：监听字段变化事件动态调整表单结构

## 字段级条件渲染

### 基础语法

```javascript
{
  name: 'fieldName',
  label: '字段标签',
  component: 'FormInput',
  conditional: {
    when: [
      { field: 'otherField', operator: 'eq', value: 'someValue' }
    ]
  }
}
```

### 支持的操作符

| 操作符       | 说明           | 示例                                                                |
| ------------ | -------------- | ------------------------------------------------------------------- |
| `eq`         | 等于           | `{ field: 'type', operator: 'eq', value: 'personal' }`              |
| `ne`         | 不等于         | `{ field: 'type', operator: 'ne', value: 'business' }`              |
| `gt`         | 大于           | `{ field: 'age', operator: 'gt', value: 18 }`                       |
| `gte`        | 大于等于       | `{ field: 'age', operator: 'gte', value: 18 }`                      |
| `lt`         | 小于           | `{ field: 'age', operator: 'lt', value: 65 }`                       |
| `lte`        | 小于等于       | `{ field: 'age', operator: 'lte', value: 65 }`                      |
| `in`         | 包含在数组中   | `{ field: 'status', operator: 'in', value: ['active', 'pending'] }` |
| `notIn`      | 不包含在数组中 | `{ field: 'status', operator: 'notIn', value: ['deleted'] }`        |
| `contains`   | 字符串包含     | `{ field: 'email', operator: 'contains', value: '@company.com' }`   |
| `startsWith` | 字符串开头     | `{ field: 'phone', operator: 'startsWith', value: '+86' }`          |
| `endsWith`   | 字符串结尾     | `{ field: 'email', operator: 'endsWith', value: '.edu' }`           |
| `isEmpty`    | 为空           | `{ field: 'optional', operator: 'isEmpty', value: true }`           |
| `isNotEmpty` | 不为空         | `{ field: 'required', operator: 'isNotEmpty', value: true }`        |

## 实际示例

### 用户类型条件表单

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
          { label: '学生用户', value: 'student' },
        ],
      },
      span: 'full',
    },

    // 个人用户字段
    {
      name: 'firstName',
      label: '名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入名',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'personal' }],
      },
    },
    {
      name: 'lastName',
      label: '姓',
      component: 'FormInput',
      required: true,
      placeholder: '请输入姓',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'personal' }],
      },
    },
    {
      name: 'idCard',
      label: '身份证号',
      component: 'FormInput',
      required: true,
      placeholder: '请输入身份证号',
      span: 'full',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'personal' }],
      },
    },

    // 企业用户字段
    {
      name: 'companyName',
      label: '公司名称',
      component: 'FormInput',
      required: true,
      placeholder: '请输入公司名称',
      span: 'full',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'business' }],
      },
    },
    {
      name: 'businessLicense',
      label: '营业执照号',
      component: 'FormInput',
      required: true,
      placeholder: '请输入营业执照号',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'business' }],
      },
    },
    {
      name: 'taxId',
      label: '税号',
      component: 'FormInput',
      required: true,
      placeholder: '请输入税号',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'business' }],
      },
    },

    // 学生用户字段
    {
      name: 'studentId',
      label: '学号',
      component: 'FormInput',
      required: true,
      placeholder: '请输入学号',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'student' }],
      },
    },
    {
      name: 'school',
      label: '学校',
      component: 'FormInput',
      required: true,
      placeholder: '请输入学校名称',
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'student' }],
      },
    },
    {
      name: 'grade',
      label: '年级',
      component: 'FormSelect',
      required: true,
      props: {
        options: [
          { label: '大一', value: '1' },
          { label: '大二', value: '2' },
          { label: '大三', value: '3' },
          { label: '大四', value: '4' },
        ],
      },
      conditional: {
        when: [{ field: 'userType', operator: 'eq', value: 'student' }],
      },
    },

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
}
</script>
```

### 复杂条件组合

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({
  hasJob: false,
  age: 25,
  country: 'China',
})

const formOptions = computed(() => ({
  fields: [
    {
      name: 'age',
      label: '年龄',
      component: 'FormInput',
      required: true,
      props: { type: 'number' },
      placeholder: '请输入年龄',
    },
    {
      name: 'country',
      label: '国家',
      component: 'FormSelect',
      required: true,
      props: {
        options: [
          { label: '中国', value: 'China' },
          { label: '美国', value: 'USA' },
          { label: '日本', value: 'Japan' },
          { label: '其他', value: 'Other' },
        ],
      },
    },
    {
      name: 'hasJob',
      label: '是否有工作',
      component: 'FormSwitch',
      span: 'full',
    },

    // 只有成年人且有工作才显示
    {
      name: 'jobTitle',
      label: '职位',
      component: 'FormInput',
      placeholder: '请输入职位',
      conditional: {
        when: [
          { field: 'age', operator: 'gte', value: 18 },
          { field: 'hasJob', operator: 'eq', value: true },
        ],
      },
    },
    {
      name: 'salary',
      label: '薪资',
      component: 'FormInput',
      props: { type: 'number' },
      placeholder: '请输入薪资',
      conditional: {
        when: [
          { field: 'age', operator: 'gte', value: 18 },
          { field: 'hasJob', operator: 'eq', value: true },
        ],
      },
    },

    // 中国用户显示身份证，其他国家显示护照
    {
      name: 'idCard',
      label: '身份证号',
      component: 'FormInput',
      placeholder: '请输入身份证号',
      span: 'full',
      conditional: {
        when: [{ field: 'country', operator: 'eq', value: 'China' }],
      },
    },
    {
      name: 'passport',
      label: '护照号',
      component: 'FormInput',
      placeholder: '请输入护照号',
      span: 'full',
      conditional: {
        when: [{ field: 'country', operator: 'ne', value: 'China' }],
      },
    },

    // 未成年人显示监护人信息
    {
      name: 'guardianName',
      label: '监护人姓名',
      component: 'FormInput',
      placeholder: '请输入监护人姓名',
      conditional: {
        when: [{ field: 'age', operator: 'lt', value: 18 }],
      },
    },
    {
      name: 'guardianPhone',
      label: '监护人电话',
      component: 'FormInput',
      placeholder: '请输入监护人电话',
      conditional: {
        when: [{ field: 'age', operator: 'lt', value: 18 }],
      },
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
}
</script>
```

### 动态验证规则

条件渲染不仅可以控制字段显示，还可以动态应用验证规则：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({
  accountType: 'personal',
  isVip: false,
})

const formOptions = computed(() => ({
  fields: [
    {
      name: 'accountType',
      label: '账户类型',
      component: 'FormRadio',
      required: true,
      props: {
        options: [
          { label: '个人账户', value: 'personal' },
          { label: '企业账户', value: 'business' },
        ],
      },
      span: 'full',
    },
    {
      name: 'isVip',
      label: 'VIP 用户',
      component: 'FormSwitch',
      span: 'full',
    },
    {
      name: 'name',
      label: '姓名/公司名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入姓名或公司名',
      rules: [
        { required: true, message: '请输入姓名或公司名' },
        {
          validator: (value, formData) => {
            if (formData.accountType === 'business') {
              return value.length >= 2
            }
            return value.length >= 1
          },
          message: formData => {
            return formData.accountType === 'business' ? '公司名至少2个字符' : '姓名至少1个字符'
          },
        },
      ],
    },
    {
      name: 'phone',
      label: '联系电话',
      component: 'FormInput',
      placeholder: '请输入联系电话',
      rules: [
        {
          validator: (value, formData) => {
            // VIP 用户必须填写电话
            if (formData.isVip) {
              return !!value
            }
            return true
          },
          message: 'VIP 用户必须填写联系电话',
        },
        {
          validator: value => {
            if (!value) return true
            return /^1[3-9]\\d{9}$/.test(value)
          },
          message: '请输入有效的手机号码',
        },
      ],
    },
    {
      name: 'email',
      label: '邮箱地址',
      component: 'FormInput',
      props: { type: 'email' },
      placeholder: '请输入邮箱地址',
      rules: [
        {
          validator: (value, formData) => {
            // 企业账户必须填写邮箱
            if (formData.accountType === 'business') {
              return !!value
            }
            return true
          },
          message: '企业账户必须填写邮箱地址',
        },
        {
          validator: value => {
            if (!value) return true
            return value.includes('@') && value.includes('.')
          },
          message: '请输入有效的邮箱地址',
        },
      ],
    },
  ],
  layout: {
    columns: 2,
    gap: 16,
  },
  validation: {
    validateOnChange: true,
  },
  submitButton: {
    text: '提交',
    type: 'primary',
  },
}))

const handleSubmit = data => {
  console.log('提交数据:', data)
}
</script>
```

## 高级技巧

### 1. 使用计算属性

对于复杂的条件逻辑，推荐使用 Vue 的计算属性：

```vue
<script setup>
import { ref, computed } from 'vue'

const formData = ref({})

const formOptions = computed(() => {
  const fields = [
    // 基础字段...
  ]

  // 根据复杂条件添加字段
  if (shouldShowAdvancedFields(formData.value)) {
    fields.push(...advancedFields)
  }

  return { fields }
})

const shouldShowAdvancedFields = data => {
  return data.userType === 'admin' && data.experience > 5 && data.department === 'IT'
}
</script>
```

### 2. 字段依赖管理

当字段之间有复杂依赖关系时，可以使用依赖声明：

```javascript
{
  name: 'dependentField',
  label: '依赖字段',
  component: 'FormInput',
  dependencies: ['field1', 'field2', 'field3'], // 声明依赖
  conditional: {
    when: [
      // 复杂条件...
    ]
  }
}
```

### 3. 性能优化

对于大型表单，可以使用以下优化策略：

```javascript
// 使用 shallowRef 减少深度响应
import { shallowRef } from 'vue'

const formData = shallowRef({})

// 使用防抖减少计算频率
import { debounce } from '@ldesign/form'

const debouncedCompute = debounce(() => {
  // 重新计算字段配置
}, 300)
```
