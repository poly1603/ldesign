import { Component, Prop, State, Event, EventEmitter, Watch, Method, Element, h, Host } from '@stencil/core';

/**
 * ldesign-image-preview
 * 图片预览组件，支持缩放、拖拽、旋转等交互
 * 
 * 用法：
 * 1) 编程式调用：
 *    const preview = document.querySelector('ldesign-image-preview');
 *    preview.show('https://example.com/image.jpg');
 * 
 * 2) 作为图片组件的预览功能：
 *    <ldesign-image src="..." preview></ldesign-image>
 */
@Component({
  tag: 'ldesign-image-preview',
  styleUrl: 'image-preview.less',
  shadow: false
})
export class LdesignImagePreview {
  @Element() el!: HTMLElement;

  // ── Props ─────────────────────────────────────────────
  /** 当前预览的图片列表 */
  @Prop({ mutable: true }) images: string[] = [];
  
  /** 当前显示的图片索引 */
  @Prop({ mutable: true }) currentIndex: number = 0;
  
  /** 是否显示预览 */
  @Prop({ mutable: true }) visible: boolean = false;
  
  /** 是否显示图片索引 */
  @Prop() showIndex: boolean = true;
  
  /** 是否显示工具栏 */
  @Prop() showToolbar: boolean = true;
  
  /** 是否循环切换 */
  @Prop() loop: boolean = true;
  
  /** 是否在点击遮罩时关闭 */
  @Prop() maskClosable: boolean = true;
  
  /** 是否启用键盘操作 */
  @Prop() keyboard: boolean = true;
  
  /** 初始缩放比例 */
  @Prop() initialScale: number = 1;
  
  /** 最小缩放比例 */
  @Prop() minScale: number = 0.25;
  
  /** 最大缩放比例 */
  @Prop() maxScale: number = 4;
  
  /** 是否启用旋转 */
  @Prop() enableRotate: boolean = true;
  
  /** 是否显示关闭按钮 */
  @Prop() showCloseBtn: boolean = true;
  
  /** 动画过渡时长 (ms) */
  @Prop() transitionDuration: number = 300;

  // ── Events ────────────────────────────────────────────
  @Event() ldesignPreviewOpen!: EventEmitter<{ images: string[], index: number }>;
  @Event() ldesignPreviewClose!: EventEmitter<void>;
  @Event() ldesignPreviewChange!: EventEmitter<{ index: number, image: string }>;
  @Event() ldesignPreviewError!: EventEmitter<{ index: number, image: string }>;

  // ── State ─────────────────────────────────────────────
  @State() isAnimating: boolean = false;
  @State() currentSrc: string = '';
  @State() isLoading: boolean = false;
  @State() hasError: boolean = false;

  private draggableRef?: any;
  private overlayRef?: HTMLElement;
  private contentRef?: HTMLElement;
  private transitionTimer?: number;

  // ── Watchers ──────────────────────────────────────────
  @Watch('visible')
  watchVisible(newVal: boolean) {
    if (newVal) {
      this.openPreview();
    } else {
      this.closePreview();
    }
  }

  @Watch('currentIndex')
  watchCurrentIndex(newVal: number) {
    if (this.images && this.images.length > 0) {
      const index = Math.max(0, Math.min(newVal, this.images.length - 1));
      this.currentSrc = this.images[index];
      this.resetDraggable();
      this.ldesignPreviewChange.emit({ index, image: this.currentSrc });
    }
  }

  // ── Lifecycle ─────────────────────────────────────────
  componentWillLoad() {
    if (this.images.length > 0 && this.currentIndex >= 0) {
      this.currentSrc = this.images[this.currentIndex];
    }
  }

  componentDidLoad() {
    if (this.keyboard) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  disconnectedCallback() {
    if (this.keyboard) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }
  }

  // ── Public Methods ────────────────────────────────────
  @Method()
  async show(images?: string | string[], index?: number) {
    if (images) {
      this.images = Array.isArray(images) ? images : [images];
    }
    if (index !== undefined) {
      this.currentIndex = index;
    } else if (!this.images.includes(this.currentSrc)) {
      this.currentIndex = 0;
    }
    
    if (this.images.length > 0) {
      this.currentSrc = this.images[this.currentIndex];
      this.visible = true;
    }
  }

  @Method()
  async hide() {
    this.visible = false;
  }

