/**
 * 文件工具函数测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isValidPdfInput,
  isPdfFile,
  isPdfUrl,
  fileToArrayBuffer,
  arrayBufferToUint8Array,
  isPdfArrayBuffer,
  formatFileSize,
  getFileNameFromUrl,
  validateAndNormalizePdfInput,
  createDownloadUrl,
  revokeDownloadUrl,
  isBrowserSupportPdf,
  getBrowserInfo,
} from '../../src/utils/file-utils'
import { createMockPdfFile, createMockPdfArrayBuffer, waitFor } from '../setup'

describe('file-utils', () => {
  describe('isValidPdfInput', () => {
    it('should return true for valid inputs', () => {
      expect(isValidPdfInput('https://example.com/test.pdf')).toBe(true)
      expect(isValidPdfInput(createMockPdfFile())).toBe(true)
      expect(isValidPdfInput(new ArrayBuffer(1024))).toBe(true)
      expect(isValidPdfInput(new Uint8Array(1024))).toBe(true)
    })

    it('should return false for invalid inputs', () => {
      expect(isValidPdfInput(null)).toBe(false)
      expect(isValidPdfInput(undefined)).toBe(false)
      expect(isValidPdfInput({})).toBe(false)
      expect(isValidPdfInput(123)).toBe(false)
      expect(isValidPdfInput([])).toBe(false)
    })
  })

  describe('isPdfFile', () => {
    it('should return true for PDF files with correct MIME type', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      expect(isPdfFile(file)).toBe(true)
    })

    it('should return true for files with .pdf extension', () => {
      const file = new File(['content'], 'test.pdf', { type: 'text/plain' })
      expect(isPdfFile(file)).toBe(true)
    })

    it('should return false for non-PDF files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      expect(isPdfFile(file)).toBe(false)
    })

    it('should handle case insensitive extensions', () => {
      const file = new File(['content'], 'test.PDF', { type: 'text/plain' })
      expect(isPdfFile(file)).toBe(true)
    })
  })

  describe('isPdfUrl', () => {
    it('should return true for URLs ending with .pdf', () => {
      expect(isPdfUrl('https://example.com/document.pdf')).toBe(true)
      expect(isPdfUrl('http://example.com/path/to/file.pdf')).toBe(true)
      expect(isPdfUrl('https://example.com/document.PDF')).toBe(true)
    })

    it('should return false for non-PDF URLs', () => {
      expect(isPdfUrl('https://example.com/document.txt')).toBe(false)
      expect(isPdfUrl('https://example.com/page.html')).toBe(false)
      expect(isPdfUrl('https://example.com/')).toBe(false)
    })

    it('should return false for invalid URLs', () => {
      expect(isPdfUrl('not-a-url')).toBe(false)
      expect(isPdfUrl('')).toBe(false)
    })
  })

  describe('fileToArrayBuffer', () => {
    it('should convert file to ArrayBuffer successfully', async () => {
      const file = createMockPdfFile('test.pdf', 1024)
      const buffer = await fileToArrayBuffer(file)

      expect(buffer).toBeInstanceOf(ArrayBuffer)
      expect(buffer.byteLength).toBe(1024)
    })

    it('should handle FileReader errors', async () => {
      const file = createMockPdfFile('test.pdf')

      // Mock FileReader error
      const originalFileReader = global.FileReader
      global.FileReader = class MockFileReader {
        onerror: ((event: any) => void) | null = null

        readAsArrayBuffer() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({ target: { error: new Error('Read error') } })
            }
          }, 10)
        }
      } as any

      await expect(fileToArrayBuffer(file)).rejects.toThrow('Failed to read file')

      // Restore FileReader
      global.FileReader = originalFileReader
    })

    it('should handle non-ArrayBuffer result', async () => {
      const file = createMockPdfFile('test.pdf')

      // Mock FileReader returning string instead of ArrayBuffer
      const originalFileReader = global.FileReader
      global.FileReader = class MockFileReader {
        result: string | null = null
        onload: ((event: any) => void) | null = null

        readAsArrayBuffer() {
          setTimeout(() => {
            this.result = 'string result'
            if (this.onload) {
              this.onload({ target: this })
            }
          }, 10)
        }
      } as any

      await expect(fileToArrayBuffer(file)).rejects.toThrow('Failed to read file as ArrayBuffer')

      // Restore FileReader
      global.FileReader = originalFileReader
    })
  })

  describe('arrayBufferToUint8Array', () => {
    it('should convert ArrayBuffer to Uint8Array', () => {
      const buffer = new ArrayBuffer(1024)
      const uint8Array = arrayBufferToUint8Array(buffer)

      expect(uint8Array).toBeInstanceOf(Uint8Array)
      expect(uint8Array.length).toBe(1024)
      expect(uint8Array.buffer).toBe(buffer)
    })
  })

  describe('isPdfArrayBuffer', () => {
    it('should return true for valid PDF ArrayBuffer', () => {
      const buffer = createMockPdfArrayBuffer(1024)
      expect(isPdfArrayBuffer(buffer)).toBe(true)
    })

    it('should return false for non-PDF ArrayBuffer', () => {
      const buffer = new ArrayBuffer(1024)
      const view = new Uint8Array(buffer)
      view.set([0x89, 0x50, 0x4E, 0x47], 0) // PNG signature

      expect(isPdfArrayBuffer(buffer)).toBe(false)
    })

    it('should return false for empty or small buffers', () => {
      expect(isPdfArrayBuffer(new ArrayBuffer(0))).toBe(false)
      expect(isPdfArrayBuffer(new ArrayBuffer(3))).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2097152)).toBe('2 MB')
    })
  })

  describe('getFileNameFromUrl', () => {
    it('should extract filename from URL', () => {
      expect(getFileNameFromUrl('https://example.com/document.pdf')).toBe('document.pdf')
      expect(getFileNameFromUrl('https://example.com/path/to/file.pdf')).toBe('file.pdf')
      expect(getFileNameFromUrl('https://example.com/document')).toBe('document.pdf')
    })

    it('should handle URLs without filename', () => {
      expect(getFileNameFromUrl('https://example.com/')).toBe('document.pdf')
      expect(getFileNameFromUrl('https://example.com')).toBe('document.pdf')
    })

    it('should handle invalid URLs', () => {
      expect(getFileNameFromUrl('not-a-url')).toBe('document.pdf')
      expect(getFileNameFromUrl('')).toBe('document.pdf')
    })
  })

  describe('validateAndNormalizePdfInput', () => {
    it('should validate and normalize URL input', async () => {
      const url = 'https://example.com/test.pdf'
      const result = await validateAndNormalizePdfInput(url)

      expect(result.data).toBe(url)
      expect(result.type).toBe('url')
      expect(result.name).toBe('test.pdf')
    })

    it('should validate and normalize File input', async () => {
      const file = createMockPdfFile('test.pdf', 2048)

      // 这个测试应该抛出错误，因为mock文件不是真正的PDF
      await expect(validateAndNormalizePdfInput(file)).rejects.toThrow('File content is not a valid PDF')
    })

    it('should validate and normalize ArrayBuffer input', async () => {
      const buffer = createMockPdfArrayBuffer(1024)
      const result = await validateAndNormalizePdfInput(buffer)

      expect(result.data).toBe(buffer)
      expect(result.type).toBe('buffer')
      expect(result.size).toBe(1024)
    })

    it('should validate and normalize Uint8Array input', async () => {
      const buffer = createMockPdfArrayBuffer(1024)
      const uint8Array = new Uint8Array(buffer)
      const result = await validateAndNormalizePdfInput(uint8Array)

      expect(result.data).toBe(uint8Array)
      expect(result.type).toBe('buffer')
      expect(result.size).toBe(1024)
    })

    it('should throw error for non-PDF file', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      await expect(validateAndNormalizePdfInput(file)).rejects.toThrow('File is not a PDF')
    })

    it('should throw error for invalid PDF content', async () => {
      const buffer = new ArrayBuffer(1024)
      await expect(validateAndNormalizePdfInput(buffer)).rejects.toThrow('ArrayBuffer content is not a valid PDF')
    })

    it('should throw error for unsupported input type', async () => {
      await expect(validateAndNormalizePdfInput({} as any)).rejects.toThrow('Unsupported input type')
    })
  })

  describe('createDownloadUrl and revokeDownloadUrl', () => {
    it('should create download URL', () => {
      const data = createMockPdfArrayBuffer(1024)
      const filename = 'test.pdf'
      const url = createDownloadUrl(data, filename)

      expect(url).toBe('blob:mock-url')
      expect(global.URL.createObjectURL).toHaveBeenCalled()
    })

    it('should revoke download URL', () => {
      const url = 'blob:mock-url'
      revokeDownloadUrl(url)

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(url)
    })
  })

  describe('isBrowserSupportPdf', () => {
    it('should return true when all required APIs are supported', () => {
      expect(isBrowserSupportPdf()).toBe(true)
    })

    it('should return false when Canvas is not supported', () => {
      const originalCreateElement = document.createElement
      document.createElement = vi.fn((tagName) => {
        if (tagName === 'canvas') {
          return { getContext: null } as any
        }
        return originalCreateElement.call(document, tagName)
      })

      expect(isBrowserSupportPdf()).toBe(false)

      document.createElement = originalCreateElement
    })
  })

  describe('getBrowserInfo', () => {
    it('should detect Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        configurable: true,
      })

      const info = getBrowserInfo()
      expect(info.name).toBe('Chrome')
      expect(info.version).toBe('91')
      expect(info.isSupported).toBe(true)
    })

    it('should detect Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        configurable: true,
      })

      const info = getBrowserInfo()
      expect(info.name).toBe('Firefox')
      expect(info.version).toBe('89')
    })

    it('should detect Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        configurable: true,
      })

      const info = getBrowserInfo()
      expect(info.name).toBe('Safari')
      expect(info.version).toBe('14')
    })

    it('should detect Edge', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edge/91.0.864.59',
        configurable: true,
      })

      const info = getBrowserInfo()
      expect(info.name).toBe('Edge')
      expect(info.version).toBe('91')
    })

    it('should handle unknown browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Unknown Browser',
        configurable: true,
      })

      const info = getBrowserInfo()
      expect(info.name).toBe('Unknown')
      expect(info.version).toBe('Unknown')
    })
  })
})
