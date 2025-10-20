/**
 * Gamified Sizing Module
 * Makes size adjustments fun and interactive with game-like elements
 */

import type { SizeValue } from '../types';
import { AnimationManager } from '../core/AnimationManager';

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  condition: (stats: UserStats) => boolean;
  reward?: SizeReward;
}

/**
 * Size reward for achievements
 */
export interface SizeReward {
  type: 'unlock' | 'boost' | 'effect' | 'theme';
  value: any;
  description: string;
}

/**
 * User statistics
 */
export interface UserStats {
  totalAdjustments: number;
  perfectMatches: number;
  experimentsCount: number;
  timeSpent: number; // in seconds
  favoriteSize?: number;
  sizeRange: { min: number; max: number };
  streakDays: number;
  level: number;
  experience: number;
  achievements: string[];
}

/**
 * Challenge definition
 */
export interface SizeChallenge {
  id: string;
  name: string;
  description: string;
  targetSize: number | SizeValue;
  tolerance: number;
  timeLimit?: number; // in seconds
  attempts: number;
  completed: boolean;
  reward: {
    experience: number;
    achievement?: string;
  };
}

/**
 * Interactive mode
 */
export type InteractiveMode = 'drag' | 'scroll' | 'gesture' | 'voice' | 'gamepad';

/**
 * Gamification configuration
 */
export interface GamificationConfig {
  enableAchievements: boolean;
  enableChallenges: boolean;
  enableLeaderboard: boolean;
  enableSounds: boolean;
  enableVisualEffects: boolean;
  saveProgress: boolean;
  storageKey?: string;
}

/**
 * Size adjustment event
 */
export interface SizeAdjustmentEvent {
  element: HTMLElement;
  previousSize: number;
  newSize: number;
  method: InteractiveMode;
  timestamp: Date;
  accuracy?: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  level: number;
  achievements: number;
  timestamp: Date;
}

/**
 * Gamified Sizing System
 */
export class GamifiedSizing {
  private config: GamificationConfig;
  private userStats: UserStats;
  private achievements: Map<string, Achievement>;
  private challenges: Map<string, SizeChallenge>;
  private animationSystem: AnimationManager;
  private listeners: Set<(event: SizeAdjustmentEvent) => void>;
  private interactiveModes: Map<InteractiveMode, boolean>;
  private sounds: Map<string, HTMLAudioElement>;
  private leaderboard: LeaderboardEntry[];

  constructor(config: Partial<GamificationConfig> = {}) {
    this.config = {
      enableAchievements: true,
      enableChallenges: true,
      enableLeaderboard: false,
      enableSounds: true,
      enableVisualEffects: true,
      saveProgress: true,
      storageKey: 'gamified-sizing',
      ...config
    };

    this.userStats = this.loadUserStats();
    this.achievements = new Map();
    this.challenges = new Map();
    this.animationSystem = new AnimationManager();
    this.listeners = new Set();
    this.interactiveModes = new Map();
    this.sounds = new Map();
    this.leaderboard = [];

    this.initializeAchievements();
    this.initializeChallenges();
    this.setupSounds();
  }

