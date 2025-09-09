<template>
  <div class="playground-container">
    <div class="playground-header">
      <h2>表单配置 Playground</h2>
      <p>实时配置表单参数，左侧调整配置，右侧查看效果</p>
    </div>
    
    <div class="playground-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <div class="config-section">
          <h3>布局配置</h3>
          
          <!-- 布局模式 -->
          <div class="config-item">
            <label>布局模式</label>
            <select v-model="config.layout.mode" @change="updateForm">
              <option value="vertical">垂直布局</option>
              <option value="horizontal">水平布局</option>
            </select>
          </div>
          
          <!-- 水平布局配置 -->
          <template v-if="config.layout.mode === 'horizontal'">
            <div class="config-item">
              <label>显示行数</label>
              <input 
                type="number" 
                v-model.number="config.layout.horizontal.rows" 
                min="1" 
                max="10"
                @input="updateForm"
              />
            </div>
            
            <div class="config-item">
              <label>每行列数</label>
              <input 
                type="number" 
                v-model.number="config.layout.horizontal.columnsPerRow" 
                min="1" 
                max="6"
                @input="updateForm"
              />
            </div>
            
            <div class="config-item">
              <label>按钮位置</label>
              <select v-model="config.layout.horizontal.buttonPosition" @change="updateForm">
                <option value="inline">内联显示</option>
                <option value="separate-row">独占一行</option>
              </select>
            </div>
          </template>
        </div>
        
        <!-- 标签配置 -->
        <div class="config-section" v-if="config.layout.mode === 'horizontal'">
          <h3>标签配置</h3>
          
          <div class="config-item">
            <label>标签布局</label>
            <select v-model="config.layout.horizontal.labelLayout" @change="updateForm">
              <option value="vertical">垂直布局</option>
              <option value="horizontal">水平布局</option>
            </select>
          </div>
          
          <template v-if="config.layout.horizontal.labelLayout === 'horizontal'">
            <div class="config-item">
              <label>标签对齐</label>
              <select v-model="config.layout.horizontal.labelAlign" @change="updateForm">
                <option value="left">左对齐</option>
                <option value="right">右对齐</option>
              </select>
            </div>
            
            <div class="config-item">
              <label>
                <input 
                  type="checkbox" 
                  v-model="config.layout.horizontal.autoLabelWidth"
                  @change="updateForm"
                />
                自动标签宽度
              </label>
            </div>
            
            <div class="config-item" v-if="!config.layout.horizontal.autoLabelWidth">
              <label>固定标签宽度 (px)</label>
              <input 
                type="number" 
                v-model.number="config.layout.horizontal.fixedLabelWidth" 
                min="50" 
                max="300"
                @input="updateForm"
              />
            </div>
          </template>
        </div>
        
        <!-- 间隔配置 -->
        <div class="config-section" v-if="config.layout.mode === 'horizontal'">
          <h3>间隔配置</h3>
          
          <div class="config-item">
            <label>表单项间隔 (px)</label>
            <input 
              type="number" 
              v-model.number="config.layout.horizontal.itemSpacing" 
              min="0" 
              max="50"
              @input="updateForm"
            />
          </div>
          
          <div class="config-item" v-if="config.layout.horizontal.labelLayout === 'horizontal'">
            <label>标签控件间隔 (px)</label>
            <input 
              type="number" 
              v-model.number="config.layout.horizontal.labelControlSpacing" 
              min="0" 
              max="50"
              @input="updateForm"
            />
          </div>
        </div>
        
        <!-- 按钮配置 -->
        <div class="config-section">
          <h3>按钮配置</h3>
          
          <div class="config-item">
            <label>按钮对齐</label>
            <select v-model="config.layout.horizontal.buttonAlign" @change="updateForm">
              <option value="left">左对齐</option>
              <option value="center">居中对齐</option>
              <option value="right">右对齐</option>
              <option value="space-between">两端对齐</option>
            </select>
          </div>
          
          <div class="config-item">
            <label>重置行为</label>
            <select v-model="config.layout.horizontal.resetBehavior" @change="updateForm">
              <option value="empty">重置为空值</option>
              <option value="default">重置为默认值</option>
            </select>
          </div>
        </div>
        
        <!-- 字段配置 -->
        <div class="config-section">
          <h3>字段配置</h3>

          <div class="field-list">
            <div
              v-for="field in availableFields"
              :key="field.name"
              class="field-config-item"
            >
              <!-- 字段启用状态 -->
              <div class="field-header">
                <label class="field-checkbox">
                  <input
                    type="checkbox"
                    :value="field.name"
                    v-model="config.selectedFields"
                    @change="updateForm"
                  />
                  {{ field.label }}
                </label>
              </div>

              <!-- 字段详细配置 -->
              <div class="field-details">
                <div class="field-config-row">
                  <label>标题</label>
                  <input
                    type="text"
                    v-model="field.label"
                    @input="updateForm"
                    class="field-config-input"
                  />
                </div>

                <div class="field-config-row">
                  <label>类型</label>
                  <select v-model="field.type" @change="updateForm" class="field-config-select">
                    <option value="input">输入框</option>
                    <option value="radio">单选按钮</option>
                    <option value="select">下拉选择</option>
                    <option value="textarea">多行文本</option>
                  </select>
                </div>

                <div class="field-config-row">
                  <label>列数</label>
                  <input
                    type="number"
                    v-model.number="field.colSpan"
                    min="1"
                    max="4"
                    @input="updateForm"
                    class="field-config-input"
                  />
                </div>

                <div class="field-config-row" v-if="config.layout.mode === 'horizontal' && config.layout.horizontal.labelLayout === 'horizontal'">
                  <label>标题宽度 (px)</label>
                  <input
                    type="number"
                    v-model.number="field.labelWidth"
                    min="0"
                    max="300"
                    @input="updateForm"
                    class="field-config-input"
                    placeholder="0=自动"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧表单渲染区域 -->
      <div class="form-render-area">
        <div class="render-header">
          <h3>表单预览</h3>
          <div class="render-info">
            <span>布局: {{ config.layout.mode === 'vertical' ? '垂直' : '水平' }}</span>
            <span v-if="config.layout.mode === 'horizontal'">
              | {{ config.layout.horizontal.rows }}行 × {{ config.layout.horizontal.columnsPerRow }}列
            </span>
            <span>| 字段数: {{ config.selectedFields.length }}</span>
          </div>
        </div>
        
        <div class="form-container" ref="formContainer">
          <!-- 表单将在这里渲染 -->
        </div>
        
        <!-- 表单数据显示 -->
        <div class="form-data-display">
          <h4>表单数据</h4>
          <div class="data-content">
            <div v-if="Object.keys(formData).length === 0" class="empty-state">
              暂无数据
            </div>
            <div v-else class="data-items">
              <div v-for="(value, key) in formData" :key="key" class="data-item">
                <span class="data-key">{{ getFieldLabel(key) }}:</span>
                <span class="data-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { FormCore, VanillaAdapter, type FieldConfig, type FormConfig } from '@ldesign/form'

