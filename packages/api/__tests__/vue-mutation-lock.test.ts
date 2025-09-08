/**
 * useMutation lockWhilePending 基础测试
 */
import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createApiEngine } from '../src/core/factory'
import { ApiVuePlugin } from '../src/vue/plugin'
import { useMutation } from '../src/vue/composables'

describe('useMutation lockWhilePending', () => {
  it('pending 时拒绝新的 mutate', async () => {
    const engine = createApiEngine({ debounce: { enabled: false }, deduplication: { enabled: false } })
    engine.register('slow', { name: 'slow', config: { method: 'POST', url: '/slow' } })

    vi.spyOn(engine.httpClient, 'request').mockImplementation(async () => {
      await new Promise(r => setTimeout(r, 50))
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config: {} }
    })

    let rejected = false

    const Comp = defineComponent({
      setup() {
        const { mutate } = useMutation('slow', { lockWhilePending: true })
        return { mutate }
      },
      render() { return h('div') },
    })

    const wrapper = mount(Comp, { global: { plugins: [[ApiVuePlugin, { engine }]] } })

    // 第一次发起
    const p1 = (wrapper.vm as any).mutate({})
    // 紧接着发起第二次，应当被拒绝
    await expect((wrapper.vm as any).mutate({})).rejects.toThrow('Mutation is pending')

    await p1
  })
})