  @Method()
  async prev() {
    if (this.images.length <= 1) return;
    
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.loop) {
      this.currentIndex = this.images.length - 1;
    }
  }

  @Method()
  async next() {
    if (this.images.length <= 1) return;
    
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    } else if (this.loop) {
      this.currentIndex = 0;
    }
  }

  @Method()
  async reset() {
    if (this.draggableRef) {
      await this.draggableRef.reset();
    }
  }

  @Method()
  async zoomIn(step?: number) {
    if (this.draggableRef) {
      await this.draggableRef.zoomIn(step);
    }
  }

  @Method()
  async zoomOut(step?: number) {
    if (this.draggableRef) {
      await this.draggableRef.zoomOut(step);
    }
  }

  @Method()
  async rotateLeft() {
    if (this.draggableRef && this.enableRotate) {
      await this.draggableRef.rotateBy(-90);
    }
  }

  @Method()
  async rotateRight() {
    if (this.draggableRef && this.enableRotate) {
      await this.draggableRef.rotateBy(90);
    }
  }

  // ── Private Methods ───────────────────────────────────
  private openPreview() {
    this.isAnimating = true;
    this.hasError = false;
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
    
    // 触发打开事件
    this.ldesignPreviewOpen.emit({
      images: this.images,
      index: this.currentIndex
    });
    
    // 动画结束后
    this.transitionTimer = window.setTimeout(() => {
      this.isAnimating = false;
    }, this.transitionDuration);
  }

  private closePreview() {
    this.isAnimating = true;
    
    // 恢复背景滚动
    document.body.style.overflow = '';
    
    // 触发关闭事件
    this.ldesignPreviewClose.emit();
    
    // 动画结束后
    this.transitionTimer = window.setTimeout(() => {
      this.isAnimating = false;
      this.visible = false;
    }, this.transitionDuration);
  }

  private resetDraggable() {
    this.hasError = false;
    this.isLoading = true;
    
    if (this.draggableRef) {
      // 重置到初始状态
      this.draggableRef.reset();
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.visible || !this.keyboard) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.prev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.next();
        break;
      case ' ':
        e.preventDefault();
        this.reset();
        break;
    }
  };

  private handleMaskClick = (e: MouseEvent) => {
    // 只有点击遮罩层才关闭，点击内容不关闭
    if (this.maskClosable && e.target === this.overlayRef) {
      this.hide();
    }
  };

  private handleImageLoad = () => {
    this.isLoading = false;
    this.hasError = false;
  };

  private handleImageError = () => {
    this.isLoading = false;
    this.hasError = true;
    this.ldesignPreviewError.emit({
      index: this.currentIndex,
      image: this.currentSrc
    });
  };

  private handleWheel = (e: WheelEvent) => {
    // 阻止事件冒泡到外层，避免背景滚动
    e.stopPropagation();
  };

  // ── Render ────────────────────────────────────────────
  render() {
    if (!this.visible && !this.isAnimating) {
      return null;
    }

    const showPrevBtn = this.images.length > 1 && (this.loop || this.currentIndex > 0);
    const showNextBtn = this.images.length > 1 && (this.loop || this.currentIndex < this.images.length - 1);

    return (
      <Host>
        <div 
          class={{
            'ldesign-image-preview': true,
            'is-visible': this.visible,
            'is-animating': this.isAnimating
          }}
        >
          {/* 遮罩层 */}
          <div 
            class="ldesign-image-preview__overlay"
            ref={el => this.overlayRef = el}
            onClick={this.handleMaskClick}
          />
          
          {/* 主内容区 */}
          <div 
            class="ldesign-image-preview__content"
            ref={el => this.contentRef = el}
            onWheel={this.handleWheel}
          >
            {/* 关闭按钮 */}
            {this.showCloseBtn && (
              <button
                class="ldesign-image-preview__close"
                onClick={() => this.hide()}
                aria-label="Close preview"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 6l12 12M6 18L18 6"/>
                </svg>
              </button>
            )}
            
            {/* 图片索引 */}
            {this.showIndex && this.images.length > 1 && (
              <div class="ldesign-image-preview__index">
                {this.currentIndex + 1} / {this.images.length}
              </div>
            )}
            
            {/* 上一张按钮 */}
            {showPrevBtn && (
              <button
                class="ldesign-image-preview__arrow ldesign-image-preview__arrow--prev"
                onClick={() => this.prev()}
                aria-label="Previous image"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            
            {/* 下一张按钮 */}
            {showNextBtn && (
              <button
                class="ldesign-image-preview__arrow ldesign-image-preview__arrow--next"
                onClick={() => this.next()}
                aria-label="Next image"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
            
            {/* 图片容器 - 使用 draggable 组件 */}
            <div class="ldesign-image-preview__img-wrapper">
              {this.currentSrc && (
                <ldesign-draggable
                  ref={el => this.draggableRef = el}
                  src={this.currentSrc}
                  initialScale={this.initialScale}
                  minScale={this.minScale}
                  maxScale={this.maxScale}
                  enableRotate={this.enableRotate}
                  wheelZoom={true}
                  keyboard={false}
                  showControls={false}
                  disableContextMenu={true}
                  style={{ width: '100%', height: '100%' }}
                  onLoad={this.handleImageLoad}
                  onError={this.handleImageError}
                />
              )}
              
              {/* 加载状态 */}
              {this.isLoading && (
                <div class="ldesign-image-preview__loading">
                  <div class="ldesign-image-preview__spinner" />
                </div>
              )}
              
              {/* 错误状态 */}
              {this.hasError && (
                <div class="ldesign-image-preview__error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                  <div>图片加载失败</div>
                </div>
              )}
            </div>
            
            {/* 工具栏 */}
            {this.showToolbar && !this.hasError && (
              <div class="ldesign-image-preview__toolbar">
                <button
                  class="ldesign-image-preview__tool"
                  onClick={() => this.zoomOut()}
                  aria-label="Zoom out"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35M8 11h6"/>
                  </svg>
                </button>
                
                <button
                  class="ldesign-image-preview__tool"
                  onClick={() => this.zoomIn()}
                  aria-label="Zoom in"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
                  </svg>
                </button>
                
                <button
                  class="ldesign-image-preview__tool"
                  onClick={() => this.reset()}
                  aria-label="Reset"
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                </button>
                
                {this.enableRotate && [
                  <button
                    class="ldesign-image-preview__tool"
                    onClick={() => this.rotateLeft()}
                    aria-label="Rotate left"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2.5 12C2.5 6.753 6.753 2.5 12 2.5c3.127 0 5.9 1.51 7.63 3.847l-2.13 2.13"/>
                      <path d="M19.5 2.5v5h-5"/>
                    </svg>
                  </button>,
                  
                  <button
                    class="ldesign-image-preview__tool"
                    onClick={() => this.rotateRight()}
                    aria-label="Rotate right"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21.5 12C21.5 6.753 17.247 2.5 12 2.5c-3.127 0-5.9 1.51-7.63 3.847l2.13 2.13"/>
                      <path d="M4.5 2.5v5h5"/>
                    </svg>
                  </button>
                ]}
              </div>
            )}
          </div>
        </div>
      </Host>
    );
  }
}