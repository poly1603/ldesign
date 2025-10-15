#  哈希示例

哈希函数用于将任意长度的数据转换为固定长度的摘要，常用于数据完整性验证、密码存储、数字指纹等场景。

##  基础用法

###  常用哈希算法

```typescript
import  {  hash  }  from  '@ldesign/crypto'

const  data  =  'Hello,  World!'

//  MD5（不推荐用于安全场景）
const  md5Hash  =  hash.md5(data)
console.log('MD5:',  md5Hash)

//  SHA1（不推荐用于安全场景）
const  sha1Hash  =  hash.sha1(data)
console.log('SHA1:',  sha1Hash)

//  SHA256（推荐）
const  sha256Hash  =  hash.sha256(data)
console.log('SHA256:',  sha256Hash)

//  SHA384
const  sha384Hash  =  hash.sha384(data)
console.log('SHA384:',  sha384Hash)

//  SHA512（最高安全性）
const  sha512Hash  =  hash.sha512(data)
console.log('SHA512:',  sha512Hash)
```

###  不同编码格式

```typescript
import  {  hash  }  from  '@ldesign/crypto'

const  data  =  'Hello,  World!'

//  Hex  编码（默认）
const  hexHash  =  hash.sha256(data,  {  encoding:  'hex'  })
console.log('Hex:',  hexHash)

//  Base64  编码
const  base64Hash  =  hash.sha256(data,  {  encoding:  'base64'  })
console.log('Base64:',  base64Hash)
```

##  HMAC  消息认证码

HMAC  使用密钥对数据进行哈希，可用于验证消息完整性和真实性。

###  基本  HMAC

```typescript
import  {  hmac  }  from  '@ldesign/crypto'

const  message  =  'Important  message'
const  secretKey  =  'secret-key'

//  HMAC-SHA256（推荐）
const  mac  =  hmac.sha256(message,  secretKey)
console.log('HMAC-SHA256:',  mac)

//  验证  HMAC
const  isValid  =  hmac.verify(message,  secretKey,  mac,  'SHA256')
console.log('验证结果:',  isValid)  //  true

//  错误的密钥验证失败
const  isInvalid  =  hmac.verify(message,  'wrong-key',  mac,  'SHA256')
console.log('错误密钥验证:',  isInvalid)  //  false
```

###  不同  HMAC  算法

```typescript
import  {  hmac  }  from  '@ldesign/crypto'

const  message  =  'Message'
const  key  =  'key'

//  HMAC-MD5
const  hmacMD5  =  hmac.md5(message,  key)
console.log('HMAC-MD5:',  hmacMD5)

//  HMAC-SHA1
const  hmacSHA1  =  hmac.sha1(message,  key)
console.log('HMAC-SHA1:',  hmacSHA1)

//  HMAC-SHA256
const  hmacSHA256  =  hmac.sha256(message,  key)
console.log('HMAC-SHA256:',  hmacSHA256)

//  HMAC-SHA384
const  hmacSHA384  =  hmac.sha384(message,  key)
console.log('HMAC-SHA384:',  hmacSHA384)

//  HMAC-SHA512
const  hmacSHA512  =  hmac.sha512(message,  key)
console.log('HMAC-SHA512:',  hmacSHA512)
```

##  哈希验证

```typescript
import  {  hash  }  from  '@ldesign/crypto'

const  originalData  =  'Original  data'
const  expectedHash  =  hash.sha256(originalData)

//  验证数据完整性
const  dataToVerify  =  'Original  data'
const  isValid  =  hash.verify(dataToVerify,  expectedHash,  'SHA256')
console.log('数据完整:',  isValid)  //  true

//  数据被篡改
const  tamperedData  =  'Modified  data'
const  isInvalid  =  hash.verify(tamperedData,  expectedHash,  'SHA256')
console.log('数据被篡改:',  !isInvalid)  //  true
```

##  实际应用场景

###  场景  1：密码存储

