import { UIPlugin } from '../core/UIPlugin';
import { Player } from '../core/Player';
import { PluginConfig } from '../types/plugin';

export interface FilterConfig {
  name: string;
  displayName: string;
  cssFilter?: string;
  canvasFilter?: (ctx: CanvasRenderingContext2D, imageData: ImageData) => ImageData;
  intensity?: number; // 0-1
}

export interface VideoFilterConfig extends PluginConfig {
  filters?: FilterConfig[];
  enableCanvas?: boolean; // 是否启用Canvas滤镜（性能较低但效果更好）
}

export class VideoFilter extends UIPlugin {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  private currentFilter: FilterConfig | null = null;
  private config: VideoFilterConfig;
  private originalVideo: HTMLVideoElement | null = null;

  private readonly builtinFilters: FilterConfig[] = [
    {
      name: 'none',
      displayName: '无滤镜',
      cssFilter: 'none'
    },
    {
      name: 'grayscale',
      displayName: '黑白',
      cssFilter: 'grayscale(100%)'
    },
    {
      name: 'sepia',
      displayName: '复古',
      cssFilter: 'sepia(100%)'
    },
    {
      name: 'blur',
      displayName: '模糊',
      cssFilter: 'blur(2px)'
    },
    {
      name: 'brightness',
      displayName: '高亮',
      cssFilter: 'brightness(150%)'
    },
    {
      name: 'contrast',
      displayName: '高对比度',
      cssFilter: 'contrast(150%)'
    },
    {
      name: 'saturate',
      displayName: '饱和',
      cssFilter: 'saturate(200%)'
    },
    {
      name: 'hue-rotate',
      displayName: '色相旋转',
      cssFilter: 'hue-rotate(90deg)'
    },
    {
      name: 'invert',
      displayName: '反色',
      cssFilter: 'invert(100%)'
    },
    {
      name: 'vintage',
      displayName: '复古风',
      cssFilter: 'sepia(50%) contrast(120%) brightness(110%) saturate(130%)'
    },
    {
      name: 'cool',
      displayName: '冷色调',
      cssFilter: 'hue-rotate(180deg) saturate(120%) brightness(110%)'
    },
    {
      name: 'warm',
      displayName: '暖色调',
      cssFilter: 'sepia(30%) saturate(140%) brightness(110%) contrast(110%)'
    }
  ];

  constructor(player: Player, config: VideoFilterConfig = {}) {
    super(player, {
      name: 'video-filter',
      displayName: '滤镜',
      ...config
    });

    this.config = {
      filters: this.builtinFilters,
      enableCanvas: false,
      ...config
    };

    if (this.config.filters) {
      this.config.filters = [...this.builtinFilters, ...this.config.filters];
    }
  }

