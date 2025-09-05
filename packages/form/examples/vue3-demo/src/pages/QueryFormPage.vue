<template>
  <div class="demo-container">
    <!-- 配置面板 -->
    <div class="config-panel">
      <div class="config-title">🎛️ 配置面板</div>

      <div class="config-group">
        <label class="config-label">字段数量</label>
        <input
          type="range"
          v-model="config.fieldCount"
          class="config-input"
          min="1"
          max="10"
          @input="updateFieldCountDisplay"
        >
        <div style="text-align: center; margin-top: 5px;">
          <span>{{ config.fieldCount }}</span> 个字段
        </div>
      </div>

      <div class="config-group">
        <label class="config-label">列数</label>
        <select v-model="config.colCount" class="config-select" :disabled="config.autoColCount">
          <option value="3">3列</option>
          <option value="4">4列</option>
          <option value="5">5列</option>
          <option value="6">6列</option>
        </select>
      </div>

      <div class="config-group">
        <label class="config-label">
          <input
            type="checkbox"
            v-model="config.autoColCount"
            class="config-checkbox"
          >
          自动计算列数
        </label>
      </div>

      <div class="config-group">
        <label class="config-label">默认行数</label>
        <input
          type="number"
          v-model="config.defaultRowCount"
          class="config-input"
          min="1"
          max="3"
        >
      </div>

      <div class="config-group">
        <label class="config-label">按钮位置</label>
        <select v-model="config.actionPosition" class="config-select">
          <option value="auto">自动</option>
          <option value="inline">内联</option>
          <option value="block">独占行</option>
        </select>
      </div>

      <div class="config-group">
        <label class="config-label">按钮对齐</label>
        <select v-model="config.actionAlign" class="config-select">
          <option value="left">左对齐</option>
          <option value="center">居中</option>
          <option value="right">右对齐</option>
          <option value="justify">两端对齐</option>
        </select>
      </div>

      <div class="config-group">
        <label class="config-label">
          <input
            type="checkbox"
            v-model="config.collapsed"
            class="config-checkbox"
          >
          收起状态
        </label>
      </div>

      <div class="config-group">
        <label class="config-label">
          <input
            type="checkbox"
            v-model="config.showCollapseButton"
            class="config-checkbox"
          >
          显示展开/收起按钮
        </label>
      </div>

      <div class="config-group">
        <label class="config-label">标签位置</label>
        <select v-model="config.labelPosition" class="config-select">
          <option value="top">顶部</option>
          <option value="left">左侧</option>
        </select>
      </div>

      <div class="config-group">
        <label class="config-label">标签对齐</label>
        <select v-model="config.labelAlign" class="config-select">
          <option value="left">左对齐</option>
          <option value="right">右对齐</option>
          <option value="justify">两端对齐</option>
        </select>
      </div>

      <div class="config-group">
        <label class="config-label">
          <input
            type="checkbox"
            v-model="config.responsive"
            class="config-checkbox"
          >
          响应式布局
        </label>
      </div>

      <div class="config-actions">
        <button @click="updateForm" class="config-btn config-btn-primary">
          🔄 更新表单
        </button>
        <button @click="resetConfig" class="config-btn config-btn-secondary">
          ↩️ 重置配置
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="demo-header">
        <h1>📋 查询表单演示</h1>
        <div class="status-info">{{ statusText }}</div>
      </div>

      <div class="form-container">
        <LDesignQueryForm
          :fields="currentFields"
          :colCount="currentColCount"
          :defaultRowCount="config.defaultRowCount"
          :actionPosition="config.actionPosition"
          :actionAlign="config.actionAlign"
          :collapsed="config.collapsed"
          :showCollapseButton="config.showCollapseButton"
          :labelPosition="config.labelPosition"
          :labelAlign="config.labelAlign"
          :labelWidth="config.labelPosition === 'left' ? '100px' : undefined"
          :responsive="config.responsive || config.autoColCount"
          :breakpoints="currentBreakpoints"
          @submit="handleSubmit"
          @reset="handleReset"
          @collapse="handleToggle"
        />
      </div>

      <div class="event-log">
        <div class="event-log-title">📝 事件日志</div>
        <div class="event-log-content">
          <div
            v-for="(event, index) in eventLog"
            :key="index"
            class="event-item"
          >
            {{ event }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { LDesignQueryForm } from '@ldesign/form/vue/components'
// 使用与HTML项目相同的演示数据
const advancedQueryFields = [
  {
    name: 'name',
    label: '姓名',
    type: 'text' as const,
    placeholder: '请输入姓名'
  },
  {
    name: 'email',
    label: '邮箱',
    type: 'email' as const,
    placeholder: '请输入邮箱地址'
  },
  {
    name: 'phone',
    label: '手机号',
    type: 'text' as const,
    placeholder: '请输入手机号'
  },
  {
    name: 'department',
    label: '部门',
    type: 'select' as const,
    placeholder: '请选择部门',
    options: [
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' },
      { label: '运营部', value: 'operation' }
    ]
  },
  {
    name: 'position',
    label: '职位',
    type: 'select' as const,
    placeholder: '请选择职位',
    options: [
      { label: '前端工程师', value: 'frontend' },
      { label: '后端工程师', value: 'backend' },
      { label: '产品经理', value: 'pm' },
      { label: 'UI设计师', value: 'ui' }
    ]
  },
  {
    name: 'status',
    label: '状态',
    type: 'select' as const,
    placeholder: '请选择状态',
    options: [
      { label: '在职', value: 'active' },
      { label: '离职', value: 'inactive' },
      { label: '试用期', value: 'probation' }
    ]
  },
  {
    name: 'startDate',
    label: '入职日期',
    type: 'date' as const,
    placeholder: '请选择入职日期'
  },
  {
    name: 'endDate',
    label: '离职日期',
    type: 'date' as const,
    placeholder: '请选择离职日期'
  }
]

// 配置状态
const config = ref({
  fieldCount: 3,
  colCount: 4,
  defaultRowCount: 1,
  actionPosition: 'inline' as 'auto' | 'inline' | 'block',
  actionAlign: 'right' as 'left' | 'center' | 'right' | 'justify',
  collapsed: true,
  showCollapseButton: true,
  labelPosition: 'left' as 'top' | 'left',
  labelAlign: 'right' as 'left' | 'right' | 'justify',
  responsive: true,
  autoColCount: false
})

// 事件日志
const eventLog = ref<string[]>(['等待表单初始化...'])

// 计算属性
const currentFields = computed(() => {
  return advancedQueryFields.slice(0, config.value.fieldCount)
})

const currentColCount = computed(() => {
  return config.value.autoColCount ? undefined : config.value.colCount
})

const currentBreakpoints = computed(() => {
  return config.value.autoColCount ? {
    xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6
  } : {
    xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 6
  }
})

// 计算属性
const statusText = computed(() => {
  const fieldCount = config.value.fieldCount
  const colCountText = config.value.autoColCount ? '自动列数' : `${config.value.colCount}列布局`
  const collapsed = config.value.collapsed ? '收起' : '展开'
  const actionPosition = config.value.actionPosition
  const actionAlign = config.value.actionAlign
  const labelPos = config.value.labelPosition === 'top' ? '顶部标签' : '左侧标签'
  const labelAlignText = config.value.labelAlign === 'left' ? '左对齐' : config.value.labelAlign === 'right' ? '右对齐' : '两端对齐'
  const responsive = config.value.responsive ? '响应式' : '固定式'

  return `当前配置：${fieldCount}个字段，${colCountText}，${collapsed}状态，${actionPosition}按钮，${actionAlign}对齐，${labelPos}${config.value.labelPosition === 'left' ? labelAlignText : ''}，${responsive}`
})

// 方法
const logEvent = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLog.value.push(`[${timestamp}] ${message}`)
}

