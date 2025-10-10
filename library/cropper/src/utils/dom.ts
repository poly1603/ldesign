/**
 * DOM utilities
 */

/**
 * Get an element by selector
 */
export function getElement(selector: string | Element): Element | null {
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  }
  return selector
}

/**
 * Create an element with optional class names
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)
  if (className) {
    element.className = className
  }
  return element
}

/**
 * Set styles on an element
 */
export function setStyle(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  Object.assign(element.style, styles)
}

/**
 * Get the offset of an element relative to the document
 */
export function getOffset(element: Element): { left: number; top: number } {
  const rect = element.getBoundingClientRect()
  return {
    left: rect.left + window.pageXOffset,
    top: rect.top + window.pageYOffset
  }
}

/**
 * Get the bounding box of an element
 */
export function getBoundingBox(element: Element) {
  return element.getBoundingClientRect()
}

/**
 * Add class to element
 */
export function addClass(element: Element, className: string): void {
  element.classList.add(className)
}

/**
 * Remove class from element
 */
export function removeClass(element: Element, className: string): void {
  element.classList.remove(className)
}

/**
 * Toggle class on element
 */
export function toggleClass(element: Element, className: string): void {
  element.classList.toggle(className)
}

/**
 * Has class
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * Get data attribute
 */
export function getData(element: Element, key: string): string | null {
  return element.getAttribute(`data-${key}`)
}

/**
 * Set data attribute
 */
export function setData(element: Element, key: string, value: string): void {
  element.setAttribute(`data-${key}`, value)
}

/**
 * Remove child elements
 */
export function empty(element: Element): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

/**
 * Append child elements
 */
export function append(parent: Element, ...children: Element[]): void {
  children.forEach((child) => parent.appendChild(child))
}

/**
 * Check if element matches selector
 */
export function matches(element: Element, selector: string): boolean {
  return element.matches(selector)
}

/**
 * Find closest ancestor matching selector
 */
export function closest(element: Element, selector: string): Element | null {
  return element.closest(selector)
}

/**
 * Get computed style
 */
export function getComputedStyle(
  element: Element,
  property?: string
): string | CSSStyleDeclaration {
  const computed = window.getComputedStyle(element)
  return property ? computed.getPropertyValue(property) : computed
}

/**
 * Check if element is visible
 */
export function isVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  )
}

/**
 * Get element size
 */
export function getSize(element: Element): { width: number; height: number } {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}
