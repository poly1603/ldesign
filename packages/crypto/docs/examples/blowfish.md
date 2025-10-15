#  Blowfish  加密示例

Blowfish  是  Bruce  Schneier  设计的对称加密算法，具有可变密钥长度（32-448  位）。在某些嵌入式系统和遗留应用中仍在使用。

:::warning  警告
本库中的  Blowfish  实现使用  AES-256-CBC  作为  fallback，因为  crypto-js  不原生支持  Blowfish。如需真正的  Blowfish  加密，请使用专门的  Blowfish  库。
:::

##  基础用法

###  简单加密和解密

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

//  基本的加密和解密
const  plaintext  =  'Hello,  World!'
const  key  =  'my-blowfish-key'

//  加密
const  encrypted  =  blowfish.encrypt(plaintext,  key)
console.log('加密成功:',  encrypted.success)  //  true
console.log('密文:',  encrypted.data)
console.log('IV:',  encrypted.iv)
console.log('算法:',  encrypted.algorithm)  //  'Blowfish'
console.log('模式:',  encrypted.mode)  //  'CBC'

//  解密
const  decrypted  =  blowfish.decrypt(encrypted,  key)
console.log('解密成功:',  decrypted.success)  //  true
console.log('明文:',  decrypted.data)  //  'Hello,  World!'
```

###  使用字符串密文解密

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

const  key  =  'blowfish-secret'

//  加密
const  encrypted  =  blowfish.encrypt('Secret  message',  key)
const  ciphertext  =  encrypted.data
const  iv  =  encrypted.iv

//  使用密文字符串解密（需要提供  IV）
if  (iv)  {
    const  decrypted  =  blowfish.decrypt(ciphertext  ||  '',  key,  {  iv  })
    console.log(decrypted.data)  //  'Secret  message'
}
```

##  可变密钥长度

Blowfish  支持  4-56  字节的密钥长度。

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

//  短密钥（4  字节）
const  key4  =  blowfish.generateKey(4)
const  encrypted1  =  blowfish.encrypt('Data',  key4)

//  中等密钥（16  字节，推荐）
const  key16  =  blowfish.generateKey(16)
const  encrypted2  =  blowfish.encrypt('Data',  key16)

//  长密钥（32  字节）
const  key32  =  blowfish.generateKey(32)
const  encrypted3  =  blowfish.encrypt('Data',  key32)

console.log('不同密钥长度都可以使用')
```

##  生成密钥

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

//  生成默认长度密钥（16  字节）
const  defaultKey  =  blowfish.generateKey()
console.log('默认密钥:',  defaultKey)
console.log('密钥长度:',  defaultKey.length)  //  32  个十六进制字符（16  字节）

//  生成指定长度密钥
const  shortKey  =  blowfish.generateKey(8)
const  longKey  =  blowfish.generateKey(24)

//  使用生成的密钥
const  encrypted  =  blowfish.encrypt('Test  data',  defaultKey)
const  decrypted  =  blowfish.decrypt(encrypted,  defaultKey)
```

##  不同加密模式

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

const  key  =  'blowfish-key'

//  CBC  模式（默认）
const  cbcEncrypted  =  blowfish.encrypt('Data',  key,  {  mode:  'CBC'  })

//  ECB  模式
const  ecbEncrypted  =  blowfish.encrypt('Data',  key,  {  mode:  'ECB'  })

//  CFB  模式
const  cfbEncrypted  =  blowfish.encrypt('Data',  key,  {  mode:  'CFB'  })

//  OFB  模式
const  ofbEncrypted  =  blowfish.encrypt('Data',  key,  {  mode:  'OFB'  })
```

##  自定义  IV

```typescript
import  {  blowfish,  RandomUtils  }  from  '@ldesign/crypto'

const  key  =  'blowfish-key'

//  方式  1：自动生成  IV（推荐）
const  encrypted1  =  blowfish.encrypt('Data',  key)
console.log('自动生成的  IV:',  encrypted1.iv)

//  方式  2：手动生成  IV
const  customIV  =  RandomUtils.generateIV(16)  //  16  字节  IV
const  encrypted2  =  blowfish.encrypt('Data',  key,  {  iv:  customIV  })
console.log('自定义  IV:',  encrypted2.iv)

