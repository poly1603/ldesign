<template>
  <div class="example-container">
    <h1>Vue 组件使用示例</h1>

    <!-- 使用 DynamicForm 组件 -->
    <DynamicForm
      v-model="formData"
      :options="formOptions"
      @submit="handleSubmit"
      @change="handleChange"
      @validate="handleValidate"
    />

    <!-- 显示表单数据 -->
    <div class="data-display">
      <h3>表单数据：</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>

    <!-- 显示验证结果 -->
    <div v-if="validationResult" class="validation-display">
      <h3>验证结果：</h3>
      <p>有效性: {{ validationResult.valid ? '有效' : '无效' }}</p>
      <div v-if="!validationResult.valid">
        <h4>错误信息：</h4>
        <ul>
          <li v-for="(errors, field) in validationResult.errors" :key="field">
            {{ field }}: {{ errors.join(', ') }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DynamicForm } from '@ldesign/form'
import type { FormOptions, FormData } from '@ldesign/form'

// 表单配置
const formOptions: FormOptions = {
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
      placeholder: '请输入邮箱地址',
      rules: [
        { type: 'required', message: '邮箱不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    {
      name: 'age',
      title: '年龄',
      component: 'FormInput',
      type: 'number',
      placeholder: '请输入年龄',
      rules: [
        { type: 'required', message: '年龄不能为空' },
        { type: 'number', message: '年龄必须是数字' },
        { type: 'min', params: 18, message: '年龄不能小于18岁' },
        { type: 'max', params: 100, message: '年龄不能大于100岁' },
      ],
    },
    {
      name: 'gender',
      title: '性别',
      component: 'FormSelect',
      placeholder: '请选择性别',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
      rules: [{ type: 'required', message: '请选择性别' }],
    },
    {
      name: 'bio',
      title: '个人简介',
      component: 'FormTextarea',
      placeholder: '请输入个人简介',
      props: {
        rows: 4,
        maxlength: 500,
        showCount: true,
      },
      rules: [
        { type: 'maxLength', params: 500, message: '个人简介最多500个字符' },
      ],
    },
  ],

  layout: {
    columns: 2,
    horizontalGap: 16,
    verticalGap: 16,
    label: {
      position: 'left',
      width: 100,
      showColon: true,
    },
  },

  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    showErrors: true,
  },
}

// 响应式数据
const formData = ref<FormData>({
  username: '',
  email: '',
  age: '',
  gender: '',
  bio: '',
})

const validationResult = ref<{
  valid: boolean
  errors: Record<string, string[]>
} | null>(null)

// 事件处理
const handleSubmit = (data: FormData) => {
  console.log('表单提交:', data)
  alert('表单提交成功！请查看控制台输出。')
}

const handleChange = (data: FormData, field?: string) => {
  console.log('表单数据变化:', { data, field })
}

const handleValidate = (valid: boolean, errors: Record<string, string[]>) => {
  validationResult.value = { valid, errors }
  console.log('表单验证:', { valid, errors })
}
</script>

<style scoped>
.example-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.data-display,
.validation-display {
  margin-top: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.data-display pre {
  background: white;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.validation-display ul {
  margin: 10px 0;
  padding-left: 20px;
}

.validation-display li {
  margin: 5px 0;
  color: #f5222d;
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

h4 {
  margin: 15px 0 10px 0;
  color: #595959;
}
</style>
