import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';

export type ModalSize = 'small' | 'medium' | 'large' | 'full';

export type ModalAnimation = 'fade' | 'zoom' | 'slide-down' | 'slide-up' | 'slide-left' | 'slide-right';

/**
 * Modal 模态框组件
 */
@Component({
  tag: 'ldesign-modal',
  styleUrl: 'modal.less',
  shadow: false,
})
export class LdesignModal {
  @Element() el!: HTMLElement;

  /**
   * 是否显示模态框
   */
  @Prop({ mutable: true }) visible: boolean = false;

  /**
   * 模态框标题
   */
  @Prop() modalTitle?: string;

  /** 图标可配置 */
  @Prop() closeIcon: string = 'x';
  @Prop() maximizeIcon: string = 'maximize-2';
  @Prop() restoreIcon: string = 'minimize-2';

  /**
   * 模态框尺寸
   */
  @Prop() size: ModalSize = 'medium';

  /**
   * 是否显示关闭按钮
   */
  @Prop() closable: boolean = true;

  /**
   * 是否显示遮罩层
   */
  @Prop() mask: boolean = true;

  /**
   * 点击遮罩层是否关闭
   */
  @Prop() maskClosable: boolean = true;

  /**
   * 按ESC键是否关闭
   */
  @Prop() keyboard: boolean = true;

  /**
   * 是否居中显示
   */
  @Prop() centered: boolean = false;

  /**
   * 是否可拖拽
   */
  @Prop() isDraggable: boolean = false;

  /**
   * 是否可调整大小
   */
  @Prop() resizable: boolean = false;

  /**
   * 自定义宽度
   */
  @Prop() width?: number | string;

  /**
   * 自定义高度
   */
  @Prop() height?: number | string;

  /**
   * 距离顶部的距离
   */
  @Prop() top?: number | string;

  /**
   * z-index
   */
  @Prop() zIndex: number = 1000;

  /**
   * 是否销毁子元素
   */
  @Prop() destroyOnClose: boolean = false;

  /**
   * 动画效果类型
   */
  @Prop() animation: ModalAnimation = 'zoom';

  /**
   * 是否可最大化
   */
  @Prop() maximizable: boolean = false;

  /**
   * 模态框状态
   */
  @State() isVisible: boolean = false;

  /**
   * 是否正在动画中
   */
  @State() isAnimating: boolean = false;

  /**
   * 是否正在关闭动画中
   */
  @State() isClosing: boolean = false;

  /**
   * 是否最大化
   */
  @State() isMaximized: boolean = false;

  /**
   * 滚动阴影状态
   */
  @State() showHeaderShadow: boolean = false;
  @State() showFooterShadow: boolean = false;

  /**
   * 模态框元素引用
   */
  private modalElement?: HTMLElement;

  /**
   * 可滚动主体区域引用
   */
  private bodyElement?: HTMLElement;

  /**
   * 遮罩层元素引用
   */
  private maskElement?: HTMLElement;

  /**
   * 拖拽相关状态
   */
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private modalStartX: number = 0;
  private modalStartY: number = 0;


  /**
   * 调整大小相关状态
   */
  private isResizing: boolean = false;
  private resizeDirection: string = '';
  private resizeStartX: number = 0;
  private resizeStartY: number = 0;
  private modalStartWidth: number = 0;
  private modalStartHeight: number = 0;
  private modalStartLeft: number = 0;
  private modalStartTop: number = 0;

  /**
   * 非可拖拽调整大小时，记录开始时的中心点（相对 wrap）
   */
  private modalCenterX: number = 0;
  private modalCenterY: number = 0;

  /**
   * 记忆上次关闭时的位置/尺寸（相对 wrap）
   */
  private lastLeft?: number;
  private lastTop?: number;
  private lastWidth?: number;
  private lastHeight?: number;

  /**
   * 用户是否通过拖拽/调整大小改变过位置或尺寸（用于决定是否保持居中）
   */
  private hasUserMoved: boolean = false;

  /**
   * resize 动画帧节流句柄
   */
  private resizeRaf?: number;

  /**
   * 显示状态变化事件
   */
  @Event() ldesignVisibleChange: EventEmitter<boolean>;

  /**
   * 关闭事件
   */
  @Event() ldesignClose: EventEmitter<void>;

  /**
   * 确认事件
   */
  @Event() ldesignOk: EventEmitter<void>;

