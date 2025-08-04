# 使用指南

## 快速开始

### 安装

```bash
npm install @ldesign/form
# 或
pnpm add @ldesign/form
# 或
yarn add @ldesign/form
```

### 基本使用

#### 原生JavaScript

```javascript
import { FormManager } from '@ldesign/form'

// 表单配置
const formConfig = {
  items: [
    {
      key: 'name',
      label: '姓名',
      type: 'input',
      required: true,
      placeholder: '请输入姓名'
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'email',
      required: true,
      validation: [
        {
          id: 'email-format',
          type: 'email',
          message: '请输入有效的邮箱地址'
        }
      ]
    },
    {
      key: 'age',
      label: '年龄',
      type: 'number',
      validation: [
        {
          id: 'age-range',
          type: 'range',
          message: '年龄必须在18-65之间',
          value: { min: 18, max: 65 }
        }
      ]
    }
  ],
  layout: {
    defaultRows: 2,
    minColumns: 1,
    maxColumns: 3,
    columnWidth: 250,
    gap: {
      horizontal: 16,
      vertical: 16
    }
  },
  display: {
    labelPosition: 'left',
    labelWidth: 80,
    showExpandButton: true,
    expandMode: 'inline'
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorMessage: true
  },
  behavior: {
    readonly: false,
    debounceTime: 300
  }
}

// 创建表单实例
const container = document.getElementById('form-container')
const formManager = new FormManager(formConfig, container)

// 渲染表单
formManager.render()

// 监听事件
formManager.on('VALUE_CHANGE', (data) => {
  console.log('表单值变化:', data)
})

// 获取表单值
const values = formManager.getValue()
console.log('当前表单值:', values)

// 验证表单
const result = formManager.validate()
if (result.valid) {
  console.log('表单验证通过')
}
else {
  console.log('表单验证失败:', result.errors)
}
```

#### Vue3 组件方式

```vue
<script setup>
import { AdaptiveForm } from '@ldesign/form/vue'
import { computed, ref } from 'vue'

const formData = ref({})
const errors = ref({})

const formConfig = {
  // ... 同上面的配置
}

const isValid = computed(() => {
  return Object.keys(errors.value).length === 0
})

function handleChange(data) {
  console.log('表单变化:', data)
}

function handleValidation(data) {
  if (data.key && data.errors) {
    if (data.errors.length > 0) {
      errors.value[data.key] = data.errors
    }
    else {
      delete errors.value[data.key]
    }
  }
}

function handleSubmit() {
  if (isValid.value) {
    console.log('提交数据:', formData.value)
  }
}

function handleReset() {
  formData.value = {}
  errors.value = {}
}
</script>

<template>
  <div>
    <AdaptiveForm
      v-model="formData"
      :config="formConfig"
      @change="handleChange"
      @validation-change="handleValidation"
    />

    <div class="form-actions">
      <button :disabled="!isValid" @click="handleSubmit">
        提交
      </button>
      <button @click="handleReset">
        重置
      </button>
    </div>
  </div>
</template>
```

#### Vue3 Hook方式

```vue
<script setup>
import { useAdaptiveForm } from '@ldesign/form/vue'
import { onMounted, ref } from 'vue'

const containerRef = ref()

const {
  values,
  errors,
  isValid,
  isDirty,
  isValidating,
  getValue,
  setValue,
  validate,
  reset,
  expand,
  collapse,
  mount,
  on
} = useAdaptiveForm({
  // ... 表单配置
}, {
  immediate: false,
  autoValidate: true
})

onMounted(() => {
  // 挂载表单到容器
  mount(containerRef.value)

  // 监听事件
  on('VALUE_CHANGE', (data) => {
    console.log('值变化:', data)
  })
})

// 设置初始值
setValue('name', 'John Doe')
setValue('email', 'john@example.com')
</script>

<template>
  <div>
    <div ref="containerRef" />

    <div class="form-info">
      <p>表单值: {{ JSON.stringify(values, null, 2) }}</p>
      <p>是否有效: {{ isValid }}</p>
      <p>是否已修改: {{ isDirty }}</p>
    </div>

    <div class="form-actions">
      <button :disabled="isValidating" @click="validate">
        验证
      </button>
      <button @click="reset">
        重置
      </button>
      <button @click="expand">
        展开
      </button>
      <button @click="collapse">
        收起
      </button>
    </div>
  </div>
</template>
```

## 高级功能

### 自适应布局

表单会根据容器宽度自动计算最佳列数：

