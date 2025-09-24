/**
 * PDF文档管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PdfDocumentManager } from '../../src/core/document-manager'
import { createMockPdfFile, createMockPdfArrayBuffer, waitFor } from '../setup'

describe('PdfDocumentManager', () => {
  let documentManager: PdfDocumentManager

  beforeEach(() => {
    documentManager = new PdfDocumentManager()
  })

  afterEach(async () => {
    await documentManager.destroy()
  })

  describe('loadDocument', () => {
    it('should load document from URL', async () => {
      const url = 'https://example.com/test.pdf'
      const document = await documentManager.loadDocument(url)
      
      expect(document).toBeDefined()
      expect(document.numPages).toBe(5)
      expect(documentManager.hasDocument()).toBe(true)
    })

    it('should load document from File object', async () => {
      const file = createMockPdfFile('test.pdf', 2048)
      const document = await documentManager.loadDocument(file)
      
      expect(document).toBeDefined()
      expect(document.numPages).toBe(5)
      expect(documentManager.hasDocument()).toBe(true)
    })

    it('should load document from ArrayBuffer', async () => {
      const buffer = createMockPdfArrayBuffer(2048)
      const document = await documentManager.loadDocument(buffer)
      
      expect(document).toBeDefined()
      expect(document.numPages).toBe(5)
      expect(documentManager.hasDocument()).toBe(true)
    })

    it('should load document from Uint8Array', async () => {
      const buffer = createMockPdfArrayBuffer(2048)
      const uint8Array = new Uint8Array(buffer)
      const document = await documentManager.loadDocument(uint8Array)
      
      expect(document).toBeDefined()
      expect(document.numPages).toBe(5)
      expect(documentManager.hasDocument()).toBe(true)
    })

    it('should throw error for unsupported input type', async () => {
      await expect(documentManager.loadDocument({} as any)).rejects.toThrow('Unsupported input type')
    })

    it('should destroy previous document when loading new one', async () => {
      const url1 = 'https://example.com/test1.pdf'
      const url2 = 'https://example.com/test2.pdf'
      
      const document1 = await documentManager.loadDocument(url1)
      const destroySpy = vi.spyOn(document1, 'destroy')
      
      await documentManager.loadDocument(url2)
      
      expect(destroySpy).toHaveBeenCalled()
    })
  })

  describe('getPage', () => {
    beforeEach(async () => {
      const url = 'https://example.com/test.pdf'
      await documentManager.loadDocument(url)
    })

    it('should get page successfully', async () => {
      const page = await documentManager.getPage(1)
      
      expect(page).toBeDefined()
      expect(page.pageNumber).toBe(1)
    })

    it('should cache pages', async () => {
      const page1 = await documentManager.getPage(1)
      const page2 = await documentManager.getPage(1)
      
      expect(page1).toBe(page2)
    })

    it('should throw error for invalid page number', async () => {
      await expect(documentManager.getPage(0)).rejects.toThrow('Invalid page number: 0')
      await expect(documentManager.getPage(10)).rejects.toThrow('Invalid page number: 10')
    })

    it('should throw error when no document loaded', async () => {
      const emptyManager = new PdfDocumentManager()
      await expect(emptyManager.getPage(1)).rejects.toThrow('No document loaded')
    })
  })

  describe('getDocumentInfo', () => {
    beforeEach(async () => {
      const url = 'https://example.com/test.pdf'
      await documentManager.loadDocument(url)
    })

    it('should get document info successfully', async () => {
      const info = await documentManager.getDocumentInfo()
      
      expect(info).toBeDefined()
      expect(info.numPages).toBe(5)
      expect(info.title).toBe('Test PDF')
      expect(info.author).toBe('Test Author')
      expect(info.subject).toBe('Test Subject')
      expect(info.creator).toBe('Test Creator')
      expect(info.producer).toBe('Test Producer')
      expect(info.pdfVersion).toBe('1.7')
      expect(info.creationDate).toBeInstanceOf(Date)
      expect(info.modificationDate).toBeInstanceOf(Date)
    })

    it('should return basic info when metadata fails', async () => {
      // Mock metadata failure
      const document = documentManager.getDocument()
      if (document) {
        vi.spyOn(document, 'getMetadata').mockRejectedValue(new Error('Metadata error'))
      }
      
      const info = await documentManager.getDocumentInfo()
      
      expect(info).toBeDefined()
      expect(info.numPages).toBe(5)
      expect(info.title).toBeUndefined()
    })

    it('should throw error when no document loaded', async () => {
      const emptyManager = new PdfDocumentManager()
      await expect(emptyManager.getDocumentInfo()).rejects.toThrow('No document loaded')
    })
  })

  describe('preloadPages', () => {
    beforeEach(async () => {
      const url = 'https://example.com/test.pdf'
      await documentManager.loadDocument(url)
    })

    it('should preload pages successfully', async () => {
      await documentManager.preloadPages(1, 3)
      
      // Pages should be cached
      const page1 = await documentManager.getPage(1)
      const page2 = await documentManager.getPage(2)
      const page3 = await documentManager.getPage(3)
      
      expect(page1).toBeDefined()
      expect(page2).toBeDefined()
      expect(page3).toBeDefined()
    })

    it('should handle page range beyond document', async () => {
      await expect(documentManager.preloadPages(1, 10)).resolves.not.toThrow()
    })

    it('should do nothing when no document loaded', async () => {
      const emptyManager = new PdfDocumentManager()
      await expect(emptyManager.preloadPages(1, 3)).resolves.not.toThrow()
    })
  })

  describe('utility methods', () => {
    it('should return correct document state', () => {
      expect(documentManager.hasDocument()).toBe(false)
      expect(documentManager.getDocument()).toBeNull()
      expect(documentManager.getPageCount()).toBe(0)
    })

    it('should return correct state after loading document', async () => {
      const url = 'https://example.com/test.pdf'
      const document = await documentManager.loadDocument(url)
      
      expect(documentManager.hasDocument()).toBe(true)
      expect(documentManager.getDocument()).toBe(document)
      expect(documentManager.getPageCount()).toBe(5)
    })

    it('should clear page cache', async () => {
      const url = 'https://example.com/test.pdf'
      await documentManager.loadDocument(url)
      
      // Load a page to cache it
      await documentManager.getPage(1)
      
      // Clear cache
      documentManager.clearPageCache()
      
      // Page should be loaded again (not from cache)
      const page = await documentManager.getPage(1)
      expect(page).toBeDefined()
    })
  })

  describe('destroy', () => {
    it('should destroy document and clear cache', async () => {
      const url = 'https://example.com/test.pdf'
      const document = await documentManager.loadDocument(url)
      const destroySpy = vi.spyOn(document, 'destroy')
      
      await documentManager.destroy()
      
      expect(destroySpy).toHaveBeenCalled()
      expect(documentManager.hasDocument()).toBe(false)
      expect(documentManager.getDocument()).toBeNull()
      expect(documentManager.getPageCount()).toBe(0)
    })

    it('should handle destroy when no document loaded', async () => {
      await expect(documentManager.destroy()).resolves.not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle file reading errors', async () => {
      // Mock FileReader error
      const originalFileReader = global.FileReader
      global.FileReader = class MockFileReader {
        onerror: ((event: any) => void) | null = null
        
        readAsArrayBuffer() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror({ target: { error: new Error('File read error') } })
            }
          }, 10)
        }
      } as any
      
      const file = createMockPdfFile('test.pdf')
      
      await expect(documentManager.loadDocument(file)).rejects.toThrow('Failed to load PDF document')
      
      // Restore FileReader
      global.FileReader = originalFileReader
    })

    it('should handle PDF.js loading errors', async () => {
      // Mock PDF.js error
      const pdfjsLib = await import('pdfjs-dist')
      const originalGetDocument = pdfjsLib.getDocument
      
      vi.mocked(pdfjsLib.getDocument).mockImplementation(() => ({
        promise: Promise.reject(new Error('PDF loading error')),
      } as any))
      
      const url = 'https://example.com/invalid.pdf'
      
      await expect(documentManager.loadDocument(url)).rejects.toThrow('Failed to load PDF document')
      
      // Restore original function
      vi.mocked(pdfjsLib.getDocument).mockImplementation(originalGetDocument)
    })
  })
})
