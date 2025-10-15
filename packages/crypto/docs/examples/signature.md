#    数字签名示例

数字签名用于验证数据的真实性和完整性，确保数据来自可信来源且未被篡改。

##    基础用法

###    RSA    数字签名

```typescript
import    {    rsa    }    from    '@ldesign/crypto'

//    生成密钥对
const    keyPair    =    rsa.generateKeyPair(2048)

//    要签名的数据
const    message    =    '这是一条需要签名的消息'

//    使用私钥签名
const    signature    =    rsa.sign(message,    keyPair.privateKey)
console.log('数字签名:',    signature.substring(0,    50)    +    '...')

//    使用公钥验证签名
const    isValid    =    rsa.verify(message,    signature,    keyPair.publicKey)
console.log('签名验证:',    isValid)    //    true

//    篡改数据后验证失败
const    tamperedMessage    =    '这是被篡改的消息'
const    isInvalid    =    rsa.verify(tamperedMessage,    signature,    keyPair.publicKey)
console.log('篡改后验证:',    isInvalid)    //    false
```

###    不同哈希算法

```typescript
import    {    rsa    }    from    '@ldesign/crypto'

const    keyPair    =    rsa.generateKeyPair(2048)
const    message    =    'Message    to    sign'

//    使用    SHA256（推荐）
const    signatureSHA256    =    rsa.sign(message,    keyPair.privateKey,    'sha256')
const    validSHA256    =    rsa.verify(message,    signatureSHA256,    keyPair.publicKey,    'sha256')
console.log('SHA256    签名验证:',    validSHA256)

//    使用    SHA512（更高安全性）
const    signatureSHA512    =    rsa.sign(message,    keyPair.privateKey,    'sha512')
const    validSHA512    =    rsa.verify(message,    signatureSHA512,    keyPair.publicKey,    'sha512')
console.log('SHA512    签名验证:',    validSHA512)

//    使用    SHA384
const    signatureSHA384    =    rsa.sign(message,    keyPair.privateKey,    'sha384')
const    validSHA384    =    rsa.verify(message,    signatureSHA384,    keyPair.publicKey,    'sha384')
console.log('SHA384    签名验证:',    validSHA384)
```

##    实际应用场景

###    场景    1：软件包签名验证

