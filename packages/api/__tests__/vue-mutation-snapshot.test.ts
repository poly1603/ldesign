/**
 * useMutation 快照/还原回滚测试
 */
import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createApiEngine } from '../src/core/factory'
import { ApiVuePlugin } from '../src/vue/plugin'
import { useMutation } from '../src/vue/composables'

describe('useMutation optimistic snapshot/restore', () => {
  it('失败时使用 snapshot/restore 回滚', async () => {
    const engine = createApiEngine({ debounce: { enabled: false }, deduplication: { enabled: false } })
    engine.register('mutateFail', { name: 'mutateFail', config: { method: 'POST', url: '/x' } })

    vi.spyOn(engine.httpClient, 'request').mockRejectedValue(new Error('fail'))

    let state = { name: 'old' }

    const Comp = defineComponent({
      setup() {
        const { mutate } = useMutation('mutateFail', {
          optimistic: {
            snapshot: () => ({ ...state }),
            restore: (snap) => { state = snap as any },
            apply: (vars: any) => { state = { ...state, ...vars } },
          }
        })
        return { mutate }
      },
      render() { return h('div') },
    })

    const wrapper = mount(Comp, { global: { plugins: [[ApiVuePlugin, { engine }]] } })
    await expect((wrapper.vm as any).mutate({ name: 'new' })).rejects.toThrow('fail')
    expect(state.name).toBe('old')
  })
})

