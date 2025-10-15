#  RSA  加密示例

RSA  是一种非对称加密算法，使用公钥加密、私钥解密，适合密钥交换、数字签名等场景。

##  基础用法

###  生成密钥对

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

//  生成  RSA  密钥对（默认  2048  位）
const  keyPair  =  rsa.generateKeyPair()
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

//  生成不同长度的密钥对
const  keyPair1024  =  rsa.generateKeyPair(1024)   //  1024  位（不推荐）
const  keyPair2048  =  rsa.generateKeyPair(2048)   //  2048  位（推荐）
const  keyPair4096  =  rsa.generateKeyPair(4096)   //  4096  位（高安全性）
```

###  公钥加密和私钥解密

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

//  生成密钥对
const  keyPair  =  rsa.generateKeyPair(2048)

//  使用公钥加密
const  plaintext  =  'Secret  message'
const  encrypted  =  rsa.encrypt(plaintext,  keyPair.publicKey)

console.log('加密成功:', encrypted.success)   //  true
console.log('密文:', encrypted.data)
console.log('算法:', encrypted.algorithm)   //  'RSA-2048'

//  使用私钥解密
const  decrypted  =  rsa.decrypt(encrypted,  keyPair.privateKey)

console.log('解密成功:', decrypted.success)   //  true
console.log('明文:', decrypted.data)   //  'Secret  message'
```

###  使用字符串密文

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

const  keyPair  =  rsa.generateKeyPair()

//  加密
const  encrypted  =  rsa.encrypt('Hello', keyPair.publicKey)
const  ciphertext  =  encrypted.data

//  使用密文字符串解密
const  decrypted  =  rsa.decrypt(ciphertext,  keyPair.privateKey)
console.log(decrypted.data)   //  'Hello'
```

##  不同填充方式

RSA  支持不同的填充方案，影响安全性和兼容性。

###  OAEP  填充（推荐）

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

const  keyPair  =  rsa.generateKeyPair(2048)

//  使用  OAEP  填充（默认，推荐）
const  encrypted  =  rsa.encrypt('Data',  keyPair.publicKey,  {
    padding:  'OAEP',
})

const  decrypted  =  rsa.decrypt(encrypted,  keyPair.privateKey,  {
    padding:  'OAEP',
})

console.log(decrypted.data)   //  'Data'
```

###  PKCS1  填充

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

const  keyPair  =  rsa.generateKeyPair(2048)

//  使用  PKCS1  填充（兼容性好但安全性略低）
const  encrypted  =  rsa.encrypt('Data',  keyPair.publicKey,  {
    padding:  'PKCS1',
})

const  decrypted  =  rsa.decrypt(encrypted,  keyPair.privateKey,  {
    padding:  'PKCS1',
})

console.log(decrypted.data)   //  'Data'
```

##  数字签名

###  生成和验证签名

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

//  生成密钥对
const  keyPair  =  rsa.generateKeyPair(2048)

//  需要签名的数据
const  message  =  'Important  message'

//  使用私钥签名
const  signature  =  rsa.sign(message,  keyPair.privateKey)
console.log('签名:', signature)

//  使用公钥验证签名
const  isValid  =  rsa.verify(message,  signature,  keyPair.publicKey)
console.log('签名验证:', isValid)   //  true

//  篡改数据后验证失败
const  tamperedMessage  =  'Modified  message'
const  isInvalid  =  rsa.verify(tamperedMessage,  signature,  keyPair.publicKey)
console.log('篡改后验证:', isInvalid)   //  false
```

###  不同哈希算法的签名

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

const  keyPair  =  rsa.generateKeyPair(2048)
const  message  =  'Message  to  sign'

//  使用  SHA256（默认，推荐）
const  signatureSHA256  =  rsa.sign(message,  keyPair.privateKey,  'sha256')
console.log('SHA256  签名验证:', rsa.verify(message,  signatureSHA256,  keyPair.publicKey,  'sha256'))

//  使用  SHA512（更高安全性）
const  signatureSHA512  =  rsa.sign(message,  keyPair.privateKey,  'sha512')
console.log('SHA512  签名验证:', rsa.verify(message,  signatureSHA512,  keyPair.publicKey,  'sha512'))

