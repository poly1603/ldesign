// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/monument',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="monument">
<path id="fill1" d="M15 6V16H9V6L8 3H16L15 6Z" [attr.fill]="color"/>
<path id="fill2" d="M16 19H18V22H6V19H8V16H16V19Z" [attr.fill]="color"/>
<path id="stroke1" d="M15 6H9M15 6V16H9V6M15 6L16 3V2M9 6L8 3V2M8.5 3H15.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M16 19V16H8V19M16 19H8M16 19H18V22H6V19H8" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class MonumentComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
