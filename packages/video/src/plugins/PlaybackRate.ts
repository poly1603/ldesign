/**
 * 播放速度控制插件
 * 提供播放速度调节功能
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata, PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 播放速度配置
 */
export interface PlaybackRateConfig extends UIPluginConfig {
  rates?: number[];
  showLabel?: boolean;
  icon?: string;
  menuPosition?: 'top' | 'bottom';
}

/**
 * 播放速度插件
 */
export class PlaybackRate extends Plugin {
  private currentRate = 1;
  private isMenuOpen = false;
  private readonly rates: number[];

  constructor(player: IPlayer, config: PlaybackRateConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'playbackRate',
      version: '1.0.0',
      type: 'ui',
      description: 'Playback speed control'
    };

    const defaultConfig: PlaybackRateConfig = {
      position: PluginPosition.CONTROLS_RIGHT,
      className: 'ldesign-playback-rate',
      rates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      showLabel: true,
      menuPosition: 'top',
      icon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M13,8A4,4 0 0,0 9,12A4,4 0 0,0 13,16A4,4 0 0,0 17,12A4,4 0 0,0 13,8M13,14A2,2 0 0,1 11,12A2,2 0 0,1 13,10A2,2 0 0,1 15,12A2,2 0 0,1 13,14M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
      </svg>`,
      ...config
    };

    super(player, defaultConfig, defaultConfig);
    this.rates = defaultConfig.rates!;
  }

  protected render(): string {
    const config = this._uiConfig as PlaybackRateConfig;
    const label = config.showLabel ? `${this.currentRate}x` : '';
    
    return `
      <div class="ldesign-playback-rate-container">
        <button class="ldesign-control-button ldesign-playback-rate-button" 
                type="button" 
                aria-label="Playback speed: ${this.currentRate}x"
                aria-expanded="${this.isMenuOpen}"
                aria-haspopup="menu">
          ${config.icon}
          ${label ? `<span class="ldesign-rate-label">${label}</span>` : ''}
        </button>
        <div class="ldesign-playback-rate-menu ${config.menuPosition === 'top' ? 'ldesign-menu-top' : 'ldesign-menu-bottom'}" 
             role="menu" 
             aria-label="Playback speed options"
             style="display: none;">
          ${this.renderMenuItems()}
        </div>
      </div>
    `;
  }

  private renderMenuItems(): string {
    return this.rates.map(rate => `
      <button class="ldesign-rate-option ${rate === this.currentRate ? 'ldesign-rate-active' : ''}" 
              type="button" 
              role="menuitem"
              data-rate="${rate}"
              aria-checked="${rate === this.currentRate}">
        ${rate}x
        ${rate === 1 ? '<span class="ldesign-rate-normal">(Normal)</span>' : ''}
      </button>
    `).join('');
  }

  protected async onUIInit(): Promise<void> {
    // 监听播放速度变化
    this.on('media:ratechange', () => {
      this.currentRate = this.player.playbackRate;
      this.updateDisplay();
    });

    // 初始化状态
    this.currentRate = this.player.playbackRate;
  }

  protected bindUIEvents(): void {
    if (!this._element) return;

    // 按钮点击事件
    const button = this._element.querySelector('.ldesign-playback-rate-button');
    if (button) {
      button.addEventListener('click', this.toggleMenu.bind(this));
    }

    // 菜单项点击事件
    this.delegate('.ldesign-rate-option', 'click', this.handleRateSelect.bind(this));

    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // 点击外部关闭菜单
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  protected unbindUIEvents(): void {
    if (!this._element) return;

    const button = this._element.querySelector('.ldesign-playback-rate-button');
    if (button) {
      button.removeEventListener('click', this.toggleMenu.bind(this));
    }

    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateMenuVisibility();
  }

  private openMenu(): void {
    this.isMenuOpen = true;
    this.updateMenuVisibility();
  }

  private closeMenu(): void {
    this.isMenuOpen = false;
    this.updateMenuVisibility();
  }

  private handleRateSelect(event: Event, target: HTMLElement): void {
    const rate = parseFloat(target.dataset.rate || '1');
    this.setRate(rate);
    this.closeMenu();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isMenuOpen) {
      // 快捷键：减速/加速
      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        this.decreaseRate();
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        this.increaseRate();
      } else if (event.key === '0') {
        event.preventDefault();
        this.setRate(1);
      }
    } else {
      // 菜单导航
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          this.closeMenu();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.navigateMenu(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.navigateMenu(1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          const focused = this._element!.querySelector('.ldesign-rate-option:focus') as HTMLElement;
          if (focused) {
            this.handleRateSelect(event, focused);
          }
          break;
      }
    }
  }

  private handleDocumentClick(event: Event): void {
    if (this.isMenuOpen && !this._element!.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  private navigateMenu(direction: number): void {
    const options = Array.from(this._element!.querySelectorAll('.ldesign-rate-option')) as HTMLElement[];
    const currentIndex = options.findIndex(option => option === document.activeElement);
    
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;
    
    options[nextIndex].focus();
  }

  private setRate(rate: number): void {
    if (this.rates.includes(rate)) {
      this.currentRate = rate;
      this.player.playbackRate = rate;
      this.updateDisplay();
      
      this.emit('playbackrate:change', { 
        rate, 
        previousRate: this.player.playbackRate 
      });
    }
  }

  private increaseRate(): void {
    const currentIndex = this.rates.indexOf(this.currentRate);
    if (currentIndex < this.rates.length - 1) {
      this.setRate(this.rates[currentIndex + 1]);
    }
  }

  private decreaseRate(): void {
    const currentIndex = this.rates.indexOf(this.currentRate);
    if (currentIndex > 0) {
      this.setRate(this.rates[currentIndex - 1]);
    }
  }

  private updateDisplay(): void {
    this.updateButton();
    this.updateMenuItems();
  }

  private updateButton(): void {
    const button = this._element!.querySelector('.ldesign-playback-rate-button');
    const label = this._element!.querySelector('.ldesign-rate-label');
    
    if (button) {
      button.setAttribute('aria-label', `Playback speed: ${this.currentRate}x`);
    }
    
    if (label) {
      label.textContent = `${this.currentRate}x`;
    }
  }

  private updateMenuItems(): void {
    const options = this._element!.querySelectorAll('.ldesign-rate-option');
    
    options.forEach(option => {
      const rate = parseFloat((option as HTMLElement).dataset.rate || '1');
      const isActive = rate === this.currentRate;
      
      option.classList.toggle('ldesign-rate-active', isActive);
      option.setAttribute('aria-checked', isActive.toString());
    });
  }

  private updateMenuVisibility(): void {
    const menu = this._element!.querySelector('.ldesign-playback-rate-menu') as HTMLElement;
    const button = this._element!.querySelector('.ldesign-playback-rate-button');
    
    if (menu) {
      menu.style.display = this.isMenuOpen ? 'block' : 'none';
    }
    
    if (button) {
      button.setAttribute('aria-expanded', this.isMenuOpen.toString());
    }
    
    if (this.isMenuOpen) {
      // 聚焦到当前速率选项
      const activeOption = this._element!.querySelector('.ldesign-rate-active') as HTMLElement;
      if (activeOption) {
        activeOption.focus();
      }
    }
  }

  /**
   * 获取可用的播放速率
   */
  public getRates(): number[] {
    return [...this.rates];
  }

  /**
   * 添加播放速率
   */
  public addRate(rate: number): void {
    if (!this.rates.includes(rate)) {
      this.rates.push(rate);
      this.rates.sort((a, b) => a - b);
      this.updateMenuItems();
    }
  }

  /**
   * 移除播放速率
   */
  public removeRate(rate: number): void {
    const index = this.rates.indexOf(rate);
    if (index > -1 && rate !== 1) { // 不能移除正常速度
      this.rates.splice(index, 1);
      this.updateMenuItems();
    }
  }

  /**
   * 获取当前播放速率
   */
  public getCurrentRate(): number {
    return this.currentRate;
  }
}

/**
 * 创建播放速度插件
 */
export function createPlaybackRate(player: IPlayer, config?: PlaybackRateConfig): PlaybackRate {
  return new PlaybackRate(player, config);
}
