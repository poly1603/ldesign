import type { ComponentPublicInstance } from 'vue'
import type { LDesignFormOption } from './type'
import { isArray, isBoolean, isString } from 'lodash-es'

/**
 * 判断一个对象数组中是否有某个键名
 * @param array
 * @param key
 * @returns
 */
export function containsKey(array: any[] | undefined, key: string) {
  // eslint-disable-next-line no-prototype-builtins
  return array?.some(obj => obj.hasOwnProperty(key))
}

/**
 * 填充span，如果对象中缺少span字段，自动加上span为1
 * @param arr
 * @returns
 */
export function combileSpan(arr: any[] | undefined) {
  return arr?.map((item) => {
    return {
      ...item,
      span: item?.span || 1,
    }
  })
}

/**
 * 按照span和limit进行分组，同时考虑预留的span
 * @param items 表单项数组
 * @param limit 每行的最大宽度
 * @param rows 需要分成的行数
 * @param reservedSpan 预留的span值，可以是字符串或数字，默认为1
 * @returns 分组结果，包含预览部分、更多部分和标签宽度数组
 */
export function groupBySpanLimitAndRowsWithReservedSpan(
  items: LDesignFormOption[],
  limit: number,
  rows: number,
  reservedSpan: string | number = 1,
  isReservedSpan: boolean,
  buttonNode: ComponentPublicInstance,
  buttonPosition: 'inline' | 'block',
  adjustSpan: boolean,
  labelWidthChangeOnVisible: boolean,
  labelWidth: string,
  rules: any,
  readonly: boolean,
  variant: 'default' | 'document',
  labelPadding: number,
): {
    preview: LDesignFormOption[]
    more: LDesignFormOption[]
    labelWidths: number[]
  } {
  if (limit === 0) {
    return {
      preview: [],
      more: [],
      labelWidths: [],
    }
  }

  // 计算预留span的实际值
  const crSpan = isString(reservedSpan) ? Math.floor(Number.parseInt(reservedSpan) / 100 * limit) : reservedSpan

  const groups = []
  let currentGroup = []
  let currentSpanSum = 0
  let labelWidths: number[] = []
  let currentRowIndex = 0 // 当前行索引

  const list = items?.filter(a => a.visible !== false)
  // 遍历数组进行分组
  for (let i = 0; i < list?.length; i++) {
    const item = list[i]
    delete item.adjustSpan
    const isReservedRow = buttonPosition === 'inline' && isReservedSpan && currentRowIndex === rows - 1 // 检查是否是需要预留span的行

    const effectiveLimit = isReservedRow ? limit - crSpan : limit // 计算当前行的有效limit值
    const currentSpan = isString(item.span) ? Number.parseInt(`${item.span}`) / 100 * limit : item.span

    // 如果span是字符串，则转换为数值
    if (isString(item.span)) {
      item.computedSpan = currentSpan
    }

    // 如果当前组的span总和加上当前项的span不超过有效limit，则添加到当前组
    if (currentSpanSum + currentSpan <= effectiveLimit) {
      currentGroup.push(item)
      currentSpanSum += currentSpan
    }
    else {
      // 如果超过有效limit，则将当前组添加到分组数组中，并开始新的一组
      if (!isReservedRow) {
        const totalSpan = sumArray(currentGroup.map(a => a.span))
        if (totalSpan < limit) {
          const lastRow = currentGroup[currentGroup.length - 1]
          if (adjustSpan) {
            if (totalSpan < limit && lastRow) {
              lastRow.adjustSpan = lastRow?.span + (limit - totalSpan)
            }
          }
        }
      }

      groups.push(currentGroup)

      currentGroup = [item]
      currentSpanSum = currentSpan
      currentRowIndex++ // 完成一组，行索引加1
    }
  }

  // 添加最后一组到结果数组中
  if (currentGroup.length > 0) {
    if (buttonPosition === 'block') {
      const totalSpan = currentGroup.reduce((acc, item) => acc + isString(item.span) ? item.computedSpan : item.span, 0)

      if (totalSpan < limit) {
        const lastRow = currentGroup[currentGroup.length - 1]
        if (adjustSpan) {
          const totalSpan = sumArray(currentGroup.map(a => a.span))
          if (limit - totalSpan > 0) {
            lastRow.adjustSpan = lastRow?.span + (limit - totalSpan)
          }
        }
      }
    }
    groups.push(currentGroup)
    currentRowIndex++ // 最后一组完成，行索引加1
  }

  const splitIndex = rows > 0 ? rows - 1 : -1
  // 根据行数将分组数组分割为预览部分和更多部分
  const [preview = [], more = []] = splitArrayByIndex(groups, splitIndex)

  // 计算每组中标签的最大宽度
  if (!labelWidthChangeOnVisible) {
    labelWidths = updateLabelWidths([...preview, ...(more || [])], limit, labelWidth, rules, variant, labelPadding)
  }
  else {
    if (isReservedSpan) {
      labelWidths = updateLabelWidths(preview, limit, labelWidth, rules, variant, labelPadding)
    }
    else {
      labelWidths = updateLabelWidths([...preview, ...(more || [])], limit, labelWidth, rules, variant, labelPadding)
    }
  }

  if (!readonly) {
    if (isReservedSpan) {
      insertButton('preview', preview, buttonPosition, buttonNode, limit, isReservedSpan, crSpan)
    }
    else {
      // 如果more中没有，就需要将按钮继续放到preview最后面
      if (more) {
        insertButton('more', more, buttonPosition, buttonNode, limit, !isReservedSpan, crSpan)
      }
      else {
        insertButton('preview', preview, buttonPosition, buttonNode, limit, isReservedSpan, crSpan)
      }
    }
  }

  return {
    preview,
    more,
    labelWidths,
  }
}

