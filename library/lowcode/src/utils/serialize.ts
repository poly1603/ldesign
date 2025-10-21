/**
 * 序列化工具
 */

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * JSON 安全序列化
 */
export function safeStringify(obj: any, space?: number): string {
  try {
    return JSON.stringify(obj, null, space);
  } catch (error) {
    console.error('序列化失败:', error);
    return '{}';
  }
}

/**
 * JSON 安全解析
 */
export function safeParse<T = any>(json: string, defaultValue?: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('解析失败:', error);
    return defaultValue as T;
  }
}

/**
 * 对象转查询字符串
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

/**
 * 查询字符串转对象
 */
export function queryStringToObject(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const obj: Record<string, string> = {};

  params.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

/**
 * 合并对象（深度合并）
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;

  const source = sources.shift();

  if (source === undefined) {
    return target;
  }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceValue = (source as any)[key];
      const targetValue = (target as any)[key];

      if (isObject(sourceValue)) {
        if (!targetValue) {
          (target as any)[key] = {};
        }
        (target as any)[key] = deepMerge(targetValue || {}, sourceValue);
      } else {
        (target as any)[key] = sourceValue;
      }
    });
  }

  return deepMerge(target, ...sources);
}

/**
 * 判断是否为对象
 */
function isObject(item: any): boolean {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 移除对象中的 undefined 值
 */
export function removeUndefined<T extends object>(obj: T): T {
  const result: any = {};

  Object.keys(obj).forEach(key => {
    const value = (obj as any)[key];
    if (value !== undefined) {
      result[key] = isObject(value) ? removeUndefined(value) : value;
    }
  });

  return result;
}

/**
 * 比较两个对象是否相等
 */
export function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => isEqual(item, obj2[index]));
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => isEqual(obj1[key], obj2[key]));
}



