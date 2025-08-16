<script setup lang="ts">
import type { FormOptions } from '@ldesign/form'
import { DynamicForm } from '@ldesign/form'
import { ref } from 'vue'

// 表单数据
const formData = ref({
  username: '',
  email: '',
  password: '',
  age: null,
})

// 表单配置
const formConfig: FormOptions = {
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true,
      span: 24,
      validation: {
        rules: [
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' },
          { max: 20, message: '用户名最多20个字符' },
        ],
      },
      props: {
        placeholder: '请输入用户名',
      },
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      required: true,
      span: 24,
      validation: {
        rules: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ],
      },
      props: {
        type: 'email',
        placeholder: '请输入邮箱',
      },
    },
    {
      name: 'password',
      title: '密码',
      component: 'FormInput',
      required: true,
      span: 24,
      validation: {
        rules: [
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' },
        ],
      },
      props: {
        type: 'password',
        placeholder: '请输入密码',
      },
    },
    {
      name: 'age',
      title: '年龄',
      component: 'FormInput',
      span: 24,
      validation: {
        rules: [
          { type: 'number', message: '请输入有效的数字' },
          { min: 18, message: '年龄不能小于18岁' },
          { max: 100, message: '年龄不能大于100岁' },
        ],
      },
      props: {
        type: 'number',
        placeholder: '请输入年龄',
      },
    },
  ],
  layout: {
    columns: 24,
    gutter: 16,
  },
}

// 事件处理
function handleSubmit(data: any) {
  console.log('表单提交:', data)
  alert('表单验证通过并提交成功！')
}

function handleChange(name: string, value: any) {
  console.log('字段变化:', name, value)
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">表单验证</h1>
      <p class="text-gray-600">展示表单验证功能</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">验证表单</h2>

        <DynamicForm
          v-model="formData"
          :options="formConfig"
          @submit="handleSubmit"
          @change="handleChange"
        />
      </div>

      <!-- 验证信息区域 -->
      <div class="space-y-6">
        <!-- 验证规则说明 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">验证规则说明</h3>
          <div class="space-y-3 text-sm">
            <div><strong>用户名:</strong> 必填，3-20个字符</div>
            <div><strong>邮箱:</strong> 必填，有效的邮箱格式</div>
            <div><strong>密码:</strong> 必填，至少6个字符</div>
            <div><strong>年龄:</strong> 18-100之间的数字</div>
          </div>
        </div>

        <!-- 表单数据 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">表单数据</h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
