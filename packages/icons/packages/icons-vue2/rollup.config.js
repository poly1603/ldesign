import { createRollupConfig } from '../../rollup.config.shared.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default createRollupConfig({
  packagePath: __dirname,
  external: ['vue'],
  umdName: 'LDesignIconsVue2',
  umdGlobals: {
    vue: 'Vue'
  }
});
