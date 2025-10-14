/**
 * History Manager for Cropper
 * Manages undo/redo operations for the cropper
 */

import type { Cropper } from './Cropper'

export interface HistoryState {
  data: any
  imageData: any
  containerData: any
  canvasData: any
  cropBoxData: any
  timestamp: number
}

export interface HistoryOptions {
  maxSize?: number
  autoSave?: boolean
  saveInterval?: number
}

export class HistoryManager {
  private cropper: Cropper
  private history: HistoryState[] = []
  private currentIndex: number = -1
  private options: Required<HistoryOptions>
  private autoSaveTimer: number | null = null
  private lastSaveTime: number = 0
  private listeners: Map<string, Function[]> = new Map()

  constructor(cropper: Cropper, options: HistoryOptions = {}) {
    this.cropper = cropper
    this.options = {
      maxSize: 50,
      autoSave: true,
      saveInterval: 1000,
      ...options
    }

    this.initialize()
  }

  private initialize(): void {
    // Save initial state after cropper is ready
    if (this.cropper.ready) {
      this.saveState()
    }

    // Setup auto-save if enabled
    if (this.options.autoSave) {
      this.setupAutoSave()
    }
  }

  private setupAutoSave(): void {
    // Listen to cropper events that should trigger auto-save
    const events = ['cropend', 'zoom.cropper']
    
    events.forEach(event => {
      this.cropper.element.addEventListener(event, () => {
        this.scheduleAutoSave()
      })
    })
  }

  private scheduleAutoSave(): void {
    const now = Date.now()
    
    // Don't save too frequently
    if (now - this.lastSaveTime < this.options.saveInterval) {
      // Clear existing timer
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer)
      }
      
      // Schedule save after interval
      this.autoSaveTimer = window.setTimeout(() => {
        this.saveState()
        this.autoSaveTimer = null
      }, this.options.saveInterval)
    } else {
      this.saveState()
    }
  }

  public saveState(): void {
    try {
      const state: HistoryState = {
        data: this.cropper.getData(),
        imageData: this.cropper.getImageData(),
        containerData: this.cropper.getContainerData(),
        canvasData: this.cropper.getCanvasData(),
        cropBoxData: this.cropper.getCropBoxData(),
        timestamp: Date.now()
      }

      // Remove any states after current index
      this.history = this.history.slice(0, this.currentIndex + 1)
      
      // Add new state
      this.history.push(state)
      this.currentIndex++
      
      // Limit history size
      if (this.history.length > this.options.maxSize) {
        this.history.shift()
        this.currentIndex--
      }
      
      this.lastSaveTime = Date.now()
      this.emit('change', { canUndo: this.canUndo(), canRedo: this.canRedo() })
      
    } catch (error) {
      console.error('Failed to save history state:', error)
    }
  }

  public undo(): boolean {
    if (!this.canUndo()) {
      return false
    }

    this.currentIndex--
    this.restoreState(this.history[this.currentIndex])
    this.emit('change', { canUndo: this.canUndo(), canRedo: this.canRedo() })
    return true
  }

  public redo(): boolean {
    if (!this.canRedo()) {
      return false
    }

    this.currentIndex++
    this.restoreState(this.history[this.currentIndex])
    this.emit('change', { canUndo: this.canUndo(), canRedo: this.canRedo() })
    return true
  }

  private restoreState(state: HistoryState): void {
    if (!state) return

    try {
      // Temporarily disable auto-save
      const autoSave = this.options.autoSave
      this.options.autoSave = false

      // Restore the state
      this.cropper.setData(state.data)
      this.cropper.setCanvasData(state.canvasData)
      this.cropper.setCropBoxData(state.cropBoxData)

      // Re-enable auto-save
      this.options.autoSave = autoSave
      
      this.emit('restore', state)
    } catch (error) {
      console.error('Failed to restore history state:', error)
    }
  }

  public canUndo(): boolean {
    return this.currentIndex > 0
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  public getHistory(): HistoryState[] {
    return [...this.history]
  }

  public getCurrentState(): HistoryState | null {
    return this.history[this.currentIndex] || null
  }

  public getHistorySize(): number {
    return this.history.length
  }

  public getCurrentIndex(): number {
    return this.currentIndex
  }

  public clear(): void {
    this.history = []
    this.currentIndex = -1
    this.lastSaveTime = 0
    
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
    
    this.emit('change', { canUndo: false, canRedo: false })
    this.emit('clear')
  }

  public reset(): void {
    this.clear()
    this.saveState()
  }

  // Event emitter methods
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event)
    } else {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  public destroy(): void {
    this.clear()
    this.listeners.clear()
  }

  // Export/Import history
  public exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex
    })
  }

  public importHistory(json: string): boolean {
    try {
      const data = JSON.parse(json)
      if (data.history && Array.isArray(data.history)) {
        this.history = data.history
        this.currentIndex = data.currentIndex || 0
        
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
          this.restoreState(this.history[this.currentIndex])
        }
        
        this.emit('change', { canUndo: this.canUndo(), canRedo: this.canRedo() })
        return true
      }
    } catch (error) {
      console.error('Failed to import history:', error)
    }
    return false
  }
}