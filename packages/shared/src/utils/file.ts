/**
 * 文件处理工具
 * 
 * @description
 * 提供文件上传、下载、图片处理、Excel/CSV 导入导出等功能。
 * 支持文件类型检测、大小限制、格式转换等。
 */

/**
 * 文件类型映射
 */
const FILE_TYPE_MAP: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
}

/**
 * 文件上传配置
 */
export interface FileUploadConfig {
  /** 允许的文件类型 */
  accept?: string[]
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 是否允许多选 */
  multiple?: boolean
  /** 上传前的处理函数 */
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  /** 上传进度回调 */
  onProgress?: (percent: number, file: File) => void
  /** 上传成功回调 */
  onSuccess?: (response: any, file: File) => void
  /** 上传失败回调 */
  onError?: (error: Error, file: File) => void
}

/**
 * 获取文件扩展名
 * 
 * @param filename - 文件名
 * @returns 文件扩展名（小写）
 * 
 * @example
 * ```typescript
 * getFileExtension('document.pdf') // 'pdf'
 * getFileExtension('image.JPEG') // 'jpeg'
 * getFileExtension('file') // ''
 * ```
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.slice(lastDotIndex + 1).toLowerCase()
}

/**
 * 获取文件类型
 * 
 * @param filename - 文件名
 * @returns 文件类型
 * 
 * @example
 * ```typescript
 * getFileType('photo.jpg') // 'image'
 * getFileType('video.mp4') // 'video'
 * getFileType('document.pdf') // 'document'
 * getFileType('unknown.xyz') // 'unknown'
 * ```
 */
export function getFileType(filename: string): string {
  const extension = getFileExtension(filename)
  
  for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
    if (extensions.includes(extension)) {
      return type
    }
  }
  
  return 'unknown'
}

/**
 * 验证文件类型
 * 
 * @param file - 文件对象
 * @param allowedTypes - 允许的文件类型
 * @returns 是否为允许的文件类型
 * 
 * @example
 * ```typescript
 * validateFileType(file, ['jpg', 'png']) // true/false
 * validateFileType(file, ['image']) // 验证是否为图片类型
 * ```
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = getFileExtension(file.name)
  const fileType = getFileType(file.name)
  
  return allowedTypes.some(type => {
    // 直接匹配扩展名
    if (type === extension) return true
    // 匹配文件类型分类
    if (FILE_TYPE_MAP[type]?.includes(extension)) return true
    return false
  })
}

/**
 * 验证文件大小
 * 
 * @param file - 文件对象
 * @param maxSize - 最大文件大小（字节）
 * @returns 是否符合大小限制
 * 
 * @example
 * ```typescript
 * validateFileSize(file, 1024 * 1024) // 限制1MB
 * validateFileSize(file, 5 * 1024 * 1024) // 限制5MB
 * ```
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * 读取文件内容
 * 
 * @param file - 文件对象
 * @param readAs - 读取方式
 * @returns Promise<读取结果>
 * 
 * @example
 * ```typescript
 * const text = await readFile(file, 'text')
 * const dataUrl = await readFile(file, 'dataURL')
 * const arrayBuffer = await readFile(file, 'arrayBuffer')
 * ```
 */
export function readFile(
  file: File,
  readAs: 'text' | 'dataURL' | 'arrayBuffer' | 'binaryString' = 'text'
): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => resolve(reader.result!)
    reader.onerror = () => reject(reader.error)
    
    switch (readAs) {
      case 'text':
        reader.readAsText(file)
        break
      case 'dataURL':
        reader.readAsDataURL(file)
        break
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file)
        break
      case 'binaryString':
        reader.readAsBinaryString(file)
        break
    }
  })
}

/**
 * 下载文件
 * 
 * @param data - 文件数据
 * @param filename - 文件名
 * @param mimeType - MIME类型
 * 
 * @example
 * ```typescript
 * downloadFile('Hello World', 'hello.txt', 'text/plain')
 * downloadFile(blob, 'image.png', 'image/png')
 * downloadFile(arrayBuffer, 'data.bin', 'application/octet-stream')
 * ```
 */
