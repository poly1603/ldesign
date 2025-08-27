<!--
实际应用演示 - 真实世界的表单场景
-->

<template>
  <div class="real-world-demo">
    <div class="demo-header">
      <h2>🌍 实际应用演示</h2>
      <p>展示 LemonForm 在真实项目中的应用场景，包括用户注册、订单表单、设置页面等。</p>
    </div>

    <div class="demo-tabs">
      <button
        v-for="scenario in scenarios"
        :key="scenario.key"
        :class="['tab-button', { active: currentScenario === scenario.key }]"
        @click="currentScenario = scenario.key"
      >
        {{ scenario.name }}
      </button>
    </div>

    <div class="scenario-content">
      <!-- 用户注册表单 -->
      <div v-if="currentScenario === 'register'" class="scenario-section">
        <h3>👤 用户注册表单</h3>
        <div class="form-container">
          <div class="form-steps">
            <div
              v-for="(step, index) in registerSteps"
              :key="index"
              :class="['step', { active: currentStep === index, completed: currentStep > index }]"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-title">{{ step.title }}</span>
            </div>
          </div>

          <div class="step-content">
            <!-- 步骤1: 基本信息 -->
            <div v-if="currentStep === 0" class="step-form">
              <h4>基本信息</h4>
              <div class="form-fields">
                <FormField
                  :field="{
                    type: 'input',
                    name: 'username',
                    label: '用户名',
                    placeholder: '请输入用户名',
                    required: true
                  }"
                  :value="registerData.username"
                  @update:value="registerData.username = $event"
                />
                <FormField
                  :field="{
                    type: 'input',
                    name: 'email',
                    label: '邮箱',
                    placeholder: '请输入邮箱',
                    required: true,
                    props: { type: 'email' }
                  }"
                  :value="registerData.email"
                  @update:value="registerData.email = $event"
                />
                <FormField
                  :field="{
                    type: 'input',
                    name: 'phone',
                    label: '手机号',
                    placeholder: '请输入手机号',
                    required: true
                  }"
                  :value="registerData.phone"
                  @update:value="registerData.phone = $event"
                />
              </div>
            </div>

            <!-- 步骤2: 密码设置 -->
            <div v-if="currentStep === 1" class="step-form">
              <h4>密码设置</h4>
              <div class="form-fields">
                <FormField
                  :field="{
                    type: 'input',
                    name: 'password',
                    label: '密码',
                    placeholder: '请输入密码',
                    required: true,
                    props: { type: 'password' }
                  }"
                  :value="registerData.password"
                  @update:value="registerData.password = $event"
                />
                <FormField
                  :field="{
                    type: 'input',
                    name: 'confirmPassword',
                    label: '确认密码',
                    placeholder: '请再次输入密码',
                    required: true,
                    props: { type: 'password' }
                  }"
                  :value="registerData.confirmPassword"
                  @update:value="registerData.confirmPassword = $event"
                />
              </div>
            </div>

            <!-- 步骤3: 个人资料 -->
            <div v-if="currentStep === 2" class="step-form">
              <h4>个人资料</h4>
              <div class="form-fields">
                <FormField
                  :field="{
                    type: 'input',
                    name: 'realName',
                    label: '真实姓名',
                    placeholder: '请输入真实姓名'
                  }"
                  :value="registerData.realName"
                  @update:value="registerData.realName = $event"
                />
                <FormField
                  :field="{
                    type: 'select',
                    name: 'gender',
                    label: '性别',
                    placeholder: '请选择性别',
                    props: {
                      options: [
                        { label: '男', value: 'male' },
                        { label: '女', value: 'female' }
                      ]
                    }
                  }"
                  :value="registerData.gender"
                  @update:value="registerData.gender = $event"
                />
                <FormField
                  :field="{
                    type: 'date-picker',
                    name: 'birthDate',
                    label: '出生日期'
                  }"
                  :value="registerData.birthDate"
                  @update:value="registerData.birthDate = $event"
                />
              </div>
            </div>

            <div class="step-actions">
              <button
                v-if="currentStep > 0"
                @click="currentStep--"
                class="btn btn-secondary"
              >
                上一步
              </button>
              <button
                v-if="currentStep < registerSteps.length - 1"
                @click="currentStep++"
                class="btn btn-primary"
              >
                下一步
              </button>
              <button
                v-if="currentStep === registerSteps.length - 1"
                @click="submitRegister"
                class="btn btn-success"
              >
                完成注册
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单表单 -->
      <div v-if="currentScenario === 'order'" class="scenario-section">
        <h3>🛒 订单表单</h3>
        <div class="order-form">
          <div class="form-section">
            <h4>商品信息</h4>
            <div class="product-list">
              <div
                v-for="(product, index) in orderData.products"
                :key="index"
                class="product-item"
              >
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-price">¥{{ product.price }}</span>
                </div>
                <div class="product-quantity">
                  <button @click="updateQuantity(index, -1)" class="qty-btn">-</button>
                  <span class="qty-value">{{ product.quantity }}</span>
                  <button @click="updateQuantity(index, 1)" class="qty-btn">+</button>
                </div>
                <div class="product-total">
                  ¥{{ (product.price * product.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
            <div class="order-total">
              <strong>总计: ¥{{ orderTotal.toFixed(2) }}</strong>
            </div>
          </div>

          <div class="form-section">
            <h4>收货信息</h4>
            <div class="form-fields">
              <FormField
                :field="{
                  type: 'input',
                  name: 'receiverName',
                  label: '收货人',
                  placeholder: '请输入收货人姓名',
                  required: true
                }"
                :value="orderData.receiverName"
                @update:value="orderData.receiverName = $event"
              />
              <FormField
                :field="{
                  type: 'input',
                  name: 'receiverPhone',
                  label: '联系电话',
                  placeholder: '请输入联系电话',
                  required: true
                }"
                :value="orderData.receiverPhone"
                @update:value="orderData.receiverPhone = $event"
              />
              <FormField
                :field="{
                  type: 'textarea',
                  name: 'address',
                  label: '收货地址',
                  placeholder: '请输入详细收货地址',
                  required: true,
                  props: { rows: 3 }
                }"
                :value="orderData.address"
                @update:value="orderData.address = $event"
              />
            </div>
          </div>

          <div class="form-actions">
            <button @click="submitOrder" class="btn btn-primary btn-large">
              提交订单
            </button>
          </div>
        </div>
      </div>

      <!-- 设置页面 -->
      <div v-if="currentScenario === 'settings'" class="scenario-section">
        <h3>⚙️ 用户设置</h3>
        <div class="settings-form">
          <div class="settings-tabs">
            <button
              v-for="tab in settingsTabs"
              :key="tab.key"
              :class="['settings-tab', { active: currentSettingsTab === tab.key }]"
              @click="currentSettingsTab = tab.key"
            >
              {{ tab.name }}
            </button>
          </div>

          <div class="settings-content">
            <!-- 个人信息 -->
            <div v-if="currentSettingsTab === 'profile'" class="settings-panel">
              <div class="form-fields">
                <FormField
                  :field="{
                    type: 'input',
                    name: 'nickname',
                    label: '昵称',
                    placeholder: '请输入昵称'
                  }"
                  :value="settingsData.nickname"
                  @update:value="settingsData.nickname = $event"
                />
                <FormField
                  :field="{
                    type: 'textarea',
                    name: 'bio',
                    label: '个人简介',
                    placeholder: '请输入个人简介',
                    props: { rows: 4 }
                  }"
                  :value="settingsData.bio"
                  @update:value="settingsData.bio = $event"
                />
              </div>
            </div>

            <!-- 通知设置 -->
            <div v-if="currentSettingsTab === 'notifications'" class="settings-panel">
              <div class="form-fields">
                <FormField
                  :field="{
                    type: 'switch',
                    name: 'emailNotifications',
                    label: '邮件通知',
                    help: '接收重要邮件通知'
                  }"
                  :value="settingsData.emailNotifications"
                  @update:value="settingsData.emailNotifications = $event"
                />
                <FormField
                  :field="{
                    type: 'switch',
                    name: 'pushNotifications',
                    label: '推送通知',
                    help: '接收应用推送通知'
                  }"
                  :value="settingsData.pushNotifications"
                  @update:value="settingsData.pushNotifications = $event"
                />
                <FormField
                  :field="{
                    type: 'switch',
                    name: 'smsNotifications',
                    label: '短信通知',
                    help: '接收重要短信通知'
                  }"
                  :value="settingsData.smsNotifications"
                  @update:value="settingsData.smsNotifications = $event"
                />
              </div>
            </div>

            <!-- 隐私设置 -->
            <div v-if="currentSettingsTab === 'privacy'" class="settings-panel">
              <div class="form-fields">
                <FormField
                  :field="{
                    type: 'radio',
                    name: 'profileVisibility',
                    label: '个人资料可见性',
                    props: {
                      options: [
                        { label: '公开', value: 'public' },
                        { label: '仅好友', value: 'friends' },
                        { label: '私密', value: 'private' }
                      ]
                    }
                  }"
                  :value="settingsData.profileVisibility"
                  @update:value="settingsData.profileVisibility = $event"
                />
                <FormField
                  :field="{
                    type: 'switch',
                    name: 'allowSearch',
                    label: '允许搜索',
                    help: '允许其他用户通过搜索找到我'
                  }"
                  :value="settingsData.allowSearch"
                  @update:value="settingsData.allowSearch = $event"
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveSettings" class="btn btn-primary">
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据展示 -->
    <div class="data-display">
      <h3>📊 当前数据</h3>
      <pre>{{ JSON.stringify(currentScenarioData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import FormField from '../components/FormField.vue'

// 当前场景
const currentScenario = ref('register')

// 场景列表
const scenarios = [
  { key: 'register', name: '用户注册' },
  { key: 'order', name: '订单表单' },
  { key: 'settings', name: '用户设置' }
]

// 注册表单
const currentStep = ref(0)
const registerSteps = [
  { title: '基本信息' },
  { title: '密码设置' },
  { title: '个人资料' }
]

const registerData = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  realName: '',
  gender: '',
  birthDate: ''
})

// 订单表单
const orderData = reactive({
  products: [
    { name: 'iPhone 15 Pro', price: 7999, quantity: 1 },
    { name: 'AirPods Pro', price: 1999, quantity: 1 }
  ],
  receiverName: '',
  receiverPhone: '',
  address: ''
})

// 设置表单
const currentSettingsTab = ref('profile')
const settingsTabs = [
  { key: 'profile', name: '个人信息' },
  { key: 'notifications', name: '通知设置' },
  { key: 'privacy', name: '隐私设置' }
]

const settingsData = reactive({
  nickname: '',
  bio: '',
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: true,
  profileVisibility: 'public',
  allowSearch: true
})

// 计算订单总价
const orderTotal = computed(() => {
  return orderData.products.reduce((total, product) => {
    return total + product.price * product.quantity
  }, 0)
})

// 当前场景数据
const currentScenarioData = computed(() => {
  switch (currentScenario.value) {
    case 'register':
      return registerData
    case 'order':
      return { ...orderData, total: orderTotal.value }
    case 'settings':
      return settingsData
    default:
      return {}
  }
})

// 更新商品数量
const updateQuantity = (index: number, delta: number) => {
  const newQuantity = orderData.products[index].quantity + delta
  if (newQuantity >= 1) {
    orderData.products[index].quantity = newQuantity
  }
}

// 提交注册
const submitRegister = () => {
  alert('注册成功！')
  console.log('注册数据:', registerData)
}

// 提交订单
const submitOrder = () => {
  alert('订单提交成功！')
  console.log('订单数据:', orderData)
}

// 保存设置
const saveSettings = () => {
  alert('设置保存成功！')
  console.log('设置数据:', settingsData)
}
</script>

<style scoped>
.real-world-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
}

