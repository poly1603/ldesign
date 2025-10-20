/**
 * 优化的 Trie 树实现 - 减少内存占用
 */

import type { RouteRecordNormalized } from '../../types'

// 位标记常量
const FLAG_HAS_CHILDREN = 0x01
const FLAG_HAS_PARAM = 0x02
const FLAG_HAS_WILDCARD = 0x04
const FLAG_IS_OPTIONAL = 0x08
const FLAG_HAS_RECORD = 0x10
const FLAG_HAS_DEFAULT = 0x20

/**
 * 优化的 Trie 节点 - 内存占用从 ~100 bytes 减少到 ~40 bytes
 */
export class OptimizedTrieNode {
  // 使用单个数字存储所有布尔标记
  private flags: number = 0
  
  // 使用 Uint16Array 存储统计数据（更省内存）
  private stats: Uint16Array = new Uint16Array(2) // [weight, accessCount]
  
  // 延迟初始化的数据对象
  private data?: {
    children?: Map<string, OptimizedTrieNode>
    paramChild?: OptimizedTrieNode
    paramName?: string
    wildcardChild?: OptimizedTrieNode
    record?: RouteRecordNormalized
    defaultChild?: RouteRecordNormalized
  }
  
  // Getter/Setter 方法
  get hasChildren(): boolean {
    return (this.flags & FLAG_HAS_CHILDREN) !== 0
  }
  
  get children(): Map<string, OptimizedTrieNode> {
    if (!this.data?.children) {
      if (!this.data) this.data = {}
      this.data.children = new Map()
      this.flags |= FLAG_HAS_CHILDREN
    }
    return this.data.children
  }
  
  get paramChild(): OptimizedTrieNode | undefined {
    return this.data?.paramChild
  }
  
  set paramChild(child: OptimizedTrieNode | undefined) {
    if (!this.data) this.data = {}
    this.data.paramChild = child
    if (child) {
      this.flags |= FLAG_HAS_PARAM
    } else {
      this.flags &= ~FLAG_HAS_PARAM
    }
  }
  
  get paramName(): string | undefined {
    return this.data?.paramName
  }
  
  set paramName(name: string | undefined) {
    if (!this.data) this.data = {}
    this.data.paramName = name
  }
  
  get wildcardChild(): OptimizedTrieNode | undefined {
    return this.data?.wildcardChild
  }
  
  set wildcardChild(child: OptimizedTrieNode | undefined) {
    if (!this.data) this.data = {}
    this.data.wildcardChild = child
    if (child) {
      this.flags |= FLAG_HAS_WILDCARD
    } else {
      this.flags &= ~FLAG_HAS_WILDCARD
    }
  }
  
  get record(): RouteRecordNormalized | undefined {
    return this.data?.record
  }
  
  set record(record: RouteRecordNormalized | undefined) {
    if (!this.data) this.data = {}
    this.data.record = record
    if (record) {
      this.flags |= FLAG_HAS_RECORD
    } else {
      this.flags &= ~FLAG_HAS_RECORD
    }
  }
  
  get defaultChild(): RouteRecordNormalized | undefined {
    return this.data?.defaultChild
  }
  
  set defaultChild(child: RouteRecordNormalized | undefined) {
    if (!this.data) this.data = {}
    this.data.defaultChild = child
    if (child) {
      this.flags |= FLAG_HAS_DEFAULT
    } else {
      this.flags &= ~FLAG_HAS_DEFAULT
    }
  }
  
  get isOptional(): boolean {
    return (this.flags & FLAG_IS_OPTIONAL) !== 0
  }
  
  set isOptional(value: boolean) {
    if (value) {
      this.flags |= FLAG_IS_OPTIONAL
    } else {
      this.flags &= ~FLAG_IS_OPTIONAL
    }
  }
  
  get weight(): number {
    return this.stats[0] ?? 0
  }
  
  set weight(value: number) {
    this.stats[0] = Math.min(value, 65535) // Uint16 最大值
  }
  
  get accessCount(): number {
    return this.stats[1] ?? 0
  }
  
  set accessCount(value: number) {
    this.stats[1] = Math.min(value, 65535)
  }
  
  // 内存优化：清理未使用的数据
  compact(): void {
    if (this.data) {
      // 清理空的子节点映射
      if (this.data.children?.size === 0) {
        delete this.data.children
        this.flags &= ~FLAG_HAS_CHILDREN
      }
      
      // 如果 data 对象为空，删除它
      if (Object.keys(this.data).length === 0) {
        delete this.data
      }
    }
  }
  
