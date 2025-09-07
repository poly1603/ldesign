<template>
  <div class="vanilla-demo">
    <div class="demo-container">
      <div class="demo-header">
        <h1>原生JavaScript演示</h1>
        <p>使用纯JavaScript实现的查询表单，展示基础DOM操作和事件处理</p>
      </div>
      
      <div class="demo-content">
        <div class="demo-layout">
          <!-- 配置面板 -->
          <div class="config-panel">
            <h3>配置面板</h3>
            <div class="config-options">
              <div class="config-item">
                <label>默认行数：</label>
                <select v-model="config.defaultRowCount" @change="updateForm">
                  <option :value="1">1 行</option>
                  <option :value="2">2 行</option>
                  <option :value="3">3 行</option>
                </select>
              </div>

              <div class="config-item">
                <label>
                  <input
                    type="checkbox"
                    v-model="config.collapsible"
                    @change="updateForm"
                  />
                  支持展开收起
                </label>
              </div>

              <div class="config-item">
                <label>按钮位置：</label>
                <select v-model="config.actionPosition" @change="updateForm">
                  <option value="inline">行内</option>
                  <option value="newline">新行</option>
                </select>
              </div>

              <div class="config-item">
                <label>按钮对齐：</label>
                <select v-model="config.actionAlign" @change="updateForm">
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                </select>
              </div>

              <div class="config-item">
                <label>布局模式：</label>
                <select v-model="config.layoutMode" @change="updateForm">
                  <option value="adaptive">自适应</option>
                  <option value="fixed-2">固定2列</option>
                  <option value="fixed-3">固定3列</option>
                  <option value="fixed-4">固定4列</option>
                </select>
              </div>

              <div class="config-item">
                <label>字段最小宽度：</label>
                <select v-model="config.minFieldWidth" @change="updateForm">
                  <option :value="150">150px</option>
                  <option :value="180">180px</option>
                  <option :value="200">200px</option>
                  <option :value="220">220px</option>
                </select>
              </div>
            </div>
            
            <div class="status-info">
              <h4>表单状态</h4>
              <div><strong>展开状态：</strong>{{ isExpanded ? '已展开' : '已收起' }}</div>
              <div><strong>可见行数：</strong>{{ visibleRows }} / {{ maxRows }}</div>
              <div><strong>字段总数：</strong>{{ fieldCount }}</div>
              <div><strong>动态列数：</strong>{{ dynamicColumns }}</div>
              <div><strong>容器宽度：</strong>{{ containerWidth }}px</div>
            </div>
          </div>
          
          <!-- 表单演示区域 -->
          <div class="form-section">
            <h3>查询表单</h3>
            <div id="vanilla-form-container" class="form-container">
              <!-- 原生JavaScript表单将在这里渲染 -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import {
  calculateFormLayout,
  createResizeObserver,
  debounce,
  getAvailableWidth,
  generateGridTemplate,
  generateButtonGridStyle,
  DEFAULT_FIELDS,
  type FormConfig,
  type FieldConfig
} from '../utils/formLayoutUtils'
import { createStateSnapshot } from '../utils/formConsistencyChecker'

// 配置数据
const config = reactive<FormConfig>({
  defaultRowCount: 1,
  collapsible: true,
  actionPosition: 'inline',
  actionAlign: 'left',
  layoutMode: 'adaptive',
  minFieldWidth: 200,
  buttonColumns: 1
})

// 状态数据 - 从DEFAULT_FIELDS动态计算
const isExpanded = ref(false)
const visibleRows = ref(1)
const maxRows = computed(() => {
  return Math.max(...fields.map(f => f.row))
})
const fieldCount = ref(DEFAULT_FIELDS.length)
const dynamicColumns = ref(4)
const containerWidth = ref(800)

// 确保初始状态一致性
const ensureInitialState = () => {
  const layoutResult = calculateFormLayout(config, fields, isExpanded.value, containerWidth.value)
  visibleRows.value = layoutResult.visibleRows
}

// 字段配置
const fields: FieldConfig[] = DEFAULT_FIELDS

// ResizeObserver实例
let resizeObserver: ResizeObserver | null = null

// 更新容器宽度和布局
const updateContainerWidth = debounce(() => {
  const container = document.getElementById('vanilla-form-container')
  if (!container) return

  const availableWidth = getAvailableWidth(container)
  containerWidth.value = availableWidth

  // 重新计算布局并渲染表单
  renderVanillaForm()
}, 100)

// 更新表单
const updateForm = () => {
  nextTick(() => {
    renderVanillaForm()
  })
}

