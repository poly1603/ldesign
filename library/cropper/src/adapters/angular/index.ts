/**
 * Angular Adapter
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { Cropper } from '../../core/Cropper'
import type { CropperOptions, GetCroppedCanvasOptions, CropData } from '../../types'
import '../../styles/cropper.css'

@Component({
  selector: 'ldesign-cropper',
  template: `
    <div
      #container
      class="angular-cropper-container"
      [style.width]="'100%'"
      [style.height]="'100%'"
    ></div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `
  ]
})
class AngularCropperComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>

  @Input() src!: string
  @Input() alt?: string
  @Input() aspectRatio?: number
  @Input() viewMode: 0 | 1 | 2 | 3 = 0
  @Input() dragMode: 'crop' | 'move' | 'none' = 'crop'
  @Input() autoCrop = true
  @Input() autoCropArea = 0.8
  @Input() movable = true
  @Input() rotatable = true
  @Input() scalable = true
  @Input() zoomable = true
  @Input() zoomOnTouch = true
  @Input() zoomOnWheel = true
  @Input() cropBoxMovable = true
  @Input() cropBoxResizable = true
  @Input() background = true
  @Input() guides = true
  @Input() center = true
  @Input() highlight = true
  @Input() responsive = true

  @Output() ready = new EventEmitter<Cropper>()
  @Output() cropStart = new EventEmitter<CustomEvent>()
  @Output() cropMove = new EventEmitter<CustomEvent>()
  @Output() cropEnd = new EventEmitter<CustomEvent>()
  @Output() crop = new EventEmitter<CustomEvent>()
  @Output() zoom = new EventEmitter<CustomEvent>()

  private cropper?: Cropper

  ngOnInit(): void {
    this.initCropper()
  }

  ngOnDestroy(): void {
    if (this.cropper) {
      this.cropper.destroy()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !changes['src'].firstChange && this.cropper) {
      this.cropper.replace(changes['src'].currentValue)
    }
  }

  private initCropper(): void {
    if (!this.containerRef.nativeElement || !this.src) return

    const options: CropperOptions = {
      src: this.src,
      alt: this.alt,
      aspectRatio: this.aspectRatio,
      viewMode: this.viewMode,
      dragMode: this.dragMode,
      autoCrop: this.autoCrop,
      autoCropArea: this.autoCropArea,
      movable: this.movable,
      rotatable: this.rotatable,
      scalable: this.scalable,
      zoomable: this.zoomable,
      zoomOnTouch: this.zoomOnTouch,
      zoomOnWheel: this.zoomOnWheel,
      cropBoxMovable: this.cropBoxMovable,
      cropBoxResizable: this.cropBoxResizable,
      background: this.background,
      guides: this.guides,
      center: this.center,
      highlight: this.highlight,
      responsive: this.responsive,
      ready: (e) => {
        if (this.cropper) {
          this.ready.emit(this.cropper)
        }
      },
      cropstart: (e) => this.cropStart.emit(e),
      cropmove: (e) => this.cropMove.emit(e),
      cropend: (e) => this.cropEnd.emit(e),
      crop: (e) => this.crop.emit(e),
      zoom: (e) => this.zoom.emit(e)
    }

    this.cropper = new Cropper(this.containerRef.nativeElement, options)
  }

  // Public methods
  getCropper(): Cropper | undefined {
    return this.cropper
  }

  getCroppedCanvas(options?: GetCroppedCanvasOptions): HTMLCanvasElement | null {
    return this.cropper?.getCroppedCanvas(options) || null
  }

  getData(rounded?: boolean): CropData {
    return (
      this.cropper?.getData(rounded) || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        translateX: 0,
        translateY: 0
      }
    )
  }

  setData(data: any): void {
    this.cropper?.setData(data)
  }

  rotate(degrees: number): void {
    this.cropper?.rotate(degrees)
  }

  scale(scaleX: number, scaleY?: number): void {
    this.cropper?.scale(scaleX, scaleY)
  }

  scaleX(scaleX: number): void {
    this.cropper?.scaleX(scaleX)
  }

  scaleY(scaleY: number): void {
    this.cropper?.scaleY(scaleY)
  }

  reset(): void {
    this.cropper?.reset()
  }

  clear(): void {
    this.cropper?.clear()
  }

  enable(): void {
    this.cropper?.enable()
  }

  disable(): void {
    this.cropper?.disable()
  }

  destroyCropper(): void {
    this.cropper?.destroy()
  }
}

// Export the component
export { AngularCropperComponent }

// Angular Module
import { NgModule } from '@angular/core'

@NgModule({
  declarations: [AngularCropperComponent],
  imports: [],
  exports: [AngularCropperComponent]
})
class AngularCropperModule {}

// Export the module
export { AngularCropperModule }
