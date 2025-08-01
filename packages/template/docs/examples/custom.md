# 自定义组件示例

本示例展示如何创建复杂的自定义模板组件，包括状态管理、事件处理和插槽使用。

## 复杂表单模板

```vue
<!-- src/templates/form/desktop/wizard/index.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Step {
  id: string
  title: string
  component: string
  validation?: (data: any) => boolean
}

interface Props {
  title?: string
  steps: Step[]
  initialData?: Record<string, any>
  onStepChange?: (step: number, data: any) => void
  onSubmit?: (data: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '表单向导',
  initialData: () => ({})
})

const emit = defineEmits<{
  stepChange: [step: number, data: any]
  submit: [data: any]
  validate: [step: number, valid: boolean]
}>()

// 状态管理
const currentStep = ref(0)
const formData = ref({ ...props.initialData })
const errors = ref<Record<string, string>>({})

// 计算属性
const totalSteps = computed(() => props.steps.length)
const currentStepData = computed(() => props.steps[currentStep.value])
const currentStepComponent = computed(() => currentStepData.value?.component)
const canGoBack = computed(() => currentStep.value > 0)
const canGoNext = computed(() => currentStep.value < totalSteps.value - 1)
const isLastStep = computed(() => currentStep.value === totalSteps.value - 1)

const isCurrentStepValid = computed(() => {
  const step = currentStepData.value
  if (step.validation) {
    return step.validation(formData.value)
  }
  return true
})

const isFormValid = computed(() => {
  return props.steps.every((step) => {
    if (step.validation) {
      return step.validation(formData.value)
    }
    return true
  })
})

// 方法
function updateFormData(updates: Record<string, any>) {
  formData.value = { ...formData.value, ...updates }
}

function validateStep(stepErrors: Record<string, string>) {
  errors.value = stepErrors
  emit('validate', currentStep.value, Object.keys(stepErrors).length === 0)
}

function goBack() {
  if (canGoBack.value) {
    currentStep.value--
  }
}

function goNext() {
  if (canGoNext.value && isCurrentStepValid.value) {
    currentStep.value++
  }
}

function submit() {
  if (isFormValid.value) {
    emit('submit', formData.value)
    props.onSubmit?.(formData.value)
  }
}

// 监听步骤变化
watch(currentStep, (newStep) => {
  emit('stepChange', newStep, formData.value)
  props.onStepChange?.(newStep, formData.value)
})
</script>

<template>
  <div class="form-wizard">
    <div class="wizard-header">
      <slot name="header" :current-step="currentStep" :total-steps="totalSteps">
        <h2>{{ title }}</h2>
        <div class="step-indicator">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="step" :class="[{
              active: index === currentStep,
              completed: index < currentStep,
            }]"
          >
            {{ index + 1 }}
          </div>
        </div>
      </slot>
    </div>

    <div class="wizard-content">
      <transition name="step-fade" mode="out-in">
        <component
          :is="currentStepComponent"
          :key="currentStep"
          :data="formData"
          :errors="errors"
          @update="updateFormData"
          @validate="validateStep"
        />
      </transition>
    </div>

    <div class="wizard-footer">
      <slot
        name="footer"
        :current-step="currentStep"
        :total-steps="totalSteps"
        :can-go-back="canGoBack"
        :can-go-next="canGoNext"
        :go-back="goBack"
        :go-next="goNext"
        :submit="submit"
      >
        <div class="wizard-actions">
          <button
            v-if="canGoBack"
            class="btn btn-secondary"
            @click="goBack"
          >
            上一步
          </button>

          <button
            v-if="canGoNext"
            :disabled="!isCurrentStepValid"
            class="btn btn-primary"
            @click="goNext"
          >
            下一步
          </button>

          <button
            v-if="isLastStep"
            :disabled="!isFormValid"
            class="btn btn-success"
            @click="submit"
          >
            提交
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.form-wizard {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.wizard-header {
  padding: 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.step {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #6c757d;
  font-weight: bold;
  transition: all 0.3s;
}

.step.active {
  background: #007bff;
  color: white;
}

.step.completed {
  background: #28a745;
  color: white;
}

.wizard-content {
  padding: 2rem;
  min-height: 300px;
}

.wizard-footer {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.3s ease;
}

.step-fade-enter-from,
.step-fade-leave-to {
  opacity: 0;
}
</style>
```

## 使用自定义表单模板

