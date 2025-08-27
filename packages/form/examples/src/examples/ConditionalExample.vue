<!--
条件渲染示例
-->

<template>
  <div class="example-container">
    <div class="example-header">
      <h2>条件渲染示例</h2>
      <p>展示字段间联动、动态显示/隐藏字段和条件验证功能</p>
    </div>

    <div class="example-content">
      <div class="form-section">
        <h3>动态表单</h3>
        <DynamicForm
          v-model="formData"
          :config="formConfig"
          @submit="handleSubmit"
          @field-change="handleFieldChange"
        />
      </div>

      <div class="info-section">
        <div class="condition-info">
          <h3>条件逻辑说明</h3>
          <div class="logic-list">
            <div class="logic-item">
              <strong>用户类型:</strong> 选择不同类型会显示不同的字段
            </div>
            <div class="logic-item">
              <strong>个人用户:</strong> 显示姓名、身份证号、出生日期
            </div>
            <div class="logic-item">
              <strong>企业用户:</strong> 显示公司名称、统一社会信用代码、法人代表
            </div>
            <div class="logic-item">
              <strong>学生用户:</strong> 显示学校、学号、年级、专业
            </div>
            <div class="logic-item">
              <strong>联系方式:</strong> 选择邮箱时显示邮箱字段，选择电话时显示电话字段
            </div>
            <div class="logic-item">
              <strong>其他信息:</strong> 勾选"有其他信息"时显示备注字段
            </div>
          </div>
        </div>

        <div class="field-status">
          <h3>字段状态</h3>
          <div class="status-list">
            <div 
              v-for="field in fieldStatuses" 
              :key="field.name"
              :class="['status-item', field.visible ? 'visible' : 'hidden']"
            >
              <span class="field-name">{{ field.label }}</span>
              <span class="field-status">{{ field.visible ? '显示' : '隐藏' }}</span>
            </div>
          </div>
        </div>

        <div class="form-data">
          <h3>表单数据</h3>
          <pre class="data-display">{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DynamicForm } from '@lemonform/form'
import type { FormConfig } from '@lemonform/form'

// 表单数据
const formData = ref({
  userType: 'personal',
  contactMethod: 'email',
  hasOtherInfo: false
})

// 表单配置
const formConfig: FormConfig = {
  fields: [
    {
      type: 'radio',
      name: 'userType',
      label: '用户类型',
      component: 'radio',
      required: true,
      defaultValue: 'personal',
      props: {
        options: [
          { label: '个人用户', value: 'personal' },
          { label: '企业用户', value: 'company' },
          { label: '学生用户', value: 'student' }
        ]
      }
    },
    
    // 个人用户字段
    {
      type: 'input',
      name: 'personalName',
      label: '姓名',
      component: 'input',
      required: true,
      placeholder: '请输入姓名',
      hidden: (data: any) => data.userType !== 'personal'
    },
    {
      type: 'input',
      name: 'idCard',
      label: '身份证号',
      component: 'input',
      required: (data: any) => data.userType === 'personal',
      placeholder: '请输入身份证号',
      hidden: (data: any) => data.userType !== 'personal',
      rules: [
        {
          type: 'pattern',
          value: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
          message: '请输入有效的身份证号'
        }
      ]
    },
    {
      type: 'date-picker',
      name: 'birthDate',
      label: '出生日期',
      component: 'date-picker',
      placeholder: '请选择出生日期',
      hidden: (data: any) => data.userType !== 'personal'
    },
    
    // 企业用户字段
    {
      type: 'input',
      name: 'companyName',
      label: '公司名称',
      component: 'input',
      required: (data: any) => data.userType === 'company',
      placeholder: '请输入公司名称',
      hidden: (data: any) => data.userType !== 'company'
    },
    {
      type: 'input',
      name: 'creditCode',
      label: '统一社会信用代码',
      component: 'input',
      required: (data: any) => data.userType === 'company',
      placeholder: '请输入统一社会信用代码',
      hidden: (data: any) => data.userType !== 'company',
      rules: [
        {
          type: 'pattern',
          value: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
          message: '请输入有效的统一社会信用代码'
        }
      ]
    },
    {
      type: 'input',
      name: 'legalPerson',
      label: '法人代表',
      component: 'input',
      required: (data: any) => data.userType === 'company',
      placeholder: '请输入法人代表姓名',
      hidden: (data: any) => data.userType !== 'company'
    },
    
    // 学生用户字段
    {
      type: 'input',
      name: 'studentName',
      label: '学生姓名',
      component: 'input',
      required: (data: any) => data.userType === 'student',
      placeholder: '请输入学生姓名',
      hidden: (data: any) => data.userType !== 'student'
    },
    {
      type: 'input',
      name: 'school',
      label: '学校',
      component: 'input',
      required: (data: any) => data.userType === 'student',
      placeholder: '请输入学校名称',
      hidden: (data: any) => data.userType !== 'student'
    },
    {
      type: 'input',
      name: 'studentId',
      label: '学号',
      component: 'input',
      required: (data: any) => data.userType === 'student',
      placeholder: '请输入学号',
      hidden: (data: any) => data.userType !== 'student'
    },
    {
      type: 'select',
      name: 'grade',
      label: '年级',
      component: 'select',
      placeholder: '请选择年级',
      hidden: (data: any) => data.userType !== 'student',
      props: {
        options: [
          { label: '大一', value: '1' },
          { label: '大二', value: '2' },
          { label: '大三', value: '3' },
          { label: '大四', value: '4' },
          { label: '研一', value: 'master1' },
          { label: '研二', value: 'master2' },
          { label: '研三', value: 'master3' }
        ]
      }
    },
    {
      type: 'input',
      name: 'major',
      label: '专业',
      component: 'input',
      placeholder: '请输入专业名称',
      hidden: (data: any) => data.userType !== 'student'
    },
    
    // 联系方式
    {
      type: 'radio',
      name: 'contactMethod',
      label: '首选联系方式',
      component: 'radio',
      required: true,
      defaultValue: 'email',
      props: {
        options: [
          { label: '邮箱', value: 'email' },
          { label: '电话', value: 'phone' },
          { label: '两者都要', value: 'both' }
        ]
      }
    },
    {
      type: 'input',
      name: 'email',
      label: '邮箱地址',
      component: 'input',
      required: (data: any) => data.contactMethod === 'email' || data.contactMethod === 'both',
      placeholder: '请输入邮箱地址',
      hidden: (data: any) => data.contactMethod === 'phone',
      rules: [
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },
    {
      type: 'input',
      name: 'phone',
      label: '电话号码',
      component: 'input',
      required: (data: any) => data.contactMethod === 'phone' || data.contactMethod === 'both',
      placeholder: '请输入电话号码',
      hidden: (data: any) => data.contactMethod === 'email',
      rules: [
        { type: 'phone', message: '请输入有效的电话号码' }
      ]
    },
    
    // 其他信息
    {
      type: 'switch',
      name: 'hasOtherInfo',
      label: '有其他信息需要说明',
      component: 'switch',
      defaultValue: false
    },
    {
      type: 'textarea',
      name: 'otherInfo',
      label: '其他信息',
      component: 'textarea',
      placeholder: '请输入其他需要说明的信息...',
      hidden: (data: any) => !data.hasOtherInfo,
      props: {
        rows: 4,
        maxlength: 500
      }
    },
    
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '提交信息', variant: 'primary' },
        { type: 'reset', text: '重置', variant: 'secondary' }
      ]
    }
  ],
  layout: {
    type: 'grid',
    columns: 2,
    gap: 16,
    responsive: {
      enabled: true,
      breakpoints: {
        xs: { value: 0, name: 'xs', columns: 1 },
        md: { value: 768, name: 'md', columns: 2 }
      }
    }
  }
}