//  解密时使用相同的  IV
const  decrypted  =  blowfish.decrypt(encrypted2,  key,  {  iv:  customIV  })
```

##  实际应用场景

###  场景  1：嵌入式系统数据保护

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

/**
 *  嵌入式设备配置加密
 */
class  EmbeddedConfigEncryption  {
    private  deviceKey:  string

    constructor(deviceId:  string)  {
        //  使用设备  ID  派生密钥
        this.deviceKey  =  `device-${deviceId}-secret`
    }

    //  加密配置
    encryptConfig(config:  {
        wifiSSID:  string
        wifiPassword:  string
        serverURL:  string
        apiKey:  string
    }):  string  {
        const  configString  =  JSON.stringify(config)

        const  encrypted  =  blowfish.encrypt(configString,  this.deviceKey,  {
            mode:  'CBC',
        })

        if  (!encrypted.success)  {
            throw  new  Error('配置加密失败')
        }

        //  组合  IV  和密文
        return  `${encrypted.iv}:${encrypted.data}`
    }

    //  解密配置
    decryptConfig(encryptedConfig:  string):  {
        wifiSSID:  string
        wifiPassword:  string
        serverURL:  string
        apiKey:  string
    }  {
        const  [iv,  data]  =  encryptedConfig.split(':')

        const  decrypted  =  blowfish.decrypt(data,  this.deviceKey,  {  iv  })

        if  (!decrypted.success)  {
            throw  new  Error('配置解密失败')
        }

        return  JSON.parse(decrypted.data  ||  '{}')
    }
}

//  使用示例
const  deviceEncryption  =  new  EmbeddedConfigEncryption('DEV001')

const  config  =  {
    wifiSSID:  'MyNetwork',
    wifiPassword:  'wifi-password-123',
    serverURL:  'https://api.example.com',
    apiKey:  'api-key-secret',
}

//  加密配置
const  encryptedConfig  =  deviceEncryption.encryptConfig(config)
console.log('加密的配置:',  encryptedConfig.substring(0,  50)  +  '...')

//  解密配置
const  decryptedConfig  =  deviceEncryption.decryptConfig(encryptedConfig)
console.log('Wi-Fi  SSID:',  decryptedConfig.wifiSSID)
```

###  场景  2：快速数据加密

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

/**
 *  轻量级缓存加密
 */
class  SecureCache  {
    private  cacheKey:  string
    private  cache:  Map<string,  string>  =  new  Map()

    constructor(cacheKey:  string)  {
        this.cacheKey  =  cacheKey
    }

    //  设置加密缓存
    set(key:  string,  value:  any,  ttl:  number  =  3600):  void  {
        const  data  =  JSON.stringify({
            value,
            expiresAt:  Date.now()  +  ttl  *  1000,
        })

        const  encrypted  =  blowfish.encrypt(data,  this.cacheKey)

        if  (encrypted.success)  {
            this.cache.set(key,  `${encrypted.iv}:${encrypted.data}`)
        }
    }

    //  获取解密缓存
    get<T>(key:  string):  T  |  null  {
        const  encryptedData  =  this.cache.get(key)

        if  (!encryptedData)  {
            return  null
        }

        try  {
            const  [iv,  data]  =  encryptedData.split(':')
            const  decrypted  =  blowfish.decrypt(data,  this.cacheKey,  {  iv  })

            if  (!decrypted.success)  {
                return  null
            }

            const  parsed  =  JSON.parse(decrypted.data  ||  '{}')

            //  检查是否过期
            if  (Date.now()  >  parsed.expiresAt)  {
                this.cache.delete(key)
                return  null
            }

            return  parsed.value
        }  catch  {
            return  null
        }
    }

    //  清除过期缓存
    cleanup():  number  {
        let  removed  =  0

        for  (const  [key,  _]  of  this.cache)  {
            if  (this.get(key)  ===  null)  {
                removed++
            }
        }

        return  removed
    }
}

//  使用示例
const  secureCache  =  new  SecureCache('cache-encryption-key')

//  设置缓存
secureCache.set('user:123',  { name:  'John',  role:  'admin'  },  3600)
secureCache.set('session:abc',  { token:  'token-value'  },  1800)

//  获取缓存
const  userData  =  secureCache.get<{ name:  string;  role:  string  }>('user:123')
console.log('缓存的用户:',  userData)

