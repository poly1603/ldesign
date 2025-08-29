import type { EventEmitter } from '@stencil/core'
import { Component, Event, Host, Prop, State, Watch } from '@stencil/core'

type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
type InputSize = 'small' | 'medium' | 'large'

@Component({
  tag: 'ld-input',
  styleUrl: 'input.css',
  shadow: true,
})
export class LdInput {
  @Prop() type: InputType = 'text'
  @Prop() size: InputSize = 'medium'
  @Prop({ mutable: true }) value?: string = ''
  @Prop() placeholder?: string = ''
  @Prop({ reflect: true }) disabled: boolean = false
  @Prop({ reflect: true }) readonly: boolean = false
  @Prop() required?: boolean = false
  @Prop() maxlength?: number
  @Prop() minlength?: number
  @Prop() pattern?: string
  @Prop() clearable?: boolean = false
  @Prop({ attribute: 'show-password' }) showPassword?: boolean = false

  @State() private focused: boolean = false
  @State() private reveal: boolean = false

  @Event() ldInput!: EventEmitter<string>
  @Event() ldChange!: EventEmitter<string>
  @Event() ldFocus!: EventEmitter<FocusEvent>
  @Event() ldBlur!: EventEmitter<FocusEvent>
  @Event() ldClear!: EventEmitter<void>

  private inputEl?: HTMLInputElement

  @Watch('value')
  protected onValueChange() {
    // keep attribute and state synced
  }

  private onInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    this.value = target.value
    this.ldInput.emit(this.value ?? '')
  }

  private onChange = () => {
    this.ldChange.emit(this.value ?? '')
  }

  private onFocus = (e: FocusEvent) => {
    this.focused = true
    this.ldFocus.emit(e)
  }

  private onBlur = (e: FocusEvent) => {
    this.focused = false
    this.ldBlur.emit(e)
  }

  private onClear = () => {
    if (this.disabled || this.readonly)
      return
    this.value = ''
    if (this.inputEl) {
      this.inputEl.value = ''
      this.inputEl.focus()
    }
    this.ldClear.emit()
    this.ldInput.emit('')
    this.ldChange.emit('')
  }

  private togglePassword = () => {
    this.reveal = !this.reveal
  }

  render() {
    const classes = [
      'ld-input',
      `ld-input--${this.size}`,
      this.focused ? 'ld-input--focused' : '',
      this.disabled ? 'ld-input--disabled' : '',
      this.readonly ? 'ld-input--readonly' : '',
      this.clearable ? 'ld-input--clearable' : '',
      this.type === 'password' ? 'ld-input--password' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const inputType = this.type === 'password' && this.reveal ? 'text' : this.type

    return (
      <Host>
        <div class={classes}>
          <input
            ref={el => (this.inputEl = el as HTMLInputElement)}
            class="ld-input__inner"
            type={inputType}
            value={this.value}
            placeholder={this.placeholder}
            disabled={this.disabled}
            readOnly={this.readonly}
            required={this.required}
            maxlength={this.maxlength}
            minlength={this.minlength}
            pattern={this.pattern}
            onInput={this.onInput}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />

          {(this.clearable || this.type === 'password') && (
            <div class="ld-input__suffix">
              {this.clearable && !!this.value && !this.readonly && !this.disabled
                ? (
                  <button class="ld-input__clear" type="button" onClick={this.onClear} aria-label="clear" />
                )
                : null}
              {this.type === 'password' && this.showPassword
                ? (
                  <button
                    class="ld-input__password-toggle"
                    type="button"
                    onClick={this.togglePassword}
                    aria-label={this.reveal ? 'hide password' : 'show password'}
                  />
                )
                : null}
            </div>
          )}
        </div>
      </Host>
    )
  }
}
