import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getFilenameFromResponse,
  getFilenameFromURL,
  getMimeTypeFromFilename,
  createDownloadChunks,
  mergeDownloadChunks,
  supportsRangeRequests,
  createRangeHeader,
  parseContentRange,
  formatDownloadSpeed,
  formatTimeRemaining,
  isPreviewableFile,
  DownloadProgressCalculator,
} from '../../../src/utils/download'

describe('Download Utils', () => {
  describe('getFilenameFromResponse', () => {
    it('should extract filename from Content-Disposition header', () => {
      expect(getFilenameFromResponse({
        'content-disposition': 'attachment; filename="test.pdf"'
      })).toBe('test.pdf')
      
      expect(getFilenameFromResponse({
        'Content-Disposition': 'attachment; filename=document.docx'
      })).toBe('document.docx')
      
      expect(getFilenameFromResponse({
        'content-disposition': 'attachment; filename*=UTF-8\'\'%E6%96%87%E6%A1%A3.pdf'
      })).toBe('文档.pdf')
    })

    it('should return null for invalid headers', () => {
      expect(getFilenameFromResponse({})).toBe(null)
      expect(getFilenameFromResponse({
        'content-disposition': 'attachment'
      })).toBe(null)
    })
  })

  describe('getFilenameFromURL', () => {
    it('should extract filename from URL', () => {
      expect(getFilenameFromURL('https://example.com/files/document.pdf')).toBe('document.pdf')
      expect(getFilenameFromURL('https://example.com/files/image.jpg?v=1')).toBe('image.jpg')
      expect(getFilenameFromURL('https://example.com/api/download')).toBe('download')
      expect(getFilenameFromURL('invalid-url')).toBe('download')
    })
  })

  describe('getMimeTypeFromFilename', () => {
    it('should return correct MIME types', () => {
      expect(getMimeTypeFromFilename('document.pdf')).toBe('application/pdf')
      expect(getMimeTypeFromFilename('image.jpg')).toBe('image/jpeg')
      expect(getMimeTypeFromFilename('video.mp4')).toBe('video/mp4')
      expect(getMimeTypeFromFilename('audio.mp3')).toBe('audio/mpeg')
      expect(getMimeTypeFromFilename('data.json')).toBe('application/json')
      expect(getMimeTypeFromFilename('unknown.xyz')).toBe('application/octet-stream')
    })
  })

  describe('createDownloadChunks', () => {
    it('should create download chunks correctly', () => {
      const totalSize = 1000
      const chunkSize = 300
      
      const chunks = createDownloadChunks(totalSize, chunkSize)
      
      expect(chunks).toHaveLength(4) // 1000 / 300 = 3.33, so 4 chunks
      expect(chunks[0]).toEqual({
        index: 0,
        start: 0,
        end: 299,
        size: 300,
        completed: false
      })
      expect(chunks[3]).toEqual({
        index: 3,
        start: 900,
        end: 999,
        size: 100,
        completed: false
      })
    })
  })

  describe('mergeDownloadChunks', () => {
    it('should merge chunks correctly', () => {
      const chunk1Data = new ArrayBuffer(3)
      const chunk1View = new Uint8Array(chunk1Data)
      chunk1View.set([1, 2, 3])
      
      const chunk2Data = new ArrayBuffer(2)
      const chunk2View = new Uint8Array(chunk2Data)
      chunk2View.set([4, 5])
      
      const chunks = [
        {
          index: 0,
          start: 0,
          end: 2,
          size: 3,
          data: chunk1Data,
          completed: true
        },
        {
          index: 1,
          start: 3,
          end: 4,
          size: 2,
          data: chunk2Data,
          completed: true
        }
      ]
      
      const merged = mergeDownloadChunks(chunks)
      const mergedView = new Uint8Array(merged)
      
      expect(mergedView).toEqual(new Uint8Array([1, 2, 3, 4, 5]))
    })
  })

  describe('supportsRangeRequests', () => {
    it('should detect range support correctly', () => {
      expect(supportsRangeRequests({ 'accept-ranges': 'bytes' })).toBe(true)
      expect(supportsRangeRequests({ 'Accept-Ranges': 'bytes' })).toBe(true)
      expect(supportsRangeRequests({ 'accept-ranges': 'none' })).toBe(false)
      expect(supportsRangeRequests({})).toBe(false)
    })
  })

  describe('createRangeHeader', () => {
    it('should create range headers correctly', () => {
      expect(createRangeHeader(0, 499)).toBe('bytes=0-499')
      expect(createRangeHeader(500)).toBe('bytes=500-')
    })
  })

  describe('parseContentRange', () => {
    it('should parse Content-Range header correctly', () => {
      const result = parseContentRange('bytes 200-1023/1024')
      expect(result).toEqual({
        start: 200,
        end: 1023,
        total: 1024
      })
      
      expect(parseContentRange('invalid')).toBe(null)
    })
  })

  describe('formatDownloadSpeed', () => {
    it('should format download speeds correctly', () => {
      expect(formatDownloadSpeed(1024)).toBe('1.0 KB/s')
      expect(formatDownloadSpeed(1024 * 1024)).toBe('1.0 MB/s')
      expect(formatDownloadSpeed(1536)).toBe('1.5 KB/s')
      expect(formatDownloadSpeed(500)).toBe('500.0 B/s')
    })
  })

  describe('formatTimeRemaining', () => {
    it('should format time remaining correctly', () => {
      expect(formatTimeRemaining(30)).toBe('30秒')
      expect(formatTimeRemaining(90)).toBe('1分30秒')
      expect(formatTimeRemaining(3661)).toBe('1小时1分钟')
      expect(formatTimeRemaining(-1)).toBe('未知')
      expect(formatTimeRemaining(Infinity)).toBe('未知')
    })
  })

  describe('isPreviewableFile', () => {
    it('should detect previewable files correctly', () => {
      expect(isPreviewableFile('image.jpg')).toBe(true)
      expect(isPreviewableFile('document.pdf')).toBe(true)
      expect(isPreviewableFile('video.mp4')).toBe(true)
      expect(isPreviewableFile('audio.mp3')).toBe(true)
      expect(isPreviewableFile('data.json')).toBe(true)
      expect(isPreviewableFile('archive.zip')).toBe(false)
      expect(isPreviewableFile('binary.exe')).toBe(false)
    })
  })

  describe('DownloadProgressCalculator', () => {
    let calculator: DownloadProgressCalculator

    beforeEach(() => {
      calculator = new DownloadProgressCalculator()
      vi.useFakeTimers()
    })

    it('should calculate download progress correctly', () => {
      const progress1 = calculator.calculate(50, 100, 'test.pdf')
      expect(progress1.percentage).toBe(50)
      expect(progress1.loaded).toBe(50)
      expect(progress1.total).toBe(100)
      expect(progress1.filename).toBe('test.pdf')
      
      vi.advanceTimersByTime(1000)
      
      const progress2 = calculator.calculate(75, 100, 'test.pdf')
      expect(progress2.percentage).toBe(75)
      expect(progress2.speed).toBeGreaterThan(0)
    })

    it('should reset correctly', () => {
      calculator.calculate(50, 100)
      calculator.reset()
      
      const progress = calculator.calculate(25, 100)
      expect(progress.percentage).toBe(25)
    })

    it('should handle zero total correctly', () => {
      const progress = calculator.calculate(0, 0)
      expect(progress.percentage).toBe(0)
      expect(progress.timeRemaining).toBe(0)
    })
  })
})
