/**
 * UUID 生成工具
 */

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'comp'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成短 ID
 */
export function generateShortId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * 生成 UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成数字 ID
 */
export function generateNumericId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * 检查是否为有效 ID
 */
export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}



