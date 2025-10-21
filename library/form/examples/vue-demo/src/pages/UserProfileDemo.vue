<template>
  <div class="user-profile-demo">
    <form @submit.prevent="handleSubmit" class="profile-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <h3>📝 基本信息</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>用户名 *</label>
            <InputField v-model="formData.username" placeholder="请输入用户名" clearable />
          </div>
          <div class="form-item">
            <label>邮箱 *</label>
            <InputField v-model="formData.email" type="email" placeholder="请输入邮箱" />
          </div>
          <div class="form-item">
            <label>手机号 *</label>
            <InputField v-model="formData.phone" placeholder="请输入手机号" />
          </div>
          <div class="form-item">
            <label>性别</label>
            <RadioField v-model="formData.gender" :options="genderOptions" />
          </div>
          <div class="form-item">
            <label>生日</label>
            <DatePickerField v-model="formData.birthday" placeholder="请选择日期" />
          </div>
          <div class="form-item" style="grid-column: 1 / -1;">
            <label>个人简介</label>
            <TextareaField
              v-model="formData.bio"
              placeholder="介绍一下自己..."
              :autosize="{ minRows: 3, maxRows: 6 }"
              showCount
              :maxLength="500"
            />
          </div>
        </div>
      </div>

      <!-- 地址信息 -->
      <div class="form-section">
        <h3>📍 地址信息</h3>
        <div class="form-grid">
          <div class="form-item" style="grid-column: 1 / -1;">
            <label>省市区</label>
            <CascaderField
              v-model="formData.region"
              :options="regionOptions"
              placeholder="请选择省/市/区"
            />
          </div>
          <div class="form-item" style="grid-column: 1 / -1;">
            <label>详细地址</label>
            <InputField v-model="formData.address" placeholder="街道、门牌号等" />
          </div>
          <div class="form-item">
            <label>邮政编码</label>
            <InputField v-model="formData.postalCode" placeholder="6位邮政编码" maxlength="6" />
          </div>
        </div>
      </div>

      <!-- 工作信息 -->
      <div class="form-section">
        <h3>💼 工作信息</h3>
        <div class="form-grid">
          <div class="form-item">
            <label>公司</label>
            <InputField v-model="formData.company" placeholder="公司名称" />
          </div>
          <div class="form-item">
            <label>职位</label>
            <InputField v-model="formData.position" placeholder="职位名称" />
          </div>
          <div class="form-item" style="grid-column: 1 / -1;">
            <label>个人网站</label>
            <InputField v-model="formData.website" placeholder="https://example.com" />
          </div>
        </div>
      </div>

      <!-- 社交账号 -->
      <div class="form-section">
        <h3>🔗 社交账号</h3>
        <div class="social-list">
          <div v-for="(social, index) in formData.socialAccounts" :key="index" class="social-item">
            <SelectField
              v-model="social.platform"
              :options="socialPlatforms"
              placeholder="选择平台"
              style="width: 150px;"
            />
            <InputField
              v-model="social.account"
              placeholder="账号"
              style="flex: 1;"
            />
            <button type="button" class="btn btn-icon btn-danger" @click="removeSocial(index)">
              🗑️
            </button>
          </div>
        </div>
        <button type="button" class="btn btn-add" @click="addSocial">
          + 添加社交账号
        </button>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
        <button type="button" class="btn" @click="resetForm">重置</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  InputField,
  TextareaField,
  RadioField,
  SelectField,
  DatePickerField,
  CascaderField
} from '../../../src/adapters/vue/components/fields'

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  bio: '',
  region: [],
  address: '',
  postalCode: '',
  company: '',
  position: '',
  website: '',
  socialAccounts: []
})

const submitting = ref(false)

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' }
]

const regionOptions = [
  {
    label: '北京市',
    value: 'beijing',
    children: [
      { label: '东城区', value: 'dongcheng' },
      { label: '西城区', value: 'xicheng' }
    ]
  },
  {
    label: '上海市',
    value: 'shanghai',
    children: [
      { label: '黄浦区', value: 'huangpu' },
      { label: '徐汇区', value: 'xuhui' }
    ]
  }
]

const socialPlatforms = [
  { label: 'GitHub', value: 'github' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' }
]

const addSocial = () => {
  formData.socialAccounts.push({ platform: '', account: '' })
}

const removeSocial = (index) => {
  formData.socialAccounts.splice(index, 1)
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('提交数据:', formData)
    alert('保存成功！')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'socialAccounts') {
      formData[key] = []
    } else if (key === 'region') {
      formData[key] = []
    } else {
      formData[key] = ''
    }
  })
}
</script>

<style scoped>
.user-profile-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-form {
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
  margin-bottom: 0;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.85);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.social-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.social-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  border-color: #722ED1;
  color: #722ED1;
}

.btn-primary {
  background: #722ED1;
  border-color: #722ED1;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #5c24a8;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add {
  width: 100%;
  border-style: dashed;
}

.btn-icon {
  padding: 6px 12px;
}

.btn-danger {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-danger:hover {
  background: #ff4d4f;
  color: #fff;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>



