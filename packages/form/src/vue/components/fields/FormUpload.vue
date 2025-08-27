<template>
  <div
    :class="[
      'l-form-upload',
      `l-form-upload--${listType}`,
      `l-form-upload--${size}`,
      {
        'l-form-upload--disabled': disabled,
        'l-form-upload--readonly': readonly,
        'l-form-upload--dragging': isDragging
      }
    ]"
  >
    <!-- 上传区域 -->
    <div
      v-if="showUploadArea"
      :class="[
        'l-form-upload__area',
        {
          'l-form-upload__area--drag': drag,
          'l-form-upload__area--dragging': isDragging
        }
      ]"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="l-form-upload__input"
        @change="handleFileChange"
      />
      
      <!-- 上传按钮样式 -->
      <div v-if="listType === 'text'" class="l-form-upload__button">
        <i class="l-form-upload__icon l-icon-upload"></i>
        <span>{{ uploadText }}</span>
      </div>
      
      <!-- 拖拽上传样式 -->
      <div v-else-if="listType === 'drag'" class="l-form-upload__drag">
        <i class="l-form-upload__drag-icon l-icon-cloud-upload"></i>
        <p class="l-form-upload__drag-text">{{ dragText }}</p>
        <p class="l-form-upload__drag-hint">{{ dragHint }}</p>
      </div>
      
      <!-- 图片卡片样式 -->
      <div v-else-if="listType === 'picture-card'" class="l-form-upload__picture-card">
        <i class="l-form-upload__icon l-icon-plus"></i>
        <span>{{ uploadText }}</span>
      </div>
    </div>
    
    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="l-form-upload__list">
      <TransitionGroup name="l-upload-list" tag="div">
        <div
          v-for="file in fileList"
          :key="file.uid"
          :class="[
            'l-form-upload__item',
            `l-form-upload__item--${file.status}`,
            `l-form-upload__item--${listType}`
          ]"
        >
          <!-- 文件图标 -->
          <div class="l-form-upload__item-icon">
            <i v-if="file.status === 'uploading'" class="l-icon-loading"></i>
            <i v-else-if="file.status === 'error'" class="l-icon-error"></i>
            <i v-else-if="isImageFile(file)" class="l-icon-image"></i>
            <i v-else class="l-icon-file"></i>
          </div>
          
          <!-- 文件信息 -->
          <div class="l-form-upload__item-info">
            <div class="l-form-upload__item-name" :title="file.name">
              {{ file.name }}
            </div>
            <div v-if="file.status === 'uploading'" class="l-form-upload__item-progress">
              <div
                class="l-form-upload__item-progress-bar"
                :style="{ width: `${file.percent || 0}%` }"
              ></div>
            </div>
            <div v-if="file.status === 'error'" class="l-form-upload__item-error">
              {{ file.error || '上传失败' }}
            </div>
          </div>
          
          <!-- 预览图片 -->
          <div
            v-if="listType === 'picture-card' && file.url"
            class="l-form-upload__item-preview"
          >
            <img :src="file.url" :alt="file.name" />
          </div>
          
          <!-- 操作按钮 -->
          <div class="l-form-upload__item-actions">
            <button
              v-if="file.url && showPreview"
              type="button"
              class="l-form-upload__item-action"
              @click="handlePreview(file)"
            >
              <i class="l-icon-eye"></i>
            </button>
            <button
              v-if="file.url && showDownload"
              type="button"
              class="l-form-upload__item-action"
              @click="handleDownload(file)"
            >
              <i class="l-icon-download"></i>
            </button>
            <button
              v-if="!disabled && !readonly"
              type="button"
              class="l-form-upload__item-action l-form-upload__item-action--remove"
              @click="handleRemove(file)"
            >
              <i class="l-icon-delete"></i>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
    
    <!-- 预览模态框 -->
    <div
      v-if="previewVisible"
      class="l-form-upload__preview-modal"
      @click="closePreview"
    >
      <div class="l-form-upload__preview-content" @click.stop>
        <img :src="previewUrl" :alt="previewTitle" />
        <div class="l-form-upload__preview-title">{{ previewTitle }}</div>
        <button
          type="button"
          class="l-form-upload__preview-close"
          @click="closePreview"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SizeType } from '../../../types'
