<script setup lang="ts">
import {
  createField,
  createFormConfig,
  createRule,
  useFormBuilder,
} from '../../../src/index'

// 表单配置
const formConfig = createFormConfig({
  fields: [
    createField({
      key: 'username',
      label: '用户名',
      type: 'input',
      required: true,
      rules: [
        createRule('required', '请输入用户名'),
        createRule('minLength', '用户名至少3个字符', { min: 3 }),
      ],
      props: {
        placeholder: '请输入用户名',
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
        placeholder: '请输入邮箱',
      },
    }),
    createField({
      key: 'age',
      label: '年龄',
      type: 'number',
      rules: [createRule('min', '年龄不能小于18', { min: 18 })],
      props: {
        placeholder: '请输入年龄',
      },
    }),
    createField({
      key: 'role',
      label: '角色',
      type: 'select',
      required: true,
      rules: [createRule('required', '请选择角色')],
      props: {
        placeholder: '请选择角色',
        options: [
          { label: '管理员', value: 'admin' },
          { label: '用户', value: 'user' },
          { label: '访客', value: 'guest' },
        ],
      },
    }),
    createField({
      key: 'description',
      label: '描述',
      type: 'textarea',
      props: {
        placeholder: '请输入描述信息',
        rows: 3,
      },
    }),
    createField({
      key: 'agree',
      label: '同意条款',
      type: 'checkbox',
      required: true,
      rules: [createRule('required', '请同意条款')],
      props: {
        label: '我同意相关条款和条件',
      },
    }),
  ],
})

// 使用 useFormBuilder Hook
const {
  // 状态
  submitting,
  validating,
  isValid,
  isDirty,
  isTouched,

  // 数据
  values,
  errors,
  visibleFields,

  // 方法
  getFieldValue,
  setFieldValue,
  getFieldError,
  handleFieldBlur,
  resetForm,
  submitForm,
} = useFormBuilder({
  config: formConfig,
  initialValues: {
    username: '',
    email: '',
    age: null,
    role: '',
    description: '',
    agree: false,
  },
  onSubmit: async data => {
    console.log('Hook 表单提交:', data)
    // 模拟异步提交
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('表单提交成功！请查看控制台输出')
  },
})

// 提交处理
function handleSubmit() {
  submitForm()
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        useFormBuilder Hook 演示
      </h1>
      <p class="text-gray-600">展示 useFormBuilder Hook 的使用方式和状态管理</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">表单</h2>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div
            v-for="field in visibleFields"
            :key="field.key"
            class="space-y-2"
          >
            <label class="block text-sm font-medium text-gray-700">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>

            <!-- 输入框 -->
            <input
              v-if="field.type === 'input'"
              :type="field.props?.type || 'text'"
              :placeholder="field.props?.placeholder"
              :value="getFieldValue(field.key)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': getFieldError(field.key) }"
              @input="
                setFieldValue(
                  field.key,
                  ($event.target as HTMLInputElement).value
                )
              "
              @blur="handleFieldBlur(field.key)"
            />

            <!-- 数字输入框 -->
            <input
              v-else-if="field.type === 'number'"
              type="number"
              :placeholder="field.props?.placeholder"
              :value="getFieldValue(field.key)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': getFieldError(field.key) }"
              @input="
                setFieldValue(
                  field.key,
                  Number(($event.target as HTMLInputElement).value)
                )
              "
              @blur="handleFieldBlur(field.key)"
            />

            <!-- 选择框 -->
            <select
              v-else-if="field.type === 'select'"
              :value="getFieldValue(field.key)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': getFieldError(field.key) }"
              @change="
                setFieldValue(
                  field.key,
                  ($event.target as HTMLSelectElement).value
                )
              "
              @blur="handleFieldBlur(field.key)"
            >
              <option value="">
                {{ field.props?.placeholder || '请选择' }}
              </option>
              <option
                v-for="option in field.props?.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <!-- 文本域 -->
            <textarea
              v-else-if="field.type === 'textarea'"
              :placeholder="field.props?.placeholder"
              :rows="field.props?.rows || 3"
              :value="getFieldValue(field.key)"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': getFieldError(field.key) }"
              @input="
                setFieldValue(
                  field.key,
                  ($event.target as HTMLTextAreaElement).value
                )
              "
              @blur="handleFieldBlur(field.key)"
            />

            <!-- 复选框 -->
            <label
              v-else-if="field.type === 'checkbox'"
              class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="getFieldValue(field.key)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @change="
                  setFieldValue(
                    field.key,
                    ($event.target as HTMLInputElement).checked
                  )
                "
                @blur="handleFieldBlur(field.key)"
              />
              <span class="text-sm text-gray-700">{{
                field.props?.label
              }}</span>
            </label>

            <!-- 错误信息 -->
            <div v-if="getFieldError(field.key)" class="text-red-500 text-sm">
              {{ getFieldError(field.key) }}
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex space-x-4 pt-4">
            <button
              type="submit"
              :disabled="submitting || !isValid"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? '提交中...' : '提交' }}
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              @click="resetForm"
            >
              重置
            </button>
          </div>
        </form>
      </div>

      <!-- 状态信息区域 -->
      <div class="space-y-6">
        <!-- 表单状态 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">表单状态</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>是否有效:</span>
              <span :class="isValid ? 'text-green-600' : 'text-red-600'">
                {{ isValid ? '是' : '否' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>是否修改:</span>
              <span :class="isDirty ? 'text-blue-600' : 'text-gray-600'">
                {{ isDirty ? '是' : '否' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>是否触摸:</span>
              <span :class="isTouched ? 'text-blue-600' : 'text-gray-600'">
                {{ isTouched ? '是' : '否' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>提交中:</span>
              <span :class="submitting ? 'text-orange-600' : 'text-gray-600'">
                {{ submitting ? '是' : '否' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>校验中:</span>
              <span :class="validating ? 'text-orange-600' : 'text-gray-600'">
                {{ validating ? '是' : '否' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 表单数据 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">表单数据</h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">{{
            JSON.stringify(values, null, 2)
          }}</pre>
        </div>

        <!-- 错误信息 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">错误信息</h3>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">{{
            JSON.stringify(errors, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
