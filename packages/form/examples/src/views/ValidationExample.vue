<template>
  <div class="validation-example">
    <h2>验证示例</h2>
    <p class="description">
      演示 @ldesign/form 的各种验证功能，包括内置验证器、自定义验证器和异步验证。
    </p>

    <div class="examples-container">
      <!-- 内置验证器示例 -->
      <div class="card">
        <div class="card__header">
          <h3>内置验证器</h3>
          <p>展示常用的内置验证规则</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <div ref="builtinFormContainer" class="form-container"></div>
              <div class="form-actions">
                <button @click="validateBuiltin" class="btn btn--primary">验证</button>
                <button @click="resetBuiltin" class="btn">重置</button>
              </div>
            </div>
            <div class="form-demo__result">
              <h4>验证结果</h4>
              <pre>{{ JSON.stringify(builtinResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义验证器示例 -->
      <div class="card">
        <div class="card__header">
          <h3>自定义验证器</h3>
          <p>展示如何创建和使用自定义验证器</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <div ref="customFormContainer" class="form-container"></div>
              <div class="form-actions">
                <button @click="validateCustom" class="btn btn--primary">验证</button>
                <button @click="resetCustom" class="btn">重置</button>
              </div>
            </div>
            <div class="form-demo__result">
              <h4>验证结果</h4>
              <pre>{{ JSON.stringify(customResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 异步验证示例 -->
      <div class="card">
        <div class="card__header">
          <h3>异步验证</h3>
          <p>展示异步验证功能，模拟服务器端验证</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <div ref="asyncFormContainer" class="form-container"></div>
              <div class="form-actions">
                <button @click="validateAsync" class="btn btn--primary">验证</button>
                <button @click="resetAsync" class="btn">重置</button>
              </div>
            </div>
            <div class="form-demo__result">
              <h4>验证结果</h4>
              <pre>{{ JSON.stringify(asyncResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createForm, VanillaAdapter } from '@ldesign/form'
import { custom } from '../../../src/utils/validation-rules'

const builtinFormContainer = ref<HTMLElement>()
const customFormContainer = ref<HTMLElement>()
const asyncFormContainer = ref<HTMLElement>()

const builtinResult = ref<any>(null)
const customResult = ref<any>(null)
const asyncResult = ref<any>(null)

let builtinForm: any = null
let customForm: any = null
let asyncForm: any = null

let builtinAdapter: VanillaAdapter | null = null
let customAdapter: VanillaAdapter | null = null
let asyncAdapter: VanillaAdapter | null = null

onMounted(() => {
  setupBuiltinForm()
  setupCustomForm()
  setupAsyncForm()
})

onUnmounted(() => {
  // 清理资源
  if (builtinAdapter) builtinAdapter.unmount()
  if (customAdapter) customAdapter.unmount()
  if (asyncAdapter) asyncAdapter.unmount()
  
  if (builtinForm) builtinForm.destroy()
  if (customForm) customForm.destroy()
  if (asyncForm) asyncForm.destroy()
})

// 设置内置验证器表单
const setupBuiltinForm = () => {
  if (!builtinFormContainer.value) return

  builtinForm = createForm({
    initialValues: {
      email: '',
      url: '',
      phone: '',
      age: '',
      password: ''
    },
    fields: [
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        placeholder: '请输入邮箱地址',
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'url',
        label: '网站',
        type: 'input',
        placeholder: '请输入网站地址',
        rules: [
          { type: 'url', message: '请输入有效的URL地址' }
        ]
      },
      {
        name: 'phone',
        label: '手机号',
        type: 'input',
        placeholder: '请输入手机号码',
        rules: [
          { type: 'required', message: '请输入手机号' },
          { type: 'phone', message: '请输入有效的手机号码' }
        ]
      },
      {
        name: 'age',
        label: '年龄',
        type: 'input',
        placeholder: '请输入年龄',
        rules: [
          { type: 'required', message: '请输入年龄' },
          { type: 'min', message: '年龄不能小于18', params: { min: 18 } },
          { type: 'max', message: '年龄不能大于65', params: { max: 65 } }
        ]
      },
      {
        name: 'password',
        label: '密码',
        type: 'password',
        placeholder: '请输入密码',
        rules: [
          { type: 'required', message: '请输入密码' },
          { type: 'minLength', message: '密码至少6位', params: { min: 6 } }
        ]
      }
    ]
  })

  builtinAdapter = new VanillaAdapter()
  builtinAdapter.mount(builtinForm, builtinFormContainer.value)
}

// 设置自定义验证器表单
const setupCustomForm = () => {
  if (!customFormContainer.value) return

  // 自定义验证器：密码强度
  const passwordStrengthValidator = custom((value: string) => {
    if (!value) return true
    
    const hasLower = /[a-z]/.test(value)
    const hasUpper = /[A-Z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    
    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
    
    if (strength < 3) {
      return '密码强度不够，需要包含大小写字母、数字和特殊字符中的至少3种'
    }
    
    return true
  })

  // 自定义验证器：确认密码
  const confirmPasswordValidator = custom((value: string, context: any) => {
    const password = context.formData.password
    if (value !== password) {
      return '两次输入的密码不一致'
    }
    return true
  })

  customForm = createForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: ''
    },
    fields: [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        placeholder: '请输入用户名',
        rules: [
          { type: 'required', message: '请输入用户名' },
          { 
            type: 'custom', 
            message: '用户名只能包含字母、数字和下划线',
            validator: custom((value: string) => {
              return /^[a-zA-Z0-9_]+$/.test(value)
            })
          }
        ]
      },
      {
        name: 'password',
        label: '密码',
        type: 'password',
        placeholder: '请输入密码',
        rules: [
          { type: 'required', message: '请输入密码' },
          { type: 'minLength', message: '密码至少8位', params: { min: 8 } },
          { type: 'custom', validator: passwordStrengthValidator }
        ]
      },
      {
        name: 'confirmPassword',
        label: '确认密码',
        type: 'password',
        placeholder: '请再次输入密码',
        rules: [
          { type: 'required', message: '请确认密码' },
          { type: 'custom', validator: confirmPasswordValidator }
        ]
      }
    ]
  })

  customAdapter = new VanillaAdapter()
  customAdapter.mount(customForm, customFormContainer.value)
}

// 设置异步验证表单
const setupAsyncForm = () => {
  if (!asyncFormContainer.value) return

  // 模拟异步验证：检查用户名是否存在
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟已存在的用户名
    const existingUsernames = ['admin', 'user', 'test', 'demo']
    return existingUsernames.includes(username.toLowerCase())
  }

  // 异步验证器
  const asyncUsernameValidator = custom(async (value: string) => {
    if (!value) return true
    
    const exists = await checkUsernameExists(value)
    if (exists) {
      return '用户名已存在，请选择其他用户名'
    }
    
    return true
  })

  asyncForm = createForm({
    initialValues: {
      username: '',
      email: ''
    },
    fields: [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        placeholder: '请输入用户名（试试 admin, user, test）',
        rules: [
          { type: 'required', message: '请输入用户名' },
          { type: 'minLength', message: '用户名至少3位', params: { min: 3 } },
          { type: 'custom', validator: asyncUsernameValidator }
        ]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        placeholder: '请输入邮箱地址',
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      }
    ]
  })

  asyncAdapter = new VanillaAdapter()
  asyncAdapter.mount(asyncForm, asyncFormContainer.value)
}

// 验证方法
const validateBuiltin = async () => {
  if (!builtinForm) return
  builtinResult.value = await builtinForm.validate()
}

const validateCustom = async () => {
  if (!customForm) return
  customResult.value = await customForm.validate()
}

const validateAsync = async () => {
  if (!asyncForm) return
  asyncResult.value = await asyncForm.validate()
}

// 重置方法
const resetBuiltin = () => {
  if (!builtinForm) return
  builtinForm.reset()
  builtinResult.value = null
}

const resetCustom = () => {
  if (!customForm) return
  customForm.reset()
  customResult.value = null
}

const resetAsync = () => {
  if (!asyncForm) return
  asyncForm.reset()
  asyncResult.value = null
}
</script>

<style lang="less" scoped>
.validation-example {
  h2 {
    margin: 0 0 var(--ls-margin-sm);
    color: var(--ldesign-text-color-primary);
  }

  .description {
    margin: 0 0 var(--ls-margin-xl);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.6;
  }
}

.examples-container {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xl);
}

.form-container {
  margin-bottom: var(--ls-margin-base);
}

.form-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-color);
}
</style>
