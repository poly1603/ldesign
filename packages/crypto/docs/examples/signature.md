# 数字签名示例（RSA）

使用内置的 DigitalSignature 进行签名与验签。

```ts path=null start=null
import { DigitalSignature, rsa } from '@ldesign/crypto'

// 生成 RSA 密钥对
const keypair = rsa.generateKeyPair(2048)

const ds = new DigitalSignature()
const data = 'hello-signature'

// 生成签名（默认 sha256）
const signature = ds.sign(data, keypair.privateKey)

// 验证签名
const isValid = ds.verify(data, signature, keypair.publicKey)
console.log(isValid) // true
```

提示：生产环境请妥善保管私钥，避免泄露；公钥可对外分发用于验签。
