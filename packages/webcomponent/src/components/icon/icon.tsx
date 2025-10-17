import { Component, Prop, State, Watch, h, Host, Method } from '@stencil/core';
import { Size } from '../../types';

// 全局缓存，避免重复动态导入与重复构建 SVG
let __lucidePromise: Promise<any> | null = null;
const __svgCache = new Map<string, string>(); // key: `${name}@${strokeWidth}`
const MAX_CACHE_SIZE = 100; // 缓存大小限制

function getLucideModule() {
  if (!__lucidePromise) {
    __lucidePromise = import('lucide');
  }
  return __lucidePromise;
}

// 清理最旧的缓存项
function clearOldestCache() {
  if (__svgCache.size >= MAX_CACHE_SIZE) {
    const firstKey = __svgCache.keys().next().value;
    __svgCache.delete(firstKey);
  }
}

// Lucide 图标数据类型
type LucideIconData = [string, Record<string, any>, Array<any>?];

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
   * 是否旋转（兼容旧版）
   */
  @Prop() spin: boolean = false;

  /**
   * 动画类型
   */
  @Prop() animation?: 'spin' | 'pulse' | 'bounce' | 'flash' | 'shake' | 'none' = 'none';

  /**
   * 描边宽度
   */
  @Prop() strokeWidth: number = 2;

  /**
   * 旋转角度
   */
  @Prop() rotate?: number;

  /**
   * 翻转方向
   */
  @Prop() flip?: 'horizontal' | 'vertical' | 'both';

  /**
   * 是否使用渐变色
   */
  @Prop() gradient: boolean = false;

  /**
   * 渐变色数组
   */
  @Prop() gradientColors?: string | string[];

  /**
   * 渐变方向
   */
  @Prop() gradientDirection: 'horizontal' | 'vertical' | 'diagonal' = 'horizontal';

  /**
   * 无障碍标签
   */
  @Prop() label?: string;

  /**
   * 是否为装饰性图标（无语义）
   */
  @Prop() decorative: boolean = false;

  /**
   * 自定义SVG内容
   */
  @Prop() customSvg?: string;

  /**
   * 内部状态：SVG内容
   */
  @State() svgContent: string = '';

  /**
   * 内部状态：渐变ID
   */
  @State() gradientId: string = '';

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
  
  @Watch('gradient')
  @Watch('gradientColors') 
  @Watch('gradientDirection')
  async watchGradient() {
    if (this.name) {
      await this.loadIcon(this.name);
    }
  }

  @Watch('customSvg')
  watchCustomSvg(newSvg: string) {
    if (newSvg) {
      this.svgContent = newSvg;
    }
  }

  /**
   * 组件加载完成
   */
  async componentWillLoad() {
    // 生成唯一的渐变ID
    this.gradientId = `ldesign-icon-gradient-${Math.random().toString(36).substr(2, 9)}`;
    
    // 处理自定义SVG
    if (this.customSvg) {
      this.svgContent = this.customSvg;
      return;
    }
    
    // 加载图标
    if (this.name) {
      await this.loadIcon(this.name);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[ldesign-icon] name prop is required when not using customSvg');
    }
  }

  /**
   * 加载图标
   */
  private async loadIcon(iconName: string) {
    const name = normalizeIconName(iconName || '');
    // 缓存key需要包含渐变信息
    const cacheKey = this.gradient 
      ? `${name}@${this.strokeWidth}@gradient@${this.gradientDirection}` 
      : `${name}@${this.strokeWidth}`;

    // 如果不使用渐变，从缓存获取
    if (!this.gradient) {
      const cached = __svgCache.get(cacheKey);
      if (cached) {
        this.svgContent = cached;
        return;
      }
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
          this.logIconError(pascalName, e, 'Icon not found in lucide exports');
        }
      }

      if (iconData) {
        const svgContent = this.buildSVGFromLucideData(iconData as LucideIconData);
        // 渐变图标不缓存，因为渐变颜色可能变化
        if (!this.gradient) {
          clearOldestCache(); // 清理旧缓存
          __svgCache.set(cacheKey, svgContent);
        }
        this.svgContent = svgContent;
      } else {
        this.logIconError(iconName, null, `Icon "${pascalName}" not found`);
        this.svgContent = this.getDefaultIcon();
      }
    } catch (error) {
      this.logIconError(iconName, error, 'Failed to load icon');
      this.svgContent = this.getDefaultIcon();
    }
  }

  /**
   * 记录错误日志
   */
  private logIconError(iconName: string, error: any, context: string) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[ldesign-icon] ${context}: "${iconName}"`, error);
    }
  }

  /**
   * 从Lucide图标数据构建SVG字符串
   */
  private buildSVGFromLucideData(iconData: LucideIconData): string {
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
      stroke: this.gradient ? `url(#${this.gradientId})` : 'currentColor',
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
    let childrenString = this.buildChildrenString(children || []);
    
    // 如果使用渐变，添加渐变定义
    if (this.gradient) {
      const gradientDef = this.buildGradientDefinition();
      childrenString = gradientDef + childrenString;
    }

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
        // 对子元素也应用渐变和描边宽度
        const modifiedAttrs = { ...attrs };
        
        // 如果是绘图元素，应用描边宽度和渐变
        const isDrawingElement = tag === 'path' || tag === 'circle' || tag === 'rect' || 
                                 tag === 'line' || tag === 'polyline' || tag === 'polygon' || 
                                 tag === 'ellipse';
        
        if (isDrawingElement) {
          // 应用描边宽度
          if (!modifiedAttrs['stroke-width'] && this.strokeWidth !== 2) {
            modifiedAttrs['stroke-width'] = this.strokeWidth.toString();
          }
          
          // 应用渐变
          if (this.gradient && (!modifiedAttrs.fill || modifiedAttrs.fill === 'none')) {
            modifiedAttrs.stroke = `url(#${this.gradientId})`;
          }
        }
        
        const attrString = Object.entries(modifiedAttrs)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        const childrenString = this.buildChildrenString(childNodes);

        return `<${tag}${attrString ? ' ' + attrString : ''}>${childrenString}</${tag}>`;
      }

      return '';
    }).join('');
  }

  /**
   * 构建渐变定义
   */
  private buildGradientDefinition(): string {
    const colors = this.getGradientColors();
    const direction = this.getGradientCoordinates();
    
    const stops = colors.map((color, index) => {
      const offset = (index / (colors.length - 1)) * 100;
      return `<stop offset="${offset}%" stop-color="${color}"/>`;
    }).join('');
    
    return `<defs><linearGradient id="${this.gradientId}" ${direction}>${stops}</linearGradient></defs>`;
  }

  /**
   * 获取渐变色数组
   */
  private getGradientColors(): string[] {
    if (!this.gradientColors) {
      // 默认渐变色
      return ['#667eea', '#764ba2'];
    }
    
    if (typeof this.gradientColors === 'string') {
      // 尝试解析JSON字符串
      try {
        const parsed = JSON.parse(this.gradientColors);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // 如果不是JSON，可能是单个颜色或逗号分隔的颜色
        if (this.gradientColors.includes(',')) {
          return this.gradientColors.split(',').map(c => c.trim());
        }
        return [this.gradientColors, this.gradientColors];
      }
    }
    
    return this.gradientColors as string[];
  }

  /**
   * 获取渐变坐标
   */
  private getGradientCoordinates(): string {
    switch (this.gradientDirection) {
      case 'horizontal':
        return 'x1="0%" y1="0%" x2="100%" y2="0%"';
      case 'vertical':
        return 'x1="0%" y1="0%" x2="0%" y2="100%"';
      case 'diagonal':
        return 'x1="0%" y1="0%" x2="100%" y2="100%"';
      default:
        return 'x1="0%" y1="0%" x2="100%" y2="0%"';
    }
  }

  /**
   * 获取默认图标（当图标加载失败时使用）
   */
  private getDefaultIcon(): string {
    const stroke = this.gradient ? `url(#${this.gradientId})` : 'currentColor';
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`;
    
    if (this.gradient) {
      svg += this.buildGradientDefinition();
    }
    
    svg += `<circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`;
    
    return svg;
  }

  /**
   * 获取图标类名
   */
  private resolveSize(): Size | number {
    const s: any = this.size as any;
    if (typeof s === 'number') return s;
    if (typeof s === 'string') {
      const trimmed = s.trim();
      // 纯数字或数字字符串，解析为 number
      if (/^\d+(\.\d+)?(px)?$/.test(trimmed)) {
        return Number(trimmed.replace(/px$/, ''));
      }
      // 预设关键词 small/medium/large
      if (trimmed === 'small' || trimmed === 'medium' || trimmed === 'large') {
        return trimmed as Size;
      }
    }
    // 回退到默认 medium
    return 'medium';
  }

  private getIconClass(): string {
    const classes = ['ldesign-icon'];

    // 尺寸
    const resolved = this.resolveSize();
    if (typeof resolved === 'string') {
      classes.push(`ldesign-icon--${resolved}`);
    } else {
      classes.push('ldesign-icon--custom-size');
    }

    // 动画效果（优先使用animation属性，spin作为兼容）
    const animation = this.spin ? 'spin' : this.animation;
    if (animation && animation !== 'none') {
      classes.push(`ldesign-icon--${animation}`);
    }

    // 翻转效果
    if (this.flip) {
      classes.push(`ldesign-icon--flip-${this.flip}`);
    }

    return classes.join(' ');
  }

  /**
   * 获取图标样式
   */
  private getIconStyle(): { [key: string]: string } {
    const style: { [key: string]: string } = {};

    // 尺寸
    const resolved = this.resolveSize();
    if (typeof resolved === 'number') {
      style.width = `${resolved}px`;
      style.height = `${resolved}px`;
    }

    // 颜色（渐变时忽略）
    if (this.color && !this.gradient) {
      style.color = this.color;
    }

    // 旋转角度
    if (this.rotate) {
      style.transform = `rotate(${this.rotate}deg)`;
    }

    return style;
  }

  /**
   * 预加载图标（公开方法）
   */
  @Method()
  async preloadIcons(iconNames: string[]): Promise<void> {
    const promises = iconNames.map(name => this.loadIcon(name));
    await Promise.all(promises);
  }

  /**
   * 搜索图标（公开方法）
   */
  @Method()
  async searchIcons(keyword: string): Promise<string[]> {
    const { allLucideIcons } = await import('./all-lucide-icons');
    return allLucideIcons.filter(icon => 
      icon.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  render() {
    return (
      <Host 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          verticalAlign: 'middle'
        }}
        role={this.decorative ? undefined : 'img'}
        aria-label={this.decorative ? undefined : (this.label || this.name)}
        aria-hidden={this.decorative ? 'true' : undefined}
      >
        <span
          class={this.getIconClass()}
          style={this.getIconStyle()}
          innerHTML={this.svgContent}
        />
      </Host>
    );
  }
}
