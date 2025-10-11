import type { LottieInstance } from './LottieInstance';

/**
 * 音频标记配置
 */
export interface AudioMarker {
  /** 标记名称 */
  name: string;
  /** 动画帧位置 */
  frame: number;
  /** 音频时间（秒） */
  time: number;
  /** 回调函数 */
  callback?: () => void;
}

/**
 * 音效同步配置
 */
export interface AudioSyncConfig {
  /** 音频源 URL 或 AudioBuffer */
  audioSource: string | AudioBuffer;
  /** 音频标记点 */
  markers?: AudioMarker[];
  /** 是否循环播放 */
  loop?: boolean;
  /** 音量 (0-1) */
  volume?: number;
  /** 播放速率 */
  playbackRate?: number;
  /** 同步偏移（毫秒） */
  offset?: number;
  /** 音频加载完成回调 */
  onLoad?: () => void;
  /** 音频播放回调 */
  onPlay?: () => void;
  /** 音频暂停回调 */
  onPause?: () => void;
  /** 到达标记点回调 */
  onMarker?: (marker: AudioMarker) => void;
}

/**
 * 音效同步系统
 * 实现 Lottie 动画与音频的精确同步
 */
export class AudioSync {
  private animation: LottieInstance;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private markers: AudioMarker[] = [];
  private markerCheckInterval: number | null = null;
  private config: AudioSyncConfig;

  constructor(animation: LottieInstance, config: AudioSyncConfig) {
    this.animation = animation;
    this.config = {
      loop: false,
      volume: 1,
      playbackRate: 1,
      offset: 0,
      ...config,
    };

    this.markers = config.markers || [];
    this.initAudioContext();
    this.loadAudio();
  }

  /**
   * 初始化 Web Audio API 上下文
   */
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.config.volume || 1;
    } catch (error) {
      console.error('[AudioSync] Failed to initialize AudioContext:', error);
    }
  }

  /**
   * 加载音频文件
   */
  private async loadAudio(): Promise<void> {
    if (!this.audioContext) {
      console.error('[AudioSync] AudioContext not initialized');
      return;
    }

    try {
      if (this.config.audioSource instanceof AudioBuffer) {
        this.audioBuffer = this.config.audioSource;
        this.config.onLoad?.();
      } else if (typeof this.config.audioSource === 'string') {
        const response = await fetch(this.config.audioSource);
        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.config.onLoad?.();
      }
    } catch (error) {
      console.error('[AudioSync] Failed to load audio:', error);
    }
  }

  /**
   * 同步播放动画和音频
   */
  public async play(): Promise<void> {
    if (!this.audioContext || !this.audioBuffer) {
      console.warn('[AudioSync] Audio not ready');
      return;
    }

    // 恢复 AudioContext（处理浏览器自动播放策略）
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // 创建音频源节点
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.loop = this.config.loop || false;
    this.sourceNode.playbackRate.value = this.config.playbackRate || 1;
    this.sourceNode.connect(this.gainNode!);

    // 计算起始位置
    const offset = (this.config.offset || 0) / 1000;
    const startOffset = this.pauseTime > 0 ? this.pauseTime : offset;

    // 同步播放
    this.sourceNode.start(0, startOffset);
    this.animation.play();

    this.startTime = this.audioContext.currentTime - startOffset;
    this.isPlaying = true;
    this.config.onPlay?.();

    // 启动标记点检测
    this.startMarkerCheck();

    // 监听音频结束
    this.sourceNode.onended = () => {
      if (!this.config.loop) {
        this.stop();
      }
    };
  }

  /**
   * 暂停播放
   */
  public pause(): void {
    if (!this.isPlaying || !this.audioContext) return;

    this.sourceNode?.stop();
    this.animation.pause();
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.isPlaying = false;
    this.config.onPause?.();

    this.stopMarkerCheck();
  }

  /**
   * 停止播放
   */
  public stop(): void {
    this.sourceNode?.stop();
    this.animation.stop();
    this.pauseTime = 0;
    this.startTime = 0;
    this.isPlaying = false;

    this.stopMarkerCheck();
  }

  /**
   * 设置音量
   */
  public setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 设置播放速率
   */
  public setPlaybackRate(rate: number): void {
    if (this.sourceNode) {
      this.sourceNode.playbackRate.value = rate;
    }
    this.animation.setSpeed(rate);
  }

  /**
   * 跳转到指定时间
   */
  public seek(time: number): void {
    const wasPlaying = this.isPlaying;

    if (this.isPlaying) {
      this.pause();
    }

    this.pauseTime = time;

    // 同步动画帧
    const totalFrames = this.animation.getTotalFrames();
    const duration = this.audioBuffer?.duration || 0;
    const targetFrame = (time / duration) * totalFrames;
    this.animation.goToAndStop(targetFrame, true);

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * 添加音频标记点
   */
  public addMarker(marker: AudioMarker): void {
    this.markers.push(marker);
    this.markers.sort((a, b) => a.time - b.time);
  }

  /**
   * 移除音频标记点
   */
  public removeMarker(name: string): void {
    this.markers = this.markers.filter(m => m.name !== name);
  }

  /**
   * 启动标记点检测
   */
  private startMarkerCheck(): void {
    if (this.markers.length === 0) return;

    let lastCheckedIndex = -1;

    this.markerCheckInterval = window.setInterval(() => {
      if (!this.audioContext || !this.isPlaying) return;

      const currentTime = this.audioContext.currentTime - this.startTime;

      for (let i = lastCheckedIndex + 1; i < this.markers.length; i++) {
        const marker = this.markers[i];

        if (currentTime >= marker.time) {
          // 触发标记点
          marker.callback?.();
          this.config.onMarker?.(marker);
          lastCheckedIndex = i;

          // 同步动画到标记帧
          this.animation.goToAndPlay(marker.frame, true);
        } else {
          break;
        }
      }

      // 循环时重置检查索引
      if (this.config.loop && currentTime > (this.audioBuffer?.duration || 0)) {
        lastCheckedIndex = -1;
      }
    }, 50); // 每 50ms 检查一次
  }

  /**
   * 停止标记点检测
   */
  private stopMarkerCheck(): void {
    if (this.markerCheckInterval !== null) {
      clearInterval(this.markerCheckInterval);
      this.markerCheckInterval = null;
    }
  }

  /**
   * 获取当前播放时间
   */
  public getCurrentTime(): number {
    if (!this.audioContext) return 0;

    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startTime;
    }

    return this.pauseTime;
  }

  /**
   * 获取音频总时长
   */
  public getDuration(): number {
    return this.audioBuffer?.duration || 0;
  }

  /**
   * 获取播放状态
   */
  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    this.stop();
    this.sourceNode?.disconnect();
    this.gainNode?.disconnect();
    this.audioContext?.close();
    this.markers = [];
  }
}
