import { Component, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';

type TextareaSize = 'small' | 'medium' | 'large';

@Component({
  tag: 'ld-textarea',
  styleUrl: 'textarea.css',
  shadow: true,
})
export class LdTextarea {
  @Prop() size: TextareaSize = 'medium';
  @Prop({ mutable: true }) value?: string = '';
  @Prop() placeholder?: string = '';
  @Prop({ reflect: true }) disabled: boolean = false;
  @Prop({ reflect: true }) readonly: boolean = false;
  @Prop() required?: boolean = false;
  @Prop() maxlength?: number;
  @Prop() minlength?: number;
  @Prop() rows?: number;
  @Prop() cols?: number;
  @Prop() showCount?: boolean = false;
  @Prop() autosize?: boolean = false;
  @Prop() minRows?: number;
  @Prop() maxRows?: number;

  @State() private focused: boolean = false;

  @Event() ldInput: EventEmitter<string>;
  @Event() ldChange: EventEmitter<string>;
  @Event() ldFocus: EventEmitter<FocusEvent>;
  @Event() ldBlur: EventEmitter<FocusEvent>;

  private textareaEl?: HTMLTextAreaElement;

  @Watch('value')
  protected onValueChange() {
    if (this.autosize) this.resizeToContent();
  }

  private onInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;
    if (this.autosize) this.resizeToContent();
    this.ldInput.emit(this.value ?? '');
  };

  private onChange = () => {
    this.ldChange.emit(this.value ?? '');
  };

  private onFocus = (e: FocusEvent) => {
    this.focused = true;
    this.ldFocus.emit(e);
  };

  private onBlur = (e: FocusEvent) => {
    this.focused = false;
    this.ldBlur.emit(e);
  };

  private resizeToContent() {
    if (!this.textareaEl) return;
    const ta = this.textareaEl;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
    if (this.minRows) ta.rows = this.minRows;
    if (this.maxRows) ta.rows = Math.min(this.maxRows, ta.rows);
  }

  componentDidLoad() {
    if (this.autosize) this.resizeToContent();
  }

  render() {
    const classes = [
      'ld-textarea',
      `ld-textarea--${this.size}`,
      this.focused ? 'ld-textarea--focused' : '',
      this.disabled ? 'ld-textarea--disabled' : '',
      this.readonly ? 'ld-textarea--readonly' : '',
      this.autosize ? 'ld-textarea--autosize' : '',
      this.showCount ? 'ld-textarea--show-count' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const length = this.value?.length ?? 0;
    const max = this.maxlength ?? undefined;

    return (
      <Host>
        <div class={classes}>
          <textarea
            ref={(el) => (this.textareaEl = el as HTMLTextAreaElement)}
            class="ld-textarea__inner"
            value={this.value}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readOnly={this.readonly}
            required={this.required}
            maxlength={this.maxlength}
            minlength={this.minlength}
            rows={this.rows}
            cols={this.cols}
            onInput={this.onInput}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
          {this.showCount ? (
            <div class="ld-textarea__count">{max ? `${length}/${max}` : length}</div>
          ) : null}
        </div>
      </Host>
    );
  }
}