function insertButton(type: 'preview' | 'more', options: any[], position: 'inline' | 'block', buttonNode: any, limit: number, isVisible: boolean, crSpan: number) {
  if (!buttonNode) {
    return
  }
  if (position === 'inline') {
    const lastRow = options?.[options?.length - 1]
    const lastRowTotalSpan = sumArray(lastRow?.map(a => a.span))
    const lastCol = lastRow?.[lastRow?.length - 1]
    if (limit - lastRowTotalSpan >= crSpan) {
      lastRow.push({
        span: limit - lastRowTotalSpan,
        name: 'button',
        index: (lastCol?.span + lastCol?.index) || 0,
        component: buttonNode,
      })
    }
    else {
      options?.push([{
        span: limit,
        name: 'button',
        index: 0,
        component: buttonNode,
      }])
    }
  }
  else {
    options.push([{
      span: limit,
      name: 'button',
      index: 0,
      component: buttonNode,
    }])
  }
}

function updateLabelWidths(groups: any[], limit, defaultValue, rules, variant: 'default' | 'document', labelPadding): number[] {
  // eslint-disable-next-line unicorn/no-new-array
  const labelWidths = new Array(limit).fill(defaultValue || 0)
  const xswidth = Number.parseInt(getCssVarValue('--td-comp-margin-xs'))

  if (defaultValue) {
    const startIndex = 0
    groups.forEach((row) => {
      row.forEach((item) => {
        item.index = startIndex
        const rule = rules[item.name]
        const isRequired = rule?.filter(a => a.required)?.length > 0
        let cwidth = caculateLabelWidth(isRequired ? `${item.label}*` : item.label)
        if (isRequired) {
          cwidth += Number.parseInt(getCssVarValue('--td-comp-margin-xs'))
        }
        const labelWidth = cwidth
        item.isMultipleLine = labelWidth > Number.parseInt(defaultValue)
      })
    })
    return labelWidths
  }

  groups?.forEach((row) => {
    let startIndex = 0
    row.forEach((item) => {
      item.index = startIndex
      const rule = rules[item.name]
      const isRequired = rule?.filter(a => a.required)?.length > 0
      let cwidth = caculateLabelWidth(isRequired ? `${item.label}*` : item.label)
      if (isRequired) {
        cwidth += xswidth
      }

      let labelWidth = item.labelWidth || cwidth

      if (variant === 'document') {
        labelWidth += labelPadding * 2
      }
      item.isMultipleLine = cwidth > item.labelWidth
      if (labelWidth > (labelWidths[startIndex] || 0)) {
        labelWidths[startIndex] = labelWidth
      }
      item.computedLabelWidth = cwidth
      item.isRequired = isRequired

      startIndex += isString(item.span) ? item.computedSpan : item.span
    })
  })

  if (!defaultValue) {
    groups?.forEach((row) => {
      row.forEach((item) => {
        item.isMultipleLine = item.computedLabelWidth > labelWidths[item.index]
      })
    })
  }

  return labelWidths
}

/**
 * 将数组按指定索引分割为两个子数组
 * @param {Array} arr - 要分割的数组
 * @param {number} index - 分割点的索引
 * @returns {Array[]} 返回一个包含两个子数组的数组，第一个子数组包含从起始到索引位置的元素，第二个子数组包含索引位置之后的元素
 */
function splitArrayByIndex(arr, index) {
  const result = [] // 用于存放结果的数组，包含两个子数组
  let tempArray = [] // 临时数组，用于存储当前处理的子数组

  // 遍历整个数组
  for (let i = 0; i < arr.length; i++) {
    tempArray.push(arr[i]) // 将当前元素添加到临时数组中

    // 如果当前索引等于指定的分割索引
    if (i === index) {
      result.push(tempArray) // 将临时数组添加到结果数组中
      tempArray = [] // 重置临时数组以开始新的子数组
    }
  }

  // 如果最后一个临时数组非空，将其添加到结果数组中
  if (tempArray.length > 0) {
    result.push(tempArray)
  }

  return result // 返回结果数组，包含两个子数组
}

