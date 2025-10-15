#  DES  加密示例

DES（Data  Encryption  Standard）是一种对称加密算法。由于密钥长度较短（56  位），已不推荐用于生产环境，但在一些遗留系统中仍在使用。

:::warning  警告
DES  加密已被认为不够安全，建议使用  AES-256  替代。本文档仅供学习和兼容遗留系统使用。
:::

##  基础用法

###  简单加密和解密

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  基本的加密和解密
const  plaintext  =  'Hello,  World!'
const  key  =  'mykey123'  //  DES  密钥长度为  8  字节

//  加密
const  encrypted  =  des.encrypt(plaintext,  key)
console.log('加密成功:',  encrypted.success)  //  true
console.log('密文:',  encrypted.data)
console.log('IV:',  encrypted.iv)
console.log('算法:',  encrypted.algorithm)  //  'DES'
console.log('模式:',  encrypted.mode)  //  'CBC'

//  解密
const  decrypted  =  des.decrypt(encrypted,  key)
console.log('解密成功:',  decrypted.success)  //  true
console.log('明文:',  decrypted.data)  //  'Hello,  World!'
```

###  使用字符串密文解密

```typescript
import  {  des  }  from  '@ldesign/crypto'

const  key  =  'des-key!'

//  加密
const  encrypted  =  des.encrypt('Secret  message',  key)
const  ciphertext  =  encrypted.data
const  iv  =  encrypted.iv

//  使用密文字符串解密（需要提供  IV）
if  (iv)  {
    const  decrypted  =  des.decrypt(ciphertext  ||  '',  key,  {  iv  })
    console.log(decrypted.data)  //  'Secret  message'
}
```

##  密钥处理

DES  要求密钥长度为  8  字节。库会自动处理不同长度的密钥。

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  短密钥  -  会自动填充
const  encrypted1  =  des.encrypt('Data',  'key')
console.log('短密钥加密成功:',  encrypted1.success)

//  正好  8  字节
const  encrypted2  =  des.encrypt('Data',  '12345678')
console.log('8  字节密钥加密成功:',  encrypted2.success)

//  长密钥  -  会自动截取
const  encrypted3  =  des.encrypt('Data',  'verylongkey123456')
console.log('长密钥加密成功:',  encrypted3.success)
```

##  生成密钥

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  生成随机  DES  密钥（8  字节）
const  randomKey  =  des.generateKey()
console.log('随机密钥:',  randomKey)
console.log('密钥长度:',  randomKey.length)  //  16  个十六进制字符（8  字节）

//  使用生成的密钥加密
const  encrypted  =  des.encrypt('Data',  randomKey)
const  decrypted  =  des.decrypt(encrypted,  randomKey)
console.log('加密解密成功:',  decrypted.success)
```

##  不同加密模式

###  CBC  模式（推荐）

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  CBC  模式（默认）
const  encrypted  =  des.encrypt('Data',  'des-key!',  {  mode:  'CBC'  })
console.log('加密模式:',  encrypted.mode)  //  'CBC'

//  每次加密使用新的  IV
const  encrypted1  =  des.encrypt('Same  data',  'des-key!')
const  encrypted2  =  des.encrypt('Same  data',  'des-key!')
console.log('不同的密文:',  encrypted1.data  !==  encrypted2.data)  //  true
```

###  ECB  模式

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  ECB  模式（不推荐）
const  encrypted  =  des.encrypt('Data',  'des-key!',  {  mode:  'ECB'  })
console.log('加密模式:',  encrypted.mode)  //  'ECB'
```

###  CFB  模式

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  CFB  模式
const  encrypted  =  des.encrypt('Data',  'des-key!',  {  mode:  'CFB'  })
const  decrypted  =  des.decrypt(encrypted,  'des-key!',  {  mode:  'CFB'  })
```

###  OFB  模式

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  OFB  模式
const  encrypted  =  des.encrypt('Data',  'des-key!',  {  mode:  'OFB'  })
const  decrypted  =  des.decrypt(encrypted,  'des-key!',  {  mode:  'OFB'  })
```

##  自定义  IV

```typescript
import  {  des,  RandomUtils  }  from  '@ldesign/crypto'

//  方式  1：自动生成  IV（推荐）
const  encrypted1  =  des.encrypt('Data',  'des-key!')
console.log('自动生成的  IV:',  encrypted1.iv)

