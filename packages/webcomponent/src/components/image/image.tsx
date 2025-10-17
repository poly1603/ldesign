import { Component, Prop, State, Event, EventEmitter, Watch, h, Host, Element, Fragment } from '@stencil/core';

/**
 * Image 图片组件
 * - 支持懒加载（IntersectionObserver + 原生 loading）
 * - 支持占位/骨架、错误占位、回退图
 * - 支持响应式图片（srcset/sizes）
 * - 支持 object-fit / object-position
 * - 支持预览（遮罩、缩放、拖拽）
 */
@Component({
  tag: 'ldesign-image',
  styleUrl: 'image.less',
  shadow: false,
})
export class LdesignImage {
  @Element() el!: HTMLElement;

  // 基本属性
  /** 图片地址 */
  @Prop() src!: string;
  /** 替代文本 */
  @Prop() alt?: string;
  /** 提示文本（用于 img 的 title 属性，为避免与 HTMLElement.title 冲突，这里命名为 imgTitle）*/
  @Prop() imgTitle?: string;
  /** 宽度（number 自动补 px，string 原样输出，如 '50%'、'320px'）*/
  @Prop() width?: number | string;
  /** 高度（number 自动补 px，string 原样输出，如 '50%'、'200px'）*/
  @Prop() height?: number | string;
  /** 圆角（number 自动补 px，string 原样输出）*/
  @Prop() radius?: number | string;

  // 呈现控制
  /** object-fit */
  @Prop() fit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' = 'cover';
  /** object-position */
  @Prop() position: string = 'center center';
  /** 是否禁用（影响交互，如预览）*/
  @Prop() disabled: boolean = false;

  // 懒加载
  /** 是否懒加载（首屏建议关闭）*/
  @Prop() lazy: boolean = true;
  /** IntersectionObserver rootMargin（预加载阈值）*/
  @Prop() intersectionRootMargin: string = '200px';

  // 网络/浏览器属性
  /** HTMLImageElement.decoding */
  @Prop() decoding: 'async' | 'sync' | 'auto' = 'auto';
  /** crossorigin */
  @Prop() crossorigin?: 'anonymous' | 'use-credentials';
  /** referrerPolicy */
  @Prop() referrerPolicy?: string;
  /** 响应式图片 srcset */
  @Prop() srcset?: string;
  /** 响应式图片 sizes */
  @Prop() sizes?: string;
  /** 图片加载优先级 */
  @Prop() fetchpriority?: 'high' | 'low' | 'auto' = 'auto';

  /**
   * 期望的宽高比（用于在未设置高度、尚未加载时提供正确的占位比例，避免布局抖动）
   * - 可传 16/9、4/3 等字符串，或数值（如 1.777）
   * - 若不传，则在图片加载完成后自动以 naturalWidth/naturalHeight 填充比例
   */
  @Prop() ratio?: string | number;

  // 占位/失败/回退
  /** 自定义占位图 URL（优先级高于骨架）*/
  @Prop() placeholder?: string;
  /** 占位背景颜色（无自定义占位图时显示）*/
  @Prop() placeholderColor: string = '#f5f5f5';
  /** 是否展示加载中骨架（当无自定义占位图时）*/
  @Prop() showLoading: boolean = true;
  /** 失败时的回退图片 URL */
  @Prop() fallback?: string;
  /** 是否展示错误占位层 */
  @Prop() showError: boolean = true;

  // 预览
  /** 点击开启预览 */
  @Prop() preview: boolean = false;
  /** 预览使用的高清图（不填则使用 src）*/
  @Prop() previewSrc?: string;
  /** 预览遮罩主题 */
  @Prop() previewBackdrop: 'dark' | 'light' = 'dark';
  /** 预览是否可缩放 */
  @Prop() zoomable: boolean = true;
  /** 是否允许拖拽原图（仅影响 img 的原生 draggable 属性，预览层可拖拽不受此限制）*/
  @Prop() imgDraggable: boolean = false;
  /** 预览工具栏显示下载按钮 */
  @Prop() downloadable: boolean = true;
  /** 预览工具栏显示旋转按钮 */
  @Prop() rotatable: boolean = true;
  /** 预览工具栏显示全屏按钮 */
  @Prop() fullscreenable: boolean = true;
  /** 显示图片信息（尺寸、大小等） */
  @Prop() showInfo: boolean = false;
  /** 使用外部预览组件（用于多图gallery模式） */
  @Prop() useExternalPreview: boolean = false;
  /** 预览图片组（用于gallery模式） */
  @Prop() previewImages: string[] = [];
  /** 当前图片在预览组中的索引 */
  @Prop() previewCurrentIndex: number = 0;

