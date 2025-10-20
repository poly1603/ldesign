import * as THREE from 'three';

interface TouchState {
  touching: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
  pinchDistance: number;
}

export class TouchControls {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private enabled: boolean = true;
  private touchState: TouchState;
  private dampingFactor: number = 0.95;
  private rotationSpeed: number = 0.5;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.touchState = {
      touching: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      velocityX: 0,
      velocityY: 0,
      pinchDistance: 0,
    };

    this.bindEvents();
  }

  private bindEvents(): void {
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
  }

  private onTouchStart(event: TouchEvent): void {
    if (!this.enabled) return;
    event.preventDefault();

    if (event.touches.length === 1) {
      // Single touch - rotation
      this.touchState.touching = true;
      this.touchState.startX = event.touches[0].clientX;
      this.touchState.startY = event.touches[0].clientY;
      this.touchState.lastX = event.touches[0].clientX;
      this.touchState.lastY = event.touches[0].clientY;
      this.touchState.velocityX = 0;
      this.touchState.velocityY = 0;
    } else if (event.touches.length === 2) {
      // Two fingers - pinch zoom
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      this.touchState.pinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.enabled) return;
    event.preventDefault();

    if (event.touches.length === 1 && this.touchState.touching) {
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;

      const deltaX = currentX - this.touchState.lastX;
      const deltaY = currentY - this.touchState.lastY;

      this.touchState.velocityX = deltaX;
      this.touchState.velocityY = deltaY;

      this.rotate(deltaX, deltaY);

      this.touchState.lastX = currentX;
      this.touchState.lastY = currentY;
    } else if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (this.touchState.pinchDistance > 0) {
        const delta = distance - this.touchState.pinchDistance;
        this.zoom(delta * 0.1);
      }

      this.touchState.pinchDistance = distance;
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    if (!this.enabled) return;

    if (event.touches.length === 0) {
      this.touchState.touching = false;
      this.touchState.pinchDistance = 0;
    }
  }

  private rotate(deltaX: number, deltaY: number): void {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(this.camera.quaternion);

    euler.y -= deltaX * 0.002 * this.rotationSpeed;
    euler.x -= deltaY * 0.002 * this.rotationSpeed;

    // Clamp vertical rotation
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

    this.camera.quaternion.setFromEuler(euler);
  }

  private zoom(delta: number): void {
    this.camera.fov = Math.max(30, Math.min(100, this.camera.fov - delta));
    this.camera.updateProjectionMatrix();
  }

  public update(): void {
    // Apply inertia
    if (!this.touchState.touching && (Math.abs(this.touchState.velocityX) > 0.01 || Math.abs(this.touchState.velocityY) > 0.01)) {
      this.rotate(this.touchState.velocityX, this.touchState.velocityY);
      this.touchState.velocityX *= this.dampingFactor;
      this.touchState.velocityY *= this.dampingFactor;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public dispose(): void {
    this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this));
    this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this));
    this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }
}


