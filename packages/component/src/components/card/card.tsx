/**
 * Card 组件实现
 * 
 * 基于 Stencil 的现代化卡片组件，支持头部、内容、底部的灵活配置
 * 具备完整的可访问性支持和主题定制功能
 */

import { Component, Prop, Event, EventEmitter, Element, State, h, Host } from '@stencil/core';
import {
  CardProps,
  CardShadow,
  CardBorder,
  CardClickEventDetail,
  CardHoverEventDetail
} from '../../types/card';
import { Size } from '../../types';
import { classNames, generateId } from '../../utils';

@Component({
  tag: 'ld-card',
  styleUrl: 'card.less',
  shadow: true,
})
export class Card implements CardProps {
  @Element() el!: HTMLElement;

  // ==================== 属性定义 ====================

  /**
   * 卡片标题
   */
  @Prop() cardTitle?: string;

  /**
   * 卡片副标题
   */
  @Prop() subtitle?: string;

  /**
   * 卡片描述
   */
  @Prop() description?: string;

  /**
   * 卡片尺寸
   */
  @Prop() size: Size = 'medium';

  /**
   * 阴影显示时机
   */
  @Prop() shadow: CardShadow = 'always';

  /**
   * 边框样式
   */
  @Prop() border: CardBorder = 'solid';

  /**
   * 是否可悬停
   */
  @Prop() hoverable: boolean = false;

  /**
   * 是否可点击
   */
  @Prop() clickable: boolean = false;

  /**
   * 是否加载中
   */
  @Prop() loading: boolean = false;

  /**
   * 头部图标
   */
  @Prop() headerIcon?: string;

  /**
   * 头部额外内容
   */
  @Prop() headerExtra?: string;

  /**
   * 封面图片 URL
   */
  @Prop() cover?: string;

  /**
   * 封面图片替代文本
   */
  @Prop() coverAlt?: string;

  /**
   * 封面图片高度
   */
  @Prop() coverHeight: string = '200px';

  /**
   * 是否显示头部分割线
   */
  @Prop() headerDivider: boolean = true;

  /**
   * 是否显示底部分割线
   */
  @Prop() footerDivider: boolean = false;

  /**
   * 内容区域内边距
   */
  @Prop() bodyPadding?: string;

  /**
   * 头部内边距
   */
  @Prop() headerPadding?: string;

  /**
   * 底部内边距
   */
  @Prop() footerPadding?: string;

  /**
   * 自定义 CSS 类名
   */
  @Prop() customClass?: string;

  /**
   * 自定义内联样式
   */
  @Prop() customStyle?: { [key: string]: string };

  // ==================== 状态定义 ====================

  /**
   * 组件唯一 ID
   */
  @State() componentId: string = generateId('ld-card');

  /**
   * 是否悬停状态
   */
  @State() hovered: boolean = false;

  /**
   * 是否按下状态
   */
  @State() pressed: boolean = false;

  // ==================== 事件定义 ====================

  /**
   * 点击事件
   */
  @Event() ldClick!: EventEmitter<CardClickEventDetail>;

  /**
   * 鼠标进入事件
   */
  @Event() ldMouseEnter!: EventEmitter<CardHoverEventDetail>;

  /**
   * 鼠标离开事件
   */
  @Event() ldMouseLeave!: EventEmitter<CardHoverEventDetail>;

  /**
   * 头部点击事件
   */
  @Event() ldHeaderClick!: EventEmitter<CardClickEventDetail>;

  /**
   * 封面点击事件
   */
  @Event() ldCoverClick!: EventEmitter<CardClickEventDetail>;

  // ==================== 事件处理方法 ====================

  /**
   * 处理卡片点击事件
   */
  private handleClick = (event: MouseEvent, area: string = 'card') => {
    if (!this.clickable && area === 'card') return;

    this.ldClick.emit({
      originalEvent: event,
      target: this.el,
      area: area as any,
    });
  };

  /**
   * 处理鼠标进入事件
   */
  private handleMouseEnter = (event: MouseEvent) => {
    if (this.hoverable) {
      this.hovered = true;
    }

    this.ldMouseEnter.emit({
      originalEvent: event,
      target: this.el,
      hovered: true,
    });
  };

  /**
   * 处理鼠标离开事件
   */
  private handleMouseLeave = (event: MouseEvent) => {
    this.hovered = false;
    this.pressed = false;

    this.ldMouseLeave.emit({
      originalEvent: event,
      target: this.el,
      hovered: false,
    });
  };

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown = () => {
    if (this.clickable) {
      this.pressed = true;
    }
  };

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp = () => {
    this.pressed = false;
  };

  /**
   * 处理头部点击事件
   */
  private handleHeaderClick = (event: MouseEvent) => {
    event.stopPropagation();
    this.handleClick(event, 'header');

    this.ldHeaderClick.emit({
      originalEvent: event,
      target: this.el,
      area: 'header',
    });
  };

