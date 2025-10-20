import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CircleProgress as CoreCircleProgress, CircleProgressOptions } from '@ldesign/progress-core';

@customElement('ld-circle-progress')
export class CircleProgress extends LitElement {
  private progressInstance: CoreCircleProgress | null = null;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) radius = 50;
  @property({ type: Number }) strokeWidth = 6;
  @property({ type: String }) color?: string;
  @property({ type: Array }) colors?: string[];
  @property({ type: String }) trackColor?: string;
  @property({ type: String }) theme = 'default';
  @property({ type: Boolean }) animated = true;
  @property({ type: Number }) duration = 300;
  @property({ type: Boolean }) showText = true;
  @property({ type: Boolean }) clockwise = true;
  @property({ type: Number }) startAngle = -90;
  @property({ type: String }) lineCap: 'round' | 'square' | 'butt' = 'round';

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

      const configKeys = [
        'radius',
        'strokeWidth',
        'color',
        'colors',
        'trackColor',
        'theme',
        'showText',
        'clockwise',
        'startAngle',
        'lineCap',
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

    this.progressInstance = new CoreCircleProgress(container, this.getOptions());
  }

  private getOptions(): Partial<CircleProgressOptions> {
    return {
      value: this.value,
      min: this.min,
      max: this.max,
      radius: this.radius,
      strokeWidth: this.strokeWidth,
      color: this.colors || this.color,
      trackColor: this.trackColor,
      theme: this.theme,
      animated: this.animated,
      duration: this.duration,
      showText: this.showText,
      clockwise: this.clockwise,
      startAngle: this.startAngle,
      lineCap: this.lineCap,
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

  public setValue(value: number, animated?: boolean) {
    this.progressInstance?.setValue(value, animated);
  }

  public getValue(): number {
    return this.progressInstance?.getValue() ?? 0;
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
    'ld-circle-progress': CircleProgress;
  }
}


