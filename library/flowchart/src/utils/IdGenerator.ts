/**
 * ID生成器 - 生成唯一ID
 */

export class IdGenerator {
  private static counter = 0;
  private static prefix = 'fc';

  /**
   * 生成节点ID
   */
  static genNodeId(): string {
    return `${this.prefix}-node-${++this.counter}`;
  }

  /**
   * 生成边ID
   */
  static genEdgeId(): string {
    return `${this.prefix}-edge-${++this.counter}`;
  }

  /**
   * 生成通用ID
   */
  static genId(type?: string): string {
    const typeStr = type ? `-${type}` : '';
    return `${this.prefix}${typeStr}-${++this.counter}`;
  }

  /**
   * 生成UUID
   */
  static genUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 重置计数器
   */
  static reset(): void {
    this.counter = 0;
  }

  /**
   * 设置前缀
   */
  static setPrefix(prefix: string): void {
    this.prefix = prefix;
  }
}


