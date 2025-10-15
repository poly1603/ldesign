#  加密  API

本文档描述了  @ldesign/crypto  提供的所有加密功能。

##  目录

-  [Encrypt  类](#encrypt-类)
-  [AES  加密](#aes-加密)
-  [RSA  加密](#rsa-加密)
-  [DES/3DES  加密](#des3des-加密)
-  [Blowfish  加密](#blowfish-加密)
-  [编码功能](#编码功能)
-  [链式加密](#链式加密)
-  [认证加密](#认证加密)

##  Encrypt  类

`Encrypt`  类提供了统一的加密  API，支持多种加密算法。

###  导入方式

```typescript
import  {  Encrypt,  encrypt  }  from  '@ldesign/crypto'

//  使用类
const  encryptor  =  new  Encrypt()

//  使用实例（推荐）
import  {  encrypt  }  from  '@ldesign/crypto'
```

###  通用加密方法

####  `encrypt(data,  key,  algorithm,  options?)`

根据算法类型自动选择合适的加密方法。

**参数：**

-  `data`  (string)  -  要加密的明文数据
-  `key`  (string)  -  加密密钥
-  `algorithm`  (EncryptionAlgorithm)  -  加密算法：'AES'  |  'RSA'  |  'DES'  |  '3DES'  |  'Blowfish'
-  `options`  (EncryptionOptions?)  -  可选的加密选项

**返回值：**  `EncryptResult`

**示例：**

```typescript
import  {  encrypt  }  from  '@ldesign/crypto'

//  使用  AES  加密
const  result  =  encrypt.encrypt('Hello  World',  'my-secret-key',  'AES',  {
    keySize:  256,
    mode:  'CBC'
})

if  (result.success)  {
    console.log('加密成功:',  result.data)
    console.log('IV:',  result.iv)
}  else  {
    console.error('加密失败:',  result.error)
}
```

---

##  AES  加密

高级加密标准（AES）是最常用和最安全的对称加密算法。

###  `aes(data,  key,  options?)`

使用  AES  算法加密数据，默认使用  AES-256-CBC。

**参数：**

-  `data`  (string)  -  要加密的明文
-  `key`  (string)  -  加密密钥（普通字符串或十六进制）
-  `options`  (AESOptions?)  -  加密选项

**AESOptions  接口：**

```typescript
interface  AESOptions  {
    mode?:  'CBC'  |  'ECB'  |  'CFB'  |  'OFB'  |  'CTR'  |  'GCM'    //  加密模式，默认  CBC
    keySize?:  128  |  192  |  256                                  //  密钥大小（位），默认  256
    iv?:  string                                                    //  初始化向量（十六进制）
    padding?:  string                                                //  填充方式，默认  Pkcs7
    salt?:  string                                                  //  密钥派生盐值
    iterations?:  number                                            //  PBKDF2  迭代次数，默认  100000
}
```

**返回值：**  `EncryptResult`

**示例：**

```typescript
import  {  encrypt  }  from  '@ldesign/crypto'

//  基本用法
const  result1  =  encrypt.aes('Hello  World',  'my-secret-key')

//  指定选项
const  result2  =  encrypt.aes('Sensitive  Data',  'my-secret-key',  {
    keySize:  256,
    mode:  'CBC'
})

//  使用自定义  IV
const  result3  =  encrypt.aes('Data',  'key',  {
    iv:  '0123456789abcdef0123456789abcdef',    //  32  个十六进制字符（16  字节）
    keySize:  256
})

console.log('加密结果:',  result1.data)
console.log('IV:',  result1.iv)
console.log('算法:',  result1.algorithm)
```

###  AES  快捷方法

####  `aes128(data,  key,  options?)`

使用  AES-128  加密。

```typescript
const  result  =  encrypt.aes128('Hello',  'key')
```

####  `aes192(data,  key,  options?)`

使用  AES-192  加密。

```typescript
const  result  =  encrypt.aes192('Hello',  'key')
```

####  `aes256(data,  key,  options?)`

使用  AES-256  加密（推荐）。

```typescript
const  result  =  encrypt.aes256('Hello',  'key')
```

###  密钥派生

当传入普通字符串密钥时，AES  会自动使用  PBKDF2  进行密钥派生：

```typescript
//  使用普通字符串密钥（会自动派生）
const  result  =  encrypt.aes('data',  'my-password',  {
    keySize:  256,
    iterations:  100000    //  迭代次数
})

//  使用十六进制密钥（不会派生，直接使用）
const  hexKey  =  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
const  result2  =  encrypt.aes('data',  hexKey,  {  keySize:  256  })
```

###  AES  加密模式

####  CBC  模式（推荐）

密码分组链接模式，需要  IV，最常用。

```typescript
const  result  =  encrypt.aes('data',  'key',  {  mode:  'CBC'  })
```

####  GCM  模式

认证加密模式，提供加密和认证。

```typescript
const  result  =  encrypt.aes('data',  'key',  {  mode:  'GCM'  })
```

####  CTR  模式

计数器模式，可以并行加密。

```typescript
const  result  =  encrypt.aes('data',  'key',  {  mode:  'CTR'  })
```

###  注意事项

1.  **IV  管理**：每次加密应使用不同的  IV，加密结果会自动包含  IV
2.  **密钥强度**：推荐使用  256  位密钥
3.  **模式选择**：推荐使用  CBC  或  GCM  模式
4.  **密钥存储**：不要将密钥硬编码在代码中

---

##  RSA  加密

RSA  是非对称加密算法，使用公钥加密、私钥解密。

###  `rsa(data,  publicKey,  options?)`

使用  RSA  公钥加密数据。

**参数：**

-  `data`  (string)  -  要加密的明文（数据量不能太大）
-  `publicKey`  (string)  -  RSA  公钥（PEM  格式）
-  `options`  (RSAOptions?)  -  加密选项

**RSAOptions  接口：**

```typescript
interface  RSAOptions  {
    keyFormat?:  'pkcs1'  |  'pkcs8'  |  'spki'    //  密钥格式，默认  pkcs1
    keySize?:  number                              //  密钥大小（位），默认  2048
    padding?:  string                              //  填充方式，默认  OAEP
}
```

**返回值：**  `EncryptResult`

**示例：**

```typescript
import  {  encrypt,  keyGenerator  }  from  '@ldesign/crypto'

//  生成密钥对
const  keyPair  =  keyGenerator.generateRSAKeyPair(2048)

//  使用公钥加密
const  result  =  encrypt.rsa('Hello  World',  keyPair.publicKey)

console.log('加密结果:',  result.data)
console.log('算法:',  result.algorithm)

//  指定选项
const  result2  =  encrypt.rsa('Data',  keyPair.publicKey,  {
    padding:  'OAEP',
    keySize:  2048
})
```

###  RSA  使用场景

RSA  主要用于：

1.  **密钥交换**：加密对称密钥
2.  **数字签名**：验证消息来源
3.  **小数据加密**：证书、令牌等

```typescript
//  用  RSA  加密  AES  密钥
const  aesKey  =  keyGenerator.generateKey(32)
const  encryptedKey  =  encrypt.rsa(aesKey,  publicKey)

//  用  AES  加密大数据
const  encryptedData  =  encrypt.aes(bigData,  aesKey)
```

###  注意事项

1.  **数据大小限制**：RSA  只能加密小于密钥长度的数据
2.  **性能**：RSA  加密比对称加密慢得多
3.  **推荐密钥大小**：至少  2048  位，推荐  3072  或  4096  位
4.  **填充方式**：推荐使用  OAEP  填充

---

##  DES/3DES  加密

数据加密标准（DES）和三重  DES（3DES）是传统的对称加密算法。

###  `des(data,  key,  options?)`

使用  DES  加密数据（不推荐用于新项目）。

**参数：**

-  `data`  (string)  -  要加密的明文
-  `key`  (string)  -  加密密钥（8  字节）
-  `options`  (DESOptions?)  -  加密选项

**DESOptions  接口：**

```typescript
interface  DESOptions  {
    mode?:  'CBC'  |  'ECB'  |  'CFB'  |  'OFB'    //  加密模式
    iv?:  string                                  //  初始化向量
    padding?:  string                            //  填充方式
}
```

**示例：**

```typescript
import  {  encrypt  }  from  '@ldesign/crypto'

const  result  =  encrypt.des('Hello',  '8bytekey')
```

###  `des3(data,  key,  options?)`  /  `tripledes(data,  key,  options?)`

使用  3DES  加密数据。

**参数：**

-  `data`  (string)  -  要加密的明文
-  `key`  (string)  -  加密密钥（24  字节）
-  `options`  (TripleDESOptions?)  -  加密选项

**示例：**

```typescript
const  result  =  encrypt.des3('Hello',  '24-byte-long-secret-key!')
//  或者
const  result2  =  encrypt.tripledes('Hello',  '24-byte-long-secret-key!')
```

###  注意事项

1.  **安全性**：DES  已被认为不安全，3DES  也逐渐被淘汰
2.  **推荐替代**：新项目应使用  AES
3.  **仅用于兼容**：仅在需要与旧系统兼容时使用

---

##  Blowfish  加密

Blowfish  是另一种对称加密算法，速度快但密钥长度可变。

###  `blowfish(data,  key,  options?)`

使用  Blowfish  加密数据。

**参数：**

-  `data`  (string)  -  要加密的明文
-  `key`  (string)  -  加密密钥（4-56  字节）
-  `options`  (BlowfishOptions?)  -  加密选项

**BlowfishOptions  接口：**

```typescript
interface  BlowfishOptions  {
    mode?:  'CBC'  |  'ECB'      //  加密模式
    iv?:  string                  //  初始化向量
    padding?:  boolean            //  是否填充
}
```

**示例：**

```typescript
import  {  encrypt  }  from  '@ldesign/crypto'

const  result  =  encrypt.blowfish('Hello  World',  'secret-key',  {
    mode:  'CBC'
})

console.log('加密结果:',  result.data)
```

---

##  编码功能

Encrypt  类还提供了编码功能。

###  `base64(data)`

将字符串编码为  Base64。

```typescript
const  encoded  =  encrypt.base64('Hello  World')
console.log(encoded)    //  'SGVsbG8gV29ybGQ='
```

###  `base64Url(data)`

将字符串编码为  URL  安全的  Base64。

```typescript
const  encoded  =  encrypt.base64Url('Hello  World')
```

###  `hex(data)`

将字符串编码为十六进制。

```typescript
const  encoded  =  encrypt.hex('Hello')
console.log(encoded)    //  '48656c6c6f'
```

###  `encode(data,  encodingType)`

通用编码方法。

```typescript
const  base64  =  encrypt.encode('Hello',  'base64')
const  hex  =  encrypt.encode('Hello',  'hex')
const  utf8  =  encrypt.encode('Hello',  'utf8')
```

---

##  链式加密

使用链式  API  进行流畅的加密操作。

###  基本用法

```typescript
import  {  chain  }  from  '@ldesign/crypto'

//  加密并编码
const  result  =  chain('Hello  World')
    .encrypt('AES',  'secret-key')
    .base64()
    .execute()

console.log('最终结果:',  result)
```

###  复杂链式操作

```typescript
//  多步骤处理
const  result  =  chain('原始数据')
    .hash('SHA256')                        //  先哈希
    .encrypt('AES',  'key')                //  再加密
    .base64()                              //  最后编码
    .toUpperCase()                        //  转大写
    .execute()

//  条件执行
const  result2  =  chain('data')
    .encrypt('AES',  'key')
    .if(needEncode,  c  =>  c.base64())    //  条件编码
    .execute()

//  自定义转换
const  result3  =  chain('data')
    .encrypt('AES',  'key')
    .transform(data  =>  data.slice(0,  10))  //  自定义处理
    .execute()
```

###  错误处理

```typescript
const  chainInstance  =  chain('data')
    .encrypt('AES',  'key')
    .base64()

if  (chainInstance.hasError())  {
    console.error('错误:',  chainInstance.getError())
}  else  {
    const  result  =  chainInstance.execute()
}
```

---

##  认证加密

认证加密（AEAD）同时提供加密和完整性保护。

###  `encryptWithAuth(data,  key,  options?)`

加密数据并生成认证标签。

**参数：**

-  `data`  (string)  -  要加密的明文
-  `key`  (string)  -  加密密钥
-  `options`  (AuthenticatedEncryptionOptions?)  -  选项

**AuthenticatedEncryptionOptions  接口：**

```typescript
interface  AuthenticatedEncryptionOptions  {
    algorithm?:  EncryptionAlgorithm    //  算法，默认  AES
    keySize?:  256  |  128  |  192        //  密钥大小，默认  256
    aad?:  string                        //  附加认证数据
    useGCM?:  boolean                    //  是否使用  GCM  模式
}
```

**返回值：**  `AuthenticatedEncryptResult`

```typescript
interface  AuthenticatedEncryptResult  {
    success:  boolean
    ciphertext:  string      //  加密数据
    authTag:  string          //  认证标签
    iv:  string              //  初始化向量
    salt:  string            //  盐值
    algorithm:  string
    aad?:  string            //  附加认证数据
    error?:  string
}
```

**示例：**

```typescript
import  {  encryptWithAuth,  decryptWithAuth  }  from  '@ldesign/crypto'

//  基本用法
const  result  =  encryptWithAuth('敏感数据',  'secret-key')

if  (result.success)  {
    console.log('加密结果:',  result.ciphertext)
    console.log('认证标签:',  result.authTag)

    //  解密并验证
    const  decrypted  =  decryptWithAuth(result,  'secret-key')
    if  (decrypted.verified)  {
        console.log('数据完整:',  decrypted.data)
    }  else  {
        console.error('数据可能被篡改!')
    }
}

//  使用附加认证数据
const  result2  =  encryptWithAuth('data',  'key',  {
    aad:  'user-id:12345',
    keySize:  256
})
```

###  JSON  认证加密

```typescript
import  {  encryptJSONWithAuth,  decryptJSONWithAuth  }  from  '@ldesign/crypto'

const  userData  =  {
    id:  1,
    name:  'Alice',
    email:  'alice@example.com'
}

//  加密  JSON
const  encrypted  =  encryptJSONWithAuth(userData,  'secret-key')

//  解密  JSON
const  result  =  decryptJSONWithAuth(encrypted,  'secret-key')
if  (result.verified)  {
    console.log('用户数据:',  result.data)
}  else  {
    console.error('数据验证失败')
}
```

---

##  完整示例

###  文件加密

```typescript
import  {  encrypt,  keyGenerator  }  from  '@ldesign/crypto'

//  生成随机密钥
const  key  =  keyGenerator.generateKey(32)

//  加密文件内容
const  fileContent  =  '这是文件内容...'
const  result  =  encrypt.aes256(fileContent,  key)

if  (result.success)  {
    //  保存加密结果
    const  encryptedData  =  {
        data:  result.data,
        iv:  result.iv,
        algorithm:  result.algorithm
    }

    //  可以将  encryptedData  保存到文件或数据库
    console.log('加密成功')
}
```

###  多层加密

```typescript
import  {  encrypt,  keyGenerator  }  from  '@ldesign/crypto'

//  第一层：AES  加密
const  aesKey  =  keyGenerator.generateKey(32)
const  aesResult  =  encrypt.aes256('敏感数据',  aesKey)

//  第二层：RSA  加密  AES  密钥
const  rsaKeys  =  keyGenerator.generateRSAKeyPair(2048)
const  encryptedKey  =  encrypt.rsa(aesKey,  rsaKeys.publicKey)

console.log('加密数据:',  aesResult.data)
console.log('加密密钥:',  encryptedKey.data)
```

---

##  最佳实践

1.  **算法选择**
      -  默认使用  AES-256
      -  RSA  仅用于密钥交换
      -  避免使用  DES  和  MD5

2.  **密钥管理**
      -  使用强随机密钥
      -  定期轮换密钥
      -  安全存储密钥

3.  **IV  管理**
      -  每次加密使用不同的  IV
      -  IV  可以公开，但不能重用

4.  **错误处理**
      -  始终检查  `success`  字段
      -  妥善处理错误信息

5.  **性能优化**
      -  批量操作使用管理器
      -  考虑使用缓存
      -  合理选择密钥派生迭代次数

---

##  相关链接

-  [解密  API](./decryption.md)
-  [密钥生成  API](./key-generation.md)
-  [管理器  API](./manager.md)
-  [类型定义](./types.md)
