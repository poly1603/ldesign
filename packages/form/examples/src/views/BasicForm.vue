<template>
  <div class="basic-form">
    <h2>基础表单示例</h2>
    <p class="description">
      演示如何使用 @ldesign/form 创建基础表单，包括数据绑定、事件处理和表单提交。
    </p>

    <div class="form-demo">
      <!-- 表单区域 -->
      <div class="form-demo__form">
        <div class="card">
          <div class="card__header">
            <h3>用户信息表单</h3>
            <p>请填写以下信息</p>
          </div>
          <div class="card__content">
            <div ref="formContainer" class="form-container">
              <!-- 表单将在这里渲染 -->
            </div>
            <div class="form-actions">
              <button @click="handleSubmit" class="btn btn--primary">提交</button>
              <button @click="handleReset" class="btn">重置</button>
              <button @click="handleValidate" class="btn">验证</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果显示区域 -->
      <div class="form-demo__result">
        <div class="result-section">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
        
        <div class="result-section">
          <h4>表单状态</h4>
          <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
        </div>

        <div class="result-section" v-if="validationResult">
          <h4>验证结果</h4>
          <pre>{{ JSON.stringify(validationResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createForm, VanillaAdapter } from '@ldesign/form'

const formContainer = ref<HTMLElement>()
const formData = ref({})
const formState = ref({})
const validationResult = ref<any>(null)

let form: any = null
let adapter: VanillaAdapter | null = null

onMounted(() => {
  if (!formContainer.value) return

  // 创建表单实例
  form = createForm({
    initialValues: {
      name: '',
      email: '',
      age: '',
      phone: '',
      address: '',
      bio: ''
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        placeholder: '请输入您的姓名',
        rules: [{ type: 'required', message: '请输入姓名' }]
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
      },
      {
        name: 'age',
        label: '年龄',
        type: 'input',
        placeholder: '请输入年龄',
        rules: [
          { type: 'required', message: '请输入年龄' },
          { type: 'min', message: '年龄不能小于0', params: { min: 0 } },
          { type: 'max', message: '年龄不能大于150', params: { max: 150 } }
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
        name: 'address',
        label: '地址',
        type: 'input',
        placeholder: '请输入详细地址',
        rules: [
          { type: 'minLength', message: '地址至少5个字符', params: { min: 5 } }
        ]
      },
      {
        name: 'bio',
        label: '个人简介',
        type: 'textarea',
        placeholder: '请简单介绍一下自己...',
        rules: [
          { type: 'maxLength', message: '简介不能超过200字符', params: { max: 200 } }
        ]
      }
    ]
  }, {
    onValuesChange: (values) => {
      formData.value = values
    },
    onFieldChange: (name, value) => {
      console.log(`字段 ${name} 变化为:`, value)
    },
    onSubmit: async (values) => {
      console.log('提交数据:', values)
      alert('表单提交成功！\n' + JSON.stringify(values, null, 2))
    }
  })

  // 创建适配器并挂载
  adapter = new VanillaAdapter()
  adapter.mount(form, formContainer.value)

  // 监听状态变化
  form.on('state:change', (state: any) => {
    formState.value = state
  })

  // 初始化数据
  formData.value = form.getData()
  formState.value = form.getState()
})

onUnmounted(() => {
  try {
    if (adapter) {
      adapter.unmount()
      adapter = null
    }
  } catch (error) {
    console.warn('Error unmounting adapter:', error)
  }

  try {
    if (form) {
      form.destroy()
      form = null
    }
  } catch (error) {
    console.warn('Error destroying form:', error)
  }
})

// 处理提交
const handleSubmit = async () => {
  if (!form) {
    console.warn('Form instance not available')
    return
  }

  try {
    await form.submit()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.message?.includes('destroyed')) {
      console.warn('Form has been destroyed, skipping submit')
    }
  }
}

// 处理重置
const handleReset = () => {
  if (!form) {
    console.warn('Form instance not available')
    return
  }

  try {
    form.reset()
    validationResult.value = null
  } catch (error) {
    console.error('重置失败:', error)
    if (error.message?.includes('destroyed')) {
      console.warn('Form has been destroyed, skipping reset')
    }
  }
}

// 处理验证
const handleValidate = async () => {
  if (!form) {
    console.warn('Form instance not available')
    return
  }

  try {
    const result = await form.validate()
    validationResult.value = result
    console.log('验证结果:', result)
  } catch (error) {
    console.error('验证失败:', error)
    if (error.message?.includes('destroyed')) {
      console.warn('Form has been destroyed, skipping validation')
    }
  }
}
</script>

<style lang="less" scoped>
.basic-form {
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

.form-container {
  margin-bottom: var(--ls-margin-base);
}

.form-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-color);
}

.result-section {
  margin-bottom: var(--ls-margin-base);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
