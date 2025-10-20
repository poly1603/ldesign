import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LinearProgress as CoreLinearProgress, LinearProgressOptions } from '@ldesign/progress-core';

@customElement('ld-linear-progress')
export class LinearProgress extends LitElement {
  private progressInstance: CoreLinearProgress | null = null;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: String }) direction: 'horizontal' | 'vertical' = 'horizontal';
  @property({ type: Number }) strokeWidth = 6;
  @property({ type: String }) color?: string;
  @property({ type: Array }) colors?: string[];
  @property({ type: String }) trackColor?: string;
  @property({ type: String }) theme = 'default';
  @property({ type: Boolean }) animated = true;
  @property({ type: Number }) duration = 300;
  @property({ type: Boolean }) showText = true;
  @property({ type: Boolean }) textInside = false;
  @property({ type: Boolean }) striped = false;
  @property({ type: Boolean }) active = false;
  @property({ type: Boolean }) indeterminate = false;
  @property({ type: Number }) buffer?: number;
  @property({ type: String }) width?: string;
  @property({ type: String }) height?: string;

  // 不使用 Shadow DOM，以便样式可以正常工作
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.initProgress();
  }

  updated(changedProperties: Map<string, any>) {
    if (this.progressInstance) {
      if (changedProperties.has('value')) {
        this.progressInstance.setValue(this.value);
      }

      if (changedProperties.has('buffer') && this.buffer !== undefined) {
        this.progressInstance.setBuffer(this.buffer);
      }

      // 更新其他配置
      const configKeys = [
        'direction',
        'strokeWidth',
        'color',
        'colors',
        'trackColor',
        'theme',
        'showText',
        'textInside',
        'striped',
        'active',
        'indeterminate',
        'width',
        'height',
      ];

      if (configKeys.some((key) => changedProperties.has(key))) {
        this.progressInstance.updateOptions(this.getOptions());
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.progressInstance) {
      this.progressInstance.destroy();
      this.progressInstance = null;
    }
  }

  private initProgress() {
    const container = this.querySelector('.progress-container') as HTMLElement;
    if (!container) return;

    this.progressInstance = new CoreLinearProgress(container, this.getOptions());
  }

  private getOptions(): Partial<LinearProgressOptions> {
    return {
      value: this.value,
      min: this.min,
      max: this.max,
      direction: this.direction,
      strokeWidth: this.strokeWidth,
      color: this.colors || this.color,
      trackColor: this.trackColor,
      theme: this.theme,
      animated: this.animated,
      duration: this.duration,
      showText: this.showText,
      textInside: this.textInside,
      striped: this.striped,
      active: this.active,
      indeterminate: this.indeterminate,
      buffer: this.buffer,
      width: this.width,
      height: this.height,
      onChange: (value: number) => {
        this.dispatchEvent(
          new CustomEvent('change', { detail: { value }, bubbles: true, composed: true })
        );
      },
      onComplete: () => {
        this.dispatchEvent(new CustomEvent('complete', { bubbles: true, composed: true }));
      },
      onStart: () => {
        this.dispatchEvent(new CustomEvent('start', { bubbles: true, composed: true }));
      },
    };
  }

  // 公共方法
  public setValue(value: number, animated?: boolean) {
    this.progressInstance?.setValue(value, animated);
  }

  public getValue(): number {
    return this.progressInstance?.getValue() ?? 0;
  }

  public setBuffer(buffer: number) {
    this.progressInstance?.setBuffer(buffer);
  }

  public increment(delta?: number) {
    this.progressInstance?.increment(delta);
  }

  public decrement(delta?: number) {
    this.progressInstance?.decrement(delta);
  }

  public reset() {
    this.progressInstance?.reset();
  }

  render() {
    return html`<div class="progress-container"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ld-linear-progress': LinearProgress;
  }
}


