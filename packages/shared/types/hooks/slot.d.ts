import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { Slots, VNode, RendererNode, RendererElement, VNodeArrayChildren, VNodeChild } from '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

/**
 * 渲染default slot，获取子组件VNode。处理多种子组件创建场景
 * 使用场景：<t-steps> <t-steps-item /> </t-steps>, <t-steps> <t-steps-item v-for="(item, index)" :key="index" /> </t-steps>
 * @returns {function(childComponentName: string, slots: Slots): VNode[]}
 * @param childComponentName
 * @param slots
 * @example const getChildByName = useChildComponentSlots()
 * @example getChildComponentByName('TStepItem')
 */
declare function useChildComponentSlots(): (childComponentName: string, slots?: Slots) => VNode[];
/**
 * 渲染default slot，获取slot child
 * @param childComponentName
 * @param slots
 * @example const getChildSlots = useChildSlots()
 * @example getChildSlots()
 */
declare function useChildSlots(): () => (VNode<RendererNode, RendererElement, {
    [key: string]: any;
}> | VNodeArrayChildren | VNodeChild)[];
/**
 * 递归展开所有 Fragment，并跳过 Comment 节点，返回一维 VNodeChild 数组
 * @example const useFlatChildrenSlots = useFlatChildrenSlotsHook()
 * @example useFlatChildrenSlots(children)
 */
declare function useFlatChildrenSlots(): (children: VNodeChild[]) => VNodeChild[];

export { useChildComponentSlots, useChildSlots, useFlatChildrenSlots };
