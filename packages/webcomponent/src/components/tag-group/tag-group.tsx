import { Component, Prop, h, Host, Element, State, Listen } from '@stencil/core';

/**
 * TagGroup 标签组
 * - overflow="scroll" 提供横向滚动和可选箭头
 * - overflow="more" 根据 maxVisible 折叠为 +N，并使用 ldesign-popup 展示剩余项
 */
@Component({
  tag: 'ldesign-tag-group',
  styleUrl: 'tag-group.less',
  shadow: false,
})
export class LdesignTagGroup {
  @Element() el!: HTMLElement;

  /** 溢出策略：scroll（水平滚动） | more（+N 收纳） */
  @Prop() overflow: 'scroll' | 'more' = 'scroll';

  /** more 模式下最多展示的项数（超出将折叠） */
  @Prop() maxVisible: number = 5;

  /** more 展示文本前缀，例如 "+" */
  @Prop() morePrefix: string = '+';

  /** 是否显示滚动箭头（仅 overflow=scroll 时生效） */
  @Prop() showArrows: boolean = true;

  /** 滚动步长（像素） */
  @Prop() scrollStep: number = 120;

  /** 内部状态：隐藏的元素文本 */
  @State() hiddenTexts: string[] = [];

  private slotEl?: HTMLSlotElement;
  private scroller?: HTMLElement;

  componentDidLoad() {
    this.updateHidden();
  }

  @Listen('resize', { target: 'window' })
  onWindowResize() {
    if (this.overflow === 'more') {
      // 重新计算隐藏项（maxVisible 改变布局时）
      this.updateHidden();
    }
  }

  private updateHidden() {
    if (!this.slotEl) return;
    if (this.overflow !== 'more') {
      this.hiddenTexts = [];
      // 清理隐藏标记
      this.slotEl.assignedElements().forEach((el: Element) => el.removeAttribute('data-hidden-by-group'));
      return;
    }
    const els = this.slotEl.assignedElements({ flatten: true });
    const toHide = els.slice(this.maxVisible);
    const toShow = els.slice(0, this.maxVisible);
    toShow.forEach(el => el.removeAttribute('data-hidden-by-group'));
    toHide.forEach(el => el.setAttribute('data-hidden-by-group', 'true'));
    this.hiddenTexts = toHide.map(el => (el as HTMLElement).innerText?.trim() || el.tagName.toLowerCase());
  }

  private onSlotChange = () => {
    this.updateHidden();
  };

  private scrollBy(dx: number) {
    if (!this.scroller) return;
    this.scroller.scrollBy({ left: dx, behavior: 'smooth' });
  }

  render() {
    const showMore = this.overflow === 'more' && this.hiddenTexts.length > 0;
    const moreCount = this.hiddenTexts.length;

    return (
      <Host class={{ 'ldesign-tag-group': true, 'ldesign-tag-group--scroll': this.overflow === 'scroll', 'ldesign-tag-group--more': this.overflow === 'more' }}>
        <div class="ldesign-tag-group__viewport" ref={el => (this.scroller = el as HTMLElement)}>
          {this.showArrows && this.overflow === 'scroll' && (
            <button class="ldesign-tag-group__arrow ldesign-tag-group__arrow--left" type="button" aria-label="向左" onClick={() => this.scrollBy(-this.scrollStep)}>
              <ldesign-icon name="chevron-left" size="small"></ldesign-icon>
            </button>
          )}

          <div class="ldesign-tag-group__list">
            <slot ref={el => (this.slotEl = el as HTMLSlotElement)} onSlotchange={this.onSlotChange}></slot>
          </div>

          {this.showArrows && this.overflow === 'scroll' && (
            <button class="ldesign-tag-group__arrow ldesign-tag-group__arrow--right" type="button" aria-label="向右" onClick={() => this.scrollBy(this.scrollStep)}>
              <ldesign-icon name="chevron-right" size="small"></ldesign-icon>
            </button>
          )}
        </div>

        {showMore && (
          <ldesign-popup placement="bottom" interactive={true} trigger="click">
            <ldesign-tag slot="trigger" variant="light" color="default" clickable>
              {this.morePrefix}{moreCount}
            </ldesign-tag>
            <div class="ldesign-tag-group__more-list">
              {this.hiddenTexts.map((text, i) => (
                <div class="ldesign-tag-group__more-item" role="listitem" aria-setsize={moreCount} aria-posinset={i + 1}>
                  {text}
                </div>
              ))}
            </div>
          </ldesign-popup>
        )}
      </Host>
    );
  }
}