  // 形状与展示
  /** 形状：square（默认）| rounded | circle */
  @Prop() shape: 'square' | 'rounded' | 'circle' = 'square';

  // 高级图片源（<picture>）
  /** 多源图片，支持 AVIF/WebP 等，JSON 字符串或对象数组：[{ type, srcset, media? }] */
  @Prop() sources?: string | Array<{ type: string; srcset: string; media?: string }>; 

  // GIF 控制
  /** GIF 默认静止，点击播放。建议同时提供 gifPreviewSrc（第一帧快照）与 ratio 避免CLS */
  @Prop() gifPlayOnClick: boolean = false;
  /** GIF 静止时展示的静态预览图（例如第一帧 webp/jpg） */
  @Prop() gifPreviewSrc?: string;

  // 错误重试
  /** 显示重试按钮 */
  @Prop() retryable: boolean = true;
  /** 最大重试次数 */
  @Prop() maxRetries: number = 3;

  // 加载进度
  /** 显示加载进度条 */
  @Prop() showProgress: boolean = false;

  // 图像处理
  /** 图片滤镜效果 */
  @Prop() filter?: 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast' | 'none' = 'none';
  /** 水印文本 */
  @Prop() watermark?: string;
  /** 水印位置 */
  @Prop() watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right';
  /** BlurHash 占位符 */
  @Prop() blurhash?: string;
  
  // 图片对比
  /** 启用图片对比模式 */
  @Prop() comparison: boolean = false;
  /** 对比图片源 */
  @Prop() comparisonSrc?: string;

  // 事件
  /** 加载成功 */
  @Event() ldesignLoad!: EventEmitter<{ width: number; height: number; src: string; size?: number }>;
  /** 加载失败 */
  @Event() ldesignError!: EventEmitter<{ src: string; error: string }>;
  /** 预览打开 */
  @Event() ldesignPreviewOpen!: EventEmitter<void>;
  /** 预览关闭 */
  @Event() ldesignPreviewClose!: EventEmitter<void>;
  /** 图片下载 */
  @Event() ldesignDownload!: EventEmitter<{ src: string; filename: string }>;

  // 内部状态
  @State() intersected: boolean = false;
  @State() loaded: boolean = false;
  @State() error: boolean = false;
  @State() usingFallback: boolean = false;
  /** 已解析到的原图比例（naturalWidth / naturalHeight） */
  @State() naturalRatio?: number;

  // 预览状态
  @State() previewVisible: boolean = false;
  @State() previewScale: number = 1;
  @State() previewOffsetX: number = 0;
  @State() previewOffsetY: number = 0;
  @State() previewRotate: number = 0;
  @State() isFullscreen: boolean = false;
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private startOffsetX = 0;
  private startOffsetY = 0;
  
  // 触摸手势支持
  private touchStartDistance = 0;
  private initialScale = 1;

  // 加载进度状态
  @State() loadProgress: number = 0;
  @State() imageSize?: number;
  @State() retryCount: number = 0;
  
  // 对比模式状态
  @State() comparisonPosition: number = 50; // 百分比
  private isDraggingComparison = false;

  private io?: IntersectionObserver;
  private imgEl?: HTMLImageElement;
  private defaultFallbackDataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f2f4f7"/><stop offset="100%" stop-color="#e5e7eb"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><g fill="#9aa4b2" opacity="0.8"><circle cx="70" cy="70" r="28"/><rect x="120" y="50" width="220" height="18" rx="9"/><rect x="120" y="78" width="160" height="12" rx="6"/></g></svg>`);

  private isGifSrc(src?: string): boolean { return !!src && /\.gif(\?|$)/i.test(src); }

  @State() isGifPlaying: boolean = false;

  // 监听 src 变更，重置状态
  @Watch('src')
  onSrcChange() {
    this.resetState();
    this.setupOrLoad();
  }

