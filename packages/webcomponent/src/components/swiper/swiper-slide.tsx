import { Component, Prop, h, Host, Element } from '@stencil/core';

/**
 * ldesign-swiper-slide
 * - Swiper 的子项容器，支持 active 状态用于样式控制
 */
@Component({ tag: 'ldesign-swiper-slide', styleUrl: 'swiper-slide.less', shadow: false })
export class LdesignSwiperSlide {
  @Element() host!: HTMLElement;

  /** 激活态（由父级 ldesign-swiper 控制） */
  @Prop({ mutable: true, reflect: true }) active: boolean = false;

  render() {
    return (
      <Host
        class={{ 'ld-swiper-slide': true, 'ld-swiper-slide--active': this.active }}
        role="group"
        aria-roledescription="slide"
        tabindex={this.active ? 0 : -1}
      >
        <slot></slot>
      </Host>
    );
  }
}
