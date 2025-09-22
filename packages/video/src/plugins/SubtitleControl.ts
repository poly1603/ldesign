/**
 * 字幕控制插件
 * 提供字幕轨道选择和样式设置功能
 */
import { UIPlugin } from '../core/UIPlugin';
import type { IPlugin, PluginConfig } from '../types/plugins';
import type { Subtitle, SubtitleTrack, SubtitleStyle } from './Subtitle';

export interface SubtitleControlConfig extends PluginConfig {
  showTrackSelector: boolean;
  showStyleEditor: boolean;
  showToggle: boolean;
  defaultFonts: string[];
}

export class SubtitleControl extends UIPlugin implements IPlugin {
  private subtitlePlugin?: Subtitle;
  private trackButton!: HTMLElement;
  private styleButton!: HTMLElement;
  private trackPanel!: HTMLElement;
  private stylePanel!: HTMLElement;
  private isTrackPanelActive: boolean = false;
  private isStylePanelActive: boolean = false;

  constructor(config: Partial<SubtitleControlConfig> = {}) {
    super('subtitle-control', {
      showTrackSelector: true,
      showStyleEditor: true,
      showToggle: true,
      defaultFonts: [
        'Arial, sans-serif',
        'Helvetica, sans-serif',
        'Times New Roman, serif',
        'Georgia, serif',
        'Verdana, sans-serif',
        'Courier New, monospace',
        'Microsoft YaHei, sans-serif',
        'SimHei, sans-serif',
        'SimSun, serif'
      ],
      ...config
    });
  }

  onCreate(): void {
    this.findSubtitlePlugin();
    this.createElements();
    this.bindEvents();
  }

  onMount(): void {
    if (!this.player?.container) return;

    const controls = this.player.container.querySelector('.lv-controls');
    if (controls) {
      const config = this.config as SubtitleControlConfig;
      
      if (config.showTrackSelector) {
        controls.appendChild(this.trackButton);
        controls.appendChild(this.trackPanel);
      }
      
      if (config.showStyleEditor) {
        controls.appendChild(this.styleButton);
        controls.appendChild(this.stylePanel);
      }
    }
  }

  onDestroy(): void {
    this.unbindEvents();
    this.removeElements();
  }

  private findSubtitlePlugin(): void {
    if (!this.player) return;

    // 查找字幕插件实例
    const plugins = (this.player as any).plugins || [];
    this.subtitlePlugin = plugins.find((plugin: any) => plugin.name === 'subtitle');
  }

  private createElements(): void {
    this.createTrackButton();
    this.createTrackPanel();
    this.createStyleButton();
    this.createStylePanel();
  }

  private createTrackButton(): void {
    this.trackButton = document.createElement('button');
    this.trackButton.className = 'lv-button lv-plugin lv-plugin-subtitle-control';
    this.trackButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
      </svg>
    `;
    this.trackButton.title = '字幕轨道';
  }

  private createTrackPanel(): void {
    this.trackPanel = document.createElement('div');
    this.trackPanel.className = 'subtitle-panel';
    
    const trackList = document.createElement('div');
    trackList.className = 'track-list';
    
    const controls = document.createElement('div');
    controls.className = 'subtitle-controls';
    
    // 字幕开关
    const toggleRow = document.createElement('div');
    toggleRow.className = 'control-row';
    
    const toggleLabel = document.createElement('span');
    toggleLabel.textContent = '显示字幕';
    
    const toggleSwitch = document.createElement('div');
    toggleSwitch.className = 'control-toggle active';
    toggleSwitch.addEventListener('click', this.onToggleSubtitle.bind(this));
    
    toggleRow.appendChild(toggleLabel);
    toggleRow.appendChild(toggleSwitch);
    
    controls.appendChild(toggleRow);
    
    this.trackPanel.appendChild(trackList);
    this.trackPanel.appendChild(controls);
    
    this.updateTrackList();
  }

  private createStyleButton(): void {
    this.styleButton = document.createElement('button');
    this.styleButton.className = 'lv-button lv-plugin lv-plugin-subtitle-style';
    this.styleButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/>
      </svg>
    `;
    this.styleButton.title = '字幕样式';
  }

