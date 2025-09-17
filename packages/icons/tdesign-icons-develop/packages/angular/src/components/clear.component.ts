// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/clear',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="clear">
<path id="fill1" d="M14 2L10 2L10 10.5L4 10.5V15L20 15L20 10.5H14L14 2Z" [attr.fill]="color"/>
<path id="fill2" d="M4 15L4 22L20 22V15L4 15Z" [attr.fill]="color"/>
<path id="stroke1" d="M4 15V22H20V15M4 15H20M4 15V10.5H10V2H14V10.5H20V15M15 22V19" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class ClearComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
