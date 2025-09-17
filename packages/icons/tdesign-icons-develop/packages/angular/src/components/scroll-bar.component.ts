// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/scroll-bar',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="scroll-bar ">
<path id="fill1" d="M17 3L3 3L3 21L17 21L17 3Z" [attr.fill]="color"/>
<path id="stroke1" d="M17 3L3 3L3 21L17 21L17 3Z" [attr.stroke]="color" stroke-[attr.width]="size"/>
<path id="stroke2" d="M21 21L21 3" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ScrollBarComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