  /**
   * 监听visible属性变化
   */
  @Watch('visible')
  watchVisible(newValue: boolean) {
    if (newValue !== this.isVisible) {
      this.setVisibleInternal(newValue);
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.modalElement = this.el.querySelector('.ldesign-modal__dialog') as HTMLElement;
    this.maskElement = this.el.querySelector('.ldesign-modal__mask') as HTMLElement;
    this.bodyElement = this.el.querySelector('.ldesign-modal__body') as HTMLElement;

    if (this.visible) {
      this.setVisible(true);
    }

    // 绑定键盘事件
    if (this.keyboard) {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    // 监听窗口尺寸变化（居中时保持居中）
    window.addEventListener('resize', this.handleWindowResize, { passive: true });
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    // 移除键盘事件
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // 移除拖拽和调整大小事件
    this.unbindDragEvents();
    this.unbindResizeEvents();

    // 窗口事件
    window.removeEventListener('resize', this.handleWindowResize);
    if (this.resizeRaf) {
      cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = undefined;
    }

    // 取消滚动监听
    this.unbindBodyScroll();
    
    // 恢复 body 滚动状态
    if (this.isVisible) {
      document.body.style.overflow = '';
    }
    
    // 清理引用
    this.modalElement = undefined;
    this.maskElement = undefined;
    
    // 重置状态
    this.isVisible = false;
    this.isAnimating = false;
    this.isClosing = false;
    this.isMaximized = false;
    this.isDragging = false;
    this.isResizing = false;
  }

  /**
   * 键盘事件处理
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.isVisible && this.keyboard) {
      this.close();
    }
  };

  /**
   * 遮罩层点击事件
   */
  private handleMaskClick = (event: Event) => {
    if (event.target === this.maskElement && this.maskClosable) {
      this.close();
    }
  };

  /**
   * 关闭按钮点击事件
   */
  private handleCloseClick = () => {
    this.close();
  };

  /**
   * 确认按钮点击事件
   */
  private handleOkClick = () => {
    this.ldesignOk.emit();
  };

  /**
   * 最大化按钮点击事件
   */
  private handleMaximizeClick = () => {
    this.toggleMaximize();
  };

  /**
   * 拖拽开始
   */
  private handleDragStart = (event: MouseEvent) => {
    if (!this.isDraggable || !this.modalElement) return;

    this.isDragging = true;
    this.hasUserMoved = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // 添加拖拽样式类
    this.modalElement.classList.add('dragging');

    const rect = this.modalElement.getBoundingClientRect();
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const wrapRect = wrap.getBoundingClientRect();
    this.modalStartX = rect.left - wrapRect.left;
    this.modalStartY = rect.top - wrapRect.top;

    // 如果模态框还在使用居中定位，转换为绝对定位（使用相对于 wrap 的像素值）
    const computedStyle = window.getComputedStyle(this.modalElement);
    if (computedStyle.position !== 'absolute' || computedStyle.transform.includes('translate')) {
      // 计算当前实际位置（相对于 wrap）
      const currentLeft = rect.left - wrapRect.left;
      const currentTop = rect.top - wrapRect.top;

      // 设置为绝对定位
      this.modalElement.style.position = 'absolute';
      this.modalElement.style.left = `${currentLeft}px`;
      this.modalElement.style.top = `${currentTop}px`;
      this.modalElement.style.transform = 'none';
      this.modalElement.style.margin = '0';

      // 更新起始位置
      this.modalStartX = currentLeft;
      this.modalStartY = currentTop;
    }

    this.bindDragEvents();
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * 拖拽中
   */
  private handleDragMove = (event: MouseEvent) => {
    if (!this.isDragging || !this.modalElement) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    let newX = this.modalStartX + deltaX;
    let newY = this.modalStartY + deltaY;

    // 约束在可视区域内（以 wrap 为边界）
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const maxLeft = Math.max(0, wrap.clientWidth - this.modalElement.offsetWidth);
    const maxTop = Math.max(0, wrap.clientHeight - this.modalElement.offsetHeight);
    newX = Math.min(Math.max(0, newX), maxLeft);
    newY = Math.min(Math.max(0, newY), maxTop);

    // 应用并记忆
    this.modalElement.style.left = `${newX}px`;
    this.modalElement.style.top = `${newY}px`;
    this.modalElement.style.transform = 'none';

    this.lastLeft = newX;
    this.lastTop = newY;
  };

  /**
   * 拖拽结束
   */
  private handleDragEnd = () => {
    this.isDragging = false;

    // 移除拖拽样式类
    if (this.modalElement) {
      this.modalElement.classList.remove('dragging');
    }

    this.unbindDragEvents();
  };

  /**
   * 绑定拖拽事件
   */
  private bindDragEvents() {
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
  }

  /**
   * 解绑拖拽事件
   */
  private unbindDragEvents() {
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
  }

  /**
   * 调整大小开始
   */
  private handleResizeStart = (event: MouseEvent, direction: string) => {
    if (!this.resizable || !this.modalElement) return;

    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;

    // 添加调整大小样式类
    this.modalElement.classList.add('resizing');

    const rect = this.modalElement.getBoundingClientRect();
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const wrapRect = wrap.getBoundingClientRect();

    this.modalStartWidth = rect.width;
    this.modalStartHeight = rect.height;
    this.modalStartLeft = rect.left - wrapRect.left;
    this.modalStartTop = rect.top - wrapRect.top;

    // 非拖拽时记录中心点（相对 wrap）
    if (!this.isDraggable) {
      this.modalCenterX = this.modalStartLeft + this.modalStartWidth / 2;
      this.modalCenterY = this.modalStartTop + this.modalStartHeight / 2;
    }

    // 确保模态框使用绝对定位（相对 wrap）
    const computedStyle = window.getComputedStyle(this.modalElement);
    if (computedStyle.position !== 'absolute') {
      this.modalElement.style.position = 'absolute';
      this.modalElement.style.left = `${this.modalStartLeft}px`;
      this.modalElement.style.top = `${this.modalStartTop}px`;
      this.modalElement.style.transform = 'none';
      this.modalElement.style.margin = '0';
    }

    this.bindResizeEvents();
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * 调整大小中
   */
  private handleResizeMove = (event: MouseEvent) => {
    if (!this.isResizing || !this.modalElement) return;

    const deltaX = event.clientX - this.resizeStartX;
    const deltaY = event.clientY - this.resizeStartY;

    let newWidth = this.modalStartWidth;
    let newHeight = this.modalStartHeight;
    let newLeft = this.modalStartLeft;
    let newTop = this.modalStartTop;

    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const maxWidth = wrap.clientWidth;
    const maxHeight = wrap.clientHeight;

    if (this.isDraggable) {
      // 单边调整，位置跟随边缘，中心不固定
      if (this.resizeDirection.includes('right')) {
        newWidth = Math.max(200, this.modalStartWidth + deltaX);
      } else if (this.resizeDirection.includes('left')) {
        newWidth = Math.max(200, this.modalStartWidth - deltaX);
        newLeft = this.modalStartLeft + (this.modalStartWidth - newWidth);
      }

      if (this.resizeDirection.includes('bottom')) {
        newHeight = Math.max(150, this.modalStartHeight + deltaY);
      } else if (this.resizeDirection.includes('top')) {
        newHeight = Math.max(150, this.modalStartHeight - deltaY);
        newTop = this.modalStartTop + (this.modalStartHeight - newHeight);
      }

      // 最大尺寸不超过容器
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);

      // 边界约束
      const maxLeft = Math.max(0, maxWidth - newWidth);
      const maxTop = Math.max(0, maxHeight - newHeight);
      newLeft = Math.min(Math.max(0, newLeft), maxLeft);
      newTop = Math.min(Math.max(0, newTop), maxTop);

    } else {
      // 非可拖拽：以开始时的中心为锚点，双向等距伸缩
      let deltaW = 0;
      let deltaH = 0;
      if (this.resizeDirection.includes('right')) deltaW = 2 * deltaX;
      else if (this.resizeDirection.includes('left')) deltaW = -2 * deltaX;
      if (this.resizeDirection.includes('bottom')) deltaH = 2 * deltaY;
      else if (this.resizeDirection.includes('top')) deltaH = -2 * deltaY;

      newWidth = Math.max(200, this.modalStartWidth + deltaW);
      newHeight = Math.max(150, this.modalStartHeight + deltaH);

      // 限制不超过容器
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);

      // 以固定中心点计算位置
      newLeft = this.modalCenterX - newWidth / 2;
      newTop = this.modalCenterY - newHeight / 2;

      // 边界约束（尽量保持中心，如有冲突优先不越界）
      const maxLeft = Math.max(0, maxWidth - newWidth);
      const maxTop = Math.max(0, maxHeight - newHeight);
      newLeft = Math.min(Math.max(0, newLeft), maxLeft);
      newTop = Math.min(Math.max(0, newTop), maxTop);
    }

    // 应用新的尺寸和位置
    this.modalElement.style.width = `${newWidth}px`;
    this.modalElement.style.height = `${newHeight}px`;
    this.modalElement.style.left = `${newLeft}px`;
    this.modalElement.style.top = `${newTop}px`;
    this.modalElement.style.transform = 'none';
    this.modalElement.style.position = 'absolute';
    this.modalElement.style.margin = '0';

    // 记忆
    this.lastLeft = newLeft;
    this.lastTop = newTop;
    this.lastWidth = newWidth;
    this.lastHeight = newHeight;
  };

  /**
   * 调整大小结束
   */
  private handleResizeEnd = () => {
    this.isResizing = false;
    this.resizeDirection = '';

    // 移除调整大小样式类
    if (this.modalElement) {
      this.modalElement.classList.remove('resizing');
    }

    this.unbindResizeEvents();
  };

  /**
   * 绑定调整大小事件
   */
  private bindResizeEvents() {
    document.addEventListener('mousemove', this.handleResizeMove);
    document.addEventListener('mouseup', this.handleResizeEnd);
  }

  /**
   * 解绑调整大小事件
   */
  private unbindResizeEvents() {
    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
  }

  /**
   * 显示模态框
   */
  @Method()
  async show() {
    this.setVisible(true);
  }

  /**
   * 隐藏模态框
   */
  @Method()
  async hide() {
    this.setVisible(false);
  }

  /**
   * 关闭模态框
   */
  @Method()
  async close() {
    this.ldesignClose.emit();
    this.setVisible(false);
  }

  /**
   * 最大化模态框
   */
  @Method()
  async maximize() {
    if (!this.modalElement || this.isMaximized) return;

    // 保存当前状态（相对于 wrap）
    const rect = this.modalElement.getBoundingClientRect();
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement;
    const wrapRect = wrap.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(this.modalElement);

    // 保存原始状态到dataset（相对 wrap 的像素值与尺寸）
    const origLeft = rect.left - wrapRect.left;
    const origTop = rect.top - wrapRect.top;
    const origWidth = this.modalElement.offsetWidth;
    const origHeight = this.modalElement.offsetHeight;

    this.modalElement.dataset.originalLeft = origLeft.toString();
    this.modalElement.dataset.originalTop = origTop.toString();
    this.modalElement.dataset.originalWidth = origWidth.toString();
    this.modalElement.dataset.originalHeight = origHeight.toString();
    this.modalElement.dataset.originalPosition = computedStyle.position;
    this.modalElement.dataset.originalTransform = computedStyle.transform;
    this.modalElement.dataset.originalMargin = computedStyle.margin;

    // 确保起始状态为绝对像素值（便于过渡）
    this.modalElement.style.position = 'absolute';
    this.modalElement.style.left = `${origLeft}px`;
    this.modalElement.style.top = `${origTop}px`;
    this.modalElement.style.width = `${origWidth}px`;
    this.modalElement.style.height = `${origHeight}px`;
    this.modalElement.style.transform = 'none';
    this.modalElement.style.margin = '0';

    // 设置最大化状态（触发过渡）
    this.isMaximized = true;
  }

  /**
   * 恢复模态框
   */
  @Method()
  async restore() {
    if (!this.modalElement || !this.isMaximized) return;

    // 先设置状态为非最大化，触发CSS transition
    this.isMaximized = false;

    // 等待一帧后恢复原始状态
    requestAnimationFrame(() => {
      if (!this.modalElement || this.isMaximized) return; // 防止在动画期间被重新最大化

      const originalLeft = this.modalElement.dataset.originalLeft;
      const originalTop = this.modalElement.dataset.originalTop;
      const originalWidth = this.modalElement.dataset.originalWidth;
      const originalHeight = this.modalElement.dataset.originalHeight;

      if (originalLeft && originalTop && originalWidth && originalHeight) {
        // 恢复为绝对定位 + 原像素尺寸/位置，保证过渡连贯
        this.modalElement.style.position = 'absolute';
        this.modalElement.style.left = `${originalLeft}px`;
        this.modalElement.style.top = `${originalTop}px`;
        this.modalElement.style.transform = 'none';
        this.modalElement.style.margin = '0';
        this.modalElement.style.width = `${originalWidth}px`;
        this.modalElement.style.height = `${originalHeight}px`;
      }
    });
  }

  /**
   * 切换最大化状态
   */
  @Method()
  async toggleMaximize() {
    if (this.isMaximized) {
      this.restore();
    } else {
      this.maximize();
    }
  }

  /**
   * 设置显示状态（内部使用，不触发Watch）
   */
  private setVisibleInternal(visible: boolean) {
    if (this.isVisible === visible) return;

    if (visible) {
      // 显示动画
      this.isAnimating = true;
      this.isClosing = false;
      this.isVisible = true;

      // 显示时添加body样式，防止滚动
      document.body.style.overflow = 'hidden';

      // 定位逻辑：优先恢复上次位置，否则按需居中
      if ((this.isDraggable || this.resizable || this.centered || this.maximizable) && this.modalElement) {
        this.modalElement.style.visibility = 'hidden';
        requestAnimationFrame(() => {
          if (this.isVisible) {
            this.applyLastPositionOrCenter();
            this.modalElement!.style.visibility = 'visible';
          }
        });
      }

      // 绑定滚动阴影
      this.bindBodyScrollSoon();

      // 动画结束后重置状态
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);
    } else {
      // 关闭动画
      this.isAnimating = true;
      this.isClosing = true;

      // 等待动画完成后再隐藏，避免闪动
      setTimeout(() => {
        if (this.isClosing) { // 确保在动画期间没有被重新打开
          this.isVisible = false;
          this.isAnimating = false;
          this.isClosing = false;

          // 隐藏时恢复body样式
          document.body.style.overflow = '';
        }
      }, 300);
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 设置显示状态（外部调用，同步visible属性）
   */
  private setVisible(visible: boolean) {
    if (this.isVisible === visible) return;

    if (visible) {
      // 显示动画
      this.isAnimating = true;
      this.isClosing = false;
      this.isVisible = true;
      this.visible = true;

      // 显示时添加body样式，防止滚动
      document.body.style.overflow = 'hidden';

      // 如果是拖拽模态框，尽早将居中定位转换为绝对定位，避免动画期间位置跳动
      if (this.isDraggable && this.modalElement) {
        // 打开瞬间先隐藏，等定位完成再显示，避免初帧位移闪烁
        this.modalElement.style.visibility = 'hidden';
        requestAnimationFrame(() => {
          if (this.isVisible) {
            this.alignDialogToCenter();
            this.modalElement!.style.visibility = 'visible';
          }
        });
      }

      // 动画结束后重置状态
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);
    } else {
      // 关闭动画
      this.isAnimating = true;
      this.isClosing = true;

      // 等待动画完成后再隐藏，避免闪动
      setTimeout(() => {
        if (this.isClosing) { // 确保在动画期间没有被重新打开
          this.isVisible = false;
          this.visible = false;
          this.isAnimating = false;
          this.isClosing = false;

          // 隐藏时恢复body样式
          document.body.style.overflow = '';
        }
      }, 300);
    }

    this.ldesignVisibleChange.emit(visible);
  }

  /**
   * 获取模态框类名
   */
  private getModalClass() {
    const classes = ['ldesign-modal'];

    if (this.isVisible) {
      classes.push('ldesign-modal--visible');
    }

    if (this.centered) {
      classes.push('ldesign-modal--centered');
    }

    if (this.isDraggable) {
      classes.push('ldesign-modal--draggable');
    }

    if (this.isMaximized) {
      classes.push('ldesign-modal--maximized');
    }

    if (this.resizable) {
      classes.push('ldesign-modal--resizable');
    }

    // 添加动画类
    if (this.animation) {
      if (this.isClosing) {
        classes.push(`ldesign-modal--${this.animation}-out`);
      } else {
        classes.push(`ldesign-modal--${this.animation}`);
      }
    }

    return classes.join(' ');
  }

  /**
   * 获取对话框类名
   */
  private getDialogClass() {
    const classes = ['ldesign-modal__dialog'];

    classes.push(`ldesign-modal__dialog--${this.size}`);

    return classes.join(' ');
  }

  /**
   * 获取对话框样式
   */
  private getDialogStyle() {
    const style: any = {};

    if (this.width) {
      style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }

    if (this.height) {
      style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }

    if (this.top && !this.centered) {
      style.top = typeof this.top === 'number' ? `${this.top}px` : this.top;
    }

    return style;
  }

  /**
   * 获取内容区域类名
   */
  private getContentClass() {
    const classes = ['ldesign-modal__content'];
    
    // 如果没有标题和关闭按钮
    if (!this.modalTitle && !this.closable && !this.maximizable) {
      classes.push('ldesign-modal__content--no-header');
    }
    
    // 这里无法判断是否有 footer slot，需要在运行时判断
    // 可以通过检查 slot 内容来实现
    
    return classes.join(' ');
  }

  /**
   * 将对话框转换为相对于包裹容器的绝对居中位置（用于拖拽初次打开时）
   */
  private alignDialogToCenter() {
    if (!this.modalElement) return;
    const wrap = this.el.querySelector('.ldesign-modal__wrap') as HTMLElement | null;
    if (!wrap) return;

    const dialog = this.modalElement as HTMLElement;
    // 使用已渲染尺寸进行计算（offset* 不受 transform 影响）
    const dialogWidth = dialog.offsetWidth;
    const dialogHeight = dialog.offsetHeight;
    const wrapWidth = wrap.clientWidth;
    const wrapHeight = wrap.clientHeight;

    // 考虑到 wrap 可能存在滚动条，中心点需加上滚动偏移
    const left = Math.max(0, wrap.scrollLeft + (wrapWidth - dialogWidth) / 2);
    const top = Math.max(0, wrap.scrollTop + (wrapHeight - dialogHeight) / 2);

    dialog.style.position = 'absolute';
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
    dialog.style.transform = 'none';
    dialog.style.margin = '0';
    // 若之前被隐藏，完成定位后显示
    if (dialog.style.visibility === 'hidden') {
      dialog.style.visibility = 'visible';
    }
  }

  /**
   * 是否需要保持居中（centered=true 且未被用户拖动，或不可拖拽）
   */
  private shouldStickToCenter() {
    return this.centered && (!this.isDraggable || !this.hasUserMoved);
  }

  /**
   * 在某些情况下（窗口尺寸、属性变化）尝试重新居中
   */
  private repositionIfNeeded() {
    if (this.isVisible && this.shouldStickToCenter()) {
      this.alignDialogToCenter();
    }
  }

  /**
   * 窗口尺寸变化时，节流后重算位置
   */
  private handleWindowResize = () => {
    if (!this.isVisible || !this.shouldStickToCenter()) return;
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      this.alignDialogToCenter();
      this.resizeRaf = undefined;
    });
  };