import { generateId } from '../../../core/utils'

// 文件状态
type FileStatus = 'ready' | 'uploading' | 'success' | 'error'

// 文件对象
interface UploadFile {
  uid: string
  name: string
  size?: number
  type?: string
  url?: string
  status: FileStatus
  percent?: number
  error?: string
  raw?: File
}

// 组件属性
interface Props {
  id?: string
  value?: UploadFile[]
  disabled?: boolean
  readonly?: boolean
  size?: SizeType
  accept?: string
  multiple?: boolean
  maxCount?: number
  maxSize?: number
  listType?: 'text' | 'picture' | 'picture-card' | 'drag'
  drag?: boolean
  uploadText?: string
  dragText?: string
  dragHint?: string
  showPreview?: boolean
  showDownload?: boolean
  // 上传配置
  action?: string
  method?: string
  headers?: Record<string, string>
  data?: Record<string, any>
  withCredentials?: boolean
  // 自定义上传
  customUpload?: (file: File) => Promise<{ url: string }>
}

// 组件事件
interface Emits {
  (e: 'update:value', files: UploadFile[]): void
  (e: 'change', files: UploadFile[]): void
  (e: 'before-upload', file: File): boolean | Promise<boolean>
  (e: 'upload-progress', file: UploadFile, percent: number): void
  (e: 'upload-success', file: UploadFile, response: any): void
  (e: 'upload-error', file: UploadFile, error: Error): void
  (e: 'remove', file: UploadFile): void
  (e: 'preview', file: UploadFile): void
  (e: 'download', file: UploadFile): void
}

const props = withDefaults(defineProps<Props>(), {
  id: 'upload',
  value: () => [],
  disabled: false,
  readonly: false,
  size: 'medium',
  accept: '',
  multiple: false,
  maxCount: 0,
  maxSize: 0,
  listType: 'text',
  drag: false,
  uploadText: '点击上传',
  dragText: '点击或拖拽文件到此区域上传',
  dragHint: '支持单个或批量上传',
  showPreview: true,
  showDownload: true,
  method: 'POST',
  withCredentials: false
})

const emit = defineEmits<Emits>()

// 响应式引用
const inputRef = ref<HTMLInputElement>()
const fileList = ref<UploadFile[]>([...props.value])
const isDragging = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')
const previewTitle = ref('')

// 计算属性
const showUploadArea = computed(() => {
  if (props.disabled || props.readonly) return false
  if (props.maxCount > 0 && fileList.value.length >= props.maxCount) return false
  return true
})

// 方法
const handleClick = () => {
  if (props.disabled || props.readonly) return
  inputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return
  
  handleFiles(Array.from(files))
  
  // 清空input值，允许重复选择同一文件
  target.value = ''
}

const handleDragOver = (event: DragEvent) => {
  if (props.disabled || props.readonly) return
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  if (props.disabled || props.readonly) return
  
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files) return
  
  handleFiles(Array.from(files))
}

const handleFiles = async (files: File[]) => {
  // 检查文件数量限制
  if (props.maxCount > 0) {
    const remainingCount = props.maxCount - fileList.value.length
    if (remainingCount <= 0) return
    files = files.slice(0, remainingCount)
  }
  
  for (const file of files) {
    // 检查文件大小
    if (props.maxSize > 0 && file.size > props.maxSize) {
      console.warn(`文件 ${file.name} 大小超过限制`)
      continue
    }
    
    // 检查文件类型
    if (props.accept && !isAcceptedFile(file)) {
      console.warn(`文件 ${file.name} 类型不支持`)
      continue
    }
    
    // 执行上传前检查
    try {
      const beforeUpload = await emit('before-upload', file)
      if (beforeUpload === false) continue
    } catch (error) {
      console.warn('上传前检查失败:', error)
      continue
    }
    
    // 创建文件对象
    const uploadFile: UploadFile = {
      uid: generateId('file'),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready',
      raw: file
    }
    
    // 添加到文件列表
    fileList.value.push(uploadFile)
    
    // 开始上传
    uploadFile.status = 'uploading'
    try {
      await uploadFile(uploadFile)
    } catch (error) {
      uploadFile.status = 'error'
      uploadFile.error = error instanceof Error ? error.message : '上传失败'
      emit('upload-error', uploadFile, error as Error)
    }
  }
  
  updateValue()
}

