<script setup>
import { computed, reactive, ref } from 'vue'

// 表单数据
const formData = ref({})

// 分组状态
const groupStates = reactive({
  basic: true,
  contact: true,
  work: false,
  preferences: false,
})

// 字段定义
const basicFields = [
  { key: 'name', label: '姓名', type: 'text', required: true, placeholder: '请输入姓名' },
  { key: 'gender', label: '性别', type: 'select', options: [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
  ] },
  { key: 'birthday', label: '生日', type: 'date' },
  { key: 'idCard', label: '身份证号', type: 'text', placeholder: '请输入身份证号' },
]

const contactFields = [
  { key: 'email', label: '邮箱', type: 'email', required: true, placeholder: '请输入邮箱地址' },
  { key: 'phone', label: '手机号', type: 'tel', required: true, placeholder: '请输入手机号' },
  { key: 'address', label: '地址', type: 'text', placeholder: '请输入详细地址' },
  { key: 'emergencyContact', label: '紧急联系人', type: 'text', placeholder: '请输入紧急联系人' },
]

const workFields = [
  { key: 'company', label: '公司名称', type: 'text', placeholder: '请输入公司名称' },
  { key: 'position', label: '职位', type: 'text', placeholder: '请输入职位' },
  { key: 'department', label: '部门', type: 'text', placeholder: '请输入部门' },
  { key: 'workYears', label: '工作年限', type: 'select', options: [
    { value: '0-1', label: '0-1年' },
    { value: '1-3', label: '1-3年' },
    { value: '3-5', label: '3-5年' },
    { value: '5+', label: '5年以上' },
  ] },
  { key: 'salary', label: '期望薪资', type: 'number', placeholder: '请输入期望薪资' },
  { key: 'skills', label: '技能描述', type: 'textarea', placeholder: '请描述您的技能' },
]

const preferencesFields = [
  { key: 'theme', label: '主题偏好', type: 'select', options: [
    { value: 'light', label: '浅色主题' },
    { value: 'dark', label: '深色主题' },
    { value: 'auto', label: '跟随系统' },
  ] },
  { key: 'language', label: '语言', type: 'select', options: [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
  ] },
  { key: 'notifications', label: '通知设置', type: 'select', options: [
    { value: 'all', label: '全部通知' },
    { value: 'important', label: '重要通知' },
    { value: 'none', label: '关闭通知' },
  ] },
  { key: 'newsletter', label: '订阅邮件', type: 'select', options: [
    { value: 'yes', label: '是' },
    { value: 'no', label: '否' },
  ] },
]

// 计算属性
const allGroupsExpanded = computed(() => {
  return Object.values(groupStates).every(state => state)
})

const dataSections = computed(() => ({
  basic: {
    title: '基本信息',
    items: basicFields,
  },
  contact: {
    title: '联系方式',
    items: contactFields,
  },
  work: {
    title: '工作信息',
    items: workFields,
  },
  preferences: {
    title: '偏好设置',
    items: preferencesFields,
  },
}))

const groupStats = computed(() => {
  const stats = {}
  const sections = {
    basic: { title: '基本信息', icon: '👤', fields: basicFields },
    contact: { title: '联系方式', icon: '📞', fields: contactFields },
    work: { title: '工作信息', icon: '💼', fields: workFields },
    preferences: { title: '偏好设置', icon: '⚙️', fields: preferencesFields },
  }

  Object.entries(sections).forEach(([key, section]) => {
    const total = section.fields.length
    const filled = section.fields.filter(field => formData.value[field.key]).length
    const completion = total > 0 ? Math.round((filled / total) * 100) : 0

    stats[key] = {
      title: section.title,
      icon: section.icon,
      total,
      filled,
      completion,
    }
  })

  return stats
})

// 方法
function toggleGroup(groupKey) {
  groupStates[groupKey] = !groupStates[groupKey]
}

function toggleAllGroups() {
  const newState = !allGroupsExpanded.value
  Object.keys(groupStates).forEach((key) => {
    groupStates[key] = newState
  })
}

