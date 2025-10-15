#  工具函数  API

本文档描述了  @ldesign/crypto  提供的实用工具函数。

##  目录

-  [StringUtils](#stringutils)
-  [RandomUtils](#randomutils)
-  [ValidationUtils](#validationutils)
-  [ErrorUtils](#errorutils)
-  [常量定义](#常量定义)

##  StringUtils

字符串转换和编码工具类。

###  导入

```typescript
import  {  StringUtils  }  from  '@ldesign/crypto'
```

###  方法

####  `stringToBase64(str)`

将  UTF-8  字符串转换为  Base64。

```typescript
const  base64  =  StringUtils.stringToBase64('Hello  World')
console.log(base64)  //  'SGVsbG8gV29ybGQ='
```

####  `base64ToString(base64)`

将  Base64  字符串转换为  UTF-8。

```typescript
const  str  =  StringUtils.base64ToString('SGVsbG8gV29ybGQ=')
console.log(str)  //  'Hello  World'
```

####  `stringToHex(str)`

将  UTF-8  字符串转换为十六进制。

```typescript
const  hex  =  StringUtils.stringToHex('Hello')
console.log(hex)  //  '48656c6c6f'
```

####  `hexToString(hex)`

将十六进制字符串转换为  UTF-8。

```typescript
const  str  =  StringUtils.hexToString('48656c6c6f')
console.log(str)  //  'Hello'
```

####  `encodeString(str,  encoding)`

根据编码类型转换字符串。

```typescript
const  base64  =  StringUtils.encodeString('Hello',  'base64')
const  hex  =  StringUtils.encodeString('Hello',  'hex')
const  utf8  =  StringUtils.encodeString('Hello',  'utf8')
```

####  `decodeString(encodedStr,  encoding)`

根据编码类型解码字符串。

```typescript
const  str1  =  StringUtils.decodeString('SGVsbG8=',  'base64')
const  str2  =  StringUtils.decodeString('48656c6c6f',  'hex')
```

---

##  RandomUtils

随机数和密码学随机值生成工具。

###  导入

```typescript
import  {  RandomUtils  }  from  '@ldesign/crypto'
```

###  方法

####  `generateRandomBytes(length)`

生成指定长度的随机字节（WordArray）。

```typescript
const  randomBytes  =  RandomUtils.generateRandomBytes(16)
```

####  `generateRandomString(length,  encoding?)`

生成随机字符串。

**参数：**
-  `length`  (number)  -  字节长度
-  `encoding`  (EncodingType?)  -  输出编码，默认  'hex'

```typescript
const  hexString  =  RandomUtils.generateRandomString(16,  'hex')
const  base64String  =  RandomUtils.generateRandomString(16,  'base64')
```

####  `generateSalt(length?)`

生成盐值（十六进制）。

```typescript
const  salt  =  RandomUtils.generateSalt(16)  //  默认  16  字节
console.log(salt.length)  //  32  个十六进制字符
```

####  `generateIV(length?)`

生成初始化向量（十六进制）。

```typescript
const  iv  =  RandomUtils.generateIV(16)  //  默认  16  字节
```

####  `generateKey(length?)`

生成随机密钥（十六进制）。

```typescript
const  key  =  RandomUtils.generateKey(32)  //  默认  32  字节
console.log(key.length)  //  64  个十六进制字符
```

---

##  ValidationUtils

数据验证工具类。

###  导入

```typescript
import  {  ValidationUtils  }  from  '@ldesign/crypto'
```

###  方法

####  `isEmpty(str)`

验证字符串是否为空。

```typescript
console.log(ValidationUtils.isEmpty(''))                  //  true
console.log(ValidationUtils.isEmpty('    '))              //  true
console.log(ValidationUtils.isEmpty('hello'))      //  false
console.log(ValidationUtils.isEmpty(null))            //  true
console.log(ValidationUtils.isEmpty(undefined))  //  true
```

####  `isValidBase64(str)`

验证是否为有效的  Base64  字符串。

```typescript
console.log(ValidationUtils.isValidBase64('SGVsbG8='))      //  true
console.log(ValidationUtils.isValidBase64('invalid!@#'))    //  false
console.log(ValidationUtils.isValidBase64(''))                          //  true  (空字符串有效)
```

####  `isValidHex(str)`

验证是否为有效的十六进制字符串。

```typescript
console.log(ValidationUtils.isValidHex('48656c6c6f'))  //  true
console.log(ValidationUtils.isValidHex('abcdef'))          //  true
console.log(ValidationUtils.isValidHex('xyz'))                  //  false
console.log(ValidationUtils.isValidHex('123'))                  //  false  (奇数长度)
```

####  `validateKeyLength(key,  expectedLength)`

验证密钥长度。

```typescript
const  isValid  =  ValidationUtils.validateKeyLength('12345678',  8)
console.log(isValid)  //  true
```

####  `validateAESKeyLength(key,  keySize)`

验证  AES  密钥长度。

```typescript
const  key  =  '0123456789abcdef0123456789abcdef'  //  32  个字符
const  isValid  =  ValidationUtils.validateAESKeyLength(key,  256)
console.log(isValid)
```

---

##  ErrorUtils

错误处理工具类。

###  导入

```typescript
import  {  ErrorUtils  }  from  '@ldesign/crypto'
```

###  方法

####  `createEncryptionError(message,  algorithm?)`

创建加密错误。

```typescript
const  error  =  ErrorUtils.createEncryptionError('Invalid  key',  'AES')
console.log(error.message)  //  'Encryption  Error  (AES):  Invalid  key'
console.log(error.name)          //  'EncryptionError'
```

####  `createDecryptionError(message,  algorithm?)`

创建解密错误。

```typescript
const  error  =  ErrorUtils.createDecryptionError('Invalid  data',  'RSA')
```

####  `createHashError(message,  algorithm?)`

创建哈希错误。

```typescript
const  error  =  ErrorUtils.createHashError('Invalid  input',  'SHA256')
```

####  `createValidationError(message)`

创建验证错误。

```typescript
const  error  =  ErrorUtils.createValidationError('Key  length  invalid')
```

####  `handleError(error,  context?)`

处理错误并返回错误信息。

```typescript
try  {
        //  可能出错的操作
}  catch  (error)  {
        const  message  =  ErrorUtils.handleError(error,  'Encryption')
        console.error(message)
}
```

---

##  常量定义

###  CONSTANTS

库中使用的常量定义。

###  导入

```typescript
import  {  CONSTANTS  }  from  '@ldesign/crypto'
```

###  AES  常量

```typescript
CONSTANTS.AES.KEY_SIZES                          //  [128,  192,  256]
CONSTANTS.AES.MODES                                        //  ['CBC',  'ECB',  'CFB',  'OFB',  'CTR',  'GCM']
CONSTANTS.AES.DEFAULT_MODE                        //  'CBC'
CONSTANTS.AES.DEFAULT_KEY_SIZE                //  256
CONSTANTS.AES.IV_LENGTH                                //  16
```

**示例：**

```typescript
import  {  CONSTANTS  }  from  '@ldesign/crypto'

//  验证密钥大小
if  (CONSTANTS.AES.KEY_SIZES.includes(keySize))  {
        console.log('有效的  AES  密钥大小')
}

//  使用默认值
const  mode  =  CONSTANTS.AES.DEFAULT_MODE
const  keySize  =  CONSTANTS.AES.DEFAULT_KEY_SIZE
```

###  RSA  常量

```typescript
CONSTANTS.RSA.KEY_SIZES                          //  [1024,  2048,  3072,  4096]
CONSTANTS.RSA.DEFAULT_KEY_SIZE                //  2048
```

**示例：**

```typescript
const  keySize  =  CONSTANTS.RSA.DEFAULT_KEY_SIZE
console.log('默认  RSA  密钥大小:',  keySize)  //  2048
```

###  哈希常量

```typescript
CONSTANTS.HASH.ALGORITHMS
//  ['MD5',  'SHA1',  'SHA224',  'SHA256',  'SHA384',  'SHA512']
```

###  HMAC  常量

```typescript
CONSTANTS.HMAC.ALGORITHMS
//  ['HMAC-MD5',  'HMAC-SHA1',  'HMAC-SHA256',  'HMAC-SHA384',  'HMAC-SHA512']
```

###  编码常量

```typescript
CONSTANTS.ENCODING.TYPES              //  ['base64',  'hex',  'utf8']
CONSTANTS.ENCODING.DEFAULT        //  'hex'
```

**示例：**

```typescript
const  defaultEncoding  =  CONSTANTS.ENCODING.DEFAULT
console.log('默认编码:',  defaultEncoding)  //  'hex'
```

---

##  完整示例

###  数据验证

```typescript
import  {  ValidationUtils,  ErrorUtils  }  from  '@ldesign/crypto'

function  validateEncryptionInput(data:  string,  key:  string)  {
        //  验证数据
        if  (ValidationUtils.isEmpty(data))  {
                throw  ErrorUtils.createValidationError('Data  cannot  be  empty')
        }

        //  验证密钥
        if  (ValidationUtils.isEmpty(key))  {
                throw  ErrorUtils.createValidationError('Key  cannot  be  empty')
        }

        //  验证密钥格式
        if  (!ValidationUtils.isValidHex(key))  {
                throw  ErrorUtils.createValidationError('Key  must  be  hex  format')
        }

        return  true
}

//  使用
try  {
        validateEncryptionInput('Hello',  '0123456789abcdef')
        console.log('验证通过')
}  catch  (error)  {
        console.error(error.message)
}
```

###  字符串转换

```typescript
import  {  StringUtils  }  from  '@ldesign/crypto'

//  编码
const  original  =  'Hello  World'
const  base64  =  StringUtils.stringToBase64(original)
const  hex  =  StringUtils.stringToHex(original)

console.log('原始:',  original)
console.log('Base64:',  base64)
console.log('Hex:',  hex)

//  解码
const  decoded1  =  StringUtils.base64ToString(base64)
const  decoded2  =  StringUtils.hexToString(hex)

console.log('解码  1:',  decoded1)  //  'Hello  World'
console.log('解码  2:',  decoded2)  //  'Hello  World'
```

###  随机值生成

```typescript
import  {  RandomUtils  }  from  '@ldesign/crypto'

//  生成各种随机值
const  salt  =  RandomUtils.generateSalt(16)
const  iv  =  RandomUtils.generateIV(16)
const  key  =  RandomUtils.generateKey(32)
const  token  =  RandomUtils.generateRandomString(32,  'base64')

console.log('盐值:',  salt)
console.log('IV:',  iv)
console.log('密钥:',  key)
console.log('Token:',  token)
```

###  错误处理

```typescript
import  {  ErrorUtils  }  from  '@ldesign/crypto'

function  encryptData(data:  string,  key:  string)  {
        try  {
                //  验证输入
                if  (!data)  {
                        throw  ErrorUtils.createValidationError('Data  is  required')
                }

                //  执行加密
                //  ...

                return  {  success:  true  }
        }  catch  (error)  {
                if  (error.name  ===  'EncryptionError')  {
                        console.error('加密错误:',  error.message)
                }  else  if  (error.name  ===  'ValidationError')  {
                        console.error('验证错误:',  error.message)
                }  else  {
                        const  message  =  ErrorUtils.handleError(error,  'encryptData')
                        console.error(message)
                }
                return  {  success:  false,  error:  error.message  }
        }
}
```

---

##  最佳实践

###  输入验证

```typescript
//  ✓  推荐：验证所有输入
function  secureEncrypt(data:  string,  key:  string)  {
        if  (ValidationUtils.isEmpty(data))  {
                throw  new  Error('Data  required')
        }
        if  (ValidationUtils.isEmpty(key))  {
                throw  new  Error('Key  required')
        }
        //  执行加密
}

//  ✗  不推荐：不验证输入
function  unsafeEncrypt(data:  string,  key:  string)  {
        //  直接加密，可能出错
}
```

###  使用常量

```typescript
import  {  CONSTANTS  }  from  '@ldesign/crypto'

//  ✓  推荐：使用常量
const  keySize  =  CONSTANTS.AES.DEFAULT_KEY_SIZE
const  mode  =  CONSTANTS.AES.DEFAULT_MODE

//  ✗  不推荐：硬编码魔术数字
const  keySize  =  256
const  mode  =  'CBC'
```

###  错误处理

```typescript
//  ✓  推荐：使用  ErrorUtils  创建标准错误
throw  ErrorUtils.createEncryptionError('Invalid  key',  'AES')

//  ✗  不推荐：使用普通  Error
throw  new  Error('Encryption  failed')
```

---

##  相关链接

-  [加密  API](./encryption.md)
-  [解密  API](./decryption.md)
-  [哈希  API](./hashing.md)
-  [类型定义](./types.md)
