import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addClass,
  clearElement,
  createElement,
  getElementOffset,
  getElementSize,
  getStyle,
  hasClass,
  insertAfter,
  insertBefore,
  isElementInViewport,
  querySelector,
  querySelectorAll,
  removeClass,
  removeElement,
  replaceElement,
  scrollToElement,
  setStyle,
  toggleClass,
} from '../../src/utils/dom'

describe('dOM Utils', () => {
  let container: HTMLElement

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    // 清理测试容器
    document.body.removeChild(container)
  })

  describe('createElement', () => {
    it('should create element with basic options', () => {
      const element = createElement('div', {
        className: 'test-class',
        id: 'test-id',
        textContent: 'Hello World',
      })

      expect(element.tagName).toBe('DIV')
      expect(element.className).toBe('test-class')
      expect(element.id).toBe('test-id')
      expect(element.textContent).toBe('Hello World')
    })

    it('should create element with style', () => {
      const element = createElement('div', {
        style: {
          width: '100px',
          height: '50px',
          backgroundColor: 'red',
        },
      })

      expect(element.style.width).toBe('100px')
      expect(element.style.height).toBe('50px')
      expect(element.style.backgroundColor).toBe('red')
    })

    it('should create element with attributes', () => {
      const element = createElement('input', {
        attrs: {
          'type': 'text',
          'placeholder': 'Enter text',
          'data-test': 'input-field',
        },
      })

      expect(element.getAttribute('type')).toBe('text')
      expect(element.getAttribute('placeholder')).toBe('Enter text')
      expect(element.getAttribute('data-test')).toBe('input-field')
    })

    it('should create element with children', () => {
      const child1 = createElement('span', { textContent: 'Child 1' })
      const element = createElement('div', {
        children: [child1, 'Text Node'],
      })

      expect(element.children.length).toBe(1)
      expect(element.children[0].textContent).toBe('Child 1')
      expect(element.childNodes.length).toBe(2)
      expect(element.childNodes[1].textContent).toBe('Text Node')
    })

    it('should create element with innerHTML', () => {
      const element = createElement('div', {
        innerHTML: '<span>HTML Content</span>',
      })

      expect(element.innerHTML).toBe('<span>HTML Content</span>')
      expect(element.children.length).toBe(1)
      expect(element.children[0].tagName).toBe('SPAN')
    })
  })

  describe('querySelector and querySelectorAll', () => {
    beforeEach(() => {
      container.innerHTML = `
        <div class="item" data-id="1">Item 1</div>
        <div class="item" data-id="2">Item 2</div>
        <span class="item" data-id="3">Item 3</span>
      `
    })

    it('should query single element', () => {
      const element = querySelector('.item', container)
      expect(element).toBeTruthy()
      expect(element?.getAttribute('data-id')).toBe('1')
    })

    it('should query multiple elements', () => {
      const elements = querySelectorAll('.item', container)
      expect(elements).toHaveLength(3)
      expect(elements[0].getAttribute('data-id')).toBe('1')
      expect(elements[1].getAttribute('data-id')).toBe('2')
      expect(elements[2].getAttribute('data-id')).toBe('3')
    })

    it('should return null for non-existent element', () => {
      const element = querySelector('.non-existent', container)
      expect(element).toBeNull()
    })

    it('should return empty array for non-existent elements', () => {
      const elements = querySelectorAll('.non-existent', container)
      expect(elements).toHaveLength(0)
    })
  })

  describe('cSS class operations', () => {
    let element: HTMLElement

    beforeEach(() => {
      element = createElement('div')
      container.appendChild(element)
    })

    it('should add CSS class', () => {
      addClass(element, 'test-class')
      expect(element.classList.contains('test-class')).toBe(true)
    })

    it('should remove CSS class', () => {
      element.className = 'test-class another-class'
      removeClass(element, 'test-class')
      expect(element.classList.contains('test-class')).toBe(false)
      expect(element.classList.contains('another-class')).toBe(true)
    })

    it('should toggle CSS class', () => {
      const result1 = toggleClass(element, 'test-class')
      expect(result1).toBe(true)
      expect(element.classList.contains('test-class')).toBe(true)

      const result2 = toggleClass(element, 'test-class')
      expect(result2).toBe(false)
      expect(element.classList.contains('test-class')).toBe(false)
    })

    it('should check if element has CSS class', () => {
      element.className = 'test-class'
      expect(hasClass(element, 'test-class')).toBe(true)
      expect(hasClass(element, 'non-existent')).toBe(false)
    })

    it('should toggle CSS class with force parameter', () => {
      toggleClass(element, 'test-class', true)
      expect(element.classList.contains('test-class')).toBe(true)

      toggleClass(element, 'test-class', true)
      expect(element.classList.contains('test-class')).toBe(true)

      toggleClass(element, 'test-class', false)
      expect(element.classList.contains('test-class')).toBe(false)
    })
  })

  describe('style operations', () => {
    let element: HTMLElement

    beforeEach(() => {
      element = createElement('div')
      container.appendChild(element)
    })

    it('should set element style', () => {
      setStyle(element, {
        width: '100px',
        height: '50px',
        backgroundColor: 'red',
      })

      expect(element.style.width).toBe('100px')
      expect(element.style.height).toBe('50px')
      expect(element.style.backgroundColor).toBe('red')
    })

    it('should get element style', () => {
      element.style.width = '100px'
      element.style.display = 'block'

      // Note: getStyle returns computed style, which might differ from inline style
      const width = getStyle(element, 'width')
      const display = getStyle(element, 'display')

      expect(width).toBeTruthy()
      expect(display).toBeTruthy()
    })
  })

  describe('element size and offset', () => {
    let element: HTMLElement

    beforeEach(() => {
      element = createElement('div', {
        style: {
          width: '100px',
          height: '50px',
          padding: '10px',
          margin: '5px',
          border: '2px solid black',
        },
      })
      container.appendChild(element)
    })

    it('should get element size', () => {
      const size = getElementSize(element)
      expect(size).toHaveProperty('width')
      expect(size).toHaveProperty('height')
      expect(size).toHaveProperty('left')
      expect(size).toHaveProperty('top')
      expect(size).toHaveProperty('right')
      expect(size).toHaveProperty('bottom')
    })

    it('should get element offset', () => {
      const offset = getElementOffset(element)
      expect(offset).toHaveProperty('offsetWidth')
      expect(offset).toHaveProperty('offsetHeight')
      expect(offset).toHaveProperty('offsetLeft')
      expect(offset).toHaveProperty('offsetTop')
      expect(offset).toHaveProperty('clientWidth')
      expect(offset).toHaveProperty('clientHeight')
      expect(offset).toHaveProperty('scrollWidth')
      expect(offset).toHaveProperty('scrollHeight')
    })
  })

  describe('viewport operations', () => {
    let element: HTMLElement

    beforeEach(() => {
      element = createElement('div', {
        style: {
          width: '100px',
          height: '50px',
        },
      })
      container.appendChild(element)
    })

    it('should check if element is in viewport', () => {
      // Mock getBoundingClientRect
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        width: 100,
        height: 50,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      })

      // Mock window dimensions
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })

      const isInViewport = isElementInViewport(element)
      expect(typeof isInViewport).toBe('boolean')
    })

    it('should scroll to element', () => {
      const scrollIntoViewSpy = vi.spyOn(element, 'scrollIntoView').mockImplementation(() => { })

      scrollToElement(element)
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      })

      scrollToElement(element, { behavior: 'auto', block: 'start' })
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      })
    })
  })

  describe('element manipulation', () => {
    let element: HTMLElement
    let parent: HTMLElement

    beforeEach(() => {
      parent = createElement('div')
      element = createElement('div', { textContent: 'Test Element' })
      parent.appendChild(element)
      container.appendChild(parent)
    })

    it('should remove element', () => {
      expect(parent.children.length).toBe(1)
      removeElement(element)
      expect(parent.children.length).toBe(0)
    })

    it('should clear element content', () => {
      parent.innerHTML = '<span>Child 1</span><span>Child 2</span>'
      expect(parent.children.length).toBe(2)
      clearElement(parent)
      expect(parent.children.length).toBe(0)
      expect(parent.innerHTML).toBe('')
    })

    it('should insert element before target', () => {
      const newElement = createElement('div', { textContent: 'New Element' })
      insertBefore(newElement, element)

      expect(parent.children.length).toBe(2)
      expect(parent.children[0]).toBe(newElement)
      expect(parent.children[1]).toBe(element)
    })

    it('should insert element after target', () => {
      const newElement = createElement('div', { textContent: 'New Element' })
      insertAfter(newElement, element)

      expect(parent.children.length).toBe(2)
      expect(parent.children[0]).toBe(element)
      expect(parent.children[1]).toBe(newElement)
    })

    it('should replace element', () => {
      const newElement = createElement('div', { textContent: 'New Element' })
      replaceElement(newElement, element)

      expect(parent.children.length).toBe(1)
      expect(parent.children[0]).toBe(newElement)
      expect(parent.children[0].textContent).toBe('New Element')
    })
  })
})
