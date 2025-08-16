<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createField,
  createFormConfig,
  createRule,
  FormBuilder,
} from '../../../src/index'

// 表单数据
const formData = ref({
  userType: 'personal',
  // 个人信息
  realName: '',
  idCard: '',
  birthday: '',
  // 企业信息
  companyName: '',
  creditCode: '',
  legalPerson: '',
  // 学生信息
  school: '',
  major: '',
  studentId: '',
  // 通知设置
  enableNotification: false,
  notificationMethod: '',
  email: '',
  phone: '',
  // 其他信息
  address: '',
  remarks: '',
})

// 表单配置
const formConfig = createFormConfig({
  fields: [
    // 基础信息
    createField({
      key: 'userType',
      label: '用户类型',
      type: 'select',
      required: true,
      options: [
        { label: '个人用户', value: 'personal' },
        { label: '企业用户', value: 'company' },
        { label: '学生用户', value: 'student' },
      ],
      props: {
        placeholder: '请选择用户类型',
      },
    }),

    // 个人用户字段
    createField({
      key: 'realName',
      label: '真实姓名',
      type: 'input',
      required: true,
      condition: data => data.userType === 'personal',
      rules: [
        createRule('required', '请输入真实姓名'),
        createRule('minLength', '姓名至少2个字符', { min: 2 }),
      ],
      props: {
        placeholder: '请输入真实姓名',
      },
    }),
    createField({
      key: 'idCard',
      label: '身份证号',
      type: 'input',
      required: true,
      condition: data => data.userType === 'personal',
      rules: [
        createRule('required', '请输入身份证号'),
        createRule('pattern', '请输入有效的身份证号', {
          pattern:
            /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/i,
        }),
      ],
      props: {
        placeholder: '请输入身份证号',
      },
    }),
    createField({
      key: 'birthday',
      label: '出生日期',
      type: 'date',
      condition: data => data.userType === 'personal',
      props: {
        placeholder: '请选择出生日期',
      },
    }),

    // 企业用户字段
    createField({
      key: 'companyName',
      label: '公司名称',
      type: 'input',
      required: true,
      condition: data => data.userType === 'company',
      rules: [
        createRule('required', '请输入公司名称'),
        createRule('minLength', '公司名称至少3个字符', { min: 3 }),
      ],
      props: {
        placeholder: '请输入公司名称',
      },
    }),
    createField({
      key: 'creditCode',
      label: '统一社会信用代码',
      type: 'input',
      required: true,
      condition: data => data.userType === 'company',
      rules: [
        createRule('required', '请输入统一社会信用代码'),
        createRule('pattern', '请输入有效的统一社会信用代码', {
          pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
        }),
      ],
      props: {
        placeholder: '请输入统一社会信用代码',
      },
    }),
    createField({
      key: 'legalPerson',
      label: '法人代表',
      type: 'input',
      required: true,
      condition: data => data.userType === 'company',
      rules: [createRule('required', '请输入法人代表姓名')],
      props: {
        placeholder: '请输入法人代表姓名',
      },
    }),

    // 学生用户字段
    createField({
      key: 'school',
      label: '学校名称',
      type: 'input',
      required: true,
      condition: data => data.userType === 'student',
      rules: [createRule('required', '请输入学校名称')],
      props: {
        placeholder: '请输入学校名称',
      },
    }),
    createField({
      key: 'major',
      label: '专业',
      type: 'input',
      required: true,
      condition: data => data.userType === 'student',
      rules: [createRule('required', '请输入专业')],
      props: {
        placeholder: '请输入专业',
      },
    }),
    createField({
      key: 'studentId',
      label: '学号',
      type: 'input',
      required: true,
      condition: data => data.userType === 'student',
      rules: [createRule('required', '请输入学号')],
      props: {
        placeholder: '请输入学号',
      },
    }),

    // 通知设置
    createField({
      key: 'enableNotification',
      label: '启用通知',
      type: 'checkbox',
      props: {
        label: '我希望接收相关通知',
      },
    }),
    createField({
      key: 'notificationMethod',
      label: '通知方式',
      type: 'radio',
      required: true,
      condition: data => data.enableNotification,
      options: [
        { label: '邮件通知', value: 'email' },
        { label: '短信通知', value: 'sms' },
        { label: '站内消息', value: 'message' },
      ],
      rules: [createRule('required', '请选择通知方式')],
    }),
    createField({
      key: 'email',
      label: '邮箱地址',
      type: 'input',
      required: true,
      condition: data =>
        data.enableNotification && data.notificationMethod === 'email',
      rules: [
        createRule('required', '请输入邮箱地址'),
        createRule('email', '请输入有效的邮箱地址'),
      ],
      props: {
        type: 'email',
        placeholder: '请输入邮箱地址',
      },
    }),
    createField({
      key: 'phone',
      label: '手机号码',
      type: 'input',
      required: true,
      condition: data =>
        data.enableNotification && data.notificationMethod === 'sms',
      rules: [
        createRule('required', '请输入手机号码'),
        createRule('pattern', '请输入有效的手机号码', {
          pattern: /^1[3-9]\d{9}$/,
        }),
      ],
      props: {
        placeholder: '请输入手机号码',
      },
    }),

    // 其他信息
    createField({
      key: 'address',
      label: '联系地址',
      type: 'textarea',
      props: {
        placeholder: '请输入联系地址',
        rows: 3,
      },
    }),
    createField({
      key: 'remarks',
      label: '备注信息',
      type: 'textarea',
      props: {
        placeholder: '请输入备注信息',
        rows: 3,
      },
    }),
  ],
  layout: {
    type: 'vertical',
    labelWidth: '140px',
    gutter: 16,
  },
  actions: {
    submit: {
      text: '提交信息',
      type: 'primary',
    },
    reset: {
      text: '重置表单',
      type: 'default',
    },
  },
})

