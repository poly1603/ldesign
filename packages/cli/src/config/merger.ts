/**
 * 配置合并工具
 */

/**
 * 深度合并配置对象
 */
export function mergeConfig(target: any, source: any): any {
  if (!source) return target;
  if (!target) return source;

  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        // 递归合并对象
        result[key] = mergeConfig(targetValue, sourceValue);
      } else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // 合并数组
        result[key] = mergeArrays(targetValue, sourceValue);
      } else {
        // 直接覆盖
        result[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * 合并数组
 */
function mergeArrays(target: any[], source: any[]): any[] {
  // 对于插件和中间件配置，使用特殊的合并逻辑
  if (target.length > 0 && source.length > 0) {
    const firstTarget = target[0];
    const firstSource = source[0];

    // 如果是插件或中间件配置对象
    if (isConfigObject(firstTarget) && isConfigObject(firstSource)) {
      return mergeConfigArrays(target, source);
    }
  }

  // 默认情况下，source 数组覆盖 target 数组
  return [...source];
}

/**
 * 合并配置数组（插件、中间件等）
 */
function mergeConfigArrays(target: any[], source: any[]): any[] {
  const result = [...target];

  for (const sourceItem of source) {
    const existingIndex = result.findIndex(item => 
      getConfigName(item) === getConfigName(sourceItem)
    );

    if (existingIndex !== -1) {
      // 合并现有配置
      result[existingIndex] = mergeConfig(result[existingIndex], sourceItem);
    } else {
      // 添加新配置
      result.push(sourceItem);
    }
  }

  return result;
}

/**
 * 获取配置项名称
 */
function getConfigName(config: any): string {
  if (typeof config === 'string') {
    return config;
  }
  if (isObject(config) && config.name) {
    return config.name;
  }
  return '';
}

/**
 * 检查是否为配置对象
 */
function isConfigObject(value: any): boolean {
  return isObject(value) && (
    value.hasOwnProperty('name') ||
    value.hasOwnProperty('enabled') ||
    value.hasOwnProperty('options')
  );
}

/**
 * 检查是否为对象
 */
function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
