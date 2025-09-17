// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/ruler',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="ruler">
<path id="fill1" d="M7.5 3L3 21H12L16.5 3H7.5Z" [attr.fill]="color"/>
<path id="stroke1" d="M21 21H12M12 21H3L7.5 3H16.5L12 21ZM7 7.5H10.875M5.5 12H9.75M4.5 16.5H8.625" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class RulerComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