//  方式  2：手动生成  IV
const  customIV  =  RandomUtils.generateIV(8)  //  DES  IV  长度为  8  字节（16  个十六进制字符）
const  encrypted2  =  des.encrypt('Data',  'des-key!',  {  iv:  customIV  })
console.log('自定义  IV:',  encrypted2.iv)

//  解密时使用相同的  IV
const  decrypted  =  des.decrypt(encrypted2,  'des-key!',  {  iv:  customIV  })
```

##  实际应用场景

###  场景  1：遗留系统兼容

```typescript
import  {  des  }  from  '@ldesign/crypto'

/**
 *  与使用  DES  加密的遗留系统交互
 */
class  LegacySystemAdapter  {
    private  key:  string

    constructor(key:  string)  {
        //  确保密钥长度为  8  字节
        this.key  =  key.length  >=  8  ?  key.substring(0,  8)  :  key.padEnd(8,  '0')
    }

    //  加密数据以发送给遗留系统
    encryptForLegacySystem(data:  string):  {  encrypted:  string;  iv:  string  }  {
        const  result  =  des.encrypt(data,  this.key,  {  mode:  'CBC'  })

        if  (!result.success)  {
            throw  new  Error('加密失败')
        }

        return  {
            encrypted:  result.data  ||  '',
            iv:  result.iv  ||  '',
        }
    }

    //  解密从遗留系统接收的数据
    decryptFromLegacySystem(encrypted:  string,  iv:  string):  string  {
        const  result  =  des.decrypt(encrypted,  this.key,  {  iv  })

        if  (!result.success)  {
            throw  new  Error('解密失败：'  +  result.error)
        }

        return  result.data  ||  ''
    }
}

//  使用示例
const  adapter  =  new  LegacySystemAdapter('legacy01')

//  发送数据到遗留系统
const  dataToSend  =  'ORDER:12345,AMOUNT:1000'
const  {  encrypted,  iv  }  =  adapter.encryptForLegacySystem(dataToSend)
console.log('发送的加密数据:',  encrypted.substring(0,  50))

//  接收并解密遗留系统的响应
const  decrypted  =  adapter.decryptFromLegacySystem(encrypted,  iv)
console.log('接收的数据:',  decrypted)
```

###  场景  2：简单数据混淆

```typescript
import  {  des  }  from  '@ldesign/crypto'

/**
 *  对非敏感数据进行简单混淆
 *  注意：这不提供真正的安全性，仅用于防止casual  viewing
 */
class  DataObfuscator  {
    private  key  =  'obfusc8!'  //  8  字节密钥

    //  混淆数据
    obfuscate(data:  string):  string  {
        const  encrypted  =  des.encrypt(data,  this.key)

        if  (!encrypted.success)  {
            return  data  //  失败时返回原数据
        }

        //  将  IV  和密文组合
        return  `${encrypted.iv}:${encrypted.data}`
    }

    //  还原数据
    deobfuscate(obfuscated:  string):  string  {
        try  {
            const  [iv,  data]  =  obfuscated.split(':')
            const  decrypted  =  des.decrypt(data,  this.key,  {  iv  })

            return  decrypted.success  ?  decrypted.data  ||  ''  :  obfuscated
        }  catch  {
            return  obfuscated
        }
    }
}

//  使用示例
const  obfuscator  =  new  DataObfuscator()

const  data  =  'user_preferences_v1.2.3'
const  obfuscated  =  obfuscator.obfuscate(data)
console.log('混淆后:',  obfuscated)

const  restored  =  obfuscator.deobfuscate(obfuscated)
console.log('还原后:',  restored)
```

###  场景  3：迁移到  AES

```typescript
import  {  des,  aes  }  from  '@ldesign/crypto'

/**
 *  从  DES  迁移到  AES
 */
class  EncryptionMigration  {
    private  desKey:  string
    private  aesKey:  string

    constructor(desKey:  string,  aesKey:  string)  {
        this.desKey  =  desKey
        this.aesKey  =  aesKey
    }

    //  解密  DES  数据并用  AES  重新加密
    migrate(desEncrypted:  string,  desIV:  string)  {
        //  用  DES  解密
        const  decrypted  =  des.decrypt(desEncrypted,  this.desKey,  {  iv:  desIV  })

        if  (!decrypted.success)  {
            throw  new  Error('DES  解密失败')
        }

        //  用  AES  重新加密
        const  encrypted  =  aes.encrypt(decrypted.data  ||  '',  this.aesKey,  {
            keySize:  256,
            mode:  'CBC',
        })

        if  (!encrypted.success)  {
            throw  new  Error('AES  加密失败')
        }

        return  {
            data:  encrypted.data,
            iv:  encrypted.iv,
            algorithm:  'AES-256',
        }
    }

