import type { Ref } from 'vue'
import type { HttpClient, RequestConfig } from '../types'
import { ref } from 'vue'

/**
 * 乐观更新配置
 */
export interface OptimisticUpdateOptions<T> {
  /** 乐观更新函数 */
  optimisticUpdate: (currentData: T, input: any) => T
  /** 失败回滚函数 */
  onRollback?: (error: Error, previousData: T) => void
  /** 成功回调 */
  onSuccess?: (data: T) => void
}

/**
 * 乐观更新 Hook
 *
 * 先立即更新 UI,再发送请求,失败时自动回滚
 *
 * @example
 * ```typescript
 * const todos = ref([...])
 *
 * const { execute, loading, rollback } = useOptimisticUpdate(
 *   client,
 *   todos,
 *   {
 *     optimisticUpdate: (current, newTodo) => [...current, newTodo],
 *     onRollback: (error, previous) => {
 *       console.error('创建失败:', error)
 *       todos.value = previous
 *     }
 *   }
 * )
 *
 * // 点击添加按钮
 * await execute(
 *   { url: '/api/todos', method: 'POST', data: newTodo },
 *   newTodo
 * )
 * // UI立即显示新todo,如果请求失败会自动回滚
 * ```
 */
export function useOptimisticUpdate<T = any, Input = any>(
  client: HttpClient,
  dataRef: Ref<T>,
  options: OptimisticUpdateOptions<T>,
) {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let previousData: T | null = null
  let isOptimisticUpdate = false

  /**
   * 执行乐观更新
   */
  const execute = async (config: RequestConfig, input: Input): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null

      // 保存当前数据
      previousData = JSON.parse(JSON.stringify(dataRef.value)) // 深拷贝

      // 立即应用乐观更新
      isOptimisticUpdate = true
      dataRef.value = options.optimisticUpdate(dataRef.value, input)

      // 发送实际请求
      const response = await client.request<T>(config)

      // 请求成功,使用服务器返回的数据
      isOptimisticUpdate = false
      if (response.data) {
        dataRef.value = response.data
      }

      options.onSuccess?.(response.data)
      previousData = null

      return response.data
    }
    catch (err) {
      error.value = err as Error

      // 失败回滚
      if (previousData !== null) {
        // 直接执行回滚逻辑而不调用函数
        const previous = previousData
        dataRef.value = previous
        options.onRollback?.(error.value || new Error('Rollback'), previous)
        previousData = null
      }

      return null
    }
    finally {
      loading.value = false
      isOptimisticUpdate = false
    }
  }

  /**
   * 手动回滚到之前的状态
   */
  const rollback = () => {
    if (previousData !== null) {
      const previous = previousData
      dataRef.value = previous
      options.onRollback?.(error.value || new Error('Rollback'), previous)
      previousData = null
    }
  }

  return {
    execute,
    rollback,
    loading,
    error,
    isOptimistic: ref(isOptimisticUpdate),
  }
}

/**
 * 列表乐观更新 Hook
 *
 * 专门用于列表的增删改操作
 *
 * @example
 * ```typescript
 * const { add, update, remove } = useOptimisticList(client, todos)
 *
 * // 添加
 * await add(
 *   { url: '/api/todos', method: 'POST', data: newTodo },
 *   newTodo
 * )
 *
 * // 更新
 * await update(
 *   { url: `/api/todos/${id}`, method: 'PUT', data: updated },
 *   id,
 *   updated
 * )
 *
 * // 删除
 * await remove(
 *   { url: `/api/todos/${id}`, method: 'DELETE' },
 *   id
 * )
 * ```
 */
export function useOptimisticList<T extends { id: any }>(
  client: HttpClient,
  listRef: Ref<T[]>,
  options: { idKey?: keyof T } = {},
) {
  const { idKey = 'id' } = options
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 添加项
   */
  const add = async (config: RequestConfig, item: T): Promise<T | null> => {
    const { execute } = useOptimisticUpdate<T[]>(client, listRef, {
      optimisticUpdate: (current) => [...current, item],
    })
    // execute返回整个列表，但我们只返回新添加的项
    await execute(config, item)
    return item
  }

  /**
   * 更新项
   */
  const update = async (
    config: RequestConfig,
    id: any,
    updates: Partial<T>,
  ): Promise<T | null> => {
    const { execute } = useOptimisticUpdate<T[]>(client, listRef, {
      optimisticUpdate: (current) =>
        current.map(item =>
          item[idKey] === id ? { ...item, ...updates } : item,
        ),
    })
    // execute返回整个列表，但我们返回更新后的项
    const result = await execute(config, updates)
    if (result) {
      return listRef.value.find(item => item[idKey] === id) || null
    }
    return null
  }

  /**
   * 删除项
   */
  const remove = async (config: RequestConfig, id: any): Promise<boolean> => {
    const { execute } = useOptimisticUpdate(client, listRef, {
      optimisticUpdate: (current) => current.filter(item => item[idKey] !== id),
    })
    const result = await execute(config, id)
    return result !== null
  }

  return {
    add,
    update,
    remove,
    loading,
    error,
  }
}
