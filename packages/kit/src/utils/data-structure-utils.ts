/**
 * 数据结构工具类
 * 提供队列、栈、双端队列、优先队列等常用数据结构
 * 
 * @example
 * ```typescript
 * import { Queue, Stack, PriorityQueue } from '@ldesign/kit'
 * 
 * // 队列
 * const queue = new Queue<number>()
 * queue.enqueue(1)
 * queue.dequeue() // 1
 * 
 * // 栈
 * const stack = new Stack<string>()
 * stack.push('hello')
 * stack.pop() // 'hello'
 * 
 * // 优先队列
 * const pq = new PriorityQueue<number>()
 * pq.enqueue(5, 1)
 * pq.enqueue(3, 2)
 * pq.dequeue() // 3 (higher priority)
 * ```
 */

/**
 * 队列类
 */
export class Queue<T = any> {
  private items: T[] = []

  /**
   * 入队
   * @param item 项
   */
  enqueue(item: T): void {
    this.items.push(item)
  }

  /**
   * 出队
   * @returns 队首元素
   */
  dequeue(): T | undefined {
    return this.items.shift()
  }

  /**
   * 查看队首元素
   * @returns 队首元素
   */
  peek(): T | undefined {
    return this.items[0]
  }

  /**
   * 检查队列是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取队列大小
   * @returns 队列大小
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = []
  }

  /**
   * 转换为数组
   * @returns 数组
   */
  toArray(): T[] {
    return [...this.items]
  }

  /**
   * 遍历队列
   * @param callback 回调函数
   */
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback)
  }

  /**
   * 克隆队列
   * @returns 新队列
   */
  clone(): Queue<T> {
    const newQueue = new Queue<T>()
    newQueue.items = [...this.items]
    return newQueue
  }
}

/**
 * 栈类
 */
export class Stack<T = any> {
  private items: T[] = []

  /**
   * 入栈
   * @param item 项
   */
  push(item: T): void {
    this.items.push(item)
  }

  /**
   * 出栈
   * @returns 栈顶元素
   */
  pop(): T | undefined {
    return this.items.pop()
  }

  /**
   * 查看栈顶元素
   * @returns 栈顶元素
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  /**
   * 检查栈是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取栈大小
   * @returns 栈大小
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空栈
   */
  clear(): void {
    this.items = []
  }

  /**
   * 转换为数组
   * @returns 数组
   */
  toArray(): T[] {
    return [...this.items]
  }

  /**
   * 遍历栈（从栈顶到栈底）
   * @param callback 回调函数
   */
  forEach(callback: (item: T, index: number) => void): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      callback(this.items[i]!, i)
    }
  }

  /**
   * 克隆栈
   * @returns 新栈
   */
  clone(): Stack<T> {
    const newStack = new Stack<T>()
    newStack.items = [...this.items]
    return newStack
  }
}

/**
 * 双端队列类
 */
export class Deque<T = any> {
  private items: T[] = []

  /**
   * 从队首入队
   * @param item 项
   */
  addFront(item: T): void {
    this.items.unshift(item)
  }

  /**
   * 从队尾入队
   * @param item 项
   */
  addRear(item: T): void {
    this.items.push(item)
  }

  /**
   * 从队首出队
   * @returns 队首元素
   */
  removeFront(): T | undefined {
    return this.items.shift()
  }

  /**
   * 从队尾出队
   * @returns 队尾元素
   */
  removeRear(): T | undefined {
    return this.items.pop()
  }

  /**
   * 查看队首元素
   * @returns 队首元素
   */
  peekFront(): T | undefined {
    return this.items[0]
  }

  /**
   * 查看队尾元素
   * @returns 队尾元素
   */
  peekRear(): T | undefined {
    return this.items[this.items.length - 1]
  }

  /**
   * 检查双端队列是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取双端队列大小
   * @returns 双端队列大小
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空双端队列
   */
  clear(): void {
    this.items = []
  }

  /**
   * 转换为数组
   * @returns 数组
   */
  toArray(): T[] {
    return [...this.items]
  }

  /**
   * 克隆双端队列
   * @returns 新双端队列
   */
  clone(): Deque<T> {
    const newDeque = new Deque<T>()
    newDeque.items = [...this.items]
    return newDeque
  }
}

/**
 * 优先队列项
 */
interface PriorityQueueItem<T> {
  item: T
  priority: number
}

/**
 * 优先队列类（数字越大优先级越高）
 */
export class PriorityQueue<T = any> {
  private items: PriorityQueueItem<T>[] = []