```typescript
import  {  hash,  RandomUtils  }  from  '@ldesign/crypto'

/**
  *  安全的密码存储系统
  */
class  PasswordManager  {
        //  哈希密码并加盐
        static  hashPassword(password:  string):  {  hash:  string;  salt:  string  }  {
                //  生成随机盐值
                const  salt  =  RandomUtils.generateSalt(16)

                //  将密码和盐值组合后哈希
                const  passwordWithSalt  =  password  +  salt
                const  passwordHash  =  hash.sha256(passwordWithSalt)

                return  {
                        hash:  passwordHash,
                        salt,
                }
        }

        //  验证密码
        static  verifyPassword(
                password:  string,
                storedHash:  string,
                salt:  string,
        ):  boolean  {
                const  passwordWithSalt  =  password  +  salt
                const  passwordHash  =  hash.sha256(passwordWithSalt)

                return  hash.verify(passwordWithSalt,  storedHash,  'SHA256')
        }
}

//  使用示例
const  password  =  'user-password-123'

//  注册时存储密码
const  {  hash:  passwordHash,  salt  }  =  PasswordManager.hashPassword(password)
console.log('密码哈希:',  passwordHash)
console.log('盐值:',  salt)

//  登录时验证密码
const  isCorrect  =  PasswordManager.verifyPassword(password,  passwordHash,  salt)
console.log('密码正确:',  isCorrect)  //  true

const  isWrong  =  PasswordManager.verifyPassword('wrong-password',  passwordHash,  salt)
console.log('密码错误:',  !isWrong)  //  true
```

###  场景  2：文件完整性校验

```typescript
import  {  hash  }  from  '@ldesign/crypto'
import  *  as  fs  from  'fs'

/**
  *  文件完整性验证
  */
class  FileIntegrity  {
        //  计算文件哈希
        static  calculateFileHash(filePath:  string):  string  {
                const  content  =  fs.readFileSync(filePath,  'utf-8')
                return  hash.sha256(content)
        }

        //  生成校验和文件
        static  createChecksumFile(filePath:  string):  void  {
                const  fileHash  =  this.calculateFileHash(filePath)
                const  checksumFile  =  `${filePath}.sha256`

                fs.writeFileSync(checksumFile,  `${fileHash}  ${filePath}\n`)
                console.log(`校验和文件已创建:  ${checksumFile}`)
        }

        //  验证文件完整性
        static  verifyFile(filePath:  string):  boolean  {
                const  checksumFile  =  `${filePath}.sha256`

                if  (!fs.existsSync(checksumFile))  {
                        console.error('校验和文件不存在')
                        return  false
                }

                //  读取存储的哈希
                const  checksumContent  =  fs.readFileSync(checksumFile,  'utf-8')
                const  storedHash  =  checksumContent.split('  ')[0]

                //  计算当前文件哈希
                const  currentHash  =  this.calculateFileHash(filePath)

                //  比较
                return  storedHash  ===  currentHash
        }
}

//  使用示例
const  testFile  =  'test.txt'
fs.writeFileSync(testFile,  'File  content  for  integrity  check')

//  创建校验和
FileIntegrity.createChecksumFile(testFile)

//  验证文件
const  isValid  =  FileIntegrity.verifyFile(testFile)
console.log('文件完整:',  isValid)

//  修改文件
fs.appendFileSync(testFile,  '  Modified')

//  再次验证
const  isModified  =  !FileIntegrity.verifyFile(testFile)
console.log('文件被修改:',  isModified)
```

###  场景  3：数据去重

```typescript
import  {  hash  }  from  '@ldesign/crypto'

/**
  *  基于哈希的数据去重
  */
class  DataDeduplicator  {
        private  hashSet:  Set<string>  =  new  Set()
        private  dataMap:  Map<string,  any>  =  new  Map()

        //  添加数据（自动去重）
        add(data:  any):  boolean  {
                //  计算数据哈希
                const  dataString  =  JSON.stringify(data)
                const  dataHash  =  hash.sha256(dataString)

                //  检查是否已存在
                if  (this.hashSet.has(dataHash))  {
                        console.log('数据重复，已跳过')
                        return  false
                }

                //  添加到集合
                this.hashSet.add(dataHash)
                this.dataMap.set(dataHash,  data)
                return  true
        }

        //  获取所有唯一数据
        getUniqueData():  any[]  {
                return  Array.from(this.dataMap.values())
        }

        //  获取统计信息
        getStats()  {
                return  {
                        unique:  this.hashSet.size,
                        total:  this.hashSet.size,
                }
        }
}

//  使用示例
const  deduplicator  =  new  DataDeduplicator()

//  添加数据
deduplicator.add({  id:  1,  name:  'Alice'  })
deduplicator.add({  id:  2,  name:  'Bob'  })
deduplicator.add({  id:  1,  name:  'Alice'  })  //  重复
deduplicator.add({  id:  3,  name:  'Charlie'  })

//  获取唯一数据
const  uniqueData  =  deduplicator.getUniqueData()
console.log('唯一数据:',  uniqueData)
console.log('统计:',  deduplicator.getStats())
```

###  场景  4：API  请求签名

