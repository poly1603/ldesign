/**
 * @ldesign/size - Memory Analyzer
 * 
 * 深度内存分析工具，用于评估每个数据结构和操作的内存占用
 */

export interface MemoryEstimate {
  variable: string;
  type: string;
  sizeInBytes: number;
  description: string;
  optimization?: string;
}

export class MemoryAnalyzer {
  private static readonly SIZES = {
    // 基础类型大小（字节）
    POINTER: 8,           // 64位系统指针
    OBJECT_HEADER: 24,    // V8对象头部开销
    STRING_HEADER: 24,    // 字符串对象头部
    ARRAY_HEADER: 32,     // 数组对象头部
    MAP_ENTRY: 32,        // Map单个条目
    SET_ENTRY: 24,        // Set单个条目
    WEAKMAP_ENTRY: 16,    // WeakMap条目（不计算值）
    FUNCTION_CLOSURE: 96, // 函数闭包基础大小
    NUMBER: 8,            // 数字类型
    BOOLEAN: 4,           // 布尔类型
    UNDEFINED: 0,         // undefined不占用额外空间
    NULL: 0,              // null不占用额外空间
  };

  /**
   * 估算字符串内存占用
   */
  static estimateString(str: string): number {
    if (!str) return 0;
    // V8中字符串采用UTF-16编码，每个字符2字节
    // 加上字符串对象头部开销
    return this.SIZES.STRING_HEADER + (str.length * 2);
  }