  // 属性变化，保持居中
  @Watch('size') onSizeChange() { this.repositionIfNeeded(); }
  @Watch('width') onWidthChange() { this.repositionIfNeeded(); }
  @Watch('height') onHeightChange() { this.repositionIfNeeded(); }
  @Watch('centered') onCenteredChange() { this.repositionIfNeeded(); }

  /**
   * 绑定 body 滚动事件，稍后执行以等待 DOM 稳定
   */
  private bindBodyScrollSoon() {
    requestAnimationFrame(() => {
      this.bodyElement = this.el.querySelector('.ldesign-modal__body') as HTMLElement;
      this.unbindBodyScroll();
      if (this.bodyElement) {
        this.bodyElement.addEventListener('scroll', this.handleBodyScroll, { passive: true });
        this.updateScrollShadows();
      }
    });
  }

  private unbindBodyScroll() {
    if (this.bodyElement) {
      this.bodyElement.removeEventListener('scroll', this.handleBodyScroll);
    }
  }

  private handleBodyScroll = () => {
    this.updateScrollShadows();
  };

  private updateScrollShadows() {
    const body = this.el.querySelector('.ldesign-modal__body') as HTMLElement | null;
    if (!body) {
      this.showHeaderShadow = false;
      this.showFooterShadow = false;
      return;
    }
    const st = body.scrollTop;
    const sh = body.scrollHeight;
    const ch = body.clientHeight;
    this.showHeaderShadow = st > 0;
    this.showFooterShadow = st + ch < sh - 1;
  }

