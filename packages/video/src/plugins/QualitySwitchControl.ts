/**
 * 质量切换控制插件
 * 提供质量切换的UI控制界面
 */
import { UIPlugin } from '../core/UIPlugin';
import type { IPlugin, PluginConfig } from '../types/plugins';
import type { QualitySwitch, VideoQuality } from './QualitySwitch';

export interface QualitySwitchControlConfig extends PluginConfig {
  showQualitySelector: boolean;
  showAutoSwitch: boolean;
  showNetworkInfo: boolean;
  showBufferInfo: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export class QualitySwitchControl extends UIPlugin implements IPlugin {
  private qualitySwitchPlugin?: QualitySwitch;
  private qualityButton!: HTMLElement;
  private qualityPanel!: HTMLElement;
  private networkIndicator!: HTMLElement;
  private bufferIndicator!: HTMLElement;
  private isPanelActive: boolean = false;
  private updateTimer?: number;

  constructor(config: Partial<QualitySwitchControlConfig> = {}) {
    super('quality-switch-control', {
      showQualitySelector: true,
      showAutoSwitch: true,
      showNetworkInfo: true,
      showBufferInfo: true,
      position: 'top-right',
      ...config
    });
  }

  onCreate(): void {
    this.findQualitySwitchPlugin();
    this.createElements();
    this.bindEvents();
  }

  onMount(): void {
    if (!this.player?.container) return;

    const controls = this.player.container.querySelector('.lv-controls');
    if (controls) {
      const config = this.config as QualitySwitchControlConfig;
      
      if (config.showQualitySelector) {
        controls.appendChild(this.qualityButton);
        controls.appendChild(this.qualityPanel);
      }
      
      if (config.showNetworkInfo) {
        controls.appendChild(this.networkIndicator);
      }
      
      if (config.showBufferInfo) {
        controls.appendChild(this.bufferIndicator);
      }
    }

    this.startUpdateTimer();
    this.updateQualityList();
  }

  onDestroy(): void {
    this.stopUpdateTimer();
    this.unbindEvents();
    this.removeElements();
  }

  private findQualitySwitchPlugin(): void {
    if (!this.player) return;

    // 查找质量切换插件实例
    const plugins = (this.player as any).plugins || [];
    this.qualitySwitchPlugin = plugins.find((plugin: any) => plugin.name === 'quality-switch');
  }

  private createElements(): void {
    this.createQualityButton();
    this.createQualityPanel();
    this.createNetworkIndicator();
    this.createBufferIndicator();
  }

  private createQualityButton(): void {
    this.qualityButton = document.createElement('button');
    this.qualityButton.className = 'lv-button lv-plugin lv-plugin-quality-switch';
    this.qualityButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
      </svg>
      <span class="quality-label">自动</span>
    `;
    this.qualityButton.title = '视频质量';
  }

  private createQualityPanel(): void {
    this.qualityPanel = document.createElement('div');
    this.qualityPanel.className = 'quality-panel';
    
    const header = document.createElement('div');
    header.className = 'quality-header';
    header.innerHTML = `
      <span class="quality-title">视频质量</span>
      <div class="quality-status">
        <span class="network-status"></span>
        <span class="buffer-status"></span>
      </div>
    `;
    
    const qualityList = document.createElement('div');
    qualityList.className = 'quality-list';
    
    const autoSwitchRow = document.createElement('div');
    autoSwitchRow.className = 'quality-auto-switch';
    autoSwitchRow.innerHTML = `
      <label>
        <input type="checkbox" class="auto-switch-checkbox" checked>
        <span>自动切换</span>
      </label>
    `;
    
    const separator = document.createElement('div');
    separator.className = 'quality-separator';
    
    this.qualityPanel.appendChild(header);
    this.qualityPanel.appendChild(autoSwitchRow);
    this.qualityPanel.appendChild(separator);
    this.qualityPanel.appendChild(qualityList);
  }

  private createNetworkIndicator(): void {
    this.networkIndicator = document.createElement('div');
    this.networkIndicator.className = 'lv-plugin lv-plugin-network-indicator';
    this.networkIndicator.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1,9L23,9V7L1,7V9M1,13L23,13V11L1,11V13M1,17L23,17V15L1,15V17Z"/>
      </svg>
      <span class="network-type">4G</span>
    `;
    this.networkIndicator.title = '网络状况';
  }

  private createBufferIndicator(): void {
    this.bufferIndicator = document.createElement('div');
    this.bufferIndicator.className = 'lv-plugin lv-plugin-buffer-indicator';
    this.bufferIndicator.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
      </svg>
      <div class="buffer-bar">
        <div class="buffer-fill"></div>
      </div>
    `;
    this.bufferIndicator.title = '缓冲状况';
  }

  private bindEvents(): void {
    this.qualityButton.addEventListener('click', this.onTogglePanel.bind(this));
    
    // 自动切换开关
    const autoSwitchCheckbox = this.qualityPanel.querySelector('.auto-switch-checkbox') as HTMLInputElement;
    if (autoSwitchCheckbox) {
      autoSwitchCheckbox.addEventListener('change', this.onAutoSwitchToggle.bind(this));
    }
    
    // 点击外部关闭面板
    document.addEventListener('click', this.onDocumentClick.bind(this));
    
    // 监听质量切换事件
    if (this.player) {
      this.player.on('quality:change', this.onQualityChange.bind(this));
    }
  }

  private unbindEvents(): void {
    this.qualityButton.removeEventListener('click', this.onTogglePanel.bind(this));
    document.removeEventListener('click', this.onDocumentClick.bind(this));
    
    if (this.player) {
      this.player.off('quality:change', this.onQualityChange.bind(this));
    }
  }

  private removeElements(): void {
    [this.qualityButton, this.qualityPanel, this.networkIndicator, this.bufferIndicator].forEach(el => {
      if (el?.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  private startUpdateTimer(): void {
    if (this.updateTimer) return;
    
    this.updateTimer = window.setInterval(() => {
      this.updateIndicators();
    }, 1000); // 每秒更新一次
  }

  private stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  private updateQualityList(): void {
    if (!this.qualitySwitchPlugin) return;

    const qualityList = this.qualityPanel.querySelector('.quality-list');
    if (!qualityList) return;

    qualityList.innerHTML = '';

    const qualities = this.qualitySwitchPlugin.getQualities();
    const currentQuality = this.qualitySwitchPlugin.getCurrentQuality();

    qualities.forEach(quality => {
      const item = this.createQualityItem(quality, currentQuality?.id === quality.id);
      qualityList.appendChild(item);
    });
  }

  private createQualityItem(quality: VideoQuality, isActive: boolean): HTMLElement {
    const item = document.createElement('div');
    item.className = `quality-item ${isActive ? 'active' : ''}`;
    item.dataset.qualityId = quality.id;
    
    const info = document.createElement('div');
    info.className = 'quality-info';
    
    const label = document.createElement('div');
    label.className = 'quality-label';
    label.textContent = quality.label;
    
    const resolution = document.createElement('div');
    resolution.className = 'quality-resolution';
    resolution.textContent = `${quality.width}x${quality.height}`;
    
    info.appendChild(label);
    info.appendChild(resolution);
    
    const status = document.createElement('div');
    status.className = 'quality-status';
    
    if (quality.bitrate) {
      const bitrate = document.createElement('div');
      bitrate.className = 'quality-bitrate';
      bitrate.textContent = this.formatBitrate(quality.bitrate);
      status.appendChild(bitrate);
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'quality-indicator';
    status.appendChild(indicator);
    
    item.appendChild(info);
    item.appendChild(status);
    
    item.addEventListener('click', () => this.onSelectQuality(quality.id));
    
    return item;
  }

  private formatBitrate(bitrate: number): string {
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)}M`;
    } else if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(0)}K`;
    } else {
      return `${bitrate}`;
    }
  }

  private updateIndicators(): void {
    this.updateNetworkIndicator();
    this.updateBufferIndicator();
    this.updateQualityButton();
  }

  private updateNetworkIndicator(): void {
    if (!this.qualitySwitchPlugin) return;

    const networkInfo = this.qualitySwitchPlugin.getNetworkStatus();
    const networkType = this.networkIndicator.querySelector('.network-type');
    
    if (networkInfo && networkType) {
      networkType.textContent = networkInfo.effectiveType.toUpperCase();
      
      // 根据网络类型设置颜色
      this.networkIndicator.className = `lv-plugin lv-plugin-network-indicator network-${networkInfo.effectiveType}`;
    }
  }

  private updateBufferIndicator(): void {
    if (!this.qualitySwitchPlugin) return;

    const bufferStatus = this.qualitySwitchPlugin.getBufferStatus();
    const bufferFill = this.bufferIndicator.querySelector('.buffer-fill') as HTMLElement;
    
    if (bufferFill) {
      const percentage = Math.min(100, (bufferStatus.buffered / bufferStatus.threshold) * 100);
      bufferFill.style.width = `${percentage}%`;
      
      // 根据缓冲状况设置颜色
      this.bufferIndicator.className = `lv-plugin lv-plugin-buffer-indicator buffer-${bufferStatus.health}`;
    }
  }

  private updateQualityButton(): void {
    if (!this.qualitySwitchPlugin) return;

    const currentQuality = this.qualitySwitchPlugin.getCurrentQuality();
    const qualityLabel = this.qualityButton.querySelector('.quality-label');
    
    if (qualityLabel) {
      if (this.qualitySwitchPlugin.isAutoSwitchEnabled()) {
        qualityLabel.textContent = currentQuality ? `自动 (${currentQuality.label})` : '自动';
      } else {
        qualityLabel.textContent = currentQuality?.label || '未知';
      }
    }
  }

  private onTogglePanel(e: Event): void {
    e.stopPropagation();
    this.isPanelActive = !this.isPanelActive;
    this.qualityButton.classList.toggle('active', this.isPanelActive);
    
    if (this.isPanelActive) {
      this.updateQualityList();
    }
  }

  private onDocumentClick(e: Event): void {
    const target = e.target as HTMLElement;
    
    if (!this.qualityButton.contains(target) && !this.qualityPanel.contains(target)) {
      this.qualityButton.classList.remove('active');
      this.isPanelActive = false;
    }
  }

  private onAutoSwitchToggle(e: Event): void {
    if (!this.qualitySwitchPlugin) return;

    const checkbox = e.target as HTMLInputElement;
    this.qualitySwitchPlugin.setAutoSwitch(checkbox.checked);
    
    this.updateQualityButton();
  }

  private onSelectQuality(qualityId: string): void {
    if (!this.qualitySwitchPlugin) return;

    try {
      this.qualitySwitchPlugin.switchToQuality(qualityId, true);
      this.updateQualityList();
      this.qualityButton.classList.remove('active');
      this.isPanelActive = false;
      
    } catch (error) {
      console.error('切换质量失败:', error);
    }
  }

  private onQualityChange(): void {
    this.updateQualityList();
    this.updateQualityButton();
  }

  protected createElement(): HTMLElement {
    // UIPlugin 要求实现此方法，但我们在 createElements 中创建多个元素
    return document.createElement('div');
  }

  // 公共方法
  public updateDisplay(): void {
    this.updateQualityList();
    this.updateIndicators();
  }

  public showPanel(): void {
    this.isPanelActive = true;
    this.qualityButton.classList.add('active');
    this.updateQualityList();
  }

  public hidePanel(): void {
    this.isPanelActive = false;
    this.qualityButton.classList.remove('active');
  }
}
