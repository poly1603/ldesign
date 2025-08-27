<!--
字段类型演示 - 展示所有支持的字段类型
-->

<template>
  <div class="field-types-demo">
    <div class="demo-header">
      <h2>📝 字段类型演示</h2>
      <p>LemonForm 支持丰富的字段类型，满足各种表单需求。</p>
    </div>

    <div class="demo-grid">
      <!-- 基础输入字段 -->
      <div class="demo-section">
        <h3>📝 基础输入字段</h3>
        <div class="field-examples">
          <FormField
            :field="{
              type: 'input',
              name: 'text',
              label: '文本输入',
              placeholder: '请输入文本',
              help: '支持任意文本输入'
            }"
            :value="formData.text"
            @update:value="formData.text = $event"
          />

          <FormField
            :field="{
              type: 'input',
              name: 'email',
              label: '邮箱输入',
              placeholder: '请输入邮箱',
              props: { type: 'email' },
              help: '自动验证邮箱格式'
            }"
            :value="formData.email"
            @update:value="formData.email = $event"
          />

          <FormField
            :field="{
              type: 'input',
              name: 'password',
              label: '密码输入',
              placeholder: '请输入密码',
              props: { type: 'password' },
              help: '密码将被隐藏显示'
            }"
            :value="formData.password"
            @update:value="formData.password = $event"
          />

          <FormField
            :field="{
              type: 'input',
              name: 'url',
              label: 'URL输入',
              placeholder: 'https://example.com',
              props: { type: 'url' },
              help: '自动验证URL格式'
            }"
            :value="formData.url"
            @update:value="formData.url = $event"
          />

          <FormField
            :field="{
              type: 'input',
              name: 'tel',
              label: '电话输入',
              placeholder: '请输入电话号码',
              props: { type: 'tel' },
              help: '支持电话号码格式'
            }"
            :value="formData.tel"
            @update:value="formData.tel = $event"
          />
        </div>
      </div>

      <!-- 数字和日期字段 -->
      <div class="demo-section">
        <h3>🔢 数字和日期字段</h3>
        <div class="field-examples">
          <FormField
            :field="{
              type: 'number',
              name: 'age',
              label: '年龄',
              placeholder: '请输入年龄',
              props: { min: 0, max: 120, step: 1 },
              help: '年龄范围：0-120岁'
            }"
            :value="formData.age"
            @update:value="formData.age = $event"
          />

          <FormField
            :field="{
              type: 'slider',
              name: 'score',
              label: '评分',
              props: { min: 0, max: 100, step: 5 },
              help: '拖动滑块选择评分'
            }"
            :value="formData.score"
            @update:value="formData.score = $event"
          />

          <FormField
            :field="{
              type: 'date-picker',
              name: 'birthDate',
              label: '出生日期',
              help: '选择您的出生日期'
            }"
            :value="formData.birthDate"
            @update:value="formData.birthDate = $event"
          />
        </div>
      </div>

      <!-- 选择字段 -->
      <div class="demo-section">
        <h3>🎯 选择字段</h3>
        <div class="field-examples">
          <FormField
            :field="{
              type: 'select',
              name: 'country',
              label: '国家/地区',
              placeholder: '请选择国家',
              props: {
                options: [
                  { label: '中国', value: 'china' },
                  { label: '美国', value: 'usa' },
                  { label: '日本', value: 'japan' },
                  { label: '韩国', value: 'korea' },
                  { label: '英国', value: 'uk' }
                ]
              },
              help: '选择您所在的国家或地区'
            }"
            :value="formData.country"
            @update:value="formData.country = $event"
          />

          <FormField
            :field="{
              type: 'radio',
              name: 'gender',
              label: '性别',
              props: {
                options: [
                  { label: '男', value: 'male' },
                  { label: '女', value: 'female' },
                  { label: '其他', value: 'other' }
                ]
              },
              help: '请选择您的性别'
            }"
            :value="formData.gender"
            @update:value="formData.gender = $event"
          />

          <FormField
            :field="{
              type: 'checkbox',
              name: 'hobbies',
              label: '兴趣爱好',
              props: {
                options: [
                  { label: '阅读', value: 'reading' },
                  { label: '音乐', value: 'music' },
                  { label: '运动', value: 'sports' },
                  { label: '旅行', value: 'travel' },
                  { label: '摄影', value: 'photography' },
                  { label: '编程', value: 'programming' }
                ]
              },
              help: '可以选择多个兴趣爱好'
            }"
            :value="formData.hobbies"
            @update:value="formData.hobbies = $event"
          />
        </div>
      </div>

      <!-- 文本和开关字段 -->
      <div class="demo-section">
        <h3>📄 文本和开关字段</h3>
        <div class="field-examples">
          <FormField
            :field="{
              type: 'textarea',
              name: 'description',
              label: '个人描述',
              placeholder: '请简单介绍一下自己...',
              props: { rows: 4, maxlength: 500 },
              help: '最多500个字符'
            }"
            :value="formData.description"
            @update:value="formData.description = $event"
          />

          <FormField
            :field="{
              type: 'switch',
              name: 'newsletter',
              label: '订阅邮件通知',
              help: '开启后将接收最新资讯'
            }"
            :value="formData.newsletter"
            @update:value="formData.newsletter = $event"
          />

          <FormField
            :field="{
              type: 'switch',
              name: 'privacy',
              label: '隐私保护',
              help: '开启后个人信息将被保护'
            }"
            :value="formData.privacy"
            @update:value="formData.privacy = $event"
          />
        </div>
      </div>
    </div>

    <!-- 表单数据展示 -->
    <div class="data-display">
      <h3>📊 当前表单数据</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import FormField from '../components/FormField.vue'

// 表单数据
const formData = reactive({
  text: '',
  email: '',
  password: '',
  url: '',
  tel: '',
  age: null,
  score: 50,
  birthDate: '',
  country: '',
  gender: '',
  hobbies: [],
  description: '',
  newsletter: false,
  privacy: true
})
</script>

<style scoped>
.field-types-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
}

.demo-header p {
  color: #666;
  font-size: 1.1rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.demo-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  border-bottom: 2px solid #f39c12;
  padding-bottom: 10px;
}

.field-examples {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-display {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-display h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.3rem;
}

.data-display pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  max-height: 400px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .demo-header h2 {
    font-size: 1.5rem;
  }
  
  .demo-section {
    padding: 20px;
  }
}
</style>
