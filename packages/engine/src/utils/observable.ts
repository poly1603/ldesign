/**
 * 响应式数据流工具
 * 📊 提供Observable、Subject、BehaviorSubject等响应式编程模式
 */

/**
 * 观察者接口
 */
export interface Observer<T> {
  next: (value: T) => void
  error?: (error: Error) => void
  complete?: () => void
}

/**
 * 订阅对象
 */
export interface Subscription {
  unsubscribe: () => void
  closed: boolean
}

/**
 * 订阅函数类型
 */
export type SubscriberFunction<T> = (observer: Observer<T>) => TeardownLogic

/**
 * 清理逻辑类型
 */
export type TeardownLogic = (() => void) | Subscription | void

/**
 * 操作符类型
 */
export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>

/**
 * Observable基础实现
 */
export class Observable<T> {
  constructor(private subscriberFn: SubscriberFunction<T>) {}

  /**
   * 订阅Observable
   */
  subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void),
    error?: (error: Error) => void,
    complete?: () => void
  ): Subscription {
    const observer: Observer<T> = this.normalizeObserver(observerOrNext, error, complete)

    let closed = false
    let teardown: TeardownLogic

    const subscription: Subscription = {
      unsubscribe: () => {
        if (closed) return
        closed = true

        if (typeof teardown === 'function') {
          teardown()
        } else if (teardown && typeof teardown.unsubscribe === 'function') {
          teardown.unsubscribe()
        }
      },
      get closed() {
        return closed
      },
    }

    try {
      teardown = this.subscriberFn({
        next: (value: T) => {
          if (!closed) {
            observer.next(value)
          }
        },
        error: (err: Error) => {
          if (!closed) {
            closed = true
            observer.error?.(err)
          }
        },
        complete: () => {
          if (!closed) {
            closed = true
            observer.complete?.()
          }
        },
      })
    } catch (err) {
      observer.error?.(err as Error)
    }

    return subscription
  }

  /**
   * 应用操作符
   */
  pipe(): Observable<T>
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>
  pipe(...operators: Array<OperatorFunction<unknown, unknown>>): Observable<unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pipe(...operators: Array<OperatorFunction<any, any>>): Observable<any> {
    if (operators.length === 0) {
      return this
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return operators.reduce((source: any, operator: any) => operator(source), this)
  }

  /**
   * 转换为Promise
   */
  toPromise(): Promise<T> {
    return new Promise((resolve, reject) => {
      let lastValue: T | undefined

      this.subscribe({
        next: (value) => {
          lastValue = value
        },
        error: reject,
        complete: () => {
          resolve(lastValue!)
        },
      })
    })
  }

  /**
   * 标准化观察者
   */
  private normalizeObserver(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void),
    error?: (error: Error) => void,
    complete?: () => void
  ): Observer<T> {
    if (typeof observerOrNext === 'function') {
      return {
        next: observerOrNext,
        error,
        complete,
      }
    }

    return {
      next: observerOrNext?.next || (() => {}),
      error: observerOrNext?.error || error,
      complete: observerOrNext?.complete || complete,
    }
  }

  /**
   * 创建Observable
   */
  static create<T>(subscriberFn: SubscriberFunction<T>): Observable<T> {
    return new Observable(subscriberFn)
  }

  /**
   * 从数组创建
   */
  static from<T>(values: T[]): Observable<T> {
    return new Observable(observer => {
      for (const value of values) {
        observer.next(value)
      }
      observer.complete?.()
    })
  }

  /**
   * 从单个值创建
   */
  static of<T>(...values: T[]): Observable<T> {
    return Observable.from(values)
  }

  /**
   * 创建定时器
   */
  static timer(delay: number): Observable<number> {
    return new Observable(observer => {
      const timeoutId = setTimeout(() => {
        observer.next(0)
        observer.complete?.()
      }, delay)

      return () => clearTimeout(timeoutId)
    })
  }

  /**
   * 创建间隔Observable
   */
  static interval(period: number): Observable<number> {
    return new Observable(observer => {
      let count = 0
      const intervalId = setInterval(() => {
        observer.next(count++)
      }, period)

      return () => clearInterval(intervalId)
    })
  }

  /**
   * 从Promise创建
   */
  static fromPromise<T>(promise: Promise<T>): Observable<T> {
    return new Observable(observer => {
      promise
        .then(value => {
          observer.next(value)
          observer.complete?.()
        })
        .catch(error => {
          observer.error?.(error)
        })
    })
  }

  /**
   * 从事件创建
   */
  static fromEvent<T>(target: EventTarget, eventName: string): Observable<T> {
    return new Observable(observer => {
      const handler = (event: Event) => {
        observer.next(event as T)
      }

      target.addEventListener(eventName, handler)

      return () => {
        target.removeEventListener(eventName, handler)
      }
    })
  }

  /**
   * 合并多个Observable
   */
  static merge<T>(...observables: Observable<T>[]): Observable<T> {
    return new Observable(observer => {
      const subscriptions = observables.map(obs =>
        obs.subscribe({
          next: value => observer.next(value),
          error: err => observer.error?.(err),
          complete: () => {
            // 只有当所有Observable都完成时才完成
            if (subscriptions.every(sub => sub.closed)) {
              observer.complete?.()
            }
          },
        })
      )

      return () => {
        subscriptions.forEach(sub => sub.unsubscribe())
      }
    })
  }

  /**
   * 组合多个Observable的最新值
   */
  static combineLatest<T>(...observables: Observable<T>[]): Observable<T[]> {
    return new Observable(observer => {
      const values: T[] = Array.from({ length: observables.length })
      const hasValue: boolean[] = Array.from({ length: observables.length }).fill(false)
      let completed = 0

      const subscriptions = observables.map((obs, index) =>
        obs.subscribe({
          next: value => {
            values[index] = value
            hasValue[index] = true

            if (hasValue.every(Boolean)) {
              observer.next([...values])
            }
          },
          error: err => observer.error?.(err),
          complete: () => {
            completed++
            if (completed === observables.length) {
              observer.complete?.()
            }
          },
        })
      )

      return () => {
        subscriptions.forEach(sub => sub.unsubscribe())
      }
    })
  }
}

