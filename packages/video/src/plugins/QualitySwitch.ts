/**
 * 质量切换插件
 * 支持多清晰度视频的无缝切换
 */
import { BasePlugin } from '../core/BasePlugin';
import type { IPlugin, PluginConfig } from '../types/plugins';
import type { Player } from '../core/Player';

// 视频质量接口
export interface VideoQuality {
  id: string;
  label: string;
  width: number;
  height: number;
  bitrate?: number;
  src: string;
  type?: string;
  default?: boolean;
}

// 网络状况接口
export interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// 质量切换配置接口
export interface QualitySwitchConfig extends PluginConfig {
  enabled: boolean;
  qualities: VideoQuality[];
  currentQuality?: string;
  autoSwitch: boolean;
  adaptiveBitrate: boolean;
  networkThreshold: {
    '2g': string;
    '3g': string;
    '4g': string;
    'slow-2g': string;
  };
  bufferThreshold: number;
  switchDelay: number;
  rememberChoice: boolean;
  storageKey: string;
}

export class QualitySwitch extends BasePlugin implements IPlugin {
  private currentQuality?: VideoQuality;
  private networkConnection?: any;
  private bufferMonitor?: number;
  private switchTimeout?: number;
  private isLoading: boolean = false;
  private lastSwitchTime: number = 0;

  constructor(config: Partial<QualitySwitchConfig> = {}) {
    super('quality-switch', {
      enabled: true,
      qualities: [],
      currentQuality: undefined,
      autoSwitch: true,
      adaptiveBitrate: true,
      networkThreshold: {
        '2g': '360p',
        '3g': '480p',
        '4g': '720p',
        'slow-2g': '240p'
      },
      bufferThreshold: 3, // 缓冲区低于3秒时考虑降低质量
      switchDelay: 1000, // 切换延迟1秒
      rememberChoice: true,
      storageKey: 'lv-video-quality',
      ...config
    });
  }

  onCreate(): void {
    this.initNetworkMonitoring();
    this.loadSavedQuality();
    this.bindEvents();
  }

  onMount(): void {
    if (!this.player) return;
    
    this.setupInitialQuality();
    this.startBufferMonitoring();
  }

  onDestroy(): void {
    this.stopBufferMonitoring();
    this.stopNetworkMonitoring();
    this.unbindEvents();
    
    if (this.switchTimeout) {
      clearTimeout(this.switchTimeout);
    }
  }

  private bindEvents(): void {
    if (!this.player) return;

    this.player.on('loadstart', this.onLoadStart.bind(this));
    this.player.on('canplay', this.onCanPlay.bind(this));
    this.player.on('waiting', this.onWaiting.bind(this));
    this.player.on('progress', this.onProgress.bind(this));
    this.player.on('error', this.onError.bind(this));
  }

  private unbindEvents(): void {
    if (!this.player) return;

    this.player.off('loadstart', this.onLoadStart.bind(this));
    this.player.off('canplay', this.onCanPlay.bind(this));
    this.player.off('waiting', this.onWaiting.bind(this));
    this.player.off('progress', this.onProgress.bind(this));
    this.player.off('error', this.onError.bind(this));
  }

  private onLoadStart(): void {
    this.isLoading = true;
  }

  private onCanPlay(): void {
    this.isLoading = false;
  }

  private onWaiting(): void {
    // 视频缓冲时，考虑降低质量
    if (this.shouldAutoSwitch()) {
      this.considerQualityDowngrade();
    }
  }

  private onProgress(): void {
    // 缓冲进度更新时检查是否可以提升质量
    if (this.shouldAutoSwitch() && this.hasGoodBuffer()) {
      this.considerQualityUpgrade();
    }
  }

  private onError(): void {
    // 播放错误时尝试降低质量
    if (this.shouldAutoSwitch()) {
      this.fallbackToLowerQuality();
    }
  }

  private initNetworkMonitoring(): void {
    // 检测网络连接API支持
    if ('connection' in navigator) {
      this.networkConnection = (navigator as any).connection;
      
      if (this.networkConnection) {
        this.networkConnection.addEventListener('change', this.onNetworkChange.bind(this));
      }
    }
  }

  private stopNetworkMonitoring(): void {
    if (this.networkConnection) {
      this.networkConnection.removeEventListener('change', this.onNetworkChange.bind(this));
    }
  }

  private onNetworkChange(): void {
    if (this.shouldAutoSwitch()) {
      this.adaptToNetwork();
    }
  }

