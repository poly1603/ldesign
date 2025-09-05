<template>
  <div class="page-container">
    <header class="page-header">
      <h1 class="page-title">基础表单示例</h1>
      <p class="page-description">展示 LDesignForm 和 LDesignFormItem 组件的基本用法</p>
    </header>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">用户信息表单</h2>
        <p class="card-description">请填写您的基本信息</p>
      </div>

      <form @submit.prevent="handleSubmit" class="demo-form">
        <div class="form-note">
          <p><strong>注意：</strong>这是一个演示页面，展示了 LDesignForm 组件的预期用法。</p>
          <p>在实际项目中，您需要先构建 @ldesign/form 包才能使用真实的组件。</p>
        </div>

        <div class="form-field">
          <label class="form-label required">姓名</label>
          <input
            type="text"
            class="form-input"
            v-model="formData.name"
            placeholder="请输入姓名"
          />
          <div class="form-help">请输入您的真实姓名</div>
        </div>

        <div class="form-field">
          <label class="form-label required">邮箱</label>
          <input
            type="email"
            class="form-input"
            v-model="formData.email"
            placeholder="请输入邮箱地址"
          />
          <div class="form-help">我们将使用此邮箱与您联系</div>
        </div>

        <div class="form-field">
          <label class="form-label">年龄</label>
          <input
            type="number"
            class="form-input"
            v-model.number="formData.age"
            placeholder="请输入年龄"
            min="0"
            max="120"
          />
          <div class="form-help">年龄为可选项</div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : '提交表单' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="handleReset">
            重置表单
          </button>
        </div>
      </form>

      <div class="status-section">
        <h3>表单状态</h3>
        <div class="status-item">
          <span>表单有效性: {{ isFormValid ? '有效' : '无效' }}</span>
        </div>
        <div class="status-item">
          <span>表单状态: {{ isDirty ? '已修改' : '未修改' }}</span>
        </div>
        <div class="status-item">
          <span>提交状态: {{ isSubmitted ? '已提交' : '未提交' }}</span>
        </div>
        
        <div class="data-preview">
          <h4>表单数据</h4>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const formData = reactive({
  name: '',
  email: '',
  age: null as number | null
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)

const initialData = { name: '', email: '', age: null }

const isDirty = computed(() => {
  return JSON.stringify(formData) !== JSON.stringify(initialData)
})

const isFormValid = computed(() => {
  const hasName = formData.name && formData.name.length >= 2
  const hasValidEmail = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  return hasName && hasValidEmail
})

const handleSubmit = async () => {
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSubmitting.value = false
  isSubmitted.value = true
  
  if (isFormValid.value) {
    alert('表单提交成功！\n\n' + JSON.stringify(formData, null, 2))
  } else {
    alert('表单验证失败，请检查输入！')
  }
}

const handleReset = () => {
  Object.assign(formData, initialData)
  isSubmitted.value = false
  alert('表单已重置')
}
</script>

<style scoped>
.form-note {
  background: var(--ldesign-brand-color-1);
  border: 1px solid var(--ldesign-brand-color-3);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  margin-bottom: var(--ls-spacing-lg);
}

.form-note p {
  margin-bottom: var(--ls-spacing-xs);
  color: var(--ldesign-brand-color-8);
  font-size: var(--ls-font-size-sm);
}

.form-note p:last-child {
  margin-bottom: 0;
}

.status-section {
  margin-top: var(--ls-spacing-lg);
  padding-top: var(--ls-spacing-lg);
  border-top: 1px solid var(--ldesign-border-color);
}

.status-item {
  margin-bottom: var(--ls-spacing-sm);
  padding: var(--ls-spacing-xs);
  background: var(--ldesign-bg-color-page);
  border-radius: var(--ls-border-radius-sm);
}

.data-preview {
  margin-top: var(--ls-spacing-base);
}

.data-preview h4 {
  margin-bottom: var(--ls-spacing-xs);
}

.data-preview pre {
  background: var(--ldesign-bg-color-page);
  border-radius: var(--ls-border-radius-sm);
  padding: var(--ls-spacing-sm);
  font-size: var(--ls-font-size-xs);
  overflow-x: auto;
}
</style>