//  使用  SHA1（不推荐）
const  signatureSHA1  =  rsa.sign(message,  keyPair.privateKey,  'sha1')
console.log('SHA1  签名验证:', rsa.verify(message,  signatureSHA1,  keyPair.publicKey,  'sha1'))
```

##  实际应用场景

###  场景  1：混合加密（RSA  +  AES）

RSA  不适合加密大量数据，通常用于加密对称密钥。

```typescript
import  {  rsa,  aes,  RandomUtils  }  from  '@ldesign/crypto'

class  HybridEncryption  {
    //  混合加密：用  RSA  加密  AES  密钥，用  AES  加密数据
    static  encrypt(data:  string,  publicKey:  string)  {
        //  生成随机  AES  密钥
        const  aesKey  =  RandomUtils.generateKey(32)   //  256  位密钥

        //  用  AES  加密数据
        const  encryptedData  =  aes.encrypt(data,  aesKey,  {
            keySize:  256,
            mode:  'CBC',
        })

        if  (!encryptedData.success)  {
            throw  new  Error('数据加密失败')
        }

        //  用  RSA  加密  AES  密钥
        const  encryptedKey  =  rsa.encrypt(aesKey,  publicKey)

        if  (!encryptedKey.success)  {
            throw  new  Error('密钥加密失败')
        }

        return  {
            encryptedData:  encryptedData.data,
            encryptedKey:  encryptedKey.data,
            iv:  encryptedData.iv,
        }
    }

    //  混合解密
    static  decrypt(
        encryptedData:  string,
        encryptedKey:  string,
        iv:  string,
        privateKey:  string,
    )  {
        //  用  RSA  解密  AES  密钥
        const  decryptedKey  =  rsa.decrypt(encryptedKey,  privateKey)

        if  (!decryptedKey.success)  {
            throw  new  Error('密钥解密失败')
        }

        //  用  AES  解密数据
        const  decryptedData  =  aes.decrypt(encryptedData,  decryptedKey.data  ||  '',  {  iv  })

        if  (!decryptedData.success)  {
            throw  new  Error('数据解密失败')
        }

        return  decryptedData.data
    }
}

//  使用示例
const  keyPair  =  rsa.generateKeyPair(2048)

//  加密大量数据
const  largeData  =  '这是一段很长的文本数据...'.repeat(100)
const  encrypted  =  HybridEncryption.encrypt(largeData,  keyPair.publicKey)

console.log('加密的数据长度:', encrypted.encryptedData?.length)
console.log('加密的密钥长度:', encrypted.encryptedKey?.length)

//  解密数据
const  decrypted  =  HybridEncryption.decrypt(
    encrypted.encryptedData  ||  '',
    encrypted.encryptedKey  ||  '',
    encrypted.iv  ||  '',
    keyPair.privateKey,
)

console.log('解密成功:', decrypted.substring(0,  50)  +  '...')
```

###  场景  2：安全的密钥交换

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

//  模拟  Alice  和  Bob  之间的密钥交换

//  Alice  生成密钥对
const  aliceKeyPair  =  rsa.generateKeyPair(2048)
console.log('Alice  的公钥已生成')

//  Bob  生成密钥对
const  bobKeyPair  =  rsa.generateKeyPair(2048)
console.log('Bob  的公钥已生成')

//  Alice  和  Bob  交换公钥（公钥可以公开传输）
const  alicePublicKey  =  aliceKeyPair.publicKey
const  bobPublicKey  =  bobKeyPair.publicKey

//  Alice  想要发送秘密消息给  Bob
const  secretMessage  =  '这是  Alice  发给  Bob  的秘密消息'

//  Alice  使用  Bob  的公钥加密
const  encryptedForBob  =  rsa.encrypt(secretMessage,  bobPublicKey)
console.log('Alice  已加密消息')

//  Bob  使用自己的私钥解密
const  decryptedByBob  =  rsa.decrypt(encryptedForBob,  bobKeyPair.privateKey)
console.log('Bob  收到的消息:', decryptedByBob.data)

//  Bob  回复  Alice
const  reply  =  '收到你的消息了，谢谢！'

//  Bob  使用  Alice  的公钥加密回复
const  encryptedForAlice  =  rsa.encrypt(reply,  alicePublicKey)

//  Alice  使用自己的私钥解密
const  decryptedByAlice  =  rsa.decrypt(encryptedForAlice,  aliceKeyPair.privateKey)
console.log('Alice  收到的回复:', decryptedByAlice.data)
```

