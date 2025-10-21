<template>
  <div class="array-fields-demo">
    <!-- 联系人列表 -->
    <div class="demo-section">
      <h3>👥 联系人列表</h3>
      <div class="array-list">
        <div v-for="(contact, index) in contacts" :key="index" class="array-item">
          <div class="array-header">
            <span>联系人 #{{ index + 1 }}</span>
            <div class="array-actions">
              <button type="button" class="btn-icon" @click="moveContact(index, -1)" :disabled="index === 0">↑</button>
              <button type="button" class="btn-icon" @click="moveContact(index, 1)" :disabled="index === contacts.length - 1">↓</button>
              <button type="button" class="btn-icon btn-danger" @click="removeContact(index)">🗑️</button>
            </div>
          </div>
          <div class="array-fields">
            <div class="form-item">
              <label>姓名 *</label>
              <InputField v-model="contact.name" placeholder="请输入姓名" />
            </div>
            <div class="form-item">
              <label>电话 *</label>
              <InputField v-model="contact.phone" placeholder="请输入电话" />
            </div>
            <div class="form-item">
              <label>邮箱</label>
              <InputField v-model="contact.email" type="email" placeholder="请输入邮箱" />
            </div>
            <div class="form-item">
              <label>关系</label>
              <SelectField v-model="contact.relationship" :options="relationOptions" />
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-add" @click="addContact">+ 添加联系人</button>
    </div>

    <!-- 工作经历 -->
    <div class="demo-section">
      <h3>💼 工作经历</h3>
      <div class="array-list">
        <div v-for="(exp, index) in experiences" :key="index" class="array-item">
          <div class="array-header">
            <span>工作经历 #{{ index + 1 }}</span>
            <button type="button" class="btn-icon btn-danger" @click="removeExperience(index)">🗑️</button>
          </div>
          <div class="array-fields">
            <div class="form-item">
              <label>公司名称 *</label>
              <InputField v-model="exp.company" placeholder="公司名称" />
            </div>
            <div class="form-item">
              <label>职位 *</label>
              <InputField v-model="exp.position" placeholder="职位名称" />
            </div>
            <div class="form-item">
              <label>开始时间</label>
              <DatePickerField v-model="exp.startDate" />
            </div>
            <div class="form-item">
              <label>结束时间</label>
              <DatePickerField v-model="exp.endDate" :disabled="exp.current" />
              <label style="margin-top: 8px;">
                <input type="checkbox" v-model="exp.current" /> 至今
              </label>
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-add" @click="addExperience">+ 添加工作经历</button>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-primary" @click="handleSubmit">提交</button>
      <button type="button" class="btn" @click="resetAll">重置所有</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  InputField,
  SelectField,
  DatePickerField
} from '../../../src/adapters/vue/components/fields'

const contacts = ref([])
const experiences = ref([])

const relationOptions = [
  { label: '家人', value: 'family' },
  { label: '朋友', value: 'friend' },
  { label: '同事', value: 'colleague' }
]

const addContact = () => {
  contacts.value.push({ name: '', phone: '', email: '', relationship: '' })
}

const removeContact = (index) => {
  contacts.value.splice(index, 1)
}

const moveContact = (index, direction) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= contacts.value.length) return
  
  const temp = contacts.value[index]
  contacts.value[index] = contacts.value[newIndex]
  contacts.value[newIndex] = temp
}

const addExperience = () => {
  experiences.value.push({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false
  })
}

const removeExperience = (index) => {
  experiences.value.splice(index, 1)
}

const handleSubmit = () => {
  console.log({ contacts: contacts.value, experiences: experiences.value })
  alert('数据已保存！')
}

const resetAll = () => {
  contacts.value = []
  experiences.value = []
}
</script>

<style scoped>
.array-fields-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.demo-section {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.demo-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.array-list {
  margin-bottom: 16px;
}

.array-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.array-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
}

.array-actions {
  display: flex;
  gap: 8px;
}

.array-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
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

.btn-icon {
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.btn-danger:hover {
  background: #ff4d4f;
  color: #fff;
}

.btn-add {
  width: 100%;
  border-style: dashed;
}

.btn-primary {
  background: #722ED1;
  border-color: #722ED1;
  color: #fff;
}

.btn-primary:hover {
  background: #5c24a8;
}

.form-actions {
  display: flex;
  gap: 12px;
}
</style>



