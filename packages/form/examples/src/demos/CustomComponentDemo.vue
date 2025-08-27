<!--
自定义组件演示
-->

<template>
  <div class="custom-component-demo">
    <div class="demo-header">
      <h2>🎨 自定义组件演示</h2>
      <p>LemonForm 支持自定义字段组件，可以轻松扩展表单功能。</p>
    </div>

    <div class="demo-content">
      <div class="form-section">
        <h3>🌟 自定义字段组件</h3>
        <div class="custom-form">
          <div class="form-field">
            <label>评分组件</label>
            <div class="rating-field">
              <span
                v-for="star in 5"
                :key="star"
                :class="['star', { active: star <= (formData.rating || 0) }]"
                @click="formData.rating = star"
              >
                ⭐
              </span>
              <span class="rating-text">{{ formData.rating || 0 }}/5</span>
            </div>
          </div>

          <div class="form-field">
            <label>颜色选择器</label>
            <div class="color-picker">
              <input
                v-model="formData.color"
                type="color"
                class="color-input"
              />
              <span class="color-value">{{ formData.color }}</span>
            </div>
          </div>

          <div class="form-field">
            <label>标签输入</label>
            <div class="tag-input">
              <div class="tags">
                <span
                  v-for="(tag, index) in formData.tags"
                  :key="index"
                  class="tag"
                >
                  {{ tag }}
                  <button @click="removeTag(index)" class="tag-remove">×</button>
                </span>
              </div>
              <input
                v-model="newTag"
                @keyup.enter="addTag"
                placeholder="输入标签后按回车"
                class="tag-input-field"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="data-display">
      <h3>📊 表单数据</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const formData = reactive({
  rating: 0,
  color: '#f39c12',
  tags: ['Vue', 'TypeScript']
})

const newTag = ref('')

const addTag = () => {
  if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
    formData.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  formData.tags.splice(index, 1)
}
</script>

<style scoped>
.custom-component-demo {
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

.form-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
}

.custom-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
  max-width: 600px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-weight: 500;
  color: #333;
}

.rating-field {
  display: flex;
  align-items: center;
  gap: 5px;
}

.star {
  font-size: 24px;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.star.active {
  opacity: 1;
}

.star:hover {
  opacity: 0.8;
}

.rating-text {
  margin-left: 10px;
  font-weight: 500;
  color: #666;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-value {
  font-family: monospace;
  color: #666;
}

.tag-input {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  min-height: 40px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}

.tag {
  background: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tag-input-field {
  border: none;
  outline: none;
  width: 100%;
  padding: 4px 0;
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
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
