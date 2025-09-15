/**
 * 简单的令牌桶限流器
 */
export class RateLimiter {
  private tokens: number
  private lastRefill: number
  private waiters: Array<() => void> = []

  constructor(private capacity: number, private tokensPerInterval: number, private intervalMs: number) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  private refill() {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed <= 0) return
    const add = Math.floor((elapsed / this.intervalMs) * this.tokensPerInterval)
    if (add > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + add)
      this.lastRefill = now
    }
  }

  async acquire(): Promise<void> {
    this.refill()
    if (this.tokens > 0) {
      this.tokens -= 1
      return
    }
    await new Promise<void>((resolve) => {
      const tryAcquire = () => {
        this.refill()
        if (this.tokens > 0) {
          this.tokens -= 1
          resolve()
        }
        else {
          setTimeout(tryAcquire, this.intervalMs / Math.max(1, this.tokensPerInterval))
        }
      }
      this.waiters.push(tryAcquire)
      // 触发一次队列
      setTimeout(() => {
        const fn = this.waiters.shift()
        fn && fn()
      }, 0)
    })
  }
}
