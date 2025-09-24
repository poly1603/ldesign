import { Component, Prop, State, Watch, h, Host, Element } from '@stencil/core';

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

  /** 由父组件控制的激活状态（反射到属性便于样式控制） */
  @Prop({ mutable: true, reflect: true }) active: boolean = false;

  /** 是否已渲染（懒渲染标记） */
  @State() hasRendered: boolean = false;

  componentWillLoad() {
    // 非懒渲染模式：立即渲染
    if (!this.lazy) this.hasRendered = true;
    // 如果初始已激活，则也应渲染
    if (this.active) this.hasRendered = true;
  }

  @Watch('active')
  onActiveChange(isActive: boolean) {
    if (isActive) {
      this.hasRendered = true;
    }
  }

  private shouldRenderContent() {
    return this.active || this.hasRendered;
  }

  render() {
    return (
      <Host
        class={{
          'ldesign-tab-panel': true,
          'ldesign-tab-panel--active': this.active,
        }}
        role="tabpanel"
        tabindex={this.active ? 0 : -1}
        aria-hidden={this.active ? 'false' : 'true'}
      >
        {this.shouldRenderContent() ? <slot></slot> : null}
      </Host>
    );
  }
}
