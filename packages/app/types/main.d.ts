import * as _ldesign_engine from '@ldesign/engine';
import { AppConfig } from './types/index.js';

/**
 * 创建简化的 LDesign 应用
 */
declare function createLDesignApp(config?: Partial<AppConfig>): Promise<{
    engine: _ldesign_engine.Engine;
    config: AppConfig;
}>;

export { createLDesignApp as default };
