// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/bill',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="bill">
<path id="fill1" d="M5 3H19V20L16.5 18L14.25 20L12 18L9.75 20L7.5 18L5 20V3Z" [attr.fill]="color"/>
<path id="stroke1" d="M5 3H19M5 3V20L7.5 18L9.75 20L12 18L14.25 20L16.5 18L19 20V3M5 3H3M19 3H21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M9 8H15M10 12H14" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class BillComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
