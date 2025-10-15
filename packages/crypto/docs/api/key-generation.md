#  密钥生成  API

本文档描述了  @ldesign/crypto  提供的密钥和随机数生成功能。

##  目录

-  [KeyGenerator  类](#keygenerator-类)
-  [RSA  密钥对生成](#rsa-密钥对生成)
-  [对称密钥生成](#对称密钥生成)
-  [随机数生成](#随机数生成)
-  [盐值生成](#盐值生成)
-  [IV  生成](#iv-生成)
-  [最佳实践](#最佳实践)

##  KeyGenerator  类

`KeyGenerator`  类提供了密钥和随机数生成功能。

###  导入方式

```typescript
import  {  KeyGenerator,  keyGenerator  }  from  '@ldesign/crypto'

//  使用类
const  generator  =  new  KeyGenerator()

//  使用实例（推荐）
import  {  keyGenerator  }  from  '@ldesign/crypto'
```

---

##  RSA  密钥对生成

###  `generateRSAKeyPair(keySize?)`

生成  RSA  公钥和私钥对。

**参数：**

-  `keySize`  (number?)  -  密钥大小（位），可选值：1024  |  2048  |  3072  |  4096，默认  2048

**返回值：**  `RSAKeyPair`

```typescript
interface  RSAKeyPair  {
        publicKey:  string        //  PEM  格式的公钥
        privateKey:  string      //  PEM  格式的私钥
}
```

**示例：**

```typescript
import  {  keyGenerator  }  from  '@ldesign/crypto'

//  生成  2048  位密钥对（默认）
const  keyPair  =  keyGenerator.generateRSAKeyPair()
console.log('公钥:',  keyPair.publicKey)
console.log('私钥:',  keyPair.privateKey)

//  生成  4096  位密钥对（更安全）
const  strongKeyPair  =  keyGenerator.generateRSAKeyPair(4096)

//  使用密钥对
import  {  encrypt,  decrypt  }  from  '@ldesign/crypto'
const  encrypted  =  encrypt.rsa('data',  keyPair.publicKey)
const  decrypted  =  decrypt.rsa(encrypted,  keyPair.privateKey)
```

###  密钥大小选择

|  密钥大小  |  安全性  |  生成速度  |  加密速度  |  推荐用途                      |
|--------|------|--------|--------|------------------------|
|  1024  |  低      |  快          |  快          |  不推荐（已不安全）        |
|  2048  |  中      |  中          |  中          |  一般应用（推荐）            |
|  3072  |  高      |  慢          |  慢          |  高安全性应用                  |
|  4096  |  最高  |  最慢      |  最慢      |  最高安全性需求              |

**示例：**

```typescript
//  根据安全需求选择
const  general  =  keyGenerator.generateRSAKeyPair(2048)        //  一般应用
const  secure  =  keyGenerator.generateRSAKeyPair(3072)          //  高安全性
const  topSecret  =  keyGenerator.generateRSAKeyPair(4096)  //  最高安全性
```

###  密钥格式

生成的密钥为  PEM  格式：

```typescript
const  keyPair  =  keyGenerator.generateRSAKeyPair(2048)

//  公钥格式
console.log(keyPair.publicKey)
/*
-----BEGIN  PUBLIC  KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END  PUBLIC  KEY-----
*/

//  私钥格式
console.log(keyPair.privateKey)
/*
-----BEGIN  PRIVATE  KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
-----END  PRIVATE  KEY-----
*/
```

---

##  对称密钥生成

###  `generateKey(length?)`

生成随机对称加密密钥（十六进制格式）。

**参数：**

-  `length`  (number?)  -  密钥字节长度，默认  32（256  位）

**返回值：**  `string`  (十六进制字符串，长度为  length  ×  2)

**示例：**

```typescript
import  {  keyGenerator  }  from  '@ldesign/crypto'

//  生成  256  位密钥（默认，32  字节  =  64  个十六进制字符）
const  key256  =  keyGenerator.generateKey()
console.log(key256.length)  //  64

//  生成  128  位密钥（16  字节  =  32  个十六进制字符）
const  key128  =  keyGenerator.generateKey(16)
console.log(key128.length)  //  32

//  生成  192  位密钥（24  字节  =  48  个十六进制字符）
const  key192  =  keyGenerator.generateKey(24)
console.log(key192.length)  //  48

//  使用生成的密钥
import  {  encrypt  }  from  '@ldesign/crypto'
const  encrypted  =  encrypt.aes('data',  key256,  {  keySize:  256  })
```

###  常用密钥长度

```typescript
//  AES  密钥
const  aes128Key  =  keyGenerator.generateKey(16)    //  128  位
const  aes192Key  =  keyGenerator.generateKey(24)    //  192  位
const  aes256Key  =  keyGenerator.generateKey(32)    //  256  位（推荐）

//  DES  密钥
const  desKey  =  keyGenerator.generateKey(8)            //  64  位

//  3DES  密钥
const  des3Key  =  keyGenerator.generateKey(24)      //  192  位

//  Blowfish  密钥（可变长度  4-56  字节）
const  blowfishKey  =  keyGenerator.generateKey(16)  //  128  位
```

---

##  随机数生成

###  `generateRandomBytes(length)`

生成指定长度的随机字节（十六进制格式）。

**参数：**

-  `length`  (number)  -  字节长度

**返回值：**  `string`  (十六进制字符串)

**示例：**

```typescript
import  {  keyGenerator  }  from  '@ldesign/crypto'

//  生成  16  字节随机数
const  random16  =  keyGenerator.generateRandomBytes(16)
console.log(random16.length)  //  32  个十六进制字符

//  生成  32  字节随机数
const  random32  =  keyGenerator.generateRandomBytes(32)
console.log(random32.length)  //  64  个十六进制字符

//  用于生成唯一  ID
const  uniqueId  =  keyGenerator.generateRandomBytes(16)

//  用于生成  Token
const  token  =  keyGenerator.generateRandomBytes(32)
```

---

##  盐值生成

###  `generateSalt(length?)`

生成密码哈希盐值。

**参数：**

-  `length`  (number?)  -  盐值字节长度，默认  16

**返回值：**  `string`  (十六进制字符串)

**示例：**

```typescript
import  {  keyGenerator,  hash  }  from  '@ldesign/crypto'

//  生成盐值（默认  16  字节）
const  salt  =  keyGenerator.generateSalt()
console.log(salt.length)  //  32  个十六进制字符

//  生成  32  字节盐值（更安全）
const  longSalt  =  keyGenerator.generateSalt(32)

//  用于密码哈希
const  password  =  'user-password'
const  saltedPassword  =  password  +  salt
const  passwordHash  =  hash.sha256(saltedPassword)

//  存储用户数据
const  user  =  {
        username:  'alice',
        passwordHash,
        salt
}
```

###  盐值最佳实践

```typescript
//  注册新用户
function  registerUser(username:  string,  password:  string)  {
        //  1.  生成唯一盐值
        const  salt  =  keyGenerator.generateSalt(16)

        //  2.  哈希密码
        const  passwordHash  =  hash.sha256(password  +  salt)

        //  3.  存储
        return  {
                username,
                passwordHash,
                salt        //  盐值需要存储
        }
}

//  验证用户登录
function  verifyUser(username:  string,  password:  string,  storedUser:  any)  {
        //  使用存储的盐值
        const  computedHash  =  hash.sha256(password  +  storedUser.salt)
        return  computedHash  ===  storedUser.passwordHash
}
```

---

##  IV  生成

###  `generateIV(length?)`

生成初始化向量（Initialization  Vector）。

**参数：**

-  `length`  (number?)  -  IV  字节长度，默认  16

**返回值：**  `string`  (十六进制字符串)

**示例：**

```typescript
import  {  keyGenerator,  encrypt  }  from  '@ldesign/crypto'

//  生成  IV（默认  16  字节  =  128  位）
const  iv  =  keyGenerator.generateIV()
console.log(iv.length)  //  32  个十六进制字符

//  使用自定义  IV  加密
const  encrypted  =  encrypt.aes('data',  'key',  {
        iv,
        keySize:  256,
        mode:  'CBC'
})

//  每次加密使用不同的  IV
const  messages  =  ['msg1',  'msg2',  'msg3']
const  encrypted  =  messages.map(msg  =>  {
        const  iv  =  keyGenerator.generateIV()
        return  encrypt.aes(msg,  'key',  {  iv  })
})
```

###  IV  长度要求

不同算法对  IV  长度的要求：

```typescript
//  AES（所有模式除  ECB）
const  aesIV  =  keyGenerator.generateIV(16)        //  16  字节

//  DES
const  desIV  =  keyGenerator.generateIV(8)          //  8  字节

//  3DES
const  des3IV  =  keyGenerator.generateIV(8)        //  8  字节

//  Blowfish
const  blowfishIV  =  keyGenerator.generateIV(8)  //  8  字节
```

###  IV  使用注意事项

```typescript
//  ✓  正确：每次加密使用新的  IV
const  encrypt1  =  encrypt.aes('data1',  'key',  {  iv:  keyGenerator.generateIV()  })
const  encrypt2  =  encrypt.aes('data2',  'key',  {  iv:  keyGenerator.generateIV()  })

//  ✗  错误：重用  IV（不安全！）
const  sameIV  =  keyGenerator.generateIV()
const  bad1  =  encrypt.aes('data1',  'key',  {  iv:  sameIV  })
const  bad2  =  encrypt.aes('data2',  'key',  {  iv:  sameIV  })  //  危险！

//  ✓  推荐：让库自动生成  IV
const  auto  =  encrypt.aes('data',  'key')  //  自动生成唯一  IV
```

---

##  完整示例

###  用户注册和登录系统

```typescript
import  {  keyGenerator,  hash,  encrypt,  decrypt  }  from  '@ldesign/crypto'

//  用户注册
function  registerUser(username:  string,  password:  string)  {
        //  生成盐值
        const  salt  =  keyGenerator.generateSalt(16)

        //  哈希密码
        const  passwordHash  =  hash.sha256(password  +  salt)

        //  生成用户  ID
        const  userId  =  keyGenerator.generateRandomBytes(16)

        return  {
                userId,
                username,
                passwordHash,
                salt,
                createdAt:  new  Date()
        }
}

//  用户登录验证
function  verifyLogin(username:  string,  password:  string,  storedUser:  any):  boolean  {
        const  computedHash  =  hash.sha256(password  +  storedUser.salt)
        return  computedHash  ===  storedUser.passwordHash
}

//  使用
const  newUser  =  registerUser('alice',  'password123')
console.log('注册成功:',  newUser)

const  isValid  =  verifyLogin('alice',  'password123',  newUser)
console.log('登录验证:',  isValid)  //  true
```

###  生成  API  密钥对

```typescript
import  {  keyGenerator  }  from  '@ldesign/crypto'

function  generateAPIKeys()  {
        //  生成  API  Key（公开）
        const  apiKey  =  keyGenerator.generateRandomBytes(16)

        //  生成  API  Secret（保密）
        const  apiSecret  =  keyGenerator.generateKey(32)

        return  {
                apiKey,
                apiSecret,
                createdAt:  new  Date(),
                expiresAt:  new  Date(Date.now()  +  365  *  24  *  60  *  60  *  1000)  //  1年
        }
}

const  credentials  =  generateAPIKeys()
console.log('API  Key:',  credentials.apiKey)
console.log('API  Secret:',  credentials.apiSecret)
```

###  生成加密密钥和  IV

```typescript
import  {  keyGenerator,  encrypt,  decrypt  }  from  '@ldesign/crypto'

//  初始化加密系统
function  setupEncryption()  {
        //  生成主密钥
        const  masterKey  =  keyGenerator.generateKey(32)

        //  生成  IV
        const  iv  =  keyGenerator.generateIV(16)

        return  {  masterKey,  iv  }
}

//  使用
const  {  masterKey,  iv  }  =  setupEncryption()

//  加密数据
const  encrypted  =  encrypt.aes256('sensitive  data',  masterKey,  {  iv  })

//  解密数据
const  decrypted  =  decrypt.aes256(encrypted,  masterKey)
```

###  生成唯一  Token

```typescript
import  {  keyGenerator,  hash  }  from  '@ldesign/crypto'

function  generateToken(userId:  number):  string  {
        //  生成随机部分
        const  random  =  keyGenerator.generateRandomBytes(32)

        //  组合数据
        const  timestamp  =  Date.now()
        const  data  =  `${userId}-${timestamp}-${random}`

        //  生成  Token
        const  token  =  hash.sha256(data)

        return  token
}

//  使用
const  userToken  =  generateToken(12345)
console.log('Token:',  userToken)

//  生成会话  Token
function  generateSessionToken():  string  {
        return  keyGenerator.generateRandomBytes(32)
}

const  sessionToken  =  generateSessionToken()
```

###  生成加密密钥层次

```typescript
import  {  keyGenerator,  encrypt  }  from  '@ldesign/crypto'

//  主密钥（最高级别，离线存储）
const  masterKey  =  keyGenerator.generateKey(32)

//  数据加密密钥（用主密钥加密）
const  dataKey  =  keyGenerator.generateKey(32)
const  encryptedDataKey  =  encrypt.aes256(dataKey,  masterKey)

//  使用数据密钥加密实际数据
const  sensitiveData  =  '用户敏感信息'
const  encryptedData  =  encrypt.aes256(sensitiveData,  dataKey)

//  存储结构
const  storage  =  {
        encryptedData,                          //  加密的数据
        encryptedDataKey,                      //  加密的数据密钥
        masterKeyId:  'master-key-001'  //  主密钥标识符
}
```

---

##  工具函数

###  RandomUtils  类

底层随机数生成工具。

```typescript
import  {  RandomUtils  }  from  '@ldesign/crypto'

//  生成随机字符串（指定编码）
const  hexString  =  RandomUtils.generateRandomString(16,  'hex')
const  base64String  =  RandomUtils.generateRandomString(16,  'base64')

//  生成盐值
const  salt  =  RandomUtils.generateSalt(16)

//  生成  IV
const  iv  =  RandomUtils.generateIV(16)

//  生成密钥
const  key  =  RandomUtils.generateKey(32)
```

---

##  最佳实践

###  密钥长度选择

```typescript
//  ✓  推荐：使用足够长的密钥
const  strongKey  =  keyGenerator.generateKey(32)        //  256  位

//  ✗  不推荐：使用过短的密钥
const  weakKey  =  keyGenerator.generateKey(8)            //  64  位（不安全）

//  根据算法选择
const  aes256  =  keyGenerator.generateKey(32)          //  AES-256
const  aes192  =  keyGenerator.generateKey(24)          //  AES-192
const  aes128  =  keyGenerator.generateKey(16)          //  AES-128
```

###  密钥存储

```typescript
//  ✗  不要：硬编码密钥
const  bad  =  '0123456789abcdef'

//  ✓  推荐：从安全位置加载
const  key  =  process.env.ENCRYPTION_KEY  ||  keyGenerator.generateKey(32)

//  ✓  推荐：使用密钥管理服务
const  key  =  await  keyManagementService.getKey('master-key')

//  ✓  推荐：临时密钥（用完即弃）
function  encryptTemporary(data:  string):  {  encrypted:  any,  key:  string  }  {
        const  tempKey  =  keyGenerator.generateKey(32)
        const  encrypted  =  encrypt.aes256(data,  tempKey)
        return  {  encrypted,  key:  tempKey  }
}
```

###  盐值管理

```typescript
//  ✓  推荐：每个用户使用唯一盐值
function  hashPassword(password:  string):  {  hash:  string,  salt:  string  }  {
        const  salt  =  keyGenerator.generateSalt()
        const  hash  =  hash.sha256(password  +  salt)
        return  {  hash,  salt  }
}

//  ✗  不要：使用固定盐值（所有用户共享）
const  globalSalt  =  'fixed-salt'  //  危险！
```

###  IV  管理

```typescript
//  ✓  推荐：每次加密生成新的  IV
function  encryptMessage(message:  string,  key:  string)  {
        const  iv  =  keyGenerator.generateIV()
        return  encrypt.aes(message,  key,  {  iv  })
}

//  ✗  不要：重用  IV
const  sharedIV  =  keyGenerator.generateIV()
const  bad1  =  encrypt.aes('msg1',  'key',  {  iv:  sharedIV  })
const  bad2  =  encrypt.aes('msg2',  'key',  {  iv:  sharedIV  })  //  不安全！
```

###  密钥轮换

```typescript
import  {  keyGenerator,  encrypt,  decrypt  }  from  '@ldesign/crypto'

class  KeyRotation  {
        private  currentKey:  string
        private  previousKey?:  string

        constructor()  {
                this.currentKey  =  keyGenerator.generateKey(32)
        }

        //  轮换密钥
        rotate()  {
                this.previousKey  =  this.currentKey
                this.currentKey  =  keyGenerator.generateKey(32)
        }

        //  使用当前密钥加密
        encrypt(data:  string)  {
                return  encrypt.aes256(data,  this.currentKey)
        }

        //  尝试解密（支持旧密钥）
        decrypt(encrypted:  any)  {
                let  result  =  decrypt.aes(encrypted,  this.currentKey)
                if  (!result.success  &&  this.previousKey)  {
                        result  =  decrypt.aes(encrypted,  this.previousKey)
                }
                return  result
        }
}

const  rotation  =  new  KeyRotation()
const  enc  =  rotation.encrypt('data')
rotation.rotate()  //  轮换密钥
const  dec  =  rotation.decrypt(enc)  //  仍可解密
```

###  安全建议

1.  **密钥长度**
      -  AES  使用  256  位密钥
      -  RSA  使用至少  2048  位密钥
      -  避免使用过短的密钥

2.  **随机性**
      -  使用密码学安全的随机数生成器
      -  不要使用  Math.random()

3.  **密钥存储**
      -  不要硬编码密钥
      -  使用环境变量或密钥管理服务
      -  加密存储的密钥

4.  **密钥轮换**
      -  定期更换密钥
      -  保留旧密钥以解密历史数据
      -  安全销毁不再使用的密钥

5.  **盐值和  IV**
      -  每次使用生成新的盐值和  IV
      -  不要重用盐值和  IV
      -  盐值和  IV  可以公开存储

---

##  相关链接

-  [加密  API](./encryption.md)
-  [解密  API](./decryption.md)
-  [工具函数  API](./utilities.md)
-  [类型定义](./types.md)