  /**
   * 入队
   * @param item 项
   * @param priority 优先级
   */
  enqueue(item: T, priority: number): void {
    const queueItem: PriorityQueueItem<T> = { item, priority }

    if (this.isEmpty()) {
      this.items.push(queueItem)
      return
    }

    // 插入到合适的位置（保持优先级排序）
    let added = false
    for (let i = 0; i < this.items.length; i++) {
      if (priority > this.items[i]!.priority) {
        this.items.splice(i, 0, queueItem)
        added = true
        break
      }
    }

    if (!added) {
      this.items.push(queueItem)
    }
  }

  /**
   * 出队
   * @returns 最高优先级元素
   */
  dequeue(): T | undefined {
    const item = this.items.shift()
    return item?.item
  }

  /**
   * 查看最高优先级元素
   * @returns 最高优先级元素
   */
  peek(): T | undefined {
    return this.items[0]?.item
  }

  /**
   * 检查优先队列是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 获取优先队列大小
   * @returns 优先队列大小
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空优先队列
   */
  clear(): void {
    this.items = []
  }

  /**
   * 转换为数组
   * @returns 数组
   */
  toArray(): T[] {
    return this.items.map(item => item.item)
  }

  /**
   * 克隆优先队列
   * @returns 新优先队列
   */
  clone(): PriorityQueue<T> {
    const newQueue = new PriorityQueue<T>()
    newQueue.items = [...this.items]
    return newQueue
  }
}

/**
 * 链表节点
 */
class LinkedListNode<T> {
  value: T
  next: LinkedListNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }
}

/**
 * 链表类
 */
export class LinkedList<T = any> {
  private head: LinkedListNode<T> | null = null
  private tail: LinkedListNode<T> | null = null
  private length = 0

  /**
   * 添加元素到链表尾部
   * @param value 值
   */
  append(value: T): void {
    const node = new LinkedListNode(value)

    if (!this.head) {
      this.head = node
      this.tail = node
    }
    else {
      this.tail!.next = node
      this.tail = node
    }

    this.length++
  }

  /**
   * 添加元素到链表头部
   * @param value 值
   */
  prepend(value: T): void {
    const node = new LinkedListNode(value)

    if (!this.head) {
      this.head = node
      this.tail = node
    }
    else {
      node.next = this.head
      this.head = node
    }

    this.length++
  }

  /**
   * 在指定位置插入元素
   * @param index 索引
   * @param value 值
   */
  insert(index: number, value: T): void {
    if (index < 0 || index > this.length) {
      throw new Error('Index out of bounds')
    }

    if (index === 0) {
      this.prepend(value)
      return
    }

    if (index === this.length) {
      this.append(value)
      return
    }

    const node = new LinkedListNode(value)
    let current: LinkedListNode<T> | null = this.head
    let prev: LinkedListNode<T> | null = null
    let currentIndex = 0

    while (currentIndex < index && current) {
      prev = current
      current = current.next
      currentIndex++
    }

    if (prev) {
      prev.next = node
      node.next = current
      this.length++
    }
  }

  /**
   * 删除指定位置的元素
   * @param index 索引
   * @returns 删除的元素值
   */
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.length || !this.head) {
      return undefined
    }

    if (index === 0) {
      const value = this.head.value
      this.head = this.head.next
      if (!this.head) {
        this.tail = null
      }
      this.length--
      return value
    }

    let current: LinkedListNode<T> | null = this.head
    let prev: LinkedListNode<T> | null = null
    let currentIndex = 0

    while (currentIndex < index && current) {
      prev = current
      current = current.next
      currentIndex++
    }

    if (prev && current) {
      prev.next = current.next
      if (!current.next) {
        this.tail = prev
      }
      this.length--
      return current.value
    }

    return undefined
  }

  /**
   * 删除指定值的元素
   * @param value 值
   * @returns 是否删除成功
   */
  remove(value: T): boolean {
    if (!this.head) {
      return false
    }

    if (this.head.value === value) {
      this.head = this.head.next
      if (!this.head) {
        this.tail = null
      }
      this.length--
      return true
    }

    let current: LinkedListNode<T> | null = this.head
    let prev: LinkedListNode<T> | null = null

    while (current && current.value !== value) {
      prev = current
      current = current.next
    }

    if (current && prev) {
      prev.next = current.next
      if (!current.next) {
        this.tail = prev
      }
      this.length--
      return true
    }

    return false
  }

  /**
   * 查找指定值的索引
   * @param value 值
   * @returns 索引，未找到返回 -1
   */
  indexOf(value: T): number {
    let current: LinkedListNode<T> | null = this.head
    let index = 0

    while (current) {
      if (current.value === value) {
        return index
      }
      current = current.next
      index++
    }

    return -1
  }

  /**
   * 获取指定位置的元素
   * @param index 索引
   * @returns 元素值
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this.length) {
      return undefined
    }

    let current: LinkedListNode<T> | null = this.head
    let currentIndex = 0

    while (current && currentIndex < index) {
      current = current.next
      currentIndex++
    }

    return current?.value
  }

  /**
   * 检查链表是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    return this.length === 0
  }

  /**
   * 获取链表大小
   * @returns 链表大小
   */
  size(): number {
    return this.length
  }

  /**
   * 清空链表
   */
  clear(): void {
    this.head = null
    this.tail = null
    this.length = 0
  }

  /**
   * 转换为数组
   * @returns 数组
   */
  toArray(): T[] {
    const array: T[] = []
    let current: LinkedListNode<T> | null = this.head

    while (current) {
      array.push(current.value)
      current = current.next
    }

    return array
  }

  /**
   * 遍历链表
   * @param callback 回调函数
   */
  forEach(callback: (value: T, index: number) => void): void {
    let current: LinkedListNode<T> | null = this.head
    let index = 0

    while (current) {
      callback(current.value, index)
      current = current.next
      index++
    }
  }

  /**
   * 反转链表
   */
  reverse(): void {
    if (!this.head || !this.head.next) {
      return
    }

    let prev: LinkedListNode<T> | null = null
    let current: LinkedListNode<T> | null = this.head
    this.tail = this.head

    while (current) {
      const next: LinkedListNode<T> | null = current.next
      current.next = prev
      prev = current
      current = next
    }

    this.head = prev
  }
}

