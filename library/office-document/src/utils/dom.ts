/**
 * DOM utility functions
 */

/**
 * Create element with attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
 tag: K,
 attributes?: Record<string, string>,
 children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
 const element = document.createElement(tag);

 if (attributes) {
  Object.entries(attributes).forEach(([key, value]) => {
   if (key === 'className') {
    element.className = value;
   } else if (key === 'innerHTML') {
    element.innerHTML = value;
   } else {
    element.setAttribute(key, value);
   }
  });
 }

 if (children) {
  children.forEach(child => {
   if (typeof child === 'string') {
    element.appendChild(document.createTextNode(child));
   } else {
    element.appendChild(child);
   }
  });
 }

 return element;
}

/**
 * Add class names
 */
export function addClass(element: HTMLElement, ...classNames: string[]): void {
 element.classList.add(...classNames);
}

/**
 * Remove class names
 */
export function removeClass(element: HTMLElement, ...classNames: string[]): void {
 element.classList.remove(...classNames);
}

/**
 * Toggle class name
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): void {
 element.classList.toggle(className, force);
}

/**
 * Query selector with type safety
 */
export function query<T extends HTMLElement = HTMLElement>(
 selector: string,
 parent: HTMLElement | Document = document
): T | null {
 return parent.querySelector<T>(selector);
}

/**
 * Query selector all with type safety
 */
export function queryAll<T extends HTMLElement = HTMLElement>(
 selector: string,
 parent: HTMLElement | Document = document
): T[] {
 return Array.from(parent.querySelectorAll<T>(selector));
}

/**
 * Remove all children
 */
export function removeChildren(element: HTMLElement): void {
 while (element.firstChild) {
  element.removeChild(element.firstChild);
 }
}

/**
 * Get element offset
 */
export function getOffset(element: HTMLElement): { top: number; left: number } {
 const rect = element.getBoundingClientRect();
 return {
  top: rect.top + window.scrollY,
  left: rect.left + window.scrollX
 };
}

/**
 * Check if element is visible
 */
export function isVisible(element: HTMLElement): boolean {
 return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
 func: T,
 wait: number
): (...args: Parameters<T>) => void {
 let timeout: NodeJS.Timeout | null = null;
 return function (this: any, ...args: Parameters<T>) {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => func.apply(this, args), wait);
 };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
 func: T,
 limit: number
): (...args: Parameters<T>) => void {
 let inThrottle: boolean;
 return function (this: any, ...args: Parameters<T>) {
  if (!inThrottle) {
   func.apply(this, args);
   inThrottle = true;
   setTimeout(() => (inThrottle = false), limit);
  }
 };
}