###  场景  3：文档签名验证

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

interface  Document  {
    id:  string
    content:  string
    author:  string
    timestamp:  number
}

class  DocumentSigner  {
    private  privateKey:  string
    public  publicKey:  string

    constructor()  {
        const  keyPair  =  rsa.generateKeyPair(2048)
        this.privateKey  =  keyPair.privateKey
        this.publicKey  =  keyPair.publicKey
    }

    //  签署文档
    signDocument(doc:  Document):  string  {
        //  将文档内容序列化
        const  docString  =  JSON.stringify(doc)

        //  生成签名
        const  signature  =  rsa.sign(docString,  this.privateKey,  'sha256')

        return  signature
    }

    //  验证文档签名
    static  verifyDocument(
        doc:  Document,
        signature:  string,
        publicKey:  string,
    ):  boolean  {
        //  序列化文档内容
        const  docString  =  JSON.stringify(doc)

        //  验证签名
        return  rsa.verify(docString,  signature,  publicKey,  'sha256')
    }
}

//  使用示例
const  signer  =  new  DocumentSigner()

//  创建文档
const  document:  Document  =  {
    id:  'DOC-001',
    content:  '这是一份重要的合同文档',
    author:  '张三',
    timestamp:  Date.now(),
}

//  签署文档
const  signature  =  signer.signDocument(document)
console.log('文档已签署')
console.log('签名:', signature.substring(0,  50)  +  '...')

//  验证文档（使用正确的公钥）
const  isValid  =  DocumentSigner.verifyDocument(
    document,
    signature,
    signer.publicKey,
)
console.log('签名验证:', isValid)   //  true

//  篡改文档后验证失败
const  tamperedDoc  =  {  ...document,  content:  '篡改的内容'  }
const  isTamperedValid  =  DocumentSigner.verifyDocument(
    tamperedDoc,
    signature,
    signer.publicKey,
)
console.log('篡改文档验证:', isTamperedValid)   //  false
```

###  场景  4：License  验证系统

```typescript
import  {  rsa,  hash  }  from  '@ldesign/crypto'

interface  LicenseData  {
    productName:  string
    customerName:  string
    email:  string
    expiresAt:  number
    features:  string[]
}

class  LicenseSystem  {
    private  privateKey:  string
    public  publicKey:  string

    constructor()  {
        const  keyPair  =  rsa.generateKeyPair(2048)
        this.privateKey  =  keyPair.privateKey
        this.publicKey  =  keyPair.publicKey
    }

    //  生成  License
    generateLicense(data:  LicenseData):  string  {
        //  序列化  License  数据
        const  licenseString  =  JSON.stringify(data)

        //  对数据进行哈希
        const  dataHash  =  hash.sha256(licenseString)

        //  签名哈希值
        const  signature  =  rsa.sign(dataHash,  this.privateKey)

        //  返回  License（Base64  编码）
        const  license  =  Buffer.from(
            JSON.stringify({
                data,
                signature,
            }),
        ).toString('base64')

        return  license
    }

    //  验证  License
    static  verifyLicense(license:  string,  publicKey:  string):  LicenseData  |  null  {
        try  {
            //  解码  License
            const  decoded  =  Buffer.from(license,  'base64').toString('utf-8')
            const  {  data,  signature  }  =  JSON.parse(decoded)

            //  计算数据哈希
            const  licenseString  =  JSON.stringify(data)
            const  dataHash  =  hash.sha256(licenseString)

            //  验证签名
            const  isValid  =  rsa.verify(dataHash,  signature,  publicKey)

            if  (!isValid)  {
                console.log('License  签名无效')
                return  null
            }

            //  检查是否过期
            if  (Date.now()  >  data.expiresAt)  {
                console.log('License  已过期')
                return  null
            }

            return  data
        }  catch  (error)  {
            console.error('License  验证失败:', error)
            return  null
        }
    }
}

//  使用示例
const  licenseSystem  =  new  LicenseSystem()

