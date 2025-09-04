import type { Ref } from 'vue'
import type { LDesignFormComputedOption, LDesignFormOption, LDesignFormProp } from './type'
import { useTNodeJSX } from '@ldesign/desktop-hooks'
import useVModel from '@ldesign/desktop-hooks/es/useVModel'
import { Button } from '@ldesign/desktop-next'
import { pxCompat } from '@ldesign/desktop-utils'
import { ChevronDownIcon, ChevronUpIcon } from '@ldesign/icons-vue-next'
import { request } from '@ldesign/request'
import { useIntersectionObserver, useResizeObserver } from '@vueuse/core'
import debounce from 'lodash-es/debounce'
import isArray from 'lodash-es/isArray'
import isObject from 'lodash-es/isObject'
import isString from 'lodash-es/isString'
import { computed, nextTick, onUnmounted, ref, toRaw, toRefs, watch } from 'vue'
import LDesignButtons from '../buttons'
import { formDb } from '../utils/indexDb'
import { arrayToObject, combileSpan, containsKey, getInitialValue, groupBySpanLimitAndRowsWithReservedSpan, mergeObject, removeObjectKeys, transformArrayToObjects } from './utils'

export function useForm(el: Ref<any>, form: Ref<any>, props: LDesignFormProp, slots, emit) {
  const options = ref<LDesignFormComputedOption>([])
  const isGroup = containsKey(props.options, 'title')
  const isVisible = ref(!props.autoDestory)
  const width = ref<number>(isString(props.width) ? Number.parseInt(props.width) : props.width)
  const span = computed(() => {
    let res = props.span || Math.round(width.value / props.spanWidth) || 1
    res = res < props.minSpan ? props.minSpan : res > props.maxSpan ? props.maxSpan : res
    return res
  })
  const renderTNodeJSX = useTNodeJSX()
  const buttonPosition = computed(() => props.buttonPosition)
  const adjustSpan = computed(() => props.adjustSpan)
  const labelWidthChangeOnVisible = computed(() => props.labelWidthChangeOnVisible)
  const labelWidth = computed(() => pxCompat(props.labelWidth))
  const rules = ref(props.rules || {})
  const codeTypes = ref({})
  const buttonSpan = computed(() => props.buttonSpan)
  const buttonAlign = computed(() => props.buttonAlign)
  const variant = computed(() => props.variant)
  const device = computed(() => props.device)

  const { current, modelCurrent } = toRefs(props)
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [innerCurrent, setInnerCurrent] = useVModel(
    current,
    modelCurrent,
    props.defaultCurrent,
    props.onCurrentChange,
    'current',
  )

  const extraContentAlign = computed(() => {
    if (props.buttonPosition === 'inline') {
      return 'right'
    }
    else {
      if (props.buttonAlign === 'left') {
        return 'right'
      }
      else {
        return 'left'
      }
    }
  })

  const noptions = computed(() => {
    return isGroup
      ? toRaw(props.options?.map((item: any) => {
          return {
            ...item,
            children: combileSpan(item.children),
          }
        }))
      : [{
          title: '',
          name: 'default',
          visible: 'visible' in props ? props.visible : props.previewRows > 0,
          children: combileSpan(props.options),
        }]
  })

  // eslint-disable-next-line unused-imports/no-unused-vars
  const extraContentNode = (item) => {
    const content = renderTNodeJSX('extraContent', {
      defaultNode: null,
    })
    return content && (
      <LDesignButtons
        align={extraContentAlign.value}
        buttonPosition={buttonPosition.value}
        device={device.value}
        width={width.value}
        spanWidth={props.spanWidth}
      >
        {
          content
        }
      </LDesignButtons>
    )
  }

  const submitNode = computed(() => {
    if (typeof props.submit === 'object') {
      return (
        <Button
          type="submit"
          {
            ...props.submit
          }
        >
        </Button>
      )
    }
    if (typeof props.submit === 'string') {
      return (
        <Button
          type="submit"
        >
          {props.submit}
        </Button>
      )
    }
    // 如果是字符串，就只改变按钮的文字
    return renderTNodeJSX('submit', {
      params: {
        submit: () => {
          form.value?.submit()
        },
      },
      defaultNode: (
        <Button
          type="submit"
          {
            ...typeof props.submit === 'object' && {
              ...(props.submit as any),
            }
          }
        >
          查询
        </Button>
      ),
    })
  })

  const resetNode = computed(() => {
    if (typeof props.reset === 'object') {
      return (
        <Button
          type="reset"
          variant="outline"
          {
            ...props.reset
          }
        >
        </Button>
      )
    }
    if (typeof props.reset === 'string') {
      return (
        <Button
          type="reset"
          variant="outline"
        >
          {props.reset}
        </Button>
      )
    }
    // 如果是字符串，就只改变按钮的文字
    return renderTNodeJSX('reset', {
      defaultNode: (
        <Button
          type="reset"
          variant="outline"
          {
            ...typeof props.reset === 'object' && {
              ...(props.reset as any),
            }
          }
        >
          重置
        </Button>
      ),
      params: {
        reset: () => {
          form.value?.reset()
        },
      },
    })
  })

  const expandNode = computed(() => {
    function expand(item) {
      const current = options.value.find(a => a.name === item.name)
      current.visible = !current.visible
      emit('visibleChange', current.visible, {
        current,
      })
      nextTick(() => {
        initOptions(options.value)
      })
    }

    return (item) => {
      if (isArray(props.expand)) {
        return item.visible
          ? (
              <Button
                variant="text"
                onClick={() => expand(item)}
                icon={() => <ChevronUpIcon />}
                {
                  ...isObject(props.expand[1]) && props.expand[1]
                }
              >
                {isString(props.expand[1]) && props.expand[1]}
              </Button>
            )
          : (
              <Button
                variant="text"
                onClick={() => expand(item)}
                icon={() => <ChevronDownIcon />}
                {
                  ...isObject(props.expand[0]) && props.expand[0]
                }
              >
                {isString(props.expand[0]) && props.expand[0]}
              </Button>
            )
      }

      return renderTNodeJSX('expand', {
        defaultNode: (
          <Button
            variant="text"
            icon={() => item.visible ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={async () => {
              expand(item)
            }}
          >
            {item.visible ? '收起' : '展开'}
          </Button>
        ),
        params: {
          expand: () => {
            expand(item)
          },
          visible: item.visible,
        },
      })
    }
  })

  const buttonNode = computed(() => {
    return (item) => {
      return !props.readonly && renderTNodeJSX('button', {
        params: {
          reset: () => {
            form.value.reset()
          },
          submit: () => {
            form.value?.submit()
          },
        },
        defaultNode: (
          <div
            class={{
              'ldesign-form__buttons': true,
              [`is-${buttonPosition.value}`]: true,
              [`is-device--${device.value}`]: true,
            }}
          >
            {
              extraContentNode(item)
              && (
                <div class="ldesign-form__buttons-prefix">
                  {
                    extraContentNode(item)
                  }
                </div>
              )
            }
            <div
              class={{
                'ldesign-form__buttons-suffix': true,
                [`is-align--${props.buttonAlign}`]: true,
              }}
            >
              {
                (((item.previewRows > 0 || props.previewRows > 0))
                  || isGroup)
                && (
                  <div class="ldesign-form__expand">
                    {
                      expandNode.value(item)
                    }
                  </div>
                )
              }
              {
                (!isGroup) && resetNode.value
              }
              {
                !isGroup && submitNode.value
              }
            </div>
          </div>
        ),
      })
    }
  })

  function initOptions(noptions) {
    const r = { ...props.rules }
    const co = noptions?.map((item) => {
      item.children?.forEach((col) => {
        if (col.rules) {
          if (r[col.name]) {
            r[col.name] = [
              ...r[col.name],
              ...col.rules,
            ]
          }
          else {
            r[col.name] = col.rules
          }
        }
      })
      return ({
        ...item,
        options: groupBySpanLimitAndRowsWithReservedSpan(
          item.children,
          span.value,
          isGroup ? item.previewRows || props.previewRows || 1 : item.previewRows || props.previewRows,
          buttonSpan.value,
          !item.visible,
          buttonNode.value(item),
          item.buttonPosition || buttonPosition.value,
          adjustSpan.value,
          labelWidthChangeOnVisible.value,
          labelWidth.value,
          r,
          props.readonly,
          variant.value,
          props.labelPadding,
        ),
      })
    })

    rules.value = r
    options.value = co
  }

  initOptions(noptions.value)

  function getValueAndDefaultValueFromOptions(options: LDesignFormComputedOption) {
    const defaultValue: any = props.defaultValue || {}
    const value: Ref<any> = ref(props.value || {})
    const modelValue: Ref<any> = ref(props.modelValue || {})
    const array = options.map(group => group.children || []).flat()
    array.forEach((item: LDesignFormOption) => {
      const { props } = item || {}
      const { defaultValue: dval, value: val } = props || {}
      if (val !== undefined) {
        value.value[item.name] = val
        modelValue[item.name] = val
      }
      if (dval !== undefined) {
        defaultValue[item.name] = dval
        value[item.name] = dval
        modelValue[item.name] = dval
      }
      else {
        // 如果没有设置默认值，就根据组件类型生成一个初始值
        if (!defaultValue[item?.name]) {
          const initValue = getInitialValue(item?.component)
          defaultValue[item.name] = initValue
        }
      }
    })

    return {
      defaultValue,
      value,
      modelValue,
    }
  }

  const res = getValueAndDefaultValueFromOptions(options.value)

  // const { value, modelValue } = toRefs(props)
  const [innerValue, setInnerValue] = useVModel(
    res.value,
    res.modelValue,
    res.defaultValue,
    props.onChange,
    'value',
  )

  async function getCodeTypeInOneRequest(bean, obj) {
    const cache = {}
    const keys = await formDb.keys()
    // 过滤掉indexDB中已经存在的键值对
    const _bean = removeObjectKeys(bean, keys)
    const res = Object.keys(_bean).length > 0
      ? await request.post({
        name: 'WLSDCodeResult',
        data: {
          bean: _bean,
        },
      })
      : null

    for (const name of Object.keys(obj)) {
      const nname = name.toLowerCase()
      const res = await formDb.getItem(nname)
      cache[obj[nname].toLowerCase()] = res
    }

    if (!res?.result) {
      return {
        cache,
        result: [],
      }
    }
    else {
      const result = arrayToObject(Object.values(obj).map((code: string) => {
        return {
          name: code.toLowerCase(),
          value: JSON.parse(
            res?.result?.[code.toLowerCase()] || '[]',
          ).map(a => ({ label: a.codevalue, value: a.codeid })),
        }
      }))

      return {
        result,
        cache,
      }
    }
  }

  function getOptionByName(name: string): LDesignFormOption {
    return options.value.map(a => a.children).flat().find(a => a.name === name) as LDesignFormOption
  }

  async function getCodeTypesByParent(relation: string | {
    name: string
    type: number | 'empty'
  }, parentValue: any) {
    const current = getOptionByName(isString(relation) ? relation : relation.name)
    const res = await request.post({
      name: 'getCodeValuesByParentValue',
      data: {
        c: current?.code,
        p: parentValue,
      },
    })

    codeTypes.value[current?.code] = res.map(a => ({ label: a.codevalue, value: a.codeid }))

    nextTick(() => {
      if (isString(relation) || relation.type === 'empty') {
        Object.assign(innerValue.value, {
          [`${isObject(relation) ? relation.name : relation}`]: '',
        })
      }
      else {
        Object.assign(innerValue.value, {
          [`${relation.name}`]: codeTypes.value?.[current.code]?.[relation.type]?.value || '',
        })
      }

      setInnerValue(innerValue.value, {
        target: current,
        value: parentValue,
        action: 'cascader',
        context: null,
      })
    })
  }

  async function getCodeTypeOneByOne(bean, obj) {
    const result = {}
    const cache = {}
    for (const name of Object.keys(obj)) {
      const code = obj[name]
      const indexData = await formDb.getItem(code)
      if ((indexData as any[] || []).length === 0) {
        const res = await request.post({
          name: 'getCodeValues2',
          data: {
            c: code,
          },
        })
        result[code] = res?.map(a => ({ label: a.codevalue, value: a.codeid }))
      }
      else {
        cache[code] = indexData
      }
    }

    return { result, cache }
  }

  async function getCodeOptions() {
    const arr = options.value?.map(item => item.children).flat().filter((a: LDesignFormOption) => a?.code).map((a: LDesignFormOption) => ({
      name: a.name,
      value: a.code,
    }))

    // 自定义load
    const customLoaders: any[] = options.value.map(item => item.children).flat().filter((a: LDesignFormOption) => {
      return typeof a?.load === 'function'
    }).map((a: LDesignFormOption) => {
      return {
        name: a.name.toLowerCase(),
        load: a.load,
      }
    })

    const { valueObject: bean, nameArrayObject } = transformArrayToObjects(arr)

    let result
    let cache = {}

    if (props.getCodeTypesInOneRequest) {
      const res = await getCodeTypeInOneRequest(bean, nameArrayObject)
      result = res.result
      cache = res.cache
    }
    else {
      const res = await getCodeTypeOneByOne(bean, nameArrayObject)
      result = res.result
      cache = res.cache
    }

    if (customLoaders && customLoaders.length > 0) {
      for (const item of customLoaders) {
        const res = await item.load()
        result[item.name] = res
      }
    }

    Object.keys(result).forEach((key) => {
      if (result[key] && result[key].length > 0) {
        formDb.setItem(key, result[key])
      }
    })

    codeTypes.value = mergeObject(cache, result)
  }

  const { stop } = useIntersectionObserver(
    el,
    ([entry]) => {
      if (props.autoDestory) {
        isVisible.value = entry?.isIntersecting || false
      }
      width.value = entry.target.clientWidth
      getCodeOptions()
    },
  )

  const debouncedUpdateWidth = debounce((newWidth) => {
    width.value = newWidth
  }, 300)

  useResizeObserver(el, (entries) => {
    const entry = entries[0]
    const { width: w } = entry.contentRect
    debouncedUpdateWidth(w)
  })

  onUnmounted(() => {
    stop()
  })

  function renderPlaceholder(options) {
    return (
      <div class="ldesign-form__skeleton">
        {
          options.map(group => (
            <div class="ldesign-form__skeleton-group">
              {
                group.title
                && (
                  <div class="ldesign-form__skeleton-title"></div>
                )
              }
              {
                group.options.preview?.map((row) => {
                  return (
                    <div className="ldesign-form__skeleton-row">
                      {
                        row.map(() => {
                          return (
                            <div class="ldesign-form__skeleton-col">
                              <div class="ldesign-form__skeleton-label"></div>
                              <div class="ldesign-form__skeleton-input"></div>
                            </div>
                          )
                        })
                      }
                    </div>
                  )
                })
              }
              {
                group.options.more?.map((row) => {
                  return (
                    <div className="ldesign-form__skeleton-row">
                      {
                        row.map(() => {
                          return (
                            <div class="ldesign-form__skeleton-col">
                              <div class="ldesign-form__skeleton-label"></div>
                              <div class="ldesign-form__skeleton-input"></div>
                            </div>
                          )
                        })
                      }
                    </div>
                  )
                })
              }
            </div>
          ))
        }
      </div>
    )
  }

  watch([
    buttonPosition,
    labelWidthChangeOnVisible,
    adjustSpan,
    labelWidth,
    span,
    buttonSpan,
  ], () => {
    nextTick(() => {
      initOptions(options.value)
    })
  })

  watch(() => props.options, () => {
    nextTick(() => {
      initOptions(noptions.value)
    })
  }, {
    deep: true,
  })

  watch(() => slots?.extraContent?.(), () => {
    initOptions(noptions.value)
  })

  return {
    options,
    isVisible,
    width,
    span,
    rules,
    innerValue,
    buttonAlign,
    setInnerValue,
    codeTypes,
    renderPlaceholder,
    getCodeTypesByParent,
    innerCurrent,
    defaultValue: { ...res.defaultValue },
    value: { ...res.value.value },
  }
}
