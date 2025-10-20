/**
 * 性能基准测试
 * 用于测量和监控颜色库的性能
 */

import { Color } from '../es/core/Color.js';
import { rgbToHsl, hslToRgb, hexToRgb } from '../es/core/conversions.js';

class PerformanceMonitor {
  constructor() {
    this.results = new Map();
  }

  /**
   * 测量函数执行时间
   */
  measure(name, fn, iterations = 10000) {
    // 预热
    for (let i = 0; i < 100; i++) {
      fn();
    }

    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
    }

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    const duration = endTime - startTime;
    const memoryDelta = endMemory - startMemory;
    const opsPerSec = Math.round((iterations / duration) * 1000);

    this.results.set(name, {
      duration: duration.toFixed(2),
      iterations,
      opsPerSec,
      memoryDelta: (memoryDelta / 1024 / 1024).toFixed(2),
      avgTime: (duration / iterations).toFixed(4)
    });

    return this.results.get(name);
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n=== 性能基准测试结果 ===\n');
    
    for (const [name, result] of this.results) {
      console.log(`📊 ${name}`);
      console.log(`   迭代次数: ${result.iterations.toLocaleString()}`);
      console.log(`   总耗时: ${result.duration}ms`);
      console.log(`   平均耗时: ${result.avgTime}ms`);
      console.log(`   操作/秒: ${result.opsPerSec.toLocaleString()} ops/s`);
      console.log(`   内存变化: ${result.memoryDelta}MB`);
      console.log('');
    }
  }

  /**
   * 导出为JSON
   */
  toJSON() {
    return Object.fromEntries(this.results);
  }
}

// 运行性能测试
async function runBenchmarks() {
  const monitor = new PerformanceMonitor();

  console.log('🚀 开始性能基准测试...\n');

  // 测试1: Color对象创建
  monitor.measure('Color对象创建 (hex)', () => {
    new Color('#FF5733');
  });

  monitor.measure('Color对象创建 (rgb)', () => {
    new Color({ r: 255, g: 87, b: 51 });
  });

  // 测试2: 颜色转换
  monitor.measure('RGB -> Hex转换', () => {
    const color = new Color('#FF5733');
    color.toHex();
  });

  monitor.measure('RGB -> HSL转换', () => {
    rgbToHsl({ r: 255, g: 87, b: 51 });
  });

  monitor.measure('HSL -> RGB转换', () => {
    hslToRgb({ h: 11, s: 100, l: 60 });
  });

  monitor.measure('Hex -> RGB转换', () => {
    hexToRgb('#FF5733');
  });

  // 测试3: 颜色操作
  monitor.measure('颜色变亮', () => {
    const color = new Color('#FF5733');
    color.lighten(10);
  });

  monitor.measure('颜色变暗', () => {
    const color = new Color('#FF5733');
    darken(10);
  });

  monitor.measure('颜色混合', () => {
    const color1 = new Color('#FF5733');
    const color2 = new Color('#3498DB');
    color1.mix(color2, 50);
  });

  // 测试4: 对比度计算
  monitor.measure('对比度计算', () => {
    const color1 = new Color('#FF5733');
    const color2 = new Color('#FFFFFF');
    color1.contrast(color2);
  });

  // 测试5: 色彩和谐
  monitor.measure('互补色生成', () => {
    const color = new Color('#FF5733');
    color.complementary();
  });

  monitor.measure('三分色生成', () => {
    const color = new Color('#FF5733');
    color.triadic();
  });

  // 测试6: 对象池性能
  monitor.measure('Color.fromRGB (对象池)', () => {
    const color = Color.fromRGB(255, 87, 51);
    color.release(); // 返回池中
  });

  // 测试7: 批量操作
  monitor.measure('批量颜色创建 (1000个)', () => {
    const colors = [];
    for (let i = 0; i < 1000; i++) {
      colors.push(new Color(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`));
    }
  }, 100);

  // 打印结果
  monitor.printResults();

  // 保存结果
  const fs = await import('fs');
  const results = monitor.toJSON();
  fs.writeFileSync(
    'benchmarks/performance-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('✅ 测试结果已保存到 benchmarks/performance-results.json\n');

  // 性能建议
  printRecommendations(results);
}

/**
 * 打印性能建议
 */
function printRecommendations(results) {
  console.log('💡 性能建议:\n');

  // 检查慢操作
  const slowOps = Object.entries(results)
    .filter(([_, result]) => result.opsPerSec < 10000)
    .map(([name]) => name);

  if (slowOps.length > 0) {
    console.log('⚠️  以下操作性能较慢，建议优化:');
    slowOps.forEach(op => console.log(`   - ${op}`));
  } else {
    console.log('✅ 所有操作性能良好！');
  }

  console.log('');
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarks().catch(console.error);
}

export { PerformanceMonitor, runBenchmarks };

