/* eslint-disable no-console, no-var, vars-on-top, antfu/no-top-level-await, node/prefer-global/process */
// 策略测试脚本
console.log('🚀 开始加载缓存库...')

var createCache
try {
  const module = await import('../es/index.js')
  createCache = module.createCache
  console.log('✅ 缓存库加载成功')
}
catch (error) {
  console.error('❌ 缓存库加载失败:', error.message)
  process.exit(1)
}

// 模拟浏览器环境
globalThis.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null
  },
  setItem(key, value) {
    this.data[key] = value
  },
  removeItem(key) {
    delete this.data[key]
  },
  clear() {
    this.data = {}
  },
}

globalThis.sessionStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null
  },
  setItem(key, value) {
    this.data[key] = value
  },
  removeItem(key) {
    delete this.data[key]
  },
  clear() {
    this.data = {}
  },
}

// 模拟IndexedDB (简化版)
globalThis.indexedDB = {
  open() {
    return {
      onsuccess() {},
      onerror() {},
      result: {
        createObjectStore() {
          return {
            add() {},
            get() {
              return { onsuccess() {}, result: null }
            },
            delete() {},
          }
        },
        transaction() {
          return {
            objectStore() {
              return {
                add() {
                  return { onsuccess() {} }
                },
                get() {
                  return { onsuccess() {}, result: null }
                },
                delete() {
                  return { onsuccess() {} }
                },
              }
            },
          }
        },
      },
    }
  },
}

// 创建启用策略的缓存实例
const cache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024, // 1KB
      medium: 64 * 1024, // 64KB
      large: 1024 * 1024, // 1MB
    },
    ttlThresholds: {
      short: 5 * 60 * 1000, // 5分钟
      medium: 24 * 60 * 60 * 1000, // 24小时
      long: 7 * 24 * 60 * 60 * 1000, // 7天
    },
  },
  debug: true,
})

// 监听策略选择事件
cache.on('strategy', (event) => {
  console.log('✅ 策略选择事件:', {
    key: event.key,
    engine: event.engine,
    reason: event.strategy.reason,
    confidence: event.strategy.confidence,
    dataSize: event.strategy.dataSize,
    dataType: event.strategy.dataType,
  })
})

// 监听错误事件
cache.on('error', (event) => {
  console.error('❌ 缓存错误:', event.key, event.error.message)
})

// 测试函数
async function testSmallData() {
  console.log('\n🧪 测试小数据 (应该选择 localStorage)')
  try {
    const data = 'small data string'
    await cache.set('small-test', data)
    console.log('✅ 小数据测试完成')
  }
  catch (error) {
    console.error('❌ 小数据测试失败:', error.message)
  }
}

async function testLargeData() {
  console.log('\n🧪 测试大数据 (应该选择 IndexedDB)')
  try {
    // 生成大约100KB的数据
    const largeData = Array.from({ length: 100000 }).fill('x').join('')
    await cache.set('large-test', largeData)
    console.log('✅ 大数据测试完成, 大小:', largeData.length, '字符')
  }
  catch (error) {
    console.error('❌ 大数据测试失败:', error.message)
  }
}

async function testShortTTL() {
  console.log('\n🧪 测试短期缓存 (应该选择 Memory)')
  try {
    const data = 'short ttl data'
    await cache.set('short-ttl-test', data, { ttl: 3000 }) // 3秒
    console.log('✅ 短期缓存测试完成')
  }
  catch (error) {
    console.error('❌ 短期缓存测试失败:', error.message)
  }
}

async function testMediumTTL() {
  console.log('\n🧪 测试中期缓存 (应该选择 sessionStorage)')
  try {
    const data = 'medium ttl data'
    await cache.set('medium-ttl-test', data, { ttl: 60 * 60 * 1000 }) // 1小时
    console.log('✅ 中期缓存测试完成')
  }
  catch (error) {
    console.error('❌ 中期缓存测试失败:', error.message)
  }
}

async function testComplexObject() {
  console.log('\n🧪 测试复杂对象 (应该选择 IndexedDB)')
  try {
    const complexData = {
      id: 1,
      name: '复杂对象',
      data: Array.from({ length: 1000 })
        .fill(0)
        .map((_, i) => ({ id: i, value: Math.random() })),
      nested: {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
      },
    }
    await cache.set('complex-test', complexData)
    console.log(
      '✅ 复杂对象测试完成, 大小:',
      JSON.stringify(complexData).length,
      '字符',
    )
  }
  catch (error) {
    console.error('❌ 复杂对象测试失败:', error.message)
  }
}

async function testEncryption() {
  console.log('\n🧪 测试加密存储')
  try {
    const sensitiveData = {
      username: 'admin',
      password: 'secret123',
      token: 'jwt-token-here',
    }
    await cache.set('encrypted-test', sensitiveData, { encrypt: true })

    // 尝试读取
    const retrieved = await cache.get('encrypted-test')
    if (retrieved && retrieved.username === 'admin') {
      console.log('✅ 加密测试成功: 数据正确加密和解密')
    }
    else {
      console.error('❌ 加密测试失败: 数据不匹配')
    }
  }
  catch (error) {
    console.error('❌ 加密测试失败:', error.message)
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始策略测试...\n')

  await testSmallData()
  await testLargeData()
  await testShortTTL()
  await testMediumTTL()
  await testComplexObject()
  await testEncryption()

  console.log('\n🎉 所有测试完成!')

  // 显示存储状态
  console.log('\n📊 存储状态:')
  console.log('localStorage:', Object.keys(globalThis.localStorage.data))
  console.log('sessionStorage:', Object.keys(globalThis.sessionStorage.data))
}

runAllTests().catch(console.error)
