<template>
  <div class="ldesign-upload-field">
    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="ldesign-upload-list">
      <div
        v-for="(file, index) in fileList"
        :key="file.uid"
        class="ldesign-upload-item"
        :class="{ 'is-uploading': file.status === 'uploading' }"
      >
        <!-- 图片预览 -->
        <div v-if="listType === 'picture' || listType === 'picture-card'" class="ldesign-upload-preview">
          <img v-if="file.url" :src="file.url" :alt="file.name" />
          <div v-else class="ldesign-upload-preview-placeholder">📄</div>
        </div>

        <!-- 文件信息 -->
        <div class="ldesign-upload-info">
          <span class="ldesign-upload-name">{{ file.name }}</span>
          <span v-if="file.status === 'uploading'" class="ldesign-upload-progress">
            {{ file.percent }}%
          </span>
          <span v-if="file.status === 'error'" class="ldesign-upload-error">
            上传失败
          </span>
        </div>

        <!-- 进度条 -->
        <div v-if="file.status === 'uploading'" class="ldesign-upload-progress-bar">
          <div
            class="ldesign-upload-progress-fill"
            :style="{ width: `${file.percent}%` }"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="ldesign-upload-actions">
          <span
            v-if="file.status === 'success' && file.url"
            class="ldesign-upload-action"
            @click="previewFile(file)"
          >
            👁️
          </span>
          <span
            class="ldesign-upload-action ldesign-upload-remove"
            @click="removeFile(index)"
          >
            🗑️
          </span>
        </div>
      </div>
    </div>

    <!-- 上传触发器 -->
    <div
      v-if="!maxCount || fileList.length < maxCount"
      ref="uploadRef"
      class="ldesign-upload-trigger"
      :class="{
        'is-disabled': disabled,
        'is-drag-over': isDragOver,
        [`ldesign-upload-trigger--${listType}`]: true
      }"
      @click="triggerFileSelect"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
    >
      <slot>
        <div v-if="listType === 'picture-card'" class="ldesign-upload-card-content">
          <div class="ldesign-upload-icon">+</div>
          <div class="ldesign-upload-text">上传</div>
        </div>
        <div v-else class="ldesign-upload-default-content">
          <button type="button" class="ldesign-upload-btn" :disabled="disabled">
            📤 {{ buttonText }}
          </button>
          <div v-if="drag" class="ldesign-upload-drag-hint">
            或拖拽文件到此处
          </div>
        </div>
      </slot>
    </div>

    <!-- 提示文字 -->
    <div v-if="tip" class="ldesign-upload-tip">
      {{ tip }}
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      class="ldesign-upload-input"
      @change="handleFileSelect"
    />

    <!-- 图片预览模态框 -->
    <teleport to="body">
      <div
        v-if="previewVisible"
        class="ldesign-upload-preview-modal"
        @click="closePreview"
      >
        <div class="ldesign-upload-preview-content">
          <img :src="previewUrl" :alt="previewName" />
          <div class="ldesign-upload-preview-footer">
            {{ previewName }}
          </div>
        </div>
        <span class="ldesign-upload-preview-close" @click="closePreview">✕</span>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface UploadFile {
  uid: string
  name: string
  status: 'ready' | 'uploading' | 'success' | 'error'
  percent: number
  url?: string
  raw?: File
}

interface Props {
  modelValue?: UploadFile[]
  accept?: string
  multiple?: boolean
  disabled?: boolean
  drag?: boolean
  maxCount?: number
  maxSize?: number
  listType?: 'text' | 'picture' | 'picture-card'
  buttonText?: string
  tip?: string
  customUpload?: (file: File) => Promise<{ url: string }>
  beforeUpload?: (file: File) => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: false,
  disabled: false,
  drag: true,
  listType: 'text',
  buttonText: '选择文件'
})

const emit = defineEmits<{
  'update:modelValue': [value: UploadFile[]]
  'change': [fileList: UploadFile[]]
  'exceed': [files: File[]]
  'error': [error: Error, file: File]
}>()

const fileInputRef = ref<HTMLInputElement>()
const uploadRef = ref<HTMLElement>()
const isDragOver = ref(false)
const fileList = ref<UploadFile[]>(props.modelValue)
const previewVisible = ref(false)
const previewUrl = ref('')
const previewName = ref('')

let uidCounter = 0

const triggerFileSelect = () => {
  if (props.disabled) return
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length === 0) return
  
  uploadFiles(files)
  
  // 重置 input，允许选择相同文件
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  
  if (props.disabled) return
  
  const files = Array.from(event.dataTransfer?.files || [])
  uploadFiles(files)
}

