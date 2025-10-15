#    TripleDES    加密示例

TripleDES（也称为    3DES    或    DES3）是    DES    的增强版本，通过三次应用    DES    算法来提高安全性。使用    192    位密钥（24    字节），比    DES    更安全，但性能较慢。

:::warning    警告
虽然    TripleDES    比    DES    更安全，但仍不推荐用于新项目。建议使用    AES-256    替代。
:::

##    基础用法

###    简单加密和解密

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

//    基本的加密和解密
const    plaintext    =    'Hello,    World!'
const    key    =    'my-tripledes-secret-key!'    //    TripleDES    密钥长度为    24    字节

//    加密
const    encrypted    =    tripledes.encrypt(plaintext,    key)
console.log('加密成功:',    encrypted.success)    //    true
console.log('密文:',    encrypted.data)
console.log('IV:',    encrypted.iv)
console.log('算法:',    encrypted.algorithm)    //    '3DES'
console.log('模式:',    encrypted.mode)    //    'CBC'
console.log('密钥长度:',    encrypted.keySize)    //    192

//    解密
const    decrypted    =    tripledes.decrypt(encrypted,    key)
console.log('解密成功:',    decrypted.success)    //    true
console.log('明文:',    decrypted.data)    //    'Hello,    World!'
```

###    使用别名

```typescript
import    {    des3    }    from    '@ldesign/crypto'

//    des3    是    tripledes    的别名
const    encrypted    =    des3.encrypt('Data',    'secret-key-for-3des-use')
const    decrypted    =    des3.decrypt(encrypted,    'secret-key-for-3des-use')
```

###    使用字符串密文解密

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

const    key    =    '3des-secret-key-123456!!'

//    加密
const    encrypted    =    tripledes.encrypt('Secret    message',    key)
const    ciphertext    =    encrypted.data
const    iv    =    encrypted.iv

//    使用密文字符串解密（需要提供    IV）
if    (iv)    {
        const    decrypted    =    tripledes.decrypt(ciphertext    ||    '',    key,    {    iv    })
        console.log(decrypted.data)    //    'Secret    message'
}
```

##    密钥处理

TripleDES    要求密钥长度为    24    字节。库会自动处理不同长度的密钥。

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

//    短密钥    -    会自动重复填充到    24    字节
const    encrypted1    =    tripledes.encrypt('Data',    'shortkey')
console.log('短密钥加密成功:',    encrypted1.success)

//    正好    24    字节
const    encrypted2    =    tripledes.encrypt('Data',    '123456789012345678901234')
console.log('24    字节密钥加密成功:',    encrypted2.success)

//    长密钥    -    会自动截取前    24    字节
const    encrypted3    =    tripledes.encrypt('Data',    'very-long-key-that-exceeds-24-bytes')
console.log('长密钥加密成功:',    encrypted3.success)
```

##    生成密钥

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

//    生成随机    TripleDES    密钥（24    字节）
const    randomKey    =    tripledes.generateKey()
console.log('随机密钥:',    randomKey)
console.log('密钥长度:',    randomKey.length)    //    48    个十六进制字符（24    字节）

//    使用生成的密钥加密
const    encrypted    =    tripledes.encrypt('Sensitive    data',    randomKey)
const    decrypted    =    tripledes.decrypt(encrypted,    randomKey)
console.log('加密解密成功:',    decrypted.success)
```

##    不同加密模式

###    CBC    模式（推荐）

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

//    CBC    模式（默认）
const    encrypted    =    tripledes.encrypt('Data',    '3des-key-24-bytes-long!',    {
        mode:    'CBC',
})
console.log('加密模式:',    encrypted.mode)    //    'CBC'

//    每次加密使用新的    IV
const    encrypted1    =    tripledes.encrypt('Same    data',    '3des-key-24-bytes-long!')
const    encrypted2    =    tripledes.encrypt('Same    data',    '3des-key-24-bytes-long!')
console.log('不同的密文:',    encrypted1.data    !==    encrypted2.data)    //    true
```

###    ECB    模式

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

//    ECB    模式（不推荐）
const    encrypted    =    tripledes.encrypt('Data',    '3des-key-24-bytes-long!',    {
        mode:    'ECB',
})
console.log('加密模式:',    encrypted.mode)    //    'ECB'
```

