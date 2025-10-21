# 最佳实践

本文档包含使用 @ldesign/form 时的最佳实践和建议。

## 目录

- [表单设计原则](#表单设计原则)
- [性能优化](#性能优化)
- [验证规则设计](#验证规则设计)
- [错误处理](#错误处理)
- [代码组织](#代码组织)
- [用户体验](#用户体验)
- [安全性](#安全性)
- [测试](#测试)

## 表单设计原则

### 1. 简洁明了

**好的做法 ✅**
```typescript
const form = createForm({
  fields: [
    { name: 'email', label: '邮箱', required: true },
    { name: 'password', label: '密码', required: true }
  ]
})
```

**不好的做法 ❌**
```typescript
// 一次性要求太多信息
const form = createForm({
  fields: [
    { name: 'email', label: '邮箱' },
    { name: 'password', label: '密码' },
    { name: 'confirmPassword', label: '确认密码' },
    { name: 'firstName', label: '名' },
    { name: 'lastName', label: '姓' },
    { name: 'birthday', label: '生日' },
    { name: 'phone', label: '手机号' },
    { name: 'address', label: '地址' },
    // ... 更多字段
  ]
})
```

**建议**：
- 只要求必要的信息
- 使用分步表单或分组来组织复杂表单
- 考虑渐进式信息收集

### 2. 清晰的标签和提示

**好的做法 ✅**
```vue
<template>
  <InputField
    v-model="username"
    label="用户名"
    placeholder="3-20个字符，字母或数字"
    :help="用户名将用于登录系统"
  />
</template>
```

**不好的做法 ❌**
```vue
<template>
  <InputField
    v-model="username"
    label="用户名"
  />
</template>
```

**建议**：
- 提供描述性的标签
- 使用占位符给出示例
- 添加帮助文本说明要求
- 实时显示字符计数

### 3. 合理的字段顺序

**好的做法 ✅**
```typescript
// 按逻辑分组和自然顺序
const form = createForm({
  groups: [
    {
      name: 'personal',
      title: '个人信息',
      fields: ['firstName', 'lastName', 'birthday', 'gender']
    },
    {
      name: 'contact',
      title: '联系方式',
      fields: ['email', 'phone', 'address']
    }
  ]
})
```

**建议**：
- 按用户思维流程排列字段
- 相关字段放在一起
- 重要字段放在前面
- 使用分组组织大型表单

## 性能优化

### 1. 验证时机

**好的做法 ✅**
```typescript
const form = createForm({
  validateOnChange: false,  // 不在输入时验证
  validateOnBlur: true,     // 失焦时验证
  validateOnSubmit: true    // 提交时验证
})
```

**原因**：减少不必要的验证调用，提升用户体验。

### 2. 异步验证防抖

**好的做法 ✅**
```typescript
import { debounce } from '@ldesign/form/utils'

const checkUsername = debounce(async (username) => {
  const response = await fetch(`/api/check-username?username=${username}`)
  return response.json()
}, 500)  // 500ms 防抖

const form = createForm({
  fields: [
    {
      name: 'username',
      rules: [
        {
          validator: async (value) => {
            const { available } = await checkUsername(value)
            return { valid: available, message: '用户名已存在' }
          }
        }
      ]
    }
  ]
})
```

**原因**：避免频繁的 API 调用。

### 3. 大数据量优化

**好的做法 ✅**
```vue
<template>
  <SelectField
    v-model="city"
    :options="cityOptions"
    filterable
    virtualScroll
    :maxHeight="300"
  />
</template>
```

**建议**：
- 对于大量选项，启用虚拟滚动
- 实现搜索过滤
- 考虑分页或懒加载
- 使用远程搜索

### 4. 避免不必要的重渲染

**好的做法 ✅**
```vue
<script setup>
import { computed } from 'vue'

// 使用 computed 缓存计算结果
const filteredOptions = computed(() => {
  return options.value.filter(opt => 
    opt.label.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})
</script>
```

**建议**：
- 使用 `computed` 缓存计算属性
- 避免在模板中执行复杂逻辑
- 合理使用 `v-show` 和 `v-if`

## 验证规则设计

### 1. 明确的错误消息

**好的做法 ✅**
```typescript
{
  name: 'password',
  rules: [
    { validator: required, message: '请输入密码' },
    { 
      validator: passwordStrength('medium'), 
      message: '密码至少8个字符，且包含数字和字母' 
    }
  ]
}
```

**不好的做法 ❌**
```typescript
{
  name: 'password',
  rules: [
    { validator: required, message: '必填' },
    { validator: passwordStrength('medium'), message: '格式不正确' }
  ]
}
```

**建议**：
- 错误消息要具体明确
- 告诉用户如何修正错误
- 使用友好的语言

### 2. 合理的验证顺序

**好的做法 ✅**
```typescript
{
  name: 'email',
  rules: [
    { validator: required, message: '请输入邮箱' },  // 先验证必填
    { validator: email, message: '请输入有效的邮箱地址' },  // 再验证格式
    { 
      validator: uniqueEmail(checkEmail),  // 最后验证唯一性（异步）
      message: '该邮箱已被注册' 
    }
  ]
}
```

**原因**：按从简单到复杂的顺序验证，避免不必要的异步调用。

### 3. 跨字段验证

**好的做法 ✅**
```typescript
{
  name: 'endDate',
  rules: [
    {
      validator: compareWith('startDate', 'gte'),
      message: '结束日期不能早于开始日期'
    }
  ],
  dependencies: ['startDate']  // 声明依赖
}
```

**建议**：
- 明确声明字段依赖
- 在依赖字段变化时重新验证
- 提供清晰的错误提示

## 错误处理

### 1. 优雅的错误展示

**好的做法 ✅**
```vue
<template>
  <div class="form-item">
    <InputField
      v-model="email"
      :error="!!emailError"
      @blur="validateEmail"
    />
    <transition name="fade">
      <span v-if="emailError" class="error-message">
        {{ emailError }}
      </span>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

**建议**：
- 使用动画过渡
- 错误消息就近显示
- 提供视觉反馈（颜色、图标）

### 2. 表单级错误摘要

**好的做法 ✅**
```vue
<template>
  <div v-if="formErrors.length" class="form-errors">
    <h4>请修正以下错误：</h4>
    <ul>
      <li v-for="error in formErrors" :key="error.field">
        <a @click="focusField(error.field)">
          {{ error.label }}: {{ error.message }}
        </a>
      </li>
    </ul>
  </div>
</template>
```

**建议**：
- 在表单顶部显示所有错误
- 错误可点击跳转到对应字段
- 突出显示（颜色、位置）

### 3. 提交错误处理

**好的做法 ✅**
```typescript
const form = createForm({
  onSubmit: async (values) => {
    try {
      const response = await api.submitForm(values)
      showSuccessMessage('提交成功！')
      router.push('/success')
    } catch (error) {
      if (error.status === 400) {
        // 业务错误
        showErrorMessage(error.message)
      } else if (error.status === 500) {
        // 服务器错误
        showErrorMessage('服务器错误，请稍后重试')
      } else {
        // 网络错误
        showErrorMessage('网络错误，请检查您的连接')
      }
    }
  }
})
```

**建议**：
- 区分不同类型的错误
- 提供有意义的错误消息
- 考虑重试机制
- 保留用户已填写的数据

## 代码组织

### 1. 提取表单配置

**好的做法 ✅**
```typescript
// forms/user-profile.form.ts
export const userProfileFormConfig = {
  initialValues: {
    username: '',
    email: '',
    // ...
  },
  fields: [
    {
      name: 'username',
      label: '用户名',
      rules: [/* ... */]
    },
    // ...
  ]
}

// UserProfile.vue
import { userProfileFormConfig } from './forms/user-profile.form'

const form = createForm(userProfileFormConfig)
```

**建议**：
- 将表单配置提取到单独文件
- 便于复用和维护
- 便于测试

### 2. 复用验证规则

**好的做法 ✅**
```typescript
// validators/common.ts
export const usernameRules = [
  { validator: required, message: '请输入用户名' },
  { validator: minLength(3), message: '至少3个字符' },
  { validator: maxLength(20), message: '最多20个字符' },
  { validator: pattern(/^[a-zA-Z0-9_]+$/), message: '只能包含字母、数字和下划线' }
]

export const emailRules = [
  { validator: required, message: '请输入邮箱' },
  { validator: email, message: '请输入有效的邮箱地址' }
]

// 使用
{
  name: 'username',
  rules: usernameRules
}
```

**建议**：
- 提取常用验证规则
- 保持规则的一致性
- 便于维护和更新

### 3. 模块化字段组件

**好的做法 ✅**
```typescript
// components/forms/UserBasicInfo.vue
<template>
  <div class="user-basic-info">
    <InputField v-model="form.username" label="用户名" />
    <InputField v-model="form.email" label="邮箱" />
    <SelectField v-model="form.gender" :options="genderOptions" label="性别" />
  </div>
</template>

// 在主表单中使用
<template>
  <form>
    <UserBasicInfo v-model="formData.basic" />
    <UserContactInfo v-model="formData.contact" />
    <UserWorkInfo v-model="formData.work" />
  </form>
</template>
```

**建议**：
- 将相关字段组合成子组件
- 提高可复用性
- 简化主表单逻辑

## 用户体验

### 1. 提供即时反馈

**好的做法 ✅**
```vue
<template>
  <InputField
    v-model="username"
    :loading="checking"
    :status="usernameStatus"
  >
    <template #suffix>
      <span v-if="checking">检查中...</span>
      <span v-else-if="usernameStatus === 'success'">✓ 可用</span>
      <span v-else-if="usernameStatus === 'error'">✗ 已被使用</span>
    </template>
  </InputField>
</template>
```

**建议**：
- 显示验证状态
- 成功时给予正向反馈
- 失败时立即提示

### 2. 保存进度

**好的做法 ✅**
```typescript
import { watch, debounce } from 'vue'

// 自动保存草稿
const saveDraft = debounce(async (values) => {
  await api.saveDraft(values)
  showToast('已自动保存')
}, 2000)

watch(() => form.getFieldsValue(), (values) => {
  saveDraft(values)
}, { deep: true })
```

**建议**：
- 实现自动保存
- 提供手动保存选项
- 显示保存状态
- 支持离线保存（localStorage）

### 3. 键盘导航

**建议**：
- 合理设置 `tabindex`
- 支持 Enter 提交
- 支持 Esc 取消
- 提供快捷键提示

### 4. 移动端优化

**好的做法 ✅**
```vue
<template>
  <InputField
    v-model="phone"
    type="tel"
    inputmode="numeric"
    pattern="[0-9]*"
  />
  
  <InputField
    v-model="email"
    type="email"
    inputmode="email"
  />
</template>
```

**建议**：
- 使用合适的输入类型
- 设置 `inputmode` 优化虚拟键盘
- 考虑触摸操作的友好性
- 测试各种屏幕尺寸

## 安全性

### 1. 客户端验证不是安全措施

**重要 ⚠️**
```typescript
// 客户端验证
const form = createForm({
  fields: [
    {
      name: 'amount',
      rules: [
        { validator: min(0), message: '金额不能为负数' },
        { validator: max(10000), message: '金额不能超过10000' }
      ]
    }
  ]
})

// 但服务端也必须验证！
// server.js
app.post('/api/transfer', (req, res) => {
  const { amount } = req.body
  
  // 服务端验证
  if (amount < 0 || amount > 10000) {
    return res.status(400).json({ error: '无效的金额' })
  }
  
  // 处理业务逻辑...
})
```

**建议**：
- 客户端验证提升用户体验
- 服务端验证确保安全性
- 永远不要信任客户端数据

### 2. 敏感信息处理

**好的做法 ✅**
```typescript
// 不要在客户端存储敏感信息
// 密码应该加密传输
const form = createForm({
  onSubmit: async (values) => {
    // 使用 HTTPS
    const response = await fetch('https://api.example.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password  // 通过 HTTPS 加密传输
      })
    })
    
    // 不要在客户端保存密码
    // 清除敏感数据
    values.password = ''
  }
})
```

**建议**：
- 使用 HTTPS
- 不在客户端存储密码
- 实现 CSRF 保护
- 遵循最小权限原则

### 3. XSS 防护

**好的做法 ✅**
```vue
<template>
  <!-- Vue 默认转义，安全 -->
  <div>{{ userInput }}</div>
  
  <!-- 避免使用 v-html，除非必要且已清理 -->
  <div v-html="sanitizedHTML"></div>
</template>

<script setup>
import DOMPurify from 'dompurify'

const sanitizedHTML = computed(() => {
  return DOMPurify.sanitize(rawHTML.value)
})
</script>
```

**建议**：
- 避免使用 `v-html`
- 如需使用，先清理 HTML
- 验证和转义用户输入

## 测试

### 1. 单元测试

```typescript
import { describe, it, expect } from 'vitest'
import { createForm } from '@ldesign/form'
import { required, email } from '@ldesign/form/validators'

describe('UserForm', () => {
  it('should validate required fields', async () => {
    const form = createForm({
      initialValues: { email: '' },
      fields: [
        {
          name: 'email',
          rules: [
            { validator: required, message: '请输入邮箱' }
          ]
        }
      ]
    })
    
    const result = await form.validate()
    expect(result.valid).toBe(false)
    expect(result.errors.email).toContain('请输入邮箱')
  })
  
  it('should validate email format', async () => {
    const form = createForm({
      initialValues: { email: 'invalid' },
      fields: [
        {
          name: 'email',
          rules: [
            { validator: email, message: '邮箱格式不正确' }
          ]
        }
      ]
    })
    
    const result = await form.validate()
    expect(result.valid).toBe(false)
  })
})
```

### 2. 集成测试

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UserProfileForm from './UserProfileForm.vue'

describe('UserProfileForm', () => {
  it('should submit form with valid data', async () => {
    const wrapper = mount(UserProfileForm)
    
    // 填写表单
    await wrapper.find('#username').setValue('testuser')
    await wrapper.find('#email').setValue('test@example.com')
    
    // 提交表单
    await wrapper.find('form').trigger('submit')
    
    // 验证提交
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      username: 'testuser',
      email: 'test@example.com'
    })
  })
})
```

### 3. E2E 测试

```typescript
import { test, expect } from '@playwright/test'

test('user registration flow', async ({ page }) => {
  await page.goto('/register')
  
  // 填写表单
  await page.fill('#username', 'testuser')
  await page.fill('#email', 'test@example.com')
  await page.fill('#password', 'password123')
  await page.fill('#confirmPassword', 'password123')
  
  // 提交表单
  await page.click('button[type="submit"]')
  
  // 验证成功消息
  await expect(page.locator('.success-message')).toBeVisible()
})
```

**建议**：
- 测试验证规则
- 测试用户交互
- 测试错误场景
- 测试完整流程

---

## 总结

遵循这些最佳实践可以帮助你：

1. 构建更好的用户体验
2. 提高代码质量和可维护性
3. 优化性能
4. 确保安全性
5. 简化测试

记住，最佳实践不是死板的规则，而是指导原则。根据具体情况灵活应用，持续改进。

## 相关文档

- [字段类型](./field-types.md)
- [高级功能](./advanced-features.md)
- [真实场景示例](./real-world-examples.md)
- [API 参考](../README.md)






