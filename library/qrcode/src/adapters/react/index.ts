// Main component exports
export { 
  QRCode,
  default 
} from './components/QRCode';

// Export component types
export type {
  QRCodeProps,
  QRCodeRef,
} from './components/QRCode';

// Hook exports
export {
  // Core hooks
  useQRCode,
  useBatchQRCode,
  useQRCodeFromURL,
  useQRCodeInput,
  useQRCodeTheme,
  useQRCodeShare,
} from './hooks/useQRCode';

// Hook type exports
export type {
  UseQRCodeOptions,
  UseQRCodeReturn,
  BatchQRCodeItem,
  QRCodeTheme,
} from './hooks/useQRCode';

// Re-export types from library
export type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
  LogoConfig,
  QRCodeStyle,
  DotStyle,
} from '../../types/index';

// Export the createQRCode function for advanced users
export { createQRCode } from '../../index';