```typescript
import    {    rsa,    hash    }    from    '@ldesign/crypto'
import    *    as    fs    from    'fs'

/**
  *    软件包签名和验证系统
  */
class    PackageSigner    {
        private    privateKey:    string
        public    publicKey:    string

        constructor()    {
                const    keyPair    =    rsa.generateKeyPair(2048)
                this.privateKey    =    keyPair.privateKey
                this.publicKey    =    keyPair.publicKey
        }

        //    签名软件包
        signPackage(packagePath:    string):    {
                signature:    string
                checksum:    string
                metadata:    {
                        filename:    string
                        size:    number
                        timestamp:    number
                }
        }    {
                //    读取文件内容
                const    content    =    fs.readFileSync(packagePath)
                const    contentString    =    content.toString('base64')

                //    计算校验和
                const    checksum    =    hash.sha256(contentString)

                //    创建签名数据
                const    metadata    =    {
                        filename:    packagePath.split('/').pop()    ||    '',
                        size:    content.length,
                        timestamp:    Date.now(),
                }

                const    signatureData    =    JSON.stringify({
                        checksum,
                        metadata,
                })

                //    生成签名
                const    signature    =    rsa.sign(signatureData,    this.privateKey,    'sha256')

                return    {
                        signature,
                        checksum,
                        metadata,
                }
        }

        //    验证软件包
        static    verifyPackage(
                packagePath:    string,
                signature:    string,
                checksum:    string,
                metadata:    any,
                publicKey:    string,
        ):    {    valid:    boolean;    error?:    string    }    {
                try    {
                        //    读取文件
                        const    content    =    fs.readFileSync(packagePath)
                        const    contentString    =    content.toString('base64')

                        //    验证文件大小
                        if    (content.length    !==    metadata.size)    {
                                return    {    valid:    false,    error:    '文件大小不匹配'    }
                        }

                        //    验证校验和
                        const    actualChecksum    =    hash.sha256(contentString)
                        if    (actualChecksum    !==    checksum)    {
                                return    {    valid:    false,    error:    '校验和不匹配'    }
                        }

                        //    验证签名
                        const    signatureData    =    JSON.stringify({
                                checksum,
                                metadata,
                        })

                        const    isValid    =    rsa.verify(signatureData,    signature,    publicKey,    'sha256')

                        if    (!isValid)    {
                                return    {    valid:    false,    error:    '签名验证失败'    }
                        }

                        return    {    valid:    true    }
                }    catch    (error)    {
                        return    {
                                valid:    false,
                                error:    error    instanceof    Error    ?    error.message    :    '未知错误',
                        }
                }
        }

        //    保存签名信息
        saveSignature(
                packagePath:    string,
                signature:    string,
                checksum:    string,
                metadata:    any,
        ):    void    {
                const    signatureFile    =    `${packagePath}.sig`
                const    signatureData    =    {
                        signature,
                        checksum,
                        metadata,
                        publicKey:    this.publicKey,
                }

                fs.writeFileSync(signatureFile,    JSON.stringify(signatureData,    null,    2))
                console.log(`签名文件已保存:    ${signatureFile}`)
        }
}

//    使用示例
const    signer    =    new    PackageSigner()

//    创建测试文件
const    testFile    =    'test-package.zip'
fs.writeFileSync(testFile,    'Package    content    for    testing')

//    签名软件包
const    {    signature,    checksum,    metadata    }    =    signer.signPackage(testFile)
console.log('软件包已签名')

//    保存签名
signer.saveSignature(testFile,    signature,    checksum,    metadata)

//    验证软件包
const    result    =    PackageSigner.verifyPackage(
        testFile,
        signature,
        checksum,
        metadata,
        signer.publicKey,
)
console.log('验证结果:',    result)

//    清理
fs.unlinkSync(testFile)
fs.unlinkSync(`${testFile}.sig`)
```

###    场景    2：API    Token    签名

```typescript
import    {    rsa,    hash    }    from    '@ldesign/crypto'

/**
  *    API    Token    签名系统
  */
class    TokenSigner    {
        private    privateKey:    string
        public    publicKey:    string

        constructor()    {
                const    keyPair    =    rsa.generateKeyPair(2048)
                this.privateKey    =    keyPair.privateKey
                this.publicKey    =    keyPair.publicKey
        }

        //    创建签名的    Token
        createToken(payload:    {
                userId:    string
                permissions:    string[]
                expiresAt:    number
        }):    string    {
                //    添加时间戳和随机值
                const    tokenData    =    {
                        ...payload,
                        issuedAt:    Date.now(),
                        nonce:    Math.random().toString(36).substring(2),
                }

                //    序列化数据
                const    dataString    =    JSON.stringify(tokenData)

                //    签名
                const    signature    =    rsa.sign(dataString,    this.privateKey,    'sha256')

                //    组合    token（Base64    编码）
                const    token    =    Buffer.from(
                        JSON.stringify({
                                data:    tokenData,
                                signature,
                        }),
                ).toString('base64')

                return    token
        }

        //    验证    Token
        static    verifyToken(
                token:    string,
                publicKey:    string,
        ):    {
                valid:    boolean
                payload?:    any
                error?:    string
        }    {
                try    {
                        //    解码    token
                        const    decoded    =    Buffer.from(token,    'base64').toString('utf-8')
                        const    {    data,    signature    }    =    JSON.parse(decoded)

                        //    检查过期时间
                        if    (Date.now()    >    data.expiresAt)    {
                                return    {    valid:    false,    error:    'Token    已过期'    }
                        }

                        //    验证签名
                        const    dataString    =    JSON.stringify(data)
                        const    isValid    =    rsa.verify(dataString,    signature,    publicKey,    'sha256')

                        if    (!isValid)    {
                                return    {    valid:    false,    error:    '签名验证失败'    }
                        }

                        return    {
                                valid:    true,
                                payload:    data,
                        }
                }    catch    (error)    {
                        return    {
                                valid:    false,
                                error:    'Token    格式错误',
                        }
                }
        }
}

//    使用示例
const    tokenSigner    =    new    TokenSigner()

//    创建    Token
const    token    =    tokenSigner.createToken({
        userId:    'user123',
        permissions:    ['read',    'write'],
        expiresAt:    Date.now()    +    24    *    60    *    60    *    1000,    //    24    小时
})
console.log('Token:',    token.substring(0,    50)    +    '...')

//    验证    Token
const    verification    =    TokenSigner.verifyToken(token,    tokenSigner.publicKey)
console.log('验证结果:',    verification)
```

