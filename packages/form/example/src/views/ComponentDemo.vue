<script setup lang="ts">
import { ref } from 'vue'
import { createField, createFormConfig, createRule, FormBuilder } from '../../../src/index'

// 表单数据
const formData = ref({
  name: '',
  email: '',
  age: null,
  gender: '',
  bio: '',
  interests: [],
  agreeTerms: false,
})

// 表单配置
const formConfig = createFormConfig({
  fields: [
    createField({
      key: 'name',
      label: '姓名',
      type: 'input',
      required: true,
      rules: [
        createRule('required', '请输入姓名'),
        createRule('minLength', '姓名至少2个字符', { min: 2 }),
      ],
      props: {
        placeholder: '请输入您的姓名',
      },
    }),
    createField({
      key: 'email',
      label: '邮箱',
      type: 'input',
      required: true,
      rules: [
        createRule('required', '请输入邮箱'),
        createRule('email', '请输入有效的邮箱地址'),
      ],
      props: {
        type: 'email',
        placeholder: '请输入您的邮箱',
      },
    }),
    createField({
      key: 'age',
      label: '年龄',
      type: 'number',
      rules: [
        createRule('min', '年龄不能小于18', { min: 18 }),
        createRule('max', '年龄不能大于100', { max: 100 }),
      ],
      props: {
        placeholder: '请输入您的年龄',
      },
    }),
    createField({
      key: 'gender',
      label: '性别',
      type: 'select',
      required: true,
      rules: [createRule('required', '请选择性别')],
      props: {
        placeholder: '请选择性别',
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '其他', value: 'other' },
        ],
      },
    }),
    createField({
      key: 'interests',
      label: '兴趣爱好',
      type: 'checkbox-group',
      props: {
        options: [
          { label: '阅读', value: 'reading' },
          { label: '运动', value: 'sports' },
          { label: '音乐', value: 'music' },
          { label: '旅行', value: 'travel' },
          { label: '编程', value: 'coding' },
        ],
      },
    }),
    createField({
      key: 'bio',
      label: '个人简介',
      type: 'textarea',
      props: {
        placeholder: '请简单介绍一下自己',
        rows: 4,
      },
    }),
    createField({
      key: 'agreeTerms',
      label: '同意条款',
      type: 'checkbox',
      required: true,
      rules: [createRule('required', '请同意用户条款')],
      props: {
        label: '我已阅读并同意用户条款',
      },
    }),
  ],
  layout: {
    type: 'vertical',
    labelWidth: '120px',
    gutter: 16,
  },
  actions: {
    submit: {
      text: '提交表单',
      type: 'primary',
    },
    reset: {
      text: '重置',
      type: 'default',
    },
  },
})

// 事件处理
function handleSubmit(data: any) {
  console.log('表单提交:', data)
  alert('表单提交成功！请查看控制台输出')
}

function handleChange(key: string, value: any) {
  console.log('字段变化:', key, value)
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        FormBuilder 组件演示
      </h1>
      <p class="text-gray-600">
        展示 FormBuilder 组件的基本用法和功能
      </p>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">
        基础表单
      </h2>

      <FormBuilder
        v-model="formData"
        :config="formConfig"
        @submit="handleSubmit"
        @change="handleChange"
      />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">
        表单数据
      </h2>
      <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{
        JSON.stringify(formData, null, 2)
      }}</pre>
    </div>
  </div>
</template>
