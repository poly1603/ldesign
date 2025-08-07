<template>
  <div class="advanced-form-demo">
    <div class="controls">
      <button class="btn btn-primary" @click="createAdvancedForm">
        创建高级表单
      </button>
      <button class="btn btn-success" @click="fillAdvancedData">
        填充示例数据
      </button>
      <button class="btn btn-warning" @click="toggleAsyncValidation">
        切换异步验证 ({{ asyncValidationEnabled ? '开启' : '关闭' }})
      </button>
      <button class="btn btn-secondary" @click="exportFormData">
        导出表单数据
      </button>
    </div>

    <div class="form-container">
      <DynamicForm
        v-if="showForm"
        v-model="advancedFormData"
        :options="advancedFormOptions"
        @submit="handleAdvancedSubmit"
        @field-change="handleAdvancedFieldChange"
      />
    </div>

    <div class="status-panel">
      <div class="status-title">高级表单特性</div>
      <div class="status-item">
        <span class="status-label">条件渲染:</span>
        <span class="status-value status-true">已启用</span>
      </div>
      <div class="status-item">
        <span class="status-label">异步验证:</span>
        <span
          class="status-value"
          :class="asyncValidationEnabled ? 'status-true' : 'status-false'"
        >
          {{ asyncValidationEnabled ? '已启用' : '已禁用' }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">动态字段:</span>
        <span class="status-value status-true">支持</span>
      </div>
      <div class="status-item">
        <span class="status-label">自定义验证:</span>
        <span class="status-value status-true">已配置</span>
      </div>
    </div>

    <div class="data-display">
      <div class="data-title">高级表单数据</div>
      <div class="data-content">
        {{ JSON.stringify(advancedFormData, null, 2) }}
      </div>
    </div>

    <div class="code-block">
      <div class="data-title">高级功能配置示例</div>
      <pre><code>// 条件渲染配置
{
  name: 'company',
  title: '公司名称',
  component: 'FormInput',
  conditionalRender: {
    dependsOn: 'hasJob',
    condition: (values) => values.hasJob === true
  }
}

// 异步验证配置
{
  name: 'username',
  title: '用户名',
  component: 'FormInput',
  rules: [
    {
      type: 'custom',
      validator: async (value) => {
        // 模拟异步验证（如检查用户名是否已存在）
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (value === 'admin') {
          return '用户名不能是admin'
        }
        return true
      }
    }
  ]
}

// 自定义验证配置
{
  name: 'confirmPassword',
  title: '确认密码',
  component: 'FormInput',
  type: 'password',
  rules: [
    {
      type: 'custom',
      validator: (value, formData) => {
        if (value !== formData.password) {
          return '两次密码输入不一致'
        }
        return true
      }
    }
  ]
}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DynamicForm } from '@ldesign/form'

// 响应式数据
const showForm = ref(true)
const advancedFormData = ref<Record<string, any>>({})
const asyncValidationEnabled = ref(true)

// 高级表单配置
const advancedFormOptions = computed(() => ({
  title: '高级功能演示表单',
  description: '演示条件渲染、异步验证、自定义验证等高级功能',
  fields: [
    {
      name: 'name',
      title: '姓名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入姓名',
      rules: [{ type: 'required', message: '姓名不能为空' }],
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      type: 'email',
      required: true,
      placeholder: '请输入邮箱地址',
      rules: [
        { type: 'required', message: '邮箱不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' },
        ...(asyncValidationEnabled.value
          ? [
              {
                type: 'custom' as const,
                validator: async (value: string) => {
                  // 模拟异步验证
                  await new Promise(resolve => setTimeout(resolve, 800))
                  if (value === 'test@example.com') {
                    return '该邮箱已被注册'
                  }
                  return true
                },
                message: '邮箱验证失败',
              },
            ]
          : []),
      ],
    },
    {
      name: 'hasJob',
      title: '是否在职',
      component: 'FormRadio',
      span: 2,
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
    {
      name: 'company',
      title: '公司名称',
      component: 'FormInput',
      span: 2,
      placeholder: '请输入公司名称',
      conditionalRender: {
        dependsOn: 'hasJob',
        condition: (values: any) => values.hasJob === true,
      },
      rules: [
        {
          type: 'required',
          message: '请输入公司名称',
          condition: (_value: any, formData: any) => formData.hasJob === true,
        },
      ],
    },
    {
      name: 'jobTitle',
      title: '职位',
      component: 'FormInput',
      placeholder: '请输入职位',
      conditionalRender: {
        dependsOn: 'hasJob',
        condition: (values: any) => values.hasJob === true,
      },
    },
    {
      name: 'salary',
      title: '期望薪资',
      component: 'FormInput',
      type: 'number',
      placeholder: '请输入期望薪资',
      conditionalRender: {
        dependsOn: 'hasJob',
        condition: (values: any) => values.hasJob === true,
      },
      rules: [{ type: 'min', params: 1000, message: '薪资不能低于1000' }],
    },
    {
      name: 'skills',
      title: '技能标签',
      component: 'FormSelect',
      span: 2,
      placeholder: '请选择技能',
      props: {
        multiple: true,
      },
      options: [
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'Vue.js', value: 'vue' },
        { label: 'React', value: 'react' },
        { label: 'Node.js', value: 'nodejs' },
        { label: 'Python', value: 'python' },
        { label: 'Java', value: 'java' },
        { label: 'Go', value: 'go' },
      ],
    },
    {
      name: 'bio',
      title: '个人简介',
      component: 'FormTextarea',
      span: 2,
      placeholder: '请简单介绍一下自己',
      props: {
        rows: 4,
      },
      rules: [
        { type: 'maxLength', params: 500, message: '个人简介不能超过500字符' },
      ],
    },
  ],
  layout: {
    columns: 2,
    horizontalGap: 20,
    verticalGap: 20,
    breakpoints: {
      xs: { columns: 1 },
      sm: { columns: 1 },
      md: { columns: 2 },
    },
  },
}))

// 事件处理
const handleAdvancedSubmit = (data: any) => {
  console.log('高级表单提交:', data)
  alert('高级表单提交成功！请查看控制台输出。')
}

const handleAdvancedFieldChange = (fieldName: string, value: any) => {
  console.log('高级表单字段变化:', fieldName, value)
}

// 操作方法
const createAdvancedForm = () => {
  showForm.value = false
  setTimeout(() => {
    showForm.value = true
  }, 100)
}

const fillAdvancedData = () => {
  advancedFormData.value = {
    name: '张三',
    email: 'zhangsan@company.com',
    hasJob: true,
    company: '科技有限公司',
    jobTitle: '前端工程师',
    salary: 15000,
    skills: ['javascript', 'typescript', 'vue'],
    bio: '这是一个高级表单功能的演示用户，具有丰富的前端开发经验。',
  }
}

const toggleAsyncValidation = () => {
  asyncValidationEnabled.value = !asyncValidationEnabled.value
  // 重新创建表单以应用新的验证配置
  createAdvancedForm()
}

const exportFormData = () => {
  const dataStr = JSON.stringify(advancedFormData.value, null, 2)

  // 创建下载链接
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'advanced-form-data.json'
  a.click()
  URL.revokeObjectURL(url)

  console.log('导出高级表单数据:', advancedFormData.value)
}
</script>