/**
 * Subject类 - 既是Observable也是Observer
 */
export class Subject<T> extends Observable<T> implements Observer<T> {
  private observers: Observer<T>[] = []
  private isStopped = false
  private hasError = false
  private thrownError?: Error

  constructor() {
    super(observer => {
      if (this.hasError) {
        observer.error?.(this.thrownError!)
        return
      }

      if (this.isStopped) {
        observer.complete?.()
        return
      }

      this.observers.push(observer)

      return () => {
        const index = this.observers.indexOf(observer)
        if (index > -1) {
          this.observers.splice(index, 1)
        }
      }
    })
  }

  /**
   * 发送下一个值
   */
  next(value: T): void {
    if (this.isStopped) return

    for (const observer of [...this.observers]) {
      observer.next(value)
    }
  }

  /**
   * 发送错误
   */
  error(error: Error): void {
    if (this.isStopped) return

    this.hasError = true
    this.thrownError = error
    this.isStopped = true

    for (const observer of [...this.observers]) {
      observer.error?.(error)
    }

    this.observers = []
  }

  /**
   * 完成
   */
  complete(): void {
    if (this.isStopped) return

    this.isStopped = true

    for (const observer of [...this.observers]) {
      observer.complete?.()
    }

    this.observers = []
  }

  /**
   * 转换为Observable
   */
  asObservable(): Observable<T> {
    return new Observable(observer => this.subscribe(observer))
  }

  /**
   * 获取观察者数量
   */
  getObserverCount(): number {
    return this.observers.length
  }
}

/**
 * BehaviorSubject - 保存当前值的Subject
 */
export class BehaviorSubject<T> extends Subject<T> {
  constructor(private _value: T) {
    super()
  }

  /**
   * 获取当前值
   */
  get value(): T {
    return this._value
  }

  /**
   * 发送下一个值
   */
  next(value: T): void {
    this._value = value
    super.next(value)
  }

  /**
   * 订阅（立即发送当前值）
   */
  subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void),
    error?: (error: Error) => void,
    complete?: () => void
  ): Subscription {
    const subscription = super.subscribe(observerOrNext, error, complete)

    // 立即发送当前值
    const observer = this.normalizeObserver(observerOrNext, error, complete)
    observer.next(this._value)

    return subscription
  }
}