###    场景    3：代码签名

```typescript
import    {    rsa,    hash    }    from    '@ldesign/crypto'

/**
  *    代码签名系统
  */
class    CodeSigner    {
        private    privateKey:    string
        public    publicKey:    string
        private    identity:    {
                name:    string
                organization:    string
                email:    string
        }

        constructor(identity:    {    name:    string;    organization:    string;    email:    string    })    {
                const    keyPair    =    rsa.generateKeyPair(4096)    //    使用    4096    位密钥提高安全性
                this.privateKey    =    keyPair.privateKey
                this.publicKey    =    keyPair.publicKey
                this.identity    =    identity
        }

        //    签名代码
        signCode(code:    string,    metadata?:    {
                filename:    string
                version:    string
                description:    string
        }):    {
                signature:    string
                certificate:    {
                        signer:    typeof    this.identity
                        signedAt:    number
                        algorithm:    string
                        metadata?:    any
                }
        }    {
                //    计算代码哈希
                const    codeHash    =    hash.sha512(code)

                //    创建签名数据
                const    signatureData    =    {
                        codeHash,
                        signer:    this.identity,
                        signedAt:    Date.now(),
                        metadata,
                }

                const    dataString    =    JSON.stringify(signatureData)

                //    签名
                const    signature    =    rsa.sign(dataString,    this.privateKey,    'sha512')

                return    {
                        signature,
                        certificate:    {
                                signer:    this.identity,
                                signedAt:    signatureData.signedAt,
                                algorithm:    'RSA-4096-SHA512',
                                metadata,
                        },
                }
        }

        //    验证代码签名
        static    verifyCodeSignature(
                code:    string,
                signature:    string,
                certificate:    any,
                publicKey:    string,
        ):    {    valid:    boolean;    message:    string    }    {
                try    {
                        //    计算代码哈希
                        const    codeHash    =    hash.sha512(code)

                        //    重建签名数据
                        const    signatureData    =    {
                                codeHash,
                                signer:    certificate.signer,
                                signedAt:    certificate.signedAt,
                                metadata:    certificate.metadata,
                        }

                        const    dataString    =    JSON.stringify(signatureData)

                        //    验证签名
                        const    isValid    =    rsa.verify(dataString,    signature,    publicKey,    'sha512')

                        if    (!isValid)    {
                                return    {
                                        valid:    false,
                                        message:    '数字签名验证失败',
                                }
                        }

                        return    {
                                valid:    true,
                                message:    `代码由    ${certificate.signer.name}    (${certificate.signer.organization})    签名`,
                        }
                }    catch    (error)    {
                        return    {
                                valid:    false,
                                message:    '签名验证失败：'    +    (error    instanceof    Error    ?    error.message    :    '未知错误'),
                        }
                }
        }
}

//    使用示例
const    codeSigner    =    new    CodeSigner({
        name:    '张三',
        organization:    'Example    Corp',
        email:    'zhangsan@example.com',
})

//    签名代码
const    code    =    `
function    hello()    {
        console.log('Hello,    World!');
}
`

const    {    signature,    certificate    }    =    codeSigner.signCode(code,    {
        filename:    'hello.js',
        version:    '1.0.0',
        description:    '简单的问候函数',
})

console.log('代码已签名')
console.log('签名者:',    certificate.signer.name)
console.log('签名时间:',    new    Date(certificate.signedAt).toLocaleString())

//    验证签名
const    verification    =    CodeSigner.verifyCodeSignature(
        code,
        signature,
        certificate,
        codeSigner.publicKey,
)
console.log('验证结果:',    verification)
```