function caculateLabelWidth(label: string, size = 'medium') {
  // 创建一个不可见的span元素来测量字符串
  const span = document.createElement('span')
  span.style.position = 'absolute' // 设置绝对定位
  span.style.visibility = 'hidden' // 设置不可见
  span.style.whiteSpace = 'nowrap' // 设置不换行
  span.style.fontSize = `var(--td-font-size-body-${size})` // 设置字体大小
  span.textContent = label // 设置span的文本内容为传入的字符串

  // 将span元素添加到body中，以便可以测量其宽度
  document.body.appendChild(span)

  // 测量span元素的宽度
  const width = span.offsetWidth

  // 从body中移除span元素
  document.body.removeChild(span)

  // 返回字符串所占的宽度
  return width
}

export function getColonWidth() {
  return caculateLabelWidth('：')
}

/**
 * 判断一个变量是否是数组并且长度大于0
 * @param variable 要检查的变量
 * @returns 如果是数组且长度大于0返回 true，否则返回 false
 */
export function isArrayAndNotEmpty(variable: any): boolean {
  return Array.isArray(variable) && variable.length > 0
}

export function sumArray(numbers): number {
  return numbers?.reduce((sum, current) => sum + current, 0)
}

function getCssVarValue(varName) {
  // 获取根元素的计算样式
  const computedStyle = window.getComputedStyle(document.documentElement)

  // 获取CSS变量的值
  const cssVarValue = computedStyle.getPropertyValue(varName)

  return cssVarValue
}

export function arrayToObject(array) {
  const result = {}
  array.forEach((item) => {
    if (item.name && item.value !== undefined) {
      result[item.name] = item.value
    }
  })
  return result
}

export function transformArrayToObjects(array) {
  const valueObject = {}
  const nameArrayObject = {}

  array.forEach((item) => {
    const v = (item.value as string).toLowerCase()
    // 构建以value为键的对象
    valueObject[v] = ''

    // 构建以name为键，value为数组元素的对象
    if (!nameArrayObject[v]) {
      nameArrayObject[v] = ''
    }
    nameArrayObject[v] = item.value
  })

  return { valueObject, nameArrayObject }
}

export function removeObjectKeys(obj, keysToRemove) {
  // 创建一个新的对象，用于存储过滤后的结果
  const newObj = {}

  // 遍历原始对象的每个键值对
  for (const key in obj) {
    // 检查当前键是否不在需要移除的键数组中
    if (!keysToRemove.includes(key)) {
      // 如果不在数组中，将键值对添加到新对象中
      newObj[key] = obj[key]
    }
  }

  // 返回新对象
  return newObj
}

export function getFirstError(result: any[]) {
  if (isBoolean(result)) {
    return ''
  }

  if (!result) {
    return ''
  }
  const [firstKey] = Object.keys(result)
  const resArr = result[firstKey]
  if (!isArray(resArr))
    return ''
  return resArr.filter(item => !item.result)[0].message
}

export function getInitialValue(component) {
  // 获取组件的 value 属性的类型
  const valueType = component.props && component.props.value ? component.props.value.type : null

  if (!valueType) {
    return ''
  }

  // 如果 type 是数组（多类型），取第一个类型
  const type = Array.isArray(valueType) ? valueType[0] : valueType

  // 根据 value 属性的类型返回相应的初始值
  if (type === String) {
    return ''
  }
  else if (type === Array) {
    return []
  }
  else if (type === Object) {
    return {}
  }
  else if (type === Number) {
    return 0
  }
  else if (type === Boolean) {
    return false
  }
  else {
    throw new Error('Unsupported value type.')
  }
}

export function mergeObjects(defaultValue, value, innerValue) {
  const result = {}

  // 遍历所有可能的键
  const keys = new Set([
    ...Object.keys(defaultValue),
    ...Object.keys(value || {}),
    ...Object.keys(innerValue || {}),
  ])

  keys.forEach((key) => {
    // 按照优先级从高到低取值
    if (innerValue && innerValue[key] != null && innerValue[key] !== '') {
      result[key] = innerValue[key]
    }
    else if (value && value[key] != null && value[key] !== '') {
      result[key] = value[key]
    }
    else {
      result[key] = defaultValue[key]
    }
  })

  return result
}


export function mergeObject(cache, result) {
  const merged = { ...cache }; // 复制 cache 对象

  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      const cacheValue = cache[key];
      const resultValue = result[key];

      // 如果 resultValue 是数组且不为空，则使用 resultValue
      if (Array.isArray(resultValue) && resultValue.length > 0) {
        merged[key] = resultValue;
      }
      // 如果 resultValue 不是数组，或者是一个空数组，则保留 cacheValue
      else {
        merged[key] = cacheValue;
      }
    }
  }

  return merged;
}