/**
 * ReplaySubject - 缓存历史值的Subject
 */
export class ReplaySubject<T> extends Subject<T> {
  private buffer: T[] = []

  constructor(private bufferSize: number = Infinity, private windowTime: number = Infinity) {
    super()
  }

  /**
   * 发送下一个值
   */
  next(value: T): void {
    this.buffer.push(value)

    // 限制缓冲区大小
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift()
    }

    super.next(value)
  }

  /**
   * 订阅（重放历史值）
   */
  subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void),
    error?: (error: Error) => void,
    complete?: () => void
  ): Subscription {
    const observer = this.normalizeObserver(observerOrNext, error, complete)

    // 重放缓冲区中的值
    for (const value of this.buffer) {
      observer.next(value)
    }

    return super.subscribe(observer)
  }

  /**
   * 获取缓冲区
   */
  getBuffer(): T[] {
    return [...this.buffer]
  }
}

/**
 * AsyncSubject - 只在完成时发送最后一个值
 */
export class AsyncSubject<T> extends Subject<T> {
  private lastValue?: T
  private hasValue = false

  /**
   * 发送下一个值
   */
  next(value: T): void {
    if (!this.isStopped) {
      this.lastValue = value
      this.hasValue = true
    }
  }

  /**
   * 完成（发送最后一个值）
   */
  complete(): void {
    if (this.hasValue) {
      super.next(this.lastValue!)
    }
    super.complete()
  }
}

/**
 * 常用操作符
 */