  protected createUI(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ldesign-filter-plugin';
    container.innerHTML = `
      <button class="ldesign-filter-btn" title="滤镜">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          <circle cx="12" cy="12" r="3" opacity="0.5"/>
        </svg>
      </button>
      <div class="ldesign-filter-panel" style="display: none;">
        <div class="ldesign-filter-header">
          <h4>视频滤镜</h4>
          <button class="ldesign-filter-reset">重置</button>
        </div>
        <div class="ldesign-filter-grid">
          ${this.config.filters!.map(filter => `
            <div class="ldesign-filter-item" data-filter="${filter.name}">
              <div class="ldesign-filter-preview" style="filter: ${filter.cssFilter || 'none'}">
                <div class="ldesign-filter-sample"></div>
              </div>
              <span class="ldesign-filter-name">${filter.displayName}</span>
            </div>
          `).join('')}
        </div>
        <div class="ldesign-filter-controls" style="display: none;">
          <label class="ldesign-filter-intensity-label">
            强度:
            <input type="range" class="ldesign-filter-intensity" min="0" max="100" value="100">
            <span class="ldesign-filter-intensity-value">100%</span>
          </label>
          <div class="ldesign-filter-actions">
            <button class="ldesign-filter-apply">应用</button>
            <button class="ldesign-filter-cancel">取消</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    return container;
  }

  private bindEvents(container: HTMLElement): void {
    const btn = container.querySelector('.ldesign-filter-btn') as HTMLButtonElement;
    const panel = container.querySelector('.ldesign-filter-panel') as HTMLElement;
    const resetBtn = container.querySelector('.ldesign-filter-reset') as HTMLButtonElement;
    const filterItems = container.querySelectorAll('.ldesign-filter-item');
    const controls = container.querySelector('.ldesign-filter-controls') as HTMLElement;
    const intensitySlider = container.querySelector('.ldesign-filter-intensity') as HTMLInputElement;
    const intensityValue = container.querySelector('.ldesign-filter-intensity-value') as HTMLElement;
    const applyBtn = container.querySelector('.ldesign-filter-apply') as HTMLButtonElement;
    const cancelBtn = container.querySelector('.ldesign-filter-cancel') as HTMLButtonElement;

    // 显示/隐藏面板
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
    });

    // 点击外部关闭面板
    document.addEventListener('click', () => {
      panel.style.display = 'none';
    });

    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 重置滤镜
    resetBtn.addEventListener('click', () => {
      this.applyFilter(this.config.filters![0]); // 应用"无滤镜"
      this.updateActiveFilter(container, 'none');
      controls.style.display = 'none';
    });

    // 滤镜选择
    filterItems.forEach(item => {
      item.addEventListener('click', () => {
        const filterName = item.getAttribute('data-filter')!;
        const filter = this.config.filters!.find(f => f.name === filterName);
        
        if (filter) {
          this.currentFilter = filter;
          this.updateActiveFilter(container, filterName);
          
          if (filterName === 'none') {
            this.applyFilter(filter);
            controls.style.display = 'none';
          } else {
            controls.style.display = 'block';
            intensitySlider.value = '100';
            intensityValue.textContent = '100%';
          }
        }
      });
    });

    // 强度调节
    intensitySlider.addEventListener('input', () => {
      const intensity = parseInt(intensitySlider.value);
      intensityValue.textContent = `${intensity}%`;
      
      if (this.currentFilter) {
        this.previewFilter(this.currentFilter, intensity / 100);
      }
    });

    // 应用滤镜
    applyBtn.addEventListener('click', () => {
      if (this.currentFilter) {
        const intensity = parseInt(intensitySlider.value) / 100;
        this.applyFilter(this.currentFilter, intensity);
      }
      controls.style.display = 'none';
    });

    // 取消
    cancelBtn.addEventListener('click', () => {
      this.resetFilter();
      controls.style.display = 'none';
    });

    // 初始化
    this.updateActiveFilter(container, 'none');
  }

  private updateActiveFilter(container: HTMLElement, filterName: string): void {
    const filterItems = container.querySelectorAll('.ldesign-filter-item');
    filterItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-filter') === filterName);
    });
  }

  private previewFilter(filter: FilterConfig, intensity: number = 1): void {
    const video = this.player.getVideoElement();
    if (!video) return;

    if (this.config.enableCanvas && filter.canvasFilter) {
      this.applyCanvasFilter(filter, intensity);
    } else if (filter.cssFilter) {
      this.applyCSSFilter(filter, intensity);
    }
  }

  public applyFilter(filter: FilterConfig, intensity: number = 1): void {
    const video = this.player.getVideoElement();
    if (!video) return;

    this.currentFilter = filter;

    if (filter.name === 'none') {
      this.resetFilter();
      return;
    }

    if (this.config.enableCanvas && filter.canvasFilter) {
      this.applyCanvasFilter(filter, intensity);
    } else if (filter.cssFilter) {
      this.applyCSSFilter(filter, intensity);
    }

    this.player.emit('filter-applied', {
      filter: filter.name,
      intensity
    });
  }

  private applyCSSFilter(filter: FilterConfig, intensity: number): void {
    const video = this.player.getVideoElement();
    if (!video || !filter.cssFilter) return;

    if (intensity === 1) {
      video.style.filter = filter.cssFilter;
    } else {
      // 调整滤镜强度
      const adjustedFilter = this.adjustFilterIntensity(filter.cssFilter, intensity);
      video.style.filter = adjustedFilter;
    }
  }

  private adjustFilterIntensity(cssFilter: string, intensity: number): string {
    // 简单的强度调整，将百分比值乘以强度
    return cssFilter.replace(/(\d+(?:\.\d+)?)%/g, (match, value) => {
      const numValue = parseFloat(value);
      const adjustedValue = numValue * intensity;
      return `${adjustedValue}%`;
    }).replace(/(\d+(?:\.\d+)?)deg/g, (match, value) => {
      const numValue = parseFloat(value);
      const adjustedValue = numValue * intensity;
      return `${adjustedValue}deg`;
    }).replace(/blur\((\d+(?:\.\d+)?)px\)/g, (match, value) => {
      const numValue = parseFloat(value);
      const adjustedValue = numValue * intensity;
      return `blur(${adjustedValue}px)`;
    });
  }

  private applyCanvasFilter(filter: FilterConfig, intensity: number): void {
    const video = this.player.getVideoElement();
    if (!video || !filter.canvasFilter) return;

    if (!this.canvas) {
      this.setupCanvas();
    }

    if (!this.canvas || !this.ctx) return;

    const processFrame = () => {
      if (!this.canvas || !this.ctx || !video) return;

      // 设置canvas尺寸
      if (this.canvas.width !== video.videoWidth || this.canvas.height !== video.videoHeight) {
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
      }

      // 绘制视频帧
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

      // 获取图像数据
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

      // 应用滤镜
      const filteredData = filter.canvasFilter!(this.ctx, imageData);

      // 绘制处理后的图像
      this.ctx.putImageData(filteredData, 0, 0);

      // 继续下一帧
      if (this.currentFilter === filter) {
        this.animationFrame = requestAnimationFrame(processFrame);
      }
    };

    // 开始处理
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(processFrame);
  }

  private setupCanvas(): void {
    const video = this.player.getVideoElement();
    if (!video) return;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // 替换视频元素
    this.originalVideo = video;
    this.canvas.style.cssText = video.style.cssText;
    this.canvas.className = video.className;
    
    video.parentNode?.insertBefore(this.canvas, video);
    video.style.display = 'none';
  }

  private resetFilter(): void {
    const video = this.player.getVideoElement();
    if (video) {
      video.style.filter = 'none';
    }

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.canvas && this.originalVideo) {
      this.originalVideo.style.display = '';
      this.canvas.parentNode?.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
      this.originalVideo = null;
    }

    this.currentFilter = null;
    this.player.emit('filter-reset');
  }

  public getCurrentFilter(): FilterConfig | null {
    return this.currentFilter;
  }

  public addCustomFilter(filter: FilterConfig): void {
    this.config.filters!.push(filter);
    // 重新创建UI以包含新滤镜
    const container = this.getContainer();
    if (container) {
      const newUI = this.createUI();
      container.parentNode?.replaceChild(newUI, container);
    }
  }

  public destroy(): void {
    this.resetFilter();
    super.destroy();
  }
}
