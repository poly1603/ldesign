/**
 * Camera path animation system
 * Animate camera along predefined paths with easing
 */
import * as THREE from 'three';

export interface PathPoint {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  fov?: number;
  duration: number; // milliseconds
  easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
}

export class CameraPathAnimation {
  private camera: THREE.PerspectiveCamera;
  private path: PathPoint[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private onComplete?: () => void;
  private onUpdate?: (progress: number) => void;
  private animationFrame: number | null = null;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /**
   * Set animation path
   */
  public setPath(path: PathPoint[]): void {
    this.path = path;
    this.currentIndex = 0;
  }

  /**
   * Start animation
   */
  public play(onComplete?: () => void, onUpdate?: (progress: number) => void): void {
    if (this.path.length === 0) {
      console.warn('No path defined for animation');
      return;
    }

    this.isPlaying = true;
    this.currentIndex = 0;
    this.startTime = Date.now();
    this.onComplete = onComplete;
    this.onUpdate = onUpdate;
    this.animate();
  }

  /**
   * Pause animation
   */
  public pause(): void {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Resume animation
   */
  public resume(): void {
    if (!this.isPlaying && this.path.length > 0) {
      this.isPlaying = true;
      this.animate();
    }
  }

  /**
   * Stop and reset animation
   */
  public stop(): void {
    this.isPlaying = false;
    this.currentIndex = 0;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Animation loop
   */
  private animate(): void {
    if (!this.isPlaying) return;

    const now = Date.now();
    const currentPoint = this.path[this.currentIndex];
    
    if (!currentPoint) {
      this.complete();
      return;
    }

    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / currentPoint.duration, 1);
    const easedProgress = this.applyEasing(progress, currentPoint.easing || 'easeInOut');

    // Interpolate to next point
    if (this.currentIndex + 1 < this.path.length) {
      const nextPoint = this.path[this.currentIndex + 1];
      this.interpolate(currentPoint, nextPoint, easedProgress);
    }

    // Update callback
    const totalProgress = (this.currentIndex + easedProgress) / this.path.length;
    this.onUpdate?.(totalProgress);

    // Move to next point
    if (progress >= 1) {
      this.currentIndex++;
      this.startTime = now;
      
      if (this.currentIndex >= this.path.length) {
        this.complete();
        return;
      }
    }

    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }

  /**
   * Interpolate between two points
   */
  private interpolate(from: PathPoint, to: PathPoint, t: number): void {
    // Get current values as fallback
    const currentPos = this.camera.position;
    const currentRot = this.camera.rotation;
    const currentFov = this.camera.fov;

    // Interpolate position
    if (to.position) {
      const fromPos = from.position || { x: currentPos.x, y: currentPos.y, z: currentPos.z };
      this.camera.position.set(
        this.lerp(fromPos.x, to.position.x, t),
        this.lerp(fromPos.y, to.position.y, t),
        this.lerp(fromPos.z, to.position.z, t)
      );
    }

    // Interpolate rotation
    if (to.rotation) {
      const fromRot = from.rotation || { x: currentRot.x, y: currentRot.y, z: currentRot.z };
      this.camera.rotation.set(
        this.lerp(fromRot.x, to.rotation.x, t),
        this.lerp(fromRot.y, to.rotation.y, t),
        this.lerp(fromRot.z, to.rotation.z, t)
      );
    }

    // Interpolate FOV
    if (to.fov !== undefined) {
      const fromFov = from.fov ?? currentFov;
      this.camera.fov = this.lerp(fromFov, to.fov, t);
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Linear interpolation
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Apply easing function
   */
  private applyEasing(t: number, easing: string): number {
    switch (easing) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t;
    }
  }

  /**
   * Complete animation
   */
  private complete(): void {
    this.isPlaying = false;
    this.onComplete?.();
  }

  /**
   * Check if animation is playing
   */
  public isAnimating(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current progress (0-1)
   */
  public getProgress(): number {
    if (this.path.length === 0) return 0;
    return this.currentIndex / this.path.length;
  }
}