//  生成  License
const  licenseData:  LicenseData  =  {
    productName:  'Super  App  Pro',
    customerName:  '张三公司',
    email:  'customer@example.com',
    expiresAt:  Date.now()  +  365  *  24  *  60  *  60  *  1000,   //  1  年后过期
    features:  ['feature1',  'feature2',  'feature3'],
}

const  license  =  licenseSystem.generateLicense(licenseData)
console.log('生成的  License:', license.substring(0,  100)  +  '...')

//  验证  License
const  verifiedData  =  LicenseSystem.verifyLicense(
    license,
    licenseSystem.publicKey,
)

if  (verifiedData)  {
    console.log('License  验证成功!')
    console.log('产品:', verifiedData.productName)
    console.log('客户:', verifiedData.customerName)
    console.log('功能:', verifiedData.features.join(',  '))
}  else  {
    console.log('License  验证失败')
}
```

##  密钥管理

###  密钥存储

```typescript
import  {  rsa  }  from  '@ldesign/crypto'
import  *  as  fs  from  'fs'

class  KeyStorage  {
    //  保存密钥对到文件
    static  saveKeyPair(keyPair:  {  publicKey:  string;  privateKey:  string  },  prefix:  string)  {
        fs.writeFileSync(`${prefix}_public.pem`,  keyPair.publicKey)
        fs.writeFileSync(`${prefix}_private.pem`,  keyPair.privateKey,  {  mode:  0o600  })
        console.log('密钥已保存')
    }

    //  从文件加载密钥对
    static  loadKeyPair(prefix:  string):  {  publicKey:  string;  privateKey:  string  }  {
        const  publicKey  =  fs.readFileSync(`${prefix}_public.pem`,  'utf-8')
        const  privateKey  =  fs.readFileSync(`${prefix}_private.pem`,  'utf-8')
        return  {  publicKey,  privateKey  }
    }
}

//  生成并保存密钥
const  keyPair  =  rsa.generateKeyPair(2048)
KeyStorage.saveKeyPair(keyPair,  'myapp')

//  加载密钥
const  loadedKeyPair  =  KeyStorage.loadKeyPair('myapp')
console.log('密钥已加载')
```

###  密钥轮换

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

class  KeyRotation  {
    private  currentKeyPair:  {  publicKey:  string;  privateKey:  string  }
    private  oldKeyPairs:  Array<{  publicKey:  string;  privateKey:  string  }>  =  []

    constructor()  {
        this.currentKeyPair  =  rsa.generateKeyPair(2048)
    }

    //  轮换密钥
    rotateKeys()  {
        //  保存旧密钥
        this.oldKeyPairs.push(this.currentKeyPair)

        //  生成新密钥
        this.currentKeyPair  =  rsa.generateKeyPair(2048)

        //  只保留最近的  3  个旧密钥
        if  (this.oldKeyPairs.length  >  3)  {
            this.oldKeyPairs.shift()
        }

        console.log('密钥已轮换')
    }

    //  获取当前公钥（用于加密）
    getCurrentPublicKey()  {
        return  this.currentKeyPair.publicKey
    }

    //  尝试用所有密钥解密
    decrypt(encryptedData:  string):  string  |  null  {
        //  先用当前密钥尝试
        const  currentResult  =  rsa.decrypt(encryptedData,  this.currentKeyPair.privateKey)
        if  (currentResult.success)  {
            return  currentResult.data  ||  null
        }

        //  用旧密钥尝试
        for  (const  oldKeyPair  of  this.oldKeyPairs)  {
            const  result  =  rsa.decrypt(encryptedData,  oldKeyPair.privateKey)
            if  (result.success)  {
                return  result.data  ||  null
            }
        }

        return  null
    }
}

//  使用示例
const  rotation  =  new  KeyRotation()

//  使用当前密钥加密
const  encrypted1  =  rsa.encrypt('Message  1',  rotation.getCurrentPublicKey())

//  轮换密钥
rotation.rotateKeys()

//  使用新密钥加密
const  encrypted2  =  rsa.encrypt('Message  2',  rotation.getCurrentPublicKey())

//  两条消息都可以解密
console.log('消息  1:', rotation.decrypt(encrypted1.data  ||  ''))
console.log('消息  2:', rotation.decrypt(encrypted2.data  ||  ''))
```

