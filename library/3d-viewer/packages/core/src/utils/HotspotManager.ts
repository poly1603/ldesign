import * as THREE from 'three';
import type { Hotspot } from '../types';

export class HotspotManager {
  private hotspots: Map<string, Hotspot> = new Map();
  private container: HTMLElement;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private markers: Map<string, HTMLElement> = new Map();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();

  constructor(container: HTMLElement, camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.container = container;
    this.camera = camera;
    this.scene = scene;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.container.addEventListener('click', this.onContainerClick.bind(this));
  }

  private onContainerClick(event: MouseEvent): void {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Check for hotspot clicks
    this.hotspots.forEach((hotspot, id) => {
      const position = this.sphericalToCartesian(hotspot.position.theta, hotspot.position.phi);
      const distance = this.raycaster.ray.distanceToPoint(position);
      
      if (distance < 50) { // 50 units threshold
        this.dispatchHotspotEvent(hotspot);
      }
    });
  }

  private dispatchHotspotEvent(hotspot: Hotspot): void {
    const event = new CustomEvent('hotspotclick', {
      detail: { hotspot },
    });
    this.container.dispatchEvent(event);
  }

  private sphericalToCartesian(theta: number, phi: number, radius: number = 490): THREE.Vector3 {
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  }

  public addHotspot(hotspot: Hotspot): void {
    this.hotspots.set(hotspot.id, hotspot);
    this.createMarker(hotspot);
  }

  private createMarker(hotspot: Hotspot): void {
    const marker = hotspot.element || this.createDefaultMarker(hotspot.label || '');
    marker.style.position = 'absolute';
    marker.style.pointerEvents = 'auto';
    marker.style.cursor = 'pointer';
    marker.dataset.hotspotId = hotspot.id;
    
    marker.addEventListener('click', () => {
      this.dispatchHotspotEvent(hotspot);
    });

    this.container.appendChild(marker);
    this.markers.set(hotspot.id, marker);
  }

  private createDefaultMarker(label: string): HTMLElement {
    const marker = document.createElement('div');
    marker.className = 'panorama-hotspot';
    marker.style.cssText = `
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #4CAF50;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    `;
    marker.innerHTML = label || '📍';
    
    marker.addEventListener('mouseenter', () => {
      marker.style.transform = 'scale(1.2)';
    });
    marker.addEventListener('mouseleave', () => {
      marker.style.transform = 'scale(1)';
    });

    return marker;
  }

  public removeHotspot(id: string): void {
    this.hotspots.delete(id);
    const marker = this.markers.get(id);
    if (marker && this.container.contains(marker)) {
      this.container.removeChild(marker);
    }
    this.markers.delete(id);
  }

  public getHotspots(): Hotspot[] {
    return Array.from(this.hotspots.values());
  }

  public update(): void {
    // Update marker positions based on camera
    this.hotspots.forEach((hotspot, id) => {
      const marker = this.markers.get(id);
      if (!marker) return;

      const position = this.sphericalToCartesian(hotspot.position.theta, hotspot.position.phi);
      const projected = position.project(this.camera);

      const x = (projected.x + 1) / 2 * this.container.clientWidth;
      const y = (-projected.y + 1) / 2 * this.container.clientHeight;

      // Check if marker is behind camera
      const isBehind = projected.z > 1;
      marker.style.display = isBehind ? 'none' : 'block';
      marker.style.left = `${x - 15}px`; // -15 to center 30px wide marker
      marker.style.top = `${y - 15}px`;
    });
  }

  public dispose(): void {
    this.markers.forEach((marker, id) => {
      if (this.container.contains(marker)) {
        this.container.removeChild(marker);
      }
    });
    this.markers.clear();
    this.hotspots.clear();
  }
}


