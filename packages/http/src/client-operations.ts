/**
 * HTTP 客户端文件操作模块
 * 
 * 处理文件上传和下载相关功能
 */

import type {
  HttpClient,
  RequestConfig,
} from './types'
import type {
  DownloadConfig,
  DownloadResult,
} from './utils/download'
import type {
  UploadConfig,
  UploadResult,
} from './utils/upload'
import {
  DownloadProgressCalculator,
  getFilenameFromResponse,
  getFilenameFromURL,
  getMimeTypeFromFilename,
  saveFileToLocal,
} from './utils/download'
import { ProgressCalculator, validateFile } from './utils/upload'

/**
 * 文件操作功能接口
 */
export interface FileOperations {
  /**
   * 上传文件
   */
  upload: <T = any>(
    url: string,
    file: File | File[] | FormData,
    config?: UploadConfig,
  ) => Promise<UploadResult<T>>

  /**
   * 下载文件
   */
  download: (
    url: string,
    config?: DownloadConfig,
  ) => Promise<DownloadResult>
}

/**
 * 文件操作处理器
 */
export class FileOperationHandler implements FileOperations {
  constructor(private client: HttpClient) {}

  /**
   * 上传文件（支持多文件和进度跟踪）
   */
  async upload<T = any>(
    url: string,
    file: File | File[] | FormData,
    config: UploadConfig = {},
  ): Promise<UploadResult<T>> {
    // 处理不同的输入类型
    let formData: FormData
    let files: File[]

    if (file instanceof FormData) {
      formData = file
      // 从FormData中提取文件（用于验证）
      files = []
      for (const [, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value)
        }
      }
    }
    else {
      files = Array.isArray(file) ? file : [file]
      
      // 验证文件
      files.forEach(f => validateFile(f, config))

      // 创建表单数据
      formData = new FormData()

      // 添加所有文件
      const fileField = config.fileField || 'files'
      files.forEach((f, index) => {
        formData.append(`${fileField}[${index}]`, f)
      })

      // 添加额外的表单数据
      if (config.formData) {
        Object.entries(config.formData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }
    }

    const startTime = Date.now()
    const progressCalculator = new ProgressCalculator()

    // 配置请求
    const requestConfig: RequestConfig = {
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...(config.headers || {}),
      },
      ...(config || {}),
      onUploadProgress: config.onProgress
        ? (progressEvent: any) => {
            const progress = progressCalculator.calculate(
              progressEvent.loaded,
              progressEvent.total,
            )
            config.onProgress!(progress)
          }
        : undefined,
    }

    const response = await this.client.request<T>(requestConfig)

    return {
      ...response,
      file: files[0], // 返回第一个文件作为代表
      duration: Date.now() - startTime,
    }
  }

  /**
   * 下载文件（支持进度跟踪和自动保存）
   */
  async download(
    url: string,
    config: DownloadConfig = {},
  ): Promise<DownloadResult> {
    const startTime = Date.now()
    const progressCalculator = new DownloadProgressCalculator()

    // 配置请求
    const requestConfig: RequestConfig = {
      method: 'GET',
      url,
      responseType: 'blob',
      ...(config || {}),
      onDownloadProgress: config.onProgress
        ? (progressEvent: any) => {
            const progress = progressCalculator.calculate(
              progressEvent.loaded,
              progressEvent.total,
              config.filename,
            )
            config.onProgress!(progress)
          }
        : undefined,
    }

    const response = await this.client.request<Blob>(requestConfig)

    // 确定文件名
    let filename = config.filename
    if (!filename) {
      filename = getFilenameFromResponse(response.headers)
        || getFilenameFromURL(response.config.url || url)
        || 'download'
    }

    // 确定文件类型
    const type = response.data?.type || getMimeTypeFromFilename(filename)

    // 自动保存文件（浏览器环境）
    let downloadUrl: string | undefined
    if (config.autoSave !== false && typeof window !== 'undefined') {
      saveFileToLocal(response.data, filename)
      downloadUrl = URL.createObjectURL(response.data)
    }

    return {
      data: response.data,
      filename,
      size: response.data.size,
      type,
      duration: Date.now() - startTime,
      url: downloadUrl,
    }
  }
}

/**
 * 创建文件操作处理器
 */
export function createFileOperationHandler(client: HttpClient): FileOperationHandler {
  return new FileOperationHandler(client)
}