###    场景    4：消息签名和验证

```typescript
import    {    rsa    }    from    '@ldesign/crypto'

/**
  *    消息签名系统
  */
class    MessageSigner    {
        private    keyPair:    {    publicKey:    string;    privateKey:    string    }
        private    userName:    string

        constructor(userName:    string)    {
                this.keyPair    =    rsa.generateKeyPair(2048)
                this.userName    =    userName
        }

        //    签名消息
        signMessage(message:    string):    {
                message:    string
                signature:    string
                sender:    string
                timestamp:    number
        }    {
                const    timestamp    =    Date.now()

                const    signatureData    =    JSON.stringify({
                        message,
                        sender:    this.userName,
                        timestamp,
                })

                const    signature    =    rsa.sign(signatureData,    this.keyPair.privateKey)

                return    {
                        message,
                        signature,
                        sender:    this.userName,
                        timestamp,
                }
        }

        //    获取公钥
        getPublicKey():    string    {
                return    this.keyPair.publicKey
        }

        //    验证消息
        static    verifyMessage(
                signedMessage:    {
                        message:    string
                        signature:    string
                        sender:    string
                        timestamp:    number
                },
                senderPublicKey:    string,
        ):    boolean    {
                const    signatureData    =    JSON.stringify({
                        message:    signedMessage.message,
                        sender:    signedMessage.sender,
                        timestamp:    signedMessage.timestamp,
                })

                return    rsa.verify(signatureData,    signedMessage.signature,    senderPublicKey)
        }
}

//    使用示例
const    alice    =    new    MessageSigner('Alice')
const    bob    =    new    MessageSigner('Bob')

//    Alice    发送签名消息
const    aliceMessage    =    alice.signMessage('你好，Bob！')
console.log('Alice    的消息:',    aliceMessage.message)

//    Bob    验证    Alice    的消息
const    isAliceMessageValid    =    MessageSigner.verifyMessage(
        aliceMessage,
        alice.getPublicKey(),
)
console.log('Alice    的消息验证:',    isAliceMessageValid)

//    Bob    发送回复
const    bobMessage    =    bob.signMessage('你好，Alice！')
console.log('Bob    的消息:',    bobMessage.message)

//    Alice    验证    Bob    的消息
const    isBobMessageValid    =    MessageSigner.verifyMessage(
        bobMessage,
        bob.getPublicKey(),
)
console.log('Bob    的消息验证:',    isBobMessageValid)

//    尝试伪造消息
const    forgedMessage    =    {
        ...aliceMessage,
        message:    '这是伪造的消息',
}
const    isForgedValid    =    MessageSigner.verifyMessage(forgedMessage,    alice.getPublicKey())
console.log('伪造消息验证:',    isForgedValid)    //    false
```

###    场景    5：文档数字签名

