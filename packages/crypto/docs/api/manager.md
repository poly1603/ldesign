#  管理器  API

本文档描述了  @ldesign/crypto  的统一管理器和性能优化功能。

##  目录

-  [CryptoManager  类](#cryptomanager-类)
-  [配置选项](#配置选项)
-  [批量操作](#批量操作)
-  [性能优化](#性能优化)
-  [性能监控](#性能监控)

##  CryptoManager  类

`CryptoManager`  提供统一的加解密管理接口，内置性能优化和批量处理功能。

###  导入方式

```typescript
import  {  CryptoManager,  cryptoManager  }  from  '@ldesign/crypto'

//  使用默认实例（推荐）
import  {  cryptoManager  }  from  '@ldesign/crypto'

//  创建自定义实例
const  manager  =  new  CryptoManager({
    defaultAlgorithm:  'AES',
    enableCache:  true
})
```

---

##  配置选项

###  CryptoConfig  接口

```typescript
interface  CryptoConfig  {
    //  默认算法
    defaultAlgorithm?:  'AES'  |  'RSA'  |  'DES'  |  '3DES'  |  'Blowfish'

    //  性能优化选项
    enableCache?:  boolean          //  启用缓存，默认  true
    maxCacheSize?:  number          //  最大缓存条目，默认  1000
    enableParallel?:  boolean      //  启用并行处理，默认  true

    //  安全选项
    autoGenerateIV?:  boolean      //  自动生成  IV，默认  true
    keyDerivation?:  boolean        //  启用密钥派生，默认  false

    //  调试选项
    debug?:  boolean                        //  调试模式，默认  false
    logLevel?:  'error'  |  'warn'  |  'info'  |  'debug'  //  日志级别
}
```

###  示例

```typescript
import  {  CryptoManager  }  from  '@ldesign/crypto'

//  创建自定义配置的管理器
const  manager  =  new  CryptoManager({
    defaultAlgorithm:  'AES',
    enableCache:  true,
    maxCacheSize:  2000,
    enableParallel:  true,
    autoGenerateIV:  true,
    debug:  true,
    logLevel:  'info'
})

//  更新配置
manager.updateConfig({
    maxCacheSize:  5000,
    logLevel:  'debug'
})

//  获取当前配置
const  config  =  manager.getConfig()
console.log(config)
```

---

##  基本操作

###  encryptData(data,  key,  algorithm?,  options?)

简化的加密方法。

**参数：**

-  `data`  (string)  -  要加密的数据
-  `key`  (string)  -  加密密钥
-  `algorithm`  (EncryptionAlgorithm?)  -  算法，默认使用配置的默认算法
-  `options`  (any?)  -  加密选项

**返回值：**  `Promise<EncryptResult>`

**示例：**

```typescript
import  {  cryptoManager  }  from  '@ldesign/crypto'

//  使用默认算法（AES）
const  result1  =  await  cryptoManager.encryptData('Hello',  'key')

//  指定算法
const  result2  =  await  cryptoManager.encryptData('Hello',  'key',  'RSA')

//  指定选项
const  result3  =  await  cryptoManager.encryptData('Hello',  'key',  'AES',  {
    keySize:  256,
    mode:  'CBC'
})

if  (result3.success)  {
    console.log('加密成功:',  result3.data)
}
```

###  decryptData(encryptedData,  key,  algorithm?,  options?)

简化的解密方法。

**参数：**

-  `encryptedData`  (string  |  EncryptResult)  -  加密数据
-  `key`  (string)  -  解密密钥
-  `algorithm`  (EncryptionAlgorithm?)  -  算法
-  `options`  (any?)  -  解密选项

**返回值：**  `Promise<DecryptResult>`

**示例：**

```typescript
//  解密
const  decrypted  =  await  cryptoManager.decryptData(result3,  'key')

if  (decrypted.success)  {
    console.log('解密成功:',  decrypted.data)
}
```

###  hashData(data,  algorithm?,  options?)

计算哈希值。

**示例：**

```typescript
const  hash  =  cryptoManager.hashData('password',  'SHA256')
console.log('哈希值:',  hash)
```

###  hmacData(data,  key,  algorithm?)

计算  HMAC  值。

**示例：**

```typescript
const  hmac  =  cryptoManager.hmacData('message',  'secret-key',  'SHA256')
console.log('HMAC:',  hmac)
```

###  generateKey(algorithm,  keySize?)

生成密钥。

**示例：**

```typescript
//  生成  AES  密钥
const  aesKey  =  cryptoManager.generateKey('AES',  256)

//  生成  RSA  密钥对
const  rsaKeys  =  cryptoManager.generateKey('RSA',  2048)
```

---

##  批量操作

###  batchEncrypt(operations)

批量加密操作。

**参数：**

-  `operations`  (BatchOperation[])  -  批量操作数组

**BatchOperation  接口：**

```typescript
interface  BatchOperation  {
    id:  string                                          //  操作标识符
    data:  string                                        //  数据
    key:  string                                          //  密钥
    algorithm?:  EncryptionAlgorithm  //  算法
    options?:  any                                      //  选项
}
```

**返回值：**  `Promise<Array<{  id:  string,  result:  EncryptResult  }>>`

**示例：**

```typescript
import  {  cryptoManager  }  from  '@ldesign/crypto'

const  operations  =  [
    {  id:  '1',  data:  'message1',  key:  'key1',  algorithm:  'AES'  },
    {  id:  '2',  data:  'message2',  key:  'key2',  algorithm:  'AES'  },
    {  id:  '3',  data:  'message3',  key:  'key3',  algorithm:  'AES'  }
]

const  results  =  await  cryptoManager.batchEncrypt(operations)

results.forEach(({  id,  result  })  =>  {
    if  (result.success)  {
        console.log(`操作  ${id}  成功:`,  result.data)
    }  else  {
        console.error(`操作  ${id}  失败:`,  result.error)
    }
})
```

###  batchDecrypt(operations)

批量解密操作。

**示例：**

```typescript
const  decryptOps  =  [
    {  id:  '1',  data:  encrypted1,  key:  'key1',  algorithm:  'AES'  },
    {  id:  '2',  data:  encrypted2,  key:  'key2',  algorithm:  'AES'  }
]

const  decrypted  =  await  cryptoManager.batchDecrypt(decryptOps)
```

---

##  性能优化

###  缓存管理

####  getCacheStats()

获取缓存统计信息。

**返回值：**  `CacheStats`

```typescript
interface  CacheStats  {
    size:  number                      //  当前缓存条目数
    maxSize:  number                //  最大缓存大小
    hits:  number                      //  缓存命中次数
    misses:  number                  //  缓存未命中次数
    hitRate:  number                //  命中率（0-1）
}
```

**示例：**

```typescript
const  stats  =  cryptoManager.getCacheStats()
console.log('缓存大小:',  stats.size)
console.log('命中率:',  (stats.hitRate  *  100).toFixed(2)  +  '%')
```

####  clearCache()

清空缓存。

```typescript
cryptoManager.clearCache()
console.log('缓存已清空')
```

####  cleanupCache()

清理过期缓存条目。

**返回值：**  `number`  (清理的条目数)

```typescript
const  cleaned  =  cryptoManager.cleanupCache()
console.log(`清理了  ${cleaned}  个过期条目`)
```

###  性能指标

####  getPerformanceMetrics()

获取性能指标。

**返回值：**  `PerformanceMetrics`

```typescript
interface  PerformanceMetrics  {
    totalOperations:  number            //  总操作数
    successfulOperations:  number  //  成功操作数
    failedOperations:  number          //  失败操作数
    averageTime:  number                    //  平均处理时间（毫秒）
    cacheStats:  CacheStats              //  缓存统计
}
```

**示例：**

```typescript
const  metrics  =  cryptoManager.getPerformanceMetrics()
console.log('总操作数:',  metrics.totalOperations)
console.log('成功率:',  (metrics.successfulOperations  /  metrics.totalOperations  *  100).toFixed(2)  +  '%')
console.log('平均耗时:',  metrics.averageTime.toFixed(2)  +  'ms')
```

---

##  完整示例

###  应用初始化

```typescript
import  {  CryptoManager  }  from  '@ldesign/crypto'

//  初始化加密管理器
const  cryptoManager  =  new  CryptoManager({
    defaultAlgorithm:  'AES',
    enableCache:  true,
    maxCacheSize:  10000,
    enableParallel:  true,
    autoGenerateIV:  true,
    debug:  process.env.NODE_ENV  ===  'development',
    logLevel:  'info'
})

export  default  cryptoManager
```

###  批量处理用户数据

```typescript
import  {  cryptoManager  }  from  './crypto-setup'

async  function  encryptUserData(users:  User[])  {
    //  准备批量操作
    const  operations  =  users.map(user  =>  ({
        id:  user.id.toString(),
        data:  JSON.stringify(user.sensitiveData),
        key:  user.encryptionKey,
        algorithm:  'AES'  as  const
    }))

    //  批量加密
    const  results  =  await  cryptoManager.batchEncrypt(operations)

    //  处理结果
    const  encrypted  =  new  Map()
    for  (const  {  id,  result  }  of  results)  {
        if  (result.success)  {
            encrypted.set(id,  result)
        }  else  {
            console.error(`用户  ${id}  加密失败:`,  result.error)
        }
    }

    return  encrypted
}
```

###  性能监控

```typescript
import  {  cryptoManager  }  from  './crypto-setup'

//  定期监控性能
setInterval(()  =>  {
    const  metrics  =  cryptoManager.getPerformanceMetrics()
    const  cacheStats  =  cryptoManager.getCacheStats()

    console.log('=====  性能报告  =====')
    console.log('总操作:',  metrics.totalOperations)
    console.log('成功率:',  (metrics.successfulOperations  /  metrics.totalOperations  *  100).toFixed(2)  +  '%')
    console.log('平均耗时:',  metrics.averageTime.toFixed(2)  +  'ms')
    console.log('缓存命中率:',  (cacheStats.hitRate  *  100).toFixed(2)  +  '%')
    console.log('缓存大小:',  cacheStats.size  +  '/'  +  cacheStats.maxSize)

    //  清理过期缓存
    if  (cacheStats.size  >  cacheStats.maxSize  *  0.9)  {
        const  cleaned  =  cryptoManager.cleanupCache()
        console.log(`清理了  ${cleaned}  个过期缓存`)
    }
},  60000)  //  每分钟
```

---

##  最佳实践

###  使用单例实例

```typescript
//  ✓  推荐：使用库提供的默认实例
import  {  cryptoManager  }  from  '@ldesign/crypto'

//  ✗  不推荐：创建多个实例
const  manager1  =  new  CryptoManager()
const  manager2  =  new  CryptoManager()
```

###  配置管理

```typescript
//  根据环境配置
const  manager  =  new  CryptoManager({
    debug:  process.env.NODE_ENV  ===  'development',
    enableCache:  process.env.NODE_ENV  ===  'production',
    logLevel:  process.env.LOG_LEVEL  ||  'error'
})
```

###  错误处理

```typescript
try  {
    const  result  =  await  cryptoManager.encryptData('data',  'key')
    if  (!result.success)  {
        throw  new  Error(result.error)
    }
    //  使用  result.data
}  catch  (error)  {
    console.error('加密失败:',  error)
    //  错误恢复逻辑
}
```

---

##  相关链接

-  [加密  API](./encryption.md)
-  [解密  API](./decryption.md)
-  [工具函数  API](./utilities.md)
-  [类型定义](./types.md)
