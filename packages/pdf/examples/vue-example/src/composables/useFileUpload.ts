import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { FileUploadOptions, UseFileUploadReturn } from '../types'

/**
 * 文件上传组合式函数
 * @param options 上传选项
 * @returns 文件上传状态和方法
 */
export function useFileUpload(options: FileUploadOptions = {}): UseFileUploadReturn {
  // 响应式状态
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadedFiles = ref<File[]>([])
  const uploadError = ref<Error | null>(null)
  
  // 默认配置
  const config = {
    accept: '.pdf',
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    ...options
  }

  // 计算属性
  const canUpload = computed(() => !isUploading.value)
  const hasError = computed(() => uploadError.value !== null)

  /**
   * 验证文件
   */
  const validateFile = (file: File): boolean => {
    uploadError.value = null

    // 检查文件类型
    if (config.accept && !isFileTypeAccepted(file, config.accept)) {
      uploadError.value = new Error(`不支持的文件类型: ${file.type}`)
      return false
    }

    // 检查文件大小
    if (config.maxSize && file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1)
      uploadError.value = new Error(`文件大小超过限制: ${maxSizeMB}MB`)
      return false
    }

    return true
  }

  /**
   * 检查文件类型是否被接受
   */
  const isFileTypeAccepted = (file: File, accept: string): boolean => {
    const acceptTypes = accept.split(',').map(type => type.trim())
    
    return acceptTypes.some(acceptType => {
      if (acceptType.startsWith('.')) {
        // 文件扩展名匹配
        return file.name.toLowerCase().endsWith(acceptType.toLowerCase())
      } else if (acceptType.includes('*')) {
        // MIME类型通配符匹配
        const regex = new RegExp(acceptType.replace('*', '.*'))
        return regex.test(file.type)
      } else {
        // 精确MIME类型匹配
        return file.type === acceptType
      }
    })
  }

  /**
   * 模拟文件上传过程
   */
  const simulateUpload = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20
        uploadProgress.value = Math.min(progress, 100)
        
        // 触发进度回调
        if (config.onProgress) {
          config.onProgress(uploadProgress.value)
        }
        
        if (progress >= 100) {
          clearInterval(interval)
          uploadProgress.value = 100
          
          // 模拟偶尔的上传失败
          if (Math.random() < 0.1) {
            reject(new Error('上传失败: 网络错误'))
          } else {
            resolve()
          }
        }
      }, 100)
    })
  }

  /**
   * 上传单个文件
   */
  const uploadFile = async (file: File): Promise<void> => {
    if (!canUpload.value) {
      throw new Error('正在上传中，请稍候')
    }

    if (!validateFile(file)) {
      if (config.onError && uploadError.value) {
        config.onError(uploadError.value)
      }
      throw uploadError.value!
    }

    try {
      isUploading.value = true
      uploadProgress.value = 0
      uploadError.value = null

      // 模拟上传过程
      await simulateUpload(file)
      
      // 添加到已上传文件列表
      if (config.multiple) {
        uploadedFiles.value.push(file)
      } else {
        uploadedFiles.value = [file]
      }

      // 触发成功回调
      if (config.onSuccess) {
        config.onSuccess(file)
      }

    } catch (error: any) {
      uploadError.value = error
      
      // 触发错误回调
      if (config.onError) {
        config.onError(error)
      }
      
      throw error
    } finally {
      isUploading.value = false
    }
  }

  /**
   * 上传多个文件
   */
  const uploadFiles = async (files: File[]): Promise<void> => {
    if (!config.multiple && files.length > 1) {
      throw new Error('不支持多文件上传')
    }

    for (const file of files) {
      await uploadFile(file)
    }
  }

  /**
   * 取消上传
   */
  const cancelUpload = (): void => {
    if (isUploading.value) {
      isUploading.value = false
      uploadProgress.value = 0
      uploadError.value = new Error('用户取消上传')
    }
  }

  /**
   * 清除上传状态
   */
  const clearUpload = (): void => {
    isUploading.value = false
    uploadProgress.value = 0
    uploadError.value = null
    uploadedFiles.value = []
  }

  /**
   * 移除已上传的文件
   */
  const removeFile = (file: File): void => {
    const index = uploadedFiles.value.indexOf(file)
    if (index > -1) {
      uploadedFiles.value.splice(index, 1)
    }
  }

  /**
   * 获取文件信息
   */
  const getFileInfo = (file: File) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      sizeFormatted: formatFileSize(file.size)
    }
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    // 状态
    isUploading,
    uploadProgress,
    uploadedFiles: uploadedFiles as Ref<File[]>,
    uploadError: uploadError as Ref<Error | null>,
    
    // 计算属性
    canUpload,
    hasError,
    
    // 方法
    uploadFile,
    uploadFiles,
    cancelUpload,
    clearUpload,
    removeFile,
    validateFile,
    getFileInfo,
    formatFileSize
  }
}

/**
 * 拖拽上传组合式函数
 * @param targetRef 目标元素引用
 * @param options 上传选项
 * @returns 拖拽上传状态和方法
 */
export function useDragUpload(
  targetRef: Ref<HTMLElement | null>,
  options: FileUploadOptions = {}
) {
  const isDragOver = ref(false)
  const dragCounter = ref(0)
  
  const fileUpload = useFileUpload(options)

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounter.value++
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      isDragOver.value = true
    }
  }

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounter.value--
    if (dragCounter.value === 0) {
      isDragOver.value = false
    }
  }

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  /**
   * 处理文件放置
   */
  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    isDragOver.value = false
    dragCounter.value = 0
    
    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length > 0) {
      try {
        await fileUpload.uploadFiles(files)
      } catch (error) {
        console.error('拖拽上传失败:', error)
      }
    }
  }

  /**
   * 绑定拖拽事件
   */
  const bindDragEvents = () => {
    const element = targetRef.value
    if (!element) return

    element.addEventListener('dragenter', handleDragEnter)
    element.addEventListener('dragleave', handleDragLeave)
    element.addEventListener('dragover', handleDragOver)
    element.addEventListener('drop', handleDrop)
  }

  /**
   * 解绑拖拽事件
   */
  const unbindDragEvents = () => {
    const element = targetRef.value
    if (!element) return

    element.removeEventListener('dragenter', handleDragEnter)
    element.removeEventListener('dragleave', handleDragLeave)
    element.removeEventListener('dragover', handleDragOver)
    element.removeEventListener('drop', handleDrop)
  }

  return {
    ...fileUpload,
    isDragOver,
    bindDragEvents,
    unbindDragEvents
  }
}