<template>
  <div class="adapter-example">
    <h2>适配器示例</h2>
    <p class="description">
      演示 @ldesign/form 的适配器系统，展示如何使用框架无关的核心API。
    </p>

    <div class="examples-container">
      <!-- Vanilla 适配器示例 -->
      <div class="card">
        <div class="card__header">
          <h3>Vanilla JavaScript 适配器</h3>
          <p>使用原生JavaScript适配器渲染表单</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <div ref="vanillaFormContainer" class="form-container"></div>
              <div class="form-actions">
                <button @click="submitVanilla" class="btn btn--primary">提交</button>
                <button @click="resetVanilla" class="btn">重置</button>
                <button @click="validateVanilla" class="btn">验证</button>
              </div>
            </div>
            <div class="form-demo__result">
              <h4>表单数据</h4>
              <pre>{{ JSON.stringify(vanillaData, null, 2) }}</pre>
              <h4 v-if="vanillaValidation">验证结果</h4>
              <pre v-if="vanillaValidation">{{ JSON.stringify(vanillaValidation, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 手动渲染示例 -->
      <div class="card">
        <div class="card__header">
          <h3>手动渲染</h3>
          <p>不使用适配器，手动处理表单渲染和事件</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <form @submit.prevent="submitManual" class="manual-form">
                <div class="form-field">
                  <label class="form-field__label">姓名</label>
                  <input
                    v-model="manualData.name"
                    @input="handleManualInput('name', $event)"
                    @blur="handleManualBlur('name')"
                    class="form-field__input"
                    :class="{ 'form-field__input--error': manualErrors.name }"
                    type="text"
                    placeholder="请输入姓名"
                  />
                  <div v-if="manualErrors.name" class="form-field__error">
                    {{ manualErrors.name }}
                  </div>
                </div>

                <div class="form-field">
                  <label class="form-field__label">邮箱</label>
                  <input
                    v-model="manualData.email"
                    @input="handleManualInput('email', $event)"
                    @blur="handleManualBlur('email')"
                    class="form-field__input"
                    :class="{ 'form-field__input--error': manualErrors.email }"
                    type="email"
                    placeholder="请输入邮箱"
                  />
                  <div v-if="manualErrors.email" class="form-field__error">
                    {{ manualErrors.email }}
                  </div>
                </div>

                <div class="form-field">
                  <label class="form-field__label">年龄</label>
                  <input
                    v-model="manualData.age"
                    @input="handleManualInput('age', $event)"
                    @blur="handleManualBlur('age')"
                    class="form-field__input"
                    :class="{ 'form-field__input--error': manualErrors.age }"
                    type="number"
                    placeholder="请输入年龄"
                  />
                  <div v-if="manualErrors.age" class="form-field__error">
                    {{ manualErrors.age }}
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary">提交</button>
                  <button type="button" @click="resetManual" class="btn">重置</button>
                  <button type="button" @click="validateManual" class="btn">验证</button>
                </div>
              </form>
            </div>
            <div class="form-demo__result">
              <h4>表单数据</h4>
              <pre>{{ JSON.stringify(manualData, null, 2) }}</pre>
              <h4>表单状态</h4>
              <pre>{{ JSON.stringify(manualState, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- API 使用示例 -->
      <div class="card">
        <div class="card__header">
          <h3>核心 API 使用</h3>
          <p>展示如何直接使用表单核心API</p>
        </div>
        <div class="card__content">
          <div class="api-demo">
            <div class="api-controls">
              <h4>数据操作</h4>
              <div class="control-group">
                <button @click="setRandomData" class="btn">设置随机数据</button>
                <button @click="getFormData" class="btn">获取表单数据</button>
                <button @click="clearFormData" class="btn">清空数据</button>
              </div>

              <h4>验证操作</h4>
              <div class="control-group">
                <button @click="validateSingleField" class="btn">验证单个字段</button>
                <button @click="validateAllFields" class="btn">验证所有字段</button>
                <button @click="clearValidation" class="btn">清除验证</button>
              </div>

              <h4>状态操作</h4>
              <div class="control-group">
                <button @click="getFormState" class="btn">获取表单状态</button>
                <button @click="resetFormState" class="btn">重置状态</button>
              </div>
            </div>
            <div class="api-result">
              <h4>操作结果</h4>
              <pre>{{ JSON.stringify(apiResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { createForm, VanillaAdapter } from '@ldesign/form'

const vanillaFormContainer = ref<HTMLElement>()

const vanillaData = ref({})
const vanillaValidation = ref<any>(null)

const manualData = reactive({
  name: '',
  email: '',
  age: ''
})

const manualErrors = reactive({
  name: '',
  email: '',
  age: ''
})

const manualState = reactive({
  valid: false,
  touched: false,
  dirty: false,
  submitting: false
})

const apiResult = ref<any>(null)

let vanillaForm: any = null
let manualForm: any = null
let vanillaAdapter: VanillaAdapter | null = null

onMounted(() => {
  setupVanillaForm()
  setupManualForm()
})

onUnmounted(() => {
  try {
    if (vanillaAdapter) {
      vanillaAdapter.unmount()
      vanillaAdapter = null
    }
  } catch (error) {
    console.warn('Error unmounting vanilla adapter:', error)
  }

  try {
    if (vanillaForm) {
      vanillaForm.destroy()
      vanillaForm = null
    }
  } catch (error) {
    console.warn('Error destroying vanilla form:', error)
  }

  try {
    if (manualForm) {
      manualForm.destroy()
      manualForm = null
    }
  } catch (error) {
    console.warn('Error destroying manual form:', error)
  }
})

// 设置 Vanilla 适配器表单
const setupVanillaForm = () => {
  if (!vanillaFormContainer.value) return

  vanillaForm = createForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      message: ''
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        placeholder: '请输入姓名',
        rules: [{ type: 'required', message: '请输入姓名' }]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        placeholder: '请输入邮箱',
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'phone',
        label: '手机号',
        type: 'input',
        placeholder: '请输入手机号',
        rules: [
          { type: 'required', message: '请输入手机号' },
          { type: 'phone', message: '请输入有效的手机号码' }
        ]
      },
      {
        name: 'message',
        label: '留言',
        type: 'textarea',
        placeholder: '请输入留言内容...',
        rules: [
          { type: 'required', message: '请输入留言' },
          { type: 'minLength', message: '留言至少10个字符', params: { min: 10 } }
        ]
      }
    ]
  }, {
    onValuesChange: (values) => {
      vanillaData.value = values
    },
    onSubmit: async (values) => {
      console.log('Vanilla 表单提交:', values)
      alert('Vanilla 表单提交成功！')
    }
  })

  vanillaAdapter = new VanillaAdapter()
  vanillaAdapter.mount(vanillaForm, vanillaFormContainer.value)
  
  vanillaData.value = vanillaForm.getData()
}

// 设置手动表单
const setupManualForm = () => {
  manualForm = createForm({
    initialValues: {
      name: '',
      email: '',
      age: ''
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        rules: [{ type: 'required', message: '请输入姓名' }]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      },
      {
        name: 'age',
        label: '年龄',
        type: 'input',
        rules: [
          { type: 'required', message: '请输入年龄' },
          { type: 'min', message: '年龄不能小于0', params: { min: 0 } }
        ]
      }
    ]
  })

  // 同步数据
  Object.assign(manualData, manualForm.getData())
}

// Vanilla 表单操作
const submitVanilla = async () => {
  if (!vanillaForm) return
  try {
    await vanillaForm.submit()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const resetVanilla = () => {
  if (!vanillaForm) return
  vanillaForm.reset()
  vanillaValidation.value = null
}

const validateVanilla = async () => {
  if (!vanillaForm) return
  vanillaValidation.value = await vanillaForm.validate()
}

// 手动表单操作
const handleManualInput = (field: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // 更新表单数据
  manualForm.setFieldValue(field, value)
  
  // 清除错误
  manualErrors[field as keyof typeof manualErrors] = ''
  
  // 更新状态
  manualState.dirty = true
}

const handleManualBlur = async (field: string) => {
  manualState.touched = true
  
  // 验证单个字段
  try {
    const result = await manualForm.validateField(field)
    if (!result.valid && result.errors && result.errors.length > 0) {
      manualErrors[field as keyof typeof manualErrors] = result.errors[0]
    }
  } catch (error) {
    console.error('验证失败:', error)
  }
}

const submitManual = async () => {
  manualState.submitting = true
  
  try {
    const result = await manualForm.validate()
    if (result.valid) {
      console.log('手动表单提交:', manualData)
      alert('手动表单提交成功！')
      manualState.valid = true
    } else {
      // 显示错误
      if (result.errors) {
        Object.keys(result.errors).forEach(field => {
          const errors = result.errors![field]
          if (errors && errors.length > 0) {
            manualErrors[field as keyof typeof manualErrors] = errors[0]
          }
        })
      }
      manualState.valid = false
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    manualState.submitting = false
  }
}

const resetManual = () => {
  if (!manualForm) return
  
  manualForm.reset()
  Object.assign(manualData, manualForm.getData())
  
  // 清除错误和状态
  Object.keys(manualErrors).forEach(key => {
    manualErrors[key as keyof typeof manualErrors] = ''
  })
  
  Object.assign(manualState, {
    valid: false,
    touched: false,
    dirty: false,
    submitting: false
  })
}

const validateManual = async () => {
  if (!manualForm) return
  
  try {
    const result = await manualForm.validate()
    
    // 清除所有错误
    Object.keys(manualErrors).forEach(key => {
      manualErrors[key as keyof typeof manualErrors] = ''
    })
    
    // 显示新错误
    if (!result.valid && result.errors) {
      Object.keys(result.errors).forEach(field => {
        const errors = result.errors![field]
        if (errors && errors.length > 0) {
          manualErrors[field as keyof typeof manualErrors] = errors[0]
        }
      })
    }
    
    manualState.valid = result.valid
  } catch (error) {
    console.error('验证失败:', error)
  }
}

// API 操作示例
const setRandomData = () => {
  if (!vanillaForm) return
  
  const randomData = {
    name: `用户${Math.floor(Math.random() * 1000)}`,
    email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    message: `这是一条随机生成的留言内容 ${Math.floor(Math.random() * 1000)}`
  }
  
  vanillaForm.setData(randomData)
  apiResult.value = { action: 'setRandomData', data: randomData }
}

const getFormData = () => {
  if (!vanillaForm) return
  
  const data = vanillaForm.getData()
  apiResult.value = { action: 'getFormData', data }
}

const clearFormData = () => {
  if (!vanillaForm) return
  
  vanillaForm.setData({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  
  apiResult.value = { action: 'clearFormData', success: true }
}

const validateSingleField = async () => {
  if (!vanillaForm) return
  
  const result = await vanillaForm.validateField('email')
  apiResult.value = { action: 'validateSingleField', field: 'email', result }
}

const validateAllFields = async () => {
  if (!vanillaForm) return
  
  const result = await vanillaForm.validate()
  apiResult.value = { action: 'validateAllFields', result }
}

const clearValidation = () => {
  if (!vanillaForm) return
  
  // 这里可以添加清除验证的逻辑
  apiResult.value = { action: 'clearValidation', success: true }
}

const getFormState = () => {
  if (!vanillaForm) return
  
  const state = vanillaForm.getState()
  apiResult.value = { action: 'getFormState', state }
}

const resetFormState = () => {
  if (!vanillaForm) return
  
  vanillaForm.reset()
  apiResult.value = { action: 'resetFormState', success: true }
}
</script>

<style lang="less" scoped>
.adapter-example {
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
  flex-wrap: wrap;
}

.manual-form {
  .form-field {
    margin-bottom: var(--ls-margin-base);
  }
}

.api-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ls-spacing-lg);
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.api-controls {
  h4 {
    margin: var(--ls-margin-base) 0 var(--ls-margin-sm);
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-base);

    &:first-child {
      margin-top: 0;
    }
  }
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
  margin-bottom: var(--ls-margin-base);

  .btn {
    justify-content: flex-start;
  }
}

.api-result {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);

  h4 {
    margin: 0 0 var(--ls-margin-sm);
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-base);
  }

  pre {
    margin: 0;
    font-size: var(--ls-font-size-xs);
    line-height: 1.4;
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>
