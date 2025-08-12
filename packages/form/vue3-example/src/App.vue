<script setup lang="ts">
import { ref, computed } from 'vue'
import { DynamicForm } from '@ldesign/form'
import type { FormOptions, FormData } from '@ldesign/form'

// 表单数据
const formData = ref<FormData>({
  name: '',
  email: '',
  phone: '',
  gender: '',
  company: '',
  position: '',
  skills: '',
  remote: false,
  contactMethod: 'email',
  wechat: '',
  agreement: false
})

// 配置参数
const layoutColumns = ref(3)
const layoutGap = ref(16)
const showValidation = ref(true)
const showLabels = ref(true)
const labelPosition = ref('top')
const showBorders = ref(true)
const autoLabelWidth = ref(true)
const labelAlign = ref('left')
const showLabelColon = ref(false)
const labelGap = ref(8)

// 布局配置
const autoCalculate = ref(false)
const minColumnWidth = ref(200)
const fieldMinWidth = ref(200)
const defaultRows = ref(0)

// 验证配置
const validateOnChange = ref(true)
const validateOnBlur = ref(true)
const showErrorMessage = ref(true)

// 主题配置
const formSize = ref('medium')
const formTheme = ref('default')

// 表单配置
const formTitle = ref('')
const formDescription = ref('')
const formReadonly = ref(false)
const formDisabled = ref(false)

// 表单配置
const formOptions = computed<FormOptions>(() => {
  console.log('formOptions computed:', {
    columns: layoutColumns.value,
    gap: layoutGap.value,
    labelPosition: labelPosition.value,
    showLabels: showLabels.value,
    autoLabelWidth: autoLabelWidth.value
  })
  return {
  fields: [
    {
      name: 'name',
      title: '姓名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入姓名'
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      required: true,
      placeholder: '请输入邮箱',
      props: { type: 'email' }
    },
    {
      name: 'phone',
      title: '手机号',
      component: 'FormInput',
      placeholder: '请输入手机号',
      props: { type: 'tel' }
    },
    {
      name: 'gender',
      title: '性别',
      component: 'FormRadio',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ]
      }
    },
    {
      name: 'company',
      title: '公司',
      component: 'FormInput',
      placeholder: '请输入公司名称'
    },
    {
      name: 'position',
      title: '职位',
      component: 'FormInput',
      placeholder: '请输入职位'
    },
    {
      name: 'skills',
      title: '技能',
      component: 'FormTextarea',
      span: 'full',
      placeholder: '请描述您的技能',
      props: { rows: 3 }
    },
    {
      name: 'remote',
      title: '远程工作',
      component: 'FormSwitch',
      props: {
        checkedText: '接受',
        uncheckedText: '不接受'
      }
    },
    {
      name: 'contactMethod',
      title: '联系方式',
      component: 'FormRadio',
      defaultValue: 'email',
      props: {
        options: [
          { label: '邮箱', value: 'email' },
          { label: '微信', value: 'wechat' }
        ]
      }
    },
    {
      name: 'wechat',
      title: '微信号',
      component: 'FormInput',
      placeholder: '请输入微信号',
      showWhen: {
        field: 'contactMethod',
        value: 'wechat'
      }
    },
    {
      name: 'agreement',
      title: '协议',
      component: 'FormCheckbox',
      required: true,
      span: 'full',
      props: {
        label: '我同意用户协议'
      }
    }
  ],
  layout: {
    columns: autoCalculate.value ? undefined : layoutColumns.value,
    autoCalculate: autoCalculate.value,
    minColumnWidth: minColumnWidth.value,
    fieldMinWidth: fieldMinWidth.value,
    defaultRows: defaultRows.value || undefined,
    horizontalGap: layoutGap.value,
    verticalGap: layoutGap.value,
    label: {
      position: showLabels.value ? labelPosition.value : 'none',
      align: labelAlign.value,
      autoWidth: autoLabelWidth.value,
      widthMode: 'auto',
      showColon: showLabelColon.value,
      gap: labelGap.value
    }
  },
  validation: {
    validateOnChange: validateOnChange.value,
    validateOnBlur: validateOnBlur.value,
    showErrorMessage: showErrorMessage.value
  },
  title: formTitle.value || undefined,
  description: formDescription.value || undefined,
  readonly: formReadonly.value,
  disabled: formDisabled.value,
  theme: {
    size: formSize.value,
    variant: formTheme.value
  }
})

// 事件处理
function handleSubmit(data: FormData) {
  console.log('表单提交:', data)
  alert('表单提交成功！')
}

function fillSampleData() {
  formData.value = {
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    gender: 'male',
    company: '示例科技',
    position: '前端工程师',
    skills: 'Vue.js, TypeScript, Node.js',
    remote: true,
    contactMethod: 'email',
    agreement: true
  }
}

