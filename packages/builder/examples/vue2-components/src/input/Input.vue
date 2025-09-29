<template>
  <div :class="wrapperClasses">
    <label v-if="label" :class="labelClasses" :for="inputId">
      {{ label }}
      <span v-if="required" class="l-input__required">*</span>
    </label>

    <div :class="inputWrapperClasses">
      <span v-if="prefixIcon || $slots.prefix" class="l-input__prefix">
        <slot name="prefix">
          <span v-if="prefixIcon" class="l-input__icon">{{ prefixIcon }}</span>
        </slot>
      </span>

      <input :id="inputId" ref="input" :class="inputClasses" :type="type" :value="currentValue"
        :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength"
        :minlength="minlength" :max="max" :min="min" :step="step" :autocomplete="autocomplete" @input="handleInput"
        @change="handleChange" @focus="handleFocus" @blur="handleBlur" @keydown="handleKeydown" @keyup="handleKeyup"
        @keypress="handleKeypress" />

      <span v-if="suffixIcon || $slots.suffix || showClearIcon" class="l-input__suffix">
        <span v-if="showClearIcon" class="l-input__clear" @click="handleClear">
          ✕
        </span>
        <slot name="suffix">
          <span v-if="suffixIcon" class="l-input__icon">{{ suffixIcon }}</span>
        </slot>
      </span>
    </div>

    <div v-if="showWordCount" class="l-input__count">
      {{ currentValue.length }}{{ maxlength ? `/${maxlength}` : '' }}
    </div>

    <div v-if="errorMessage" class="l-input__error">
      {{ errorMessage }}
    </div>

    <div v-if="helpText" class="l-input__help">
      {{ helpText }}
    </div>
  </div>
</template>

<script>
/**
 * Input 输入框组件
 * 
 * 提供多种类型和状态的输入框组件
 * 支持前缀图标、后缀图标、清除功能、字数统计等
 */
export default {
  name: 'LInput',

  props: {
    /**
     * 输入框的值
     */
    value: {
      type: [String, Number],
      default: ''
    },

    /**
     * 输入框类型
     */
    type: {
      type: String,
      default: 'text'
    },

    /**
     * 输入框尺寸
     * @type {'small' | 'medium' | 'large'}
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },

    /**
     * 标签文本
     */
    label: {
      type: String,
      default: ''
    },

    /**
     * 占位符文本
     */
    placeholder: {
      type: String,
      default: ''
    },

    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * 是否只读
     */
    readonly: {
      type: Boolean,
      default: false
    },

    /**
     * 是否必填
     */
    required: {
      type: Boolean,
      default: false
    },

    /**
     * 是否可清除
     */
    clearable: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示字数统计
     */
    showWordCount: {
      type: Boolean,
      default: false
    },

    /**
     * 最大长度
     */
    maxlength: {
      type: Number,
      default: undefined
    },

    /**
     * 最小长度
     */
    minlength: {
      type: Number,
      default: undefined
    },

    /**
     * 最大值（数字类型）
     */
    max: {
      type: Number,
      default: undefined
    },

    /**
     * 最小值（数字类型）
     */
    min: {
      type: Number,
      default: undefined
    },

    /**
     * 步长（数字类型）
     */
    step: {
      type: Number,
      default: undefined
    },

    /**
     * 自动完成
     */
    autocomplete: {
      type: String,
      default: 'off'
    },

    /**
     * 前缀图标
     */
    prefixIcon: {
      type: String,
      default: ''
    },

    /**
     * 后缀图标
     */
    suffixIcon: {
      type: String,
      default: ''
    },

    /**
     * 错误信息
     */
    errorMessage: {
      type: String,
      default: ''
    },

    /**
     * 帮助文本
     */
    helpText: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      currentValue: this.value,
      focused: false,
      inputId: `l-input-${Math.random().toString(36).substr(2, 9)}`
    }
  },

  computed: {
    /**
     * 包装器样式类名
     */
    wrapperClasses() {
      return [
        'l-input',
        `l-input--${this.size}`,
        {
          'l-input--disabled': this.disabled,
          'l-input--readonly': this.readonly,
          'l-input--focused': this.focused,
          'l-input--error': !!this.errorMessage
        }
      ]
    },

    /**
     * 标签样式类名
     */
    labelClasses() {
      return [
        'l-input__label',
        {
          'l-input__label--required': this.required
        }
      ]
    },

    /**
     * 输入框包装器样式类名
     */
    inputWrapperClasses() {
      return [
        'l-input__wrapper',
        {
          'l-input__wrapper--prefix': this.prefixIcon || this.$slots.prefix,
          'l-input__wrapper--suffix': this.suffixIcon || this.$slots.suffix || this.showClearIcon
        }
      ]
    },

    /**
     * 输入框样式类名
     */
    inputClasses() {
      return ['l-input__inner']
    },

    /**
     * 是否显示清除图标
     */
    showClearIcon() {
      return this.clearable && this.currentValue && !this.disabled && !this.readonly
    }
  },

  watch: {
    value(newValue) {
      this.currentValue = newValue
    }
  },

  methods: {
    /**
     * 处理输入事件
     */
    handleInput(event) {
      const value = event.target.value
      this.currentValue = value

      /**
       * 输入事件
       * @event input
       * @param {string} value - 输入的值
       */
      this.$emit('input', value)
    },

    /**
     * 处理变化事件
     */
    handleChange(event) {
      /**
       * 变化事件
       * @event change
       * @param {string} value - 变化后的值
       */
      this.$emit('change', event.target.value)
    },

    /**
     * 处理获得焦点事件
     */
    handleFocus(event) {
      this.focused = true

      /**
       * 获得焦点事件
       * @event focus
       * @param {Event} event - 原生焦点事件
       */
      this.$emit('focus', event)
    },

    /**
     * 处理失去焦点事件
     */
    handleBlur(event) {
      this.focused = false

      /**
       * 失去焦点事件
       * @event blur
       * @param {Event} event - 原生失焦事件
       */
      this.$emit('blur', event)
    },

    /**
     * 处理键盘按下事件
     */
    handleKeydown(event) {
      /**
       * 键盘按下事件
       * @event keydown
       * @param {KeyboardEvent} event - 键盘事件
       */
      this.$emit('keydown', event)
    },

    /**
     * 处理键盘抬起事件
     */
    handleKeyup(event) {
      /**
       * 键盘抬起事件
       * @event keyup
       * @param {KeyboardEvent} event - 键盘事件
       */
      this.$emit('keyup', event)
    },

    /**
     * 处理键盘按键事件
     */
    handleKeypress(event) {
      /**
       * 键盘按键事件
       * @event keypress
       * @param {KeyboardEvent} event - 键盘事件
       */
      this.$emit('keypress', event)
    },

    /**
     * 处理清除事件
     */
    handleClear() {
      this.currentValue = ''
      this.$emit('input', '')
      this.$emit('change', '')

      /**
       * 清除事件
       * @event clear
       */
      this.$emit('clear')

      // 聚焦到输入框
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },

    /**
     * 聚焦到输入框
     */
    focus() {
      this.$refs.input.focus()
    },

    /**
     * 失去焦点
     */
    blur() {
      this.$refs.input.blur()
    },

    /**
     * 选中输入框内容
     */
    select() {
      this.$refs.input.select()
    }
  }
}
</script>

<!-- 样式暂时移除，等待 rollup-plugin-vue 版本兼容性问题解决 -->
