/**
 * useMutation 乐观回滚测试
 */
import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createApiEngine } from '../src/core/factory'
import { ApiVuePlugin } from '../src/vue/plugin'
import { useMutation } from '../src/vue/composables'

describe('useMutation optimistic', () => {
  it('失败时执行回滚', async () => {
    const engine = createApiEngine({ debounce: { enabled: false }, deduplication: { enabled: false } })
    engine.register('mutateFail', { name: 'mutateFail', config: { method: 'POST', url: '/x' } })

    vi.spyOn(engine.httpClient, 'request').mockRejectedValue(new Error('fail'))

    let applied = false
    let rolledBack = false

    const Comp = defineComponent({
      setup() {
        const { mutate } = useMutation('mutateFail', {
          optimistic: {
            apply: () => { applied = true; return () => { rolledBack = true } },
          },
        })
        return { mutate }
      },
      render() { return h('div') },
    })

    const wrapper = mount(Comp, { global: { plugins: [[ApiVuePlugin, { engine }]] } })
    await expect((wrapper.vm as any).mutate({})).rejects.toThrow('fail')
    expect(applied).toBe(true)
    expect(rolledBack).toBe(true)
  })
})

