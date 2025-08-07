<template>
  <div class="basic-form-demo">
    <div class="controls">
      <button class="btn btn-success" @click="fillSampleData">
        填充示例数据
      </button>
      <button class="btn btn-warning" @click="validateForm">验证表单</button>
      <button class="btn btn-secondary" @click="resetForm">重置表单</button>
      <button class="btn btn-danger" @click="clearForm">清空表单</button>
    </div>

    <div class="form-container">
      <DynamicForm
        v-model="formData"
        :options="formOptions"
        @submit="handleSubmit"
        @field-change="handleFieldChange"
        @validate="handleValidate"
      />
    </div>

    <div class="status-panel">
      <div class="status-title">表单状态</div>
      <div class="status-item">
        <span class="status-label">有效:</span>
        <span
          class="status-value"
          :class="formState.valid ? 'status-true' : 'status-false'"
        >
          {{ formState.valid }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">已修改:</span>
        <span
          class="status-value"
          :class="formState.dirty ? 'status-true' : 'status-false'"
        >
          {{ formState.dirty }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">已访问:</span>
        <span
          class="status-value"
          :class="formState.touched ? 'status-true' : 'status-false'"
        >
          {{ formState.touched }}
        </span>
      </div>
    </div>

    <div class="data-display">
      <div class="data-title">表单数据</div>
      <div class="data-content">{{ JSON.stringify(formData, null, 2) }}</div>
    </div>

    <div v-if="validationErrors.length > 0" class="data-display">
      <div class="data-title">验证错误</div>
      <div class="data-content">
        {{ JSON.stringify(validationErrors, null, 2) }}
      </div>
    </div>

    <div class="code-block">
      <div class="data-title">Vue 组件使用代码</div>
      <pre><code>&lt;template&gt;
  &lt;DynamicForm
    v-model="formData"
    :options="formOptions"
    @submit="handleSubmit"
    @field-change="handleFieldChange"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'
import type { FormOptions } from '@ldesign/form'

const formData = ref({})
const formOptions: FormOptions = {
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true,
      rules: [
        { type: 'required', message: '用户名不能为空' }
      ]
    }
    // ... 更多字段配置
  ]
}

const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
}
&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DynamicForm } from '@ldesign/form'
import type { FormOptions } from '@ldesign/form'

// 表单数据
const formData = ref<Record<string, any>>({})

// 表单状态
const formState = reactive({
  valid: false,
  dirty: false,
  touched: false,
})

// 验证错误
const validationErrors = ref<any[]>([])

// 表单配置
const formOptions: FormOptions = {
  title: '用户注册表单',
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入用户名',
      rules: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', params: 3, message: '用户名至少3个字符' },
        { type: 'maxLength', params: 20, message: '用户名最多20个字符' },
      ],
    },
    {
      name: 'email',
      title: '邮箱地址',
      component: 'FormInput',
      type: 'email',
      required: true,
      placeholder: '请输入邮箱地址',
      rules: [
        { type: 'required', message: '邮箱不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    {
      name: 'password',
      title: '密码',
      component: 'FormInput',
      type: 'password',
      required: true,
      placeholder: '请输入密码',
      rules: [
        { type: 'required', message: '密码不能为空' },
        { type: 'minLength', params: 6, message: '密码至少6个字符' },
      ],
    },
    {
      name: 'confirmPassword',
      title: '确认密码',
      component: 'FormInput',
      type: 'password',
      required: true,
      placeholder: '请再次输入密码',
      rules: [
        { type: 'required', message: '请确认密码' },
        {
          type: 'custom',
          message: '两次密码输入不一致',
          validator: (value: any, formData?: any) => {
            if (value !== formData.password) {
              return '两次密码输入不一致'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'age',
      title: '年龄',
      component: 'FormInput',
      type: 'number',
      placeholder: '请输入年龄',
      rules: [
        { type: 'min', params: 18, message: '年龄不能小于18岁' },
        { type: 'max', params: 100, message: '年龄不能大于100岁' },
      ],
    },
    {
      name: 'gender',
      title: '性别',
      component: 'FormRadio',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
    },
  ],
  layout: {
    columns: 2,
    horizontalGap: 16,
    verticalGap: 16,
  },
}

// 事件处理
const handleSubmit = (data: any) => {
  console.log('基础表单提交:', data)
  alert('表单提交成功！请查看控制台输出。')
}

const handleFieldChange = (fieldName: string, value: any) => {
  console.log('字段变化:', fieldName, value)
  // 更新表单状态（这里简化处理）
  formState.dirty = Object.keys(formData.value).length > 0
  formState.touched = true
}

const handleValidate = (valid: boolean, errors: any) => {
  console.log('表单验证:', valid, errors)
  formState.valid = valid
  validationErrors.value = errors ? Object.values(errors).flat() : []
}

// 操作方法
const fillSampleData = () => {
  formData.value = {
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: '123456',
    confirmPassword: '123456',
    age: 25,
    gender: 'male',
  }
  formState.dirty = true
  formState.touched = true
}

const validateForm = () => {
  // 这里应该调用表单的验证方法
  // 由于我们使用的是组件方式，验证会在提交时自动触发
  alert('请点击提交按钮进行验证')
}

const resetForm = () => {
  formData.value = {}
  formState.valid = false
  formState.dirty = false
  formState.touched = false
  validationErrors.value = []
}

const clearForm = () => {
  resetForm()
}
</script>
