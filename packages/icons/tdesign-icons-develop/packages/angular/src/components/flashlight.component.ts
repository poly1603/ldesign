// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/flashlight',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="flashlight">
<path id="fill1" d="M8 23H16V10L19 7V4.5H5V7L8 10V23Z" [attr.fill]="color"/>
<path id="fill2" d="M19 1H5V4.5H19V1Z" [attr.fill]="color"/>
<path id="stroke1" d="M5 4.5V7L8 10V23H16V10L19 7V4.5M5 4.5H19M5 4.5V1H19V4.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M12 11H12.0039V11.0039H12V11Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class FlashlightComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
