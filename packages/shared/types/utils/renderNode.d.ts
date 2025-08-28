import type { VNode } from 'vue';
export interface JSXRenderContext {
    defaultNode?: VNode | string;
    params?: Record<string, any>;
    slotFirst?: boolean;
    silent?: boolean;
}
export type OptionsType = VNode | JSXRenderContext | string;
export declare function getDefaultNode(options?: OptionsType): string | VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | undefined;
export declare function getChildren(content: VNode[]): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | undefined;
export declare function getParams(options?: OptionsType): Record<string, any> | undefined;
export declare function getSlotFirst(options?: OptionsType): boolean;
//# sourceMappingURL=renderNode.d.ts.map