const handleDragOver = () => {
  if (!props.disabled) {
    isDragOver.value = true
  }
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const uploadFiles = async (files: File[]) => {
  // 检查数量限制
  if (props.maxCount && fileList.value.length + files.length > props.maxCount) {
    emit('exceed', files)
    return
  }
  
  for (const file of files) {
    await uploadFile(file)
  }
}

const uploadFile = async (rawFile: File) => {
  // 检查文件大小
  if (props.maxSize && rawFile.size > props.maxSize) {
    emit('error', new Error('文件大小超出限制'), rawFile)
    return
  }
  
  // 前置钩子
  if (props.beforeUpload) {
    const result = await props.beforeUpload(rawFile)
    if (result === false) {
      return
    }
  }
  
  // 创建文件对象
  const uploadFile: UploadFile = {
    uid: `upload-${Date.now()}-${uidCounter++}`,
    name: rawFile.name,
    status: 'ready',
    percent: 0,
    raw: rawFile
  }
  
  // 图片预览
  if (rawFile.type.startsWith('image/')) {
    uploadFile.url = await readFileAsDataURL(rawFile)
  }
  
  fileList.value.push(uploadFile)
  emit('update:modelValue', fileList.value)
  
  // 开始上传
  uploadFile.status = 'uploading'
  
  try {
    if (props.customUpload) {
      // 使用自定义上传函数
      const result = await props.customUpload(rawFile)
      uploadFile.url = result.url
      uploadFile.status = 'success'
      uploadFile.percent = 100
    } else {
      // 模拟上传（实际项目中应替换为真实上传）
      await simulateUpload(uploadFile)
    }
    
    emit('change', fileList.value)
  } catch (error) {
    uploadFile.status = 'error'
    emit('error', error as Error, rawFile)
  }
}

// 模拟上传进度
const simulateUpload = (file: UploadFile): Promise<void> => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      file.percent += 10
      
      if (file.percent >= 100) {
        clearInterval(interval)
        file.status = 'success'
        resolve()
      }
    }, 200)
  })
}

// 读取文件为 DataURL
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const removeFile = (index: number) => {
  fileList.value.splice(index, 1)
  emit('update:modelValue', fileList.value)
  emit('change', fileList.value)
}

const previewFile = (file: UploadFile) => {
  if (file.url) {
    previewUrl.value = file.url
    previewName.value = file.name
    previewVisible.value = true
  }
}

const closePreview = () => {
  previewVisible.value = false
}
</script>

<style lang="less" scoped>
.ldesign-upload-field {
  width: 100%;
}

.ldesign-upload-list {
  margin-bottom: 8px;
}

.ldesign-upload-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
  }

  &.is-uploading {
    border-color: #722ED1;
  }
}

.ldesign-upload-preview {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 4px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ldesign-upload-preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  font-size: 20px;
}

.ldesign-upload-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ldesign-upload-name {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ldesign-upload-progress {
  font-size: 12px;
  color: #722ED1;
}

.ldesign-upload-error {
  font-size: 12px;
  color: #ff4d4f;
}

.ldesign-upload-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #f0f0f0;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}

.ldesign-upload-progress-fill {
  height: 100%;
  background: #722ED1;
  transition: width 0.3s;
}

.ldesign-upload-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.ldesign-upload-action {
  cursor: pointer;
  font-size: 16px;
  opacity: 0.6;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
}

.ldesign-upload-remove {
  &:hover {
    color: #ff4d4f;
  }
}

.ldesign-upload-trigger {
  display: inline-block;
  cursor: pointer;

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.is-drag-over {
    border-color: #722ED1;
    background: rgba(114, 46, 209, 0.05);
  }

  &--text {
    width: 100%;
  }

  &--picture-card {
    width: 104px;
    height: 104px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    background: #fafafa;
    transition: all 0.3s;

    &:hover:not(.is-disabled) {
      border-color: #722ED1;
    }
  }
}

.ldesign-upload-default-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;

  .ldesign-upload-trigger:hover:not(.is-disabled) & {
    border-color: #722ED1;
  }
}

.ldesign-upload-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background: #722ED1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #5c24a8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.ldesign-upload-drag-hint {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.ldesign-upload-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.ldesign-upload-icon {
  font-size: 32px;
  color: rgba(0, 0, 0, 0.25);
  margin-bottom: 8px;
}

.ldesign-upload-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.ldesign-upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.ldesign-upload-input {
  display: none;
}

.ldesign-upload-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
}

.ldesign-upload-preview-content {
  max-width: 90%;
  max-height: 90%;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;

  img {
    display: block;
    max-width: 100%;
    max-height: 80vh;
  }
}

.ldesign-upload-preview-footer {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  background: #fafafa;
}

.ldesign-upload-preview-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.6);
  }
}
</style>




