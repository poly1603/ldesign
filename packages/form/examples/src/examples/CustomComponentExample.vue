<!--
自定义组件示例
-->

<template>
  <div class="example-container">
    <div class="example-header">
      <h2>自定义组件示例</h2>
      <p>展示如何创建和使用自定义字段组件</p>
    </div>

    <div class="example-content">
      <div class="form-section">
        <h3>自定义字段表单</h3>
        <DynamicForm
          v-model="formData"
          :config="formConfig"
          @submit="handleSubmit"
        />
      </div>

      <div class="info-section">
        <div class="component-info">
          <h3>自定义组件说明</h3>
          <div class="component-list">
            <div class="component-item">
              <strong>评分组件:</strong> 星级评分选择器
            </div>
            <div class="component-item">
              <strong>颜色选择器:</strong> 颜色选择面板
            </div>
            <div class="component-item">
              <strong>标签输入:</strong> 支持添加/删除标签
            </div>
            <div class="component-item">
              <strong>富文本编辑器:</strong> 简单的富文本编辑
            </div>
            <div class="component-item">
              <strong>图片上传:</strong> 图片上传预览组件
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
import { ref } from 'vue'
import { DynamicForm } from '@lemonform/form'
import type { FormConfig } from '@lemonform/form'

// 导入自定义组件
import RatingField from '../components/RatingField.vue'
import ColorPickerField from '../components/ColorPickerField.vue'
import TagInputField from '../components/TagInputField.vue'
import RichTextEditor from '../components/RichTextEditor.vue'
import ImageUploadField from '../components/ImageUploadField.vue'

// 表单数据
const formData = ref({
  rating: 0,
  color: '#f39c12',
  tags: [],
  content: '',
  images: []
})

// 表单配置
const formConfig: FormConfig = {
  fields: [
    {
      type: 'input',
      name: 'title',
      label: '标题',
      component: 'input',
      required: true,
      placeholder: '请输入标题'
    },
    {
      type: 'rating',
      name: 'rating',
      label: '评分',
      component: RatingField,
      required: true,
      help: '请为内容评分（1-5星）',
      props: {
        max: 5,
        allowHalf: true,
        showText: true
      }
    },
    {
      type: 'color-picker',
      name: 'color',
      label: '主题颜色',
      component: ColorPickerField,
      defaultValue: '#f39c12',
      help: '选择您喜欢的主题颜色',
      props: {
        presetColors: [
          '#f39c12', '#e74c3c', '#3498db', '#2ecc71',
          '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
        ]
      }
    },
    {
      type: 'tag-input',
      name: 'tags',
      label: '标签',
      component: TagInputField,
      help: '添加相关标签，按回车确认',
      props: {
        placeholder: '输入标签后按回车',
        maxTags: 10
      }
    },
    {
      type: 'rich-text',
      name: 'content',
      label: '内容',
      component: RichTextEditor,
      required: true,
      help: '编写详细内容',
      props: {
        placeholder: '请输入内容...',
        minHeight: 200
      }
    },
    {
      type: 'image-upload',
      name: 'images',
      label: '图片',
      component: ImageUploadField,
      help: '上传相关图片（最多5张）',
      props: {
        maxCount: 5,
        accept: 'image/*',
        maxSize: 5 * 1024 * 1024 // 5MB
      }
    },
    {
      type: 'textarea',
      name: 'description',
      label: '描述',
      component: 'textarea',
      placeholder: '请输入描述信息...',
      props: {
        rows: 4
      }
    },
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '发布内容', variant: 'primary' },
        { type: 'reset', text: '重置', variant: 'secondary' }
      ]
    }
  ],
  layout: {
    type: 'grid',
    columns: 1,
    gap: 20
  }
}

// 事件处理
const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
  alert('内容发布成功！')
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

.component-info,
.form-data {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.component-info h3,
.form-data h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.component-item {
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.4;
}

.component-item strong {
  color: #f39c12;
}

.data-display {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  overflow: auto;
  max-height: 400px;
  margin: 0;
}

@media (max-width: 768px) {
  .example-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