// 渲染原生JavaScript表单
const renderVanillaForm = () => {
  const container = document.getElementById('vanilla-form-container')
  if (!container) return

  // 清空容器
  container.innerHTML = ''

  // 计算布局参数
  const layoutResult = calculateFormLayout(
    config,
    fields,
    isExpanded.value,
    containerWidth.value
  )

  // 更新状态
  dynamicColumns.value = layoutResult.dynamicColumns
  visibleRows.value = layoutResult.visibleRows

  // 调试信息和状态快照
  const stateSnapshot = createStateSnapshot(
    '原生JavaScript',
    isExpanded.value,
    layoutResult.visibleRows,
    maxRows.value,
    containerWidth.value,
    layoutResult.dynamicColumns,
    config,
    fields,
    layoutResult
  )

  console.log('原生JS布局计算结果:', stateSnapshot)

  // 将状态快照存储到全局，供一致性检查使用
  ;(window as any).vanillaFormState = stateSnapshot

  // 获取可见字段
  const visibleFields = fields.slice(0, layoutResult.maxVisibleFields)

  // 按行分组可见字段
  const visibleFieldsByRow: Record<number, FieldConfig[]> = {}
  visibleFields.forEach((field, index) => {
    const row = Math.floor(index / layoutResult.dynamicColumns) + 1
    if (!visibleFieldsByRow[row]) {
      visibleFieldsByRow[row] = []
    }
    visibleFieldsByRow[row].push(field)
  })

  // 创建表单容器
  const form = document.createElement('div')
  form.className = 'vanilla-query-form'

  // 计算实际行数
  const actualRows = Math.ceil(visibleFields.length / layoutResult.dynamicColumns)

  // 渲染每一行
  for (let row = 1; row <= actualRows; row++) {
    const rowFields = visibleFieldsByRow[row] || []
    if (rowFields.length === 0) continue

    const queryRow = document.createElement('div')
    queryRow.className = 'query-row'
    queryRow.style.display = 'grid'
    queryRow.style.gridTemplateColumns = generateGridTemplate(layoutResult.dynamicColumns)

    // 添加字段
    rowFields.forEach((field) => {
      const fieldElement = createFieldElement(field)
      queryRow.appendChild(fieldElement)
    })

    // 在最后一行且满足条件时添加按钮组
    if (layoutResult.shouldButtonsInRow && row === actualRows) {
      const buttonGroup = createButtonGroup(true, layoutResult.buttonGridColumn)
      queryRow.appendChild(buttonGroup)
    }

    form.appendChild(queryRow)
  }

  // 添加独立按钮行（当不在行内显示时）
  if (!layoutResult.shouldButtonsInRow) {
    const buttonRow = document.createElement('div')
    buttonRow.className = 'query-row button-row'
    buttonRow.style.gridTemplateColumns = generateGridTemplate(layoutResult.dynamicColumns)
    const buttonGroup = createButtonGroup(false, layoutResult.buttonGridColumn)
    buttonRow.appendChild(buttonGroup)
    form.appendChild(buttonRow)
  }

  container.appendChild(form)
}

// 创建字段元素
const createFieldElement = (field: FieldConfig) => {
  const fieldDiv = document.createElement('div')
  fieldDiv.className = 'form-field'

  // 移除明确的网格定位，让CSS Grid自动流动以确保列宽一致
  // 不再设置gridColumn，让浏览器自动计算列宽

  const label = document.createElement('label')
  label.className = 'field-label'
  label.textContent = field.label
  fieldDiv.appendChild(label)

  let input: HTMLElement
  if (field.type === 'select') {
    const select = document.createElement('select')
    select.className = 'form-input'
    field.options?.forEach((option) => {
      const optionElement = document.createElement('option')
      optionElement.value = option.value
      optionElement.textContent = option.label
      select.appendChild(optionElement)
    })
    input = select
  } else {
    const textInput = document.createElement('input')
    textInput.type = 'text'
    textInput.className = 'form-input'
    textInput.placeholder = field.placeholder || `请输入${field.label}`
    input = textInput
  }

  fieldDiv.appendChild(input)
  return fieldDiv
}

// 创建按钮组
const createButtonGroup = (inRow: boolean, gridColumn: string) => {
  const buttonGroup = document.createElement('div')
  buttonGroup.className = `form-buttons buttons-${config.actionAlign} ${inRow ? 'buttons-in-row' : 'buttons-newline'}`

  // 应用明确的网格定位样式
  const gridStyle = generateButtonGridStyle(gridColumn)
  Object.assign(buttonGroup.style, gridStyle)

  // 查询按钮
  const queryBtn = document.createElement('button')
  queryBtn.className = 'form-button primary'
  queryBtn.textContent = '查询'
  queryBtn.onclick = () => {
    console.log('查询表单提交（原生JavaScript版本）')
    alert('查询表单提交成功！\n这是原生JavaScript版本的演示。')
  }
  buttonGroup.appendChild(queryBtn)

  // 重置按钮
  const resetBtn = document.createElement('button')
  resetBtn.className = 'form-button secondary'
  resetBtn.textContent = '重置'
  resetBtn.onclick = () => {
    console.log('查询表单重置（原生JavaScript版本）')
    const inputs = document.querySelectorAll('#vanilla-form-container input, #vanilla-form-container select')
    inputs.forEach((input: any) => {
      if (input.type === 'checkbox') {
        input.checked = false
      } else {
        input.value = ''
      }
    })
  }
  buttonGroup.appendChild(resetBtn)

  // 展开收起按钮
  if (config.collapsible && maxRows.value > config.defaultRowCount) {
    const toggleBtn = document.createElement('button')
    toggleBtn.className = 'form-button outline'
    toggleBtn.textContent = isExpanded.value ? '收起' : '展开'
    toggleBtn.onclick = () => {
      isExpanded.value = !isExpanded.value
      console.log('查询表单展开状态:', isExpanded.value ? '展开' : '收起')
      renderVanillaForm()
    }
    buttonGroup.appendChild(toggleBtn)
  }

  return buttonGroup
}

