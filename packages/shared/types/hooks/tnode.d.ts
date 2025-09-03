import { VNode } from 'vue';
import { OptionsType, JSXRenderContext } from '../utils/renderNode.js';

/**
/**
 * 通过 JSX 的方式渲染 TNode，props 和 插槽同时处理，也能处理默认值为 true 则渲染默认节点的情况
 * 优先级：用户注入的 props 值 > slot > 默认 props 值
 * 如果 props 值为 true ，则使用插槽渲染。如果也没有插槽的情况下，则使用 defaultNode 渲染
 * @example const renderTNodeJSX = useTNodeJSX()
 * @return () => {}
 * @param name 插槽和属性名称
 * @param options 值可能为默认渲染节点，也可能是默认渲染节点和参数的集合
 * @example renderTNodeJSX('closeBtn')  优先级 props function 大于 插槽
 * @example renderTNodeJSX('closeBtn', <close-icon />)。 当属性值为 true 时则渲染 <close-icon />
 * @example renderTNodeJSX('closeBtn', { defaultNode: <close-icon />, params })。 params 为渲染节点时所需的参数
 */
declare function useTNodeJSX(): (name: string, options?: OptionsType) => any;
/**
 * 在setup中，通过JSX的方式 TNode，props 和 插槽同时处理。与 renderTNodeJSX 区别在于属性值为 undefined 时会渲染默认节点
 * @example const renderTNodeJSXDefault = useTNodeDefault()
 * @return () => {}
 * @param name 插槽和属性名称
 * @example renderTNodeJSXDefault('closeBtn')
 * @example renderTNodeJSXDefault('closeBtn', <close-icon />) closeBtn 为空时，则兜底渲染 <close-icon />
 * @example renderTNodeJSXDefault('closeBtn', { defaultNode: <close-icon />, params }) 。params 为渲染节点时所需的参数
 */
declare function useTNodeDefault(): (name: string, options?: VNode | JSXRenderContext) => any;
/**
 * 在setup中，用于处理相同名称的 TNode 渲染
 * @example const renderContent = useContent()
 * @return () => {}
 * @param name1 第一个名称，优先级高于 name2
 * @param name2 第二个名称
 * @param defaultNode 默认渲染内容：当 name1 和 name2 都为空时会启动默认内容渲染
 * @example renderContent('default', 'content')
 * @example renderContent('default', 'content', '我是默认内容')
 * @example renderContent('default', 'content', { defaultNode: '我是默认内容', params })
 */
declare function useContent(): (name1: string, name2: string, options?: VNode | JSXRenderContext) => any;
/**
 * 过滤掉注释节点。
 *
 * @param nodes - VNode 数组
 * @returns 去除注释节点后的 VNode 数组。
 */
declare function filterCommentNode(nodes: VNode[]): VNode[];

export { filterCommentNode, useContent, useTNodeDefault, useTNodeJSX };
