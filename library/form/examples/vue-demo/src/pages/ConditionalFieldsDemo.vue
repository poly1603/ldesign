<template>
  <div class="conditional-demo">
    <div class="demo-form">
      <div class="form-section">
        <h3>基本信息</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>用户名</label>
            <InputField v-model="formData.username" placeholder="请输入用户名" />
          </div>
          <div class="form-item">
            <label>邮箱</label>
            <InputField v-model="formData.email" type="email" placeholder="请输入邮箱" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>工作信息</h3>
        <div class="switch-field">
          <SwitchField v-model="formData.hasJob" checkedChildren="有工作" uncheckedChildren="无工作" />
        </div>
        
        <!-- 条件显示：有工作时显示 -->
        <transition name="fade">
          <div v-if="formData.hasJob" class="form-grid conditional-fields">
            <div class="form-item">
              <label>公司名称</label>
              <InputField v-model="formData.company" placeholder="请输入公司" />
            </div>
            <div class="form-item">
              <label>职位</label>
              <InputField v-model="formData.position" placeholder="请输入职位" />
            </div>
            <div class="form-item">
              <label>行业</label>
              <SelectField v-model="formData.industry" :options="industryOptions" />
            </div>
            
            <!-- 二级条件显示：选择"其他"时显示 -->
            <transition name="fade">
              <div v-if="formData.industry === 'other'" class="form-item">
                <label>请说明行业</label>
                <InputField v-model="formData.otherIndustry" placeholder="请输入具体行业" />
              </div>
            </transition>
          </div>
        </transition>
      </div>

      <div class="form-section">
        <h3>配送方式</h3>
        <div class="form-item">
          <label>选择配送方式</label>
          <RadioField v-model="formData.shippingMethod" :options="shippingOptions" />
        </div>
        
        <!-- 快递配送字段 -->
        <transition name="fade">
          <div v-if="formData.shippingMethod === 'express'" class="form-grid conditional-fields">
            <div class="form-item">
              <label>收货人</label>
              <InputField v-model="formData.receiverName" placeholder="收货人姓名" />
            </div>
            <div class="form-item">
              <label>联系电话</label>
              <InputField v-model="formData.receiverPhone" placeholder="联系电话" />
            </div>
            <div class="form-item" style="grid-column: 1 / -1;">
              <label>收货地址</label>
              <InputField v-model="formData.receiverAddress" placeholder="详细地址" />
            </div>
          </div>
        </transition>
        
        <!-- 门店自提字段 -->
        <transition name="fade">
          <div v-if="formData.shippingMethod === 'pickup'" class="form-grid conditional-fields">
            <div class="form-item">
              <label>自提门店</label>
              <SelectField v-model="formData.pickupStore" :options="storeOptions" />
            </div>
            <div class="form-item">
              <label>自提时间</label>
              <SelectField v-model="formData.pickupTime" :options="timeOptions" />
            </div>
          </div>
        </transition>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary" @click="handleSubmit">提交</button>
        <button type="button" class="btn" @click="resetForm">重置</button>
      </div>

      <div v-if="submitData" class="result-display">
        <h4>提交的数据：</h4>
        <pre>{{ JSON.stringify(submitData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  InputField,
  SelectField,
  RadioField,
  SwitchField
} from '../../../src/adapters/vue/components/fields'

const formData = reactive({
  username: '',
  email: '',
  hasJob: false,
  company: '',
  position: '',
  industry: '',
  otherIndustry: '',
  shippingMethod: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  pickupStore: '',
  pickupTime: ''
})

const submitData = ref(null)

const industryOptions = [
  { label: '互联网', value: 'it' },
  { label: '金融', value: 'finance' },
  { label: '教育', value: 'education' },
  { label: '其他', value: 'other' }
]

const shippingOptions = [
  { label: '快递配送', value: 'express' },
  { label: '门店自提', value: 'pickup' }
]

const storeOptions = [
  { label: '朝阳店', value: 'store1' },
  { label: '海淀店', value: 'store2' }
]

const timeOptions = [
  { label: '上午 9:00-12:00', value: 'morning' },
  { label: '下午 14:00-18:00', value: 'afternoon' }
]

const handleSubmit = () => {
  submitData.value = { ...formData }
  console.log('提交数据:', formData)
}

const resetForm = () => {
  Object.assign(formData, {
    username: '',
    email: '',
    hasJob: false,
    company: '',
    position: '',
    industry: '',
    otherIndustry: '',
    shippingMethod: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    pickupStore: '',
    pickupTime: ''
  })
  submitData.value = null
}
</script>

<style scoped>
.conditional-demo {
  max-width: 900px;
  margin: 0 auto;
}

.demo-form {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.switch-field {
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.conditional-fields {
  margin-top: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.btn-primary {
  background: #722ED1;
  border-color: #722ED1;
  color: #fff;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.result-display {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.result-display h4 {
  margin-bottom: 12px;
}

.result-display pre {
  font-size: 13px;
  overflow-x: auto;
}
</style>



