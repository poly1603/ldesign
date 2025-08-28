import type { Directive, Plugin } from 'vue';
export declare function withInstall<T>(comp: T, alias?: string, directive?: {
    name: string;
    comp: Directive<T & Plugin>;
}): T & Plugin;
//# sourceMappingURL=withInstall.d.ts.map