// 配置数据结构
interface PlaygroundConfig {
  layout: {
    mode: 'vertical' | 'horizontal'
    horizontal: {
      rows: number
      columnsPerRow: number
      buttonPosition: 'inline' | 'separate-row'
      labelLayout: 'vertical' | 'horizontal'
      labelAlign: 'left' | 'right'
      autoLabelWidth: boolean
      fixedLabelWidth: number
      itemSpacing: number
      labelControlSpacing: number
      buttonAlign: 'left' | 'center' | 'right' | 'space-between'
      resetBehavior: 'empty' | 'default'
    }
  }
  selectedFields: string[]
}

// 可用字段列表
const availableFields = reactive([
  { name: 'name', label: '姓名', type: 'input', defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'gender', label: '性别', type: 'radio', options: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }], defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'email', label: '邮箱', type: 'input', defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'phone', label: '手机号', type: 'input', defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'city', label: '城市', type: 'select', options: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }, { label: '广州', value: 'guangzhou' }], defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'hobby', label: '爱好', type: 'select', options: [{ label: '读书', value: 'reading' }, { label: '运动', value: 'sports' }, { label: '音乐', value: 'music' }], defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'age', label: '年龄', type: 'input', defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'address', label: '地址', type: 'textarea', defaultValue: '', colSpan: 2, labelWidth: 0, props: { rows: 4 } },
  { name: 'company', label: '公司', type: 'input', defaultValue: '', colSpan: 1, labelWidth: 0 },
  { name: 'position', label: '职位', type: 'input', defaultValue: '', colSpan: 1, labelWidth: 0 }
])