  private createStylePanel(): void {
    const config = this.config as SubtitleControlConfig;
    
    this.stylePanel = document.createElement('div');
    this.stylePanel.className = 'style-panel';
    
    // 字体设置组
    const fontGroup = this.createStyleGroup('字体设置', [
      this.createStyleRow('字体', 'select', 'fontFamily', config.defaultFonts),
      this.createStyleRow('大小', 'number', 'fontSize', null, { min: 12, max: 48, value: 16 }),
      this.createStyleRow('颜色', 'color', 'color', null, { value: '#ffffff' })
    ]);
    
    // 背景设置组
    const backgroundGroup = this.createStyleGroup('背景设置', [
      this.createStyleRow('背景色', 'color', 'backgroundColor', null, { value: '#000000' }),
      this.createStyleRow('透明度', 'range', 'opacity', null, { min: 0, max: 1, step: 0.1, value: 0.8 })
    ]);
    
    // 边框设置组
    const borderGroup = this.createStyleGroup('边框设置', [
      this.createStyleRow('边框色', 'color', 'borderColor', null, { value: '#000000' }),
      this.createStyleRow('边框宽度', 'number', 'borderWidth', null, { min: 0, max: 5, value: 1 })
    ]);
    
    // 效果设置组
    const effectGroup = this.createStyleGroup('文字效果', [
      this.createStyleRow('粗体', 'checkbox', 'bold'),
      this.createStyleRow('斜体', 'checkbox', 'italic'),
      this.createStyleRow('下划线', 'checkbox', 'underline'),
      this.createStyleRow('阴影', 'checkbox', 'shadow', null, { checked: true })
    ]);
    
    this.stylePanel.appendChild(fontGroup);
    this.stylePanel.appendChild(backgroundGroup);
    this.stylePanel.appendChild(borderGroup);
    this.stylePanel.appendChild(effectGroup);
  }

  private createStyleGroup(title: string, rows: HTMLElement[]): HTMLElement {
    const group = document.createElement('div');
    group.className = 'style-group';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'style-group-title';
    titleEl.textContent = title;
    
    group.appendChild(titleEl);
    rows.forEach(row => group.appendChild(row));
    
    return group;
  }

  private createStyleRow(label: string, type: string, property: string, options?: string[] | null, attrs?: any): HTMLElement {
    const row = document.createElement('div');
    row.className = 'style-row';
    
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    
    let control: HTMLElement;
    
    switch (type) {
      case 'select':
        control = document.createElement('select');
        control.className = 'font-select';
        if (options) {
          options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option.split(',')[0];
            (control as HTMLSelectElement).appendChild(optionEl);
          });
        }
        break;
        
      case 'color':
        control = document.createElement('input');
        control.className = 'color-input';
        (control as HTMLInputElement).type = 'color';
        if (attrs?.value) {
          (control as HTMLInputElement).value = attrs.value;
        }
        break;
        
      case 'number':
        control = document.createElement('input');
        control.className = 'style-input';
        (control as HTMLInputElement).type = 'number';
        if (attrs) {
          Object.keys(attrs).forEach(key => {
            (control as HTMLInputElement).setAttribute(key, attrs[key]);
          });
        }
        break;
        
      case 'range':
        control = document.createElement('input');
        control.className = 'control-slider';
        (control as HTMLInputElement).type = 'range';
        if (attrs) {
          Object.keys(attrs).forEach(key => {
            (control as HTMLInputElement).setAttribute(key, attrs[key]);
          });
        }
        break;
        
      case 'checkbox':
        control = document.createElement('div');
        control.className = 'control-toggle';
        if (attrs?.checked) {
          control.classList.add('active');
        }
        break;
        
