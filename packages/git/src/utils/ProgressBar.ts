/**
 * 进度条工具类
 * 提供各种进度显示功能
 */

import cliProgress from 'cli-progress'
import chalk from 'chalk'

export class ProgressBar {
  private bar: any
  private multiBar?: any

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.bar = new (cliProgress as any).SingleBar({
      format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} | {task}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    })
  }

  /**
   * 开始进度条
   */
  start(total: number, initial: number = 0, payload?: any): void {
    this.bar.start(total, initial, payload)
  }

  /**
   * 更新进度
   */
  update(value: number, payload?: any): void {
    this.bar.update(value, payload)
  }

  /**
   * 增加进度
   */
  increment(delta: number = 1, payload?: any): void {
    this.bar.increment(delta, payload)
  }

  /**
   * 停止进度条
   */
  stop(): void {
    this.bar.stop()
  }

  /**
   * 创建多进度条
   */
  createMultiBar(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.multiBar = new (cliProgress as any).MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: chalk.cyan('{bar}') + ' | {percentage}% | {name}'
    })
    return this.multiBar
  }

  /**
   * 添加子进度条
   */
  addBar(total: number, initial: number = 0): any {
    if (!this.multiBar) {
      this.createMultiBar()
    }
    return this.multiBar!.create(total, initial)
  }
}