  /**
   * 处理封面点击事件
   */
  private handleCoverClick = (event: MouseEvent) => {
    event.stopPropagation();
    this.handleClick(event, 'cover');

    this.ldCoverClick.emit({
      originalEvent: event,
      target: this.el,
      area: 'cover',
    });
  };

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.clickable) return;

    // 空格键和回车键触发点击
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.pressed = true;

      // 模拟点击事件
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      this.handleClick(clickEvent);
    }
  };

  /**
   * 处理键盘抬起事件
   */
  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      this.pressed = false;
    }
  };

  // ==================== 工具方法 ====================

  /**
   * 生成卡片类名
   */
  private getCardClasses(): string {
    return classNames(
      'ld-card',
      `ld-card--${this.size}`,
      `ld-card--shadow-${this.shadow}`,
      this.border !== 'none' && `ld-card--border-${this.border}`,
      this.hoverable && 'ld-card--hoverable',
      this.clickable && 'ld-card--clickable',
      this.loading && 'ld-card--loading',
      this.hovered && 'ld-card--hovered',
      this.pressed && 'ld-card--pressed',
      this.customClass
    );
  }

  /**
   * 生成卡片样式
   */
  private getCardStyles(): { [key: string]: string } {
    return {
      ...this.customStyle,
    };
  }

  /**
   * 检查是否有头部内容
   */
  private hasHeader(): boolean {
    return !!(this.cardTitle || this.subtitle || this.headerIcon || this.headerExtra);
  }

  /**
   * 检查是否有底部内容
   */
  private hasFooter(): boolean {
    const footerSlot = this.el.querySelector('[slot="footer"]');
    return !!footerSlot;
  }

  // ==================== 渲染方法 ====================

  /**
   * 渲染加载状态
   */
  private renderLoading() {
    if (!this.loading) return null;

    return (
      <div class="ld-card__loading">
        <div class="ld-card__loading-spinner">
          <ld-icon name="loading" spin />
        </div>
        <div class="ld-card__loading-overlay"></div>
      </div>
    );
  }

  /**
   * 渲染封面
   */
  private renderCover() {
    if (!this.cover) return null;

    return (
      <div
        class="ld-card__cover"
        style={{ height: this.coverHeight }}
        onClick={this.handleCoverClick}
      >
        <img
          src={this.cover}
          alt={this.coverAlt || ''}
          class="ld-card__cover-image"
        />
      </div>
    );
  }

  /**
   * 渲染头部
   */
  private renderHeader() {
    if (!this.hasHeader()) return null;

    return (
      <div
        class={classNames(
          'ld-card__header',
          this.headerDivider && 'ld-card__header--divider'
        )}
        style={this.headerPadding ? { padding: this.headerPadding } : {}}
        onClick={this.handleHeaderClick}
      >
        <div class="ld-card__header-content">
          {this.headerIcon && (
            <div class="ld-card__header-icon">
              <ld-icon name={this.headerIcon} />
            </div>
          )}
          <div class="ld-card__header-text">
            {this.cardTitle && (
              <h3 class="ld-card__title">{this.cardTitle}</h3>
            )}
            {this.subtitle && (
              <p class="ld-card__subtitle">{this.subtitle}</p>
            )}
          </div>
        </div>
        {this.headerExtra && (
          <div class="ld-card__header-extra">
            {this.headerExtra}
          </div>
        )}
        <slot name="header-extra" />
      </div>
    );
  }

  /**
   * 渲染主体内容
   */
  private renderBody() {
    return (
      <div
        class="ld-card__body"
        style={this.bodyPadding ? { padding: this.bodyPadding } : {}}
      >
        {this.description && (
          <p class="ld-card__description">{this.description}</p>
        )}
        <slot />
      </div>
    );
  }

  /**
   * 渲染底部
   */
  private renderFooter() {
    if (!this.hasFooter()) return null;

    return (
      <div
        class={classNames(
          'ld-card__footer',
          this.footerDivider && 'ld-card__footer--divider'
        )}
        style={this.footerPadding ? { padding: this.footerPadding } : {}}
      >
        <slot name="footer" />
      </div>
    );
  }

  render() {
    const cardProps = {
      id: this.componentId,
      class: this.getCardClasses(),
      style: this.getCardStyles(),
      onClick: this.handleClick,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onKeyDown: this.handleKeyDown,
      onKeyUp: this.handleKeyUp,
    };

    // 如果可点击，添加键盘导航支持
    if (this.clickable) {
      cardProps['tabindex'] = 0;
      cardProps['role'] = 'button';
      cardProps['aria-pressed'] = String(this.pressed);
    }

    return (
      <Host>
        <div {...cardProps}>
          {this.renderLoading()}
          {this.renderCover()}
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
      </Host>
    );
  }
}