const uploadFile = async (file: UploadFile) => {
  if (!file.raw) return
  
  if (props.customUpload) {
    // 自定义上传
    const result = await props.customUpload(file.raw)
    file.url = result.url
    file.status = 'success'
    emit('upload-success', file, result)
  } else if (props.action) {
    // 默认上传
    await defaultUpload(file)
  } else {
    // 仅预览，不上传
    file.url = URL.createObjectURL(file.raw)
    file.status = 'success'
  }
}

const defaultUpload = async (file: UploadFile) => {
  if (!file.raw || !props.action) return
  
  const formData = new FormData()
  formData.append('file', file.raw)
  
  // 添加额外数据
  if (props.data) {
    Object.entries(props.data).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }
  
  const xhr = new XMLHttpRequest()
  
  return new Promise<void>((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        file.percent = percent
        emit('upload-progress', file, percent)
      }
    })
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          file.url = response.url || response.data?.url
          file.status = 'success'
          emit('upload-success', file, response)
          resolve()
        } catch (error) {
          file.status = 'error'
          file.error = '响应解析失败'
          reject(error)
        }
      } else {
        file.status = 'error'
        file.error = `上传失败: ${xhr.status}`
        reject(new Error(file.error))
      }
    })
    
    xhr.addEventListener('error', () => {
      file.status = 'error'
      file.error = '网络错误'
      reject(new Error(file.error))
    })
    
    xhr.open(props.method, props.action)
    
    // 设置请求头
    if (props.headers) {
      Object.entries(props.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })
    }
    
    xhr.withCredentials = props.withCredentials
    xhr.send(formData)
  })
}

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
    updateValue()
    emit('remove', file)
  }
}

const handlePreview = (file: UploadFile) => {
  if (isImageFile(file) && file.url) {
    previewUrl.value = file.url
    previewTitle.value = file.name
    previewVisible.value = true
  }
  emit('preview', file)
}

const handleDownload = (file: UploadFile) => {
  if (file.url) {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.click()
  }
  emit('download', file)
}

const closePreview = () => {
  previewVisible.value = false
  previewUrl.value = ''
  previewTitle.value = ''
}

const isAcceptedFile = (file: File): boolean => {
  if (!props.accept) return true
  
  const acceptTypes = props.accept.split(',').map(type => type.trim())
  return acceptTypes.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    return file.type.match(type.replace('*', '.*'))
  })
}

const isImageFile = (file: UploadFile): boolean => {
  return file.type?.startsWith('image/') || false
}

const updateValue = () => {
  emit('update:value', [...fileList.value])
  emit('change', [...fileList.value])
}

// 监听外部值变化
watch(() => props.value, (newValue) => {
  fileList.value = [...newValue]
}, { deep: true })

// 暴露方法
defineExpose({
  upload: () => inputRef.value?.click(),
  clear: () => {
    fileList.value = []
    updateValue()
  }
})
</script>

