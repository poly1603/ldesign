// Component export
export { default as QRCode } from './components/QRCode.vue';

// Composables exports
export {
  useQRCode,
  useBatchQRCode,
  useQRCodeFromURL,
  useQRCodeInput,
  useQRCodeTheme,
  useQRCodeShare,
  useQRCodeValidation,
} from './composables/useQRCode';

// Composable type exports
export type {
  UseQRCodeOptions,
  UseQRCodeReturn,
  BatchQRCodeItem,
  QRCodeTheme,
} from './composables/useQRCode';

// Directives exports
export {
  vQRCode,
  vQRCodeReactive,
  vQRCodeLazy,
  default as vQRCodeDirective,
} from './directives/v-qrcode';

// Plugin export
import { App, Plugin } from 'vue';
import QRCodeComponent from './components/QRCode.vue';
import { vQRCode } from './directives/v-qrcode';

export interface QRCodePluginOptions {
  defaultConfig?: any;
  componentName?: string;
  directiveName?: string;
}

export const QRCodePlugin: Plugin = {
  install(app: App, options: QRCodePluginOptions = {}) {
    const {
      defaultConfig = {},
      componentName = 'QRCode',
      directiveName = 'qrcode',
    } = options;
    
    // Register component
    app.component(componentName, QRCodeComponent);
    
    // Register directive
    app.directive(directiveName, vQRCode);
    
    // Provide default config
    app.provide('qrcode-default-config', defaultConfig);
    
    // Global properties
    app.config.globalProperties.$qrcode = {
      defaultConfig,
    };
  },
};

// Re-export types
export type {
  QRCodeConfig,
  QRCodeInstance,
  ErrorCorrectionLevel,
  RenderType,
  LogoConfig,
  QRCodeStyle,
  DotStyle,
} from '../../types/index';

// Export createQRCode for advanced usage
export { createQRCode } from '../../index';