//  清理过期缓存
const  removed  =  secureCache.cleanup()
console.log('清理了',  removed,  '个过期缓存项')
```

###  场景  3：日志文件加密

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'
import  *  as  fs  from  'fs'

/**
 *  加密日志系统
 */
class  EncryptedLogger  {
    private  logKey:  string
    private  logFile:  string

    constructor(logFile:  string,  logKey:  string)  {
        this.logFile  =  logFile
        this.logKey  =  logKey
    }

    //  写入加密日志
    log(level:  string,  message:  string,  metadata?:  any):  void  {
        const  logEntry  =  {
            timestamp:  new  Date().toISOString(),
            level,
            message,
            metadata,
        }

        const  logString  =  JSON.stringify(logEntry)
        const  encrypted  =  blowfish.encrypt(logString,  this.logKey)

        if  (!encrypted.success)  {
            console.error('日志加密失败')
            return
        }

        //  追加到日志文件
        const  logLine  =  `${encrypted.iv}:${encrypted.data}\n`
        fs.appendFileSync(this.logFile,  logLine)
    }

    //  读取并解密日志
    readLogs():  Array<{
        timestamp:  string
        level:  string
        message:  string
        metadata?:  any
    }>  {
        if  (!fs.existsSync(this.logFile))  {
            return  []
        }

        const  content  =  fs.readFileSync(this.logFile,  'utf-8')
        const  lines  =  content.split('\n').filter((line)  =>  line.trim())

        const  logs  =  []

        for  (const  line  of  lines)  {
            try  {
                const  [iv,  data]  =  line.split(':')
                const  decrypted  =  blowfish.decrypt(data,  this.logKey,  {  iv  })

                if  (decrypted.success)  {
                    logs.push(JSON.parse(decrypted.data  ||  '{}'))
                }
            }  catch  (error)  {
                console.error('日志解密失败:',  error)
            }
        }

        return  logs
    }
}

//  使用示例
const  logger  =  new  EncryptedLogger('app.encrypted.log',  'log-encryption-key')

//  写入日志
logger.log('INFO',  '应用启动',  { version:  '1.0.0'  })
logger.log('ERROR',  '数据库连接失败',  { error:  'Connection  timeout'  })
logger.log('INFO',  '用户登录',  { userId:  123  })

//  读取日志
const  logs  =  logger.readLogs()
console.log('加密日志总数:',  logs.length)
logs.forEach((log)  =>  {
    console.log(`[${log.timestamp}]  ${log.level}:  ${log.message}`)
})
```

###  场景  4：文件传输加密

```typescript
import  {  blowfish,  hash  }  from  '@ldesign/crypto'

/**
 *  安全文件传输
 */
class  SecureFileTransfer  {
    private  transferKey:  string

    constructor(password:  string)  {
        //  使用密码哈希作为密钥
        this.transferKey  =  hash.sha256(password).substring(0,  32)
    }

    //  准备文件传输
    prepareFile(fileContent:  string,  filename:  string):  {
        encrypted:  string
        iv:  string
        checksum:  string
        metadata:  string
    }  {
        //  加密文件内容
        const  encrypted  =  blowfish.encrypt(fileContent,  this.transferKey)

        if  (!encrypted.success)  {
            throw  new  Error('文件加密失败')
        }

        //  计算校验和
        const  checksum  =  hash.sha256(fileContent)

        //  加密元数据
        const  metadata  =  JSON.stringify({
            filename,
            size:  fileContent.length,
            timestamp:  Date.now(),
        })

        const  encryptedMetadata  =  blowfish.encrypt(metadata,  this.transferKey)

        return  {
            encrypted:  encrypted.data  ||  '',
            iv:  encrypted.iv  ||  '',
            checksum,
            metadata:  `${encryptedMetadata.iv}:${encryptedMetadata.data}`,
        }
    }

    //  接收并验证文件
    receiveFile(
        encrypted:  string,
        iv:  string,
        checksum:  string,
        metadata:  string,
    ):  { content:  string;  filename:  string  }  {
        //  解密文件内容
        const  decrypted  =  blowfish.decrypt(encrypted,  this.transferKey,  {  iv  })

        if  (!decrypted.success)  {
            throw  new  Error('文件解密失败')
        }

        //  验证校验和
        const  actualChecksum  =  hash.sha256(decrypted.data  ||  '')
        if  (actualChecksum  !==  checksum)  {
            throw  new  Error('文件完整性验证失败')
        }

        //  解密元数据
        const  [metaIV,  metaData]  =  metadata.split(':')
        const  decryptedMeta  =  blowfish.decrypt(metaData,  this.transferKey,  {
            iv:  metaIV,
        })

        if  (!decryptedMeta.success)  {
            throw  new  Error('元数据解密失败')
        }

        const  meta  =  JSON.parse(decryptedMeta.data  ||  '{}')

        return  {
            content:  decrypted.data  ||  '',
            filename:  meta.filename,
        }
    }
}

//  使用示例
const  transfer  =  new  SecureFileTransfer('file-transfer-password')

//  准备文件
const  fileContent  =  `
这是一个需要安全传输的文件内容。
包含重要数据。
`

const  prepared  =  transfer.prepareFile(fileContent,  'sensitive.txt')
console.log('文件已准备传输')
console.log('加密数据长度:',  prepared.encrypted.length)

//  传输...  （通过网络发送  prepared  对象）

//  接收文件
const  received  =  transfer.receiveFile(
    prepared.encrypted,
    prepared.iv,
    prepared.checksum,
    prepared.metadata,
)

console.log('文件已接收:',  received.filename)
console.log('内容验证通过')
```

