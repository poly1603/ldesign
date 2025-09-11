/**
 * 动画引擎的测试Mock实现
 */

import type { AnimationType, AnimationConfig } from '../../src/types'
import type { IAnimationEngine } from '../../src/animation/animation-engine'
import { generateId } from '../../src/utils/id-generator'

export class MockAnimationEngine implements IAnimationEngine {
  private animations = new Map<string, { id: string; instanceId: string; type: AnimationType }>()

  async init(): Promise<void> {
    // Mock 实现，无需实际初始化
  }

  async createAnimation(
    instanceId: string,
    type: AnimationType,
    config: Partial<AnimationConfig>
  ): Promise<string> {
    const animationId = generateId('animation')
    
    // 在测试环境中，我们不需要真实的DOM元素
    this.animations.set(animationId, { id: animationId, instanceId, type })
    
    return animationId
  }

  async startAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    if (!animation) {
      throw new Error(`Animation ${animationId} not found`)
    }
    // Mock 实现，仅记录状态
  }

  async pauseAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    if (!animation) {
      throw new Error(`Animation ${animationId} not found`)
    }
    // Mock 实现，仅记录状态
  }

  async resumeAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    if (!animation) {
      throw new Error(`Animation ${animationId} not found`)
    }
    // Mock 实现，仅记录状态
  }

  async stopAnimation(animationId: string): Promise<void> {
    const animation = this.animations.get(animationId)
    if (!animation) {
      throw new Error(`Animation ${animationId} not found`)
    }
    // Mock 实现，仅记录状态
  }

  async destroyAnimation(animationId: string): Promise<void> {
    this.animations.delete(animationId)
  }

  // 工具方法
  getAnimation(animationId: string) {
    return this.animations.get(animationId)
  }

  getAllAnimations() {
    return Array.from(this.animations.values())
  }
}