export function downloadFile(
  data: string | Blob | ArrayBuffer,
  filename: string,
  mimeType?: string
): void {
  let blob: Blob
  
  if (data instanceof Blob) {
    blob = data
  } else if (data instanceof ArrayBuffer) {
    blob = new Blob([data], { type: mimeType || 'application/octet-stream' })
  } else {
    blob = new Blob([data], { type: mimeType || 'text/plain' })
  }
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * 压缩图片
 * 
 * @param file - 图片文件
 * @param options - 压缩选项
 * @returns Promise<压缩后的文件>
 * 
 * @example
 * ```typescript
 * const compressedFile = await compressImage(file, {
 *   maxWidth: 800,
 *   maxHeight: 600,
 *   quality: 0.8
 * })
 * ```
 */
export function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    outputFormat?: 'jpeg' | 'png' | 'webp'
  } = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    outputFormat = 'jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // 设置画布尺寸
      canvas.width = width
      canvas.height = height

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${outputFormat}`,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('图片压缩失败'))
          }
        },
        `image/${outputFormat}`,
        quality
      )
    }

    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 创建文件选择器
 * 
 * @param config - 配置选项
 * @returns Promise<选择的文件>
 * 
 * @example
 * ```typescript
 * const files = await selectFiles({
 *   accept: ['image'],
 *   multiple: true,
 *   maxSize: 5 * 1024 * 1024
 * })
 * ```
 */
export function selectFiles(config: FileUploadConfig = {}): Promise<File[]> {
  const {
    accept = [],
    multiple = false,
    maxSize,
    beforeUpload,
  } = config

  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = multiple
    
    // 设置accept属性
    if (accept.length > 0) {
      const acceptString = accept.map(type => {
        if (FILE_TYPE_MAP[type]) {
          return FILE_TYPE_MAP[type].map(ext => `.${ext}`).join(',')
        }
        return type.startsWith('.') ? type : `.${type}`
      }).join(',')
      input.accept = acceptString
    }

    input.onchange = async (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || [])
      
      try {
        // 验证文件
        for (const file of files) {
          // 类型验证
          if (accept.length > 0 && !validateFileType(file, accept)) {
            throw new Error(`文件类型不支持: ${file.name}`)
          }
          
          // 大小验证
          if (maxSize && !validateFileSize(file, maxSize)) {
            throw new Error(`文件过大: ${file.name}`)
          }
          
          // 自定义验证
          if (beforeUpload) {
            const result = await beforeUpload(file)
            if (!result) {
              throw new Error(`文件验证失败: ${file.name}`)
            }
          }
        }
        
        resolve(files)
      } catch (error) {
        reject(error)
      }
    }

    input.click()
  })
}

/**
 * 数组转CSV
 * 
 * @param data - 数据数组
 * @param options - 选项
 * @returns CSV字符串
 * 
 * @example
 * ```typescript
 * const csv = arrayToCSV([
 *   { name: '张三', age: 25, city: '北京' },
 *   { name: '李四', age: 30, city: '上海' }
 * ])
 * ```
 */
export function arrayToCSV(
  data: Record<string, any>[],
  options: {
    headers?: string[]
    delimiter?: string
    includeHeaders?: boolean
  } = {}
): string {
  const {
    headers,
    delimiter = ',',
    includeHeaders = true,
  } = options

  if (data.length === 0) return ''

  const keys = headers || Object.keys(data[0])
  const rows: string[] = []

  // 添加表头
  if (includeHeaders) {
    rows.push(keys.join(delimiter))
  }

  // 添加数据行
  data.forEach(item => {
    const row = keys.map(key => {
      const value = item[key]
      // 处理包含逗号、引号或换行符的值
      if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    })
    rows.push(row.join(delimiter))
  })

  return rows.join('\n')
}

/**
 * CSV转数组
 * 
 * @param csv - CSV字符串
 * @param options - 选项
 * @returns 数据数组
 * 
 * @example
 * ```typescript
 * const data = csvToArray('name,age\n张三,25\n李四,30')
 * // [{ name: '张三', age: '25' }, { name: '李四', age: '30' }]
 * ```
 */
export function csvToArray(
  csv: string,
  options: {
    delimiter?: string
    hasHeaders?: boolean
    headers?: string[]
  } = {}
): Record<string, string>[] {
  const {
    delimiter = ',',
    hasHeaders = true,
    headers,
  } = options

  const lines = csv.trim().split('\n')
  if (lines.length === 0) return []

  let headerRow: string[]
  let dataRows: string[]

  if (hasHeaders && !headers) {
    headerRow = parseCSVRow(lines[0], delimiter)
    dataRows = lines.slice(1)
  } else {
    headerRow = headers || []
    dataRows = lines
  }

  return dataRows.map(line => {
    const values = parseCSVRow(line, delimiter)
    const item: Record<string, string> = {}
    
    headerRow.forEach((header, index) => {
      item[header] = values[index] || ''
    })
    
    return item
  })
}

/**
 * 解析CSV行
 */
function parseCSVRow(row: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    const nextChar = row[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // 跳过下一个引号
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

/**
 * 导出CSV文件
 * 
 * @param data - 数据数组
 * @param filename - 文件名
 * @param options - 选项
 * 
 * @example
 * ```typescript
 * exportCSV(data, 'users.csv', {
 *   headers: ['姓名', '年龄', '城市']
 * })
 * ```
 */
export function exportCSV(
  data: Record<string, any>[],
  filename: string,
  options?: Parameters<typeof arrayToCSV>[1]
): void {
  const csv = arrayToCSV(data, options)
  const bom = '\uFEFF' // UTF-8 BOM for Excel compatibility
  downloadFile(bom + csv, filename, 'text/csv;charset=utf-8')
}

/**
 * 获取文件的Base64编码
 * 
 * @param file - 文件对象
 * @returns Promise<Base64字符串>
 * 
 * @example
 * ```typescript
 * const base64 = await getFileBase64(file)
 *  // 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 * ```
 */
export function getFileBase64(file: File): Promise<string> {
  return readFile(file, 'dataURL') as Promise<string>
}
