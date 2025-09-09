<template>
  <div class="advanced-form">
    <h2>高级功能示例</h2>
    <p class="description">
      演示 @ldesign/form 的高级功能，包括字段联动、条件渲染、动态表单等。
    </p>

    <div class="examples-container">
      <!-- 字段联动示例 -->
      <div class="card">
        <div class="card__header">
          <h3>字段联动</h3>
          <p>根据用户选择动态显示和隐藏字段</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <div ref="dependencyFormContainer" class="form-container"></div>
              <div class="form-actions">
                <button @click="submitDependency" class="btn btn--primary">提交</button>
                <button @click="resetDependency" class="btn">重置</button>
              </div>
            </div>
            <div class="form-demo__result">
              <h4>表单数据</h4>
              <pre>{{ JSON.stringify(dependencyData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 动态表单示例 -->
      <div class="card">
        <div class="card__header">
          <h3>动态表单</h3>
          <p>运行时动态添加和删除字段</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <div ref="dynamicFormContainer" class="form-container"></div>
              <div class="form-actions">
                <button @click="addField" class="btn">添加字段</button>
                <button @click="removeField" class="btn btn--danger">删除字段</button>
                <button @click="submitDynamic" class="btn btn--primary">提交</button>
                <button @click="resetDynamic" class="btn">重置</button>
              </div>
            </div>
            <div class="form-demo__result">
              <h4>表单数据</h4>
              <pre>{{ JSON.stringify(dynamicData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单状态管理示例 -->
      <div class="card">
        <div class="card__header">
          <h3>状态管理</h3>
          <p>展示表单状态的实时变化</p>
        </div>
        <div class="card__content">
          <div class="form-demo">
            <div class="form-demo__form">
              <div ref="stateFormContainer" class="form-container"></div>
              <div class="form-actions">
                <button @click="markAllTouched" class="btn">标记所有字段为已触摸</button>
                <button @click="markAllDirty" class="btn">标记所有字段为已修改</button>
                <button @click="resetState" class="btn">重置状态</button>
              </div>
            </div>
            <div class="form-demo__result">
              <h4>表单状态</h4>
              <pre>{{ JSON.stringify(stateData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createForm, VanillaAdapter } from '@ldesign/form'

const dependencyFormContainer = ref<HTMLElement>()
const dynamicFormContainer = ref<HTMLElement>()
const stateFormContainer = ref<HTMLElement>()

const dependencyData = ref({})
const dynamicData = ref({})
const stateData = ref({})

let dependencyForm: any = null
let dynamicForm: any = null
let stateForm: any = null

let dependencyAdapter: VanillaAdapter | null = null
let dynamicAdapter: VanillaAdapter | null = null
let stateAdapter: VanillaAdapter | null = null

let fieldCounter = 0

onMounted(() => {
  setupDependencyForm()
  setupDynamicForm()
  setupStateForm()
})

onUnmounted(() => {
  // 清理资源
  if (dependencyAdapter) dependencyAdapter.unmount()
  if (dynamicAdapter) dynamicAdapter.unmount()
  if (stateAdapter) stateAdapter.unmount()
  
  if (dependencyForm) dependencyForm.destroy()
  if (dynamicForm) dynamicForm.destroy()
  if (stateForm) stateForm.destroy()
})

// 设置字段联动表单
const setupDependencyForm = () => {
  if (!dependencyFormContainer.value) return

  dependencyForm = createForm({
    initialValues: {
      userType: '',
      companyName: '',
      position: '',
      studentId: '',
      school: '',
      grade: ''
    },
    fields: [
      {
        name: 'userType',
        label: '用户类型',
        type: 'select',
        options: [
          { label: '请选择', value: '' },
          { label: '企业用户', value: 'company' },
          { label: '学生用户', value: 'student' }
        ],
        rules: [{ type: 'required', message: '请选择用户类型' }]
      },
      {
        name: 'companyName',
        label: '公司名称',
        type: 'input',
        placeholder: '请输入公司名称',
        visible: (values: any) => values.userType === 'company',
        rules: [
          { 
            type: 'required', 
            message: '请输入公司名称',
            condition: (formData: any) => formData.userType === 'company'
          }
        ]
      },
      {
        name: 'position',
        label: '职位',
        type: 'input',
        placeholder: '请输入职位',
        visible: (values: any) => values.userType === 'company',
        rules: [
          { 
            type: 'required', 
            message: '请输入职位',
            condition: (formData: any) => formData.userType === 'company'
          }
        ]
      },
      {
        name: 'studentId',
        label: '学号',
        type: 'input',
        placeholder: '请输入学号',
        visible: (values: any) => values.userType === 'student',
        rules: [
          { 
            type: 'required', 
            message: '请输入学号',
            condition: (formData: any) => formData.userType === 'student'
          }
        ]
      },
      {
        name: 'school',
        label: '学校',
        type: 'input',
        placeholder: '请输入学校名称',
        visible: (values: any) => values.userType === 'student',
        rules: [
          { 
            type: 'required', 
            message: '请输入学校名称',
            condition: (formData: any) => formData.userType === 'student'
          }
        ]
      },
      {
        name: 'grade',
        label: '年级',
        type: 'select',
        options: [
          { label: '请选择', value: '' },
          { label: '大一', value: '1' },
          { label: '大二', value: '2' },
          { label: '大三', value: '3' },
          { label: '大四', value: '4' }
        ],
        visible: (values: any) => values.userType === 'student',
        rules: [
          { 
            type: 'required', 
            message: '请选择年级',
            condition: (formData: any) => formData.userType === 'student'
          }
        ]
      }
    ]
  }, {
    onValuesChange: (values) => {
      dependencyData.value = values
    }
  })

  dependencyAdapter = new VanillaAdapter()
  dependencyAdapter.mount(dependencyForm, dependencyFormContainer.value)
  
  dependencyData.value = dependencyForm.getData()
}

// 设置动态表单
const setupDynamicForm = () => {
  if (!dynamicFormContainer.value) return

  dynamicForm = createForm({
    initialValues: {
      name: '',
      email: ''
    },
    fields: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        placeholder: '请输入姓名',
        rules: [{ type: 'required', message: '请输入姓名' }]
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        placeholder: '请输入邮箱',
        rules: [
          { type: 'required', message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]
      }
    ]
  }, {
    onValuesChange: (values) => {
      dynamicData.value = values
    }
  })

  dynamicAdapter = new VanillaAdapter()
  dynamicAdapter.mount(dynamicForm, dynamicFormContainer.value)
  
  dynamicData.value = dynamicForm.getData()
}

// 设置状态管理表单
const setupStateForm = () => {
  if (!stateFormContainer.value) return

  stateForm = createForm({
    initialValues: {
      field1: '',
      field2: '',
      field3: ''
    },
    fields: [
      {
        name: 'field1',
        label: '字段1',
        type: 'input',
        placeholder: '请输入内容',
        rules: [{ type: 'required', message: '请输入字段1' }]
      },
      {
        name: 'field2',
        label: '字段2',
        type: 'input',
        placeholder: '请输入内容',
        rules: [{ type: 'required', message: '请输入字段2' }]
      },
      {
        name: 'field3',
        label: '字段3',
        type: 'input',
        placeholder: '请输入内容',
        rules: [{ type: 'required', message: '请输入字段3' }]
      }
    ]
  })

  stateAdapter = new VanillaAdapter()
  stateAdapter.mount(stateForm, stateFormContainer.value)

  // 监听状态变化
  stateForm.on('state:change', (state: any) => {
    stateData.value = state
  })
  
  stateData.value = stateForm.getState()
}

// 字段联动操作
const submitDependency = async () => {
  if (!dependencyForm) return
  try {
    await dependencyForm.submit()
    alert('提交成功！')
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const resetDependency = () => {
  if (!dependencyForm) return
  dependencyForm.reset()
}

// 动态表单操作
const addField = () => {
  if (!dynamicForm) return
  
  fieldCounter++
  const fieldName = `dynamicField${fieldCounter}`
  
  // 添加字段配置
  dynamicForm.fieldManager.addField({
    name: fieldName,
    label: `动态字段 ${fieldCounter}`,
    type: 'input',
    placeholder: `请输入动态字段 ${fieldCounter}`,
    rules: [{ type: 'required', message: `请输入动态字段 ${fieldCounter}` }]
  })
  
  // 设置初始值
  dynamicForm.setFieldValue(fieldName, '')
  
  // 重新渲染
  if (dynamicAdapter) {
    dynamicAdapter.unmount()
    dynamicAdapter.mount(dynamicForm, dynamicFormContainer.value!)
  }
}

const removeField = () => {
  if (!dynamicForm || fieldCounter <= 0) return
  
  const fieldName = `dynamicField${fieldCounter}`
  
  // 删除字段
  dynamicForm.fieldManager.removeField(fieldName)
  
  fieldCounter--
  
  // 重新渲染
  if (dynamicAdapter) {
    dynamicAdapter.unmount()
    dynamicAdapter.mount(dynamicForm, dynamicFormContainer.value!)
  }
}

const submitDynamic = async () => {
  if (!dynamicForm) return
  try {
    await dynamicForm.submit()
    alert('提交成功！')
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const resetDynamic = () => {
  if (!dynamicForm) return
  dynamicForm.reset()
}

// 状态管理操作
const markAllTouched = () => {
  if (!stateForm) return
  
  const fields = stateForm.fieldManager.getAllFields()
  fields.forEach((field: any) => {
    stateForm.fieldManager.setFieldState(field.name, { touched: true })
  })
}

const markAllDirty = () => {
  if (!stateForm) return
  
  const fields = stateForm.fieldManager.getAllFields()
  fields.forEach((field: any) => {
    stateForm.fieldManager.setFieldState(field.name, { dirty: true })
  })
}

const resetState = () => {
  if (!stateForm) return
  stateForm.reset()
}
</script>

<style lang="less" scoped>
.advanced-form {
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

.examples-container {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xl);
}

.form-container {
  margin-bottom: var(--ls-margin-base);
}

.form-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-color);
  flex-wrap: wrap;
}
</style>