  componentDidLoad() {
    this.setupOrLoad();
  }

  componentDidRender() {
    // 避免 TSX 属性类型不兼容，运行时补充 referrerpolicy 和 fetchpriority
    if (this.imgEl) {
      if (this.referrerPolicy) {
        try {
          this.imgEl.setAttribute('referrerpolicy', this.referrerPolicy);
        } catch {}
      }
      if (this.fetchpriority) {
        try {
          this.imgEl.setAttribute('fetchpriority', this.fetchpriority);
        } catch {}
      }
    }
  }

  disconnectedCallback() {
    this.teardownIO();
    this.unbindPreviewKey();
  }

  private resetState() {
    this.loaded = false;
    this.error = false;
    this.usingFallback = false;
    // 重置预览偏移
    this.previewScale = 1;
    this.previewOffsetX = 0;
    this.previewOffsetY = 0;
    this.previewRotate = 0;
    this.isFullscreen = false;
    this.loadProgress = 0;
    this.retryCount = 0;
  }

  private setupOrLoad() {
    if (!this.lazy) {
      this.intersected = true;
      return;
    }

    if ('IntersectionObserver' in window) {
      this.teardownIO();
      this.io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              this.intersected = true;
              this.teardownIO();
              break;
            }
          }
        },
        { root: null, rootMargin: this.intersectionRootMargin, threshold: 0.01 }
      );
      this.io.observe(this.el);
    } else {
      // 不支持 IO，退化为原生 lazy
      this.intersected = true;
    }
  }

  private teardownIO() {
    try { this.io?.disconnect(); } catch {}
    this.io = undefined;
  }

  private parseRatio(val?: string | number): number | undefined {
    if (val == null) return undefined;
    if (typeof val === 'number' && isFinite(val) && val > 0) return val;
    const s = String(val).trim();
    // 支持 "16/9" 或 "4:3" 或  "1.777"
    const m = s.match(/^(\d+(?:\.\d+)?)\s*[/:]\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const a = parseFloat(m[1]);
      const b = parseFloat(m[2]);
      if (a > 0 && b > 0) return a / b;
    }
    const n = parseFloat(s);
    if (isFinite(n) && n > 0) return n;
    return undefined;
  }

  private getAspectRatio(): number | undefined {
    // 优先使用显式 ratio
    const byProp = this.parseRatio(this.ratio);
    if (byProp) return byProp;
    // 其次，如果显式给了 width/height 且都是数值，则可推导
    const wNum = typeof this.width === 'number' ? this.width : undefined;
    const hNum = typeof this.height === 'number' ? this.height : undefined;
    if (!hNum && wNum && this.naturalRatio) return this.naturalRatio; // 只给 width 时，加载后用 naturalRatio
    if (wNum && hNum && hNum > 0) return wNum / hNum;
    // 最后，回退到已知 naturalRatio（在图片加载完成后会填充）
    if (this.naturalRatio) return this.naturalRatio;
    return undefined;
  }

  private getWrapperStyle(): { [key: string]: string } {
    const s: { [key: string]: string } = {};
    // 默认宽度铺满父层
    if (this.width != null) s.width = typeof this.width === 'number' ? `${this.width}px` : String(this.width);
    else s.width = '100%';

    if (this.height != null) s.height = typeof this.height === 'number' ? `${this.height}px` : String(this.height);

    if (this.radius != null) s.borderRadius = typeof this.radius === 'number' ? `${this.radius}px` : String(this.radius);

    // 未设置高度时，使用 aspect-ratio 来维持占位比例
    if (this.height == null) {
      const r = this.getAspectRatio();
      if (r && isFinite(r) && r > 0) {
        s.aspectRatio = `${r} / 1`;
      }
    }
    
    // 如果设置了尺寸但图片还未加载，确保容器有背景色
    if (!this.loaded && !this.error) {
      s.backgroundColor = this.placeholderColor;
    }
    
    return s;
  }

  private getImgStyle(): { [key: string]: string } {
    const style: any = {
      objectFit: this.fit,
      objectPosition: this.position,
      opacity: this.loaded && !this.error ? '1' : '0',
    };
    
    // 应用滤镜效果
    if (this.filter && this.filter !== 'none') {
      switch (this.filter) {
        case 'grayscale':
          style.filter = 'grayscale(100%)';
          break;
        case 'sepia':
          style.filter = 'sepia(80%)';
          break;
        case 'blur':
          style.filter = 'blur(4px)';
          break;
        case 'brightness':
          style.filter = 'brightness(1.2)';
          break;
        case 'contrast':
          style.filter = 'contrast(1.3)';
          break;
      }
    }
    
    return style;
  }

  private onImgLoad = (ev: Event) => {
    this.loaded = true;
    this.error = false;
    this.loadProgress = 100;
    const img = ev.currentTarget as HTMLImageElement;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      this.naturalRatio = img.naturalWidth / img.naturalHeight;
    }
    // Estimate image size if possible
    this.estimateImageSize(img.currentSrc || img.src);
    this.ldesignLoad.emit({ 
      width: img.naturalWidth, 
      height: img.naturalHeight, 
      src: img.currentSrc || img.src,
      size: this.imageSize 
    });
  };

  private onImgError = () => {
    if (!this.usingFallback && this.retryCount < this.maxRetries) {
      // 重试逻辑
      this.retryCount++;
      setTimeout(() => {
        if (this.imgEl) this.imgEl.src = this.src + (this.src.includes('?') ? '&' : '?') + '_retry=' + this.retryCount;
      }, 1000 * this.retryCount);
      return;
    }
    if (!this.usingFallback && this.fallback) {
      // 使用用户提供的 fallback
      this.usingFallback = true;
      const fallbackUrl = this.fallback || this.defaultFallbackDataUri;
      if (this.imgEl) this.imgEl.src = fallbackUrl;
      return;
    }
    this.error = true;
    this.loaded = false;
    this.loadProgress = 0;
    this.ldesignError.emit({ src: this.src, error: 'load error' });
  };

  private handleClick = () => {
    if (this.disabled) return;

    // GIF 点击播放逻辑
    if (this.gifPlayOnClick && this.isGifSrc(this.src) && !this.isGifPlaying) {
      this.isGifPlaying = true;
      if (this.imgEl && this.src) this.imgEl.src = this.src; // 开始播放
      return;
    }

    if (!this.preview) return;
    if (!this.loaded || this.error) return;
    this.openPreview();
  };

  // 预览相关
  private keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this.isFullscreen) {
        this.exitFullscreen();
      } else if (this.previewVisible) {
        this.closePreview();
      }
    }
    if (!this.previewVisible) return;
    if (this.zoomable) {
      if (e.key === '+' || e.key === '=') this.zoom(0.1);
      if (e.key === '-') this.zoom(-0.1);
      if (e.key === '0') this.resetPreviewTransform();
    }
    if (this.rotatable) {
      if (e.key === 'ArrowLeft') this.rotate(-90);
      if (e.key === 'ArrowRight') this.rotate(90);
    }
  };

  private bindPreviewKey() { document.addEventListener('keydown', this.keyHandler); }
  private unbindPreviewKey() { document.removeEventListener('keydown', this.keyHandler); }

  private openPreview() {
    if (this.useExternalPreview) {
      // 使用外部预览组件（支持多图）
      this.openExternalPreview();
    } else {
      // 使用内置预览
      this.previewVisible = true;
      this.ldesignPreviewOpen.emit();
      this.bindPreviewKey();
    }
  }
  
  private openExternalPreview() {
    // 使用 ldesign-image-viewer 组件（支持多图gallery预览）
    let viewerEl = document.querySelector('ldesign-image-viewer') as any;
    if (!viewerEl) {
      viewerEl = document.createElement('ldesign-image-viewer') as any;
      document.body.appendChild(viewerEl);
    }
    
    // 准备图片数据
    const images = this.previewImages.length > 0 
      ? this.previewImages.map(src => ({ src })) 
      : [{ src: this.previewSrc || this.src }];
    const index = this.previewImages.length > 0 ? this.previewCurrentIndex : 0;
    
    // 配置并显示预览器
    viewerEl.images = images;
    viewerEl.startIndex = index;
    viewerEl.visible = true;
    
    // 监听关闭事件
    const handleClose = () => {
      viewerEl.removeEventListener('ldesignClose', handleClose);
      this.ldesignPreviewClose.emit();
    };
    viewerEl.addEventListener('ldesignClose', handleClose);
    
    this.ldesignPreviewOpen.emit();
  }

  private closePreview = () => {
    this.previewVisible = false;
    this.ldesignPreviewClose.emit();
    this.resetPreviewTransform();
    this.unbindPreviewKey();
  };

  private resetPreviewTransform() {
    this.previewScale = 1;
    this.previewOffsetX = 0;
    this.previewOffsetY = 0;
    this.previewRotate = 0;
  }

  private onWheel = (e: WheelEvent) => {
    if (!this.zoomable) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.zoom(delta);
  };

  private zoom(delta: number) {
    const next = Math.min(4, Math.max(0.25, this.previewScale + delta));
    this.previewScale = Number(next.toFixed(2));
  }

  private onDblClick = (e: MouseEvent) => {
    if (!this.zoomable) return;
    e.preventDefault();
    if (this.previewScale === 1) this.previewScale = 2; else this.previewScale = 1;
    this.previewOffsetX = 0; this.previewOffsetY = 0;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (!this.zoomable) return;
    this.dragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.startOffsetX = this.previewOffsetX;
    this.startOffsetY = this.previewOffsetY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.previewOffsetX = this.startOffsetX + dx;
    this.previewOffsetY = this.startOffsetY + dy;
  };

  private onPointerUp = (e: PointerEvent) => {
    this.dragging = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  private getRootClass(): string {
    const cls = ['ldesign-image'];
    if (this.preview && !this.disabled) cls.push('ldesign-image--previewable');
    if (this.loaded && !this.error) cls.push('ldesign-image--loaded');
    if (!this.loaded && !this.error) cls.push('ldesign-image--loading');
    if (this.error) cls.push('ldesign-image--error');
    if (this.shape === 'rounded') cls.push('ldesign-image--shape-rounded');
    if (this.shape === 'circle') cls.push('ldesign-image--shape-circle');
    // 如果设置了明确尺寸，添加标记类
    if ((this.width != null && this.height != null) || (this.width != null && this.ratio != null)) {
      cls.push('ldesign-image--has-size');
    }
    return cls.join(' ');
  }

  private parseSources(): Array<{ type: string; srcset: string; media?: string }> | undefined {
    const val = this.sources as any;
    if (!val) return undefined;
    if (Array.isArray(val)) return val;
    try { const arr = JSON.parse(String(val)); return Array.isArray(arr) ? arr : undefined; } catch { return undefined; }
  }

  // 新增功能方法
  private rotate(deg: number) {
    this.previewRotate = (this.previewRotate + deg) % 360;
  }

  private async downloadImage() {
    const src = this.previewSrc || this.src;
    const filename = src.split('/').pop()?.split('?')[0] || 'image.jpg';
    
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.ldesignDownload.emit({ src, filename });
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  private toggleFullscreen() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enterFullscreen() {
    const elem = this.el.querySelector('.ldesign-image__preview') as HTMLElement;
    if (elem?.requestFullscreen) {
      elem.requestFullscreen();
      this.isFullscreen = true;
    }
  }

  private exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  private async copyImageUrl() {
    const url = this.previewSrc || this.src;
    try {
      await navigator.clipboard.writeText(url);
      // You could emit an event or show a toast here
      
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }

  private estimateImageSize(src: string) {
    // This is a rough estimation based on loaded image
    // In a real scenario, you might want to get this from response headers
    if (this.imgEl) {
      const img = this.imgEl;
      // Rough estimation: width * height * 3 bytes (RGB) / compression factor
      const estimatedBytes = (img.naturalWidth * img.naturalHeight * 3) / 10;
      this.imageSize = Math.round(estimatedBytes);
    }
  }

  private formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private retryLoad = () => {
    this.retryCount = 0;
    this.error = false;
    this.loaded = false;
    this.usingFallback = false;
    if (this.imgEl) {
      this.imgEl.src = this.src;
    }
  }

  // 对比模式相关方法
  private onComparisonPointerDown = (e: PointerEvent) => {
    if (!this.comparison) return;
    this.isDraggingComparison = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.updateComparisonPosition(e);
  };

  private onComparisonPointerMove = (e: PointerEvent) => {
    if (!this.isDraggingComparison) return;
    this.updateComparisonPosition(e);
  };

  private onComparisonPointerUp = (e: PointerEvent) => {
    this.isDraggingComparison = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  private updateComparisonPosition(e: PointerEvent) {
    const rect = this.el.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    this.comparisonPosition = (x / rect.width) * 100;
  }

  // 触摸手势支持
  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // 双指缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      this.touchStartDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      this.initialScale = this.previewScale;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && this.touchStartDistance > 0) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = (currentDistance / this.touchStartDistance) * this.initialScale;
      this.previewScale = Math.min(4, Math.max(0.25, scale));
    }
  };

  private onTouchEnd = () => {
    this.touchStartDistance = 0;
  };

  render() {
    const shouldRenderImg = (this.intersected || !this.lazy) && (!this.gifPlayOnClick || !this.isGifSrc(this.src) || this.isGifPlaying);
    const actualSrc = this.usingFallback ? (this.fallback || this.defaultFallbackDataUri) : this.src;
    const pictureSources = this.parseSources();

    const imgNode = (
      <img
        ref={el => (this.imgEl = el as HTMLImageElement)}
        class="ldesign-image__img"
        src={shouldRenderImg ? actualSrc : (this.gifPlayOnClick && this.isGifSrc(this.src) ? (this.gifPreviewSrc || undefined) : undefined)}
        alt={this.alt}
        title={this.imgTitle}
        decoding={this.decoding}
        crossOrigin={this.crossorigin}
        srcSet={this.srcset}
        sizes={this.sizes}
        loading={this.lazy ? 'lazy' : 'eager'}
        draggable={this.disabled ? false : (this.imgDraggable as any)}
        style={this.getImgStyle()}
        onLoad={this.onImgLoad}
        onError={this.onImgError}
      />
    );

    return (
      <Host>
        <div class={this.getRootClass()} style={this.getWrapperStyle()} onClick={this.handleClick}>
          {/* 主图像（支持 <picture> 多源） */}
          {pictureSources && shouldRenderImg ? (
            <picture>
              {pictureSources.map((s) => (
                <source type={s.type} srcSet={s.srcset} media={s.media} />
              ))}
              {imgNode}
            </picture>
          ) : (
            imgNode
          )}

          {/* 加载中占位（或者 GIF 静止预览）*/}
          {!this.loaded && !this.error && (
            this.placeholder ? (
              <img class="ldesign-image__placeholder" src={this.placeholder} aria-hidden="true" />
            ) : this.gifPlayOnClick && this.isGifSrc(this.src) && this.gifPreviewSrc ? (
              <img class="ldesign-image__placeholder" src={this.gifPreviewSrc} aria-hidden="true" />
            ) : (
              // 默认显示加载骨架（只要设置了宽高或 ratio）
              <div class="ldesign-image__skeleton">
                {this.showLoading && <div class="ldesign-image__spinner"></div>}
              </div>
            )
          )}

          {/* 加载进度条 */}
          {this.showProgress && !this.loaded && !this.error && this.loadProgress > 0 && this.loadProgress < 100 && (
            <div class="ldesign-image__progress">
              <div class="ldesign-image__progress-bar" style={{ width: `${this.loadProgress}%` }}></div>
            </div>
          )}

          {/* 错误占位 */}
          {this.error && this.showError && (
            <div class="ldesign-image__error">
              <ldesign-icon name="image-off" />
              <span>图片加载失败</span>
              {this.retryable && (
                <button class="ldesign-image__retry" onClick={this.retryLoad}>
                  <ldesign-icon name="refresh-cw" />
                  <span>重试</span>
                </button>
              )}
            </div>
          )}

          {/* 水印 */}
          {this.watermark && this.loaded && !this.error && (
            <div class={`ldesign-image__watermark ldesign-image__watermark--${this.watermarkPosition}`}>
              {this.watermark}
            </div>
          )}

          {/* 对比模式 */}
          {this.comparison && this.comparisonSrc && this.loaded && !this.error && (
            <div class="ldesign-image__comparison">
              <div class="ldesign-image__comparison-overlay" style={{ clipPath: `inset(0 ${100 - this.comparisonPosition}% 0 0)` }}>
                <img
                  class="ldesign-image__img"
                  src={this.comparisonSrc}
                  alt={this.alt}
                  style={this.getImgStyle()}
                />
              </div>
              <div 
                class="ldesign-image__comparison-slider"
                style={{ left: `${this.comparisonPosition}%` }}
                onPointerDown={this.onComparisonPointerDown}
                onPointerMove={this.onComparisonPointerMove}
                onPointerUp={this.onComparisonPointerUp}
              >
                <div class="ldesign-image__comparison-handle">
                  <ldesign-icon name="chevrons-left-right" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 预览层 */}
        {this.preview && this.previewVisible && (
          <div 
            class={"ldesign-image__preview " + (this.previewBackdrop === 'dark' ? 'ldesign-image__preview--dark' : 'ldesign-image__preview--light')}
            onClick={this.closePreview}
          >
            <div 
              class="ldesign-image__preview-inner" 
              onClick={e => e.stopPropagation()}
              onTouchStart={this.onTouchStart}
              onTouchMove={this.onTouchMove}
              onTouchEnd={this.onTouchEnd}
            >
              <img
                class="ldesign-image__preview-img"
                src={this.previewSrc || this.src}
                alt={this.alt}
                onWheel={this.onWheel}
                onDblClick={this.onDblClick}
                onPointerDown={this.onPointerDown}
                onPointerMove={this.onPointerMove}
                onPointerUp={this.onPointerUp}
                style={{
                  transform: `translate(${this.previewOffsetX}px, ${this.previewOffsetY}px) scale(${this.previewScale}) rotate(${this.previewRotate}deg)`,
                  cursor: this.zoomable ? (this.dragging ? 'grabbing' : 'grab') : 'default',
                }}
              />
              <div class="ldesign-image__preview-toolbar">
                {this.zoomable && (
                  <Fragment>
                    <button class="ldesign-image__tool" onClick={() => this.zoom(-0.1)} aria-label="缩小" title="缩小 (-)">
                      <ldesign-icon name="minus" />
                    </button>
                    <span class="ldesign-image__zoom-text">{Math.round(this.previewScale * 100)}%</span>
                    <button class="ldesign-image__tool" onClick={() => this.zoom(0.1)} aria-label="放大" title="放大 (+)">
                      <ldesign-icon name="plus" />
                    </button>
                    <button class="ldesign-image__tool" onClick={() => this.resetPreviewTransform()} aria-label="重置" title="重置 (0)">
                      <ldesign-icon name="refresh-ccw" />
                    </button>
                  </Fragment>
                )}
                {this.rotatable && (
                  <Fragment>
                    <button class="ldesign-image__tool" onClick={() => this.rotate(-90)} aria-label="向左旋转" title="向左旋转 (←)">
                      <ldesign-icon name="rotate-ccw" />
                    </button>
                    <button class="ldesign-image__tool" onClick={() => this.rotate(90)} aria-label="向右旋转" title="向右旋转 (→)">
                      <ldesign-icon name="rotate-cw" />
                    </button>
                  </Fragment>
                )}
                {this.downloadable && (
                  <button class="ldesign-image__tool" onClick={() => this.downloadImage()} aria-label="下载" title="下载图片">
                    <ldesign-icon name="download" />
                  </button>
                )}
                <button class="ldesign-image__tool" onClick={() => this.copyImageUrl()} aria-label="复制链接" title="复制图片链接">
                  <ldesign-icon name="copy" />
                </button>
                {this.fullscreenable && (
                  <button class="ldesign-image__tool" onClick={() => this.toggleFullscreen()} aria-label="全屏" title="全屏 (F)">
                    <ldesign-icon name={this.isFullscreen ? "minimize" : "maximize"} />
                  </button>
                )}
                <button class="ldesign-image__tool" onClick={this.closePreview} aria-label="关闭" title="关闭 (ESC)">
                  <ldesign-icon name="x" />
                </button>
              </div>
              {/* 图片信息显示 */}
              {this.showInfo && this.imgEl && (
                <div class="ldesign-image__preview-info">
                  <span>{this.imgEl.naturalWidth} × {this.imgEl.naturalHeight}</span>
                  {this.imageSize && <span>{this.formatFileSize(this.imageSize)}</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </Host>
    );
  }
}
