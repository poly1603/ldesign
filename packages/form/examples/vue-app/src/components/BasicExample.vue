<script setup>
import { AdaptiveForm } from '@ldesign/form/vue'
import { reactive, ref } from 'vue'

// 表单数据
const formData = ref({})

// 只读状态
const readonly = ref(false)

// 验证结果
const validationResult = ref({ valid: true, errors: [] })

// 表单配置
const formConfig = reactive({
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true, placeholder: '请输入您的姓名' },
    { key: 'email', label: '邮箱', type: 'email', required: true, placeholder: '请输入邮箱地址' },
    { key: 'phone', label: '电话', type: 'tel', placeholder: '请输入手机号码' },
    { key: 'company', label: '公司', type: 'input', placeholder: '请输入公司名称' },
    { key: 'position', label: '职位', type: 'input', placeholder: '请输入职位' },
    { key: 'department', label: '部门', type: 'input', placeholder: '请输入部门' },
    { key: 'address', label: '地址', type: 'input', placeholder: '请输入地址' },
    { key: 'website', label: '网站', type: 'url', placeholder: '请输入网站地址' },
  ],
  layout: {
    defaultRows: 2,
    minColumns: 1,
    maxColumns: 3,
    columnWidth: 250,
    gap: {
      horizontal: 16,
      vertical: 16,
    },
  },
  display: {
    labelPosition: 'left',
    labelWidth: 80,
    showExpandButton: true,
    expandMode: 'inline',
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorMessage: true,
  },
  behavior: {
    readonly: false,
    expandThreshold: 4,
    debounceTime: 300,
  },
})

// 事件处理
function handleChange(data) {
  console.log('表单值变化:', data)
}

function handleSubmit(data) {
  console.log('表单提交:', data)
  alert('表单提交成功！')
}

function handleValidation(data) {
  validationResult.value = data
  console.log('验证状态变化:', data)
}

// 操作方法
function resetForm() {
  formData.value = {}
}

function fillSampleData() {
  formData.value = {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    company: '示例公司',
    position: '前端工程师',
    department: '技术部',
    address: '北京市朝阳区',
    website: 'https://example.com',
  }
}

function toggleReadonly() {
  readonly.value = !readonly.value
  formConfig.behavior.readonly = readonly.value
}

function updateConfig() {
  // 触发配置更新
  console.log('配置已更新:', formConfig)
}
</script>

<template>
  <div class="example">
    <div class="example-header">
      <h2>📐 基础用法示例</h2>
      <p>演示自适应表单的基本功能和配置选项</p>
    </div>

    <div class="example-content">
      <div class="demo-section">
        <h3>基础表单</h3>
        <div class="controls">
          <button class="btn btn-secondary" @click="resetForm">
            🔄 重置表单
          </button>
          <button class="btn btn-success" @click="fillSampleData">
            ✨ 填入示例数据
          </button>
          <button class="btn btn-secondary" @click="toggleReadonly">
            {{ readonly ? '📝 启用编辑' : '🔒 只读模式' }}
          </button>
        </div>

        <AdaptiveForm
          v-model="formData"
          :config="formConfig"
          @change="handleChange"
          @submit="handleSubmit"
          @validation-change="handleValidation"
        />

        <div class="form-info">
          <div class="info-section">
            <h4>表单数据</h4>
            <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          </div>
          <div class="info-section">
            <h4>验证状态</h4>
            <div class="status" :class="[validationResult.valid ? 'success' : 'error']">
              {{ validationResult.valid ? '✅ 验证通过' : '❌ 验证失败' }}
              <div v-if="validationResult.errors.length" class="errors">
                <div v-for="error in validationResult.errors" :key="error">
                  • {{ error }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>配置选项</h3>
        <div class="config-controls">
          <div class="control-group">
            <label>最大列数</label>
            <select v-model="formConfig.layout.maxColumns" @change="updateConfig">
              <option :value="1">
                1列
              </option>
              <option :value="2">
                2列
              </option>
              <option :value="3">
                3列
              </option>
              <option :value="4">
                4列
              </option>
            </select>
          </div>

          <div class="control-group">
            <label>标签位置</label>
            <select v-model="formConfig.display.labelPosition" @change="updateConfig">
              <option value="left">
                左侧
              </option>
              <option value="top">
                顶部
              </option>
              <option value="right">
                右侧
              </option>
            </select>
          </div>

          <div class="control-group">
            <label>展开模式</label>
            <select v-model="formConfig.display.expandMode" @change="updateConfig">
              <option value="inline">
                内联展开
              </option>
              <option value="modal">
                弹窗模式
              </option>
            </select>
          </div>

          <div class="control-group">
            <label>展开阈值</label>
            <input
              v-model.number="formConfig.behavior.expandThreshold"
              type="number"
              min="1"
              max="10"
              @change="updateConfig"
            >
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

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.form-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.info-section h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.info-section pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  overflow-x: auto;
}

.status {
  padding: 1rem;
  border-radius: 6px;
  font-weight: 500;
}

.status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.errors {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.config-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: #333;
}

.control-group select,
.control-group input {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .form-info {
    grid-template-columns: 1fr;
  }

  .config-controls {
    grid-template-columns: 1fr;
  }
}
</style>
