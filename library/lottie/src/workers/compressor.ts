/**
 * 数据压缩器
 * 使用 Compression Streams API 进行数据压缩
 */

export interface CompressionOptions {
  format?: 'gzip' | 'deflate' | 'deflate-raw'
  level?: number
}

/**
 * 压缩数据
 */
export async function compressData(
  data: any,
  options?: CompressionOptions
): Promise<ArrayBuffer> {
  const format = options?.format || 'gzip'

  // 检查浏览器支持
  if (typeof CompressionStream === 'undefined') {
    throw new Error('CompressionStream API not supported')
  }

  // 将数据转换为字符串
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data)
  
  // 编码为字节
  const encoder = new TextEncoder()
  const bytes = encoder.encode(jsonString)

  // 创建流
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    }
  })

  // 压缩流
  const compressionStream = stream.pipeThrough(
    new CompressionStream(format)
  )

  // 读取压缩后的数据
  const chunks: Uint8Array[] = []
  const reader = compressionStream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  // 合并所有 chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result.buffer
}

/**
 * 解压缩数据
 */
export async function decompressData(
  buffer: ArrayBuffer,
  options?: CompressionOptions
): Promise<any> {
  const format = options?.format || 'gzip'

  // 检查浏览器支持
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream API not supported')
  }

  // 创建流
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(buffer))
      controller.close()
    }
  })

  // 解压缩流
  const decompressionStream = stream.pipeThrough(
    new DecompressionStream(format)
  )

  // 读取解压缩后的数据
  const chunks: Uint8Array[] = []
  const reader = decompressionStream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  // 合并所有 chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  // 解码为字符串
  const decoder = new TextDecoder()
  const jsonString = decoder.decode(result)

  // 解析 JSON
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error(`Failed to parse decompressed data: ${error}`)
  }
}

/**
 * 计算压缩比
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0
  return Math.round((1 - compressedSize / originalSize) * 100)
}

/**
 * 估算压缩后大小
 */
export function estimateCompressedSize(data: any): number {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data)
  const originalSize = new Blob([jsonString]).size
  
  // 通常 JSON 数据的 gzip 压缩比在 60-80% 之间
  // 这里返回保守估计
  return Math.round(originalSize * 0.3)
}


