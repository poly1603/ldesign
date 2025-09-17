// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/chimney',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="chimney">
<path id="fill1" d="M9 21V14L15 11L21 14V21H9Z" [attr.fill]="color"/>
<path id="fill2" d="M3 21L4 7L3 3H12L11 7L11.5 12.75L9 14V21H3Z" [attr.fill]="color"/>
<path id="stroke2" d="M4 7L3 21H9V14L11.5 12.75L11 7M4 7L3 3H12L11 7M4 7H11M15 18V21" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke1" d="M9 21V14L15 11L21 14V21H9Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ChimneyComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
