# AES 加密示例

AES（Advanced  Encryption  Standard）是目前最广泛使用的对称加密算法，提供了优秀的安全性和性能。

## 基础用法

### 简单加密和解密

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  基本的加密和解密
const  plaintext  =  'Hello,  World!'
const  key  =  'my-secret-key'

//  加密
const  encrypted  =  aes.encrypt(plaintext,  key)
console.log('加密成功:',  encrypted.success)  //  true
console.log('密文:',  encrypted.data)
console.log('IV:',  encrypted.iv)
console.log('算法:',  encrypted.algorithm)  //  'AES'
console.log('模式:',  encrypted.mode)  //  'CBC'
console.log('密钥长度:',  encrypted.keySize)  //  256

//  解密
const  decrypted  =  aes.decrypt(encrypted,  key)
console.log('解密成功:',  decrypted.success)  //  true
console.log('明文:',  decrypted.data)  //  'Hello,  World!'
```

### 使用字符串密文解密

```typescript
import  {  aes  }  from  '@ldesign/crypto'

const  key  =  'my-secret-key'

//  第一次加密
const  encrypted  =  aes.encrypt('Secret  message',  key)
const  ciphertext  =  encrypted.data
const  iv  =  encrypted.iv

//  稍后使用密文字符串解密（需要提供  IV）
const  decrypted  =  aes.decrypt(ciphertext,  key,  {  iv  })
console.log(decrypted.data)  //  'Secret  message'
```

## 不同密钥长度

AES  支持  128、192  和  256  位三种密钥长度。密钥越长，安全性越高，但性能略有下降。

### AES-128

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  使用  AES-128
const  encrypted128  =  aes.encrypt('Data',  'key',  {  keySize:  128  })
console.log('密钥长度:',  encrypted128.keySize)  //  128

//  便捷方法
const  encrypted  =  aes.encrypt128('Data',  'key')
const  decrypted  =  aes.decrypt128(encrypted,  'key')
```

### AES-192

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  使用  AES-192
const  encrypted192  =  aes.encrypt('Data',  'key',  {  keySize:  192  })
console.log('密钥长度:',  encrypted192.keySize)  //  192

//  便捷方法
const  encrypted  =  aes.encrypt192('Data',  'key')
const  decrypted  =  aes.decrypt192(encrypted,  'key')
```

### AES-256（推荐）

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  使用  AES-256（默认，最安全）
const  encrypted256  =  aes.encrypt('Data',  'key',  {  keySize:  256  })
console.log('密钥长度:',  encrypted256.keySize)  //  256

//  便捷方法
const  encrypted  =  aes.encrypt256('Data',  'key')
const  decrypted  =  aes.decrypt256(encrypted,  'key')
```

## 不同加密模式

AES  支持多种加密模式，每种模式有不同的特性和用途。

### CBC 模式（推荐）

CBC（Cipher  Block  Chaining）是最常用的模式，提供了良好的安全性。

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  CBC  模式（默认）
const  encrypted  =  aes.encrypt('Data',  'key',  {  mode:  'CBC'  })
console.log('加密模式:',  encrypted.mode)  //  'CBC'

//  每次加密都会生成新的  IV，确保相同明文产生不同密文
const  encrypted1  =  aes.encrypt('Same  data',  'key')
const  encrypted2  =  aes.encrypt('Same  data',  'key')
console.log(encrypted1.data  !==  encrypted2.data)  //  true
```

### ECB 模式（不推荐）

ECB（Electronic  Codebook）模式简单但不安全，相同的明文块会产生相同的密文块。

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  ECB  模式（不推荐用于生产环境）
const  encrypted  =  aes.encrypt('Data',  'key',  {  mode:  'ECB'  })
console.log('加密模式:',  encrypted.mode)  //  'ECB'

//  ⚠️  警告：ECB  模式不使用  IV，相同明文总是产生相同密文
//  这会泄露数据模式，不应在生产环境使用
```

### CFB 模式

CFB（Cipher  Feedback）模式将块密码转换为流密码。

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  CFB  模式
const  encrypted  =  aes.encrypt('Data',  'key',  {  mode:  'CFB'  })
const  decrypted  =  aes.decrypt(encrypted,  'key',  {  mode:  'CFB'  })
```

### OFB 模式

OFB（Output  Feedback）模式也是一种流密码模式。

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  OFB  模式
const  encrypted  =  aes.encrypt('Data',  'key',  {  mode:  'OFB'  })
const  decrypted  =  aes.decrypt(encrypted,  'key',  {  mode:  'OFB'  })
```