```vue
<script setup lang="ts">
import { ref } from 'vue'

const stepDescriptions = [
  '请填写基本信息',
  '请设置账户信息',
  '请确认注册信息'
]

const wizardProps = ref({
  title: '用户注册',
  steps: [
    {
      id: 'basic',
      title: '基本信息',
      component: 'BasicInfoStep',
      validation: (data: any) => data.name && data.email
    },
    {
      id: 'account',
      title: '账户信息',
      component: 'AccountInfoStep',
      validation: (data: any) => data.username && data.password
    },
    {
      id: 'confirm',
      title: '确认信息',
      component: 'ConfirmStep',
      validation: () => true
    }
  ],
  initialData: {
    name: '',
    email: '',
    username: '',
    password: ''
  },
  onStepChange: (step: number, data: any) => {
    console.log('步骤变化:', step, data)
  },
  onSubmit: (data: any) => {
    console.log('提交数据:', data)
    alert('注册成功！')
  }
})

function onStepChange(step: number, data: any) {
  console.log('当前步骤:', step)
  console.log('表单数据:', data)
}

function onFormSubmit(data: any) {
  console.log('表单提交:', data)
  // 处理表单提交逻辑
}
</script>

<template>
  <div class="app">
    <h1>自定义表单向导示例</h1>

    <LTemplateRenderer
      category="form"
      device="desktop"
      template="wizard"
      :template-props="wizardProps"
      @step-change="onStepChange"
      @submit="onFormSubmit"
    >
      <!-- 自定义头部 -->
      <template #header="{ currentStep, totalSteps }">
        <div class="custom-header">
          <h2>用户注册向导</h2>
          <p>步骤 {{ currentStep + 1 }} / {{ totalSteps }}</p>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${((currentStep + 1) / totalSteps) * 100}%` }"
            />
          </div>
        </div>
      </template>

      <!-- 自定义底部 -->
      <template #footer="{ currentStep, canGoBack, canGoNext, goBack, goNext, submit }">
        <div class="custom-footer">
          <div class="step-info">
            {{ stepDescriptions[currentStep] }}
          </div>
          <div class="actions">
            <button v-if="canGoBack" @click="goBack">
              ← 返回
            </button>
            <button v-if="canGoNext" @click="goNext">
              继续 →
            </button>
            <button v-else class="submit-btn" @click="submit">
              完成注册
            </button>
          </div>
        </div>
      </template>
    </LTemplateRenderer>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.custom-header {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.custom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-info {
  color: #6c757d;
  font-style: italic;
}

.actions {
  display: flex;
  gap: 1rem;
}

.actions button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  background: #28a745 !important;
  color: white !important;
  border-color: #28a745 !important;
}
</style>
```

## 数据表格模板

```vue
<!-- src/templates/data/desktop/table/index.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Column {
  key: string
  title: string
  sortable?: boolean
  formatter?: (value: any) => string
}

interface Props {
  title?: string
  data: any[]
  columns: Column[]
  pagination?: boolean
  pageSize?: number
  searchable?: boolean
  hasActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '数据表格',
  pageSize: 10,
  pagination: true,
  searchable: true,
  hasActions: true
})

const emit = defineEmits<{
  edit: [row: any]
  delete: [row: any]
  sort: [key: string, direction: 'asc' | 'desc']
}>()

// 状态
const searchQuery = ref('')
const sortKey = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)

// 计算属性
const filteredData = computed(() => {
  if (!searchQuery.value)
    return props.data

  return props.data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  )
})

const sortedData = computed(() => {
  if (!sortKey.value)
    return filteredData.value

  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]

    if (aVal < bVal)
      return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal)
      return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() =>
  Math.ceil(sortedData.value.length / props.pageSize)
)

const paginatedData = computed(() => {
  if (!props.pagination)
    return sortedData.value

  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

// 方法
function sort(key: string) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }

  emit('sort', key, sortDirection.value)
}

function getSortIndicator(key: string) {
  if (sortKey.value !== key)
    return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function formatValue(value: any, column: Column) {
  if (column.formatter) {
    return column.formatter(value)
  }
  return value
}

function getRowKey(row: any, index: number) {
  return row.id || index
}

function goToPage(page: number) {
  currentPage.value = page
}

// 监听搜索变化，重置页码
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="data-table">
    <div class="table-header">
      <slot name="header" :total="filteredData.length">
        <div class="table-title">
          <h3>{{ title }}</h3>
          <span class="record-count">共 {{ filteredData.length }} 条记录</span>
        </div>
        <div class="table-actions">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索..."
            class="search-input"
          >
          <slot name="actions" />
        </div>
      </slot>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{ sortable: column.sortable }"
              @click="column.sortable && sort(column.key)"
            >
              {{ column.title }}
              <span v-if="column.sortable" class="sort-indicator">
                {{ getSortIndicator(column.key) }}
              </span>
            </th>
            <th v-if="hasActions" class="actions-column">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="getRowKey(row, index)">
            <td v-for="column in columns" :key="column.key">
              <slot
                :name="`column-${column.key}`"
                :row="row"
                :value="row[column.key]"
                :index="index"
              >
                {{ formatValue(row[column.key], column) }}
              </slot>
            </td>
            <td v-if="hasActions" class="actions-cell">
              <slot name="actions" :row="row" :index="index">
                <button class="btn-edit" @click="$emit('edit', row)">
                  编辑
                </button>
                <button class="btn-delete" @click="$emit('delete', row)">
                  删除
                </button>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination" class="table-footer">
      <div class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          上一页
        </button>

        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>

        <button
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.table-title h3 {
  margin: 0;
  color: #333;
}

.record-count {
  color: #6c757d;
  font-size: 0.9rem;
  margin-left: 1rem;
}

.table-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table th.sortable:hover {
  background: #e9ecef;
}

.sort-indicator {
  margin-left: 0.5rem;
  color: #6c757d;
}

.actions-column {
  width: 120px;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-edit {
  background: #007bff;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.table-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
}
</style>
```

这个示例展示了如何创建复杂的自定义模板组件，包括表单向导和数据表格等高级功能。