const updateFieldCountDisplay = () => {
  // 响应式更新，无需额外操作
}

const updateForm = () => {
  logEvent('表单配置已更新')
}

const resetConfig = () => {
  config.value = {
    fieldCount: 3,
    colCount: 4,
    defaultRowCount: 1,
    actionPosition: 'inline',
    actionAlign: 'right',
    collapsed: true,
    showCollapseButton: true,
    labelPosition: 'left',
    labelAlign: 'right',
    responsive: true,
    autoColCount: false
  }
  logEvent('配置已重置')
}

const handleSubmit = (data: Record<string, any>) => {
  logEvent(`表单提交: ${JSON.stringify(data)}`)
}

const handleReset = () => {
  logEvent('表单已重置')
}

const handleToggle = (collapsed: boolean) => {
  logEvent(`表单${collapsed ? '收起' : '展开'}`)
}

// 监听配置变化，自动更新表单
watch(config, () => {
  logEvent('配置已自动更新')
}, { deep: true })

onMounted(() => {
  logEvent('应用初始化完成')
})
</script>

<style scoped>
.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  min-height: 100vh;
}

.config-panel {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.config-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--ldesign-text-color-primary);
  border-bottom: 1px solid var(--ldesign-border-color);
  padding-bottom: 10px;
}

.config-group {
  margin-bottom: 20px;
}

.config-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--ldesign-text-color-primary);
}

.config-input, .config-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-sm);
  font-size: 14px;
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
}

.config-input:focus, .config-select:focus {
  outline: none;
  border-color: var(--ldesign-brand-color);
  box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
}

.config-select:disabled {
  background: var(--ldesign-bg-color-component-disabled);
  color: var(--ldesign-text-color-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.config-checkbox {
  margin-right: 8px;
}

.config-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.config-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: var(--ls-border-radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-btn-primary {
  background: var(--ldesign-brand-color);
  color: white;
}

.config-btn-primary:hover {
  background: var(--ldesign-brand-color-hover);
}

.config-btn-secondary {
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border: 1px solid var(--ldesign-border-color);
}

.config-btn-secondary:hover {
  background: var(--ldesign-bg-color-component-hover);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-header {
  text-align: center;
}

.demo-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--ldesign-text-color-primary);
}

.status-info {
  background: var(--ldesign-bg-color-page);
  padding: 15px;
  border-radius: var(--ls-border-radius-sm);
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--ldesign-text-color-secondary);
}

.form-container {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: 20px;
}

.event-log {
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-sm);
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.event-log-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--ldesign-text-color-primary);
}

.event-log-content {
  max-height: 150px;
  overflow-y: auto;
}

.event-item {
  font-size: 12px;
  color: var(--ldesign-text-color-secondary);
  margin-bottom: 5px;
  font-family: monospace;
}

@media (max-width: 1200px) {
  .demo-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .config-panel {
    position: static;
  }
}
</style>
