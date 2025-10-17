import { Component, Prop, State, Watch, h, Host, Element, Event, EventEmitter } from '@stencil/core';

/**
 * TabPanel 选项卡面板
 * - 由 <ldesign-tabs> 管理激活状态
 */
@Component({
  tag: 'ldesign-tab-panel',
  styleUrl: 'tab-panel.less',
  shadow: false,
})
export class LdesignTabPanel {
  @Element() el!: HTMLElement;

  /** 面板唯一标识（用于匹配激活项） */
  @Prop({ mutable: true }) name!: string;

  /** 标签显示文本 */
  @Prop({ mutable: true }) label!: string;

  /** 禁用状态（不可被激活） */
  @Prop() disabled: boolean = false;

  /** 是否可关闭（在标签上显示关闭按钮） */
  @Prop() closable: boolean = false;

  /** 懒渲染：首次激活时才渲染插槽内容，之后保持渲染 */
  @Prop() lazy: boolean = false;

  /** 销毁隐藏：在面板隐藏时销毁内容，再次显示时重新渲染 */
  @Prop() destroyOnHide: boolean = false;

  /** 图标 */
  @Prop() icon?: string;

  /** 徽标 */
  @Prop() badge?: string | number;

  /** 加载中状态 */
  @Prop() loading: boolean = false;

  /** 过渡动画类型 */
  @Prop() transition: 'fade' | 'slide' | 'zoom' | 'none' = 'fade';

  /** 过渡动画时长（毫秒） */
  @Prop() transitionDuration: number = 300;

  /** 由父组件控制的激活状态（反射到属性便于样式控制） */
  @Prop({ mutable: true, reflect: true }) active: boolean = false;

  /** 是否已渲染（懒渲染标记） */
  @State() hasRendered: boolean = false;

  /** 动画状态 */
  @State() animationClass: string = '';

  /** 面板加载完成事件 */
  @Event() ldesignPanelLoad!: EventEmitter<void>;

  /** 面板销毁事件 */
  @Event() ldesignPanelDestroy!: EventEmitter<void>;

  private animationTimer?: number;

  componentWillLoad() {
    // 非懒渲染模式：立即渲染
    if (!this.lazy && !this.destroyOnHide) this.hasRendered = true;
    // 如果初始已激活，则也应渲染
    if (this.active) {
      this.hasRendered = true;
      this.startEnterAnimation();
    }
  }

  componentDidLoad() {
    if (this.hasRendered) {
      this.ldesignPanelLoad.emit();
    }
  }

  disconnectedCallback() {
    if (this.animationTimer) {
      cancelAnimationFrame(this.animationTimer);
    }
    this.ldesignPanelDestroy.emit();
  }

  @Watch('active')
  onActiveChange(isActive: boolean) {
    if (isActive) {
      if (!this.hasRendered) {
        this.hasRendered = true;
        // 首次渲染时触发加载事件
        requestAnimationFrame(() => {
          this.ldesignPanelLoad.emit();
        });
      }
      this.startEnterAnimation();
    } else {
      this.startLeaveAnimation();
      // 如果设置了 destroyOnHide，隐藏时销毁内容
      if (this.destroyOnHide) {
        setTimeout(() => {
          this.hasRendered = false;
        }, this.transitionDuration);
      }
    }
  }

  private startEnterAnimation() {
    if (this.transition === 'none') return;
    
    this.animationClass = `ldesign-tab-panel--${this.transition}-enter`;
    
    this.animationTimer = requestAnimationFrame(() => {
      this.animationClass = `ldesign-tab-panel--${this.transition}-enter-active`;
      
      setTimeout(() => {
        this.animationClass = '';
      }, this.transitionDuration);
    });
  }

  private startLeaveAnimation() {
    if (this.transition === 'none') return;
    
    this.animationClass = `ldesign-tab-panel--${this.transition}-leave`;
    
    this.animationTimer = requestAnimationFrame(() => {
      this.animationClass = `ldesign-tab-panel--${this.transition}-leave-active`;
    });
  }

  private shouldRenderContent() {
    return this.hasRendered && (this.active || !this.destroyOnHide);
  }

  private renderContent() {
    if (this.loading) {
      return (
        <div class="ldesign-tab-panel__loading">
          <div class="ldesign-tab-panel__spinner"></div>
          <span>加载中...</span>
        </div>
      );
    }
    return <slot></slot>;
  }

  render() {
    return (
      <Host
        class={{
          'ldesign-tab-panel': true,
          'ldesign-tab-panel--active': this.active,
          'ldesign-tab-panel--loading': this.loading,
          [this.animationClass]: !!this.animationClass,
        }}
        role="tabpanel"
        tabindex={this.active ? 0 : -1}
        aria-hidden={this.active ? 'false' : 'true'}
        style={{
          '--transition-duration': `${this.transitionDuration}ms`,
        }}
      >
        {this.shouldRenderContent() ? this.renderContent() : null}
      </Host>
    );
  }
}
