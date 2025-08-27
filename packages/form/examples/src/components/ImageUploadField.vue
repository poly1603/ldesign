<!--
图片上传组件
-->

<template>
  <div class="image-upload-field">
    <div class="upload-area">
      <div class="image-list">
        <div
          v-for="(image, index) in modelValue"
          :key="index"
          class="image-item"
        >
          <img :src="image.url" :alt="image.name" class="image-preview" />
          <div class="image-overlay">
            <button
              type="button"
              class="image-action"
              @click="previewImage(image)"
              title="预览"
            >
              👁️
            </button>
            <button
              type="button"
              class="image-action"
              @click="removeImage(index)"
              title="删除"
            >
              🗑️
            </button>
          </div>
          <div class="image-info">
            <div class="image-name">{{ image.name }}</div>
            <div class="image-size">{{ formatFileSize(image.size) }}</div>
          </div>
        </div>
        
        <div
          v-if="canUpload"
          class="upload-trigger"
          @click="triggerUpload"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInputRef"
            type="file"
            :accept="accept"
            multiple
            @change="handleFileSelect"
            style="display: none"
          />
          <div class="upload-icon">📷</div>
          <div class="upload-text">点击或拖拽上传</div>
          <div class="upload-hint">
            支持 {{ accept }} 格式，单个文件不超过 {{ formatFileSize(maxSize) }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="maxCount" class="upload-counter">
      {{ modelValue.length }} / {{ maxCount }}
    </div>
    
    <!-- 预览模态框 -->
    <div v-if="previewVisible" class="preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <img :src="previewImage.url" :alt="previewImage.name" class="preview-image" />
        <button class="preview-close" @click="closePreview">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ImageFile {
  name: string
  url: string
  size: number
  file?: File
}

interface Props {
  modelValue?: ImageFile[]
  maxCount?: number
  maxSize?: number
  accept?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: ImageFile[]): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxCount: 5,
  maxSize: 5 * 1024 * 1024, // 5MB
  accept: 'image/*',
  disabled: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const fileInputRef = ref<HTMLInputElement>()
const previewVisible = ref(false)
const previewImage = ref<ImageFile>({ name: '', url: '', size: 0 })

// 计算属性
const canUpload = computed(() => {
  return !props.disabled && (!props.maxCount || props.modelValue.length < props.maxCount)
})

// 触发文件选择
const triggerUpload = () => {
  if (!canUpload.value) return
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    handleFiles(Array.from(files))
  }
  // 清空 input 值，允许重复选择同一文件
  target.value = ''
}

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  if (!canUpload.value) return
  
  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

// 处理文件
const handleFiles = (files: File[]) => {
  const validFiles: File[] = []
  
  for (const file of files) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      emit('error', `文件 ${file.name} 不是有效的图片格式`)
      continue
    }
    
    // 检查文件大小
    if (file.size > props.maxSize) {
      emit('error', `文件 ${file.name} 大小超过限制 ${formatFileSize(props.maxSize)}`)
      continue
    }
    
    // 检查数量限制
    if (props.maxCount && props.modelValue.length + validFiles.length >= props.maxCount) {
      emit('error', `最多只能上传 ${props.maxCount} 张图片`)
      break
    }
    
    validFiles.push(file)
  }
  
  // 转换为 ImageFile 对象
  const imageFiles: ImageFile[] = []
  
  validFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageFile: ImageFile = {
        name: file.name,
        url: e.target?.result as string,
        size: file.size,
        file
      }
      
      imageFiles.push(imageFile)
      
      // 当所有文件都处理完成时更新值
      if (imageFiles.length === validFiles.length) {
        const newValue = [...props.modelValue, ...imageFiles]
        emit('update:modelValue', newValue)
      }
    }
    reader.readAsDataURL(file)
  })
}

// 移除图片
const removeImage = (index: number) => {
  if (props.disabled) return
  
  const newValue = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newValue)
}

// 预览图片
const previewImage = (image: ImageFile) => {
  previewImage.value = image
  previewVisible.value = true
}

// 关闭预览
const closePreview = () => {
  previewVisible.value = false
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.image-upload-field {
  width: 100%;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 16px;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #f39c12;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  background: white;
}

.image-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 40px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-action {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.image-action:hover {
  background: white;
  transform: scale(1.1);
}

.image-info {
  padding: 8px;
  background: white;
}

.image-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.upload-trigger:hover {
  border-color: #f39c12;
  background: #fff9f0;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.upload-counter {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-field[data-disabled="true"] {
  opacity: 0.6;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .image-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }
  
  .image-preview {
    height: 100px;
  }
  
  .upload-trigger {
    height: 120px;
  }
  
  .upload-icon {
    font-size: 24px;
  }
}
</style>