function resetForm() {
  formData.value = {}
}

function fillSampleData() {
  formData.value = {
    // 基本信息
    name: '张三',
    gender: 'male',
    birthday: '1990-01-01',
    idCard: '110101199001011234',

    // 联系方式
    email: 'zhangsan@example.com',
    phone: '13800138000',
    address: '北京市朝阳区某某街道123号',
    emergencyContact: '李四 13900139000',

    // 工作信息
    company: '某某科技有限公司',
    position: '前端工程师',
    department: '技术部',
    workYears: '3-5',
    salary: 15000,
    skills: 'Vue.js, React, TypeScript, Node.js',

    // 偏好设置
    theme: 'light',
    language: 'zh',
    notifications: 'important',
    newsletter: 'yes',
  }
}

function exportData() {
  const data = JSON.stringify(formData.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'form-data.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="example">
    <div class="example-header">
      <h2>📋 表单分组示例</h2>
      <p>演示表单项分组管理和独立展开收起功能</p>
    </div>

    <div class="example-content">
      <div class="demo-section">
        <h3>分组表单</h3>
        <div class="controls">
          <button class="btn btn-primary" @click="toggleAllGroups">
            {{ allGroupsExpanded ? '🔼 全部收起' : '🔽 全部展开' }}
          </button>
          <button class="btn btn-secondary" @click="resetForm">
            🔄 重置表单
          </button>
          <button class="btn btn-success" @click="fillSampleData">
            ✨ 填入示例数据
          </button>
          <button class="btn btn-info" @click="exportData">
            📤 导出数据
          </button>
        </div>

        <!-- 模拟分组表单 -->
        <div class="grouped-form">
          <!-- 基本信息组 -->
          <div class="form-group">
            <div
              class="group-header"
              :class="{ expanded: groupStates.basic }"
              @click="toggleGroup('basic')"
            >
              <span class="group-icon">
                {{ groupStates.basic ? '▼' : '▶' }}
              </span>
              <span class="group-title">👤 基本信息</span>
              <span class="group-count">{{ basicFields.length }}</span>
            </div>
            <div v-show="groupStates.basic" class="group-content">
              <div class="form-grid">
                <div v-for="field in basicFields" :key="field.key" class="form-item">
                  <label>{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                  <input
                    v-model="formData[field.key]"
                    :type="field.type"
                    :placeholder="field.placeholder"
                    :required="field.required"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 联系方式组 -->
          <div class="form-group">
            <div
              class="group-header"
              :class="{ expanded: groupStates.contact }"
              @click="toggleGroup('contact')"
            >
              <span class="group-icon">
                {{ groupStates.contact ? '▼' : '▶' }}
              </span>
              <span class="group-title">📞 联系方式</span>
              <span class="group-count">{{ contactFields.length }}</span>
            </div>
            <div v-show="groupStates.contact" class="group-content">
              <div class="form-grid">
                <div v-for="field in contactFields" :key="field.key" class="form-item">
                  <label>{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                  <input
                    v-model="formData[field.key]"
                    :type="field.type"
                    :placeholder="field.placeholder"
                    :required="field.required"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 工作信息组 -->
          <div class="form-group">
            <div
              class="group-header"
              :class="{ expanded: groupStates.work }"
              @click="toggleGroup('work')"
            >
              <span class="group-icon">
                {{ groupStates.work ? '▼' : '▶' }}
              </span>
              <span class="group-title">💼 工作信息</span>
              <span class="group-count">{{ workFields.length }}</span>
            </div>
            <div v-show="groupStates.work" class="group-content">
              <div class="form-grid">
                <div v-for="field in workFields" :key="field.key" class="form-item">
                  <label>{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                  <component
                    :is="field.type === 'textarea' ? 'textarea' : field.type === 'select' ? 'select' : 'input'"
                    v-model="formData[field.key]"
                    :type="field.type === 'select' ? undefined : field.type"
                    :placeholder="field.placeholder"
                    :required="field.required"
                    :rows="field.type === 'textarea' ? 3 : undefined"
                  >
                    <option v-if="field.type === 'select'" value="">
                      请选择
                    </option>
                    <option
                      v-for="option in field.options"
                      v-if="field.type === 'select'"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </component>
                </div>
              </div>
            </div>
          </div>

          <!-- 偏好设置组 -->
          <div class="form-group">
            <div
              class="group-header"
              :class="{ expanded: groupStates.preferences }"
              @click="toggleGroup('preferences')"
            >
              <span class="group-icon">
                {{ groupStates.preferences ? '▼' : '▶' }}
              </span>
              <span class="group-title">⚙️ 偏好设置</span>
              <span class="group-count">{{ preferencesFields.length }}</span>
            </div>
            <div v-show="groupStates.preferences" class="group-content">
              <div class="form-grid">
                <div v-for="field in preferencesFields" :key="field.key" class="form-item">
                  <label>{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                  <component
                    :is="field.type === 'select' ? 'select' : 'input'"
                    v-model="formData[field.key]"
                    :type="field.type === 'select' ? undefined : field.type"
                    :placeholder="field.placeholder"
                    :required="field.required"
                  >
                    <option v-if="field.type === 'select'" value="">
                      请选择
                    </option>
                    <option
                      v-for="option in field.options"
                      v-if="field.type === 'select'"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </component>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表单数据预览 -->
        <div class="data-preview">
          <h4>表单数据预览</h4>
          <div class="data-sections">
            <div v-for="(section, key) in dataSections" :key="key" class="data-section">
              <h5>{{ section.title }}</h5>
              <div class="data-items">
                <div
                  v-for="item in section.items"
                  :key="item.key"
                  class="data-item"
                  :class="{ filled: formData[item.key] }"
                >
                  <span class="data-label">{{ item.label }}:</span>
                  <span class="data-value">
                    {{ formData[item.key] || '(未填写)' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分组统计 -->
      <div class="demo-section">
        <h3>分组统计</h3>
        <div class="group-stats">
          <div v-for="(stat, key) in groupStats" :key="key" class="stat-card">
            <div class="stat-header">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-title">{{ stat.title }}</span>
            </div>
            <div class="stat-content">
              <div class="stat-item">
                <span class="stat-label">总字段数</span>
                <span class="stat-value">{{ stat.total }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已填写</span>
                <span class="stat-value">{{ stat.filled }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成率</span>
                <span class="stat-value">{{ stat.completion }}%</span>
              </div>
            </div>
            <div class="stat-progress">
              <div
                class="progress-bar"
                :style="{ width: `${stat.completion}%` }"
              />
            </div>
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

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
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

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.grouped-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-group {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.group-header:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.group-header.expanded {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.group-icon {
  font-size: 0.875rem;
  transition: transform 0.2s ease;
}

.group-title {
  flex: 1;
  font-weight: 600;
  font-size: 1.1rem;
}

.group-count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.group-header:not(.expanded) .group-count {
  background: #667eea;
  color: white;
}

.group-content {
  padding: 1.5rem;
  background: white;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item label {
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
}

.form-item input,
.form-item textarea,
.form-item select {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-item input:focus,
.form-item textarea:focus,
.form-item select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.data-preview {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.data-preview h4 {
  color: #333;
  margin-bottom: 1rem;
}

.data-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.data-section h5 {
  color: #667eea;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.data-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.data-item.filled {
  background: #e8f5e8;
  border-left: 3px solid #28a745;
}

.data-label {
  font-weight: 500;
  color: #333;
}

.data-value {
  color: #666;
  text-align: right;
}

.data-item.filled .data-value {
  color: #28a745;
  font-weight: 500;
}

.group-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-title {
  font-weight: 600;
  color: #333;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 500;
  color: #333;
}

.stat-progress {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .data-sections {
    grid-template-columns: 1fr;
  }

  .group-stats {
    grid-template-columns: 1fr;
  }

  .data-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .data-value {
    text-align: left;
  }
}
</style>
