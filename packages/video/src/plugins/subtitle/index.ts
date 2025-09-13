/**
 * 字幕插件
 * 实现字幕加载、解析、显示和管理功能
 */

import { OverlayPlugin } from '../../core/base-plugin'
import { createElement, addClass, removeClass, setStyle } from '../../utils/dom'
import { formatTime } from '../../utils/format'
import { generateId } from '../../utils/common'
import { SubtitleFormat } from '../../types/subtitle'
import type { PluginContext, PluginMetadata } from '../../types/plugin'
import { PlayerEvent } from '../../types/player'
import type {
  SubtitleTrack,
  SubtitleItem,
  SubtitleConfig,
  SubtitleParser
} from '../../types/subtitle'

/**
 * 字幕插件配置选项
 */
export interface SubtitleOptions {
  /** 是否启用字幕 */
  enabled?: boolean
  /** 字幕字体大小 */
  fontSize?: number
  /** 字幕字体 */
  fontFamily?: string
  /** 字幕颜色 */
  color?: string
  /** 字幕背景色 */
  backgroundColor?: string
  /** 字幕描边宽度 */
  strokeWidth?: number
  /** 字幕描边颜色 */
  strokeColor?: string
  /** 字幕位置 */
  position?: 'bottom' | 'top' | 'center'
  /** 字幕偏移量 */
  offset?: number
  /** 字幕透明度 */
  opacity?: number
  /** 字幕轨道列表 */
  tracks?: SubtitleTrack[]
  /** 默认字幕语言 */
  defaultLanguage?: string
  /** 是否自动选择字幕 */
  autoSelect?: boolean
  /** 字幕延迟（毫秒） */
  delay?: number
  /** 支持的字幕格式 */
  supportedFormats?: SubtitleFormat[]
}

/**
 * 字幕配置
 */
export interface SubtitleConfig extends SubtitleOptions {
  container: HTMLElement
  width: number
  height: number
}

/**
 * 字幕插件实现
 */
export class SubtitlePlugin extends OverlayPlugin {
  private _config: SubtitleConfig
  private _tracks: SubtitleTrack[] = []
  private _currentTrack?: SubtitleTrack
  private _currentSubtitle?: SubtitleItem
  private _subtitleElement?: HTMLElement
  private _trackSelector?: HTMLElement
  private _parsers: Map<SubtitleFormat, SubtitleParser> = new Map()

  constructor(options: SubtitleOptions = {}) {
    const metadata: PluginMetadata = {
      name: 'subtitle',
      version: '1.0.0',
      description: '字幕插件，支持多种字幕格式和自定义样式',
      author: 'LDesign Team',
      dependencies: []
    }

    super(metadata, options)

    this._config = this.createConfig(options)
    this.initializeParsers()
  }

  /**
   * 字幕配置
   */
  get config(): SubtitleConfig {
    return { ...this._config }
  }

  /**
   * 字幕轨道列表
   */
  get trackList(): SubtitleTrack[] {
    return [...this._tracks]
  }

  /**
   * 所有字幕项目（为了兼容测试）
   */
  get tracks(): SubtitleItem[] {
    const allItems: SubtitleItem[] = []
    for (const track of this._tracks) {
      if (track.cues) {
        allItems.push(...track.cues.map(cue => ({
          id: cue.id,
          startTime: cue.startTime,
          endTime: cue.endTime,
          text: cue.text
        })))
      }
    }
    return allItems
  }

  /**
   * 当前字幕轨道
   */
  get currentTrack(): SubtitleTrack | undefined {
    return this._currentTrack
  }



  /**
   * 当前显示的字幕
   */
  get currentSubtitle(): SubtitleItem | undefined {
    return this._currentSubtitle
  }

  /**
   * 所有字幕项目（来自所有轨道）
   */
  get items(): SubtitleItem[] {
    const allItems: SubtitleItem[] = []
    for (const track of this._tracks) {
      if (track.cues) {
        allItems.push(...track.cues.map(cue => ({
          id: cue.id,
          startTime: cue.startTime,
          endTime: cue.endTime,
          text: cue.text
        })))
      }
    }
    return allItems
  }

