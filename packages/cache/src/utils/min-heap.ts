/**
 * 最小堆数据结构
 * 
 * 用于高效管理过期队列，提供 O(log n) 的插入和删除操作
 */

/**
 * 堆节点接口
 */
export interface HeapNode<T = unknown> {
  /** 优先级（用于排序） */
  priority: number
  /** 节点数据 */
  data: T
}

/**
 * 最小堆类
 * 
 * 提供高效的优先队列实现
 * 
 * @example
 * ```typescript
 * const heap = new MinHeap<string>()
 * heap.insert(5, 'five')
 * heap.insert(3, 'three')
 * heap.insert(7, 'seven')
 * 
 * ) // { priority: 3, data: 'three' }
 * ) // { priority: 3, data: 'three' }
 * ```
 */
export class MinHeap<T = unknown> {
  /** 堆数组 */
  private heap: HeapNode<T>[] = []
  /** 数据到索引的映射（用于快速查找） */
  private indexMap: Map<T, number> = new Map()

  /**
   * 获取堆大小
   */
  get size(): number {
    return this.heap.length
  }

  /**
   * 检查堆是否为空
   */
  isEmpty(): boolean {
    return this.heap.length === 0
  }

  /**
   * 插入元素
   * 
   * @param priority - 优先级（越小越优先）
   * @param data - 数据
   * 
   * 时间复杂度: O(log n)
   */
  insert(priority: number, data: T): void {
    const node: HeapNode<T> = { priority, data }
    this.heap.push(node)
    this.indexMap.set(data, this.heap.length - 1)
    this.bubbleUp(this.heap.length - 1)
  }

  /**
   * 查看堆顶元素（不删除）
   * 
   * @returns 堆顶元素，如果堆为空则返回 null
   * 
   * 时间复杂度: O(1)
   */
  peek(): HeapNode<T> | null {
    return this.heap.length > 0 ? this.heap[0] : null
  }

  /**
   * 提取堆顶元素（删除并返回）
   * 
   * @returns 堆顶元素，如果堆为空则返回 null
   * 
   * 时间复杂度: O(log n)
   */
  extract(): HeapNode<T> | null {
    if (this.heap.length === 0) {
      return null
    }

    if (this.heap.length === 1) {
      const node = this.heap.pop()!
      this.indexMap.delete(node.data)
      return node
    }

    const min = this.heap[0]
    this.indexMap.delete(min.data)

    // 将最后一个元素移到堆顶
    const last = this.heap.pop()!
    this.heap[0] = last
    this.indexMap.set(last.data, 0)

    // 向下调整
    this.bubbleDown(0)

    return min
  }

  /**
   * 删除指定数据的节点
   * 
   * @param data - 要删除的数据
   * @returns 是否成功删除
   * 
   * 时间复杂度: O(log n)
   */
  remove(data: T): boolean {
    const index = this.indexMap.get(data)
    if (index === undefined) {
      return false
    }

    if (index === this.heap.length - 1) {
      // 如果是最后一个元素，直接删除
      this.heap.pop()
      this.indexMap.delete(data)
      return true
    }

    // 将最后一个元素移到删除位置
    const last = this.heap.pop()!
    this.indexMap.delete(data)

    if (index < this.heap.length) {
      this.heap[index] = last
      this.indexMap.set(last.data, index)

      // 尝试向上和向下调整
      this.bubbleUp(index)
      this.bubbleDown(index)
    }

    return true
  }

  /**
   * 更新元素的优先级
   * 
   * @param data - 要更新的数据
   * @param newPriority - 新优先级
   * @returns 是否成功更新
   * 
   * 时间复杂度: O(log n)
   */
  updatePriority(data: T, newPriority: number): boolean {
    const index = this.indexMap.get(data)
    if (index === undefined) {
      return false
    }

    const oldPriority = this.heap[index].priority
    this.heap[index].priority = newPriority

    // 根据优先级变化决定调整方向
    if (newPriority < oldPriority) {
      this.bubbleUp(index)
    }
    else if (newPriority > oldPriority) {
      this.bubbleDown(index)
    }

    return true
  }