##  错误处理

```typescript
import  {  blowfish  }  from  '@ldesign/crypto'

function  safeEncrypt(data:  string,  key:  string):  {
    success:  boolean
    encrypted?:  string
    iv?:  string
    error?:  string
}  {
    try  {
        const  result  =  blowfish.encrypt(data,  key)

        if  (!result.success)  {
            return  {
                success:  false,
                error:  result.error  ||  '加密失败',
            }
        }

        return  {
            success:  true,
            encrypted:  result.data,
            iv:  result.iv,
        }
    }  catch  (error)  {
        return  {
            success:  false,
            error:  error  instanceof  Error  ?  error.message  :  '未知错误',
        }
    }
}

function  safeDecrypt(encrypted:  string,  key:  string,  iv:  string):  string  |  null  {
    try  {
        const  result  =  blowfish.decrypt(encrypted,  key,  {  iv  })

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

##  性能测试

```typescript
import  {  blowfish,  aes  }  from  '@ldesign/crypto'

//  性能比较
function  comparePerformance()  {
    const  data  =  'Test  data  for  performance  comparison'
    const  blowfishKey  =  blowfish.generateKey(16)
    const  aesKey  =  'aes-key'
    const  iterations  =  1000

    //  Blowfish  性能
    console.time(`Blowfish  ${iterations}  次加密`)
    for  (let  i  =  0;  i  <  iterations;  i++)  {
        blowfish.encrypt(data,  blowfishKey)
    }
    console.timeEnd(`Blowfish  ${iterations}  次加密`)

    //  AES  性能
    console.time(`AES  ${iterations}  次加密`)
    for  (let  i  =  0;  i  <  iterations;  i++)  {
        aes.encrypt(data,  aesKey)
    }
    console.timeEnd(`AES  ${iterations}  次加密`)
}

comparePerformance()
```

##  安全建议

:::warning  重要提示
1.  **本库的  Blowfish  实现使用  AES  作为  fallback**
2.  **如需真正的  Blowfish  加密，请使用专门的库**
3.  **对于新项目，推荐使用  AES-256**
4.  **仅在有特殊兼容性要求时使用**
:::

```typescript
//  ⚠️  本库的  Blowfish  实际使用  AES-256
const  blowfishEncrypted  =  blowfish.encrypt('data',  'key')

//  ✅  推荐：直接使用  AES-256
import  {  aes  }  from  '@ldesign/crypto'
const  aesEncrypted  =  aes.encrypt('data',  'key',  {  keySize:  256  })
```

##  与其他算法对比

```typescript
import  {  blowfish,  aes,  tripledes  }  from  '@ldesign/crypto'

//  不同算法的特点
const  algorithms  =  [
    {
        name:  'Blowfish',
        security:  '中',
        speed:  '快',
        keySize:  '可变  (32-448  位)',
        recommendation:  '遗留系统',
    },
    {
        name:  'AES-256',
        security:  '高',
        speed:  '快',
        keySize:  '256  位',
        recommendation:  '强烈推荐',
    },
    {
        name:  'TripleDES',
        security:  '中',
        speed:  '慢',
        keySize:  '192  位',
        recommendation:  '不推荐',
    },
]

console.table(algorithms)
```

##  相关资源

-  [AES  示例](./aes.md)  -  推荐的替代方案
-  [TripleDES  示例](./tripledes.md)
-  [加密算法比较](/guide/algorithms)
-  [安全指南](/guide/security)
