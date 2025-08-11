<script setup lang="ts">
import { DynamicForm } from '@ldesign/form'
import { ref } from 'vue'

// 基础表单
const basicFormData = ref({})
const basicFormOptions = {
  fields: [
    { name: 'name', title: '姓名', component: 'FormInput', required: true },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
    },
    {
      name: 'age',
      title: '年龄',
      component: 'FormInput',
      props: { type: 'number' },
    },
  ],
}

// 主题样式表单
const themedFormData = ref({})
const themedFormOptions = {
  fields: [
    { name: 'firstName', title: '名', component: 'FormInput', required: true },
    { name: 'lastName', title: '姓', component: 'FormInput', required: true },
    {
      name: 'gender',
      title: '性别',
      component: 'FormRadio',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
      },
    },
    {
      name: 'birthDate',
      title: '出生日期',
      component: 'FormInput',
      props: { type: 'date' },
    },
  ],
  layout: {
    theme: 'bordered',
    columns: 2,
    label: {
      position: 'left',
      showColon: true,
      gap: 12,
    },
  },
}

// 条件显示表单
const conditionalFormData = ref({})
const conditionalFormOptions = {
  fields: [
    {
      name: 'country',
      title: '国家',
      component: 'FormSelect',
      props: {
        options: [
          { label: '中国', value: 'china' },
          { label: '美国', value: 'usa' },
          { label: '日本', value: 'japan' },
        ],
      },
    },
    {
      name: 'province',
      title: '省份',
      component: 'FormInput',
      showWhen: { field: 'country', value: 'china' },
    },
    {
      name: 'city',
      title: '城市',
      component: 'FormInput',
      showWhen: { field: 'country', value: 'china' },
    },
    {
      name: 'state',
      title: '州',
      component: 'FormInput',
      showWhen: { field: 'country', value: 'usa' },
    },
  ],
  layout: {
    columns: 2,
  },
}

// 响应式布局表单
const responsiveFormData = ref({})
const responsiveFormOptions = {
  fields: [
    { name: 'name', title: '姓名', component: 'FormInput', required: true },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
    },
    {
      name: 'phone',
      title: '手机',
      component: 'FormInput',
      props: { type: 'tel' },
    },
    { name: 'company', title: '公司', component: 'FormInput' },
    { name: 'position', title: '职位', component: 'FormInput' },
    {
      name: 'industry',
      title: '行业',
      component: 'FormSelect',
      props: {
        options: [
          { label: '互联网/IT', value: 'it' },
          { label: '金融', value: 'finance' },
          { label: '教育', value: 'education' },
        ],
      },
    },
    {
      name: 'experience',
      title: '工作经验',
      component: 'FormSelect',
      props: {
        options: [
          { label: '1-3年', value: '1-3' },
          { label: '3-5年', value: '3-5' },
          { label: '5年以上', value: '5+' },
        ],
      },
    },
    { name: 'bio', title: '个人简介', component: 'FormTextarea', span: 'full' },
  ],
  layout: {
    columns: 2,
    defaultRows: 2,
    button: {
      position: 'follow-last-row',
      align: 'right',
    },
  },
}
</script>

<template>
  <div class="app">
    <h1>@ldesign/form - 简单使用示例</h1>

    <!-- 基础表单 -->
    <section class="example">
      <h2>🎯 基础表单</h2>
      <p>最简单的表单配置，只需要定义字段即可：</p>
      <DynamicForm v-model="basicFormData" :options="basicFormOptions" />
      <div class="data-preview">
        <strong>表单数据：</strong>
        <pre>{{ JSON.stringify(basicFormData, null, 2) }}</pre>
      </div>
    </section>

    <!-- 主题样式 -->
    <section class="example">
      <h2>🎨 主题样式</h2>
      <p>支持多种主题样式，只需要设置layout.theme：</p>
      <DynamicForm v-model="themedFormData" :options="themedFormOptions" />
      <div class="data-preview">
        <strong>表单数据：</strong>
        <pre>{{ JSON.stringify(themedFormData, null, 2) }}</pre>
      </div>
    </section>

    <!-- 条件显示 -->
    <section class="example">
      <h2>🔄 条件显示</h2>
      <p>使用showWhen配置实现字段的条件显示：</p>
      <DynamicForm
        v-model="conditionalFormData"
        :options="conditionalFormOptions"
      />
      <div class="data-preview">
        <strong>表单数据：</strong>
        <pre>{{ JSON.stringify(conditionalFormData, null, 2) }}</pre>
      </div>
    </section>

    <!-- 响应式布局 -->
    <section class="example">
      <h2>📱 响应式布局</h2>
      <p>支持默认行数和展开/收起功能：</p>
      <DynamicForm
        v-model="responsiveFormData"
        :options="responsiveFormOptions"
      />
      <div class="data-preview">
        <strong>表单数据：</strong>
        <pre>{{ JSON.stringify(responsiveFormData, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.example {
  margin-bottom: 48px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.example h2 {
  margin-top: 0;
  color: #667eea;
}

.data-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.data-preview pre {
  margin: 8px 0 0 0;
  font-family: 'Monaco', 'Consolas', monospace;
}
</style>