// 设置ResizeObserver
const setupResizeObserver = () => {
  const container = document.getElementById('vanilla-form-container')
  if (!container) return

  resizeObserver = createResizeObserver(container, updateContainerWidth)
}

// 组件挂载后渲染表单
onMounted(() => {
  nextTick(() => {
    // 确保初始状态正确
    ensureInitialState()
    setupResizeObserver()
    updateContainerWidth()
  })
})

// 组件卸载时清理ResizeObserver
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped>
.vanilla-demo {
  min-height: calc(100vh - 64px);
  background: var(--ldesign-bg-color-page);
}

.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--ls-padding-base);
}

.demo-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);
}

.demo-header h1 {
  font-size: var(--ls-font-size-h2);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-margin-sm) 0;
}

.demo-header p {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-secondary);
  margin: 0;
}

.demo-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--ls-spacing-xl);
}

/* 配置面板样式 */
.config-panel {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-base);
  height: fit-content;
}

.config-panel h3 {
  margin: 0 0 var(--ls-margin-base) 0;
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-primary);
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-margin-base);
}

.config-item {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
}

.config-item label {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-primary);
  white-space: nowrap;
}

.config-item select {
  height: var(--ls-input-height-small);
  padding: 0 var(--ls-padding-xs);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-xs);
}

.config-item input[type="checkbox"] {
  margin-right: var(--ls-spacing-xs);
}

.status-info {
  border-top: 1px solid var(--ldesign-border-color);
  padding-top: var(--ls-padding-base);
}

.status-info h4 {
  margin: 0 0 var(--ls-margin-sm) 0;
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-primary);
}

.status-info div {
  font-size: var(--ls-font-size-xs);
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-margin-xs);
}

/* 表单区域样式 */
.form-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-base);
}

.form-section h3 {
  margin: 0 0 var(--ls-margin-base) 0;
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-primary);
}

.form-container {
  min-height: 200px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .demo-layout {
    grid-template-columns: 350px 1fr;
    gap: var(--ls-spacing-base);
  }
}

@media (max-width: 768px) {
  .demo-layout {
    grid-template-columns: 1fr;
    gap: var(--ls-spacing-sm);
  }
}
</style>

<!-- 原生JavaScript表单样式 -->
<style>
.vanilla-query-form {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.vanilla-query-form .query-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-margin-base);
  align-items: end;
}

.vanilla-query-form .query-row:last-child {
  margin-bottom: 0;
}

.vanilla-query-form .form-field {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.vanilla-query-form .field-label {
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  color: var(--ldesign-text-color-primary);
  margin: 0;
}

.vanilla-query-form .form-input {
  height: var(--ls-input-height-medium);
  padding: 0 var(--ls-padding-sm);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-primary);
  background-color: var(--ldesign-bg-color-component);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.vanilla-query-form .form-input:focus {
  outline: none;
  border-color: var(--ldesign-brand-color);
  box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
}

.vanilla-query-form .form-input::placeholder {
  color: var(--ldesign-text-color-placeholder);
}

/* 按钮组样式 */
.vanilla-query-form .form-buttons {
  display: flex;
  gap: var(--ls-spacing-xs);
  align-items: center;
}

.vanilla-query-form .form-buttons.buttons-left {
  justify-content: flex-start;
}

.vanilla-query-form .form-buttons.buttons-center {
  justify-content: center;
}

.vanilla-query-form .form-buttons.buttons-right {
  justify-content: flex-end;
}

.vanilla-query-form .form-buttons.buttons-in-row {
  grid-column: 4 / -1;
  margin: 0;
}

.vanilla-query-form .form-buttons.buttons-newline {
  grid-column: 1 / -1;
  margin-top: var(--ls-margin-lg);
}

.vanilla-query-form .form-button {
  height: var(--ls-button-height-medium);
  padding: 0 var(--ls-padding-base);
  border: 1px solid transparent;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.vanilla-query-form .form-button.primary {
  background-color: var(--ldesign-brand-color);
  color: var(--ldesign-font-white-1);
  border-color: var(--ldesign-brand-color);
}

.vanilla-query-form .form-button.primary:hover {
  background-color: var(--ldesign-brand-color-hover);
  border-color: var(--ldesign-brand-color-hover);
}

.vanilla-query-form .form-button.secondary {
  background-color: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-color);
}

.vanilla-query-form .form-button.secondary:hover {
  border-color: var(--ldesign-brand-color);
  color: var(--ldesign-brand-color);
}

.vanilla-query-form .form-button.outline {
  background-color: transparent;
  color: var(--ldesign-brand-color);
  border-color: var(--ldesign-brand-color);
}

.vanilla-query-form .form-button.outline:hover {
  background-color: var(--ldesign-brand-color-focus);
}
</style>
