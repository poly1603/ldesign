/**
 * 指令模块统一导出
 * 提供所有指令的统一入口
 */

// 导入所有指令模块
import vClickOutside, { ClickOutsideDirective } from './click-outside'
import vCopy, { CopyDirective } from './copy'
import vDebounce, { DebounceDirective } from './debounce'
import vDrag, { DragDirective } from './drag'
import vInfiniteScroll, { InfiniteScrollDirective } from './infinite-scroll'
import vLazy, { LazyDirective } from './lazy'
import vLoading, { LoadingDirective } from './loading'
import vResize, { ResizeDirective } from './resize'
import vThrottle, { ThrottleDirective } from './throttle'
import vTooltip, { TooltipDirective } from './tooltip'

// 导出所有指令定义
export {
  vClickOutside,
  vCopy,
  vDebounce,
  vDrag,
  vInfiniteScroll,
  vLazy,
  vLoading,
  vResize,
  vThrottle,
  vTooltip,
}

// 导出所有指令类
export {
  ClickOutsideDirective,
  CopyDirective,
  DebounceDirective,
  DragDirective,
  InfiniteScrollDirective,
  LazyDirective,
  LoadingDirective,
  ResizeDirective,
  ThrottleDirective,
  TooltipDirective,
}

// 导出类型
export type {
  ClickOutsideOptions,
} from './click-outside'

export type {
  CopyOptions,
} from './copy'

export type {
  DebounceOptions,
} from './debounce'

export type {
  DragConstraint,
  DragEvent,
  DragOptions,
  DragState,
} from './drag'

export type {
  InfiniteScrollOptions,
} from './infinite-scroll'

export type {
  LazyOptions,
} from './lazy'

export type {
  LoadingOptions,
} from './loading'

export type {
  ResizeOptions,
} from './resize'

export type {
  ThrottleOptions,
} from './throttle'

export type {
  TooltipOptions,
} from './tooltip'

// 所有指令的集合
export const directives = {
  'click-outside': vClickOutside,
  'copy': vCopy,
  'debounce': vDebounce,
  'drag': vDrag,
  'infinite-scroll': vInfiniteScroll,
  'lazy': vLazy,
  'loading': vLoading,
  'resize': vResize,
  'throttle': vThrottle,
  'tooltip': vTooltip,
}

// 指令实例集合
export const directiveInstances = [
  new ClickOutsideDirective(),
  new CopyDirective(),
  new DebounceDirective(),
  new DragDirective(),
  new InfiniteScrollDirective(),
  new LazyDirective(),
  new LoadingDirective(),
  new ResizeDirective(),
  new ThrottleDirective(),
  new TooltipDirective(),
]

// Vue 指令集合（别名）
export const vueDirectives = directives

// 默认导出
export default directives