      default:
        control = document.createElement('input');
        control.className = 'style-input';
        (control as HTMLInputElement).type = 'text';
        break;
    }
    
    control.dataset.property = property;
    control.addEventListener('change', this.onStyleChange.bind(this));
    control.addEventListener('input', this.onStyleChange.bind(this));
    
    if (type === 'checkbox') {
      control.addEventListener('click', this.onToggleStyle.bind(this));
    }
    
    row.appendChild(labelEl);
    row.appendChild(control);
    
    return row;
  }

  private bindEvents(): void {
    this.trackButton.addEventListener('click', this.onToggleTrackPanel.bind(this));
    this.styleButton.addEventListener('click', this.onToggleStylePanel.bind(this));
    
    // 点击外部关闭面板
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  private unbindEvents(): void {
    this.trackButton.removeEventListener('click', this.onToggleTrackPanel.bind(this));
    this.styleButton.removeEventListener('click', this.onToggleStylePanel.bind(this));
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private removeElements(): void {
    [this.trackButton, this.trackPanel, this.styleButton, this.stylePanel].forEach(el => {
      if (el?.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  private updateTrackList(): void {
    if (!this.subtitlePlugin) return;

    const trackList = this.trackPanel.querySelector('.track-list');
    if (!trackList) return;

    trackList.innerHTML = '';

    const tracks = this.subtitlePlugin.getTracks();
    const currentTrack = this.subtitlePlugin.getCurrentTrack();

    // 添加"无字幕"选项
    const noneItem = this.createTrackItem({
      id: 'none',
      label: '无字幕',
      language: '',
      format: 'srt' as any
    }, !currentTrack);
    trackList.appendChild(noneItem);

    // 添加字幕轨道
    tracks.forEach(track => {
      const item = this.createTrackItem(track, currentTrack?.id === track.id);
      trackList.appendChild(item);
    });
  }

  private createTrackItem(track: SubtitleTrack | { id: string; label: string; language: string }, isActive: boolean): HTMLElement {
    const item = document.createElement('div');
    item.className = `track-item ${isActive ? 'active' : ''}`;
    item.dataset.trackId = track.id;
    
    const info = document.createElement('div');
    info.className = 'track-info';
    
    const label = document.createElement('div');
    label.className = 'track-label';
    label.textContent = track.label;
    
    const language = document.createElement('div');
    language.className = 'track-language';
    language.textContent = track.language || '未知语言';
    
    info.appendChild(label);
    info.appendChild(language);
    
    const status = document.createElement('div');
    status.className = 'track-status';
    
    item.appendChild(info);
    item.appendChild(status);
    
    item.addEventListener('click', () => this.onSelectTrack(track.id));
    
    return item;
  }

  private onToggleTrackPanel(e: Event): void {
    e.stopPropagation();
    this.isTrackPanelActive = !this.isTrackPanelActive;
    this.trackButton.classList.toggle('active', this.isTrackPanelActive);
    
    if (this.isTrackPanelActive) {
      this.styleButton.classList.remove('active');
      this.isStylePanelActive = false;
      this.updateTrackList();
    }
  }

  private onToggleStylePanel(e: Event): void {
    e.stopPropagation();
    this.isStylePanelActive = !this.isStylePanelActive;
    this.styleButton.classList.toggle('active', this.isStylePanelActive);
    
    if (this.isStylePanelActive) {
      this.trackButton.classList.remove('active');
      this.isTrackPanelActive = false;
    }
  }

  private onDocumentClick(e: Event): void {
    const target = e.target as HTMLElement;
    
    if (!this.trackButton.contains(target) && !this.trackPanel.contains(target)) {
      this.trackButton.classList.remove('active');
      this.isTrackPanelActive = false;
    }
    
    if (!this.styleButton.contains(target) && !this.stylePanel.contains(target)) {
      this.styleButton.classList.remove('active');
      this.isStylePanelActive = false;
    }
  }

  private onSelectTrack(trackId: string): void {
    if (!this.subtitlePlugin) return;

    try {
      if (trackId === 'none') {
        this.subtitlePlugin.setEnabled(false);
      } else {
        this.subtitlePlugin.loadTrack(trackId);
        this.subtitlePlugin.setEnabled(true);
      }
      
      this.updateTrackList();
      this.trackButton.classList.remove('active');
      this.isTrackPanelActive = false;
      
    } catch (error) {
      console.error('切换字幕轨道失败:', error);
    }
  }

  private onToggleSubtitle(): void {
    if (!this.subtitlePlugin) return;

    const currentTrack = this.subtitlePlugin.getCurrentTrack();
    const isEnabled = currentTrack !== undefined;
    
    this.subtitlePlugin.setEnabled(!isEnabled);
    
    const toggle = this.trackPanel.querySelector('.control-toggle');
    if (toggle) {
      toggle.classList.toggle('active', !isEnabled);
    }
  }

  private onStyleChange(e: Event): void {
    if (!this.subtitlePlugin) return;

    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const property = target.dataset.property;
    
    if (!property) return;

    let value: any = target.value;
    
    // 类型转换
    if (target.type === 'number' || target.type === 'range') {
      value = parseFloat(value);
    } else if (target.type === 'checkbox') {
      value = target.classList.contains('active');
    }

    const style: Partial<SubtitleStyle> = {
      [property]: value
    };

    this.subtitlePlugin.setStyle(style);
  }

  private onToggleStyle(e: Event): void {
    const target = e.target as HTMLElement;
    target.classList.toggle('active');
    
    // 触发 change 事件
    const changeEvent = new Event('change');
    target.dispatchEvent(changeEvent);
  }

  protected createElement(): HTMLElement {
    // UIPlugin 要求实现此方法，但我们在 createElements 中创建多个元素
    return document.createElement('div');
  }
}
