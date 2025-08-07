<template>
  <div class="composable-demo">
    <div class="controls">
      <button class="btn btn-primary" @click="form.submit()">提交表单</button>
      <button class="btn btn-success" @click="fillSampleData">
        填充示例数据
      </button>
      <button class="btn btn-warning" @click="form.validate()">验证表单</button>
      <button class="btn btn-secondary" @click="form.reset()">重置表单</button>
      <button class="btn btn-danger" @click="form.clear()">清空表单</button>
    </div>

    <div class="form-container">
      <component :is="form.renderForm()" />
    </div>

    <div class="status-panel">
      <div class="status-title">表单状态 (Composition API)</div>
      <div class="status-item">
        <span class="status-label">有效:</span>
        <span
          class="status-value"
          :class="form.formState.valid ? 'status-true' : 'status-false'"
        >
          {{ form.formState.valid }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">已修改:</span>
        <span
          class="status-value"
          :class="form.formState.dirty ? 'status-true' : 'status-false'"
        >
          {{ form.formState.dirty }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">已访问:</span>
        <span
          class="status-value"
          :class="form.formState.touched ? 'status-true' : 'status-false'"
        >
          {{ form.formState.touched }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">验证中:</span>
        <span
          class="status-value"
          :class="form.formState.validating ? 'status-true' : 'status-false'"
        >
          {{ form.formState.validating }}
        </span>
      </div>
    </div>

    <div class="data-display">
      <div class="data-title">表单数据 (响应式)</div>
      <div class="data-content">
        {{ JSON.stringify(form.formData, null, 2) }}
      </div>
    </div>

    <div v-if="Object.keys(form.formErrors).length > 0" class="data-display">
      <div class="data-title">验证错误</div>
      <div class="data-content">
        {{ JSON.stringify(form.formErrors, null, 2) }}
      </div>
    </div>

    <div class="controls">
      <h4>字段操作演示:</h4>
      <button class="btn btn-secondary" @click="toggleFieldVisibility">
        切换邮箱字段可见性
      </button>
      <button class="btn btn-secondary" @click="toggleFieldDisabled">
        切换用户名字段禁用状态
      </button>
      <button class="btn btn-secondary" @click="addDynamicField">
        添加动态字段
      </button>
      <button class="btn btn-secondary" @click="removeDynamicField">
        删除动态字段
      </button>
    </div>

    <div class="code-block">
      <div class="data-title">Composition API 使用代码</div>
      <pre><code>&lt;template&gt;
  &lt;div&gt;
    &lt;!-- 渲染表单 --&gt;
    &lt;component :is="form.renderForm()" /&gt;
    
    &lt;!-- 表单状态 --&gt;
    &lt;p&gt;有效: {{ form.formState.valid }}&lt;/p&gt;
    &lt;p&gt;数据: {{ form.formData }}&lt;/p&gt;
    
    &lt;!-- 操作按钮 --&gt;
    &lt;button @click="form.submit()"&gt;提交&lt;/button&gt;
    &lt;button @click="form.reset()"&gt;重置&lt;/button&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { useForm } from '@ldesign/form'

const form = useForm({
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true
    }
    // ... 更多字段配置
  ]
})

// 监听表单事件
form.on('submit', (data) => {
  console.log('表单提交:', data)
})

form.on('change', (data, fieldName) => {
  console.log('字段变化:', fieldName, data[fieldName])
})

// 字段操作
const toggleField = () => {
  const isVisible = form.isFieldVisible('username')
  if (isVisible) {
    form.hideField('username')
  } else {
    form.showField('username')
  }
}
&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form'

// 使用 useForm Hook
const form = useForm({
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
      ],
    },
    {
      name: 'email',
      title: '邮箱地址',
      component: 'FormInput',
      type: 'email',
      required: true,
      placeholder: '请输入邮箱地址',
      rules: [
        { type: 'required', message: '邮箱不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    {
      name: 'phone',
      title: '手机号',
      component: 'FormInput',
      type: 'tel',
      placeholder: '请输入手机号码',
      rules: [{ type: 'phone', message: '请输入有效的手机号码' }],
    },
    {
      name: 'bio',
      title: '个人简介',
      component: 'FormTextarea',
      placeholder: '请简单介绍一下自己',
      span: 2,
      props: {
        rows: 4,
      },
    },
  ],
  layout: {
    columns: 2,
    horizontalGap: 16,
    verticalGap: 16,
  },
})

// 监听表单事件
form.on('submit', data => {
  console.log('Composition API 表单提交:', data)
  alert('表单提交成功！请查看控制台输出。')
})

form.on('change', (data, fieldName) => {
  console.log('字段变化:', fieldName, data[fieldName])
})

form.on('validate', (valid, errors) => {
  console.log('表单验证:', valid, errors)
})

// 操作方法
const fillSampleData = () => {
  form.setFormData({
    username: 'vueuser',
    email: 'vue.user@example.com',
    phone: '13800138000',
    bio: '这是一个使用 Composition API 的示例用户。',
  })
}

let dynamicFieldCounter = 0

const addDynamicField = () => {
  dynamicFieldCounter++
  form.addField({
    name: `dynamic${dynamicFieldCounter}`,
    title: `动态字段 ${dynamicFieldCounter}`,
    component: 'FormInput',
    placeholder: `这是动态添加的字段 ${dynamicFieldCounter}`,
  })
}

const removeDynamicField = () => {
  if (dynamicFieldCounter > 0) {
    form.removeField(`dynamic${dynamicFieldCounter}`)
    dynamicFieldCounter--
  }
}

const toggleFieldVisibility = () => {
  const isVisible = form.isFieldVisible('email')
  if (isVisible) {
    form.hideField('email')
  } else {
    form.showField('email')
  }
}

const toggleFieldDisabled = () => {
  const isDisabled = form.isFieldDisabled('username')
  if (isDisabled) {
    form.enableField('username')
  } else {
    form.disableField('username')
  }
}
</script>