// 默认配置
const config = reactive<PlaygroundConfig>({
  layout: {
    mode: 'horizontal',
    horizontal: {
      rows: 2,
      columnsPerRow: 2,
      buttonPosition: 'inline',
      labelLayout: 'horizontal',
      labelAlign: 'right',
      autoLabelWidth: true,
      fixedLabelWidth: 100,
      itemSpacing: 16,
      labelControlSpacing: 12,
      buttonAlign: 'right',
      resetBehavior: 'empty'
    }
  },
  selectedFields: ['name', 'gender', 'email', 'phone', 'city', 'hobby', 'age', 'address', 'company', 'position']
})

// 表单相关
const formContainer = ref<HTMLElement>()
let formCore: FormCore | null = null
let adapter: VanillaAdapter | null = null
const formData = ref<Record<string, any>>({})

// 获取字段标签
function getFieldLabel(fieldName: string): string {
  const field = availableFields.find(f => f.name === fieldName)
  return field?.label || fieldName
}

// 格式化值显示
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '空'
  }
  if (typeof value === 'string' && value === '') {
    return '空字符串'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

// 更新表单
async function updateForm() {
  await nextTick()

  if (!formContainer.value) return

  // 销毁现有表单
  if (adapter) {
    adapter.destroy()
  }

  // 获取选中的字段
  const selectedFieldConfigs = availableFields.filter(field =>
    config.selectedFields.includes(field.name)
  )

  if (selectedFieldConfigs.length === 0) {
    formContainer.value.innerHTML = '<div class="empty-form">请选择至少一个字段</div>'
    return
  }

  // 创建表单配置
  const formConfig: FormConfig = {
    layout: {
      mode: config.layout.mode,
      ...(config.layout.mode === 'horizontal' && {
        horizontal: {
          rows: config.layout.horizontal.rows,
          columnsPerRow: config.layout.horizontal.columnsPerRow,
          buttonPosition: config.layout.horizontal.buttonPosition,
          labelLayout: config.layout.horizontal.labelLayout,
          labelAlign: config.layout.horizontal.labelAlign,
          autoLabelWidth: config.layout.horizontal.autoLabelWidth,
          ...(config.layout.horizontal.autoLabelWidth ? {} : {
            fixedLabelWidth: config.layout.horizontal.fixedLabelWidth
          }),
          itemSpacing: config.layout.horizontal.itemSpacing,
          labelControlSpacing: config.layout.horizontal.labelControlSpacing,
          buttonAlign: config.layout.horizontal.buttonAlign,
          resetBehavior: config.layout.horizontal.resetBehavior
        }
      }),
      collapsible: {
        enabled: true,
        defaultVisibleRows: config.layout.horizontal.rows,
        expandText: '展开',
        collapseText: '收起',
        showFieldCount: true,
        animationDuration: 300
      }
    },
    fields: selectedFieldConfigs,
    buttons: {
      submit: {
        text: '提交',
        type: 'primary'
      },
      reset: {
        text: '重置',
        type: 'secondary'
      }
    }
  }

  // 创建表单实例
  formCore = new FormCore(formConfig)
  adapter = new VanillaAdapter()

  // 挂载表单
  adapter.mount(formCore, formContainer.value)

  // 监听数据变化
  formCore.on('field:change', ({ name, value }) => {
    formData.value = { ...formData.value, [name]: value }
  })

  // 监听批量数据变化
  formCore.on('values:change', (data) => {
    formData.value = { ...data }
  })
}

// 组件挂载时初始化表单
onMounted(() => {
  updateForm()
})

// 组件卸载时清理资源
onUnmounted(() => {
  if (adapter) {
    adapter.destroy()
  }
})
</script>

<style lang="less" scoped>
.playground-container {
  padding: var(--ls-padding-base);
  max-width: 1400px;
  margin: 0 auto;
}

.playground-header {
  text-align: center;
  margin-bottom: var(--ls-margin-lg);
  
  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}

.playground-content {
  display: flex;
  gap: var(--ls-spacing-lg);
  align-items: flex-start;
}

.config-panel {
  flex: 0 0 350px;
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);
  max-height: 80vh;
  overflow-y: auto;
}