```typescript
import  {  hmac,  hash  }  from  '@ldesign/crypto'

/**
  *  API  请求签名验证
  */
class  APISignature  {
        private  apiSecret:  string

        constructor(apiSecret:  string)  {
                this.apiSecret  =  apiSecret
        }

        //  生成请求签名
        signRequest(params:  {
                method:  string
                url:  string
                timestamp:  number
                body?:  any
        }):  string  {
                //  构建签名字符串
                const  signatureString  =  [
                        params.method,
                        params.url,
                        params.timestamp,
                        params.body  ?  JSON.stringify(params.body)  :  '',
                ].join('|')

                //  使用  HMAC-SHA256  签名
                return  hmac.sha256(signatureString,  this.apiSecret)
        }

        //  验证请求签名
        verifyRequest(
                params:  {
                        method:  string
                        url:  string
                        timestamp:  number
                        body?:  any
                },
                signature:  string,
        ):  boolean  {
                //  检查时间戳（防重放攻击）
                const  now  =  Date.now()
                const  timeDiff  =  Math.abs(now  -  params.timestamp)

                if  (timeDiff  >  300000)  {
                        //  5  分钟超时
                        console.log('请求已过期')
                        return  false
                }

                //  验证签名
                const  expectedSignature  =  this.signRequest(params)
                return  hmac.verify(
                        [
                                params.method,
                                params.url,
                                params.timestamp,
                                params.body  ?  JSON.stringify(params.body)  :  '',
                        ].join('|'),
                        this.apiSecret,
                        signature,
                        'SHA256',
                )
        }
}

//  使用示例
const  api  =  new  APISignature('api-secret-key-xyz')

//  客户端：签名请求
const  request  =  {
        method:  'POST',
        url:  '/api/users',
        timestamp:  Date.now(),
        body:  {  name:  'John',  email:  'john@example.com'  },
}

const  signature  =  api.signRequest(request)
console.log('请求签名:',  signature)

//  服务端：验证请求
const  isValid  =  api.verifyRequest(request,  signature)
console.log('签名验证:',  isValid)  //  true

//  篡改请求
const  tamperedRequest  =  {  ...request,  body:  {  name:  'Hacker'  }  }
const  isTampered  =  !api.verifyRequest(tamperedRequest,  signature)
console.log('检测到篡改:',  isTampered)  //  true
```

###  场景  5：数字指纹生成

```typescript
import  {  hash  }  from  '@ldesign/crypto'

/**
  *  生成唯一的数字指纹
  */
class  Fingerprint  {
        //  生成对象指纹
        static  generateObjectFingerprint(obj:  any):  string  {
                //  排序对象键以确保一致性
                const  sortedKeys  =  Object.keys(obj).sort()
                const  sortedObj:  any  =  {}

                for  (const  key  of  sortedKeys)  {
                        sortedObj[key]  =  obj[key]
                }

                const  objString  =  JSON.stringify(sortedObj)
                return  hash.sha256(objString)
        }

        //  生成设备指纹
        static  generateDeviceFingerprint(deviceInfo:  {
                userAgent:  string
                screen:  {  width:  number;  height:  number  }
                timezone:  string
                language:  string
                platform:  string
        }):  string  {
                return  this.generateObjectFingerprint(deviceInfo)
        }

        //  生成内容指纹
        static  generateContentFingerprint(content:  string):  string  {
                //  标准化内容（去除空白）
                const  normalized  =  content.replace(/\s+/g,  '  ').trim()
                return  hash.sha256(normalized)
        }

        //  短指纹（前  16  个字符）
        static  shortFingerprint(fingerprint:  string):  string  {
                return  fingerprint.substring(0,  16)
        }
}

//  使用示例

//  对象指纹
const  user  =  {
        id:  123,
        name:  'John',
        email:  'john@example.com',
}
const  userFingerprint  =  Fingerprint.generateObjectFingerprint(user)
console.log('用户指纹:',  userFingerprint)

//  设备指纹
const  deviceInfo  =  {
        userAgent:  'Mozilla/5.0...',
        screen:  {  width:  1920,  height:  1080  },
        timezone:  'Asia/Shanghai',
        language:  'zh-CN',
        platform:  'Win32',
}
const  deviceFingerprint  =  Fingerprint.generateDeviceFingerprint(deviceInfo)
console.log('设备指纹:',  deviceFingerprint)
console.log('短指纹:',  Fingerprint.shortFingerprint(deviceFingerprint))

//  内容指纹
const  content  =  `
这是一段文本内容。
用于生成唯一指纹。
`
const  contentFingerprint  =  Fingerprint.generateContentFingerprint(content)
console.log('内容指纹:',  contentFingerprint)
```

