#  类型定义  API

本文档描述了  @ldesign/crypto  的  TypeScript  类型定义。

##  目录

-  [算法类型](#算法类型)
-  [选项接口](#选项接口)
-  [结果接口](#结果接口)
-  [接口定义](#接口定义)
-  [其他类型](#其他类型)

##  算法类型

###  EncryptionAlgorithm

加密算法类型。

```typescript
type  EncryptionAlgorithm  =  'AES'  |  'RSA'  |  'DES'  |  '3DES'  |  'Blowfish'
```

**示例：**

```typescript
const  algorithm:  EncryptionAlgorithm  =  'AES'
```

###  HashAlgorithm

哈希算法类型。

```typescript
type  HashAlgorithm  =  'MD5'  |  'SHA1'  |  'SHA224'  |  'SHA256'  |  'SHA384'  |  'SHA512'
```

**示例：**

```typescript
const  algorithm:  HashAlgorithm  =  'SHA256'
```

###  AESMode

AES  加密模式。

```typescript
type  AESMode  =  'CBC'  |  'ECB'  |  'CFB'  |  'OFB'  |  'CTR'  |  'GCM'
```

###  AESKeySize

AES  密钥大小（位）。

```typescript
type  AESKeySize  =  128  |  192  |  256
```

###  EncodingType

编码类型。

```typescript
type  EncodingType  =  'base64'  |  'hex'  |  'utf8'
```

###  RSAKeyFormat

RSA  密钥格式。

```typescript
type  RSAKeyFormat  =  'pkcs1'  |  'pkcs8'  |  'spki'
```

---

##  选项接口

###  AESOptions

AES  加密/解密选项。

```typescript
interface  AESOptions  {
    mode?:  AESMode                    //  加密模式，默认  'CBC'
    keySize?:  AESKeySize      //  密钥大小，默认  256
    iv?:  string                            //  初始化向量（十六进制）
    padding?:  string                //  填充方式，默认  'Pkcs7'
    salt?:  string                        //  密钥派生盐值（十六进制）
    iterations?:  number        //  PBKDF2  迭代次数，默认  100000
}
```

**示例：**

```typescript
const  options:  AESOptions  =  {
    mode:  'CBC',
    keySize:  256,
    iv:  '0123456789abcdef0123456789abcdef',
    iterations:  100000
}
```

###  RSAOptions

RSA  加密/解密选项。

```typescript
interface  RSAOptions  {
    keyFormat?:  RSAKeyFormat    //  密钥格式，默认  'pkcs1'
    keySize?:  number                        //  密钥大小（位），默认  2048
    padding?:  string                        //  填充方式，默认  'OAEP'
}
```

**示例：**

```typescript
const  options:  RSAOptions  =  {
    keyFormat:  'pkcs8',
    keySize:  2048,
    padding:  'OAEP'
}
```

###  DESOptions

DES  加密/解密选项。

```typescript
interface  DESOptions  {
    mode?:  'CBC'  |  'ECB'  |  'CFB'  |  'OFB'
    iv?:  string
    padding?:  string
}
```

###  TripleDESOptions

3DES  加密/解密选项。

```typescript
interface  TripleDESOptions  {
    mode?:  'CBC'  |  'ECB'  |  'CFB'  |  'OFB'
    iv?:  string
    padding?:  string
}
```

###  BlowfishOptions

Blowfish  加密/解密选项。

```typescript
interface  BlowfishOptions  {
    mode?:  'CBC'  |  'ECB'
    iv?:  string
    padding?:  boolean
}
```

###  HashOptions

哈希选项。

```typescript
interface  HashOptions  {
    encoding?:  EncodingType    //  输出编码，默认  'hex'
}
```

**示例：**

```typescript
const  options:  HashOptions  =  {
    encoding:  'base64'
}
```

###  HMACOptions

HMAC  选项。

```typescript
interface  HMACOptions  {
    encoding?:  EncodingType    //  输出编码，默认  'hex'
}
```

###  EncryptionOptions

加密选项联合类型。

```typescript
type  EncryptionOptions  =
    |  AESOptions
    |  RSAOptions
    |  DESOptions
    |  TripleDESOptions
    |  BlowfishOptions
```

---

##  结果接口

###  EncryptResult

加密结果。

```typescript
interface  EncryptResult  {
    success:  boolean                //  操作是否成功
    data?:  string                      //  加密后的数据
    algorithm:  string              //  使用的算法
    mode?:  string                      //  加密模式
    iv?:  string                            //  初始化向量
    salt?:  string                        //  盐值
    keySize?:  number              //  密钥大小（位）
    nonce?:  string                    //  Nonce（用于  GCM  等模式）
    aad?:  string                          //  附加认证数据
    error?:  string                      //  错误信息
}
```

**示例：**

```typescript
const  result:  EncryptResult  =  {
    success:  true,
    data:  'U2FsdGVkX1...',
    algorithm:  'AES',
    mode:  'CBC',
    iv:  '0123456789abcdef0123456789abcdef',
    keySize:  256
}
```

###  DecryptResult

解密结果。

```typescript
interface  DecryptResult  {
    success:  boolean              //  操作是否成功
    data?:  string                    //  解密后的数据
    algorithm:  string            //  使用的算法
    mode?:  string                    //  加密模式
    error?:  string                  //  错误信息
}
```

**示例：**

```typescript
const  result:  DecryptResult  =  {
    success:  true,
    data:  'Hello  World',
    algorithm:  'AES',
    mode:  'CBC'
}
```

###  HashResult

哈希结果。

```typescript
interface  HashResult  {
    success:  boolean                    //  操作是否成功
    hash:  string                              //  哈希值
    algorithm:  string                  //  使用的算法
    encoding:  EncodingType    //  编码类型
    error?:  string                          //  错误信息
}
```

**示例：**

```typescript
const  result:  HashResult  =  {
    success:  true,
    hash:  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    algorithm:  'SHA256',
    encoding:  'hex'
}
```

###  RSAKeyPair

RSA  密钥对。

```typescript
interface  RSAKeyPair  {
    publicKey:  string      //  PEM  格式的公钥
    privateKey:  string    //  PEM  格式的私钥
}
```

**示例：**

```typescript
const  keyPair:  RSAKeyPair  =  {
    publicKey:  '-----BEGIN  PUBLIC  KEY-----\n...',
    privateKey:  '-----BEGIN  PRIVATE  KEY-----\n...'
}
```

---

##  接口定义

###  IEncryptor

加密器接口。

```typescript
interface  IEncryptor  {
    encrypt:  (
        data:  string,
        key:  string,
        options?:  any
    )  =>  EncryptResult  |  Promise<EncryptResult>

    decrypt:  (
        encryptedData:  string  |  EncryptResult,
        key:  string,
        options?:  any
    )  =>  DecryptResult  |  Promise<DecryptResult>
}
```

**示例：**

```typescript
class  MyEncryptor  implements  IEncryptor  {
    encrypt(data:  string,  key:  string,  options?:  any):  EncryptResult  {
        //  实现加密逻辑
        return  {
            success:  true,
            data:  '...',
            algorithm:  'CUSTOM'
        }
    }

    decrypt(encryptedData:  string  |  EncryptResult,  key:  string,  options?:  any):  DecryptResult  {
        //  实现解密逻辑
        return  {
            success:  true,
            data:  '...',
            algorithm:  'CUSTOM'
        }
    }
}
```

###  IHasher

哈希器接口。

```typescript
interface  IHasher  {
    hash:  (
        data:  string,
        algorithm?:  HashAlgorithm,
        options?:  HashOptions
    )  =>  HashResult

    verify:  (
        data:  string,
        expectedHash:  string,
        algorithm?:  HashAlgorithm,
        options?:  HashOptions
    )  =>  boolean
}
```

###  IHMACer

HMAC  接口。

```typescript
interface  IHMACer  {
    hmac:  (
        data:  string,
        key:  string,
        algorithm:  HMACAlgorithm,
        options?:  HMACOptions
    )  =>  HashResult

    verify:  (
        data:  string,
        key:  string,
        hmac:  string,
        algorithm:  HMACAlgorithm,
        options?:  HMACOptions
    )  =>  boolean
}
```

###  IEncoder

编码器接口。

```typescript
interface  IEncoder  {
    encode:  (data:  string,  encoding:  EncodingType)  =>  string
    decode:  (encodedData:  string,  encoding:  EncodingType)  =>  string
}
```

###  IKeyGenerator

密钥生成器接口。

```typescript
interface  IKeyGenerator  {
    generateKey:  (options:  KeyGenerationOptions)  =>  string  |  RSAKeyPair
    generateRandomBytes:  (length:  number)  =>  string
    generateSalt:  (length?:  number)  =>  string
    generateIV:  (length?:  number)  =>  string
}
```

---

##  其他类型

###  KeyGenerationOptions

密钥生成选项。

```typescript
interface  KeyGenerationOptions  {
    algorithm:  EncryptionAlgorithm
    keySize?:  number
    format?:  string
}
```

###  CryptoConfig

加密配置。

```typescript
interface  CryptoConfig  {
    defaultAlgorithm?:  EncryptionAlgorithm
    enableCache?:  boolean
    maxCacheSize?:  number
    enableParallel?:  boolean
    autoGenerateIV?:  boolean
    keyDerivation?:  boolean
    debug?:  boolean
    logLevel?:  'error'  |  'warn'  |  'info'  |  'debug'
}
```

###  BatchOperation

批量操作。

```typescript
interface  BatchOperation  {
    id:  string                                                              //  操作标识符
    data:  string                                                          //  数据
    key:  string                                                              //  密钥
    algorithm?:  EncryptionAlgorithm      //  算法
    options?:  any                                                      //  选项
}
```

###  BatchResult

批量结果。

```typescript
interface  BatchResult  {
    id:  string
    result:  EncryptResult  |  DecryptResult
}
```

###  CacheStats

缓存统计。

```typescript
interface  CacheStats  {
    size:  number              //  当前缓存条目数
    maxSize:  number      //  最大缓存大小
    hits:  number              //  缓存命中次数
    misses:  number          //  缓存未命中次数
    hitRate:  number      //  命中率（0-1）
}
```

###  PerformanceMetrics

性能指标。

```typescript
interface  PerformanceMetrics  {
    totalOperations:  number                //  总操作数
    successfulOperations:  number  //  成功操作数
    failedOperations:  number              //  失败操作数
    averageTime:  number                        //  平均处理时间（毫秒）
    cacheStats:  CacheStats                  //  缓存统计
}
```

###  AuthenticatedEncryptResult

认证加密结果。

```typescript
interface  AuthenticatedEncryptResult  {
    success:  boolean
    ciphertext:  string    //  加密数据（Base64）
    authTag:  string          //  认证标签（HMAC）
    iv:  string                      //  初始化向量
    salt:  string                  //  盐值
    algorithm:  string      //  算法
    aad?:  string                  //  附加认证数据
    error?:  string              //  错误信息
}
```

###  AuthenticatedDecryptResult

认证解密结果。

```typescript
interface  AuthenticatedDecryptResult  {
    success:  boolean      //  操作是否成功
    data:  string              //  解密后的数据
    verified:  boolean    //  认证是否通过
    error?:  string          //  错误信息
}
```

###  AuthenticatedEncryptionOptions

认证加密选项。

```typescript
interface  AuthenticatedEncryptionOptions  {
    algorithm?:  EncryptionAlgorithm      //  算法，默认  AES
    keySize?:  256  |  128  |  192                    //  密钥大小，默认  256
    aad?:  string                                                    //  附加认证数据
    useGCM?:  boolean                                        //  是否使用  GCM  模式
}
```

---

##  类型导入

###  导入所有类型

```typescript
import  type  {
    //  算法类型
    EncryptionAlgorithm,
    HashAlgorithm,
    AESMode,
    AESKeySize,
    EncodingType,
    RSAKeyFormat,

    //  选项类型
    AESOptions,
    RSAOptions,
    DESOptions,
    TripleDESOptions,
    BlowfishOptions,
    HashOptions,
    HMACOptions,
    EncryptionOptions,

    //  结果类型
    EncryptResult,
    DecryptResult,
    HashResult,
    RSAKeyPair,

    //  接口类型
    IEncryptor,
    IHasher,
    IHMACer,
    IEncoder,
    IKeyGenerator,

    //  其他类型
    KeyGenerationOptions,
    CryptoConfig,
    BatchOperation,
    BatchResult,
    CacheStats,
    PerformanceMetrics,
    AuthenticatedEncryptResult,
    AuthenticatedDecryptResult,
    AuthenticatedEncryptionOptions
}  from  '@ldesign/crypto'
```

###  按需导入

```typescript
//  仅导入需要的类型
import  type  {  EncryptResult,  DecryptResult  }  from  '@ldesign/crypto'
import  type  {  AESOptions,  HashOptions  }  from  '@ldesign/crypto'
```

---

##  类型使用示例

###  函数参数类型

```typescript
import  type  {  EncryptionAlgorithm,  AESOptions,  EncryptResult  }  from  '@ldesign/crypto'

function  encryptData(
    data:  string,
    key:  string,
    algorithm:  EncryptionAlgorithm,
    options?:  AESOptions
):  EncryptResult  {
    //  实现
}
```

###  变量类型

```typescript
import  type  {  HashAlgorithm,  RSAKeyPair  }  from  '@ldesign/crypto'

const  algorithm:  HashAlgorithm  =  'SHA256'
const  keyPair:  RSAKeyPair  =  generateRSAKeyPair()
```

###  接口实现

```typescript
import  type  {  IEncryptor,  EncryptResult,  DecryptResult  }  from  '@ldesign/crypto'

class  CustomEncryptor  implements  IEncryptor  {
    encrypt(data:  string,  key:  string):  EncryptResult  {
        //  实现
    }

    decrypt(encryptedData:  string  |  EncryptResult,  key:  string):  DecryptResult  {
        //  实现
    }
}
```

###  泛型类型

```typescript
import  type  {  EncryptResult  }  from  '@ldesign/crypto'

function  processEncryptResult<T  extends  EncryptResult>(result:  T):  void  {
    if  (result.success)  {
        console.log('加密成功:',  result.data)
    }
}
```

---

##  类型守卫

###  检查结果类型

```typescript
import  type  {  EncryptResult,  DecryptResult  }  from  '@ldesign/crypto'

function  isEncryptResult(result:  any):  result  is  EncryptResult  {
    return  'algorithm'  in  result  &&  'success'  in  result
}

function  isDecryptResult(result:  any):  result  is  DecryptResult  {
    return  'algorithm'  in  result  &&  'success'  in  result  &&  'data'  in  result
}

//  使用
const  result  =  encrypt.aes('data',  'key')
if  (isEncryptResult(result))  {
    console.log('这是加密结果')
}
```

###  检查算法类型

```typescript
function  isAESAlgorithm(algorithm:  string):  algorithm  is  'AES'  {
    return  algorithm  ===  'AES'
}

function  isHashAlgorithm(algorithm:  string):  algorithm  is  HashAlgorithm  {
    return  ['MD5',  'SHA1',  'SHA224',  'SHA256',  'SHA384',  'SHA512'].includes(algorithm)
}
```

---

##  最佳实践

###  使用类型注解

```typescript
//  ✓  推荐：明确的类型注解
import  type  {  EncryptResult,  AESOptions  }  from  '@ldesign/crypto'

const  options:  AESOptions  =  {
    keySize:  256,
    mode:  'CBC'
}

const  result:  EncryptResult  =  encrypt.aes('data',  'key',  options)
```

###  类型导入

```typescript
//  ✓  推荐：使用  type  关键字导入类型
import  type  {  EncryptResult  }  from  '@ldesign/crypto'

//  导入值和类型
import  {  encrypt  }  from  '@ldesign/crypto'
import  type  {  AESOptions  }  from  '@ldesign/crypto'
```

###  类型安全

```typescript
//  ✓  推荐：利用  TypeScript  类型检查
function  processResult(result:  EncryptResult):  void  {
    if  (result.success  &&  result.data)  {
        //  TypeScript  知道  result.data  存在
        console.log(result.data)
    }
}
```

---

##  相关链接

-  [加密  API](./encryption.md)
-  [解密  API](./decryption.md)
-  [哈希  API](./hashing.md)
-  [工具函数  API](./utilities.md)
-  [管理器  API](./manager.md)