// 当前显示的字段
const visibleFields = computed(() => {
  return formConfig.fields.filter(field => {
    if (!field.condition) return true
    return field.condition(formData.value)
  })
})

// 事件处理
function handleSubmit(data: any) {
  console.log('条件渲染演示表单提交:', data)
  alert('表单提交成功！请查看控制台输出')
}

function handleChange(key: string, value: any) {
  console.log('字段变化:', key, value)

  // 当用户类型改变时，清空相关字段
  if (key === 'userType') {
    // 清空个人信息
    if (value !== 'personal') {
      formData.value.realName = ''
      formData.value.idCard = ''
      formData.value.birthday = ''
    }
    // 清空企业信息
    if (value !== 'company') {
      formData.value.companyName = ''
      formData.value.creditCode = ''
      formData.value.legalPerson = ''
    }
    // 清空学生信息
    if (value !== 'student') {
      formData.value.school = ''
      formData.value.major = ''
      formData.value.studentId = ''
    }
  }

  // 当禁用通知时，清空通知相关字段
  if (key === 'enableNotification' && !value) {
    formData.value.notificationMethod = ''
    formData.value.email = ''
    formData.value.phone = ''
  }

  // 当通知方式改变时，清空对应字段
  if (key === 'notificationMethod') {
    if (value !== 'email') {
      formData.value.email = ''
    }
    if (value !== 'sms') {
      formData.value.phone = ''
    }
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">条件渲染演示</h1>
      <p class="text-gray-600">展示基于条件的字段显示隐藏功能</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">动态表单</h2>

        <FormBuilder
          v-model="formData"
          :config="formConfig"
          @submit="handleSubmit"
          @change="handleChange"
        />
      </div>

      <!-- 信息展示区域 -->
      <div class="space-y-6">
        <!-- 当前显示的字段 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">当前显示的字段</h3>
          <div class="space-y-2">
            <div
              v-for="field in visibleFields"
              :key="field.key"
              class="flex items-center space-x-2"
            >
              <div class="w-2 h-2 bg-green-500 rounded-full" />
              <span class="text-sm">{{ field.label }}</span>
            </div>
          </div>
        </div>

        <!-- 条件规则说明 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">条件规则说明</h3>
          <div class="space-y-3 text-sm">
            <div><strong>用户类型:</strong> 选择不同类型显示不同字段组</div>
            <div>
              <strong>个人用户:</strong> 显示姓名、身份证、生日等个人信息
            </div>
            <div>
              <strong>企业用户:</strong>
              显示公司名称、统一社会信用代码、法人代表等企业信息
            </div>
            <div><strong>学生用户:</strong> 显示学校、专业、学号等学生信息</div>
            <div><strong>启用通知:</strong> 勾选后显示通知方式选择</div>
            <div>
              <strong>通知方式:</strong>
              选择邮件时显示邮箱，选择短信时显示手机号
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
      </div>
    </div>
  </div>
</template>