### CTR 模式

CTR（Counter）模式可以并行处理，性能较好。

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  CTR  模式
const  encrypted  =  aes.encrypt('Data',  'key',  {  mode:  'CTR'  })
const  decrypted  =  aes.decrypt(encrypted,  'key',  {  mode:  'CTR'  })
```

## 自定义 IV

IV（Initialization  Vector）是加密的初始化向量，建议每次加密都使用新的随机  IV。

### 生成和使用 IV

```typescript
import  {  aes,  RandomUtils  }  from  '@ldesign/crypto'

//  方式  1：自动生成  IV（推荐）
const  encrypted1  =  aes.encrypt('Data',  'key')
console.log('自动生成的  IV:',  encrypted1.iv)

//  方式  2：手动生成  IV
const  customIV  =  RandomUtils.generateIV(16)  //  AES  IV  长度为  16  字节（32  个十六进制字符）
const  encrypted2  =  aes.encrypt('Data',  'key',  {  iv:  customIV  })
console.log('自定义  IV:',  encrypted2.iv)

//  解密时使用相同的  IV
const  decrypted  =  aes.decrypt(encrypted2,  'key',  {  iv:  customIV  })
```

### IV 的安全性

```typescript
import  {  aes  }  from  '@ldesign/crypto'

//  ✅  正确：每次加密使用新的  IV
function  encryptMessage(message:  string,  key:  string)  {
    //  自动生成新的  IV
    return  aes.encrypt(message,  key)
}

//  ❌  错误：重复使用相同的  IV
const  FIXED_IV  =  '0123456789abcdef0123456789abcdef'
function  insecureEncrypt(message:  string,  key:  string)  {
    //  不要这样做！
    return  aes.encrypt(message,  key,  {  iv:  FIXED_IV  })
}
```

## 实际应用场景

### 场景 1：用户数据加密

```typescript
import  {  aes  }  from  '@ldesign/crypto'

interface  UserData  {
    email:  string
    phone:  string
    address:  string
}

class  UserDataEncryptor  {
    private  key:  string

    constructor(masterKey:  string)  {
        this.key  =  masterKey
    }

    //  加密用户敏感数据
    encryptUserData(data:  UserData):  string  {
        try  {
            const  jsonString  =  JSON.stringify(data)
            const  encrypted  =  aes.encrypt(jsonString,  this.key,  {
                keySize:  256,  //  使用最高安全级别
                mode:  'CBC',
            })

            if  (!encrypted.success)  {
                throw  new  Error('加密失败')
            }

            //  将加密结果和  IV  一起保存
            return  JSON.stringify({
                data:  encrypted.data,
                iv:  encrypted.iv,
            })
        }  catch  (error)  {
            console.error('加密用户数据失败:',  error)
            throw  error
        }
    }

    //  解密用户数据
    decryptUserData(encryptedData:  string):  UserData  {
        try  {
            const  {  data,  iv  }  =  JSON.parse(encryptedData)

            const  decrypted  =  aes.decrypt(data,  this.key,  {  iv  })

            if  (!decrypted.success)  {
                throw  new  Error('解密失败')
            }

            return  JSON.parse(decrypted.data  ||  '{}')
        }  catch  (error)  {
            console.error('解密用户数据失败:',  error)
            throw  error
        }
    }
}

//  使用示例
const  encryptor  =  new  UserDataEncryptor('your-master-key')

const  userData:  UserData  =  {
    email:  'user@example.com',
    phone:  '+86  138  0000  0000',
    address:  '北京市朝阳区',
}

//  加密
const  encrypted  =  encryptor.encryptUserData(userData)
console.log('加密后:',  encrypted)

//  解密
const  decrypted  =  encryptor.decryptUserData(encrypted)
console.log('解密后:',  decrypted)
```

### 场景 2：文件加密

```typescript
import  {  aes  }  from  '@ldesign/crypto'

class  FileEncryptor  {
    //  加密文件内容
    static  encryptFile(content:  string,  password:  string):  {  encrypted:  string;  iv:  string  }  {
        const  result  =  aes.encrypt(content,  password,  {
            keySize:  256,
            mode:  'CBC',
        })

        if  (!result.success)  {
            throw  new  Error('文件加密失败')
        }

        return  {
            encrypted:  result.data  ||  '',
            iv:  result.iv  ||  '',
        }
    }

