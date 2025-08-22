import type { Styles } from '../types'

/**
 * 用于为节点增加styles
 * @param el HTMLElement
 * @param style Styles
 */
function setStyle(el: HTMLElement, styles: Styles): void {
  // const keys = Object.keys(styles)
  // keys.forEach((key) => {
  //   el.style[key] = styles[key]
  // })
  // TODO: 这个怎么样
  Object.assign(el.style, styles)
}

export default setStyle