.demo-header p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.demo-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 30px;
  justify-content: center;
}

.tab-button {
  padding: 12px 24px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s;
  font-weight: 500;
}

.tab-button.active {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.tab-button:hover:not(.active) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.scenario-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.scenario-section {
  padding: 30px;
}

.scenario-section h3 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 1.5rem;
  border-bottom: 2px solid #f39c12;
  padding-bottom: 10px;
}

/* 注册表单样式 */
.form-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 20px;
  background: #f8f9fa;
  color: #666;
  transition: all 0.3s;
}

.step.active {
  background: #f39c12;
  color: white;
}

.step.completed {
  background: #52c41a;
  color: white;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.step-title {
  font-weight: 500;
}

.step-content {
  max-width: 500px;
  margin: 0 auto;
}

.step-form h4 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* 订单表单样式 */
.order-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #fafafa;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-name {
  font-weight: 500;
  color: #333;
}

.product-price {
  color: #666;
  font-size: 14px;
}

.product-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.qty-btn:hover {
  background: #f8f9fa;
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
}

.product-total {
  font-weight: 600;
  color: #f39c12;
  min-width: 80px;
  text-align: right;
}

.order-total {
  text-align: right;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  font-size: 18px;
  color: #f39c12;
}

/* 设置页面样式 */
.settings-form {
  max-width: 600px;
  margin: 0 auto;
}

.settings-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
}

.settings-tab {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
}

.settings-tab.active {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.settings-content {
  border: 1px solid #e9ecef;
  border-radius: 0 4px 4px 4px;
  background: white;
}

.settings-panel {
  padding: 25px;
}

/* 通用按钮样式 */
.btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  background: white;
  color: #333;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.btn-primary:hover {
  background: #e67e22;
  border-color: #e67e22;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background: #5a6268;
  border-color: #545b62;
}

.btn-success {
  background: #52c41a;
  color: white;
  border-color: #52c41a;
}

.btn-success:hover {
  background: #389e0d;
  border-color: #389e0d;
}

.btn-large {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* 数据展示 */
.data-display {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
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
  .demo-tabs {
    flex-wrap: wrap;
  }

  .form-steps {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .product-item {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .product-quantity {
    justify-content: center;
  }

  .product-total {
    text-align: center;
  }

  .settings-tabs {
    flex-wrap: wrap;
  }

  .step-actions {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .demo-header h2 {
    font-size: 1.5rem;
  }

  .demo-header p {
    font-size: 1rem;
  }
}
</style>
