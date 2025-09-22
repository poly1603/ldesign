import { Component, Prop, State, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Icon 图标组件
 * 基于 Lucide 图标库
 */
@Component({
  tag: 'ldesign-icon',
  styleUrl: 'icon.less',
  shadow: false,
})
export class LdesignIcon {
  /**
   * 图标名称
   */
  @Prop() name!: string;

  /**
   * 图标尺寸
   */
  @Prop() size: Size | number = 'medium';

  /**
   * 图标颜色
   */
  @Prop() color?: string;

  /**
   * 是否旋转
   */
  @Prop() spin: boolean = false;

  /**
   * 内部状态：SVG内容
   */
  @State() svgContent: string = '';

  /**
   * 监听name属性变化
   */
  @Watch('name')
  async watchName(newName: string) {
    if (newName) {
      await this.loadIcon(newName);
    }
  }

  /**
   * 组件加载完成
   */
  async componentWillLoad() {
    if (this.name) {
      await this.loadIcon(this.name);
    }
  }

  /**
   * 加载图标
   */
  private async loadIcon(iconName: string) {
    // 使用预定义的图标集合，避免动态导入的复杂性
    const iconSVG = this.getIconSVG(iconName);
    this.svgContent = iconSVG;
  }

  /**
   * 获取图标SVG
   */
  private getIconSVG(iconName: string): string {
    const icons: Record<string, string> = {
      'heart': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
      </svg>`,
      'star': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>`,
      'download': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </svg>`,
      'search': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>`,
      'plus': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>`,
      'loader-2': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>`,
      'refresh-cw': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
      </svg>`
    };

    return icons[iconName] || this.getDefaultIcon();
  }

  /**
   * 获取默认图标（当图标加载失败时使用）
   */
  private getDefaultIcon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`;
  }

  /**
   * 获取图标类名
   */
  private getIconClass(): string {
    const classes = ['ldesign-icon'];

    if (typeof this.size === 'string') {
      classes.push(`ldesign-icon--${this.size}`);
    } else {
      classes.push('ldesign-icon--custom-size');
    }

    if (this.spin) {
      classes.push('ldesign-icon--spin');
    }

    return classes.join(' ');
  }

  /**
   * 获取图标样式
   */
  private getIconStyle(): { [key: string]: string } {
    const style: { [key: string]: string } = {};

    if (typeof this.size === 'number') {
      style.width = `${this.size}px`;
      style.height = `${this.size}px`;
    }

    if (this.color) {
      style.color = this.color;
    }

    return style;
  }

  render() {
    return (
      <Host>
        <span
          class={this.getIconClass()}
          style={this.getIconStyle()}
          innerHTML={this.svgContent}
          role="img"
          aria-label={this.name}
        />
      </Host>
    );
  }
}
