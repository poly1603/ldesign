/**
 * Plugins module exports
 */

export * from './realtime-sync'
// Core plugins
export * from './smart-cache'
export * from './version-control'

// Advanced/Experimental plugins - Import these separately when needed:
// import { MLOptimizerPlugin } from '@ldesign/i18n/plugins/ml-optimizer'
// import { GPUAcceleratorPlugin } from '@ldesign/i18n/plugins/gpu-accelerator'
// import { WasmOptimizerPlugin } from '@ldesign/i18n/plugins/wasm-optimizer'
// import { EdgeComputingPlugin } from '@ldesign/i18n/plugins/edge-computing'
// import { QuantumAcceleratorPlugin } from '@ldesign/i18n/plugins/quantum-accelerator'
// import { NeuralNetworkPlugin } from '@ldesign/i18n/plugins/neural-network'
// import { BlockchainValidatorPlugin } from '@ldesign/i18n/plugins/blockchain-validator'
// import { CrowdsourcingPlatformPlugin } from '@ldesign/i18n/plugins/crowdsourcing-platform'
// import { ImmersiveTranslatorPlugin } from '@ldesign/i18n/plugins/immersive-translator'

// Default plugins factory
export function createDefaultPlugins() {
  return []
}