  private startBufferMonitoring(): void {
    if (this.bufferMonitor) return;

    this.bufferMonitor = window.setInterval(() => {
      this.checkBufferHealth();
    }, 2000); // 每2秒检查一次缓冲状况
  }

  private stopBufferMonitoring(): void {
    if (this.bufferMonitor) {
      clearInterval(this.bufferMonitor);
      this.bufferMonitor = undefined;
    }
  }

  private checkBufferHealth(): void {
    if (!this.player || !this.shouldAutoSwitch()) return;

    const buffered = this.getBufferedTime();
    const config = this.config as QualitySwitchConfig;

    if (buffered < config.bufferThreshold) {
      this.considerQualityDowngrade();
    } else if (buffered > config.bufferThreshold * 2) {
      this.considerQualityUpgrade();
    }
  }

  private getBufferedTime(): number {
    if (!this.player?.video) return 0;

    const video = this.player.video;
    const currentTime = video.currentTime;
    const buffered = video.buffered;

    for (let i = 0; i < buffered.length; i++) {
      if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
        return buffered.end(i) - currentTime;
      }
    }

    return 0;
  }

  private setupInitialQuality(): void {
    const config = this.config as QualitySwitchConfig;
    
    if (config.qualities.length === 0) return;

    // 查找默认质量或使用第一个
    let initialQuality = config.qualities.find(q => q.default) || config.qualities[0];

    // 如果启用了自动切换，根据网络状况选择
    if (config.autoSwitch) {
      initialQuality = this.selectQualityByNetwork() || initialQuality;
    }

    // 如果有保存的用户选择，优先使用
    const savedQuality = this.getSavedQuality();
    if (savedQuality) {
      initialQuality = savedQuality;
    }

    this.switchToQuality(initialQuality.id, false);
  }

  private selectQualityByNetwork(): VideoQuality | null {
    const networkInfo = this.getNetworkInfo();
    if (!networkInfo) return null;

    const config = this.config as QualitySwitchConfig;
    const recommendedLabel = config.networkThreshold[networkInfo.effectiveType];
    
    return config.qualities.find(q => q.label.includes(recommendedLabel)) || null;
  }

  private getNetworkInfo(): NetworkInfo | null {
    if (!this.networkConnection) return null;

    return {
      effectiveType: this.networkConnection.effectiveType || '4g',
      downlink: this.networkConnection.downlink || 10,
      rtt: this.networkConnection.rtt || 100,
      saveData: this.networkConnection.saveData || false
    };
  }

  private adaptToNetwork(): void {
    const recommendedQuality = this.selectQualityByNetwork();
    if (recommendedQuality && recommendedQuality.id !== this.currentQuality?.id) {
      this.switchToQuality(recommendedQuality.id);
    }
  }

  private considerQualityDowngrade(): void {
    if (!this.currentQuality || this.isLoading) return;

    const config = this.config as QualitySwitchConfig;
    const currentIndex = config.qualities.findIndex(q => q.id === this.currentQuality!.id);
    
    if (currentIndex > 0) {
      const lowerQuality = config.qualities[currentIndex - 1];
      this.scheduleQualitySwitch(lowerQuality.id);
    }
  }

  private considerQualityUpgrade(): void {
    if (!this.currentQuality || this.isLoading) return;

    const config = this.config as QualitySwitchConfig;
    const currentIndex = config.qualities.findIndex(q => q.id === this.currentQuality!.id);
    
    if (currentIndex < config.qualities.length - 1) {
      const higherQuality = config.qualities[currentIndex + 1];
      this.scheduleQualitySwitch(higherQuality.id);
    }
  }

  private fallbackToLowerQuality(): void {
    const config = this.config as QualitySwitchConfig;
    
    // 找到最低质量
    const lowestQuality = config.qualities.reduce((lowest, current) => {
      return current.height < lowest.height ? current : lowest;
    });

    if (lowestQuality.id !== this.currentQuality?.id) {
      this.switchToQuality(lowestQuality.id);
    }
  }

  private scheduleQualitySwitch(qualityId: string): void {
    if (this.switchTimeout) {
      clearTimeout(this.switchTimeout);
    }

    const config = this.config as QualitySwitchConfig;
    
    this.switchTimeout = window.setTimeout(() => {
      this.switchToQuality(qualityId);
    }, config.switchDelay);
  }

  private shouldAutoSwitch(): boolean {
    const config = this.config as QualitySwitchConfig;
    return config.enabled && config.autoSwitch;
  }

  private hasGoodBuffer(): boolean {
    const config = this.config as QualitySwitchConfig;
    return this.getBufferedTime() > config.bufferThreshold * 1.5;
  }

  private loadSavedQuality(): void {
    const config = this.config as QualitySwitchConfig;
    
    if (!config.rememberChoice) return;

    try {
      const saved = localStorage.getItem(config.storageKey);
      if (saved) {
        const savedData = JSON.parse(saved);
        config.currentQuality = savedData.qualityId;
      }
    } catch (error) {
      console.warn('无法加载保存的质量设置:', error);
    }
  }

  private saveQualityChoice(qualityId: string): void {
    const config = this.config as QualitySwitchConfig;
    
    if (!config.rememberChoice) return;

    try {
      const data = {
        qualityId,
        timestamp: Date.now()
      };
      localStorage.setItem(config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('无法保存质量设置:', error);
    }
  }

  private getSavedQuality(): VideoQuality | null {
    const config = this.config as QualitySwitchConfig;
    
    if (!config.currentQuality) return null;

    return config.qualities.find(q => q.id === config.currentQuality) || null;
  }

  // 公共方法
  public addQuality(quality: VideoQuality): void {
    const config = this.config as QualitySwitchConfig;
    
    // 检查是否已存在
    const exists = config.qualities.find(q => q.id === quality.id);
    if (exists) {
      console.warn(`质量 ${quality.id} 已存在`);
      return;
    }

    config.qualities.push(quality);
    
    // 按分辨率排序（从低到高）
    config.qualities.sort((a, b) => a.height - b.height);
  }

  public removeQuality(qualityId: string): void {
    const config = this.config as QualitySwitchConfig;
    const index = config.qualities.findIndex(q => q.id === qualityId);
    
    if (index !== -1) {
      config.qualities.splice(index, 1);
      
      // 如果删除的是当前质量，切换到其他质量
      if (this.currentQuality?.id === qualityId && config.qualities.length > 0) {
        this.switchToQuality(config.qualities[0].id);
      }
    }
  }

  public async switchToQuality(qualityId: string, userInitiated: boolean = true): Promise<void> {
    const config = this.config as QualitySwitchConfig;
    const quality = config.qualities.find(q => q.id === qualityId);
    
    if (!quality) {
      throw new Error(`质量 ${qualityId} 不存在`);
    }

    if (this.currentQuality?.id === qualityId) {
      return; // 已经是当前质量
    }

    // 防止频繁切换
    const now = Date.now();
    if (now - this.lastSwitchTime < config.switchDelay) {
      return;
    }

    try {
      this.isLoading = true;
      this.lastSwitchTime = now;

      // 保存当前播放状态
      const currentTime = this.player?.currentTime || 0;
      const wasPlaying = !this.player?.paused;

      // 切换视频源
      if (this.player?.video) {
        this.player.video.src = quality.src;
        this.player.video.currentTime = currentTime;
        
        if (wasPlaying) {
          await this.player.video.play();
        }
      }

      this.currentQuality = quality;
      config.currentQuality = qualityId;

      // 如果是用户主动切换，保存选择
      if (userInitiated) {
        this.saveQualityChoice(qualityId);
      }

      // 触发质量切换事件
      this.player?.emit('quality:change', {
        quality,
        previousQuality: this.currentQuality,
        userInitiated
      });

      console.log(`质量已切换到: ${quality.label} (${quality.width}x${quality.height})`);

    } catch (error) {
      console.error('质量切换失败:', error);
      this.isLoading = false;
      throw error;
    }
  }

  public getCurrentQuality(): VideoQuality | undefined {
    return this.currentQuality;
  }

  public getQualities(): VideoQuality[] {
    return (this.config as QualitySwitchConfig).qualities;
  }

  public setAutoSwitch(enabled: boolean): void {
    (this.config as QualitySwitchConfig).autoSwitch = enabled;
    
    if (enabled) {
      this.startBufferMonitoring();
      this.adaptToNetwork();
    } else {
      this.stopBufferMonitoring();
    }
  }

  public isAutoSwitchEnabled(): boolean {
    return (this.config as QualitySwitchConfig).autoSwitch;
  }

  public getNetworkStatus(): NetworkInfo | null {
    return this.getNetworkInfo();
  }

  public getBufferStatus(): { buffered: number; threshold: number; health: 'good' | 'warning' | 'poor' } {
    const buffered = this.getBufferedTime();
    const threshold = (this.config as QualitySwitchConfig).bufferThreshold;
    
    let health: 'good' | 'warning' | 'poor' = 'good';
    if (buffered < threshold) {
      health = 'poor';
    } else if (buffered < threshold * 1.5) {
      health = 'warning';
    }

    return { buffered, threshold, health };
  }
}
