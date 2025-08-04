<script setup>
import { useAdaptiveForm } from '@ldesign/form/vue'
import { onUnmounted, ref } from 'vue'

const formContainerRef = ref()
const expanded = ref(false)
const apiOutput = ref('等待API调用...')

// 表单配置
const formConfig = ref({
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true, placeholder: '请输入姓名' },
    { key: 'email', label: '邮箱', type: 'email', required: true, placeholder: '请输入邮箱' },
    { key: 'phone', label: '电话', type: 'tel', placeholder: '请输入电话' },
    { key: 'company', label: '公司', type: 'input', placeholder: '请输入公司' },
    { key: 'position', label: '职位', type: 'input', placeholder: '请输入职位' },
    { key: 'address', label: '地址', type: 'input', placeholder: '请输入地址' },
  ],
  layout: {
    maxColumns: 2,
    gap: { horizontal: 16, vertical: 16 },
  },
  display: {
    labelPosition: 'left',
    showExpandButton: true,
    expandMode: 'inline',
  },
  behavior: {
    expandThreshold: 3,
    debounceTime: 300,
  },
})

// 使用Hook
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
  openModal,
  closeModal,
  mount,
  unmount,
  on,
  getState,
  serialize,
  deserialize,
} = useAdaptiveForm(formConfig, {
  immediate: false,
  autoValidate: true,
  validateOnMount: false,
})

const isMounted = ref(false)

// 事件监听
let unsubscribeList = []

function setupEventListeners() {
  // 监听表单变化
  const unsubscribeChange = on('VALUE_CHANGE', (data) => {
    console.log('表单值变化:', data)
    apiOutput.value = `表单值变化: ${data.key} = ${data.value}`
  })

  // 监听验证变化
  const unsubscribeValidation = on('VALIDATION_CHANGE', (data) => {
    console.log('验证状态变化:', data)
  })

  // 监听展开变化
  const unsubscribeExpand = on('EXPAND_CHANGE', (data) => {
    expanded.value = data.expanded
    console.log('展开状态变化:', data)
  })

  unsubscribeList.push(unsubscribeChange, unsubscribeValidation, unsubscribeExpand)
}

// 操作方法
function mountForm() {
  if (formContainerRef.value && !isMounted.value) {
    mount(formContainerRef.value)
    setupEventListeners()
    isMounted.value = true
    apiOutput.value = '表单已成功挂载'
  }
}

function unmountForm() {
  if (isMounted.value) {
    unmount()
    unsubscribeList.forEach(unsubscribe => unsubscribe())
    unsubscribeList = []
    isMounted.value = false
    apiOutput.value = '表单已卸载'
  }
}

async function validateForm() {
  if (!isMounted.value)
    return

  const result = await validate()
  apiOutput.value = `验证结果: ${result.valid ? '通过' : '失败'}\n错误: ${JSON.stringify(result.errors, null, 2)}`
}

function resetForm() {
  if (!isMounted.value)
    return

  reset()
  apiOutput.value = '表单已重置'
}

function setRandomValue() {
  if (!isMounted.value)
    return

  const fields = ['name', 'email', 'phone', 'company', 'position', 'address']
  const randomField = fields[Math.floor(Math.random() * fields.length)]
  const randomValues = {
    name: ['张三', '李四', '王五', '赵六'],
    email: ['test1@example.com', 'test2@example.com', 'user@demo.com'],
    phone: ['13800138000', '13900139000', '13700137000'],
    company: ['科技公司', '互联网公司', '软件公司'],
    position: ['工程师', '设计师', '产品经理'],
    address: ['北京市', '上海市', '深圳市'],
  }

  const randomValue = randomValues[randomField][Math.floor(Math.random() * randomValues[randomField].length)]
  setValue(randomField, randomValue)
  apiOutput.value = `设置随机值: ${randomField} = ${randomValue}`
}

function getFormValue() {
  if (!isMounted.value)
    return

  const allValues = getValue()
  apiOutput.value = `当前表单值:\n${JSON.stringify(allValues, null, 2)}`
}

