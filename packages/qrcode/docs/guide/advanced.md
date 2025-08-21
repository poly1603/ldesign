# 进阶与常见问题

## 性能与缓存

- 默认启用内存缓存（可通过 `enableCache` 关闭）
- 通过 `getMetrics()` 获取性能指标；`clearPerformanceMetrics()` 清空

## Canvas / SVG 何时选择

- 需要下载 PNG：Canvas 更直接
- 需要矢量缩放与样式：SVG 更灵活

## 下载二维码

```ts
import { downloadQRCode } from '@ldesign/qrcode'
await downloadQRCode('to download', 'qrcode-file')
```

或通过组件右上角的下载按钮。

## 调试建议

- 确认文本是否为空（组件与 Hook 已做空值校验）
- Logo 为跨域图片时，确保服务端允许跨域访问（`crossOrigin=anonymous`）
