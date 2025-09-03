import { Directive, Plugin } from 'vue';

declare function withInstall<T>(comp: T, alias?: string, directive?: {
    name: string;
    comp: Directive<T & Plugin>;
}): T & Plugin;

export { withInstall };
