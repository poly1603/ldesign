import { SegmentProgressOptions } from '../types';
import { LinearProgress } from './LinearProgress';
import { createElement, toPx } from '../utils';

/**
 * 分段进度条
 */
export class SegmentProgress extends LinearProgress {
  protected getDefaultOptions(): Partial<SegmentProgressOptions> {
    return {
      ...super.getDefaultOptions(),
      segments: [],
      gap: 4,
    };
  }

  protected render(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 创建包装器
    this.wrapper = createElement('div', 'ld-progress-segment', this.container);
    const direction = this.config.get('direction') ?? 'horizontal';
    this.wrapper.classList.add(`ld-progress-segment--${direction}`);

    // 添加自定义类名
    const className = this.config.get('className');
    if (className) {
      this.wrapper.classList.add(className);
    }

    // 设置尺寸
    const strokeWidth = this.config.get('strokeWidth') ?? 6;
    if (direction === 'horizontal') {
      this.wrapper.style.height = toPx(strokeWidth);
      const width = this.config.get('width');
      if (width) {
        this.wrapper.style.width = toPx(width);
      }
    } else {
      this.wrapper.style.width = toPx(strokeWidth);
      const height = this.config.get('height');
      if (height) {
        this.wrapper.style.height = toPx(height);
      }
    }

    // 创建轨道
    this.track = createElement('div', 'ld-progress-segment__track', this.wrapper);
    const trackColor = this.config.get('trackColor');
    if (trackColor) {
      this.track.style.backgroundColor = trackColor;
    }

    // 渲染分段
    this.renderSegments();

    // 创建文本（如果需要）
    if (this.config.get('showText')) {
      this.textElement = createElement('div', 'ld-progress-segment__text', this.container);
    }

    // 更新进度
    this.updateProgress(this.currentValue);
  }

  protected renderSegments(): void {
    const segments = this.config.get('segments') ?? [];
    const direction = this.config.get('direction') ?? 'horizontal';
    const gap = this.config.get('gap') ?? 4;
    const max = this.config.get('max') ?? 100;

    this.segmentBars = [];

    if (segments.length === 0) {
      // 如果没有定义分段，创建默认的单一进度条
      this.bar = createElement('div', 'ld-progress-segment__bar', this.track);
      const color = this.config.get('color');
      if (color) {
        const colorValue = Array.isArray(color) ? color[0] : color;
        this.bar.style.backgroundColor = colorValue;
      }
      return;
    }

    let accumulatedValue = 0;

    segments.forEach((segment, index) => {
      const segmentWrapper = createElement('div', 'ld-progress-segment__wrapper', this.track);
      const segmentBar = createElement('div', 'ld-progress-segment__bar', segmentWrapper);
      
      // 设置颜色
      if (segment.color) {
        segmentBar.style.backgroundColor = segment.color;
      }

      // 计算位置和大小
      const segmentPercentage = (segment.value / max) * 100;
      
      if (direction === 'horizontal') {
        segmentWrapper.style.position = 'absolute';
        segmentWrapper.style.left = `${accumulatedValue}%`;
        segmentWrapper.style.width = `${segmentPercentage}%`;
        
        if (index > 0) {
          segmentWrapper.style.paddingLeft = `${gap}px`;
        }
      } else {
        segmentWrapper.style.position = 'absolute';
        segmentWrapper.style.bottom = `${accumulatedValue}%`;
        segmentWrapper.style.height = `${segmentPercentage}%`;
        
        if (index > 0) {
          segmentWrapper.style.paddingBottom = `${gap}px`;
        }
      }

      accumulatedValue += segmentPercentage;
      this.segmentBars.push(segmentBar);

      // 添加标签
      if (segment.label) {
        const label = createElement('span', 'ld-progress-segment__label', segmentBar);
        label.textContent = segment.label;
      }
    });

    // 确保轨道相对定位
    this.track.style.position = 'relative';
  }

  protected updateProgress(value: number): void {
    const segments = this.config.get('segments') ?? [];
    const direction = this.config.get('direction') ?? 'horizontal';

    if (segments.length === 0) {
      // 使用默认进度条更新
      super.updateProgress(value);
      return;
    }

    const max = this.config.get('max') ?? 100;
    let remainingValue = value;

    // 更新每个分段的进度
    this.segmentBars.forEach((segmentBar, index) => {
      const segment = segments[index];
      const segmentValue = Math.min(segment.value, remainingValue);
      const segmentPercentage = (segmentValue / segment.value) * 100;

      if (direction === 'horizontal') {
        segmentBar.style.width = `${segmentPercentage}%`;
      } else {
        segmentBar.style.height = `${segmentPercentage}%`;
      }

      remainingValue -= segmentValue;

      // 如果分段完成，添加完成样式
      if (segmentValue >= segment.value) {
        segmentBar.classList.add('ld-progress-segment__bar--completed');
      } else {
        segmentBar.classList.remove('ld-progress-segment__bar--completed');
      }
    });

    // 更新文本
    if (this.textElement) {
      this.textElement.textContent = this.formatText(value);
    }
  }

  /**
   * 设置分段
   */
  setSegments(segments: SegmentProgressOptions['segments']): void {
    this.config.set('segments', segments);
    this.render();
  }

  /**
   * 添加分段
   */
  addSegment(segment: { value: number; color?: string; label?: string }): void {
    const segments = this.config.get('segments') ?? [];
    segments.push(segment);
    this.config.set('segments', segments);
    this.render();
  }

  /**
   * 设置间隙
   */
  setGap(gap: number): void {
    this.config.set('gap', gap);
    this.render();
  }
}