function clearSpecificField() {
  if (!isMounted.value)
    return

  setValue('name', '')
  apiOutput.value = '已清空姓名字段'
}

function toggleExpand() {
  if (!isMounted.value)
    return

  if (expanded.value) {
    collapse()
  }
  else {
    expand()
  }
}

function openFormModal() {
  if (!isMounted.value)
    return

  openModal()
  apiOutput.value = '弹窗已打开'
}

function closeFormModal() {
  if (!isMounted.value)
    return

  closeModal()
  apiOutput.value = '弹窗已关闭'
}

function serializeState() {
  if (!isMounted.value)
    return

  const serialized = serialize()
  apiOutput.value = `序列化状态:\n${serialized}`
}

function deserializeState() {
  if (!isMounted.value)
    return

  const sampleState = JSON.stringify({
    values: {
      name: '反序列化测试',
      email: 'test@example.com',
      phone: '13800138000',
    },
    layout: { expanded: true },
  })

  deserialize(sampleState)
  apiOutput.value = `已反序列化示例状态:\n${sampleState}`
}

function getFormState() {
  if (!isMounted.value)
    return

  const state = getState()
  apiOutput.value = `当前表单状态:\n${JSON.stringify(state, null, 2)}`
}

// 清理
onUnmounted(() => {
  unsubscribeList.forEach(unsubscribe => unsubscribe())
})
</script>