    //  解密文件内容
    static  decryptFile(encrypted:  string,  iv:  string,  password:  string):  string  {
        const  result  =  aes.decrypt(encrypted,  password,  {  iv  })

        if  (!result.success)  {
            throw  new  Error('文件解密失败：密码错误或文件已损坏')
        }

        return  result.data  ||  ''
    }
}

//  使用示例
const  fileContent  =  `
这是一个需要加密的文件内容。
包含敏感信息。
`

try  {
    //  加密文件
    const  {  encrypted,  iv  }  =  FileEncryptor.encryptFile(
        fileContent,
        'file-password',
    )
    console.log('文件已加密')
    console.log('密文长度:',  encrypted.length)
    console.log('IV:',  iv)

    //  解密文件
    const  decrypted  =  FileEncryptor.decryptFile(encrypted,  iv,  'file-password')
    console.log('文件已解密:',  decrypted)
}  catch  (error)  {
    console.error('操作失败:',  error)
}
```

### 场景 3：密码安全存储

```typescript
import  {  aes,  hash,  RandomUtils  }  from  '@ldesign/crypto'

class  PasswordManager  {
    private  masterKey:  string

    constructor(masterPassword:  string)  {
        //  使用主密码的哈希作为加密密钥
        this.masterKey  =  hash.sha256(masterPassword)
    }

    //  存储密码
    savePassword(service:  string,  password:  string):  string  {
        const  data  =  JSON.stringify({
            service,
            password,
            timestamp:  Date.now(),
        })

        const  encrypted  =  aes.encrypt(data,  this.masterKey,  {
            keySize:  256,
            mode:  'CBC',
        })

        if  (!encrypted.success)  {
            throw  new  Error('密码加密失败')
        }

        //  返回包含所有必要信息的字符串
        return  `${encrypted.iv}:${encrypted.data}`
    }

    //  获取密码
    getPassword(encryptedData:  string):  {  service:  string;  password:  string  }  {
        const  [iv,  data]  =  encryptedData.split(':')

        const  decrypted  =  aes.decrypt(data,  this.masterKey,  {  iv  })

        if  (!decrypted.success)  {
            throw  new  Error('密码解密失败：主密码错误')
        }

        const  parsed  =  JSON.parse(decrypted.data  ||  '{}')
        return  {
            service:  parsed.service,
            password:  parsed.password,
        }
    }
}

//  使用示例
const  manager  =  new  PasswordManager('my-strong-master-password')

//  保存密码
const  encrypted  =  manager.savePassword('github.com',  'my-github-password')
console.log('加密后的密码记录:',  encrypted)

//  获取密码
const  {  service,  password  }  =  manager.getPassword(encrypted)
console.log(`服务:  ${service},  密码:  ${password}`)
```

### 场景 4：会话令牌加密

```typescript
import  {  aes  }  from  '@ldesign/crypto'

interface  SessionData  {
    userId:  string
    username:  string
    role:  string
    expiresAt:  number
}

class  SessionManager  {
    private  secretKey:  string

    constructor(secretKey:  string)  {
        this.secretKey  =  secretKey
    }

    //  创建加密的会话令牌
    createToken(data:  SessionData):  string  {
        const  payload  =  JSON.stringify(data)

        const  encrypted  =  aes.encrypt(payload,  this.secretKey,  {
            keySize:  256,
            mode:  'CBC',
        })

        if  (!encrypted.success)  {
            throw  new  Error('令牌创建失败')
        }

        //  使用  Base64  编码整个令牌（包含  IV  和密文）
        const  token  =  Buffer.from(
            JSON.stringify({
                iv:  encrypted.iv,
                data:  encrypted.data,
            }),
        ).toString('base64')

        return  token
    }

    //  验证并解密令牌
    verifyToken(token:  string):  SessionData  |  null  {
        try  {
            //  解码令牌
            const  decoded  =  Buffer.from(token,  'base64').toString('utf-8')
            const  {  iv,  data  }  =  JSON.parse(decoded)

            //  解密
            const  decrypted  =  aes.decrypt(data,  this.secretKey,  {  iv  })

            if  (!decrypted.success)  {
                return  null
            }

            const  sessionData:  SessionData  =  JSON.parse(decrypted.data  ||  '{}')

            //  检查是否过期
            if  (Date.now()  >  sessionData.expiresAt)  {
                return  null
            }

            return  sessionData
        }  catch  (error)  {
            console.error('令牌验证失败:',  error)
            return  null
        }
    }
}