function resetConfig() {
  // 布局配置
  layoutColumns.value = 3
  layoutGap.value = 16
  autoCalculate.value = false
  minColumnWidth.value = 200
  fieldMinWidth.value = 200
  defaultRows.value = 0

  // 标签配置
  showLabels.value = true
  labelPosition.value = 'top'
  labelAlign.value = 'left'
  autoLabelWidth.value = true
  showLabelColon.value = false
  labelGap.value = 8

  // 验证配置
  showValidation.value = true
  validateOnChange.value = true
  validateOnBlur.value = true
  showErrorMessage.value = true

  // 表单配置
  formTitle.value = ''
  formDescription.value = ''
  formSize.value = 'medium'
  formReadonly.value = false
  formDisabled.value = false
}

function testConfig() {
  // 演示配置变化 - 左侧标签 + 自动宽度
  autoCalculate.value = false
  layoutColumns.value = 2
  layoutGap.value = 24
  showLabels.value = true
  labelPosition.value = 'left'
  labelAlign.value = 'right'
  autoLabelWidth.value = true
  showLabelColon.value = true
  labelGap.value = 12
  validateOnChange.value = false
  validateOnBlur.value = true
  formTitle.value = '用户信息表单'
  formDescription.value = '请填写完整的用户信息'
  formSize.value = 'large'
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>@ldesign/form 演示</h1>
      <p>左侧配置，右侧表单展示</p>
    </header>

    <main class="main">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <h3>配置面板</h3>

        <div class="config-section">
          <h4>布局设置</h4>
          <div class="config-item">
            <label>
              <input v-model="autoCalculate" type="checkbox" />
              自动计算列数
            </label>
          </div>
          <div class="config-item" v-if="!autoCalculate">
            <label>列数: {{ layoutColumns }}</label>
            <input
              v-model.number="layoutColumns"
              type="range"
              min="1"
              max="6"
              step="1"
            />
          </div>
          <div class="config-item" v-if="autoCalculate">
            <label>最小列宽: {{ minColumnWidth }}px</label>
            <input
              v-model.number="minColumnWidth"
              type="range"
              min="150"
              max="400"
              step="10"
            />
          </div>
          <div class="config-item" v-if="autoCalculate">
            <label>字段最小宽度: {{ fieldMinWidth }}px</label>
            <input
              v-model.number="fieldMinWidth"
              type="range"
              min="150"
              max="400"
              step="10"
            />
          </div>
          <div class="config-item">
            <label>水平间距: {{ layoutGap }}px</label>
            <input
              v-model.number="layoutGap"
              type="range"
              min="4"
              max="48"
              step="4"
            />
          </div>
          <div class="config-item">
            <label>默认行数: {{ defaultRows || '不限制' }}</label>
            <input
              v-model.number="defaultRows"
              type="range"
              min="0"
              max="10"
              step="1"
            />
          </div>
        </div>

        <div class="config-section">
          <h4>显示设置</h4>
          <div class="config-item">
            <label>
              <input v-model="showValidation" type="checkbox" />
              显示验证
            </label>
          </div>
          <div class="config-item">
            <label>
              <input v-model="showLabels" type="checkbox" />
              显示标签
            </label>
          </div>
          <div class="config-item" v-if="showLabels">
            <label>标签位置:</label>
            <select v-model="labelPosition">
              <option value="top">顶部</option>
              <option value="left">左侧</option>
              <option value="right">右侧</option>
            </select>
          </div>
          <div
            class="config-item"
            v-if="
              showLabels &&
              (labelPosition === 'left' || labelPosition === 'right')
            "
          >
            <label>
              <input v-model="autoLabelWidth" type="checkbox" />
              自动标签宽度
            </label>
          </div>
          <div class="config-item" v-if="showLabels">
            <label>标签对齐:</label>
            <select v-model="labelAlign">
              <option value="left">左对齐</option>
              <option value="center">居中</option>
              <option value="right">右对齐</option>
            </select>
          </div>
          <div class="config-item" v-if="showLabels">
            <label>
              <input v-model="showLabelColon" type="checkbox" />
              显示冒号
            </label>
          </div>
          <div class="config-item" v-if="showLabels">
            <label>标签间距: {{ labelGap }}px</label>
            <input
              v-model.number="labelGap"
              type="range"
              min="0"
              max="20"
              step="2"
            />
          </div>
        </div>

        <div class="config-section">
          <h4>验证设置</h4>
          <div class="config-item">
            <label>
              <input v-model="validateOnChange" type="checkbox" />
              输入时验证
            </label>
          </div>
          <div class="config-item">
            <label>
              <input v-model="validateOnBlur" type="checkbox" />
              失焦时验证
            </label>
          </div>
          <div class="config-item">
            <label>
              <input v-model="showErrorMessage" type="checkbox" />
              显示错误信息
            </label>
          </div>
        </div>

        <div class="config-section">
          <h4>表单设置</h4>
          <div class="config-item">
            <label>表单标题:</label>
            <input v-model="formTitle" type="text" placeholder="输入表单标题" />
          </div>
          <div class="config-item">
            <label>表单描述:</label>
            <textarea
              v-model="formDescription"
              placeholder="输入表单描述"
              rows="2"
            ></textarea>
          </div>
          <div class="config-item">
            <label>表单大小:</label>
            <select v-model="formSize">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
          <div class="config-item">
            <label>
              <input v-model="formReadonly" type="checkbox" />
              只读模式
            </label>
          </div>
          <div class="config-item">
            <label>
              <input v-model="formDisabled" type="checkbox" />
              禁用模式
            </label>
          </div>
        </div>

        <div class="config-section">
          <h4>操作</h4>
          <div class="button-group">
            <button @click="fillSampleData" class="btn">填充数据</button>
            <button @click="resetConfig" class="btn btn-secondary">
              重置配置
            </button>
            <button @click="testConfig" class="btn btn-test">测试配置</button>
          </div>
        </div>

        <div class="config-section">
          <h4>当前配置</h4>
          <div class="config-status">
            <div class="status-item">
              <span>列数:</span>
              <span class="status-value">{{
                autoCalculate ? '自动' : layoutColumns
              }}</span>
            </div>
            <div class="status-item">
              <span>间距:</span>
              <span class="status-value">{{ layoutGap }}px</span>
            </div>
            <div class="status-item">
              <span>标签:</span>
              <span class="status-value">{{
                showLabels ? `${labelPosition}(${labelAlign})` : '隐藏'
              }}</span>
            </div>
            <div
              class="status-item"
              v-if="
                showLabels &&
                (labelPosition === 'left' || labelPosition === 'right')
              "
            >
              <span>自动宽度:</span>
              <span class="status-value">{{
                autoLabelWidth ? '开启' : '关闭'
              }}</span>
            </div>
            <div class="status-item">
              <span>验证:</span>
              <span class="status-value">{{
                validateOnChange ? '开启' : '关闭'
              }}</span>
            </div>
            <div class="status-item" v-if="formTitle">
              <span>标题:</span>
              <span class="status-value">{{ formTitle }}</span>
            </div>
            <div class="status-item">
              <span>大小:</span>
              <span class="status-value">{{ formSize }}</span>
            </div>
            <div class="status-item" v-if="formReadonly || formDisabled">
              <span>状态:</span>
              <span class="status-value">{{
                formReadonly ? '只读' : formDisabled ? '禁用' : '正常'
              }}</span>
            </div>
          </div>
        </div>

        <div class="config-section">
          <h4>表单数据</h4>
          <pre class="data-preview">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </div>
      </div>

      <!-- 右侧表单展示 -->
      <div class="form-panel">
        <h3>表单展示</h3>
        <DynamicForm
          v-model="formData"
          :options="formOptions"
          @submit="handleSubmit"
        />
      </div>
    </main>
  </div>
</template>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  margin: 0;
  padding: 0;
}