<template>
  <div class="example">
    <div class="example-header">
      <h2>🔧 Hook用法示例</h2>
      <p>演示useAdaptiveForm组合式API的使用方法</p>
    </div>

    <div class="example-content">
      <div class="demo-section">
        <h3>基础Hook用法</h3>
        <div class="controls">
          <button class="btn btn-primary" :disabled="isMounted" @click="mountForm">
            🎯 挂载表单
          </button>
          <button class="btn btn-secondary" :disabled="!isMounted" @click="unmountForm">
            🔌 卸载表单
          </button>
          <button class="btn btn-success" :disabled="!isMounted" @click="validateForm">
            ✅ 验证表单
          </button>
          <button class="btn btn-warning" :disabled="!isMounted" @click="resetForm">
            🔄 重置表单
          </button>
        </div>

        <div class="hook-demo">
          <div ref="formContainerRef" class="form-container">
            <div v-if="!isMounted" class="placeholder">
              <div class="placeholder-icon">
                🔧
              </div>
              <p>点击"挂载表单"开始使用Hook</p>
            </div>
          </div>

          <div class="hook-info">
            <div class="info-card">
              <h4>表单状态</h4>
              <div class="status-grid">
                <div class="status-item">
                  <span class="status-label">已挂载</span>
                  <span class="status-value" :class="[isMounted ? 'success' : 'error']">
                    {{ isMounted ? '是' : '否' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">有效性</span>
                  <span class="status-value" :class="[isValid ? 'success' : 'error']">
                    {{ isValid ? '有效' : '无效' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">已修改</span>
                  <span class="status-value" :class="[isDirty ? 'warning' : 'info']">
                    {{ isDirty ? '是' : '否' }}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-label">验证中</span>
                  <span class="status-value" :class="[isValidating ? 'warning' : 'info']">
                    {{ isValidating ? '是' : '否' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <h4>表单数据</h4>
              <pre class="data-preview">{{ JSON.stringify(values, null, 2) }}</pre>
            </div>

            <div class="info-card">
              <h4>验证错误</h4>
              <div v-if="Object.keys(errors).length === 0" class="no-errors">
                ✅ 暂无验证错误
              </div>
              <div v-else class="error-list">
                <div v-for="(errorList, field) in errors" :key="field" class="error-item">
                  <strong>{{ field }}:</strong>
                  <ul>
                    <li v-for="error in errorList" :key="error">
                      {{ error }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Hook API演示</h3>
        <div class="api-demo">
          <div class="api-section">
            <h4>表单操作</h4>
            <div class="api-controls">
              <button class="btn btn-info" @click="setRandomValue">
                🎲 设置随机值
              </button>
              <button class="btn btn-info" @click="getFormValue">
                📋 获取表单值
              </button>
              <button class="btn btn-secondary" @click="clearSpecificField">
                🗑️ 清空特定字段
              </button>
              <button class="btn btn-primary" @click="toggleExpand">
                {{ expanded ? '🔼 收起' : '🔽 展开' }}
              </button>
            </div>
          </div>

          <div class="api-section">
            <h4>弹窗操作</h4>
            <div class="api-controls">
              <button class="btn btn-success" @click="openFormModal">
                🚀 打开弹窗
              </button>
              <button class="btn btn-secondary" @click="closeFormModal">
                ❌ 关闭弹窗
              </button>
            </div>
          </div>

          <div class="api-section">
            <h4>状态管理</h4>
            <div class="api-controls">
              <button class="btn btn-info" @click="serializeState">
                💾 序列化状态
              </button>
              <button class="btn btn-info" @click="deserializeState">
                📂 反序列化状态
              </button>
              <button class="btn btn-secondary" @click="getFormState">
                📊 获取状态
              </button>
            </div>
          </div>
        </div>

        <div class="api-output">
          <h4>API调用结果</h4>
          <pre class="output-content">{{ apiOutput }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h3>代码示例</h3>
        <div class="code-examples">
          <div class="code-example">
            <h4>基础用法</h4>
            <pre class="code-block"><code>import { useAdaptiveForm } from '@ldesign/form/vue'

const formConfig = ref({
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true }
  ]
})

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
  mount,
  unmount
} = useAdaptiveForm(formConfig)

// 挂载到DOM
onMounted(() => {
  mount(containerRef.value)
})</code></pre>
          </div>

          <div class="code-example">
            <h4>事件监听</h4>
            <pre class="code-block"><code>// 监听表单变化
const unsubscribe = on('VALUE_CHANGE', (data) => {
  console.log('表单值变化:', data)
})

// 监听验证变化
on('VALIDATION_CHANGE', (data) => {
  console.log('验证状态变化:', data)
})

// 清理监听器
onUnmounted(() => {
  unsubscribe()
})</code></pre>
          </div>

          <div class="code-example">
            <h4>状态序列化</h4>
            <pre class="code-block"><code>// 序列化表单状态
const serializedState = serialize()
localStorage.setItem('formState', serializedState)

// 反序列化表单状态
const savedState = localStorage.getItem('formState')
if (savedState) {
  deserialize(savedState)
}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example {
  padding: 2rem;
}

.example-header {
  text-align: center;
  margin-bottom: 2rem;
}

.example-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.example-header p {
  color: #666;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h3 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
}

.hook-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-container {
  min-height: 300px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hook-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
}

.info-card h4 {
  color: #333;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-label {
  color: #666;
}

.status-value {
  font-weight: 500;
}

.status-value.success {
  color: #28a745;
}

.status-value.error {
  color: #dc3545;
}

.status-value.warning {
  color: #ffc107;
}

.status-value.info {
  color: #17a2b8;
}

.data-preview {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  max-height: 150px;
  overflow-y: auto;
}

.no-errors {
  color: #28a745;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}

.error-list {
  font-size: 0.875rem;
}

.error-item {
  margin-bottom: 0.5rem;
}

.error-item strong {
  color: #dc3545;
}

.error-item ul {
  margin: 0.25rem 0 0 1rem;
  padding: 0;
}

.api-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.api-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.api-section h4 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.api-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.api-output {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.api-output h4 {
  color: #333;
  margin-bottom: 1rem;
}

.output-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.code-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.code-example {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.code-example h4 {
  background: #f8f9fa;
  color: #333;
  padding: 1rem;
  margin: 0;
  font-size: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1.5rem;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .hook-demo {
    grid-template-columns: 1fr;
  }

  .api-demo {
    grid-template-columns: 1fr;
  }

  .code-examples {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