<style lang="less">
.l-form-upload {
  &__input {
    display: none;
  }
  
  &__area {
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    
    &--drag {
      border: 2px dashed var(--border-color, #d9d9d9);
      border-radius: 4px;
      padding: 24px;
      text-align: center;
      background-color: var(--background-color-light, #fafafa);
      
      &:hover,
      &.l-form-upload__area--dragging {
        border-color: var(--primary-color, #1890ff);
        background-color: rgba(24, 144, 255, 0.05);
      }
    }
  }
  
  &__button {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 4px;
    background-color: var(--background-color, #ffffff);
    color: var(--text-color-primary, #262626);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    
    &:hover {
      border-color: var(--primary-color, #1890ff);
      color: var(--primary-color, #1890ff);
    }
    
    .l-form-upload__icon {
      margin-right: 8px;
    }
  }
  
  &__drag {
    &-icon {
      font-size: 48px;
      color: var(--border-color, #d9d9d9);
      margin-bottom: 16px;
    }
    
    &-text {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: var(--text-color-primary, #262626);
    }
    
    &-hint {
      margin: 0;
      font-size: 14px;
      color: var(--text-color-secondary, #8c8c8c);
    }
  }
  
  &__picture-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 104px;
    height: 104px;
    border: 1px dashed var(--border-color, #d9d9d9);
    border-radius: 4px;
    background-color: var(--background-color-light, #fafafa);
    transition: all 0.2s ease-in-out;
    
    &:hover {
      border-color: var(--primary-color, #1890ff);
    }
    
    .l-form-upload__icon {
      font-size: 24px;
      color: var(--text-color-secondary, #8c8c8c);
      margin-bottom: 8px;
    }
    
    span {
      font-size: 14px;
      color: var(--text-color-secondary, #8c8c8c);
    }
  }
  
  &__list {
    margin-top: 16px;
  }
  
  &__item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color-light, #f0f0f0);
    
    &:last-child {
      border-bottom: none;
    }
    
    &--picture-card {
      display: inline-block;
      width: 104px;
      height: 104px;
      margin: 0 8px 8px 0;
      border: 1px solid var(--border-color, #d9d9d9);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    &-icon {
      margin-right: 8px;
      color: var(--text-color-secondary, #8c8c8c);
      
      .l-icon-loading {
        animation: l-upload-spin 1s linear infinite;
      }
      
      .l-icon-error {
        color: var(--error-color, #ff4d4f);
      }
    }
    
    &-info {
      flex: 1;
      min-width: 0;
    }
    
    &-name {
      font-size: 14px;
      color: var(--text-color-primary, #262626);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    &-progress {
      margin-top: 4px;
      height: 2px;
      background-color: var(--background-color-light, #fafafa);
      border-radius: 1px;
      overflow: hidden;
      
      &-bar {
        height: 100%;
        background-color: var(--primary-color, #1890ff);
        transition: width 0.3s ease;
      }
    }
    
    &-error {
      margin-top: 4px;
      font-size: 12px;
      color: var(--error-color, #ff4d4f);
    }
    
    &-preview {
      width: 100%;
      height: 100%;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    &-actions {
      display: flex;
      gap: 8px;
      
      .l-form-upload__item--picture-card & {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        
        .l-form-upload__item:hover & {
          opacity: 1;
        }
      }
    }
    
    &-action {
      border: none;
      background: none;
      color: var(--text-color-secondary, #8c8c8c);
      cursor: pointer;
      padding: 4px;
      border-radius: 2px;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--primary-color, #1890ff);
        background-color: rgba(24, 144, 255, 0.1);
      }
      
      &--remove:hover {
        color: var(--error-color, #ff4d4f);
        background-color: rgba(255, 77, 79, 0.1);
      }
      
      .l-form-upload__item--picture-card & {
        color: white;
        
        &:hover {
          color: var(--primary-color, #1890ff);
        }
        
        &--remove:hover {
          color: var(--error-color, #ff4d4f);
        }
      }
    }
  }
  
  &__preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  &__preview-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
  
  &__preview-title {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 14px;
    white-space: nowrap;
  }
  
  &__preview-close {
    position: absolute;
    top: -40px;
    right: 0;
    border: none;
    background: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    
    &:hover {
      color: var(--primary-color, #1890ff);
    }
  }
  
  // 状态样式
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .l-form-upload__area,
    .l-form-upload__button,
    .l-form-upload__picture-card {
      cursor: not-allowed;
      pointer-events: none;
    }
  }
  
  &--readonly {
    .l-form-upload__area {
      display: none;
    }
  }
  
  &--dragging {
    .l-form-upload__area--drag {
      border-color: var(--primary-color, #1890ff);
      background-color: rgba(24, 144, 255, 0.05);
    }
  }
}

// 列表动画
.l-upload-list-enter-active,
.l-upload-list-leave-active {
  transition: all 0.3s ease;
}

.l-upload-list-enter-from,
.l-upload-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 旋转动画
@keyframes l-upload-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