###    CFB    模式

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

//    CFB    模式
const    encrypted    =    tripledes.encrypt('Data',    '3des-key-24-bytes-long!',    {
        mode:    'CFB',
})
const    decrypted    =    tripledes.decrypt(encrypted,    '3des-key-24-bytes-long!',    {
        mode:    'CFB',
})
```

###    OFB    模式

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

//    OFB    模式
const    encrypted    =    tripledes.encrypt('Data',    '3des-key-24-bytes-long!',    {
        mode:    'OFB',
})
const    decrypted    =    tripledes.decrypt(encrypted,    '3des-key-24-bytes-long!',    {
        mode:    'OFB',
})
```

##    自定义    IV

```typescript
import    {    tripledes,    RandomUtils    }    from    '@ldesign/crypto'

const    key    =    '3des-key-24-bytes-long!'

//    方式    1：自动生成    IV（推荐）
const    encrypted1    =    tripledes.encrypt('Data',    key)
console.log('自动生成的    IV:',    encrypted1.iv)

//    方式    2：手动生成    IV
const    customIV    =    RandomUtils.generateIV(8)    //    3DES    IV    长度为    8    字节（16    个十六进制字符）
const    encrypted2    =    tripledes.encrypt('Data',    key,    {    iv:    customIV    })
console.log('自定义    IV:',    encrypted2.iv)

//    解密时使用相同的    IV
const    decrypted    =    tripledes.decrypt(encrypted2,    key,    {    iv:    customIV    })
```

##    实际应用场景

###    场景    1：银行系统兼容

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

/**
  *    与使用    TripleDES    的银行系统交互
  */
class    BankingSystemAdapter    {
        private    key:    string

        constructor(key:    string)    {
                //    确保密钥长度为    24    字节
                if    (key.length    <    24)    {
                        this.key    =    key.repeat(Math.ceil(24    /    key.length)).substring(0,    24)
                }    else    {
                        this.key    =    key.substring(0,    24)
                }
        }

        //    加密交易数据
        encryptTransaction(transaction:    {
                accountNumber:    string
                amount:    number
                timestamp:    number
        }):    {    encrypted:    string;    iv:    string    }    {
                const    data    =    JSON.stringify(transaction)
                const    result    =    tripledes.encrypt(data,    this.key,    {    mode:    'CBC'    })

                if    (!result.success)    {
                        throw    new    Error('交易加密失败')
                }

                return    {
                        encrypted:    result.data    ||    '',
                        iv:    result.iv    ||    '',
                }
        }

        //    解密交易响应
        decryptResponse(encrypted:    string,    iv:    string):    any    {
                const    result    =    tripledes.decrypt(encrypted,    this.key,    {    iv    })

                if    (!result.success)    {
                        throw    new    Error('响应解密失败：'    +    result.error)
                }

                return    JSON.parse(result.data    ||    '{}')
        }
}

//    使用示例
const    adapter    =    new    BankingSystemAdapter('bank-master-key-3des!!')

//    加密交易
const    transaction    =    {
        accountNumber:    '6222021234567890',
        amount:    1000.0,
        timestamp:    Date.now(),
}

const    {    encrypted,    iv    }    =    adapter.encryptTransaction(transaction)
console.log('加密的交易数据:',    encrypted.substring(0,    50)    +    '...')

//    解密响应
const    response    =    adapter.decryptResponse(encrypted,    iv)
console.log('解密的响应:',    response)
```

###    场景    2：POS    机数据加密

```typescript
import    {    tripledes,    hash    }    from    '@ldesign/crypto'

/**
  *    POS    机支付数据加密
  */
class    POSEncryption    {
        private    key:    string

