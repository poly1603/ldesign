/**
 * 弹幕控制插件
 * 提供弹幕发送和设置功能
 */
import { UIPlugin } from '../core/UIPlugin';
import type { IPlugin, PluginConfig } from '../types/plugins';
import type { Danmaku, DanmakuType } from './Danmaku';

export interface DanmakuControlConfig extends PluginConfig {
  showSendButton: boolean;
  showSettingsButton: boolean;
  defaultColor: string;
  maxLength: number;
  placeholder: string;
  colors: string[];
}

export class DanmakuControl extends UIPlugin implements IPlugin {
  private danmakuPlugin?: Danmaku;
  private sendButton!: HTMLElement;
  private settingsButton!: HTMLElement;
  private sendPanel!: HTMLElement;
  private settingsPanel!: HTMLElement;
  private input!: HTMLInputElement;
  private colorPicker!: HTMLElement;
  private selectedColor: string;
  private isActive: boolean = false;

  constructor(config: Partial<DanmakuControlConfig> = {}) {
    super('danmaku-control', {
      showSendButton: true,
      showSettingsButton: true,
      defaultColor: '#ffffff',
      maxLength: 50,
      placeholder: '发送弹幕...',
      colors: ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
      ...config
    });

    this.selectedColor = (this.config as DanmakuControlConfig).defaultColor;
  }

  onCreate(): void {
    this.findDanmakuPlugin();
    this.createElements();
    this.bindEvents();
  }

  onMount(): void {
    if (!this.player?.container) return;

    const controls = this.player.container.querySelector('.lv-controls');
    if (controls) {
      if ((this.config as DanmakuControlConfig).showSendButton) {
        controls.appendChild(this.sendButton);
        controls.appendChild(this.sendPanel);
      }
      if ((this.config as DanmakuControlConfig).showSettingsButton) {
        controls.appendChild(this.settingsButton);
        controls.appendChild(this.settingsPanel);
      }
    }
  }

  onDestroy(): void {
    this.unbindEvents();
    this.removeElements();
  }

  private findDanmakuPlugin(): void {
    if (!this.player) return;

    // 查找弹幕插件实例
    const plugins = (this.player as any).plugins || [];
    this.danmakuPlugin = plugins.find((plugin: any) => plugin.name === 'danmaku');
  }

  private createElements(): void {
    this.createSendButton();
    this.createSendPanel();
    this.createSettingsButton();
    this.createSettingsPanel();
  }

  private createSendButton(): void {
    this.sendButton = document.createElement('button');
    this.sendButton.className = 'lv-button lv-plugin lv-plugin-danmaku-control';
    this.sendButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
      </svg>
    `;
    this.sendButton.title = '发送弹幕';
  }

  private createSendPanel(): void {
    const config = this.config as DanmakuControlConfig;
    
    this.sendPanel = document.createElement('div');
    this.sendPanel.className = 'danmaku-panel';
    
    // 输入框
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'danmaku-input';
    this.input.placeholder = config.placeholder;
    this.input.maxLength = config.maxLength;
    
    // 颜色选择器
    this.colorPicker = document.createElement('div');
    this.colorPicker.className = 'color-picker';
    
    config.colors.forEach(color => {
      const colorOption = document.createElement('div');
      colorOption.className = 'color-option';
      colorOption.style.backgroundColor = color;
      colorOption.dataset.color = color;
      
      if (color === this.selectedColor) {
        colorOption.classList.add('active');
      }
      
      this.colorPicker.appendChild(colorOption);
    });
    
    // 发送按钮
    const sendBtn = document.createElement('button');
    sendBtn.className = 'danmaku-send';
    sendBtn.textContent = '发送';
    
    // 组装面板
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'danmaku-options';
    optionsDiv.appendChild(this.colorPicker);
    
    this.sendPanel.appendChild(this.input);
    this.sendPanel.appendChild(optionsDiv);
    this.sendPanel.appendChild(sendBtn);
    
    // 绑定事件
    this.colorPicker.addEventListener('click', this.onColorSelect.bind(this));
    sendBtn.addEventListener('click', this.onSendDanmaku.bind(this));
    this.input.addEventListener('keypress', this.onInputKeyPress.bind(this));
  }

  private createSettingsButton(): void {
    this.settingsButton = document.createElement('button');
    this.settingsButton.className = 'lv-button lv-plugin lv-plugin-danmaku-settings';
    this.settingsButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
      </svg>
    `;
    this.settingsButton.title = '弹幕设置';
  }

  private createSettingsPanel(): void {
    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'settings-panel';
    
    // 弹幕开关
    const enableItem = this.createSettingItem('弹幕开关', 'toggle', true);
    
    // 透明度设置
    const opacityItem = this.createSettingItem('透明度', 'slider', 0.8);
    
    // 速度设置
    const speedItem = this.createSettingItem('速度', 'slider', 1);
    
    // 字体大小设置
    const fontSizeItem = this.createSettingItem('字体大小', 'slider', 16);
    
    this.settingsPanel.appendChild(enableItem);
    this.settingsPanel.appendChild(opacityItem);
    this.settingsPanel.appendChild(speedItem);
    this.settingsPanel.appendChild(fontSizeItem);
  }

