import * as THREE from 'three';

export class MiniMap {
  private container: HTMLElement;
  private miniMapElement: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: THREE.PerspectiveCamera;
  private size: number = 120;
  private margin: number = 20;
  private visible: boolean = true;

  constructor(container: HTMLElement, camera: THREE.PerspectiveCamera) {
    this.container = container;
    this.camera = camera;

    // Create mini map container
    this.miniMapElement = document.createElement('div');
    this.miniMapElement.style.cssText = `
      position: absolute;
      bottom: ${this.margin}px;
      right: ${this.margin}px;
      width: ${this.size}px;
      height: ${this.size}px;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      overflow: hidden;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    `;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.miniMapElement.appendChild(this.canvas);
    this.container.appendChild(this.miniMapElement);
  }

  public update(): void {
    if (!this.visible) return;

    const ctx = this.ctx;
    const centerX = this.size / 2;
    const centerY = this.size / 2;
    const radius = this.size / 2 - 5;

    // Clear canvas
    ctx.clearRect(0, 0, this.size, this.size);

    // Draw background circle
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw compass directions
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Get camera rotation
    const euler = new THREE.Euler();
    euler.setFromQuaternion(this.camera.quaternion, 'YXZ');
    const yaw = -euler.y; // Negative because we're looking from inside

    // Draw N, S, E, W
    const compassPoints = [
      { label: 'N', angle: 0 },
      { label: 'E', angle: Math.PI / 2 },
      { label: 'S', angle: Math.PI },
      { label: 'W', angle: -Math.PI / 2 },
    ];

    compassPoints.forEach(({ label, angle }) => {
      const actualAngle = angle - yaw;
      const x = centerX + Math.sin(actualAngle) * (radius - 15);
      const y = centerY - Math.cos(actualAngle) * (radius - 15);
      
      ctx.fillStyle = label === 'N' ? 'rgba(255, 100, 100, 1)' : 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(label, x, y);
    });

    // Draw view direction indicator (triangle)
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 10);
    ctx.lineTo(centerX - 8, centerY - radius + 25);
    ctx.lineTo(centerX + 8, centerY - radius + 25);
    ctx.closePath();
    ctx.fill();

    // Draw center dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw FOV indicator (arc)
    const fov = this.camera.fov * (Math.PI / 180);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 25, -fov / 2 - Math.PI / 2, fov / 2 - Math.PI / 2);
    ctx.stroke();
  }

  public show(): void {
    this.visible = true;
    this.miniMapElement.style.display = 'block';
  }

  public hide(): void {
    this.visible = false;
    this.miniMapElement.style.display = 'none';
  }

  public toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public dispose(): void {
    if (this.container.contains(this.miniMapElement)) {
      this.container.removeChild(this.miniMapElement);
    }
  }
}


