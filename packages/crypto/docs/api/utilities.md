# 工具函数（Utilities）

本页概述 @ldesign/crypto 提供的常用工具，包括字符串/编码转换、随机数与密钥生成、常用校验与常量。

## StringUtils

- stringToWordArray(str): 将 UTF-8 字符串转为 CryptoJS WordArray
- wordArrayToString(wa): 将 WordArray 转回 UTF-8 字符串
- stringToBase64(str) / base64ToString(b64)
- stringToHex(str) / hexToString(hex)
- encodeString(str, encoding) / decodeString(str, encoding)

示例：
```ts path=null start=null
import { StringUtils } from '@ldesign/crypto'

const b64 = StringUtils.stringToBase64('hello')
const str = StringUtils.base64ToString(b64)
```

## RandomUtils

- generateRandomBytes(length)
- generateRandomString(length, encoding = 'hex')
- generateSalt(length = 16)
- generateIV(length = 16)
- generateKey(length = 32)

示例：
```ts path=null start=null
import { RandomUtils } from '@ldesign/crypto'

const keyHex = RandomUtils.generateKey(32)  // 32字节 -> 64位hex字符串
const ivHex = RandomUtils.generateIV(16)
```

## ValidationUtils

- isEmpty(str)
- isValidBase64(str)
- isValidHex(str)
- validateKeyLength(key, expectedLength)
- validateAESKeyLength(key, keySize)

```ts path=null start=null
import { ValidationUtils } from '@ldesign/crypto'

ValidationUtils.isValidHex('deadbeef') // true
```

## CONSTANTS

- AES: KEY_SIZES, MODES, DEFAULT_MODE, DEFAULT_KEY_SIZE, IV_LENGTH
- RSA: KEY_SIZES, DEFAULT_KEY_SIZE
- HASH: ALGORITHMS
- HMAC: ALGORITHMS
- ENCODING: TYPES, DEFAULT

```ts path=null start=null
import { CONSTANTS } from '@ldesign/crypto'

console.log(CONSTANTS.AES.KEY_SIZES) // [128, 192, 256]
```