export const operators = {
  /**
   * map操作符 - 转换值
   */
  map<T, R>(transform: (value: T) => R): OperatorFunction<T, R> {
    return (source: Observable<T>) =>
      new Observable<R>(observer =>
        source.subscribe({
          next: value => observer.next(transform(value)),
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })
      )
  },

  /**
   * filter操作符 - 过滤值
   */
  filter<T>(predicate: (value: T) => boolean): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer =>
        source.subscribe({
          next: value => {
            if (predicate(value)) {
              observer.next(value)
            }
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })
      )
  },

  /**
   * take操作符 - 只取前N个值
   */
  take<T>(count: number): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        let taken = 0
        const subscription = source.subscribe({
          next: value => {
            if (taken < count) {
              observer.next(value)
              taken++

              if (taken === count) {
                observer.complete?.()
                subscription.unsubscribe()
              }
            }
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })

        return subscription
      })
  },

  /**
   * skip操作符 - 跳过前N个值
   */
  skip<T>(count: number): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        let skipped = 0
        return source.subscribe({
          next: value => {
            if (skipped >= count) {
              observer.next(value)
            } else {
              skipped++
            }
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })
      })
  },

  /**
   * debounceTime操作符 - 防抖
   */
  debounceTime<T>(delay: number): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        let timeoutId: NodeJS.Timeout | undefined
        let lastValue: T

        const subscription = source.subscribe({
          next: value => {
            lastValue = value

            if (timeoutId) {
              clearTimeout(timeoutId)
            }

            timeoutId = setTimeout(() => {
              observer.next(lastValue)
              timeoutId = undefined
            }, delay)
          },
          error: err => observer.error?.(err),
          complete: () => {
            if (timeoutId) {
              clearTimeout(timeoutId)
              observer.next(lastValue)
            }
            observer.complete?.()
          },
        })

        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          subscription.unsubscribe()
        }
      })
  },

  /**
   * throttleTime操作符 - 节流
   */
  throttleTime<T>(delay: number): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        let lastEmitTime = 0

        return source.subscribe({
          next: value => {
            const now = Date.now()

            if (now - lastEmitTime >= delay) {
              observer.next(value)
              lastEmitTime = now
            }
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })
      })
  },

  /**
   * distinctUntilChanged操作符 - 去重连续相同值
   */
  distinctUntilChanged<T>(compareFn?: (prev: T, curr: T) => boolean): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        let hasValue = false
        let lastValue: T

        return source.subscribe({
          next: value => {
            const shouldEmit = !hasValue || (compareFn ? !compareFn(lastValue, value) : lastValue !== value)

            if (shouldEmit) {
              hasValue = true
              lastValue = value
              observer.next(value)
            }
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })
      })
  },

  /**
   * switchMap操作符 - 切换到新的Observable
   */
  switchMap<T, R>(project: (value: T) => Observable<R>): OperatorFunction<T, R> {
    return (source: Observable<T>) =>
      new Observable<R>(observer => {
        let innerSubscription: Subscription | undefined

        const outerSubscription = source.subscribe({
          next: value => {
            // 取消之前的内���订阅
            if (innerSubscription) {
              innerSubscription.unsubscribe()
            }

            // 订阅新的Observable
            innerSubscription = project(value).subscribe({
              next: innerValue => observer.next(innerValue),
              error: err => observer.error?.(err),
            })
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })

        return () => {
          outerSubscription.unsubscribe()
          innerSubscription?.unsubscribe()
        }
      })
  },

  /**
   * mergeMap操作符 - 并发处理多个Observable
   */
  mergeMap<T, R>(project: (value: T) => Observable<R>, concurrent = Infinity): OperatorFunction<T, R> {
    return (source: Observable<T>) =>
      new Observable<R>(observer => {
        const subscriptions = new Set<Subscription>()
        let activeCount = 0
        let completed = false

        const checkComplete = () => {
          if (completed && activeCount === 0) {
            observer.complete?.()
          }
        }

        const outerSubscription = source.subscribe({
          next: value => {
            if (activeCount < concurrent) {
              activeCount++

              const innerSubscription = project(value).subscribe({
                next: innerValue => observer.next(innerValue),
                error: err => observer.error?.(err),
                complete: () => {
                  activeCount--
                  subscriptions.delete(innerSubscription)
                  checkComplete()
                },
              })

              subscriptions.add(innerSubscription)
            }
          },
          error: err => observer.error?.(err),
          complete: () => {
            completed = true
            checkComplete()
          },
        })

        return () => {
          outerSubscription.unsubscribe()
          subscriptions.forEach(sub => sub.unsubscribe())
        }
      })
  },

  /**
   * catchError操作符 - 捕获错误
   */
  catchError<T>(handler: (error: Error) => Observable<T>): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        return source.subscribe({
          next: value => observer.next(value),
          error: err => {
            try {
              const recoveryObservable = handler(err)
              recoveryObservable.subscribe(observer)
            } catch (innerErr) {
              observer.error?.(innerErr as Error)
            }
          },
          complete: () => observer.complete?.(),
        })
      })
  },

  /**
   * retry操作符 - 重试
   */
  retry<T>(count = 3): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer => {
        let attempts = 0

        const subscribe = () => {
          source.subscribe({
            next: value => observer.next(value),
            error: err => {
              attempts++
              if (attempts < count) {
                subscribe()
              } else {
                observer.error?.(err)
              }
            },
            complete: () => observer.complete?.(),
          })
        }

        subscribe()
      })
  },

  /**
   * tap操作符 - 副作用
   */
  tap<T>(fn: (value: T) => void): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
      new Observable<T>(observer =>
        source.subscribe({
          next: value => {
            fn(value)
            observer.next(value)
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })
      )
  },

  /**
   * scan操作符 - 累加
   */
  scan<T, R>(accumulator: (acc: R, value: T) => R, seed: R): OperatorFunction<T, R> {
    return (source: Observable<T>) =>
      new Observable<R>(observer => {
        let acc = seed

        return source.subscribe({
          next: value => {
            acc = accumulator(acc, value)
            observer.next(acc)
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        })
      })
  },
}

/**
 * 创建响应式数据流
 */
export function createObservable<T>(subscriberFn: SubscriberFunction<T>): Observable<T> {
  return new Observable(subscriberFn)
}

/**
 * 创建Subject
 */
export function createSubject<T>(): Subject<T> {
  return new Subject<T>()
}

/**
 * 创建BehaviorSubject
 */
export function createBehaviorSubject<T>(initialValue: T): BehaviorSubject<T> {
  return new BehaviorSubject<T>(initialValue)
}

/**
 * 创建ReplaySubject
 */
export function createReplaySubject<T>(bufferSize?: number, windowTime?: number): ReplaySubject<T> {
  return new ReplaySubject<T>(bufferSize, windowTime)
}

/**
 * 创建AsyncSubject
 */
export function createAsyncSubject<T>(): AsyncSubject<T> {
  return new AsyncSubject<T>()
}