  /**
   * 检查是否包含指定数据
   * 
   * @param data - 要检查的数据
   * @returns 是否包含
   * 
   * 时间复杂度: O(1)
   */
  has(data: T): boolean {
    return this.indexMap.has(data)
  }

  /**
   * 清空堆
   */
  clear(): void {
    this.heap = []
    this.indexMap.clear()
  }

  /**
   * 获取所有元素（按堆顺序，非排序）
   * 
   * @returns 所有节点的副本
   */
  toArray(): HeapNode<T>[] {
    return [...this.heap]
  }

  /**
   * 获取所有元素（已排序）
   * 
   * @returns 按优先级排序的节点数组
   * 
   * 时间复杂度: O(n log n)
   */
  toSortedArray(): HeapNode<T>[] {
    const sorted: HeapNode<T>[] = []
    const copy = new MinHeap<T>()

    // 复制堆
    for (const node of this.heap) {
      copy.insert(node.priority, node.data)
    }

    // 依次提取元素
    while (!copy.isEmpty()) {
      const node = copy.extract()
      if (node) {
        sorted.push(node)
      }
    }

    return sorted
  }

  /**
   * 向上冒泡（用于插入后调整）
   * 
   * @param index - 起始索引
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      
      if (this.heap[index].priority >= this.heap[parentIndex].priority) {
        break
      }

      // 交换
      this.swap(index, parentIndex)
      index = parentIndex
    }
  }

  /**
   * 向下冒泡（用于删除后调整）
   * 
   * @param index - 起始索引
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length

    while (true) {
      let smallest = index
      const leftChild = 2 * index + 1
      const rightChild = 2 * index + 2

      // 比较左子节点
      if (
        leftChild < length
        && this.heap[leftChild].priority < this.heap[smallest].priority
      ) {
        smallest = leftChild
      }

      // 比较右子节点
      if (
        rightChild < length
        && this.heap[rightChild].priority < this.heap[smallest].priority
      ) {
        smallest = rightChild
      }

      // 如果最小值是当前节点，结束
      if (smallest === index) {
        break
      }

      // 交换
      this.swap(index, smallest)
      index = smallest
    }
  }

  /**
   * 交换两个节点
   * 
   * @param i - 索引 1
   * @param j - 索引 2
   */
  private swap(i: number, j: number): void {
    const temp = this.heap[i]
    this.heap[i] = this.heap[j]
    this.heap[j] = temp

    // 更新索引映射
    this.indexMap.set(this.heap[i].data, i)
    this.indexMap.set(this.heap[j].data, j)
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    size: number
    height: number
    minPriority: number | null
    maxPriority: number | null
  } {
    if (this.heap.length === 0) {
      return {
        size: 0,
        height: 0,
        minPriority: null,
        maxPriority: null,
      }
    }

    const height = Math.ceil(Math.log2(this.heap.length + 1))
    const minPriority = this.heap[0].priority
    
    let maxPriority = this.heap[0].priority
    for (const node of this.heap) {
      if (node.priority > maxPriority) {
        maxPriority = node.priority
      }
    }

    return {
      size: this.heap.length,
      height,
      minPriority,
      maxPriority,
    }
  }
}

/**
 * 创建最小堆
 * 
 * @returns 最小堆实例
 */
export function createMinHeap<T = unknown>(): MinHeap<T> {
  return new MinHeap<T>()
}

/**
 * 从数组创建最小堆
 * 
 * @param items - 初始项目数组
 * @returns 最小堆实例
 * 
 * @example
 * ```typescript
 * const heap = createMinHeapFromArray([
 *   { priority: 5, data: 'five' },
 *   { priority: 3, data: 'three' },
 *   { priority: 7, data: 'seven' }
 * ])
 * ```
 */
export function createMinHeapFromArray<T = unknown>(
  items: Array<{ priority: number, data: T }>,
): MinHeap<T> {
  const heap = new MinHeap<T>()
  for (const item of items) {
    heap.insert(item.priority, item.data)
  }
  return heap
}
