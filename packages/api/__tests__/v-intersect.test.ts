/**
 * v-intersect 指令测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { vIntersect } from '../src/vue/directives'

class MockIO {
  public callback: IntersectionObserverCallback
  public options: IntersectionObserverInit
  public observed: Element[] = []
  public disconnected = false
  constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = cb
    this.options = options || {}
    MockIO.instances.push(this)
  }
  observe(el: Element) { this.observed.push(el) }
  unobserve(_el: Element) {}
  disconnect() { this.disconnected = true }
  static instances: MockIO[] = []
}

// @ts-ignore
beforeEach(() => { MockIO.instances = []; (globalThis as any).IntersectionObserver = MockIO })

describe('v-intersect', () => {
  it('once + delay: 只触发一次且有延迟', async () => {
    vi.useFakeTimers()
    const hit = vi.fn()
    const Comp = defineComponent({
      template: '<div id="s" v-intersect="{ callback: onHit, once: true, delay: 50 }"></div>',
      setup() { return { onHit: hit } },
    })
    const wrapper = mount(Comp, { global: { directives: { intersect: vIntersect } } })

    const io = MockIO.instances[0]
    expect(io).toBeDefined()

    // 触发相交
    const el = wrapper.find('#s').element
    io.callback([{ isIntersecting: true, target: el } as any], io as any)

    // 未到时间不触发
    expect(hit).not.toHaveBeenCalled()
    vi.advanceTimersByTime(50)
    expect(hit).toHaveBeenCalledTimes(1)

    // 已断开
    expect(io.disconnected).toBe(true)
    vi.useRealTimers()
  })

  it('多次触发（once=false）', async () => {
    const hit = vi.fn()
    const Comp = defineComponent({
      template: '<div id="s" v-intersect="{ callback: onHit }"></div>',
      setup() { return { onHit: hit } },
    })
    const wrapper = mount(Comp, { global: { directives: { intersect: vIntersect } } })

    const io = MockIO.instances[0]
    const el = wrapper.find('#s').element

    io.callback([{ isIntersecting: true, target: el } as any], io as any)
    io.callback([{ isIntersecting: true, target: el } as any], io as any)
    expect(hit).toHaveBeenCalledTimes(2)
    expect(io.disconnected).toBe(false)
  })
})