  // 获取内存占用估算
  getMemorySize(): number {
    let size = 4 + 4 // flags + stats array
    
    if (this.data) {
      size += 8 // object reference
      
      if (this.data.children) {
        size += 40 + this.data.children.size * 32
      }
      
      if (this.data.paramName) {
        size += this.data.paramName.length * 2 + 24
      }
      
      if (this.data.paramChild) size += 8
      if (this.data.wildcardChild) size += 8
      if (this.data.record) size += 8
      if (this.data.defaultChild) size += 8
    }
    
    return size
  }
}

/**
 * 字符串内存池 - 避免重复字符串占用内存
 */
export class StringPool {
  private pool = new Map<string, string>()
  private maxSize = 1000
  
  /**
   * 获取内部化的字符串
   */
  intern(str: string): string {
    if (!str) return str
    
    let interned = this.pool.get(str)
    if (!interned) {
      // 限制池大小
      if (this.pool.size >= this.maxSize) {
        // 清理最早的 10% 条目
        const keysToDelete = Array.from(this.pool.keys()).slice(0, this.maxSize / 10)
        keysToDelete.forEach(key => this.pool.delete(key))
      }
      
      this.pool.set(str, str)
      interned = str
    }
    
    return interned
  }
  
  clear(): void {
    this.pool.clear()
  }
  
  getSize(): number {
    return this.pool.size
  }
}

/**
 * 路径构建器 - 优化字符串拼接
 */
export class PathBuilder {
  private segments: string[] = []
  private cached: string | null = null
  
  add(segment: string): this {
    this.segments.push(segment)
    this.cached = null
    return this
  }
  
  addAll(segments: string[]): this {
    this.segments.push(...segments)
    this.cached = null
    return this
  }
  
  clear(): this {
    this.segments.length = 0
    this.cached = null
    return this
  }
  
  toString(): string {
    if (this.cached === null) {
      this.cached = `/${  this.segments.filter(Boolean).join('/')}`
    }
    return this.cached
  }
  
  getSegments(): string[] {
    return this.segments.slice()
  }
}

/**
 * 对象池 - 复用频繁创建的对象
 */
export class ObjectPool<T extends object> {
  private pool: T[] = []
  private inUse = new WeakSet<T>()
  
  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    initialSize = 10,
    private maxSize = 100
  ) {
    // 预分配对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
    }
  }
  
  acquire(): T {
    let obj = this.pool.pop()
    
    if (!obj) {
      obj = this.factory()
    }
    
    this.inUse.add(obj as any)
    return obj
  }
  
  release(obj: T): void {
    if (!this.inUse.has(obj as any)) {
      console.warn('Attempting to release object not from this pool')
      return
    }
    
    this.inUse.delete(obj as any)
    this.reset(obj)
    
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    }
  }
  
  clear(): void {
    this.pool.forEach(obj => this.reset(obj))
    this.pool.length = 0
  }
  
  getPoolSize(): number {
    return this.pool.length
  }
}

/**
 * 内存监控器
 */
export class MemoryMonitor {
  private measurements: Array<{ timestamp: number; memory: number }> = []
  private maxMeasurements = 100
  
  measure(): number {
    const memory = typeof performance !== 'undefined' && 'memory' in performance
      ? (performance as any).memory.usedJSHeapSize
      : 0
    
    this.measurements.push({
      timestamp: Date.now(),
      memory
    })
    
    // 限制历史记录大小
    if (this.measurements.length > this.maxMeasurements) {
      this.measurements.shift()
    }
    
    return memory
  }
  
  getStats() {
    if (this.measurements.length === 0) {
      return { current: 0, average: 0, peak: 0, trend: 0 }
    }
    
    const memories = this.measurements.map(m => m.memory)
    const current = memories[memories.length - 1]
    const average = memories.reduce((a, b) => a + b, 0) / memories.length
    const peak = Math.max(...memories)
    
    // 计算趋势（最近10个测量值的斜率）
    const recent = memories.slice(-10)
    let trend = 0
    if (recent.length > 1) {
      const firstHalf = recent.slice(0, recent.length / 2)
      const secondHalf = recent.slice(recent.length / 2)
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      trend = secondAvg - firstAvg
    }
    
    return { current, average, peak, trend }
  }
  
  clear(): void {
    this.measurements.length = 0
  }
}