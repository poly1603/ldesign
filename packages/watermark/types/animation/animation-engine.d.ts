import { AnimationConfig, AnimationType } from '../types/animation.js';

/**
 * 动画引擎
 */

/**
 * 动画引擎
 * 负责水印的动画效果和过渡管理
 */
declare class AnimationEngine implements IAnimationEngine {
    private animations;
    private timelines;
    private states;
    private callbacks;
    private rafId?;
    private isRunning;
    private startTime;
    private pausedTime;
    private config;
    constructor(config?: AnimationConfig);
    /**
     * 初始化动画引擎
     */
    init(): Promise<void>;
    /**
     * 创建动画
     */
    createAnimation(instanceId: string, type: AnimationType, config?: Partial<AnimationConfig>): Promise<string>;
    /**
     * 播放动画
     */
    playAnimation(animationId: string): Promise<void>;
    /**
     * 暂停动画
     */
    pauseAnimation(animationId: string): Promise<void>;
    /**
     * 停止动画
     */
    stopAnimation(animationId: string): Promise<void>;
    /**
     * 完成动画
     */
    finishAnimation(animationId: string): Promise<void>;
    /**
     * 创建时间线
     */
    createTimeline(instanceId: string, animations: Array<{
        type: AnimationType;
        config: Partial<AnimationConfig>;
        delay?: number;
    }>): Promise<string>;
    /**
     * 播放时间线
     */
    playTimeline(timelineId: string): Promise<void>;
    /**
     * 应用过渡效果
     */
    applyTransition(instanceId: string, fromState: Record<string, any>, toState: Record<string, any>, config: TransitionConfig): Promise<string>;
    /**
     * 应用特效
     */
    applyEffect(instanceId: string, effectType: string, config: EffectConfig): Promise<string>;
    /**
     * 获取动画状态
     */
    getAnimationState(animationId: string): AnimationState | null;
    /**
     * 获取时间线状态
     */
    getTimelineState(timelineId: string): AnimationTimeline | null;
    /**
     * 添加事件监听器
     */
    addEventListener(animationId: string, callback: (event: AnimationEvent) => void): void;
    /**
     * 移除事件监听器
     */
    removeEventListener(animationId: string, callback: (event: AnimationEvent) => void): boolean;
    /**
     * 销毁动画
     */
    destroyAnimation(animationId: string): Promise<void>;
    /**
     * 销毁时间线
     */
    destroyTimeline(timelineId: string): Promise<void>;
    /**
     * 销毁引擎
     */
    dispose(): Promise<void>;
    private checkSupport;
    private getInstanceElements;
    private createKeyframes;
    private createFadeKeyframes;
    private createSlideKeyframes;
    private createScaleKeyframes;
    private createRotateKeyframes;
    private createBounceKeyframes;
    private createPulseKeyframes;
    private createShakeKeyframes;
    private createFlipKeyframes;
    private createZoomKeyframes;
    private createTransitionKeyframes;
    private convertEasing;
    private setupAnimationListeners;
    private emitEvent;
}

export { AnimationEngine };
