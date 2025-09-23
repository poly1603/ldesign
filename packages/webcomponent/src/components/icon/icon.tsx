import { Component, Prop, State, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

// 全局缓存，避免重复动态导入与重复构建 SVG
let __lucidePromise: Promise<any> | null = null;
const __svgCache = new Map<string, string>(); // key: `${name}@${strokeWidth}`

function getLucideModule() {
  if (!__lucidePromise) {
    __lucidePromise = import('lucide');
  }
  return __lucidePromise;
}

// 规范化图标名：支持 alarmClock / AlarmClock / alarm_clock / " alarm-clock " 等传入
function normalizeIconName(name: string): string {
  if (!name) return '';
  let s = String(name).trim();
  // camelCase -> kebab-case（userIcon -> user-icon）
  s = s.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  // 下划线、空格 -> 连字符
  s = s.replace(/[_\s]+/g, '-');
  // 多个连字符合并
  s = s.replace(/-+/g, '-');
  // 全小写
  s = s.toLowerCase();
  // 去掉首尾 -
  s = s.replace(/^-+|-+$/g, '');
  return s;
}

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
   * 描边宽度
   */
  @Prop() strokeWidth: number = 2;

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

  @Watch('strokeWidth')
  async watchStrokeWidth() {
    if (this.name) {
      await this.loadIcon(this.name);
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
    const name = normalizeIconName(iconName || '');
    const cacheKey = `${name}@${this.strokeWidth}`;

    const cached = __svgCache.get(cacheKey);
    if (cached) {
      this.svgContent = cached;
      return;
    }

    try {
      // 将图标名转换为PascalCase以匹配导出名
      const pascalName = name.split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      // 动态导入lucide模块并获取指定图标
      const lucideModule = await getLucideModule();
      let iconData = lucideModule?.[pascalName];
      
      // 如果没找到，尝试直接导入单个图标
      if (!iconData) {
        try {
          const iconModule = await import(/* @vite-ignore */ `lucide`);
          iconData = iconModule[pascalName];
        } catch (e) {
          console.warn(`Icon "${pascalName}" not found in lucide exports`);
        }
      }

      if (iconData) {
        const svgContent = this.buildSVGFromLucideData(iconData);
        __svgCache.set(cacheKey, svgContent);
        this.svgContent = svgContent;
      } else {
        console.warn(`Icon "${iconName}" (${pascalName}) not found`);
        this.svgContent = this.getDefaultIcon();
      }
    } catch (error) {
      console.warn(`Failed to load icon "${iconName}":`, error);
      this.svgContent = this.getDefaultIcon();
    }
  }

  /**
   * 从Lucide图标数据构建SVG字符串
   */
  private buildSVGFromLucideData(iconData: any): string {
    const [tag, attrs, children] = iconData;

    if (tag !== 'svg') {
      return this.getDefaultIcon();
    }

    // 构建SVG属性
    const svgAttrs = {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': this.strokeWidth.toString(),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      ...attrs
    };

    // 构建属性字符串
    const attrString = Object.entries(svgAttrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    // 递归构建子元素
    const childrenString = this.buildChildrenString(children || []);

    return `<svg ${attrString}>${childrenString}</svg>`;
  }

  /**
   * 递归构建子元素字符串
   */
  private buildChildrenString(children: any[]): string {
    return children.map(child => {
      if (typeof child === 'string') {
        return child;
      }

      if (Array.isArray(child)) {
        const [tag, attrs = {}, childNodes = []] = child;
        const attrString = Object.entries(attrs)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        const childrenString = this.buildChildrenString(childNodes);

        return `<${tag}${attrString ? ' ' + attrString : ''}>${childrenString}</${tag}>`;
      }

      return '';
    }).join('');
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
      <Host style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle'
      }}>
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