        constructor(terminalId:    string)    {
                //    使用终端    ID    生成密钥
                const    keyHash    =    hash.sha256(terminalId)
                this.key    =    keyHash.substring(0,    24)    //    取前    24    字节
        }

        //    加密卡号信息
        encryptCardData(cardData:    {
                cardNumber:    string
                expiryDate:    string
                cvv:    string
        }):    string    {
                //    敏感信息序列化
                const    data    =    JSON.stringify(cardData)

                //    加密
                const    encrypted    =    tripledes.encrypt(data,    this.key,    {    mode:    'CBC'    })

                if    (!encrypted.success)    {
                        throw    new    Error('卡号加密失败')
                }

                //    组合    IV    和密文
                return    `${encrypted.iv}:${encrypted.data}`
        }

        //    解密卡号信息
        decryptCardData(encryptedData:    string):    {
                cardNumber:    string
                expiryDate:    string
                cvv:    string
        }    {
                //    分离    IV    和密文
                const    [iv,    data]    =    encryptedData.split(':')

                //    解密
                const    decrypted    =    tripledes.decrypt(data,    this.key,    {    iv    })

                if    (!decrypted.success)    {
                        throw    new    Error('卡号解密失败')
                }

                return    JSON.parse(decrypted.data    ||    '{}')
        }

        //    加密    PIN
        encryptPIN(pin:    string):    string    {
                const    encrypted    =    tripledes.encrypt(pin,    this.key)
                return    `${encrypted.iv}:${encrypted.data}`
        }
}

//    使用示例
const    pos    =    new    POSEncryption('TERMINAL-001')

//    加密卡号数据
const    cardData    =    {
        cardNumber:    '6222021234567890',
        expiryDate:    '12/25',
        cvv:    '123',
}

const    encrypted    =    pos.encryptCardData(cardData)
console.log('加密的卡号数据:',    encrypted)

//    解密卡号数据
const    decrypted    =    pos.decryptCardData(encrypted)
console.log('解密的卡号:',    decrypted.cardNumber)

//    加密    PIN
const    encryptedPIN    =    pos.encryptPIN('123456')
console.log('加密的    PIN:',    encryptedPIN)
```

###    场景    3：从    TripleDES    迁移到    AES

```typescript
import    {    tripledes,    aes    }    from    '@ldesign/crypto'

/**
  *    从    TripleDES    迁移到    AES
  */
class    EncryptionUpgrade    {
        private    oldKey:    string
        private    newKey:    string

        constructor(oldKey:    string,    newKey:    string)    {
                this.oldKey    =    oldKey
                this.newKey    =    newKey
        }

        //    升级单条记录
        upgradeRecord(tripledesEncrypted:    string,    tripledesIV:    string)    {
                //    用    TripleDES    解密
                const    decrypted    =    tripledes.decrypt(tripledesEncrypted,    this.oldKey,    {
                        iv:    tripledesIV,
                })

                if    (!decrypted.success)    {
                        throw    new    Error('TripleDES    解密失败')
                }

                //    用    AES-256    重新加密
                const    encrypted    =    aes.encrypt(decrypted.data    ||    '',    this.newKey,    {
                        keySize:    256,
                        mode:    'CBC',
                })

                if    (!encrypted.success)    {
                        throw    new    Error('AES    加密失败')
                }

                return    {
                        data:    encrypted.data,
                        iv:    encrypted.iv,
                        algorithm:    'AES-256',
                        mode:    'CBC',
                }
        }

        //    批量升级
        async    upgradeDatabase(
                records:    Array<{    id:    string;    encrypted:    string;    iv:    string    }>,
                onProgress?:    (current:    number,    total:    number)    =>    void,
        )    {
                const    results    =    []
                let    successCount    =    0
                let    failCount    =    0

                for    (let    i    =    0;    i    <    records.length;    i++)    {
                        const    record    =    records[i]

                        try    {
                                const    upgraded    =    this.upgradeRecord(record.encrypted,    record.iv)

                                results.push({
                                        id:    record.id,
                                        success:    true,
                                        ...upgraded,
                                })

                                successCount++
                        }    catch    (error)    {
                                console.error(`记录    ${record.id}    升级失败:`,    error)

                                results.push({
                                        id:    record.id,
                                        success:    false,
                                        error:    error    instanceof    Error    ?    error.message    :    '未知错误',
                                })

                                failCount++
                        }

                        //    报告进度
                        if    (onProgress)    {
                                onProgress(i    +    1,    records.length)
                        }
                }

                return    {
                        results,
                        summary:    {
                                total:    records.length,
                                success:    successCount,
                                failed:    failCount,
                        },
                }
        }
}

