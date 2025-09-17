// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/certificate',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="certificate">
<path id="fill1" d="M22 4L22 20L2 20L2 4L22 4Z" [attr.fill]="color"/>
<path id="fill2" d="M18 4L14 4L14 9.5L16 8L18 9.5L18 4Z" [attr.fill]="color"/>
<path id="stroke2" d="M6 12H10M6 16H18M14 4L18 4V9.5L16 8L14 9.5L14 4Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke1" d="M22 4V20L2 20L2 4L22 4Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class CertificateComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
