/**
 * 设备不支持提示组件
 *
 * 当用户在不支持的设备上访问时显示友好的提示信息
 */

import type { DeviceType } from '@ldesign/device'
import { computed, defineComponent, h } from 'vue'

export interface DeviceUnsupportedProps {
  /** 当前设备类型 */
  device?: DeviceType
  /** 来源路由 */
  from?: string
  /** 自定义提示信息 */
  message?: string
  /** 支持的设备类型 */
  supportedDevices?: DeviceType[]
  /** 是否显示返回按钮 */
  showBackButton?: boolean
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean
  /** 自定义样式类名 */
  className?: string
}

export default defineComponent({
  name: 'DeviceUnsupported',
  props: {
    device: {
      type: String as () => DeviceType,
      default: 'desktop',
    },
    from: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '当前系统不支持在此设备上查看',
    },
    supportedDevices: {
      type: Array as () => DeviceType[],
      default: () => ['desktop'],
    },
    showBackButton: {
      type: Boolean,
      default: true,
    },
    showRefreshButton: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    // 设备友好名称映射
    const deviceNames: Record<DeviceType, string> = {
      mobile: '移动设备',
      tablet: '平板设备',
      desktop: '桌面设备',
      tv: '电视设备',
      watch: '智能手表',
      unknown: '未知设备',
    }

    // 当前设备名称
    const currentDeviceName = computed(() => {
      return deviceNames[props.device] || props.device
    })

    // 支持的设备名称列表
    const supportedDeviceNames = computed(() => {
      return props.supportedDevices.map(device => deviceNames[device] || device)
    })

    // 设备图标
    const deviceIcon = computed(() => {
      const icons: Record<DeviceType, string> = {
        mobile: '📱',
        tablet: '📱',
        desktop: '🖥️',
        tv: '📺',
        watch: '⌚',
        unknown: '❓',
      }
      return icons[props.device] || '📱'
    })

    // 返回上一页
    const goBack = () => {
      if (window.history.length > 1) {
        window.history.back()
      }
      else {
        window.location.href = '/'
      }
    }

    // 刷新页面
    const refresh = () => {
      window.location.reload()
    }

    const className = computed(() => {
      return ['device-unsupported', props.className].filter(Boolean).join(' ')
    })

    return () =>
      h('div', { class: className.value }, [
        h('div', { class: 'device-unsupported__container' }, [
          // 图标区域
          h('div', { class: 'device-unsupported__icon' }, [
            h(
              'span',
              { class: 'device-unsupported__device-icon' },
              deviceIcon.value,
            ),
            h('span', { class: 'device-unsupported__warning-icon' }, '⚠️'),
          ]),

          // 标题
          h('h1', { class: 'device-unsupported__title' }, '设备不支持'),

          // 消息内容
          h('div', { class: 'device-unsupported__content' }, [
            h('p', { class: 'device-unsupported__message' }, props.message),

            h('div', { class: 'device-unsupported__details' }, [
              h('p', {}, [
                h('strong', {}, '当前设备：'),
                h(
                  'span',
                  { class: 'device-unsupported__current-device' },
                  currentDeviceName.value,
                ),
              ]),

              props.supportedDevices.length > 0
                ? h('p', {}, [
                    h('strong', {}, '支持的设备：'),
                    h(
                      'span',
                      { class: 'device-unsupported__supported-devices' },
                      supportedDeviceNames.value.join('、'),
                    ),
                  ])
                : null,
            ]),

            // 建议
            h('div', { class: 'device-unsupported__suggestions' }, [
              h('h3', {}, '建议：'),
              h(
                'ul',
                {},
                [
                  props.supportedDevices.includes('desktop')
                    ? h('li', {}, '请使用桌面电脑或笔记本电脑访问')
                    : null,
                  props.supportedDevices.includes('tablet')
                    ? h('li', {}, '请使用平板设备访问')
                    : null,
                  props.supportedDevices.includes('mobile')
                    ? h('li', {}, '请使用手机访问')
                    : null,
                  h('li', {}, '联系管理员获取更多帮助'),
                ].filter(Boolean),
              ),
            ]),
          ]),

          // 操作按钮
          h(
            'div',
            { class: 'device-unsupported__actions' },
            [
              props.showBackButton
                ? h(
                    'button',
                    {
                      type: 'button',
                      class:
                        'device-unsupported__button device-unsupported__button--secondary',
                      onClick: goBack,
                    },
                    '返回上一页',
                  )
                : null,

              props.showRefreshButton
                ? h(
                    'button',
                    {
                      type: 'button',
                      class:
                        'device-unsupported__button device-unsupported__button--primary',
                      onClick: refresh,
                    },
                    '刷新页面',
                  )
                : null,
            ].filter(Boolean),
          ),

          // 来源信息
          props.from
            ? h('div', { class: 'device-unsupported__from' }, [
                h('small', {}, ['来源页面：', props.from]),
              ])
            : null,
        ]),
      ])
  },
})