//    使用示例
const    upgrade    =    new    EncryptionUpgrade(
        '3des-old-key-24-bytes!!',
        'aes-new-secure-key',
)

//    升级单条记录
const    oldData    =    tripledes.encrypt('Sensitive    data',    '3des-old-key-24-bytes!!')
const    upgraded    =    upgrade.upgradeRecord(oldData.data    ||    '',    oldData.iv    ||    '')
console.log('升级完成，新算法:',    upgraded.algorithm)

//    批量升级示例
const    records    =    [
        {    id:    '1',    encrypted:    oldData.data    ||    '',    iv:    oldData.iv    ||    ''    },
        //    ...    更多记录
]

upgrade.upgradeDatabase(records,    (current,    total)    =>    {
        console.log(`升级进度:    ${current}/${total}`)
}).then((result)    =>    {
        console.log('批量升级完成:',    result.summary)
})
```

###    场景    4：消息摘要保护

```typescript
import    {    tripledes,    hash    }    from    '@ldesign/crypto'

/**
  *    使用    TripleDES    和    HMAC    保护消息完整性
  */
class    SecureMessage    {
        private    encryptionKey:    string
        private    hmacKey:    string

        constructor(encryptionKey:    string,    hmacKey:    string)    {
                this.encryptionKey    =    encryptionKey
                this.hmacKey    =    hmacKey
        }

        //    发送安全消息
        send(message:    string):    {
                encrypted:    string
                iv:    string
                mac:    string
        }    {
                //    加密消息
                const    encrypted    =    tripledes.encrypt(message,    this.encryptionKey)

                if    (!encrypted.success)    {
                        throw    new    Error('消息加密失败')
                }

                //    计算    HMAC    保护完整性
                const    dataToAuth    =    `${encrypted.iv}:${encrypted.data}`
                const    mac    =    hash.sha256(dataToAuth    +    this.hmacKey)

                return    {
                        encrypted:    encrypted.data    ||    '',
                        iv:    encrypted.iv    ||    '',
                        mac,
                }
        }

        //    接收并验证安全消息
        receive(encrypted:    string,    iv:    string,    mac:    string):    string    {
                //    验证    HMAC
                const    dataToAuth    =    `${iv}:${encrypted}`
                const    expectedMac    =    hash.sha256(dataToAuth    +    this.hmacKey)

                if    (mac    !==    expectedMac)    {
                        throw    new    Error('消息完整性验证失败')
                }

                //    解密消息
                const    decrypted    =    tripledes.decrypt(encrypted,    this.encryptionKey,    {    iv    })

                if    (!decrypted.success)    {
                        throw    new    Error('消息解密失败')
                }

                return    decrypted.data    ||    ''
        }
}

//    使用示例
const    messenger    =    new    SecureMessage(
        '3des-encryption-key-24!',
        'hmac-secret-key',
)

//    发送消息
const    message    =    '这是一条需要保护的消息'
const    sentMessage    =    messenger.send(message)
console.log('发送的消息:',    sentMessage)

//    接收消息
const    receivedMessage    =    messenger.receive(
        sentMessage.encrypted,
        sentMessage.iv,
        sentMessage.mac,
)
console.log('接收的消息:',    receivedMessage)

//    篡改测试
try    {
        const    tamperedMessage    =    messenger.receive(
                sentMessage.encrypted    +    'x',    //    篡改
                sentMessage.iv,
                sentMessage.mac,
        )
}    catch    (error)    {
        console.log('检测到篡改:',    error)
}
```

##    错误处理

```typescript
import    {    tripledes    }    from    '@ldesign/crypto'

