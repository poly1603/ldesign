import { WatermarkInstance } from './instance.js';
import { SecurityViolation } from './security.js';
import { AnimationInstance } from './animation.js';
import { RenderPerformance } from './render.js';

/**
 * 事件相关类型定义
 */

declare enum WatermarkEventType {
    INSTANCE_CREATED = "instance:created",
    INSTANCE_UPDATED = "instance:updated",
    INSTANCE_DESTROYED = "instance:destroyed",
    INSTANCE_STATE_CHANGED = "instance:stateChanged",
    RENDER_START = "render:start",
    RENDER_COMPLETE = "render:complete",
    RENDER_ERROR = "render:error",
    SECURITY_VIOLATION = "security:violation",
    SECURITY_RECOVERED = "security:recovered",
    ANIMATION_START = "animation:start",
    ANIMATION_PAUSE = "animation:pause",
    ANIMATION_RESUME = "animation:resume",
    ANIMATION_STOP = "animation:stop",
    ANIMATION_COMPLETE = "animation:complete",
    BREAKPOINT_CHANGED = "responsive:breakpointChanged",
    CONTAINER_RESIZED = "responsive:containerResized",
    ORIENTATION_CHANGED = "responsive:orientationChanged",
    VISIBILITY_CHANGED = "visibility:changed",
    INTERSECTION_CHANGED = "intersection:changed",
    PERFORMANCE_WARNING = "performance:warning",
    MEMORY_LEAK_DETECTED = "performance:memoryLeak",
    ERROR = "error",
    WARNING = "warning",
    CUSTOM = "custom"
}
interface BaseEvent {
    /** 事件类型 */
    type: WatermarkEventType;
    /** 事件时间戳 */
    timestamp: number;
    /** 事件目标实例ID */
    instanceId?: string;
    /** 事件数据 */
    data?: any;
    /** 是否可取消 */
    cancelable?: boolean;
    /** 是否已取消 */
    cancelled?: boolean;
    /** 事件来源 */
    source?: string;
}
interface InstanceEvent extends BaseEvent {
    type: WatermarkEventType.INSTANCE_CREATED | WatermarkEventType.INSTANCE_UPDATED | WatermarkEventType.INSTANCE_DESTROYED | WatermarkEventType.INSTANCE_STATE_CHANGED;
    instance: WatermarkInstance;
}
interface RenderEvent extends BaseEvent {
    type: WatermarkEventType.RENDER_START | WatermarkEventType.RENDER_COMPLETE | WatermarkEventType.RENDER_ERROR;
    instanceId: string;
    performance?: RenderPerformance;
    error?: Error;
}
interface SecurityEvent extends BaseEvent {
    type: WatermarkEventType.SECURITY_VIOLATION | WatermarkEventType.SECURITY_RECOVERED;
    instanceId: string;
    violation: SecurityViolation;
}
interface AnimationEvent extends BaseEvent {
    type: WatermarkEventType.ANIMATION_START | WatermarkEventType.ANIMATION_PAUSE | WatermarkEventType.ANIMATION_RESUME | WatermarkEventType.ANIMATION_STOP | WatermarkEventType.ANIMATION_COMPLETE;
    instanceId: string;
    animation: AnimationInstance;
}
interface ResponsiveEvent extends BaseEvent {
    type: WatermarkEventType.BREAKPOINT_CHANGED | WatermarkEventType.CONTAINER_RESIZED | WatermarkEventType.ORIENTATION_CHANGED;
    instanceId: string;
    oldValue?: any;
    newValue: any;
}
interface VisibilityEvent extends BaseEvent {
    type: WatermarkEventType.VISIBILITY_CHANGED | WatermarkEventType.INTERSECTION_CHANGED;
    instanceId: string;
    visible: boolean;
    intersectionRatio?: number;
}
interface PerformanceEvent extends BaseEvent {
    type: WatermarkEventType.PERFORMANCE_WARNING | WatermarkEventType.MEMORY_LEAK_DETECTED;
    instanceId?: string;
    metric: string;
    value: number;
    threshold?: number;
    details?: Record<string, any>;
}
interface ErrorEvent extends BaseEvent {
    type: WatermarkEventType.ERROR | WatermarkEventType.WARNING;
    instanceId?: string;
    error: Error;
    context?: Record<string, any>;
}
interface CustomEvent extends BaseEvent {
    type: WatermarkEventType.CUSTOM;
    customType: string;
    payload: any;
}
type WatermarkEvent = InstanceEvent | RenderEvent | SecurityEvent | AnimationEvent | ResponsiveEvent | VisibilityEvent | PerformanceEvent | ErrorEvent | CustomEvent;
type EventListener<T extends WatermarkEvent = WatermarkEvent> = (event: T) => void | Promise<void>;
type EventFilter = (event: WatermarkEvent) => boolean;
interface EventManager {
    /** 添加事件监听器 */
    on<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void;
    /** 添加一次性事件监听器 */
    once<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void;
    /** 移除事件监听器 */
    off<T extends WatermarkEvent>(type: WatermarkEventType, listener: EventListener<T>): void;
    /** 移除所有监听器 */
    removeAllListeners(type?: WatermarkEventType): void;
    /** 触发事件 */
    emit(event: WatermarkEvent): Promise<void>;
    /** 获取监听器数量 */
    listenerCount(type: WatermarkEventType): number;
    /** 获取所有事件类型 */
    eventNames(): WatermarkEventType[];
    /** 设置最大监听器数量 */
    setMaxListeners(n: number): void;
    /** 获取最大监听器数量 */
    getMaxListeners(): number;
}
interface EventBus extends EventManager {
    /** 添加事件过滤器 */
    addFilter(filter: EventFilter): void;
    /** 移除事件过滤器 */
    removeFilter(filter: EventFilter): void;
    /** 清空所有过滤器 */
    clearFilters(): void;
    /** 启用/禁用事件 */
    setEnabled(enabled: boolean): void;
    /** 是否启用 */
    isEnabled(): boolean;
    /** 获取事件历史 */
    getHistory(limit?: number): WatermarkEvent[];
    /** 清空事件历史 */
    clearHistory(): void;
}
interface EventConfig {
    /** 是否启用事件系统 */
    enabled?: boolean;
    /** 最大监听器数量 */
    maxListeners?: number;
    /** 是否记录事件历史 */
    recordHistory?: boolean;
    /** 历史记录最大数量 */
    maxHistorySize?: number;
    /** 是否启用异步事件处理 */
    asyncHandling?: boolean;
    /** 事件处理超时时间(毫秒) */
    handlerTimeout?: number;
    /** 是否在控制台输出事件日志 */
    logEvents?: boolean;
    /** 日志级别 */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
interface EventStats {
    /** 总事件数量 */
    totalEvents: number;
    /** 各类型事件数量 */
    eventCounts: Record<WatermarkEventType, number>;
    /** 监听器数量 */
    listenerCounts: Record<WatermarkEventType, number>;
    /** 平均处理时间 */
    avgHandlingTime: number;
    /** 错误事件数量 */
    errorCount: number;
    /** 最后一个事件时间 */
    lastEventTime: number;
}
interface EventMiddleware {
    /** 中间件名称 */
    name: string;
    /** 处理事件 */
    handle(event: WatermarkEvent, next: () => Promise<void>): Promise<void>;
    /** 是否启用 */
    enabled?: boolean;
    /** 优先级 */
    priority?: number;
}
declare const DEFAULT_EVENT_CONFIG: Required<EventConfig>;

export { DEFAULT_EVENT_CONFIG, WatermarkEventType };
export type { AnimationEvent, BaseEvent, CustomEvent, ErrorEvent, EventBus, EventConfig, EventFilter, EventListener, EventManager, EventMiddleware, EventStats, InstanceEvent, PerformanceEvent, RenderEvent, ResponsiveEvent, SecurityEvent, VisibilityEvent, WatermarkEvent };
