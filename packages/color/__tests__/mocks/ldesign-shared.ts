import { defineComponent, h, ref } from 'vue'

export const LSelect = defineComponent({
  name: 'LSelectMock',
  props: {
    modelValue: { type: [String, Number, Boolean], default: undefined },
    options: { type: Array as any, default: () => [] },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'medium' },
    showColor: { type: Boolean, default: false },
    showDescription: { type: Boolean, default: true },
    animation: { type: String, default: 'fade' },
  },
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const open = ref(false)
    const onToggle = () => {
      if (!props.disabled) open.value = !open.value
    }
    const onSelect = (val: any) => {
      emit('update:model-value', val)
      open.value = false
    }
    return () =>
      h('div', { class: 'theme-selector__select-enhanced', onClick: onToggle }, [
        (props.modelValue == null || props.modelValue === '') && props.placeholder
          ? h('div', { class: 'theme-selector__select-placeholder' }, props.placeholder)
          : null,
        open.value &&
          h('div', { class: 'theme-selector__select-dropdown' }, [
            ...props.options.map((opt: any) =>
              h(
                'div',
                {
                  class: 'theme-selector__select-option',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    onSelect(opt.value)
                  },
                },
                [
                  h(
                    'span',
                    { class: 'theme-selector__select-option-label' },
                    opt.label ?? String(opt.value)
                  ),
                  props.showDescription && opt.description
                    ? h('span', { class: 'theme-selector__select-option-desc' }, opt.description)
                    : null,
                  props.showColor && opt.color
                    ? h('span', {
                        class: 'theme-selector__color-dot',
                        style: { backgroundColor: opt.color },
                      })
                    : null,
                ]
              )
            ),
          ]),
      ])
  },
})

export const LPopup = defineComponent({
  name: 'LPopupMock',
  props: {
    placement: { type: String, default: 'bottom' },
    trigger: { type: String, default: 'click' },
    animation: { type: String, default: 'fade' },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const open = ref(false)
    const toggle = () => {
      if (!props.disabled) open.value = !open.value
    }
    return () =>
      h('div', { class: 'theme-selector__popup-wrapper-mock', onClick: toggle }, [
        slots.default ? slots.default() : null,
        open.value &&
          h('div', { class: 'theme-selector__popup' }, slots.content ? slots.content() : []),
      ])
  },
})

export const LDialog = defineComponent({
  name: 'LDialogMock',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    width: { type: [String, Number], default: 600 },
    animation: { type: String, default: 'fade' },
  },
  emits: ['update:visible'],
  setup(props, { slots }) {
    return () =>
      props.visible
        ? h('div', { class: 'theme-selector__dialog' }, [slots.default ? slots.default() : null])
        : null
  },
})