```typescript
import    {    rsa,    hash    }    from    '@ldesign/crypto'

/**
  *    文档数字签名系统
  */
class    DocumentSignature    {
        private    signers:    Map<
                string,
                {    publicKey:    string;    privateKey:    string;    name:    string    }
        >    =    new    Map()

        //    添加签名者
        addSigner(id:    string,    name:    string):    void    {
                const    keyPair    =    rsa.generateKeyPair(2048)
                this.signers.set(id,    {
                        ...keyPair,
                        name,
                })
        }

        //    签署文档
        signDocument(
                documentId:    string,
                content:    string,
                signerId:    string,
        ):    {
                documentId:    string
                contentHash:    string
                signature:    string
                signer:    {    id:    string;    name:    string    }
                timestamp:    number
        }    |    null    {
                const    signer    =    this.signers.get(signerId)

                if    (!signer)    {
                        console.error('签名者不存在')
                        return    null
                }

                //    计算文档哈希
                const    contentHash    =    hash.sha256(content)

                //    签名数据
                const    signatureData    =    {
                        documentId,
                        contentHash,
                        signerId,
                        timestamp:    Date.now(),
                }

                const    signature    =    rsa.sign(
                        JSON.stringify(signatureData),
                        signer.privateKey,
                )

                return    {
                        documentId,
                        contentHash,
                        signature,
                        signer:    {    id:    signerId,    name:    signer.name    },
                        timestamp:    signatureData.timestamp,
                }
        }

        //    验证文档签名
        verifyDocumentSignature(
                content:    string,
                signatureInfo:    {
                        documentId:    string
                        contentHash:    string
                        signature:    string
                        signer:    {    id:    string;    name:    string    }
                        timestamp:    number
                },
        ):    boolean    {
                const    signer    =    this.signers.get(signatureInfo.signer.id)

                if    (!signer)    {
                        return    false
                }

                //    验证内容哈希
                const    actualHash    =    hash.sha256(content)
                if    (actualHash    !==    signatureInfo.contentHash)    {
                        return    false
                }

                //    验证签名
                const    signatureData    =    {
                        documentId:    signatureInfo.documentId,
                        contentHash:    signatureInfo.contentHash,
                        signerId:    signatureInfo.signer.id,
                        timestamp:    signatureInfo.timestamp,
                }

                return    rsa.verify(
                        JSON.stringify(signatureData),
                        signatureInfo.signature,
                        signer.publicKey,
                )
        }

        //    多方签名
        collectSignatures(
                documentId:    string,
                content:    string,
                signerIds:    string[],
        ):    Array<{
                documentId:    string
                contentHash:    string
                signature:    string
                signer:    {    id:    string;    name:    string    }
                timestamp:    number
        }>    {
                const    signatures    =    []

                for    (const    signerId    of    signerIds)    {
                        const    signature    =    this.signDocument(documentId,    content,    signerId)
                        if    (signature)    {
                                signatures.push(signature)
                        }
                }

                return    signatures
        }

        //    验证所有签名
        verifyAllSignatures(
                content:    string,
                signatures:    Array<{
                        documentId:    string
                        contentHash:    string
                        signature:    string
                        signer:    {    id:    string;    name:    string    }
                        timestamp:    number
                }>,
        ):    {    valid:    boolean;    details:    Array<{    signer:    string;    valid:    boolean    }>    }    {
                const    details    =    signatures.map((sig)    =>    ({
                        signer:    sig.signer.name,
                        valid:    this.verifyDocumentSignature(content,    sig),
                }))

                return    {
                        valid:    details.every((d)    =>    d.valid),
                        details,
                }
        }
}

//    使用示例
const    docSignature    =    new    DocumentSignature()

//    添加签名者
docSignature.addSigner('user1',    '张三')
docSignature.addSigner('user2',    '李四')
docSignature.addSigner('user3',    '王五')

//    文档内容
const    document    =    `
合同文档

甲方：张三
乙方：李四
见证人：王五

协议内容：...
`

//    收集多方签名
const    signatures    =    docSignature.collectSignatures('DOC-001',    document,    [
        'user1',
        'user2',
        'user3',
])

console.log('文档已被',    signatures.length,    '方签名')

//    验证所有签名
const    verification    =    docSignature.verifyAllSignatures(document,    signatures)
console.log('所有签名验证:',    verification.valid)
console.log('签名详情:',    verification.details)
```

##    错误处理

