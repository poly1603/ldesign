# 高级功能指南

@ldesign/form 提供了强大的高级功能，帮助你构建复杂的表单场景。

## 目录

- [动态数组字段](#动态数组字段)
- [表单分组](#表单分组)
- [条件字段](#条件字段)
- [复杂布局](#复杂布局)
- [异步验证](#异步验证)
- [表单状态管理](#表单状态管理)
- [事件系统](#事件系统)

## 动态数组字段

动态数组字段允许用户在运行时添加、删除和重新排序表单项，适用于联系人列表、工作经历、教育背景等场景。

### 基本用法

```typescript
import { createForm } from '@ldesign/form'

const form = createForm({
  initialValues: {
    contacts: [
      { name: '', phone: '', email: '' }
    ]
  },
  fields: [
    {
      name: 'contacts',
      label: '联系人列表',
      type: 'array',
      itemFields: [
        { name: 'name', label: '姓名', required: true },
        { name: 'phone', label: '电话', required: true },
        { name: 'email', label: '邮箱' }
      ]
    }
  ]
})

// 使用 ArrayFieldManager
const arrayManager = form.getFieldManager().getArrayField('contacts')

// 添加项
arrayManager.add({ name: '', phone: '', email: '' })

// 删除项
arrayManager.remove(index)

// 移动项
arrayManager.move(fromIndex, toIndex)

// 获取所有项
const items = arrayManager.getItems()
```

### 完整示例

```vue
<template>
  <div class="contact-list">
    <h3>联系人列表</h3>
    
    <div
      v-for="(contact, index) in contacts"
      :key="index"
      class="contact-item"
    >
      <div class="contact-fields">
        <InputField
          v-model="contact.name"
          placeholder="姓名"
          @blur="validateField(`contacts.${index}.name`)"
        />
        <InputField
          v-model="contact.phone"
          type="tel"
          placeholder="电话"
          @blur="validateField(`contacts.${index}.phone`)"
        />
        <InputField
          v-model="contact.email"
          type="email"
          placeholder="邮箱"
        />
      </div>
      
      <div class="contact-actions">
        <button @click="moveUp(index)" :disabled="index === 0">
          ↑
        </button>
        <button @click="moveDown(index)" :disabled="index === contacts.length - 1">
          ↓
        </button>
        <button @click="removeContact(index)" class="btn-danger">
          删除
        </button>
      </div>
    </div>
    
    <button @click="addContact" class="btn-add">
      + 添加联系人
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useForm } from '@ldesign/form/vue'

const form = useForm({
  initialValues: {
    contacts: [{ name: '', phone: '', email: '' }]
  }
})

const contacts = ref(form.getValue('contacts'))

const addContact = () => {
  contacts.value.push({ name: '', phone: '', email: '' })
  form.setFieldValue('contacts', contacts.value)
}

const removeContact = (index) => {
  if (contacts.value.length > 1) {
    contacts.value.splice(index, 1)
    form.setFieldValue('contacts', contacts.value)
  }
}

const moveUp = (index) => {
  if (index > 0) {
    const temp = contacts.value[index]
    contacts.value[index] = contacts.value[index - 1]
    contacts.value[index - 1] = temp
    form.setFieldValue('contacts', contacts.value)
  }
}

const moveDown = (index) => {
  if (index < contacts.value.length - 1) {
    const temp = contacts.value[index]
    contacts.value[index] = contacts.value[index + 1]
    contacts.value[index + 1] = temp
    form.setFieldValue('contacts', contacts.value)
  }
}

const validateField = async (fieldPath) => {
  await form.validateField(fieldPath)
}
</script>

<style scoped>
.contact-list {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.contact-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.contact-fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.contact-actions {
  display: flex;
  gap: 4px;
}

.btn-add {
  width: 100%;
  margin-top: 8px;
  padding: 8px;
  border: 1px dashed #d9d9d9;
  background: transparent;
  cursor: pointer;
}

.btn-danger {
  color: #ff4d4f;
}
</style>
```

### 最小/最大限制

```typescript
const form = createForm({
  fields: [
    {
      name: 'phoneNumbers',
      type: 'array',
      minItems: 1,        // 至少1项
      maxItems: 5,        // 最多5项
      defaultItem: { number: '', type: 'mobile' }
    }
  ]
})
```

---

## 表单分组

表单分组用于组织大型表单，提供更好的用户体验。

### 基本用法

```typescript
import { createForm } from '@ldesign/form'

const form = createForm({
  initialValues: {
    // 基本信息
    username: '',
    email: '',
    // 地址信息
    province: '',
    city: '',
    address: ''
  },
  groups: [
    {
      name: 'basic',
      title: '基本信息',
      fields: ['username', 'email'],
      collapsible: true,
      defaultExpanded: true
    },
    {
      name: 'address',
      title: '地址信息',
      fields: ['province', 'city', 'address'],
      collapsible: true,
      defaultExpanded: false
    }
  ],
  fields: [
    { name: 'username', label: '用户名' },
    { name: 'email', label: '邮箱' },
    { name: 'province', label: '省份' },
    { name: 'city', label: '城市' },
    { name: 'address', label: '详细地址' }
  ]
})

// 使用 FormGroupManager
const groupManager = form.getGroupManager()

// 展开/收起分组
groupManager.toggle('basic')

// 展开所有
groupManager.expandAll()

// 收起所有
groupManager.collapseAll()

// 获取分组状态
const isExpanded = groupManager.isExpanded('basic')
```

### 完整示例

```vue
<template>
  <div class="form-with-groups">
    <div
      v-for="group in groups"
      :key="group.name"
      class="form-group"
    >
      <div
        class="form-group-header"
        @click="toggleGroup(group.name)"
      >
        <h3>{{ group.title }}</h3>
        <span class="expand-icon">
          {{ groupStates[group.name] ? '▼' : '▶' }}
        </span>
      </div>
      
      <div
        v-show="groupStates[group.name]"
        class="form-group-body"
      >
        <div
          v-for="fieldName in group.fields"
          :key="fieldName"
          class="form-item"
        >
          <!-- 渲染字段 -->
          <component
            :is="getFieldComponent(fieldName)"
            v-model="formValues[fieldName]"
            v-bind="getFieldProps(fieldName)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const groups = [
  {
    name: 'basic',
    title: '基本信息',
    fields: ['username', 'email', 'phone']
  },
  {
    name: 'address',
    title: '地址信息',
    fields: ['province', 'city', 'address']
  },
  {
    name: 'work',
    title: '工作信息',
    fields: ['company', 'position']
  }
]

const groupStates = reactive({
  basic: true,
  address: false,
  work: false
})

const formValues = reactive({
  username: '',
  email: '',
  phone: '',
  province: '',
  city: '',
  address: '',
  company: '',
  position: ''
})

const toggleGroup = (name) => {
  groupStates[name] = !groupStates[name]
}

// 获取字段组件和属性的辅助函数
const getFieldComponent = (fieldName) => {
  // 根据字段类型返回对应组件
}

const getFieldProps = (fieldName) => {
  // 返回字段的 props
}
</script>

<style scoped>
.form-group {
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.form-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  cursor: pointer;
  user-select: none;
}

.form-group-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.expand-icon {
  color: #999;
  transition: transform 0.3s;
}

.form-group-body {
  padding: 16px;
}
</style>
```

---

## 条件字段

条件字段根据其他字段的值动态显示或隐藏。

### 基本用法

```typescript
const form = createForm({
  initialValues: {
    hasCompany: false,
    company: '',
    position: '',
    industry: ''
  },
  fields: [
    {
      name: 'hasCompany',
      label: '是否有工作',
      type: 'switch'
    },
    {
      name: 'company',
      label: '公司名称',
      visible: (values) => values.hasCompany,
      dependencies: ['hasCompany']
    },
    {
      name: 'position',
      label: '职位',
      visible: (values) => values.hasCompany,
      dependencies: ['hasCompany']
    },
    {
      name: 'industry',
      label: '行业',
      visible: (values) => values.hasCompany && values.company !== '',
      dependencies: ['hasCompany', 'company']
    }
  ]
})
```

### 多条件联动

```typescript
const form = createForm({
  initialValues: {
    shippingMethod: '',
    courierService: '',
    trackingNumber: '',
    pickupLocation: '',
    pickupTime: ''
  },
  fields: [
    {
      name: 'shippingMethod',
      label: '配送方式',
      type: 'select',
      options: [
        { label: '快递配送', value: 'courier' },
        { label: '门店自提', value: 'pickup' }
      ]
    },
    // 快递相关字段
    {
      name: 'courierService',
      label: '快递公司',
      visible: (values) => values.shippingMethod === 'courier',
      dependencies: ['shippingMethod']
    },
    {
      name: 'trackingNumber',
      label: '运单号',
      visible: (values) => values.shippingMethod === 'courier',
      dependencies: ['shippingMethod']
    },
    // 自提相关字段
    {
      name: 'pickupLocation',
      label: '自提门店',
      visible: (values) => values.shippingMethod === 'pickup',
      dependencies: ['shippingMethod']
    },
    {
      name: 'pickupTime',
      label: '自提时间',
      visible: (values) => values.shippingMethod === 'pickup',
      dependencies: ['shippingMethod']
    }
  ]
})
```

### 跨字段验证

```typescript
const form = createForm({
  fields: [
    {
      name: 'startDate',
      label: '开始日期',
      type: 'date'
    },
    {
      name: 'endDate',
      label: '结束日期',
      type: 'date',
      rules: [
        {
          validator: (value, values) => {
            if (!value || !values.startDate) return { valid: true }
            return {
              valid: new Date(value) >= new Date(values.startDate),
              message: '结束日期不能早于开始日期'
            }
          }
        }
      ],
      dependencies: ['startDate']
    }
  ]
})
```

---

## 复杂布局

@ldesign/form 提供了强大的布局系统，支持多列、响应式和自定义布局。

### 多列布局

```typescript
const form = createForm({
  layout: {
    spanWidth: 300,        // 每列宽度
    maxSpan: 3,            // 最大列数
    minSpan: 1,            // 最小列数
    space: 16,             // 垂直间距
    gap: 16,               // 水平间距
    labelAlign: 'right',   // 标签对齐
    responsive: true       // 启用响应式
  },
  fields: [
    {
      name: 'title',
      label: '标题',
      span: 3              // 占3列
    },
    {
      name: 'firstName',
      label: '名',
      span: 1              // 占1列
    },
    {
      name: 'lastName',
      label: '姓',
      span: 1
    },
    {
      name: 'email',
      label: '邮箱',
      span: 1
    }
  ]
})
```

### 响应式布局

```typescript
const form = createForm({
  layout: {
    responsive: true,
    breakpoints: {
      xs: 1,    // < 576px: 1列
      sm: 1,    // >= 576px: 1列
      md: 2,    // >= 768px: 2列
      lg: 3,    // >= 992px: 3列
      xl: 4,    // >= 1200px: 4列
      xxl: 4    // >= 1600px: 4列
    }
  }
})
```

### 字段级别的响应式

```typescript
const form = createForm({
  fields: [
    {
      name: 'description',
      label: '描述',
      layout: {
        span: 2,           // 默认占2列
        responsive: {
          xs: { span: 1 }, // 小屏占1列（全宽）
          md: { span: 2 }, // 中屏占2列
          lg: { span: 3 }  // 大屏占3列
        }
      }
    }
  ]
})
```

### 标题宽度自适应

```typescript
const form = createForm({
  layout: {
    labelWidth: 'auto',    // 自动计算标题宽度
    labelAlign: 'right',
    labelPadding: 12       // 标题内边距
  }
})
```

---

## 异步验证

@ldesign/form 完全支持异步验证，适用于需要服务器端验证的场景。

### 用户名唯一性验证

```typescript
import { uniqueUsername } from '@ldesign/form/validators'

const form = createForm({
  fields: [
    {
      name: 'username',
      label: '用户名',
      rules: [
        { validator: required, message: '请输入用户名' },
        {
          validator: uniqueUsername(async (username) => {
            const response = await fetch(`/api/check-username?username=${username}`)
            const { available } = await response.json()
            return available
          }),
          message: '该用户名已被使用'
        }
      ]
    }
  ]
})
```

### 自定义异步验证器

```typescript
const form = createForm({
  fields: [
    {
      name: 'email',
      label: '邮箱',
      rules: [
        {
          validator: async (value) => {
            if (!value) return { valid: true }
            
            try {
              const response = await fetch(`/api/validate-email`, {
                method: 'POST',
                body: JSON.stringify({ email: value })
              })
              const { valid, message } = await response.json()
              
              return { valid, message }
            } catch (error) {
              return {
                valid: false,
                message: '验证失败，请稍后重试'
              }
            }
          }
        }
      ]
    }
  ]
})
```

### 防抖异步验证

```typescript
import { debounce } from '@ldesign/form/utils'

const checkUsername = debounce(async (username) => {
  const response = await fetch(`/api/check-username?username=${username}`)
  return response.json()
}, 500)

const form = createForm({
  fields: [
    {
      name: 'username',
      rules: [
        {
          validator: async (value) => {
            const { available } = await checkUsername(value)
            return {
              valid: available,
              message: available ? '' : '该用户名已被使用'
            }
          }
        }
      ]
    }
  ]
})
```

---

## 表单状态管理

@ldesign/form 提供了完整的状态管理功能。

### 表单状态

```typescript
const form = createForm({...})

// 获取表单状态
const formState = form.getFormState()

console.log(formState)
// {
//   valid: true,          // 是否有效
//   dirty: false,         // 是否被修改
//   touched: false,       // 是否被触摸
//   submitting: false,    // 是否正在提交
//   validating: false,    // 是否正在验证
//   errorCount: 0         // 错误数量
// }
```

### 字段状态

```typescript
// 获取单个字段状态
const fieldState = form.getFieldState('username')

console.log(fieldState)
// {
//   value: 'john',        // 字段值
//   valid: true,          // 是否有效
//   dirty: true,          // 是否被修改
//   touched: true,        // 是否被触摸
//   validating: false,    // 是否正在验证
//   errors: []            // 错误消息数组
// }
```

### 监听状态变化

```typescript
// 监听表单状态变化
form.on('state:change', (state) => {
  console.log('表单状态变化:', state)
})

// 监听字段值变化
form.on('field:change', ({ field, value, values }) => {
  console.log(`字段 ${field} 的值变为:`, value)
})

// 监听验证完成
form.on('validate:end', (result) => {
  if (!result.valid) {
    console.log('验证失败:', result.errors)
  }
})

// 监听提交
form.on('submit:success', (values) => {
  console.log('提交成功:', values)
})

form.on('submit:error', ({ error, values }) => {
  console.error('提交失败:', error)
})
```

---

## 事件系统

@ldesign/form 提供了完整的事件系统。

### 可用事件

```typescript
interface FormEventMap {
  // 数据相关
  'data:change': { path: string; value: any; values: FormValues }
  'field:change': { field: string; value: any; values: FormValues }
  
  // 状态相关
  'state:change': StateChangeEvent
  'field:blur': { field: string }
  'field:focus': { field: string }
  
  // 验证相关
  'validate:start': { fields?: string[] }
  'validate:end': FormValidationResult
  
  // 提交相关
  'submit:start': FormValues
  'submit:success': FormValues
  'submit:error': { error: Error; values: FormValues }
  
  // 其他
  'reset': FormValues
  'expand:change': { expanded: boolean }
}
```

### 事件监听示例

```typescript
const form = createForm({...})

// 基础监听
const unsubscribe = form.on('field:change', ({ field, value }) => {
  console.log(`${field} changed to ${value}`)
})

// 一次性监听
form.once('submit:success', (values) => {
  console.log('首次提交成功')
})

// 移除监听
unsubscribe()
// 或
form.off('field:change', handler)
```

### 实用场景

#### 1. 自动保存

```typescript
form.on('field:change', debounce(async () => {
  const values = form.getFieldsValue()
  await saveDraft(values)
  console.log('草稿已自动保存')
}, 1000))
```

#### 2. 实时验证反馈

```typescript
form.on('validate:end', (result) => {
  updateValidationUI(result.errors)
})
```

#### 3. 提交前确认

```typescript
form.on('submit:start', (values) => {
  const confirmed = confirm('确定要提交吗？')
  if (!confirmed) {
    throw new Error('用户取消提交')
  }
})
```

---

## 最佳实践

### 1. 性能优化

- 使用 `validateOnBlur` 而不是 `validateOnChange` 以减少验证次数
- 对异步验证使用防抖
- 大型表单使用分组和展开收起
- 启用虚拟滚动处理大量选项

### 2. 用户体验

- 提供清晰的错误提示
- 使用加载状态指示器
- 禁用状态下给予视觉反馈
- 提供键盘导航支持

### 3. 代码组织

- 将表单配置提取为单独的文件
- 复用验证规则
- 使用 TypeScript 确保类型安全
- 模块化字段组件

---

## 相关文档

- [字段类型](./field-types.md)
- [验证规则](./validation-rules.md)
- [真实场景示例](./real-world-examples.md)
- [API 参考](../README.md)






