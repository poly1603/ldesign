<template>
  <div class="grouped-form-demo">
    <div class="controls">
      <button class="btn btn-primary" @click="createGroupedForm">
        创建分组表单
      </button>
      <button class="btn btn-success" @click="fillGroupedData">
        填充示例数据
      </button>
      <button class="btn btn-warning" @click="toggleGroup('personal')">
        切换个人信息组
      </button>
      <button class="btn btn-warning" @click="toggleGroup('contact')">
        切换联系方式组
      </button>
      <button class="btn btn-secondary" @click="validateGroup('personal')">
        验证个人信息组
      </button>
    </div>

    <div class="form-container">
      <DynamicForm
        v-if="showForm"
        v-model="groupedFormData"
        :options="groupedFormOptions"
        @submit="handleGroupedSubmit"
        @field-change="handleGroupedFieldChange"
      />
    </div>

    <div class="status-panel">
      <div class="status-title">分组表单状态</div>
      <div class="status-item">
        <span class="status-label">分组数量:</span>
        <span class="status-value">{{
          groupedFormOptions.groups?.length || 0
        }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">总字段数:</span>
        <span class="status-value">{{ totalFieldCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">可折叠分组:</span>
        <span class="status-value">{{ collapsibleGroupCount }}</span>
      </div>
    </div>

    <div class="data-display">
      <div class="data-title">分组表单数据</div>
      <div class="data-content">
        {{ JSON.stringify(groupedFormData, null, 2) }}
      </div>
    </div>

    <div class="code-block">
      <div class="data-title">分组表单配置示例</div>
      <pre><code>const groupedFormOptions: FormOptions = {
  title: '用户档案表单',
  groups: [
    {
      name: 'personal',
      title: '个人信息',
      collapsible: true,
      collapsed: false,
      fields: [
        {
          name: 'firstName',
          title: '名',
          component: 'FormInput',
          required: true
        },
        {
          name: 'lastName',
          title: '姓',
          component: 'FormInput',
          required: true
        }
        // ... 更多字段
      ]
    },
    {
      name: 'contact',
      title: '联系方式',
      collapsible: true,
      collapsed: true,
      fields: [
        {
          name: 'phone',
          title: '手机号',
          component: 'FormInput',
          type: 'tel'
        }
        // ... 更多字段
      ]
    }
  ]
}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DynamicForm } from '@ldesign/form'
import type { FormOptions } from '@ldesign/form'

// 响应式数据
const showForm = ref(true)
const groupedFormData = ref<Record<string, any>>({})

// 分组表单配置
const groupedFormOptions = ref<FormOptions>({
  title: '完整用户档案',
  description: '使用分组功能组织复杂的表单结构',
  groups: [
    {
      name: 'personal',
      title: '个人信息',
      description: '基本的个人身份信息',
      collapsible: true,
      collapsed: false,
      fields: [
        {
          name: 'firstName',
          title: '名',
          component: 'FormInput',
          required: true,
          placeholder: '请输入名',
          rules: [{ type: 'required', message: '名不能为空' }],
        },
        {
          name: 'lastName',
          title: '姓',
          component: 'FormInput',
          required: true,
          placeholder: '请输入姓',
          rules: [{ type: 'required', message: '姓不能为空' }],
        },
        {
          name: 'birthDate',
          title: '出生日期',
          component: 'FormInput',
          type: 'date',
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
        {
          name: 'nationality',
          title: '国籍',
          component: 'FormSelect',
          options: [
            { label: '中国', value: 'CN' },
            { label: '美国', value: 'US' },
            { label: '英国', value: 'UK' },
            { label: '日本', value: 'JP' },
            { label: '其他', value: 'OTHER' },
          ],
        },
        {
          name: 'idNumber',
          title: '身份证号',
          component: 'FormInput',
          placeholder: '请输入身份证号',
          rules: [{ type: 'idCard', message: '请输入有效的身份证号' }],
        },
      ],
    },
    {
      name: 'contact',
      title: '联系方式',
      description: '联系电话、邮箱和地址信息',
      collapsible: true,
      collapsed: true,
      fields: [
        {
          name: 'phone',
          title: '手机号',
          component: 'FormInput',
          type: 'tel',
          placeholder: '请输入手机号码',
          rules: [{ type: 'phone', message: '请输入有效的手机号码' }],
        },
        {
          name: 'email',
          title: '邮箱',
          component: 'FormInput',
          type: 'email',
          placeholder: '请输入邮箱地址',
          rules: [{ type: 'email', message: '请输入有效的邮箱地址' }],
        },
        {
          name: 'wechat',
          title: '微信号',
          component: 'FormInput',
          placeholder: '请输入微信号',
        },
        {
          name: 'address',
          title: '详细地址',
          component: 'FormTextarea',
          span: 2,
          placeholder: '请输入详细地址',
          props: {
            rows: 3,
          },
        },
      ],
    },
    {
      name: 'education',
      title: '教育背景',
      description: '学历和教育经历信息',
      collapsible: true,
      collapsed: true,
      fields: [
        {
          name: 'education',
          title: '最高学历',
          component: 'FormSelect',
          options: [
            { label: '高中及以下', value: 'high_school' },
            { label: '大专', value: 'college' },
            { label: '本科', value: 'bachelor' },
            { label: '硕士', value: 'master' },
            { label: '博士', value: 'doctor' },
          ],
        },
        {
          name: 'school',
          title: '毕业院校',
          component: 'FormInput',
          placeholder: '请输入毕业院校',
        },
        {
          name: 'major',
          title: '专业',
          component: 'FormInput',
          placeholder: '请输入专业',
        },
        {
          name: 'graduationYear',
          title: '毕业年份',
          component: 'FormInput',
          type: 'number',
          placeholder: '请输入毕业年份',
          rules: [
            { type: 'min', params: 1950, message: '毕业年份不能早于1950年' },
            {
              type: 'max',
              params: new Date().getFullYear(),
              message: '毕业年份不能晚于当前年份',
            },
          ],
        },
      ],
    },
    {
      name: 'preferences',
      title: '偏好设置',
      description: '个人偏好和系统设置',
      collapsible: true,
      collapsed: true,
      fields: [
        {
          name: 'newsletter',
          title: '订阅邮件',
          component: 'FormRadio',
          options: [
            { label: '是', value: true },
            { label: '否', value: false },
          ],
        },
        {
          name: 'language',
          title: '首选语言',
          component: 'FormSelect',
          options: [
            { label: '中文', value: 'zh' },
            { label: 'English', value: 'en' },
            { label: '日本語', value: 'ja' },
          ],
        },
        {
          name: 'timezone',
          title: '时区',
          component: 'FormSelect',
          options: [
            { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
            { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
            { label: '纽约时间 (UTC-5)', value: 'America/New_York' },
            { label: '伦敦时间 (UTC+0)', value: 'Europe/London' },
          ],
        },
        {
          name: 'notifications',
          title: '通知设置',
          component: 'FormSelect',
          props: {
            multiple: true,
          },
          options: [
            { label: '邮件通知', value: 'email' },
            { label: '短信通知', value: 'sms' },
            { label: '推送通知', value: 'push' },
            { label: '微信通知', value: 'wechat' },
          ],
        },
      ],
    },
  ],
})

// 计算属性
const totalFieldCount = computed(() => {
  return (
    groupedFormOptions.value.groups?.reduce((total, group) => {
      return total + group.fields.length
    }, 0) || 0
  )
})

const collapsibleGroupCount = computed(() => {
  return (
    groupedFormOptions.value.groups?.filter(group => group.collapsible)
      .length || 0
  )
})

// 事件处理
const handleGroupedSubmit = (data: any) => {
  console.log('分组表单提交:', data)
  alert('分组表单提交成功！请查看控制台输出。')
}

const handleGroupedFieldChange = (fieldName: string, value: any) => {
  console.log('分组表单字段变化:', fieldName, value)
}

// 操作方法
const createGroupedForm = () => {
  showForm.value = false
  setTimeout(() => {
    showForm.value = true
  }, 100)
}

const fillGroupedData = () => {
  groupedFormData.value = {
    // 个人信息
    firstName: '三',
    lastName: '张',
    birthDate: '1990-01-01',
    gender: 'male',
    nationality: 'CN',
    idNumber: '110101199001011234',

    // 联系方式
    phone: '13800138000',
    email: 'zhangsan@example.com',
    wechat: 'zhangsan_wx',
    address: '北京市朝阳区某某街道某某小区某某号楼某某单元某某室',

    // 教育背景
    education: 'bachelor',
    school: '北京大学',
    major: '计算机科学与技术',
    graduationYear: 2012,

    // 偏好设置
    newsletter: true,
    language: 'zh',
    timezone: 'Asia/Shanghai',
    notifications: ['email', 'push'],
  }
}

const toggleGroup = (groupName: string) => {
  const group = groupedFormOptions.value.groups?.find(g => g.name === groupName)
  if (group) {
    group.collapsed = !group.collapsed
    // 重新创建表单以应用新的状态
    createGroupedForm()
  }
}

const validateGroup = (groupName: string) => {
  // 这里应该调用分组验证方法
  // 由于我们使用的是组件方式，这里只是演示
  alert(`验证分组: ${groupName}`)
  console.log(`验证分组: ${groupName}`)
}
</script>
