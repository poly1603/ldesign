/**
 * Performance Benchmark for @ldesign/i18n optimizations
 */

const { performance } = require('perf_hooks');

// Helper to run benchmark
async function benchmark(name, fn, iterations = 10000) {
  console.log(`\n📊 Running benchmark: ${name}`);
  
  // Warmup
  for (let i = 0; i < 100; i++) {
    await fn();
  }
  
  // Actual benchmark
  const start = performance.now();
  for (let i = 0; i < iterations) {
    await fn();
  }
  const end = performance.now();
  
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  
  console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average time: ${avgTime.toFixed(4)}ms`);
  console.log(`  Operations/sec: ${(1000 / avgTime).toFixed(0)}`);
  
  return { totalTime, avgTime };
}

// Memory usage helper
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed / 1024 / 1024,
      heapTotal: usage.heapTotal / 1024 / 1024,
      external: usage.external / 1024 / 1024,
    };
  }
  return null;
}

async function runBenchmarks() {
  console.log('🚀 @ldesign/i18n Performance Benchmarks');
  console.log('========================================');
  
  // Test data
  const testMessages = {
    en: {
      greeting: 'Hello {{name}}!',
      welcome: 'Welcome to {{app}}',
      items: 'You have {{count}} {{item}}',
      nested: {
        deep: {
          message: 'This is a deeply nested message with {{param}}'
        }
      }
    },
    zh: {
      greeting: '你好 {{name}}！',
      welcome: '欢迎来到 {{app}}',
      items: '你有 {{count}} 个{{item}}',
      nested: {
        deep: {
          message: '这是一个带有 {{param}} 的深层嵌套消息'
        }
      }
    }
  };
  
  // Generate large dataset for stress testing
  for (let i = 0; i < 1000; i++) {
    testMessages.en[`key_${i}`] = `Message ${i} with {{param}}`;
    testMessages.zh[`key_${i}`] = `消息 ${i} 带有 {{param}}`;
  }
  
  console.log('\n📋 Test Configuration:');
  console.log(`  Messages: ${Object.keys(testMessages.en).length} keys per locale`);
  console.log(`  Locales: ${Object.keys(testMessages).length}`);
  
  // Import and create instance
  const { OptimizedI18n } = require('./es/core/i18n-optimized.js');
  const i18n = new OptimizedI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: testMessages,
    cache: { maxSize: 1000 }
  });
  
  await i18n.init();
  
  const memStart = getMemoryUsage();
  console.log('\n💾 Initial Memory Usage:');
  if (memStart) {
    console.log(`  Heap Used: ${memStart.heapUsed.toFixed(2)} MB`);
    console.log(`  Heap Total: ${memStart.heapTotal.toFixed(2)} MB`);
  }
  
  const results = {};
  
  // Benchmark 1: Simple translation
  results.simple = await benchmark('Simple Translation', () => {
    i18n.t('greeting', { name: 'World' });
  });
  
  // Benchmark 2: Nested key translation
  results.nested = await benchmark('Nested Key Translation', () => {
    i18n.t('nested.deep.message', { param: 'test' });
  }, 10000);
  
  // Benchmark 3: Batch translation
  results.batch = await benchmark('Batch Translation (10 keys)', () => {
    i18n.translateBatch([
      'greeting',
      'welcome',
      'items',
      'key_10',
      'key_20',
      'key_30',
      'key_40',
      'key_50',
      'key_60',
      'key_70'
    ], { params: { name: 'Test', app: 'Benchmark', count: 5, item: 'items', param: 'value' } });
  }, 1000);
  
  // Benchmark 4: Cache hit rate
  console.log('\n📊 Running benchmark: Cache Performance');
  const cacheStart = performance.now();
  
  // First pass - cache miss
  for (let i = 0; i < 100; i++) {
    i18n.t(`key_${i}`, { param: 'test' });
  }
  const firstPassTime = performance.now() - cacheStart;
  
  // Second pass - cache hit
  const cacheHitStart = performance.now();
  for (let i = 0; i < 100; i++) {
    i18n.t(`key_${i}`, { param: 'test' });
  }
  const secondPassTime = performance.now() - cacheHitStart;
  
  console.log(`  First pass (cache miss): ${firstPassTime.toFixed(2)}ms`);
  console.log(`  Second pass (cache hit): ${secondPassTime.toFixed(2)}ms`);
  console.log(`  Speedup: ${(firstPassTime / secondPassTime).toFixed(2)}x`);
  
  // Get cache stats
  if (i18n.cache && typeof i18n.cache.getStats === 'function') {
    const stats = i18n.cache.getStats();
    console.log(`  Cache hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
  }
  
  // Benchmark 5: Locale switching
  results.localeSwitch = await benchmark('Locale Switching', async () => {
    await i18n.setLocale('zh');
    await i18n.setLocale('en');
  }, 100);
  
  // Memory usage after tests
  const memEnd = getMemoryUsage();
  console.log('\n💾 Final Memory Usage:');
  if (memEnd && memStart) {
    console.log(`  Heap Used: ${memEnd.heapUsed.toFixed(2)} MB`);
    console.log(`  Heap Total: ${memEnd.heapTotal.toFixed(2)} MB`);
    console.log(`  Memory Growth: ${(memEnd.heapUsed - memStart.heapUsed).toFixed(2)} MB`);
  }
  
  // Summary
  console.log('\n📈 Performance Summary:');
  console.log('========================');
  
  const baseline = results.simple.avgTime;
  for (const [name, result] of Object.entries(results)) {
    const relative = (result.avgTime / baseline).toFixed(2);
    console.log(`  ${name}: ${result.avgTime.toFixed(4)}ms (${relative}x baseline)`);
  }
  
  console.log('\n✅ Benchmark completed successfully!');
  
  // Cleanup
  i18n.destroy();
}

// Run if executed directly
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

module.exports = { benchmark, runBenchmarks };