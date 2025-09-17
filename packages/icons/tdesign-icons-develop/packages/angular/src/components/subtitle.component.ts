// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/subtitle',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="subtitle">
<path id="fill1" d="M22 4L22 20L2 20L2 4L14 4L18 4L22 4Z" [attr.fill]="color"/>
<path id="stroke1" d="M22 4V20L2 20L2 4L22 4Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M10 15H7C6.44772 15 6 14.5523 6 14V10C6 9.44772 6.44772 9 7 9H10M18 15H15C14.4477 15 14 14.5523 14 14V10C14 9.44772 14.4477 9 15 9H18" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class SubtitleComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
