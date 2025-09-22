import { UIPlugin } from '../core/UIPlugin';
import { Player } from '../core/Player';
import { PluginConfig } from '../types/plugin';

export interface VideoRecorderConfig extends PluginConfig {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  maxDuration?: number; // 最大录制时长（秒）
  autoDownload?: boolean;
  filename?: string;
}

export interface RecordingSegment {
  startTime: number;
  endTime: number;
  blob: Blob;
  duration: number;
}

export class VideoRecorder extends UIPlugin {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private isPaused = false;
  private startTime = 0;
  private pausedDuration = 0;
  private config: VideoRecorderConfig;
  private stream: MediaStream | null = null;

  constructor(player: Player, config: VideoRecorderConfig = {}) {
    super(player, {
      name: 'video-recorder',
      displayName: '录制',
      ...config
    });

    this.config = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      audioBitsPerSecond: 128000,  // 128 kbps
      maxDuration: 300, // 5分钟
      autoDownload: true,
      filename: 'recording',
      ...config
    };
  }

  protected createUI(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ldesign-recorder-plugin';
    container.innerHTML = `
      <button class="ldesign-recorder-btn" title="录制">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" class="ldesign-recorder-icon-stop" style="display: none;"/>
          <circle cx="12" cy="12" r="4" class="ldesign-recorder-icon-record"/>
        </svg>
      </button>
      <div class="ldesign-recorder-panel" style="display: none;">
        <div class="ldesign-recorder-status">
          <span class="ldesign-recorder-indicator"></span>
          <span class="ldesign-recorder-time">00:00</span>
        </div>
        <div class="ldesign-recorder-controls">
          <button class="ldesign-recorder-start">开始录制</button>
          <button class="ldesign-recorder-pause" style="display: none;">暂停</button>
          <button class="ldesign-recorder-resume" style="display: none;">继续</button>
          <button class="ldesign-recorder-stop" style="display: none;">停止</button>
        </div>
        <div class="ldesign-recorder-settings">
          <label>
            质量:
            <select class="ldesign-recorder-quality">
              <option value="high">高质量 (2.5 Mbps)</option>
              <option value="medium">中等质量 (1.5 Mbps)</option>
              <option value="low">低质量 (0.8 Mbps)</option>
            </select>
          </label>
          <label>
            格式:
            <select class="ldesign-recorder-format">
              <option value="video/webm;codecs=vp9">WebM (VP9)</option>
              <option value="video/webm;codecs=vp8">WebM (VP8)</option>
              <option value="video/mp4">MP4</option>
            </select>
          </label>
          <label>
            最大时长:
            <select class="ldesign-recorder-duration">
              <option value="60">1分钟</option>
              <option value="300">5分钟</option>
              <option value="600">10分钟</option>
              <option value="1800">30分钟</option>
            </select>
          </label>
        </div>
      </div>
    `;

    this.bindEvents(container);
    return container;
  }

  private bindEvents(container: HTMLElement): void {
    const btn = container.querySelector('.ldesign-recorder-btn') as HTMLButtonElement;
    const panel = container.querySelector('.ldesign-recorder-panel') as HTMLElement;
    const startBtn = container.querySelector('.ldesign-recorder-start') as HTMLButtonElement;
    const pauseBtn = container.querySelector('.ldesign-recorder-pause') as HTMLButtonElement;
    const resumeBtn = container.querySelector('.ldesign-recorder-resume') as HTMLButtonElement;
    const stopBtn = container.querySelector('.ldesign-recorder-stop') as HTMLButtonElement;
    const qualitySelect = container.querySelector('.ldesign-recorder-quality') as HTMLSelectElement;
    const formatSelect = container.querySelector('.ldesign-recorder-format') as HTMLSelectElement;
    const durationSelect = container.querySelector('.ldesign-recorder-duration') as HTMLSelectElement;

    // 显示/隐藏面板
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
    });

    // 点击外部关闭面板
    document.addEventListener('click', () => {
      if (!this.isRecording) {
        panel.style.display = 'none';
      }
    });

    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 控制按钮事件
    startBtn.addEventListener('click', () => this.startRecording());
    pauseBtn.addEventListener('click', () => this.pauseRecording());
    resumeBtn.addEventListener('click', () => this.resumeRecording());
    stopBtn.addEventListener('click', () => this.stopRecording());

    // 设置变化事件
    qualitySelect.addEventListener('change', () => {
      const quality = qualitySelect.value;
      switch (quality) {
        case 'high':
          this.config.videoBitsPerSecond = 2500000;
          break;
        case 'medium':
          this.config.videoBitsPerSecond = 1500000;
          break;
        case 'low':
          this.config.videoBitsPerSecond = 800000;
          break;
      }
    });

    formatSelect.addEventListener('change', () => {
      this.config.mimeType = formatSelect.value;
    });

    durationSelect.addEventListener('change', () => {
      this.config.maxDuration = parseInt(durationSelect.value);
    });

    // 设置初始值
    formatSelect.value = this.config.mimeType!;
    durationSelect.value = this.config.maxDuration!.toString();
  }

  public async startRecording(): Promise<void> {
    try {
      // 获取视频流
      const video = this.player.getVideoElement();
      if (!video) {
        throw new Error('视频元素不存在');
      }

      // 创建媒体流
      this.stream = (video as any).captureStream ? 
        (video as any).captureStream() : 
        (video as any).mozCaptureStream();

      if (!this.stream) {
        throw new Error('无法捕获视频流');
      }

      // 检查浏览器支持
      if (!MediaRecorder.isTypeSupported(this.config.mimeType!)) {
        // 回退到支持的格式
        const supportedTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4'
        ];
        
        this.config.mimeType = supportedTypes.find(type => 
          MediaRecorder.isTypeSupported(type)
        ) || 'video/webm';
      }

      // 创建录制器
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.config.mimeType,
        videoBitsPerSecond: this.config.videoBitsPerSecond,
        audioBitsPerSecond: this.config.audioBitsPerSecond
      });

      this.recordedChunks = [];
      this.startTime = Date.now();
      this.pausedDuration = 0;

      // 设置事件监听
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('录制错误:', event);
        this.stopRecording();
      };

      // 开始录制
      this.mediaRecorder.start(1000); // 每秒收集一次数据
      this.isRecording = true;
      this.isPaused = false;

      this.updateUI();
      this.startTimer();

      // 设置最大录制时长
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.config.maxDuration! * 1000);

      this.player.emit('recording-started', {
        startTime: this.startTime,
        config: this.config
      });

    } catch (error) {
      console.error('开始录制失败:', error);
      this.player.emit('recording-error', { error });
    }
  }

  public pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.updateUI();
      this.player.emit('recording-paused');
    }
  }

  public resumeRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.updateUI();
      this.player.emit('recording-resumed');
    }
  }

  public stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      this.updateUI();
    }
  }

  private handleRecordingComplete(): void {
    const blob = new Blob(this.recordedChunks, { 
      type: this.config.mimeType 
    });

    const duration = (Date.now() - this.startTime - this.pausedDuration) / 1000;
    const segment: RecordingSegment = {
      startTime: this.startTime,
      endTime: Date.now(),
      blob,
      duration
    };

    this.player.emit('recording-completed', segment);

    if (this.config.autoDownload) {
      this.downloadRecording(blob);
    }
  }

  private downloadRecording(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const extension = this.config.mimeType!.includes('webm') ? 'webm' : 'mp4';
    
    link.href = url;
    link.download = `${this.config.filename}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  private updateUI(): void {
    const container = this.getContainer();
    if (!container) return;

    const startBtn = container.querySelector('.ldesign-recorder-start') as HTMLButtonElement;
    const pauseBtn = container.querySelector('.ldesign-recorder-pause') as HTMLButtonElement;
    const resumeBtn = container.querySelector('.ldesign-recorder-resume') as HTMLButtonElement;
    const stopBtn = container.querySelector('.ldesign-recorder-stop') as HTMLButtonElement;
    const indicator = container.querySelector('.ldesign-recorder-indicator') as HTMLElement;
    const recordIcon = container.querySelector('.ldesign-recorder-icon-record') as HTMLElement;
    const stopIcon = container.querySelector('.ldesign-recorder-icon-stop') as HTMLElement;

    if (this.isRecording) {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'inline-block';
      recordIcon.style.display = 'none';
      stopIcon.style.display = 'block';
      indicator.className = 'ldesign-recorder-indicator recording';

      if (this.isPaused) {
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'inline-block';
        indicator.className = 'ldesign-recorder-indicator paused';
      } else {
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';
      }
    } else {
      startBtn.style.display = 'inline-block';
      pauseBtn.style.display = 'none';
      resumeBtn.style.display = 'none';
      stopBtn.style.display = 'none';
      recordIcon.style.display = 'block';
      stopIcon.style.display = 'none';
      indicator.className = 'ldesign-recorder-indicator';
    }
  }

  private startTimer(): void {
    const updateTime = () => {
      if (!this.isRecording) return;

      const container = this.getContainer();
      if (!container) return;

      const timeDisplay = container.querySelector('.ldesign-recorder-time') as HTMLElement;
      const elapsed = (Date.now() - this.startTime - this.pausedDuration) / 1000;
      const minutes = Math.floor(elapsed / 60);
      const seconds = Math.floor(elapsed % 60);
      
      timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      if (this.isRecording) {
        requestAnimationFrame(updateTime);
      }
    };

    requestAnimationFrame(updateTime);
  }

  public getRecordingState(): {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
  } {
    const duration = this.isRecording ? 
      (Date.now() - this.startTime - this.pausedDuration) / 1000 : 0;

    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      duration
    };
  }

  public destroy(): void {
    this.stopRecording();
    super.destroy();
  }
}
