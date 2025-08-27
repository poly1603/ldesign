<!--
高级功能演示
-->

<template>
  <div class="advanced-features-demo">
    <div class="demo-header">
      <h2>🚀 高级功能演示</h2>
      <p>展示 LemonForm 的高级功能，包括表单联动、数据转换、批量操作等。</p>
    </div>

    <div class="demo-content">
      <div class="feature-grid">
        <!-- 表单联动 -->
        <div class="feature-section">
          <h3>🔗 表单联动</h3>
          <p>字段之间的数据联动和计算</p>
          
          <div class="form-fields">
            <FormField
              :field="{
                type: 'number',
                name: 'price',
                label: '单价',
                placeholder: '请输入单价'
              }"
              :value="calculatorData.price"
              @update:value="calculatorData.price = $event"
            />
            
            <FormField
              :field="{
                type: 'number',
                name: 'quantity',
                label: '数量',
                placeholder: '请输入数量'
              }"
              :value="calculatorData.quantity"
              @update:value="calculatorData.quantity = $event"
            />
            
            <div class="calculated-field">
              <label>总价</label>
              <div class="calculated-value">
                ¥{{ totalPrice.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 动态字段 -->
        <div class="feature-section">
          <h3>➕ 动态字段</h3>
          <p>动态添加和删除字段</p>
          
          <div class="dynamic-fields">
            <div
              v-for="(contact, index) in dynamicData.contacts"
              :key="index"
              class="dynamic-field-group"
            >
              <h4>联系人 {{ index + 1 }}</h4>
              <div class="field-row">
                <FormField
                  :field="{
                    type: 'input',
                    name: 'name',
                    label: '姓名',
                    placeholder: '请输入姓名'
                  }"
                  :value="contact.name"
                  @update:value="contact.name = $event"
                />
                <FormField
                  :field="{
                    type: 'input',
                    name: 'phone',
                    label: '电话',
                    placeholder: '请输入电话'
                  }"
                  :value="contact.phone"
                  @update:value="contact.phone = $event"
                />
                <button @click="removeContact(index)" class="btn btn-danger">
                  删除
                </button>
              </div>
            </div>
            
            <button @click="addContact" class="btn btn-primary">
              添加联系人
            </button>
          </div>
        </div>

        <!-- 表单状态管理 -->
        <div class="feature-section">
          <h3>📊 表单状态</h3>
          <p>表单状态的实时监控</p>
          
          <div class="status-display">
            <div class="status-item">
              <span class="label">表单是否有效:</span>
              <span :class="['value', formValid ? 'success' : 'error']">
                {{ formValid ? '✅ 是' : '❌ 否' }}
              </span>
            </div>
            
            <div class="status-item">
              <span class="label">是否有修改:</span>
              <span :class="['value', formDirty ? 'warning' : 'normal']">
                {{ formDirty ? '⚠️ 是' : '✨ 否' }}
              </span>
            </div>
            
            <div class="status-item">
              <span class="label">字段数量:</span>
              <span class="value normal">{{ fieldCount }}</span>
            </div>
          </div>
        </div>

        <!-- 数据转换 -->
        <div class="feature-section">
          <h3>🔄 数据转换</h3>
          <p>表单数据的格式化和转换</p>
          
          <div class="transform-demo">
            <FormField
              :field="{
                type: 'input',
                name: 'phone',
                label: '手机号码',
                placeholder: '请输入手机号码'
              }"
              :value="transformData.phone"
              @update:value="handlePhoneInput"
            />
            
            <div class="transform-result">
              <label>格式化结果:</label>
              <div class="result-value">{{ formattedPhone }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 综合数据展示 -->
    <div class="data-display">
      <h3>📋 所有数据</h3>
      <div class="data-tabs">
        <button
          v-for="tab in dataTabs"
          :key="tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.name }}
        </button>
      </div>
      <pre>{{ JSON.stringify(currentTabData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import FormField from '../components/FormField.vue'

// 计算器数据
const calculatorData = reactive({
  price: 0,
  quantity: 0
})

// 动态字段数据
const dynamicData = reactive({
  contacts: [
    { name: '', phone: '' }
  ]
})

// 数据转换演示
const transformData = reactive({
  phone: ''
})

// 当前活动标签
const activeTab = ref('calculator')

// 数据标签
const dataTabs = [
  { key: 'calculator', name: '计算器' },
  { key: 'dynamic', name: '动态字段' },
  { key: 'transform', name: '数据转换' }
]

// 计算总价
const totalPrice = computed(() => {
  return (calculatorData.price || 0) * (calculatorData.quantity || 0)
})

// 格式化手机号
const formattedPhone = computed(() => {
  const phone = transformData.phone.replace(/\D/g, '')
  if (phone.length <= 3) return phone
  if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}`
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7, 11)}`
})

// 表单验证状态
const formValid = computed(() => {
  return calculatorData.price > 0 && calculatorData.quantity > 0
})

// 表单修改状态
const formDirty = computed(() => {
  return calculatorData.price > 0 || calculatorData.quantity > 0 || 
         dynamicData.contacts.some(c => c.name || c.phone) ||
         transformData.phone
})

// 字段数量
const fieldCount = computed(() => {
  return 3 + dynamicData.contacts.length * 2
})

// 当前标签数据
const currentTabData = computed(() => {
  switch (activeTab.value) {
    case 'calculator':
      return { ...calculatorData, totalPrice: totalPrice.value }
    case 'dynamic':
      return dynamicData
    case 'transform':
      return { ...transformData, formatted: formattedPhone.value }
    default:
      return {}
  }
})

// 添加联系人
const addContact = () => {
  dynamicData.contacts.push({ name: '', phone: '' })
}

// 删除联系人
const removeContact = (index: number) => {
  if (dynamicData.contacts.length > 1) {
    dynamicData.contacts.splice(index, 1)
  }
}

// 处理手机号输入
const handlePhoneInput = (value: string) => {
  // 只保留数字
  transformData.phone = value.replace(/\D/g, '').slice(0, 11)
}
</script>

<style scoped>
.advanced-features-demo {
  max-width: 1400px;
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

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.feature-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-section h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.feature-section p {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 0.9rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.calculated-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.calculated-field label {
  font-weight: 500;
  color: #333;
}

.calculated-value {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-weight: 600;
  color: #f39c12;
  font-size: 16px;
}

.dynamic-field-group {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.dynamic-field-group h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1rem;
}

.field-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.field-row > * {
  flex: 1;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
  color: #333;
  white-space: nowrap;
}

.btn-primary {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.status-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.status-item .label {
  font-weight: 500;
  color: #666;
}

.status-item .value.success {
  color: #52c41a;
}

.status-item .value.error {
  color: #ff4d4f;
}

.status-item .value.warning {
  color: #faad14;
}

.status-item .value.normal {
  color: #666;
}

.transform-demo {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.transform-result {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.transform-result label {
  font-weight: 500;
  color: #333;
}

.result-value {
  padding: 8px 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-family: monospace;
  color: #1890ff;
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

.data-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}

.tab-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
}

.tab-button.active {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.data-display pre {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  max-height: 300px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .field-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .data-tabs {
    flex-wrap: wrap;
  }
}
</style>
