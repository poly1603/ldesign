// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/pen-ball',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="pen-ball">
<path id="fill1" d="M14.5 5L19 9.5L7.5 21L3.00049 21.0006L3.00049 16.5L14.5 5Z" [attr.fill]="color"/>
<path id="stroke1" d="M17 2.5L21.5 7M14.5 5L19 9.5L7.5 21L3.00049 21.0006L3.00049 16.5L14.5 5Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path id="stroke2" d="M21.5 12L15.5 18" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class PenBallComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
