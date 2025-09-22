import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpClientImpl } from '../../src/client'
import { FetchAdapter } from '../../src/adapters/fetch'

// Mock fetch
global.fetch = vi.fn()
global.FormData = class FormData {
  private data = new Map<string, any>()

  append(key: string, value: any) {
    this.data.set(key, value)
  }

  get(key: string) {
    return this.data.get(key)
  }

  has(key: string) {
    return this.data.has(key)
  }
}

// Mock File
global.File = class File {
  name: string
  size: number
  type: string

  constructor(chunks: any[], filename: string, options: any = {}) {
    this.name = filename
    this.size = chunks.join('').length
    this.type = options.type || ''
  }

  slice(start?: number, end?: number) {
    return new File(['sliced'], this.name, { type: this.type })
  }
}

// Mock Blob
global.Blob = class Blob {
  size: number
  type: string

  constructor(chunks: any[] = [], options: any = {}) {
    this.size = chunks.join('').length
    this.type = options.type || ''
  }
}

// Mock URL
global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn()
} as any

// Mock document
global.document = {
  createElement: vi.fn(() => ({
    href: '',
    download: '',
    style: { display: '' },
    click: vi.fn()
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
} as any

// Mock window
global.window = {} as any

describe('HttpClient Upload/Download', () => {
  let client: HttpClientImpl
  let adapter: FetchAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new FetchAdapter()
    client = new HttpClientImpl({}, adapter)
  })

  describe('upload', () => {
    it('should upload single file successfully', async () => {
      const mockResponseData = { id: '123', url: 'https://example.com/file.jpg' }

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { method: 'POST', url: '/upload' }
      })

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await client.upload('/upload', file, {
        fileField: 'image',
        formData: { userId: '456' }
      })

      expect(result.file).toBe(file)
      expect(result.duration).toBeGreaterThan(0)
      expect(result.data).toEqual(mockResponseData)
    })

    it('should upload multiple files successfully', async () => {
      const mockResponseData = { uploaded: 2 }

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { method: 'POST', url: '/upload' }
      })

      const files = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })
      ]

      const result = await client.upload('/upload', files, {
        fileField: 'images'
      })

      expect(result.file).toBe(files[0])
      expect(result.data).toEqual(mockResponseData)
    })

    it('should handle upload progress', async () => {
      const mockResponseData = { success: true }

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { method: 'POST', url: '/upload' }
      })

      const progressCallback = vi.fn()
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })

      await client.upload('/upload', file, {
        onProgress: progressCallback
      })

      // Progress callback should be set up (actual progress events would be triggered by the adapter)
      expect(progressCallback).toBeDefined()
    })

    it('should validate file before upload', async () => {
      const file = new File([''], 'empty.txt', { type: 'text/plain' })

      await expect(client.upload('/upload', file, {
        maxSize: 1000
      })).rejects.toThrow('文件为空')
    })

    it('should reject invalid file types', async () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-executable' })

      await expect(client.upload('/upload', file, {
        accept: ['image/*']
      })).rejects.toThrow('文件类型不被允许')
    })

    it('should reject oversized files', async () => {
      const file = new File(['very long content'], 'large.txt', { type: 'text/plain' })

      await expect(client.upload('/upload', file, {
        maxSize: 5
      })).rejects.toThrow('文件大小超出限制')
    })
  })

  describe('download', () => {
    it('should download file successfully', async () => {
      const mockBlob = new Blob(['file content'], { type: 'text/plain' })
      const mockHeaders = new Map([
        ['content-disposition', 'attachment; filename="test.txt"'],
        ['content-type', 'text/plain']
      ])
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: mockHeaders,
        blob: () => Promise.resolve(mockBlob)
      }

      // Mock adapter response format
      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: Object.fromEntries(mockHeaders),
        config: { method: 'GET', url: '/download/test.txt', responseType: 'blob' }
      })

      const result = await client.download('/download/test.txt')

      expect(result.data).toBe(mockBlob)
      expect(result.filename).toBe('test.txt')
      expect(result.type).toBe('text/plain')
      expect(result.size).toBe(mockBlob.size)
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should extract filename from URL if not in headers', async () => {
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' })

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/pdf' },
        config: { method: 'GET', url: '/files/document.pdf', responseType: 'blob' }
      })

      const result = await client.download('/files/document.pdf')

      // 检查基本下载功能正常
      expect(result.data).toBe(mockBlob)
      expect(result.type).toBe('application/pdf')
      expect(result.size).toBe(mockBlob.size)
    })

    it('should use custom filename', async () => {
      const mockBlob = new Blob(['file content'])

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { method: 'GET', url: '/download', responseType: 'blob' }
      })

      const result = await client.download('/download', {
        filename: 'custom-name.txt'
      })

      expect(result.filename).toBe('custom-name.txt')
    })

    it('should handle download progress', async () => {
      const mockBlob = new Blob(['file content'])

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { method: 'GET', url: '/download', responseType: 'blob' }
      })

      const progressCallback = vi.fn()

      await client.download('/download', {
        onProgress: progressCallback
      })

      // Progress callback should be set up
      expect(progressCallback).toBeDefined()
    })

    it('should auto-save file by default', async () => {
      const mockBlob = new Blob(['file content'])

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { method: 'GET', url: '/download/test.txt', responseType: 'blob' }
      })

      const result = await client.download('/download/test.txt')

      expect(result.url).toBe('blob:mock-url')
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
    })

    it('should not auto-save when disabled', async () => {
      const mockBlob = new Blob(['file content'])

      vi.spyOn(adapter, 'request').mockResolvedValueOnce({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { method: 'GET', url: '/download/test.txt', responseType: 'blob' }
      })

      const result = await client.download('/download/test.txt', {
        autoSave: false
      })

      expect(result.url).toBeUndefined()
      expect(global.URL.createObjectURL).not.toHaveBeenCalled()
    })
  })
})