  /**
   * 打开时优先恢复上次位置，否则按需居中
   */
  private applyLastPositionOrCenter() {
    if (!this.modalElement) return;

    const hasLast = this.lastLeft !== undefined && this.lastTop !== undefined;

    if (this.isDraggable) {
      // 可拖拽：优先恢复上次位置；若无记录则默认居中
      if (hasLast) {
        this.modalElement.style.position = 'absolute';
        this.modalElement.style.left = `${this.lastLeft}px`;
        this.modalElement.style.top = `${this.lastTop}px`;
        this.modalElement.style.transform = 'none';
        this.modalElement.style.margin = '0';
        if (this.lastWidth) this.modalElement.style.width = `${this.lastWidth}px`;
        if (this.lastHeight) this.modalElement.style.height = `${this.lastHeight}px`;
      } else {
        this.alignDialogToCenter();
      }
      return;
    }

    // 仅可调整大小或设置了 centered 的情况，按需居中
    const shouldCenter = this.shouldStickToCenter() || this.resizable;
    if (shouldCenter) {
      this.alignDialogToCenter();
    }
  }

  render() {
    // 只有在完全不可见且不在动画中且需要销毁时才返回null
    if (!this.isVisible && !this.isAnimating && this.destroyOnClose) {
      return null;
    }

    // 如果不可见且不在动画中，返回隐藏的元素而不是null
    const shouldShow = this.isVisible || this.isAnimating;

    return (
      <Host
        class={this.getModalClass()}
        style={{
          zIndex: this.zIndex.toString(),
          display: shouldShow ? 'block' : 'none'
        }}
      >
        {this.mask && (
          <div
            class="ldesign-modal__mask"
            onClick={this.handleMaskClick}
          />
        )}

        <div class="ldesign-modal__wrap">
          <div
            class={this.getDialogClass()}
            style={this.getDialogStyle()}
          >
            <div class={this.getContentClass()}>
              {(this.modalTitle || this.closable) && (
                <div
                  class={`ldesign-modal__header ${this.isDraggable ? 'ldesign-modal__header--draggable' : ''} ${this.showHeaderShadow ? 'ldesign-modal__header--shadow' : ''}`}
                  onMouseDown={this.isDraggable ? this.handleDragStart : null}
                  style={this.isDraggable ? { cursor: 'move' } : {}}
                >
                  {this.modalTitle && (
                    <div class="ldesign-modal__title">{this.modalTitle}</div>
                  )}

                  <div class="ldesign-modal__actions">
                    {this.maximizable && (
                      <ldesign-button
                        class="ldesign-modal__maximize"
                        onClick={this.handleMaximizeClick}
                        type="text"
                        size="small"
                        title={this.isMaximized ? '恢复' : '最大化'}
                      >
                        <ldesign-icon name={this.isMaximized ? this.restoreIcon : this.maximizeIcon} size="small" />
                      </ldesign-button>
                    )}

                    {this.closable && (
                      <ldesign-button
                        class="ldesign-modal__close"
                        onClick={this.handleCloseClick}
                        type="text"
                        size="small"
                        title="关闭"
                      >
                        <ldesign-icon name={this.closeIcon} size="small" />
                      </ldesign-button>
                    )}
                  </div>
                </div>
              )}

              <div class="ldesign-modal__body">
                <slot />
              </div>

              <div class={`ldesign-modal__footer ${this.showFooterShadow ? 'ldesign-modal__footer--shadow' : ''}`}>
                <slot name="footer">
                  <ldesign-button onClick={this.handleCloseClick}>
                    取消
                  </ldesign-button>
                  <ldesign-button type="primary" onClick={this.handleOkClick}>
                    确定
                  </ldesign-button>
                </slot>
              </div>
            </div>

            {/* 调整大小手柄 */}
            {this.resizable && !this.isMaximized && (
              <div class="ldesign-modal__resize-handles">
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--top" onMouseDown={(e) => this.handleResizeStart(e, 'top')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--right" onMouseDown={(e) => this.handleResizeStart(e, 'right')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--bottom" onMouseDown={(e) => this.handleResizeStart(e, 'bottom')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--left" onMouseDown={(e) => this.handleResizeStart(e, 'left')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--top-left" onMouseDown={(e) => this.handleResizeStart(e, 'top-left')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--top-right" onMouseDown={(e) => this.handleResizeStart(e, 'top-right')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--bottom-left" onMouseDown={(e) => this.handleResizeStart(e, 'bottom-left')} />
                <div class="ldesign-modal__resize-handle ldesign-modal__resize-handle--bottom-right" onMouseDown={(e) => this.handleResizeStart(e, 'bottom-right')} />
              </div>
            )}
          </div>
        </div>
      </Host>
    );
  }
}
