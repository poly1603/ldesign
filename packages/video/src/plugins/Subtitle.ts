/**
 * 字幕插件
 * 支持多种字幕格式和样式自定义
 */
import { BasePlugin } from '../core/BasePlugin';
import type { IPlugin, PluginConfig } from '../types/plugins';
import type { Player } from '../core/Player';

// 字幕格式类型
export enum SubtitleFormat {
  SRT = 'srt',
  VTT = 'vtt',
  ASS = 'ass',
  SSA = 'ssa',
  JSON = 'json'
}

// 字幕项接口
export interface SubtitleItem {
  id: string;
  start: number;
  end: number;
  text: string;
  style?: SubtitleStyle;
  position?: SubtitlePosition;
}

// 字幕样式接口
export interface SubtitleStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  shadow?: boolean;
  shadowColor?: string;
  shadowOffset?: { x: number; y: number };
  opacity?: number;
}

// 字幕位置接口
export interface SubtitlePosition {
  x?: number | string;
  y?: number | string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

// 字幕轨道接口
export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url?: string;
  data?: SubtitleItem[];
  format: SubtitleFormat;
  default?: boolean;
  enabled?: boolean;
}

// 字幕配置接口
export interface SubtitleConfig extends PluginConfig {
  enabled: boolean;
  tracks: SubtitleTrack[];
  currentTrack?: string;
  defaultStyle: SubtitleStyle;
  position: SubtitlePosition;
  autoLoad: boolean;
  encoding: string;
  maxLines: number;
  lineHeight: number;
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export class Subtitle extends BasePlugin implements IPlugin {
  private container!: HTMLElement;
  private currentSubtitles: SubtitleItem[] = [];
  private currentTrack?: SubtitleTrack;
  private displayedItems: Map<string, HTMLElement> = new Map();
  private updateTimer: number = 0;

  constructor(config: Partial<SubtitleConfig> = {}) {
    super('subtitle', {
      enabled: true,
      tracks: [],
      currentTrack: undefined,
      defaultStyle: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#000000',
        borderWidth: 1,
        bold: false,
        italic: false,
        underline: false,
        shadow: true,
        shadowColor: '#000000',
        shadowOffset: { x: 1, y: 1 },
        opacity: 1
      },
      position: {
        x: '50%',
        y: '90%',
        align: 'center',
        verticalAlign: 'bottom'
      },
      autoLoad: true,
      encoding: 'utf-8',
      maxLines: 3,
      lineHeight: 1.2,
      margin: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      },
      ...config
    });
  }

  onCreate(): void {
    this.createContainer();
    this.bindEvents();
  }

  onMount(): void {
    if (!this.player?.container) return;
    
    this.player.container.appendChild(this.container);
    this.updateStyles();
    
    // 自动加载字幕
    if ((this.config as SubtitleConfig).autoLoad) {
      this.autoLoadSubtitles();
    }
  }

  onDestroy(): void {
    this.stopUpdateTimer();
    this.clearSubtitles();
    this.unbindEvents();
    
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.className = 'lv-subtitle-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
    `;
  }

  private bindEvents(): void {
    if (!this.player) return;

    this.player.on('play', this.onPlay.bind(this));
    this.player.on('pause', this.onPause.bind(this));
    this.player.on('seeked', this.onSeeked.bind(this));
    this.player.on('timeupdate', this.onTimeUpdate.bind(this));
  }

  private unbindEvents(): void {
    if (!this.player) return;

    this.player.off('play', this.onPlay.bind(this));
    this.player.off('pause', this.onPause.bind(this));
    this.player.off('seeked', this.onSeeked.bind(this));
    this.player.off('timeupdate', this.onTimeUpdate.bind(this));
  }

  private onPlay(): void {
    this.startUpdateTimer();
  }

  private onPause(): void {
    this.stopUpdateTimer();
  }

  private onSeeked(): void {
    this.updateSubtitles();
  }

  private onTimeUpdate(): void {
    // 在定时器中更新，避免频繁更新
  }

  private startUpdateTimer(): void {
    if (this.updateTimer) return;
    
    this.updateTimer = window.setInterval(() => {
      this.updateSubtitles();
    }, 100); // 每100ms更新一次
  }

  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = 0;
    }
  }

  private updateSubtitles(): void {
    if (!this.player || !this.currentSubtitles.length) return;

    const currentTime = this.player.currentTime || 0;
    const config = this.config as SubtitleConfig;

    // 找到当前时间应该显示的字幕
    const activeItems = this.currentSubtitles.filter(item => 
      currentTime >= item.start && currentTime <= item.end
    );

    // 移除不再显示的字幕
    this.displayedItems.forEach((element, id) => {
      if (!activeItems.find(item => item.id === id)) {
        this.removeSubtitleElement(id);
      }
    });

    // 添加新的字幕
    activeItems.forEach(item => {
      if (!this.displayedItems.has(item.id)) {
        this.addSubtitleElement(item);
      }
    });

    // 限制显示行数
    if (this.displayedItems.size > config.maxLines) {
      const sortedItems = Array.from(this.displayedItems.entries())
        .sort(([, a], [, b]) => {
          const aTime = parseFloat(a.dataset.startTime || '0');
          const bTime = parseFloat(b.dataset.startTime || '0');
          return bTime - aTime; // 最新的在前
        });

      // 移除超出限制的字幕
      sortedItems.slice(config.maxLines).forEach(([id]) => {
        this.removeSubtitleElement(id);
      });
    }
  }

  private addSubtitleElement(item: SubtitleItem): void {
    const config = this.config as SubtitleConfig;
    const element = document.createElement('div');
    element.className = 'lv-subtitle-item';
    element.dataset.id = item.id;
    element.dataset.startTime = item.start.toString();
    element.dataset.endTime = item.end.toString();

    // 设置文本内容
    element.innerHTML = this.formatSubtitleText(item.text);

    // 应用样式
    this.applySubtitleStyle(element, item.style || config.defaultStyle);

    // 设置位置
    this.applySubtitlePosition(element, item.position || config.position);

    // 添加到容器
    this.container.appendChild(element);
    this.displayedItems.set(item.id, element);

    // 添加动画效果
    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';
    
    requestAnimationFrame(() => {
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }

  private removeSubtitleElement(id: string): void {
    const element = this.displayedItems.get(id);
    if (element) {
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      element.style.opacity = '0';
      element.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.displayedItems.delete(id);
      }, 300);
    }
  }

  private formatSubtitleText(text: string): string {
    // 处理字幕文本格式
    return text
      .replace(/\n/g, '<br>')
      .replace(/\{\\b1\}(.*?)\{\\b0\}/g, '<strong>$1</strong>')
      .replace(/\{\\i1\}(.*?)\{\\i0\}/g, '<em>$1</em>')
      .replace(/\{\\u1\}(.*?)\{\\u0\}/g, '<u>$1</u>')
      .replace(/\{\\c&H([0-9A-Fa-f]{6})&\}/g, (match, color) => {
        const r = parseInt(color.substr(4, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(0, 2), 16);
        return `<span style="color: rgb(${r}, ${g}, ${b})">`;
      })
      .replace(/\{\\c\}/g, '</span>');
  }

  private applySubtitleStyle(element: HTMLElement, style: SubtitleStyle): void {
    const css: any = {
      fontSize: `${style.fontSize || 16}px`,
      fontFamily: style.fontFamily || 'Arial, sans-serif',
      color: style.color || '#ffffff',
      backgroundColor: style.backgroundColor || 'rgba(0, 0, 0, 0.8)',
      border: `${style.borderWidth || 1}px solid ${style.borderColor || '#000000'}`,
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
      opacity: style.opacity || 1,
      padding: '4px 8px',
      borderRadius: '4px',
      margin: '2px 0',
      display: 'inline-block',
      maxWidth: '80%',
      wordWrap: 'break-word',
      textAlign: 'center',
      lineHeight: (this.config as SubtitleConfig).lineHeight.toString()
    };

    if (style.shadow) {
      css.textShadow = `${style.shadowOffset?.x || 1}px ${style.shadowOffset?.y || 1}px 2px ${style.shadowColor || '#000000'}`;
    }

    Object.assign(element.style, css);
  }

  private applySubtitlePosition(element: HTMLElement, position: SubtitlePosition): void {
    const css: any = {
      position: 'absolute'
    };

    // 水平位置
    if (position.align === 'left') {
      css.left = position.x || '10%';
    } else if (position.align === 'right') {
      css.right = position.x || '10%';
    } else {
      css.left = '50%';
      css.transform = 'translateX(-50%)';
    }

    // 垂直位置
    if (position.verticalAlign === 'top') {
      css.top = position.y || '10%';
    } else if (position.verticalAlign === 'middle') {
      css.top = '50%';
      css.transform = css.transform ? css.transform + ' translateY(-50%)' : 'translateY(-50%)';
    } else {
      css.bottom = position.y || '10%';
    }

    Object.assign(element.style, css);
  }

  private clearSubtitles(): void {
    this.displayedItems.forEach((element, id) => {
      this.removeSubtitleElement(id);
    });
    this.displayedItems.clear();
  }

  private updateStyles(): void {
    const config = this.config as SubtitleConfig;
    
    this.container.style.display = config.enabled ? 'flex' : 'none';
    this.container.style.margin = `${config.margin.top}px ${config.margin.right}px ${config.margin.bottom}px ${config.margin.left}px`;
  }

  private autoLoadSubtitles(): void {
    const config = this.config as SubtitleConfig;
    const defaultTrack = config.tracks.find(track => track.default) || config.tracks[0];
    
    if (defaultTrack) {
      this.loadTrack(defaultTrack.id);
    }
  }

  // 公共方法
  public addTrack(track: SubtitleTrack): void {
    const config = this.config as SubtitleConfig;
    config.tracks.push(track);
    
    if (track.default || !config.currentTrack) {
      this.loadTrack(track.id);
    }
  }

  public removeTrack(trackId: string): void {
    const config = this.config as SubtitleConfig;
    const index = config.tracks.findIndex(track => track.id === trackId);
    
    if (index !== -1) {
      config.tracks.splice(index, 1);
      
      if (config.currentTrack === trackId) {
        this.clearSubtitles();
        config.currentTrack = undefined;
        this.currentTrack = undefined;
        this.currentSubtitles = [];
      }
    }
  }

  public async loadTrack(trackId: string): Promise<void> {
    const config = this.config as SubtitleConfig;
    const track = config.tracks.find(t => t.id === trackId);
    
    if (!track) {
      throw new Error(`字幕轨道 ${trackId} 不存在`);
    }

    try {
      // 清除当前字幕
      this.clearSubtitles();
      
      // 加载字幕数据
      if (track.data) {
        this.currentSubtitles = track.data;
      } else if (track.url) {
        this.currentSubtitles = await this.loadSubtitleFromUrl(track.url, track.format);
      } else {
        throw new Error('字幕轨道没有数据或URL');
      }

      this.currentTrack = track;
      config.currentTrack = trackId;
      
      // 更新显示
      this.updateSubtitles();
      
    } catch (error) {
      console.error('加载字幕失败:', error);
      throw error;
    }
  }

  private async loadSubtitleFromUrl(url: string, format: SubtitleFormat): Promise<SubtitleItem[]> {
    const response = await fetch(url);
    const text = await response.text();
    
    return this.parseSubtitle(text, format);
  }

  private parseSubtitle(content: string, format: SubtitleFormat): SubtitleItem[] {
    switch (format) {
      case SubtitleFormat.SRT:
        return this.parseSRT(content);
      case SubtitleFormat.VTT:
        return this.parseVTT(content);
      case SubtitleFormat.JSON:
        return this.parseJSON(content);
      default:
        throw new Error(`不支持的字幕格式: ${format}`);
    }
  }

  private parseSRT(content: string): SubtitleItem[] {
    const items: SubtitleItem[] = [];
    const blocks = content.trim().split(/\n\s*\n/);
    
    blocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      if (lines.length >= 3) {
        const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        
        if (timeMatch) {
          const start = this.parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
          const end = this.parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
          const text = lines.slice(2).join('\n');
          
          items.push({
            id: `srt_${index}`,
            start,
            end,
            text
          });
        }
      }
    });
    
    return items;
  }

  private parseVTT(content: string): SubtitleItem[] {
    const items: SubtitleItem[] = [];
    const lines = content.split('\n');
    let currentItem: Partial<SubtitleItem> | null = null;
    let index = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('-->')) {
        const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
        
        if (timeMatch) {
          currentItem = {
            id: `vtt_${index++}`,
            start: this.parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]),
            end: this.parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]),
            text: ''
          };
        }
      } else if (currentItem && line && !line.startsWith('WEBVTT') && !line.startsWith('NOTE')) {
        currentItem.text = currentItem.text ? currentItem.text + '\n' + line : line;
      } else if (currentItem && !line) {
        items.push(currentItem as SubtitleItem);
        currentItem = null;
      }
    }
    
    if (currentItem) {
      items.push(currentItem as SubtitleItem);
    }
    
    return items;
  }

  private parseJSON(content: string): SubtitleItem[] {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : data.subtitles || [];
    } catch (error) {
      throw new Error('无效的JSON字幕格式');
    }
  }

  private parseTime(hours: string, minutes: string, seconds: string, milliseconds: string): number {
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
  }

  public setEnabled(enabled: boolean): void {
    (this.config as SubtitleConfig).enabled = enabled;
    this.updateStyles();
    
    if (!enabled) {
      this.clearSubtitles();
    } else {
      this.updateSubtitles();
    }
  }

  public getCurrentTrack(): SubtitleTrack | undefined {
    return this.currentTrack;
  }

  public getTracks(): SubtitleTrack[] {
    return (this.config as SubtitleConfig).tracks;
  }

  public setStyle(style: Partial<SubtitleStyle>): void {
    const config = this.config as SubtitleConfig;
    Object.assign(config.defaultStyle, style);
    
    // 重新应用样式到当前显示的字幕
    this.displayedItems.forEach(element => {
      this.applySubtitleStyle(element, config.defaultStyle);
    });
  }

  public setPosition(position: Partial<SubtitlePosition>): void {
    const config = this.config as SubtitleConfig;
    Object.assign(config.position, position);
    
    // 重新应用位置到当前显示的字幕
    this.displayedItems.forEach(element => {
      this.applySubtitlePosition(element, config.position);
    });
  }
}
