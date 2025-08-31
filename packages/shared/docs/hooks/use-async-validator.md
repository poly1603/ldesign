# useAsyncValidator

异步验证器 Hook，提供强大的异步验证功能，支持防抖、取消请求、错误处理等特性。

## 概述

`useAsyncValidator` 是一个专为 Vue 3 设计的异步验证 Hook，适用于需要服务端验证的场景，如：
- **用户名唯一性检查**：注册时检查用户名是否已存在
- **邮箱验证**：验证邮箱地址的有效性和可用性
- **实时数据验证**：表单字段的实时服务端验证
- **复杂业务规则验证**：需要调用 API 的复杂验证逻辑

## 安装和导入

```typescript
import { useAsyncValidator } from '@ldesign/shared'
```

## API 参考

### 基础用法

**函数签名**
```typescript
interface AsyncValidatorOptions<T> {
  validator: (value: T, signal?: AbortSignal) => Promise<boolean | string>
  debounce?: number
  immediate?: boolean
  dependencies?: Ref<any>[]
}

interface AsyncValidatorState {
  validating: boolean
  validated: boolean
  valid: boolean
  error: string | null
}

function useAsyncValidator<T>(
  value: Ref<T>,
  options: AsyncValidatorOptions<T>
): {
  state: Ref<AsyncValidatorState>
  trigger: () => Promise<void>
  clear: () => void
}
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| value | Ref\<T\> | ✓ | - | 要验证的响应式值 |
| options | AsyncValidatorOptions\<T\> | ✓ | - | 验证配置选项 |

**选项说明**

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| validator | Function | ✓ | - | 异步验证函数 |
| debounce | number | ✗ | 300 | 防抖延迟（毫秒） |
| immediate | boolean | ✗ | false | 是否立即执行验证 |
| dependencies | Ref\<any\>[] | ✗ | [] | 依赖项数组，变化时重新验证 |

**返回值**

| 属性 | 类型 | 描述 |
|------|------|------|
| state | Ref\<AsyncValidatorState\> | 验证状态 |
| trigger | Function | 手动触发验证 |
| clear | Function | 清除验证状态 |

**状态说明**

| 状态 | 类型 | 描述 |
|------|------|------|
| validating | boolean | 是否正在验证中 |
| validated | boolean | 是否已完成验证 |
| valid | boolean | 验证是否通过 |
| error | string \| null | 验证错误信息 |

## 使用示例

### 基础用户名验证

```vue
<template>
  <div>
    <input 
      v-model="username" 
      placeholder="请输入用户名"
      :class="{ 
        'validating': state.validating,
        'valid': state.validated && state.valid,
        'invalid': state.validated && !state.valid
      }"
    />
    
    <div v-if="state.validating" class="loading">
      正在检查用户名...
    </div>
    
    <div v-else-if="state.validated">
      <div v-if="state.valid" class="success">
        ✓ 用户名可用
      </div>
      <div v-else class="error">
        ✗ {{ state.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncValidator } from '@ldesign/shared'

const username = ref('')

// 模拟用户名检查 API
async function checkUsername(name: string, signal?: AbortSignal): Promise<boolean | string> {
  if (!name) return '用户名不能为空'
  if (name.length < 3) return '用户名至少需要3个字符'
  
  // 模拟 API 调用
  const response = await fetch(`/api/check-username?name=${name}`, { signal })
  
  if (!response.ok) {
    throw new Error('网络错误')
  }
  
  const data = await response.json()
  return data.available ? true : '用户名已被占用'
}

const { state, trigger, clear } = useAsyncValidator(username, {
  validator: checkUsername,
  debounce: 500, // 500ms 防抖
  immediate: false
})

// 手动触发验证
const handleCheck = () => {
  trigger()
}

// 清除验证状态
const handleClear = () => {
  clear()
}
</script>
```

### 邮箱验证与可用性检查

```vue
<template>
  <div class="email-validator">
    <label>邮箱地址</label>
    <input 
      v-model="email" 
      type="email"
      placeholder="请输入邮箱地址"
    />
    
    <div class="validation-status">
      <div v-if="state.validating" class="status validating">
        <span class="spinner"></span>
        正在验证邮箱...
      </div>
      
      <div v-else-if="state.validated" class="status">
        <div v-if="state.valid" class="success">
          ✓ 邮箱地址有效且可用
        </div>
        <div v-else class="error">
          ✗ {{ state.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncValidator, isValidEmail } from '@ldesign/shared'

const email = ref('')

async function validateEmail(emailValue: string, signal?: AbortSignal): Promise<boolean | string> {
  // 首先进行本地格式验证
  if (!emailValue) return '邮箱地址不能为空'
  if (!isValidEmail(emailValue)) return '邮箱格式不正确'
  
  try {
    // 检查邮箱是否已注册
    const response = await fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue }),
      signal
    })
    
    if (!response.ok) {
      throw new Error('验证服务暂时不可用')
    }
    
    const result = await response.json()
    
    if (!result.valid) {
      return '邮箱地址无效'
    }
    
    if (result.registered) {
      return '该邮箱已被注册'
    }
    
    return true
  } catch (error) {
    if (error.name === 'AbortError') {
      return '验证已取消'
    }
    return '验证失败，请稍后重试'
  }
}

