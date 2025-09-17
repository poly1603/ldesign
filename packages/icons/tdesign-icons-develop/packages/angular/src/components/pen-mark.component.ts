// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/pen-mark',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="pen-mark">
<path id="fill1" d="M22 6.5L17.5 2L5 14.5L4.49902 16.4993L7.5 19.5L9.5 19L22 6.5Z" [attr.fill]="color"/>
<path id="stroke1" d="M22 6.5L17.5 2L5 14.5L4.49902 16.4993L7.5 19.5L9.5 19L22 6.5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M4.5 21.5L2.5 19.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class PenMarkComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