  /**
   * Initialize achievements
   */
  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      {
        id: 'first-adjustment',
        name: 'First Steps',
        description: 'Make your first size adjustment',
        icon: '🎯',
        points: 10,
        unlocked: false,
        condition: (stats) => stats.totalAdjustments >= 1,
        reward: {
          type: 'unlock',
          value: 'smooth-transitions',
          description: 'Unlocked smooth transition effects'
        }
      },
      {
        id: 'size-explorer',
        name: 'Size Explorer',
        description: 'Try 10 different size adjustments',
        icon: '🔍',
        points: 25,
        unlocked: false,
        condition: (stats) => stats.totalAdjustments >= 10,
        reward: {
          type: 'boost',
          value: 1.1,
          description: '10% faster animations'
        }
      },
      {
        id: 'perfect-match',
        name: 'Perfect Match',
        description: 'Match the target size perfectly',
        icon: '✨',
        points: 50,
        unlocked: false,
        condition: (stats) => stats.perfectMatches >= 1,
        reward: {
          type: 'effect',
          value: 'golden-glow',
          description: 'Golden glow effect for perfect matches'
        }
      },
      {
        id: 'size-master',
        name: 'Size Master',
        description: 'Reach level 10',
        icon: '👑',
        points: 100,
        unlocked: false,
        condition: (stats) => stats.level >= 10,
        reward: {
          type: 'theme',
          value: 'master-theme',
          description: 'Exclusive master theme unlocked'
        }
      },
      {
        id: 'experimenter',
        name: 'The Experimenter',
        description: 'Try 50 size experiments',
        icon: '🧪',
        points: 30,
        unlocked: false,
        condition: (stats) => stats.experimentsCount >= 50
      },
      {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Complete a challenge in under 5 seconds',
        icon: '⚡',
        points: 40,
        unlocked: false,
        condition: (_stats) => false // Checked during challenge completion
      },
      {
        id: 'persistent',
        name: 'Persistent',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        points: 60,
        unlocked: false,
        condition: (stats) => stats.streakDays >= 7
      },
      {
        id: 'range-finder',
        name: 'Range Finder',
        description: 'Explore sizes from 8px to 72px',
        icon: '📏',
        points: 35,
        unlocked: false,
        condition: (stats) => stats.sizeRange.min <= 8 && stats.sizeRange.max >= 72
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Initialize challenges
   */
  private initializeChallenges(): void {
    const challenges: SizeChallenge[] = [
      {
        id: 'precise-picker',
        name: 'Precise Picker',
        description: 'Set the font size to exactly 16px',
        targetSize: 16,
        tolerance: 0,
        attempts: 0,
        completed: false,
        reward: {
          experience: 50,
          achievement: 'perfect-match'
        }
      },
      {
        id: 'speed-sizer',
        name: 'Speed Sizer',
        description: 'Match 24px in under 5 seconds',
        targetSize: 24,
        tolerance: 1,
        timeLimit: 5,
        attempts: 0,
        completed: false,
        reward: {
          experience: 75,
          achievement: 'speed-demon'
        }
      },
      {
        id: 'golden-ratio',
        name: 'Golden Ratio',
        description: 'Find the golden ratio size (1.618x base)',
        targetSize: 25.888, // 16 * 1.618
        tolerance: 0.5,
        attempts: 0,
        completed: false,
        reward: {
          experience: 100
        }
      },
      {
        id: 'responsive-ranger',
        name: 'Responsive Ranger',
        description: 'Set 3 different breakpoint sizes correctly',
        targetSize: 32,
        tolerance: 2,
        attempts: 0,
        completed: false,
        reward: {
          experience: 150
        }
      }
    ];

    challenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  /**
   * Setup sound effects
   */
  private setupSounds(): void {
    if (!this.config.enableSounds || typeof window === 'undefined') return;

    // Create simple sound effects using Web Audio API
    // const audioContext = new (window.AudioContext || (window as any).webkitAudioContext()); // Unused

    this.createSound('adjust', 440, 0.1); // A4 note
    this.createSound('achievement', 523.25, 0.2); // C5 note
    this.createSound('perfect', 659.25, 0.3); // E5 note
    this.createSound('levelup', 783.99, 0.4); // G5 note
  }

  /**
   * Create a simple sound effect
   */
  private createSound(name: string, _frequency: number, _duration: number): void {
    // Simple placeholder for sound creation
    // In production, load actual audio files
    const audio = new Audio();
    audio.volume = 0.3;
    this.sounds.set(name, audio);
  }

  /**
   * Play sound effect
   */
  private playSound(name: string): void {
    if (!this.config.enableSounds) return;

    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore audio play errors
      });
    }
  }

  // ============================================
  // Interactive Controls
  // ============================================

  /**
   * Enable drag-to-resize
   */
  enableDragResize(element: HTMLElement, options?: {
    min?: number;
    max?: number;
    step?: number;
    axis?: 'x' | 'y' | 'both';
  }): () => void {
    const config = {
      min: 8,
      max: 72,
      step: 1,
      axis: 'x' as const,
      ...options
    };

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startSize = Number.parseInt(getComputedStyle(element).fontSize);

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startSize = Number.parseInt(getComputedStyle(element).fontSize);
      element.style.cursor = 'ew-resize';
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let delta = 0;
      if (config.axis === 'x' || config.axis === 'both') {
        delta += deltaX / 10;
      }
      if (config.axis === 'y' || config.axis === 'both') {
        delta -= deltaY / 10;
      }

      let newSize = startSize + delta;
      newSize = Math.round(newSize / config.step) * config.step;
      newSize = Math.max(config.min, Math.min(config.max, newSize));

      this.applySize(element, newSize, 'drag');
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        element.style.cursor = '';
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    this.interactiveModes.set('drag', true);

    // Return cleanup function
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }

  /**
   * Enable scroll-to-resize
   */
  enableScrollResize(element: HTMLElement, options?: {
    min?: number;
    max?: number;
    step?: number;
    sensitivity?: number;
  }): () => void {
    const config = {
      min: 8,
      max: 72,
      step: 1,
      sensitivity: 0.5,
      ...options
    };

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      const currentSize = Number.parseInt(getComputedStyle(element).fontSize);
      const delta = -e.deltaY * config.sensitivity;
      
      let newSize = currentSize + delta;
      newSize = Math.round(newSize / config.step) * config.step;
      newSize = Math.max(config.min, Math.min(config.max, newSize));

      this.applySize(element, newSize, 'scroll');
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    this.interactiveModes.set('scroll', true);

    // Return cleanup function
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }

  /**
   * Enable gesture controls
   */
  enableGestureResize(element: HTMLElement, options?: {
    min?: number;
    max?: number;
  }): () => void {
    const config = {
      min: 8,
      max: 72,
      ...options
    };

    let initialDistance = 0;
    let initialSize = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialSize = Number.parseInt(getComputedStyle(element).fontSize);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const scale = currentDistance / initialDistance;
        let newSize = initialSize * scale;
        newSize = Math.max(config.min, Math.min(config.max, newSize));

        this.applySize(element, Math.round(newSize), 'gesture');
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    this.interactiveModes.set('gesture', true);

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }

  // ============================================
  // Size Application
  // ============================================

  /**
   * Apply size with gamification
   */
  private applySize(
    element: HTMLElement,
    size: number,
    method: InteractiveMode
  ): void {
    const previousSize = Number.parseInt(getComputedStyle(element).fontSize);
    
    // Apply the size
    element.style.fontSize = `${size}px`;

    // Create visual effect
    if (this.config.enableVisualEffects) {
      this.createVisualFeedback(element, size, previousSize);
    }

    // Play sound
    this.playSound('adjust');

    // Track the adjustment
    const event: SizeAdjustmentEvent = {
      element,
      previousSize,
      newSize: size,
      method,
      timestamp: new Date()
    };

    this.trackAdjustment(event);
    this.notifyListeners(event);

    // Check for achievements
    this.checkAchievements();

    // Check active challenges
    this.checkChallenges(size);
  }

  /**
   * Create visual feedback
   */
  private createVisualFeedback(
    element: HTMLElement,
    newSize: number,
    previousSize: number
  ): void {
    const diff = newSize - previousSize;
    const isGrowing = diff > 0;

    // Add temporary class for animation
    element.classList.add('size-changing');
    
    // Create particle effect
    if (Math.abs(diff) > 5) {
      this.createParticleEffect(element, isGrowing);
    }

    // Remove class after animation
    setTimeout(() => {
      element.classList.remove('size-changing');
    }, 300);
  }

  /**
   * Create particle effect
   */
  private createParticleEffect(element: HTMLElement, isGrowing: boolean): void {
    const rect = element.getBoundingClientRect();
    const particleCount = 5;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'size-particle';
      particle.style.position = 'absolute';
      particle.style.left = `${rect.left + rect.width / 2}px`;
      particle.style.top = `${rect.top + rect.height / 2}px`;
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.backgroundColor = isGrowing ? '#4CAF50' : '#FF5722';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '9999';

      document.body.appendChild(particle);

      // Animate particle
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const duration = 500 + Math.random() * 200;

      particle.animate([
        { 
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1 
        },
        { 
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
          opacity: 0 
        }
      ], {
        duration,
        easing: 'ease-out'
      });

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, duration);
    }
  }

  // ============================================
  // Progress Tracking
  // ============================================

  /**
   * Track size adjustment
   */
  private trackAdjustment(event: SizeAdjustmentEvent): void {
    this.userStats.totalAdjustments++;
    
    // Update size range
    const size = event.newSize;
    this.userStats.sizeRange.min = Math.min(this.userStats.sizeRange.min, size);
    this.userStats.sizeRange.max = Math.max(this.userStats.sizeRange.max, size);

    // Add experience
    this.addExperience(5);

    // Save progress
    if (this.config.saveProgress) {
      this.saveUserStats();
    }
  }

  /**
   * Add experience points
   */
  private addExperience(points: number): void {
    this.userStats.experience += points;

    // Check for level up
    const requiredExp = this.getRequiredExperience(this.userStats.level);
    if (this.userStats.experience >= requiredExp) {
      this.levelUp();
    }
  }

  /**
   * Get required experience for level
   */
  private getRequiredExperience(level: number): number {
    return level * 100 + level**2 * 10;
  }

  /**
   * Level up
   */
  private levelUp(): void {
    this.userStats.level++;
    this.userStats.experience = 0;

    // Play sound and create effect
    this.playSound('levelup');
    
    if (this.config.enableVisualEffects) {
      this.showNotification(`Level Up! You're now level ${this.userStats.level}! 🎉`);
    }
  }

  /**
   * Check achievements
   */
  private checkAchievements(): void {
    this.achievements.forEach((achievement, id) => {
      if (!achievement.unlocked && achievement.condition(this.userStats)) {
        this.unlockAchievement(id);
      }
    });
  }

  /**
   * Unlock achievement
   */
  private unlockAchievement(id: string): void {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    this.userStats.achievements.push(id);

    // Play sound and show notification
    this.playSound('achievement');
    this.showNotification(
      `Achievement Unlocked: ${achievement.name} ${achievement.icon || '🏆'}`
    );

    // Apply reward if any
    if (achievement.reward) {
      this.applyReward(achievement.reward);
    }

    // Add achievement points as experience
    this.addExperience(achievement.points);
  }

  /**
   * Apply achievement reward
   */
  private applyReward(reward: SizeReward): void {
    // Implementation depends on reward type
    switch (reward.type) {
      case 'unlock':
        // Unlock new feature
        console.log(`Unlocked: ${reward.value}`);
        break;
      case 'boost':
        // Apply boost
        console.log(`Boost applied: ${reward.value}x`);
        break;
      case 'effect':
        // Enable visual effect
        console.log(`Effect enabled: ${reward.value}`);
        break;
      case 'theme':
        // Unlock theme
        console.log(`Theme unlocked: ${reward.value}`);
        break;
    }
  }

  /**
   * Check challenges
   */
  private checkChallenges(currentSize: number): void {
    this.challenges.forEach((challenge, id) => {
      if (challenge.completed) return;

      challenge.attempts++;

      const target = typeof challenge.targetSize === 'number' 
        ? challenge.targetSize 
        : 0;

      if (Math.abs(currentSize - target) <= challenge.tolerance) {
        this.completeChallenge(id);
      }
    });
  }

  /**
   * Complete challenge
   */
  private completeChallenge(id: string): void {
    const challenge = this.challenges.get(id);
    if (!challenge || challenge.completed) return;

    challenge.completed = true;

    // Award experience
    this.addExperience(challenge.reward.experience);

    // Unlock achievement if specified
    if (challenge.reward.achievement) {
      this.unlockAchievement(challenge.reward.achievement);
    }

    // Show notification
    this.showNotification(`Challenge Complete: ${challenge.name}! 🎯`);
    this.playSound('perfect');
  }

  // ============================================
  // UI Helpers
  // ============================================

  /**
   * Show notification
   */
  private showNotification(message: string): void {
    if (typeof window === 'undefined') return;

    const notification = document.createElement('div');
    notification.className = 'gamified-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Create progress bar
   */
  createProgressBar(container: HTMLElement): HTMLElement {
    const progressBar = document.createElement('div');
    progressBar.className = 'gamified-progress';
    progressBar.innerHTML = `
      <div class="level-info">
        <span class="level">Level ${this.userStats.level}</span>
        <span class="exp">${this.userStats.experience} XP</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${this.getProgressPercentage()}%"></div>
      </div>
      <div class="stats">
        <span>🎯 ${this.userStats.totalAdjustments} adjustments</span>
        <span>🏆 ${this.userStats.achievements.length} achievements</span>
      </div>
    `;

    container.appendChild(progressBar);
    return progressBar;
  }

  /**
   * Get progress percentage
   */
  private getProgressPercentage(): number {
    const required = this.getRequiredExperience(this.userStats.level);
    return (this.userStats.experience / required) * 100;
  }

  // ============================================
  // Data Persistence
  // ============================================

  /**
   * Load user stats
   */
  private loadUserStats(): UserStats {
    if (!this.config.saveProgress || typeof window === 'undefined') {
      return this.getDefaultStats();
    }

    const saved = localStorage.getItem(this.config.storageKey!);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.getDefaultStats();
      }
    }

    return this.getDefaultStats();
  }

  /**
   * Get default stats
   */
  private getDefaultStats(): UserStats {
    return {
      totalAdjustments: 0,
      perfectMatches: 0,
      experimentsCount: 0,
      timeSpent: 0,
      sizeRange: { min: 16, max: 16 },
      streakDays: 0,
      level: 1,
      experience: 0,
      achievements: []
    };
  }

  /**
   * Save user stats
   */
  private saveUserStats(): void {
    if (!this.config.saveProgress || typeof window === 'undefined') return;

    localStorage.setItem(
      this.config.storageKey!,
      JSON.stringify(this.userStats)
    );
  }

  /**
   * Reset progress
   */
  resetProgress(): void {
    this.userStats = this.getDefaultStats();
    
    // Reset achievements
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlockedAt = undefined;
    });

    // Reset challenges
    this.challenges.forEach(challenge => {
      challenge.completed = false;
      challenge.attempts = 0;
    });

    if (this.config.saveProgress) {
      this.saveUserStats();
    }
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Get user stats
   */
  getStats(): UserStats {
    return { ...this.userStats };
  }

  /**
   * Get achievements
   */
  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get challenges
   */
  getChallenges(): SizeChallenge[] {
    return Array.from(this.challenges.values());
  }

  /**
   * Subscribe to size adjustment events
   */
  onAdjustment(listener: (event: SizeAdjustmentEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: SizeAdjustmentEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Export progress data
   */
  exportProgress(): string {
    return JSON.stringify({
      stats: this.userStats,
      achievements: Array.from(this.achievements.entries()),
      challenges: Array.from(this.challenges.entries()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import progress data
   */
  importProgress(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.stats) {
        this.userStats = parsed.stats;
      }

      if (parsed.achievements) {
        parsed.achievements.forEach(([id, achievement]: [string, Achievement]) => {
          const existing = this.achievements.get(id);
          if (existing) {
            existing.unlocked = achievement.unlocked;
            existing.unlockedAt = achievement.unlockedAt;
          }
        });
      }

      if (parsed.challenges) {
        parsed.challenges.forEach(([id, challenge]: [string, SizeChallenge]) => {
          const existing = this.challenges.get(id);
          if (existing) {
            existing.completed = challenge.completed;
            existing.attempts = challenge.attempts;
          }
        });
      }

      if (this.config.saveProgress) {
        this.saveUserStats();
      }

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create gamified sizing instance
 */
export function createGamifiedSizing(
  config?: Partial<GamificationConfig>
): GamifiedSizing {
  return new GamifiedSizing(config);
}