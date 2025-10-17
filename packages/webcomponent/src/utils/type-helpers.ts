/**
 * 安全地将自定义元素转换为 HTMLElement
 * 用于解决 TypeScript 中自定义元素类型与 HTMLElement 的兼容性问题
 */
export function toHTMLElement<T extends Element>(element: T): HTMLElement {
  return element as any as HTMLElement;
}

/**
 * 安全地将自定义元素数组转换为 HTMLElement 数组
 */
export function toHTMLElements<T extends Element>(elements: T[]): HTMLElement[] {
  return elements as any as HTMLElement[];
}

/**
 * 安全地将 NodeListOf 转换为数组
 */
export function nodeListToArray<T extends Element>(nodeList: NodeListOf<T>): T[] {
  return Array.from(nodeList);
}