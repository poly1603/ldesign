#  哈希  API

本文档描述了  @ldesign/crypto  提供的所有哈希和  HMAC  功能。

##  目录

-  [Hash  类](#hash-类)
-  [哈希算法](#哈希算法)
-  [HMAC  类](#hmac-类)
-  [HMAC  算法](#hmac-算法)
-  [使用场景](#使用场景)
-  [最佳实践](#最佳实践)

##  Hash  类

`Hash`  类提供了常见的消息摘要算法。

###  导入方式

```typescript
import  {  Hash,  hash  }  from  '@ldesign/crypto'

//  使用类
const  hasher  =  new  Hash()

//  使用实例（推荐）
import  {  hash  }  from  '@ldesign/crypto'
```

###  通用哈希方法

####  `hash(data,  algorithm?,  options?)`

计算数据的哈希值。

**参数：**

-  `data`  (string)  -  要哈希的数据
-  `algorithm`  (HashAlgorithm?)  -  哈希算法，默认  'SHA256'
-  `options`  (HashOptions?)  -  哈希选项

**HashAlgorithm  类型：**

```typescript
type  HashAlgorithm  =  'MD5'  |  'SHA1'  |  'SHA224'  |  'SHA256'  |  'SHA384'  |  'SHA512'
```

**HashOptions  接口：**

```typescript
interface  HashOptions  {
        encoding?:  'base64'  |  'hex'  |  'utf8'    //  输出编码，默认  hex
}
```

**返回值：**  `HashResult`

```typescript
interface  HashResult  {
        success:  boolean
        hash:  string                        //  哈希值
        algorithm:  string                //  使用的算法
        encoding:  EncodingType        //  编码类型
        error?:  string                    //  错误信息
}
```

**示例：**

```typescript
import  {  hash  }  from  '@ldesign/crypto'

//  默认使用  SHA256
const  result1  =  hash.hash('Hello  World')
console.log(result1.hash)

//  指定算法
const  result2  =  hash.hash('password123',  'SHA512')
console.log(result2.hash)

//  指定编码
const  result3  =  hash.hash('data',  'SHA256',  {  encoding:  'base64'  })
console.log(result3.hash)  //  Base64  编码的哈希值
```

###  verify(data,  expectedHash,  algorithm?,  options?)

验证数据的哈希值是否匹配。

**参数：**

-  `data`  (string)  -  原始数据
-  `expectedHash`  (string)  -  期望的哈希值
-  `algorithm`  (HashAlgorithm?)  -  哈希算法，默认  'SHA256'
-  `options`  (HashOptions?)  -  哈希选项

**返回值：**  `boolean`

**示例：**

```typescript
import  {  hash  }  from  '@ldesign/crypto'

const  password  =  'user-password'
const  storedHash  =  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'

//  验证密码
const  isValid  =  hash.verify(password,  storedHash,  'SHA256')
console.log('密码正确:',  isValid)

//  错误的密码
const  wrong  =  hash.verify('wrong-password',  storedHash,  'SHA256')
console.log('密码错误:',  wrong)  //  false
```

---

##  哈希算法

###  MD5

####  `md5(data,  options?)`

计算  MD5  哈希（不推荐用于安全敏感场景）。

**示例：**

```typescript
import  {  hash  }  from  '@ldesign/crypto'

const  result  =  hash.md5('Hello  World')
console.log(result)  //  'b10a8db164e0754105b7a99be72e3fe5'

//  Base64  编码
const  base64  =  hash.md5('data',  {  encoding:  'base64'  })
```

**注意：**  MD5  已被认为不安全，仅用于非安全场景（如校验和）。

###  SHA-1

####  `sha1(data,  options?)`

计算  SHA-1  哈希（不推荐用于新项目）。

**示例：**

```typescript
const  result  =  hash.sha1('Hello  World')
console.log(result)  //  40  个十六进制字符
```

**注意：**  SHA-1  存在碰撞漏洞，应使用  SHA-256  或更高版本。

###  SHA-224

####  `sha224(data,  options?)`

计算  SHA-224  哈希。

**示例：**

```typescript
const  result  =  hash.sha224('Hello  World')
console.log(result)  //  56  个十六进制字符
```

###  SHA-256（推荐）

####  `sha256(data,  options?)`

计算  SHA-256  哈希（最常用）。

**示例：**

```typescript
const  result  =  hash.sha256('Hello  World')
console.log(result)  //  64  个十六进制字符

//  密码哈希
const  passwordHash  =  hash.sha256('user-password-123')

//  文件完整性校验
const  fileHash  =  hash.sha256(fileContent)
```

**输出长度：**  64  个十六进制字符（256  位）

### SHA-384

####  `sha384(data,  options?)`

计算  SHA-384  哈希。

**示例：**

```typescript
const  result  =  hash.sha384('Hello  World')
console.log(result)  //  96  个十六进制字符
```

**输出长度：**  96  个十六进制字符（384  位）

###  SHA-512

####  `sha512(data,  options?)`

计算  SHA-512  哈希（最高安全性）。

**示例：**

```typescript
const  result  =  hash.sha512('Hello  World')
console.log(result)  //  128  个十六进制字符

//  高安全性应用
const  tokenHash  =  hash.sha512(securityToken)
```

**输出长度：**  128  个十六进制字符（512  位）

---

##  HMAC  类

HMAC（Hash-based  Message  Authentication  Code）提供消息认证功能。

###  导入方式

```typescript
import  {  HMAC,  hmac  }  from  '@ldesign/crypto'

//  使用类
const  hmacHasher  =  new  HMAC()

//  使用实例（推荐）
import  {  hmac  }  from  '@ldesign/crypto'
```

###  通用  HMAC  方法

####  `hmac(data,  key,  algorithm?,  options?)`

计算  HMAC  值。

**参数：**

-  `data`  (string)  -  要认证的数据
-  `key`  (string)  -  密钥
-  `algorithm`  (HashAlgorithm?)  -  哈希算法，默认  'SHA256'
-  `options`  (HashOptions?)  -  选项

**返回值：**  `string`  (哈希值)

**示例：**

```typescript
import  {  hmac  }  from  '@ldesign/crypto'

const  message  =  'Important  message'
const  secretKey  =  'my-secret-key'

//  计算  HMAC
const  hmacValue  =  hmac.hmac(message,  secretKey,  'SHA256')
console.log(hmacValue)

//  使用不同算法
const  hmac512  =  hmac.hmac(message,  secretKey,  'SHA512')
```

###  verify(data,  key,  expectedHmac,  algorithm?,  options?)

验证  HMAC  值。

**参数：**

-  `data`  (string)  -  原始数据
-  `key`  (string)  -  密钥
-  `expectedHmac`  (string)  -  期望的  HMAC  值
-  `algorithm`  (HashAlgorithm?)  -  哈希算法
-  `options`  (HashOptions?)  -  选项

**返回值：**  `boolean`

**示例：**

```typescript
import  {  hmac  }  from  '@ldesign/crypto'

const  message  =  'API  request  data'
const  key  =  'api-secret-key'

//  生成  HMAC
const  signature  =  hmac.sha256(message,  key)

//  验证  HMAC
const  isValid  =  hmac.verify(message,  key,  signature,  'SHA256')
console.log('签名有效:',  isValid)  //  true

//  篡改数据后验证失败
const  tamperedMessage  =  'API  request  data  modified'
const  invalid  =  hmac.verify(tamperedMessage,  key,  signature,  'SHA256')
console.log('签名无效:',  invalid)  //  false
```

---

##  HMAC  算法

###  HMAC-MD5

####  `md5(data,  key,  options?)`

**示例：**

```typescript
const  hmacMd5  =  hmac.md5('message',  'secret-key')
```

###  HMAC-SHA1

####  `sha1(data,  key,  options?)`

**示例：**

```typescript
const  hmacSha1  =  hmac.sha1('message',  'secret-key')
```

###  HMAC-SHA256（推荐）

####  `sha256(data,  key,  options?)`

最常用的  HMAC  算法。

**示例：**

```typescript
const  hmacSha256  =  hmac.sha256('message',  'secret-key')

//  API  签名
const  apiSignature  =  hmac.sha256(requestData,  apiSecretKey)

//  JWT  签名
const  jwtSignature  =  hmac.sha256(jwtPayload,  jwtSecret)
```

###  HMAC-SHA384

####  `sha384(data,  key,  options?)`

**示例：**

```typescript
const  hmacSha384  =  hmac.sha384('message',  'secret-key')
```

###  HMAC-SHA512

####  `sha512(data,  key,  options?)`

最高安全性的  HMAC。

**示例：**

```typescript
const  hmacSha512  =  hmac.sha512('message',  'secret-key')

//  高安全性应用
const  secureSignature  =  hmac.sha512(criticalData,  masterKey)
```

---

##  使用场景

###  密码存储

```typescript
import  {  hash,  keyGenerator  }  from  '@ldesign/crypto'

//  用户注册时
const  password  =  'user-password'
const  salt  =  keyGenerator.generateSalt(16)
const  passwordHash  =  hash.sha256(password  +  salt)

//  存储到数据库
const  user  =  {
        username:  'alice',
        passwordHash,
        salt
}

//  用户登录时验证
const  loginPassword  =  'user-password'
const  computedHash  =  hash.sha256(loginPassword  +  user.salt)
const  isValid  =  computedHash  ===  user.passwordHash
```

###  文件完整性校验

```typescript
import  {  hash  }  from  '@ldesign/crypto'

//  计算文件哈希
const  fileContent  =  readFileSync('important.pdf',  'utf8')
const  fileHash  =  hash.sha256(fileContent)

//  存储哈希值
saveToDatabase({  filename:  'important.pdf',  hash:  fileHash  })

//  验证文件完整性
const  currentContent  =  readFileSync('important.pdf',  'utf8')
const  currentHash  =  hash.sha256(currentContent)
const  isIntact  =  hash.verify(currentContent,  fileHash,  'SHA256')

if  (isIntact)  {
        console.log('文件完整无篡改')
}  else  {
        console.log('警告：文件已被修改!')
}
```

###  API  签名验证

```typescript
import  {  hmac  }  from  '@ldesign/crypto'

//  客户端：生成签名
const  apiKey  =  'user-api-key'
const  apiSecret  =  'user-api-secret'
const  timestamp  =  Date.now()
const  requestData  =  JSON.stringify({  action:  'transfer',  amount:  100  })

const  signatureData  =  `${apiKey}${timestamp}${requestData}`
const  signature  =  hmac.sha256(signatureData,  apiSecret)

//  发送请求
fetch('/api/transfer',  {
        headers:  {
                'X-API-Key':  apiKey,
                'X-Timestamp':  timestamp.toString(),
                'X-Signature':  signature
        },
        body:  requestData
})

//  服务端：验证签名
const  receivedSignature  =  request.headers['x-signature']
const  computedSignature  =  hmac.sha256(signatureData,  apiSecret)
const  isValid  =  hmac.verify(signatureData,  apiSecret,  receivedSignature,  'SHA256')

if  (isValid)  {
        //  处理请求
}  else  {
        //  拒绝请求
        throw  new  Error('Invalid  signature')
}
```

###  数据去重

```typescript
import  {  hash  }  from  '@ldesign/crypto'

const  seen  =  new  Set<string>()

function  isDuplicate(data:  string):  boolean  {
        const  dataHash  =  hash.sha256(data)

        if  (seen.has(dataHash))  {
                return  true
        }

        seen.add(dataHash)
        return  false
}

//  使用
console.log(isDuplicate('message1'))  //  false
console.log(isDuplicate('message2'))  //  false
console.log(isDuplicate('message1'))  //  true  (重复)
```

###  内容寻址

```typescript
import  {  hash  }  from  '@ldesign/crypto'

//  根据内容生成唯一  ID
function  getContentId(content:  string):  string  {
        return  hash.sha256(content)
}

const  document  =  '这是文档内容...'
const  docId  =  getContentId(document)

//  存储
storage.set(docId,  document)

//  检索
const  retrieved  =  storage.get(docId)
```

###  Token  生成

```typescript
import  {  hash,  keyGenerator  }  from  '@ldesign/crypto'

//  生成唯一  token
function  generateToken(userId:  number):  string  {
        const  random  =  keyGenerator.generateRandomBytes(32)
        const  timestamp  =  Date.now()
        const  data  =  `${userId}-${timestamp}-${random}`
        return  hash.sha256(data)
}

const  userToken  =  generateToken(12345)
console.log(userToken)
```

---

##  编码输出

哈希结果支持多种编码格式。

###  Hex  编码（默认）

```typescript
const  hexHash  =  hash.sha256('data')
//  输出：64  个十六进制字符
console.log(hexHash)  //  'a3c3b...'
```

###  Base64  编码

```typescript
const  base64Hash  =  hash.sha256('data',  {  encoding:  'base64'  })
//  输出：Base64  字符串（更短）
console.log(base64Hash)
```

###  UTF-8  编码

```typescript
const  utf8Hash  =  hash.sha256('data',  {  encoding:  'utf8'  })
//  输出：UTF-8  字符串（二进制数据，可能不可读）
```

---

##  链式哈希

使用链式  API  进行多次哈希。

```typescript
import  {  chain  }  from  '@ldesign/crypto'

//  单次哈希
const  once  =  chain('password')
        .hash('SHA256')
        .execute()

//  多次哈希（增强安全性）
const  twice  =  chain('password')
        .hash('SHA256')
        .hash('SHA256')
        .execute()

//  使用  hashPassword  快捷方法
import  {  hashPassword  }  from  '@ldesign/crypto'
const  hashed  =  hashPassword('password',  10000)  //  10000  次  SHA-256
```

---

##  性能对比

不同算法的性能特点：

|  算法        |  输出长度  |  速度    |  安全性  |  推荐用途                  |
|------------|---------|--------|--------|------------------------|
|  MD5            |  128位    |  最快    |  低        |  非安全校验                |
|  SHA1          |  160位    |  快        |  低        |  兼容旧系统                |
|  SHA256      |  256位    |  中        |  高        |  通用哈希（推荐）          |
|  SHA384      |  384位    |  中慢    |  高        |  高安全性应用              |
|  SHA512      |  512位    |  慢        |  最高    |  最高安全性需求            |

---

##  最佳实践

###  算法选择

```typescript
//  ✓  推荐：使用  SHA-256  或更高
const  hash  =  hash.sha256(data)
const  hmac  =  hmac.sha256(data,  key)

//  ✗  不推荐：使用  MD5  或  SHA-1（安全性低）
const  badHash  =  hash.md5(data)
```

###  密码哈希

```typescript
//  ✗  不要：直接哈希密码
const  bad  =  hash.sha256(password)

//  ✓  推荐：使用盐值
import  {  keyGenerator  }  from  '@ldesign/crypto'
const  salt  =  keyGenerator.generateSalt()
const  good  =  hash.sha256(password  +  salt)

//  ✓  更好：使用专门的密钥派生函数（KDF）
import  {  deriveKey  }  from  '@ldesign/crypto'
const  better  =  deriveKey(password,  salt,  {  iterations:  100000  })
```

###  HMAC  密钥管理

```typescript
//  ✓  推荐：使用强随机密钥
import  {  keyGenerator  }  from  '@ldesign/crypto'
const  key  =  keyGenerator.generateKey(32)

//  ✗  不推荐：使用弱密钥
const  weakKey  =  '123456'

//  ✓  推荐：密钥长度至少等于哈希输出长度
const  hmac256  =  hmac.sha256(data,  key)  //  key  应至少  32  字节
const  hmac512  =  hmac.sha512(data,  key)  //  key  应至少  64  字节
```

###  数据完整性验证

```typescript
//  ✓  推荐：使用  HMAC  而非普通哈希
const  signature  =  hmac.sha256(data,  secretKey)

//  ✗  不推荐：仅使用哈希（无法防止攻击者替换）
const  unsafeHash  =  hash.sha256(data)
```

###  性能优化

```typescript
//  对于大量相同数据的哈希，考虑缓存
const  hashCache  =  new  Map<string,  string>()

function  cachedHash(data:  string):  string  {
        if  (hashCache.has(data))  {
                return  hashCache.get(data)!
        }

        const  result  =  hash.sha256(data)
        hashCache.set(data,  result)
        return  result
}
```

###  安全建议

1.  **不要用于加密**：哈希是单向的，不能解密
2.  **添加盐值**：密码哈希必须使用盐值
3.  **使用  HMAC**：需要认证时使用  HMAC
4.  **选择合适算法**：根据安全需求选择
5.  **密钥保密**：HMAC  密钥必须保密

---

##  相关链接

-  [加密  API](./encryption.md)
-  [密钥生成  API](./key-generation.md)
-  [工具函数  API](./utilities.md)
-  [类型定义](./types.md)
