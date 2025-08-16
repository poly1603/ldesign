<script setup lang="ts">
import type { FormField, FormOptions } from '@ldesign/form'
import { DynamicForm } from '@ldesign/form'
import { reactive, ref } from 'vue'

// 表单数据
const formData = ref<Record<string, any>>({})

// 字段计数器
let fieldCounter = 0

// 基础表单配置
const baseFormConfig: FormOptions = {
  fields: [
    {
      name: 'name',
      title: '姓名',
      component: 'FormInput',
      required: true,
      span: 24,
      props: {
        placeholder: '请输入姓名',
      },
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      span: 24,
      props: {
        type: 'email',
        placeholder: '请输入邮箱',
      },
    },
  ],
  layout: {
    columns: 24,
    gutter: 16,
  },
}

// 当前表单配置
const currentFormConfig = reactive<FormOptions>({
  ...baseFormConfig,
  fields: [...baseFormConfig.fields],
})

// 字段模板
const fieldTemplates = {
  input: {
    component: 'FormInput',
    props: {
      placeholder: '请输入内容',
    },
  },
  select: {
    component: 'FormSelect',
    props: {
      placeholder: '请选择',
      options: [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
        { label: '选项3', value: 'option3' },
      ],
    },
  },
  radio: {
    component: 'FormRadio',
    props: {
      options: [
        { label: '选项A', value: 'a' },
        { label: '选项B', value: 'b' },
        { label: '选项C', value: 'c' },
      ],
    },
  },
  checkbox: {
    component: 'FormCheckbox',
    props: {
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' },
      ],
    },
  },
}

// 添加字段
function addField(type: keyof typeof fieldTemplates) {
  fieldCounter++
  const template = fieldTemplates[type]

  const newField: FormField = {
    name: `dynamic_${type}_${fieldCounter}`,
    title: `动态${getFieldTypeName(type)}${fieldCounter}`,
    component: template.component as any,
    span: 24,
    props: template.props,
  }

  currentFormConfig.fields.push(newField)

  // 初始化字段值
  if (type === 'checkbox') {
    formData.value[newField.name] = []
  } else {
    formData.value[newField.name] = ''
  }
}

// 删除字段
function removeField(index: number) {
  const field = currentFormConfig.fields[index]
  if (field) {
    delete formData.value[field.name]
    currentFormConfig.fields.splice(index, 1)
  }
}

// 删除最后一个字段
function removeLastField() {
  if (currentFormConfig.fields.length > 0) {
    removeField(currentFormConfig.fields.length - 1)
  }
}

// 重置表单
function resetForm() {
  currentFormConfig.fields = [...baseFormConfig.fields]
  formData.value = {}
  fieldCounter = 0
}

// 获取字段类型名称
function getFieldTypeName(type: string) {
  const names: Record<string, string> = {
    input: '输入框',
    select: '选择框',
    radio: '单选框',
    checkbox: '复选框',
  }
  return names[type] || type
}

// 事件处理
function handleSubmit(data: any) {
  console.log('动态表单提交:', data)
  alert('动态表单提交成功！')
}

function handleChange(name: string, value: any) {
  console.log('字段变化:', name, value)
}

// 初始化表单数据
baseFormConfig.fields.forEach(field => {
  formData.value[field.name] = ''
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">动态表单</h1>
      <p class="text-gray-600">展示动态添加/删除字段功能</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">动态表单</h2>

        <DynamicForm
          v-model="formData"
          :options="currentFormConfig"
          @submit="handleSubmit"
          @change="handleChange"
        />

        <!-- 动态操作按钮 -->
        <div class="mt-6 space-y-4">
          <div class="flex flex-wrap gap-2">
            <button
              class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              @click="addField('input')"
            >
              添加输入框
            </button>
            <button
              class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              @click="addField('select')"
            >
              添加选择框
            </button>
            <button
              class="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              @click="addField('radio')"
            >
              添加单选框
            </button>
            <button
              class="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
              @click="addField('checkbox')"
            >
              添加复选框
            </button>
          </div>

          <div class="flex gap-2">
            <button
              class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              @click="removeLastField"
            >
              删除最后一个字段
            </button>
            <button
              class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              @click="resetForm"
            >
              重置表单
            </button>
          </div>
        </div>
      </div>

      <!-- 配置信息区域 -->
      <div class="space-y-6">
        <!-- 当前字段列表 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">当前字段列表</h3>
          <div class="space-y-2">
            <div
              v-for="(field, index) in currentFormConfig.fields"
              :key="field.name"
              class="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium">{{ field.title }}</span>
                <span class="text-xs text-gray-500"
                  >({{ field.component }})</span
                >
              </div>
              <button
                class="text-red-500 hover:text-red-700 text-sm"
                @click="removeField(index)"
              >
                删除
              </button>
            </div>
            <div
              v-if="currentFormConfig.fields.length === 0"
              class="text-gray-500 text-sm text-center py-4"
            >
              暂无字段
            </div>
          </div>
        </div>

        <!-- 表单数据 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">表单数据</h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">{{
            JSON.stringify(formData, null, 2)
          }}</pre>
        </div>

        <!-- 表单配置 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">表单配置</h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">{{
            JSON.stringify(currentFormConfig, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
