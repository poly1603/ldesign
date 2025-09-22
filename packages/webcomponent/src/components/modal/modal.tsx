import { Component, Prop, State, Element, Event, EventEmitter, Watch, h, Host } from '@stencil/core';

export type ModalSize = 'small' | 'medium' | 'large' | 'full';

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
  @Prop() draggable: boolean = false;

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
   * 模态框状态
   */
  @State() isVisible: boolean = false;

  /**
   * 是否正在动画中
   */
  @State() isAnimating: boolean = false;

  /**
   * 模态框元素引用
   */
  private modalElement?: HTMLElement;

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
      this.setVisible(newValue);
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    this.modalElement = this.el.querySelector('.ldesign-modal__dialog') as HTMLElement;
    this.maskElement = this.el.querySelector('.ldesign-modal__mask') as HTMLElement;

    if (this.visible) {
      this.setVisible(true);
    }

    // 绑定键盘事件
    if (this.keyboard) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.unbindDragEvents();
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
   * 拖拽开始
   */
  private handleDragStart = (event: MouseEvent) => {
    if (!this.draggable || !this.modalElement) return;

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    const rect = this.modalElement.getBoundingClientRect();
    this.modalStartX = rect.left;
    this.modalStartY = rect.top;

    this.bindDragEvents();
    event.preventDefault();
  };

  /**
   * 拖拽中
   */
  private handleDragMove = (event: MouseEvent) => {
    if (!this.isDragging || !this.modalElement) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    const newX = this.modalStartX + deltaX;
    const newY = this.modalStartY + deltaY;

    this.modalElement.style.left = `${newX}px`;
    this.modalElement.style.top = `${newY}px`;
    this.modalElement.style.transform = 'none';
  };

  /**
   * 拖拽结束
   */
  private handleDragEnd = () => {
    this.isDragging = false;
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
   * 显示模态框
   */
  show() {
    this.setVisible(true);
  }

  /**
   * 隐藏模态框
   */
  hide() {
    this.setVisible(false);
  }

  /**
   * 关闭模态框
   */
  close() {
    this.ldesignClose.emit();
    this.setVisible(false);
  }

  /**
   * 设置显示状态
   */
  private setVisible(visible: boolean) {
    if (this.isVisible === visible) return;

    this.isAnimating = true;
    this.isVisible = visible;
    this.visible = visible;

    if (visible) {
      // 显示时添加body样式，防止滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 隐藏时恢复body样式
      document.body.style.overflow = '';
    }

    // 动画结束后重置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);

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

    if (this.draggable) {
      classes.push('ldesign-modal--draggable');
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

  render() {
    if (!this.isVisible && !this.isAnimating && this.destroyOnClose) {
      return null;
    }

    return (
      <Host class={this.getModalClass()} style={{ zIndex: this.zIndex.toString() }}>
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
            <div class="ldesign-modal__content">
              {(this.title || this.closable) && (
                <div 
                  class="ldesign-modal__header"
                  onMouseDown={this.draggable ? this.handleDragStart : undefined}
                >
                  {this.title && (
                    <div class="ldesign-modal__title">{this.title}</div>
                  )}
                  
                  {this.closable && (
                    <button 
                      class="ldesign-modal__close"
                      onClick={this.handleCloseClick}
                      type="button"
                    >
                      <ldesign-icon name="x" size="small" />
                    </button>
                  )}
                </div>
              )}
              
              <div class="ldesign-modal__body">
                <slot />
              </div>
              
              <div class="ldesign-modal__footer">
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
          </div>
        </div>
      </Host>
    );
  }
}
