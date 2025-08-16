<script setup lang="ts">
import type { FormOptions } from '@ldesign/form'
import { DynamicForm } from '@ldesign/form'
import { computed, ref } from 'vue'

// 表单数据
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  bio: '',
})

// 当前布局类型
const currentLayout = ref('single')

// 布局类型定义
const layoutTypes = [
  {
    key: 'single',
    name: '单列布局',
    description: '所有字段占满整行，适合移动端或简单表单',
  },
  {
    key: 'double',
    name: '双列布局',
    description: '字段分为两列显示，提高空间利用率',
  },
  {
    key: 'mixed',
    name: '混合布局',
    description: '不同字段使用不同的列宽，灵活布局',
  },
  {
    key: 'responsive',
    name: '响应式布局',
    description: '根据屏幕大小自动调整列数',
  },
]

// 基础字段配置
const baseFields = [
  {
    name: 'firstName',
    title: '名',
    component: 'FormInput',
    required: true,
    props: {
      placeholder: '请输入名',
    },
  },
  {
    name: 'lastName',
    title: '姓',
    component: 'FormInput',
    required: true,
    props: {
      placeholder: '请输入姓',
    },
  },
  {
    name: 'email',
    title: '邮箱',
    component: 'FormInput',
    required: true,
    props: {
      type: 'email',
      placeholder: '请输入邮箱',
    },
  },
  {
    name: 'phone',
    title: '电话',
    component: 'FormInput',
    props: {
      placeholder: '请输入电话号码',
    },
  },
  {
    name: 'address',
    title: '地址',
    component: 'FormInput',
    props: {
      placeholder: '请输入详细地址',
    },
  },
  {
    name: 'city',
    title: '城市',
    component: 'FormInput',
    props: {
      placeholder: '请输入城市',
    },
  },
  {
    name: 'state',
    title: '省份',
    component: 'FormSelect',
    props: {
      placeholder: '请选择省份',
      options: [
        { label: '北京', value: 'beijing' },
        { label: '上海', value: 'shanghai' },
        { label: '广东', value: 'guangdong' },
        { label: '浙江', value: 'zhejiang' },
      ],
    },
  },
  {
    name: 'zipCode',
    title: '邮编',
    component: 'FormInput',
    props: {
      placeholder: '请输入邮编',
    },
  },
  {
    name: 'country',
    title: '国家',
    component: 'FormSelect',
    props: {
      placeholder: '请选择国家',
      options: [
        { label: '中国', value: 'china' },
        { label: '美国', value: 'usa' },
        { label: '日本', value: 'japan' },
        { label: '韩国', value: 'korea' },
      ],
    },
  },
  {
    name: 'bio',
    title: '个人简介',
    component: 'FormInput',
    props: {
      type: 'textarea',
      placeholder: '请输入个人简介',
      rows: 4,
    },
  },
]

// 布局配置
const layoutConfigs = {
  single: {
    columns: 24,
    gutter: 16,
    fields: baseFields.map(field => ({ ...field, span: 24 })),
  },
  double: {
    columns: 24,
    gutter: 16,
    fields: baseFields.map((field, index) => ({
      ...field,
      span: field.name === 'address' || field.name === 'bio' ? 24 : 12,
    })),
  },
  mixed: {
    columns: 24,
    gutter: 16,
    fields: baseFields.map((field) => {
      const spanMap: Record<string, number> = {
        firstName: 8,
        lastName: 8,
        email: 8,
        phone: 12,
        address: 24,
        city: 8,
        state: 8,
        zipCode: 8,
        country: 12,
        bio: 24,
      }
      return { ...field, span: spanMap[field.name] || 12 }
    }),
  },
  responsive: {
    columns: 24,
    gutter: 16,
    fields: baseFields.map(field => ({
      ...field,
      span: 24,
      responsive: {
        xs: 24,
        sm: field.name === 'address' || field.name === 'bio' ? 24 : 12,
        md: field.name === 'address' || field.name === 'bio' ? 24 : 8,
        lg: field.name === 'address' || field.name === 'bio' ? 24 : 6,
      },
    })),
  },
}

// 当前表单配置
const currentFormConfig = computed((): FormOptions => {
  const config
    = layoutConfigs[currentLayout.value as keyof typeof layoutConfigs]
  return {
    fields: config.fields,
    layout: {
      columns: config.columns,
      gutter: config.gutter,
    },
  }
})

// 获取当前布局名称
function getCurrentLayoutName() {
  const layout = layoutTypes.find(l => l.key === currentLayout.value)
  return layout?.name || '未知布局'
}

// 获取当前布局描述
function getCurrentLayoutDescription() {
  const layout = layoutTypes.find(l => l.key === currentLayout.value)
  return layout?.description || ''
}

// 事件处理
function handleSubmit(data: any) {
  console.log('布局演示表单提交:', data)
  alert('表单提交成功！')
}

function handleChange(name: string, value: any) {
  console.log('字段变化:', name, value)
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        布局演示
      </h1>
      <p class="text-gray-600">
        展示不同的表单布局方式
      </p>
    </div>

    <!-- 布局切换 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">
        布局类型
      </h2>
      <div class="flex flex-wrap gap-4">
        <button
          v-for="layout in layoutTypes"
          :key="layout.key"
          class="px-4 py-2 rounded transition-colors" :class="[
            currentLayout === layout.key
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          @click="currentLayout = layout.key"
        >
          {{ layout.name }}
        </button>
      </div>
    </div>

    <!-- 表单展示 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">
          {{ getCurrentLayoutName() }}
        </h2>

        <DynamicForm
          v-model="formData"
          :options="currentFormConfig"
          @submit="handleSubmit"
          @change="handleChange"
        />
      </div>

      <!-- 配置信息区域 -->
      <div class="space-y-6">
        <!-- 布局说明 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">
            布局说明
          </h3>
          <div class="text-sm text-gray-600">
            <p>{{ getCurrentLayoutDescription() }}</p>
          </div>
        </div>

        <!-- 表单数据 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">
            表单数据
          </h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </div>

        <!-- 当前配置 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">
            当前配置
          </h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">{{
            JSON.stringify(currentFormConfig.layout, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