  /**
   * 估算对象内存占用
   */
  static estimateObject(obj: any): number {
    if (!obj) return 0;
    
    let size = this.SIZES.OBJECT_HEADER;
    
    // 计算属性占用
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // 属性名占用
        size += this.estimateString(key);
        // 属性值占用
        size += this.estimateValue(obj[key]);
        // 属性槽位占用
        size += this.SIZES.POINTER;
      }
    }
    
    return size;
  }

  /**
   * 估算数组内存占用
   */
  static estimateArray(arr: any[]): number {
    if (!arr) return 0;
    
    let size = this.SIZES.ARRAY_HEADER;
    
    // 数组容量通常会预分配（通常是长度的1.5倍）
    const capacity = Math.ceil(arr.length * 1.5);
    size += capacity * this.SIZES.POINTER;
    
    // 计算元素占用
    for (const item of arr) {
      size += this.estimateValue(item);
    }
    
    return size;
  }

  /**
   * 估算Map内存占用
   */
  static estimateMap(map: Map<any, any>): number {
    let size = this.SIZES.OBJECT_HEADER;
    
    // 每个Map条目的开销
    size += map.size * this.SIZES.MAP_ENTRY;
    
    // 计算键值对占用
    map.forEach((value, key) => {
      size += this.estimateValue(key);
      size += this.estimateValue(value);
    });
    
    // 哈希表的额外开销（通常是容量的1.5倍）
    size += Math.ceil(map.size * 1.5) * this.SIZES.POINTER;
    
    return size;
  }

  /**
   * 估算Set内存占用
   */
  static estimateSet(set: Set<any>): number {
    let size = this.SIZES.OBJECT_HEADER;
    
    // 每个Set条目的开销
    size += set.size * this.SIZES.SET_ENTRY;
    
    // 计算值占用
    set.forEach(value => {
      size += this.estimateValue(value);
    });
    
    // 哈希表的额外开销
    size += Math.ceil(set.size * 1.5) * this.SIZES.POINTER;
    
    return size;
  }

  /**
   * 估算函数内存占用
   */
  static estimateFunction(fn: (...args: any[]) => any): number {
    let size = this.SIZES.FUNCTION_CLOSURE;
    
    // 函数代码字符串（近似）
    const fnString = fn.toString();
    size += this.estimateString(fnString);
    
    // 闭包变量（难以准确计算，使用估计值）
    size += 200; // 假设平均闭包大小
    
    return size;
  }

  /**
   * 估算任意值的内存占用
   */
  static estimateValue(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    
    const type = typeof value;
    
    switch (type) {
      case 'number':
        return this.SIZES.NUMBER;
      case 'boolean':
        return this.SIZES.BOOLEAN;
      case 'string':
        return this.estimateString(value);
      case 'function':
        return this.estimateFunction(value);
      case 'object':
        if (Array.isArray(value)) {
          return this.estimateArray(value);
        } else if (value instanceof Map) {
          return this.estimateMap(value);
        } else if (value instanceof Set) {
          return this.estimateSet(value);
        } else if (value instanceof WeakMap || value instanceof WeakSet) {
          return this.SIZES.OBJECT_HEADER + 100; // WeakMap/Set基础开销
        } else {
          return this.estimateObject(value);
        }
      default:
        return this.SIZES.POINTER;
    }
  }

  /**
   * 分析Size类的内存占用
   */
  static analyzeSizeClass(): MemoryEstimate[] {
    const estimates: MemoryEstimate[] = [];
    
    // Size对象本身
    estimates.push({
      variable: 'Size instance',
      type: 'object',
      sizeInBytes: this.SIZES.OBJECT_HEADER + 
                   this.SIZES.POINTER * 5 + // 5个属性
                   this.SIZES.NUMBER * 3 +   // value, rootFontSize, cachedPixels
                   this.estimateString('px') + // unit字符串
                   this.SIZES.BOOLEAN,       // isPooled
      description: '单个Size对象实例',
      optimization: '使用对象池复用实例'
    });
    
    // SizePool
    estimates.push({
      variable: 'SizePool.pool',
      type: 'array',
      sizeInBytes: this.SIZES.ARRAY_HEADER + 
                   100 * this.SIZES.POINTER, // 最多100个对象引用
      description: '对象池数组',
      optimization: '动态调整池大小'
    });
    
    // 缓存的Size对象
    estimates.push({
      variable: 'sizeCache',
      type: 'Map',
      sizeInBytes: this.estimateMap(new Map()),
      description: '全局Size缓存',
      optimization: '使用LRU策略限制大小'
    });
    
    return estimates;
  }

  /**
   * 分析SizeManager的内存占用
   */
  static analyzeSizeManager(): MemoryEstimate[] {
    const estimates: MemoryEstimate[] = [];
    
    // CSS缓存
    estimates.push({
      variable: 'cssCache',
      type: 'Map<string, string>',
      sizeInBytes: this.SIZES.MAP_ENTRY * 20 + // 假设20个条目
                   this.estimateString('x'.repeat(5000)) * 20, // 每个CSS约5KB
      description: 'CSS生成缓存',
      optimization: '压缩CSS字符串，使用WeakMap'
    });
    
    // Preset Map
    estimates.push({
      variable: 'presets',
      type: 'Map<string, SizePreset>',
      sizeInBytes: this.SIZES.MAP_ENTRY * 10 + // 假设10个预设
                   this.estimateObject({name: '', baseSize: 0}) * 10,
      description: '尺寸预设配置',
      optimization: '使用frozen对象减少内存'
    });
    
    // 监听器集合
    estimates.push({
      variable: 'listeners',
      type: 'Set<Function>',
      sizeInBytes: this.SIZES.SET_ENTRY * 50 + // 假设50个监听器
                   this.SIZES.FUNCTION_CLOSURE * 50,
      description: '事件监听器集合',
      optimization: '使用WeakRef弱引用'
    });
    
    // Style元素
    estimates.push({
      variable: 'styleElement',
      type: 'HTMLStyleElement',
      sizeInBytes: 500, // DOM元素基础开销
      description: 'DOM样式元素',
      optimization: '复用单个元素'
    });
    
    return estimates;
  }

  /**
   * 分析字符串拼接的内存开销
   */
  static analyzeStringConcatenation(operations: number): MemoryEstimate {
    // 字符串拼接会创建中间字符串
    const intermediateStrings = operations - 1;
    const avgStringSize = 100; // 假设平均字符串长度
    
    return {
      variable: 'String concatenation',
      type: 'operation',
      sizeInBytes: intermediateStrings * this.estimateString('x'.repeat(avgStringSize)),
      description: `${operations}次字符串拼接操作`,
      optimization: '使用数组join()替代'
    };
  }

  /**
   * 生成内存优化建议
   */
  static generateOptimizationReport(): string {
    const sizeEstimates = this.analyzeSizeClass();
    const managerEstimates = this.analyzeSizeManager();
    
    let report = '# 内存占用分析报告\n\n';
    report += '## Size类内存分析\n';
    
    let totalSize = 0;
    for (const estimate of sizeEstimates) {
      totalSize += estimate.sizeInBytes;
      report += `\n### ${estimate.variable}\n`;
      report += `- 类型: ${estimate.type}\n`;
      report += `- 占用: ${(estimate.sizeInBytes / 1024).toFixed(2)} KB\n`;
      report += `- 说明: ${estimate.description}\n`;
      if (estimate.optimization) {
        report += `- 优化: ${estimate.optimization}\n`;
      }
    }
    
    report += `\n**Size类总占用: ${(totalSize / 1024).toFixed(2)} KB**\n`;
    
    report += '\n## SizeManager内存分析\n';
    
    totalSize = 0;
    for (const estimate of managerEstimates) {
      totalSize += estimate.sizeInBytes;
      report += `\n### ${estimate.variable}\n`;
      report += `- 类型: ${estimate.type}\n`;
      report += `- 占用: ${(estimate.sizeInBytes / 1024).toFixed(2)} KB\n`;
      report += `- 说明: ${estimate.description}\n`;
      if (estimate.optimization) {
        report += `- 优化: ${estimate.optimization}\n`;
      }
    }
    
    report += `\n**SizeManager总占用: ${(totalSize / 1024).toFixed(2)} KB**\n`;
    
    return report;
  }

  /**
   * 实时内存监控
   */
  static monitorMemory(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.table({
        '已用JS堆': `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        '总JS堆': `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        'JS堆限制': `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
        '使用率': `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)}%`
      });
    }
  }
}

// 导出便捷方法
export const memoryAnalyzer = {
  estimate: (value: any) => MemoryAnalyzer.estimateValue(value),
  analyzeSize: () => MemoryAnalyzer.analyzeSizeClass(),
  analyzeManager: () => MemoryAnalyzer.analyzeSizeManager(),
  report: () => MemoryAnalyzer.generateOptimizationReport(),
  monitor: () => MemoryAnalyzer.monitorMemory()
};