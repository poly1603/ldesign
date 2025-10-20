import * as THREE from 'three';

export class GyroscopeControls {
  private camera: THREE.PerspectiveCamera;
  private enabled: boolean = false;
  private screenOrientation: number = 0;
  private alphaOffset: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  /**
   * Enable gyroscope controls
   * Returns true if successfully enabled
   */
  public async enable(): Promise<boolean> {
    // Check if DeviceOrientationEvent is supported
    if (!window.DeviceOrientationEvent) {
      console.warn('DeviceOrientationEvent is not supported');
      return false;
    }

    // For iOS 13+, we need to request permission
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          console.warn('Device orientation permission denied');
          return false;
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        return false;
      }
    }

    // Add event listener
    window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this), false);
    window.addEventListener('orientationchange', this.onScreenOrientationChange.bind(this), false);
    
    this.screenOrientation = window.orientation || 0;
    this.enabled = true;
    return true;
  }

  /**
   * Disable gyroscope controls
   */
  public disable(): void {
    window.removeEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
    window.removeEventListener('orientationchange', this.onScreenOrientationChange.bind(this));
    this.enabled = false;
  }

  private onDeviceOrientation(event: DeviceOrientationEvent): void {
    if (!this.enabled) return;

    const alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) + this.alphaOffset : 0;
    const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0;
    const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0;
    const orient = this.screenOrientation ? THREE.MathUtils.degToRad(this.screenOrientation) : 0;

    this.setObjectQuaternion(alpha, beta, gamma, orient);
  }

  private onScreenOrientationChange(): void {
    this.screenOrientation = window.orientation || 0;
  }

  private setObjectQuaternion(alpha: number, beta: number, gamma: number, orient: number): void {
    const zee = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    euler.set(beta, alpha, -gamma, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
    this.camera.quaternion.multiply(q1);
    this.camera.quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public dispose(): void {
    this.disable();
  }
}