```javascript
const formConfig = {
  layout: {
    minColumns: 1, // 最小1列
    maxColumns: 4, // 最大4列
    columnWidth: 250, // 每列最小宽度250px
    responsive: { // 响应式断点配置
      xs: 1, // < 576px 显示1列
      sm: 2, // >= 576px 显示2列
      md: 3, // >= 768px 显示3列
      lg: 4 // >= 992px 显示4列
    }
  }
}
```

### 跨列布局

某些表单项可以占用多列：

```javascript
const formConfig = {
  items: [
    {
      key: 'title',
      label: '标题',
      type: 'input',
      span: 2 // 占用2列
    },
    {
      key: 'description',
      label: '描述',
      type: 'textarea',
      span: 3 // 占用3列
    }
  ]
}
```

### 表单验证

#### 内置验证器

```javascript
const formConfig = {
  items: [
    {
      key: 'email',
      label: '邮箱',
      type: 'email',
      validation: [
        {
          id: 'required-email',
          type: 'required',
          message: '邮箱是必填项'
        },
        {
          id: 'email-format',
          type: 'email',
          message: '请输入有效的邮箱地址'
        }
      ]
    },
    {
      key: 'password',
      label: '密码',
      type: 'password',
      validation: [
        {
          id: 'password-length',
          type: 'length',
          message: '密码长度必须在6-20位之间',
          value: { min: 6, max: 20 }
        },
        {
          id: 'password-pattern',
          type: 'pattern',
          message: '密码必须包含字母和数字',
          value: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$'
        }
      ]
    }
  ]
}
```

#### 自定义验证器

```javascript
import { ValidationEngine } from '@ldesign/form'

const engine = new ValidationEngine()

// 注册自定义验证器
engine.registerValidator('confirm-password', (value, rule, allValues) => {
  return value === allValues.password
})

// 使用自定义验证器
const formConfig = {
  items: [
    {
      key: 'confirmPassword',
      label: '确认密码',
      type: 'password',
      validation: [
        {
          id: 'confirm-password',
          type: 'confirm-password',
          message: '两次输入的密码不一致'
        }
      ]
    }
  ]
}
```

### 展开收起功能

```javascript
const formConfig = {
  layout: {
    defaultRows: 2 // 默认显示2行
  },
  display: {
    showExpandButton: true,
    expandMode: 'inline' // 或 'modal'
  }
}

// 程序控制展开收起
formManager.expand() // 展开
formManager.collapse() // 收起
```

### 弹窗模式

```javascript
const formConfig = {
  display: {
    expandMode: 'modal',
    modalConfig: {
      title: '更多表单项',
      width: 600,
      height: 400
    }
  }
}

// 程序控制弹窗
formManager.openModal() // 打开弹窗
formManager.closeModal() // 关闭弹窗
```

### 只读模式

```javascript
// 全局只读
const formConfig = {
  behavior: {
    readonly: true
  }
}

// 或者动态设置
formManager.setReadonly(true)

// 单个表单项只读
const formConfig = {
  items: [
    {
      key: 'readonlyField',
      label: '只读字段',
      type: 'input',
      readonly: true
    }
  ]
}
```

### 表单分组

```javascript
const formConfig = {
  items: [
    {
      key: 'name',
      label: '姓名',
      type: 'input',
      group: 'basic'
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'email',
      group: 'basic'
    },
    {
      key: 'company',
      label: '公司',
      type: 'input',
      group: 'work'
    },
    {
      key: 'position',
      label: '职位',
      type: 'input',
      group: 'work'
    }
  ]
}
```

## 样式定制

### CSS类名

表单系统提供了完整的CSS类名用于样式定制：

```css
/* 表单容器 */
.adaptive-form-container {
  /* 容器样式 */
}

/* 表单项 */
.form-item {
  /* 表单项容器样式 */
}

.form-item-label {
  /* 标题样式 */
}

.form-item-input-wrapper {
  /* 输入控件包装器样式 */
}

.form-input,
.form-textarea,
.form-select {
  /* 输入控件样式 */
}

/* 错误状态 */
.form-item.has-error {
  /* 错误状态的表单项样式 */
}

.form-item-error {
  /* 错误信息容器样式 */
}

.error-message {
  /* 错误信息样式 */
}

/* 展开按钮 */
.form-expand-button {
  /* 展开按钮样式 */
}

/* 只读状态 */
.form-item.readonly {
  /* 只读状态样式 */
}

/* 禁用状态 */
.form-item.disabled {
  /* 禁用状态样式 */
}
```

