// This file is generated automatically. DO NOT EDIT IT.
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-tdesign-icons-develop/svg/grid-add',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" [attr.fill]="color" xmlns="http://www.w3.org/2000/svg">
<g id="grid-add">
<g id="fill1">
<path d="M10 3H3V10H10V3Z" [attr.fill]="color"/>
<path d="M14 3H21V10H14V3Z" [attr.fill]="color"/>
<path d="M10 14H3V21H10V14Z" [attr.fill]="color"/>
</g>
<g id="stroke1">
<path d="M10 3H3V10H10V3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M14 3H21V10H14V3Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
<path d="M10 14H3V21H10V14Z" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
<path id="stroke2" d="M17.5 14.5V17.5M17.5 17.5V20.5M17.5 17.5H14.5M17.5 17.5H20.5" [attr.stroke]="color" stroke-[attr.width]="size" stroke-linecap="square"/>
</g>
</svg>

  `,
  standalone: true
})
export class GridAddComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
