import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { Directive, Plugin } from '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

declare function withInstall<T>(comp: T, alias?: string, directive?: {
    name: string;
    comp: Directive<T & Plugin>;
}): T & Plugin;

export { withInstall };
