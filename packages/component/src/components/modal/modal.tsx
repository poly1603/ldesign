import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import { generateId } from '../../utils';

/**
 * Modal 模态框组件
 * 
 * 用于显示重要信息、确认操作或收集用户输入的浮层组件
 * 
 * @example
 * ```tsx
 * <ld-modal visible={true} title="标题">
 *   <p>模态框内容</p>
 * </ld-modal>
 * ```
 */
@Component({
  tag: 'ld-modal',
  styleUrl: 'modal.less',
  shadow: true,
})
export class Modal {
  @Element() el!: HTMLElement;

  /**
   * 是否可见
   */
  @Prop({ mutable: true, reflect: true }) visible: boolean = false;

  /**
   * 模态框标题
   */
  @Prop() modalTitle?: string;

  /**
   * 模态框宽度
   */
  @Prop() width: string | number = 520;

  /**
   * 模态框高度
   */
  @Prop() height?: string | number;

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
   * 是否支持键盘 ESC 关闭
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
   * 是否全屏显示
   */
  @Prop() fullscreen: boolean = false;

  /**
   * 是否显示底部操作区域
   */
  @Prop() footer: boolean = true;

  /**
   * 确认按钮文本
   */
  @Prop() okText: string = '确定';

  /**
   * 取消按钮文本
   */
  @Prop() cancelText: string = '取消';

  /**
   * 确认按钮类型
   */
  @Prop() okType: 'default' | 'primary' | 'dashed' | 'text' | 'link' = 'primary';

  /**
   * 确认按钮是否加载中
   */
  @Prop() confirmLoading: boolean = false;

  /**
   * 自定义样式类名
   */
  @Prop() customClass?: string;

  /**
   * z-index 层级
   */
  @Prop() zIndex: number = 1000;

  /**
   * 动画名称
   */
  @Prop() animation: 'fade' | 'zoom' | 'slide-up' | 'slide-down' = 'fade';

  /**
   * 内部状态：是否正在显示动画
   */
  @State() isAnimating: boolean = false;

  /**
   * 内部状态：模态框 ID
   */
  @State() modalId: string = generateId('modal');

  /**
   * 内部状态：是否正在拖拽
   */
  @State() isDragging: boolean = false;

  /**
   * 内部状态：拖拽偏移
   */
  @State() dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * 打开事件
   */
  @Event() ldOpen!: EventEmitter<void>;

  /**
   * 关闭事件
   */
  @Event() ldClose!: EventEmitter<void>;

  /**
   * 确认事件
   */
  @Event() ldOk!: EventEmitter<void>;

  /**
   * 取消事件
   */
  @Event() ldCancel!: EventEmitter<void>;

  /**
   * 监听 visible 属性变化
   */
  @Watch('visible')
  onVisibleChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      if (newValue) {
        this.handleOpen();
      } else {
        this.handleClose();
      }
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    if (this.visible) {
      this.handleOpen();
    }
  }

  /**
   * 组件卸载
   */
  disconnectedCallback() {
    this.removeEventListeners();
  }

  /**
   * 打开模态框
   */
  @Method()
  async open() {
    this.visible = true;
  }

  /**
   * 关闭模态框
   */
  @Method()
  async close() {
    this.visible = false;
  }

  /**
   * 处理打开
   */
  private handleOpen() {
    this.isAnimating = true;
    this.addEventListeners();
    this.ldOpen.emit();

    // 动画结束后设置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }

  /**
   * 处理关闭
   */
  private handleClose() {
    this.isAnimating = true;
    this.removeEventListeners();
    this.ldClose.emit();

    // 动画结束后设置状态
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }

  /**
   * 添加事件监听器
   */
  private addEventListeners() {
    if (this.keyboard) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.visible) {
      this.handleCancel();
    }
  };

  /**
   * 处理遮罩层点击
   */
  private handleMaskClick = (event: MouseEvent) => {
    if (this.maskClosable && event.target === event.currentTarget) {
      this.handleCancel();
    }
  };

  /**
   * 处理关闭按钮点击
   */
  private handleCloseClick = () => {
    this.handleCancel();
  };

  /**
   * 处理确认按钮点击
   */
  private handleOk = () => {
    this.ldOk.emit();
  };

  /**
   * 处理取消按钮点击
   */
  private handleCancel = () => {
    this.ldCancel.emit();
    this.close();
  };

  /**
   * 获取模态框样式
   */
  private getModalStyle() {
    const style: any = {
      zIndex: this.zIndex.toString(),
    };

    if (typeof this.width === 'number') {
      style.width = `${this.width}px`;
    } else {
      style.width = this.width;
    }

    if (this.height) {
      if (typeof this.height === 'number') {
        style.height = `${this.height}px`;
      } else {
        style.height = this.height;
      }
    }

    if (this.isDraggable && this.dragOffset.x !== 0 || this.dragOffset.y !== 0) {
      style.transform = `translate(${this.dragOffset.x}px, ${this.dragOffset.y}px)`;
    }

    return style;
  }

  /**
   * 渲染头部
   */
  private renderHeader() {
    if (!this.modalTitle && !this.closable) {
      return null;
    }

    return (
      <div class="ld-modal__header">
        {this.modalTitle && (
          <div class="ld-modal__title" id={`${this.modalId}-title`}>
            {this.modalTitle}
          </div>
        )}
        {this.closable && (
          <button
            class="ld-modal__close"
            onClick={this.handleCloseClick}
            aria-label="关闭"
          >
            <span class="ld-modal__close-icon">×</span>
          </button>
        )}
      </div>
    );
  }

  /**
   * 渲染底部
   */
  private renderFooter() {
    if (!this.footer) {
      return null;
    }

    return (
      <div class="ld-modal__footer">
        <slot name="footer">
          <ld-button onClick={this.handleCancel}>
            {this.cancelText}
          </ld-button>
          <ld-button
            type={this.okType}
            loading={this.confirmLoading}
            onClick={this.handleOk}
          >
            {this.okText}
          </ld-button>
        </slot>
      </div>
    );
  }

  render() {
    if (!this.visible && !this.isAnimating) {
      return null;
    }

    const modalClass = {
      'ld-modal': true,
      'ld-modal--visible': this.visible,
      'ld-modal--centered': this.centered,
      'ld-modal--fullscreen': this.fullscreen,
      'ld-modal--draggable': this.isDraggable,
      'ld-modal--resizable': this.resizable,
      [`ld-modal--${this.animation}`]: true,
      [this.customClass]: !!this.customClass,
    };

    return (
      <Host>
        <div class="ld-modal-root">
          {this.mask && (
            <div
              class="ld-modal__mask"
              onClick={this.handleMaskClick}
            />
          )}
          <div class="ld-modal__wrap">
            <div
              class={modalClass}
              style={this.getModalStyle()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={this.modalTitle ? `${this.modalId}-title` : undefined}
            >
              {this.renderHeader()}
              <div class="ld-modal__body">
                <slot />
              </div>
              {this.renderFooter()}
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
