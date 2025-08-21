# Hook 用法

```ts
import { useQRCode } from '@ldesign/qrcode'

const { generate, result, download, options } = useQRCode({ size: 200, format: 'canvas' })

options.value.data = 'Hello from Hook'
await generate()
await download(undefined, 'hook-qrcode')
```

响应式生成：

```ts
import { ref } from 'vue'
import { useReactiveQRCode } from '@ldesign/qrcode'

const text = ref('Reactive Text')
const qr = useReactiveQRCode(text, { size: 220 })
```