```typescript
import    {    rsa    }    from    '@ldesign/crypto'

function    safeSign(
        data:    string,
        privateKey:    string,
):    {    success:    boolean;    signature?:    string;    error?:    string    }    {
        try    {
                const    signature    =    rsa.sign(data,    privateKey)
                return    {    success:    true,    signature    }
        }    catch    (error)    {
                return    {
                        success:    false,
                        error:    error    instanceof    Error    ?    error.message    :    '签名失败',
                }
        }
}

function    safeVerify(
        data:    string,
        signature:    string,
        publicKey:    string,
):    {    success:    boolean;    valid?:    boolean;    error?:    string    }    {
        try    {
                const    valid    =    rsa.verify(data,    signature,    publicKey)
                return    {    success:    true,    valid    }
        }    catch    (error)    {
                return    {
                        success:    false,
                        error:    error    instanceof    Error    ?    error.message    :    '验证失败',
                }
        }
}
```

##    性能考虑

```typescript
import    {    rsa    }    from    '@ldesign/crypto'

//    签名性能测试
function    testSignaturePerformance()    {
        const    keyPair    =    rsa.generateKeyPair(2048)
        const    message    =    'Test    message    for    performance'
        const    iterations    =    100

        //    签名性能
        console.time(`${iterations}    次签名`)
        for    (let    i    =    0;    i    <    iterations;    i++)    {
                rsa.sign(message,    keyPair.privateKey)
        }
        console.timeEnd(`${iterations}    次签名`)

        //    验证性能
        const    signature    =    rsa.sign(message,    keyPair.privateKey)
        console.time(`${iterations}    次验证`)
        for    (let    i    =    0;    i    <    iterations;    i++)    {
                rsa.verify(message,    signature,    keyPair.publicKey)
        }
        console.timeEnd(`${iterations}    次验证`)
}

testSignaturePerformance()
```

##    安全建议

```typescript
//    ✅    推荐：使用    2048    位或更长的密钥
const    secureKeyPair    =    rsa.generateKeyPair(2048)

//    ✅    推荐：使用    SHA256    或更强的哈希算法
const    secureSignature    =    rsa.sign(data,    privateKey,    'sha256')

//    ✅    推荐：妥善保管私钥
//    不要在代码中硬编码私钥
//    不要通过不安全的渠道传输私钥
//    定期轮换密钥

//    ✅    推荐：验证签名时检查时间戳
const    timestamp    =    Date.now()
const    maxAge    =    5    *    60    *    1000    //    5    分钟
//    if    (timestamp    -    signedTimestamp    >    maxAge)    {    reject    }

//    ❌    不推荐：使用过短的密钥
const    weakKeyPair    =    rsa.generateKeyPair(1024)    //    不安全

//    ❌    不推荐：使用    SHA1
const    weakSignature    =    rsa.sign(data,    privateKey,    'sha1')    //    不推荐
```

##    最佳实践

1.    **密钥管理**

```typescript
//    生成强密钥
const    keyPair    =    rsa.generateKeyPair(2048)

//    安全存储私钥（加密后存储）
import    {    aes    }    from    '@ldesign/crypto'
const    encryptedPrivateKey    =    aes.encrypt(keyPair.privateKey,    'master-password')

//    公钥可以公开分发
sharePublicKey(keyPair.publicKey)
```

2.    **签名数据结构**

```typescript
//    包含完整信息
const    signatureData    =    {
        data:    originalData,
        timestamp:    Date.now(),
        signer:    signerIdentity,
        nonce:    generateNonce(),
}
```

3.    **验证流程**

```typescript
//    完整的验证流程
function    fullVerification(data:    any,    signature:    string,    publicKey:    string):    boolean    {
        //    1.    验证时间戳
        if    (Date.now()    -    data.timestamp    >    MAX_AGE)    {
                return    false
        }

        //    2.    验证签名
        const    dataString    =    JSON.stringify(data)
        if    (!rsa.verify(dataString,    signature,    publicKey))    {
                return    false
        }

        //    3.    验证数据完整性
        //    ...    其他业务逻辑验证

        return    true
}
```

##    相关资源

-    [RSA    加密示例](./rsa.md)
-    [哈希示例](./hash.md)
-    [API    文档](/api/rsa)
-    [安全指南](/guide/security)
