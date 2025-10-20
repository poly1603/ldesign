/**
 * Memory usage benchmark test
 * Run with: node benchmarks/memory-test.js
 */

const { Color, getMemoryStats, cleanupMemory } = require('../lib/index.cjs');

console.log('Starting memory benchmark...\n');

// Helper to get memory usage in MB
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2),
      external: (usage.external / 1024 / 1024).toFixed(2),
      rss: (usage.rss / 1024 / 1024).toFixed(2)
    };
  }
  return null;
}

// Test 1: Create many Color instances
console.log('Test 1: Creating 10,000 Color instances');
console.log('Initial memory:', getMemoryUsage());

const colors = [];
const startTime = Date.now();

for (let i = 0; i < 10000; i++) {
  colors.push(new Color(`#${Math.floor(Math.random() * 16777215).toString(16)}`));
}

const createTime = Date.now() - startTime;
console.log(`Created in ${createTime}ms`);
console.log('After creation:', getMemoryUsage());

// Test 2: Perform conversions
console.log('\nTest 2: Converting colors');
const convertStart = Date.now();

for (let i = 0; i < 1000; i++) {
  const color = colors[i];
  color.toRGB();
  color.toHSL();
  color.toHSV();
  color.toHex();
}

const convertTime = Date.now() - convertStart;
console.log(`Converted in ${convertTime}ms`);
console.log('After conversions:', getMemoryUsage());

// Test 3: Mix colors
console.log('\nTest 3: Mixing colors');
const mixStart = Date.now();

for (let i = 0; i < 1000; i++) {
  const result = colors[i].mix(colors[i + 1], 50);
  result.dispose(); // Return to pool
}

const mixTime = Date.now() - mixStart;
console.log(`Mixed in ${mixTime}ms`);
console.log('After mixing:', getMemoryUsage());

// Test 4: Check memory stats
console.log('\nTest 4: Internal memory stats');
if (getMemoryStats) {
  const stats = getMemoryStats();
  console.log('Library stats:', stats);
}

// Test 5: Cleanup
console.log('\nTest 5: Cleanup');
cleanupMemory();
colors.length = 0;

// Force garbage collection if available
if (global.gc) {
  global.gc();
}

console.log('After cleanup:', getMemoryUsage());

console.log('\nBenchmark complete!');
console.log('Summary:');
console.log(`- Instance creation: ${createTime}ms for 10,000 colors`);
console.log(`- Conversions: ${convertTime}ms for 1,000 colors`);
console.log(`- Mixing: ${mixTime}ms for 1,000 operations`);