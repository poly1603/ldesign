// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/video-camera',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="video-camera">
<path id="fill1" d="M1 5H16V19H1V5Z" [attr.fill]="color"/>
<path id="fill2" d="M16 10.2L23 6V18L16 13.8V10.2Z" [attr.fill]="color"/>
<g id="stroke1">
<path d="M16 10.2L23 5.99997V18L16 13.8V10.2Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M1 5H16V19H1V5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</g>
</svg>

  `,
  standalone: true
})
export class VideoCameraComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
