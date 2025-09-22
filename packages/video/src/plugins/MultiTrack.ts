import { UIPlugin } from '../core/UIPlugin';
import { Player } from '../core/Player';
import { PluginConfig } from '../types/plugin';

export interface AudioTrack {
  id: string;
  label: string;
  language?: string;
  kind: 'main' | 'alternative' | 'commentary' | 'description';
  enabled: boolean;
  audioTrack?: any; // HTMLMediaElement.audioTracks
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  src?: string;
  content?: string;
  enabled: boolean;
  textTrack?: TextTrack;
}

export interface MultiTrackConfig extends PluginConfig {
  audioTracks?: AudioTrack[];
  subtitleTracks?: SubtitleTrack[];
  defaultAudioTrack?: string;
  defaultSubtitleTrack?: string;
  autoDetectTracks?: boolean;
}

export class MultiTrack extends UIPlugin {
  private audioTracks: AudioTrack[] = [];
  private subtitleTracks: SubtitleTrack[] = [];
  private currentAudioTrack: AudioTrack | null = null;
  private currentSubtitleTrack: SubtitleTrack | null = null;
  private config: MultiTrackConfig;

  constructor(player: Player, config: MultiTrackConfig = {}) {
    super(player, {
      name: 'multi-track',
      displayName: '音轨/字幕',
      ...config
    });

    this.config = {
      audioTracks: [],
      subtitleTracks: [],
      autoDetectTracks: true,
      ...config
    };

    this.initializeTracks();
  }

