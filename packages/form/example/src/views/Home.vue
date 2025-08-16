<script setup lang="ts">
import type { FormOptions } from '@ldesign/form'
import { DynamicForm } from '@ldesign/form'
import { ref } from 'vue'

// 表单数据
const formData = ref({
  name: '',
  email: '',
  age: null,
  gender: '',
  interests: [],
  description: '',
})

// 表单配置
const formConfig: FormOptions = {
  fields: [
    {
      name: 'name',
      title: '姓名',
      component: 'FormInput',
      required: true,
      span: 12,
      props: {
        placeholder: '请输入姓名',
      },
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      required: true,
      span: 12,
      props: {
        type: 'email',
        placeholder: '请输入邮箱',
      },
    },
    {
      name: 'age',
      title: '年龄',
      component: 'FormInput',
      span: 12,
      props: {
        type: 'number',
        placeholder: '请输入年龄',
      },
    },
    {
      name: 'gender',
      title: '性别',
      component: 'FormRadio',
      span: 12,
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
      },
    },
    {
      name: 'interests',
      title: '兴趣爱好',
      component: 'FormCheckbox',
      span: 24,
      props: {
        options: [
          { label: '阅读', value: 'reading' },
          { label: '运动', value: 'sports' },
          { label: '音乐', value: 'music' },
          { label: '旅行', value: 'travel' },
        ],
      },
    },
    {
      name: 'description',
      title: '个人描述',
      component: 'FormTextarea',
      span: 24,
      props: {
        placeholder: '请输入个人描述',
        rows: 4,
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
  alert('表单提交成功！请查看控制台输出')
}

function handleChange(name: string, value: any) {
  console.log('字段变化:', name, value)
}

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    age: null,
    gender: '',
    interests: [],
    description: '',
  }
}

function fillSampleData() {
  formData.value = {
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25,
    gender: 'male',
    interests: ['reading', 'sports'],
    description: '这是一个示例描述',
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">基础示例</h1>
      <p class="text-gray-600">展示LDesign Form的基本用法</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">基础表单</h2>

        <DynamicForm
          v-model="formData"
          :options="formConfig"
          @submit="handleSubmit"
          @change="handleChange"
        />
      </div>

      <!-- 数据展示区域 -->
      <div class="space-y-6">
        <!-- 表单数据 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">表单数据</h3>
          <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </div>

        <!-- 操作按钮 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">操作</h3>
          <div class="space-y-3">
            <button
              class="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              @click="resetForm"
            >
              重置表单
            </button>
            <button
              class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              @click="fillSampleData"
            >
              填充示例数据
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