### 自定义样式

```javascript
const formConfig = {
  items: [
    {
      key: 'customField',
      label: '自定义字段',
      type: 'input',
      className: 'my-custom-field',
      style: {
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }
    }
  ]
}
```

## 性能优化

### 防抖配置

```javascript
const formConfig = {
  behavior: {
    debounceTime: 300 // 300ms防抖
  },
  validation: {
    validateOnChange: true // 启用实时验证
  }
}
```

### 大量表单项优化

```javascript
// 对于大量表单项，建议使用以下配置
const formConfig = {
  layout: {
    defaultRows: 5, // 限制默认显示行数
  },
  display: {
    showExpandButton: true,
    expandMode: 'modal' // 使用弹窗模式
  },
  behavior: {
    debounceTime: 500 // 增加防抖时间
  }
}
```

## 最佳实践

### 1. 合理的表单项配置

```javascript
// 推荐的表单项配置
const formConfig = {
  items: [
    {
      key: 'email',
      label: '邮箱地址',
      type: 'email',
      required: true,
      placeholder: '请输入邮箱地址',
      validation: [
        {
          id: 'required-email',
          type: 'required',
          message: '邮箱地址是必填项'
        },
        {
          id: 'email-format',
          type: 'email',
          message: '请输入有效的邮箱地址'
        }
      ]
    }
  ]
}
```

### 2. 响应式布局配置

```javascript
// 推荐的响应式配置
const formConfig = {
  layout: {
    minColumns: 1,
    maxColumns: 4,
    columnWidth: 250,
    gap: {
      horizontal: 16,
      vertical: 16
    },
    responsive: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4
    }
  }
}
```

### 3. 验证配置

```javascript
// 推荐的验证配置
const formConfig = {
  validation: {
    validateOnChange: true, // 实时验证
    validateOnBlur: true, // 失焦验证
    showErrorMessage: true // 显示错误信息
  },
  behavior: {
    debounceTime: 300 // 防抖优化
  }
}
```

### 4. 事件处理

```javascript
// 推荐的事件处理方式
formManager.on('VALUE_CHANGE', (data) => {
  // 处理值变化
  console.log(`字段 ${data.key} 的值变为: ${data.value}`)
})

formManager.on('VALIDATION_CHANGE', (data) => {
  // 处理验证结果变化
  if (data.errors.length > 0) {
    console.log(`字段 ${data.key} 验证失败:`, data.errors)
  }
})
```

### 5. 错误处理

```javascript
try {
  const result = formManager.validate()
  if (!result.valid) {
    // 处理验证错误
    result.errors.forEach((error) => {
      console.error('验证错误:', error)
    })
  }
}
catch (error) {
  // 处理系统错误
  console.error('表单系统错误:', error)
}
```

## 常见问题

### Q: 如何动态添加或删除表单项？

A: 更新配置中的items数组，然后调用updateConfig方法：

```javascript
// 添加表单项
const newItem = {
  key: 'newField',
  label: '新字段',
  type: 'input'
}

const updatedConfig = {
  ...formConfig,
  items: [...formConfig.items, newItem]
}

formManager.updateConfig(updatedConfig)
```

### Q: 如何实现表单项之间的联动？

A: 使用事件监听和条件逻辑：

```javascript
formManager.on('VALUE_CHANGE', (data) => {
  if (data.key === 'country') {
    // 根据国家选择更新城市选项
    updateCityOptions(data.value)
  }
})
```

### Q: 如何自定义表单项的渲染？

A: 使用自定义类型和样式：

```javascript
const formConfig = {
  items: [
    {
      key: 'custom',
      label: '自定义字段',
      type: 'custom',
      className: 'my-custom-field',
      attrs: {
        'data-custom': 'true'
      }
    }
  ]
}
```

### Q: 如何处理异步验证？

A: 使用自定义验证器：

```javascript
engine.registerValidator('async-check', async (value) => {
  const response = await fetch(`/api/check?value=${value}`)
  const result = await response.json()
  return result.valid
})
```

### Q: 如何优化大表单的性能？

A: 使用以下策略：

1. 限制默认显示的表单项数量
2. 使用弹窗模式展示更多项目
3. 增加防抖时间
4. 按需加载表单项

```javascript
const formConfig = {
  layout: {
    defaultRows: 3
  },
  display: {
    expandMode: 'modal'
  },
  behavior: {
    debounceTime: 500
  }
}
```