.config-section {
  margin-bottom: var(--ls-margin-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h3 {
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-base);
    margin-bottom: var(--ls-margin-sm);
    padding-bottom: var(--ls-padding-xs);
    border-bottom: 1px solid var(--ldesign-border-color);
  }
}

.config-item {
  margin-bottom: var(--ls-margin-sm);
  
  label {
    display: block;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-xs);
    margin-bottom: 4px;
    
    input[type="checkbox"] {
      margin-right: 6px;
    }
  }
  
  input, select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-xs);
    
    &:focus {
      outline: none;
      border-color: var(--ldesign-brand-color);
    }
  }
  
  input[type="number"] {
    width: 100%;
  }
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
}

.field-config-item {
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
}

.field-header {
  margin-bottom: var(--ls-spacing-xs);
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  cursor: pointer;
  font-size: var(--ls-font-size-sm);
  font-weight: 500;

  input[type="checkbox"] {
    margin: 0;
  }
}

.field-details {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
  padding-top: var(--ls-spacing-xs);
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

.field-config-row {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);

  label {
    min-width: 80px;
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
  }
}

.field-config-input,
.field-config-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-sm);
  font-size: var(--ls-font-size-xs);

  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
  }
}

.form-render-area {
  flex: 1;
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);
}

.render-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-margin-base);
  padding-bottom: var(--ls-padding-sm);
  border-bottom: 1px solid var(--ldesign-border-color);
  
  h3 {
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-base);
    margin: 0;
  }
  
  .render-info {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    
    span {
      margin-left: 8px;
      
      &:first-child {
        margin-left: 0;
      }
    }
  }
}

.form-container {
  min-height: 300px;
  margin-bottom: var(--ls-margin-base);
  
  .empty-form {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--ldesign-text-color-placeholder);
    font-size: var(--ls-font-size-sm);
  }
}

.form-data-display {
  border-top: 1px solid var(--ldesign-border-color);
  padding-top: var(--ls-padding-base);
  
  h4 {
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-sm);
    margin-bottom: var(--ls-margin-sm);
  }
  
  .data-content {
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    padding: var(--ls-padding-sm);
    max-height: 200px;
    overflow-y: auto;
  }
  
  .empty-state {
    color: var(--ldesign-text-color-placeholder);
    font-size: var(--ls-font-size-xs);
    text-align: center;
    padding: var(--ls-padding-sm);
  }
  
  .data-items {
    .data-item {
      display: flex;
      margin-bottom: 4px;
      font-size: var(--ls-font-size-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .data-key {
        color: var(--ldesign-text-color-secondary);
        min-width: 80px;
        margin-right: 8px;
      }
      
      .data-value {
        color: var(--ldesign-text-color-primary);
        flex: 1;
      }
    }
  }
}
</style>