###  场景  6：缓存键生成

```typescript
import  {  hash  }  from  '@ldesign/crypto'

/**
  *  智能缓存键生成
  */
class  CacheKeyGenerator  {
        //  生成缓存键
        static  generate(prefix:  string,  params:  any):  string  {
                //  将参数转换为规范化字符串
                const  paramsString  =  JSON.stringify(params,  Object.keys(params).sort())

                //  生成哈希
                const  paramsHash  =  hash.sha256(paramsString)

                //  组合前缀和哈希（取前  16  个字符）
                return  `${prefix}:${paramsHash.substring(0,  16)}`
        }

        //  生成查询缓存键
        static  generateQueryKey(sql:  string,  params:  any[]):  string  {
                const  key  =  {  sql,  params  }
                return  this.generate('query',  key)
        }

        //  生成  API  缓存键
        static  generateAPIKey(endpoint:  string,  params:  any):  string  {
                const  key  =  {  endpoint,  params  }
                return  this.generate('api',  key)
        }
}

//  使用示例
const  cache  =  new  Map<string,  any>()

//  API  请求缓存
const  apiParams  =  {  userId:  123,  page:  1,  limit:  10  }
const  apiKey  =  CacheKeyGenerator.generateAPIKey('/api/users',  apiParams)
console.log('API  缓存键:',  apiKey)

//  存储到缓存
cache.set(apiKey,  {  users:  [/*  ...  */],  total:  100  })

//  从缓存读取
const  cachedData  =  cache.get(apiKey)
console.log('缓存命中:',  cachedData  !==  undefined)

//  数据库查询缓存
const  queryKey  =  CacheKeyGenerator.generateQueryKey(
        'SELECT  *  FROM  users  WHERE  id  =  ?',
        [123],
)
console.log('查询缓存键:',  queryKey)
```

##  性能测试

```typescript
import  {  hash  }  from  '@ldesign/crypto'

//  测试不同算法的性能
function  testHashPerformance()  {
        const  data  =  'Test  data  for  performance  measurement'.repeat(100)
        const  iterations  =  1000

        //  MD5
        console.time(`MD5  ${iterations}  次`)
        for  (let  i  =  0;  i  <  iterations;  i++)  {
                hash.md5(data)
        }
        console.timeEnd(`MD5  ${iterations}  次`)

        //  SHA256
        console.time(`SHA256  ${iterations}  次`)
        for  (let  i  =  0;  i  <  iterations;  i++)  {
                hash.sha256(data)
        }
        console.timeEnd(`SHA256  ${iterations}  次`)

        //  SHA512
        console.time(`SHA512  ${iterations}  次`)
        for  (let  i  =  0;  i  <  iterations;  i++)  {
                hash.sha512(data)
        }
        console.timeEnd(`SHA512  ${iterations}  次`)
}

testHashPerformance()
```

##  安全建议

```typescript
//  ❌  不推荐：使用  MD5  或  SHA1  存储密码
const  unsafePasswordHash  =  hash.md5('password')

//  ✅  推荐：使用  SHA256  或更强的算法，并加盐
import  {  RandomUtils  }  from  '@ldesign/crypto'
const  salt  =  RandomUtils.generateSalt(16)
const  safePasswordHash  =  hash.sha256('password'  +  salt)

//  ❌  不推荐：直接比较哈希（可能泄露时间信息）
const  directCompare  =  hash.sha256('data')  ===  expectedHash

//  ✅  推荐：使用常数时间比较
const  safeCompare  =  hash.verify('data',  expectedHash,  'SHA256')
```

##  算法选择建议

```typescript
//  密码存储：SHA256  +  盐值（或更好的专用算法如  bcrypt）
const  passwordHash  =  hash.sha256(password  +  salt)

//  文件完整性：SHA256  或  SHA512
const  fileHash  =  hash.sha512(fileContent)

//  数字指纹：SHA256
const  fingerprint  =  hash.sha256(data)

//  HMAC  签名：SHA256  或  SHA512
const  signature  =  hmac.sha256(message,  key)

//  高速场景：MD5（仅用于非安全场景）
const  checksum  =  hash.md5(data)
```

##  相关资源

-  [数字签名示例](./signature.md)
-  [编码工具](./encoding.md)
-  [AES  加密](./aes.md)
-  [API  文档](/api/hash)
-  [安全指南](/guide/security)
