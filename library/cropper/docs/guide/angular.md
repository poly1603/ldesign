# Angular Integration

@ldesign/cropper provides full support for Angular with native decorators and modules.

## Installation

```bash
npm install @ldesign/cropper @angular/core
```

## Module Setup

Import the AngularCropperModule in your Angular module:

```typescript
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AngularCropperModule } from '@ldesign/cropper/angular'
import '@ldesign/cropper/style.css'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AngularCropperModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Basic Usage

```typescript
import { Component } from '@angular/core'

@Component({
  selector: 'app-root',
  template: `
    <ldesign-cropper
      [src]="imageSrc"
      [aspectRatio]="16 / 9"
      (ready)="onReady($event)"
      (crop)="onCrop($event)"
    ></ldesign-cropper>
  `
})
export class AppComponent {
  imageSrc = 'path/to/image.jpg'

  onReady(cropper: any) {
    console.log('Cropper is ready', cropper)
  }

  onCrop(event: CustomEvent) {
    console.log('Crop data:', event.detail)
  }
}
```

## Component Reference

Access the cropper instance using ViewChild:

```typescript
import { Component, ViewChild } from '@angular/core'
import { AngularCropperComponent } from '@ldesign/cropper/angular'

@Component({
  selector: 'app-root',
  template: `
    <ldesign-cropper
      #cropper
      [src]="imageSrc"
      [aspectRatio]="aspectRatio"
    ></ldesign-cropper>

    <button (click)="rotateLeft()">Rotate Left</button>
    <button (click)="rotateRight()">Rotate Right</button>
    <button (click)="getCropped()">Get Cropped</button>
  `
})
export class AppComponent {
  @ViewChild('cropper') cropperComponent!: AngularCropperComponent

  imageSrc = 'path/to/image.jpg'
  aspectRatio = 16 / 9

  rotateLeft() {
    this.cropperComponent.rotate(-90)
  }

  rotateRight() {
    this.cropperComponent.rotate(90)
  }

  getCropped() {
    const canvas = this.cropperComponent.getCroppedCanvas()
    console.log('Cropped canvas:', canvas)
  }
}
```

## Complete Example

```typescript
import { Component, ViewChild } from '@angular/core'
import { AngularCropperComponent } from '@ldesign/cropper/angular'
import type { CropData } from '@ldesign/cropper'

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <h1>Angular Cropper Demo</h1>

      <!-- File Upload -->
      <div class="upload-section">
        <input
          type="file"
          accept="image/*"
          (change)="onFileChange($event)"
        />
      </div>

      <!-- Cropper -->
      <div class="cropper-wrapper">
        <ldesign-cropper
          *ngIf="imageSrc"
          #cropper
          [src]="imageSrc"
          [aspectRatio]="aspectRatio"
          [viewMode]="viewMode"
          (crop)="onCrop($event)"
        ></ldesign-cropper>
        <div *ngIf="!imageSrc" class="placeholder">
          Please select an image
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div class="control-group">
          <label>Aspect Ratio:</label>
          <select [(ngModel)]="aspectRatio">
            <option [ngValue]="NaN">Free</option>
            <option [ngValue]="1">1:1</option>
            <option [ngValue]="16 / 9">16:9</option>
            <option [ngValue]="4 / 3">4:3</option>
          </select>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons">
        <button (click)="rotate(-90)" [disabled]="!imageSrc">
          Rotate Left
        </button>
        <button (click)="rotate(90)" [disabled]="!imageSrc">
          Rotate Right
        </button>
        <button (click)="flipHorizontal()" [disabled]="!imageSrc">
          Flip H
        </button>
        <button (click)="flipVertical()" [disabled]="!imageSrc">
          Flip V
        </button>
        <button (click)="reset()" [disabled]="!imageSrc">
          Reset
        </button>
        <button (click)="getCropped()" [disabled]="!imageSrc">
          Get Cropped
        </button>
        <button (click)="download()" [disabled]="!croppedImage">
          Download
        </button>
      </div>

      <!-- Preview -->
      <div *ngIf="croppedImage" class="preview">
        <h3>Preview</h3>
        <img [src]="croppedImage" alt="Cropped">
      </div>

      <!-- Crop Data -->
      <div *ngIf="cropData" class="crop-data">
        <h3>Crop Data</h3>
        <pre>{{ cropData | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .app {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .cropper-wrapper {
      width: 100%;
      height: 500px;
      margin: 20px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }

    .controls,
    .buttons {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }

    button {
      padding: 10px 20px;
      background: #42b983;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .preview img {
      max-width: 400px;
      border: 1px solid #ddd;
    }
  `]
})
export class AppComponent {
  @ViewChild('cropper') cropperComponent!: AngularCropperComponent

  imageSrc = ''
  aspectRatio: number = NaN
  viewMode: 0 | 1 | 2 | 3 = 0
  cropData: CropData | null = null
  croppedImage = ''
  NaN = NaN

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imageSrc = e.target?.result as string
        this.croppedImage = ''
      }
      reader.readAsDataURL(file)
    }
  }

  onCrop(event: CustomEvent<CropData>) {
    this.cropData = event.detail
  }

  rotate(degrees: number) {
    this.cropperComponent.rotate(degrees)
  }

  flipHorizontal() {
    const cropper = this.cropperComponent.getCropper()
    if (cropper) {
      const imageData = cropper.getImageData()
      this.cropperComponent.scaleX(-imageData.scaleX)
    }
  }

  flipVertical() {
    const cropper = this.cropperComponent.getCropper()
    if (cropper) {
      const imageData = cropper.getImageData()
      this.cropperComponent.scaleY(-imageData.scaleY)
    }
  }

  reset() {
    this.cropperComponent.reset()
  }

  getCropped() {
    const canvas = this.cropperComponent.getCroppedCanvas({
      width: 400,
      height: 400,
      imageSmoothingQuality: 'high'
    })

    if (canvas) {
      this.croppedImage = canvas.toDataURL('image/png')
    }
  }

  download() {
    if (this.croppedImage) {
      const link = document.createElement('a')
      link.download = 'cropped-image.png'
      link.href = this.croppedImage
      link.click()
    }
  }
}
```

## Next Steps

- Learn about [Configuration](/guide/configuration)
- Explore [API Reference](/api/cropper)
- See [Examples](/examples/)