  /**
   * 加载字幕内容
   */
  async loadSubtitle(content: string, format: SubtitleFormat | string, language = 'unknown'): Promise<void> {
    const subtitleFormat = typeof format === 'string' ?
      (format.toLowerCase() === 'srt' ? SubtitleFormat.SRT :
        format.toLowerCase() === 'vtt' ? SubtitleFormat.VTT :
          format.toLowerCase() === 'ass' ? SubtitleFormat.ASS : SubtitleFormat.SRT) : format

    const parser = this._parsers.get(subtitleFormat)
    if (!parser) {
      throw new Error(`Unsupported subtitle format: ${subtitleFormat}`)
    }

    const items = parser.parse(content)
    const track: SubtitleTrack = {
      id: generateId('subtitle-track'),
      label: `${language} (${subtitleFormat})`,
      language,
      format: subtitleFormat,
      cues: items.map(item => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        text: item.text
      }))
    }

    await this.addTrack(track)
  }

  /**
   * 添加字幕轨道
   */
  async addTrack(track: SubtitleTrack): Promise<void> {
    // 检查轨道是否已存在
    const existingTrack = this._tracks.find(t => t.id === track.id)
    if (existingTrack) {
      throw new Error(`Subtitle track "${track.id}" already exists`)
    }

    // 加载字幕数据
    if (track.src && !track.items) {
      await this.loadTrackData(track)
    }

    this._tracks.push(track)
    this.updateTrackSelector()
    this.emit('trackAdded', { track })

    // 如果是第一个轨道或匹配默认语言，自动选择
    if (this._config.autoSelect && (!this._currentTrack || track.language === this._config.defaultLanguage)) {
      this.selectTrack(track.id)
    }
  }

  /**
   * 移除字幕轨道
   */
  removeTrack(trackId: string): void {
    const index = this._tracks.findIndex(t => t.id === trackId)
    if (index === -1) {
      throw new Error(`Subtitle track "${trackId}" not found`)
    }

    const track = this._tracks[index]
    this._tracks.splice(index, 1)

    // 如果移除的是当前轨道，清除显示
    if (this._currentTrack?.id === trackId) {
      this._currentTrack = undefined
      this.hideSubtitle()
    }

    this.updateTrackSelector()
    this.emit('trackRemoved', { track })
  }

  /**
   * 选择字幕轨道
   */
  selectTrack(trackId: string | null): void {
    if (trackId === null) {
      this._currentTrack = undefined
      this.hideSubtitle()
      this.emit('trackChanged', { track: null })
      return
    }

    const track = this._tracks.find(t => t.id === trackId)
    if (!track) {
      throw new Error(`Subtitle track "${trackId}" not found`)
    }

    this._currentTrack = track
    this.updateTrackSelector()
    this.emit('trackChanged', { track })
  }

  /**
   * 设置字幕延迟
   */
  setDelay(delay: number): void {
    this._config.delay = delay
    this.emit('delayChanged', { delay })
  }

  /**
   * 设置字幕样式
   */
  setStyle(style: Partial<SubtitleOptions>): void {
    Object.assign(this._config, style)
    this.updateSubtitleStyle()
    this.emit('styleChanged', { style })
  }

  /**
   * 显示字幕
   */
  showSubtitle(subtitle: SubtitleItem): void {
    if (!this._subtitleElement) return

    this._currentSubtitle = subtitle
    this._subtitleElement.innerHTML = this.formatSubtitleText(subtitle.text)
    this._subtitleElement.style.display = 'block'

    this.emit('subtitleShown', { subtitle })
  }

  /**
   * 隐藏字幕
   */
  hideSubtitle(): void {
    if (!this._subtitleElement) return

    this._currentSubtitle = undefined
    this._subtitleElement.style.display = 'none'

    this.emit('subtitleHidden')
  }

  /**
   * 切换字幕显示
   */
  toggle(): void {
    if (this._currentSubtitle) {
      this.hideSubtitle()
    } else if (this._currentTrack) {
      // 根据当前时间显示对应字幕
      const context = this.getContext()
      const currentTime = context.player.status.currentTime
      this.updateSubtitle(currentTime)
    }
  }

  protected createOverlay(): HTMLElement {
    const overlay = createElement('div', {
      className: 'lv-subtitle-overlay',
      styles: {
        position: 'absolute',
        bottom: '60px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        pointerEvents: 'none',
        zIndex: '8'
      }
    })

    // 创建字幕显示元素
    this._subtitleElement = createElement('div', {
      className: 'lv-subtitle-display',
      styles: {
        display: 'none',
        padding: this._config.backgroundColor ? '6px 12px' : '0',
        background: this._config.backgroundColor || 'transparent',
        color: this._config.color || '#ffffff',
        fontSize: `${this._config.fontSize}px`,
        fontFamily: this._config.fontFamily || 'Arial, sans-serif',
        textAlign: 'center',
        borderRadius: '4px',
        maxWidth: '80%',
        lineHeight: '1.4',
        textShadow: this._config.strokeWidth ?
          `${this._config.strokeWidth}px ${this._config.strokeWidth}px 0 ${this._config.strokeColor}` :
          '1px 1px 2px rgba(0, 0, 0, 0.8)',
        opacity: this._config.opacity?.toString() || '1'
      }
    })

    overlay.appendChild(this._subtitleElement)

    // 创建轨道选择器
    this.createTrackSelector(overlay)

    return overlay
  }

  protected async onInstall(context: PluginContext): Promise<void> {
    await super.onInstall(context)

    this._config.container = this._overlay!
    this._config.width = context.player.container.clientWidth
    this._config.height = context.player.container.clientHeight

    // 绑定播放器事件
    context.player.on(PlayerEvent.TIME_UPDATE, this.handleTimeUpdate.bind(this))

    // 加载初始字幕轨道
    if (this._config.tracks) {
      for (const track of this._config.tracks) {
        try {
          await this.addTrack(track)
        } catch (error) {
          console.warn(`Failed to load subtitle track "${track.id}":`, error)
        }
      }
    }
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    // 解绑播放器事件
    context.player.off(PlayerEvent.TIME_UPDATE, this.handleTimeUpdate.bind(this))

    await super.onUninstall(context)
  }

  /**
   * 创建配置对象
   */
  private createConfig(options: SubtitleOptions): SubtitleConfig {
    return {
      enabled: true,
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      strokeWidth: 1,
      strokeColor: '#000000',
      position: 'bottom',
      offset: 60,
      opacity: 1,
      autoSelect: true,
      delay: 0,
      supportedFormats: [SubtitleFormat.SRT, SubtitleFormat.VTT, SubtitleFormat.ASS],
      ...options,
      container: null as any,
      width: 0,
      height: 0
    }
  }

  /**
   * 初始化字幕解析器
   */
  private initializeParsers(): void {
    // SRT解析器
    this._parsers.set(SubtitleFormat.SRT, {
      parse: (content: string) => this.parseSRT(content),
      format: SubtitleFormat.SRT
    })

    // VTT解析器
    this._parsers.set(SubtitleFormat.VTT, {
      parse: (content: string) => this.parseVTT(content),
      format: SubtitleFormat.VTT
    })

    // ASS解析器
    this._parsers.set(SubtitleFormat.ASS, {
      parse: (content: string) => this.parseASS(content),
      format: SubtitleFormat.ASS
    })
  }

  /**
   * 加载字幕轨道数据
   */
  private async loadTrackData(track: SubtitleTrack): Promise<void> {
    if (!track.src) {
      throw new Error('Subtitle track source is required')
    }

    try {
      const response = await fetch(track.src)
      const content = await response.text()

      const format = this.detectFormat(content, track.src)
      const parser = this._parsers.get(format)

      if (!parser) {
        throw new Error(`Unsupported subtitle format: ${format}`)
      }

      track.items = parser.parse(content)
      track.format = format

    } catch (error) {
      throw new Error(`Failed to load subtitle track: ${(error as Error).message}`)
    }
  }

  /**
   * 检测字幕格式
   */
  private detectFormat(content: string, src: string): SubtitleFormat {
    // 根据文件扩展名检测
    const ext = src.split('.').pop()?.toLowerCase()

    switch (ext) {
      case 'srt':
        return SubtitleFormat.SRT
      case 'vtt':
        return SubtitleFormat.VTT
      case 'ass':
      case 'ssa':
        return SubtitleFormat.ASS
    }

    // 根据内容检测
    if (content.includes('WEBVTT')) {
      return SubtitleFormat.VTT
    }

    if (content.includes('[Script Info]')) {
      return SubtitleFormat.ASS
    }

    // 默认为SRT
    return SubtitleFormat.SRT
  }

  /**
   * 解析SRT字幕
   */
  private parseSRT(content: string): SubtitleItem[] {
    const items: SubtitleItem[] = []
    const blocks = content.trim().split(/\n\s*\n/)

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length < 3) continue

      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/)
      if (!timeMatch) continue

      const startTime = this.parseTimeString(timeMatch.slice(1, 5))
      const endTime = this.parseTimeString(timeMatch.slice(5, 9))
      const text = lines.slice(2).join('\n')

      items.push({
        id: generateId('subtitle'),
        startTime,
        endTime,
        text: text.trim()
      })
    }

    return items
  }

  /**
   * 解析VTT字幕
   */
  private parseVTT(content: string): SubtitleItem[] {
    const items: SubtitleItem[] = []
    const lines = content.split('\n')
    let i = 0

    // 跳过WEBVTT头部
    while (i < lines.length && !lines[i].includes('-->')) {
      i++
    }

    while (i < lines.length) {
      const line = lines[i].trim()

      if (line.includes('-->')) {
        const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/)
        if (timeMatch) {
          const startTime = this.parseTimeString(timeMatch.slice(1, 5))
          const endTime = this.parseTimeString(timeMatch.slice(5, 9))

          i++
          const textLines: string[] = []

          while (i < lines.length && lines[i].trim() !== '') {
            textLines.push(lines[i].trim())
            i++
          }

          if (textLines.length > 0) {
            items.push({
              id: generateId('subtitle'),
              startTime,
              endTime,
              text: textLines.join('\n')
            })
          }
        }
      }

      i++
    }

    return items
  }

  /**
   * 解析ASS字幕
   */
  private parseASS(content: string): SubtitleItem[] {
    const items: SubtitleItem[] = []
    const lines = content.split('\n')

    let inEvents = false
    let formatLine = ''

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed === '[Events]') {
        inEvents = true
        continue
      }

      if (trimmed.startsWith('[') && trimmed !== '[Events]') {
        inEvents = false
        continue
      }

      if (inEvents) {
        if (trimmed.startsWith('Format:')) {
          formatLine = trimmed
        } else if (trimmed.startsWith('Dialogue:')) {
          const item = this.parseASSDialogue(trimmed, formatLine)
          if (item) {
            items.push(item)
          }
        }
      }
    }

    return items
  }

  /**
   * 解析ASS对话行
   */
  private parseASSDialogue(line: string, formatLine: string): SubtitleItem | null {
    const format = formatLine.replace('Format:', '').split(',').map(s => s.trim())
    const values = line.replace('Dialogue:', '').split(',')

    const startIndex = format.indexOf('Start')
    const endIndex = format.indexOf('End')
    const textIndex = format.indexOf('Text')

    if (startIndex === -1 || endIndex === -1 || textIndex === -1) {
      return null
    }

    const startTime = this.parseASSTime(values[startIndex])
    const endTime = this.parseASSTime(values[endIndex])
    const text = values.slice(textIndex).join(',').replace(/\\N/g, '\n')

    return {
      id: generateId('subtitle'),
      startTime,
      endTime,
      text: text.trim()
    }
  }

  /**
   * 解析时间字符串
   */
  private parseTimeString(parts: string[]): number {
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    const seconds = parseInt(parts[2], 10)
    const milliseconds = parseInt(parts[3], 10)

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
  }

  /**
   * 解析ASS时间格式
   */
  private parseASSTime(timeStr: string): number {
    const parts = timeStr.split(':')
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    const secondsParts = parts[2].split('.')
    const seconds = parseInt(secondsParts[0], 10)
    const centiseconds = parseInt(secondsParts[1], 10)

    return hours * 3600 + minutes * 60 + seconds + centiseconds / 100
  }

  /**
   * 格式化字幕文本
   */
  private formatSubtitleText(text: string): string {
    // 处理HTML标签
    return text
      .replace(/\n/g, '<br>')
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .trim()
  }

  /**
   * 创建轨道选择器
   */
  private createTrackSelector(overlay: HTMLElement): void {
    this._trackSelector = createElement('div', {
      className: 'lv-subtitle-selector',
      styles: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        pointerEvents: 'auto'
      }
    })

    overlay.appendChild(this._trackSelector)
  }

  /**
   * 更新轨道选择器
   */
  private updateTrackSelector(): void {
    if (!this._trackSelector) return

    this._trackSelector.innerHTML = ''

    if (this._tracks.length === 0) return

    const select = createElement('select', {
      className: 'lv-subtitle-track-select',
      styles: {
        padding: '4px 8px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#ffffff',
        fontSize: '12px'
      }
    })

    // 添加"无字幕"选项
    const noneOption = createElement('option', {
      attributes: { value: '' },
      textContent: '无字幕'
    })
    select.appendChild(noneOption)

    // 添加字幕轨道选项
    this._tracks.forEach(track => {
      const option = createElement('option', {
        attributes: { value: track.id },
        textContent: track.label || track.language || track.id
      })

      if (this._currentTrack?.id === track.id) {
        option.setAttribute('selected', 'selected')
      }

      select.appendChild(option)
    })

    // 绑定选择事件
    select.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value
      this.selectTrack(value || null)
    })

    this._trackSelector.appendChild(select)
  }

  /**
   * 更新字幕样式
   */
  private updateSubtitleStyle(): void {
    if (!this._subtitleElement) return

    setStyle(this._subtitleElement, {
      color: this._config.color || '#ffffff',
      fontSize: `${this._config.fontSize}px`,
      fontFamily: this._config.fontFamily || 'Arial, sans-serif',
      backgroundColor: this._config.backgroundColor || 'transparent',
      opacity: this._config.opacity?.toString() || '1',
      textShadow: this._config.strokeWidth ?
        `${this._config.strokeWidth}px ${this._config.strokeWidth}px 0 ${this._config.strokeColor}` :
        '1px 1px 2px rgba(0, 0, 0, 0.8)'
    })
  }

  /**
   * 处理时间更新事件
   */
  private handleTimeUpdate(data: { currentTime: number }): void {
    this.updateSubtitle(data.currentTime)
  }

  /**
   * 更新字幕显示
   */
  updateSubtitle(currentTime: number): void {
    if (!this._currentTrack?.cues) {
      this.hideSubtitle()
      return
    }

    // 应用延迟
    const adjustedTime = currentTime + (this._config.delay || 0) / 1000

    // 查找当前时间对应的字幕
    const subtitle = this._currentTrack.cues.find(cue =>
      adjustedTime >= cue.startTime && adjustedTime <= cue.endTime
    )

    if (subtitle) {
      if (this._currentSubtitle?.id !== subtitle.id) {
        this.showSubtitle(subtitle)
      }
    } else {
      if (this._currentSubtitle) {
        this.hideSubtitle()
      }
    }
  }
}