const { state } = useAsyncValidator(email, {
  validator: validateEmail,
  debounce: 800
})
</script>
```

### 复杂表单验证

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>用户名</label>
      <input v-model="form.username" />
      <ValidationStatus :state="usernameValidator.state" />
    </div>
    
    <div class="form-group">
      <label>邮箱</label>
      <input v-model="form.email" type="email" />
      <ValidationStatus :state="emailValidator.state" />
    </div>
    
    <div class="form-group">
      <label>手机号</label>
      <input v-model="form.phone" />
      <ValidationStatus :state="phoneValidator.state" />
    </div>
    
    <button 
      type="submit" 
      :disabled="!canSubmit"
      :class="{ loading: isValidating }"
    >
      {{ isValidating ? '验证中...' : '注册' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAsyncValidator } from '@ldesign/shared'

const form = reactive({
  username: '',
  email: '',
  phone: ''
})

// 用户名验证
const usernameValidator = useAsyncValidator(
  toRef(form, 'username'),
  {
    validator: async (username) => {
      const response = await fetch(`/api/validate/username`, {
        method: 'POST',
        body: JSON.stringify({ username })
      })
      const result = await response.json()
      return result.valid ? true : result.message
    },
    debounce: 500
  }
)

// 邮箱验证
const emailValidator = useAsyncValidator(
  toRef(form, 'email'),
  {
    validator: async (email) => {
      const response = await fetch(`/api/validate/email`, {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      const result = await response.json()
      return result.valid ? true : result.message
    },
    debounce: 800
  }
)

// 手机号验证
const phoneValidator = useAsyncValidator(
  toRef(form, 'phone'),
  {
    validator: async (phone) => {
      const response = await fetch(`/api/validate/phone`, {
        method: 'POST',
        body: JSON.stringify({ phone })
      })
      const result = await response.json()
      return result.valid ? true : result.message
    },
    debounce: 600
  }
)

// 计算属性
const isValidating = computed(() => {
  return usernameValidator.state.value.validating ||
         emailValidator.state.value.validating ||
         phoneValidator.state.value.validating
})

const canSubmit = computed(() => {
  const validators = [usernameValidator, emailValidator, phoneValidator]
  return validators.every(v => v.state.value.validated && v.state.value.valid) &&
         !isValidating.value
})

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    
    if (response.ok) {
      console.log('注册成功')
    }
  } catch (error) {
    console.error('注册失败:', error)
  }
}
</script>
```

### 依赖项验证

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAsyncValidator } from '@ldesign/shared'

const password = ref('')
const confirmPassword = ref('')

// 确认密码验证，依赖于原密码
const { state: confirmState } = useAsyncValidator(confirmPassword, {
  validator: async (confirm) => {
    if (!confirm) return '请确认密码'
    if (confirm !== password.value) return '两次输入的密码不一致'
    return true
  },
  debounce: 300,
  dependencies: [password] // 当 password 变化时重新验证
})
</script>
```

## 高级特性

### 取消请求

```typescript
// 验证器会自动处理请求取消
const { state, clear } = useAsyncValidator(value, {
  validator: async (val, signal) => {
    // 使用 AbortSignal 支持请求取消
    const response = await fetch('/api/validate', { signal })
    return response.ok
  }
})

// 手动取消当前验证
clear()
```

### 错误处理

```typescript
const { state } = useAsyncValidator(value, {
  validator: async (val) => {
    try {
      const response = await fetch('/api/validate')
      const result = await response.json()
      return result.valid ? true : result.message
    } catch (error) {
      // 网络错误等异常情况
      return '验证服务暂时不可用，请稍后重试'
    }
  }
})
```

## 注意事项

### 性能优化
- 合理设置防抖时间，避免频繁的 API 调用
- 使用 AbortSignal 支持请求取消
- 考虑缓存验证结果以减少重复请求

### 用户体验
- 提供清晰的加载状态指示
- 显示有意义的错误消息
- 支持手动重试机制

### 错误处理
- 区分网络错误和验证错误
- 提供降级方案
- 记录错误日志用于调试

## 相关功能

- [useForm](/hooks/use-form) - 表单管理 Hook
- [useFormValidation](/hooks/use-form-validation) - 表单验证 Hook
- [验证函数](/utils/validate) - 同步验证工具函数
