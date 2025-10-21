<template>
  <div class="form-group-demo">
    <div class="demo-form">
      <div v-for="group in groups" :key="group.name" class="form-group" :class="{ expanded: group.expanded }">
        <div class="group-header" @click="toggleGroup(group.name)">
          <h3>{{ group.icon }} {{ group.title }}</h3>
          <span class="arrow">{{ group.expanded ? '▼' : '▶' }}</span>
        </div>
        <transition name="slide">
          <div v-if="group.expanded" class="group-body">
            <div class="form-grid">
              <div v-for="field in group.fields" :key="field.name" class="form-item">
                <label>{{ field.label }}</label>
                <component
                  :is="field.component"
                  v-model="formData[field.name]"
                  v-bind="field.props"
                />
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary" @click="handleSubmit">保存</button>
        <button type="button" class="btn" @click="expandAll">全部展开</button>
        <button type="button" class="btn" @click="collapseAll">全部收起</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { InputField, SelectField, RadioField, SwitchField } from '../../../src/adapters/vue/components/fields'

const formData = reactive({
  username: '',
  email: '',
  phone: '',
  province: '',
  city: '',
  address: '',
  company: '',
  position: ''
})

const groups = ref([
  {
    name: 'basic',
    title: '基本信息',
    icon: '👤',
    expanded: true,
    fields: [
      { name: 'username', label: '用户名', component: InputField, props: { placeholder: '请输入用户名' } },
      { name: 'email', label: '邮箱', component: InputField, props: { placeholder: '请输入邮箱', type: 'email' } },
      { name: 'phone', label: '电话', component: InputField, props: { placeholder: '请输入电话' } }
    ]
  },
  {
    name: 'address',
    title: '地址信息',
    icon: '📍',
    expanded: false,
    fields: [
      { name: 'province', label: '省份', component: SelectField, props: { options: [{ label: '北京', value: 'beijing' }] } },
      { name: 'city', label: '城市', component: SelectField, props: { options: [{ label: '北京市', value: 'beijing' }] } },
      { name: 'address', label: '详细地址', component: InputField, props: { placeholder: '街道、门牌号等' } }
    ]
  },
  {
    name: 'work',
    title: '工作信息',
    icon: '💼',
    expanded: false,
    fields: [
      { name: 'company', label: '公司', component: InputField, props: { placeholder: '公司名称' } },
      { name: 'position', label: '职位', component: InputField, props: { placeholder: '职位名称' } }
    ]
  }
])

const toggleGroup = (name) => {
  const group = groups.value.find(g => g.name === name)
  if (group) {
    group.expanded = !group.expanded
  }
}

const expandAll = () => {
  groups.value.forEach(g => g.expanded = true)
}

const collapseAll = () => {
  groups.value.forEach(g => g.expanded = false)
}

const handleSubmit = () => {
  console.log('表单数据:', formData)
  alert('保存成功！')
}
</script>

<style scoped>
.form-group-demo {
  max-width: 900px;
  margin: 0 auto;
}

.demo-form {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-group {
  border-bottom: 1px solid #f0f0f0;
}

.form-group:last-child {
  border-bottom: none;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fafafa;
  cursor: pointer;
  user-select: none;
}

.group-header:hover {
  background: #f5f5f5;
}

.group-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.arrow {
  transition: transform 0.3s;
}

.form-group.expanded .arrow {
  transform: rotate(0deg);
}

.group-body {
  padding: 24px;
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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: #fafafa;
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
</style>



