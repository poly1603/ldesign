<template>
  <button :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="l-button__loading">
      <svg class="l-button__loading-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416"
          stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416"
            repeatCount="indefinite" />
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite" />
        </circle>
      </svg>
    </span>
    <span v-if="icon && !loading" :class="['l-button__icon', `l-button__icon--${iconPosition}`]">
      <slot name="icon">{{ icon }}</slot>
    </span>
    <span v-if="$slots.default" class="l-button__text">
      <slot></slot>
    </span>
  </button>
</template>

<script>
/**
 * Button 按钮组件
 * 
 * 提供多种样式和状态的按钮组件
 * 支持图标、加载状态、禁用状态等功能
 */
export default {
  name: 'LButton',

  props: {
    /**
     * 按钮类型
     * @type {'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'text'}
     */
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'warning', 'error', 'text'].includes(value)
    },

    /**
     * 按钮尺寸
     * @type {'small' | 'medium' | 'large'}
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },

    /**
     * 是否为块级按钮
     */
    block: {
      type: Boolean,
      default: false
    },

    /**
     * 是否为圆形按钮
     */
    round: {
      type: Boolean,
      default: false
    },

    /**
     * 是否为圆角按钮
     */
    circle: {
      type: Boolean,
      default: false
    },

    /**
     * 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * 是否加载中
     */
    loading: {
      type: Boolean,
      default: false
    },

    /**
     * 图标
     */
    icon: {
      type: String,
      default: ''
    },

    /**
     * 图标位置
     * @type {'left' | 'right'}
     */
    iconPosition: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    }
  },

  computed: {
    /**
     * 按钮样式类名
     */
    buttonClasses() {
      return [
        'l-button',
        `l-button--${this.type}`,
        `l-button--${this.size}`,
        {
          'l-button--block': this.block,
          'l-button--round': this.round,
          'l-button--circle': this.circle,
          'l-button--disabled': this.disabled,
          'l-button--loading': this.loading
        }
      ]
    }
  },

  methods: {
    /**
     * 处理点击事件
     */
    handleClick(event) {
      if (this.disabled || this.loading) {
        return
      }

      /**
       * 点击事件
       * @event click
       * @param {Event} event - 原生点击事件
       */
      this.$emit('click', event)
    }
  }
}
</script>

<!-- 样式暂时移除，等待 rollup-plugin-vue 版本兼容性问题解决 -->
