export type Listener<T = any> = (payload: T) => void

export class EventEmitter<T = any> {
  private events = new Map<string, Set<Listener<T>>>()

  on(event: string, listener: Listener<T>) {
    if (!this.events.has(event)) this.events.set(event, new Set())
    this.events.get(event)!.add(listener)
    return () => this.off(event, listener)
  }

  off(event: string, listener: Listener<T>) {
    this.events.get(event)?.delete(listener)
  }

  once(event: string, listener: Listener<T>) {
    const wrapper: Listener<T> = (payload) => {
      listener(payload)
      this.off(event, wrapper)
    }
    return this.on(event, wrapper)
  }

  emit(event: string, payload: T) {
    this.events.get(event)?.forEach((l) => l(payload))
  }
}