  private createSettingItem(label: string, type: 'toggle' | 'slider', value: any): HTMLElement {
    const item = document.createElement('div');
    item.className = 'setting-item';
    
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    
    let controlEl: HTMLElement;
    
    if (type === 'toggle') {
      controlEl = document.createElement('div');
      controlEl.className = `setting-toggle ${value ? 'active' : ''}`;
      controlEl.dataset.setting = label;
      controlEl.addEventListener('click', this.onToggleSetting.bind(this));
    } else {
      const sliderContainer = document.createElement('div');
      sliderContainer.className = 'setting-slider';
      
      const sliderFill = document.createElement('div');
      sliderFill.className = 'setting-slider-fill';
      
      // 根据设置类型设置初始值
      let percentage = 0;
      switch (label) {
        case '透明度':
          percentage = value * 100;
          break;
        case '速度':
          percentage = (value / 3) * 100;
          break;
        case '字体大小':
          percentage = ((value - 12) / (24 - 12)) * 100;
          break;
      }
      
      sliderFill.style.width = `${percentage}%`;
      sliderContainer.appendChild(sliderFill);
      
      sliderContainer.dataset.setting = label;
      sliderContainer.addEventListener('click', this.onSliderChange.bind(this));
      
      controlEl = sliderContainer;
    }
    
    item.appendChild(labelEl);
    item.appendChild(controlEl);
    
    return item;
  }

  private bindEvents(): void {
    this.sendButton.addEventListener('click', this.onToggleSendPanel.bind(this));
    this.settingsButton.addEventListener('click', this.onToggleSettingsPanel.bind(this));
    
    // 点击外部关闭面板
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  private unbindEvents(): void {
    this.sendButton.removeEventListener('click', this.onToggleSendPanel.bind(this));
    this.settingsButton.removeEventListener('click', this.onToggleSettingsPanel.bind(this));
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private removeElements(): void {
    [this.sendButton, this.sendPanel, this.settingsButton, this.settingsPanel].forEach(el => {
      if (el?.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  private onToggleSendPanel(e: Event): void {
    e.stopPropagation();
    this.isActive = !this.isActive;
    this.sendButton.classList.toggle('active', this.isActive);
    
    if (this.isActive) {
      this.settingsButton.classList.remove('active');
      this.input.focus();
    }
  }

  private onToggleSettingsPanel(e: Event): void {
    e.stopPropagation();
    const isSettingsActive = this.settingsButton.classList.contains('active');
    this.settingsButton.classList.toggle('active', !isSettingsActive);
    
    if (!isSettingsActive) {
      this.sendButton.classList.remove('active');
      this.isActive = false;
    }
  }

  private onDocumentClick(e: Event): void {
    const target = e.target as HTMLElement;
    
    if (!this.sendButton.contains(target) && !this.sendPanel.contains(target)) {
      this.sendButton.classList.remove('active');
      this.isActive = false;
    }
    
    if (!this.settingsButton.contains(target) && !this.settingsPanel.contains(target)) {
      this.settingsButton.classList.remove('active');
    }
  }

  private onColorSelect(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains('color-option')) {
      // 移除之前的选中状态
      this.colorPicker.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('active');
      });
      
      // 设置新的选中状态
      target.classList.add('active');
      this.selectedColor = target.dataset.color || '#ffffff';
    }
  }

  private onSendDanmaku(): void {
    const text = this.input.value.trim();
    if (!text || !this.danmakuPlugin) return;
    
    const success = this.danmakuPlugin.sendDanmaku(text, {
      color: this.selectedColor,
      type: 'scroll' as DanmakuType
    });
    
    if (success) {
      this.input.value = '';
      this.sendButton.classList.remove('active');
      this.isActive = false;
    }
  }

  private onInputKeyPress(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      this.onSendDanmaku();
    }
  }

  private onToggleSetting(e: Event): void {
    const target = e.target as HTMLElement;
    const setting = target.dataset.setting;
    const isActive = target.classList.contains('active');
    
    target.classList.toggle('active', !isActive);
    
    if (setting === '弹幕开关' && this.danmakuPlugin) {
      this.danmakuPlugin.setEnabled(!isActive);
    }
  }

  private onSliderChange(e: Event): void {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (e as MouseEvent).clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    const fill = target.querySelector('.setting-slider-fill') as HTMLElement;
    fill.style.width = `${percentage * 100}%`;
    
    const setting = target.dataset.setting;
    
    if (!this.danmakuPlugin) return;
    
    switch (setting) {
      case '透明度':
        this.danmakuPlugin.setOpacity(percentage);
        break;
      case '速度':
        this.danmakuPlugin.setSpeed(percentage * 3);
        break;
      case '字体大小':
        // 字体大小范围 12-24
        const fontSize = 12 + percentage * 12;
        // 这里需要弹幕插件支持设置字体大小的方法
        break;
    }
  }
}