##  错误处理

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

function  safeEncrypt(data:  string,  publicKey:  string):  string  |  null  {
    try  {
        const  result  =  rsa.encrypt(data,  publicKey)

        if  (!result.success)  {
            console.error('加密失败:', result.error)
            return  null
        }

        return  result.data  ||  null
    }  catch  (error)  {
        console.error('加密异常:', error)
        return  null
    }
}

function  safeDecrypt(encryptedData:  string,  privateKey:  string):  string  |  null  {
    try  {
        const  result  =  rsa.decrypt(encryptedData,  privateKey)

        if  (!result.success)  {
            console.error('解密失败:', result.error)
            return  null
        }

        return  result.data  ||  null
    }  catch  (error)  {
        console.error('解密异常:', error)
        return  null
    }
}

//  使用示例
const  keyPair  =  rsa.generateKeyPair()

const  encrypted  =  safeEncrypt('Secret', keyPair.publicKey)
if  (encrypted)  {
    const  decrypted  =  safeDecrypt(encrypted,  keyPair.privateKey)
    console.log('解密结果:', decrypted)
}
```

##  性能考虑

###  密钥长度的影响

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

//  测试不同密钥长度的性能
function  testKeySize(bits:  number)  {
    console.time(`生成  ${bits}  位密钥`)
    const  keyPair  =  rsa.generateKeyPair(bits)
    console.timeEnd(`生成  ${bits}  位密钥`)

    const  data  =  'Test  data'

    console.time(`${bits}  位加密`)
    const  encrypted  =  rsa.encrypt(data,  keyPair.publicKey)
    console.timeEnd(`${bits}  位加密`)

    console.time(`${bits}  位解密`)
    rsa.decrypt(encrypted,  keyPair.privateKey)
    console.timeEnd(`${bits}  位解密`)
}

testKeySize(1024)   //  快但不够安全
testKeySize(2048)   //  推荐
testKeySize(4096)   //  慢但更安全
```

###  数据大小限制

```typescript
import  {  rsa  }  from  '@ldesign/crypto'

//  RSA  不适合加密大数据
const  keyPair  =  rsa.generateKeyPair(2048)

//  短数据  -  可以加密
const  shortData  =  'Short  message'
const  encrypted1  =  rsa.encrypt(shortData,  keyPair.publicKey)
console.log('短数据加密:', encrypted1.success)

//  长数据  -  可能失败
const  longData  =  'A'.repeat(1000)
const  encrypted2  =  rsa.encrypt(longData,  keyPair.publicKey)
console.log('长数据加密:', encrypted2.success)

//  建议：对于大数据，使用混合加密（RSA  +  AES）
```

##  安全建议

1.  **密钥长度**

```typescript
//  ✅  推荐：使用  2048  位或更长
const  good  =  rsa.generateKeyPair(2048)
const  better  =  rsa.generateKeyPair(4096)

//  ❌  不推荐：1024  位已不安全
const  weak  =  rsa.generateKeyPair(1024)
```

2.  **私钥保护**

```typescript
//  ✅  正确：私钥必须保密
const  keyPair  =  rsa.generateKeyPair()
//  只分享公钥
sharePublicKey(keyPair.publicKey)

//  ❌  错误：不要泄露私钥
//  sendToServer(keyPair.privateKey)   //  危险！
```

3.  **填充方式**

```typescript
//  ✅  推荐：使用  OAEP
const  secure  =  rsa.encrypt(data,  publicKey,  {  padding:  'OAEP'  })

//  ⚠️  可接受：PKCS1（兼容性）
const  compatible  =  rsa.encrypt(data,  publicKey,  {  padding:  'PKCS1'  })
```

4.  **数据大小**

```typescript
//  ✅  正确：加密小数据或对称密钥
const  sessionKey  =  'random-session-key'
rsa.encrypt(sessionKey,  publicKey)

//  ❌  错误：不要直接加密大文件
//  const  file  =  fs.readFileSync('large-file.pdf')
//  rsa.encrypt(file.toString(),  publicKey)   //  会失败
```

##  相关资源

-  [数字签名示例](./signature.md)
-  [混合加密](./aes.md#场景-1混合加密)
-  [API  文档](/api/rsa)
-  [安全指南](/guide/security)
