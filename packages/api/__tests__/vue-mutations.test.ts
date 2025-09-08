/**
 * Vue useMutation 基础测试
 */
import { describe, it, expect, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createApiEngine } from '../src/core/factory'
import { ApiVuePlugin } from '../src/vue/plugin'
import { useMutation } from '../src/vue/composables'

describe('useMutation', () => {
  it('应当能够执行 mutate 并拿到结果', async () => {
    const engine = createApiEngine({ debounce: { enabled: false }, deduplication: { enabled: false } })
    engine.register('mutate', { name: 'mutate', config: { method: 'POST', url: '/x' } })

    vi.spyOn(engine.httpClient, 'request').mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })

    let touched = false

    const Comp = defineComponent({
      setup() {
        const { mutate, data, loading, error } = useMutation<{ ok: boolean }, { name: string }>('mutate', {
          onMutate: () => { touched = true },
        })
        return { mutate, data, loading, error }
      },
      render() { return h('div') },
    })

    const wrapper = mount(Comp, {
      global: { plugins: [[ApiVuePlugin, { engine }]] },
    })

    const res = await (wrapper.vm as any).mutate({ name: 'a' })
    expect(res).toEqual({ ok: true })
    expect((wrapper.vm as any).data).toEqual({ ok: true })
    expect(touched).toBe(true)
  })
})