//  使用示例
const  sessionManager  =  new  SessionManager('session-secret-key')

//  创建会话
const  sessionData:  SessionData  =  {
    userId:  '12345',
    username:  'john_doe',
    role:  'admin',
    expiresAt:  Date.now()  +  24  *  60  *  60  *  1000,  //  24  小时后过期
}

const  token  =  sessionManager.createToken(sessionData)
console.log('会话令牌:',  token)

//  验证会话
const  verified  =  sessionManager.verifyToken(token)
if  (verified)  {
    console.log('会话有效:',  verified)
}  else  {
    console.log('会话无效或已过期')
}
```

## 错误处理

```typescript
import  {  aes  }  from  '@ldesign/crypto'

function  safeEncrypt(data:  string,  key:  string):  string  |  null  {
    try  {
        const  result  =  aes.encrypt(data,  key)

        if  (!result.success)  {
            console.error('加密失败:',  result.error)
            return  null
        }

        return  result.data  ||  null
    }  catch  (error)  {
        console.error('加密异常:',  error)
        return  null
    }
}

function  safeDecrypt(encryptedData:  string,  key:  string,  iv:  string):  string  |  null  {
    try  {
        const  result  =  aes.decrypt(encryptedData,  key,  {  iv  })

        if  (!result.success)  {
            console.error('解密失败:',  result.error)
            return  null
        }

        return  result.data  ||  null
    }  catch  (error)  {
        console.error('解密异常:',  error)
        return  null
    }
}
```

## 性能优化

### 密钥派生缓存

库内置了密钥派生缓存机制，相同的密钥会被缓存，避免重复计算。

```typescript
import  {  aes  }  from  '@ldesign/crypto'

const  key  =  'my-secret-key'

//  首次加密会进行密钥派生
console.time('首次加密')
aes.encrypt('data1',  key)
console.timeEnd('首次加密')  //  约  10-20ms

//  后续使用相同密钥的加密会更快（使用缓存）
console.time('缓存加密')
aes.encrypt('data2',  key)
console.timeEnd('缓存加密')  //  约  1-2ms  （快  10  倍以上）
```

### 批量加密

```typescript
import  {  aes  }  from  '@ldesign/crypto'

function  batchEncrypt(items:  string[],  key:  string)  {
    return  items.map((item)  =>  {
        const  result  =  aes.encrypt(item,  key)
        return  {
            original:  item,
            encrypted:  result.data,
            iv:  result.iv,
        }
    })
}

//  批量加密
const  items  =  ['data1',  'data2',  'data3']
const  encrypted  =  batchEncrypt(items,  'shared-key')
console.log('批量加密完成:',  encrypted.length,  '项')
```

## 安全建议

1.  **密钥管理**

```typescript
//  ❌  不要硬编码密钥
const  BAD_KEY  =  'hardcoded-key'

//  ✅  从环境变量或安全存储获取
const  GOOD_KEY  =  process.env.ENCRYPTION_KEY  ||  generateSecureKey()
```

2.  **IV 使用**

```typescript
//  ✅  每次加密使用新的  IV
function  encryptSensitiveData(data:  string,  key:  string)  {
    return  aes.encrypt(data,  key)  //  自动生成新  IV
}

//  ❌  不要重复使用  IV
const  FIXED_IV  =  '1234567890abcdef'
function  insecureEncrypt(data:  string,  key:  string)  {
    return  aes.encrypt(data,  key,  {  iv:  FIXED_IV  })  //  危险！
}
```

3.  **模式选择**

```typescript
//  ✅  推荐：使用  CBC  或  CTR  模式
const  secure  =  aes.encrypt(data,  key,  {  mode:  'CBC'  })

//  ❌  不推荐：避免使用  ECB  模式
const  insecure  =  aes.encrypt(data,  key,  {  mode:  'ECB'  })
```

4.  **密钥长度**

```typescript
//  ✅  推荐：使用  AES-256
const  best  =  aes.encrypt(data,  key,  {  keySize:  256  })

//  ⚠️  可接受：AES-192
const  good  =  aes.encrypt(data,  key,  {  keySize:  192  })

//  ⚠️  最低要求：AES-128
const  minimum  =  aes.encrypt(data,  key,  {  keySize:  128  })
```

## 相关资源

-  [API 文档](/api/aes)
-  [安全指南](/guide/security)
-  [性能优化](/guide/performance)