  protected createUI(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ldesign-multitrack-plugin';
    container.innerHTML = `
      <button class="ldesign-multitrack-btn" title="音轨/字幕">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          <path d="M9 16h6v-6H9v6z" opacity="0.5"/>
        </svg>
      </button>
      <div class="ldesign-multitrack-panel" style="display: none;">
        <div class="ldesign-multitrack-tabs">
          <button class="ldesign-multitrack-tab active" data-tab="audio">音轨</button>
          <button class="ldesign-multitrack-tab" data-tab="subtitle">字幕</button>
        </div>
        <div class="ldesign-multitrack-content">
          <div class="ldesign-multitrack-tab-content" data-content="audio">
            <div class="ldesign-multitrack-section">
              <h4>音频轨道</h4>
              <div class="ldesign-audio-tracks">
                ${this.renderAudioTracks()}
              </div>
            </div>
          </div>
          <div class="ldesign-multitrack-tab-content" data-content="subtitle" style="display: none;">
            <div class="ldesign-multitrack-section">
              <h4>字幕轨道</h4>
              <div class="ldesign-subtitle-tracks">
                ${this.renderSubtitleTracks()}
              </div>
              <div class="ldesign-subtitle-controls">
                <button class="ldesign-subtitle-add">添加字幕</button>
                <input type="file" class="ldesign-subtitle-file" accept=".srt,.vtt,.ass" style="display: none;">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    return container;
  }

  private bindEvents(container: HTMLElement): void {
    const btn = container.querySelector('.ldesign-multitrack-btn') as HTMLButtonElement;
    const panel = container.querySelector('.ldesign-multitrack-panel') as HTMLElement;
    const tabs = container.querySelectorAll('.ldesign-multitrack-tab');
    const tabContents = container.querySelectorAll('.ldesign-multitrack-tab-content');
    const addSubtitleBtn = container.querySelector('.ldesign-subtitle-add') as HTMLButtonElement;
    const subtitleFileInput = container.querySelector('.ldesign-subtitle-file') as HTMLInputElement;

    // 显示/隐藏面板
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        this.refreshTracks();
        this.updateUI();
      }
    });

    // 点击外部关闭面板
    document.addEventListener('click', () => {
      panel.style.display = 'none';
    });

    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 标签页切换
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        tabContents.forEach(content => {
          const contentName = content.getAttribute('data-content');
          content.style.display = contentName === tabName ? 'block' : 'none';
        });
      });
    });

    // 添加字幕
    addSubtitleBtn.addEventListener('click', () => {
      subtitleFileInput.click();
    });

    subtitleFileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.loadSubtitleFile(file);
      }
    });

    // 绑定轨道选择事件
    this.bindTrackEvents(container);
  }

  private bindTrackEvents(container: HTMLElement): void {
    // 音频轨道选择
    const audioTracks = container.querySelectorAll('.ldesign-audio-track');
    audioTracks.forEach(track => {
      track.addEventListener('click', () => {
        const trackId = track.getAttribute('data-track-id');
        if (trackId) {
          this.selectAudioTrack(trackId);
          this.updateUI();
        }
      });
    });

    // 字幕轨道选择
    const subtitleTracks = container.querySelectorAll('.ldesign-subtitle-track');
    subtitleTracks.forEach(track => {
      track.addEventListener('click', () => {
        const trackId = track.getAttribute('data-track-id');
        if (trackId) {
          this.selectSubtitleTrack(trackId);
          this.updateUI();
        }
      });
    });

    // 字幕删除
    const deleteButtons = container.querySelectorAll('.ldesign-subtitle-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trackId = btn.getAttribute('data-track-id');
        if (trackId) {
          this.removeSubtitleTrack(trackId);
          this.updateUI();
        }
      });
    });
  }

  private initializeTracks(): void {
    if (this.config.autoDetectTracks) {
      this.detectTracks();
    }

    // 添加配置中的轨道
    if (this.config.audioTracks) {
      this.audioTracks.push(...this.config.audioTracks);
    }

    if (this.config.subtitleTracks) {
      this.subtitleTracks.push(...this.config.subtitleTracks);
    }

    // 设置默认轨道
    if (this.config.defaultAudioTrack) {
      this.selectAudioTrack(this.config.defaultAudioTrack);
    }

    if (this.config.defaultSubtitleTrack) {
      this.selectSubtitleTrack(this.config.defaultSubtitleTrack);
    }
  }

  private detectTracks(): void {
    const video = this.player.getVideoElement();
    if (!video) return;

    // 检测音频轨道
    if (video.audioTracks) {
      for (let i = 0; i < video.audioTracks.length; i++) {
        const track = video.audioTracks[i];
        this.audioTracks.push({
          id: `audio-${i}`,
          label: track.label || `音轨 ${i + 1}`,
          language: track.language,
          kind: track.kind as any || 'main',
          enabled: track.enabled,
          audioTrack: track
        });
      }
    }

    // 检测字幕轨道
    if (video.textTracks) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if (track.kind === 'subtitles' || track.kind === 'captions') {
          this.subtitleTracks.push({
            id: `subtitle-${i}`,
            label: track.label || `字幕 ${i + 1}`,
            language: track.language || 'unknown',
            kind: track.kind as any,
            enabled: track.mode === 'showing',
            textTrack: track
          });
        }
      }
    }
  }

  private refreshTracks(): void {
    if (this.config.autoDetectTracks) {
      this.audioTracks = [];
      this.subtitleTracks = [];
      this.detectTracks();
    }
  }

  public selectAudioTrack(trackId: string): void {
    const track = this.audioTracks.find(t => t.id === trackId);
    if (!track) return;

    // 禁用其他音频轨道
    this.audioTracks.forEach(t => {
      t.enabled = false;
      if (t.audioTrack) {
        t.audioTrack.enabled = false;
      }
    });

    // 启用选中的轨道
    track.enabled = true;
    if (track.audioTrack) {
      track.audioTrack.enabled = true;
    }

    this.currentAudioTrack = track;
    this.player.emit('audio-track-changed', track);
  }

  public selectSubtitleTrack(trackId: string): void {
    const track = this.subtitleTracks.find(t => t.id === trackId);
    if (!track) return;

    // 禁用其他字幕轨道
    this.subtitleTracks.forEach(t => {
      t.enabled = false;
      if (t.textTrack) {
        t.textTrack.mode = 'disabled';
      }
    });

    // 启用选中的轨道
    track.enabled = true;
    if (track.textTrack) {
      track.textTrack.mode = 'showing';
    }

    this.currentSubtitleTrack = track;
    this.player.emit('subtitle-track-changed', track);
  }

  public addSubtitleTrack(track: SubtitleTrack): void {
    this.subtitleTracks.push(track);
    
    // 如果有内容，创建TextTrack
    if (track.content || track.src) {
      this.createTextTrack(track);
    }

    this.player.emit('subtitle-track-added', track);
  }

  public removeSubtitleTrack(trackId: string): void {
    const index = this.subtitleTracks.findIndex(t => t.id === trackId);
    if (index === -1) return;

    const track = this.subtitleTracks[index];
    
    // 移除TextTrack
    if (track.textTrack) {
      const video = this.player.getVideoElement();
      if (video && video.textTracks) {
        // 注意：无法直接删除TextTrack，只能禁用
        track.textTrack.mode = 'disabled';
      }
    }

    this.subtitleTracks.splice(index, 1);
    
    if (this.currentSubtitleTrack?.id === trackId) {
      this.currentSubtitleTrack = null;
    }

    this.player.emit('subtitle-track-removed', track);
  }

  private async loadSubtitleFile(file: File): Promise<void> {
    try {
      const content = await this.readFileAsText(file);
      const track: SubtitleTrack = {
        id: `subtitle-${Date.now()}`,
        label: file.name,
        language: 'unknown',
        kind: 'subtitles',
        content,
        enabled: false
      };

      this.addSubtitleTrack(track);
      this.updateUI();
    } catch (error) {
      console.error('加载字幕文件失败:', error);
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private createTextTrack(track: SubtitleTrack): void {
    const video = this.player.getVideoElement();
    if (!video) return;

    const textTrack = video.addTextTrack(track.kind, track.label, track.language);
    textTrack.mode = 'disabled';

    if (track.content) {
      this.parseSubtitleContent(textTrack, track.content);
    }

    track.textTrack = textTrack;
  }

  private parseSubtitleContent(textTrack: TextTrack, content: string): void {
    // 简单的SRT解析（实际项目中应该使用专门的字幕解析库）
    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      // 跳过空行
      if (!lines[i].trim()) {
        i++;
        continue;
      }

      // 序号行
      const index = lines[i++];
      if (!index || !lines[i]) break;

      // 时间行
      const timeLine = lines[i++];
      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      if (!timeMatch) continue;

      const startTime = this.parseTime(timeMatch.slice(1, 5));
      const endTime = this.parseTime(timeMatch.slice(5, 9));

      // 字幕文本
      let text = '';
      while (i < lines.length && lines[i].trim()) {
        text += lines[i] + '\n';
        i++;
      }

      // 添加字幕条目
      try {
        textTrack.addCue(new VTTCue(startTime, endTime, text.trim()));
      } catch (error) {
        console.warn('添加字幕条目失败:', error);
      }
    }
  }

  private parseTime(parts: string[]): number {
    const [hours, minutes, seconds, milliseconds] = parts.map(Number);
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  }

  private renderAudioTracks(): string {
    if (this.audioTracks.length === 0) {
      return '<div class="ldesign-track-empty">未检测到音频轨道</div>';
    }

    return this.audioTracks.map(track => `
      <div class="ldesign-audio-track ${track.enabled ? 'active' : ''}" data-track-id="${track.id}">
        <div class="ldesign-track-info">
          <span class="ldesign-track-label">${track.label}</span>
          ${track.language ? `<span class="ldesign-track-language">${track.language}</span>` : ''}
        </div>
        <div class="ldesign-track-status">
          ${track.enabled ? '✓' : ''}
        </div>
      </div>
    `).join('');
  }

  private renderSubtitleTracks(): string {
    const tracks = [
      { id: 'none', label: '关闭字幕', enabled: !this.currentSubtitleTrack },
      ...this.subtitleTracks
    ];

    return tracks.map(track => `
      <div class="ldesign-subtitle-track ${track.enabled ? 'active' : ''}" data-track-id="${track.id}">
        <div class="ldesign-track-info">
          <span class="ldesign-track-label">${track.label}</span>
          ${track.id !== 'none' && (track as SubtitleTrack).language ? 
            `<span class="ldesign-track-language">${(track as SubtitleTrack).language}</span>` : ''}
        </div>
        <div class="ldesign-track-actions">
          ${track.enabled ? '<span class="ldesign-track-status">✓</span>' : ''}
          ${track.id !== 'none' ? 
            `<button class="ldesign-subtitle-delete" data-track-id="${track.id}">删除</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  private updateUI(): void {
    const container = this.getContainer();
    if (!container) return;

    // 更新音频轨道列表
    const audioContainer = container.querySelector('.ldesign-audio-tracks');
    if (audioContainer) {
      audioContainer.innerHTML = this.renderAudioTracks();
    }

    // 更新字幕轨道列表
    const subtitleContainer = container.querySelector('.ldesign-subtitle-tracks');
    if (subtitleContainer) {
      subtitleContainer.innerHTML = this.renderSubtitleTracks();
    }

    // 重新绑定事件
    this.bindTrackEvents(container);
  }

  public getAudioTracks(): AudioTrack[] {
    return [...this.audioTracks];
  }

  public getSubtitleTracks(): SubtitleTrack[] {
    return [...this.subtitleTracks];
  }

  public getCurrentAudioTrack(): AudioTrack | null {
    return this.currentAudioTrack;
  }

  public getCurrentSubtitleTrack(): SubtitleTrack | null {
    return this.currentSubtitleTrack;
  }
}
