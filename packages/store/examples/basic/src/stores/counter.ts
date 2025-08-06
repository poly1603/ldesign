import { Action, BaseStore, Getter, State } from '@ldesign/store'

export class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @State({ default: 'My Counter' })
  title: string = 'My Counter'

  @State({ default: 1 })
  step: number = 1

  constructor(id: string = 'counter') {
    super(id)
  }

  @Action()
  increment() {
    this.count += this.step
  }

  @Action()
  decrement() {
    this.count -= this.step
  }

  @Action()
  reset() {
    this.count = 0
  }

  @Action()
  setStep(newStep: number) {
    this.step = Math.max(1, newStep)
  }

  @Getter()
  get displayText() {
    return `${this.title}: ${this.count}`
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }

  @Getter()
  get isNegative() {
    return this.count < 0
  }

  @Getter()
  get absoluteValue() {
    return Math.abs(this.count)
  }
}
