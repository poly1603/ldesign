<template>
  <div class="example-container">
    <h1>Composition API 使用示例</h1>

    <!-- 使用 useForm Hook 渲染的表单 -->
    <component :is="form.renderForm()" />

    <!-- 表单操作按钮 -->
    <div class="actions">
      <button @click="handleValidate" :disabled="form.formState.validating">
        {{ form.formState.validating ? '验证中...' : '验证表单' }}
      </button>
      <button @click="handleSubmit" :disabled="form.formState.submitting">
        {{ form.formState.submitting ? '提交中...' : '提交表单' }}
      </button>
      <button @click="handleReset">重置表单</button>
      <button @click="handleFillDemo">填充示例数据</button>
    </div>

    <!-- 表单状态显示 -->
    <div class="status-display">
      <h3>表单状态：</h3>
      <div class="status-grid">
        <div class="status-item">
          <label>是否有效:</label>
          <span
            :class="{
              valid: form.formState.valid,
              invalid: !form.formState.valid,
            }"
          >
            {{ form.formState.valid ? '有效' : '无效' }}
          </span>
        </div>
        <div class="status-item">
          <label>是否已修改:</label>
          <span>{{ form.formState.dirty ? '是' : '否' }}</span>
        </div>
        <div class="status-item">
          <label>是否正在验证:</label>
          <span>{{ form.formState.validating ? '是' : '否' }}</span>
        </div>
        <div class="status-item">
          <label>是否正在提交:</label>
          <span>{{ form.formState.submitting ? '是' : '否' }}</span>
        </div>
      </div>
    </div>

    <!-- 字段状态显示 -->
    <div class="fields-display">
      <h3>字段状态：</h3>
      <div class="fields-grid">
        <div
          v-for="(state, fieldName) in form.fieldStates"
          :key="fieldName"
          class="field-item"
        >
          <h4>{{ fieldName }}</h4>
          <div class="field-details">
            <p><strong>值:</strong> {{ JSON.stringify(state.value) }}</p>
            <p><strong>已修改:</strong> {{ state.dirty ? '是' : '否' }}</p>
            <p><strong>已访问:</strong> {{ state.touched ? '是' : '否' }}</p>
            <p><strong>有效:</strong> {{ state.valid ? '是' : '否' }}</p>
            <p v-if="state.errors.length > 0">
              <strong>错误:</strong> {{ state.errors.join(', ') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 表单数据显示 -->
    <div class="data-display">
      <h3>表单数据：</h3>
      <pre>{{ JSON.stringify(form.formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form'
import type { FormOptions } from '@ldesign/form'

// 表单配置
const formOptions: FormOptions = {
  fields: [
    {
      name: 'name',
      title: '姓名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入姓名',
      span: 1,
      rules: [
        { type: 'required', message: '姓名不能为空' },
        { type: 'minLength', params: 2, message: '姓名至少2个字符' },
      ],
    },
    {
      name: 'phone',
      title: '手机号',
      component: 'FormInput',
      placeholder: '请输入手机号',
      span: 1,
      rules: [
        { type: 'required', message: '手机号不能为空' },
        { type: 'phone', message: '请输入有效的手机号' },
      ],
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      type: 'email',
      placeholder: '请输入邮箱',
      span: 2,
      rules: [{ type: 'email', message: '请输入有效的邮箱地址' }],
    },
    {
      name: 'department',
      title: '部门',
      component: 'FormSelect',
      placeholder: '请选择部门',
      span: 1,
      options: [
        { label: '技术部', value: 'tech' },
        { label: '产品部', value: 'product' },
        { label: '设计部', value: 'design' },
        { label: '运营部', value: 'operation' },
      ],
      rules: [{ type: 'required', message: '请选择部门' }],
    },
    {
      name: 'position',
      title: '职位',
      component: 'FormInput',
      placeholder: '请输入职位',
      span: 1,
      rules: [{ type: 'required', message: '职位不能为空' }],
    },
    {
      name: 'description',
      title: '个人描述',
      component: 'FormTextarea',
      placeholder: '请输入个人描述',
      span: 2,
      props: {
        rows: 3,
        maxlength: 200,
        showCount: true,
      },
    },
  ],

  layout: {
    columns: 2,
    horizontalGap: 20,
    verticalGap: 20,
    defaultRows: 3,
    label: {
      position: 'left',
      width: 80,
      showColon: true,
    },
    button: {
      position: 'newline',
      align: 'center',
    },
  },

  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    validateDelay: 300,
    showErrors: true,
  },

  title: '员工信息表单',
  description: '请填写完整的员工信息',
}

// 使用 useForm Hook
const form = useForm({
  ...formOptions,
  autoValidate: false,
  initialData: {
    name: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    description: '',
  },
})

// 监听表单事件
form.on('submit', data => {
  console.log('表单提交:', data)
  alert('表单提交成功！请查看控制台输出。')
})

form.on('change', (data, field) => {
  console.log('表单数据变化:', { data, field })
})

form.on('validate', result => {
  console.log('表单验证:', result)
})

form.on('fieldChange', (name, value) => {
  console.log('字段变化:', { name, value })
})

// 事件处理方法
const handleValidate = async () => {
  const isValid = await form.validate()
  console.log('验证结果:', isValid)
}

const handleSubmit = async () => {
  await form.submit()
}

const handleReset = () => {
  form.reset()
  console.log('表单已重置')
}

const handleFillDemo = () => {
  form.setFormData({
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    department: 'tech',
    position: '前端工程师',
    description: '负责前端开发工作，熟悉Vue、React等框架。',
  })
  console.log('已填充示例数据')
}
</script>

<style scoped>
.example-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.actions {
  margin: 30px 0;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.actions button {
  padding: 10px 20px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.actions button:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-display,
.fields-display,
.data-display {
  margin-top: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.status-item label {
  font-weight: 500;
}

.valid {
  color: #52c41a;
  font-weight: 500;
}

.invalid {
  color: #f5222d;
  font-weight: 500;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.field-item {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.field-item h4 {
  margin: 0 0 10px 0;
  color: #1890ff;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 5px;
}

.field-details p {
  margin: 5px 0;
  font-size: 14px;
}

.data-display pre {
  background: white;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
}

h1 {
  text-align: center;
  color: #262626;
  margin-bottom: 30px;
}

h3 {
  margin: 0 0 15px 0;
  color: #595959;
}
</style>
