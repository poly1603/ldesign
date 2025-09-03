import * as vue from 'vue';
import { VNode } from 'vue';

interface JSXRenderContext {
    defaultNode?: VNode | string;
    params?: Record<string, any>;
    slotFirst?: boolean;
    silent?: boolean;
}
type OptionsType = VNode | JSXRenderContext | string;
declare function getDefaultNode(options?: OptionsType): string | VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}> | undefined;
declare function getChildren(content: VNode[]): VNode<vue.RendererNode, vue.RendererElement, {
    [key: string]: any;
}>[] | undefined;
declare function getParams(options?: OptionsType): Record<string, any> | undefined;
declare function getSlotFirst(options?: OptionsType): boolean;

export { getChildren, getDefaultNode, getParams, getSlotFirst };
export type { JSXRenderContext, OptionsType };
