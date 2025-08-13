import { defineComponent, type PropType } from 'vue'
import './InfoPanel.less'

export interface InfoPanelProps {
  title: string
  icon: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium' | 'large'
}

const InfoPanel = defineComponent({
  name: 'InfoPanel',
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    variant: {
      type: String as PropType<
        'default' | 'primary' | 'success' | 'warning' | 'error'
      >,
      default: 'default',
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },
  },
  setup(props, { slots }) {
    return () => (
      <div
        class={['info-panel', `variant-${props.variant}`, `size-${props.size}`]}
      >
        <div class='panel-header'>
          <h3 class='panel-title'>
            <span class='title-icon'>{props.icon}</span>
            {props.title}
          </h3>
        </div>
        <div class='panel-content'>{slots.default?.()}</div>
      </div>
    )
  },
})

// 信息项组件
const InfoItem = defineComponent({
  name: 'InfoItem',
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '',
    },
    type: {
      type: String as PropType<'text' | 'link' | 'email' | 'phone'>,
      default: 'text',
    },
    href: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const renderValue = () => {
      switch (props.type) {
        case 'link':
          return (
            <a
              href={props.href || props.value}
              target='_blank'
              rel='noopener noreferrer'
              class='info-link'
            >
              {props.value}
            </a>
          )
        case 'email':
          return (
            <a href={`mailto:${props.value}`} class='info-link'>
              {props.value}
            </a>
          )
        case 'phone':
          return (
            <a href={`tel:${props.value}`} class='info-link'>
              {props.value}
            </a>
          )
        default:
          return <span class='info-value'>{props.value}</span>
      }
    }

    return () => (
      <div class='info-item'>
        <div class='info-label'>
          {props.icon && <span class='label-icon'>{props.icon}</span>}
          <span class='label-text'>{props.label}:</span>
        </div>
        <div class='info-content'>{renderValue()}</div>
      </div>
    )
  },
})

// 设备指示器组件
const DeviceIndicator = defineComponent({
  name: 'DeviceIndicator',
  props: {
    icon: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () => (
      <div class={['device-indicator', { active: props.active }]}>
        <span class='device-icon'>{props.icon}</span>
        <span class='device-label'>{props.label}</span>
      </div>
    )
  },
})

export default InfoPanel
export { DeviceIndicator, InfoItem, InfoPanel }
