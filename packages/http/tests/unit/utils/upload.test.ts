import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateFile,
  formatFileSize,
  getFileExtension,
  createFileChunks,
  createUploadFormData,
  ProgressCalculator,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  FileValidationError,
} from '../../../src/utils/upload'

describe('Upload Utils', () => {
  describe('validateFile', () => {
    it('should validate file type correctly', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      
      expect(() => {
        validateFile(file, { accept: ['image/*'] })
      }).not.toThrow()
      
      expect(() => {
        validateFile(file, { accept: ['.jpg'] })
      }).not.toThrow()
      
      expect(() => {
        validateFile(file, { accept: ['text/*'] })
      }).toThrow(FileValidationError)
    })

    it('should validate file size correctly', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      expect(() => {
        validateFile(file, { maxSize: 1000 })
      }).not.toThrow()
      
      expect(() => {
        validateFile(file, { maxSize: 5 })
      }).toThrow(FileValidationError)
    })

    it('should reject empty files', () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' })
      
      expect(() => {
        validateFile(file, {})
      }).toThrow(FileValidationError)
    })
  })

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg')
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('archive.tar.gz')).toBe('gz')
      expect(getFileExtension('noextension')).toBe('')
    })
  })

  describe('createFileChunks', () => {
    it('should create file chunks correctly', () => {
      const content = 'a'.repeat(1000)
      const file = new File([content], 'test.txt', { type: 'text/plain' })
      const chunkSize = 300
      
      const chunks = createFileChunks(file, chunkSize)
      
      expect(chunks).toHaveLength(4) // 1000 / 300 = 3.33, so 4 chunks
      expect(chunks[0].size).toBe(300)
      expect(chunks[1].size).toBe(300)
      expect(chunks[2].size).toBe(300)
      expect(chunks[3].size).toBe(100) // remaining
      
      chunks.forEach((chunk, index) => {
        expect(chunk.index).toBe(index)
        expect(chunk.start).toBe(index * chunkSize)
      })
    })
  })

  describe('createUploadFormData', () => {
    it('should create form data for single file upload', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const config = {
        fileField: 'upload',
        formData: { userId: '123' }
      }
      
      const formData = createUploadFormData(file, config)
      
      expect(formData.get('upload')).toBe(file)
      expect(formData.get('userId')).toBe('123')
      expect(formData.get('fileName')).toBe('test.txt')
      expect(formData.get('fileSize')).toBe('7')
      expect(formData.get('fileType')).toBe('text/plain')
    })

    it('should create form data for chunked upload', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const chunkInfo = {
        index: 0,
        chunk: file.slice(0, 3),
        size: 3,
        start: 0,
        end: 3,
        fileHash: 'abc123'
      }
      
      const formData = createUploadFormData(file, { chunkSize: 3 }, chunkInfo)
      
      expect(formData.get('chunkIndex')).toBe('0')
      expect(formData.get('fileHash')).toBe('abc123')
    })
  })

  describe('ProgressCalculator', () => {
    let calculator: ProgressCalculator

    beforeEach(() => {
      calculator = new ProgressCalculator()
      vi.useFakeTimers()
    })

    it('should calculate progress correctly', () => {
      const file = new File(['content'], 'test.txt')
      
      const progress1 = calculator.calculate(50, 100, file)
      expect(progress1.percentage).toBe(50)
      expect(progress1.loaded).toBe(50)
      expect(progress1.total).toBe(100)
      expect(progress1.file).toBe(file)
      
      vi.advanceTimersByTime(1000)
      
      const progress2 = calculator.calculate(75, 100, file)
      expect(progress2.percentage).toBe(75)
      expect(progress2.speed).toBeGreaterThan(0)
    })

    it('should reset correctly', () => {
      calculator.calculate(50, 100)
      calculator.reset()
      
      const progress = calculator.calculate(25, 100)
      expect(progress.percentage).toBe(25)
    })
  })

  describe('File type detection', () => {
    it('should detect image files', () => {
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      
      expect(isImageFile(imageFile)).toBe(true)
      expect(isImageFile(textFile)).toBe(false)
    })

    it('should detect video files', () => {
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' })
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      
      expect(isVideoFile(videoFile)).toBe(true)
      expect(isVideoFile(textFile)).toBe(false)
    })

    it('should detect audio files', () => {
      const audioFile = new File([''], 'test.mp3', { type: 'audio/mpeg' })
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      
      expect(isAudioFile(audioFile)).toBe(true)
      expect(isAudioFile(textFile)).toBe(false)
    })

    it('should detect document files', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' })
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      const imageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      
      expect(isDocumentFile(pdfFile)).toBe(true)
      expect(isDocumentFile(textFile)).toBe(true)
      expect(isDocumentFile(imageFile)).toBe(false)
    })
  })

  describe('FileValidationError', () => {
    it('should create error with correct properties', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      const error = new FileValidationError('Test error', file, 'TYPE_NOT_ALLOWED')
      
      expect(error.message).toBe('Test error')
      expect(error.file).toBe(file)
      expect(error.code).toBe('TYPE_NOT_ALLOWED')
      expect(error.name).toBe('FileValidationError')
    })
  })
})
