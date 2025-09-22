/**
 * useAsyncValidator Hook 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useAsyncValidator } from '../useAsyncValidator'

describe('useAsyncValidator', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该正确初始化验证器状态', () => {
    const value = ref('')
    const { state } = useAsyncValidator(value, {
      validator: async () => true,
    })

    expect(state.value.validating).toBe(false)
    expect(state.value.error).toBe('')
    expect(state.value.success).toBe('')
    expect(state.value.validated).toBe(false)
    expect(state.value.valid).toBe(false)
  })

  it('应该正确执行异步验证', async () => {
    const value = ref('test')
    const validator = vi.fn().mockResolvedValue(true)

    const { state, trigger } = useAsyncValidator(value, {
      validator,
      successMessage: '验证成功',
    })

    await trigger()

    expect(validator).toHaveBeenCalledWith('test', expect.any(AbortSignal))
    expect(state.value.validating).toBe(false)
    expect(state.value.validated).toBe(true)
    expect(state.value.valid).toBe(true)
    expect(state.value.success).toBe('验证成功')
    expect(state.value.error).toBe('')
  })

  it('应该正确处理验证失败', async () => {
    const value = ref('test')
    const validator = vi.fn().mockResolvedValue('验证失败')

    const { state, trigger } = useAsyncValidator(value, {
      validator,
    })

    await trigger()

    expect(state.value.validating).toBe(false)
    expect(state.value.validated).toBe(true)
    expect(state.value.valid).toBe(false)
    expect(state.value.error).toBe('验证失败')
    expect(state.value.success).toBe('')
  })

  it('应该正确处理验证异常', async () => {
    const value = ref('test')
    const validator = vi.fn().mockRejectedValue(new Error('网络错误'))

    const { state, trigger } = useAsyncValidator(value, {
      validator,
    })

    await trigger()

    expect(state.value.validating).toBe(false)
    expect(state.value.validated).toBe(true)
    expect(state.value.valid).toBe(false)
    expect(state.value.error).toBe('验证失败')
  })

  it('应该正确处理防抖', async () => {
    const value = ref('')
    const validator = vi.fn().mockResolvedValue(true)

    const { state } = useAsyncValidator(value, {
      validator,
      debounce: 300,
      immediate: false,
    })

    // 快速连续改变值
    value.value = 'a'
    await nextTick()
    value.value = 'ab'
    await nextTick()
    value.value = 'abc'
    await nextTick()

    // 验证器还没有被调用
    expect(validator).not.toHaveBeenCalled()
    expect(state.value.validating).toBe(false)

    // 等待防抖时间
    vi.advanceTimersByTime(300)
    await nextTick()

    // 现在验证器应该被调用
    expect(validator).toHaveBeenCalledTimes(1)
    expect(validator).toHaveBeenCalledWith('abc', expect.any(AbortSignal))
  })

  it('应该正确处理预检查', async () => {
    const value = ref('')
    const validator = vi.fn().mockResolvedValue(true)
    const preCheck = vi.fn().mockReturnValue(false)

    const { trigger } = useAsyncValidator(value, {
      validator,
      preCheck,
    })

    await trigger()

    expect(preCheck).toHaveBeenCalledWith('')
    expect(validator).not.toHaveBeenCalled()
  })

  it('应该正确取消验证请求', () => {
    const value = ref('test')
    let abortSignal: AbortSignal | undefined

    const validator = vi.fn().mockImplementation(async (val, signal) => {
      abortSignal = signal
      // 模拟一个永远不会完成的验证
      return new Promise(() => { })
    })

    const { state, trigger, clear } = useAsyncValidator(value, {
      validator,
    })

    trigger()
    expect(state.value.validating).toBe(true)

    clear()

    expect(abortSignal?.aborted).toBe(true)
    expect(state.value.validating).toBe(false)
    expect(state.value.validated).toBe(false)
  })

  it('应该正确处理值变化时的自动验证', async () => {
    const value = ref('')
    const validator = vi.fn().mockResolvedValue(true)

    useAsyncValidator(value, {
      validator,
      debounce: 100,
    })

    value.value = 'test'
    await nextTick()

    vi.advanceTimersByTime(100)
    await nextTick()

    expect(validator).toHaveBeenCalledWith('test', expect.any(AbortSignal))
  })

  it('应该正确重置验证状态', async () => {
    const value = ref('test')
    const validator = vi.fn().mockResolvedValue('验证失败')

    const { state, trigger, reset } = useAsyncValidator(value, {
      validator,
    })

    await trigger()
    expect(state.value.validated).toBe(true)
    expect(state.value.error).toBe('验证失败')

    reset()
    expect(state.value.validating).toBe(false)
    expect(state.value.error).toBe('')
    expect(state.value.success).toBe('')
    expect(state.value.validated).toBe(false)
    expect(state.value.valid).toBe(false)
  })

  it('应该正确处理相同值的重复验证', async () => {
    const value = ref('test')
    const validator = vi.fn().mockResolvedValue(true)

    const { state, trigger } = useAsyncValidator(value, {
      validator,
    })

    // 第一次验证
    await trigger()
    expect(validator).toHaveBeenCalledTimes(1)
    expect(state.value.lastValidatedValue).toBe('test')

    // 值没有变化，不应该重新验证
    value.value = 'test'
    await nextTick()
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(validator).toHaveBeenCalledTimes(1)
  })
})
