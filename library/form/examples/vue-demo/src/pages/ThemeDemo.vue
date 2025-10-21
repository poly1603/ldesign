<template>
  <div class="theme-demo">
    <div class="theme-controls">
      <div class="control-group">
        <label>主题模式</label>
        <RadioField v-model="theme" :options="themeOptions" @change="applyTheme" />
      </div>
      <div class="control-group">
        <label>主题颜色</label>
        <div class="color-swatches">
          <div
            v-for="color in colors"
            :key="color"
            class="color-swatch"
            :class="{ active: brandColor === color }"
            :style="{ background: color }"
            @click="changeBrandColor(color)"
          />
        </div>
      </div>
      <div class="control-group">
        <label>尺寸</label>
        <RadioField v-model="size" :options="sizeOptions" buttonStyle />
      </div>
    </div>

    <div class="preview-form" :class="`size-${size}`">
      <h3>预览表单</h3>
      <div class="form-grid">
        <div class="form-item">
          <label>用户名</label>
          <InputField modelValue="示例用户" />
        </div>
        <div class="form-item">
          <label>邮箱</label>
          <InputField modelValue="user@example.com" type="email" />
        </div>
        <div class="form-item">
          <label>性别</label>
          <SelectField :modelValue="'male'" :options="genderOptions" />
        </div>
        <div class="form-item">
          <label>启用</label>
          <SwitchField :modelValue="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { InputField, SelectField, RadioField, SwitchField } from '../../../src/adapters/vue/components/fields'

const theme = ref('light')
const brandColor = ref('#722ED1')
const size = ref('medium')

const themeOptions = [
  { label: '☀️ 浅色', value: 'light' },
  { label: '🌙 深色', value: 'dark' }
]

const sizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' }
]

const colors = ['#722ED1', '#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#13c2c2']

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
}

const changeBrandColor = (color) => {
  brandColor.value = color
  document.documentElement.style.setProperty('--ldesign-brand-color', color)
}
</script>

<style scoped>
.theme-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.theme-controls,
.preview-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
}

.color-swatches {
  display: flex;
  gap: 12px;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  border-color: #000;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #722ED1;
}

.preview-form h3 {
  font-size: 18px;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.size-small .form-item label {
  font-size: 12px;
}

.size-large .form-item label {
  font-size: 16px;
}
</style>