function    safeEncrypt(data:    string,    key:    string):    {
        success:    boolean
        encrypted?:    string
        iv?:    string
        error?:    string
}    {
        try    {
                const    result    =    tripledes.encrypt(data,    key)

                if    (!result.success)    {
                        return    {
                                success:    false,
                                error:    result.error    ||    '加密失败',
                        }
                }

                return    {
                        success:    true,
                        encrypted:    result.data,
                        iv:    result.iv,
                }
        }    catch    (error)    {
                return    {
                        success:    false,
                        error:    error    instanceof    Error    ?    error.message    :    '未知错误',
                }
        }
}

function    safeDecrypt(
        encrypted:    string,
        key:    string,
        iv:    string,
):    string    |    null    {
        try    {
                const    result    =    tripledes.decrypt(encrypted,    key,    {    iv    })

                if    (!result.success)    {
                        console.error('解密失败:',    result.error)
                        return    null
                }

                return    result.data    ||    null
        }    catch    (error)    {
                console.error('解密异常:',    error)
                return    null
        }
}

//    使用示例
const    key    =    '3des-key-24-bytes-long!'
const    encrypted    =    safeEncrypt('Test    data',    key)

if    (encrypted.success    &&    encrypted.encrypted    &&    encrypted.iv)    {
        const    decrypted    =    safeDecrypt(encrypted.encrypted,    key,    encrypted.iv)
        console.log('解密结果:',    decrypted)
}
```

##    性能比较

```typescript
import    {    tripledes,    des,    aes    }    from    '@ldesign/crypto'

//    性能测试
function    comparePerformance()    {
        const    data    =    'Test    data    for    performance'
        const    desKey    =    'des-key!'
        const    tripledesKey    =    '3des-key-24-bytes-long!'
        const    aesKey    =    'aes-secure-key'
        const    iterations    =    1000

        //    DES    性能
        console.time(`DES    ${iterations}    次加密`)
        for    (let    i    =    0;    i    <    iterations;    i++)    {
                des.encrypt(data,    desKey)
        }
        console.timeEnd(`DES    ${iterations}    次加密`)

        //    TripleDES    性能
        console.time(`TripleDES    ${iterations}    次加密`)
        for    (let    i    =    0;    i    <    iterations;    i++)    {
                tripledes.encrypt(data,    tripledesKey)
        }
        console.timeEnd(`TripleDES    ${iterations}    次加密`)

        //    AES    性能
        console.time(`AES    ${iterations}    次加密`)
        for    (let    i    =    0;    i    <    iterations;    i++)    {
                aes.encrypt(data,    aesKey)
        }
        console.timeEnd(`AES    ${iterations}    次加密`)
}

comparePerformance()
```

##    安全建议

:::warning    安全建议
1.    **优先使用    AES-256**    -    TripleDES    性能较慢且安全性不如    AES
2.    **避免    ECB    模式**    -    使用    CBC    或更安全的模式
3.    **每次加密使用新    IV**    -    不要重复使用    IV
4.    **密钥管理**    -    确保    24    字节密钥有足够的熵
5.    **计划迁移**    -    如果可能，迁移到    AES-256
:::

```typescript
//    ❌    不推荐：用于新项目
const    newProject    =    tripledes.encrypt('data',    'key')

//    ✅    推荐：使用    AES-256
import    {    aes    }    from    '@ldesign/crypto'
const    recommended    =    aes.encrypt('data',    'key',    {    keySize:    256    })

//    ⚠️    可接受：仅用于兼容遗留系统
const    legacy    =    tripledes.encrypt('data',    '3des-key-24-bytes-long!')
```

##    相关资源

-    [DES    示例](./des.md)    -    原始    DES    算法
-    [AES    示例](./aes.md)    -    推荐的现代加密算法
-    [加密算法比较](/guide/algorithms)
-    [安全指南](/guide/security)
-    [迁移指南](/guide/migration)