    //  批量迁移
    async  batchMigrate(
        records:  Array<{  encrypted:  string;  iv:  string  }>,
    ):  Promise<Array<{  data:  string;  iv:  string  }>>  {
        const  results  =  []

        for  (const  record  of  records)  {
            try  {
                const  migrated  =  this.migrate(record.encrypted,  record.iv)
                results.push({
                    data:  migrated.data  ||  '',
                    iv:  migrated.iv  ||  '',
                })
            }  catch  (error)  {
                console.error('迁移失败:',  error)
                //  保留原数据或根据需要处理
            }
        }

        return  results
    }
}

//  使用示例
const  migration  =  new  EncryptionMigration('des-key!',  'aes-secure-key')

//  原有的  DES  加密数据
const  desData  =  des.encrypt('Sensitive  data',  'des-key!')

//  迁移到  AES
const  migratedData  =  migration.migrate(desData.data  ||  '',  desData.iv  ||  '')
console.log('迁移完成，新算法:',  migratedData.algorithm)
```

##  错误处理

```typescript
import  {  des  }  from  '@ldesign/crypto'

function  safeEncrypt(data:  string,  key:  string):  {
    success:  boolean
    encrypted?:  string
    iv?:  string
    error?:  string
}  {
    try  {
        const  result  =  des.encrypt(data,  key)

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
        const  result  =  des.decrypt(encrypted,  key,  {  iv  })

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

//  使用示例
const  key  =  'des-key!'
const  encrypted  =  safeEncrypt('Test  data',  key)

if  (encrypted.success  &&  encrypted.encrypted  &&  encrypted.iv)  {
    const  decrypted  =  safeDecrypt(encrypted.encrypted,  key,  encrypted.iv)
    console.log('解密结果:',  decrypted)
}
```

##  性能考虑

```typescript
import  {  des  }  from  '@ldesign/crypto'

//  DES  性能测试
function  testDESPerformance()  {
    const  key  =  des.generateKey()
    const  data  =  'Test  data  for  performance  measurement'

    //  加密性能
    console.time('DES  加密  1000  次')
    for  (let  i  =  0;  i  <  1000;  i++)  {
        des.encrypt(data,  key)
    }
    console.timeEnd('DES  加密  1000  次')

    //  解密性能
    const  encrypted  =  des.encrypt(data,  key)
    console.time('DES  解密  1000  次')
    for  (let  i  =  0;  i  <  1000;  i++)  {
        des.decrypt(encrypted,  key)
    }
    console.timeEnd('DES  解密  1000  次')
}

testDESPerformance()
```

##  安全建议

:::danger  重要安全提示
1.  **不要在新项目中使用  DES**  -  改用  AES-256
2.  **不要用于敏感数据**  -  DES  已被认为不安全
3.  **仅用于兼容遗留系统**
4.  **计划迁移到  AES**  -  尽快升级到更安全的算法
:::

```typescript
//  ❌  不推荐：用  DES  加密敏感数据
const  password  =  'user-password'
const  badEncrypt  =  des.encrypt(password,  'des-key!')

//  ✅  推荐：使用  AES-256
import  {  aes  }  from  '@ldesign/crypto'
const  goodEncrypt  =  aes.encrypt(password,  'aes-key',  {  keySize:  256  })
```

##  迁移指南

如果你正在使用  DES，建议迁移到  AES：

```typescript
import  {  des,  aes  }  from  '@ldesign/crypto'

//  旧代码（DES）
const  oldEncrypted  =  des.encrypt('data',  'des-key!')

//  新代码（AES）-  更安全
const  newEncrypted  =  aes.encrypt('data',  'aes-secure-key',  {
    keySize:  256,
    mode:  'CBC',
})

//  迁移步骤：
//  1.  解密  DES  数据
//  2.  用  AES  重新加密
//  3.  更新数据库
//  4.  更新应用代码
```

##  相关资源

-  [TripleDES  示例](./tripledes.md)  -  DES  的改进版本（仍不推荐）
-  [AES  示例](./aes.md)  -  推荐的替代方案
-  [加密算法比较](/guide/algorithms)
-  [安全指南](/guide/security)