// 计算字段状态
const fieldStatuses = computed(() => {
  const fields = [
    { name: 'personalName', label: '姓名', visible: formData.value.userType === 'personal' },
    { name: 'idCard', label: '身份证号', visible: formData.value.userType === 'personal' },
    { name: 'birthDate', label: '出生日期', visible: formData.value.userType === 'personal' },
    { name: 'companyName', label: '公司名称', visible: formData.value.userType === 'company' },
    { name: 'creditCode', label: '统一社会信用代码', visible: formData.value.userType === 'company' },
    { name: 'legalPerson', label: '法人代表', visible: formData.value.userType === 'company' },
    { name: 'studentName', label: '学生姓名', visible: formData.value.userType === 'student' },
    { name: 'school', label: '学校', visible: formData.value.userType === 'student' },
    { name: 'studentId', label: '学号', visible: formData.value.userType === 'student' },
    { name: 'grade', label: '年级', visible: formData.value.userType === 'student' },
    { name: 'major', label: '专业', visible: formData.value.userType === 'student' },
    { name: 'email', label: '邮箱地址', visible: formData.value.contactMethod !== 'phone' },
    { name: 'phone', label: '电话号码', visible: formData.value.contactMethod !== 'email' },
    { name: 'otherInfo', label: '其他信息', visible: formData.value.hasOtherInfo }
  ]
  
  return fields
})

// 事件处理
const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
  alert('信息提交成功！')
}

const handleFieldChange = (event: any) => {
  console.log('字段变化:', event)
}
</script>

<style scoped>
.example-container {
  max-width: 1200px;
  margin: 0 auto;
}

.example-header {
  text-align: center;
  margin-bottom: 40px;
}

.example-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.example-header p {
  color: #666;
  font-size: 16px;
}

.example-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.form-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.condition-info,
.field-status,
.form-data {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.condition-info h3,
.field-status h3,
.form-data h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.logic-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logic-item {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
}

.logic-item strong {
  color: #f39c12;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.status-item.visible {
  background: #e7f5e7;
  border-left: 3px solid #52c41a;
}

.status-item.hidden {
  background: #f5f5f5;
  border-left: 3px solid #d9d9d9;
  opacity: 0.6;
}

.field-name {
  font-weight: 500;
}

.field-status {
  font-size: 12px;
  font-weight: 600;
}

.status-item.visible .field-status {
  color: #52c41a;
}

.status-item.hidden .field-status {
  color: #999;
}

.data-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  max-height: 300px;
  margin: 0;
}

@media (max-width: 768px) {
  .example-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