/**
 * 树节点
 */
export class TreeNode<T = any> {
  value: T
  children: TreeNode<T>[] = []
  parent: TreeNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }

  /**
   * 添加子节点
   * @param child 子节点
   */
  addChild(child: TreeNode<T>): void {
    child.parent = this
    this.children.push(child)
  }

  /**
   * 移除子节点
   * @param child 子节点
   */
  removeChild(child: TreeNode<T>): void {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      child.parent = null
    }
  }

  /**
   * 检查是否为叶子节点
   * @returns 是否为叶子节点
   */
  isLeaf(): boolean {
    return this.children.length === 0
  }

  /**
   * 检查是否为根节点
   * @returns 是否为根节点
   */
  isRoot(): boolean {
    return this.parent === null
  }

  /**
   * 获取深度
   * @returns 深度
   */
  depth(): number {
    let depth = 0
    let current: TreeNode<T> | null = this.parent

    while (current) {
      depth++
      current = current.parent
    }

    return depth
  }
}

/**
 * 二叉树节点
 */
export class BinaryTreeNode<T = any> {
  value: T
  left: BinaryTreeNode<T> | null = null
  right: BinaryTreeNode<T> | null = null
  parent: BinaryTreeNode<T> | null = null

  constructor(value: T) {
    this.value = value
  }

  /**
   * 检查是否为叶子节点
   * @returns 是否为叶子节点
   */
  isLeaf(): boolean {
    return this.left === null && this.right === null
  }

  /**
   * 检查是否为根节点
   * @returns 是否为根节点
   */
  isRoot(): boolean {
    return this.parent === null
  }

  /**
   * 获取高度
   * @returns 高度
   */
  height(): number {
    if (this.isLeaf()) {
      return 0
    }

    const leftHeight = this.left ? this.left.height() : -1
    const rightHeight = this.right ? this.right.height() : -1

    return Math.max(leftHeight, rightHeight) + 1
  }
}

/**
 * LRU 缓存
 */
export class LRUCache<K = any, V = any> {
  private capacity: number
  private cache = new Map<K, V>()

  constructor(capacity: number) {
    this.capacity = capacity
  }

  /**
   * 获取缓存值
   * @param key 键
   * @returns 值
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }

    // 更新访问顺序
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  /**
   * 设置缓存值
   * @param key 键
   * @param value 值
   */
  set(key: K, value: V): void {
    // 如果键已存在，删除旧的
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 如果达到容量上限，删除最久未使用的
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value as K | undefined
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    // 添加新值
    this.cache.set(key, value)
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @returns 是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * 删除缓存值
   * @param key 键
   * @returns 是否删除成功
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   * @returns 缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   * @returns 键数组
   */
  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取所有值
   * @returns 值数组
   */
  values(): V[] {
    return Array.from(this.cache.values())
  }

  /**
   * 获取所有条目
   * @returns 条目数组
   */
  entries(): Array<[K, V]> {
    return Array.from(this.cache.entries())
  }
}



