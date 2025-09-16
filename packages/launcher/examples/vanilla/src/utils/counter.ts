export class CounterManager {
  private count: number = 0;
  private readonly storageKey = 'vanilla-counter';
  private step: number;

  constructor(step: number = 1) {
    this.step = step;
    this.loadFromStorage();
  }

  public increment(): number {
    this.count += this.step;
    this.saveToStorage();
    return this.count;
  }

  public decrement(): number {
    this.count = Math.max(0, this.count - 1);
    this.saveToStorage();
    return this.count;
  }

  public reset(): number {
    this.count = 0;
    this.saveToStorage();
    return this.count;
  }

  public getCount(): number {
    return this.count;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.count = parseInt(stored, 10) || 0;
      }
    } catch (error) {
      console.warn('无法从本地存储加载计数器数据:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, this.count.toString());
    } catch (error) {
      console.warn('无法保存计数器数据到本地存储:', error);
    }
  }
}
