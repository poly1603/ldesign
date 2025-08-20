<template>
  <div class="file-upload" :class="uploadClasses">
    <!-- 拖拽上传区域 -->
    <div 
      class="upload-area"
      :class="{
        'upload-area--dragover': isDragOver,
        'upload-area--disabled': disabled,
        'upload-area--error': hasError
      }"
      @click="handleAreaClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- 上传图标 -->
      <div class="upload-icon">
        <svg v-if="!uploading" class="icon icon--upload" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
        <svg v-else class="icon icon--loading" viewBox="0 0 24 24">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
      </div>
      
      <!-- 上传文本 -->
      <div class="upload-text">
        <h3 class="upload-title">
          {{ uploading ? uploadingText : uploadTitle }}
        </h3>
        <p class="upload-description">
          {{ uploading ? uploadingDescription : uploadDescription }}
        </p>
        
        <!-- 文件限制信息 -->
        <div class="upload-limits" v-if="!uploading">
          <span class="limit-item" v-if="maxSize">
            最大 {{ formatFileSize(maxSize) }}
          </span>
          <span class="limit-item" v-if="acceptedTypes.length > 0">
            支持 {{ acceptedTypes.join(', ') }}
          </span>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="upload-progress" v-if="uploading && showProgress">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ Math.round(progress) }}%
        </div>
      </div>
      
      <!-- 错误信息 -->
      <div class="upload-error" v-if="hasError">
        <svg class="icon icon--error" viewBox="0 0 24 24">
          <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22L12,19.27L5.82,22L7,14L2,9L10.91,8.26L12,2Z" />
        </svg>
        <span class="error-message">{{ errorMessage }}</span>
      </div>
    </div>
    
    <!-- 文件输入 -->
    <input 
      ref="fileInput"
      type="file"
      class="file-input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled || uploading"
      @change="handleFileSelect"
    />
    
    <!-- 已选择的文件列表 -->
    <div class="file-list" v-if="selectedFiles.length > 0">
      <h4 class="file-list-title">已选择的文件:</h4>
      <div class="file-items">
        <div 
          v-for="(file, index) in selectedFiles"
          :key="file.id"
          class="file-item"
          :class="{
            'file-item--uploading': file.status === 'uploading',
            'file-item--success': file.status === 'success',
            'file-item--error': file.status === 'error'
          }"
        >
          <!-- 文件图标 -->
          <div class="file-icon">
            <svg v-if="file.status === 'pending'" class="icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <svg v-else-if="file.status === 'uploading'" class="icon icon--spin" viewBox="0 0 24 24">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
            </svg>
            <svg v-else-if="file.status === 'success'" class="icon icon--success" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
            </svg>
            <svg v-else-if="file.status === 'error'" class="icon icon--error" viewBox="0 0 24 24">
              <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22L12,19.27L5.82,22L7,14L2,9L10.91,8.26L12,2Z" />
            </svg>
          </div>
          
          <!-- 文件信息 -->
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-details">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-status" v-if="file.status !== 'pending'">
                {{ getStatusText(file.status) }}
              </span>
            </div>
            
            <!-- 文件进度 -->
            <div class="file-progress" v-if="file.status === 'uploading'">
              <div class="progress-bar progress-bar--small">
                <div 
                  class="progress-fill"
                  :style="{ width: `${file.progress || 0}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="file-actions">
            <button 
              class="btn-icon btn-icon--remove"
              @click="removeFile(index)"
              :disabled="file.status === 'uploading'"
              :title="file.status === 'uploading' ? '上传中，无法删除' : '删除文件'"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 批量操作 -->
      <div class="file-actions-bulk" v-if="selectedFiles.length > 1">
        <button 
          class="btn btn-secondary"
          @click="clearFiles"
          :disabled="uploading"
        >
          清空所有
        </button>
        <button 
          class="btn btn-primary"
          @click="uploadFiles"
          :disabled="uploading || selectedFiles.length === 0"
        >
          {{ uploading ? '上传中...' : `上传 ${selectedFiles.length} 个文件` }}
        </button>
      </div>
    </div>
    
    <!-- 上传历史 -->
    <div class="upload-history" v-if="showHistory && uploadHistory.length > 0">
      <h4 class="history-title">最近上传:</h4>
      <div class="history-items">
        <div 
          v-for="item in uploadHistory.slice(0, 5)"
          :key="item.id"
          class="history-item"
          @click="$emit('file-select', item)"
        >
          <div class="history-icon">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
          </div>
          <div class="history-info">
            <div class="history-name">{{ item.name }}</div>
            <div class="history-time">{{ formatTime(item.uploadTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFileUpload, useDragUpload } from '../composables/useFileUpload'
import type { FileUploadProps } from '../types'

// Props
const props = withDefaults(defineProps<FileUploadProps>(), {
  accept: '.pdf',
  multiple: false,
  maxSize: 50 * 1024 * 1024, // 50MB
  disabled: false,
  showProgress: true,
  showHistory: false,
  uploadText: '选择PDF文件或拖拽到此处',
  uploadingText: '正在上传文件...',
  theme: 'auto'
})

// Emits
const emit = defineEmits<{
  'file-select': [file: File]
  'files-select': [files: File[]]
  'upload-start': [files: File[]]
  'upload-progress': [progress: number, file?: File]
  'upload-success': [file: File, result?: any]
  'upload-error': [error: Error, file?: File]
  'upload-complete': [results: any[]]
}>()

// 文件输入引用
const fileInput = ref<HTMLInputElement>()

// 使用文件上传组合式函数
const {
  selectedFiles,
  uploading,
  progress,
  error,
  uploadHistory,
  uploadFiles: uploadFilesComposable,
  addFiles,
  removeFile,
  clearFiles,
  cancelUpload
} = useFileUpload({
  maxSize: props.maxSize,
  acceptedTypes: props.accept.split(',').map(type => type.trim()),
  multiple: props.multiple,
  onUploadStart: (files) => emit('upload-start', files),
  onUploadProgress: (progress, file) => emit('upload-progress', progress, file),
  onUploadSuccess: (file, result) => emit('upload-success', file, result),
  onUploadError: (error, file) => emit('upload-error', error, file),
  onUploadComplete: (results) => emit('upload-complete', results)
})

// 使用拖拽上传组合式函数
const {
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop
} = useDragUpload({
  onFilesDropped: handleFilesDropped,
  disabled: computed(() => props.disabled || uploading.value)
})

// 计算属性
const uploadClasses = computed(() => ({
  'file-upload--dark': props.theme === 'dark',
  'file-upload--light': props.theme === 'light',
  'file-upload--disabled': props.disabled,
  'file-upload--uploading': uploading.value
}))

const hasError = computed(() => !!error.value)

const errorMessage = computed(() => error.value?.message || '上传失败')

const uploadTitle = computed(() => {
  if (props.uploadText) return props.uploadText
  return props.multiple ? '选择PDF文件或拖拽到此处' : '选择PDF文件或拖拽到此处'
})

const uploadDescription = computed(() => {
  if (props.uploadDescription) return props.uploadDescription
  const parts = []
  if (props.maxSize) {
    parts.push(`最大 ${formatFileSize(props.maxSize)}`)
  }
  if (props.multiple) {
    parts.push('支持多文件上传')
  }
  return parts.join(' • ')
})

const uploadingDescription = computed(() => {
  if (props.uploadingDescription) return props.uploadingDescription
  return '请稍候，正在处理您的文件...'
})

const acceptedTypes = computed(() => {
  return props.accept.split(',').map(type => type.trim().replace('.', '').toUpperCase())
})

const accept = computed(() => props.accept)

// 方法
const handleAreaClick = () => {
  if (props.disabled || uploading.value) return
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  handleFilesSelected(files)
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

const handleFilesDropped = (files: File[]) => {
  handleFilesSelected(files)
}

const handleFilesSelected = (files: File[]) => {
  if (files.length === 0) return
  
  // 添加文件到列表
  addFiles(files)
  
  // 发送事件
  if (files.length === 1) {
    emit('file-select', files[0])
  }
  emit('files-select', files)
  
  // 如果不是多文件模式，自动开始上传
  if (!props.multiple && files.length === 1) {
    uploadFiles()
  }
}

const uploadFiles = async () => {
  try {
    await uploadFilesComposable()
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '等待上传',
    uploading: '上传中',
    success: '上传成功',
    error: '上传失败'
  }
  return statusMap[status] || status
}

// 监听器
watch(() => props.disabled, (disabled) => {
  if (disabled && uploading.value) {
    cancelUpload()
  }
})

// 暴露方法给父组件
defineExpose({
  selectFiles: () => fileInput.value?.click(),
  uploadFiles,
  clearFiles,
  cancelUpload,
  getSelectedFiles: () => selectedFiles.value,
  isUploading: () => uploading.value
})
</script>

<style scoped>
.file-upload {
  width: 100%;
  font-family: var(--pdf-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

/* 上传区域 */
.upload-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--pdf-spacing-large, 24px);
  border: 2px dashed var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius-large, 8px);
  background: var(--pdf-color-background, #ffffff);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.upload-area:hover {
  border-color: var(--pdf-color-primary, #1976d2);
  background: var(--pdf-color-surface, #f5f5f5);
}

.upload-area--dragover {
  border-color: var(--pdf-color-primary, #1976d2);
  background: rgba(25, 118, 210, 0.05);
  transform: scale(1.02);
}

.upload-area--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.upload-area--error {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

/* 上传图标 */
.upload-icon {
  margin-bottom: var(--pdf-spacing-medium, 16px);
}

.icon {
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
}

.icon--upload {
  fill: var(--pdf-color-secondary, #757575);
}

.upload-area:hover .icon--upload {
  fill: var(--pdf-color-primary, #1976d2);
  transform: scale(1.1);
}

.icon--loading {
  fill: var(--pdf-color-primary, #1976d2);
  animation: spin 1s linear infinite;
}

.icon--success {
  fill: #4caf50;
}

.icon--error {
  fill: #f44336;
}

.icon--spin {
  animation: spin 1s linear infinite;
}

/* 上传文本 */
.upload-text {
  max-width: 400px;
}

.upload-title {
  margin: 0 0 var(--pdf-spacing-small, 8px) 0;
  font-size: var(--pdf-font-size-large, 18px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.upload-description {
  margin: 0 0 var(--pdf-spacing-medium, 16px) 0;
  font-size: var(--pdf-font-size-medium, 14px);
  color: var(--pdf-color-secondary, #757575);
  line-height: 1.5;
}

.upload-limits {
  display: flex;
  gap: var(--pdf-spacing-medium, 16px);
  justify-content: center;
  flex-wrap: wrap;
}

.limit-item {
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
  background: var(--pdf-color-surface, #f5f5f5);
  padding: 4px 8px;
  border-radius: var(--pdf-border-radius, 4px);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
}

/* 进度条 */
.upload-progress {
  width: 100%;
  max-width: 300px;
  margin-top: var(--pdf-spacing-medium, 16px);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--pdf-color-border, #e0e0e0);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--pdf-spacing-small, 8px);
}

.progress-bar--small {
  height: 4px;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pdf-color-primary, #1976d2), var(--pdf-color-accent, #2196f3));
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

.progress-text {
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
  text-align: center;
  font-weight: 500;
}

/* 错误信息 */
.upload-error {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-small, 8px);
  margin-top: var(--pdf-spacing-medium, 16px);
  padding: var(--pdf-spacing-small, 8px) var(--pdf-spacing-medium, 16px);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: var(--pdf-border-radius, 4px);
  color: #f44336;
}

.upload-error .icon {
  width: 20px;
  height: 20px;
}

.error-message {
  font-size: var(--pdf-font-size-small, 12px);
  font-weight: 500;
}

/* 文件输入 */
.file-input {
  display: none;
}

/* 文件列表 */
.file-list {
  margin-top: var(--pdf-spacing-large, 24px);
}

.file-list-title {
  margin: 0 0 var(--pdf-spacing-medium, 16px) 0;
  font-size: var(--pdf-font-size-medium, 16px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: var(--pdf-spacing-small, 8px);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-medium, 16px);
  padding: var(--pdf-spacing-medium, 16px);
  background: var(--pdf-color-surface, #f5f5f5);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius, 4px);
  transition: all 0.2s ease;
}

.file-item:hover {
  background: var(--pdf-color-background, #ffffff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.file-item--uploading {
  border-color: var(--pdf-color-primary, #1976d2);
  background: rgba(25, 118, 210, 0.05);
}

.file-item--success {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.file-item--error {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.file-icon {
  flex-shrink: 0;
}

.file-icon .icon {
  width: 24px;
  height: 24px;
  fill: var(--pdf-color-secondary, #757575);
}

.file-item--uploading .file-icon .icon {
  fill: var(--pdf-color-primary, #1976d2);
}

.file-item--success .file-icon .icon {
  fill: #4caf50;
}

.file-item--error .file-icon .icon {
  fill: #f44336;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: var(--pdf-font-size-medium, 14px);
  font-weight: 500;
  color: var(--pdf-color-text, #212121);
  margin-bottom: 4px;
  word-break: break-all;
}

.file-details {
  display: flex;
  gap: var(--pdf-spacing-small, 8px);
  align-items: center;
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
}

.file-size {
  font-weight: 500;
}

.file-status {
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.file-item--uploading .file-status {
  background: rgba(25, 118, 210, 0.1);
  color: var(--pdf-color-primary, #1976d2);
}

.file-item--success .file-status {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.file-item--error .file-status {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.file-progress {
  margin-top: 4px;
}

.file-actions {
  flex-shrink: 0;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--pdf-border-radius, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.btn-icon:hover:not(:disabled) {
  background: var(--pdf-color-border, #e0e0e0);
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon--remove {
  color: var(--pdf-color-secondary, #757575);
}

.btn-icon--remove:hover:not(:disabled) {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.btn-icon .icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 批量操作 */
.file-actions-bulk {
  display: flex;
  gap: var(--pdf-spacing-small, 8px);
  justify-content: flex-end;
  margin-top: var(--pdf-spacing-medium, 16px);
  padding-top: var(--pdf-spacing-medium, 16px);
  border-top: 1px solid var(--pdf-color-border, #e0e0e0);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--pdf-spacing-small, 8px);
  padding: 8px 16px;
  border: none;
  border-radius: var(--pdf-border-radius, 4px);
  cursor: pointer;
  font-size: var(--pdf-font-size-small, 12px);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--pdf-color-primary, #1976d2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--pdf-color-accent, #2196f3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-secondary {
  background: var(--pdf-color-border, #e0e0e0);
  color: var(--pdf-color-text, #212121);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--pdf-color-secondary, #757575);
  color: white;
  transform: translateY(-1px);
}

/* 上传历史 */
.upload-history {
  margin-top: var(--pdf-spacing-large, 24px);
}

.history-title {
  margin: 0 0 var(--pdf-spacing-medium, 16px) 0;
  font-size: var(--pdf-font-size-medium, 16px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: var(--pdf-spacing-small, 8px);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-medium, 16px);
  padding: var(--pdf-spacing-small, 8px) var(--pdf-spacing-medium, 16px);
  background: var(--pdf-color-surface, #f5f5f5);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: var(--pdf-color-background, #ffffff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-icon {
  flex-shrink: 0;
}

.history-icon .icon {
  width: 20px;
  height: 20px;
  fill: var(--pdf-color-secondary, #757575);
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-name {
  font-size: var(--pdf-font-size-small, 12px);
  font-weight: 500;
  color: var(--pdf-color-text, #212121);
  margin-bottom: 2px;
  word-break: break-all;
}

.history-time {
  font-size: 10px;
  color: var(--pdf-color-secondary, #757575);
}

/* 动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 主题样式 */
.file-upload--dark {
  --pdf-color-background: #121212;
  --pdf-color-surface: #1e1e1e;
  --pdf-color-text: #ffffff;
  --pdf-color-secondary: #b0bec5;
  --pdf-color-border: #333333;
  --pdf-color-primary: #90caf9;
  --pdf-color-accent: #64b5f6;
}

.file-upload--light {
  --pdf-color-background: #ffffff;
  --pdf-color-surface: #f5f5f5;
  --pdf-color-text: #212121;
  --pdf-color-secondary: #757575;
  --pdf-color-border: #e0e0e0;
  --pdf-color-primary: #1976d2;
  --pdf-color-accent: #2196f3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-area {
    min-height: 150px;
    padding: var(--pdf-spacing-medium, 16px);
  }
  
  .icon {
    width: 32px;
    height: 32px;
  }
  
  .upload-title {
    font-size: var(--pdf-font-size-medium, 16px);
  }
  
  .upload-description {
    font-size: var(--pdf-font-size-small, 12px);
  }
  
  .file-item {
    padding: var(--pdf-spacing-small, 8px);
    gap: var(--pdf-spacing-small, 8px);
  }
  
  .file-actions-bulk {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .upload-area {
    min-height: 120px;
    padding: var(--pdf-spacing-small, 8px);
  }
  
  .upload-limits {
    flex-direction: column;
    gap: var(--pdf-spacing-small, 8px);
  }
  
  .file-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}

/* 紧凑模式 */
.file-upload--compact .upload-area {
  min-height: 100px;
  padding: var(--pdf-spacing-medium, 16px);
}

.file-upload--compact .icon {
  width: 24px;
  height: 24px;
}

.file-upload--compact .upload-title {
  font-size: var(--pdf-font-size-medium, 14px);
}

.file-upload--compact .upload-description {
  font-size: var(--pdf-font-size-small, 12px);
}
</style>