.header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.8rem;
}

.header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.main {
  flex: 1;
  display: flex;
  height: calc(100vh - 120px);
  width: 100%;
  max-width: 100%;
}

/* 左侧配置面板 */
.config-panel {
  width: 350px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 1.5rem;
  overflow-y: auto;
}

.config-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.config-section {
  margin-bottom: 2rem;
}

.config-section h4 {
  margin: 0 0 1rem 0;
  color: #555;
  font-size: 1rem;
}

.config-item {
  margin-bottom: 1rem;
}

.config-item label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.config-item input[type='range'] {
  width: 100%;
  margin-bottom: 0.5rem;
}

.config-item input[type='checkbox'] {
  margin-right: 0.5rem;
}

.config-item select,
.config-item input[type='text'],
.config-item textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
}

.config-item textarea {
  resize: vertical;
  min-height: 60px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-test {
  background: #28a745;
}

.btn-test:hover {
  background: #1e7e34;
}

.config-status {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e9ecef;
}

.status-item:last-child {
  border-bottom: none;
}

.status-value {
  font-weight: 600;
  color: #007bff;
}

.data-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  color: #495057;
}

/* 右侧表单面板 */
.form-panel {
  flex: 1;
  background: white;
  padding: 1.5rem;
  overflow-y: auto;
}

.form-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #28a745;
  padding-bottom: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main {
    flex-direction: column;
    height: auto;
  }

  .config-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .form-panel {
    min-height: 500px;
  }

  .header {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }
}
</style>
