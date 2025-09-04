import type { FormResetParams, FormValidateParams, FormValidateResult, SubmitContext } from '@ldesign/desktop-next'
import type { VNode } from 'vue'
import type { LDesignFormComputedOption, LDesignFormGroup, LDesignFormOption, LDesignFormProp } from './type'
import { useTNodeJSX } from '@ldesign/desktop-hooks'
import { Button, Form, FormItem } from '@ldesign/desktop-next'
import { pxCompat } from '@ldesign/desktop-utils'
import { isArray, isBoolean, isString, set } from 'lodash-es'
import { computed, defineComponent, getCurrentInstance, h, isVNode, KeepAlive, onMounted, ref, toRaw, Transition, watch } from 'vue'
import { useElementScrollDetection } from '../buttons/hook'
import { useForm } from './hooks'
import props from './props'
import { getColonWidth, getFirstError, isArrayAndNotEmpty, mergeObjects, sumArray } from './utils'

export default defineComponent({
  name: 'LDesignForm',
  props: {
    ...props,
  },
  emits: [
    'submit',
    'reset',
    'ready',
    'update:modelValue',
    'update:value',
  ],
  async setup(props: LDesignFormProp, { emit, expose, slots }) {
    const hasHeader = ref(false)
    const hasFooter = ref(false)
    const renderTNodeJSX = useTNodeJSX()
    const el = ref<InstanceType<typeof Form> | null>(null)
    const formEl = ref<Element | null>(null)
    const gutter = computed(() => pxCompat(props.gutter))
    const space = computed(() => pxCompat(props.space))
    const innerSpace = computed(() => pxCompat(props.innerSpace))
    const colon = computed(() => props.colon)
    const colonWidth = computed(() => colon.value ? pxCompat(getColonWidth()) : '0px')
    const hiddenButtonLabel = computed(() => props.hiddenButtonLabel)
    const resetType = computed(() => props.resetType)
    const labelAlign = computed(() => props.device === 'mobile' && props.isInScrollContainer ? 'top' : props.labelAlign)
    const readonly = computed(() => props.readonly || props.static)
    const isStatic = computed(() => props.static)
    const disabled = computed(() => props.disabled)
    const labelPadding = ref(props.variant === 'document' ? props.labelPadding : 0)

    const {
      options,
      isVisible,
      span,
      rules,
      setInnerValue,
      innerValue,
      codeTypes,
      buttonAlign,
      getCodeTypesByParent,
      width,
      innerCurrent,
      value,
      defaultValue,
    } = useForm(formEl, el, props, slots, emit)

    /**
     * 渲染前后组件
     */
    const additionComponent = computed(() => {
      return (com) => {
        if (!com) {
          return
        }
        const Comp = isVNode(com) ? toRaw(com) : toRaw(com.component)
        const props = isVNode(com) ? {} : com.props
        return com && (
          <Comp
            {...props}
          />
        )
      }
    })

    function emitResult(item, val, ctx) {
      set(innerValue.value, item.name, val)
      Object.keys(innerValue.value).forEach((key) => {
        if (!isBoolean(innerValue.value[key]) && !innerValue.value[key]) {
          if (value[key]) {
            set(innerValue.value, key, value[key])
          }
        }
      })
      setInnerValue(innerValue.value, {
        target: item,
        value: {
          ...innerValue.value,
          ...value,
        },
        action: 'change',
        context: ctx,
      })
    }

    /**
     * 表单组件
     */
    const Component = computed(() => {
      return (item: LDesignFormOption) => {
        const contentAlign = props.contentAlign || item.contentAlign
        const Comp = toRaw(item.component)
        const buttonClass = {
          [`is-button-align--${buttonAlign.value}`]: item.name === 'button',
          [`is-content-align--${contentAlign}`]: contentAlign !== undefined,
        }
        const options = codeTypes.value[item.code?.toLowerCase() || item.name?.toLowerCase()]

        const prop = {
          ...toRaw(item.props),
          ...innerValue.value[item.name] !== undefined && {
            value: innerValue.value[item.name] || value[item.name],
          },
          ...options && {
            options,
          },
          ...item.name === 'button' && {
            class: {
              [`is-align--${buttonAlign.value}`]: true,
            },
          },
        }

        if (isStatic.value) {
          prop.placeholder = ''
        }

        delete prop.onChange

        const relationValue = innerValue.value[(item.relation as any)?.name || item.relation]
        if (item.relation && prop.value && !relationValue) {
          getCodeTypesByParent(item.relation, prop.value)
        }

        function renderComp(Comp) {
          return (
            <Comp
              key={item.name}
              {
                ...prop
              }
              {
                ...item.name !== 'button' && {
                  onChange: (val, ctx) => {
                    emitResult(item, val, ctx)
                    item?.props?.onChange?.(val, {
                      target: item,
                      value: innerValue.value,
                      action: 'change',
                      context: ctx,
                    })

                    if (item.relation) {
                      getCodeTypesByParent(item.relation, val)
                    }
                  },
                }
              }
            />
          )
        }

        return (
          <KeepAlive>
            <div
              class={{
                'ldesign-form__core': true,
                ...buttonClass,
              }}
            >
              <div class="ldesign-form__core-prefix">
                {
                  additionComponent.value(item.prefix)
                }
              </div>
              <div
                class={{
                  'ldesign-form__core-content': true,
                  ...buttonClass,
                }}
              >
                {
                  isArray(Comp)
                    ? Comp.map((C) => {
                        return renderComp(C)
                      })
                    : renderComp(Comp)
                }
              </div>
              <div class="ldesign-form__core-suffix">
                {
                  additionComponent.value(item.suffix)
                }
              </div>
            </div>
          </KeepAlive>
        )
      }
    })

    function renderFormOptions(options: LDesignFormOption[][], labelWidths: number[]) {
      return options.map((row) => {
        return (
          <ul
            class="ldesign-form__row"

          >
            {
              row.map((item) => {
                const isButton = item.name === 'button'
                const labelWidth = (hiddenButtonLabel.value && isButton) || !item.label ? '0px' : `calc(${pxCompat(labelWidths[item.index])} + var(--form-label-space) + ${colonWidth.value})`
                const params: any = {}

                if (item.labelAlign) {
                  params.labelAlign = item.labelAlign
                }
                return (
                  <li
                    class={{
                      'ldesign-form__col': true,
                      'is-adjust': item.adjustSpan,
                      'is-button': item.name === 'button',
                      'is-multiple-label': item.isMultipleLine,
                      'is-label-hidden': !item.label,
                      'is-readonly': item?.props?.readonly || readonly.value,
                      'is-static': isStatic.value,
                      'hide-colon': !item.label,
                    }}
                    style={{
                      '--form-col': `${Math.trunc((isString(item.span) ? item.computedSpan : Math.min(item.span, span.value) as number) * 10)}`,
                      '--form-adjust-col': `${(item.adjustSpan) * 10}`,
                      '--form-label-width': labelWidth,
                    }}
                  >
                    <FormItem
                      name={item.name}
                      label={() => item.label}
                      labelWidth={labelWidth}
                      {
                        ...params
                      }
                    >
                      <KeepAlive>
                        {
                          Component.value(item)
                        }
                      </KeepAlive>
                    </FormItem>
                  </li>
                )
              })
            }
          </ul>
        )
      })
    }

    function renderPreview(options: LDesignFormOption[][], labelWidths: number[]) {
      return isArray(options[0]) && (
        <div class="ldesign-form__preview">
          {
            renderFormOptions(options, labelWidths)
          }
        </div>
      )
    }

    function renderMore(options: LDesignFormOption[][], labelWidths: number[]) {
      return options.length > 0 && (
        <div class="ldesign-form__more">
          {
            renderFormOptions(options, labelWidths)
          }
        </div>
      )
    }

    function renderFormGroup(options: LDesignFormComputedOption) {
      return width.value && width.value > 0 && options[0]?.options.labelWidths.length === span.value && options.map((group) => {
        const hasMore = group.options.more?.length > 0
        return (
          <div
            class={{
              'ldesign-form__group': true,
              'has-more': hasMore,
            }}
          >
            <h2 class="ldesign-form__title">{group.title}</h2>
            <Transition
              name="fade"
            >
              {
                isArrayAndNotEmpty(group.options.preview)
                && renderPreview(group.options.preview, group.options.labelWidths)
              }
            </Transition>
            {
              isArrayAndNotEmpty(group.options.more) && group.visible
              && (
                <KeepAlive>
                  {
                    renderMore(group.options.more, group.options.labelWidths)
                  }
                </KeepAlive>
              )
            }
          </div>
        )
      })
    }

    function renderFormHeader() {
      const header = renderTNodeJSX('header')
      if (header) {
        hasHeader.value = true
      }
      return header && (
        <div class="ldesign-form__header">
          {
            header
          }
        </div>
      )
    }

    function renderFormFooter() {
      const footer = renderTNodeJSX('footer', {
        params: {
          submit: onsubmit,
        },
      })
      if (footer) {
        hasFooter.value = true
      }
      return footer && (
        <div class="ldesign-form__footer">
          {
            footer
          }
        </div>
      )
    }

    function renderCore() {
      const computedOptions = innerCurrent.value ? options.value.filter((a: any) => a.value === innerCurrent.value) : options.value
      return props.options && props.options.length > 0 && (
        <div
          ref="formEl"
          class={{
            'ldesign-form': true,
            [`is-variant--${props.variant}`]: true,
            'is-in-scrollcontainer': props.isInScrollContainer,
            [`is-device--${props.device}`]: props.device !== undefined,
            'is-readonly': props.readonly,
            'is-static': isStatic.value,
            'has-header': hasHeader.value,
            'has-footer': hasFooter.value,
          }}
          style={{
            '--form-cols': `${span.value * 10}`,
            '--form-gutter': gutter.value,
            '--form-label-space': space.value,
            '--form-inner-space': innerSpace.value,
            '--form-colon-width': colonWidth.value,
            'width': pxCompat(props.width),
            '--form-label-padding': pxCompat(labelPadding.value),
            '--form-padding': pxCompat(props.padding),
          }}
        >
          {
            renderFormHeader()
          }
          <div class="ldesign-form__content">
            <KeepAlive>
              {
                isVisible.value && width.value !== undefined
                && (
                  <Form
                    ref="el"
                    colon={colon.value}
                    rules={rules.value}
                    data={innerValue.value}
                    disabled={disabled.value}
                    readonly={readonly.value}
                    resetType={resetType.value}
                    labelAlign={labelAlign.value}
                    onSubmit={onFormSubmit}
                    onReset={onFormReset}
                  >
                    {
                      renderFormGroup(computedOptions)
                    }
                  </Form>
                )
              }
            </KeepAlive>
          </div>
          {
            renderFormFooter()
          }
        </div>
      )
    }

    function onFormReset(ctx) {
      const res = mergeObjects(defaultValue, value, innerValue.value)
      emit('reset', res, {
        ...ctx,
        defaultValue,
        value,
        innerValue: innerValue.value,
      })
    }

    function onFormSubmit(ctx: SubmitContext<FormData>) {
      const res = mergeObjects(defaultValue, value, innerValue.value)
      emit('submit', res, {
        ...ctx,
        validate,
        defaultValue,
        value,
        innerValue: innerValue.value,
      })
    }

    function submit(params?: { showErrorMessage?: boolean }) {
      (el.value as any)?.submit(params)
    }

    async function validate(params?: FormValidateParams): Promise<{
      validateResult: FormValidateResult<FormData>
      firstError: string
    }> {
      const validateResult = await (el.value as any)?.validate(params)
      const firstError = getFirstError(validateResult)
      return {
        validateResult,
        firstError,
      }
    }

    function reset(params?: FormResetParams<FormData>) {
      (el.value as any)?.reset(params)
    }

    function emitValueOnReady() {
      const opt = options.value?.map(g => g.children || []).flat()
      opt.forEach((item) => {
        const key = item.name
        if (!isBoolean(innerValue.value[key]) && !innerValue.value[key]) {
          if (defaultValue[key]) {
            set(innerValue.value, key, defaultValue[key])
          }
          if (value[key]) {
            set(innerValue.value, key, value[key])
          }
        }
      })

      setInnerValue(innerValue.value, {
        action: 'init',
      })
    }

    onMounted(() => {
      emitValueOnReady()
      emit('ready', innerValue.value, {
        instance: {
          submit,
          validate,
          reset,
          value: computed(() => innerValue.value).value,
          defaultValue,
          getOptions: () => codeTypes.value,
          getValue: () => innerValue.value,
        },
      })
    })

    expose({
      submit,
      validate,
      reset,
      value: computed(() => innerValue.value).value,
      defaultValue,
      getOptions: () => codeTypes.value,
      getValue: () => innerValue.value,
    })

    return {
      el,
      formEl,
      renderCore,
    }
  },
  render(): VNode {
    return this.renderCore()
  },
})
