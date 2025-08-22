import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { VNode, RendererNode, RendererElement } from '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

interface JSXRenderContext {
    defaultNode?: VNode | string;
    params?: Record<string, any>;
    slotFirst?: boolean;
    silent?: boolean;
}
type OptionsType = VNode | JSXRenderContext | string;
declare function getDefaultNode(options?: OptionsType): string | VNode<RendererNode, RendererElement, {
    [key: string]: any;
}> | undefined;
declare function getChildren(content: VNode[]): VNode<RendererNode, RendererElement, {
    [key: string]: any;
}>[] | undefined;
declare function getParams(options?: OptionsType): Record<string, any> | undefined;
declare function getSlotFirst(options?: OptionsType): boolean;

export { getChildren, getDefaultNode, getParams, getSlotFirst };
export type { JSXRenderContext, OptionsType };
