/**
 * Button 组件工具函数
 */

import { LoadingConfig } from './interface';

/**
 * 检查是否包含两个中文字符
 * @param str 待检查的字符串
 * @returns 是否包含两个中文字符
 */
export function isTwoCNChar(str: string): boolean {
  // 使用更准确的中文字符范围
  const cnCharReg = /[\u4e00-\u9fa5]/;
  const chars = str.split('');
  
  // 检查是否恰好两个字符，且都是中文
  return chars.length === 2 && chars.every(char => cnCharReg.test(char));
}

/**
 * 在按钮子节点之间插入空格
 * @param children 子节点
 * @param needInsertSpace 是否需要插入空格
 * @returns 处理后的子节点
 */
export function spaceChildren(children: any, needInsertSpace: boolean): any {
  if (!needInsertSpace) {
    return children;
  }
  
  // 如果是文本节点且包含两个中文字符，在中间插入空格
  if (typeof children === 'string' && isTwoCNChar(children)) {
    const chars = children.split('');
    return chars.join(' ');
  }
  
  return children;
}

/**
 * 获取加载配置
 * @param loading 加载状态或配置
 * @returns 标准化的加载配置
 */
export function getLoadingConfig(loading: boolean | { delay?: number } | undefined): LoadingConfig {
  if (typeof loading === 'object' && loading) {
    const delay = typeof loading.delay === 'number' && !Number.isNaN(loading.delay) 
      ? loading.delay 
      : 0;
      
    return {
      loading: delay <= 0,
      delay,
    };
  }
  
  return {
    loading: !!loading,
    delay: 0,
  };
}

/**
 * 判断是否为链接类型的按钮（无边框类型）
 * @param type 按钮类型
 * @returns 是否为无边框按钮
 */
export function isUnBorderedButtonType(type?: string): boolean {
  return type === 'text' || type === 'link';
}

/**
 * 获取按钮的尺寸类名后缀
 * @param size 按钮尺寸
 * @returns 尺寸类名后缀
 */
export function getSizeSuffix(size?: string): string {
  const sizeMap: Record<string, string> = {
    large: 'lg',
    small: 'sm',
    middle: 'md',
  };
  
  return size ? (sizeMap[size] || '') : '';
}

/**
 * 组合类名
 * @param classNames 类名数组
 * @returns 组合后的类名字符串
 */
export function combineClasses(...classNames: (string | undefined | false | null)[]): string {
  return classNames
    .filter(Boolean)
    .join(' ')
    .trim();
}