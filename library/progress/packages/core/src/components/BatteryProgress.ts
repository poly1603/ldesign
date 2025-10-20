import { BatteryProgressOptions } from '../types';
import { ProgressBase } from '../base';
import { createElement, createSVGElement, toPx } from '../utils';

/**
 * 电池样式进度条
 */
export class BatteryProgress extends ProgressBase<BatteryProgressOptions> {
  private wrapper!: HTMLElement;
  private battery!: HTMLElement;
  private fill!: HTMLElement;
  private head!: HTMLElement;
  private boltIcon?: SVGElement;
  private textElement?: HTMLElement;

  protected getDefaultOptions(): Partial<BatteryProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      orientation: 'horizontal',
      batteryWidth: 100,
      batteryHeight: 50,
      showBoltIcon: false,
      chargingColor: '#67c23a',
      lowBatteryThreshold: 20,
      lowBatteryColor: '#f56c6c',
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 创建包装器
    this.wrapper = createElement('div', 'ld-progress-battery', this.container);
    const orientation = this.config.get('orientation') ?? 'horizontal';
    this.wrapper.classList.add(`ld-progress-battery--${orientation}`);

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.wrapper.classList.add(className);
    }

    const width = this.config.get('batteryWidth') ?? 100;
    const height = this.config.get('batteryHeight') ?? 50;

    if (orientation === 'horizontal') {
      this.wrapper.style.width = toPx(width);
      this.wrapper.style.height = toPx(height);
    } else {
      this.wrapper.style.width = toPx(height);
      this.wrapper.style.height = toPx(width);
    }

    this.wrapper.style.display = 'inline-flex';
    this.wrapper.style.alignItems = 'center';
    this.wrapper.style.position = 'relative';

    // 创建电池主体
    this.battery = createElement('div', 'ld-progress-battery__body', this.wrapper);
    this.battery.style.flex = '1';
    this.battery.style.height = '100%';
    this.battery.style.border = '3px solid #909399';
    this.battery.style.borderRadius = '4px';
    this.battery.style.position = 'relative';
    this.battery.style.overflow = 'hidden';
    this.battery.style.backgroundColor = '#f5f5f5';

    // 创建填充
    this.fill = createElement('div', 'ld-progress-battery__fill', this.battery);
    this.fill.style.position = 'absolute';
    this.fill.style.bottom = '0';
    this.fill.style.left = '0';
    this.fill.style.height = '100%';
    this.fill.style.transition = 'width 0.3s, background-color 0.3s';

    // 创建电池头
    this.head = createElement('div', 'ld-progress-battery__head', this.wrapper);
    if (orientation === 'horizontal') {
      this.head.style.width = '6px';
      this.head.style.height = '40%';
      this.head.style.backgroundColor = '#909399';
      this.head.style.borderRadius = '0 3px 3px 0';
    } else {
      this.head.style.width = '40%';
      this.head.style.height = '6px';
      this.head.style.backgroundColor = '#909399';
      this.head.style.borderRadius = '3px 3px 0 0';
      this.head.style.order = '-1';
    }

    // 添加闪电图标
    if (this.config.get('showBoltIcon')) {
      this.renderBoltIcon();
    }

    // 创建文本
    if (this.config.get('showText')) {
      this.textElement = createElement('div', 'ld-progress-battery__text', this.battery);
      this.textElement.style.position = 'absolute';
      this.textElement.style.top = '50%';
      this.textElement.style.left = '50%';
      this.textElement.style.transform = 'translate(-50%, -50%)';
      this.textElement.style.fontSize = '14px';
      this.textElement.style.fontWeight = 'bold';
      this.textElement.style.color = '#303133';
      this.textElement.style.zIndex = '10';
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected renderBoltIcon(): void {
    const svg = createSVGElement('svg', {
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      class: 'ld-progress-battery__bolt',
    }) as SVGElement;

    const path = createSVGElement('path', {
      d: 'M13 2L3 14h8l-1 8 10-12h-8l1-8z',
      fill: '#ffd43b',
      stroke: '#f59e0b',
      'stroke-width': '1',
    });

    svg.appendChild(path);
    svg.style.position = 'absolute';
    svg.style.top = '50%';
    svg.style.left = '50%';
    svg.style.transform = 'translate(-50%, -50%)';
    svg.style.zIndex = '10';

    this.battery.appendChild(svg);
    this.boltIcon = svg;
  }

  protected updateProgress(value: number): void {
    const percentage = this.config.getPercentage(value);
    const orientation = this.config.get('orientation') ?? 'horizontal';
    const lowThreshold = this.config.get('lowBatteryThreshold') ?? 20;
    const lowColor = this.config.get('lowBatteryColor') ?? '#f56c6c';
    const chargingColor = this.config.get('chargingColor') ?? '#67c23a';

    // 更新填充宽度/高度
    if (orientation === 'horizontal') {
      this.fill.style.width = `${percentage}%`;
      this.fill.style.height = '100%';
    } else {
      this.fill.style.width = '100%';
      this.fill.style.height = `${percentage}%`;
    }

    // 根据电量改变颜色
    let fillColor: string;
    if (percentage <= lowThreshold) {
      fillColor = lowColor;
    } else if (this.config.get('showBoltIcon')) {
      fillColor = chargingColor;
    } else {
      const color = this.config.get('color');
      fillColor = Array.isArray(color) ? color[0] : (color || '#67c23a');
    }

    this.fill.style.backgroundColor = fillColor;

    // 低电量时添加脉冲动画
    if (percentage <= lowThreshold && percentage > 0) {
      this.fill.style.animation = 'battery-pulse 1.5s infinite';
    } else {
      this.fill.style.animation = 'none';
    }

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }
  }

  /**
   * 设置方向
   */
  setOrientation(orientation: 'horizontal' | 'vertical'): void {
    this.config.set('orientation', orientation);
    this.render();
  }

  /**
   * 设置充电状态
   */
  setCharging(charging: boolean): void {
    this.config.set('showBoltIcon', charging);
    if (charging && !this.boltIcon) {
      this.renderBoltIcon();
    } else if (!charging && this.boltIcon) {
      this.boltIcon.remove();
      this.boltIcon = undefined;
    }
    this.updateProgress(this.currentValue);
  }
}


