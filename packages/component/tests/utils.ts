/**
 * 测试工具函数
 * 
 * 提供组件测试中常用的工具函数和辅助方法
 */

import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { Component, App } from 'vue'

/**
 * 创建组件挂载器
 * @param component Vue 组件
 * @param options 挂载选项
 * @returns 组件包装器
 */
export function createMount<T extends Component>(
  component: T,
  options: MountingOptions<T> = {}
): VueWrapper<any> {
  const defaultOptions: MountingOptions<T> = {
    global: {
      stubs: {
        transition: false,
        'transition-group': false
      }
    }
  }

  return mount(component, {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global
    }
  })
}

/**
 * 等待组件更新
 * @param wrapper 组件包装器
 * @param timeout 超时时间
 */
export async function waitForUpdate(wrapper: VueWrapper<any>, timeout = 100): Promise<void> {
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, timeout))
}

/**
 * 触发组件事件
 * @param wrapper 组件包装器
 * @param eventName 事件名称
 * @param eventData 事件数据
 */
export async function triggerComponentEvent(
  wrapper: VueWrapper<any>,
  eventName: string,
  eventData?: any
): Promise<void> {
  await wrapper.trigger(eventName, eventData)
  await waitForUpdate(wrapper)
}

/**
 * 查找组件中的元素
 * @param wrapper 组件包装器
 * @param selector 选择器
 * @returns 元素或 null
 */
export function findElement(wrapper: VueWrapper<any>, selector: string): Element | null {
  const element = wrapper.find(selector)
  return element.exists() ? element.element : null
}

/**
 * 检查组件是否包含指定类名
 * @param wrapper 组件包装器
 * @param className 类名
 * @returns 是否包含类名
 */
export function hasClass(wrapper: VueWrapper<any>, className: string): boolean {
  return wrapper.classes().includes(className)
}

/**
 * 检查组件是否包含指定属性
 * @param wrapper 组件包装器
 * @param attrName 属性名
 * @param attrValue 属性值（可选）
 * @returns 是否包含属性
 */
export function hasAttribute(
  wrapper: VueWrapper<any>,
  attrName: string,
  attrValue?: string
): boolean {
  const attrs = wrapper.attributes()
  if (attrValue !== undefined) {
    return attrs[attrName] === attrValue
  }
  return attrName in attrs
}

/**
 * 模拟用户输入
 * @param wrapper 组件包装器
 * @param selector 输入框选择器
 * @param value 输入值
 */
export async function userInput(
  wrapper: VueWrapper<any>,
  selector: string,
  value: string
): Promise<void> {
  const input = wrapper.find(selector)
  if (!input.exists()) {
    throw new Error(`Input element with selector "${selector}" not found`)
  }
  
  await input.setValue(value)
  await input.trigger('input')
  await input.trigger('change')
  await waitForUpdate(wrapper)
}

/**
 * 模拟用户点击
 * @param wrapper 组件包装器
 * @param selector 元素选择器
 */
export async function userClick(
  wrapper: VueWrapper<any>,
  selector: string
): Promise<void> {
  const element = wrapper.find(selector)
  if (!element.exists()) {
    throw new Error(`Element with selector "${selector}" not found`)
  }
  
  await element.trigger('click')
  await waitForUpdate(wrapper)
}

/**
 * 模拟键盘事件
 * @param wrapper 组件包装器
 * @param selector 元素选择器
 * @param key 按键
 * @param eventType 事件类型
 */
export async function userKeyboard(
  wrapper: VueWrapper<any>,
  selector: string,
  key: string,
  eventType: 'keydown' | 'keyup' | 'keypress' = 'keydown'
): Promise<void> {
  const element = wrapper.find(selector)
  if (!element.exists()) {
    throw new Error(`Element with selector "${selector}" not found`)
  }
  
  await element.trigger(eventType, { key })
  await waitForUpdate(wrapper)
}

/**
 * 检查组件是否发出了指定事件
 * @param wrapper 组件包装器
 * @param eventName 事件名称
 * @returns 是否发出了事件
 */
export function hasEmitted(wrapper: VueWrapper<any>, eventName: string): boolean {
  return wrapper.emitted(eventName) !== undefined
}

/**
 * 获取组件发出的事件数据
 * @param wrapper 组件包装器
 * @param eventName 事件名称
 * @param index 事件索引（默认最后一次）
 * @returns 事件数据
 */
export function getEmittedEventData(
  wrapper: VueWrapper<any>,
  eventName: string,
  index = -1
): any[] | undefined {
  const events = wrapper.emitted(eventName)
  if (!events || events.length === 0) {
    return undefined
  }
  
  const eventIndex = index < 0 ? events.length + index : index
  return events[eventIndex]
}

/**
 * 创建测试应用实例
 * @param component 根组件
 * @returns 应用实例
 */
export function createTestApp(component: Component): App {
  const { createApp } = require('vue')
  return createApp(component)
}

/**
 * 模拟异步操作
 * @param ms 延迟时间
 * @returns Promise
 */
export function mockAsync(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建模拟的 DOM 元素
 * @param tagName 标签名
 * @param attributes 属性
 * @returns DOM 元素
 */
export function createMockElement(
  tagName: string,
  attributes: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tagName)
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  return element
}

/**
 * 断言组件渲染结果
 * @param wrapper 组件包装器
 * @param expectedHtml 期望的 HTML
 */
export function expectHtml(wrapper: VueWrapper<any>, expectedHtml: string): void {
  expect(wrapper.html()).toBe(expectedHtml)
}

/**
 * 断言组件文本内容
 * @param wrapper 组件包装器
 * @param expectedText 期望的文本
 */
export function expectText(wrapper: VueWrapper<any>, expectedText: string): void {
  expect(wrapper.text()).toBe(expectedText)
}
